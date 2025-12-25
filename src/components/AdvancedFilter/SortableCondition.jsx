import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ConditionRow from "./ConditionRow";

export default function SortableCondition({
  condition,
  onChange,
  onRemove,
  showLogic,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: condition.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-400 pt-2"
      >
        ☰
      </div>

      <ConditionRow
        condition={condition}
        onChange={onChange}
        onRemove={onRemove}
        showLogic={showLogic}
      />
    </div>
  );
}
