import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  Footer,
  PageNumber,
} from 'docx';
import { MarketingIdea, CampaignInput } from '@/types/marketing';
import { BUDGET_CONFIGS } from './config/budget';

/**
 * Sinh và tải xuống file Word (.docx) chuẩn Office Open XML cho chiến dịch marketing
 */
export async function exportCampaignToDocx(
  ideas: MarketingIdea[],
  context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>
): Promise<void> {
  const budgetInfo = BUDGET_CONFIGS[context.budgetLevel];
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
  };

  const docChildren: (Paragraph | Table)[] = [];

  // 1. Tiêu đề chính của báo cáo
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: 'BÁO CÁO ĐỀ XUẤT Ý TƯỞNG CHIẾN DỊCH MARKETING',
          bold: true,
          size: 32, // 16pt
          color: '1E293B',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: 'Hệ thống hỗ trợ lập kế hoạch tiếp thị theo ngân sách thực tế · MarketingAI Supporter',
          italics: true,
          size: 20, // 10pt
          color: '64748B',
        }),
      ],
    })
  );

  // 2. Bảng thông tin tổng quan chiến dịch (Metadata Table)
  const metaRows = [
    ['Sản phẩm / Dịch vụ:', context.productName],
    ['Ngành hàng:', context.industry],
    ['Mức ngân sách:', `${budgetInfo.label} (${budgetInfo.rangeText})`],
    ['Mục tiêu chính:', context.objective],
    ['Ngày lập báo cáo:', currentDate],
    ['Hệ thống đề xuất:', 'Trợ lý Marketing AI (Vibe Coding 2026)'],
  ];

  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: 'I. THÔNG TIN TỔNG QUAN',
          bold: true,
          size: 24, // 12pt
          color: '4F46E5',
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: metaRows.map(
        ([label, value]) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
                children: [
                  new Paragraph({
                    spacing: { before: 60, after: 60 },
                    children: [new TextRun({ text: label, bold: true, size: 20, color: '334155' })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                children: [
                  new Paragraph({
                    spacing: { before: 60, after: 60 },
                    children: [new TextRun({ text: value, size: 20, color: '0F172A' })],
                  }),
                ],
              }),
            ],
          })
      ),
    }),
    new Paragraph({ spacing: { after: 300 }, children: [] })
  );

  // 3. Bảng tóm tắt 05 chiến dịch đề xuất
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: 'II. DANH MỤC 05 Ý TƯỞNG CHIẾN DỊCH',
          bold: true,
          size: 24, // 12pt
          color: '4F46E5',
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 8, type: WidthType.PERCENTAGE },
              borders: cellBorder,
              shading: { fill: 'E2E8F0', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'STT', bold: true, size: 20 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 32, type: WidthType.PERCENTAGE },
              borders: cellBorder,
              shading: { fill: 'E2E8F0', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Tên chiến dịch', bold: true, size: 20 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              borders: cellBorder,
              shading: { fill: 'E2E8F0', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Thông điệp then chốt', bold: true, size: 20 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              borders: cellBorder,
              shading: { fill: 'E2E8F0', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Dự toán ngân sách', bold: true, size: 20 })],
                }),
              ],
            }),
          ],
        }),
        ...ideas.map(
          (idea, idx) =>
            new TableRow({
              children: [
                new TableCell({
                  borders: cellBorder,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: `0${idx + 1}`, bold: true, size: 20 })],
                    }),
                  ],
                }),
                new TableCell({
                  borders: cellBorder,
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: idea.title, bold: true, size: 20 })],
                    }),
                  ],
                }),
                new TableCell({
                  borders: cellBorder,
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: `"${idea.tagline}"`, italics: true, size: 20 })],
                    }),
                  ],
                }),
                new TableCell({
                  borders: cellBorder,
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: idea.estimatedBudget || budgetInfo.rangeText,
                          bold: true,
                          size: 20,
                          color: '4F46E5',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            })
        ),
      ],
    }),
    new Paragraph({ spacing: { after: 350 }, children: [] })
  );

  // 4. Chi tiết từng chiến dịch
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 150 },
      children: [
        new TextRun({
          text: 'III. CHI TIẾT TRIỂN KHAI TỪNG CHIẾN DỊCH',
          bold: true,
          size: 24, // 12pt
          color: '4F46E5',
        }),
      ],
    })
  );

  ideas.forEach((idea, idx) => {
    docChildren.push(
      // Tiêu đề ý tưởng
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 240, after: 80 },
        children: [
          new TextRun({
            text: `Ý TƯỞNG #${idx + 1}: ${idea.title.toUpperCase()}`,
            bold: true,
            size: 22,
            color: '1E293B',
          }),
        ],
      }),
      // Thông điệp
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: '• Thông điệp chính: ', bold: true, size: 20 }),
          new TextRun({ text: `"${idea.tagline}"`, italics: true, size: 20 }),
        ],
      }),
      // Ngân sách
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: '• Dự toán ngân sách: ', bold: true, size: 20 }),
          new TextRun({
            text: idea.estimatedBudget || budgetInfo.rangeText,
            bold: true,
            color: '4F46E5',
            size: 20,
          }),
        ],
      }),
      // Kênh tiếp thị
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: '• Kênh tiếp thị chủ lực: ', bold: true, size: 20 }),
          new TextRun({ text: idea.channels.join(' · '), size: 20 }),
        ],
      }),
      // Khách hàng mục tiêu
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: '• Khách hàng mục tiêu: ', bold: true, size: 20 }),
          new TextRun({ text: idea.targetAudience, size: 20 }),
        ],
      }),
      // Cơ chế chiến lược
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: 'Cơ chế chiến lược cốt lõi:', bold: true, size: 20 })],
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: idea.mainContent, size: 20, color: '334155' })],
      }),
      // Bảng Lộ trình 4 tuần
      new Paragraph({
        spacing: { before: 80, after: 60 },
        children: [new TextRun({ text: 'Lộ trình hành động chi tiết 04 tuần:', bold: true, size: 20 })],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                width: { size: 12, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: 'Tuần', bold: true, size: 18 })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 28, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'Tên giai đoạn', bold: true, size: 18 })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 60, type: WidthType.PERCENTAGE },
                borders: cellBorder,
                shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'Hoạt động hành động chính', bold: true, size: 18 })],
                  }),
                ],
              }),
            ],
          }),
          ...idea.timeline.map(
            (w) =>
              new TableRow({
                children: [
                  new TableCell({
                    borders: cellBorder,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: `Tuần ${w.week}`, bold: true, size: 18 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: w.title, bold: true, size: 18 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: cellBorder,
                    children: w.activities.map(
                      (act) =>
                        new Paragraph({
                          spacing: { before: 30, after: 30 },
                          children: [new TextRun({ text: `• ${act}`, size: 18 })],
                        })
                    ),
                  }),
                ],
              })
          ),
        ],
      }),
      new Paragraph({ spacing: { after: 200 }, children: [] })
    );
  });

  // 5. Kết luận & Bản quyền
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300 },
      children: [
        new TextRun({
          text: 'Báo cáo được xuất tự động từ hệ thống MarketingAI Supporter.',
          italics: true,
          size: 18,
          color: '94A3B8',
        }),
      ],
    })
  );

  // Tạo tài liệu Word hoàn chỉnh
  const doc = new Document({
    sections: [
      {
        properties: {},
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'Trang ', size: 18, color: '94A3B8' }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: '94A3B8',
                  }),
                ],
              }),
            ],
          }),
        },
        children: docChildren,
      },
    ],
  });

  // Xuất file và tải về trình duyệt
  const blob = await Packer.toBlob(doc);
  const sanitizedName = context.productName
    .toLowerCase()
    .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const filename = `ke-hoach-marketing-${sanitizedName || 'chien-dich'}.docx`;

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
