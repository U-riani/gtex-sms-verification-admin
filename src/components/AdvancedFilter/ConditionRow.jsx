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
        <div className="inline-flex items-center gap-0.5 rounded-full border border-slate-600 bg-slate-800/50 px-1 py-0.5 text-xs">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name={`logic-${condition.id}`} // use unique name per instance
              value="AND"
              checked={condition.logic === "AND"}
              onChange={() => onChange({ ...condition, logic: "AND" })}
              className="sr-only"
            />
            <span
              className={`
          px-3 py-1 rounded-full transition-colors
          ${
            condition.logic === "AND"
              ? "bg-slate-600 text-white"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
          }
        `}
            >
              AND
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name={`logic-${condition.id}`}
              value="OR"
              checked={condition.logic === "OR"}
              onChange={() => onChange({ ...condition, logic: "OR" })}
              className="sr-only"
            />
            <span
              className={`
          px-3 py-1 rounded-full transition-colors
          ${
            condition.logic === "OR"
              ? "bg-slate-600 text-white"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
          }
        `}
            >
              OR
            </span>
          </label>
        </div>
      )}

      <button onClick={onRemove} className="text-red-400 hover:text-red-300">
        ✕
      </button>
    </div>
  );
}
