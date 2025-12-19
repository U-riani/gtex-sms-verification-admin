// src/api/adminClient.js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function adminFetch(path, options = {}) {
  const token = localStorage.getItem("adminToken");

  const res = await fetch(API_BASE + path, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
      return;
    }

    throw new Error(data.error || "Admin request failed");
  }

  return data;
}
