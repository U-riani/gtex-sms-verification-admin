// src/components/Table.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { brandsWithColor } from "../data/brandsWIthColors";
import TableHeadCell from "../components/TableHeadCell";
import TableFilterDropdown from "../components/TableFilterDropdown";
import { SORT_STATES } from "../constanst/sortStates";
import normalizeCellValue from "../utils/normalizeCellValue";

const normalizeEnum = (value) => {
  if (Array.isArray(value)) return value.map(String);
  if (value == null) return [];
  return [String(value)];
};

const runFilter = (row, key, filter) => {
  console.log("[runFilter]", {
    column: key,
    rowValue: row[key],
    normalized: normalizeCellValue(row[key], filter.type),
    filter,
  });
  const cell = normalizeCellValue(row[key], filter.type);

  // BASE
  const baseFn = FILTER_OPERATORS[filter.type]?.[filter.base?.operator];
  const baseResult =
    filter.base?.values?.length && baseFn
      ? baseFn(cell, filter.base.values)
      : true;

  if (!filter.conditions?.length) {
    return baseResult;
  }

  // ADVANCED (combined separately)
  let advancedResult = null;

  for (let i = 0; i < filter.conditions.length; i++) {
    const cond = filter.conditions[i];
    const fn = FILTER_OPERATORS[filter.type]?.[cond.operator];
    if (!fn) continue;

    const condResult = fn(cell, cond.values);

    if (advancedResult === null) {
      advancedResult = condResult;
    } else {
      const joinLogic = cond.logic ?? "AND"; // 👈 logic belongs to THIS condition
      advancedResult =
        joinLogic === "OR"
          ? advancedResult || condResult
          : advancedResult && condResult;
    }
  }

  // if there were no valid conditions
  if (advancedResult === null) {
    advancedResult = true;
  }

  const finalResult =
    filter.baseLogic === "OR"
      ? baseResult || advancedResult
      : baseResult && advancedResult;

  console.log("[runFilter result]", {
    column: key,
    baseResult,
    advancedResult,
    finalResult,
  });
  // COMBINE BASE + ADVANCED
  return filter.baseLogic === "OR"
    ? baseResult || advancedResult
    : baseResult && advancedResult;
};

const FILTER_OPERATORS = {
  text: {
    contains: (cell, selected) =>
      selected.some((s) => cell.some((c) => c.includes(s))),
    not_contains: (cell, selected) =>
      selected.every((s) => cell.every((c) => !c.includes(s))),
    equals: (cell, selected) => selected.some((s) => cell.includes(s)),
    not_equals: (cell, selected) => selected.every((s) => !cell.includes(s)),
    empty: (cell) => cell.length === 0 || cell.every((v) => v === ""),
    not_empty: (cell) => cell.some((v) => v !== ""),
    starts_with: (cell, selected) =>
      selected.some((s) => cell.some((c) => c.startsWith(s))),

    ends_with: (cell, selected) =>
      selected.some((s) => cell.some((c) => c.endsWith(s))),
  },

  enum: {
    in: (cell, selected) => selected.some((s) => cell.includes(s)),
    not_in: (cell, selected) => selected.every((s) => !cell.includes(s)),
    empty: (cell) => cell.length === 0,
    not_empty: (cell) => cell.length > 0,
  },

  number: {
    equals: (cell, selected) => selected.includes(cell[0]),
    gt: (cell, selected) => cell[0] > selected[0],
    lt: (cell, selected) => cell[0] < selected[0],
    between: (cell, selected) =>
      cell[0] >= selected[0] && cell[0] <= selected[1],
  },

  date: {
    on: (cell, selected) => cell[0] === selected[0],
    before: (cell, selected) => cell[0] < selected[0],
    after: (cell, selected) => cell[0] > selected[0],
    between: (cell, selected) =>
      cell[0] >= selected[0] && cell[0] <= selected[1],
  },
  boolean: {
    equals: (cell, selected) => {
      // If both true & false selected → no filtering
      if (selected.length !== 1) return true;
      return cell[0] === selected[0];
    },

    not_equals: (cell, selected) => {
      // If both selected → no filtering
      if (selected.length !== 1) return true;
      return cell[0] !== selected[0];
    },
  },
};

