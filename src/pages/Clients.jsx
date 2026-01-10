// src/pages/Clients.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useClientSelectionStore } from "../store/clientSelectionStore";
import { getAdminUsers, advancedFilterUsers } from "../api/adminUserService";

import Table from "../components/Table";
import Pagination from "../components/Pagination";
import SmsModalCopy1 from "../components/SmsModalCopy1";
import AdvancedFilterModal from "../components/AdvancedFilterModal";
import ActiveFilters from "../components/ActiveFilters";
import { highlightMatch } from "../utils/highlightMatch";
import { loadPresets, savePresets } from "../utils/filterPresets";

function SearchBar({ value, onChange, onClear, onAdvanced }) {
  return (
    <div className="relative flex items-center bg-slate-700 rounded px-3 py-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search users…"
        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none pr-16"
      />

      {value && (
        <button
          onClick={onClear}
          className="absolute right-10 text-gray-300 hover:text-white"
        >
          ✕
        </button>
      )}

      <button
        onClick={onAdvanced}
        className="absolute right-3 text-gray-300 hover:text-white"
      >
        ⌄
      </button>
    </div>
  );
}

export default function Clients() {
  const navigate = useNavigate();

  // pagination
  const [page, setPage] = useState(1);

  // advanced filters
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilter, setAdvancedFilter] = useState(null);

  // presets
  const [presets, setPresets] = useState(() => loadPresets());
  const [selectedPresetId, setSelectedPresetId] = useState("");

  // frontend column filters
  const [filters, setFilters] = useState({});
  const [openColumnFilter, setOpenColumnFilter] = useState(null);

  // quick search
  const [quickSearch, setQuickSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // zustand selection
  const selectedIds = useClientSelectionStore((s) => s.selectedIds);
  const setSelectedIds = useClientSelectionStore((s) => s.setSelectedIds);
  const toggleRow = useClientSelectionStore((s) => s.toggleId);

  const [showSmsModal, setShowSmsModal] = useState(false);

  // ---------------------------
  // React Query
  // ---------------------------
  const { data, isLoading, error } = useQuery({
    queryKey: ["clients", page, advancedFilter],
    queryFn: () =>
      advancedFilter
        ? advancedFilterUsers({ filter: advancedFilter, page, limit: 20 })
        : getAdminUsers(page, 20),
    keepPreviousData: true,
    staleTime: 30_000, // 30s
  });

  const users = data?.users ?? [];
  const totalPages = data?.totalPages ?? 1;

  // ---------------------------
  // effects
  // ---------------------------
  useEffect(() => {
    savePresets(presets);
  }, [presets]);

  useEffect(() => {
    if (quickSearch.trim()) setPage(1);
  }, [quickSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(quickSearch), 120);
    return () => clearTimeout(t);
  }, [quickSearch]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, advancedFilter, debouncedSearch]);

  // ---------------------------
  // helpers
  // ---------------------------
  const clearQuickSearch = () => setQuickSearch("");
  const clearAdvancedFilter = () => setAdvancedFilter(null);

  const removeColumnFilter = (key) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const editColumnFilter = (key) => {
    const el = document.querySelector(`th[data-col="${key}"]`);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setOpenColumnFilter({
      key,
      position: { top: rect.bottom + 4, left: rect.left },
    });
  };

  const clearOpenColumnFilter = () => setOpenColumnFilter(null);

  // ---------------------------
  // data transforms
  // ---------------------------
  const searchableKeys = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "city",
    "country",
    "gender",
  ];

  const normalizedUsers = useMemo(
    () =>
      users.map((u) => ({
        ...u,
        smsPromo: u.promoChannels?.sms?.enabled ? "YES" : "NO",
        emailPromo: u.promoChannels?.email?.enabled ? "YES" : "NO",
      })),
    [users]
  );

  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return normalizedUsers;

    const q = debouncedSearch.toLowerCase();
    return normalizedUsers.filter((user) =>
      searchableKeys.some((key) =>
        String(user[key] ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [normalizedUsers, debouncedSearch]);

  const removeAdvancedCondition = (gi, ci) => {
    if (!advancedFilter) return;

    const next = structuredClone(advancedFilter);
    next.groups[gi].conditions.splice(ci, 1);

    if (next.groups[gi].conditions.length === 0) {
      next.groups.splice(gi, 1);
    }

    setAdvancedFilter(next.groups.length ? next : null);
  };

  const editAdvancedCondition = (gi, ci) => {
    setAdvancedOpen(true);

    // allow modal to mount first
    setTimeout(() => {
      const el = document.querySelector(`[data-adv-cond="${gi}-${ci}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const removeAdvancedGroup = (gi) => {
    setAdvancedFilter((prev) => {
      if (!prev) return null;

      const next = structuredClone(prev);
      next.groups.splice(gi, 1);

      return next.groups.length ? next : null;
    });
  };

  // ---------------------------
  // table columns
  // ---------------------------
  const columns = [
    {
      key: "firstName",
      label: "First name",
      sortable: true,
      filterable: true,
      render: (u) => highlightMatch(u.firstName, quickSearch),
    },
    {
      key: "lastName",
      label: "Last name",
      sortable: true,
      filterable: true,
      render: (u) => highlightMatch(u.lastName, quickSearch),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      filterable: true,
      render: (u) => highlightMatch(u.email, quickSearch),
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
      filterable: true,
      render: (u) => highlightMatch(u.phone, quickSearch),
    },
    {
      key: "city",
      label: "City",
      sortable: true,
      filterable: true,
      render: (u) => highlightMatch(u.city, quickSearch),
    },
    {
      key: "brands",
      label: "Brands",
      sortable: true,
      filterable: true,
      render: (u) => highlightMatch(u.brands, quickSearch),
    },
    {
      key: "emailPromo",
      label: "Email Promo",
      sortable: true,
      filterable: true,
      render: (u) => highlightMatch(u.emailPromo, quickSearch),
    },
    {
      key: "smsPromo",
      label: "SMS Promo",
      sortable: true,
      filterable: true,
      render: (u) => highlightMatch(u.smsPromo, quickSearch),
    },
  ];

  // ---------------------------
  // render
  // ---------------------------
  return (
    <div className="space-y-3">
      {error && (
        <p className="text-red-600 text-sm">
          {error.message || "Failed to load clients"}
        </p>
      )}

      <SearchBar
        value={quickSearch}
        onChange={setQuickSearch}
        onClear={clearQuickSearch}
        onAdvanced={() => setAdvancedOpen(true)}
      />

      {advancedOpen && (
        <AdvancedFilterModal
          initialFilter={advancedFilter}
          onClose={() => setAdvancedOpen(false)}
          onApply={(filter) => {
            setAdvancedFilter(filter);
            setAdvancedOpen(false);
            setPage(1);
          }}
          presets={presets}
          selectedPresetId={selectedPresetId}
          onSavePreset={(filterToSave) => {
            const name = prompt("Preset name");
            if (!name) return;

            setPresets((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                name,
                filter: structuredClone(filterToSave),
                createdAt: new Date().toISOString(),
              },
            ]);
          }}
          onSelectPreset={(id, setModalFilter) => {
            setSelectedPresetId(id);
            const preset = presets.find((p) => p.id === id);
            if (preset) setModalFilter(structuredClone(preset.filter));
          }}
          onDeletePreset={() => {
            if (!confirm("Delete this preset?")) return;
            setPresets((prev) => prev.filter((p) => p.id !== selectedPresetId));
            setSelectedPresetId("");
          }}
        />
      )}

      <ActiveFilters
        quickSearch={quickSearch}
        onClearQuickSearch={clearQuickSearch}
        advancedFilter={advancedFilter}
        onRemoveAdvancedCondition={removeAdvancedCondition}
        onClearAdvancedFilter={clearAdvancedFilter}
        onEditAdvancedFilter={editAdvancedCondition}
        onRemoveAdvancedGroup={removeAdvancedGroup}
        columnFilters={filters}
        onRemoveColumnFilter={removeColumnFilter}
        onEditColumnFilter={editColumnFilter}
      />

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-slate-700 border border-slate-600 rounded px-4 py-2">
          <div className="flex flex-col">
            <span className="text-sm text-gray-200">
              {selectedIds.size} clients selected
            </span>
            <span className="text-xs text-gray-400">
              Selection applies to current page only
            </span>
          </div>

          <button
            onClick={() => navigate("/clients/segments?from=selection")}
            className="bg-blue-600/50 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
          >
            Add to Segment
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-red-300 hover:text-red-200"
          >
            Clear selection
          </button>
        </div>
      )}

      <Table
        loading={isLoading}
        filters={filters}
        columns={columns}
        data={filteredUsers}
        selectable
        selectedIds={selectedIds}
        onSetSelectedIds={setSelectedIds}
        onToggleRow={toggleRow}
        onRowClick={(row) => navigate(`/clients/${row._id}`)}
        onFilterChange={(key, payload) => {
          setFilters((prev) => ({
            ...prev,
            [key]: {
              type: "enum",
              operator: payload.operator || "contains",
              values: payload.values || [],
            },
          }));
        }}
        openFilterRequest={openColumnFilter}
        onFilterOpened={clearOpenColumnFilter}
      />

      {!quickSearch && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}

      {showSmsModal && (
        <SmsModalCopy1
          userIds={selectedIds}
          onClose={() => {
            setShowSmsModal(false);
            setSelectedIds(new Set());
          }}
        />
      )}
    </div>
  );
}
