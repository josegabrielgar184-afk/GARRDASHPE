import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─── Configuracion de balance por modo ───────────────────────────────────
// El cliente envia METRICAS de progreso, nunca el monto de puntos.
// El servidor aplica: cap por partida + limite de partidas/dia por modo +
// cap diario total de puntos por jugador. Triple capa anti-abuso.
interface ModeConfig {
  // Limite de partidas acreditables del mismo modo por jugador en 24h.
  dailyMatchCap: number;
  // Cap de puntos por partida para este modo.
  perMatchCap: number;
  // Funcion que convierte las metricas reportadas en puntos de ranking.
  points: (m: Record<string, number>) => number;
}

const clampInt = (v: unknown, max: number): number => {
  const n = typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : 0;
  return Math.max(0, Math.min(max, n));
};

const MODES: Record<string, ModeConfig> = {
  // Space y Zombie: ya validan score historico en submitSpaceScore/submitZombieScore.
  // Aqui recibimos el score final de la partida y lo convertimos con un divisor
  // alto para que no dominen el mensual por volumen de partidas.
  space: {
    dailyMatchCap: 10,
    perMatchCap: 80,
    points: (m) => Math.floor(clampInt(m.score, 50000) / 500),
  },
  zombie: {
    dailyMatchCap: 10,
    perMatchCap: 100,
    points: (m) => Math.min(100, clampInt(m.kills, 500)),
  },
  // Supervivencia (Modo Vicio): 1 punto por segundo, cap 120 (2 min validos).
  survival: {
    dailyMatchCap: 6,
    perMatchCap: 120,
    points: (m) => Math.min(120, Math.floor(clampInt(m.time_ms, 600000) / 1000)),
  },
  // Minijuegos del Arcade: caps ajustados a su dificultad/duracion.
  neonbreaker: {
    dailyMatchCap: 8,
    perMatchCap: 60,
    points: (m) => {
      const blocks = clampInt(m.blocks_destroyed, 500);
      const levels = clampInt(m.levels_cleared, 10);
      return Math.min(60, Math.floor(blocks * 0.05) + levels * 4);
    },
  },
  tower: {
    dailyMatchCap: 8,
    perMatchCap: 75,
    points: (m) => Math.min(75, Math.floor(clampInt(m.blocks_placed, 200) / 2)),
  },
  canicas: {
    dailyMatchCap: 8,
    perMatchCap: 40,
    points: (m) => Math.min(40, Math.floor(clampInt(m.explosions, 60) * 0.6)),
  },
  garrblade: {
    dailyMatchCap: 8,
    perMatchCap: 80,
    points: (m) => Math.min(80, Math.floor(clampInt(m.score, 20000) / 100)),
  },
  garrfly: {
    dailyMatchCap: 8,
    perMatchCap: 80,
    points: (m) => Math.min(80, Math.floor(clampInt(m.score, 20000) / 100)),
  },
  zrunner: {
    dailyMatchCap: 8,
    perMatchCap: 60,
    points: (m) => Math.min(60, Math.floor(clampInt(m.score, 5000) / 40)),
  },
  neonline: {
    dailyMatchCap: 8,
    perMatchCap: 70,
    points: (m) => Math.min(70, Math.floor(clampInt(m.score, 10000) / 70)),
  },
  // Campana: puntos por nivel completado + estrellas. Cap 90 por partida.
  // Solo se acredita al completar un nivel (completeLevel), no por reintentos.
  campaign: {
    dailyMatchCap: 10,
    perMatchCap: 90,
    points: (m) => Math.min(90, clampInt(m.level, 100) * 8 + clampInt(m.stars, 3) * 20),
  },
};

// Cap global diario: un jugador no puede acumular mas de esto por dia sumando
// todos los modos. Evita farm intensivo de un solo dia.
const DAILY_TOTAL_POINTS_CAP = 300;

function monthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    // ── Autenticacion: token de Firebase del usuario ──────────────────────
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return jsonError(401, "Unauthorized");
    }

    const idTokenRes = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCUk2GWPm_AcBOFvzCpw1K5E-P5FdfeBho",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      },
    );
    if (!idTokenRes.ok) return jsonError(401, "Unauthorized");
    const idTokenJson = await idTokenRes.json();
    const uid: string | undefined = idTokenJson?.users?.[0]?.localId;
    if (!uid) return jsonError(401, "Unauthorized");

    const playerName: string =
      typeof idTokenJson?.users?.[0]?.displayName === "string" && idTokenJson.users[0].displayName
        ? idTokenJson.users[0].displayName
        : (idTokenJson?.users?.[0]?.email ?? "Player").split("@")[0];

    // ── Parseo del body ───────────────────────────────────────────────────
    const body = await req.json();
    const mode: string = typeof body?.mode === "string" ? body.mode : "";
    const sessionId: string = typeof body?.session_id === "string" ? body.session_id : "";
    const metrics: Record<string, number> =
      body?.metrics && typeof body.metrics === "object" && !Array.isArray(body.metrics)
        ? body.metrics
        : {};
    const rawScore: number = clampInt(body?.raw_score, 100000);

    const cfg = MODES[mode];
    if (!cfg || sessionId.length < 8 || sessionId.length > 64) {
      return jsonError(400, "Bad request");
    }

    const mk = monthKey();
    const points = Math.min(cfg.perMatchCap, cfg.points(metrics));
    if (points <= 0) {
      return jsonResponse({ ok: true, credited: 0, month_key: mk });
    }

    // ── Limite de partidas del mismo modo en 24h ──────────────────────────
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const countRes = await fetch(
      `${supabaseUrl}/rest/v1/rpc/monthly_matches_since`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ p_uid: uid, p_mode: mode, p_since: dayAgo }),
      },
    );
    if (!countRes.ok) return jsonError(500, "Internal error");
    const countJson = await countRes.json();
    const matchesToday = typeof countJson === "number" ? countJson : 0;
    if (matchesToday >= cfg.dailyMatchCap) {
      return jsonResponse({
        ok: true,
        credited: 0,
        capped: true,
        reason: "daily_match_cap",
        cap_limit: cfg.dailyMatchCap,
        month_key: mk,
      });
    }

    // ── Cap global diario de puntos (todos los modos) ─────────────────────
    // Suma el total acreditado hoy consultando monthly_matches del dia.
    const todayStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const todayRes = await fetch(
      `${supabaseUrl}/rest/v1/monthly_matches?select=points&uid=eq.${encodeURIComponent(uid)}&created_at=gte.${todayStart}`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
    );
    if (!todayRes.ok) return jsonError(500, "Internal error");
    const todayRows = await todayRes.json();
    const pointsToday = Array.isArray(todayRows)
      ? todayRows.reduce((s: number, r: { points?: number }) => s + (typeof r.points === "number" ? r.points : 0), 0)
      : 0;
    if (pointsToday >= DAILY_TOTAL_POINTS_CAP) {
      return jsonResponse({
        ok: true,
        credited: 0,
        capped: true,
        reason: "daily_total_cap",
        cap_limit: DAILY_TOTAL_POINTS_CAP,
        month_key: mk,
      });
    }
    const finalPoints = Math.min(points, DAILY_TOTAL_POINTS_CAP - pointsToday);

    // ── Acreditacion atomica via RPC SECURITY DEFINER ──────────────────────
    // La RPC inserta la partida (idempotente por uid+month+mode+session) y
    // hace upsert del total en una sola transaccion.
    const creditRes = await fetch(`${supabaseUrl}/rest/v1/rpc/monthly_credit_atomic`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_uid: uid,
        p_month_key: mk,
        p_mode: mode,
        p_session_id: sessionId,
        p_metrics: metrics,
        p_raw_score: rawScore,
        p_points: finalPoints,
        p_player_name: playerName,
      }),
    });
    if (!creditRes.ok) {
      // 409 colision de indice unico = reintento de la misma partida.
      if (creditRes.status === 409) {
        return jsonResponse({ ok: true, credited: 0, duplicate: true, month_key: mk });
      }
      return jsonError(500, "Internal error");
    }
    const creditJson = await creditRes.json();
    const totalPoints = Array.isArray(creditJson) && creditJson[0]?.total_points != null
      ? creditJson[0].total_points
      : (typeof creditJson?.total_points === "number" ? creditJson.total_points : 0);

    return jsonResponse({
      ok: true,
      credited: finalPoints,
      month_key: mk,
      total_points: totalPoints,
      capped: finalPoints < points,
    });
  } catch {
    return jsonError(500, "Internal error");
  }
});

function jsonError(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonResponse(data: Record<string, unknown>): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
