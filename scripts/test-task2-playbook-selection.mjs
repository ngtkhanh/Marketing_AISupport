import assert from 'node:assert/strict';
import { selectPlaybooksForContext, formatPlaybooksForPrompt, MARKETING_PLAYBOOKS } from '../src/lib/ai/playbooks.ts';
import { getFallbackMarketingIdeas } from '../src/lib/ai/mock-data.ts';

console.log('--- TEST TASK 2: Context-Aware Playbook Selection & Mock Logic ---');

// 1. Kiểm tra thuộc tính mở rộng của các Playbook trong kho
for (const level of ['low', 'medium', 'high']) {
  const list = MARKETING_PLAYBOOKS[level];
  assert.ok(list.length >= 5, `Mức ngân sách ${level} phải có ít nhất 5 playbook`);
  for (const p of list) {
    assert.ok(Array.isArray(p.applicableObjectives), `Playbook ${p.id} thiếu applicableObjectives`);
    assert.ok(typeof p.buyerJourneyStage === 'string', `Playbook ${p.id} thiếu buyerJourneyStage`);
    assert.ok(Array.isArray(p.prerequisites), `Playbook ${p.id} thiếu prerequisites`);
    assert.ok(p.requiredResources && typeof p.requiredResources.effortLevel === 'string', `Playbook ${p.id} thiếu requiredResources`);
    assert.ok(typeof p.whenToAvoid === 'string', `Playbook ${p.id} thiếu whenToAvoid`);
    assert.ok(typeof p.selectionRationale === 'string', `Playbook ${p.id} thiếu selectionRationale`);
  }
}

// 2. Kiểm tra hàm selectPlaybooksForContext
// Case A: Ngân sách Thấp + Bán hàng nhanh + Khách hàng mới (không có khách cũ)
const inputSalesLow = {
  industry: 'F&B',
  productName: 'Trà trái cây tươi',
  budgetLevel: 'low',
  objective: 'Tăng doanh số bán hàng nhanh',
  availableResources: 'Cửa hàng mới mở, chưa có khách quen, 1 nhân sự phụ trách marketing'
};
const selectedA = selectPlaybooksForContext(inputSalesLow);
assert.equal(selectedA.length, 5, 'Phải chọn đúng 5 playbook');
const strategiesA = new Set(selectedA.map((p) => p.strategyType));
assert.equal(strategiesA.size, 5, '5 playbook phải có 5 strategyType khác nhau');
// Referral đòi hỏi tệp khách cũ -> khi chưa có khách quen, không nên đưa Referral lên top 1-2
const firstPlaybookA = selectedA[0];
assert.notEqual(firstPlaybookA.id, 'low-referral-loyalty', 'Cửa hàng mới chưa có khách quen thì không chọn Referral làm ưu tiên hàng đầu');

// Case B: Ngân sách Cao + Nhận diện thương hiệu đại chúng
const inputAwarenessHigh = {
  industry: 'Thời trang',
  productName: 'Bộ sưu tập Thu Đông',
  budgetLevel: 'high',
  objective: 'Gia tăng nhận diện thương hiệu phủ sóng toàn quốc'
};
const selectedB = selectPlaybooksForContext(inputAwarenessHigh);
assert.equal(selectedB.length, 5, 'Phải chọn đúng 5 playbook cho ngân sách cao');
const hasMassCampaign = selectedB.some((p) => p.applicableObjectives.includes('awareness'));
assert.ok(hasMassCampaign, 'Phải có playbook phù hợp với mục tiêu awareness');

// 3. Kiểm tra formatPlaybooksForPrompt đưa đủ thông tin điều kiện tiên quyết & trường hợp nên tránh
const formattedPrompt = formatPlaybooksForPrompt(selectedA);
assert.ok(formattedPrompt.includes('Điều kiện tiên quyết:'), 'Prompt phải có Điều kiện tiên quyết');
assert.ok(formattedPrompt.includes('Trường hợp nên tránh:'), 'Prompt phải có Trường hợp nên tránh');
assert.ok(formattedPrompt.includes('Căn cứ phù hợp:'), 'Prompt phải có Căn cứ phù hợp');

// 4. Kiểm tra Mock Fallback có chứa marketingLogic đầy đủ
const fallbackIdeas = getFallbackMarketingIdeas(inputSalesLow);
assert.equal(fallbackIdeas.length, 5, 'Fallback phải có 5 ý tưởng');
for (const idea of fallbackIdeas) {
  assert.ok(idea.marketingLogic, `Ý tưởng ${idea.title} phải có marketingLogic`);
  assert.ok(idea.marketingLogic.customerBarrierOrNeed.length >= 5, 'customerBarrierOrNeed phải >= 5 ký tự');
  assert.ok(idea.marketingLogic.productBenefitAndProof.length >= 5, 'productBenefitAndProof phải >= 5 ký tự');
  assert.ok(idea.marketingLogic.campaignMechanism.length >= 5, 'campaignMechanism phải >= 5 ký tự');
  assert.ok(idea.marketingLogic.desiredAction.length >= 5, 'desiredAction phải >= 5 ký tự');
  assert.ok(idea.marketingLogic.successRequirements.length >= 5, 'successRequirements phải >= 5 ký tự');
}

console.log('✅ ALL TASK 2 TESTS PASSED!');

