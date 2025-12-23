import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUsers } from "../api/adminUserService";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import SmsModalCopy1 from "../components/SmsModalCopy1";
import { useScreenWidth } from "../hooks/useScreenWidth";

export default function Users() {
  const screenWidth = useScreenWidth();

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [sms, setSms] = useState("");
  const [emailPromo, setEmailPromo] = useState("");

  // selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showSmsModal, setShowSmsModal] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // debounce text filters
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(t);
  }, [firstName, lastName, phone, email, city]);

  const query = new URLSearchParams({
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    ...(phone && { phone }),
    ...(email && { email }),
    ...(city && { city }),
    ...(sms && { sms }),
    ...(emailPromo && { emailPromo }),
  }).toString();

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

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const pageIds = users.map((u) => u._id);
      const allSelected = pageIds.every((id) => next.has(id));

      pageIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));

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

      {/* FILTER ROW */}
      <div className="grid grid-cols-7 gap-2 bg-gray-400 p-3 rounded shadow text-sm">
        <input
          className="border px-2 py-1 rounded"
          placeholder="First"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          className="border px-2 py-1 rounded"
          placeholder="Last"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          className="border px-2 py-1 rounded"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="border px-2 py-1 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border px-2 py-1 rounded"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <select
          className="border px-2 py-1 rounded"
          value={sms}
          onChange={(e) => setSms(e.target.value)}
        >
          <option value="">SMS</option>
          <option value="true">YES</option>
          <option value="false">NO</option>
        </select>

        <select
          className="border px-2 py-1 rounded"
          value={emailPromo}
          onChange={(e) => setEmailPromo(e.target.value)}
        >
          <option value="">Email</option>
          <option value="true">YES</option>
          <option value="false">NO</option>
        </select>
      </div>

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

          <Table
            columns={columns}
            data={users}
            selectable
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            onRowClick={(row) => navigate(`/users/${row._id}`)}
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
