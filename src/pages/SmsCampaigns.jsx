// src/pages/SmsCampaigns.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

import { getSmsTemplates } from "../api/adminSmsTemplateService";
import { getSegments } from "../api/segmentService";
import { startSmsCampaign, getSmsCampaigns } from "../api/smsCampaignService";

import { useSmsCampaignStore } from "../store/smsCampaignStore";
import DataTableView from "../components/DataTableView";
import { smsCampaignColumns } from "../config/smsCampaignColumns.jsx";

export default function SmsCampaigns() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();

  const templateIdFromUrl = params.get("templateId");
  const segmentIdFromUrl = params.get("segmentId");

  /* ---------------------------
   * UI STATE (same pattern)
   * --------------------------- */
  const [search, setSearch] = useState("");
  const [advancedFilter, setAdvancedFilter] = useState(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [hydratedFromUrl, setHydratedFromUrl] = useState(false);
  /* ---------------------------
   * CAMPAIGN STORE
   * --------------------------- */
  const {
    showStart,
    openStart,
    closeStart,
    selectedTemplateId,
    selectedSegmentId,
    setTemplate,
    setSegment,
    reset,
  } = useSmsCampaignStore();

  /* ---------------------------
   * DATA
   * --------------------------- */
  const { data: templates = [] } = useQuery({
    queryKey: ["sms-templates"],
    queryFn: getSmsTemplates,
    select: (r) => r.templates ?? [],
  });

  const { data: segments = [] } = useQuery({
    queryKey: ["segments"],
    queryFn: getSegments,
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["sms-campaigns"],
    queryFn: getSmsCampaigns,
    select: (r) => r.campaigns ?? [],
  });

  const templateExists =
    !templateIdFromUrl || templates.some((t) => t._id === templateIdFromUrl);

  const segmentExists =
    !segmentIdFromUrl || segments.some((s) => s._id === segmentIdFromUrl);

  /* ---------------------------
   * FILTERED DATA (IMPORTANT)
   * --------------------------- */
  const normalizedCampaigns = useMemo(() => {
    return campaigns.map((c) => ({
      ...c,

      templateName: c.templateSnapshot?.name ?? "",
      templateContent: c.templateSnapshot?.content ?? "",

      segmentName: c.segmentSnapshot?.name ?? "",
      segmentUsers: c.segmentSnapshot?.userCount ?? 0,

      sent: c.stats?.sent ?? 0,
      failed: c.stats?.failed ?? 0,
    }));
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    if (!search.trim()) return normalizedCampaigns;

    const q = search.toLowerCase();

    return normalizedCampaigns.filter((c) =>
      [c.templateName, c.templateContent, c.segmentName, c.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [normalizedCampaigns, search]);

  /* ---------------------------
   * COLUMNS (with highlight)
   * --------------------------- */
  const columns = useMemo(
    () =>
      smsCampaignColumns({
        highlight: search,
        onDetails: (id) => navigate(`/sms-campaigns/${id}`),
      }),
    [navigate, search],
  );

  /* ---------------------------
   * START CAMPAIGN
   * --------------------------- */
  const startMut = useMutation({
    mutationFn: startSmsCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries(["sms-campaigns"]);
      reset();
    },
  });

  const start = () => {
    if (!selectedTemplateId || !selectedSegmentId) return;

    startMut.mutate({
      templateId: selectedTemplateId,
      segmentId: selectedSegmentId,
    });
  };

  useEffect(() => {
    if (hydratedFromUrl) return;
    if (!templateExists || !segmentExists) return;

    let didHydrate = false;

    if (templateIdFromUrl && !selectedTemplateId) {
      setTemplate(templateIdFromUrl);
      didHydrate = true;
    }

    if (segmentIdFromUrl && !selectedSegmentId) {
      setSegment(segmentIdFromUrl);
      didHydrate = true;
    }

    if (didHydrate) {
      openStart();
      setHydratedFromUrl(true);
    }
  }, [
    templateIdFromUrl,
    segmentIdFromUrl,
    templateExists,
    templateExists,
    selectedTemplateId,
    selectedSegmentId,
    hydratedFromUrl,
  ]);
  useEffect(() => {
    if (!hydratedFromUrl) return;

    navigate("/sms-campaigns", { replace: true });
  }, [hydratedFromUrl]);

  /* ---------------------------
   * RENDER
   * --------------------------- */
  return (
    <div className="max-w-5xl mx-auto px-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">SMS Campaigns</h1>
        <button
          onClick={() => (showStart ? closeStart() : openStart())}
          className="bg-green-700/70 px-4 py-2 rounded-xl text-white"
        >
          Start Campaign
        </button>
      </div>

      {/* START CAMPAIGN */}
      {showStart && (
        <div className="bg-white/80 border rounded-xl p-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Template</label>
            <select
              value={selectedTemplateId ?? ""}
              onChange={(e) => setTemplate(e.target.value || null)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select template</option>
              {templates.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.brand})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Segment</label>
            <select
              value={selectedSegmentId ?? ""}
              onChange={(e) => setSegment(e.target.value || null)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select segment</option>
              {segments.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.count})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={closeStart} className="text-gray-500">
              Cancel
            </button>
            <button
              onClick={start}
              disabled={startMut.isLoading}
              className="bg-green-600 px-4 py-2 rounded text-white disabled:opacity-40"
            >
              {startMut.isLoading ? "Sending…" : "Start"}
            </button>
          </div>
        </div>
      )}

      {/* CAMPAIGN HISTORY */}
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
        /* ADVANCED FILTER (disabled but wired) */
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
          data: filteredCampaigns,
          filters,
          onFilterChange: (key, payload) =>
            setFilters((prev) => ({ ...prev, [key]: payload })),
          rowActions: (row) => (
            <button
              onClick={() => navigate(`/sms-campaigns/${row._id}`)}
              className="text-blue-400 hover:text-blue-300"
              title="View details"
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
          ),
        }}
      />
    </div>
  );
}
