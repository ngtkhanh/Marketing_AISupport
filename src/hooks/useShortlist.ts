'use client';

import { useState, useEffect, useCallback } from 'react';
import { MarketingIdea, CampaignInput, ShortlistEntry } from '@/types/marketing';

const STORAGE_KEY = 'marketing-ai:shortlist:v1';

export function useShortlist() {
  const [shortlist, setShortlist] = useState<ShortlistEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Đọc an toàn từ localStorage sau khi component mount ở client (tránh Hydration Mismatch)
  const loadShortlist = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setShortlist([]);
        setIsLoaded(true);
        return;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Lọc an toàn: chỉ giữ các phần tử có id và idea hợp lệ
        const validEntries: ShortlistEntry[] = parsed.filter(
          (item) => item && typeof item.id === 'string' && item.idea && typeof item.idea.title === 'string'
        );
        setShortlist(validEntries);
      } else {
        setShortlist([]);
      }
    } catch (err) {
      console.warn('[useShortlist] Dữ liệu localStorage bị hỏng, khởi tạo lại danh sách rỗng:', err);
      setShortlist([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadShortlist();

    // 2. Lắng nghe sự kiện storage để đồng bộ giữa các tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadShortlist();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadShortlist]);

  // Ghi vào localStorage có try/catch
  const persist = useCallback((newList: ShortlistEntry[]): boolean => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      setShortlist(newList);
      return true;
    } catch (err) {
      console.error('[useShortlist] Không thể ghi vào localStorage:', err);
      return false;
    }
  }, []);

  // Kiểm tra ý tưởng đã lưu chưa
  const isSaved = useCallback(
    (ideaId: string): boolean => {
      return shortlist.some((item) => item.id === ideaId);
    },
    [shortlist]
  );

  // Lưu ý tưởng
  const saveIdea = useCallback(
    (
      idea: MarketingIdea,
      context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>
    ): { success: boolean; message: string } => {
      if (isSaved(idea.id)) {
        return { success: false, message: 'Ý tưởng này đã có trong Shortlist.' };
      }

      const newEntry: ShortlistEntry = {
        id: idea.id,
        savedAt: new Date().toISOString(),
        context: {
          industry: context.industry,
          productName: context.productName,
          budgetLevel: context.budgetLevel,
          objective: context.objective
        },
        idea
      };

      const newList = [newEntry, ...shortlist];
      const success = persist(newList);

      if (!success) {
        return { success: false, message: 'Trình duyệt chặn bộ nhớ cục bộ hoặc bộ nhớ đã đầy.' };
      }

      return { success: true, message: `Đã lưu "${idea.title}" vào Shortlist!` };
    },
    [shortlist, isSaved, persist]
  );

  // Lưu nhiều ý tưởng cùng lúc (hỗ trợ lưu toàn bộ cả 5 ý tưởng)
  const saveMultipleIdeas = useCallback(
    (
      ideasToSave: MarketingIdea[],
      context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>
    ): { success: boolean; addedCount: number; message: string } => {
      const existingIds = new Set(shortlist.map((item) => item.id));
      const newIdeas = ideasToSave.filter((item) => !existingIds.has(item.id));

      if (newIdeas.length === 0) {
        return {
          success: true,
          addedCount: 0,
          message: 'Tất cả các ý tưởng này đã có trong Shortlist.',
        };
      }

      const now = new Date().toISOString();
      const newEntries: ShortlistEntry[] = newIdeas.map((idea) => ({
        id: idea.id,
        savedAt: now,
        context: {
          industry: context.industry,
          productName: context.productName,
          budgetLevel: context.budgetLevel,
          objective: context.objective,
        },
        idea,
      }));

      const newList = [...newEntries, ...shortlist];
      const success = persist(newList);

      if (!success) {
        return {
          success: false,
          addedCount: 0,
          message: 'Trình duyệt chặn bộ nhớ cục bộ hoặc bộ nhớ đã đầy.',
        };
      }

      return {
        success: true,
        addedCount: newEntries.length,
        message: `Đã lưu ${newEntries.length} ý tưởng vào Shortlist!`,
      };
    },
    [shortlist, persist]
  );

  // Xóa 1 ý tưởng
  const removeIdea = useCallback(
    (ideaId: string): boolean => {
      const newList = shortlist.filter((item) => item.id !== ideaId);
      return persist(newList);
    },
    [shortlist, persist]
  );

  // Xóa toàn bộ
  const clearAll = useCallback((): boolean => {
    return persist([]);
  }, [persist]);

  return {
    shortlist,
    count: shortlist.length,
    isLoaded,
    isSaved,
    saveIdea,
    saveMultipleIdeas,
    removeIdea,
    clearAll,
  };
}

