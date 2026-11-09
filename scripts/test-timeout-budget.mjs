import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Bắt đầu kiểm tra tính tương thích của Deadline Budgeting với cấu hình Vercel...\n');

const checks = [
  {
    name: 'Generate Ideas Route (App API)',
    routeFile: 'src/app/api/generate-ideas/route.ts',
    serviceFile: 'src/lib/ai/gemini.ts',
    expectedMaxDuration: 60,
    expectedGlobalDeadline: 48000,
    expectedSingleTimeout: 20000
  },
  {
    name: 'Compare Strategies Route (App API)',
    routeFile: 'src/app/api/compare-strategies/route.ts',
    serviceFile: 'src/lib/ai/compare-gemini.ts',
    expectedMaxDuration: 45,
    expectedGlobalDeadline: 36000,
    expectedSingleTimeout: 18000
  },
  {
    name: 'Refine Idea Route (App API)',
    routeFile: 'src/app/api/refine-idea/route.ts',
    serviceFile: 'src/lib/ai/refine-gemini.ts',
    expectedMaxDuration: 60,
    expectedGlobalDeadline: 48000,
    expectedSingleTimeout: 20000
  }
];

let allPassed = true;

for (const check of checks) {
  const routeContent = fs.readFileSync(path.resolve(check.routeFile), 'utf-8');
  const serviceContent = fs.readFileSync(path.resolve(check.serviceFile), 'utf-8');

  // Kiểm tra maxDuration trong route
  const maxDurationMatch = routeContent.match(/export const maxDuration = (\d+);/);
  const routeMaxDuration = maxDurationMatch ? Number.parseInt(maxDurationMatch[1], 10) : null;

  if (routeMaxDuration === check.expectedMaxDuration) {
    console.log(`[PASS] ${check.name}: Route maxDuration = ${routeMaxDuration}s`);
  } else {
    console.error(`[FAIL] ${check.name}: Kỳ vọng maxDuration = ${check.expectedMaxDuration}, nhưng nhận được ${routeMaxDuration}`);
    allPassed = false;
  }

  // Kiểm tra Global Deadline trong service
  const deadlineMatch = serviceContent.match(/GLOBAL_.*?DEADLINE_MS = (\d+);/);
  const serviceDeadline = deadlineMatch ? Number.parseInt(deadlineMatch[1], 10) : null;

  if (serviceDeadline === check.expectedGlobalDeadline) {
    const safetyBufferSec = (check.expectedMaxDuration * 1000 - serviceDeadline) / 1000;
    console.log(`[PASS] ${check.name}: Service Global Deadline = ${serviceDeadline}ms (Biên an toàn cho Vercel: ${safetyBufferSec}s)`);
  } else {
    console.error(`[FAIL] ${check.name}: Kỳ vọng deadline ${check.expectedGlobalDeadline}ms, nhưng nhận được ${serviceDeadline}`);
    allPassed = false;
  }

  // Kiểm tra Single Call Timeout
  const singleTimeoutMatch = serviceContent.match(/SINGLE_.*?TIMEOUT_MS = (\d+);/);
  const singleTimeout = singleTimeoutMatch ? Number.parseInt(singleTimeoutMatch[1], 10) : null;

  if (singleTimeout === check.expectedSingleTimeout) {
    console.log(`[PASS] ${check.name}: Single Call Timeout = ${singleTimeout}ms (Fail-Fast chuẩn)`);
  } else {
    console.error(`[FAIL] ${check.name}: Kỳ vọng single timeout ${check.expectedSingleTimeout}ms, nhưng nhận được ${singleTimeout}`);
    allPassed = false;
  }

  console.log('---');
}

// Kiểm tra guardrail budget
const guardrailContent = fs.readFileSync(path.resolve('src/lib/ai/guardrail.ts'), 'utf-8');
const guardrailBudgetMatch = guardrailContent.match(/MAX_GUARDRAIL_BUDGET_MS = (\d+);/);
if (guardrailBudgetMatch && Number.parseInt(guardrailBudgetMatch[1], 10) <= 12000) {
  console.log(`[PASS] Guardrail Budget: Tối đa ${guardrailBudgetMatch[1]}ms (Bảo đảm không chiếm dụng ngân sách luồng chính)`);
} else {
  console.error('[FAIL] Guardrail Budget chưa được thiết lập an toàn');
  allPassed = false;
}

// Kiểm tra vercel.json
if (fs.existsSync('vercel.json')) {
  console.log('[PASS] File cấu hình vercel.json đã sẵn sàng');
} else {
  console.error('[FAIL] Thiếu vercel.json');
  allPassed = false;
}

if (!allPassed) {
  console.error('\n❌ Có kiểm thử không đạt!');
  process.exit(1);
}

console.log('\n🎉 TẤT CẢ CÁC ĐIỀU KIỆN DEADLINE BUDGETING ĐÃ ĐẠT CHUẨN 100%!');

