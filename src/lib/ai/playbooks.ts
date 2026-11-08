import type { CampaignInput } from '@/types/marketing';

export interface PlaybookWeek {
  week: 1 | 2 | 3 | 4;
  title: string;
  focus: string;
}

export interface MarketingPlaybook {
  id: string;
  name: string;
  strategyType: string;
  provenCase: string; // Chiến dịch thực chiến tiêu biểu tại VN
  coreMechanism: string;
  recommendedChannels: string[];
  suggestedBudgetNote: string;
  timelinePattern: PlaybookWeek[];
  // Thuộc tính mở rộng theo Mục 4 (Chọn playbook theo tình huống)
  applicableObjectives: string[]; // ['awareness', 'sales', 'lead_generation', 'retention']
  buyerJourneyStage: 'unaware' | 'problem_aware' | 'solution_aware' | 'decision' | 'retention';
  prerequisites: string[]; // Điều kiện tiên quyết
  requiredResources: {
    effortLevel: 'low' | 'medium' | 'high';
    keyResource: string;
  };
  whenToAvoid: string; // Trường hợp nên tránh sử dụng
  selectionRationale: string; // Căn cứ giải thích vì sao playbook phù hợp
}

export const MARKETING_PLAYBOOKS: Record<'low' | 'medium' | 'high', MarketingPlaybook[]> = {
  low: [
    {
      id: 'low-ugc-challenge',
      name: 'Thử Thách UGC & Sáng Tạo Video Ngắn Tự Nhiên',
      strategyType: 'UGC & Social Seeding',
      provenCase: 'Chiến dịch thử thách hashtag TikTok (tương tự Milo vs Ovaltine, Lifebuoy Vũ điệu rửa tay)',
      coreMechanism: 'Kêu gọi khách hàng và cộng đồng sáng tạo video ngắn trải nghiệm sản phẩm để nhận quà, tận dụng thuật toán FYP và seeding 10-15 hội nhóm để lan tỏa 0đ ads.',
      recommendedChannels: ['TikTok Organic', 'Facebook Group Seeding', 'Instagram Reels'],
      suggestedBudgetNote: 'Chi phí minigame, quà tặng sản phẩm và trao giải (dưới 10M)',
      applicableObjectives: ['awareness', 'sales'],
      buyerJourneyStage: 'problem_aware',
      prerequisites: ['Có sản phẩm mẫu để tặng/dùng thử', 'Sản phẩm có yếu tố thị giác hoặc trải nghiệm dễ quay video'],
      requiredResources: {
        effortLevel: 'medium',
        keyResource: 'Nhân sự seeding hội nhóm và kiểm duyệt video minigame'
      },
      whenToAvoid: 'Sản phẩm B2B kỹ thuật cao hoặc phần mềm phức tạp khó truyền tải qua video ngắn',
      selectionRationale: 'Tận dụng thuật toán video ngắn và cộng đồng để lan tỏa tự nhiên với chi phí media 0đ',
      timelinePattern: [
        { week: 1, title: 'Khởi động & Teasing thể lệ', focus: 'Tung video mẫu và brief minigame' },
        { week: 2, title: 'Bùng nổ làn sóng tham gia', focus: 'Seeding group và đẩy mạnh tương tác' },
        { week: 3, title: 'Bình chọn & Khuấy động thảo luận', focus: 'Mở cổng vote top 10 và tạo hiệu ứng truyền miệng' },
        { week: 4, title: 'Trao giải & Chuyển đổi voucher', focus: 'Livestream công bố và phát mã giảm giá' }
      ]
    },
    {
      id: 'low-7day-journey',
      name: 'Hành Trình Khách Hàng 7 Ngày Trải Nghiệm & Review Chân Thực',
      strategyType: 'Customer Advocacy & Social Proof',
      provenCase: 'Chiến dịch trải nghiệm thực tế (tương tự 7 ngày da khỏe cùng mỹ phẩm thiên nhiên)',
      coreMechanism: 'Tuyển 30-50 khách hàng thật trải nghiệm sản phẩm trong 7 ngày, đăng nhật ký review mỗi ngày trên mạng xã hội để tạo bằng chứng xã hội (Social Proof) vững chắc.',
      recommendedChannels: ['Facebook Cá nhân/Group', 'Zalo Group Chăm sóc', 'TikTok Review'],
      suggestedBudgetNote: 'Sản phẩm mẫu dùng thử & Voucher tri ân (dưới 8M)',
      applicableObjectives: ['sales', 'awareness'],
      buyerJourneyStage: 'solution_aware',
      prerequisites: ['Sản phẩm đem lại cảm nhận rõ rệt sau 7 ngày (mỹ phẩm, F&B, đồ gia dụng)', 'Sẵn sàng 30-50 mẫu thử miễn phí'],
      requiredResources: {
        effortLevel: 'high',
        keyResource: 'Theo dõi, nhắc nhở và chăm sóc khách hàng dùng thử hàng ngày'
      },
      whenToAvoid: 'Sản phẩm tiêu dùng một lần hoặc dịch vụ có chu kỳ sử dụng kéo dài nhiều tháng',
      selectionRationale: 'Tạo bằng chứng xã hội (Social Proof) xác thực xóa tan hoài nghi mua sắm của khách hàng mới',
      timelinePattern: [
        { week: 1, title: 'Chiêu mộ biệt đội trải nghiệm', focus: 'Mở đơn chọn 50 người dùng phù hợp' },
        { week: 2, title: 'Nhật ký trải nghiệm 7 ngày', focus: 'Khách đăng review cảm nhận thực tế' },
        { week: 3, title: 'Thu hoạch feedback & Lan tỏa', focus: 'Tổng hợp album ảnh uy tín và câu chuyện thật' },
        { week: 4, title: 'Kích hoạt mua lại & Giới thiệu', focus: 'Tặng mã ưu đãi độc quyền cho người quen' }
      ]
    },
    {
      id: 'low-cross-promo',
      name: 'Liên Minh Đối Tác Tương Hỗ (Cross-Promotion O2O)',
      strategyType: 'Barter Partnership',
      provenCase: 'Hợp tác chéo giữa quán cafe và local brand thời trang/tiệm hoa cùng phân khúc',
      coreMechanism: 'Liên kết với 2-3 thương hiệu phi cạnh tranh có cùng tệp khách hàng để phát voucher chéo, đặt standee và quà tặng mẫu tại điểm bán của nhau mà không tốn tiền ads.',
      recommendedChannels: ['Hợp tác chéo (Cross-promo)', 'POSM tại điểm bán đối tác', 'Instagram Stories'],
      suggestedBudgetNote: 'In ấn voucher, standee và hàng mẫu hợp tác (dưới 7M)',
      applicableObjectives: ['sales', 'awareness', 'lead_generation'],
      buyerJourneyStage: 'decision',
      prerequisites: ['Có điểm bán vật lý hoặc đối tác lân cận cùng phân khúc', 'Có voucher hoặc sản phẩm mẫu để trao đổi chéo'],
      requiredResources: {
        effortLevel: 'medium',
        keyResource: 'Kỹ năng đàm phán hợp tác với 2-3 chủ thương hiệu đối tác'
      },
      whenToAvoid: 'Thương hiệu hoàn toàn 100% online không có điểm chạm phân phối hoặc quà tặng hữu hình',
      selectionRationale: 'Khai thác tệp khách hàng sẵn có của đối tác phi cạnh tranh mà không mất tiền mua quảng cáo',
      timelinePattern: [
        { week: 1, title: 'Đàm phán & Chốt liên minh', focus: 'Ký kết và thống nhất cơ chế đổi quà chéo' },
        { week: 2, title: 'Ra mắt ưu đãi kép 2 bên', focus: 'Đặt standee và truyền thông trên 2 kênh fanpage' },
        { week: 3, title: 'Khuấy động minigame chung', focus: 'Minigame tặng combo sản phẩm của cả 2 bên' },
        { week: 4, title: 'Đo lường & Duy trì tệp khách mới', focus: 'Thống kê lượng khách chuyển đổi từ đối tác' }
      ]
    },
    {
      id: 'low-expert-tips',
      name: 'Chuỗi Video Mẹo Chuyên Gia (Hook - Story - Solution)',
      strategyType: 'Educational Inbound Content',
      provenCase: 'Kênh TikTok bác sĩ/chuyên gia da liễu hoặc barista chia sẻ bí quyết làm nghề',
      coreMechanism: 'Sản xuất 15-20 video ngắn giải đáp đúng nỗi đau khách hàng theo công thức Hook 3s - Story - Solution, khéo léo lồng ghép sản phẩm làm giải pháp tiện lợi nhất.',
      recommendedChannels: ['TikTok Giáo dục/Tips', 'Facebook Reels', 'YouTube Shorts'],
      suggestedBudgetNote: 'Đạo cụ quay dựng, micro thu âm và decor góc quay (dưới 6M)',
      applicableObjectives: ['lead_generation', 'awareness', 'sales'],
      buyerJourneyStage: 'unaware',
      prerequisites: ['Người sáng lập hoặc nhân sự có kiến thức chuyên môn sâu trong ngành', 'Thiết bị quay cơ bản (smartphone + micro)'],
      requiredResources: {
        effortLevel: 'medium',
        keyResource: 'Duy trì kỷ luật sản xuất và đăng tải 1 video ngắn hữu ích mỗi ngày'
      },
      whenToAvoid: 'Ngành hàng phụ thuộc hoàn toàn vào giá rẻ hoặc không có kiến thức/mẹo để chia sẻ',
      selectionRationale: 'Xây dựng vị thế chuyên gia, thu hút tệp khách hàng tiềm năng bằng giá trị nội dung',
      timelinePattern: [
        { week: 1, title: 'Nghiên cứu nỗi đau & Lên kịch bản', focus: 'Xác định 15 chủ đề khách hàng hay hỏi nhất' },
        { week: 2, title: 'Sản xuất & Đăng tải hàng ngày', focus: 'Đăng đều 1 video/ngày vào khung giờ vàng' },
        { week: 3, title: 'Nhân bản video viral & Livestream Q&A', focus: 'Live trả lời thắc mắc trực tiếp' },
        { week: 4, title: 'Thu phễu khách hàng & Kêu gọi mua', focus: 'Gắn link bio nhận tư vấn và ưu đãi' }
      ]
    },
    {
      id: 'low-flash-deal-group',
      name: 'Giờ Vàng Săn Deal & Group Chat Khách Thân Thiết',
      strategyType: 'Community Flash Sale',
      provenCase: 'Chương trình nhóm kín Zalo VIP gom đơn giờ vàng của các shop F&B và bán lẻ online',
      coreMechanism: 'Kéo khách hàng vào nhóm Zalo/Telegram kín để nhận thông báo deal giới hạn 24h, tạo cảm giác khan hiếm và kích hoạt chốt đơn tiền tươi tức thì.',
      recommendedChannels: ['Zalo Group VIP', 'Facebook Post/Story', 'Tin nhắn trực tiếp'],
      suggestedBudgetNote: 'Chi phí ưu đãi trợ giá sản phẩm và quà tặng mini (dưới 5M)',
      applicableObjectives: ['sales', 'retention'],
      buyerJourneyStage: 'decision',
      prerequisites: ['Có danh mục sản phẩm sẵn sàng giao hàng ngay', 'Mức giá ưu đãi đủ hấp dẫn tạo phản ứng chốt đơn nhanh'],
      requiredResources: {
        effortLevel: 'low',
        keyResource: 'Quản trị nhóm Zalo và trực chốt đơn giờ vàng'
      },
      whenToAvoid: 'Sản phẩm B2B chu kỳ chốt đơn nhiều tuần hoặc giá trị quá cao (>10 triệu)',
      selectionRationale: 'Kích thích tâm lý FOMO và tạo doanh số tiền tươi ngay trong tuần đầu',
      timelinePattern: [
        { week: 1, title: 'Tạo nhóm kín & Mời khách gia nhập', focus: 'Tạo mã QR và tặng quà chào mừng vào group' },
        { week: 2, title: 'Đêm săn deal giờ vàng đợt 1', focus: 'Mở bán 30 suất ưu đãi sốc chỉ trong 2 giờ' },
        { week: 3, title: 'Review cảm nhận & Deal mua chung', focus: 'Kêu gọi khách chia sẻ feedback và gom đơn' },
        { week: 4, title: 'Tri ân thành viên VIP & Giữ nhịp', focus: 'Phát hành thẻ tích điểm cho thành viên hoạt động tích cực' }
      ]
    },
    {
      id: 'low-referral-loyalty',
      name: 'Kích Hoạt Khách Quen & Giới Thiệu Nhận Thưởng Đôi',
      strategyType: 'Referral & Retention',
      provenCase: 'Chương trình giới thiệu bạn bè nhận đôi quà tặng của các chuỗi F&B / Dịch vụ',
      coreMechanism: 'Cung cấp mã QR tích điểm Zalo OA hoặc thẻ ưu đãi điện tử, khách giới thiệu 1 bạn mới sẽ cùng nhận quà/ưu đãi trực tiếp cho lần mua kế tiếp.',
      recommendedChannels: ['Zalo OA / Mini App', 'Thẻ tích điểm điện tử', 'Tin nhắn chăm sóc'],
      suggestedBudgetNote: 'Quà tặng tích điểm và chi phí triển khai hệ thống (dưới 6M)',
      applicableObjectives: ['retention', 'sales'],
      buyerJourneyStage: 'retention',
      prerequisites: ['Đã có sẵn ít nhất 100-300 khách hàng cũ hài lòng', 'Có kênh liên hệ trực tiếp (Zalo/SMS/Email) với khách'],
      requiredResources: {
        effortLevel: 'low',
        keyResource: 'Quà tặng/voucher tri ân và hệ thống mã giới thiệu đơn giản'
      },
      whenToAvoid: 'Cửa hàng/thương hiệu mới mở chưa có tệp khách cũ nào',
      selectionRationale: 'Kích hoạt khách quen giới thiệu khách mới với chi phí chuyển đổi thấp nhất',
      timelinePattern: [
        { week: 1, title: 'Thiết lập quy chế & Mã QR', focus: 'Tạo mã quét Zalo OA và bảng quy đổi điểm' },
        { week: 2, title: 'Nhân đôi điểm thưởng tuần đầu', focus: 'Gửi tin nhắn ưu đãi đến tệp khách cũ' },
        { week: 3, title: 'Ngày vàng đổi quà tri ân', focus: 'Tổ chức đổi quà giới hạn và chụp ảnh check-in' },
        { week: 4, title: 'Tổng kết tỷ lệ khách quay lại', focus: 'Đo lường tỷ lệ giới thiệu khách mới thành công' }
      ]
    }
  ],

  medium: [
    {
      id: 'medium-koc-spark-ads',
      name: 'KOC Tầm Trung + Spark Ads Chuyển Đổi Kép',
      strategyType: 'Influencer & Performance Hybrid',
      provenCase: 'Chiến dịch TikTok Shop bùng nổ của các thương hiệu mỹ phẩm và F&B trẻ tại VN',
      coreMechanism: 'Hợp tác với 6-8 KOC/Reviewer uy tín (50k-200k followers) tạo video review chân thực, sau đó thương hiệu cấp quyền chạy Spark Ads trực tiếp từ kênh KOC để tối ưu giá lead/đơn.',
      recommendedChannels: ['Meta Ads (Reels & Feed)', 'TikTok Spark Ads', 'KOC Tầm Trung'],
      suggestedBudgetNote: 'Booking KOC (40%) + Ngân sách Paid Ads đa tầng (60%)',
      applicableObjectives: ['sales', 'lead_generation', 'awareness'],
      buyerJourneyStage: 'solution_aware',
      prerequisites: ['Sản phẩm có biên lợi nhuận đủ bù chi phí booking + ads', 'Trang đích đặt hàng hoặc TikTok Shop vận hành trơn tru'],
      requiredResources: {
        effortLevel: 'medium',
        keyResource: 'Kỹ năng booking KOC và tối ưu chiến dịch ads chuyển đổi'
      },
      whenToAvoid: 'Sản phẩm không có hàng sẵn số lượng lớn hoặc quy trình giao vận chậm',
      selectionRationale: 'Kết hợp uy tín KOC và sức mạnh phân phối Spark Ads để scale đơn nhanh chóng',
      timelinePattern: [
        { week: 1, title: 'Booking KOC & Tối ưu phễu đích', focus: 'Chốt 8 KOC, gửi sản phẩm và hoàn thiện trang đích' },
        { week: 2, title: 'Đăng tải video & Test Ads', focus: 'KOC lên video, chạy test 3 tệp đối tượng' },
        { week: 3, title: 'Scale ngân sách video win & Retargeting', focus: 'Dồn 70% ngân sách vào top 3 video tốt nhất' },
        { week: 4, title: 'Tổng kết ROI & Khai thác tệp Lookalike', focus: 'Tối ưu hóa tệp chuyển đổi cho đợt tiếp theo' }
      ]
    },
    {
      id: 'medium-viral-film-activation',
      name: 'Phim Ngắn Viral + Mini O2O Sampling Booth',
      strategyType: 'Emotional Branding & O2O Experience',
      provenCase: 'Chiến dịch video ngắn chạm cảm xúc kết hợp quầy dùng thử tại trường học/văn phòng của Baemin, Vinamilk',
      coreMechanism: 'Sản xuất 1 phim ngắn tình huống hài hước hoặc cảm động đánh trúng tâm lý ngành hàng, kết hợp đặt quầy trải nghiệm mini (Sampling Booth) tại 3 địa điểm đông người.',
      recommendedChannels: ['YouTube Shorts', 'TikTok Ads', 'Mini Activation O2O'],
      suggestedBudgetNote: 'Sản xuất phim ngắn (35%) + Quầy Booth dùng thử (35%) + Phân phối ads (30%)',
      applicableObjectives: ['awareness', 'sales'],
      buyerJourneyStage: 'unaware',
      prerequisites: ['Địa điểm đặt booth được cấp phép', 'Câu chuyện thương hiệu có yếu tố cảm xúc hoặc giải trí cao'],
      requiredResources: {
        effortLevel: 'high',
        keyResource: 'Ê-kíp sản xuất video và nhân sự trực booth sampling'
      },
      whenToAvoid: 'Mục tiêu đòi hỏi chốt đơn chuyển đổi ngay lập tức với ngân sách hạn hẹp',
      selectionRationale: 'Tạo dấu ấn cảm xúc mạnh mẽ và kết nối trực tiếp O2O với người tiêu dùng',
      timelinePattern: [
        { week: 1, title: 'Sản xuất phim & Xin cấp phép Booth', focus: 'Quay dựng phim và chốt 3 điểm đặt quầy trải nghiệm' },
        { week: 2, title: 'Phát sóng video viral & Tạo tò mò', focus: 'Đẩy ads video ngắn và công bố lịch trình sampling' },
        { week: 3, title: 'Triển khai Sampling thực tế', focus: 'Tặng mẫu thử và kích hoạt check-in nhận quà tại quầy' },
        { week: 4, title: 'Kéo chuyển đổi online & Retargeting', focus: 'Gửi voucher qua tin nhắn cho khách đã quét mã tại booth' }
      ]
    },
    {
      id: 'medium-mega-live-sales',
      name: 'Livestream Mega-Sales & Đại Tiệc Săn Deal',
      strategyType: 'Social Commerce & Live Shopping',
      provenCase: 'Các phiên Mega Live triệu view trên TikTok Shop và Shopee Live',
      coreMechanism: 'Tập trung tạo sức bật doanh thu với 2 phiên đại tiệc livestream cùng Host chuyên nghiệp, chuẩn bị bộ combo độc quyền, deal sốc 1k/9k giờ vàng và mã voucher tài trợ.',
      recommendedChannels: ['TikTok Shop Live', 'Shopee Live', 'Quảng cáo Video dẫn vào Live'],
      suggestedBudgetNote: 'Host/MC livestream, voucher trợ giá và quảng cáo đẩy phiên live',
      applicableObjectives: ['sales'],
      buyerJourneyStage: 'decision',
      prerequisites: ['Tồn kho sẵn sàng tối thiểu 500-1000 sản phẩm', 'Hệ thống vận hành xử lý đơn hàng trong 24h'],
      requiredResources: {
        effortLevel: 'high',
        keyResource: 'Host livestream chuyên nghiệp và đội ngũ đóng gói'
      },
      whenToAvoid: 'Sản phẩm đặt làm theo yêu cầu (custom) hoặc sản phẩm kỹ thuật cần tư vấn 1-1 lâu',
      selectionRationale: 'Tập trung bùng nổ doanh số trong các khung giờ cao điểm với hiệu ứng đám đông',
      timelinePattern: [
        { week: 1, title: 'Setup kịch bản live & Chuẩn bị kho hàng', focus: 'Lên danh mục deal độc quyền và chốt Host' },
        { week: 2, title: 'Teasing & Gom tương tác', focus: 'Đăng tải 10 video hé lộ deal sốc để khách đặt lịch live' },
        { week: 3, title: 'Bùng nổ 2 phiên Mega Live', focus: 'Tổ chức phiên live 4-6 tiếng bùng nổ đơn hàng' },
        { week: 4, title: 'Chăm sóc sau live & Livestream xả kho', focus: 'Xác nhận đơn, chống hủy đơn và live phụ tri ân' }
      ]
    },
    {
      id: 'medium-trade-in-upgrade',
      name: 'Thử Thách Đổi Cũ Lấy Mới (Trade-in & Upgrade)',
      strategyType: 'Customer Acquisition Promotion',
      provenCase: 'Chiến dịch đổi đồ cũ lấy voucher ưu đãi sản phẩm mới của các hãng thời trang, tiêu dùng',
      coreMechanism: 'Kêu gọi khách hàng mang sản phẩm cũ hoặc bao bì đối thủ đến đổi lấy ưu đãi giảm 30-40% cho sản phẩm mới, phá vỡ rào cản do dự và kéo lượng lớn khách dùng thử.',
      recommendedChannels: ['Facebook Ads', 'Điểm chạm bán lẻ / Đại lý', 'TikTok Seeding'],
      suggestedBudgetNote: 'Chi phí trợ giá đổi mới, truyền thông ads và POSM điểm đổi',
      applicableObjectives: ['sales', 'retention'],
      buyerJourneyStage: 'problem_aware',
      prerequisites: ['Điểm tiếp nhận thu đổi hoặc đối tác giao nhận hỗ trợ đổi tận nơi', 'Kế hoạch xử lý hoặc tái chế sản phẩm cũ'],
      requiredResources: {
        effortLevel: 'medium',
        keyResource: 'Quy trình thẩm định sản phẩm cũ và in ấn POSM'
      },
      whenToAvoid: 'Sản phẩm dịch vụ vô hình hoặc phần mềm không có vật phẩm hữu hình để thu đổi',
      selectionRationale: 'Phá vỡ rào cản chi phí và tâm lý tiếc đồ cũ để thúc đẩy khách hàng nâng cấp mới',
      timelinePattern: [
        { week: 1, title: 'Công bố thể lệ đổi cũ lấy mới', focus: 'Lên thể lệ minh bạch và chuẩn bị điểm thu đổi' },
        { week: 2, title: 'Khai mở tuần lễ vàng thu đổi', focus: 'Đẩy ads phủ rộng và đón khách đợt 1' },
        { week: 3, title: 'Lan tỏa hình ảnh khách đổi thành công', focus: 'Đăng clip phản hồi của khách hàng vừa nhận đồ mới' },
        { week: 4, title: 'Tổng kết số lượng & Tái chế/CSR', focus: 'Công bố tổng lượng thu đổi và tri ân khách hàng' }
      ]
    },
    {
      id: 'medium-lead-funnel-auto',
      name: 'Phễu Chuyển Đổi Lead & Tự Động Hóa Chăm Sóc Zalo/Email',
      strategyType: 'Inbound Funnel & Marketing Automation',
      provenCase: 'Hệ thống phễu thu thập thông tin và nuôi dưỡng lead tự động ngành dịch vụ/giáo dục/bất động sản',
      coreMechanism: 'Chạy quảng cáo tặng tài liệu/khóa học/mẫu thử miễn phí để thu thập số điện thoại/email, sau đó kích hoạt kịch bản chatbot Zalo/Email nuôi dưỡng tự động để chuyển đổi mua hàng.',
      recommendedChannels: ['Meta Lead Ads', 'Zalo ZNS / Chatbot', 'Landing Page chuyển đổi'],
      suggestedBudgetNote: 'Chi phí quảng cáo tìm lead và phí vận hành phần mềm CRM/ZNS',
      applicableObjectives: ['lead_generation', 'sales'],
      buyerJourneyStage: 'problem_aware',
      prerequisites: ['Có tài liệu/quà tặng giá trị cao (Lead Magnet)', 'Có đội ngũ tư vấn/tele-sales bám sát liên hệ trong 15 phút'],
      requiredResources: {
        effortLevel: 'medium',
        keyResource: 'Thiết lập phễu Landing page và kịch bản chatbot tự động'
      },
      whenToAvoid: 'Sản phẩm FMCG tiêu dùng nhanh giá dưới 100k mua ngẫu hứng không cần tư vấn',
      selectionRationale: 'Tự động hóa hành trình nuôi dưỡng lead chất lượng cao cho các dịch vụ giá trị',
      timelinePattern: [
        { week: 1, title: 'Xây dựng quà tặng Lead Magnet & Landing Page', focus: 'Tạo tài liệu/quà hút và form đăng ký' },
        { week: 2, title: 'Kích hoạt chiến dịch Lead Ads', focus: 'Chạy ads thu thập 300-500 liên hệ khách tiềm năng' },
        { week: 3, title: 'Gửi chuỗi tin nhắn nuôi dưỡng tự động', focus: 'Chatbot tự động gửi giá trị và voucher độc quyền' },
        { week: 4, title: 'Tele-sales & Chốt deal đặc quyền', focus: 'Tư vấn trực tiếp cho khách hàng quan tâm cao' }
      ]
    }
  ],

  high: [
    {
      id: 'high-brand-ambassador-hero',
      name: 'Chiến Dịch Đại Sứ Thương Hiệu & Multi-Channel Hero Campaign',
      strategyType: 'Hero Brand Campaign & Mass Awareness',
      provenCase: 'Chiến dịch Đi Để Trở Về (Biti\'s Hunter) hoặc Nâng niu bàn chân Việt',
      coreMechanism: 'Ký kết cùng 1 KOL/Celeb uy tín có chỉ số cảm xúc cao làm đại sứ, quay MV/TVC thông điệp truyền cảm hứng, phủ sóng Billboard LED ngoài trời kết hợp Digital Ads toàn diện.',
      recommendedChannels: ['KOL / Celeb đại sứ', 'Billboard LED ngoài trời (OOH)', 'YouTube Masthead / Meta / TikTok'],
      suggestedBudgetNote: 'Hợp đồng đại sứ (40%) + Sản xuất TVC/Key Visual (30%) + Media Booking (30%)',
      applicableObjectives: ['awareness', 'sales'],
      buyerJourneyStage: 'unaware',
      prerequisites: ['Hình ảnh thương hiệu rõ ràng, pháp lý sản phẩm hoàn chỉnh', 'Mạng lưới phân phối toàn quốc đủ phủ sóng'],
      requiredResources: {
        effortLevel: 'high',
        keyResource: 'Quản lý hợp đồng đại sứ, Agency sản xuất và media booking'
      },
      whenToAvoid: 'Sản phẩm ngách phục vụ nhóm người tiêu dùng cực nhỏ, không có tính đại chúng',
      selectionRationale: 'Nâng tầm đẳng cấp thương hiệu và phủ sóng nhận diện trên quy mô triệu người',
      timelinePattern: [
        { week: 1, title: 'Teasing hình bóng đại sứ bí ẩn', focus: 'Tung poster bí ẩn tạo thảo luận trên mạng xã hội' },
        { week: 2, title: 'Họp báo ra mắt & Phát sóng TVC chính thức', focus: 'Ra mắt TVC, đồng loạt lên sóng Billboard và Digital' },
        { week: 3, title: 'Lan tỏa thảo luận & PR báo chí', focus: 'Hơn 20 bài báo chí phân tích và KOC đồng loạt review' },
        { week: 4, title: 'Chiến dịch bán hàng ăn theo thông điệp', focus: 'Tung bộ sưu tập đặc biệt mang chữ ký đại sứ' }
      ]
    },
    {
      id: 'high-interactive-popup-experience',
      name: 'Không Gian Trải Nghiệm Thực Tế (Interactive Pop-up Store)',
      strategyType: 'Experiential Marketing & O2O Immersion',
      provenCase: 'Pop-up trải nghiệm của Samsung, Shopee, Highlands tại các trung tâm thương mại lớn',
      coreMechanism: 'Dựng một gian hàng Pop-up store ấn tượng tại trung tâm thương mại cao cấp với các góc check-in nghệ thuật, photobooth lấy liền và minigame tương tác AR/VR để hàng ngàn người tham gia.',
      recommendedChannels: ['Pop-up Store tại TTTM', 'PR Báo chí & KOC Check-in', 'TikTok Ads Geotargeting'],
      suggestedBudgetNote: 'Thuê mặt bằng TTTM, thiết kế thi công booth, quà tặng và chi phí KOC',
      applicableObjectives: ['awareness', 'sales'],
      buyerJourneyStage: 'solution_aware',
      prerequisites: ['Mặt bằng TTTM đắc địa (Takashimaya, Vincom, Lotte)', 'Thiết kế không gian photobooth độc đáo, visual bắt mắt'],
      requiredResources: {
        effortLevel: 'high',
        keyResource: 'Thi công kiến trúc booth và đội ngũ PG/PB vận hành sự kiện'
      },
      whenToAvoid: 'Sản phẩm thuần B2B chuyên dụng hoặc chỉ bán cho doanh nghiệp',
      selectionRationale: 'Mang lại trải nghiệm xúc giác chân thực, kích thích hàng ngàn lượt check-in tự nhiên',
      timelinePattern: [
        { week: 1, title: 'Thi công booth & Teasing vé mời', focus: 'Hoàn thiện không gian trải nghiệm và gửi vé VIP cho KOC' },
        { week: 2, title: 'Khai trương Pop-up Store (Opening Day)', focus: 'Sự kiện khai trương với 20 KOC check-in bùng nổ mạng' },
        { week: 3, title: 'Đón tiếp công chúng & Minigame tương tác', focus: 'Hàng ngàn lượt khách vào trải nghiệm và check-in nhận quà' },
        { week: 4, title: 'Closing Event & Chuyển đổi tệp khách', focus: 'Đêm nhạc acoustic bế mạc và chuyển đổi khách mua online' }
      ]
    },
    {
      id: 'high-mega-live-festival',
      name: 'Đại Nhạc Hội Mua Sắm & Chuỗi Live Đa Nền Tảng Cùng Top KOC',
      strategyType: 'Mega Livestream Festival',
      provenCase: 'Đại tiệc sinh nhật Lazada, Shopee 11.11, TikTok Shop Creator Fest',
      coreMechanism: 'Tổ chức chuỗi 4 tuần bán hàng kết hợp giải trí (Shoppertainment) với sự góp mặt của các Top Streamer và ca sĩ khách mời, tung hàng chục ngàn deal độc quyền tạo kỷ lục doanh thu.',
      recommendedChannels: ['Top KOC Livestream', 'TikTok Shop / Shopee / Facebook Live', 'Digital Ads Đẩy Traffic'],
      suggestedBudgetNote: 'Booking Top Streamer/Nghệ sĩ, trợ giá quà tặng và quảng cáo livestream',
      applicableObjectives: ['sales', 'awareness'],
      buyerJourneyStage: 'decision',
      prerequisites: ['Chuỗi cung ứng đáp ứng được hàng chục ngàn đơn hàng', 'Thỏa thuận độc quyền deal với sàn thương mại điện tử'],
      requiredResources: {
        effortLevel: 'high',
        keyResource: 'Top Creator/KOL livestream và kỹ thuật phát sóng đa kênh'
      },
      whenToAvoid: 'Ngành hàng hạn chế quảng cáo hoặc không được phép bán trên sàn livestream',
      selectionRationale: 'Tạo đỉnh doanh thu kỷ lục và mở rộng tệp khách hàng trẻ trên toàn quốc',
      timelinePattern: [
        { week: 1, title: 'Công bố sự kiện & Mở đăng ký voucher sớm', focus: 'Tung teaser dàn line-up nghệ sĩ và deal khủng' },
        { week: 2, title: 'Warm-up Live 1: Săn deal khởi động', focus: 'Phiên live mở màn cùng KOC phân khúc tầm trung' },
        { week: 3, title: 'Đêm đại tiệc Super Live: Bùng nổ kỷ lục', focus: 'Phiên live 8 tiếng cùng Top Streamer và quà tặng độc bản' },
        { week: 4, title: 'Hậu tiệc tri ân & Giao hàng siêu tốc', focus: 'Đẩy mạnh truyền thông về kỷ lục đơn hàng và CSKH' }
      ]
    },
    {
      id: 'high-csr-brand-purpose',
      name: 'Chiến Dịch Ý Nghĩa Xã Hội Gắn Liền Thương Hiệu (Brand Purpose CSR)',
      strategyType: 'Cause-Related Marketing & Community Value',
      provenCase: 'Chiến dịch "Cùng em đến trường" hoặc quỹ trồng rừng của các thương hiệu tiêu dùng lớn',
      coreMechanism: 'Cam kết trích một phần doanh thu mỗi sản phẩm bán ra để đóng góp vào dự án cộng đồng ý nghĩa, tạo động lực mua hàng từ trái tim và nâng tầm định vị thương hiệu bền vững.',
      recommendedChannels: ['Báo chí chính thống (VnExpress, Tuổi Trẻ...)', 'Phim tài liệu ngắn (Docu-film)', 'Social Media'],
      suggestedBudgetNote: 'Quỹ tài trợ cộng đồng, sản xuất phim tư liệu và truyền thông báo chí',
      applicableObjectives: ['awareness', 'retention'],
      buyerJourneyStage: 'unaware',
      prerequisites: ['Đối tác tổ chức xã hội uy tín, minh bạch tài chính', 'Cam kết trích quỹ thật và báo cáo kiểm toán rõ ràng'],
      requiredResources: {
        effortLevel: 'medium',
        keyResource: 'Quan hệ báo chí truyền thông và điều phối hoạt động thiện nguyện'
      },
      whenToAvoid: 'Mục tiêu thuần túy chạy số ngắn hạn trong 1 tuần',
      selectionRationale: 'Gắn kết tình cảm sâu đậm, xây dựng tình yêu thương hiệu (Brand Love) bền vững',
      timelinePattern: [
        { week: 1, title: 'Công bố cam kết xã hội & Đối tác từ thiện', focus: 'Họp báo ký kết với tổ chức xã hội uy tín' },
        { week: 2, title: 'Phát sóng phim tài liệu câu chuyện nhân văn', focus: 'Video ngắn truyền cảm hứng lan tỏa trên mạng xã hội' },
        { week: 3, title: 'Tháng hành động: Mỗi đơn hàng là một đóng góp', focus: 'Khách hàng mua sản phẩm nhận huy hiệu đại sứ nhân ái' },
        { week: 4, title: 'Lễ bàn giao công trình & Tổng kết báo cáo', focus: 'Báo cáo minh bạch quỹ và truyền thông thành quả cộng đồng' }
      ]
    },
    {
      id: 'high-limited-co-branding',
      name: 'Chiến Dịch Hợp Tác Thương Hiệu Độc Bản (Limited Edition Co-Branding)',
      strategyType: 'Strategic Brand Alliances',
      provenCase: 'Màn kết hợp giữa Biti\'s x VietMax, Highlands x Grab, Phê La x các nghệ sĩ đồ họa',
      coreMechanism: 'Bắt tay với một thương hiệu hoặc nghệ nhân nổi tiếng cùng ra mắt một bộ sưu tập sản phẩm phiên bản giới hạn (chỉ sản xuất 1000-2000 bản), tạo cơn sốt khan hiếm và săn lùng.',
      recommendedChannels: ['PR Báo chí nghệ thuật & Phong cách sống', 'Mạng xã hội 2 thương hiệu', 'Triển lãm ra mắt VIP'],
      suggestedBudgetNote: 'Chi phí thiết kế độc quyền, sản xuất bao bì giới hạn và tiệc ra mắt VIP',
      applicableObjectives: ['awareness', 'sales'],
      buyerJourneyStage: 'decision',
      prerequisites: ['Đối tác đồng thương hiệu có cùng giá trị và phân khúc', 'Khả năng sản xuất bao bì và ấn phẩm giới hạn chất lượng cao'],
      requiredResources: {
        effortLevel: 'high',
        keyResource: 'Đàm phán hợp đồng thương hiệu kép và phân phối độc quyền'
      },
      whenToAvoid: 'Sản phẩm phổ thông đại trà không có điểm nhấn thẩm mỹ hoặc câu chuyện phong cách sống',
      selectionRationale: 'Tạo cơn sốt khan hiếm, thúc đẩy khách hàng sưu tầm và truyền thông tự nhiên',
      timelinePattern: [
        { week: 1, title: 'Hé lộ màn bắt tay lịch sử', focus: 'Đăng poster úp mở sự kết hợp giữa 2 thương hiệu' },
        { week: 2, title: 'Mở bán sớm giới hạn cho hội viên VIP (Pre-order)', focus: 'Cháy hàng đợt 1 chỉ sau vài giờ mở bán' },
        { week: 3, title: 'Mở bán chính thức & Trưng bày nghệ thuật', focus: 'Truyền thông bùng nổ, giới trẻ xếp hàng trải nghiệm' },
        { week: 4, title: 'Tổng kết sold-out & Nâng tầm thương hiệu', focus: 'Thông báo hết hàng và tôn vinh giá trị sáng tạo' }
      ]
    }
  ]
};

