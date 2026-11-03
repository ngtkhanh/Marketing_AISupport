'use client';

import { useState, useEffect, useCallback } from 'react';
import { MarketingIdea, CampaignInput, ShortlistEntry } from '@/types/marketing';

const STORAGE_KEY = 'marketing-ai:shortlist:v1';

/**
 * Sinh khóa định danh duy nhất cho từng phiên bản của ý tưởng trong Shortlist.
 * Cho phép lưu độc lập nhiều phiên bản (v1, v2, v3...) của cùng 1 ý tưởng.
 */
export function getShortlistEntryId(ideaId: string, version: number = 1): string {
  return `${ideaId}_v${version}`;
}

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

  // Kiểm tra phiên bản cụ thể của ý tưởng đã lưu trong Shortlist chưa
  const isSaved = useCallback(
    (ideaId: string, version: number = 1): boolean => {
      const targetKey = getShortlistEntryId(ideaId, version);
      return shortlist.some(
        (item) => item.id === targetKey || (item.id === ideaId && (item.idea.version || 1) === version)
      );
    },
    [shortlist]
  );

  // Lưu một phiên bản ý tưởng vào Shortlist độc lập
  const saveIdea = useCallback(
    (
      idea: MarketingIdea,
      context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>
    ): { success: boolean; message: string } => {
      const version = idea.version || 1;
      if (isSaved(idea.id, version)) {
        return {
          success: false,
          message: `Phiên bản v${version} của ý tưởng này đã có trong Shortlist.`
        };
      }

      const entryId = getShortlistEntryId(idea.id, version);
      const newEntry: ShortlistEntry = {
        id: entryId,
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

      return { success: true, message: `Đã lưu "${idea.title} (v${version})" vào Shortlist!` };
    },
    [shortlist, isSaved, persist]
  );

  // Lưu nhiều ý tưởng cùng lúc (tính theo từng phiên bản độc lập)
  const saveMultipleIdeas = useCallback(
    (
      ideasToSave: MarketingIdea[],
      context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>
    ): { success: boolean; addedCount: number; message: string } => {
      const existingKeys = new Set(
        shortlist.map((item) =>
          item.id.includes('_v') ? item.id : getShortlistEntryId(item.id, item.idea.version || 1)
        )
      );

      const newIdeas = ideasToSave.filter(
        (idea) => !existingKeys.has(getShortlistEntryId(idea.id, idea.version || 1))
      );

      if (newIdeas.length === 0) {
        return {
          success: true,
          addedCount: 0,
          message: 'Tất cả các phiên bản ý tưởng này đã có trong Shortlist.'
        };
      }

      const now = new Date().toISOString();
      const newEntries: ShortlistEntry[] = newIdeas.map((idea) => ({
        id: getShortlistEntryId(idea.id, idea.version || 1),
        savedAt: now,
        context: {
          industry: context.industry,
          productName: context.productName,
          budgetLevel: context.budgetLevel,
          objective: context.objective
        },
        idea
      }));

      const newList = [...newEntries, ...shortlist];
      const success = persist(newList);

      if (!success) {
        return {
          success: false,
          addedCount: 0,
          message: 'Trình duyệt chặn bộ nhớ cục bộ hoặc bộ nhớ đã đầy.'
        };
      }

      return {
        success: true,
        addedCount: newEntries.length,
        message: `Đã lưu ${newEntries.length} ý tưởng vào Shortlist!`
      };
    },
    [shortlist, persist]
  );

  // Xóa 1 phiên bản ý tưởng khỏi Shortlist (theo entryId hoặc ideaId + version)
  const removeIdea = useCallback(
    (entryIdOrIdeaId: string, version?: number): boolean => {
      const newList = shortlist.filter((item) => {
        if (version !== undefined) {
          const targetKey = getShortlistEntryId(entryIdOrIdeaId, version);
          if (item.id === targetKey) return false;
          if (item.id === entryIdOrIdeaId && (item.idea.version || 1) === version) return false;
          return true;
        }
        return item.id !== entryIdOrIdeaId;
      });
      return persist(newList);
    },
    [shortlist, persist]
  );

  // Gắn nhãn hoặc đổi phương án ưu tiên triển khai (1 phương án duy nhất được ưu tiên)
  const setPrimaryIdea = useCallback(
    (entryId: string): boolean => {
      const target = shortlist.find((item) => item.id === entryId);
      const willBePrimary = !target?.isPrimary;
      const newList = shortlist.map((item) => ({
        ...item,
        isPrimary: item.id === entryId ? willBePrimary : false
      }));
      return persist(newList);
    },
    [shortlist, persist]
  );

  // Cập nhật ghi chú cá nhân của người dùng cho 1 phương án
  const updateUserNotes = useCallback(
    (entryId: string, notes: string): boolean => {
      const newList = shortlist.map((item) =>
        item.id === entryId ? { ...item, userNotes: notes } : item
      );
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
    setPrimaryIdea,
    updateUserNotes,
    removeIdea,
    clearAll
  };
}

