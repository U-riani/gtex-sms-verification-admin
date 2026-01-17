// src/components/DataTableView.jsx
import SearchBar from "./SearchBar";
import Table from "./Table";
import Pagination from "./Pagination";
import AdvancedFilterModal from "./AdvancedFilterModal";
import ActiveFilters from "./ActiveFilters";

export default function DataTableView({
  /* feature flags */
  enableSearch = false,
  enableAdvancedFilter = false,
  enableColumnFilters = false,
  enablePagination = false,

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
  columnFilters,
  onRemoveColumnFilter,
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
          columnFilters={columnFilters}
          onRemoveColumnFilter={onRemoveColumnFilter}
          onEditColumnFilter={onEditColumnFilter}
        />
      )}
      {/* SELECTION BAR */}
      {selectionBar}

      {/* TABLE */}
      <Table {...tableProps} />

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
