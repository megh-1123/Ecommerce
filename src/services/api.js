const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAdminToken = () => {
  const stored = localStorage.getItem("admin");
  if (!stored) return null;
  try {
    return JSON.parse(stored)?.token || null;
  } catch {
    return null;
  }
};

const getToken = () => {
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  try {
    return JSON.parse(stored)?.token || null;
  } catch {
    return null;
  }
};

async function request(path, options = {}) {
  // Admin routes use the admin token; everything else uses the regular user token.
  const token = path.startsWith("/admin") ? getAdminToken() : getToken();
  

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};


export const adminApi = {
  get: (path) => request(path, { method: "GET", headers: { Authorization: `Bearer ${getAdminToken()}` } }),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body), headers: { Authorization: `Bearer ${getAdminToken()}` } }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body), headers: { Authorization: `Bearer ${getAdminToken()}` } }),
  delete: (path) => request(path, { method: "DELETE", headers: { Authorization: `Bearer ${getAdminToken()}` } }),
    uploadImage: async (file) => {
    const token = getAdminToken();
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Upload failed (${res.status})`);
    }
    return data; // { url, public_id }
  },
};