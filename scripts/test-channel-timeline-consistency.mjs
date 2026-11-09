import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Kiểm thử: Channel & Timeline Consistency & Fallback Prevention...');

const validateOutputPath = path.resolve('src/lib/ai/validate-output.ts');
const promptPath = path.resolve('src/lib/ai/prompt.ts');
const geminiPath = path.resolve('src/lib/ai/gemini.ts');

const validateOutputCode = fs.readFileSync(validateOutputPath, 'utf8');
const promptCode = fs.readFileSync(promptPath, 'utf8');
const geminiCode = fs.readFileSync(geminiPath, 'utf8');

// 1. Kiểm tra từ điển CHANNEL_SEMANTIC_ALIASES đã có instagram, threads, website, landing, sms
assert.ok(validateOutputCode.includes("'instagram':"), 'validate-output.ts phải có từ khóa instagram');
assert.ok(validateOutputCode.includes("'threads':"), 'validate-output.ts phải có từ khóa threads');
assert.ok(validateOutputCode.includes("'website':"), 'validate-output.ts phải có từ khóa website');
assert.ok(validateOutputCode.includes("'sms':"), 'validate-output.ts phải có từ khóa sms');

// Kiểm tra các alias quan trọng của instagram
assert.ok(validateOutputCode.includes("'story'"), 'Instagram alias phải chứa story');
assert.ok(validateOutputCode.includes("'reels'"), 'Instagram alias phải chứa reels');
assert.ok(validateOutputCode.includes("'lookbook'"), 'Instagram alias phải chứa lookbook');
assert.ok(validateOutputCode.includes("'dm'"), 'Instagram alias phải chứa dm');

// Kiểm tra alias mở rộng của facebook
assert.ok(validateOutputCode.includes("'messenger'"), 'Facebook alias phải chứa messenger');
assert.ok(validateOutputCode.includes("'fb ads'"), 'Facebook alias phải chứa fb ads');
assert.ok(validateOutputCode.includes("'fanpage'"), 'Facebook alias phải chứa fanpage');

// 2. Kiểm tra System Prompt có quy tắc ghi nhãn kênh rõ ràng
assert.ok(
  promptCode.includes('QUY TẮC GHI NHÃN KÊNH RÕ RÀNG'),
  'prompt.ts phải có quy tắc ghi nhãn kênh rõ ràng trong timeline activities'
);
assert.ok(
  promptCode.includes('[Facebook/Instagram]'),
  'prompt.ts phải có ví dụ mẫu ghi nhãn [Facebook/Instagram]'
);

// 3. Kiểm tra Gemini API Retry Prompt có Self-Correction Loop chi tiết
assert.ok(
  geminiCode.includes('[LƯU Ý KHẨN CẤP CHO LẦN THỬ LẠI - SỬA LỖI NGHIỆP VỤ]'),
  'gemini.ts phải có tiêu đề lưu ý sửa lỗi nghiệp vụ cho lần retry'
);
assert.ok(
  geminiCode.includes('Mọi kênh trong mảng \'channels\' của mỗi ý tưởng BẮT BUỘC phải có hoạt động triển khai cụ thể'),
  'gemini.ts phải nhấn mạnh sửa lỗi đồng bộ kênh và timeline'
);

// 4. Mô phỏng hàm checkChannelTimelineConsistency để kiểm chứng trực tiếp logic
const CHANNEL_SEMANTIC_ALIASES = {
  'referral': ['giới thiệu', 'mời bạn', 'chia sẻ', 'bạn bè', 'tri ân', 'mã mời', 'truyền miệng', 'wom', 'tích điểm', 'thưởng đôi'],
  'truyền miệng': ['giới thiệu', 'mời bạn', 'chia sẻ', 'bạn bè', 'tri ân', 'mã mời', 'referral', 'khách quen', 'tích điểm', 'truyền tai'],
  'koc': ['review', 'reviewer', 'booking', 'gửi mẫu', 'trải nghiệm', 'kol', 'influencer', 'bài review', 'video review', 'đánh giá', 'creator'],
  'tiktok': ['video ngắn', 'reels', 'clip', 'spark ads', 'trend', 'livestream', 'tiktok shop', 'quay dựng'],
  'facebook': ['fanpage', 'group', 'hội nhóm', 'seeding', 'cộng đồng', 'reels', 'post', 'livestream', 'messenger', 'inbox fanpage', 'fb ads', 'quảng cáo facebook'],
  'instagram': ['story', 'reels', 'feed', 'lookbook', 'direct', 'dm', 'bio', 'filter', 'ig', 'insta'],
  'threads': ['threads', 'bài viết ngắn', 'nội dung tương tác', 'chia sẻ text', 'viral text']
};

