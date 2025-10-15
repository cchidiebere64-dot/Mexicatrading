// Safe session storage helper
export function getToken() {
  const token = sessionStorage.getItem("token");
  return token && token !== "undefined" ? token : null;
}

export function getUser() {
  const raw = sessionStorage.getItem("user");
  if (!raw || raw === "undefined") return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse user from sessionStorage", err);
    return null;
  }
}
