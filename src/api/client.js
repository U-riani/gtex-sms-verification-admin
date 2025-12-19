const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.error || data?.message || `Request failed with ${res.status}`;
    throw new Error(message);
  }

  return data;
}
