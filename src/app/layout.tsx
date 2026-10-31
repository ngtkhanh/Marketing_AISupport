import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'MarketingAI - Trợ Lý Gợi Ý Ý Tưởng Marketing Theo Ngân Sách (Đề 9)',
  description:
    'Sản phẩm dự thi Bảng A - Đề 9: Trợ lý AI gợi ý 05 ý tưởng chiến dịch marketing theo ngân sách kèm timeline 04 tuần và tính năng Shortlist.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased flex flex-col min-h-screen">
        <ToastProvider>
          <Header />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>
          <footer className="w-full border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© 2026 MarketingAI Supporter · Đề 9 Bảng A</p>
              <p>Phát triển bằng Next.js 14, Tailwind CSS & Google Gemini API</p>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}

