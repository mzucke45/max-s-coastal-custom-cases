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

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("sessionId is required");

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false, status: session.payment_status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Parse metadata
    const items = JSON.parse(session.metadata?.items || "[]");
    const shippingAddress = JSON.parse(session.metadata?.shippingAddress || "{}");

    // Check if order already recorded for this session
    const { data: existingOrders } = await supabase
      .from("orders")
      .select("id")
      .eq("gelato_order_id", `stripe_${session.id}`)
      .limit(1);

    if (existingOrders && existingOrders.length > 0) {
      return new Response(JSON.stringify({ success: true, alreadyProcessed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Calculate total from session
    const totalAmount = (session.amount_total || 0) / 100;

    // Save order to database
    await supabase.from("orders").insert({
      gelato_order_id: `stripe_${session.id}`,
      customer_email: session.customer_details?.email || shippingAddress.email || "",
      customer_name: `${shippingAddress.firstName || ""} ${shippingAddress.lastName || ""}`.trim(),
      items,
      total_amount: totalAmount,
      status: "paid",
      shipping_address: shippingAddress,
    });

    // Optionally trigger Gelato order here in the future

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("verify-payment error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
