import { createPortal } from "react-dom";
import { useMemo, useState, useEffect } from "react";
import { OPERATORS } from "../constanst/operators";

export default function TableFilterDropdown({
  columnKey,
  columnType,
  data,
  value,
  onChange,
  onClose,
  position,
}) {
  const [search, setSearch] = useState(value?.search || "");
  const [selected, setSelected] = useState([]);
  const [operator, setOperator] = useState(value?.operator || "contains");

  const uniqueValues = useMemo(() => {
    const values = data.flatMap((r) => {
      const v = r[columnKey];
      if (Array.isArray(v)) return v.map(String);
      if (v == null) return [];
      return [String(v)];
    });

    return [...new Set(values)];
  }, [data, columnKey]);

  const visibleValues = useMemo(() => {
    if (!search) return uniqueValues;
    return uniqueValues.filter((v) =>
      v.toLowerCase().includes(search.toLowerCase())
    );
  }, [uniqueValues, search]);

  useEffect(() => {
    setSelected(value?.values ?? uniqueValues);
  }, [value, uniqueValues]);

  const allSelected =
    visibleValues.length > 0 &&
    visibleValues.every((v) => selected.includes(v));

  const toggleAll = () => {
    setSelected((prev) =>
      allSelected
        ? prev.filter((v) => !visibleValues.includes(v))
        : [...new Set([...prev, ...visibleValues])]
    );
  };

  useEffect(() => {
    if (value?.operator) setOperator(value.operator);
  }, [value]);

  const apply = () => {
    onChange({
      type: "enum",
      operator, // contains / not_contains
      values: selected, // the checked items
    });

    onClose?.();
  };

  return createPortal(
    <div
      style={{ top: position.top, left: position.left }}
      className="fixed z-50 w-56 bg-slate-800 border rounded p-2"
      onClick={(e) => e.stopPropagation()}
    >
      <select
        value={operator}
        onChange={(e) => setOperator(e.target.value)}
        className="w-full mb-2 px-2 py-1 rounded bg-slate-900 text-slate-100"
      >
        {OPERATORS.text.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        disabled={operator === "empty" || operator === "not_empty"}
        className="w-full mb-2 px-2 py-1 rounded bg-slate-900 text-slate-100 disabled:opacity-50"
      />

      <label className="flex gap-2 border-b border-slate-900 mb-1 pb-1">
        <input type="checkbox" checked={allSelected} onChange={toggleAll} />
        Select All
      </label>

      <div className="max-h-40 overflow-auto">
        {visibleValues.map((v) => (
          <label key={v} className="flex gap-2">
            <input
              type="checkbox"
              checked={selected.includes(v)}
              onChange={() =>
                setSelected((p) =>
                  p.includes(v) ? p.filter((x) => x !== v) : [...p, v]
                )
              }
            />
            {v || "(empty)"}
          </label>
        ))}
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={onClose}
          className="bg-gray-700 px-2 rounded text-slate-300 pb-0.5"
        >
          Cancel
        </button>
        <button
          className="bg-blue-600 px-2 rounded text-slate-300 pb-0.5"
          onClick={apply}
        >
          Apply
        </button>
      </div>
    </div>,
    document.getElementById("portal-root")
  );
}
