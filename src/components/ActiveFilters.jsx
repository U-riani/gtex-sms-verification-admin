// src/components/ActiveFilters.jsx

const truncate = (value, max = 5) => {
  if (value == null) return "";
  const str = String(value);
  return str.length > max ? `${str.slice(0, max)}...` : str;
};

export default function ActiveFilters({
  quickSearch,
  onClearQuickSearch,

  advancedFilter,
  onRemoveAdvancedCondition,
  onClearAdvancedFilter,
  onEditAdvancedFilter, // 👈 ADD THIS

  columnFilters,
  onRemoveColumnFilter,
  onEditColumnFilter,
}) {
  const hasAnything =
    quickSearch ||
    advancedFilter?.groups?.length ||
    Object.keys(columnFilters).length > 0;

  if (!hasAnything) return null;

  return (
    <div className="flex flex-wrap gap-2 bg-slate-800 border border-slate-700 rounded-lg p-3">
      {/* QUICK SEARCH */}
      {quickSearch && (
        <Chip
          color="blue"
          label={`Search: "${quickSearch}"`}
          onRemove={onClearQuickSearch}
        />
      )}

      {/* ADVANCED FILTERS (GROUPED CHIPS) */}
      {advancedFilter?.groups?.map((group, gi) => {
        const isLastGroup = gi === advancedFilter.groups.length - 1;

        return (
          <div key={group.id ?? gi} className="flex items-center gap-2">
            {/* GROUP CONTAINER */}
            <div className="flex flex-wrap items-center gap-2 px-2 py-1 rounded border border-purple-500/30 bg-purple-900/10">
              {group.conditions.map((cond, ci) => {
                const isLastCond = ci === group.conditions.length - 1;

                // connector between THIS condition and the NEXT one
                const condLogic = cond.logic || "AND";

                return (
                  <div key={cond.id ?? ci} className="flex items-center gap-2">
                    <Chip
                      color="purple"
                      label={`${cond.field} ${cond.operator} ${truncate(
                        cond.value,
                        10
                      )}`}
                      title={`${cond.field} ${cond.operator} ${cond.value}`}
                      onRemove={() => onRemoveAdvancedCondition(gi, ci)}
                      onEdit={() => onEditAdvancedFilter(gi, ci)}
                    />

                    {/* LOGIC BETWEEN CONDITIONS (use cond.logic, not group.logic) */}
                    {!isLastCond && (
                      <span className="text-purple-300 text-xs font-semibold">
                        {condLogic}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* LOGIC BETWEEN GROUPS (use group.logic, not hardcoded OR) */}
            {!isLastGroup && (
              <span className="text-pink-400 text-xs font-bold mx-1">
                {group.logic || "OR"}
              </span>
            )}
          </div>
        );
      })}

      {/* COLUMN FILTERS */}
      {Object.entries(columnFilters).map(([key, f]) => {
        const isEnum = f.type === "enum";
        const values = isEnum ? f.values : [f.value].filter(Boolean);

        const fullValue = values.join(", ");
        const shortValue = truncate(values[0]);
        const extraCount = values.length - 1;

        return (
          <Chip
            key={key}
            color="green"
            label={`${key}: ${shortValue}${
              extraCount > 0 ? ` +${extraCount}` : ""
            }`}
            title={`${key}: ${fullValue}`} // hover = full list
            onRemove={() => onRemoveColumnFilter(key)}
            onEdit={() => onEditColumnFilter(key)}
          />
        );
      })}
    </div>
  );
}

function Chip({ label, onRemove, onEdit, color, title }) {
  const colors = {
    blue: "bg-blue-700",
    purple: "bg-purple-700",
    green: "bg-green-700",
    red: "bg-red-700",
  };

  return (
    <div
      title={title}
      className={`flex items-center gap-2 text-white text-sm px-3 py-1 rounded ${colors[color]}`}
    >
      <span>{label}</span>

      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-xs opacity-80 hover:opacity-100"
          title="Edit"
        >
          ✎
        </button>
      )}

      <button
        onClick={onRemove}
        className="font-bold hover:opacity-70"
        title="Remove"
      >
        ✕
      </button>
    </div>
  );
}
