import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GELATO_BASE = "https://product.gelatoapis.com/v3";

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
        const res = await fetch(`${GELATO_BASE}/catalogs/${catalogId}/products`, {
          headers: gelatoHeaders,
        });
        result = await res.json();
        break;
      }
      case "product-details": {
        const productUid = url.searchParams.get("productUid");
        if (!productUid) {
          return new Response(JSON.stringify({ error: "productUid required" }), {
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
        if (!productUid) {
          return new Response(JSON.stringify({ error: "productUid required" }), {
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
        const body = await req.json();
        const res = await fetch("https://order.gelatoapis.com/v4/orders", {
          method: "POST",
          headers: gelatoHeaders,
          body: JSON.stringify(body),
        });
        result = await res.json();

        // Save order to database
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        await supabase.from("orders").insert({
          gelato_order_id: result.id || null,
          customer_email: body.shippingAddress?.email || "",
          customer_name: `${body.shippingAddress?.firstName || ""} ${body.shippingAddress?.lastName || ""}`.trim(),
          items: body.items || [],
          total_amount: body.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1) * 29.99, 0) || 0,
          status: result.id ? "submitted" : "failed",
          shipping_address: body.shippingAddress || null,
        });
        break;
      }
      case "order-status": {
        const orderId = url.searchParams.get("orderId");
        if (!orderId) {
          return new Response(JSON.stringify({ error: "orderId required" }), {
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
        return new Response(JSON.stringify({ error: "Unknown action", validActions: ["catalogs", "products", "product-details", "prices", "create-order", "order-status"] }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
