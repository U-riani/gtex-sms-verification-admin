import { useState } from "react";
import { nanoid } from "nanoid";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import PresetControls from "../components/PresetControls";

import SortableGroup from "./AdvancedFilter/SortableGroup";
// import {
//   isFilterValid,
//   sanitizeFilter,
// } from "../utils/advancedFilterValidation";

export default function AdvancedFilterModal({
  initialFilter,
  onApply,
  onClose,

  presets,
  selectedPresetId,
  onSavePreset,
  onSelectPreset,
  onDeletePreset,
}) {
  const [filter, setFilter] = useState(
    initialFilter
      ? structuredClone(initialFilter)
      : {
          groups: [
            {
              id: nanoid(),
              logic: "AND",
              conditions: [],
            },
          ],
        }
  );
  const hasConditions = filter.groups.some((g) => g.conditions.length > 0);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="max-h-screen overflow-y-auto">
        <div className="bg-slate-800 lg:w-[720px] rounded p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Advanced Filters
            </h3>

            <PresetControls
              presets={presets}
              selectedPresetId={selectedPresetId}
              canSave={hasConditions}
              onSavePreset={() => onSavePreset(filter)}
              onSelectPreset={(id) => onSelectPreset(id, setFilter)}
              onEditPreset={() => {
                const preset = presets.find((p) => p.id === selectedPresetId);
                if (!preset) return;
                setFilter(structuredClone(preset.filter));
              }}
              onDeletePreset={onDeletePreset}
            />
          </div>

          {/* 🧠 DRAG CONTEXT */}
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (!over || active.id === over.id) return;

              const isGroup = filter.groups.some((g) => g.id === active.id);

              if (isGroup) {
                setFilter((prev) => {
                  const oldIndex = prev.groups.findIndex(
                    (g) => g.id === active.id
                  );
                  const newIndex = prev.groups.findIndex(
                    (g) => g.id === over.id
                  );

                  if (oldIndex === -1 || newIndex === -1) return prev;

                  const groups = [...prev.groups];
                  const [moved] = groups.splice(oldIndex, 1);
                  groups.splice(newIndex, 0, moved);

                  return { ...prev, groups };
                });
                return;
              }

              if (!over || active.id === over.id) return;

              setFilter((prev) => {
                // 🔍 find source group & condition
                let fromGroupIndex = -1;
                let fromConditionIndex = -1;

                prev.groups.forEach((g, gi) => {
                  const ci = g.conditions.findIndex((c) => c.id === active.id);
                  if (ci !== -1) {
                    fromGroupIndex = gi;
                    fromConditionIndex = ci;
                  }
                });

                // 🔍 find target group
                let toGroupIndex = prev.groups.findIndex(
                  (g) => g.id === over.id
                );

                // If dropped on another condition, find its group
                if (toGroupIndex === -1) {
                  prev.groups.forEach((g, gi) => {
                    if (g.conditions.some((c) => c.id === over.id)) {
                      toGroupIndex = gi;
                    }
                  });
                }

                // Not a condition drag → let group logic handle it
                if (fromGroupIndex === -1 || toGroupIndex === -1) {
                  return prev;
                }

                const updated = structuredClone(prev);
                const fromConditions =
                  updated.groups[fromGroupIndex].conditions;
                const toConditions = updated.groups[toGroupIndex].conditions;

                const [moved] = fromConditions.splice(fromConditionIndex, 1);

                // find target index
                let toIndex = toConditions.findIndex((c) => c.id === over.id);
                if (toIndex === -1) {
                  toIndex = toConditions.length;
                }

                toConditions.splice(toIndex, 0, moved);

                return updated;
              });
            }}
          >
            <SortableContext
              items={filter.groups.map((g) => g.id)}
              strategy={verticalListSortingStrategy}
            >
              {filter.groups.map((group, gi) => (
                <SortableGroup
                  key={group.id}
                  group={group}
                  index={gi}
                  filter={filter}
                  setFilter={setFilter}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* ➕ ADD GROUP */}
          <button
            onClick={() => {
              setFilter((prev) => ({
                ...prev,
                groups: [
                  ...prev.groups,
                  {
                    id: nanoid(),
                    logic: "AND",
                    conditions: [],
                  },
                ],
              }));
            }}
            className="text-sm text-blue-400"
          >
            + Add group
          </button>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded bg-slate-600 text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const cleaned = structuredClone(filter);
                cleaned.groups = cleaned.groups.filter(
                  (g) => g.conditions.length > 0
                );

                if (cleaned.groups.length === 0) {
                  alert("At least one group with conditions is required.");
                  return;
                }

                onApply(cleaned);
              }}
              className="px-3 py-1 rounded bg-blue-600 text-white"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
