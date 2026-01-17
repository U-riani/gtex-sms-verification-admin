import { create } from "zustand";

export const useSmsCampaignStore = create((set) => ({
  showStart: false,
  selectedTemplateId: null,
  selectedSegmentId: null,

  openStart: () => set({ showStart: true }),
  closeStart: () => set({ showStart: false }),

  setTemplate: (id) => set({ selectedTemplateId: id }),
  setSegment: (id) => set({ selectedSegmentId: id }),

  reset: () =>
    set({
      selectedTemplateId: null,
      selectedSegmentId: null,
      showStart: false,
    }),
}));
