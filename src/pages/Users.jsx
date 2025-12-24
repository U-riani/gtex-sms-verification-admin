import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAdminUsers } from "../api/adminUserService";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import SmsModalCopy1 from "../components/SmsModalCopy1";
import { useScreenWidth } from "../hooks/useScreenWidth";
import AdvancedFilterBar from "../components/AdvancedFilterBar";

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

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(t);
  }, [filters]);

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
        const data = await getAdminUsers(page, 20, query ? `&${query}` : "");
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [page, query]);

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const columns = [
    { key: "firstName", label: "First name", sortable: true, filterable: true },
    { key: "lastName", label: "Last name", sortable: true, filterable: true },
    { key: "branch", label: "Branch", sortable: true, filterable: true },
    { key: "gender", label: "Gender", sortable: true, filterable: true },
    { key: "phone", label: "Phone", sortable: true, filterable: true },
    { key: "email", label: "Email", sortable: true, filterable: true },
    { key: "city", label: "City", sortable: true, filterable: true },
    { key: "country", label: "Country", sortable: true, filterable: true },
    {
      key: "dateOfBirth",
      label: "Date Of Birth",
      sortable: true,
      filterable: true,
    },
    {
      key: "brands",
      label: "Selected Brands",
      sortable: true,
      filterable: true,
    },
    {
      key: "sms",
      label: "SMS",
      sortable: true,
      filterable: true,
      render: (u) => (u.promoChannels?.sms?.enabled ? "YES" : "NO"),
    },
    {
      key: "emailPromo",
      label: "Email",
      sortable: true,
      filterable: true,
      render: (u) => (u.promoChannels?.email?.enabled ? "YES" : "NO"),
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold">Users</h2>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {loading ? (
        <p className="text-gray-600">Loading…</p>
      ) : (
        <>
          <button
            disabled={selectedIds.size === 0}
            onClick={() => setShowSmsModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Send SMS ({selectedIds.size})
          </button>

          <AdvancedFilterBar
            filters={filters}
            fields={FILTER_FIELDS}
            onChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
          />

          <Table
            filters={filters}
            columns={columns}
            data={users}
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
          />

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
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
