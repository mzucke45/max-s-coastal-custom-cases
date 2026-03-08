const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const gelatoKey = Deno.env.get("GELATO_API_KEY");
    if (!gelatoKey) {
      console.error("[generate-mockup] GELATO_API_KEY not found in secrets");
      return new Response(
        JSON.stringify({ error: "Gelato API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { productUid, designImageUrl } = body as {
      productUid?: string;
      designImageUrl?: string;
    };

    if (!productUid || typeof productUid !== "string") {
      return new Response(
        JSON.stringify({ error: "productUid is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!designImageUrl || typeof designImageUrl !== "string") {
      return new Response(
        JSON.stringify({ error: "designImageUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[generate-mockup] Request:", { productUid, designImageUrl: designImageUrl.slice(0, 100) + "..." });

    // Call Gelato Mockup API
    const gelatoUrl = "https://product.gelatoapis.com/v3/mockup/render";
    const gelatoPayload = {
      productUid,
      tasks: [
        {
          taskReferenceId: `mockup-${Date.now()}`,
          fileUrl: designImageUrl,
        },
      ],
    };

    console.log("[generate-mockup] Calling Gelato:", JSON.stringify(gelatoPayload));

    const gelatoRes = await fetch(gelatoUrl, {
      method: "POST",
      headers: {
        "X-API-KEY": gelatoKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gelatoPayload),
    });

    const gelatoText = await gelatoRes.text();
    console.log("[generate-mockup] Gelato status:", gelatoRes.status);
    console.log("[generate-mockup] Gelato response:", gelatoText);

    if (!gelatoRes.ok) {
      let errorMsg = "Gelato API error";
      if (gelatoRes.status === 401) errorMsg = "Invalid Gelato API key";
      else if (gelatoRes.status === 404) errorMsg = "Product UID not found in Gelato catalog";
      else if (gelatoRes.status === 400) errorMsg = "Bad request to Gelato — check productUid format";

      return new Response(
        JSON.stringify({
          error: errorMsg,
          status: gelatoRes.status,
          details: gelatoText,
        }),
        { status: gelatoRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let gelatoData;
    try {
      gelatoData = JSON.parse(gelatoText);
    } catch {
      return new Response(
        JSON.stringify({ error: "Failed to parse Gelato response", raw: gelatoText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract mockup image URL from response
    // Gelato may return different structures — log everything for debugging
    console.log("[generate-mockup] Parsed Gelato data:", JSON.stringify(gelatoData));

    // Try common response shapes
    const mockupUrl =
      gelatoData?.mockupUrl ||
      gelatoData?.url ||
      gelatoData?.tasks?.[0]?.mockupUrl ||
      gelatoData?.tasks?.[0]?.resultUrl ||
      gelatoData?.result?.mockupUrl ||
      null;

    return new Response(
      JSON.stringify({
        mockupUrl,
        raw: gelatoData,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-mockup] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
