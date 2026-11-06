// Kịch bản kiểm thử độc lập cho Proposal Storage Manager
import assert from 'node:assert';

// Mock window and localStorage
const storageStore = new Map();

const mockLocalStorage = {
  getItem: (key) => storageStore.get(key) || null,
  setItem: (key, val) => storageStore.set(key, String(val)),
  removeItem: (key) => storageStore.delete(key),
  clear: () => storageStore.clear()
};

globalThis.window = {
  localStorage: mockLocalStorage,
  dispatchEvent: () => true
};

const PROPOSALS_STORAGE_KEY = 'marketing-ai:proposals:v1';

function listAllProposals() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PROPOSALS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p) =>
        Boolean(
          p &&
          typeof p.id === 'string' &&
          typeof p.campaignId === 'string' &&
          p.budgetAllocation &&
          Array.isArray(p.budgetAllocation.items)
        )
    );
  } catch {
    return [];
  }
}

function getProposalById(id) {
  const list = listAllProposals();
  return list.find((p) => p.id === id) || null;
}

function getProposalByCampaignId(campaignId, version = 1) {
  const list = listAllProposals();
  return list.find((p) => p.campaignId === campaignId && (p.version || 1) === (version || 1)) || null;
}

function saveProposal(proposal) {
  if (!proposal || !proposal.id) return false;
  try {
    const proposals = listAllProposals();
    const now = new Date().toISOString();
    const updatedProposal = { ...proposal, updatedAt: now };

    const existingIndex = proposals.findIndex(
      (p) => p.id === proposal.id || (p.campaignId === proposal.campaignId && (p.version || 1) === (proposal.version || 1))
    );

    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...proposals];
      updatedList[existingIndex] = updatedProposal;
    } else {
      updatedList = [updatedProposal, ...proposals];
    }

    window.localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(updatedList));
    return true;
  } catch {
    return false;
  }
}

function deleteProposal(id) {
  try {
    const proposals = listAllProposals();
    const filtered = proposals.filter((p) => p.id !== id);
    if (filtered.length === proposals.length) return false;
    window.localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

function clearAllProposals() {
  window.localStorage.removeItem(PROPOSALS_STORAGE_KEY);
  return true;
}

// =================== RUN TESTS ===================
console.log('🧪 Bắt đầu kiểm thử Proposal Client Storage...\n');

// TC1: List rỗng ban đầu
console.log('TC1: Danh sách rỗng ban đầu:');
assert.strictEqual(listAllProposals().length, 0);
console.log('  ✅ TC1: listAllProposals() trả về []');

// TC2: Lưu proposal mới
console.log('\nTC2: Lưu Proposal mới:');
const sampleProposal = {
  id: 'prop_test_1',
  campaignId: 'camp_101',
  version: 1,
  createdAt: '2026-11-06T10:00:00Z',
  updatedAt: '2026-11-06T10:00:00Z',
  status: 'ready_for_review',
  budgetAllocation: {
    totalBudget: 15000000,
    items: [{ id: 'b1', label: 'Ads', amount: 15000000 }]
  }
};
const saveRes = saveProposal(sampleProposal);
assert.strictEqual(saveRes, true);
assert.strictEqual(listAllProposals().length, 1);
console.log('  ✅ TC2: Lưu proposal thành công');

// TC3: Tìm proposal theo ID và CampaignId
console.log('\nTC3: Tìm Proposal:');
const foundById = getProposalById('prop_test_1');
assert.notStrictEqual(foundById, null);
assert.strictEqual(foundById.campaignId, 'camp_101');

const foundByCamp = getProposalByCampaignId('camp_101', 1);
assert.notStrictEqual(foundByCamp, null);
assert.strictEqual(foundByCamp.id, 'prop_test_1');
console.log('  ✅ TC3: Tìm kiếm theo ID và CampaignId chuẩn xác');

// TC4: Cập nhật proposal hiện có
console.log('\nTC4: Cập nhật Proposal:');
const updatedData = {
  ...sampleProposal,
  budgetAllocation: {
    totalBudget: 20000000,
    items: [{ id: 'b1', label: 'Ads', amount: 20000000 }]
  }
};
saveProposal(updatedData);
assert.strictEqual(listAllProposals().length, 1); // Không nhân đôi
const updatedFound = getProposalById('prop_test_1');
assert.strictEqual(updatedFound.budgetAllocation.totalBudget, 20000000);
console.log('  ✅ TC4: Cập nhật ghi đè bản ghi cũ chính xác');

// TC5: Xóa proposal
console.log('\nTC5: Xóa Proposal:');
const deleteRes = deleteProposal('prop_test_1');
assert.strictEqual(deleteRes, true);
assert.strictEqual(listAllProposals().length, 0);
assert.strictEqual(getProposalById('prop_test_1'), null);
console.log('  ✅ TC5: Xóa proposal thành công');

// TC6: Clear all
console.log('\nTC6: Xóa toàn bộ proposals:');
saveProposal({ ...sampleProposal, id: 'prop_test_2', campaignId: 'camp_102' });
saveProposal({ ...sampleProposal, id: 'prop_test_3', campaignId: 'camp_103' });
assert.strictEqual(listAllProposals().length, 2);
clearAllProposals();
assert.strictEqual(listAllProposals().length, 0);
console.log('  ✅ TC6: clearAllProposals() hoạt động tốt');

console.log('\n🎉 TOÀN BỘ TEST CASES STORAGE ĐÃ PASS 100%!');
