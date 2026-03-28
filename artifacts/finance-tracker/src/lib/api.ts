export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${API_BASE}${path}`, options);
}