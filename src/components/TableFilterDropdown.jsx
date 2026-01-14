import { useMemo, useState, useEffect, useLayoutEffect } from "react";
import { OPERATORS } from "../constanst/operators";
import { createPortal } from "react-dom";

const boolLabel = (v) => (v === true ? "YES" : v === false ? "NO" : "(empty)");

export default function TableFilterDropdown({
  anchorKey,
  containerRef,
  columnKey,
  columnType,
  data,
  value,
  onChange,
  onClose,
}) {
  const isDate = columnType === "date";
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [operator, setOperator] = useState(() => {
    if (value?.operator) return value.operator;
    if (columnType === "enum") return "in";
    if (columnType === "boolean") return "equals";
    return "contains";
  });

  const operators =
    columnType === "enum"
      ? OPERATORS.enum
      : columnType === "boolean"
      ? OPERATORS.boolean
      : columnType === "date"
      ? OPERATORS.date
      : OPERATORS.text;

  const [touched, setTouched] = useState(false);
  const [style, setStyle] = useState({});

  // Build uniqueValues with correct types
  const uniqueValues = useMemo(() => {
    const values = data.flatMap((r) => {
      const v = r[columnKey];
      if (v == null) return [];

      if (columnType === "boolean") return [Boolean(v)]; // keep boolean

      if (Array.isArray(v)) return v.map(String);
      return [String(v)];
    });

    // unique
    return [...new Set(values)];
  }, [data, columnKey, columnType]);

  // Visible values with safe search handling
  const visibleValues = useMemo(() => {
    if (!search) return uniqueValues;

    // for boolean: searching makes no sense, just ignore search
    if (columnType === "boolean") return uniqueValues;

    const q = search.toLowerCase();
    return uniqueValues.filter((v) => String(v).toLowerCase().includes(q));
  }, [uniqueValues, search, columnType]);

  // Restore selected values from current filter
  useEffect(() => {
    if (!value?.values) {
      setSelected(uniqueValues);
      return;
    }

    if (columnType === "boolean") {
      // values must be booleans in filter state
      setSelected(value.values.map((x) => Boolean(x)));
      return;
    }

    // Map normalized string values back to raw UI values
    const map = new Map(uniqueValues.map((v) => [String(v).toLowerCase(), v]));
    setSelected(
      (value.values ?? [])
        .map((v) => map.get(String(v).toLowerCase()))
        .filter((v) => v != null)
    );
  }, [value, uniqueValues, columnType]);

  // Keep operator synced
  useEffect(() => {
    if (value?.operator) setOperator(value.operator);
  }, [value]);

  // Select all logic
  const allSelected =
    visibleValues.length > 0 &&
    visibleValues.every((v) => selected.some((s) => s === v));

  const toggleAll = () => {
    setSelected((prev) =>
      allSelected
        ? prev.filter((v) => !visibleValues.includes(v))
        : [...new Set([...prev, ...visibleValues])]
    );
  };

  const apply = () => {
    if (columnType === "date") {
      const values =
        operator === "between"
          ? [
              dateFrom ? new Date(dateFrom).getTime() : null,
              dateTo ? new Date(dateTo).getTime() : null,
            ].filter(Boolean)
          : dateFrom
          ? [new Date(dateFrom).getTime()]
          : [];

      onChange({
        type: "date",
        operator,
        values,
      });

      onClose?.();
      return;
    }

    // existing logic for others
  };

  // Positioning
  useLayoutEffect(() => {
    const updatePosition = () => {
      const th = document.querySelector(`th[data-col="${anchorKey}"]`);
      if (!th) return;

      const thRect = th.getBoundingClientRect();
      const width = Math.max(thRect.width, 220);

      setStyle({
        position: "fixed",
        zIndex: 50,
        top: thRect.bottom + 4,
        left: Math.min(thRect.left, window.innerWidth - width - 8),
        minWidth: width,
      });
    };

    updatePosition();

    const container = containerRef.current;
    window.addEventListener("scroll", updatePosition, { passive: true });
    container?.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      container?.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [anchorKey, containerRef]);

  useEffect(() => {
    setTouched(false);
    setSearch("");
  }, [anchorKey]);

  const searchDisabled =
    columnType === "boolean" ||
    operator === "empty" ||
    operator === "not_empty";

  useEffect(() => {
    if (columnType !== "date" || !value?.values) return;

    if (value.values[0]) {
      setDateFrom(new Date(value.values[0]).toISOString().slice(0, 10));
    }
    if (value.values[1]) {
      setDateTo(new Date(value.values[1]).toISOString().slice(0, 10));
    }
  }, [value, columnType]);

  return createPortal(
    <div
      style={style}
      className="table-filter-dropdown flex flex-col justify-between w-56 h-70 bg-slate-800 border rounded p-2"
      onClick={(e) => e.stopPropagation()}
    >
      <div>
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="w-full mb-2 px-2 py-1 rounded bg-slate-900 text-slate-100"
        >
          {operators.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          disabled={searchDisabled}
          className="w-full mb-2 px-2 py-1 rounded bg-slate-900 text-slate-100 disabled:opacity-50"
        />
        {columnType === "date" && (
          <div className="flex flex-col gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-1 rounded bg-slate-900 text-slate-100"
            />

            {operator === "between" && (
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2 py-1 rounded bg-slate-900 text-slate-100"
              />
            )}
          </div>
        )}

        <label className="flex gap-2 border-b border-slate-900 mb-1 pb-1">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => {
              setTouched(true);
              toggleAll();
            }}
            disabled={operator === "empty" || operator === "not_empty"}
          />
          Select All
        </label>

        <div className="max-h-40 overflow-auto">
          {visibleValues.map((v, idx) => (
            <label key={`${String(v)}-${idx}`} className="flex gap-2">
              <input
                type="checkbox"
                checked={selected.some((s) => s === v)}
                onChange={() => {
                  setTouched(true);
                  setSelected((p) =>
                    p.includes(v) ? p.filter((x) => x !== v) : [...p, v]
                  );
                }}
                disabled={operator === "empty" || operator === "not_empty"}
              />
              {columnType === "boolean" ? boolLabel(v) : v || "(empty)"}
            </label>
          ))}
        </div>
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
    document.body
  );
}
