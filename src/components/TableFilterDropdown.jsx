// src/components/TableFilterDropdown.jsx
import { useMemo, useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { OPERATORS } from "../constanst/operators";
import ConditionRow from "./ConditionRow";
import { FILTER_DEFINITION } from "../constanst/filterDefinition";

const boolLabel = (v) => (v === true ? "YES" : v === false ? "NO" : "(empty)");

export default function TableFilterDropdown({
  anchorKey,
  containerRef,
  columnKey,
  columnType,
  data,
  value,
  onPreviewChange,
  onChange,
  onClose,
  universeData,
}) {
  /* ---------------------------
   * UI STATE
   * --------------------------- */
  const didInitRef = useRef(false);
  const autoSelectRef = useRef(true);
  const advancedAutoSelectRef = useRef(false);
  const advancedDirtyRef = useRef(false);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);

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
    value?.advanced?.conditions?.[0]?.operator ??
    (columnType === "enum"
      ? "in"
      : columnType === "boolean"
        ? "equals"
        : columnType === "date"
          ? "on"
          : "contains");

  /* ---------------------------
   * CONDITIONS (single source)
   * --------------------------- */
  const [conditions, setConditions] = useState(() => {
    if (value?.advanced?.conditions?.length) {
      return structuredClone(value.advanced.conditions);
    }

    return [
      {
        operator: defaultOperator,
        values: [],
        logic: "AND",
      },
    ];
  });

  /* ---------------------------
   * VALUES
   * --------------------------- */
  // 1) universe values: for "isFullSelection" neutrality + value mapping
  const universeUniqueValues = useMemo(() => {
    const vals = universeData.flatMap((r) => {
      const v = r[columnKey];
      if (v == null) return [];
      if (columnType === "boolean") return [Boolean(v)];
      if (Array.isArray(v)) return v.map(String);
      return [String(v)];
    });
    return [...new Set(vals)];
  }, [universeData, columnKey, columnType]);

  // 2) context values: based on CURRENTLY VISIBLE ROWS for this dropdown
  // IMPORTANT: `data` already excludes other column filters? It does exclude other column filters by your getFilteredDataForColumn
  // If you want it to also respect global search + advanced modal, you must pass that filtered set instead (see next section).
  const contextUniqueValues = useMemo(() => {
    const vals = data.flatMap((r) => {
      const v = r[columnKey];
      if (v == null) return [];
      if (columnType === "boolean") return [Boolean(v)];
      if (Array.isArray(v)) return v.map(String);
      return [String(v)];
    });
    return [...new Set(vals)];
  }, [data, columnKey, columnType]);

  // 3) visible list should be based on CONTEXT
  const visibleValues = useMemo(() => {
    const src = contextUniqueValues;
    if (!search || columnType === "boolean") return src;
    const q = search.toLowerCase();
    return src.filter((v) => String(v).toLowerCase().includes(q));
  }, [contextUniqueValues, search, columnType]);

  /* ---------------------------
   * SYNC FROM FILTER VALUE
   * --------------------------- */
  useEffect(() => {
    if (didInitRef.current) return;

    if (value?.quick?.values?.length) {
      const raw = value.quick.values;

      if (columnType === "boolean") {
        setSelected(raw.filter((v) => v === true || v === false));
      } else {
        const map = new Map(
          universeUniqueValues.map((v) => [String(v).toLowerCase(), v]),
        );

        setSelected(
          raw.map((v) => map.get(String(v).toLowerCase())).filter(Boolean),
        );
      }
    } else {
      setSelected(universeUniqueValues);
    }

    didInitRef.current = true;
  }, [value, universeUniqueValues, columnType]);

  useEffect(() => {
    setSelected((prev) => prev.filter((v) => contextUniqueValues.includes(v)));
  }, [contextUniqueValues]);

  useEffect(() => {
    if (value?.advanced?.conditions?.length) {
      setConditions(structuredClone(value.advanced.conditions));
    }
  }, [value]);

  console.log(visibleValues);
  /* ---------------------------
   * SIMPLE UI → CONDITION[0]
   * --------------------------- */

  /* ---------------------------
   * HELPERS
   * --------------------------- */
  const allSelected =
    visibleValues.length && visibleValues.every((v) => selected.includes(v));

  const toggleAll = () => {
    autoSelectRef.current = false;

    setSelected((p) =>
      allSelected
        ? p.filter((v) => !visibleValues.includes(v))
        : [...new Set([...p, ...visibleValues])],
    );
  };

  const handleClose = () => {
    didInitRef.current = false;
    advancedAutoSelectRef.current = false;
    advancedDirtyRef.current = false;

    onClose?.();
  };

  const normalizeValues = (vals) => {
    switch (columnType) {
      case "boolean":
        return vals.map(Boolean);

      case "date":
        return vals.map((v) => new Date(v).getTime());

      case "number":
        return vals.map(Number);

      default:
        return vals.map((v) => String(v).toLowerCase());
    }
  };

  const previewFilter = useMemo(() => {
    const validConditions = conditions.filter(
      (c) => c.values?.length || c.operator.includes("empty"),
    );

    if (!validConditions.length) return null;

    return {
      type: columnType,
      advanced: {
        conditions: validConditions.map((c, idx) => ({
          operator: c.operator,
          values: c.values ?? [],
          logic: idx === 0 ? undefined : (c.logic ?? "AND"),
        })),
      },
    };
  }, [conditions, columnType]);

  /* ---------------------------
   * APPLY
   * --------------------------- */
  const apply = () => {
    // 🧠 BOOLEAN: QUICK ONLY, MODE-BASED
    if (columnType === "boolean") {
      let mode = null;

      if (selected.includes(true) && selected.includes(false)) {
        mode = "not_empty"; // YES + NO
      } else if (selected.includes(true)) {
        mode = "yes";
      } else if (selected.includes(false)) {
        mode = "no";
      } else {
        mode = "empty";
      }

      onChange({
        type: "boolean",
        quick: { mode },
      });

      onClose?.();
      return;
    }

    /* ---------- existing non-boolean logic untouched ---------- */

    let quick = undefined;
    let advanced = undefined;
    console.log("selected in apply: ", selected);

    if (selected.length === 0) {
      quick = {
        operator: "equals",
        values: ["__NO_MATCH__"],
      };
    }

    // 2️⃣ Partial selection → normal quick filter
    else if (selected.length !== universeUniqueValues.length) {
      quick = {
        operator: "equals",
        values: normalizeValues(selected),
      };
    }

    // 2️⃣ Apply advanced filter if valid
    const validConditions = conditions.filter(
      (c) => c.values?.length || c.operator.includes("empty"),
    );

    if (validConditions.length) {
      advanced = {
        conditions: validConditions.map((c, idx) => ({
          operator: c.operator,
          values: normalizeValues(c.values ?? []),
          logic: idx === 0 ? undefined : (c.logic ?? "AND"),
        })),
      };
    }

    // 3️⃣ Build payload
    const payload =
      quick || advanced ? { type: columnType, quick, advanced } : null;

    onChange(payload);
    didInitRef.current = false;
    advancedAutoSelectRef.current = false;
    autoSelectRef.current = false;
    advancedDirtyRef.current = false;
    onClose?.();
  };

  useEffect(() => {
    if (!advancedOpen) return;
    if (!advancedDirtyRef.current) return;

    setSelected(contextUniqueValues);
    autoSelectRef.current = true;
    advancedAutoSelectRef.current = true;
  }, [conditions, contextUniqueValues, advancedOpen]);

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

  useEffect(() => {
    if (!advancedOpen) {
      onPreviewChange?.(null);
      return;
    }

    onPreviewChange?.(previewFilter);
  }, [previewFilter, advancedOpen]);

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

  useEffect(() => {
    if (value?.advanced?.conditions?.length) {
      setAdvancedOpen(true);
    }
  }, [value]);

  useEffect(() => {
    // If selection came from advanced auto-select, allow context sync
    if (advancedAutoSelectRef.current) return;

    // If quick filter exists, it is the source of truth
    if (value?.quick?.values?.length) return;

    if (autoSelectRef.current) return;

    setSelected((prev) => prev.filter((v) => contextUniqueValues.includes(v)));
  }, [contextUniqueValues, value]);

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
      <div className="flex justify-between mb-2">
        <p className="text-slate-200/50">TEXT FILTER</p>
        {/* <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="flex-1 bg-slate-900 text-white px-2 py-1 rounded"
        >
          {operators.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select> */}

        {columnType !== "boolean" && (
          <button
            onClick={() => setAdvancedOpen((v) => !v)}
            className="px-2 text-white/70 bg-slate-700 rounded hover:bg-slate-600 cursor-pointer"
            title="Advanced"
          >
            ➤
          </button>
        )}
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search…"
        disabled={columnType === "boolean"}
        className="w-full mb-2 px-2 py-1 bg-slate-900 text-white rounded"
      />

      <label className="flex gap-2 border-b pb-1 mb-1 text-slate-200/50">
        <input type="checkbox" checked={allSelected} onChange={toggleAll} />
        Select all
      </label>

      <div className="h-40 overflow-auto">
        {visibleValues.map((v, i) => (
          <label key={i} className="flex gap-2 text-slate-200/50">
            <input
              type="checkbox"
              checked={selected.includes(v)}
              onChange={() =>
                setSelected((p) => {
                  autoSelectRef.current = false;
                  return p.includes(v) ? p.filter((x) => x !== v) : [...p, v];
                })
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
            {/* CONDITIONS */}
            {conditions.map((cond, idx) => (
              <div
                key={idx}
                className="w-full flex flex-col justify-center items-center gap-2"
              >
                <ConditionRow
                  key={idx}
                  operators={operators}
                  value={{ ...cond, type: columnType }} // 👈 FIX NAME
                  onChange={(v) => {
                    advancedDirtyRef.current = true; // 👈 THIS is the trigger
                    setConditions((c) => c.map((x, i) => (i === idx ? v : x)));
                  }}
                  onRemove={() => {
                    advancedDirtyRef.current = true;
                    setConditions((c) => c.filter((_, i) => i !== idx));
                  }}
                />
                {idx < conditions.length - 1 && (
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
                                i === idx + 1 ? { ...x, logic: op } : x,
                              ),
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
              onClick={() => {
                advancedDirtyRef.current = true;
                setConditions((c) => [
                  ...c,
                  { operator: defaultOperator, values: [], logic: "AND" },
                ]);
              }}
              className="w-full text-slate-100/60 text-xs bg-slate-700 hover:bg-slate-600 rounded py-1"
            >
              + Add condition
            </button>
            {/* LOGIC BETWEEN CONDITIONS */}
          </div>,
          document.body,
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
        <button onClick={handleClose} className="px-2 bg-gray-700 rounded">
          Cancel
        </button>
        <button onClick={apply} className="px-2 bg-blue-600 rounded">
          Apply
        </button>
      </div>
    </div>,
    document.body,
  );
}
