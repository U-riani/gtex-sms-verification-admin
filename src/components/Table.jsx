import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

import { brandsWithColor } from "../data/brandsWIthColors";
import TableHeadCell from "../components/TableHeadCell";
import TableFilterDropdown from "../components/TableFilterDropdown";
import { SORT_STATES } from "../constanst/sortStates";

const normalizeToArray = (value) => {
  if (Array.isArray(value)) return value.map(String);
  if (value == null) return [];
  return [String(value)];
};

export default function Table({
  columns,
  data,
  onRowClick,
  selectable = false,
  selectedIds = new Set(),
  onToggleRow,
  onToggleAll,
  onSetSelectedIds,
  filters,
  onFilterChange,
  openFilterRequest,
  onFilterOpened,
}) {
  const [sort, setSort] = useState({});
  const [activeFilter, setActiveFilter] = useState(null);

  const tableScrollRef = useRef(null);

  const handleSort = (key, state) => {
    setSort(state === SORT_STATES.NONE ? {} : { [key]: state });
  };

  const getFilteredDataForColumn = (columnKey) => {
    let result = [...data];
    console.log("++++", result);
    Object.entries(filters).forEach(([key, filter]) => {
      if (key === columnKey) return;

      result = result.filter((row) => {
        const values = normalizeToArray(row[key]);
        if (!values.length) return false;

        if (filter.type === "text") {
          const search = (filter.value || "").trim().toLowerCase();
          if (!search) return true;

          return values.some((v) => v.includes(search));
        }

        if (filter.type === "enum") {
          return (
            filter.values.length === 0 ||
            values.some((v) => filter.values.includes(v))
          );
        }

        return true;
      });
    });

    return result;
  };

  let filteredData = [...data];

  Object.entries(filters).forEach(([key, filter]) => {
    filteredData = filteredData.filter((row) => {
      const rawValues = normalizeToArray(row[key]);

      // No value in this column at all → usually exclude
      if (rawValues.length === 0) {
        // but "is empty" should pass, "is not empty" should fail
        if (filter.type === "text") {
          if (filter.operator === "empty") return true;
          if (filter.operator === "not_empty") return false;
        }
        return false;
      }

      const values = rawValues.map((v) =>
        String(v ?? "")
          .trim()
          .toLowerCase()
      );

      if (filter.type === "text") {
        const search = (filter.value || "").trim().toLowerCase();

        // Use the saved operator (or fallback to contains)
        const operator = filter.operator || "contains";

        if (operator === "empty") {
          return values.length === 0 || values.every((v) => v === "");
        }
        if (operator === "not_empty") {
          return values.some((v) => v !== "");
        }

        if (!search) return true;

        switch (operator) {
          case "contains":
            return values.some((v) => v.includes(search));
          case "not_contains":
            return values.every((v) => !v.includes(search));
          case "eq":
          case "equals":
            return values.some((v) => v === search);
          case "neq":
          case "not_equals":
            return values.every((v) => v !== search);
          case "starts_with":
            return values.some((v) => v.startsWith(search));
          case "ends_with":
            return values.some((v) => v.endsWith(search));
          default:
            return true; // unknown operator → show
        }
      }

      // // Enum / multi-select filter
      // if (filter.type === "enum") {
      //   if (!filter.values?.length) return true;

      //   const operator = filter.operator || "contains";

      //   if (operator === "not_contains") {
      //     // row must NOT contain any selected value
      //     return values.every((v) => !filter.values.includes(v));
      //   }

      //   // default = contains
      //   return values.some((v) => filter.values.includes(v));
      // }

      // Enum / multi-select filter
      if (filter.type === "enum") {
        if (!filter.values?.length) return true;

        const operator = filter.operator || "contains";

        // 🔑 normalize selected values ONCE
        const normalizedSelected = filter.values.map((v) =>
          String(v).trim().toLowerCase()
        );

        if (operator === "not_contains") {
          return values.every((v) => !normalizedSelected.includes(v));
        }

        // default = contains
        return values.some((v) => normalizedSelected.includes(v));
      }

      return true;
    });
  });

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
      if (e.target.closest(".table-filter-dropdown")) return;
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

  return (
    <div
      ref={tableScrollRef}
      className="relative overflow-auto max-h-[90vh] bg-slate-400 rounded shadow-md"
    >
      <div className="relative min-w-full">
        <div className="bg-slate-500 -mt-0.5 sticky h-0.5 -top-0.5 left-0 z-20 min-w-max">
          {activeFilter && (
            <TableFilterDropdown
              anchorKey={activeFilter}
              containerRef={tableScrollRef}
              columnKey={activeFilter}
              columnType={filters[activeFilter]?.type ?? "text"} // ✅ ADD THIS
              data={getFilteredDataForColumn(activeFilter)}
              value={
                filters[activeFilter]?.type === "enum"
                  ? {
                      values: filters[activeFilter].values,
                      operator: filters[activeFilter].operator, // ✅ KEEP operator
                    }
                  : {
                      search: filters[activeFilter]?.value,
                      operator: filters[activeFilter]?.operator,
                    }
              }
              onChange={(payload) => {
                onFilterChange?.(activeFilter, payload);
                setActiveFilter(null);
              }}
              onClose={() => setActiveFilter(null)}
            />
          )}
        </div>

        <table className="min-w-full text-sm table-fixed text-gray-300">
          <thead className="bg-slate-500 sticky top-0 z-10">
            <tr className="relative">
              {selectable && (
                <th className="sticky top-0 left-0 bg-slate-500 px-4 py-3 border-b text-center w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => {
                      onSetSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (allSelected) {
                          visibleRowIds.forEach((id) => next.delete(id));
                        } else {
                          visibleRowIds.forEach((id) => next.add(id));
                        }
                        return next;
                      });
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
              <tr key={row._id} className="group hover:bg-gray-600">
                {selectable && (
                  <td className="sticky top-0 left-0 bg-gray-800/90 px-4 py-3 text-center group-hover:bg-gray-600/90">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row._id)}
                      onChange={() => onToggleRow(row._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}

                {columns.map((col) =>
                  col.key === "brands" ? (
                    <td key={col.key} className="px-4">
                      <div
                        className={
                          row.brands.length > 4 ? "min-w-[310px]" : "flex"
                        }
                      >
                        {row.brands.map((el) => (
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

                <td className="px-4 py-3 flex justify-center gap-3 text-lg">
                  <button onClick={() => onRowClick(row)}>
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    onClick={() =>
                      (window.location.href = `/users/${row._id}/edit`)
                    }
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
