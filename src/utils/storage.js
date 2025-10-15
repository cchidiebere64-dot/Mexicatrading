// src/utils/storage.js
export function getToken() {
  const token = sessionStorage.getItem("token");
  return token ? token : null;
}

export function getUser() {
  const userStr = sessionStorage.getItem("user");
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    console.error("Failed to parse user from sessionStorage", err);
    return null;
  }
}
