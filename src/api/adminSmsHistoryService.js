// src/api/adminSmsHistoryService.js
import { adminFetch } from "./adminClient";

/**
 * Get SMS history list
 */
export function getSmsHistory({
  brand,
  status,
  from,
  to,
  campaignId,
  page = 1,
  limit = 20,
}) {
  const params = new URLSearchParams();

  if (brand) params.set("brand", brand);
  if (status) params.set("status", status);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (campaignId) params.set("campaignId", campaignId);

  params.set("page", page);
  params.set("limit", limit);

  return adminFetch(`/admin/sms/history?${params.toString()}`);
}

/**
 * Retry failed SMS by history IDs
 */
export function retryFailedSms(historyIds) {
  return adminFetch("/admin/sms/history/retry", {
    method: "POST",
    body: JSON.stringify({ ids: historyIds }),
  });
}

/**
 * Export SMS history to CSV / Excel
 */
export function exportSmsHistoryCsv(filters = {}) {
  const params = new URLSearchParams(filters);

  const token = localStorage.getItem("adminToken");
  const url = `${
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
  }/admin/sms/history/export?${params.toString()}`;

  // classic download, no fetch nonsense
  const a = document.createElement("a");
  a.href = url;
  a.download = "sms-history.csv";
  a.target = "_blank";
  a.rel = "noopener";
  a.click();
}
