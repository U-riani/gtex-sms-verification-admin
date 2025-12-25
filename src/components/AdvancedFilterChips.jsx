export default function AdvancedFilterChips({ filter, fields, onClear }) {
  if (!filter?.groups?.length) return null;

  const fieldMap = Object.fromEntries(fields.map((f) => [f.key, f.label]));

  return (
    <div className="flex flex-wrap items-center gap-4 bg-slate-700 rounded p-3">
      {filter.groups.map((group, gi) => (
        <div key={group.id} className="flex items-center gap-3">
          {filter.groups[gi - 1] && (
            <span className="px-3 py-1 rounded-full bg-yellow-600/20 text-yellow-300 text-xs font-bold">
              {filter.groups[gi - 1].logic}
            </span>
          )}

          <div className="border border-slate-600 bg-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
            {group.conditions.map((cond, ci) => (
              <div key={cond.id} className="flex items-center gap-2">
                <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm">
                  {fieldMap[cond.field]} {cond.operator} {cond.value}
                </span>

                {ci < group.conditions.length - 1 && (
                  <span className="text-xs text-slate-400 font-semibold">
                    {cond.logic}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
