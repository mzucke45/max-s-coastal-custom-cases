import { supabase } from "@/integrations/supabase/client";

const ADMIN_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

async function adminFetch(action: string, options?: { method?: string; body?: any; password?: string; params?: Record<string, string> }) {
  const password = options?.password || localStorage.getItem("admin_password") || "";
  const params = new URLSearchParams({ action, ...(options?.params || {}) });
  const url = `${ADMIN_API_URL}?${params}`;

  const headers: Record<string, string> = {
    "x-admin-password": password,
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
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const adminApi = {
  login: (password: string) => adminFetch("login", { body: { password }, password }),
  stats: () => adminFetch("stats"),
  
  // Products
  listProducts: () => adminFetch("list-products"),
  createProduct: (product: any) => adminFetch("create-product", { body: product }),
  updateProduct: (product: any) => adminFetch("update-product", { body: product }),
  deleteProduct: (id: string) => adminFetch("delete-product", { params: { id } }),

  // Collections
  listCollections: () => adminFetch("list-collections"),
  createCollection: (collection: any) => adminFetch("create-collection", { body: collection }),
  updateCollection: (collection: any) => adminFetch("update-collection", { body: collection }),
  deleteCollection: (id: string) => adminFetch("delete-collection", { params: { id } }),

  // Orders
  listOrders: () => adminFetch("list-orders"),
  updateOrderStatus: (id: string, status: string) => adminFetch("update-order-status", { body: { id, status } }),

  // Settings
  getSettings: () => adminFetch("get-settings"),
  updateSetting: (key: string, value: any) => adminFetch("update-setting", { body: { key, value } }),

  // Upload
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return adminFetch("upload-image", { body: formData });
  },
};
