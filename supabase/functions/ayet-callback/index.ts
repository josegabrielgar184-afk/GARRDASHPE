import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Ayet-Signature",
};

const AYET_SECRET = "92825296fad7e0d6c7d25d69c1af3b9e";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // Validate signature/secret - ayeT sends webhook with secret in header or query
    const authHeader = req.headers.get("Authorization") || "";
    const signatureHeader = req.headers.get("X-Ayet-Signature") || "";
    const providedSecret = authHeader.replace("Bearer ", "") || signatureHeader || url.searchParams.get("secret") || "";

    if (providedSecret !== AYET_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const userId = body.user_id || body.uid;
    const amount = body.amount || body.reward || 0;
    const payout = body.payout || 0;
    const transactionId = body.transaction_id || body.id || body.conversion_id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    // Fetch user
    const userRes = await fetch(`${supabaseUrl}/rest/v1/usuarios?id=eq.${userId}`, {
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
    });
    const userData = await userRes.json();

    if (!userData || userData.length === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const currentCoins = userData[0].coins || 0;
    const currentAyetEarnings = userData[0].ayet_earnings || 0;
    const newCoins = currentCoins + amount;
    const newEarnings = currentAyetEarnings + (payout / 100);

    // Update user coins and earnings
    await fetch(`${supabaseUrl}/rest/v1/usuarios?id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        coins: newCoins,
        ayet_earnings: newEarnings,
      }),
    });

    // Log transaction
    await fetch(`${supabaseUrl}/rest/v1/ayet_transactions`, {
      method: "POST",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        user_id: userId,
        transaction_id: transactionId,
        amount: amount,
        payout: payout,
        created_at: new Date().toISOString(),
      }),
    });

    return new Response(JSON.stringify({ ok: true, coins_added: amount }), {
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
