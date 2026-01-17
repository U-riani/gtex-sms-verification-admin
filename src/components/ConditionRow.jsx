// src/components/ConditionRow.jsx

export default function ConditionRow({ operators, value, onChange, onRemove }) {
  // 🔍 LOG INITIAL RENDER
  console.log("[ConditionRow render]", {
    operator: value.operator,
    values: value.values,
    logic: value.logic,
  });
  return (
    <div className="flex w-full flex-col gap-2 items-center bg-slate-900/60 rounded-lg px-2 py-1">
      <select
        className="w-full px-2 py-1 rounded bg-slate-800 text-slate-100"
        value={value.operator}
        onChange={(e) => {
          const next = { ...value, operator: e.target.value };

          console.log("[ConditionRow operator change]", {
            before: value,
            after: next,
          });

          onChange(next);
        }}
      >
        {operators.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      <input
        className="w-full px-2 py-1 rounded bg-slate-800 text-slate-100"
        value={value.values?.[0] ?? ""}
        onChange={(e) => {
          const next = { ...value, values: [e.target.value] };

          console.log("[ConditionRow value change]", {
            before: value,
            after: next,
          });

          onChange(next);
        }}
      />

      {onRemove && (
        <button onClick={onRemove} className="text-red-400 hover:text-red-300">
          ✕
        </button>
      )}
    </div>
  );
}
