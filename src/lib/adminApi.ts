const ADMIN_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

async function adminFetch(action: string, options?: { method?: string; body?: unknown; token?: string; params?: Record<string, string> }) {
  const token = options?.token || localStorage.getItem("admin_token") || "";
  const params = new URLSearchParams({ action, ...(options?.params || {}) });
  const url = `${ADMIN_API_URL}?${params}`;

  const headers: Record<string, string> = {
    "x-admin-token": token,
    "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };

  let fetchOptions: RequestInit = { method: options?.method || "GET", headers };

  if (options?.body instanceof FormData) {
    fetchOptions.method = "POST";
    fetchOptions.body = options.body;
  } else if (options?.body) {
    headers["Content-Type"] = "application/json";
    fetchOptions.method = "POST";
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    if (res.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.reload();
    }
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const adminApi = {
  login: async (password: string) => {
    const result = await adminFetch("login", { body: { password }, token: "none" });
    if (result.success && result.token) {
      localStorage.setItem("admin_token", result.token);
    }
    return result;
  },
  logout: () => {
    localStorage.removeItem("admin_token");
  },
  isAuthenticated: () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return false;
    const parts = token.split(":");
    if (parts.length !== 2) return false;
    const expiresAt = Number(parts[0]);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      localStorage.removeItem("admin_token");
      return false;
    }
    return true;
  },
  stats: () => adminFetch("stats"),
  
  // Products
  listProducts: () => adminFetch("list-products"),
  createProduct: (product: Record<string, unknown>) => adminFetch("create-product", { body: product }),
  updateProduct: (product: Record<string, unknown>) => adminFetch("update-product", { body: product }),
  deleteProduct: (id: string) => adminFetch("delete-product", { params: { id } }),

  // Collections
  listCollections: () => adminFetch("list-collections"),
  createCollection: (collection: Record<string, unknown>) => adminFetch("create-collection", { body: collection }),
  updateCollection: (collection: Record<string, unknown>) => adminFetch("update-collection", { body: collection }),
  deleteCollection: (id: string) => adminFetch("delete-collection", { params: { id } }),

  // Orders
  listOrders: () => adminFetch("list-orders"),
  updateOrderStatus: (id: string, status: string) => adminFetch("update-order-status", { body: { id, status } }),

  // Settings
  getSettings: () => adminFetch("get-settings"),
  updateSetting: (key: string, value: unknown) => adminFetch("update-setting", { body: { key, value } }),

  // Upload
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return adminFetch("upload-image", { body: formData });
  },

  // Phone Mockups
  listMockups: () => adminFetch("list-mockups"),
  upsertMockup: (mockup: Record<string, unknown>) => adminFetch("upsert-mockup", { body: mockup }),
  deleteMockup: (id: string) => adminFetch("delete-mockup", { params: { id } }),
  uploadMockupImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return adminFetch("upload-mockup-image", { body: formData });
  },

  // Printify
  printifyListShops: () => printifyFetch("list-shops"),
  printifyImportProducts: (shop_id: string) => printifyFetch("import-products", { body: { shop_id } }),
  printifySendOrder: (order_id: string, shop_id: string) =>
    printifyFetch("send-order", { body: { order_id, shop_id } }),
};

const PRINTIFY_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printify-api`;

async function printifyFetch(action: string, options?: { body?: unknown }) {
  const token = localStorage.getItem("admin_token") || "";
  const url = `${PRINTIFY_API_URL}?action=${encodeURIComponent(action)}`;
  const headers: Record<string, string> = {
    "x-admin-token": token,
    "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
  const init: RequestInit = { method: "GET", headers };
  if (options?.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.method = "POST";
    init.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({ error: "Request failed" }));
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.reload();
    }
    const detail = data?.details ? ` — ${typeof data.details === "string" ? data.details : JSON.stringify(data.details)}` : "";
    throw new Error(`${data?.error || "Request failed"}${detail}`);
  }
  return data;
}
