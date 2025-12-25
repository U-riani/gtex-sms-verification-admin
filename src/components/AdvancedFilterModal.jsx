import { useState } from "react";
import ConditionRow from "./AdvancedFilter/ConditionRow";

export default function AdvancedFilterModal({ onApply, onClose }) {
  const [filter, setFilter] = useState({
    groups: [
      {
        logic: "AND",
        conditions: [],
      },
    ],
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-slate-800 w-[720px] rounded p-4 space-y-4">
        <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>

        {filter.groups.map((group, gi) => (
          <div key={gi} className="space-y-3">
            {/* 🔗 GROUP CONNECTOR (between groups) */}
            {gi > 0 && (
              <div className="flex justify-center items-center gap-2 text-sm text-slate-300">
                <span>Connect groups with</span>

                <select
                  value={filter.groups[gi - 1].logic}
                  onChange={(e) => {
                    const updated = structuredClone(filter);
                    updated.groups[gi - 1].logic = e.target.value;
                    setFilter(updated);
                  }}
                  className="bg-slate-700 text-white px-2 py-1 rounded"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              </div>
            )}

            {/* 🧱 GROUP BOX (UNCHANGED INSIDE) */}
            <div className="space-y-2 border border-slate-600 rounded p-3">
              <div className="text-sm text-slate-300 font-semibold">
                Group {gi + 1}
              </div>

              {group.conditions.map((cond, ci) => (
                <ConditionRow
                  key={ci}
                  condition={cond}
                  showLogic={ci < group.conditions.length - 1}
                  onChange={(next) => {
                    const updated = structuredClone(filter);
                    updated.groups[gi].conditions[ci] = next;
                    setFilter(updated);
                  }}
                  onRemove={() => {
                    const updated = structuredClone(filter);
                    updated.groups[gi].conditions.splice(ci, 1);
                    setFilter(updated);
                  }}
                />
              ))}

              <button
                onClick={() => {
                  const updated = structuredClone(filter);
                  updated.groups[gi].conditions.push({ logic: "AND" });
                  setFilter(updated);
                }}
                className="text-sm text-blue-400"
              >
                + Add condition
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            setFilter((prev) => ({
              ...prev,
              groups: [...prev.groups, { logic: "AND", conditions: [] }],
            }));
          }}
          className="text-sm text-blue-400"
        >
          + Add group
        </button>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-600 text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(filter)}
            className="px-3 py-1 rounded bg-blue-600 text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
