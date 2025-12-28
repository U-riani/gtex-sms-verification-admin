import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { SORT_STATES } from "../constanst/sortStates";

export default function TableHeadCell({
  columnKey,
  label,
  sortable = false,
  filterable = false,
  sortState = SORT_STATES.NONE,
  onSort,
  onFilter,
  filterActive = false,
}) {
  const thRef = useRef(null);

  const handleSort = () => {
    if (!sortable) return;

    const next =
      sortState === SORT_STATES.NONE
        ? SORT_STATES.ASC
        : sortState === SORT_STATES.ASC
        ? SORT_STATES.DESC
        : SORT_STATES.NONE;

    onSort?.(next);
  };

  return (
    <th
      ref={thRef}
      data-col={columnKey}
      onClick={handleSort}
      className={`px-4 py-3 border-b uppercase text-xs tracking-wide text-nowrap select-none ${
        sortable ? "cursor-pointer hover:bg-slate-600/40" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-200">{label}</span>

        {sortable && (
          <span className="text-gray-400">
            {sortState === SORT_STATES.NONE && (
              <FontAwesomeIcon icon={faSort} />
            )}
            {sortState === SORT_STATES.ASC && (
              <FontAwesomeIcon icon={faSortUp} />
            )}
            {sortState === SORT_STATES.DESC && (
              <FontAwesomeIcon icon={faSortDown} />
            )}
          </span>
        )}

        {filterable && (
          <button
            data-filter-btn
            onClick={(e) => {
              e.stopPropagation();
              onFilter?.();
            }}
          >
            <FontAwesomeIcon icon={faFilter} />
          </button>
        )}
      </div>
    </th>
  );
}
