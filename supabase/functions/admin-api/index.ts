import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_PASSWORD = "maxscustoms2024";

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function checkAuth(req: Request): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  // Login check doesn't need auth
  if (action === "login") {
    const body = await req.json();
    const valid = body.password === ADMIN_PASSWORD;
    return new Response(JSON.stringify({ success: valid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!checkAuth(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = getSupabase();

  try {
    let result: any;

    switch (action) {
      // --- DASHBOARD STATS ---
      case "stats": {
        const [products, orders, collections] = await Promise.all([
          supabase.from("products").select("*", { count: "exact" }),
          supabase.from("orders").select("*"),
          supabase.from("collections").select("*", { count: "exact" }),
        ]);

        const totalRevenue = (orders.data || []).reduce(
          (sum, o) => sum + Number(o.total_amount || 0), 0
        );
        const ordersByStatus: Record<string, number> = {};
        (orders.data || []).forEach((o) => {
          ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
        });

        result = {
          totalProducts: products.count || 0,
          totalOrders: orders.data?.length || 0,
          totalCollections: collections.count || 0,
          totalRevenue,
          ordersByStatus,
          recentOrders: (orders.data || [])
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
        const { data, error } = await supabase.from("products").insert(body).select().single();
        if (error) throw error;
        result = data;
        break;
      }
      case "update-product": {
        const body = await req.json();
        const { id, ...updates } = body;
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single();
        if (error) throw error;
        result = data;
        break;
      }
      case "delete-product": {
        const id = url.searchParams.get("id");
        const { error } = await supabase.from("products").delete().eq("id", id!);
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
        const { data, error } = await supabase.from("collections").insert(body).select().single();
        if (error) throw error;
        result = data;
        break;
      }
      case "update-collection": {
        const body = await req.json();
        const { id, ...updates } = body;
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from("collections").update(updates).eq("id", id).select().single();
        if (error) throw error;
        result = data;
        break;
      }
      case "delete-collection": {
        const id = url.searchParams.get("id");
        const { error } = await supabase.from("collections").delete().eq("id", id!);
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
        if (!file) throw new Error("No file provided");

        const ext = file.name.split(".").pop();
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
