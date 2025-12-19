import { useEffect, useState } from "react";
import { getAdminUsers } from "../api/adminUserService";

export default function Dashboard() {
  const [totalUsers, setTotalUsers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // just load first page to get totalUsers from response
    async function load() {
      try {
        const data = await getAdminUsers(1, 1);
        setTotalUsers(data.totalUsers ?? data.users?.length ?? 0);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div>
      <h2 className="text-2xl bg-gray-100 font-semibold mb-4">Dashboard</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded shadow p-4">
            <p className="text-sm text-gray-500">Total users</p>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>
        </div>
      )}
    </div>
  );
}
