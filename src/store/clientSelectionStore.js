// src/store/slientSelectionStore.js
import { create } from "zustand";

export const useClientSelectionStore = create((set) => ({
  selectedIds: new Set(),

  setSelectedIds: (ids) =>
    set({ selectedIds: new Set(ids) }),

  toggleId: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      next.has(id) ? next.delete(id) : next.add(id);
      return { selectedIds: next };
    }),

  clear: () => set({ selectedIds: new Set() }),
}));
// in clientSelectionStore
export const useSelectedClientIds = () =>
  useClientSelectionStore((s) => Array.from(s.selectedIds));
