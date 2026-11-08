import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// 1. Kiểm tra file src/types/case-study.ts tồn tại và có các định nghĩa type
const caseStudyTypePath = path.resolve('src/types/case-study.ts');
assert(fs.existsSync(caseStudyTypePath), 'File src/types/case-study.ts phải tồn tại');

const caseStudyContent = fs.readFileSync(caseStudyTypePath, 'utf8');
assert(caseStudyContent.includes('export interface VerifiedCaseStudy'), 'Phải export VerifiedCaseStudy');
assert(caseStudyContent.includes('export interface MiniExperimentPlan'), 'Phải export MiniExperimentPlan');
assert(caseStudyContent.includes('export interface IdeaVerificationEvidence'), 'Phải export IdeaVerificationEvidence');
assert(caseStudyContent.includes('brandOrEntity'), 'VerifiedCaseStudy phải có brandOrEntity');
assert(caseStudyContent.includes('publisher'), 'VerifiedCaseStudy phải có publisher trong source');
assert(caseStudyContent.includes('decisionCriteria'), 'MiniExperimentPlan phải có decisionCriteria');
assert(caseStudyContent.includes('proceed'), 'decisionCriteria phải có proceed');
assert(caseStudyContent.includes('stop'), 'decisionCriteria phải có stop');

// 2. Kiểm tra src/types/marketing.ts có CampaignContextualInput và verificationEvidence
const marketingTypePath = path.resolve('src/types/marketing.ts');
const marketingContent = fs.readFileSync(marketingTypePath, 'utf8');
assert(marketingContent.includes('CampaignContextualInput'), 'src/types/marketing.ts phải có CampaignContextualInput');
assert(marketingContent.includes('targetAudiencePrompt'), 'CampaignContextualInput phải có targetAudiencePrompt');
assert(marketingContent.includes('verificationEvidence'), 'MarketingIdea phải có verificationEvidence');

// 3. Kiểm tra src/lib/schemas.ts có step1Schema, step2Schema, step3Schema
const schemasPath = path.resolve('src/lib/schemas.ts');
const schemasContent = fs.readFileSync(schemasPath, 'utf8');
assert(schemasContent.includes('export const step1Schema'), 'src/lib/schemas.ts phải export step1Schema');
assert(schemasContent.includes('export const step2Schema'), 'src/lib/schemas.ts phải export step2Schema');
assert(schemasContent.includes('export const step3Schema'), 'src/lib/schemas.ts phải export step3Schema');

console.log('✅ Task 1 Test Passed: Models and Schemas properly defined!');

