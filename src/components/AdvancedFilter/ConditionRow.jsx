import { USER_ADVANCED_FILTER_FIELDS } from "../../config/userAdvancedFilterFields";

export default function ConditionRow({
  condition,
  onChange,
  onRemove,
  showLogic,
}) {
  const fieldDef = USER_ADVANCED_FILTER_FIELDS.find(
    (f) => f.key === condition.field
  );

  return (
    <div className="flex gap-2 items-center">
      {/* Field select */}
      <select
        value={condition.field || ""}
        onChange={(e) =>
          onChange({
            ...condition,
            field: e.target.value,
            operator: "",
            value: "",
          })
        }
        className="bg-slate-700 text-white px-2 py-1 rounded"
      >
        <option value="">Field</option>
        {USER_ADVANCED_FILTER_FIELDS.map((f) => (
          <option key={f.key} value={f.key}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Operator select */}
      {fieldDef && (
        <select
          value={condition.operator || ""}
          onChange={(e) => onChange({ ...condition, operator: e.target.value })}
          className="bg-slate-700 text-white px-2 py-1 rounded"
        >
          <option value="">Operator</option>
          {fieldDef.operators.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      )}

      {/* Value input placeholder */}
      {fieldDef?.type === "text" && (
        <input
          value={condition.value || ""}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          className="bg-slate-700 text-white px-2 py-1 rounded"
          placeholder="Value"
        />
      )}
      {showLogic && (
        <select
          value={condition.logic || "AND"}
          onChange={(e) => onChange({ ...condition, logic: e.target.value })}
          className="bg-slate-700 text-white px-2 py-1 rounded text-xs"
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
      )}

      <button onClick={onRemove} className="text-red-400 hover:text-red-300">
        ✕
      </button>
    </div>
  );
}
