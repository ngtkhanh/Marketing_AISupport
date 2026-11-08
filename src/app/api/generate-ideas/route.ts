import { NextRequest, NextResponse } from 'next/server';
import { campaignInputSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateMarketingIdeasWithGemini } from '@/lib/ai/gemini';
import { validateCampaignInputSemantics } from '@/lib/ai/guardrail';
import { getFallbackMarketingIdeas } from '@/lib/ai/mock-data';
import { attachVerificationEvidence } from '@/lib/evidence-generator';
import { CampaignInput } from '@/types/marketing';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // 1. Kiểm tra IP Rate Limiting (in-memory best-effort)
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

    // 2. Parse & kiểm tra kích thước payload
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

    // 3. Server-side Validation bằng Zod (Lớp 1: Heuristic & Pattern Rules)
    const validationResult = campaignInputSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        const fieldName = err.path.join('.');
        fieldErrors[fieldName] = err.message;
      });

      const firstFriendlyMsg =
        Object.values(fieldErrors)[0] ||
        'Thông tin chiến dịch có vẻ chưa đầy đủ. Bạn vui lòng kiểm tra lại các ô nhập liệu nhé!';

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

    const campaignInput: CampaignInput = validationResult.data;

    // 3.5. Cổng kiểm tra ngữ nghĩa bằng model siêu nhẹ (Lớp 2: Semantic Guardrail)
    // Chặn rác "có vẻ hợp lệ" như "asdf quảng cáo lung tung", prompt injection "hãy bỏ qua hướng dẫn..."
    const guardrailCheck = await validateCampaignInputSemantics(campaignInput);
    if (!guardrailCheck.isValid) {
      const friendlyMessage =
        guardrailCheck.friendlyMessage ||
        'Thông tin chiến dịch có vẻ chưa rõ nghĩa. Bạn thử mô tả cụ thể sản phẩm hoặc dịch vụ thực tế nhé (VD: Trà sữa matcha đóng chai)!';

      const fieldErrors: Record<string, string> = {};
      if (guardrailCheck.field) {
        fieldErrors[guardrailCheck.field] = friendlyMessage;
      }

      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: friendlyMessage,
            fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined
          }
        },
        { status: 400 }
      );
    }

    // 4. Xử lý Cờ mô phỏng lỗi (chỉ hoạt động khi NODE_ENV !== 'production' để test TC05, TC07)
    const simulateError = process.env.AI_SIMULATE_ERROR;
    if (process.env.NODE_ENV !== 'production' && simulateError) {
      if (simulateError === 'bad_key') {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'CONFIG_ERROR',
              message: '[DEV SIMULATE] GEMINI_API_KEY không hợp lệ hoặc thiếu quyền truy cập.'
            }
          },
          { status: 500 }
        );
      }

      if (simulateError === 'rate_limit' || simulateError === 'timeout' || simulateError === 'bad_json') {
        // Mô phỏng sự cố hạ tầng -> Kích hoạt Fallback Mock có Badge Vàng
        const fallbackIdeas = getFallbackMarketingIdeas(campaignInput);
        return NextResponse.json({
          ok: true,
          source: 'mock',
          model: `simulated-fallback-${simulateError}`,
          ideas: fallbackIdeas
        });
      }
    }

    // 5. Gọi Gemini AI với 3 lớp kiểm soát
    const aiResult = await generateMarketingIdeasWithGemini(campaignInput);

    if (aiResult.ok) {
      const ideasWithEvidence = aiResult.ideas.map((idea) => ({
        ...idea,
        verificationEvidence: idea.verificationEvidence || attachVerificationEvidence(idea, campaignInput)
      }));

      return NextResponse.json({
        ok: true,
        source: 'ai',
        model: aiResult.model,
        ideas: ideasWithEvidence
      });
    }

    // 6. Xử lý khi AI thất bại
    if (aiResult.canFallback) {
      // Lỗi hạ tầng (429, timeout, network, schema) -> Trả Mock data + source: 'mock' (hiện Badge Vàng)
      console.warn(`[AI FALLBACK] Kích hoạt fallback dự phòng do: ${aiResult.message}`);
      const fallbackIdeas = getFallbackMarketingIdeas(campaignInput);
      return NextResponse.json({
        ok: true,
        source: 'mock',
        model: 'fallback-demo-engine',
        ideas: fallbackIdeas
      });
    }

    // Lỗi cấu hình (thiếu key, key sai, safety blocked) -> KHÔNG fallback, báo lỗi rõ ràng
    const statusCode = aiResult.code === 'SAFETY_BLOCKED' ? 422 : 500;
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: aiResult.code,
          message: aiResult.message
        }
      },
      { status: statusCode }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[API INTERNAL ERROR]', err);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: `Lỗi máy chủ nội bộ: ${err.message || 'Vui lòng thử lại sau.'}`
        }
      },
      { status: 500 }
    );
  }
}