/**
 * Phát hiện loại mục tiêu chính từ chuỗi mục tiêu người dùng
 */
function normalizeObjectiveType(objective: string): 'sales' | 'lead_generation' | 'retention' | 'awareness' {
  const text = (objective || '').toLowerCase();
  if (/đơn|doanh số|doanh thu|bán|chốt|sales/i.test(text)) return 'sales';
  if (/lead|tiềm năng|tư vấn|đăng ký|inbox|form|thông tin/i.test(text)) return 'lead_generation';
  if (/khách cũ|quay lại|mua lại|trung thành|retention|chăm sóc/i.test(text)) return 'retention';
  return 'awareness';
}

/**
 * Chọn ra đúng 05 Playbook tối ưu nhất theo tình huống kinh doanh thực tế (Mục 4)
 */
export function selectPlaybooksForContext(input: CampaignInput): MarketingPlaybook[] {
  const budget = input.budgetLevel || 'medium';
  const pool = MARKETING_PLAYBOOKS[budget] || MARKETING_PLAYBOOKS.medium;
  const targetObjective = normalizeObjectiveType(input.objective);

  const contextText = [
    input.objective || '',
    input.availableResources || '',
    input.additionalNotes || '',
    input.targetAudiencePrompt || ''
  ].join(' ').toLowerCase();

  // Kiểm tra tín hiệu: người dùng mới mở, chưa có khách cũ
  const hasNoExistingCustomers = /chưa có khách|không có khách|cửa hàng mới|thương hiệu mới|chưa có tệp|người mới/i.test(contextText);
  // Kiểm tra tín hiệu: người làm một mình, solo
  const isSoloOrSmallTeam = /1 người|một mình|solo|1 nhân sự|ít người|tự làm/i.test(contextText);

  // Chấm điểm từng Playbook
  const scored = pool.map((playbook) => {
    let score = 50;

    // 1. Phù hợp mục tiêu chính
    if (playbook.applicableObjectives.includes(targetObjective)) {
      score += 35;
    }

    // 2. Kiểm tra điều kiện tiên quyết (Prerequisites)
    if (hasNoExistingCustomers && playbook.id.includes('referral')) {
      score -= 50; // Phạt nặng mô hình giới thiệu bạn bè khi chưa có khách quen
    }

    // 3. Phù hợp nguồn lực
    if (isSoloOrSmallTeam) {
      if (playbook.requiredResources.effortLevel === 'low') score += 15;
      if (playbook.requiredResources.effortLevel === 'high') score -= 20;
    }

    // 4. Khớp kênh hiện có của người dùng
    if (input.existingChannels && Array.isArray(input.existingChannels)) {
      const matched = input.existingChannels.filter((c) =>
        playbook.recommendedChannels.some((rc) => rc.toLowerCase().includes(c.toLowerCase()))
      ).length;
      score += matched * 8;
    }

    return { playbook, score };
  });

  // Sắp xếp điểm giảm dần
  scored.sort((a, b) => b.score - a.score);

  // Chọn 5 playbook đảm bảo đa dạng hóa chiến lược (unique strategyType)
  const selected: MarketingPlaybook[] = [];
  const usedStrategies = new Set<string>();

  for (const item of scored) {
    if (!usedStrategies.has(item.playbook.strategyType)) {
      selected.push(item.playbook);
      usedStrategies.add(item.playbook.strategyType);
    }
    if (selected.length === 5) break;
  }

  // Nếu chưa đủ 5 do trùng strategyType, điền nốt các playbook điểm cao còn lại
  if (selected.length < 5) {
    for (const item of scored) {
      if (!selected.some((p) => p.id === item.playbook.id)) {
        selected.push(item.playbook);
      }
      if (selected.length === 5) break;
    }
  }

  return selected;
}

