// src/utils/storage.js
export const getJSON = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error(`Failed to parse JSON from ${key}:`, err);
    return null;
  }

  // Optional helper to get user object safely
export function getJSON(key) {
  const item = sessionStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

};

