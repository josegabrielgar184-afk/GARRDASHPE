import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BITLABS_SECRET = "jXWzcobXqHkQvj3rDMCfUBlXlg4fAvfS";
const BITLABS_API_KEY = "6d280d69-7c5e-4c8a-aab0-d84c1abe9526";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const authHeader = req.headers.get("Authorization") || "";
    const providedSecret = authHeader.replace("Bearer ", "");

    if (providedSecret !== BITLABS_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const userId = body.user_id;
    const amount = body.amount || 0;
    const payout = body.payout || 0;
    const transactionId = body.transaction_id || body.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

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
    const currentBitlabsEarnings = userData[0].bitlabs_earnings || 0;
    const newCoins = currentCoins + amount;
    const newEarnings = currentBitlabsEarnings + (payout / 100);

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
        bitlabs_earnings: newEarnings,
      }),
    });

    await fetch(`${supabaseUrl}/rest/v1/bitlabs_transactions`, {
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
