import { apiFetch } from "./client";

// Backend: GET /api/users/paginated?page=1&limit=20
export function getPaginatedUsers(page = 1, limit = 20) {
  return apiFetch(`/users/paginated?page=${page}&limit=${limit}`);
}

// Backend: GET /api/users/:id
export function getUserById(id) {
  return apiFetch(`/users/${id}`);
}

// Backend: PATCH /api/users/:id
export function updateUser(id, payload) {
  return apiFetch(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
