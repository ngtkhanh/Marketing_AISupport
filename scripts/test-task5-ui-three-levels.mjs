import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

console.log('--- TEST TASK 5: 3-Level Reading UI & Menu Refactoring ---');

// 1. Kiểm tra IdeaCard.tsx
const ideaCardSource = readFileSync('src/components/IdeaCard.tsx', 'utf-8');

// Phải có menu dropdown thao tác phụ (MoreHorizontal / more-options)
assert.ok(
  ideaCardSource.includes('MoreHorizontal') || ideaCardSource.includes('Thao tác khác') || ideaCardSource.includes('isMenuOpen'),
  'IdeaCard phải có menu dropdown thao tác phụ'
);

// Phải ưu tiên 2 nút chính: Xem kế hoạch (Proposal) và Lưu ý tưởng (Shortlist)
assert.ok(
  ideaCardSource.includes('setIsProposalModalOpen(true)') && ideaCardSource.includes('handleToggleSave'),
  'IdeaCard phải ưu tiên 2 nút hành động chính: Xem kế hoạch & Lưu Shortlist'
);

// Phải render khối Logic Marketing (Mục 5)
assert.ok(
  ideaCardSource.includes('marketingLogic') && ideaCardSource.includes('customerBarrierOrNeed'),
  'IdeaCard phải hỗ trợ hiển thị khối Logic Marketing 5 thành phần'
);

// 2. Kiểm tra StrategyComparisonModal.tsx
const comparisonSource = readFileSync('src/components/StrategyComparisonModal.tsx', 'utf-8');

// Phải có các hàng tiêu chí đánh đổi, nguồn lực được tổ chức ưu tiên
assert.ok(
  comparisonSource.includes('Đánh đổi lớn nhất') || comparisonSource.includes('biggestTradeOff'),
  'Bảng so sánh phải có hàng Đánh đổi lớn nhất'
);
assert.ok(
  comparisonSource.includes('Nguồn lực cần có') || comparisonSource.includes('requiredResources'),
  'Bảng so sánh phải có hàng Nguồn lực cần có'
);

console.log('✅ ALL TASK 5 TESTS PASSED!');

