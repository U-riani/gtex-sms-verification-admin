export default function AdvancedFilterChips({ filter, fields, onClear }) {
  if (!filter?.groups?.length) return null;

  const fieldMap = Object.fromEntries(
    fields.map((f) => [f.key, f.label])
  );

  return (
    <div className="flex flex-wrap gap-2 bg-slate-700 rounded p-3">
      {filter.groups.map((group, gi) =>
        group.conditions.map((cond, ci) => {
          if (!cond.field || !cond.operator) return null;

          const label = fieldMap[cond.field] ?? cond.field;
          const value =
            cond.value === "" || cond.value == null
              ? "(empty)"
              : String(cond.value);

          return (
            <div
              key={`${gi}-${ci}`}
              className="flex items-center gap-2 bg-purple-600 text-white px-2 py-1 rounded text-sm"
            >
              <span className="font-semibold">{label}</span>
              <span className="opacity-90">
                {cond.operator} {value}
              </span>
            </div>
          );
        })
      )}

      <button
        onClick={onClear}
        className="ml-2 px-2 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-500"
      >
        ✕ Clear advanced filter
      </button>
    </div>
  );
}
