import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Stateless HMAC-based admin tokens (works across isolates)
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

async function hmacSign(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function generateToken(): Promise<string> {
  const adminPassword = Deno.env.get("ADMIN_PASSWORD")!;
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const sig = await hmacSign(`admin:${expiresAt}`, adminPassword);
  return `${expiresAt}:${sig}`;
}

async function checkAuth(req: Request): Promise<boolean> {
  const token = req.headers.get("x-admin-token");
  if (!token) return false;
  const parts = token.split(":");
  if (parts.length !== 2) return false;
  const [expiresAtStr, sig] = parts;
  const expiresAt = Number(expiresAtStr);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;
  const adminPassword = Deno.env.get("ADMIN_PASSWORD");
  if (!adminPassword) return false;
  const expectedSig = await hmacSign(`admin:${expiresAtStr}`, adminPassword);
  return sig === expectedSig;
}

// --- Validation helpers ---
function isString(v: unknown, maxLen = 500): v is string {
  return typeof v === "string" && v.length <= maxLen;
}
function isPositiveNumber(v: unknown, max = 99999): v is number {
  return typeof v === "number" && v > 0 && v <= max && isFinite(v);
}
function isUUID(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}
function isBool(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function validateProduct(body: Record<string, unknown>) {
  const errors: string[] = [];
  if (!isString(body.name, 200) || (body.name as string).trim().length === 0) errors.push("name is required (max 200 chars)");
  if (body.description !== undefined && !isString(body.description, 2000)) errors.push("description max 2000 chars");
  if (body.price !== undefined && !isPositiveNumber(body.price, 9999.99)) errors.push("price must be positive number <= 9999.99");
  if (body.image_url !== undefined && !isString(body.image_url, 1000)) errors.push("image_url max 1000 chars");
  if (body.design_image_url !== undefined && !isString(body.design_image_url, 1000)) errors.push("design_image_url max 1000 chars");
  if (body.category !== undefined && !isString(body.category, 100)) errors.push("category max 100 chars");
  if (body.collection_id !== undefined && body.collection_id !== null && !isUUID(body.collection_id)) errors.push("collection_id must be a valid UUID");
  if (body.gelato_product_uid !== undefined && body.gelato_product_uid !== null && !isString(body.gelato_product_uid, 100)) errors.push("gelato_product_uid max 100 chars");
  if (body.is_active !== undefined && !isBool(body.is_active)) errors.push("is_active must be boolean");
  return errors;
}

function validateCollection(body: Record<string, unknown>) {
  const errors: string[] = [];
  if (!isString(body.name, 200) || (body.name as string).trim().length === 0) errors.push("name is required (max 200 chars)");
  if (body.description !== undefined && !isString(body.description, 2000)) errors.push("description max 2000 chars");
  if (body.image_url !== undefined && !isString(body.image_url, 1000)) errors.push("image_url max 1000 chars");
  if (body.is_active !== undefined && !isBool(body.is_active)) errors.push("is_active must be boolean");
  return errors;
}

function sanitizeProduct(body: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
  const allowed = ["name", "description", "price", "image_url", "design_image_url", "category", "collection_id", "gelato_product_uid", "is_active"];
  for (const key of allowed) {
    if (body[key] !== undefined) clean[key] = body[key];
  }
  return clean;
}

function sanitizeCollection(body: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
  const allowed = ["name", "description", "image_url", "is_active"];
  for (const key of allowed) {
    if (body[key] !== undefined) clean[key] = body[key];
  }
  return clean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  // Login: validate password from secret, return session token
  if (action === "login") {
    try {
      const body = await req.json();
      const adminPassword = Deno.env.get("ADMIN_PASSWORD");
      if (!adminPassword) {
        return new Response(JSON.stringify({ error: "Admin not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!isString(body.password, 200) || body.password !== adminPassword) {
        return new Response(JSON.stringify({ success: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Generate stateless HMAC token
      const token = await generateToken();
      return new Response(JSON.stringify({ success: true, token }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ success: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  if (!(await checkAuth(req))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    let result: unknown;

    switch (action) {
      // --- DASHBOARD STATS ---
      case "stats": {
        const [products, orders, collections] = await Promise.all([
          supabase.from("products").select("*", { count: "exact" }),
          supabase.from("orders").select("*"),
          supabase.from("collections").select("*", { count: "exact" }),
        ]);

        const totalRevenue = (orders.data || []).reduce(
          (sum: number, o: Record<string, unknown>) => sum + Number(o.total_amount || 0), 0
        );
        const ordersByStatus: Record<string, number> = {};
        (orders.data || []).forEach((o: Record<string, unknown>) => {
          const s = String(o.status);
          ordersByStatus[s] = (ordersByStatus[s] || 0) + 1;
        });

        result = {
          totalProducts: products.count || 0,
          totalOrders: orders.data?.length || 0,
          totalCollections: collections.count || 0,
          totalRevenue,
          ordersByStatus,
          recentOrders: (orders.data || [])
            .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
              new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
            )
            .slice(0, 10),
        };
        break;
      }

      // --- PRODUCTS CRUD ---
      case "list-products": {
        const { data, error } = await supabase
          .from("products")
          .select("*, collections(name)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        result = data;
        break;
      }
      case "create-product": {
        const body = await req.json();
        const errors = validateProduct(body);
        if (errors.length > 0) {
          return new Response(JSON.stringify({ error: "Validation failed", details: errors }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const clean = sanitizeProduct(body);
        const { data, error } = await supabase.from("products").insert(clean).select().single();
        if (error) throw error;
        result = data;
        break;
      }
      case "update-product": {
        const body = await req.json();
        if (!isUUID(body.id)) {
          return new Response(JSON.stringify({ error: "Valid product id required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errors = validateProduct({ ...body, name: body.name || "placeholder" });
        if (errors.length > 0) {
          return new Response(JSON.stringify({ error: "Validation failed", details: errors }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const clean = sanitizeProduct(body);
        clean.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from("products").update(clean).eq("id", body.id).select().single();
        if (error) throw error;
        result = data;
        break;
      }
      case "delete-product": {
        const id = url.searchParams.get("id");
        if (!isUUID(id)) {
          return new Response(JSON.stringify({ error: "Valid product id required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // --- COLLECTIONS CRUD ---
      case "list-collections": {
        const { data, error } = await supabase.from("collections").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        result = data;
        break;
      }
      case "create-collection": {
        const body = await req.json();
        const errors = validateCollection(body);
        if (errors.length > 0) {
          return new Response(JSON.stringify({ error: "Validation failed", details: errors }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const clean = sanitizeCollection(body);
        const { data, error } = await supabase.from("collections").insert(clean).select().single();
        if (error) throw error;
        result = data;
        break;
      }
      case "update-collection": {
        const body = await req.json();
        if (!isUUID(body.id)) {
          return new Response(JSON.stringify({ error: "Valid collection id required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errors = validateCollection({ ...body, name: body.name || "placeholder" });
        if (errors.length > 0) {
          return new Response(JSON.stringify({ error: "Validation failed", details: errors }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const clean = sanitizeCollection(body);
        clean.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from("collections").update(clean).eq("id", body.id).select().single();
        if (error) throw error;
        result = data;
        break;
      }
      case "delete-collection": {
        const id = url.searchParams.get("id");
        if (!isUUID(id)) {
          return new Response(JSON.stringify({ error: "Valid collection id required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { error } = await supabase.from("collections").delete().eq("id", id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      // --- ORDERS ---
      case "list-orders": {
        const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        result = data;
        break;
      }
      case "update-order-status": {
        const body = await req.json();
        if (!isUUID(body.id)) {
          return new Response(JSON.stringify({ error: "Valid order id required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const validStatuses = ["pending", "submitted", "processing", "shipped", "delivered", "cancelled", "failed"];
        if (!isString(body.status, 50) || !validStatuses.includes(body.status)) {
          return new Response(JSON.stringify({ error: "Invalid status" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { data, error } = await supabase
          .from("orders")
          .update({ status: body.status, updated_at: new Date().toISOString() })
          .eq("id", body.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
        break;
      }

      // --- SITE SETTINGS ---
      case "get-settings": {
        const { data, error } = await supabase.from("site_settings").select("*");
        if (error) throw error;
        result = data;
        break;
      }
      case "update-setting": {
        const body = await req.json();
        if (!isString(body.key, 100)) {
          return new Response(JSON.stringify({ error: "Valid key required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { data, error } = await supabase
          .from("site_settings")
          .upsert({ key: body.key, value: body.value, updated_at: new Date().toISOString() }, { onConflict: "key" })
          .select()
          .single();
        if (error) throw error;
        result = data;
        break;
      }

      // --- IMAGE UPLOAD ---
      case "upload-image": {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) {
          return new Response(JSON.stringify({ error: "No file provided" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
          return new Response(JSON.stringify({ error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // Validate file size (max 5MB)
        if (file.size > 20 * 1024 * 1024) {
          return new Response(JSON.stringify({ error: "File too large. Max 5MB" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const path = `uploads/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const { error } = await supabase.storage
          .from("product-images")
          .upload(path, arrayBuffer, { contentType: file.type, upsert: true });
        if (error) throw error;

        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        result = { url: urlData.publicUrl, path };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin API error:", error);
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
