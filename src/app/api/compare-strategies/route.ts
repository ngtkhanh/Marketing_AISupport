import { NextRequest, NextResponse } from 'next/server';
import { compareStrategiesRequestSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rate-limit';
import { evaluateStrategiesWithGeminiCMO, getFallbackAICMOVerdict } from '@/lib/ai/compare-gemini';
import { ShortlistEntry } from '@/types/marketing';

export const dynamic = 'force-dynamic';
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    // 1. Kiểm tra Rate Limit
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Bạn đang thao tác quá nhanh. Vui lòng chờ ít giây trước khi thử lại.'
          }
        },
        { status: 429 }
      );
    }

    // 2. Parse & kiểm tra dữ liệu đầu vào
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dữ liệu gửi lên không đúng định dạng JSON.'
          }
        },
        { status: 400 }
      );
    }

    const validation = compareStrategiesRequestSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0]?.message || 'Dữ liệu so sánh không hợp lệ.'
          }
        },
        { status: 400 }
      );
    }

    const entries = validation.data.entries as ShortlistEntry[];

    // 3. Giả lập kiểm thử (Dev Only)
    if (process.env.AI_SIMULATE_ERROR === 'rate_limit') {
      const fallback = getFallbackAICMOVerdict(entries);
      return NextResponse.json({
        ok: true,
        source: 'mock',
        model: 'simulated-fallback-cmo',
        verdict: fallback
      });
    }

    // 4. Gọi Gemini AI CMO Evaluation Engine
    const result = await evaluateStrategiesWithGeminiCMO(entries);

    if (result.ok) {
      return NextResponse.json({
        ok: true,
        source: 'ai',
        model: result.model,
        verdict: result.verdict
      });
    }

    // 5. Fallback Mock nếu lỗi hạ tầng có thể cứu vãn
    if (result.canFallback) {
      console.warn(`[COMPARE FALLBACK] Chuyển sang dữ liệu mẫu: ${result.message}`);
      const fallback = getFallbackAICMOVerdict(entries);
      return NextResponse.json({
        ok: true,
        source: 'mock',
        model: 'fallback-cmo-smart',
        verdict: fallback
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: result.code,
          message: result.message
        }
      },
      { status: result.code === 'CONFIG_ERROR' ? 500 : 400 }
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[COMPARE_API_ERROR] Lỗi không xử lý được:', error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Đã xảy ra lỗi nội bộ khi xử lý phân tích so sánh AI.'
        }
      },
      { status: 500 }
    );
  }
}

