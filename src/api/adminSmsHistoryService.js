// src/api/adminSmsHistoryService.js
import { adminFetch } from "./adminClient";

/**
 * Get SMS history list
 */
export function getSmsHistory({ campaignId, page = 1, limit = 20 }) {
  const params = new URLSearchParams({ campaignId, page, limit });
  return adminFetch(`/admin/sms/history?${params}`);
}

export function getSmsHistoryAdvanced({ filter, page = 1, limit = 20 }) {
  return adminFetch("/admin/sms/history/advanced", {
    method: "POST",
    body: JSON.stringify({ filter, page, limit }),
  });
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
