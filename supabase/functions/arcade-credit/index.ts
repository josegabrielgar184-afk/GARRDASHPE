import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Tope diario de monedas por jugador y juego (anti-abuso; NO es prueba de
// legitimidad de la partida: la partida misma sigue declarada por el cliente).
const DAILY_CAP_PER_GAME = 150;
const GAMES = new Set(["neonbreaker", "tower", "canicas"]);

// Formulas de balance de lib/arcade-rewards.ts, calculadas en el servidor.
// El cliente envia metricas de progreso, nunca el monto.
function neonBreakerCoins(blocksDestroyed: number, levelsCleared: number, maxLevel: number): number {
  if (blocksDestroyed <= 0 && levelsCleared <= 0) return 0;
  const blockCoins = Math.floor(blocksDestroyed * 0.35);
  const levelCoins = levelsCleared * 10;
  const cap = 10 + maxLevel * 10;
  return Math.min(cap, blockCoins + levelCoins);
}

function towerCoins(blocksPlaced: number, perfects: number): number {
  if (blocksPlaced <= 0) return 0;
  const base = Math.floor(blocksPlaced / 2);
  const perfectBonus = perfects * 2;
  const diminishing = blocksPlaced > 40 ? Math.floor((blocksPlaced - 40) / 4) : 0;
  return Math.min(60, base + perfectBonus + diminishing);
}

// Canicas: 1 moneda por explosion valida, tope por partida de 20.
function canicasCoins(explosions: number): number {
  if (explosions <= 0) return 0;
  return Math.min(20, Math.floor(explosions));
}

function clampInt(v: unknown, max: number): number {
  const n = typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : 0;
  return Math.max(0, Math.min(max, n));
}

// Inicializa Firebase Admin SDK si el secreto FIREBASE_SERVICE_ACCOUNT_JSON
// esta configurado. Si no existe, firestoreCredited queda desactivado y el
// abono real queda pendiente (el cliente lo muestra como "abono pendiente").
let firebaseApp: any = null;
let firestore: any = null;
let adminAvailable = false;
try {
  const saJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
  if (saJson) {
    const creds = JSON.parse(saJson);
    const admin = await import("npm:firebase-admin@12.7.0");
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(creds),
    }, "arcade-credit");
    firestore = admin.getFirestore(firebaseApp);
    adminAvailable = true;
  }
} catch {
  adminAvailable = false;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    // Autenticacion: token de Firebase del usuario (mismo flujo que validate-vip).
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verifica el token contra Firebase Auth (config publica del proyecto garrdash).
    const idTokenRes = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCUk2GWPm_AcBOFvzCpw1K5E-P5FdfeBho",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      },
    );
    if (!idTokenRes.ok) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const idTokenJson = await idTokenRes.json();
    const uid: string | undefined = idTokenJson?.users?.[0]?.localId;
    if (!uid) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const game: string = typeof body?.game === "string" ? body.game : "";
    const sessionId: string = typeof body?.session_id === "string" ? body.session_id : "";

    if (!GAMES.has(game) || sessionId.length < 8 || sessionId.length > 64) {
      return new Response(JSON.stringify({ error: "Bad request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Metricas de progreso con rangos conservadores por juego.
    let amount = 0;
    let metrics: Record<string, number> = {};
    if (game === "neonbreaker") {
      const blocks = clampInt(body?.metrics?.blocks_destroyed, 500);
      const levels = clampInt(body?.metrics?.levels_cleared, 10);
      const maxLevel = clampInt(body?.metrics?.max_level, 10);
      metrics = { blocks_destroyed: blocks, levels_cleared: levels, max_level: maxLevel };
      amount = neonBreakerCoins(blocks, levels, maxLevel);
    } else if (game === "tower") {
      const placed = clampInt(body?.metrics?.blocks_placed, 200);
      const perfects = clampInt(body?.metrics?.perfects, 200);
      metrics = { blocks_placed: placed, perfects };
      amount = towerCoins(placed, perfects);
    } else {
      const explosions = clampInt(body?.metrics?.explosions, 60);
      metrics = { explosions };
      amount = canicasCoins(explosions);
    }

    if (amount <= 0) {
      return new Response(JSON.stringify({ ok: true, credited: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotencia: una partida (uid+game+session_id) solo se acredita una vez.
    const dupRes = await fetch(
      `${supabaseUrl}/rest/v1/arcade_credit_log?select=id,status,amount&uid=eq.${encodeURIComponent(uid)}&game=eq.${game}&session_id=eq.${encodeURIComponent(sessionId)}`,
      {
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!dupRes.ok) {
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const dupJson = await dupRes.json();
    if (Array.isArray(dupJson) && dupJson.length > 0) {
      const existing = dupJson[0];
      const alreadyCredited = existing?.status === "credited" && typeof existing?.amount === "number";
      return new Response(JSON.stringify({
        ok: true,
        credited: 0,
        duplicate: true,
        firestore_credited: alreadyCredited ? (existing.status === "credited") : false,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tope diario por jugador y juego (hace 24h).
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const capRes = await fetch(
      `${supabaseUrl}/rest/v1/rpc/arcade_daily_total`,
      {
        method: "POST",
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ p_uid: uid, p_game: game, p_since: dayAgo }),
      },
    );
    if (!capRes.ok) {
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const capJson = await capRes.json();
    const creditedToday = typeof capJson === "number" ? capJson : 0;
    if (creditedToday >= DAILY_CAP_PER_GAME) {
      return new Response(JSON.stringify({ ok: true, credited: 0, capped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    amount = Math.min(amount, DAILY_CAP_PER_GAME - creditedToday);

    // Si Firebase Admin esta disponible, hace el abono atómico en Firestore:
    // registro idempotente + incremento de saldo en una transaccion.
    let firestoreCredited = false;
    if (adminAvailable && firestore) {
      try {
        const userRef = firestore.doc(`usuarios/${uid}`);
        const logRef = firestore.collection("arcade_credit_log_firestore").doc(`${uid}_${game}_${sessionId}`);
        await firestore.runTransaction(async (tx: any) => {
          const logSnap = await tx.get(logRef);
          if (logSnap.exists) return;
          const userSnap = await tx.get(userRef);
          if (!userSnap.exists) throw new Error("user_not_found");
          const currentCoins = userSnap.data()?.coins ?? 0;
          tx.update(userRef, {
            coins: currentCoins + amount,
            coins_from_gameplay: (userSnap.data()?.coins_from_gameplay ?? 0) + amount,
            lastActive: new Date(),
          });
          tx.set(logRef, {
            uid,
            game,
            session_id: sessionId,
            amount,
            metrics,
            created_at: new Date(),
          });
        });
        firestoreCredited = true;
      } catch {
        firestoreCredited = false;
      }
    }

    // Escribe el registro idempotente en Supabase (ledger + conciliacion).
    const logRes = await fetch(`${supabaseUrl}/rest/v1/arcade_credit_log`, {
      method: "POST",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        uid,
        game,
        session_id: sessionId,
        metrics,
        amount,
        status: firestoreCredited ? "credited" : "pending_firestore",
      }),
    });
    if (!logRes.ok) {
      // Colision de indice unico = reintento de la misma partida: no acredita doble.
      if (logRes.status === 409) {
        return new Response(JSON.stringify({ ok: true, credited: 0, duplicate: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      credited: amount,
      firestore_credited: firestoreCredited,
    }), {
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
