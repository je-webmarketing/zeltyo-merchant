const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "https://zeltyo-app.onrender.com").replace(/\/+$/, "");

function buildApiUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (import.meta.env.DEV) {
    return `/api${cleanPath}`;
  }

  return `${API_BASE_URL}${cleanPath}`;
}

export { API_BASE_URL, buildApiUrl };