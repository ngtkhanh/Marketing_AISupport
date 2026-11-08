import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// 1. Kiểm tra AILoadingStatus.tsx
const loadingPath = path.resolve('src/components/AILoadingStatus.tsx');
assert(fs.existsSync(loadingPath), 'src/components/AILoadingStatus.tsx phải tồn tại');

const loadingContent = fs.readFileSync(loadingPath, 'utf8');
assert(!loadingContent.includes('setProgress(Math.min(92'), 'AILoadingStatus không được dùng phần trăm giả lập 92%');
assert(loadingContent.includes('elapsedSeconds'), 'AILoadingStatus phải có bộ đếm thời gian thực elapsedSeconds');
assert(loadingContent.includes('thời gian phản hồi') || loadingContent.includes('Đã trôi qua'), 'AILoadingStatus phải hiển thị thông điệp thời gian thực tế');

// 2. Kiểm tra IdeaCard.tsx
const ideaCardPath = path.resolve('src/components/IdeaCard.tsx');
assert(fs.existsSync(ideaCardPath), 'src/components/IdeaCard.tsx phải tồn tại');

const ideaCardContent = fs.readFileSync(ideaCardPath, 'utf8');
assert(ideaCardContent.includes('Căn cứ') || ideaCardContent.includes('kiểm chứng'), 'IdeaCard phải có phần hiển thị Căn cứ và cách kiểm chứng');
assert(ideaCardContent.includes('verificationEvidence'), 'IdeaCard phải đọc verificationEvidence từ idea');
assert(ideaCardContent.includes('miniExperiment'), 'IdeaCard phải render kế hoạch thử nghiệm nhỏ miniExperiment');

// 3. Kiểm tra ShortlistItem.tsx
const shortlistItemPath = path.resolve('src/components/ShortlistItem.tsx');
assert(fs.existsSync(shortlistItemPath), 'src/components/ShortlistItem.tsx phải tồn tại');

const shortlistItemContent = fs.readFileSync(shortlistItemPath, 'utf8');
assert(shortlistItemContent.includes('verificationEvidence') || shortlistItemContent.includes('Căn cứ') || shortlistItemContent.includes('kiểm chứng'), 'ShortlistItem phải hỗ trợ hiển thị căn cứ kiểm chứng');

console.log('✅ Task 5 Test Passed: Real Loading Timer & Evidence UI properly structured!');

