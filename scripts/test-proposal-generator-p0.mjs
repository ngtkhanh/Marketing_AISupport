import assert from 'node:assert';
import { generateDefaultProposal } from '../src/lib/proposal-generator.ts';

// Giả lập ý tưởng A: Thuần Organic / Cộng đồng, không Paid Ads, không KOC
const organicIdea = {
  id: 'idea_organic_1',
  title: 'Thử Thách 21 Ngày Tự Nhiên',
  tagline: 'Gắn kết cộng đồng xanh',
  channels: ['Group Facebook', 'Email Newsletter', 'Tài liệu hướng dẫn PDF'],
  mainContent: 'Xây dựng chuỗi thử thách 21 ngày tương tác trong nhóm cộng đồng Facebook, tặng Ebook cẩm nang và quà tặng minigame.',
  estimatedBudget: '15.000.000 VNĐ',
  targetAudience: 'Người tiêu dùng yêu lối sống xanh',
  timeline: [
    {
      week: 1,
      title: 'Khởi động',
      activities: ['Soạn Ebook hướng dẫn', 'Đăng bài thông báo trong Group']
    },
    {
      week: 2,
      title: 'Thực hiện',
      activities: ['Livestream giải đáp trong Group', 'Gửi email động viên']
    },
    {
      week: 3,
      title: 'Tăng tốc',
      activities: ['Chấm điểm thử thách tuần 2', 'Tặng voucher ưu đãi']
    },
    {
      week: 4,
      title: 'Tổng kết',
      activities: ['Vinh danh người chiến thắng', 'Tặng bộ quà mini']
    }
  ]
};

// Giả lập ý tưởng B: Chiến dịch Booking KOC và Paid Ads
const kocAdsIdea = {
  id: 'idea_koc_ads_2',
  title: 'Lan Tỏa Cùng KOC & Spark Ads',
  tagline: 'Bùng nổ review',
  channels: ['TikTok Ads', 'Booking Micro-KOC', 'Shopee Live'],
  mainContent: 'Booking 5 Micro-KOC trải nghiệm sản phẩm và chạy TikTok Spark Ads đẩy bài review lên xu hướng.',
  estimatedBudget: '50.000.000 VNĐ',
  targetAudience: 'Giới trẻ Gen Z',
  timeline: [
    {
      week: 1,
      title: 'Gửi mẫu',
      activities: ['Liên hệ 10 KOC và gửi sản phẩm trải nghiệm', 'Chuẩn bị mã pixel TikTok Ads']
    },
    {
      week: 2,
      title: 'Lên bài',
      activities: ['KOC đồng loạt lên video review', 'Kích hoạt chiến dịch Spark Ads']
    },
    {
      week: 3,
      title: 'Chốt đơn',
      activities: ['Tối ưu ngân sách ads', 'Livestream trên Shopee']
    },
    {
      week: 4,
      title: 'Duy trì',
      activities: ['Retargeting tệp xem video', 'Tổng kết doanh thu']
    }
  ]
};

const organicContext = {
  industry: 'F&B',
  productName: 'Trà thảo mộc',
  budgetLevel: 'low',
  objective: 'Gắn kết khách hàng cũ và xây dựng cộng đồng'
};

const kocContext = {
  industry: 'Mỹ phẩm',
  productName: 'Kem chống nắng',
  budgetLevel: 'medium',
  objective: 'Tăng doanh số bán hàng'
};

console.log('🧪 Kiểm thử Task 2: Proposal Generator Dynamic Behavior...');

// 1. Kiểm tra Ý tưởng A (Organic)
const propA = generateDefaultProposal(organicIdea, organicContext);

// Status phải là draft
assert.strictEqual(propA.status, 'draft', 'Proposal mới khởi tạo phải có status là "draft"');

// Không được có KOC
const hasKocItemA = propA.budgetAllocation.items.some(
  (item) => item.category === 'koc_partnership' || item.label.toLowerCase().includes('koc')
);
assert.strictEqual(hasKocItemA, false, 'Chiến dịch không có KOC thì KHÔNG được phân bổ chi phí KOC');

// Không được có Paid Ads
const hasPaidAdsA = propA.budgetAllocation.items.some(
  (item) => item.category === 'paid_ads'
);
assert.strictEqual(hasPaidAdsA, false, 'Chiến dịch organic không có Ads thì KHÔNG được phân bổ paid_ads');

// Không được có rủi ro KOC
const hasKocRiskA = propA.contingencyTriggers.some(
  (t) => t.risk.toLowerCase().includes('koc') || t.triggerMetric.toLowerCase().includes('koc')
);
assert.strictEqual(hasKocRiskA, false, 'Chiến dịch không dùng KOC thì KHÔNG được có rủi ro KOC chậm video');

// Ngân sách phải cân bằng đúng 100%
assert.strictEqual(propA.budgetAllocation.unallocatedAmount, 0, 'Ngân sách ý tưởng A phải cân bằng 100%');

// 2. Kiểm tra Ý tưởng B (KOC + Ads)
const propB = generateDefaultProposal(kocAdsIdea, kocContext);
assert.strictEqual(propB.status, 'draft', 'Proposal B mới khởi tạo phải có status là "draft"');

const hasKocItemB = propB.budgetAllocation.items.some((item) => item.category === 'koc_partnership');
assert.strictEqual(hasKocItemB, true, 'Chiến dịch có KOC phải có phân bổ hạng mục KOC');

const hasPaidAdsB = propB.budgetAllocation.items.some((item) => item.category === 'paid_ads');
assert.strictEqual(hasPaidAdsB, true, 'Chiến dịch có Ads phải có phân bổ hạng mục Paid Ads');

const hasKocRiskB = propB.contingencyTriggers.some(
  (t) => t.risk.toLowerCase().includes('koc') || t.triggerCondition.toLowerCase().includes('koc')
);
assert.strictEqual(hasKocRiskB, true, 'Chiến dịch dùng KOC phải có rủi ro dự phòng KOC');

assert.strictEqual(propB.budgetAllocation.unallocatedAmount, 0, 'Ngân sách ý tưởng B phải cân bằng 100%');

console.log('✅ Task 2 Test Passed: Proposal Generator linh hoạt bám sát ý tưởng thật!');

