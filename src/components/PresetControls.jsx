export default function PresetControls({
  presets,
  selectedPresetId,
  onSelectPreset,

  canSave,
  onSavePreset,

  onEditPreset,
  onDeletePreset,
}) {
  return (
    <div className="flex items-center gap-2">
      {/* 💾 SAVE PRESET */}
      {canSave && (
        <button
          onClick={onSavePreset}
          className="px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-500"
        >
          ★ Save preset
        </button>
      )}

      {/* 📂 PRESET SELECT */}
      <select
        value={selectedPresetId}
        onChange={(e) => onSelectPreset(e.target.value)}
        className="bg-slate-700 text-white px-3 py-2 rounded"
      >
        <option value="">Presets…</option>
        {presets.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* ✏️ / 🗑 ACTIONS */}
      {selectedPresetId && (
        <>
          <button
            onClick={onEditPreset}
            className="px-2 py-2 text-xs rounded bg-slate-600 text-white hover:bg-slate-500"
            title="Edit preset"
          >
            ✎
          </button>

          <button
            onClick={onDeletePreset}
            className="px-2 py-2 text-xs rounded bg-red-700 text-white hover:bg-red-600"
            title="Delete preset"
          >
            🗑
          </button>
        </>
      )}
    </div>
  );
}
