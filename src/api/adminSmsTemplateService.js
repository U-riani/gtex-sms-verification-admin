import { adminFetch } from "./adminClient";

export function getSmsTemplates(brand) {
  return adminFetch(`/admin/sms/templates?brand=${brand}`);
}

export function createSmsTemplate(payload) {
  return adminFetch("/admin/sms/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteSmsTemplate(id) {
  return adminFetch(`/admin/sms/templates/${id}`, {
    method: "DELETE",
  });
}
