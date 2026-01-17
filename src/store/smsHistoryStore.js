// src/store/smsHistory.js
import { create } from "zustand";

export const useSmsHistoryStore = create((set) => ({
  /* selection */
  selectedIds: new Set(),

  toggleSelected(id) {
    set((s) => {
      const n = new Set(s.selectedIds);
      n.has(id) ? n.delete(id) : n.add(id);
      return { selectedIds: n };
    });
  },

  clearSelected() {
    set({ selectedIds: new Set() });
  },

  /* search */
  search: "",
  setSearch: (search) => set({ search }),

  /* column filters (CLIENT SIDE) */
  columnFilters: {},
  setColumnFilter: (key, payload) =>
    set((s) => ({
      columnFilters: { ...s.columnFilters, [key]: payload },
    })),
  removeColumnFilter: (key) =>
    set((s) => {
      const n = { ...s.columnFilters };
      delete n[key];
      return { columnFilters: n };
    }),

  /* advanced filter (SERVER SIDE) */
  advancedFilter: null,
  advancedOpen: false,

  openAdvanced: () => set({ advancedOpen: true }),
  closeAdvanced: () => set({ advancedOpen: false }),

  setAdvancedFilter: (filter) =>
    set({
      advancedFilter: filter,
      page: 1, // 🔥 reset pagination
    }),

  clearAdvancedFilter: () => set({ advancedFilter: null }),

  /* pagination */
  page: 1,
  totalPages: 1,

  setPage: (page) => set({ page }),
  setTotalPages: (totalPages) => set({ totalPages }),

  reset() {
    set({
      selectedIds: new Set(),
      search: "",
      columnFilters: {},
      advancedFilter: null,
      page: 1,
      totalPages: 1,
    });
  },
}));
