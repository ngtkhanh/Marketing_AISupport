import assert from 'node:assert/strict';
import { campaignInputSchema } from '../src/lib/schemas.ts';

console.log('--- TEST TASK 4: Form Brand Profile & Presets Integration ---');

// 1. Kiểm tra cấu trúc các Preset mẫu nâng cao chứa brandProfile
const FNB_PRESET = {
  industry: 'F&B (Đồ uống & Trà sữa)',
  productName: 'Trà Sữa Trân Châu Mộc Trà',
  budgetLevel: 'low',
  objective: 'Tăng tương tác và độ nhận diện trong giới học sinh, sinh viên',
  brandProfile: {
    brandToneAdjectives: ['Gần gũi', 'Tươi trẻ', 'Năng động'],
    permittedClaims: '100% trà tự nhiên nấu mới mỗi ngày',
    wordsToAvoid: 'Rẻ nhất, Cam kết số 1'
  }
};

const parsedFNB = campaignInputSchema.safeParse(FNB_PRESET);
assert.equal(parsedFNB.success, true, 'Preset F&B hợp lệ với campaignInputSchema');
assert.deepEqual(parsedFNB.data.brandProfile?.brandToneAdjectives, ['Gần gũi', 'Tươi trẻ', 'Năng động']);
assert.equal(parsedFNB.data.brandProfile?.wordsToAvoid, 'Rẻ nhất, Cam kết số 1');

// 2. Kiểm tra Preset Thời trang
const FASHION_PRESET = {
  industry: 'Thời trang & May mặc',
  productName: 'Bộ Sưu Tập Áo Khoác Mùa Thu Aurora',
  budgetLevel: 'high',
  objective: 'Ra mắt sản phẩm mới và tạo cơn sốt bùng nổ doanh số quý 4',
  brandProfile: {
    brandToneAdjectives: ['Thanh lịch', 'Hiện đại', 'Tự tin'],
    permittedClaims: 'Chất liệu lụa satin cao cấp chống nhăn',
    wordsToAvoid: 'Đại hạ giá, Xả kho'
  }
};
const parsedFashion = campaignInputSchema.safeParse(FASHION_PRESET);
assert.equal(parsedFashion.success, true, 'Preset Thời trang hợp lệ');
assert.equal(parsedFashion.data.brandProfile?.permittedClaims, 'Chất liệu lụa satin cao cấp chống nhăn');

// 3. Kiểm tra Preset SaaS
const SAAS_PRESET = {
  industry: 'Công nghệ & Phần mềm',
  productName: 'Ứng Dụng Học Tiếng Anh AI EngMaster',
  budgetLevel: 'medium',
  objective: 'Thu thập 5.000 khách hàng tiềm năng đăng ký dùng thử ứng dụng',
  brandProfile: {
    brandToneAdjectives: ['Chuyên nghiệp', 'Đột phá', 'Tận tâm'],
    permittedClaims: 'Công nghệ AI phát âm chuẩn Oxford',
    wordsToAvoid: 'Học vẹt, Cam kết giỏi ngay'
  }
};
const parsedSaaS = campaignInputSchema.safeParse(SAAS_PRESET);
assert.equal(parsedSaaS.success, true, 'Preset SaaS hợp lệ');

console.log('✅ ALL TASK 4 TESTS PASSED!');

