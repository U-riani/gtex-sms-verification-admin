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
          <div key={gi} className="space-y-2">
            {group.conditions.map((cond, ci) => (
              <ConditionRow
                key={ci}
                condition={cond}
                onChange={(next) => {
                  const updated = [...filter.groups];
                  updated[gi].conditions[ci] = next;
                  setFilter({ ...filter, groups: updated });
                }}
                onRemove={() => {
                  const updated = [...filter.groups];
                  updated[gi].conditions.splice(ci, 1);
                  setFilter({ ...filter, groups: updated });
                }}
              />
            ))}

            <button
              onClick={() => {
                const updated = [...filter.groups];
                updated[gi].conditions.push({});
                setFilter({ ...filter, groups: updated });
              }}
              className="text-sm text-blue-400"
            >
              + Add condition
            </button>
          </div>
        ))}

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
