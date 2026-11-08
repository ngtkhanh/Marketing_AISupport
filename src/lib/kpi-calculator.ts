import type { KPIScenario, KPIScenarioName, ObjectiveType } from '@/types/proposal';

/**
 * Tự động phân loại mục tiêu chiến dịch dựa trên mô tả mục tiêu
 */
export function detectObjectiveType(objective: string): ObjectiveType {
  const text = (objective || '').toLowerCase();
  if (/đơn|doanh số|doanh thu|bán hàng|chốt đơn|mua hàng|sales/i.test(text)) {
    return 'sales';
  }
  if (/lead|tiềm năng|tư vấn|đăng ký|liên hệ|inbox|form|để lại thông tin/i.test(text)) {
    return 'lead_generation';
  }
  if (/khách cũ|quay lại|mua lại|trung thành|chăm sóc|tái kích hoạt|retention/i.test(text)) {
    return 'retention';
  }
  return 'awareness';
}

export interface FunnelCalculatorParams {
  totalBudget: number;
  objectiveType: ObjectiveType;
  hasPaidAds: boolean;
}

/**
 * Tính toán 3 kịch bản KPI phễu minh bạch theo loại mục tiêu
 * Tuyệt đối không dùng benchmark cố định không nguồn; mọi con số đều gắn liền với công thức và giả định
 */
export function calculateFunnelKPIs(params: FunnelCalculatorParams): KPIScenario[] {
  const { totalBudget, objectiveType, hasPaidAds } = params;

  if (objectiveType === 'awareness') {
    return calculateAwarenessKPIs(totalBudget, hasPaidAds);
  }

  if (objectiveType === 'lead_generation') {
    return calculateLeadGenKPIs(totalBudget, hasPaidAds);
  }

  if (objectiveType === 'retention') {
    return calculateRetentionKPIs(totalBudget, hasPaidAds);
  }

  // Mặc định sales
  return calculateSalesKPIs(totalBudget, hasPaidAds);
}

/**
 * 1. Phễu cho mục tiêu Nhận diện thương hiệu (Awareness)
 */
function calculateAwarenessKPIs(totalBudget: number, hasPaidAds: boolean): KPIScenario[] {
  const mediaRatio = hasPaidAds ? 0.7 : 0.5;
  const mediaBudget = Math.round(totalBudget * mediaRatio);

  const configs: Record<KPIScenarioName, { label: string; cpm: number; freq: number; engRate: number; assumptions: string[] }> = {
    conservative: {
      label: 'Kịch bản Thận trọng (Biên an toàn ngân sách)',
      cpm: hasPaidAds ? 45000 : 35000,
      freq: 1.4,
      engRate: 0.018,
      assumptions: [
        'Giả định chi phí giá thầu hiển thị CPM ở mức cao trong mùa cao điểm',
        'Tần suất lặp lại trung bình 1.4 lượt/người để bảo toàn độ phủ',
        'Nội dung dựa hoàn toàn vào phân phối trả phí, chưa có tương tác lan truyền tự nhiên',
        'Mục tiêu chính là tiếp cận đúng tệp; chưa đủ dữ liệu doanh số để ước tính đơn hàng'
      ]
    },
    base: {
      label: 'Kịch bản Cơ sở (Giả định trung bình)',
      cpm: hasPaidAds ? 35000 : 25000,
      freq: 1.6,
      engRate: 0.035,
      assumptions: [
        'Chi phí giá thầu CPM ổn định theo định mức phân phối thông thường',
        'Tần suất lặp lại trung bình 1.6 lượt/người giúp gia tăng độ nhớ thương hiệu',
        'Bộ ấn phẩm media đạt mức tương tác tiêu chuẩn (tỷ lệ tương tác ~3.5%)',
        'Chiến dịch tập trung nhận diện; người dùng quan tâm được dẫn vào kênh theo dõi'
      ]
    },
    optimistic: {
      label: 'Kịch bản Tích cực (Khi tối ưu chuyển đổi & viral)',
      cpm: hasPaidAds ? 25000 : 18000,
      freq: 2.0,
      engRate: 0.065,
      assumptions: [
        'Video hoặc thông điệp mở màn tạo được thảo luận tự nhiên tốt',
        'CPM giảm nhờ điểm phù hợp nội dung cao trên nền tảng',
        'Hiệu ứng chia sẻ tự nhiên giúp mở rộng thêm 25% lượt tiếp cận miễn phí',
        'Tần suất chạm 2.0 lượt/người tối ưu nhận biết thương hiệu sâu'
      ]
    }
  };

  return (['conservative', 'base', 'optimistic'] as KPIScenarioName[]).map((name) => {
    const cfg = configs[name];
    const impressions = Math.max(1000, Math.round((mediaBudget / cfg.cpm) * 1000));
    const reach = Math.max(800, Math.round(impressions / cfg.freq));
    const leads = Math.max(20, Math.round(reach * cfg.engRate));

    return {
      name,
      label: cfg.label,
      reach,
      impressions,
      leads,
      orders: 0,
      targetCPO: 0,
      cac: 0,
      assumptions: cfg.assumptions,
      objectiveType: 'awareness',
      funnelSteps: [
        {
          label: 'Ngân sách phân phối truyền thông',
          value: mediaBudget,
          unit: 'VNĐ',
          assumptionNote: `Chiếm ${Math.round(mediaRatio * 100)}% tổng ngân sách chiến dịch`
        },
        {
          label: 'Lượt hiển thị (Impressions)',
          value: impressions,
          unit: 'lượt',
          assumptionNote: `Ước tính theo định mức CPM giả định ${cfg.cpm.toLocaleString('vi-VN')} VNĐ`
        },
        {
          label: 'Lượt tiếp cận độc lập (Unique Reach)',
          value: reach,
          unit: 'người',
          assumptionNote: `Tần suất hiển thị giả định ${cfg.freq} lượt/người`
        },
        {
          label: 'Lượt tương tác & xem nội dung',
          value: leads,
          unit: 'lượt',
          assumptionNote: `Tỷ lệ tương tác giả định ~${(cfg.engRate * 100).toFixed(1)}%`
        }
      ],
      provenanceMap: {
        reach: 'calculated',
        impressions: 'calculated',
        leads: 'calculated',
        orders: 'assumption',
        targetCPO: 'assumption',
        cac: 'assumption'
      }
    };
  });
}