export function getPlaybooksForBudget(budgetLevel: 'low' | 'medium' | 'high'): MarketingPlaybook[] {
  return MARKETING_PLAYBOOKS[budgetLevel] || MARKETING_PLAYBOOKS.medium;
}

export function formatPlaybooksForPrompt(playbooks: MarketingPlaybook[]): string {
  return playbooks
    .map((p, idx) => {
      const timelineStr = p.timelinePattern
        .map((t) => `Tuần ${t.week} (${t.title}): ${t.focus}`)
        .join(' | ');

      const prereqStr = p.prerequisites.length > 0 ? p.prerequisites.join('; ') : 'Không có yêu cầu đặc biệt';

      return `[MÔ HÌNH THỰC CHIẾN ${idx + 1}]: ${p.name}
- Thể loại: ${p.strategyType}
- Case study thực tế tại VN: ${p.provenCase}
- Cơ chế vận hành: ${p.coreMechanism}
- Kênh đề xuất: ${p.recommendedChannels.join(', ')}
- Gợi ý phân bổ chi phí: ${p.suggestedBudgetNote}
- Khung timeline 4 tuần: ${timelineStr}
- Điều kiện tiên quyết: ${prereqStr}
- Trường hợp nên tránh: ${p.whenToAvoid}
- Căn cứ phù hợp: ${p.selectionRationale}`;
    })
    .join('\n\n');
}
