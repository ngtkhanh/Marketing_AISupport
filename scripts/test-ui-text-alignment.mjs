import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Kiểm thử Task 4: UI Text Alignment & Budget Sync Warnings...');

const kpiMatrixPath = path.resolve('src/components/proposal/KpiScenariosMatrix.tsx');
const proposalModalPath = path.resolve('src/components/proposal/ProposalModal.tsx');
const executiveBannerPath = path.resolve('src/components/proposal/ExecutiveDecisionBanner.tsx');

const kpiMatrixCode = fs.readFileSync(kpiMatrixPath, 'utf8');
const proposalModalCode = fs.readFileSync(proposalModalPath, 'utf8');
const executiveBannerCode = fs.readFileSync(executiveBannerPath, 'utf8');

// 1. Kiểm tra loại bỏ benchmark không nguồn và nhãn Khuyên Dùng
assert.strictEqual(
  kpiMatrixCode.includes('benchmark SME'),
  false,
  'KpiScenariosMatrix không được chứa cụm từ "benchmark SME"'
);
assert.strictEqual(
  kpiMatrixCode.includes('Khuyên Dùng'),
  false,
  'KpiScenariosMatrix không được chứa nhãn "Khuyên Dùng"'
);

// 2. Kiểm tra có hiển thị nhãn giả định và phễu chuyển đổi
assert(
  kpiMatrixCode.includes('Giả định') || kpiMatrixCode.includes('funnelSteps'),
  'KpiScenariosMatrix phải hiển thị nhãn giả định minh họa hoặc phễu chuyển đổi'
);

// 3. Kiểm tra ProposalModal có cảnh báo khi ngân sách bị thay đổi
assert(
  proposalModalCode.includes('Ngân sách đã thay đổi') || proposalModalCode.includes('Cần cập nhật'),
  'ProposalModal phải có cảnh báo khi ngân sách thay đổi chưa đồng bộ với KPI'
);

// 4. Kiểm tra ExecutiveDecisionBanner hiển thị trạng thái nháp
assert(
  executiveBannerCode.includes('Nháp') || executiveBannerCode.includes('draft'),
  'ExecutiveDecisionBanner phải thể hiện trạng thái bản nháp'
);

console.log('✅ Task 4 Test Passed: UI Text Alignment & Warnings verified!');

