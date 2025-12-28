// src/components/ActiveFilters.jsx
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

      {/* ADVANCED FILTERS */}
      {advancedFilter?.groups?.map((group, gi) =>
        group.conditions.map((cond, ci) => (
          <Chip
            key={`adv-${gi}-${ci}`}
            color="purple"
            label={`${cond.field} ${cond.operator} ${cond.value}`}
            onRemove={() => onRemoveAdvancedCondition(gi, ci)}
            onEdit={() => onEditAdvancedFilter(gi, ci)} // 👈 EDIT
          />
        ))
      )}

      {advancedFilter && (
        <Chip
          color="red"
          label="Clear advanced filters"
          onRemove={onClearAdvancedFilter}
        />
      )}

      {/* COLUMN FILTERS */}
      {Object.entries(columnFilters).map(([key, f]) => (
        <Chip
          key={key}
          color="green"
          label={
            f.type === "enum"
              ? `${key}: ${f.values.join(", ")}`
              : `${key}: ${f.value}`
          }
          onRemove={() => onRemoveColumnFilter(key)}
          onEdit={() => onEditColumnFilter(key)} // 👈 ADD
        />
      ))}
    </div>
  );
}

function Chip({ label, onRemove, onEdit, color }) {
  const colors = {
    blue: "bg-blue-700",
    purple: "bg-purple-700",
    green: "bg-green-700",
    red: "bg-red-700",
  };

  return (
    <div
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
