import assert from 'node:assert';
import { validateSingleIdeaMarketingOutput, validateMarketingOutput } from '../src/lib/ai/validate-output.ts';

console.log('🧪 Kiểm thử Task 5: Output Consistency Validation Rules...');

// 1. Kiểm tra phát hiện kênh bị cấm ở ngân sách thấp
const forbiddenIdea = {
  id: 'idea_forbidden',
  title: 'Chiến dịch TVC Celeb Hoành Tráng',
  tagline: 'Đỉnh cao thương hiệu',
  channels: ['TVC Truyền hình', 'KOL Hạng A'],
  mainContent: 'Sản xuất TVC phát sóng trên truyền hình quốc gia và thuê celeb hạng A bảo chứng.',
  estimatedBudget: '15.000.000 VNĐ',
  targetAudience: 'Đại chúng',
  timeline: [
    { week: 1, title: 'T1', activities: ['Quay TVC với Celeb'] },
    { week: 2, title: 'T2', activities: ['Phát sóng TVC'] },
    { week: 3, title: 'T3', activities: ['Truyền thông báo chí'] },
    { week: 4, title: 'T4', activities: ['Tổng kết TVC'] }
  ]
};

const forbiddenResult = validateSingleIdeaMarketingOutput(forbiddenIdea, 'low');
assert.strictEqual(forbiddenResult.valid, false, 'Phải bắt lỗi kênh bị cấm ở mức ngân sách thấp');
assert(
  forbiddenResult.errors.some((err) => err.includes('bị cấm')),
  'Lỗi phải nêu rõ kênh bị cấm'
);

// 2. Kiểm tra phát hiện mâu thuẫn kênh - timeline (Kênh liệt kê nhưng 4 tuần timeline không có hoạt động nào liên quan)
const phantomChannelIdea = {
  id: 'idea_phantom',
  title: 'Chiến dịch Phát Tờ Rơi Tại Chợ',
  tagline: 'Trực tiếp tận tay',
  channels: ['TikTok Ads', 'Phát tờ rơi trực tiếp'],
  mainContent: 'Tập trung phát 5000 tờ rơi giới thiệu sản phẩm tại các chợ truyền thống.',
  estimatedBudget: '15.000.000 VNĐ',
  targetAudience: 'Nội trợ',
  timeline: [
    { week: 1, title: 'T1', activities: ['In ấn 5000 tờ rơi màu tại xưởng', 'Phân chia khu vực chợ'] },
    { week: 2, title: 'T2', activities: ['Phát tờ rơi tại chợ đầu mối', 'Tặng mẫu dùng thử'] },
    { week: 3, title: 'T3', activities: ['Phát tờ rơi tại chợ dân sinh', 'Thu thập phản hồi'] },
    { week: 4, title: 'T4', activities: ['Tổng kết số lượng khách hàng ghé tiệm', 'Đánh giá'] }
  ]
};

const phantomResult = validateSingleIdeaMarketingOutput(phantomChannelIdea, 'low');
assert.strictEqual(
  phantomResult.valid,
  false,
  'Kênh TikTok Ads được liệt kê nhưng 4 tuần timeline không hề có hoạt động nào về TikTok Ads -> phải báo lỗi tính nhất quán'
);
assert(
  phantomResult.errors.some((err) => err.includes('TikTok Ads') && err.includes('timeline')),
  'Thông báo lỗi phải chỉ rõ kênh TikTok Ads thiếu hoạt động trong timeline'
);

// 3. Kiểm tra ý tưởng hợp lệ, nhất quán
const validIdea = {
  id: 'idea_valid',
  title: 'Chuỗi Video Review Trải Nghiệm TikTok',
  tagline: 'Chân thực từng khoảnh khắc',
  channels: ['TikTok Organic', 'Facebook Group'],
  mainContent: 'Sản xuất 10 video ngắn review chân thực đăng tải trên TikTok và chia sẻ vào các group Facebook chuyên ngành.',
  estimatedBudget: '15.000.000 VNĐ',
  targetAudience: 'Người trẻ',
  timeline: [
    { week: 1, title: 'T1', activities: ['Quay 5 video TikTok đầu tiên', 'Đăng bài vào 3 Group Facebook'] },
    { week: 2, title: 'T2', activities: ['Đăng tiếp 5 video TikTok theo xu hướng', 'Tương tác trong Group'] },
    { week: 3, title: 'T3', activities: ['Tổ chức minigame trên TikTok', 'Ghim bài hướng dẫn trong Group'] },
    { week: 4, title: 'T4', activities: ['Tổng kết tương tác TikTok và Group Facebook', 'Tri ân người xem'] }
  ]
};

