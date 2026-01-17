// src/api/adminSmsSend.js
import { adminFetch } from "./adminClient";

export function sendSms({ templateId, segmentId, brand }) {
  return adminFetch("/admin/sms/send", {
    method: "POST",
    body: JSON.stringify({
      templateId,
      segmentId,
      brand,
    }),
  });
}
