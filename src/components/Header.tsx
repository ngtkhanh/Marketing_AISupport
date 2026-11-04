'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bookmark, Lightbulb } from 'lucide-react';
import { useShortlist } from '@/hooks/useShortlist';

export function Header() {
  const pathname = usePathname();
  const { count, isLoaded } = useShortlist();

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
            <Image
              src="/logo.png"
              alt="MarketingAI Logo"
              width={36}
              height={36}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-slate-900 tracking-tight">MarketingAI</span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Trợ lý lập kế hoạch & ý tưởng marketing theo ngân sách</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              pathname === '/'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-slate-500" />
            <span>Tạo ý tưởng</span>
          </Link>

          <Link
            href="/shortlist"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors relative ${
              pathname === '/shortlist'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
            }`}
          >
            <Bookmark className="w-4 h-4 text-slate-500" />
            <span>Shortlist</span>
            {isLoaded && count > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white bg-slate-900 rounded-full">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

