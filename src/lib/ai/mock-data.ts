import type { CampaignInput, MarketingIdea } from '@/types/marketing';
import { BUDGET_CONFIGS } from '../config/budget';
import { attachVerificationEvidence } from '../evidence-generator';

/**
 * Sinh dữ liệu mẫu dự phòng chất lượng cao khi xảy ra sự cố hạ tầng AI (429, timeout, mất mạng)
 * Đảm bảo 100% tuân thủ yêu cầu đề bài: đủ 5 ý tưởng, mỗi ý tưởng đủ 4 tuần, đúng ngân sách
 */
export function getFallbackMarketingIdeas(input: CampaignInput): MarketingIdea[] {
  const { industry, productName, budgetLevel, objective } = input;
  const config = BUDGET_CONFIGS[budgetLevel];
  let rawIdeas: MarketingIdea[] = [];

  if (budgetLevel === 'low') {
    rawIdeas = [
      {
        id: crypto.randomUUID(),
        title: `Thử Thách UGC: Bật Năng Lượng Cùng ${productName}`,
        tagline: `Tự tin khoe chất riêng – Rinh trọn bộ quà ${productName}`,
        channels: ['TikTok Organic', 'Facebook Group Seeding', 'Instagram Reels'],
        mainContent: `Tổ chức cuộc thi tạo video ngắn (UGC) trên TikTok và CapCut template đơn giản. Kêu gọi khách hàng chia sẻ trải nghiệm thực tế với ${productName} kèm hashtag thương hiệu. Tận dụng seeding trong 15 hội nhóm ${industry} lớn để tạo hiệu ứng truyền miệng lan tỏa không tốn tiền ads.`,
        estimatedBudget: '8.500.000 VNĐ (Quà tặng & Chi phí minigame)',
        targetAudience: 'Giới trẻ Gen Z và Millennials yêu thích sáng tạo nội dung và săn quà độc lạ',
        timeline: [
          {
            week: 1,
            title: 'Khởi động & Teasing thể lệ',
            activities: [
              'Thiết kế visual thể lệ và công bố mini-contest trên fanpage',
              'Gửi sản phẩm dùng thử cho 10 bạn reviewer/micro-creator barter đổi video',
              'Đăng bài teaser trên 5 group cộng đồng liên quan'
            ]
          },
          {
            week: 2,
            title: 'Bùng nổ làn sóng tham gia',
            activities: [
              'Đẩy mạnh seeding các video dự thi nổi bật vào hội nhóm',
              'Tổ chức mini-game phụ: Dự đoán số lượt chia sẻ nhận quà liền tay',
              'Đăng tải video mẫu từ founder/team trải nghiệm sản phẩm'
            ]
          },
          {
            week: 3,
            title: 'Bình chọn & Khuấy động tương tác',
            activities: [
              'Mở cổng bình chọn Top 10 bài dự thi xuất sắc nhất',
              'Kêu gọi thí sinh kêu gọi bạn bè tương tác và lan tỏa',
              'Livestream giao lưu ngắn chia sẻ mẹo sử dụng sản phẩm'
            ]
          },
          {
            week: 4,
            title: 'Công bố giải thưởng & Tri ân',
            activities: [
              'Livestream công bố người chiến thắng và trao giải',
              'Tặng mã voucher giảm giá 15% độc quyền cho toàn bộ người tham gia',
              'Tổng kết các nội dung UGC hay nhất thành video recap thương hiệu'
            ]
          }
        ]
      },
      {
        id: crypto.randomUUID(),
        title: `Hành Trình Khách Hàng: 7 Ngày Trải Nghiệm ${productName}`,
        tagline: `Trải nghiệm thật, cảm xúc thật cùng ${productName}`,
        channels: ['Facebook Group Seeding', 'Email Marketing', 'Zalo OA'],
        mainContent: `Tuyển chọn 50 khách hàng trải nghiệm sản phẩm trong 7 ngày với điều kiện ghi nhật ký cảm nhận hàng ngày trên mạng xã hội cá nhân. Tạo cộng đồng kín trên Zalo/Facebook để chăm sóc và thúc đẩy họ trở thành đại sứ thương hiệu tự nhiên.`,
        estimatedBudget: '6.000.000 VNĐ (Sản phẩm mẫu & Voucher tri ân)',
        targetAudience: 'Khách hàng có nhu cầu thực tế và quan tâm sâu đến chất lượng ngành hàng',
        timeline: [
          {
            week: 1,
            title: 'Chiêu mộ biệt đội trải nghiệm',
            activities: [
              'Mở đơn đăng ký tham gia thử thách 7 ngày trải nghiệm',
              'Sàng lọc danh sách 50 người dùng phù hợp và gửi gói quà trải nghiệm',
              'Thành lập group Zalo hỗ trợ và hướng dẫn lộ trình'
            ]
          },
          {
            week: 2,
            title: 'Nhật ký trải nghiệm 7 ngày',
            activities: [
              'Người tham gia check-in và đăng bài review mỗi ngày',
              'Đội ngũ chăm sóc giải đáp thắc mắc và tương tác nhiệt tình dưới bài viết',
              'Thu thập phản hồi sơ bộ sau 3 ngày đầu tiên'
            ]
          },
          {
            week: 3,
            title: 'Thu hoạch feedback & Lan tỏa review',
            activities: [
              'Tổng hợp các bài đánh giá chất lượng nhất thành album ảnh uy tín',
              'Đăng tải các câu chuyện khách hàng chân thực lên các kênh truyền thông',
              'Tặng voucher tri ân độc quyền cho người tham gia tích cực'
            ]
          },
          {
            week: 4,
            title: 'Chuyển đổi mua lại & Giới thiệu',
            activities: [
              'Kích hoạt chương trình "Giới thiệu bạn bè nhận quà đôi"',
              'Gửi email cá nhân hóa cảm ơn và ưu đãi mua hàng lần sau',
              'Đo lường tỷ lệ chuyển đổi đơn hàng từ người quen của người trải nghiệm'
            ]
          }
        ]
      },
      {
        id: crypto.randomUUID(),
        title: `Chiến Dịch Đối Tác Tương Hỗ: Cộng Hưởng Cùng Lớn Mạnh`,
        tagline: `Một chạm nhận đôi giá trị cùng ${productName}`,
        channels: ['Hợp tác chéo (Cross-promo)', 'Instagram Stories', 'POSM tại điểm bán đối tác'],
        mainContent: `Liên kết với 2-3 thương hiệu phi cạnh tranh trong cùng phân khúc khách hàng (ví dụ quán cafe, tiệm hoa, local brand) để đồng tổ chức chương trình mua 1 nhận ưu đãi chéo. Tận dụng tệp khách hàng sẵn có của đối tác mà không mất chi phí quảng cáo.`,
        estimatedBudget: '7.000.000 VNĐ (In ấn standee/voucher & Hàng mẫu đối tác)',
        targetAudience: 'Tệp khách hàng dùng dịch vụ của đối tác có cùng phong cách sống',
        timeline: [
          {
            week: 1,
            title: 'Đàm phán & Ký kết hợp tác chéo',
            activities: [
              'Tiếp cận và thống nhất cơ chế hợp tác quà tặng với 2 thương hiệu bạn',
              'Thiết kế voucher liên kết và ấn phẩm truyền thông chung',
              'Chuẩn bị hàng mẫu đặt tại quầy của đối tác'
            ]
          },
          {
            week: 2,
            title: 'Ra mắt chương trình ưu đãi kép',
            activities: [
              'Cả 2 thương hiệu đồng loạt đăng bài giới thiệu hợp tác trên mạng xã hội',
              'Triển khai đặt standee/quà tặng tại cửa hàng của đối tác',
              'Tặng thiệp ưu đãi kèm theo mỗi đơn hàng bán ra'
            ]
          },
          {
            week: 3,
            title: 'Tăng nhiệt bằng minigame liên kết',
            activities: [
              'Tổ chức minigame chung trên Instagram: Tag bạn thân nhận combo 2 thương hiệu',
              'Theo dõi tỷ lệ đổi voucher giữa 2 bên',
              'Nhắc nhở hạn sử dụng voucher cho khách hàng'
            ]
          },
          {
            week: 4,
            title: 'Tổng kết & Mở rộng liên minh',
            activities: [
              'Tổng kết số lượng khách hàng mới thu hút từ đối tác',
              'Khảo sát độ hài lòng của khách hàng đổi mã ưu đãi',
              'Lên kế hoạch duy trì quan hệ hợp tác dài hạn với đối tác hiệu quả'
            ]
          }
        ]
      },
      {
        id: crypto.randomUUID(),
        title: `Chiến Dịch Content Chuyên Gia: Mẹo Hay Ngành ${industry}`,
        tagline: `Bí quyết chuẩn chuyên gia – Đã có ${productName} lo`,
        channels: ['TikTok Giáo dục/Tips', 'Facebook Reels', 'Blog/Infographic'],
        mainContent: `Sản xuất chuỗi 15 video ngắn dạng chia sẻ kiến thức, mẹo vặt hữu ích giải quyết trực tiếp nỗi đau của khách hàng trong ngành ${industry}. Khéo léo lồng ghép ${productName} như một giải pháp tối ưu và tiện lợi nhất.`,
        estimatedBudget: '5.000.000 VNĐ (Đạo cụ quay dựng & micro thu âm)',
        targetAudience: 'Người tiêu dùng đang tìm kiếm giải pháp thực tế và thông tin hữu ích',
        timeline: [
          {
            week: 1,
            title: 'Nghiên cứu chủ đề & Lên kịch bản',
            activities: [
              'Tổng hợp 15 câu hỏi và vấn đề khách hàng hay hỏi nhất',
              'Viết kịch bản ngắn theo công thức Hook - Story - Solution',
              'Chuẩn bị thiết bị và set bối cảnh quay tối giản'
            ]
          },
          {
            week: 2,
            title: 'Sản xuất & Đăng tải hàng ngày',
            activities: [
              'Đăng đều đặn 1 video tips/ngày vào khung giờ vàng (11h30 và 19h30)',
              'Tích cực trả lời mọi bình luận để tăng điểm tương tác thuật toán',
              'Ghim video giải thích chi tiết về sản phẩm lên đầu trang'
            ]
          },
          {
            week: 3,
            title: 'Nhân bản nội dung win & Livestream Q&A',
            activities: [
              'Phân tích 3 video có lượt xem cao nhất để làm video phần tiếp theo',
              'Tổ chức 1 buổi livestream 45 phút tư vấn trực tiếp cho người xem',
              'Chia sẻ cẩm nang PDF tổng hợp mẹo hay cho khách để lại email'
            ]
          },
          {
            week: 4,
            title: 'Thu phễu & Kêu gọi hành động',
            activities: [
              'Thêm link bio nhận tư vấn miễn phí kèm quà tặng nhỏ',
              'Gửi tin nhắn chăm sóc khách đã tương tác trong tháng',
              'Đánh giá lượng người theo dõi mới và chuyển đổi ra đơn'
            ]
          }
        ]
      },
      {
        id: crypto.randomUUID(),
        title: `Săn Điểm Thưởng: Khách Hàng Trung Thành Cùng ${productName}`,
        tagline: `Tích điểm liền tay – Nhận quà mê say cùng ${productName}`,
        channels: ['Zalo Mini App / OA', 'Thẻ tích điểm điện tử', 'Truyền thông tại điểm chạm'],
        mainContent: `Thiết lập chương trình tích điểm đổi quà đơn giản thông qua Zalo OA hoặc thẻ tích điểm kỹ thuật số. Thúc đẩy khách hàng cũ quay lại mua sắm thường xuyên và truyền miệng cho người quen.`,
        estimatedBudget: '5.500.000 VNĐ (Thiết kế quà tặng & chi phí triển khai)',
        targetAudience: 'Khách hàng hiện hữu và người dùng có thói quen mua sắm định kỳ',
        timeline: [
          {
            week: 1,
            title: 'Thiết lập quy chế & Công cụ tích điểm',
            activities: [
              'Hoàn thiện bảng quy đổi điểm thưởng và các mốc quà hấp dẫn',
              'Tạo mã QR Zalo OA tích điểm tiện lợi đặt tại các điểm tiếp xúc',
              'Đào tạo đội ngũ nắm rõ cách hướng dẫn khách quét mã'
            ]
          },
          {
            week: 2,
            title: 'Khai xuân điểm thưởng – Nhân đôi điểm lần đầu',
            activities: [
              'Triển khai ưu đãi nhân đôi điểm thưởng cho khách hàng tham gia tuần đầu',
              'Gửi tin nhắn thông báo ưu đãi đến toàn bộ danh bạ khách cũ',
              'Đăng bài giới thiệu danh mục quà tặng hấp dẫn có thể đổi'
            ]
          },
          {
            week: 3,
            title: 'Ngày hội đổi quà siêu tốc',
            activities: [
              'Tổ chức "Ngày vàng đổi quà" với các phần quà giới hạn đặc biệt',
              'Chia sẻ hình ảnh những khách hàng đầu tiên nhận quà thành công',
              'Kêu gọi khách chia sẻ trải nghiệm nhận quà để nhận thêm điểm thưởng'
            ]
          },
          {
            week: 4,
            title: 'Báo cáo hiệu quả & Duy trì chu kỳ',
            activities: [
              'Thống kê số lượng thành viên mới và tần suất quay lại mua hàng',
              'Gửi thông báo nhắc nhở số điểm hiện có của từng khách hàng',
              'Cập nhật thêm các phần quà mới hấp dẫn cho tháng tiếp theo'
            ]
          }
        ]
      }
    ];
  } else if (budgetLevel === 'medium') {
    rawIdeas = [
      {
        id: crypto.randomUUID(),
        title: `Chiến Dịch Chuyển Đổi Kép: Trải Nghiệm Mới Cùng ${productName}`,
        tagline: `Nâng tầm phong cách sống – Chạm đỉnh tự tin cùng ${productName}`,
        channels: ['Meta Ads (Reels & Feed)', 'TikTok Spark Ads', 'KOC Tầm Trung (50k-200k followers)'],
        mainContent: `Kết hợp quảng cáo chuyển đổi đa nền tảng với 8 KOC uy tín trong ngành ${industry}. KOC tạo video chân thực, sau đó thương hiệu cấp quyền chạy Spark Ads trực tiếp từ kênh KOC để tối ưu CPA và tăng độ tin tưởng, hướng tới mục tiêu: ${objective}.`,
        estimatedBudget: '48.000.000 VNĐ (KOC: 20M, Paid Ads: 28M)',
        targetAudience: 'Khách hàng 20-35 tuổi, có thói quen mua sắm online qua TikTok Shop & Shopee',
        timeline: [
          {
            week: 1,
            title: 'Booking KOC & Chuẩn bị Landing Page/Phễu',
            activities: [
              'Tuyển chọn và chốt hợp đồng với 8 KOC phù hợp tệp khách',
              'Gửi sản phẩm và brief nội dung làm nổi bật USP của sản phẩm',
              'Tối ưu trang đích chuyển đổi và cài đặt Pixel theo dõi'
            ]
          },
          {
            week: 2,
            title: 'Đăng tải video & Khởi động Ads',
            activities: [
              'KOC đồng loạt lên video theo khung giờ chiến lược',
              'Kích hoạt chiến dịch Spark Ads và Meta Ads với 3 tệp đối tượng thử nghiệm',
              'Kiểm tra tỷ lệ CTR và giá mỗi lượt nhấp ban đầu'
            ]
          },
          {
            week: 3,
            title: 'Tối ưu hóa ngân sách & Tăng chuyển đổi',
            activities: [
              'Dồn 70% ngân sách ads vào 3 video của KOC có tỷ lệ giữ chân cao nhất',
              'Chạy Retargeting nhắm vào khách hàng đã xem video trên 50% hoặc vào trang đích',
              'Tung flash sale ngắn hạn kích thích chốt đơn tức thì'
            ]
          },
          {
            week: 4,
            title: 'Tổng kết ROI & Khai thác khách hàng mới',
            activities: [
              'Đánh giá chỉ số ROAS và giá thu nạp mỗi đơn hàng/lead',
              'Đưa khách hàng mới vào luồng chăm sóc Zalo OA tự động',
              'Tối ưu hóa tệp Lookalike cho các đợt chạy quảng cáo tiếp theo'
            ]
          }
        ]
      },
      {
        id: crypto.randomUUID(),
        title: `Phim Ngắn Viral & Mini Activation: Cảm Hứng Từ ${productName}`,
        tagline: `Mỗi ngày một điều mới – Hãy để ${productName} đồng hành`,
        channels: ['YouTube Shorts', 'TikTok Ads', 'Mini Activation tại trường học / văn phòng'],
        mainContent: `Sản xuất 1 phim ngắn tình huống hài hước đánh trúng tâm lý người dùng trong ngành ${industry}, cắt thành 5 đoạn short-form video viral. Kết hợp quầy trải nghiệm mini (Sampling Booth) tại 3 tòa nhà văn phòng hoặc trường đại học để khách hàng chạm thử thực tế.`,
        estimatedBudget: '65.000.000 VNĐ (Sản xuất: 25M, Booth: 20M, Phân phối: 20M)',
        targetAudience: 'Nhân viên văn phòng và sinh viên cần giải pháp tiện lợi, chất lượng',
        timeline: [
          {
            week: 1,
            title: 'Sản xuất phim ngắn & Đặt địa điểm Booth',
            activities: [
              'Quay dựng hoàn tất phim ngắn và các phiên bản cắt short-form',
              'Xin cấp phép và đặt chỗ cho 3 điểm sampling trải nghiệm',
              'Chuẩn bị POSM, quà tặng và đồng phục PG'
            ]
          },
          {
            week: 2,
            title: 'Phát sóng video viral & Tạo tò mò',
            activities: [
              'Đăng tải video viral lên TikTok và YouTube Shorts kèm ads đẩy lượt xem',
              'Khởi chạy hashtag challenge liên quan đến thông điệp phim',
              'Đăng bài thông báo lịch trình các điểm sampling trải nghiệm'
            ]
          },
          {
            week: 3,
            title: 'Triển khai Sampling Booth thực tế',
            activities: [
              'Tổ chức phát mẫu thử và tư vấn trực tiếp tại 3 điểm mục tiêu',
              'Check-in tại booth nhận quà ngay để kích hoạt thảo luận mạng xã hội',
              'Livestream tại điểm trải nghiệm để tạo hiệu ứng đám đông'
            ]
          },
          {
            week: 4,
            title: 'Kéo chuyển đổi online & Đánh giá',
            activities: [
              'Gửi mã ưu đãi đặc biệt qua tin nhắn cho toàn bộ khách quét mã tại booth',
              'Chạy quảng cáo nhắm lại vào khu vực địa lý quanh các điểm booth',
              'Tổng kết số lượng mẫu thử phát ra và số đơn hàng phát sinh'
            ]
          }
        ]
      },
      {
        id: crypto.randomUUID(),
        title: `Livestream Mega-Sales: Đêm Tiệc Mua Sắm ${productName}`,
        tagline: `Giá chạm đáy, deal cực cháy cùng ${productName}`,
        channels: ['TikTok Shop Livestream', 'Shopee Live', 'Facebook Live'],
        mainContent: `Tổ chức chuỗi 3 phiên Mega Livestream kết hợp cùng Host chuyên nghiệp và quà tặng độc quyền. Tập trung tạo deal độc quyền, voucher số lượng có hạn và minigame tương tác trực tiếp để kích nổ doanh số thần tốc.`,
        estimatedBudget: '52.000.000 VNĐ (Host & Ekip: 20M, Quảng cáo Livestream: 22M, Deal quà: 10M)',
        targetAudience: 'Người tiêu dùng săn khuyến mãi và có thói quen chốt đơn qua livestream',
        timeline: [
          {
            week: 1,
            title: 'Chuẩn bị kịch bản & Gói sản phẩm độc quyền',
            activities: [
              'Lên kịch bản chi tiết từng khung giờ và cấu trúc deal ưu đãi',
              'Làm việc với Host livestream chuyên nghiệp để thống nhất phong cách',
              'Setup phòng live chuẩn studio: ánh sáng, âm thanh, visual bắt mắt'
            ]
          },
          {
            week: 2,
            title: 'Chiến dịch Teasing & Phát voucher sớm',
            activities: [
              'Chạy video ngắn hé lộ các deal hot 1k và quà tặng trị giá khủng',
              'Mở đặt chỗ trước phiên live để khách nhận voucher vào ví',
              'Đếm ngược 3 ngày trước phiên live trên mọi kênh truyền thông'
            ]
          },
          {
            week: 3,
            title: 'Bùng nổ chuỗi 3 phiên Mega Live',
            activities: [
              'Thực hiện 3 phiên live vào khung giờ vàng cuối tuần',
              'Chạy ads trực tiếp (Livestream Shopping Ads) để đẩy mắt xem liên tục',
              'Đội ngũ chốt đơn và giải đáp bình luận real-time chuyên nghiệp'
            ]
          },
          {
            week: 4,
            title: 'Vận chuyển thần tốc & Khai thác sau live',
            activities: [
              'Đẩy nhanh đóng gói và giao hàng để tạo ấn tượng dịch vụ xuất sắc',
              'Tặng kèm thiệp cảm ơn và voucher cho lần mua kế tiếp trong kiện hàng',
              'Họp rút kinh nghiệm các chỉ số GMV, tỷ lệ hủy đơn và tỷ lệ hoàn trả'
            ]
          }
        ]
      },
      {
        id: crypto.randomUUID(),
        title: `Hành Trình Chuyên Sâu: Talkshow Chia Sẻ Cùng Chuyên Gia`,
        tagline: `Hiểu đúng – Chọn chuẩn – Tin tưởng cùng ${productName}`,
        channels: ['PR Báo chí Online (VnExpress/Kenh14)', 'Livestream Webinar', 'Social Content'],
        mainContent: `Mời 2 chuyên gia có tiếng trong ngành ${industry} tham gia buổi thảo luận bàn tròn giải mã các vấn đề nhức nhối của khách hàng. Đi kèm 2 bài PR báo chí uy tín định vị ${productName} là thương hiệu tiên phong vì sức khỏe và lợi ích người tiêu dùng.`,
        estimatedBudget: '60.000.000 VNĐ (Chuyên gia: 25M, Báo chí PR: 20M, Phân phối: 15M)',
        targetAudience: 'Khách hàng kỹ tính, đòi hỏi chứng thực khoa học và chuyên môn cao',
        timeline: [
          {
            week: 1,
            title: 'Xây dựng thông điệp & Chốt chuyên gia',
            activities: [
              'Thống nhất chủ đề tọa đàm và câu hỏi cùng 2 chuyên gia uy tín',
              'Soạn thảo 2 bài viết PR chuyên sâu gửi duyệt các đầu báo lớn',
              'Thiết kế bộ nhận diện truyền thông cho buổi tọa đàm'
            ]
          },
          {
            week: 2,
            title: 'Lên bài báo chí & Mở đăng ký tọa đàm',
            activities: [
              'Xuất bản bài báo định vị đầu tiên trên trang tin điện tử uy tín',
              'Mở cổng đăng ký tham dự webinar nhận tài liệu độc quyền',
              'Chạy ads tiếp cận tệp độc giả của các trang báo tài chính/đời sống'
            ]
          },
          {
            week: 3,
            title: 'Phát sóng tọa đàm & Trả lời trực tuyến',
            activities: [
              'Tổ chức phát sóng trực tuyến buổi tọa đàm với chất lượng hình ảnh cao',
              'Chuyên gia trực tiếp giải đáp thắc mắc và kiểm chứng sản phẩm',
              'Tặng suất trải nghiệm đặc biệt cho 100 người xem tương tác tốt nhất'
            ]
          },
          {
            week: 4,
            title: 'Lan tỏa trích dẫn & Bài PR thứ hai',
            activities: [
              'Lên bài PR thứ hai đúc kết các luận điểm đắt giá từ buổi tọa đàm',
              'Cắt các đoạn chia sẻ của chuyên gia thành short video đăng đa nền tảng',
              'Thu thập thông tin khách hàng tiềm năng để chuyển bộ phận tư vấn'
            ]
          }
        ]
      },
      {
        id: crypto.randomUUID(),
        title: `Đấu Trường Tương Tác: Thử Thách 21 Ngày Thay Đổi`,
        tagline: `21 ngày kiên trì – Đón nhận phiên bản hoàn hảo cùng ${productName}`,
        channels: ['Cộng đồng Facebook Group', 'App theo dõi / Gamification Zalo', 'KOL Nhỏ dẫn dắt'],
        mainContent: `Tạo thử thách thói quen 21 ngày với sự đồng hành của sản phẩm. Người tham gia được cung cấp lộ trình hướng dẫn chi tiết, tham gia bảng xếp hạng thi đua nhận giải thưởng giá trị cao (Smartphone/Chuyến du lịch).`,
        estimatedBudget: '45.000.000 VNĐ (Giải thưởng: 20M, Vận hành: 10M, Quảng bá: 15M)',
        targetAudience: 'Người muốn xây dựng lối sống tích cực, có tính kiên trì và thích thi đua',
        timeline: [
          {
            week: 1,
            title: 'Chiêu mộ thí sinh & Ra mắt thể lệ',
            activities: [
              'Công bố cơ cấu giải thưởng lớn và thể lệ thử thách 21 ngày',
              'Tuyển chọn 3 KOL phong cách sống làm đội trưởng dẫn dắt 3 team',
              'Hướng dẫn người tham gia mua combo sản phẩm để đủ điều kiện thi'
            ]
          },
          {
            week: 2,
            title: '7 ngày đầu tiên: Thích nghi & Gắn kết',
            activities: [
              'Đội trưởng livestream động viên và chia sẻ nhật ký mỗi ngày',
              'Cập nhật bảng xếp hạng tương tác của các đội hàng tuần',
              'Thực hiện thử thách phụ bất ngờ để tăng điểm thưởng'
            ]
          },
          {
            week: 3,
            title: '14 ngày tiếp theo: Tăng tốc bứt phá',
            activities: [
              'Khuyến khích thí sinh đăng tải hình ảnh thay đổi rõ rệt lên trang cá nhân',
              'Tổ chức mini-talk chia sẻ cách vượt qua cảm giác lười biếng',
              'Quảng bá các câu chuyện truyền cảm hứng nhất lên fanpage chính'
            ]
          },
          {
            week: 4,
            title: 'Về đích 21 ngày & Đêm Gala vinh danh',
            activities: [
              'Chấm điểm chung cuộc dựa trên nhật ký và sự thay đổi thực tế',
              'Tổ chức buổi trao giải vinh danh trang trọng cho quán quân',
              'Tạo video tài liệu tổng kết hành trình đầy xúc động để truyền thông lâu dài'
            ]
          }
        ]
      }
    ];
  } else {
    // Budget High (> 100M)
    rawIdeas = [
    {
      id: crypto.randomUUID(),
      title: `Chiến Dịch IMC Tổng Lực: Khởi Sắc Kỷ Nguyên Cùng ${productName}`,
      tagline: `Kiến tạo tương lai – Dẫn đầu phong cách cùng ${productName}`,
      channels: ['Chiến dịch IMC Đa kênh', 'KOL/Celeb Hạng A', 'OOH LED Ngã Tư Lớn', 'Báo chí lớn (VnExpress, CafeF)'],
      mainContent: `Chiến dịch tích hợp tổng lực (IMC) 360 độ từ Online đến Offline. Hợp tác cùng 1 Celeb có sức ảnh hưởng quốc gia làm đại sứ chiến dịch, kết hợp phủ sóng biển bảng LED ngoài trời tại các vị trí đắc địa ở Hà Nội & TP.HCM, đưa thương hiệu chiếm lĩnh hoàn toàn tâm trí khách hàng.`,
      estimatedBudget: '280.000.000 VNĐ (Celeb: 120M, OOH LED: 80M, Digital Ads & PR: 80M)',
      targetAudience: 'Đại chúng phân khúc trung - cao cấp, yêu cầu sự đẳng cấp và uy tín hàng đầu',
      timeline: [
        {
          week: 1,
          title: 'Giai đoạn Teasing & Ký kết Đại sứ thương hiệu',
          activities: [
            'Tung teaser bí ẩn về gương mặt đại diện mới trên mọi nền tảng',
            'Ký kết hợp đồng và thực hiện bộ ảnh/video TVC đại sứ thương hiệu',
            'Chuẩn bị hệ thống biển LED ngoài trời tại các nút giao thông trung tâm'
          ]
        },
        {
          week: 2,
          title: 'Bùng nổ công bố (Booming Launch)',
          activities: [
            'Họp báo ra mắt chiến dịch với sự tham gia của 30 đầu báo lớn và Celeb',
            'Đồng loạt sáng đèn toàn bộ hệ thống OOH LED và phát sóng video chủ đạo',
            'Đẩy mạnh chiến dịch Digital đa kênh với thông điệp dẫn đầu'
          ]
        },
        {
          week: 3,
          title: 'Lan tỏa diện rộng & Kích hoạt trải nghiệm thực tế',
          activities: [
            'Kích hoạt 20 Influencer và Reviewer hàng đầu chia sẻ trải nghiệm sản phẩm',
            'Triển khai chương trình khuyến mãi mua sản phẩm trúng quà tặng sang trọng',
            'Tối ưu hóa các chiến dịch quảng cáo chuyển đổi trên Google Search & Social'
          ]
        },
        {
          week: 4,
          title: 'Duy trì ảnh hưởng & Đo lường sức khỏe thương hiệu',
          activities: [
            'Xuất bản loạt bài báo chuyên sâu đánh giá thành công của chiến dịch',
            'Khảo sát chỉ số Brand Lift và mức độ ghi nhớ thông điệp của người tiêu dùng',
            'Tri ân đối tác và khách hàng bằng gói hậu mãi VIP độc quyền'
          ]
        }
      ]
    },
    {
      id: crypto.randomUUID(),
      title: `Lễ Ra Mắt Đỉnh Cao & Đại Tiệc Âm Nhạc Trải Nghiệm`,
      tagline: `Đánh thức mọi giác quan – Bùng nổ đam mê cùng ${productName}`,
      channels: ['Sự kiện Gala / Launching Event', 'Livestream Đa Kênh', 'KOLs Reviewers VIP'],
      mainContent: `Tổ chức sự kiện ra mắt hoành tráng kết hợp trình diễn công nghệ ánh sáng 3D mapping và đêm nhạc với sự tham gia của các nghệ sĩ thịnh hành. Phát sóng trực tiếp sự kiện thu hút hàng trăm nghìn lượt xem đồng thời, tạo cú hích truyền thông cực lớn.`,
      estimatedBudget: '350.000.000 VNĐ (Tổ chức sự kiện: 180M, Nghệ sĩ: 90M, Livestream Ads: 80M)',
      targetAudience: 'Giới trẻ sành điệu, người yêu công nghệ và cộng đồng fan hâm mộ nghệ sĩ',
      timeline: [
        {
          week: 1,
          title: 'Thiết kế sân khấu & Phát vé mời VIP',
          activities: [
            'Dựng phối cảnh sân khấu 3D mapping và chốt danh sách nghệ sĩ biểu diễn',
            'Gửi thiệp mời VIP độc bản cho giới truyền thông và các KOLs danh tiếng',
            'Tung mini-game săn vé tham dự sự kiện ra mắt trên fanpage'
          ]
        },
        {
          week: 2,
          title: 'Tập dượt & Chiến dịch đếm ngược',
          activities: [
            'Các nghệ sĩ đăng bài xác nhận tham gia sự kiện tạo làn sóng thảo luận',
            'Chạy quảng cáo đếm ngược trên các mạng xã hội để tăng lượt đăng ký xem live',
            'Rehearsal tổng thể kịch bản sân khấu và các điểm chạm trải nghiệm tại sảnh'
          ]
        },
        {
          week: 3,
          title: 'Đêm Gala bùng nổ & Livestream toàn quốc',
          activities: [
            'Tổ chức đêm Gala ra mắt chính thức với hơn 500 khách mời trực tiếp',
            'Livestream đa nền tảng đạt kỷ lục người xem đồng thời',
            'Mở bán giới hạn phiên bản đặc biệt ngay trong sự kiện'
          ]
        },
        {
          week: 4,
          title: 'Khai thác dư chấn truyền thông & Bán hàng',
          activities: [
            'Đăng tải các tiết mục biểu diễn đắt giá và khoảnh khắc ấn tượng nhất',
            'Phủ sóng bài PR recap trên các trang báo giải trí và phong cách sống hàng đầu',
            'Đẩy mạnh bán hàng với ưu đãi độc quyền dành cho khán giả đã theo dõi sự kiện'
          ]
        }
      ]
    },
    {
      id: crypto.randomUUID(),
      title: `Chiến Dịch Trách Nhiệm Xã Hội (CSR): Vươn Cao Cùng ${productName}`,
      tagline: `Mỗi lựa chọn – Một tương lai xanh cùng ${productName}`,
      channels: ['Chiến dịch CSR Báo chí', 'Phim tài liệu ngắn (Docu-film)', 'Hợp tác tổ chức phi chính phủ'],
      mainContent: `Xây dựng chiến dịch CSR dài hạn gắn liền sản phẩm với một hành động ý nghĩa vì cộng đồng (ví dụ: trích 5% doanh thu mỗi sản phẩm bán ra để trồng rừng hoặc hỗ trợ giáo dục). Tạo thiện cảm thương hiệu sâu sắc và sự gắn bó bền vững của khách hàng.`,
      estimatedBudget: '220.000.000 VNĐ (Quỹ tài trợ: 100M, Sản xuất phim & PR: 70M, Truyền thông: 50M)',
      targetAudience: 'Khách hàng có ý thức xã hội cao, gia đình và giới trí thức',
      timeline: [
        {
          week: 1,
          title: 'Thiết lập quỹ & Khởi động dự án cộng đồng',
          activities: [
            'Ký kết thỏa thuận hợp tác cùng quỹ cộng đồng hoặc tổ chức uy tín',
            'Sản xuất phim ngắn tài liệu giới thiệu về thực trạng và sứ mệnh dự án',
            'Công bố cam kết trích phần trăm doanh thu trên bao bì sản phẩm'
          ]
        },
        {
          week: 2,
          title: 'Phát sóng phim tài liệu & Tọa đàm truyền cảm hứng',
          activities: [
            'Ra mắt phim tài liệu trên YouTube và truyền thông xã hội',
            'Tổ chức buổi tọa đàm báo chí về phát triển bền vững trong ngành',
            'Kêu gọi cộng đồng chung tay chia sẻ thông điệp để nhân đôi quỹ đóng góp'
          ]
        },
        {
          week: 3,
          title: 'Hoạt động thực địa & Giao lưu cộng đồng',
          activities: [
            'Tổ chức đoàn đại sứ và khách hàng tiêu biểu tham gia hoạt động thực địa',
            'Ghi nhận những hình ảnh chân thực và xúc động tại địa bàn thụ hưởng',
            'Đưa tin phóng sự truyền hình về hoạt động ý nghĩa của doanh nghiệp'
          ]
        },
        {
          week: 4,
          title: 'Báo cáo tác động xã hội & Tri ân khách hàng',
          activities: [
            'Công bố báo cáo minh bạch về số tiền đã đóng góp và thành quả đạt được',
            'Gửi thư cảm ơn có chữ ký của đại diện tổ chức đến từng khách hàng đã ủng hộ',
            'Định vị vững chắc giá trị nhân văn và hình ảnh uy tín của thương hiệu'
          ]
        }
      ]
    },
    {
      id: crypto.randomUUID(),
      title: `Chuyến Xe Trải Nghiệm Xuyên Việt: Hành Trình Cùng ${productName}`,
      tagline: `Chạm đến mọi miền – Kết nối đam mê cùng ${productName}`,
      channels: ['Roadshow Xe bus 2 tầng / Xe công nghệ', 'TikTokers địa phương', 'OOH di động'],
      mainContent: `Triển khai Roadshow xe bus 2 tầng được thiết kế thành không gian trải nghiệm công nghệ tương tác di động đi qua 5 thành phố lớn (Hà Nội, Hải Phòng, Đà Nẵng, Nha Trang, TP.HCM). Tạo điểm check-in độc lạ thu hút đông đảo bạn trẻ và truyền thông địa phương.`,
      estimatedBudget: '310.000.000 VNĐ (Thiết kế xe & Di chuyển: 160M, Truyền thông địa phương: 90M, Quà tặng: 60M)',
      targetAudience: 'Đông đảo người tiêu dùng tại các đô thị trọng điểm',
      timeline: [
        {
          week: 1,
          title: 'Hoàn thiện xe bus trải nghiệm & Xuất phát tại Hà Nội',
          activities: [
            'Trang trí và lắp đặt các trạm trải nghiệm tương tác bên trong xe bus',
            'Lễ xuất phát hoành tráng tại trung tâm Hà Nội với sự tham gia của KOCs',
            'Đưa xe di chuyển qua các tuyến phố sầm uất và dừng chân tại 2 trường đại học'
          ]
        },
        {
          week: 2,
          title: 'Hành trình miền Trung: Đà Nẵng & Nha Trang',
          activities: [
            'Xe bus cập bến thành phố biển, tổ chức ngày hội trải nghiệm ven biển',
            'Hợp tác cùng 10 TikToker địa phương tạo video review điểm đến',
            'Phát 3.000 phần quà độc quyền cho khách check-in cùng xe'
          ]
        },
        {
          week: 3,
          title: 'Đại tiệc chào đón tại TP. Hồ Chí Minh',
          activities: [
            'Tập kết xe bus tại phố đi bộ trung tâm TP.HCM vào dịp cuối tuần',
            'Tổ chức đêm nhạc acoustic giao lưu mở cửa tự do cho công chúng',
            'Livestream không khí náo nhiệt lan tỏa trên các trang mạng xã hội'
          ]
        },
        {
          week: 4,
          title: 'Recap hành trình vạn dặm & Trao giải',
          activities: [
            'Tổng kết số lượng khách hàng đã trực tiếp bước lên xe trải nghiệm',
            'Trao giải cuộc thi ảnh "Bắt trọn khoảnh khắc chuyến xe"',
            'Chuyển đổi tệp khách hàng đã quét mã trên xe sang các chương trình bán hàng online'
          ]
        }
      ]
    },
    {
      id: crypto.randomUUID(),
      title: `Hệ Sinh Thái Đổi Mới: Trải Nghiệm Mua Sắm Thực Tế Ảo (AR/3D)`,
      tagline: `Thế giới mới – Trải nghiệm không giới hạn cùng ${productName}`,
      channels: ['AR Filter tương tác cao cấp', 'KOLs Công nghệ / Đời sống', 'Quảng cáo 3D DOOH'],
      mainContent: `Phát triển bộ lọc AR trải nghiệm sản phẩm ảo siêu thực trên Instagram và TikTok, kết hợp màn hình 3D Naked-Eye DOOH tại trung tâm thương mại lớn. Cho phép khách hàng "ướm thử" hoặc tương tác 3D với ${productName} ngay tại nhà trước khi quyết định mua sắm.`,
      estimatedBudget: '260.000.000 VNĐ (Lập trình AR & 3D Video: 110M, Màn hình 3D DOOH: 90M, Phân phối: 60M)',
      targetAudience: 'Người tiêu dùng yêu thích công nghệ mới, thích mua sắm thông minh và hiện đại',
      timeline: [
        {
          week: 1,
          title: 'Lập trình AR Filter & Render Video 3D',
          activities: [
            'Hoàn thiện filter AR tương tác 3D tối ưu cho mọi dòng smartphone',
            'Sản xuất video hiệu ứng thị giác 3D Naked-Eye phát sóng trên màn hình LED cong',
            'Thử nghiệm tính năng mua hàng 1-chạm tích hợp ngay trong filter'
          ]
        },
        {
          week: 2,
          title: 'Công bố màn hình 3D & Thử thách AR',
          activities: [
            'Chính thức phát sóng video 3D trên màn hình LED góc phố lớn thu hút người đi đường',
            'Mở màn thử thách AR filter với 15 KOLs công nghệ tiên phong trải nghiệm',
            'Khuyến khích người dùng quay video cùng filter nhận quà tặng công nghệ'
          ]
        },
        {
          week: 3,
          title: 'Lan tỏa trào lưu & Thu hút thảo luận',
          activities: [
            'Làn sóng video người dùng trải nghiệm filter lọt Top Trending hiệu ứng',
            'Báo chí chuyên ngành công nghệ và marketing đưa tin về giải pháp tiên phong',
            'Tặng ưu đãi giảm 20% cho khách hàng chụp ảnh màn hình trải nghiệm filter'
          ]
        },
        {
          week: 4,
          title: 'Đo lường tương tác ảo & Chuyển đổi thật',
          activities: [
            'Thống kê số lượt mở filter, số lượt chụp và thời gian tương tác trung bình',
            'Đo lường tỷ lệ nhấp từ filter chuyển sang website bán hàng',
            'Đóng gói công nghệ AR thành tiện ích thường trực trên nền tảng thương mại của hãng'
          ]
        }
      ]
    }
  ];
  }

  return rawIdeas.map((idea) => ({
    ...idea,
    verificationEvidence: attachVerificationEvidence(idea, input)
  }));
}

