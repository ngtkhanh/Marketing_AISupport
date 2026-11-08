import assert from 'node:assert';
import { step1Schema, step2Schema, step3Schema, campaignInputSchema } from '../src/lib/schemas.ts';
import { VERIFIED_CASE_STUDIES } from '../src/lib/data/verified-case-studies.ts';
import { attachVerificationEvidence } from '../src/lib/evidence-generator.ts';
import { getFallbackMarketingIdeas } from '../src/lib/ai/mock-data.ts';
import { DEMO_SCENES, DEMO_DATA } from '../src/lib/data/demo-data.ts';

console.log('🚀 Bắt đầu kiểm thử tích hợp toàn diện P1 (End-to-End Suite)...');

// 1. Kiểm thử Form 3 bước Validation (Zod Schemas)
console.log('1. Kiểm thử Form 3 bước (Step Schemas)...');

// Bước 1: Thiếu trường bắt buộc -> Fail; Đủ -> Pass
const step1Invalid = step1Schema.safeParse({ industry: '', productName: '' });
assert(!step1Invalid.success, 'Step 1 rỗng phải fail validation');
const step1Valid = step1Schema.safeParse({
  industry: 'F&B (Đồ uống & Trà sữa)',
  productName: 'Trà Sữa Trân Châu Mộc Trà'
});
assert(step1Valid.success, 'Step 1 đủ trường phải pass validation');

// Bước 2: Thiếu mục tiêu -> Fail; Đủ -> Pass
const step2Invalid = step2Schema.safeParse({ objective: '' });
assert(!step2Invalid.success, 'Step 2 rỗng phải fail validation');
const step2Valid = step2Schema.safeParse({
  objective: 'Tăng tương tác và độ nhận diện trong giới học sinh sinh viên',
  targetAudiencePrompt: 'Học sinh, sinh viên 16–25 tuổi',
  keyDifferentiator: 'Trân châu tươi làm thủ công'
});
assert(step2Valid.success, 'Step 2 đủ trường phải pass validation');

// Bước 3: Đủ ngân sách -> Pass
const step3Valid = step3Schema.safeParse({
  budgetLevel: 'low',
  additionalNotes: 'Tập trung kênh TikTok',
  sellingArea: 'Hà Nội & TP.HCM',
  specificBudgetVnd: 15000000
});
assert(step3Valid.success, 'Step 3 phải pass validation');

// Full Input
const fullInput = {
  industry: 'F&B',
  productName: 'Trà Sữa Mộc Trà',
  objective: 'Tăng nhận diện thương hiệu tại khu vực',
  budgetLevel: 'low',
  targetAudiencePrompt: 'Sinh viên đại học',
  sellingArea: 'Hà Nội'
};
const fullParsed = campaignInputSchema.safeParse(fullInput);
assert(fullParsed.success, 'CampaignInput hoàn chỉnh phải pass');

// 2. Kiểm thử Kho Case Study & Evidence Generator
console.log('2. Kiểm thử Kho Case Study & Evidence Generator...');
assert(VERIFIED_CASE_STUDIES.length >= 8, `Kho case study phải có ít nhất 8 case, hiện có ${VERIFIED_CASE_STUDIES.length}`);

for (const cs of VERIFIED_CASE_STUDIES) {
  assert(cs.id && typeof cs.id === 'string', 'Case study phải có id');
  assert(cs.brandOrEntity && typeof cs.brandOrEntity === 'string', 'Case study phải có brandOrEntity');
  assert(cs.source.url.startsWith('https://'), `URL case study "${cs.brandOrEntity}" phải bắt đầu bằng https://`);
  assert(cs.source.publisher && typeof cs.source.publisher === 'string', 'Phải có nhà xuất bản');
  assert(cs.applicabilityScope.limitations && cs.applicabilityScope.limitations.length > 10, 'Phải nêu rõ giới hạn');
}

// 3. Kiểm thử Sinh ý tưởng dự phòng và gắn Evidence
console.log('3. Kiểm thử sinh ý tưởng và tự động gắn Verification Evidence...');
const levels = ['low', 'medium', 'high'];

for (const lvl of levels) {
  const ideas = getFallbackMarketingIdeas({
    industry: 'Thời trang',
    productName: 'Áo khoác gió thể thao',
    budgetLevel: lvl,
    objective: 'Ra mắt bộ sưu tập mới mùa đông'
  });

  assert.strictEqual(ideas.length, 5, `Mức ${lvl} phải sinh đúng 5 ý tưởng`);

  for (const idea of ideas) {
    assert(idea.id, 'Ý tưởng phải có ID');
    assert(idea.title, 'Ý tưởng phải có Tiêu đề');
    assert(idea.timeline.length === 4, 'Ý tưởng phải có đúng 4 tuần');
    assert(idea.verificationEvidence, 'Ý tưởng phải có verificationEvidence đính kèm');
    assert(idea.verificationEvidence.miniExperiment, 'Phải có kế hoạch thử nghiệm nhỏ');
    assert(idea.verificationEvidence.miniExperiment.decisionCriteria.proceed, 'Phải có tiêu chí Đi tiếp');
    assert(idea.verificationEvidence.miniExperiment.decisionCriteria.stop, 'Phải có tiêu chí Dừng');

    if (idea.verificationEvidence.hasCaseStudy) {
      assert(idea.verificationEvidence.caseStudy, 'Nếu hasCaseStudy=true thì phải có caseStudy object');
      assert(idea.verificationEvidence.caseStudy.source.url.startsWith('https://'), 'URL case study phải hợp lệ');
    } else {
      assert(idea.verificationEvidence.missingCaseStudyNotice, 'Nếu hasCaseStudy=false thì phải có missingCaseStudyNotice');
    }
  }
}

// 4. Kiểm thử Demo Data
console.log('4. Kiểm thử dữ liệu mô phỏng Demo...');
assert.strictEqual(DEMO_SCENES.length, 3, 'Demo phải có đúng 3 cảnh');
assert.strictEqual(DEMO_DATA.sampleIdeas.length, 5, 'Demo data phải có 5 ý tưởng mẫu');
assert(DEMO_DATA.sampleIdeas[0].timeline.length === 4, 'Ý tưởng demo #1 phải có timeline 4 tuần');

console.log('🎉 TẤT CẢ CÁC ĐIỀU KIỆN KIỂM THỬ TÍCH HỢP P1 ĐÃ VƯỢT QUA 100%!');

