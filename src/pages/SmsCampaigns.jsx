import { useEffect, useState } from "react";
import { getSmsCampaigns } from "../api/adminSmsCampaignService";
import { useNavigate } from "react-router-dom";

export default function SmsCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getSmsCampaigns().then((res) => setCampaigns(res.campaigns));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">SMS Campaigns</h2>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-start">Date</th>
              <th className="text-start">Brand</th>
              <th className="text-start">Total</th>
              <th className="text-start">Sent</th>
              <th className="text-start">Failed</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c._id} className="border-t">
                <td>{new Date(c.createdAt).toLocaleString()}</td>
                <td>{c.brand}</td>
                <td>{c.total}</td>
                <td className="text-green-600">{c.sent}</td>
                <td className="text-red-600">{c.failed}</td>
                <td>
                  <button
                    className="text-blue-600"
                    onClick={() =>
                      navigate(`/sms-history?campaignId=${c._id}`)
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
