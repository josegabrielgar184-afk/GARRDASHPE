import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const REWARD_COINS = 100;

function getWeekKey(d: Date = new Date()): string {
  const year = d.getUTCFullYear();
  const oneJan = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getUTCDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verifica token de Firebase
    const idTokenRes = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCUk2GWPm_AcBOFvzCpw1K5E-P5FdfeBho",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: token }) },
    );
    if (!idTokenRes.ok) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const idTokenJson = await idTokenRes.json();
    const uid: string | undefined = idTokenJson?.users?.[0]?.localId;
    if (!uid) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const missionId: string = typeof body?.mission_id === "string" ? body.mission_id : "survive_60s_all";
    const weekKey: string = typeof body?.week_key === "string" ? body.week_key : getWeekKey();
    if (missionId.length < 3 || missionId.length > 64 || weekKey.length < 6 || weekKey.length > 16) {
      return new Response(JSON.stringify({ error: "Bad request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Verifica que el progreso este completado y no reclamado.
    const progRes = await fetch(
      `${supabaseUrl}/rest/v1/weekly_mission_progress?select=completed,claimed,progress&uid=eq.${encodeURIComponent(uid)}&week_key=eq.${encodeURIComponent(weekKey)}&mission_id=eq.${encodeURIComponent(missionId)}`,
      { headers: { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}` } },
    );
    if (!progRes.ok) {
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const progJson = await progRes.json();
    const prog = Array.isArray(progJson) && progJson.length > 0 ? progJson[0] : null;
    if (!prog || prog.completed !== true) {
      return new Response(JSON.stringify({ ok: false, error: "not_completed" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (prog.claimed === true) {
      return new Response(JSON.stringify({ ok: true, duplicate: true, credited: 0 }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Inserta el reclamo (UNIQUE constraint previene doble reclamo).
    const claimRes = await fetch(`${supabaseUrl}/rest/v1/weekly_mission_claims`, {
      method: "POST",
      headers: { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}`, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify({ uid, week_key: weekKey, mission_id: missionId, amount: REWARD_COINS }),
    });
    if (!claimRes.ok) {
      if (claimRes.status === 409) {
        return new Response(JSON.stringify({ ok: true, duplicate: true, credited: 0 }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Marca como reclamado en progreso.
    await fetch(`${supabaseUrl}/rest/v1/weekly_mission_progress?uid=eq.${encodeURIComponent(uid)}&week_key=eq.${encodeURIComponent(weekKey)}&mission_id=eq.${encodeURIComponent(missionId)}`, {
      method: "PATCH",
      headers: { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}`, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify({ claimed: true, updated_at: new Date().toISOString() }),
    });

    return new Response(JSON.stringify({
      ok: true,
      credited: REWARD_COINS,
      firestore_credited: false,
      client_fallback: true,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
