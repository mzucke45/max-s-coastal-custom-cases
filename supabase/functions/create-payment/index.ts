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
    const { items, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Cart items are required");
    }

    // Look up products from DB to get accurate prices
    const productIds = items.map((i: any) => i.productId);
    const { data: dbProducts, error: dbError } = await supabase
      .from("products")
      .select("id, name, price, image_url")
      .in("id", productIds);

    if (dbError || !dbProducts) throw new Error("Failed to look up products");

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Build Stripe line items from DB prices (prevents price tampering)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) throw new Error(`Product not found: ${item.productId}`);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: dbProduct.name + (item.phoneModel ? ` (${item.phoneModel})` : ""),
            ...(dbProduct.image_url ? { images: [dbProduct.image_url] } : {}),
          },
          unit_amount: Math.round(dbProduct.price * 100), // cents
        },
        quantity: item.quantity || 1,
      };
    });

    const origin = req.headers.get("origin") || "https://maxscustoms.lovable.app";

    // Store order metadata to pass through checkout
    const metadata = {
      items: JSON.stringify(items),
      shippingAddress: JSON.stringify(shippingAddress),
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
