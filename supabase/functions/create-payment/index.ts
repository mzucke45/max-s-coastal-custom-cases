import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("Stripe_API");
    if (!stripeKey) throw new Error("Stripe secret key not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { items, shippingAddress, designCaptures } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Cart items are required");
    }

    // Look up products from DB to get accurate prices
    const productIds = items.map((i: any) => i.productId).filter((id: string) => id !== "custom-design");
    let productMap = new Map<string, any>();

    if (productIds.length > 0) {
      const { data: dbProducts, error: dbError } = await supabase
        .from("products")
        .select("id, name, price, image_url")
        .in("id", productIds);

      if (dbError || !dbProducts) throw new Error("Failed to look up products");
      productMap = new Map(dbProducts.map((p: any) => [p.id, p]));
    }

    // Build Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => {
      const dbProduct = productMap.get(item.productId);
      const price = dbProduct ? dbProduct.price : 34.99;
      const name = dbProduct ? dbProduct.name : (item.productName || "Custom Design");

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: name + (item.phoneModel ? ` (${item.phoneModel})` : ""),
            ...(dbProduct?.image_url ? { images: [dbProduct.image_url] } : {}),
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity || 1,
      };
    });

    const origin = req.headers.get("origin") || "https://maxscustoms.lovable.app";

    // Upload design PNGs to storage and collect URLs
    const designImageUrls: Record<string, string> = {};
    if (designCaptures && typeof designCaptures === "object") {
      for (const [key, capture] of Object.entries(designCaptures as Record<string, any>)) {
        if (capture.designPngDataUrl && typeof capture.designPngDataUrl === "string") {
          try {
            // Convert base64 data URL to binary
            const base64 = capture.designPngDataUrl.split(",")[1];
            if (base64) {
              const binaryStr = atob(base64);
              const bytes = new Uint8Array(binaryStr.length);
              for (let i = 0; i < binaryStr.length; i++) {
                bytes[i] = binaryStr.charCodeAt(i);
              }
              const fileName = `designs/${crypto.randomUUID()}.png`;
              const { error: uploadErr } = await supabase.storage
                .from("product-images")
                .upload(fileName, bytes.buffer, { contentType: "image/png", upsert: true });
              if (!uploadErr) {
                const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
                designImageUrls[key] = urlData.publicUrl;
              }
            }
          } catch (e) {
            console.error("Design upload error:", e);
          }
        }
      }
    }

    // Strip data URLs from design captures for metadata (too large for Stripe)
    const cleanDesignCaptures: Record<string, any> = {};
    if (designCaptures && typeof designCaptures === "object") {
      for (const [key, capture] of Object.entries(designCaptures as Record<string, any>)) {
        cleanDesignCaptures[key] = {
          phoneModel: capture.phoneModel,
          elements: capture.elements,
          bgColor: capture.bgColor,
          designImageUrl: designImageUrls[key] || "",
        };
      }
    }

    // Stripe metadata has 500 char limit per value, so store design data separately
    // We'll pass a reference ID and store the full data in the orders table directly
    const designRef = crypto.randomUUID();

    // Store design data temporarily in site_settings (will be moved to order on verify)
    if (Object.keys(cleanDesignCaptures).length > 0) {
      await supabase.from("site_settings").upsert({
        key: `design_pending_${designRef}`,
        value: cleanDesignCaptures,
        is_public: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: "key" });
    }

    const metadata = {
      items: JSON.stringify(items),
      shippingAddress: JSON.stringify(shippingAddress),
      designRef: Object.keys(cleanDesignCaptures).length > 0 ? designRef : "",
      designImageUrls: JSON.stringify(designImageUrls),
    };

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-canceled`,
      customer_email: shippingAddress?.email || undefined,
      shipping_address_collection: undefined,
      metadata,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("create-payment error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
