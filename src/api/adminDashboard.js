// src/api/adminDashboard.js
import { adminFetch } from "./adminClient";

export function getDashboardStats() {
  return adminFetch("/admin/dashboard/");
}