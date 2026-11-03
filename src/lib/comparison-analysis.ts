import { MarketingIdea, CampaignInput, StrategyEvaluation, ShortlistEntry, AICMOVerdict } from '@/types/marketing';

/**
 * Phân tích định tính minh bạch cho từng phương án chiến lược.
 * TUYỆT ĐỐI KHÔNG sinh điểm số ảo ngụy tạo ("Tỷ lệ thành công 95%").
 * Mọi nhận định đều dựa trên logic nghiệp vụ thực tế của các kênh, timeline và ngân sách.
 */
export function evaluateStrategy(
  idea: MarketingIdea,
  context: Pick<CampaignInput, 'budgetLevel' | 'objective' | 'industry'>
): StrategyEvaluation {
  const channelsText = idea.channels.join(' ').toLowerCase();
  const mainContentText = idea.mainContent.toLowerCase();
  const allText = `${channelsText} ${mainContentText}`;

  // 1. Đánh giá độ phức tạp thực thi
  let complexityLevel: 'Thấp' | 'Trung bình' | 'Cao' = 'Trung bình';
  let complexityReason = '';

  const isHighComplexity =
    allText.includes('imc') ||
    allText.includes('ooh') ||
    allText.includes('billboard') ||
    allText.includes('sự kiện') ||
    allText.includes('gala') ||
    allText.includes('kol lớn') ||
    context.budgetLevel === 'high';

  const isLowComplexity =
    (context.budgetLevel === 'low' || allText.includes('tiết kiệm') || allText.includes('organic')) &&
    !allText.includes('paid ads') &&
    !allText.includes('chạy ads') &&
    !allText.includes('quảng cáo trả phí');

  if (isHighComplexity) {
    complexityLevel = 'Cao';
    complexityReason =
      'Đòi hỏi phối hợp đa bên (Agency, Sản xuất media, Đối tác mặt bằng/Sự kiện) và quy trình quản trị ngân sách chặt chẽ.';
  } else if (isLowComplexity) {
    complexityLevel = 'Thấp';
    complexityReason =
      'Có thể triển khai ngay với đội ngũ nội bộ tinh gọn (1–2 nhân sự), không phụ thuộc vào đối tác kỹ thuật phức tạp.';
  } else {
    complexityLevel = 'Trung bình';
    complexityReason =
      'Cần kết hợp giữa sản xuất nội dung đều đặn và quản lý chiến dịch quảng cáo trả phí/KOC tầm trung.';
  }

  // 2. Nguồn lực cần chuẩn bị
  const requiredResources: string[] = [];
  if (allText.includes('tiktok') || allText.includes('reels') || allText.includes('video')) {
    requiredResources.push('1 Content Creator/Editor quay dựng video ngắn (CapCut/Điện thoại)');
  }
  if (allText.includes('ads') || allText.includes('quảng cáo') || allText.includes('chạy')) {
    requiredResources.push('1 Media Buyer theo dõi chỉ số quảng cáo và tối ưu giá thầu hàng ngày');
  }
  if (allText.includes('seeding') || allText.includes('cộng đồng') || allText.includes('hội nhóm')) {
    requiredResources.push('Tài khoản seeding uy tín và danh sách 10–20 hội nhóm liên quan');
  }
  if (allText.includes('koc') || allText.includes('kol') || allText.includes('creator')) {
    requiredResources.push('Bộ sản phẩm mẫu và quy trình liên hệ, gửi hàng barter cho KOC');
  }
  if (requiredResources.length === 0) {
    requiredResources.push('1 Phụ trách chiến dịch điều phối chung', 'Kho nội dung hình ảnh/bài viết cơ bản');
  }

  // 3. Rủi ro chính & Biện pháp phòng tránh
  const keyRisks: string[] = [];
  const mitigationTips: string[] = [];

  if (allText.includes('tiktok') || allText.includes('organic')) {
    keyRisks.push('Thuật toán phân phối video tự nhiên có thể trồi sụt, khó đoán trước lượt xem');
    mitigationTips.push('Sản xuất tối thiểu 3–5 phiên bản hook đầu video khác nhau để test tương tác');
  }
  if (allText.includes('ads') || allText.includes('quảng cáo')) {
    keyRisks.push('Chi phí quảng cáo (CPM/CPC) có thể tăng đột biến trong các dịp cao điểm');
    mitigationTips.push('Đặt trần ngân sách ngày nghiêm ngặt, chỉ scale ngân sách khi chỉ số ROI khả quan');
  }
  if (context.budgetLevel === 'low') {
    keyRisks.push('Tốc độ lan tỏa ban đầu có thể chậm do thiếu đòn bẩy ngân sách trả phí');
    mitigationTips.push('Huy động mạng lưới khách hàng cũ và nhân viên chia sẻ đợt đầu để tạo đà');
  }
  if (keyRisks.length === 0) {
    keyRisks.push('Tiến độ thực thi các tuần có thể bị dồn nếu khâu chuẩn bị nội dung chậm trễ');
    mitigationTips.push('Hoàn thiện kịch bản và tài nguyên truyền thông trước ngày khởi chạy tuần 1');
  }

  // 4. Mức độ phù hợp với mục tiêu ban đầu
  const goalAlignmentScoreRationale = `Phương án này tập trung vào kênh ${idea.channels.slice(0, 2).join(' và ')}, trực tiếp giải quyết mục tiêu "${context.objective}" thông qua thông điệp "${idea.tagline}" và kế hoạch chia nhịp 4 tuần rõ ràng.`;

  return {
    complexityLevel,
    complexityReason,
    requiredResources,
    keyRisks,
    mitigationTips,
    goalAlignmentScoreRationale
  };
}

