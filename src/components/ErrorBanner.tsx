'use client';

import React from 'react';
import { AlertCircle, RefreshCw, WifiOff, KeyRound } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  code?: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, code, onRetry }: ErrorBannerProps) {
  const isNetwork = code === 'NETWORK_ERROR' || message.toLowerCase().includes('kết nối') || message.toLowerCase().includes('mạng');
  const isKey = code === 'CONFIG_ERROR' || message.toLowerCase().includes('key') || message.toLowerCase().includes('cấu hình');

  return (
    <div
      role="alert"
      className="p-4 sm:p-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 animate-in fade-in duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
          {isNetwork ? (
            <WifiOff className="w-5 h-5" />
          ) : isKey ? (
            <KeyRound className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-sm sm:text-base text-rose-950 mb-1">
            {isNetwork ? 'Sự cố kết nối mạng' : isKey ? 'Lỗi cấu hình hệ thống' : 'Không thể tạo ý tưởng'}
          </h4>
          <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">{message}</p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Thử lại ngay</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

