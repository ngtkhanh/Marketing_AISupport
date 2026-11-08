import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// 1. Kiểm tra file src/lib/data/verified-case-studies.ts tồn tại
const caseStudiesPath = path.resolve('src/lib/data/verified-case-studies.ts');
assert(fs.existsSync(caseStudiesPath), 'src/lib/data/verified-case-studies.ts phải tồn tại');

const caseStudiesContent = fs.readFileSync(caseStudiesPath, 'utf8');
assert(caseStudiesContent.includes('VERIFIED_CASE_STUDIES'), 'Phải export VERIFIED_CASE_STUDIES');
assert(caseStudiesContent.includes('The Coffee House') || caseStudiesContent.includes('the-coffee-house'), 'Phải có case The Coffee House');
assert(caseStudiesContent.includes('BAEMIN') || caseStudiesContent.includes('baemin'), 'Phải có case BAEMIN');
assert(caseStudiesContent.includes('Coolmate') || caseStudiesContent.includes('coolmate'), 'Phải có case Coolmate');
assert(caseStudiesContent.includes('https://'), 'Nguồn case study phải có URL https:// hợp lệ');
assert(caseStudiesContent.includes('verificationDate'), 'Nguồn case study phải có ngày kiểm tra verificationDate');
assert(caseStudiesContent.includes('limitations'), 'Case study phải nêu rõ giới hạn áp dụng limitations');

// 2. Kiểm tra file src/lib/evidence-generator.ts tồn tại
const generatorPath = path.resolve('src/lib/evidence-generator.ts');
assert(fs.existsSync(generatorPath), 'src/lib/evidence-generator.ts phải tồn tại');

const generatorContent = fs.readFileSync(generatorPath, 'utf8');
assert(generatorContent.includes('attachVerificationEvidence'), 'Phải export hàm attachVerificationEvidence');
assert(generatorContent.includes('miniExperiment'), 'attachVerificationEvidence phải tạo miniExperiment');
assert(generatorContent.includes('decisionCriteria'), 'miniExperiment phải có tiêu chí ra quyết định decisionCriteria');

// 3. Kiểm tra Route Handler và Mock Data đã tích hợp
const routePath = path.resolve('src/app/api/generate-ideas/route.ts');
const routeContent = fs.readFileSync(routePath, 'utf8');
assert(routeContent.includes('attachVerificationEvidence') || routeContent.includes('evidence-generator'), 'API Route phải tích hợp attachVerificationEvidence');

console.log('✅ Task 3 Test Passed: Verified Case Studies & Evidence Generator properly structured!');