/**
 * Xuất bảng so sánh dạng Markdown để gửi qua Slack, Zalo, Notion hoặc email
 */
export function generateComparisonMarkdown(
  entries: ShortlistEntry[],
  cmoVerdict?: AICMOVerdict
): string {
  if (entries.length === 0) return '';

  const dateStr = new Date().toLocaleDateString('vi-VN');
  let md = `# 📊 BẢNG SO SÁNH PHƯƠNG ÁN CHIẾN LƯỢC MARKETING\n`;
  md += `*Ngày xuất báo cáo: ${dateStr} | Số lượng so sánh: ${entries.length} chiến dịch*\n\n`;

  // Thêm nhận định từ AI CMO nếu có
  if (cmoVerdict) {
    md += `## 👑 Phán Quyết & Tư Vấn Của AI CMO\n`;
    md += `> **Phương án khuyên chọn:** **${cmoVerdict.recommendedWinner.title} (v${cmoVerdict.recommendedWinner.version})**\n`;
    md += `> **Lý do lựa chọn:** ${cmoVerdict.recommendedWinner.verdictReason}\n\n`;
    md += `> 💡 **Mẹo chiến lược kết hợp (Hybrid Strategy):** ${cmoVerdict.hybridStrategyTip}\n\n`;
  }

  // Bảng tóm tắt song song
  md += `| Tiêu chí | ${entries.map((e) => `**${e.idea.title}** (v${e.idea.version || 1}) ${e.isPrimary ? '⭐ [ƯU TIÊN]' : ''}`).join(' | ')} |\n`;
  md += `| :--- | ${entries.map(() => ':---').join(' | ')} |\n`;

  md += `| **Slogan** | ${entries.map((e) => `"${e.idea.tagline}"`).join(' | ')} |\n`;
  md += `| **Ngân sách** | ${entries.map((e) => e.idea.estimatedBudget).join(' | ')} |\n`;
  md += `| **Kênh chính** | ${entries.map((e) => e.idea.channels.join(', ')).join(' | ')} |\n`;
  md += `| **Khách hàng** | ${entries.map((e) => e.idea.targetAudience).join(' | ')} |\n`;

  // Đánh giá định tính
  const evaluations = entries.map((e) =>
    evaluateStrategy(e.idea, {
      budgetLevel: e.context.budgetLevel,
      objective: e.context.objective,
      industry: e.context.industry
    })
  );

  md += `| **Độ phức tạp** | ${evaluations.map((ev) => `**${ev.complexityLevel}** (${ev.complexityReason})`).join(' | ')} |\n`;
  md += `| **Nguồn lực cần** | ${evaluations.map((ev) => ev.requiredResources.join('; ')).join(' | ')} |\n`;
  md += `| **Rủi ro chính** | ${evaluations.map((ev) => ev.keyRisks.join('; ')).join(' | ')} |\n`;
  md += `| **Ghi chú riêng** | ${entries.map((e) => e.userNotes ? `_${e.userNotes}_` : '*(Chưa có ghi chú)*').join(' | ')} |\n\n`;

  // Chi tiết từng chiến dịch
  md += `## Chi tiết nội dung chiến lược từng phương án\n\n`;
  entries.forEach((e, idx) => {
    md += `### ${idx + 1}. ${e.idea.title} (Phiên bản v${e.idea.version || 1})\n`;
    if (e.isPrimary) md += `> ⭐ **Phương án được đánh dấu Ưu Tiên Triển Khai**\n\n`;
    if (e.userNotes) md += `> 📝 **Ghi chú cá nhân:** ${e.userNotes}\n\n`;
    md += `- **Cốt lõi chiến lược:** ${e.idea.mainContent}\n`;
    md += `- **Timeline 4 tuần:**\n`;
    e.idea.timeline.forEach((w) => {
      md += `  - Tuần ${w.week} (${w.title}): ${w.activities.join('; ')}\n`;
    });
    md += `\n`;
  });

  md += `---\n*Xuất từ Trợ lý Marketing AI Supporter*\n`;
  return md;
}