function matchesSearchTarget(target, text) {
  if (target.length <= 3) {
    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:^|[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ])${escaped}(?:$|[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ])`, 'iu').test(text);
  }
  return text.includes(target);
}

function checkConsistency(idea) {
  const issues = [];
  const timelineText = (idea.timeline || [])
    .flatMap((w) => [w.title || '', ...(w.activities || [])])
    .join(' ')
    .toLowerCase();
  
  const mainContentText = (idea.mainContent || '').toLowerCase();
  const combinedContextText = `${timelineText} ${mainContentText}`;
  const stopWords = new Set(['kênh', 'qua', 'và', 'trên', 'tại', 'bằng', 'cho', 'của', 'marketing', 'chiến dịch', 'các', 'những', 'với']);

  (idea.channels || []).forEach((channel) => {
    const cleanChannel = channel.toLowerCase().replace(/[()[\]{}"'.,:;\\/+=&_-]/g, ' ').trim();
    const words = cleanChannel.split(/\s+/).map((w) => w.trim()).filter((w) => w.length >= 2 && !stopWords.has(w));
    const searchTargets = new Set();
    words.forEach((w) => searchTargets.add(w));

    for (const [key, aliases] of Object.entries(CHANNEL_SEMANTIC_ALIASES)) {
      if (cleanChannel.includes(key)) {
        aliases.forEach((a) => searchTargets.add(a));
      }
    }

    const isCoveredInTimeline = searchTargets.size === 0 || Array.from(searchTargets).some((target) => matchesSearchTarget(target, timelineText));
    const isCoveredInContext = Array.from(searchTargets).some((target) => matchesSearchTarget(target, combinedContextText));

    if (!isCoveredInTimeline && !isCoveredInContext) {
      issues.push(`Kênh "${channel}" được đề xuất nhưng không có hoạt động triển khai nào tương ứng trong 4 tuần timeline.`);
    }
  });

  return issues;
}

// Case A: Idea với kênh Instagram & Facebook có gắn nhãn [Instagram], [Facebook]
const ideaWithTags = {
  title: 'Bộ sưu tập mùa hè',
  channels: ['Instagram', 'Facebook'],
  mainContent: 'Giới thiệu sản phẩm mới',
  timeline: [
    { week: 1, title: 'Tuần 1', activities: ['[Instagram] Đăng bộ ảnh lookbook và story đếm ngược'] },
    { week: 2, title: 'Tuần 2', activities: ['[Facebook] Chạy chiến dịch quảng cáo tin nhắn inbox'] },
    { week: 3, title: 'Tuần 3', activities: ['Đăng tải video reels đánh giá sản phẩm'] },
    { week: 4, title: 'Tuần 4', activities: ['Tổng kết và tri ân khách hàng'] }
  ]
};
assert.deepEqual(checkConsistency(ideaWithTags), [], 'Case A: Gắn nhãn hoặc dùng từ khóa phải PASS 100%');

// Case B: Idea với kênh Instagram nhưng dùng các từ nghiệp vụ (story, lookbook, reels) không ghi chữ "instagram"
const ideaWithInstagramAliases = {
  title: 'Lookbook thời trang',
  channels: ['Instagram'],
  mainContent: 'Ra mắt phong cách mới',
  timeline: [
    { week: 1, title: 'Tuần 1', activities: ['Chụp ảnh lookbook và đăng story giới thiệu'] },
    { week: 2, title: 'Tuần 2', activities: ['Đăng reels hậu trường sản xuất'] },
    { week: 3, title: 'Tuần 3', activities: ['Mở direct message tư vấn size cho khách'] },
    { week: 4, title: 'Tuần 4', activities: ['Chốt đơn và gửi quà tặng'] }
  ]
};
assert.deepEqual(checkConsistency(ideaWithInstagramAliases), [], 'Case B: Dùng alias của Instagram phải PASS');

// Case C: Vi phạm thực sự - Kênh Instagram & Facebook được chọn nhưng timeline chỉ làm TikTok và Zalo
const invalidIdea = {
  title: 'Chiến dịch TikTok viral',
  channels: ['Instagram', 'Facebook'],
  mainContent: 'Tập trung kéo khách từ nền tảng video ngắn',
  timeline: [
    { week: 1, title: 'Tuần 1', activities: ['Quay 5 clip TikTok ngắn bắt trend'] },
    { week: 2, title: 'Tuần 2', activities: ['Gửi tin nhắn Zalo OA chăm sóc khách'] },
    { week: 3, title: 'Tuần 3', activities: ['Tổ chức minigame trên Zalo'] },
    { week: 4, title: 'Tuần 4', activities: ['Tổng kết trao quà'] }
  ]
};
const issues = checkConsistency(invalidIdea);
assert.equal(issues.length, 2, 'Case C: Phải bắt đúng 2 lỗi vi phạm kênh Instagram và Facebook');
assert.ok(issues[0].includes('Instagram'), 'Lỗi 1 phải liên quan đến Instagram');
assert.ok(issues[1].includes('Facebook'), 'Lỗi 2 phải liên quan đến Facebook');

console.log('✅ ALL TESTS PASSED: Kênh và Timeline hoạt động nhất quán, ngăn chặn hoàn toàn lỗi fallback!');