/**
 * 2. Phễu cho mục tiêu Bán hàng / Chuyển đổi (Sales)
 */
function calculateSalesKPIs(totalBudget: number, hasPaidAds: boolean): KPIScenario[] {
  const adsRatio = hasPaidAds ? 0.75 : 0.45;
  const adsBudget = Math.round(totalBudget * adsRatio);

  const configs: Record<KPIScenarioName, { label: string; cpc: number; leadRate: number; closeRate: number; assumptions: string[] }> = {
    conservative: {
      label: 'Kịch bản Thận trọng (Biên an toàn ngân sách)',
      cpc: hasPaidAds ? 3200 : 2500,
      leadRate: 0.05,
      closeRate: 0.1,
      assumptions: [
        'Chi phí mỗi click (CPC) ở mức cao do cạnh tranh giá thầu lớn',
        'Tỷ lệ khách nhắn tin/để lại giỏ hàng dừng ở mức 5% trên tổng lượt click',
        'Tỷ lệ chốt đơn của đội ngũ tư vấn duy trì ở mức an toàn 10%',
        'Không có đơn hàng tự nhiên; phụ thuộc 100% vào lượng click trả phí'
      ]
    },
    base: {
      label: 'Kịch bản Cơ sở (Giả định trung bình)',
      cpc: hasPaidAds ? 2200 : 1800,
      leadRate: 0.08,
      closeRate: 0.16,
      assumptions: [
        'CPC duy trì ổn định nhờ thông điệp rõ ràng và hình ảnh sản phẩm nổi bật',
        'Tỷ lệ chuyển từ click sang nhắn tin hỏi mua đạt 8%',
        'Tỷ lệ chốt đơn đạt 16% khi tốc độ phản hồi tin nhắn dưới 5 phút',
        'Mã ưu đãi voucher vận hành trơn tru giúp kích thích thanh toán nhanh'
      ]
    },
    optimistic: {
      label: 'Kịch bản Tích cực (Khi tối ưu chuyển đổi & viral)',
      cpc: hasPaidAds ? 1600 : 1300,
      leadRate: 0.12,
      closeRate: 0.22,
      assumptions: [
        'Landing page hoặc video review hấp dẫn, tỷ lệ click cao và giá thầu CPC tối ưu',
        'Tỷ lệ khách hỏi mua đạt 12% nhờ lời kêu gọi hành động (CTA) sắc bén',
        'Tỷ lệ chốt sales đạt 22% nhờ kịch bản tư vấn xuất sắc và ưu đãi giới hạn',
        'Khách tự chia sẻ bài đăng mang lại lượng đơn hàng giới thiệu tự nhiên'
      ]
    }
  };

  return (['conservative', 'base', 'optimistic'] as KPIScenarioName[]).map((name) => {
    const cfg = configs[name];
    const clicks = Math.max(50, Math.round(adsBudget / cfg.cpc));
    const inquiries = Math.max(10, Math.round(clicks * cfg.leadRate));
    const orders = Math.max(3, Math.round(inquiries * cfg.closeRate));
    const targetCPO = Math.round(totalBudget / orders);
    const cac = Math.round((totalBudget * 0.85) / Math.max(1, Math.round(orders * 0.8)));
    const impressions = Math.round(clicks * 30);
    const reach = Math.round(impressions / 1.6);

    return {
      name,
      label: cfg.label,
      reach,
      impressions,
      leads: inquiries,
      orders,
      targetCPO,
      cac,
      assumptions: cfg.assumptions,
      objectiveType: 'sales',
      funnelSteps: [
        {
          label: 'Ngân sách quảng cáo & chuyển đổi',
          value: adsBudget,
          unit: 'VNĐ',
          assumptionNote: `Chiếm ${Math.round(adsRatio * 100)}% tổng ngân sách chiến dịch`
        },
        {
          label: 'Lượt nhấp quan tâm (Clicks)',
          value: clicks,
          unit: 'lượt',
          assumptionNote: `Ước tính theo CPC giả định ${cfg.cpc.toLocaleString('vi-VN')} VNĐ/click`
        },
        {
          label: 'Khách hàng tiềm năng / Inbox (Leads)',
          value: inquiries,
          unit: 'khách',
          assumptionNote: `Tỷ lệ chuyển đổi click → hỏi mua giả định ${(cfg.leadRate * 100).toFixed(1)}%`
        },
        {
          label: 'Đơn hàng hoàn tất (Orders)',
          value: orders,
          unit: 'đơn',
          assumptionNote: `Tỷ lệ chốt đơn giả định ${(cfg.closeRate * 100).toFixed(1)}%`
        },
        {
          label: 'Chi phí mục tiêu / Đơn (Target CPO)',
          value: targetCPO,
          unit: 'VNĐ',
          assumptionNote: 'Tổng ngân sách chia cho số đơn hàng kỳ vọng'
        }
      ],
      provenanceMap: {
        reach: 'calculated',
        impressions: 'calculated',
        leads: 'calculated',
        orders: 'calculated',
        targetCPO: 'calculated',
        cac: 'calculated'
      }
    };
  });
}

