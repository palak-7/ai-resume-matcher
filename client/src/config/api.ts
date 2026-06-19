const fallbackApiUrl = "http://localhost:5000";

export const apiBaseUrl =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || fallbackApiUrl;

export const apiUrl = `${apiBaseUrl}/api`;
