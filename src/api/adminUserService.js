import { adminFetch } from "./adminClient";

export function getAdminUsers(page = 1, limit = 20, query = "") {
  return adminFetch(
    `/admin/users/paginated?page=${page}&limit=${limit}${query}`
  );
}

export function getAdminUserById(id) {
  return adminFetch(`/admin/users/${id}`);
}

export function updateAdminUser(id, payload) {
  return adminFetch(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// Backend: POST /api/admin/users/paginated
export function advancedFilterUsers(payload) {
  return adminFetch(`/admin/users/advanced-search`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
