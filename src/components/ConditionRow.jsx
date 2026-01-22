// src/components/ConditionRow.jsx
import {
  withStartOfDay,
  withEndOfDay,
  withDefaultEndOfDay,
} from "../utils/datePicker.js";
import { dayRange } from "../utils/ateRange.js";
import DateTimeSelect from "./DateTimeSelect.jsx";

export default function ConditionRow({
  operators,
  value,
  options = [],
  onChange,
  onRemove,
}) {
  function renderValueInput() {
    if (value.operator === "empty" || value.operator === "not_empty") {
      return null;
    }

    if (value.type === "date") {
      if (value.operator === "between") {
        return (
          <div className="flex flex-col gap-2">
            {/* FROM (inclusive) */}
            <DateTimeSelect
              value={value.values?.[0] ?? ""}
              onChange={(date) =>
                onChange({
                  ...value,
                  values: [withStartOfDay(date), value.values?.[1] ?? ""],
                })
              }
            />

            {/* TO (inclusive) */}
            <DateTimeSelect
              value={value.values?.[1] ?? ""}
              onChange={(date) =>
                onChange({
                  ...value,
                  values: [value.values?.[0] ?? "", withEndOfDay(date)],
                })
              }
            />
          </div>
        );
      }

      // Single-date operators (>, <, =, etc.)
      // ON → behaves like day range
      if (value.operator === "on") {
        return (
          <DateTimeSelect
            value={value.values?.[0] ?? null}
            onChange={(date) => {
              const [from, to] = dayRange(date);

              onChange({
                ...value,
                values: [from, to],
              });
            }}
          />
        );
      }
    }

    // ✅ ENUM / TEXT IN, NOT_IN → CSV input
    if (value.operator === "in" || value.operator === "not_in") {
      return (
        <select
          multiple
          value={value.values ?? []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) =>
              o.value.toLowerCase(),
            );

            onChange({
              ...value,
              values: selected,
            });
          }}
          className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm text-slate-100"
        >
          {options.map((opt) => (
            <option key={opt} value={String(opt).toLowerCase()}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    // default single-value input
    return (
      <input
        value={value.values?.[0] ?? ""}
        onChange={(e) => onChange({ ...value, values: [e.target.value] })}
        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-slate-100"
        placeholder="Enter value…"
      />
    );
  }

  return (
    <div className="group relative w-full rounded-xl bg-slate-900/80 border border-slate-700/40 px-4 py-3">
      <div className="flex items-center gap-3 border border-slate-500/50 rounded-lg">
        <select
          value={value.operator}
          onChange={(e) => onChange({ ...value, operator: e.target.value })}
          className="flex-1 rounded-lg bg-slate-900/90 px-3 py-2 text-sm text-slate-100"
        >
          {operators.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>

        {onRemove && (
          <button
            onClick={onRemove}
            className="h-9 w-9 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
          >
            ✕
          </button>
        )}
      </div>

      <div className="mt-3">{renderValueInput()}</div>
    </div>
  );
}
