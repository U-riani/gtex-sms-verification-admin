// src/pages/SmsHistory.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import DataTableView from "../components/DataTableView";
import {
  getSmsHistory,
  retryFailedSms,
  exportSmsHistoryCsv,
} from "../api/adminSmsHistoryService";

import { smsHistoryColumns } from "../config/smsHistoryColumns";
import { useSmsHistoryStore } from "../store/smsHistoryStore";

export default function SmsHistory() {
  const [params] = useSearchParams();
  const campaignId = params.get("campaignId");

  /* ---------------------------
   * STORE (single source of truth)
   * --------------------------- */
  const {
    selectedIds,
    toggleSelected,
    clearSelected,

    search,
    setSearch,

    columnFilters,
    setColumnFilter,
    removeColumnFilter,

    page,
    setPage,
    totalPages,
    setTotalPages,
  } = useSmsHistoryStore();

  /* ---------------------------
   * DATA
   * --------------------------- */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------
   * LOAD DATA
   * --------------------------- */
  const load = async () => {
    setLoading(true);

    const res = await getSmsHistory({
      campaignId,
      page,
      limit: 20,
      ...columnFilters,
    });

    setItems(res.items || []);
    setTotalPages(res.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [campaignId, page]);

  /* ---------------------------
   * RETRY FAILED
   * --------------------------- */
  const retry = async () => {
    if (!selectedIds.size) return;

    await retryFailedSms([...selectedIds]);
    clearSelected();
    load();
  };

  /* ---------------------------
   * COLUMNS
   * --------------------------- */
  const columns = useMemo(
    () =>
      smsHistoryColumns({
        highlight: search,
        selectedIds,
        onToggle: toggleSelected,
      }),
    [search, selectedIds]
  );

  /* ---------------------------
   * RENDER
   * --------------------------- */
  return (
    <div className="max-w-7xl mx-auto px-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">SMS History</h1>

        <div className="flex gap-2">
          <button
            onClick={() => exportSmsHistoryCsv({ campaignId })}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Export Excel
          </button>

          <button
            disabled={!selectedIds.size}
            onClick={retry}
            className="bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-40"
          >
            Retry failed ({selectedIds.size})
          </button>
        </div>
      </div>

      {/* TABLE */}
      <DataTableView
        /* FEATURES */
        enableSearch
        enableColumnFilters
        enablePagination

        /* SEARCH */
        search={search}
        onSearchChange={setSearch}
        onSearchClear={() => setSearch("")}

        /* COLUMN FILTERS */
        columnFilters={columnFilters}
        onRemoveColumnFilter={removeColumnFilter}

        /* TABLE */
        tableProps={{
          loading,
          data: items,
          columns,
          filters: columnFilters,
          onFilterChange: setColumnFilter,
        }}

        /* PAGINATION */
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
