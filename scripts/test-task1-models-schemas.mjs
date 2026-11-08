import assert from 'node:assert/strict';
import {
  marketingLogicSchema,
  brandProfileSchema,
  campaignInputSchema,
  step3Schema,
  rawAIIdeaSchema
} from '../src/lib/schemas.ts';

console.log('--- TEST TASK 1: Models & Schemas Validation ---');

// 1. Kiểm tra marketingLogicSchema
const validLogic = {
  customerBarrierOrNeed: 'Khách hàng sợ mua nhầm đồ kém chất lượng online',
  productBenefitAndProof: 'Cam kết đổi trả 30 ngày, có giấy chứng nhận kiểm định',
  campaignMechanism: 'Kích hoạt thử thách review thật kèm mã ưu đãi độc quyền',
  desiredAction: 'Bấm vào link đặt hàng dùng thử miễn phí vận chuyển',
  successRequirements: 'Cần chuẩn bị sẵn 50 mẫu thử và đội ngũ phản hồi inbox trong 5 phút'
};

const parsedLogic = marketingLogicSchema.safeParse(validLogic);
assert.equal(parsedLogic.success, true, 'marketingLogicSchema parse hợp lệ');

const invalidLogic = {
  customerBarrierOrNeed: 'quá ngắn',
  productBenefitAndProof: '',
  campaignMechanism: '1',
  desiredAction: '2',
  successRequirements: '3'
};
const failedLogic = marketingLogicSchema.safeParse(invalidLogic);
assert.equal(failedLogic.success, false, 'marketingLogicSchema bắt được lỗi dữ liệu thiếu/quá ngắn');

// 2. Kiểm tra brandProfileSchema
const validBrandProfile = {
  brandToneAdjectives: ['Chuyên nghiệp', 'Gần gũi', 'Đáng tin cậy'],
  permittedClaims: 'Sản phẩm 100% tự nhiên không chất bảo quản',
  wordsToAvoid: 'Rẻ nhất, Cam kết 100%, Đảm bảo tuyệt đối'
};
const parsedBrand = brandProfileSchema.safeParse(validBrandProfile);
assert.equal(parsedBrand.success, true, 'brandProfileSchema parse hợp lệ');

// 3. Kiểm tra tích hợp vào campaignInputSchema và step3Schema
const fullInput = {
  industry: 'Thời trang',
  productName: 'Áo thun polo thể thao',
  budgetLevel: 'medium',
  objective: 'Tăng doanh số bán hàng quý 4',
  brandProfile: validBrandProfile
};
const parsedInput = campaignInputSchema.safeParse(fullInput);
assert.equal(parsedInput.success, true, 'campaignInputSchema nhận brandProfile');
assert.deepEqual(parsedInput.data.brandProfile?.brandToneAdjectives, ['Chuyên nghiệp', 'Gần gũi', 'Đáng tin cậy']);

const step3Input = {
  budgetLevel: 'medium',
  additionalNotes: 'Cần đẩy mạnh trên TikTok',
  brandProfile: validBrandProfile
};
const parsedStep3 = step3Schema.safeParse(step3Input);
assert.equal(parsedStep3.success, true, 'step3Schema nhận brandProfile');

// 4. Kiểm tra rawAIIdeaSchema chấp nhận marketingLogic
const validIdeaWithLogic = {
  title: 'Chiến dịch Test 1',
  tagline: 'Tagline Test 1',
  channels: ['Facebook Ads', 'TikTok'],
  mainContent: 'Nội dung chiến lược mẫu cho chiến dịch',
  estimatedBudget: '25.000.000 VNĐ',
  targetAudience: 'Sinh viên và người đi làm',
  timeline: [
    { week: 1, title: 'Tuần 1', activities: ['Hoạt động 1'] },
    { week: 2, title: 'Tuần 2', activities: ['Hoạt động 2'] },
    { week: 3, title: 'Tuần 3', activities: ['Hoạt động 3'] },
    { week: 4, title: 'Tuần 4', activities: ['Hoạt động 4'] }
  ],
  marketingLogic: validLogic
};
const parsedIdea = rawAIIdeaSchema.safeParse(validIdeaWithLogic);
assert.equal(parsedIdea.success, true, 'rawAIIdeaSchema parse hợp lệ khi có marketingLogic');
assert.equal(parsedIdea.data.marketingLogic?.customerBarrierOrNeed, validLogic.customerBarrierOrNeed);

console.log('✅ ALL TASK 1 TESTS PASSED!');

