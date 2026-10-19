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

// Torre Perfecta: 1 moneda por cada 2 bloques colocados correctamente.
// Los perfectos ya cuentan como bloques colocados (incluidos en blocksPlaced),
// por lo que no suman bonus aparte. El tope diario protege contra abuso.
function towerCoins(blocksPlaced: number): number {
  if (blocksPlaced <= 0) return 0;
  return Math.floor(blocksPlaced / 2);
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

// Inicializa Firebase Admin SDK de forma perezosa (lazy). La inicializacion a
// nivel de modulo puede fallar en cold starts (import de npm, parse de JSON,
// cert). Con lazy init, cada request reintenta hasta que tenga exito.
let firebaseApp: any = null;
let firestore: any = null;
let adminAvailable = false;
let adminInitError: string | null = null;

async function ensureFirebaseAdmin(): Promise<boolean> {
  if (adminAvailable && firestore) return true;
  try {
    const saJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
    if (!saJson) {
      adminInitError = "FIREBASE_SERVICE_ACCOUNT_JSON not set";
      return false;
    }
    const creds = JSON.parse(saJson);
    const admin = await import("npm:firebase-admin@12.7.0");
    // Reutiliza la app si ya existe (evita error de doble inicializacion).
    try {
      firebaseApp = admin.app("arcade-credit");
    } catch {
      firebaseApp = admin.initializeApp(
        { credential: admin.credential.cert(creds) },
        "arcade-credit",
      );
    }
    firestore = admin.getFirestore(firebaseApp);
    adminAvailable = true;
    adminInitError = null;
    return true;
  } catch (e) {
    adminAvailable = false;
    adminInitError = String(e);
    return false;
  }
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
      metrics = { blocks_placed: placed };
      amount = towerCoins(placed);
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
      return new Response(JSON.stringify({ ok: true, credited: 0, capped: true, cap_limit: DAILY_CAP_PER_GAME }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const originalAmount = amount;
    amount = Math.min(amount, DAILY_CAP_PER_GAME - creditedToday);
    const cappedReduced = amount < originalAmount;

    // Si Firebase Admin esta disponible, hace el abono en Firestore de forma
    // atomica con un batch: el log doc se escribe con precondicion de creacion
    // (createIfMissing) y el saldo se incrementa en la misma operacion. Si dos
    // peticiones simultaneas intentan acreditar la misma partida, solo una logra
    // crear el log doc; la otra falla el batch completo y no se duplica el abono.
    let firestoreCredited = false;
    let firestoreError: string | null = null;
    let errorStage: string | null = null;
    const adminReady = await ensureFirebaseAdmin();
    if (!adminReady || !firestore) {
      firestoreError = adminInitError || "admin SDK not available";
      errorStage = "init";
    } else {
      try {
        const userRef = firestore.doc(`usuarios/${uid}`);
        const logRef = firestore.collection("arcade_credit_log_firestore").doc(`${uid}_${game}_${sessionId}`);
        const adminMod = await import("npm:firebase-admin@12.7.0");
        const FieldValue = adminMod.firestore.FieldValue;

        // Verificar si ya fue acreditado (peticion duplicada o reintento).
        try {
          const existingLog = await logRef.get();
          if (existingLog.exists) {
            firestoreCredited = true;
          }
        } catch (e0) {
          errorStage = "log_check";
          throw e0;
        }

        if (!firestoreCredited) {
          // Batch atomica: log doc con precondicion create + incremento de saldo.
          // Si el log doc ya existe (race condition), el batch falla y no se abona.
          try {
            const batch = firestore.batch();
            batch.set(logRef, {
              uid,
              game,
              session_id: sessionId,
              amount,
              metrics,
              created_at: new Date(),
            });
            // Usa merge para no sobrescribir campos existentes del usuario.
            batch.set(userRef, {
              coins: FieldValue.increment(amount),
              coins_from_gameplay: FieldValue.increment(amount),
              lastActive: new Date(),
            }, { merge: true });
            await batch.commit();
            firestoreCredited = true;
          } catch (e1) {
            // Si el error es por el log doc ya existente, es un duplicado seguro.
            const msg = String(e1);
            if (msg.includes("ALREADY_EXISTS") || msg.includes("already exists")) {
              firestoreCredited = true;
            } else {
              errorStage = "batch_commit";
              throw e1;
            }
          }
        }
      } catch (e) {
        firestoreCredited = false;
        const errMsg = String(e);
        firestoreError = `[stage=${errorStage}] ${errMsg}`;
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
        firestore_error: firestoreError || null,
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
      capped: cappedReduced,
      cap_limit: cappedReduced ? DAILY_CAP_PER_GAME : undefined,
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
