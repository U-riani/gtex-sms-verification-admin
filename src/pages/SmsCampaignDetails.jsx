// src/pages/SmsCampaignDetails.jsx
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { getSmsCampaignDetails } from "../api/smsCampaignService";
import DataTableView from "../components/DataTableView";
import { smsCampaignDetailsColumns } from "../config/smsCampaignDetailsColumns.jsx";

export default function SmsCampaignDetails() {
  const { id } = useParams();
  /* ---------------------------
   * UI STATE
   * --------------------------- */
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["sms-campaign", id],
    queryFn: () => getSmsCampaignDetails(id),
  });

  const campaign = data?.campaign;
  const history = data?.history ?? [];

  const filteredHistory = useMemo(() => {
    if (!search.trim()) return history;

    const q = search.toLowerCase();

    return history.filter((h) =>
      [h.phone, h.status, h.error, h.userId?.firstName, h.userId?.lastName]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [history, search]);
  console.log(filteredHistory);
  return (
    <div className="max-w-6xl mx-auto px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">{campaign?.name}</h1>
        <p className="text-sm text-gray-500">
          {campaign?.templateSnapshot?.content}
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-sm">
        <span>Users: {campaign?.stats?.total ?? 0}</span>
        <span className="text-green-600">
          Sent: {campaign?.stats?.sent ?? 0}
        </span>
        <span className="text-red-600">
          Failed: {campaign?.stats?.failed ?? 0}
        </span>
      </div>

      {/* History table */}
      <DataTableView
        /* feature flags */
        enableSearch
        enableColumnFilters
        /* SEARCH */
        search={search}
        onSearchChange={setSearch}
        onSearchClear={() => setSearch("")}
        onOpenAdvanced={() => {}}
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
        onEditAdvancedFilter={() => {}}
        /* TABLE */
        tableProps={{
          loading: isLoading,
          columns: smsCampaignDetailsColumns(),
          data: filteredHistory,
          filters,
          onFilterChange: (key, payload) =>
            setFilters((prev) => ({ ...prev, [key]: payload })),
        }}
      />
    </div>
  );
}
