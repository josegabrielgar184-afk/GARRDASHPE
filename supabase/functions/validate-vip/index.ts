import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const VIP_PRODUCT_ID = "pase_vip_60dias";
const VIP_DURATION_DAYS = 60;
const VIP_COIN_MULTIPLIER = 1.5;
const VIP_FREE_ROULETTE_SPINS = 3;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        "apikey": anonKey,
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = await userRes.json();
    const userId = user.id;

    const body = await req.json();
    const productId = body.product_id || body.productId;

    if (productId !== VIP_PRODUCT_ID) {
      return new Response(JSON.stringify({ error: "Invalid product" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + VIP_DURATION_DAYS);

    await fetch(`${supabaseUrl}/rest/v1/usuarios?id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        vip: true,
        vip_expiry: expiry.toISOString(),
        coin_multiplier: VIP_COIN_MULTIPLIER,
        free_roulette_spins: VIP_FREE_ROULETTE_SPINS,
      }),
    });

    await fetch(`${supabaseUrl}/rest/v1/vip_purchases`, {
      method: "POST",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        user_id: userId,
        product_id: productId,
        price_usd: 3,
        price_pen: 11.50,
        expiry: expiry.toISOString(),
        created_at: new Date().toISOString(),
      }),
    });

    return new Response(JSON.stringify({ ok: true, vip_expiry: expiry.toISOString() }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
