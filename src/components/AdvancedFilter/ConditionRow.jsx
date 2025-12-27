import { useEffect, useState } from "react";
import { USER_ADVANCED_FILTER_FIELDS } from "../../config/userAdvancedFilterFields";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const distinctCache = new Map();

export default function ConditionRow({
  condition,
  onChange,
  onRemove,
  showLogic,
}) {
  const fieldDef = USER_ADVANCED_FILTER_FIELDS.find(
    (f) => f.key === condition.field
  );
  const [options, setOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (
      !fieldDef?.dynamicOptions ||
      !["in", "not_in"].includes(condition.operator)
    ) {
      return;
    }

    if (distinctCache.has(fieldDef.key)) {
      setOptions(distinctCache.get(fieldDef.key));
      return;
    }

    let cancelled = false;

    const loadOptions = async () => {
      try {
        setLoadingOptions(true);

        const res = await fetch(
          `${API_BASE}/filters/distinct?field=${fieldDef.key}`
        );
        const data = await res.json();

        if (!cancelled) {
          distinctCache.set(fieldDef.key, data);
          setOptions(data);
        }
      } catch (e) {
        console.error("Failed to load options", e);
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    };

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, [condition.operator, fieldDef?.key]);

  useEffect(() => {
    setOptions([]);
  }, [fieldDef?.key]);

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
          onChange={(e) => {
            const op = e.target.value;

            onChange({
              ...condition,
              operator: op,
              value: ["contains", "not_contains"].includes(op)
                ? condition.value ?? ""
                : "",
              values: ["in", "not_in"].includes(op)
                ? condition.values ?? []
                : [],
            });
          }}
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

      {/* TEXT INPUT (text fields + array contains) */}
      {fieldDef &&
        ["text", "array"].includes(fieldDef.type) &&
        ["contains", "not_contains"].includes(condition.operator) && (
          <input
            value={condition.value || ""}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
            className="bg-slate-700 text-white px-2 py-1 rounded"
            placeholder="Value"
          />
        )}

      {/* MULTI SELECT (array in / not_in) */}
      {fieldDef?.type === "array" &&
        ["in", "not_in"].includes(condition.operator) && (
          <div className="flex flex-wrap gap-1 min-w-[180px]">
            {options.map((opt) => {
              const selected = condition.values?.includes(opt);

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    const next = selected
                      ? condition.values.filter((v) => v !== opt)
                      : [...(condition.values || []), opt];

                    onChange({ ...condition, values: next });
                  }}
                  className={`
              px-2 py-0.5 rounded-full text-xs border transition
              ${
                selected
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              }
            `}
                >
                  {opt}
                </button>
              );
            })}

            {loadingOptions && (
              <span className="text-xs text-slate-400">Loading…</span>
            )}
          </div>
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
