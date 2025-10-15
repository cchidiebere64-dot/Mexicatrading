// Utility to safely get token and user
export function getToken() {
  const token = sessionStorage.getItem("token");
  return token || null;
}

export function getUser() {
  const raw = sessionStorage.getItem("user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Failed to parse user", err);
    return null;
  }
}
