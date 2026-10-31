import { MarketingIdea, CampaignInput } from '@/types/marketing';
import { BUDGET_CONFIGS } from './config/budget';

/**
 * Định dạng văn bản tóm tắt ý tưởng chiến dịch để gửi team qua Zalo / Slack / Email
 */
export function formatIdeaSummary(
  idea: MarketingIdea,
  context?: Partial<Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>>
): string {
  const budgetInfo = context?.budgetLevel ? BUDGET_CONFIGS[context.budgetLevel] : null;
  const budgetLabel = budgetInfo ? `${budgetInfo.label} (${idea.estimatedBudget || budgetInfo.rangeText})` : idea.estimatedBudget;

  const timelineFormatted = idea.timeline
    .map(
      (w) =>
        `  - Tuần ${w.week} (${w.title}): ${w.activities.join('; ')}`
    )
    .join('\n');

  return `📌 CHIẾN DỊCH: ${idea.title.toUpperCase()}
Slogan / Tagline: "${idea.tagline}"
${context?.productName ? `Sản phẩm: ${context.productName} · ` : ''}${context?.industry ? `Ngành: ${context.industry} · ` : ''}Ngân sách: ${budgetLabel}
${context?.objective ? `Mục tiêu: ${context.objective}\n` : ''}Đối tượng mục tiêu: ${idea.targetAudience}
Kênh triển khai: ${idea.channels.join(', ')}

Nội dung chiến lược cốt lõi:
${idea.mainContent}

Timeline triển khai 04 tuần:
${timelineFormatted}

---
Trợ lý Marketing AI`;
}

/**
 * Hàm sao chép clipboard an toàn hỗ trợ fallback cho mobile browser / webview
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Thử dùng API hiện đại navigator.clipboard
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback xuống execCommand nếu quyền bị từ chối
    }
  }

  // Fallback an toàn cho older mobile browsers hoặc in-app webview
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

