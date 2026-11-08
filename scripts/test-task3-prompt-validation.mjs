import assert from 'node:assert/strict';
import { buildSystemPrompt, buildUserPrompt } from '../src/lib/ai/prompt.ts';
import { validateMarketingOutput, validateSingleIdeaMarketingOutput } from '../src/lib/ai/validate-output.ts';
import { getFallbackMarketingIdeas } from '../src/lib/ai/mock-data.ts';

console.log('--- TEST TASK 3: Prompt Engineering & Output Validation ---');

const sampleInputWithBrand = {
  industry: 'F&B',
  productName: 'Cà phê ủ lạnh lon tiện lợi',
  budgetLevel: 'low',
  objective: 'Tăng doanh số bán hàng online',
  brandProfile: {
    brandToneAdjectives: ['Tươi mới', 'Sáng tạo', 'Độc bản'],
    permittedClaims: '100% hạt Arabica Cầu Đất nguyên chất không hương liệu',
    wordsToAvoid: 'Rẻ nhất, Cam kết số 1'
  }
};

// 1. Kiểm tra buildSystemPrompt chứa chỉ dẫn sinh marketingLogic 5 thành phần
const systemPrompt = buildSystemPrompt(sampleInputWithBrand);
assert.ok(systemPrompt.includes('marketingLogic'), 'System prompt phải yêu cầu trường marketingLogic');
assert.ok(systemPrompt.includes('customerBarrierOrNeed'), 'System prompt phải có customerBarrierOrNeed');
assert.ok(systemPrompt.includes('productBenefitAndProof'), 'System prompt phải có productBenefitAndProof');
assert.ok(systemPrompt.includes('campaignMechanism'), 'System prompt phải có campaignMechanism');
assert.ok(systemPrompt.includes('desiredAction'), 'System prompt phải có desiredAction');
assert.ok(systemPrompt.includes('successRequirements'), 'System prompt phải có successRequirements');

// 2. Kiểm tra buildUserPrompt chứa thông tin Hồ sơ thương hiệu
const userPrompt = buildUserPrompt(sampleInputWithBrand);
assert.ok(userPrompt.includes('<ho_so_thuong_hieu>'), 'User prompt phải chứa thẻ <ho_so_thuong_hieu>');
assert.ok(userPrompt.includes('Tươi mới, Sáng tạo, Độc bản'), 'User prompt phải chứa 3 tính từ giọng điệu');
assert.ok(userPrompt.includes('100% hạt Arabica'), 'User prompt phải chứa bằng chứng khẳng định');
assert.ok(userPrompt.includes('Rẻ nhất, Cam kết số 1'), 'User prompt phải chứa từ ngữ cần tránh');

// 3. Kiểm tra validateMarketingOutput và validateSingleIdeaMarketingOutput bắt lỗi vi phạm từ ngữ cần tránh (wordsToAvoid)
const badIdea = {
  id: 'test-bad',
  title: 'Cà phê lon Rẻ Nhất thị trường',
  tagline: 'Cam kết số 1 về giá và chất lượng',
  channels: ['Facebook Organic', 'TikTok'],
  mainContent: 'Uống cà phê giá rẻ nhất để tiết kiệm chi phí mỗi sáng.',
  estimatedBudget: '5.000.000 VNĐ',
  targetAudience: 'Sinh viên',
  timeline: [
    { week: 1, title: 'Tuần 1', activities: ['Đăng bài TikTok'] },
    { week: 2, title: 'Tuần 2', activities: ['Đăng bài Facebook'] },
    { week: 3, title: 'Tuần 3', activities: ['Livestream TikTok'] },
    { week: 4, title: 'Tuần 4', activities: ['Tổng kết chương trình'] }
  ],
  marketingLogic: {
    customerBarrierOrNeed: 'Cần cà phê rẻ nhất',
    productBenefitAndProof: 'Rẻ nhất và ngon nhất',
    campaignMechanism: 'Kích hoạt mua giá rẻ',
    desiredAction: 'Bấm mua ngay',
    successRequirements: 'Chuẩn bị hàng'
  }
};

// 3a. Kiểm tra cho ý tưởng đơn lẻ
const singleRes = validateSingleIdeaMarketingOutput(badIdea, 'low', sampleInputWithBrand.brandProfile);
assert.equal(singleRes.valid, false, 'validateSingleIdeaMarketingOutput phải phát hiện lỗi vi phạm wordsToAvoid');
assert.ok(
  singleRes.errors.some((err) => err.toLowerCase().includes('rẻ nhất') || err.toLowerCase().includes('cam kết số 1')),
  'Lỗi phải chỉ rõ từ ngữ bị cấm'
);

// 3b. Kiểm tra cho mảng 5 ý tưởng
const fiveIdeas = [badIdea, ...getFallbackMarketingIdeas(sampleInputWithBrand).slice(1)];
const validationRes = validateMarketingOutput(fiveIdeas, sampleInputWithBrand);
assert.equal(validationRes.valid, false, 'Validator phải phát hiện lỗi vi phạm wordsToAvoid');
assert.ok(
  validationRes.errors.some((err) => err.toLowerCase().includes('rẻ nhất') || err.toLowerCase().includes('cam kết số 1')),
  'Lỗi phải chỉ rõ từ ngữ bị cấm'
);

console.log('✅ ALL TASK 3 TESTS PASSED!');
