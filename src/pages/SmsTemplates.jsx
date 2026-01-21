import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getSmsTemplates,
  createSmsTemplate,
  deleteSmsTemplate,
} from "../api/adminSmsTemplateService";
// import Table from "../components/Table.jsx";
// import SearchBar from "../components/SearchBar.jsx";
import { templateColumns } from "../config/TemplateColumns.js";
import { SMS_BRANDS } from "../data/brands";
import { useTemplateSelectionStore } from "../store/templateSelectionStore.js";
// import AdvancedFilterModal from "../components/AdvancedFilterModal.jsx";
import DataTableView from "../components/DataTableView.jsx";

export default function SmsTemplates() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [showAddBrandForm, setShowAddBrandForm] = useState(false);

  const [filters, setFilters] = useState({});

  const selectedIds = useTemplateSelectionStore((s) => s.selectedIds);
  const setSelectedIds = useTemplateSelectionStore((s) => s.setSelectedIds);
  const toggleRow = useTemplateSelectionStore((s) => s.toggleId);
  const clearSelection = useTemplateSelectionStore((s) => s.clear);

  const { data, isLoading } = useQuery({
    queryKey: ["sms-templates", debouncedSearch, advancedFilter],
    queryFn: () =>
      getSmsTemplates({
        q: debouncedSearch,
        brand: advancedFilter?.brand,
      }),
    staleTime: 30_000,
  });

  const templates = data?.templates ?? [];
  /* ---------- Load templates (by brand) ---------- */
  const columns = useMemo(
    () =>
      templateColumns({
        highlight: search,
        onSend: (t) => navigate(`/sms/send?templateId=${t._id}`),
        onDelete: (t) => remove(t._id),
      }),
    [navigate, search]
  );
  const bulkActions = [
    {
      label: "Delete",
      className: "bg-red-600 text-white px-3 py-1 rounded",
      onClick: async (ids) => {
        await Promise.all([...ids].map(deleteSmsTemplate));
        clearSelection();
        queryClient.invalidateQueries(["sms-templates"]);
      },
    },
  ];

  const filteredTemplates = useMemo(() => {
    if (!search.trim()) return templates;

    const q = search.toLowerCase();

    return templates.filter((t) =>
      [t.name, t.content, t.brand]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [templates, search]);
console.log(filteredTemplates)
  /* ---------- Create template ---------- */
  const create = async () => {
    if (!brand || !name || !content) {
      setError("Select brand and fill all fields");
      return;
    }

    setError("");

    await createSmsTemplate({ brand, name, content });

    queryClient.invalidateQueries(["sms-templates"]);
    setName("");
    setContent("");
    setShowAddBrandForm(false);
  };

  /* ---------- Delete ---------- */

  const remove = async (id) => {
    await deleteSmsTemplate(id);
    queryClient.invalidateQueries(["sms-templates"]);
  };

  useEffect(() => {
    clearSelection();
  }, [brand]);

  const handleShowAddBrandForm = () => {
    setShowAddBrandForm((prev) => !prev);
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 150);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="max-w-5xl mx-auto px-4 space-y-8">
      {/* Header */}
      <div className="flex justify-between w-full">
        <div>
          <h1 className="text-3xl font-semibold">SMS Templates</h1>
          <p className="text-sm text-gray-500">Manage reusable SMS templates</p>
        </div>
        <div>
          <button
            onClick={handleShowAddBrandForm}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-700/60 text-white hover:bg-blue-700 cursor-pointer"
          >
            {showAddBrandForm ? "Hide Form" : "Add New Template"}
          </button>
        </div>
      </div>

      {/* Create form */}
      {showAddBrandForm && (
        <div className="rounded-2xl bg-white/80 backdrop-blur border p-6 shadow-sm space-y-4 ">
          <div>
            <label className="text-sm font-medium">Template name</label>
            <input
              className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {/* Brand select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Brand</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm"
            >
              <option value="">Select brand</option>
              {SMS_BRANDS.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Template content</label>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Variables: {"{firstName}"} {"{lastName}"} {"{brand}"}
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end">
            <button
              onClick={create}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Save Template
            </button>
          </div>
        </div>
      )}
      {/* Templates list */}
      {/* {advancedOpen && (
        <AdvancedFilterModal
          initialFilter={advancedFilter}
          onClose={() => setAdvancedOpen(false)}
          onApply={(f) => {
            setAdvancedFilter(f);
            setAdvancedOpen(false);
          }}
          presets={[]}
          selectedPresetId={null}
          onSavePreset={() => {}}
          onSelectPreset={() => {}}
          onDeletePreset={() => {}}
        />
      )} */}

      {/* <div>
        <SearchBar
          value={search}
          placeholder="Search templates…"
          onChange={setSearch}
          onClear={() => setSearch("")}
          onAdvanced={() => setAdvancedOpen(true)}
        />

        <Table
          loading={isLoading}
          columns={columns}
          data={templates}
          selectable
          selectedIds={selectedIds}
          onToggleRow={toggleRow}
          onSetSelectedIds={setSelectedIds}
          filters={filters}
          onFilterChange={(key, payload) =>
            setFilters((prev) => ({ ...prev, [key]: payload }))
          }
          rowActions={(row) => (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/sms-campaigns?templateId=${row._id}`)}
                className="text-green-500 hover:underline text-sm"
              >
                Send
              </button>
              <button
                onClick={() => navigate(`/sms-templates/${row._id}/edit`)}
                className="text-blue-400 hover:text-blue-300"
                title="Edit"
              >
                ✏️
              </button>
            </div>
          )}
        />
      </div> */}
      <div>
        <DataTableView
          /* feature flags */
          enableSearch
          enableAdvancedFilter={false}
          enableColumnFilters
          /* SEARCH */
          search={search}
          onSearchChange={setSearch}
          onSearchClear={() => setSearch("")}
          onOpenAdvanced={() => setAdvancedOpen(true)}
          /* ADVANCED FILTER */
          advancedOpen={advancedOpen}
          advancedFilter={advancedFilter}
          onCloseAdvanced={() => setAdvancedOpen(false)}
          onApplyAdvanced={(f) => {
            setAdvancedFilter(f);
            setAdvancedOpen(false);
          }}
          presets={[]}
          selectedPresetId={null}
          onSavePreset={() => {}}
          onSelectPreset={() => {}}
          onDeletePreset={() => {}}
          /* ACTIVE FILTERS */
          columnFilters={filters}
          onRemoveColumnFilter={(key) =>
            setFilters((prev) => {
              const next = { ...prev };
              delete next[key];
              return next;
            })
          }
          onEditColumnFilter={() => {}}
          onRemoveAdvancedCondition={() => {}}
          onRemoveAdvancedGroup={() => {}}
          onEditAdvancedFilter={() => setAdvancedOpen(true)}
          /* TABLE */
          tableProps={{
            loading: isLoading,
            columns,
            data: filteredTemplates,
            selectable: true,
            selectedIds,
            onToggleRow: toggleRow,
            onSetSelectedIds: setSelectedIds,
            filters,
            onFilterChange: (key, payload) =>
              setFilters((prev) => ({ ...prev, [key]: payload })),
            rowActions: (row) => (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    navigate(`/sms-campaigns?templateId=${row._id}`)
                  }
                  className="bg-green-300/20 px-2 pb-0.5 text-green-500 rounded hover:underline text-sm cursor-pointer"
                >
                  Send
                </button>
                <button
                  onClick={() => navigate(`/sms-templates/${row._id}/edit`)}
                  className="text-blue-400 hover:text-blue-300 cursor-pointer"
                  title="Edit"
                >
                  ✏️
                </button>
              </div>
            ),
          }}
          /* SELECTION BAR */
          selectionBar={
            selectedIds.size > 0 && (
              <div className="flex items-center justify-between bg-slate-800 border border-slate-600 rounded px-4 py-2">
                <span className="text-sm text-gray-200">
                  {selectedIds.size} selected
                </span>

                <button
                  onClick={async () => {
                    await Promise.all([...selectedIds].map(deleteSmsTemplate));
                    clearSelection();
                    queryClient.invalidateQueries(["sms-templates"]);
                  }}
                  className="bg-red-600 px-4 py-1 rounded text-sm text-white"
                >
                  Delete
                </button>
              </div>
            )
          }
        />
      </div>
    </div>
  );
}
