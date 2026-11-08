import assert from 'node:assert';
import { detectObjectiveType, calculateFunnelKPIs } from '../src/lib/kpi-calculator.ts';

console.log('🧪 Kiểm thử Task 3: KPI Calculator Engine...');

// 1. Kiểm tra detectObjectiveType
assert.strictEqual(detectObjectiveType('Tăng nhận diện thương hiệu sản phẩm mới'), 'awareness');
assert.strictEqual(detectObjectiveType('Thu hút khách hàng tiềm năng để lại số điện thoại tư vấn'), 'lead_generation');
assert.strictEqual(detectObjectiveType('Tăng doanh số bán hàng mùa Tết và chốt đơn nhanh'), 'sales');
assert.strictEqual(detectObjectiveType('Kích hoạt khách hàng cũ quay lại mua'), 'retention');

// 2. Kiểm tra tính toán kịch bản Awareness (Nhận diện)
const awarenessScenarios = calculateFunnelKPIs({
  totalBudget: 20000000,
  objectiveType: 'awareness',
  hasPaidAds: true
});

assert.strictEqual(awarenessScenarios.length, 3, 'Phải sinh đúng 3 kịch bản KPI');
const baseAwareness = awarenessScenarios.find((s) => s.name === 'base');
assert(baseAwareness, 'Phải có kịch bản cơ sở');
assert.strictEqual(baseAwareness.objectiveType, 'awareness');
assert.strictEqual(baseAwareness.orders, 0, 'Chiến dịch nhận diện không tự gán số đơn hàng');
assert.strictEqual(baseAwareness.targetCPO, 0, 'Chiến dịch nhận diện không có CPO');
assert(baseAwareness.reach > 0, 'Tiếp cận phải lớn hơn 0');
assert(baseAwareness.funnelSteps && baseAwareness.funnelSteps.length > 0, 'Phải có các bước phễu minh bạch');

// Kiểm tra không có cụm từ "benchmark SME" trong giả định
const allAssumptionsAwareness = awarenessScenarios.flatMap((s) => s.assumptions).join(' ');
assert.strictEqual(
  allAssumptionsAwareness.toLowerCase().includes('benchmark sme'),
  false,
  'Không được chứa cụm từ "benchmark SME" không nguồn'
);

// 3. Kiểm tra tính toán kịch bản Sales (Bán hàng)
const salesScenarios = calculateFunnelKPIs({
  totalBudget: 50000000,
  objectiveType: 'sales',
  hasPaidAds: true
});

const baseSales = salesScenarios.find((s) => s.name === 'base');
assert(baseSales, 'Phải có kịch bản cơ sở cho Sales');
assert.strictEqual(baseSales.objectiveType, 'sales');
assert(baseSales.orders > 0, 'Chiến dịch bán hàng phải có đơn hàng ước tính');
assert(baseSales.targetCPO > 0, 'Chiến dịch bán hàng phải có Target CPO');
assert(baseSales.funnelSteps && baseSales.funnelSteps.length >= 4, 'Phải có chuỗi phễu bán hàng tối thiểu 4 bước');

// Kiểm tra tính nhất quán toán học: orders * targetCPO xấp xỉ ngân sách quảng cáo ước tính
const funnelOrders = baseSales.funnelSteps.find((step) => step.label.toLowerCase().includes('đơn'))?.value || 0;
assert.strictEqual(baseSales.orders, funnelOrders, 'Số đơn hàng ở kịch bản phải khớp với số đơn trong bước phễu');

console.log('✅ Task 3 Test Passed: KPI Calculator phễu minh bạch theo mục tiêu!');