/**
 * Sinh phương án tinh chỉnh dự phòng khi AI gặp sự cố hạ tầng hoặc môi trường dev giả lập
 */
export function getFallbackRefinedIdea(
  currentIdea: MarketingIdea,
  instruction: string
): {
  refinedIdea: MarketingIdea;
  changeReason: string;
  changesSummary: string[];
} {
  const lower = instruction.toLowerCase();
  const refined = JSON.parse(JSON.stringify(currentIdea)) as MarketingIdea;
  const changesSummary: string[] = [];

  let reason = 'Đã cập nhật chiến dịch theo yêu cầu tinh chỉnh của bạn.';

  if (lower.includes('ngân sách') || lower.includes('chi phí') || lower.includes('giảm') || lower.includes('tiền')) {
    refined.estimatedBudget = '9.500.000 VNĐ (Tối ưu tiết kiệm ~40% chi phí)';
    refined.channels = ['TikTok Organic', 'Facebook Community Seeding', 'Micro-Creator Barter'];
    refined.targetAudience = 'Nhóm khách hàng mục tiêu cốt lõi có tỷ lệ chuyển đổi tự nhiên cao nhất';
    refined.mainContent = `${refined.mainContent} (Chiến lược được tinh gọn chi phí tối đa: cắt bỏ toàn bộ quảng cáo trả phí đắt đỏ, tập trung 100% vào nội dung lan tỏa tự nhiên và mini-contest tặng quà trải nghiệm).`;
    refined.timeline = [
      {
        week: 1,
        title: 'Chuẩn bị sản phẩm mẫu & Kịch bản tự quay',
        activities: [
          'Tự sản xuất 5 video ngắn bằng điện thoại chia sẻ câu chuyện sản phẩm',
          'Gửi 10 set quà trải nghiệm cho micro-creator dạng barter không tốn phí booking'
        ]
      },
      {
        week: 2,
        title: 'Lan tỏa cộng đồng & Mini-contest tiết kiệm',
        activities: [
          'Seeding bài viết trải nghiệm vào 10 hội nhóm liên quan',
          'Tổ chức mini-game nhỏ tặng voucher giảm giá trực tiếp'
        ]
      },
      {
        week: 3,
        title: 'Tận dụng UGC & Tương tác organic',
        activities: [
          'Đăng lại (repost) các video review chân thực của khách hàng',
          'Livestream tư vấn và chốt đơn ưu đãi giới hạn'
        ]
      },
      {
        week: 4,
        title: 'Tổng kết & Tái đầu tư từ doanh thu',
        activities: [
          'Thống kê đơn hàng và tỷ lệ chuyển đổi từ các kênh 0 đồng',
          'Tri ân khách hàng và trích lợi nhuận xoay vòng cho đợt tiếp theo'
        ]
      }
    ];
    changesSummary.push('Cắt giảm ngân sách xuống mức tiết kiệm (~9.5 triệu VNĐ).');
    changesSummary.push('Đồng bộ chuyển kênh sang Organic Social & Barter quà tặng.');
    changesSummary.push('Tái cấu trúc timeline 4 tuần sang các hoạt động tinh gọn không tốn phí media.');
    reason = 'Khi giảm ngân sách, toàn bộ Kênh triển khai, Nội dung và Timeline 4 tuần đã được đồng bộ chuyển sang mô hình Lean Marketing (tiết kiệm chi phí, ưu tiên chuyển đổi nhanh).';
  }

  if (lower.includes('tiktok') || lower.includes('reels') || lower.includes('video') || lower.includes('kênh')) {
    const existing = new Set(refined.channels);
    if (!existing.has('TikTok Organic & Creator Barter')) {
      refined.channels = ['TikTok Organic & Creator Barter', 'CapCut Template', ...refined.channels.slice(0, 2)];
    }
    refined.timeline[1].activities[0] = 'Đẩy mạnh chuỗi video ngắn ngắn 15s bắt trend và CapCut template trên TikTok.';
    changesSummary.push('Bổ sung TikTok làm kênh phân phối chính, tích hợp kịch bản video ngắn và CapCut template.');
  }

  if (lower.includes('slogan') || lower.includes('thông điệp') || lower.includes('sáng tạo') || lower.includes('trend')) {
    refined.tagline = `${currentIdea.tagline} – Chất riêng dẫn lối thành công`;
    changesSummary.push(`Làm mới slogan mang phong cách bắt trend: "${refined.tagline}"`);
  }

  if (lower.includes('sinh viên') || lower.includes('gen z') || lower.includes('trẻ') || lower.includes('khách hàng') || lower.includes('tệp')) {
    refined.targetAudience = 'Sinh viên và người trẻ Gen Z (18–24 tuổi) thích trải nghiệm mới, săn deal độc lạ và chuộng nội dung ngắn';
    changesSummary.push('Điều chỉnh tệp khách hàng mục tiêu sang giới trẻ Gen Z và sinh viên.');
  }

  if (lower.includes('đơn giản') || lower.includes('dễ') || lower.includes('nhanh')) {
    refined.mainContent = `${refined.mainContent} Quy trình thực thi được rút gọn thành 3 bước tinh gọn, loại bỏ các khâu sản xuất cồng kềnh.`;
    changesSummary.push('Đơn giản hóa các hoạt động triển khai, tập trung vào tính khả thi nhanh.');
  }

  if (changesSummary.length === 0) {
    refined.tagline = `Đột phá cùng ${currentIdea.title}`;
    changesSummary.push(`Tinh chỉnh nội dung theo chỉ dẫn: "${instruction}"`);
  }

  return {
    refinedIdea: refined,
    changeReason: reason,
    changesSummary
  };
}

