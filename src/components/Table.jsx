import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { brandsWithColor } from "../data/brandsWIthColors";
import TableHeadCell from "../components/TableHeadCell";
import TableFilterDropdown from "../components/TableFilterDropdown";
import { useState, useEffect } from "react";
import { SORT_STATES } from "../constanst/sortStates";

export default function Table({
  columns,
  data,
  onRowClick,

  // 🔽 NEW (optional)
  selectable = false,
  selectedIds = new Set(),
  onToggleRow,
  onToggleAll,
}) {
  const allSelected =
    selectable &&
    data.length > 0 &&
    data.every((row) => selectedIds.has(row._id));

  const [sort, setSort] = useState({});
  const [filters, setFilters] = useState({});
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterPos, setFilterPos] = useState(null);

  const handleSort = (key, state) => {
    setSort(state === SORT_STATES.NONE ? {} : { [key]: state });
  };

  let filteredData = [...data];

  Object.entries(filters).forEach(([key, filter]) => {
    filteredData = filteredData.filter((row) => {
      const value = row[key];
      if (value == null) return false;

      // text search
      if (
        filter.search &&
        !String(value).toLowerCase().includes(filter.search.toLowerCase())
      ) {
        return false;
      }

      // checkbox values
      if (filter.values?.length) {
        return filter.values.includes(String(value));
      }

      return true;
    });
  });

  const sortedData = [...filteredData];

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
    const close = () => setActiveFilter(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div className="overflow-auto bg-pink-400 rounded shadow-md ">
      <div className="w-[1px] max-h-[90vh]">
        <table className="min-w-full text-sm table-fixed relative text-gray-300">
          <thead className="bg-slate-500 sticky top-0 z-10">
            <tr>
              {selectable && (
                <th className="px-4 py-3 border-b text-center w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleAll}
                  />
                </th>
              )}

              {columns.map((col) => (
                <TableHeadCell
                  key={col.key}
                  label={col.label}
                  sortable={col.sortable}
                  filterable={col.filterable}
                  sortState={sort[col.key] || SORT_STATES.NONE}
                  onSort={(state) => handleSort(col.key, state)}
                  onFilter={(pos) => {
                    setActiveFilter(col.key);
                    setFilterPos(pos);
                  }}
                  filterActive={!!filters[col.key]}
                />
              ))}

              <th className="px-4 py-3 border-b font-semibold uppercase text-xs text-center">
                Actions
              </th>
            </tr>
          </thead>
          {activeFilter && filterPos && (
            <TableFilterDropdown
              columnKey={activeFilter}
              data={data}
              value={filters[activeFilter]}
              position={filterPos}
              onChange={(filter) =>
                setFilters((prev) => ({ ...prev, [activeFilter]: filter }))
              }
              onClose={() => setActiveFilter(null)}
            />
          )}

          <tbody className="divide-y bg-gray-800">
            {sortedData.map((row) => (
              <tr key={row._id} className="hover:bg-gray-600 transition">
                {/* ✅ CHECKBOX CELL */}
                {selectable && (
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row._id)}
                      onChange={() => onToggleRow(row._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}

                {columns.map((col) => {
                  return col.key === "brands" ? (
                    <td key={col.key} className="px-4  table-cell  wrap">
                      <div
                        className={`${
                          row.brands.length > 4 ? "min-w-[310px]" : "flex"
                        }`}
                      >
                        {row.brands.map((el) => {
                          return (
                            <span
                              key={el}
                              className={`inline-flex items-center text-xs rounded
                              whitespace-nowrap  text-nowrap mx-1 px-2 py-0.5 ${brandsWithColor[el]?.bg} ${brandsWithColor[el]?.text} `}
                            >
                              {el}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  ) : (
                    <td key={col.key} className="px-4 py-3">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  );
                })}

                {/* ACTION BUTTONS */}
                <td className="px-4 py-3 flex justify-center gap-3 text-lg">
                  <button
                    className="text-slate-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => onRowClick(row)}
                    title="View"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>

                  <button
                    className="text-slate-600 hover:text-blue-800 cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/users/${row._id}/edit`)
                    }
                    title="Edit"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1 + (selectable ? 1 : 0)}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
