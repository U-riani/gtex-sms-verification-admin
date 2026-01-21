// src/store/dashboardStore.js
import { create } from "zustand";

export const useDashboardStore = create((set) => ({
  range: "7d", // future-proof
  setRange: (range) => set({ range }),
}));
