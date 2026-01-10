import { useUndoStore } from "../store/undoStore";

export default function UndoSnackbar() {
  const snackbar = useUndoStore((s) => s.snackbar);
  const triggerUndo = useUndoStore((s) => s.triggerUndo);
  const close = useUndoStore((s) => s.close);

  if (!snackbar) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded shadow-lg">
        <span className="text-sm">{snackbar.message}</span>

        <button
          onClick={triggerUndo}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          UNDO
        </button>

        <button
          onClick={close}
          className="text-gray-400 hover:text-gray-300 text-sm"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
