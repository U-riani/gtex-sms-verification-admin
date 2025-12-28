import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ConditionRow from "./ConditionRow";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableCondition from "./SortableCondition";

export default function SortableGroup({ group, index, filter, setFilter }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-3">
      {/* GROUP BOX */}
      <div className="relative border-2 border-slate-600 rounded-lg p-4 bg-slate-800 space-y-3">
        {group.conditions.length === 0 && (
          <div className="text-xs text-red-400 italic">
            No conditions in this group
          </div>
        )}
        {/* left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />

        {/* Drag handle */}
        <div className="flex items-center justify-between">
          <div
            className="cursor-grab text-slate-300 text-xs font-semibold tracking-wide"
            {...attributes}
            {...listeners}
          >
            ☰ Group {index + 1}
          </div>

          <button
            disabled={filter.groups.length === 1}
            onClick={() => {
              if (filter.groups.length === 1) return;

              if (!confirm("Delete this group?")) return;

              const updated = structuredClone(filter);
              updated.groups.splice(index, 1);
              setFilter(updated);
            }}
            className={`text-xs px-2 py-1 rounded ${
              filter.groups.length === 1
                ? "opacity-40 cursor-not-allowed bg-slate-700"
                : "bg-red-700 hover:bg-red-600 text-white"
            }`}
          >
            Delete
          </button>
        </div>

        <SortableContext
          items={group.conditions.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {group.conditions.map((cond, ci) => (
            <SortableCondition
              data-adv-cond={`${index}-${ci}`}
              key={cond.id}
              condition={cond}
              showLogic={ci < group.conditions.length - 1}
              onChange={(next) => {
                const updated = structuredClone(filter);
                updated.groups[index].conditions[ci] = next;
                setFilter(updated);
              }}
              onRemove={() => {
                const updated = structuredClone(filter);
                updated.groups[index].conditions.splice(ci, 1);
                setFilter(updated);
              }}
            />
          ))}
        </SortableContext>

        <button
          onClick={() => {
            const updated = structuredClone(filter);
            updated.groups[index].conditions.push({
              id: crypto.randomUUID(),
              field: "",
              operator: "",
              value: "",
              logic: "AND",
            });
            setFilter(updated);
          }}
          className="text-sm text-blue-400"
        >
          + Add condition
        </button>
      </div>
      {/* CONNECTOR TO NEXT GROUP */}
      {filter.groups[index + 1] && (
        <div className="flex justify-center my-2 bg-transparent">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/50 bg-transparent px-1 py-1 text-xs font-bold">
            {/* AND option */}
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name={`logic-${index}`}
                value="AND"
                checked={group.logic === "AND"}
                onChange={(e) => {
                  const updated = structuredClone(filter);
                  updated.groups[index].logic = e.target.value;
                  setFilter(updated);
                }}
                className="sr-only" // hide the default radio circle
              />
              <span
                className={`px-3 py-0.5 rounded-full transition-colors ${
                  group.logic === "AND"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                    : "text-yellow-400/60 hover:text-yellow-300 hover:bg-yellow-500/10"
                }`}
              >
                AND
              </span>
            </label>

            {/* OR option */}
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name={`logic-${index}`}
                value="OR"
                checked={group.logic === "OR"}
                onChange={(e) => {
                  const updated = structuredClone(filter);
                  updated.groups[index].logic = e.target.value;
                  setFilter(updated);
                }}
                className="sr-only"
              />
              <span
                className={`px-3 py-0.5 rounded-full transition-colors ${
                  group.logic === "OR"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                    : "text-yellow-400/60 hover:text-yellow-300 hover:bg-yellow-500/10"
                }`}
              >
                OR
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
