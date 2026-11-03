import { NextRequest, NextResponse } from 'next/server';
import { refineIdeaRequestSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rate-limit';
import { refineMarketingIdeaWithGemini } from '@/lib/ai/refine-gemini';
import { getFallbackRefinedIdea } from '@/lib/ai/mock-data';
import { MarketingIdea } from '@/types/marketing';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // 1. Kiểm tra IP Rate Limiting
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

    const validationResult = refineIdeaRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        const fieldName = err.path.join('.');
        fieldErrors[fieldName] = err.message;
      });

      const firstFriendlyMsg =
        Object.values(fieldErrors)[0] || 'Yêu cầu tinh chỉnh chưa hợp lệ, bạn vui lòng kiểm tra lại nhé!';

      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstFriendlyMsg,
            fieldErrors
          }
        },
        { status: 400 }
      );
    }

    const { currentIdea, context, instruction } = validationResult.data;

    // 3. Chế độ kiểm thử lỗi giả lập (Dev Only)
    const simulateError = process.env.AI_SIMULATE_ERROR;
    if (simulateError === 'rate_limit') {
      const fallback = getFallbackRefinedIdea(currentIdea as MarketingIdea, instruction);
      const newVersion = (currentIdea.version || 1) + 1;
      const refinedWithVersion: MarketingIdea = {
        ...fallback.refinedIdea,
        id: currentIdea.id,
        version: newVersion,
        refinementHistory: [
          {
            version: newVersion,
            refinedAt: new Date().toISOString(),
            instruction,
            changeReason: fallback.changeReason,
            changesSummary: fallback.changesSummary,
            previousIdea: {
              title: currentIdea.title,
              tagline: currentIdea.tagline,
              channels: currentIdea.channels,
              mainContent: currentIdea.mainContent,
              estimatedBudget: currentIdea.estimatedBudget,
              targetAudience: currentIdea.targetAudience,
              timeline: currentIdea.timeline
            }
          },
          ...(currentIdea.refinementHistory || [])
        ]
      };

      return NextResponse.json({
        ok: true,
        source: 'mock',
        model: 'simulated-fallback-mock',
        refinedIdea: refinedWithVersion,
        changeReason: fallback.changeReason,
        changesSummary: fallback.changesSummary
      });
    }

    // 4. Gọi Gemini Refinement Engine
    const aiResult = await refineMarketingIdeaWithGemini(
      currentIdea as MarketingIdea,
      context,
      instruction
    );

    if (aiResult.ok) {
      return NextResponse.json({
        ok: true,
        source: 'ai',
        model: aiResult.model,
        refinedIdea: aiResult.refinedIdea,
        changeReason: aiResult.changeReason,
        changesSummary: aiResult.changesSummary
      });
    }

    // 5. Nếu lỗi có thể fallback sang Mock (lỗi mạng, rate limit 429, timeout)
    if (aiResult.canFallback) {
      console.warn(`[REFINE FALLBACK] Chuyển sang dữ liệu mẫu: ${aiResult.message}`);
      const fallback = getFallbackRefinedIdea(currentIdea as MarketingIdea, instruction);
      const newVersion = (currentIdea.version || 1) + 1;
      const refinedWithVersion: MarketingIdea = {
        ...fallback.refinedIdea,
        id: currentIdea.id,
        version: newVersion,
        refinementHistory: [
          {
            version: newVersion,
            refinedAt: new Date().toISOString(),
            instruction,
            changeReason: fallback.changeReason,
            changesSummary: fallback.changesSummary,
            previousIdea: {
              title: currentIdea.title,
              tagline: currentIdea.tagline,
              channels: currentIdea.channels,
              mainContent: currentIdea.mainContent,
              estimatedBudget: currentIdea.estimatedBudget,
              targetAudience: currentIdea.targetAudience,
              timeline: currentIdea.timeline
            }
          },
          ...(currentIdea.refinementHistory || [])
        ]
      };

      return NextResponse.json({
        ok: true,
        source: 'mock',
        model: 'fallback-mock-smart',
        refinedIdea: refinedWithVersion,
        changeReason: fallback.changeReason,
        changesSummary: fallback.changesSummary
      });
    }

    // Lỗi không được fallback (Key sai, cấu hình hỏng, vi phạm an toàn)
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: aiResult.code,
          message: aiResult.message
        }
      },
      { status: aiResult.code === 'CONFIG_ERROR' ? 500 : 400 }
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[REFINE_API_ERROR] Lỗi không xử lý được:', error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Đã xảy ra sự cố nội bộ khi xử lý tinh chỉnh. Vui lòng thử lại.'
        }
      },
      { status: 500 }
    );
  }
}

