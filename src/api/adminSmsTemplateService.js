// src/api/adminSmsTemplateService.js
import { adminFetch } from "./adminClient";

// src/api/adminSmsTemplateService.js
export function getSmsTemplates({ q, brand } = {}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (brand) params.set("brand", brand);

  const qs = params.toString();
  return adminFetch(`/admin/templates${qs ? `?${qs}` : ""}`);
}

export function getSmsTemplateById(id) {
  return adminFetch(`/admin/templates/${id}`);
}

export function createSmsTemplate(payload) {
  return adminFetch("/admin/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSmsTemplate(id, payload) {
  return adminFetch(`/admin/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteSmsTemplate(id) {
  return adminFetch(`/admin/templates/${id}`, {
    method: "DELETE",
  });
}