/**
 * 3. Phễu cho mục tiêu Khách hàng tiềm năng (Lead Generation)
 */
function calculateLeadGenKPIs(totalBudget: number, hasPaidAds: boolean): KPIScenario[] {
  const mediaRatio = hasPaidAds ? 0.7 : 0.5;
  const mediaBudget = Math.round(totalBudget * mediaRatio);

  const configs: Record<KPIScenarioName, { label: string; cpl: number; assumptions: string[] }> = {
    conservative: {
      label: 'Kịch bản Thận trọng (Biên an toàn ngân sách)',
      cpl: hasPaidAds ? 85000 : 65000,
      assumptions: [
        'Chi phí mỗi lead (CPL) cao do yêu cầu form nhiều trường thông tin',
        'Tỷ lệ điền form hoàn tất duy trì ở mức thận trọng 3% trên lượt truy cập',
        'Dữ liệu lead cần đội ngũ sàng lọc kỹ trước khi chuyển bước tư vấn'
      ]
    },
    base: {
      label: 'Kịch bản Cơ sở (Giả định trung bình)',
      cpl: hasPaidAds ? 55000 : 42000,
      assumptions: [
        'Form đăng ký ngắn gọn (Tên + Số điện thoại) giúp tăng tỷ lệ điền',
        'Chi phí mỗi lead duy trì ở định mức mục tiêu tiêu chuẩn',
        'Tỷ lệ liên hệ thành công trong vòng 24h đạt trên 75%'
      ]
    },
    optimistic: {
      label: 'Kịch bản Tích cực (Khi tối ưu chuyển đổi & viral)',
      cpl: hasPaidAds ? 38000 : 28000,
      assumptions: [
        'Ưu đãi tư vấn hoặc quà tặng thử nghiệm đủ hấp dẫn để khách chủ động đăng ký',
        'Tối ưu form trên mobile giúp giảm rào cản điền thông tin',
        'Chi phí lead đạt mức tối ưu nhất trong phân khúc'
      ]
    }
  };

  return (['conservative', 'base', 'optimistic'] as KPIScenarioName[]).map((name) => {
    const cfg = configs[name];
    const leads = Math.max(5, Math.round(mediaBudget / cfg.cpl));
    const clicks = Math.round(leads * 12);
    const reach = Math.round(clicks * 25);
    const impressions = Math.round(reach * 1.5);

    return {
      name,
      label: cfg.label,
      reach,
      impressions,
      leads,
      orders: 0,
      targetCPO: 0,
      cac: cfg.cpl,
      assumptions: cfg.assumptions,
      objectiveType: 'lead_generation',
      funnelSteps: [
        {
          label: 'Ngân sách tìm kiếm Lead',
          value: mediaBudget,
          unit: 'VNĐ',
          assumptionNote: `Chiếm ${Math.round(mediaRatio * 100)}% tổng ngân sách`
        },
        {
          label: 'Lượt truy cập trang đăng ký',
          value: clicks,
          unit: 'lượt',
          assumptionNote: 'Lượng truy cập từ các kênh quảng cáo và bài viết'
        },
        {
          label: 'Khách tiềm năng để lại thông tin (Leads)',
          value: leads,
          unit: 'lead',
          assumptionNote: `Chi phí mỗi lead ước tính: ${cfg.cpl.toLocaleString('vi-VN')} VNĐ`
        }
      ],
      provenanceMap: {
        reach: 'calculated',
        impressions: 'calculated',
        leads: 'calculated',
        orders: 'assumption',
        targetCPO: 'assumption',
        cac: 'calculated'
      }
    };
  });
}

