import type { MarketingIdea, CampaignInput } from '@/types/marketing';
import type { IdeaVerificationEvidence, VerifiedCaseStudy, MiniExperimentPlan } from '@/types/case-study';
import { VERIFIED_CASE_STUDIES } from './data/verified-case-studies';

/**
 * Ghép nối ý tưởng marketing với case study thực tế đã kiểm chứng nguồn,
 * hoặc tạo fallback minh bạch kèm kế hoạch thử nghiệm nhỏ (Mini-experiment).
 */
export function attachVerificationEvidence(
  idea: MarketingIdea,
  input: CampaignInput
): IdeaVerificationEvidence {
  const combinedText = `${idea.title} ${idea.tagline} ${idea.channels.join(' ')} ${idea.mainContent}`.toLowerCase();
  const budgetLevel = input.budgetLevel;

  // 1. Tìm kiếm case study phù hợp nhất dựa trên kênh và cơ chế chiến dịch
  let matchedCase: VerifiedCaseStudy | undefined;

  for (const cs of VERIFIED_CASE_STUDIES) {
    // Kiểm tra mức ngân sách áp dụng
    const matchesBudget = cs.applicableBudgetLevels.includes(budgetLevel);

    // Kiểm tra từ khóa chiến lược
    const matchesStrategy = cs.applicableStrategyTypes.some((strat) => {
      const lowerStrat = strat.toLowerCase();
      if (lowerStrat.includes('ugc') && (combinedText.includes('ugc') || combinedText.includes('thử thách') || combinedText.includes('tiktok'))) return true;
      if (lowerStrat.includes('koc') && (combinedText.includes('koc') || combinedText.includes('kol') || combinedText.includes('influencer') || combinedText.includes('booking'))) return true;
      if (lowerStrat.includes('cross') && (combinedText.includes('chéo') || combinedText.includes('liên kết') || combinedText.includes('đối tác') || combinedText.includes('o2o'))) return true;
      if (lowerStrat.includes('storytelling') && (combinedText.includes('câu chuyện') || combinedText.includes('truyền cảm hứng') || combinedText.includes('mộc'))) return true;
      if (lowerStrat.includes('local') && (combinedText.includes('địa phương') || combinedText.includes('cửa hàng') || combinedText.includes('posm') || combinedText.includes('quán'))) return true;
      if (lowerStrat.includes('gamification') && (combinedText.includes('minigame') || combinedText.includes('lắc') || combinedText.includes('vòng quay') || combinedText.includes('trò chơi'))) return true;
      if (lowerStrat.includes('customer advocacy') && (combinedText.includes('trải nghiệm') || combinedText.includes('đổi trả') || combinedText.includes('review') || combinedText.includes('7 ngày'))) return true;
      return false;
    });

    if (matchesBudget && matchesStrategy) {
      matchedCase = cs;
      break;
    }
  }

  // 2. Xây dựng kế hoạch thử nghiệm nhỏ (Mini-experiment) may đo theo kênh của ý tưởng
  const miniExperiment = generateMiniExperiment(idea, input);

  if (matchedCase) {
    return {
      hasCaseStudy: true,
      caseStudy: matchedCase,
      miniExperiment
    };
  }

  // Fallback minh bạch khi không có case study tương đồng trong kho đã kiểm duyệt
  return {
    hasCaseStudy: false,
    missingCaseStudyNotice: 'Chưa có case study tương đồng được xác minh nguồn cho mô hình này trong kho dữ liệu tham chiếu.',
    miniExperiment
  };
}

/**
 * Sinh kế hoạch thử nghiệm quy mô nhỏ (3–5 ngày, chi phí thấp) để kiểm chứng giả định trước khi duyệt chi lớn
 */
