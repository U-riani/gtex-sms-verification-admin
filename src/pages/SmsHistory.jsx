import { useEffect, useState } from "react";
import {
  getSmsHistory,
  retryFailedSms,
  exportSmsHistoryCsv,
} from "../api/adminSmsHistoryService";
import Pagination from "../components/Pagination";
import { SMS_BRANDS } from "../data/brands";
import { useSearchParams } from "react-router-dom";

export default function SmsHistory() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [params] = useSearchParams();
  const campaignId = params.get("campaignId");

  // filters
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    load();
  }, [brand, status, from, to, page, campaignId]);

  const load = async () => {
    setLoading(true);
    const res = await getSmsHistory({
      brand,
      status,
      from,
      to,
      campaignId,
      page,
      limit: 20,
    });

    setItems(res.items);
    setTotalPages(res.totalPages);
    setLoading(false);
  };

  const toggle = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const retry = async () => {
    await retryFailedSms([...selected]);
    setSelected(new Set());
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">SMS History</h2>

      {/* FILTERS */}
      <div className="grid grid-cols-5 gap-2 bg-white p-3 rounded shadow text-sm">
        <select
          className="border px-2 py-1 rounded"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        >
          <option value="">All brands</option>
          {SMS_BRANDS.map((b) => (
            <option key={b.key} value={b.key}>
              {b.label}
            </option>
          ))}
        </select>

        <select
          className="border px-2 py-1 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>

        <input
          type="date"
          className="border px-2 py-1 rounded"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="date"
          className="border px-2 py-1 rounded"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />

        <button
          onClick={() => exportSmsHistoryCsv({ brand, status, from, to })}
          className="bg-blue-600 text-white rounded px-3"
        >
          Export CSV
        </button>
      </div>

      {/* ACTIONS */}
      <button
        disabled={selected.size === 0}
        onClick={retry}
        className="bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Retry failed ({selected.size})
      </button>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th />
              <th className="text-start">Date</th>
              <th className="text-start">Brand</th>
              <th className="text-start">User</th>
              <th className="text-start">Phone</th>
              <th className="text-start">Status</th>
              <th className="text-start">Error</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i._id} className="border-t">
                <td>
                  {i.status === "failed" && (
                    <input
                      type="checkbox"
                      checked={selected.has(i._id)}
                      onChange={() => toggle(i._id)}
                    />
                  )}
                </td>
                <td>{new Date(i.createdAt).toLocaleString()}</td>
                <td>{i.brandLabel}</td>
                <td>
                  {i.userId ? `${i.userId.firstName} ${i.userId.lastName}` : ""}
                </td>
                <td>{i.phone}</td>
                <td
                  className={
                    i.status === "sent" ? "text-green-600" : "text-red-600"
                  }
                >
                  {i.status}
                </td>
                <td className="text-xs text-red-500">{i.error || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
