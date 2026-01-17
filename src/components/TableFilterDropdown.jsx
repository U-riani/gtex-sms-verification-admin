// src/components/TableFilterDropdown.jsx
import { useMemo, useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { OPERATORS } from "../constanst/operators";
import ConditionRow from "./ConditionRow";

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
  /* ---------------------------
   * UI STATE
   * --------------------------- */
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [baseLogic, setBaseLogic] = useState(value?.baseLogic ?? "AND");

  const DROPDOWN_WIDTH = 260;

  const promotedRef = useRef(false);


  const [style, setStyle] = useState({});
  const opensLeft = style.left > window.innerWidth / 2;
  const advancedStyle =
    style.left != null
      ? {
          position: "fixed",
          zIndex: 51,
          top: style.top,
          left: opensLeft
            ? style.left - DROPDOWN_WIDTH
            : style.left + DROPDOWN_WIDTH,
          width: DROPDOWN_WIDTH,
        }
      : {};

  const operators =
    columnType === "enum"
      ? OPERATORS.enum
      : columnType === "boolean"
      ? OPERATORS.boolean
      : columnType === "date"
      ? OPERATORS.date
      : OPERATORS.text;

  const defaultOperator =
    value?.conditions?.[0]?.operator ??
    (columnType === "enum"
      ? "in"
      : columnType === "boolean"
      ? "equals"
      : columnType === "date"
      ? "on"
      : "contains");

  const [operator, setOperator] = useState(defaultOperator);

  /* ---------------------------
   * CONDITIONS (single source)
   * --------------------------- */
  const [conditions, setConditions] = useState(() => {
    if (value?.conditions?.length) {
      return structuredClone(value.conditions);
    }

    return [
      {
        operator: defaultOperator,
        values: [],
        logic: "AND",
      },
    ];
  });

  console.log("[TFD initial conditions]", conditions);

  /* ---------------------------
   * VALUES
   * --------------------------- */
  const uniqueValues = useMemo(() => {
    const vals = data.flatMap((r) => {
      const v = r[columnKey];
      if (v == null) return [];
      if (columnType === "boolean") return [Boolean(v)];
      if (Array.isArray(v)) return v.map(String);
      return [String(v)];
    });

    return [...new Set(vals)];
  }, [data, columnKey, columnType]);

  const visibleValues = useMemo(() => {
    if (!search || columnType === "boolean") return uniqueValues;
    const q = search.toLowerCase();
    return uniqueValues.filter((v) => String(v).toLowerCase().includes(q));
  }, [uniqueValues, search, columnType]);

  /* ---------------------------
   * SYNC FROM FILTER VALUE
   * --------------------------- */
  useEffect(() => {
    if (!value?.conditions?.[0]?.values) {
      setSelected([]);
      return;
    }

    const raw = value.conditions[0].values;

    if (columnType === "boolean") {
      setSelected(raw.map(Boolean));
      return;
    }

    const map = new Map(uniqueValues.map((v) => [String(v).toLowerCase(), v]));
    console.log("[TFD sync from value]", value);

    setSelected(
      raw.map((v) => map.get(String(v).toLowerCase())).filter(Boolean)
    );
  }, [value, uniqueValues, columnType]);

  /* ---------------------------
   * SIMPLE UI → CONDITION[0]
   * --------------------------- */

  /* ---------------------------
   * HELPERS
   * --------------------------- */
  const allSelected =
    visibleValues.length && visibleValues.every((v) => selected.includes(v));

  const toggleAll = () => {
    setSelected((p) =>
      allSelected
        ? p.filter((v) => !visibleValues.includes(v))
        : [...new Set([...p, ...visibleValues])]
    );
  };

  const normalizeValues = (vals) => {
    if (columnType === "boolean") return vals.map(Boolean);
    return vals.map((v) => String(v).toLowerCase());
  };

  /* ---------------------------
   * APPLY
   * --------------------------- */
  const apply = () => {
    const payload = {
      type: columnType,
      base: {
        operator,
        values: normalizeValues(selected),
      },
      baseLogic,
      conditions: advancedOpen
        ? conditions
            .filter((c) => c.values?.length)
            .map((c) => ({
              operator: c.operator,
              values: normalizeValues(c.values),
              logic: c.logic ?? "AND",
            }))
        : [],
    };

    console.log("[TFD APPLY PAYLOAD]", payload);

    onChange(payload);
    onClose?.();
  };

  /* ---------------------------
   * POSITIONING
   * --------------------------- */
  // const [style, setStyle] = useState({});
  // useLayoutEffect(() => {
  //   const th = document.querySelector(`th[data-col="${anchorKey}"]`);
  //   if (!th) return;

  //   const r = th.getBoundingClientRect();
  //   setStyle({
  //     position: "fixed",
  //     zIndex: 50,
  //     top: r.bottom + 4,
  //     left: Math.min(r.left, window.innerWidth - 260),
  //     minWidth: 240,
  //   });
  // }, [anchorKey]);
  /* ---------------------------
   * POSITIONING (SMART LEFT / RIGHT)
   * --------------------------- */

  useLayoutEffect(() => {
    const th = document.querySelector(`th[data-col="${anchorKey}"]`);
    if (!th) return;

    const rect = th.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // try opening to the right first
    const rightX = rect.left;
    const wouldOverflowRight = rightX + DROPDOWN_WIDTH > viewportWidth;

    const left = wouldOverflowRight
      ? Math.max(0, rect.right - DROPDOWN_WIDTH)
      : Math.min(rightX, viewportWidth - DROPDOWN_WIDTH);

    setStyle({
      position: "fixed",
      zIndex: 50,
      top: rect.bottom,
      left,
      width: DROPDOWN_WIDTH,
    });
  }, [anchorKey]);

  /* ---------------------------
   * RENDER
   * --------------------------- */
  return createPortal(
    <div
      style={style}
      data-filter-panel
      className="table-filter-dropdown bg-slate-800 border rounded p-2 w-60"
      onClick={(e) => e.stopPropagation()}
    >
      {/* SIMPLE FILTER */}
      <div className="flex gap-2 mb-2">
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="flex-1 bg-slate-900 text-white px-2 py-1 rounded"
        >
          {operators.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setAdvancedOpen((v) => !v)}
          className="px-2 bg-slate-700 rounded hover:bg-slate-600"
          title="Advanced"
        >
          {advancedOpen ? "▴" : "▾"}
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search…"
        disabled={columnType === "boolean"}
        className="w-full mb-2 px-2 py-1 bg-slate-900 text-white rounded"
      />

      <label className="flex gap-2 border-b pb-1 mb-1">
        <input type="checkbox" checked={allSelected} onChange={toggleAll} />
        Select all
      </label>

      <div className="max-h-40 overflow-auto">
        {visibleValues.map((v, i) => (
          <label key={i} className="flex gap-2">
            <input
              type="checkbox"
              checked={selected.includes(v)}
              onChange={() =>
                setSelected((p) =>
                  p.includes(v) ? p.filter((x) => x !== v) : [...p, v]
                )
              }
            />
            {columnType === "boolean" ? boolLabel(v) : v || "(empty)"}
          </label>
        ))}
      </div>
      {advancedOpen &&
        createPortal(
          <div
            style={advancedStyle}
            data-filter-panel
            className="bg-slate-800 border rounded p-3 space-y-2 max-h-90 overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* BASE LOGIC */}
            <div className="flex justify-center">
              <select
                value={baseLogic}
                onChange={(e) => setBaseLogic(e.target.value)}
                className="bg-slate-700 text-white text-xs px-2 py-1 rounded"
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
            </div>

            {/* CONDITIONS */}
            {conditions.map((cond, idx) => (
              <div
                key={idx}
                className="w-full flex flex-col justify-center items-center gap-2"
              >
                <ConditionRow
                  key={idx}
                  operators={operators}
                  value={cond}
                  onChange={(v) =>
                    setConditions((c) => c.map((x, i) => (i === idx ? v : x)))
                  }
                  onRemove={
                    idx > 0
                      ? () =>
                          setConditions((c) => c.filter((_, i) => i !== idx))
                      : undefined
                  }
                />
                {idx < conditions.length - 1 && (
                  // <select
                  //   value={logic}
                  //   onChange={(e) => setLogic(e.target.value)}
                  //   className="w-full bg-slate-900 text-white px-2 py-1 rounded"
                  // >
                  //   <option value="AND">AND</option>
                  //   <option value="OR">OR</option>
                  // </select>
                  <div className="inline-flex items-center gap-0.5 rounded-full border border-slate-600 bg-slate-800/50 px-1 py-0.5 text-xs">
                    {["AND", "OR"].map((op) => {
                      const active = conditions[idx + 1]?.logic === op;

                      return (
                        <button
                          key={op}
                          type="button"
                          onClick={() =>
                            setConditions((c) =>
                              c.map((x, i) =>
                                i === idx + 1 ? { ...x, logic: op } : x
                              )
                            )
                          }
                          className={`px-3 py-1 rounded-full transition-colors ${
                            active
                              ? "bg-slate-600 text-white"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
                          }`}
                        >
                          {op}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            {/* ADD CONDITION */}
            <button
              onClick={() =>
                setConditions((c) => [
                  ...c,
                  { operator: defaultOperator, values: [], logic: "AND" },
                ])
              }
              className="w-full text-xs bg-slate-700 hover:bg-slate-600 rounded py-1"
            >
              + Add condition
            </button>
            {/* LOGIC BETWEEN CONDITIONS */}
          </div>,
          document.body
        )}

      {/* ADVANCED */}
      {/* {advancedOpen && (
        <div
          className={`mt-3 border-t pt-2 space-y-2 ${
            opensLeft ? "origin-top-right" : "origin-top-left"
          }`}
        >
          <ConditionRow
            operators={operators}
            value={conditions[0]}
            onChange={(v) => setConditions((c) => [v, ...c.slice(1)])}
          />

          <select
            value={logic}
            onChange={(e) => setLogic(e.target.value)}
            className="w-full bg-slate-900 text-white px-2 py-1 rounded"
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>

          <ConditionRow
            operators={operators}
            value={conditions[1] ?? { operator, values: [] }}
            onChange={(v) => setConditions((c) => [c[0], v])}
          />
        </div>
      )} */}

      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onClose} className="px-2 bg-gray-700 rounded">
          Cancel
        </button>
        <button onClick={apply} className="px-2 bg-blue-600 rounded">
          Apply
        </button>
      </div>
    </div>,
    document.body
  );
}
