import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// 1. Kiểm tra cấu trúc CampaignForm.tsx
const formPath = path.resolve('src/components/CampaignForm.tsx');
assert(fs.existsSync(formPath), 'src/components/CampaignForm.tsx phải tồn tại');

const formContent = fs.readFileSync(formPath, 'utf8');
assert(formContent.includes('currentStep'), 'CampaignForm phải có state currentStep quản lý 3 bước');
assert(formContent.includes('Bước 1') || formContent.includes('1/3'), 'CampaignForm phải hiển thị chỉ báo bước 1/3');
assert(formContent.includes('Bước 2') || formContent.includes('2/3'), 'CampaignForm phải hiển thị chỉ báo bước 2/3');
assert(formContent.includes('Bước 3') || formContent.includes('3/3'), 'CampaignForm phải hiển thị chỉ báo bước 3/3');
assert(formContent.includes('Quay lại'), 'CampaignForm phải có nút Quay lại để chuyển bước trước');
assert(formContent.includes('Tiếp tục'), 'CampaignForm phải có nút Tiếp tục để chuyển bước sau');
assert(formContent.includes('Bổ sung bối cảnh') || formContent.includes('bối cảnh để đề xuất sát hơn'), 'CampaignForm phải có accordion bối cảnh tùy chọn');
assert(formContent.includes('Tóm tắt') || formContent.includes('Xác nhận'), 'CampaignForm phải có khối tóm tắt ở bước 3');

// 2. Kiểm tra CampaignContext.tsx hỗ trợ các trường bối cảnh tùy chọn
const contextPath = path.resolve('src/context/CampaignContext.tsx');
const contextContent = fs.readFileSync(contextPath, 'utf8');
assert(contextContent.includes('targetAudiencePrompt'), 'CampaignContext phải lưu trữ targetAudiencePrompt');
assert(contextContent.includes('sellingArea'), 'CampaignContext phải lưu trữ sellingArea');
assert(contextContent.includes('keyDifferentiator'), 'CampaignContext phải lưu trữ keyDifferentiator');

console.log('✅ Task 2 Test Passed: Wizard 3-Step Form & Contextual Brief properly structured!');

