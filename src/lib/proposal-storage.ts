import { CampaignProposal } from '@/types/marketing';

/**
 * Khóa lưu trữ Proposals trong localStorage
 */
export const PROPOSALS_STORAGE_KEY = 'marketing-ai:proposals:v1';

/**
 * Tên CustomEvent phát ra khi có thay đổi Proposal để các component / tab tự đồng bộ
 */
export const PROPOSAL_UPDATED_EVENT = 'marketing-ai:proposal-updated';

/**
 * Kiểm tra tính khả dụng của localStorage (SSR Safe)
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__proposal_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lấy toàn bộ danh sách Proposal đã lưu từ localStorage
 */
export function listAllProposals(): CampaignProposal[] {
  if (!isStorageAvailable()) return [];

  try {
    const raw = window.localStorage.getItem(PROPOSALS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Lọc an toàn: chỉ giữ các đối tượng có đủ ID, campaignId và budgetAllocation
    return parsed.filter(
      (p): p is CampaignProposal =>
        Boolean(
          p &&
          typeof p.id === 'string' &&
          typeof p.campaignId === 'string' &&
          p.budgetAllocation &&
          Array.isArray(p.budgetAllocation.items)
        )
    );
  } catch (err) {
    console.warn('[proposal-storage] Dữ liệu localStorage bị hỏng hoặc không đúng định dạng:', err);
    return [];
  }
}

/**
 * Tìm kiếm Proposal theo ID cụ thể
 */
export function getProposalById(id: string): CampaignProposal | null {
  if (!isStorageAvailable() || !id) return null;
  const list = listAllProposals();
  return list.find((p) => p.id === id) || null;
}

/**
 * Tìm kiếm Proposal theo ID chiến dịch gốc và phiên bản
 */
export function getProposalByCampaignId(
  campaignId: string,
  version: number = 1
): CampaignProposal | null {
  if (!isStorageAvailable() || !campaignId) return null;
  const list = listAllProposals();
  return (
    list.find(
      (p) => p.campaignId === campaignId && (p.version || 1) === (version || 1)
    ) || null
  );
}

/**
 * Lưu hoặc cập nhật một Proposal vào localStorage.
 * Xử lý ngoại lệ QuotaExceededError khi bộ nhớ trình duyệt bị đầy.
 */
export function saveProposal(proposal: CampaignProposal): boolean {
  if (!isStorageAvailable() || !proposal || !proposal.id) return false;

  try {
    const proposals = listAllProposals();
    const now = new Date().toISOString();

    const updatedProposal: CampaignProposal = {
      ...proposal,
      updatedAt: now
    };

    // Tìm xem proposal đã tồn tại hay chưa (theo ID hoặc theo cặp campaignId + version)
    const existingIndex = proposals.findIndex(
      (p) =>
        p.id === proposal.id ||
        (p.campaignId === proposal.campaignId && (p.version || 1) === (proposal.version || 1))
    );

    let updatedList: CampaignProposal[];
    if (existingIndex >= 0) {
      updatedList = [...proposals];
      updatedList[existingIndex] = updatedProposal;
    } else {
      updatedList = [updatedProposal, ...proposals];
    }

    window.localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(updatedList));

    // Phát sự kiện cập nhật để các component đang mở tự đồng bộ dữ liệu
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent(PROPOSAL_UPDATED_EVENT, { detail: updatedProposal })
        );
      } catch {
        // Bỏ qua lỗi CustomEvent trên môi trường kiểm thử cũ
      }
    }

    return true;
  } catch (err: unknown) {
    const domErr = err as DOMException;
    if (
      domErr &&
      (domErr.name === 'QuotaExceededError' ||
        domErr.code === 22 ||
        domErr.code === 1014 ||
        domErr.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      console.error(
        '[proposal-storage] Bộ nhớ trình duyệt (localStorage) đã đầy. Vui lòng dọn bớt các proposal cũ.',
        err
      );
    } else {
      console.error('[proposal-storage] Lỗi khi lưu proposal vào localStorage:', err);
    }
    return false;
  }
}

/**
 * Xóa một Proposal theo ID khỏi localStorage
 */
export function deleteProposal(id: string): boolean {
  if (!isStorageAvailable() || !id) return false;

  try {
    const proposals = listAllProposals();
    const filtered = proposals.filter((p) => p.id !== id);

    if (filtered.length === proposals.length) {
      return false; // Không tìm thấy ID để xóa
    }

    window.localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(filtered));

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent(PROPOSAL_UPDATED_EVENT, { detail: { id, deleted: true } })
        );
      } catch {
        // Bỏ qua lỗi CustomEvent
      }
    }

    return true;
  } catch (err) {
    console.error('[proposal-storage] Lỗi khi xóa proposal:', err);
    return false;
  }
}

/**
 * Xóa toàn bộ Proposals trong localStorage (phục vụ reset hoặc kiểm thử)
 */
export function clearAllProposals(): boolean {
  if (!isStorageAvailable()) return false;

  try {
    window.localStorage.removeItem(PROPOSALS_STORAGE_KEY);

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent(PROPOSAL_UPDATED_EVENT, { detail: { cleared: true } })
        );
      } catch {
        // Bỏ qua lỗi CustomEvent
      }
    }

    return true;
  } catch (err) {
    console.error('[proposal-storage] Lỗi khi xóa toàn bộ proposals:', err);
    return false;
  }
}

