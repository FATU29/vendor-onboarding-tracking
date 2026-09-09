import { create } from 'zustand';
import { api, setUnauthorizedHandler, UnauthorizedError } from '../api/client';
import type { Coordinator, Session, Vendor, VendorHistory, VendorStage } from '../types';

const SESSION_STORAGE_KEY = 'vendor-tracker-user';

function readSession(): Session | null {
  const stored = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!stored) return null;
  try {
    const session = JSON.parse(stored) as Partial<Session>;
    return typeof session.id === 'string' && typeof session.name === 'string' && typeof session.token === 'string'
      ? session as Session
      : null;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

interface VendorStore {
  coordinators: Coordinator[];
  stages: VendorStage[];
  currentUser: Session | null;
  vendors: Vendor[];
  stuckThresholdDays: number;
  loading: boolean;
  error: string;
  selectedName: string;
  editing: Vendor | null;
  historyVendor: Vendor | null;
  history: VendorHistory[];
  stageId: number;
  notes: string;
  saving: boolean;
  savingThreshold: boolean;
  load: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => void;
  handleUnauthorized: () => void;
  openEditor: (vendor: Vendor) => void;
  closeEditor: () => void;
  saveStage: () => Promise<void>;
  saveStuckThreshold: (thresholdDays: number) => Promise<void>;
  openHistory: (vendor: Vendor) => Promise<void>;
  closeHistory: () => void;
  setSelectedName: (name: string) => void;
  setStageId: (stageId: number) => void;
  setNotes: (notes: string) => void;
  clearError: () => void;
}

export const useVendorStore = create<VendorStore>((set, get) => ({
  coordinators: [], stages: [], currentUser: readSession(), vendors: [], stuckThresholdDays: 7,
  error: '', selectedName: '', editing: null, historyVendor: null, history: [],
  stageId: 0, notes: '', saving: false, savingThreshold: false, loading: true,

  load: async () => {
    set({ loading: true });
    try {
      const [coordinators, stages, vendors, stuckThreshold] = await Promise.all([
        api.coordinators(), api.stages(), api.vendors(), api.stuckThreshold(),
      ]);
      set({
        coordinators,
        stages,
        vendors,
        stuckThresholdDays: stuckThreshold.thresholdDays,
        error: '',
      });
    } catch (error) {
      set({ error: errorMessage(error, 'Không thể tải dữ liệu.') });
    } finally {
      set({ loading: false });
    }
  },

  login: async () => {
    const { selectedName } = get();
    if (!selectedName) return;
    try {
      const currentUser = await api.login(selectedName);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
      set({ currentUser, error: '' });
    } catch (error) {
      set({ error: errorMessage(error, 'Không thể đăng nhập.') });
    }
  },

  logout: () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    set({ currentUser: null, editing: null, historyVendor: null, history: [] });
  },

  handleUnauthorized: () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    set({
      currentUser: null, editing: null, historyVendor: null, history: [],
      saving: false, savingThreshold: false,
      error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    });
  },

  openEditor: (editing) => set({ editing, stageId: editing.stageId, notes: editing.notes ?? '' }),
  closeEditor: () => { if (!get().saving) set({ editing: null }); },

  saveStage: async () => {
    const { editing, currentUser, stageId, notes } = get();
    if (!editing || !currentUser) return;
    if (!Number.isInteger(stageId) || stageId < 1 || !Number.isInteger(editing.version) || editing.version < 1) {
      set({ error: 'Dữ liệu trạng thái không hợp lệ. Vui lòng tải lại trang và thử lại.' });
      return;
    }
    set({ saving: true });
    try {
      await api.updateVendor(editing.id, { stageId, version: editing.version, notes });
      set({ editing: null });
      await get().load();
    } catch (error) {
      if (!(error instanceof UnauthorizedError)) {
        set({ error: errorMessage(error, 'Không thể lưu thay đổi.'), editing: null });
        await get().load();
      }
    } finally {
      set({ saving: false });
    }
  },

  saveStuckThreshold: async (thresholdDays) => {
    if (!Number.isInteger(thresholdDays) || thresholdDays < 1 || thresholdDays > 365) {
      set({ error: 'Số ngày quá hạn phải là số nguyên từ 1 đến 365.' });
      return;
    }
    set({ savingThreshold: true });
    try {
      const stuckThreshold = await api.updateStuckThreshold(thresholdDays);
      const vendors = await api.vendors();
      set({
        stuckThresholdDays: stuckThreshold.thresholdDays,
        vendors,
        error: '',
      });
    } catch (error) {
      if (!(error instanceof UnauthorizedError)) {
        set({ error: errorMessage(error, 'Không thể lưu cấu hình quá hạn.') });
      }
    } finally {
      set({ savingThreshold: false });
    }
  },

  openHistory: async (historyVendor) => {
    set({ historyVendor, history: [] });
    try {
      set({ history: await api.history(historyVendor.id) });
    } catch (error) {
      if (!(error instanceof UnauthorizedError)) set({ error: errorMessage(error, 'Không thể tải lịch sử.') });
    }
  },
  closeHistory: () => set({ historyVendor: null }),
  setSelectedName: (selectedName) => set({ selectedName }),
  setStageId: (stageId) => set({ stageId }),
  setNotes: (notes) => set({ notes }),
  clearError: () => set({ error: '' }),
}));

setUnauthorizedHandler(() => useVendorStore.getState().handleUnauthorized());
