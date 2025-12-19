import { adminFetch } from "./adminClient";

export function previewSms(payload) {
  return adminFetch("/admin/sms/preview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function sendBulkSms(payload) {
  return adminFetch("/admin/sms/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
