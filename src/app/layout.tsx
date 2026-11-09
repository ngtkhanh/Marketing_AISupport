import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { ToastProvider } from '@/components/Toast';
import { CampaignProvider } from '@/context/CampaignContext';

export const metadata: Metadata = {
  title: 'MarketingAI - Trợ Lý Đề Xuất Ý Tưởng Marketing Theo Ngân Sách',
  description:
    'Trợ lý AI đề xuất 05 ý tưởng chiến dịch marketing theo ngân sách kèm timeline 04 tuần và tính năng Shortlist.',
  icons: {
    icon: '/logo.png',
  },
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
          <CampaignProvider>
            <Header />
            <main className="flex-1 w-full">
              {children}
            </main>
            <footer className="w-full border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p>© 2026 MarketingAI Supporter</p>
                <a
                  href="https://www.facebook.com/ngtkhanh12"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-medium transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-[#1877F2]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Nguyễn Tiến Khánh</span>
                </a>
              </div>
            </footer>
          </CampaignProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

