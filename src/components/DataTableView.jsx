// src/components/DataTableView.jsx
import { useEffect, useMemo, useState } from "react";
import { runColumnFilter } from "../utils/runColumnFilter";

import SearchBar from "./SearchBar";
import Table from "./Table";
import Pagination from "./Pagination";
import AdvancedFilterModal from "./AdvancedFilterModal";
import ActiveFilters from "./ActiveFilters";
import { runAdvancedFilter } from "../utils/runAdvancedFilter";

export default function DataTableView({
  /* feature flags */
  enableSearch = false,
  enableAdvancedFilter = false,
  enableColumnFilters = false,
  enablePagination = false,
  advancedFilterFields,

  /* ---------- search ---------- */
  search,
  onSearchChange,
  onSearchClear,
  onOpenAdvanced,

  /* ---------- advanced filter ---------- */
  advancedOpen,
  advancedFilter,
  onApplyAdvanced,
  onCloseAdvanced,

  presets,
  selectedPresetId,
  onSavePreset,
  onSelectPreset,
  onDeletePreset,

  /* ---------- active filters ---------- */
  onEditColumnFilter,
  onRemoveAdvancedCondition,
  onRemoveAdvancedGroup,
  onEditAdvancedFilter,
  /* ---------- table ---------- */
  tableProps,

  /* ---------- pagination ---------- */
  page,
  totalPages,
  onPageChange,

  /* ---------- selection toolbar ---------- */
  selectionBar,
}) {
  // ✅ SINGLE SOURCE OF TRUTH
  const [filters, setFilters] = useState({});

  // immutable universe
  const baseData = tableProps.data;
  console.log("--base data--", baseData);

  const searchedData = useMemo(() => {
    if (!search) return baseData;

    const q = search.toLowerCase();
    return baseData.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [baseData, search]);

  const advancedFilteredData = useMemo(() => {
    if (!advancedFilter) return searchedData;

    return searchedData.filter((row) => runAdvancedFilter(row, advancedFilter));
  }, [searchedData, advancedFilter]);

  const filteredData = useMemo(() => {
    if (!Object.keys(filters).length) return advancedFilteredData;

    return advancedFilteredData.filter((row) =>
      Object.entries(filters).every(([key, filter]) =>
        runColumnFilter(row, key, filter),
      ),
    );
  }, [advancedFilteredData, filters]);

  const handleFilterChange = (key, payload) => {
    if (!payload) {
      setFilters((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    setFilters((prev) => ({
      ...prev,
      [key]: payload,
    }));
  };

  useEffect(() => {
    console.log("[Column filters state]", filters);
  }, [filters]);

  const handleRemoveFilter = (key) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };
  useEffect(() => {
    console.log("baseData length:", baseData.length);
  }, [baseData]);

  useEffect(() => {
    console.log("filteredData length:", filteredData.length);
  }, [filteredData]);

  return (
    <div className="space-y-3">
      {/* SEARCH */}
      {enableSearch && (
        <SearchBar
          value={search}
          onChange={onSearchChange}
          onClear={onSearchClear}
          onAdvanced={onOpenAdvanced}
        />
      )}

      {/* ADVANCED MODAL */}
      {enableAdvancedFilter && advancedOpen && (
        <AdvancedFilterModal
          initialFilter={advancedFilter}
          onClose={onCloseAdvanced}
          onApply={onApplyAdvanced}
          presets={presets}
          selectedPresetId={selectedPresetId}
          onSavePreset={onSavePreset}
          onSelectPreset={onSelectPreset}
          onDeletePreset={onDeletePreset}
          fields={advancedFilterFields}
        />
      )}

      {/* ACTIVE FILTERS */}
      {enableColumnFilters && (
        <ActiveFilters
          quickSearch={search}
          onClearQuickSearch={onSearchClear}
          advancedFilter={advancedFilter}
          onRemoveAdvancedCondition={onRemoveAdvancedCondition}
          onRemoveAdvancedGroup={onRemoveAdvancedGroup}
          onEditAdvancedFilter={onEditAdvancedFilter} // 👈 ADD THIS
          columnFilters={filters}
          onRemoveColumnFilter={handleRemoveFilter}
          onEditColumnFilter={onEditColumnFilter}
        />
      )}
      {/* SELECTION BAR */}
      {selectionBar}

      {/* TABLE */}
      <Table
        {...tableProps}
        data={filteredData}
        baseData={baseData}
        filterContextData={advancedFilteredData}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* PAGINATION */}
      {enablePagination && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={onPageChange}
        />
      )}
    </div>
  );
}
