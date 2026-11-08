import assert from 'node:assert/strict';
import { campaignInputSchema, rawAIResponseSchema } from '../src/lib/schemas.ts';
import { selectPlaybooksForContext, formatPlaybooksForPrompt } from '../src/lib/ai/playbooks.ts';
import { buildSystemPrompt, buildUserPrompt } from '../src/lib/ai/prompt.ts';
import { getFallbackMarketingIdeas } from '../src/lib/ai/mock-data.ts';
import { validateMarketingOutput } from '../src/lib/ai/validate-output.ts';
import { evaluateStrategy } from '../src/lib/comparison-analysis.ts';

console.log('=== INTEGRATION TEST: SECTIONS 4, 5, 7 END-TO-END ===');

// 1. Brief tích hợp đa tầng (Mục 4 & 5)
const testInput = {
  industry: 'F&B (Đồ uống & Trà đóng chai)',
  productName: 'Kombucha Trái Cây Lên Men Tự Nhiên',
  budgetLevel: 'medium',
  objective: 'Gia tăng doanh số bán hàng trên các kênh online',
  additionalNotes: 'Tập trung kênh TikTok và các minigame viral',
  targetAudiencePrompt: 'Người làm việc văn phòng 22–35 tuổi quan tâm sức khỏe và tiêu hóa',
  sellingArea: 'Hà Nội & TP.HCM',
  productPrice: '45.000 VNĐ / chai',
  keyDifferentiator: 'Lên men thủ công 21 ngày với con giống SCOBY hữu cơ nhập khẩu',
  availableResources: 'Đã có fanpage 5.000 like, 2 nhân sự vận hành online',
  specificBudgetVnd: 45000000,
  brandProfile: {
    brandToneAdjectives: ['Tươi trẻ', 'Khoa học', 'Đáng tin cậy'],
    permittedClaims: '100% men sống tự nhiên không chất bảo quản',
    wordsToAvoid: 'Thần dược, Trị bách bệnh, Rẻ nhất thị trường'
  }
};

// 2. Validate input schema
const parsedInputResult = campaignInputSchema.safeParse(testInput);
assert.equal(parsedInputResult.success, true, 'Campaign input hợp lệ với schema');
const validatedInput = parsedInputResult.data;

// 3. Kiểm tra chọn Playbook theo tình huống (Mục 4)
const selectedPlaybooks = selectPlaybooksForContext(validatedInput);
assert.equal(selectedPlaybooks.length, 5, 'Phải chọn đúng 5 playbook');
const strategyTypes = new Set(selectedPlaybooks.map((p) => p.strategyType));
assert.equal(strategyTypes.size, 5, '5 playbook phải đa dạng về thể loại chiến lược');

for (const pb of selectedPlaybooks) {
  assert.ok(pb.prerequisites && pb.prerequisites.length > 0, `Playbook ${pb.name} phải có điều kiện tiên quyết`);
  assert.ok(pb.requiredResources && pb.requiredResources.effortLevel, `Playbook ${pb.name} phải có thông tin nguồn lực`);
  assert.ok(pb.whenToAvoid, `Playbook ${pb.name} phải có trường hợp nên tránh`);
  assert.ok(pb.selectionRationale, `Playbook ${pb.name} phải có căn cứ lựa chọn`);
}

// 4. Kiểm tra Prompt Engineering tích hợp Hồ sơ thương hiệu (Mục 5)
const systemPrompt = buildSystemPrompt(validatedInput);
assert.ok(systemPrompt.includes('marketingLogic'), 'System prompt phải yêu cầu trường marketingLogic');

const userPrompt = buildUserPrompt(validatedInput);
assert.ok(userPrompt.includes('<ho_so_thuong_hieu>'), 'User prompt phải chứa thẻ <ho_so_thuong_hieu>');
assert.ok(userPrompt.includes('Tươi trẻ, Khoa học, Đáng tin cậy'), 'User prompt phải có 3 tính từ giọng thương hiệu');
assert.ok(userPrompt.includes('Thần dược, Trị bách bệnh'), 'User prompt phải có từ cấm');

// 5. Kiểm tra Sinh Mock Fallback & Schema Parsing
const mockIdeas = getFallbackMarketingIdeas(validatedInput);
assert.equal(mockIdeas.length, 5, 'Fallback mock phải có đúng 5 ý tưởng');

const parsedResponse = rawAIResponseSchema.safeParse({ ideas: mockIdeas });
assert.equal(parsedResponse.success, true, 'Mock ideas phải thỏa mãn rawAIResponseSchema');

// 6. Kiểm tra cấu trúc marketingLogic 5 thành phần trong từng ý tưởng (Mục 5)
for (const idea of mockIdeas) {
  assert.ok(idea.marketingLogic, `Ý tưởng "${idea.title}" phải có marketingLogic`);
  const ml = idea.marketingLogic;
  assert.ok(ml.customerBarrierOrNeed.length >= 5, 'customerBarrierOrNeed phải >= 5 ký tự');
  assert.ok(ml.productBenefitAndProof.length >= 5, 'productBenefitAndProof phải >= 5 ký tự');
  assert.ok(ml.campaignMechanism.length >= 5, 'campaignMechanism phải >= 5 ký tự');
  assert.ok(ml.desiredAction.length >= 5, 'desiredAction phải >= 5 ký tự');
  assert.ok(ml.successRequirements.length >= 5, 'successRequirements phải >= 5 ký tự');
}

// 7. Kiểm tra Output Validation (Lớp 3)
const validationRes = validateMarketingOutput(mockIdeas, validatedInput);
assert.equal(validationRes.valid, true, `Validation output phải hợp lệ (Lỗi: ${validationRes.errors.join(', ')})`);

// 8. Kiểm tra Logic so sánh đa chiều (Mục 7)
for (const idea of mockIdeas) {
  const evalResult = evaluateStrategy(idea, validatedInput);
  assert.ok(evalResult.complexityLevel, 'Phải có mức độ phức tạp');
  assert.ok(evalResult.requiredResources.length > 0, 'Phải có danh sách nguồn lực cần chuẩn bị');
  assert.ok(evalResult.keyRisks.length > 0, 'Phải có rủi ro chính');
  assert.ok(evalResult.mitigationTips.length > 0, 'Phải có giải pháp phòng tránh');
}

console.log('🎉 ALL INTEGRATION TESTS PASSED 100%!');

