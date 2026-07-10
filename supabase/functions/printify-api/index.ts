import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token",
};

const PRINTIFY_BASE = "https://api.printify.com/v1";
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;

// --- Admin auth (mirrors admin-api HMAC token) ---
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
async function hmacSign(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}
async function checkAuth(req: Request): Promise<boolean> {
  const token = req.headers.get("x-admin-token");
  if (!token) return false;
  const parts = token.split(":");
  if (parts.length !== 2) return false;
  const [expiresAtStr, sig] = parts;
  const expiresAt = Number(expiresAtStr);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;
  const pw = Deno.env.get("ADMIN_PASSWORD");
  if (!pw) return false;
  const expected = await hmacSign(`admin:${expiresAtStr}`, pw);
  return constantTimeEqual(sig, expected);
}
void SESSION_TTL_MS;

// --- Printify HTTP helper ---
async function printify(path: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; body: any }> {
  const key = Deno.env.get("PRINTIFY_API_KEY");
  if (!key) return { ok: false, status: 500, body: { error: "PRINTIFY_API_KEY not configured" } };
  const res = await fetch(`${PRINTIFY_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "User-Agent": "Maximal-Lovable/1.0",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body: any = text;
  try { body = text ? JSON.parse(text) : null; } catch { /* keep as text */ }
  return { ok: res.ok, status: res.status, body };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (!(await checkAuth(req))) return json({ error: "Unauthorized" }, 401);

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  try {
    // ---------- list-shops ----------
    if (action === "list-shops") {
      const r = await printify("/shops.json");
      if (!r.ok) return json({ error: "Printify request failed", status: r.status, details: r.body }, r.status);
      return json({ shops: r.body });
    }

    // ---------- import-products ----------
    if (action === "import-products") {
      const body = await req.json().catch(() => ({}));
      const shopId = String(body?.shop_id || "");
      if (!shopId) return json({ error: "shop_id required" }, 400);

      let page = 1;
      const limit = 50;
      let imported = 0;
      let updated = 0;
      const errors: string[] = [];

      while (true) {
        const r = await printify(`/shops/${shopId}/products.json?limit=${limit}&page=${page}`);
        if (!r.ok) return json({ error: "Printify products fetch failed", status: r.status, details: r.body }, r.status);
        const data = r.body?.data || [];
        if (!Array.isArray(data) || data.length === 0) break;

        for (const p of data) {
          try {
            const variants: any[] = Array.isArray(p.variants) ? p.variants : [];
            const enabledVariant = variants.find((v) => v.is_enabled) || variants[0];
            const priceCents = Number(enabledVariant?.price ?? 0);
            const images: any[] = Array.isArray(p.images) ? p.images : [];
            const defaultImg = images.find((i) => i.is_default) || images[0];

            const row = {
              name: String(p.title || "Untitled").slice(0, 200),
              description: String(p.description || "").replace(/<[^>]+>/g, "").slice(0, 2000),
              price: priceCents > 0 ? priceCents / 100 : 0,
              image_url: String(defaultImg?.src || ""),
              category: String(p.tags?.[0] || "Printify"),
              printify_product_id: String(p.id),
              printify_variant_id: enabledVariant?.id ? String(enabledVariant.id) : null,
              is_active: !!p.visible,
              updated_at: new Date().toISOString(),
            };

            // Upsert by printify_product_id
            const { data: existing } = await supabase
              .from("products")
              .select("id")
              .eq("printify_product_id", row.printify_product_id)
              .maybeSingle();

            if (existing?.id) {
              const { error } = await supabase.from("products").update(row).eq("id", existing.id);
              if (error) throw error;
              updated++;
            } else {
              const { error } = await supabase.from("products").insert(row);
              if (error) throw error;
              imported++;
            }
          } catch (e: any) {
            errors.push(`${p.id}: ${e?.message || String(e)}`);
          }
        }

        const current = Number(r.body?.current_page ?? page);
        const last = Number(r.body?.last_page ?? current);
        if (current >= last) break;
        page = current + 1;
        if (page > 50) break; // hard cap
      }

      return json({ imported, updated, errors });
    }

    // ---------- send-order ----------
    if (action === "send-order") {
      const body = await req.json().catch(() => ({}));
      const orderId = String(body?.order_id || "");
      const shopId = String(body?.shop_id || "");
      if (!orderId || !shopId) return json({ error: "order_id and shop_id required" }, 400);

      const { data: order, error: oErr } = await supabase
        .from("orders").select("*").eq("id", orderId).maybeSingle();
      if (oErr || !order) return json({ error: "Order not found" }, 404);

      const items: any[] = Array.isArray(order.items) ? order.items : [];
      const line_items: any[] = [];
      for (const it of items) {
        const productId = it.productId || it.product_id;
        if (!productId) continue;
        const { data: prod } = await supabase
          .from("products")
          .select("printify_product_id, printify_variant_id")
          .eq("id", productId)
          .maybeSingle();
        if (!prod?.printify_product_id || !prod?.printify_variant_id) {
          return json({
            error: `Product ${productId} is not linked to Printify. Import products from Printify first.`,
          }, 400);
        }
        line_items.push({
          product_id: prod.printify_product_id,
          variant_id: Number(prod.printify_variant_id),
          quantity: Number(it.quantity || 1),
        });
      }
      if (line_items.length === 0) return json({ error: "No Printify-linked items in order" }, 400);

      const addr = order.shipping_address || {};
      const nameParts = String(order.customer_name || "").trim().split(/\s+/);
      const payload = {
        external_id: order.id,
        label: `Maximal ${order.id.slice(0, 8)}`,
        line_items,
        shipping_method: 1,
        send_shipping_notification: false,
        address_to: {
          first_name: addr.firstName || nameParts[0] || "Customer",
          last_name: addr.lastName || nameParts.slice(1).join(" ") || "",
          email: order.customer_email || "",
          phone: addr.phone || "",
          country: addr.country || "US",
          region: addr.state || "",
          address1: addr.addressLine1 || addr.address1 || "",
          address2: addr.addressLine2 || addr.address2 || "",
          city: addr.city || "",
          zip: addr.postCode || addr.zip || "",
        },
      };

      const r = await printify(`/shops/${shopId}/orders.json`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        await supabase.from("orders").update({
          printify_last_error: `[${r.status}] ${typeof r.body === "string" ? r.body : JSON.stringify(r.body)}`.slice(0, 2000),
          updated_at: new Date().toISOString(),
        }).eq("id", order.id);
        return json({ error: "Printify order failed", status: r.status, details: r.body }, r.status);
      }

      const printifyOrderId = String(r.body?.id ?? "");
      await supabase.from("orders").update({
        printify_order_id: printifyOrderId,
        printify_status: "on_hold",
        printify_last_error: null,
        status: "submitted",
        updated_at: new Date().toISOString(),
      }).eq("id", order.id);

      return json({ success: true, printify_order_id: printifyOrderId, response: r.body });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err: any) {
    console.error("printify-api error:", err);
    return json({ error: err?.message || "Server error" }, 500);
  }
});
