import { MarketingIdea, CampaignInput } from '@/types/marketing';
import { BUDGET_CONFIGS } from './config/budget';

/**
 * Sinh nội dung báo cáo hoàn chỉnh dưới định dạng Markdown (.md)
 */
export function generateCampaignMarkdown(
  ideas: MarketingIdea[],
  context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>
): string {
  const budgetInfo = BUDGET_CONFIGS[context.budgetLevel];
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  let md = `# BÁO CÁO ĐỀ XUẤT Ý TƯỞNG CHIẾN DỊCH MARKETING

> **Sản phẩm / Dịch vụ:** ${context.productName}  
> **Ngành hàng:** ${context.industry}  
> **Mức ngân sách:** ${budgetInfo.label} (${budgetInfo.rangeText})  
> **Mục tiêu chính:** ${context.objective}  
> **Ngày lập báo cáo:** ${currentDate}  
> **Nguồn đề xuất:** Trợ lý Marketing AI (Vibe Coding 2026)

---

## MỤC LỤC CHIẾN DỊCH ĐỀ XUẤT

${ideas.map((idea, idx) => `${idx + 1}. **${idea.title}** — *"${idea.tagline}"*`).join('\n')}

---

`;

  ideas.forEach((idea, idx) => {
    md += `## Ý TƯỞNG #${idx + 1}: ${idea.title.toUpperCase()}

- **Slogan / Tagline:** *"${idea.tagline}"*
- **Ngân sách ước tính:** ${idea.estimatedBudget || budgetInfo.rangeText}
- **Chân dung khách hàng mục tiêu:** ${idea.targetAudience}
- **Kênh tiếp thị chủ lực:** ${idea.channels.join(' · ')}

### Chiến lược cốt lõi
${idea.mainContent}

### Kế hoạch hành động chi tiết 04 tuần

| Tuần | Tên giai đoạn | Các hoạt động hành động chính |
|:---:|:---|:---|
${idea.timeline
  .map(
    (w) =>
      `| Tuần ${w.week} | **${w.title}** | ${w.activities.map((act) => `• ${act}`).join('<br>')} |`
  )
  .join('\n')}

---

`;
  });

  md += `\n*Báo cáo được xuất tự động từ hệ thống Trợ lý Marketing AI.*\n`;

  return md;
}

/**
 * Tải file Markdown về máy tính người dùng (đính kèm UTF-8 BOM để hiển thị tiếng Việt chuẩn 100%)
 */
export function downloadMarkdownFile(filename: string, content: string): void {
  if (typeof window === 'undefined') return;

  // Thêm UTF-8 BOM (\uFEFF) để các ứng dụng Windows (Notepad, Word, Excel) không bị vỡ font
  const blob = new Blob(['\uFEFF' + content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Kích hoạt hộp thoại in / xuất PDF của trình duyệt
 */
export function printCampaignReport(): void {
  if (typeof window === 'undefined') return;
  window.print();
}

