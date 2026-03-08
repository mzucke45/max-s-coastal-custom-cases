import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GELATO_BASE = "https://product.gelatoapis.com/v3";

// --- Validation helpers ---
function isString(v: unknown, maxLen = 500): v is string {
  return typeof v === "string" && v.length <= maxLen;
}
function isEmail(v: unknown): v is string {
  return typeof v === "string" && v.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isPositiveInt(v: unknown, max = 100): v is number {
  return typeof v === "number" && Number.isInteger(v) && v > 0 && v <= max;
}

function validateOrderBody(body: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    errors.push("items array is required and must not be empty");
  } else if (body.items.length > 50) {
    errors.push("Maximum 50 items per order");
  } else {
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i] as Record<string, unknown>;
      if (item.quantity !== undefined && !isPositiveInt(item.quantity, 100)) {
        errors.push(`items[${i}].quantity must be a positive integer <= 100`);
      }
    }
  }
  const addr = body.shippingAddress as Record<string, unknown> | undefined;
  if (!addr || typeof addr !== "object") {
    errors.push("shippingAddress is required");
  } else {
    if (addr.email !== undefined && !isEmail(addr.email)) errors.push("Invalid email in shippingAddress");
    if (addr.firstName !== undefined && !isString(addr.firstName, 100)) errors.push("firstName max 100 chars");
    if (addr.lastName !== undefined && !isString(addr.lastName, 100)) errors.push("lastName max 100 chars");
  }
  return errors;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const gelatoKey = Deno.env.get("GELATO_API_KEY");
    if (!gelatoKey) {
      return new Response(JSON.stringify({ error: "Gelato API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    const gelatoHeaders = {
      "X-API-KEY": gelatoKey,
      "Content-Type": "application/json",
    };

    let result;

    switch (action) {
      case "catalogs": {
        const res = await fetch(`${GELATO_BASE}/catalogs`, { headers: gelatoHeaders });
        result = await res.json();
        break;
      }
      case "products": {
        const catalogId = url.searchParams.get("catalogId") || "phone-cases";
        // Validate catalogId - alphanumeric and hyphens only
        if (!/^[a-zA-Z0-9-]{1,100}$/.test(catalogId)) {
          return new Response(JSON.stringify({ error: "Invalid catalogId" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const res = await fetch(`${GELATO_BASE}/catalogs/${catalogId}/products`, {
          headers: gelatoHeaders,
        });
        result = await res.json();
        break;
      }
      case "product-details": {
        const productUid = url.searchParams.get("productUid");
        if (!productUid || !/^[a-zA-Z0-9_-]{1,200}$/.test(productUid)) {
          return new Response(JSON.stringify({ error: "Valid productUid required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const res = await fetch(`${GELATO_BASE}/products/${productUid}`, {
          headers: gelatoHeaders,
        });
        result = await res.json();
        break;
      }
      case "prices": {
        const productUid = url.searchParams.get("productUid");
        if (!productUid || !/^[a-zA-Z0-9_-]{1,200}$/.test(productUid)) {
          return new Response(JSON.stringify({ error: "Valid productUid required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const res = await fetch(`${GELATO_BASE}/products/${productUid}/prices`, {
          headers: gelatoHeaders,
        });
        result = await res.json();
        break;
      }
      case "create-order": {
        // Guest checkout - validate apikey header exists (Supabase anon key)
        const apikey = req.headers.get("apikey");
        if (!apikey) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const body = await req.json();
        const errors = validateOrderBody(body);
        if (errors.length > 0) {
          return new Response(JSON.stringify({ error: "Validation failed", details: errors }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Look up gelato_product_uid for each item from the database
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const cartItems = body.items as Array<Record<string, unknown>>;
        const productIds = cartItems.map((i) => String(i.productId)).filter(Boolean);

        const { data: dbProducts, error: dbError } = await supabase
          .from("products")
          .select("id, name, price, gelato_product_uid")
          .in("id", productIds);

        if (dbError) {
          console.error("DB lookup error:", dbError);
          return new Response(JSON.stringify({ error: "Failed to look up products" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const productMap = new Map((dbProducts || []).map((p) => [p.id, p]));

        // Build Gelato order items
        const gelatoItems: Array<Record<string, unknown>> = [];
        const orderItemDetails: Array<Record<string, unknown>> = [];
        let totalAmount = 0;

        for (const cartItem of cartItems) {
          const dbProduct = productMap.get(String(cartItem.productId));
          if (!dbProduct) {
            return new Response(JSON.stringify({ error: `Product not found: ${cartItem.productId}` }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (!dbProduct.gelato_product_uid) {
            return new Response(JSON.stringify({ error: `Product "${dbProduct.name}" is not linked to Gelato` }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          const qty = Number(cartItem.quantity) || 1;
          totalAmount += dbProduct.price * qty;

          gelatoItems.push({
            itemReferenceId: `${dbProduct.id}-${Date.now()}`,
            productUid: dbProduct.gelato_product_uid,
            quantity: qty,
            files: [],
          });

          orderItemDetails.push({
            productId: dbProduct.id,
            productName: dbProduct.name,
            quantity: qty,
            price: dbProduct.price,
            gelatoUid: dbProduct.gelato_product_uid,
          });
        }

        const addr = body.shippingAddress as Record<string, unknown>;
        const customerEmail = isEmail(addr?.email) ? addr.email : "";
        const firstName = isString(addr?.firstName, 100) ? addr.firstName : "";
        const lastName = isString(addr?.lastName, 100) ? addr.lastName : "";

        // Build Gelato API order payload
        const gelatoPayload = {
          orderType: "order",
          orderReferenceId: `order-${Date.now()}`,
          customerReferenceId: customerEmail || `guest-${Date.now()}`,
          currency: "USD",
          items: gelatoItems,
          shippingAddress: {
            firstName,
            lastName,
            email: customerEmail,
            phone: isString(addr?.phone, 30) ? addr.phone : "",
            addressLine1: isString(addr?.addressLine1, 200) ? addr.addressLine1 : "",
            addressLine2: isString(addr?.addressLine2, 200) ? addr.addressLine2 : "",
            city: isString(addr?.city, 100) ? addr.city : "",
            state: isString(addr?.state, 100) ? addr.state : "",
            postCode: isString(addr?.postCode, 20) ? addr.postCode : "",
            country: isString(addr?.country, 2) ? addr.country : "US",
          },
        };

        // Submit to Gelato
        const res = await fetch("https://order.gelatoapis.com/v4/orders", {
          method: "POST",
          headers: gelatoHeaders,
          body: JSON.stringify(gelatoPayload),
        });
        result = await res.json();

        // Save order to local database
        await supabase.from("orders").insert({
          gelato_order_id: (result as Record<string, unknown>).id ? String((result as Record<string, unknown>).id) : null,
          customer_email: customerEmail,
          customer_name: `${firstName} ${lastName}`.trim(),
          items: orderItemDetails,
          total_amount: totalAmount,
          status: (result as Record<string, unknown>).id ? "submitted" : "failed",
          shipping_address: body.shippingAddress || null,
        });
        break;
      }
      case "order-status": {
        // Require authentication (apikey header)
        const apikey = req.headers.get("apikey");
        if (!apikey) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const orderId = url.searchParams.get("orderId");
        if (!orderId || !/^[a-zA-Z0-9_-]{1,200}$/.test(orderId)) {
          return new Response(JSON.stringify({ error: "Valid orderId required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const res = await fetch(`https://order.gelatoapis.com/v4/orders/${orderId}`, {
          headers: gelatoHeaders,
        });
        result = await res.json();
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Gelato API error:", error);
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
