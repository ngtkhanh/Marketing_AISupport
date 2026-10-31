interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store cho rate limiting best-effort trên serverless
const ipMap = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000; // 1 phút
const MAX_REQUESTS = 10; // Tối đa 10 request / phút

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = ipMap.get(ip);

  // Dọn dẹp định kỳ nếu map quá 1000 records
  if (ipMap.size > 1000) {
    ipMap.forEach((val, key) => {
      if (val.resetAt < now) {
        ipMap.delete(key);
      }
    });
  }

  if (!record || record.resetAt < now) {
    ipMap.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS
    });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - record.count };
}