export default function Table({
  loading,
  columns,
  data,
  onRowClick,
  selectable = false,
  selectedIds = new Set(),
  onToggleRow,
  onToggleAll,
  onSetSelectedIds,
  filters = {},
  onFilterChange,
  openFilterRequest,
  onFilterOpened,
  rowActions,
  bulkActions,
}) {
  const [sort, setSort] = useState({});
  const [activeFilter, setActiveFilter] = useState(null);

  const tableScrollRef = useRef(null);

  const handleSort = (key, state) => {
    setSort(state === SORT_STATES.NONE ? {} : { [key]: state });
  };

  const getFilteredDataForColumn = (columnKey) =>
    data.filter((row) =>
      Object.entries(filters)
        .filter(([k]) => k !== columnKey)
        .every(([k, filter]) => runFilter(row, k, filter))
    );

  const filteredData = useMemo(() => {
    if (!Object.keys(filters).length) return data;

    return data.filter((row) =>
      Object.entries(filters).every(([key, filter]) =>
        runFilter(row, key, filter)
      )
    );
  }, [data, filters]);

  const sortedData = [...filteredData];
  const visibleRowIds = sortedData.map((row) => row._id);

  const allSelected =
    selectable &&
    visibleRowIds.length > 0 &&
    visibleRowIds.every((id) => selectedIds.has(id));

  const [sortKey] = Object.keys(sort);
  const sortDir = sort[sortKey];

  if (sortKey && sortDir) {
    sortedData.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
  }

  useEffect(() => {
    const close = (e) => {
      if (e.target.closest("[data-filter-panel]")) return;
      if (e.target.closest("[data-filter-btn]")) return;

      setActiveFilter(null);
    };

    window.addEventListener("click", close, true);
    return () => window.removeEventListener("click", close, true);
  }, []);

  // useEffect(() => {
  //   if (!openFilterRequest) return;

  //   const { key, position } = openFilterRequest;

  //   setActiveFilter(key);
  //   setFilterPos(position);

  //   onFilterOpened?.();
  // }, [openFilterRequest]);

  useEffect(() => {
    if (!openFilterRequest) return;

    requestAnimationFrame(() => {
      setActiveFilter(openFilterRequest.key);
    });

    requestAnimationFrame(() => {
      const th = document.querySelector(
        `th[data-col="${openFilterRequest.key}"]`
      );
      const container = tableScrollRef.current;
      if (!th || !container) return;

      // container.scrollIntoView({ behavior: "smooth", block: "nearest" });

      const thRect = th.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      container.scrollTo({
        left: thRect.left - containerRect.left + container.scrollLeft - 40,
        behavior: "smooth",
      });
    });

    onFilterOpened?.();
  }, [openFilterRequest]);

  const columnTypeMap = useMemo(
    () => Object.fromEntries(columns.map((c) => [c.key, c.type || "text"])),
    [columns]
  );

  return (
    <div
      ref={tableScrollRef}
      className="relative overflow-auto max-h-[80vh] min-h-[350px] bg-slate-800 rounded shadow-md"
    >
      {loading && (
        <div className="absolute inset-0 z-30 bg-slate-800/60 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="relative min-w-full">
        <div className="bg-slate-500 -mt-0.5 sticky h-0.5 -top-0.5 left-0 z-20 ">
          {activeFilter && (
            <TableFilterDropdown
              anchorKey={activeFilter}
              containerRef={tableScrollRef}
              columnKey={activeFilter}
              columnType={columnTypeMap[activeFilter] ?? "text"}
              data={getFilteredDataForColumn(activeFilter)}
              value={filters[activeFilter]}
              onChange={(payload) => {
                onFilterChange?.(activeFilter, payload);
                setActiveFilter(null);
              }}
              onClose={() => setActiveFilter(null)}
            />
          )}
        </div>
        {selectable && bulkActions && selectedIds.size > 0 && (
          <div className="sticky top-0 z-30 bg-slate-800 border-b border-slate-700 px-4 py-2 flex justify-between items-center">
            <span className="text-sm text-gray-300">
              {selectedIds.size} selected
            </span>

            <div className="flex gap-2">
              {bulkActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => action.onClick(selectedIds)}
                  className={action.className}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <table className="min-w-full text-sm table-fixed text-gray-300">
          <thead className="bg-slate-500 sticky top-0 z-10">
            <tr className="relative">
              {selectable && (
                <th className="sticky top-0 left-0 bg-slate-500 px-4 py-3 border-b text-center w-10">
                  <input
                    type="checkbox"
                    disabled={loading}
                    checked={allSelected}
                    onChange={() => {
                      if (loading) return;

                      const next = new Set(selectedIds);

                      if (allSelected) {
                        visibleRowIds.forEach((id) => next.delete(id));
                      } else {
                        visibleRowIds.forEach((id) => next.add(id));
                      }

                      onSetSelectedIds(next);
                    }}
                  />
                </th>
              )}

              {columns.map((col) => (
                <TableHeadCell
                  key={col.key}
                  columnKey={col.key}
                  label={col.label}
                  sortable={col.sortable}
                  filterable={col.filterable}
                  sortState={sort[col.key] || SORT_STATES.NONE}
                  onSort={(state) => handleSort(col.key, state)}
                  onFilter={() => {
                    setActiveFilter((prev) =>
                      prev === col.key ? null : col.key
                    );
                  }}
                  filterActive={!!filters[col.key]}
                />
              ))}

              <th className="px-4 py-3 border-b text-xs text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y bg-gray-800">
            {sortedData.map((row) => (
              <tr key={row._id} className="group hover:bg-gray-600 row-fade">
                {selectable && (
                  <td className="sticky top-0 left-0 bg-gray-800/90 px-4 py-3 text-center group-hover:bg-gray-600/90">
                    <input
                      type="checkbox"
                      disabled={loading}
                      checked={selectedIds.has(row._id)}
                      onChange={() => {
                        if (!loading) onToggleRow(row._id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}

                {columns.map((col) =>
                  col.key === "brands" ? (
                    <td key={col.key} className="px-4">
                      <div
                        className={
                          row.brands?.length > 4 ? "min-w-[310px]" : "flex"
                        }
                      >
                        {row.brands?.map((el) => (
                          <span
                            key={el}
                            className={`inline-flex items-center text-xs rounded mx-1 px-2 py-0.5 ${brandsWithColor[el]?.bg} ${brandsWithColor[el]?.text}`}
                          >
                            {el}
                          </span>
                        ))}
                      </div>
                    </td>
                  ) : (
                    <td key={col.key} className="px-4 py-3">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  )
                )}

                <td className="px-4 py-3 flex justify-center gap-3 text-sm">
                  {rowActions ? (
                    rowActions(row)
                  ) : (
                    <>
                      <button onClick={() => onRowClick(row)}>
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        onClick={() =>
                          (window.location.href = `/clients/${row._id}/edit`)
                        }
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
