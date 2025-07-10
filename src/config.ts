// config.ts

export const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:7777/api/v1"
    : "http://46.62.128.58:7777/api/v1"; 