/**
 * 4. Phễu cho mục tiêu Kích hoạt khách hàng cũ (Retention)
 */
function calculateRetentionKPIs(totalBudget: number, hasPaidAds: boolean): KPIScenario[] {
  const retentionRatio = 0.65;
  const retentionBudget = Math.round(totalBudget * retentionRatio);

  const configs: Record<KPIScenarioName, { label: string; reactivateCost: number; assumptions: string[] }> = {
    conservative: {
      label: 'Kịch bản Thận trọng (Biên an toàn ngân sách)',
      reactivateCost: 110000,
      assumptions: [
        'Tệp khách hàng cũ lâu ngày chưa tương tác; tỷ lệ mở tin nhắn/email dưới 15%',
        'Cần gửi nhắc nhở 2 lần kèm ưu đãi đặc biệt để khách cân nhắc quay lại',
        'Chi phí kích hoạt mỗi đơn hàng cũ ở ngưỡng an toàn ngân sách'
      ]
    },
    base: {
      label: 'Kịch bản Cơ sở (Giả định trung bình)',
      reactivateCost: 70000,
      assumptions: [
        'Tệp khách hàng cũ có trải nghiệm trước đó tốt; tỷ lệ mở tin nhắn đạt trên 25%',
        'Chính sách tri ân và mã giảm giá độc quyền thúc đẩy khách quay lại mua nhanh',
        'Tỷ lệ khách phản hồi tin nhắn chăm sóc đạt 18% - 22%'
      ]
    },
    optimistic: {
      label: 'Kịch bản Tích cực (Khi tối ưu chuyển đổi & viral)',
      reactivateCost: 45000,
      assumptions: [
        'Khách cũ chủ động giới thiệu thêm bạn bè cùng mua chung để hưởng ưu đãi nhóm',
        'Chi phí kích hoạt tối ưu nhờ tỷ lệ tái mua vượt trội',
        'Hơn 30% khách cũ tiếp tục duy trì đăng ký thành viên thân thiết'
      ]
    }
  };

  return (['conservative', 'base', 'optimistic'] as KPIScenarioName[]).map((name) => {
    const cfg = configs[name];
    const orders = Math.max(5, Math.round(retentionBudget / cfg.reactivateCost));
    const reach = Math.round(orders * 6);
    const impressions = Math.round(reach * 2);
    const leads = Math.round(orders * 1.5);
    const targetCPO = Math.round(totalBudget / orders);

    return {
      name,
      label: cfg.label,
      reach,
      impressions,
      leads,
      orders,
      targetCPO,
      cac: cfg.reactivateCost,
      assumptions: cfg.assumptions,
      objectiveType: 'retention',
      funnelSteps: [
        {
          label: 'Ngân sách kích hoạt tệp cũ',
          value: retentionBudget,
          unit: 'VNĐ',
          assumptionNote: `Chiếm ${Math.round(retentionRatio * 100)}% tổng ngân sách chiến dịch`
        },
        {
          label: 'Khách hàng cũ được tiếp cận',
          value: reach,
          unit: 'khách',
          assumptionNote: 'Tiếp cận qua Zalo ZNS, SMS, Email hoặc Direct Message'
        },
        {
          label: 'Đơn hàng mua lại hoàn tất (Repeat Orders)',
          value: orders,
          unit: 'đơn',
          assumptionNote: `Chi phí kích hoạt mỗi khách cũ: ${cfg.reactivateCost.toLocaleString('vi-VN')} VNĐ`
        },
        {
          label: 'Chi phí trên mỗi đơn mua lại',
          value: targetCPO,
          unit: 'VNĐ',
          assumptionNote: 'Tổng ngân sách chia cho số đơn hàng mua lại'
        }
      ],
      provenanceMap: {
        reach: 'calculated',
        impressions: 'calculated',
        leads: 'calculated',
        orders: 'calculated',
        targetCPO: 'calculated',
        cac: 'calculated'
      }
    };
  });
}

