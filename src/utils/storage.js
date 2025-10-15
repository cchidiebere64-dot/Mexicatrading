// src/utils/storage.js
export function getToken() {
  return sessionStorage.getItem("token") || null;
}

export function getUser() {
  const raw = sessionStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to parse user from sessionStorage", err);
    return null;
  }
}
