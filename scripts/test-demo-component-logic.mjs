import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// 1. Kiểm tra file src/lib/data/demo-data.ts
const demoDataPath = path.resolve('src/lib/data/demo-data.ts');
assert(fs.existsSync(demoDataPath), 'src/lib/data/demo-data.ts phải tồn tại');

const demoDataContent = fs.readFileSync(demoDataPath, 'utf8');
assert(demoDataContent.includes('DEMO_SCENES'), 'demo-data.ts phải export DEMO_SCENES');
assert(demoDataContent.includes('Nhập thông tin') || demoDataContent.includes('scene1'), 'Phải có Cảnh 1');
assert(demoDataContent.includes('Xem kết quả') || demoDataContent.includes('scene2'), 'Phải có Cảnh 2');
assert(demoDataContent.includes('Lưu') || demoDataContent.includes('scene3'), 'Phải có Cảnh 3');

// 2. Kiểm tra file src/components/SelfRunningDemo.tsx
const demoComponentPath = path.resolve('src/components/SelfRunningDemo.tsx');
assert(fs.existsSync(demoComponentPath), 'src/components/SelfRunningDemo.tsx phải tồn tại');

const demoCompContent = fs.readFileSync(demoComponentPath, 'utf8');
assert(demoCompContent.includes('Minh họa cách sử dụng'), 'Phải có nhãn "Minh họa cách sử dụng"');
assert(demoCompContent.includes('Tạm dừng') || demoCompContent.includes('Tiếp tục'), 'Phải có nút điều khiển Tạm dừng / Tiếp tục');
assert(demoCompContent.includes('Xem lại'), 'Phải có nút Xem lại');
assert(demoCompContent.includes('Bắt đầu với sản phẩm của tôi'), 'Phải có nút CTA "Bắt đầu với sản phẩm của tôi"');
assert(demoCompContent.includes('prefers-reduced-motion') || demoCompContent.includes('reducedMotion'), 'Phải tôn trọng prefers-reduced-motion');

// 3. Kiểm tra page.tsx đã tích hợp SelfRunningDemo
const pagePath = path.resolve('src/app/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');
assert(pageContent.includes('SelfRunningDemo'), 'src/app/page.tsx phải render SelfRunningDemo');

console.log('✅ Task 4 Test Passed: SelfRunningDemo & Demo Data properly structured!');

