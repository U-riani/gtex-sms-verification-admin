import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAdminUsers, advancedFilterUsers } from "../api/adminUserService";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import SmsModalCopy1 from "../components/SmsModalCopy1";
import { useScreenWidth } from "../hooks/useScreenWidth";
import AdvancedFilterBar from "../components/AdvancedFilterBar";
import AdvancedFilterModal from "../components/AdvancedFilterModal";
import AdvancedFilterChips from "../components/AdvancedFilterChips";
import { loadPresets, savePresets } from "../utils/filterPresets";
import { Accordion } from "../components/Accordion";
import { highlightMatch } from "../utils/highlightMatch";
import ActiveFilters from "../components/ActiveFilters";

function QuickSearch({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search users…"
      className="w-full px-4 py-2 rounded bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  );
}

export default function Users() {
  const FILTER_FIELDS = [
    { key: "firstName", label: "First name", type: "text" },
    { key: "lastName", label: "Last name", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "city", label: "City", type: "text" },
    { key: "sms", label: "SMS", type: "boolean" },
    { key: "emailPromo", label: "Email", type: "boolean" },
  ];

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [presets, setPresets] = useState(() => loadPresets());
  const [selectedPresetId, setSelectedPresetId] = useState("");

  const screenWidth = useScreenWidth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({});
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showSmsModal, setShowSmsModal] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const hasAdvanced = !!advancedFilter;
  const hasFrontend = Object.keys(filters).length > 0;
  const [quickSearch, setQuickSearch] = useState("");
  const isQuickSearchActive = quickSearch.trim().length > 0;
  const [debouncedSearch, setDebouncedSearch] = useState(quickSearch);

  const [columnPositions, setColumnPositions] = useState({});
  const [openColumnFilter, setOpenColumnFilter] = useState(null);

  const removeAdvancedCondition = (gi, ci) => {
    const next = structuredClone(advancedFilter);
    next.groups[gi].conditions.splice(ci, 1);

    if (next.groups[gi].conditions.length === 0) {
      next.groups.splice(gi, 1);
    }

    setAdvancedFilter(next.groups.length ? next : null);
  };

  const clearAdvancedFilter = () => {
    setAdvancedFilter(null);
  };

  const clearQuickSearch = () => {
    setQuickSearch("");
  };

  const removeColumnFilter = (key) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(t);
  }, [filters]);

  useEffect(() => {
    savePresets(presets);
  }, [presets]);

  useEffect(() => {
    if (isQuickSearchActive) {
      setPage(1);
    }
  }, [isQuickSearchActive]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(quickSearch), 120);
    return () => clearTimeout(t);
  }, [quickSearch]);
  // useEffect(() => {
  //   if (advancedFilter) setFilters({}); // optional UX decision
  // }, [advancedFilter]);

  const query = new URLSearchParams(
    Object.entries(filters).flatMap(([key, f]) => {
      if (f.type === "enum") {
        return f.values.map((v) => [`${key}[]`, v]);
      }
      return [[key, f.value]];
    })
  ).toString();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        if (advancedFilter) {
          const data = await advancedFilterUsers({
            filter: advancedFilter,
            page,
            limit: 20,
          });

          setUsers(data.users || []);
          setTotalPages(data.totalPages || 1);
        } else {
          const data = await getAdminUsers(page, 20, query ? `&${query}` : "");

          setUsers(data.users || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [page, query, advancedFilter]);

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const editColumnFilter = (key) => {
    const el = document.querySelector(`th[data-col="${key}"]`);
    if (!el) return;

    const rect = el.getBoundingClientRect();

    setOpenColumnFilter({
      key,
      position: {
        top: rect.bottom + 4,
        left: rect.left,
      },
    });
  };

  const clearOpenColumnFilter = () => {
    setOpenColumnFilter(null);
  };

  const columns = [
    {
      key: "firstName",
      label: "First name",
      sortable: true,
      filterable: true,
      render: (u) => highlightMatch(u.firstName, quickSearch),
      onRegisterPosition: (pos) =>
        setColumnPositions((p) => ({ ...p, firstName: pos })),
    },
    {
      key: "lastName",
      label: "Last name",
      sortable: true,
      filterable: true,
      render: (u) => highlightMatch(u.lastName, quickSearch),
      onRegisterPosition: (pos) =>
        setColumnPositions((p) => ({ ...p, lastName: pos })),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      filterable: true,
      render: (u) => highlightMatch(u.email, quickSearch),
      onRegisterPosition: (pos) =>
        setColumnPositions((p) => ({ ...p, email: pos })),
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
      filterable: true,
      render: (u) => highlightMatch(u.phone, quickSearch),
      onRegisterPosition: (pos) =>
        setColumnPositions((p) => ({ ...p, phone: pos })),
    },
    {
      key: "city",
      label: "City",
      sortable: true,
      filterable: true,
      render: (u) => highlightMatch(u.city, quickSearch),
      onRegisterPosition: (pos) =>
        setColumnPositions((p) => ({ ...p, city: pos })),
    },
    {
      key: "sms",
      label: "SMS",
      sortable: true,
      filterable: true,
      render: (u) =>
        highlightMatch(
          u.promoChannels?.sms?.enabled ? "YES" : "NO",
          quickSearch
        ),
      onRegisterPosition: (pos) =>
        setColumnPositions((p) => ({ ...p, sms: pos })),
    },
  ];

  const accordionItems = [
    {
      id: "filters",
      header: <QuickSearch value={quickSearch} onChange={setQuickSearch} />,
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdvancedOpen(true)}
              className="px-3 py-2 rounded bg-slate-700 text-white text-sm hover:bg-slate-600"
            >
              Advanced
            </button>

            <select
              value={selectedPresetId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedPresetId(id);
                const preset = presets.find((p) => p.id === id);
                if (!preset) return;
                setAdvancedFilter(structuredClone(preset.filter));
                setPage(1);
              }}
              className="bg-slate-700 text-white px-3 py-2 rounded"
            >
              <option value="">Presets…</option>
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* <AdvancedFilterBar
            filters={filters}
            fields={FILTER_FIELDS}
            onChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
          /> */}

          {/* <AdvancedFilterChips
            advancedFilter={advancedFilter}
            onRemove={(next) => {
              setAdvancedFilter(next);
              setPage(1);
            }}
          /> */}
        </div>
      ),
    },
  ];
  const searchableKeys = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "city",
    "country",
    "gender",
  ];

  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return users;

    const q = debouncedSearch.toLowerCase();

    return users.filter((user) =>
      searchableKeys.some((key) =>
        String(user[key] ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [users, debouncedSearch]);

  const editAdvancedCondition = (gi, ci) => {
    setAdvancedOpen(true);

    // allow modal to mount first
    setTimeout(() => {
      const el = document.querySelector(`[data-adv-cond="${gi}-${ci}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Accordion items={accordionItems} defaultOpenId="table" />
      {loading ? (
        <p className="text-gray-600">Loading…</p>
      ) : (
        <>
          {/* <button
            disabled={selectedIds.size === 0}
            onClick={() => setShowSmsModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Send SMS ({selectedIds.size})
          </button> */}
          <div className="flex items-center gap-2">
            {advancedOpen && (
              <AdvancedFilterModal
                initialFilter={advancedFilter}
                onClose={() => setAdvancedOpen(false)}
                onApply={(filter) => {
                  setAdvancedFilter(filter);
                  setAdvancedOpen(false);
                  setPage(1);
                }}
              />
            )}

            {/* <button
              onClick={() => setAdvancedOpen(true)}
              className="px-3 py-2 rounded bg-slate-700 text-white text-sm hover:bg-slate-600"
            >
              Advanced
            </button>
            <div className="relative flex items-center gap-2">
              <select
                value={selectedPresetId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedPresetId(id);

                  const preset = presets.find((p) => p.id === id);
                  if (!preset) return;

                  setAdvancedFilter(structuredClone(preset.filter));
                  setPage(1);
                }}
                className="bg-slate-700 text-white px-3 py-2 rounded"
              >
                <option value="">Presets…</option>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {selectedPresetId && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const preset = presets.find(
                        (p) => p.id === selectedPresetId
                      );
                      if (!preset) return;

                      setAdvancedFilter(structuredClone(preset.filter));
                      setAdvancedOpen(true);
                    }}
                    className="px-2 py-1 text-xs rounded bg-slate-600 text-white hover:bg-slate-500"
                  >
                    ✎ Edit
                  </button>

                  <button
                    onClick={() => {
                      if (!confirm("Delete this preset?")) return;

                      setPresets((prev) =>
                        prev.filter((p) => p.id !== selectedPresetId)
                      );
                      setSelectedPresetId("");
                    }}
                    className="px-2 py-1 text-xs rounded bg-red-700 text-white hover:bg-red-600"
                  >
                    🗑 Delete
                  </button>
                </div>
              )}
            </div> */}
          </div>

          {/* ACTIVE FILTER CHIPS */}
          <div className="flex flex-wrap gap-2">
            {/* Advanced filter chips */}
            {/* {advancedFilter?.groups?.map((group, gi) =>
              group.conditions.map((cond, ci) => (
                <div
                  key={`adv-${gi}-${ci}`}
                  className="flex items-center gap-2 bg-purple-700 text-white px-2 py-1 rounded text-sm"
                >
                  <span>
                    {cond.field} {cond.operator} {cond.value}
                  </span>
                  <button
                    onClick={() => {
                      const next = structuredClone(advancedFilter);
                      next.groups[gi].conditions.splice(ci, 1);
                      if (next.groups[gi].conditions.length === 0) {
                        next.groups.splice(gi, 1);
                      }
                      setAdvancedFilter(next.groups.length ? next : null);
                      setPage(1);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )} */}
            {/* {advancedFilter && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAdvancedOpen(true)}
                  className="px-3 py-2 rounded bg-slate-600 text-white text-sm hover:bg-slate-500"
                >
                  ✎ Edit
                </button>

                <button
                  onClick={() => {
                    setAdvancedFilter(null);
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded bg-red-700 text-white text-sm hover:bg-red-600"
                >
                  ✕ Clear
                </button>
              </div>
            )} */}
            {/* {advancedFilter && (
              <button
                onClick={() => {
                  const name = prompt("Preset name");
                  if (!name) return;

                  setPresets((prev) => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      name,
                      filter: structuredClone(advancedFilter),
                      createdAt: new Date().toISOString(),
                    },
                  ]);
                }}
                className="px-3 py-2 rounded bg-indigo-600 text-white text-sm"
              >
                ★ Save preset
              </button>
            )} */}

            {/* Frontend filter chips */}
            {/* {Object.entries(filters).map(([key, f]) => (
              <div
                key={key}
                className="flex items-center gap-2 bg-blue-600 text-white px-2 py-1 rounded text-sm"
              >
                <span>
                  {key} {f.type === "enum" ? f.values.join(", ") : f.value}
                </span>
                <button
                  onClick={() => {
                    const next = { ...filters };
                    delete next[key];
                    setFilters(next);
                    setPage(1);
                  }}
                >
                  ✕
                </button>
              </div>
            ))} */}
          </div>

          {/* <AdvancedFilterBar
            filters={filters}
            fields={FILTER_FIELDS}
            onChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
          /> */}
          <ActiveFilters
            quickSearch={quickSearch}
            onClearQuickSearch={clearQuickSearch}
            advancedFilter={advancedFilter}
            onRemoveAdvancedCondition={removeAdvancedCondition}
            onClearAdvancedFilter={clearAdvancedFilter}
            onEditAdvancedFilter={editAdvancedCondition}
            columnFilters={filters}
            onRemoveColumnFilter={removeColumnFilter}
            onEditColumnFilter={editColumnFilter}
          />

          <Table
            filters={filters}
            columns={columns}
            data={filteredUsers}
            selectable
            selectedIds={selectedIds}
            onSetSelectedIds={setSelectedIds}
            onToggleRow={toggleRow}
            onRowClick={(row) => navigate(`/users/${row._id}`)}
            onFilterChange={(key, payload) => {
              setFilters((prev) => ({
                ...prev,
                [key]: {
                  type: "enum",
                  operator: payload.operator || "contains",
                  values: payload.values || [],
                },
              }));
              setPage(1);
            }}
            openFilterRequest={openColumnFilter}
            onFilterOpened={clearOpenColumnFilter}
          />

          {!isQuickSearchActive && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          )}
        </>
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