const validResult = validateSingleIdeaMarketingOutput(validIdea, 'low');
assert.strictEqual(validResult.valid, true, 'Ý tưởng nhất quán đầy đủ phải đạt valid = true');

// 4. Kiểm tra trường hợp từ đồng nghĩa nghiệp vụ marketing (Referral = giới thiệu bạn bè, KOC = reviewer)
const synonymIdea = {
  id: 'idea_synonym',
  title: 'Kích Hoạt Khách Quen & Giới Thiệu Nhận Thưởng Đôi',
  tagline: 'Càng mời càng lời',
  channels: ['Truyền miệng (Referral)', 'Zalo OA / Mini App'],
  mainContent: 'Cung cấp mã ưu đãi điện tử, khách giới thiệu 1 bạn mới sẽ cùng nhận quà trực tiếp cho lần mua kế tiếp.',
  estimatedBudget: '15.000.000 VNĐ',
  targetAudience: 'Khách hàng thân thiết',
  timeline: [
    { week: 1, title: 'T1', activities: ['Tạo mã QR trên trang Zalo và bảng quy đổi điểm thưởng', 'Chuẩn bị quà'] },
    { week: 2, title: 'T2', activities: ['Gửi tin nhắn ưu đãi đến tệp khách cũ', 'Kích hoạt chương trình mời bạn'] },
    { week: 3, title: 'T3', activities: ['Đổi quà cho khách giới thiệu bạn bè thành công', 'Chụp ảnh lưu niệm'] },
    { week: 4, title: 'T4', activities: ['Tổng kết tỷ lệ khách quay lại và số lượng bạn bè mới ghé tiệm', 'Đánh giá'] }
  ]
};

const synonymResult = validateSingleIdeaMarketingOutput(synonymIdea, 'low');
assert.strictEqual(
  synonymResult.valid,
  true,
  `Kênh "Truyền miệng (Referral)" phải nhận diện được hoạt động "giới thiệu bạn bè" và "mời bạn", errors: ${synonymResult.errors.join('; ')}`
);

// 5. Kiểm tra trường hợp Cross-promo (Hợp tác chéo quán lân cận phát voucher đối tác)
const crossPromoIdea = {
  id: 'idea_cross_promo',
  title: 'Liên Minh Quán Cafe & Tiệm Bánh Local',
  tagline: 'Trọn vị ngọt ngào – Nhân đôi niềm vui',
  channels: ['Cross-promo', 'POSM điểm bán', 'Instagram Stories'],
  mainContent: 'Hợp tác chéo với 3 quán cafe và tiệm bánh lân cận để chia sẻ tệp khách hàng chung qua voucher và quà tặng mẫu.',
  estimatedBudget: '8.000.000 VNĐ',
  targetAudience: 'Giới trẻ và dân văn phòng',
  timeline: [
    { week: 1, title: 'Đàm phán liên minh', activities: ['Gặp gỡ 3 chủ quán đối tác lân cận', 'Thống nhất cơ chế đổi voucher chéo'] },
    { week: 2, title: 'Triển khai điểm bán', activities: ['In 500 voucher ưu đãi và đặt standee tại quầy thu ngân đối tác', 'Đăng story Instagram giới thiệu'] },
    { week: 3, title: 'Đón tiếp khách đổi quà', activities: ['Phục vụ khách mang voucher từ quán bạn sang', 'Tặng thẻ tích điểm'] },
    { week: 4, title: 'Tổng kết và đối soát', activities: ['Đối soát lượng voucher quy đổi giữa các bên', 'Đánh giá tỷ lệ khách mới ghé tiệm'] }
  ]
};

const crossPromoResult = validateSingleIdeaMarketingOutput(crossPromoIdea, 'low');
assert.strictEqual(
  crossPromoResult.valid,
  true,
  `Kênh "Cross-promo" phải được nhận diện thành công qua các hoạt động đối tác/voucher chéo, errors: ${crossPromoResult.errors.join('; ')}`
);

console.log('✅ Task 5 Test Passed: Output consistency validation verified!');

