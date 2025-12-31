// src/components/ActiveFilters.jsx

import { useEffect, useRef, useState } from "react";

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
  onRemoveAdvancedGroup,
}) {
  const COLLAPSED_HEIGHT = 30;
  const chipsContaineRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);

  const hasAnything =
    quickSearch ||
    advancedFilter?.groups?.length ||
    Object.keys(columnFilters).length > 0;

  if (!hasAnything) {
    return null;
  }

  const toggleCollapse = () => {
    const el = chipsContaineRef.current;
    if (!el) return;

    // Only allow collapsing if content actually overflows
    if (!collapsed && el.scrollHeight <= COLLAPSED_HEIGHT) {
      return;
    }

    setCollapsed((v) => !v);
  };

  return (
    <div className="relative px-2 bg-slate-800 border border-slate-700 rounded-lg ">
      <div
        className={`
          absolute w-full h-3 -top-1.5 left-0 flex items-center gap-1 ps-4 pe-2
          transition-all duration-1100 ease-in-out
          ${
            collapsed
              ? "opacity-100 pointer-events-auto"
              : "opacity-0  pointer-events-none"
          }
        `}
      >
        {quickSearch && (
          <div className="w-2 h-2 border-2 border-blue-500 rounded-full" />
        )}

        {advancedFilter?.groups?.map((_, i) => (
          <div
            key={`af-${i}`}
            className="w-2 h-2 border-2 border-purple-700 rounded-full"
          />
        ))}

        {Object.entries(columnFilters).map((_, i) => (
          <div
            key={`cf-${i}`}
            className="w-2 h-2 border-2 border-green-700 rounded-full"
          />
        ))}
      </div>

      <button
        className="absolute right-2 top-4.5 text-slate-400 z-10 hover:text-white cursor-pointer bg-slate-100/10 px-2 rounded hover:bg-slate-100/30 hover:text-slate-300"
        onClick={toggleCollapse}
      >
        <span
          className={`inline-block transition-transform duration-500 ease-in-out
            ${!collapsed ? "rotate-180" : "rotate-0"}`}
        >
          v
        </span>
      </button>
      <div className="overflow-hidden py-3 px-2">
        <div
          ref={chipsContaineRef}
          className={`relative flex flex-wrap gap-x-3 gap-y-3        
        will-change-[max-height]
        transition-[max-height] duration-500 linear
        ${collapsed ? "max-h-[36px]" : "max-h-[500px]"}
      `}
        >
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
              <div key={group.id ?? gi} className=" flex items-center gap-2">
                {/* GROUP CONTAINER */}
                <div className="relative flex flex-wrap items-center gap-2 px-2 py-1 rounded border border-purple-500/30 bg-purple-900/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveAdvancedGroup(gi);
                    }}
                    title="Remove group"
                    className="w-5 h-5 text-slate-400 absolute -right-3 -top-2.5 text-[12px]
             bg-slate-100/10 border border-slate-100/20 rounded-full
             cursor-pointer hover:bg-red-500/30 hover:text-red-300"
                  >
                    ✕
                  </button>

                  {group.conditions.map((cond, ci) => {
                    const isLastCond = ci === group.conditions.length - 1;

                    // connector between THIS condition and the NEXT one
                    const condLogic = cond.logic || "AND";

                    return (
                      <div
                        key={cond.id ?? ci}
                        className="flex items-center gap-2"
                      >
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
          {collapsed && (
            <div className="absolute -bottom-3 w-full h-2 bg-slate-800"></div>
          )}
        </div>
      </div>
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
      className={`flex items-center gap-2 text-white text-sm px-3 ${
        label.includes("Search") ? "py-2" : "py-1"
      } rounded ${colors[color]}`}
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