function generateMiniExperiment(idea: MarketingIdea, input: CampaignInput): MiniExperimentPlan {
  const primaryChannel = idea.channels[0] || 'Kênh trực tuyến';
  const productName = input.productName || 'sản phẩm';

  // Điều chỉnh giả thuyết và hành động theo kênh chính
  if (primaryChannel.toLowerCase().includes('tiktok') || primaryChannel.toLowerCase().includes('reels') || primaryChannel.toLowerCase().includes('video')) {
    return {
      hypothesis: `Khách hàng mục tiêu sẽ quan tâm đến thông điệp "${idea.tagline}" của ${productName} nếu được truyền tải dưới dạng video ngắn chân thực (giữ chân >3 giây đầu đạt trên 25%).`,
      actionToTest: `Sản xuất 2 video ngắn mẫu bằng điện thoại với 2 tiêu đề mở đầu khác nhau, đăng thử nghiệm lên kênh và theo dõi tương tác hữu cơ trong 3 ngày.`,
      timeframeAndResources: `Thời gian: 3–5 ngày. Chi phí dự kiến: 0 – 500.000 VNĐ (sản phẩm mẫu và boost bài nhẹ).`,
      measurementMetrics: `Tỷ lệ xem hết video (>50%), số bình luận hỏi giá/tư vấn, số lượt lưu/chia sẻ video.`,
      decisionCriteria: {
        proceed: `Nếu video đạt trên 1.500 lượt xem tự nhiên và có ít nhất 5 lượt hỏi mua -> Tiến hành triển khai toàn bộ chiến dịch 4 tuần.`,
        pivot: `Nếu lượt xem tốt nhưng không ai hỏi mua -> Giữ kịch bản video nhưng thay đổi lời kêu gọi hành động (CTA) và ưu đãi rõ ràng hơn.`,
        stop: `Nếu tỷ lệ lướt qua trong 3s đầu vượt 85% trên cả 2 video -> Tạm dừng hướng tiếp cận này, chuyển sang ý tưởng khác trong danh sách.`
      }
    };
  }

  if (primaryChannel.toLowerCase().includes('chéo') || primaryChannel.toLowerCase().includes('đối tác') || primaryChannel.toLowerCase().includes('posm')) {
    return {
      hypothesis: `Tệp khách hàng của đối tác có nhu cầu tương đồng và sẵn sàng dùng thử ${productName} nếu nhận được voucher ưu đãi độc quyền.`,
      actionToTest: `In thử 50 voucher giấy nhỏ đặt tại quầy thu ngân của 1 đối tác thân quen trong 3 ngày cuối tuần.`,
      timeframeAndResources: `Thời gian: 3 ngày cuối tuần. Chi phí: 200.000 VNĐ in ấn voucher và 3–5 mẫu dùng thử.`,
      measurementMetrics: `Tỷ lệ khách lấy voucher (>30%) và số lượng voucher được quét mã/sử dụng thực tế.`,
      decisionCriteria: {
        proceed: `Nếu có ít nhất 10 khách mang voucher đến mua hàng -> Ký thỏa thuận hợp tác chính thức và mở rộng thêm 2 đối tác mới.`,
        pivot: `Nếu khách lấy voucher nhưng không đến quán -> Kéo dài hạn voucher hoặc tăng mức ưu đãi hấp dẫn hơn.`,
        stop: `Nếu khách từ chối nhận voucher tại quầy -> Khách hàng 2 bên không khớp phân khúc, dừng hướng hợp tác này.`
      }
    };
  }

  if (primaryChannel.toLowerCase().includes('ads') || primaryChannel.toLowerCase().includes('quảng cáo')) {
    return {
      hypothesis: `Chi phí để thu hút 1 khách hàng tiềm năng quan tâm đến ${productName} qua quảng cáo số sẽ nằm trong ngưỡng chấp nhận được (< 50.000 VNĐ/lead hoặc CPO hợp lý).`,
      actionToTest: `Chạy test A/B ngân sách nhỏ (100.000 VNĐ/ngày trong 3 ngày) với 2 mẫu thông điệp và hình ảnh đối lập.`,
      timeframeAndResources: `Thời gian: 3 ngày. Ngân sách test: 300.000 VNĐ.`,
      measurementMetrics: `Tỷ lệ nhấp CTR (>1.5%), Chi phí trên mỗi lượt nhấp CPC và số lượng đăng ký/tin nhắn phát sinh.`,
      decisionCriteria: {
        proceed: `Nếu chỉ số CTR > 1.8% và có đơn/tin nhắn thử nghiệm -> Nâng ngân sách theo đúng bảng phân bổ kế hoạch.`,
        pivot: `Nếu CTR tốt nhưng không ra tin nhắn -> Chỉnh sửa lại trang đích (Landing Page) hoặc giá ưu đãi mở bán.`,
        stop: `Nếu chi phí click CPC vượt ngưỡng dự toán hơn 50% -> Dừng nhóm quảng cáo, tối ưu lại tệp đối tượng hoặc chuyển kênh.`
      }
    };
  }

  // Thử nghiệm mặc định cho Social & Community
  return {
    hypothesis: `Khách hàng mục tiêu sẽ chủ động tương tác và chia sẻ về ${productName} khi có chủ đề thảo luận gắn liền với nhu cầu thực tế của họ.`,
    actionToTest: `Đăng 2 bài viết chia sẻ kinh nghiệm / minigame mini vào 2 hội nhóm cộng đồng liên quan kèm câu hỏi thảo luận mở.`,
    timeframeAndResources: `Thời gian: 2–3 ngày. Chi phí: 0 VNĐ (thời gian soạn bài viết và trả lời comment).`,
    measurementMetrics: `Lượt bình luận tự nhiên từ người dùng thật (>15 comments chất lượng), số tin nhắn riêng hỏi thêm về sản phẩm.`,
    decisionCriteria: {
      proceed: `Nếu bài viết tạo được luồng tranh luận tích cực và có người hỏi nguồn mua -> Triển khai tiếp timeline tuần 1.`,
      pivot: `Nếu bài bị trôi hoặc ít tương tác -> Đổi lại góc nhìn (angle) bài viết theo hướng trải nghiệm cá nhân thực tế hơn.`,
      stop: `Nếu cộng đồng phản ứng tiêu cực hoặc bị xóa bài -> Không tiếp tục kênh này, chuyển sang kênh truyền thông khác.`
    }
  };
}

