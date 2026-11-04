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
      timelinePattern: [
        { week: 1, title: 'Nghiên cứu nỗi đau & Lên kịch bản', focus: 'Xác định 15 chủ đề khách hàng hay hỏi nhất' },
        { week: 2, title: 'Sản xuất & Đăng tải hàng ngày', focus: 'Đăng đều 1 video/ngày vào khung giờ vàng' },
        { week: 3, title: 'Nhân bản video viral & Livestream Q&A', focus: 'Live trả lời thắc mắc trực tiếp' },
        { week: 4, title: 'Thu phễu khách hàng & Kêu gọi mua', focus: 'Gắn link bio nhận tư vấn và ưu đãi' }
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
      timelinePattern: [
        { week: 1, title: 'Hé lộ màn bắt tay lịch sử', focus: 'Đăng poster úp mở sự kết hợp giữa 2 thương hiệu' },
        { week: 2, title: 'Mở bán sớm giới hạn cho hội viên VIP (Pre-order)', focus: 'Cháy hàng đợt 1 chỉ sau vài giờ mở bán' },
        { week: 3, title: 'Mở bán chính thức & Trưng bày nghệ thuật', focus: 'Truyền thông bùng nổ, giới trẻ xếp hàng trải nghiệm' },
        { week: 4, title: 'Tổng kết sold-out & Nâng tầm thương hiệu', focus: 'Thông báo hết hàng và tôn vinh giá trị sáng tạo' }
      ]
    }
  ]
};

export function getPlaybooksForBudget(budgetLevel: 'low' | 'medium' | 'high'): MarketingPlaybook[] {
  return MARKETING_PLAYBOOKS[budgetLevel] || MARKETING_PLAYBOOKS.medium;
}

export function formatPlaybooksForPrompt(playbooks: MarketingPlaybook[]): string {
  return playbooks
    .map((p, idx) => {
      const timelineStr = p.timelinePattern
        .map((t) => `Tuần ${t.week} (${t.title}): ${t.focus}`)
        .join(' | ');

      return `[MÔ HÌNH THỰC CHIẾN ${idx + 1}]: ${p.name}
- Thể loại: ${p.strategyType}
- Case study thực tế tại VN: ${p.provenCase}
- Cơ chế vận hành: ${p.coreMechanism}
- Kênh đề xuất: ${p.recommendedChannels.join(', ')}
- Gợi ý phân bổ chi phí: ${p.suggestedBudgetNote}
- Khung timeline 4 tuần: ${timelineStr}`;
    })
    .join('\n\n');
}

