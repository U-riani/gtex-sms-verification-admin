import { adminFetch } from "./adminClient";

export function getSmsHistory(params) {
  const query = new URLSearchParams(params).toString();
  return adminFetch(`/admin/sms/history?${query}`);
}

export function retryFailedSms(ids) {
  return adminFetch("/admin/sms/retry", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export function exportSmsHistoryCsv(params) {
  const query = new URLSearchParams(params).toString();
  window.open(
    `${import.meta.env.VITE_API_URL}/admin/sms/export?${query}`,
    "_blank"
  );
}