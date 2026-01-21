// src/pages/Dashboard.jsx
import { useDashboardStats } from "../hooks/useDashboardStats";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";

function StatCard({ label, weekly, total, goTo }) {
  return (
    <Link
      to={goTo}
      className="group relative bg-white rounded-xl  p-5 shadow-sm overflow-hidden
                 transition-all duration-200
                 hover:shadow-lg hover:-translate-y-2"
    >
      {/* subtle accent */}
      <div className="absolute inset-x-0 top-0 h-3 -mt-0.5 rounded-t-xl bg-gradient-to-r from-blue-400 to-indigo-400 opacity-60" />

      <p className="text-sm font-medium text-gray-500">{label}</p>

      <div className="mt-3">
        <p className="text-3xl font-semibold text-gray-900">{total}</p>
        <p className="text-sm text-gray-400">total</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{weekly}</span> last 7
          days
        </p>

        
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { data, isLoading, isError } = useDashboardStats();

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <p className="text-red-500">Failed to load dashboard</p>;
  }

  const { overall, lastWeek } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Users"
          weekly={lastWeek.users}
          total={overall.users}
          goTo={"/clients"}
        />

        <StatCard
          label="Segments"
          weekly={lastWeek.segments}
          total={overall.segments}
          goTo={"/clients/segments"}
        />

        <StatCard
          label="Templates"
          weekly={lastWeek.templates}
          total={overall.templates}
          goTo={"/sms-templates"}
        />

        <StatCard
          label="Campaigns"
          weekly={lastWeek.campaigns}
          total={overall.campaigns}
          goTo={"/sms-campaigns"}
        />

        <StatCard
          label="SMS Sent"
          weekly={lastWeek.sms.success}
          total={overall.sms.success}
          goTo={"/sms-history"}
        />

        <StatCard
          label="SMS Failed"
          weekly={lastWeek.sms.failed}
          total={overall.sms.failed}
          goTo={"/sms-history"}
        />
      </div>
    </div>
  );
}
