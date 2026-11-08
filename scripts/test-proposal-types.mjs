import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// 1. Kiểm tra file vocabulary.ts tồn tại và có các định nghĩa chuẩn hóa
const vocabPath = path.resolve('src/lib/constants/vocabulary.ts');
assert(fs.existsSync(vocabPath), 'File src/lib/constants/vocabulary.ts phải tồn tại');

const vocabContent = fs.readFileSync(vocabPath, 'utf8');
assert(vocabContent.includes('MARKETING_VOCABULARY'), 'Phải export MARKETING_VOCABULARY');
assert(vocabContent.includes('Ý tưởng đã lưu'), 'Shortlist phải được dịch thành "Ý tưởng đã lưu"');
assert(vocabContent.includes('Bản đề xuất'), 'Proposal phải được dịch thành "Bản đề xuất"');
assert(vocabContent.includes('Điều chỉnh ý tưởng'), 'Refinement phải được dịch thành "Điều chỉnh ý tưởng"');
assert(vocabContent.includes('Hành động muốn khách hàng thực hiện'), 'CTA phải được giải thích rõ');
assert(vocabContent.includes('Khách hàng tiềm năng'), 'Lead phải được dịch là Khách hàng tiềm năng');
assert(vocabContent.includes('Chỉ số đánh giá'), 'KPI phải được dịch là Chỉ số đánh giá');
assert(vocabContent.includes('Giả thuyết'), 'Insight phải được dịch có chứa "Giả thuyết"');

// 2. Kiểm tra src/types/proposal.ts có DataProvenance, ObjectiveType và ProposalStatus draft
const proposalTypePath = path.resolve('src/types/proposal.ts');
const proposalTypeContent = fs.readFileSync(proposalTypePath, 'utf8');
assert(proposalTypeContent.includes('DataProvenance'), 'src/types/proposal.ts phải có DataProvenance');
assert(proposalTypeContent.includes("'user_provided'"), 'DataProvenance phải có user_provided');
assert(proposalTypeContent.includes("'calculated'"), 'DataProvenance phải có calculated');
assert(proposalTypeContent.includes("'assumption'"), 'DataProvenance phải có assumption');
assert(proposalTypeContent.includes('ObjectiveType'), 'src/types/proposal.ts phải có ObjectiveType');
assert(proposalTypeContent.includes("'draft'"), 'ProposalStatus phải hỗ trợ status draft');

console.log('✅ Task 1 Test Passed: Types & Vocabulary definitions verified!');

