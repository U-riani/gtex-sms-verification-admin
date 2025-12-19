import { useEffect, useState } from "react";
import { adminFetch } from "../api/adminClient";

export default function SmsTemplateAnalytics() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    adminFetch("/admin/sms/analytics/templates").then((r) =>
      setStats(r.stats)
    );
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Template Analytics</h2>

      <div className="bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-start">Template</th>
              <th className="text-start">Brand</th>
              <th className="text-start">Total</th>
              <th className="text-start">Sent</th>
              <th className="text-start">Failed</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, i) => (
              <tr key={i} className="border-t">
                <td className="max-w-md whitespace-pre-wrap">
                  {s._id}
                </td>
                <td>{s.brand}</td>
                <td>{s.total}</td>
                <td className="text-green-600">{s.sent}</td>
                <td className="text-red-600">{s.failed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
