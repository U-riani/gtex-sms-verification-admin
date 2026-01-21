// src/hooks/useDashboardStats.js

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../api/adminDashboard.js";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    staleTime: 60 * 1000, // 1 min, dashboards don’t need live panic
    retry: 1,
  });
};
