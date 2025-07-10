// config.ts

export const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:7777/api/v1"
    : "https://rd.n9xo.xyz/api/v1"; 