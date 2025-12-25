export default function AdvancedFilterChips({ filter, fields, onClear }) {
  if (!filter?.groups?.length) return null;

  const fieldMap = Object.fromEntries(fields.map((f) => [f.key, f.label]));

  return (
    <div className="flex flex-wrap items-center gap-3 bg-slate-700 rounded p-3">
      {filter.groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-2">
          {/* 🔶 GROUP LOGIC (between groups) */}
          {gi > 0 && (
            <span className="px-2 py-1 text-xs font-semibold text-yellow-400">
              {filter.groups[gi - 1].logic}
            </span>
          )}

          {/* 🟪 GROUP BOX */}
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded px-2 py-1">
            {group.conditions.map((cond, ci) => {
              if (!cond.field || !cond.operator) return null;

              const label = fieldMap[cond.field] ?? cond.field;
              const value =
                cond.value === "" || cond.value == null
                  ? "(empty)"
                  : String(cond.value);

              return (
                <div key={`${gi}-${ci}`} className="flex items-center gap-2">
                  {/* condition chip */}
                  <div className="bg-purple-600 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                    {label} {cond.operator} {value}
                  </div>

                  {/* condition logic */}
                  {ci < group.conditions.length - 1 && (
                    <span className="text-xs text-slate-400">
                      {cond.logic || "AND"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={onClear}
        className="ml-2 px-2 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-500"
      >
        ✕ Clear advanced filter
      </button>
    </div>
  );
}
