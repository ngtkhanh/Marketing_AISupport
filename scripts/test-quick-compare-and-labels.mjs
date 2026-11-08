import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 BẮT ĐẦU KIỂM THỬ: THỐNG NHẤT NHÃN ĐỀ XUẤT & GIAO DIỆN TRANG CHỦ\n');

// 1. Kiểm tra tính thống nhất của nhãn nút trên toàn bộ UI components
console.log('1. Kiểm tra tính thống nhất của nhãn nút ("Xem bản đề xuất")...');
const ideaCardContent = fs.readFileSync(path.resolve('src/components/IdeaCard.tsx'), 'utf-8');
const shortlistItemContent = fs.readFileSync(path.resolve('src/components/ShortlistItem.tsx'), 'utf-8');

assert(
  ideaCardContent.includes('<span>Xem bản đề xuất</span>'),
  'IdeaCard.tsx phải có nhãn nút là "Xem bản đề xuất"'
);
assert(
  !ideaCardContent.includes('Mở Proposal'),
  'IdeaCard.tsx không được còn nhãn "Mở Proposal"'
);
assert(
  !ideaCardContent.includes('<span>Xem kế hoạch</span>'),
  'IdeaCard.tsx không được còn nhãn "<span>Xem kế hoạch</span>"'
);

assert(
  shortlistItemContent.includes('<span>Xem bản đề xuất</span>'),
  'ShortlistItem.tsx phải có nhãn nút là "Xem bản đề xuất"'
);
assert(
  !shortlistItemContent.includes('Mở Proposal'),
  'ShortlistItem.tsx không được còn nhãn "Mở Proposal"'
);
assert(
  !shortlistItemContent.includes('Lập Proposal'),
  'ShortlistItem.tsx không được còn nhãn "Lập Proposal"'
);

console.log('  ✅ PASS: Nhãn nút đã thống nhất tuyệt đối thành "Xem bản đề xuất".\n');

// 2. Kiểm tra HomePage đã dọn dẹp sạch sẽ, không còn nút so sánh gây rối
console.log('2. Kiểm tra HomePage không còn nút/modal so sánh nhanh gây rối mắt...');
const homePageContent = fs.readFileSync(path.resolve('src/app/page.tsx'), 'utf-8');

assert(
  !homePageContent.includes('QuickCompareModal'),
  'src/app/page.tsx không còn import hay sử dụng QuickCompareModal'
);
assert(
  !homePageContent.includes('So sánh nhanh 5 ý tưởng'),
  'src/app/page.tsx không còn nút "So sánh nhanh 5 ý tưởng"'
);

console.log('  ✅ PASS: HomePage sạch sẽ, tập trung tối đa vào danh sách ý tưởng.\n');

console.log('🎉 TOÀN BỘ CÁC BÀI KIỂM THỬ ĐÃ THÀNH CÔNG VẺ VANG!');
