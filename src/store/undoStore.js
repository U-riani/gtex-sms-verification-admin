// store/undoStore.js
import { create } from "zustand";

export const useUndoStore = create((set, get) => ({
  snackbar: null,
  timeoutId: null,

  showUndo({ message, undo, duration = 5000 }) {
    const prevTimeout = get().timeoutId;
    if (prevTimeout) clearTimeout(prevTimeout);

    const timeoutId = setTimeout(() => {
      set({ snackbar: null, timeoutId: null });
    }, duration);

    set({
      snackbar: { message, undo },
      timeoutId,
    });
  },

  triggerUndo() {
    const { snackbar, timeoutId } = get();
    if (!snackbar) return;

    clearTimeout(timeoutId);
    snackbar.undo?.();
    set({ snackbar: null, timeoutId: null });
  },

  close() {
    const { timeoutId } = get();
    if (timeoutId) clearTimeout(timeoutId);
    set({ snackbar: null, timeoutId: null });
  },
}));
