import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// UID del administrador permanente (custom claim admin: true verificado en el
// token de Firebase). No se valida por correo ni por campo de Firestore.
const ADMIN_CLAIM = "admin";

// Cooldown entre autorizaciones nuevas (7 dias en ms).
const AUTHORIZATION_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

// --- Firebase Admin SDK ---
let firebaseApp: any = null;
let firestore: any = null;
let authAdmin: any = null;
let adminAvailable = false;

try {
  const saJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
  if (saJson) {
    const creds = JSON.parse(saJson);
    const admin = await import("npm:firebase-admin@12.7.0");
    firebaseApp = admin.initializeApp(
      { credential: admin.credential.cert(creds) },
      "admin-ops"
    );
    firestore = admin.getFirestore(firebaseApp);
    authAdmin = admin.getAuth(firebaseApp);
    adminAvailable = true;
  }
} catch {
  adminAvailable = false;
}

// Valida el token de Firebase del solicitante y devuelve { uid, claims }.
async function verifyToken(token: string): Promise<{ uid: string; claims: Record<string, unknown> } | null> {
  try {
    const res = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCUk2GWPm_AcBOFvzCpw1K5E-P5FdfeBho",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const uid: string | undefined = json?.users?.[0]?.localId;
    if (!uid) return null;
    const claims = (json?.users?.[0]?.customAttributes
      ? JSON.parse(json.users[0].customAttributes)
      : {}) as Record<string, unknown>;
    return { uid, claims };
  } catch {
    return null;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  if (!adminAvailable || !authAdmin || !firestore) {
    return json({ error: "Backend admin SDK no disponible" }, 503);
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const caller = await verifyToken(token);
    if (!caller) return json({ error: "Unauthorized" }, 401);
    if (caller.claims[ADMIN_CLAIM] !== true) {
      return json({ error: "Forbidden: se requiere custom claim admin" }, 403);
    }

    const body = await req.json();
    const action: string = typeof body?.action === "string" ? body.action : "";

    switch (action) {
      case "resolve_email": {
        const email: string = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
        if (!email || !email.includes("@")) return json({ error: "Correo inválido" }, 400);
        try {
          const userRec = await authAdmin.getUserByEmail(email);
          if (!userRec) return json({ error: "Correo no encontrado" }, 404);
          return json({ ok: true, uid: userRec.uid, email: userRec.email });
        } catch {
          return json({ error: "Correo no encontrado en Firebase Auth" }, 404);
        }
      }

      case "authorize_test": {
        const email: string = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
        if (!email) return json({ error: "Correo requerido" }, 400);

        // Verifica cooldown en el log de auditoría.
        const cooldownSnap = await firestore
          .collection("security_audit_log")
          .where("action", "==", "authorize_test")
          .where("adminUid", "==", caller.uid)
          .orderBy("timestamp", "desc")
          .limit(1)
          .get();
        if (!cooldownSnap.empty) {
          const lastTs = cooldownSnap.docs[0].data()?.timestamp;
          if (lastTs) {
            const lastMs: number = typeof (lastTs as any).toMillis === "function"
              ? (lastTs as any).toMillis()
              : (typeof lastTs === "number" ? lastTs : 0);
            if (Date.now() - lastMs < AUTHORIZATION_COOLDOWN_MS) {
              return json({ error: "Solo se permite una autorización cada 7 días" }, 429);
            }
          }
        }

        // Resolver correo a UID.
        let targetUid: string;
        try {
          const userRec = await authAdmin.getUserByEmail(email);
          targetUid = userRec.uid;
        } catch {
          return json({ error: "Correo no encontrado en Firebase Auth" }, 404);
        }

        // No permitir autorizar a otro admin.
        try {
          const existingClaims = (await authAdmin.getUser(targetUid)).customClaims || {};
          if (existingClaims.admin === true) {
            return json({ error: "No se puede autorizar a un administrador como cuenta de pruebas" }, 400);
          }
        } catch {}

        // Asignar custom claim { testAccount: true }.
        await authAdmin.setCustomUserClaims(targetUid, { testAccount: true });

        // Asegurar saldo de prueba separado.
        const userRef = firestore.doc(`usuarios/${targetUid}`);
        const userSnap = await userRef.get();
        if (userSnap.exists) {
          const data = userSnap.data() || {};
          if (data.testCoins === undefined) {
            await userRef.update({ testCoins: 0, testAccount: true, testAuthorizedAt: new Date() });
          } else {
            await userRef.update({ testAccount: true, testAuthorizedAt: new Date() });
          }
        }

        // Log de auditoría inmutable (solo create desde el backend).
        await firestore.collection("security_audit_log").add({
          adminUid: caller.uid,
          targetUid,
          email,
          action: "authorize_test",
          coinsDelta: 0,
          timestamp: new Date(),
        });

        return json({ ok: true, uid: targetUid, message: "Cuenta autorizada como pruebas" });
      }

      case "revoke_test": {
        const uid: string = typeof body?.uid === "string" ? body.uid.trim() : "";
        if (!uid) return json({ error: "UID requerido" }, 400);

        try {
          const claims = (await authAdmin.getUser(uid)).customClaims || {};
          if (claims.admin === true) {
            return json({ error: "No se puede revocar un administrador" }, 400);
          }
        } catch {
          return json({ error: "UID no encontrado" }, 404);
        }

        // Quitar claim.
        await authAdmin.setCustomUserClaims(uid, { testAccount: false });

        // Resetear monedas de prueba a 0 (no toca coins legítimas).
        const userRef = firestore.doc(`usuarios/${uid}`);
        await userRef.update({ testCoins: 0, testAccount: false, testRevokedAt: new Date() });

        await firestore.collection("security_audit_log").add({
          adminUid: caller.uid,
          targetUid: uid,
          email: null,
          action: "revoke_test",
          coinsDelta: 0,
          timestamp: new Date(),
        });

        return json({ ok: true, message: "Autorización revocada, monedas de prueba eliminadas" });
      }

      case "add_test_coins": {
        const uid: string = typeof body?.uid === "string" ? body.uid.trim() : "";
        const amount: number = typeof body?.amount === "number" ? Math.floor(body.amount) : 0;
        if (!uid || amount === 0) return json({ error: "UID y monto requeridos" }, 400);
        if (amount > 1000000 || amount < -1000000) return json({ error: "Monto fuera de rango" }, 400);

        // Verificar que el destino sigue siendo cuenta de prueba.
        try {
          const claims = (await authAdmin.getUser(uid)).customClaims || {};
          if (claims.testAccount !== true) {
            return json({ error: "La cuenta no está autorizada como pruebas" }, 403);
          }
        } catch {
          return json({ error: "UID no encontrado" }, 404);
        }

        const userRef = firestore.doc(`usuarios/${uid}`);
        const userSnap = await userRef.get();
        if (!userSnap.exists) return json({ error: "Usuario no existe" }, 404);
        const current = userSnap.data()?.testCoins ?? 0;
        const next = Math.max(0, current + amount);
        if (amount > 0) {
          await userRef.update({ testCoins: next });
        } else {
          // Retiro: no puede dejar el saldo negativo.
          await userRef.update({ testCoins: next });
        }

        await firestore.collection("security_audit_log").add({
          adminUid: caller.uid,
          targetUid: uid,
          email: null,
          action: amount > 0 ? "add_test_coins" : "remove_test_coins",
          coinsDelta: amount,
          timestamp: new Date(),
        });

        return json({ ok: true, newBalance: next });
      }

      case "simulate_canje": {
        // Simula el flujo completo de canje sin tocar producción.
        const uid: string = typeof body?.uid === "string" ? body.uid.trim() : "";
        const rewardId: string = typeof body?.rewardId === "string" ? body.rewardId : "";
        const playerID: string = typeof body?.playerID === "string" ? body.playerID : "";
        const nickname: string = typeof body?.nickname === "string" ? body.nickname : "";
        if (!uid || !rewardId) return json({ error: "Faltan datos" }, 400);

        try {
          const claims = (await authAdmin.getUser(uid)).customClaims || {};
          if (claims.testAccount !== true) {
            return json({ error: "Solo cuentas de prueba pueden simular canjes" }, 403);
          }
        } catch {
          return json({ error: "UID no encontrado" }, 404);
        }

        // Crea una solicitud en la colección simulada (no afecta producción).
        const simRef = await firestore.collection("canjes_simulados").add({
          userId: uid,
          nickname,
          playerID,
          selectedReward: rewardId,
          status: "pending_review",
          createdAt: new Date(),
          simulation: true,
        });

        await firestore.collection("security_audit_log").add({
          adminUid: caller.uid,
          targetUid: uid,
          email: null,
          action: "simulate_canje_created",
          coinsDelta: 0,
          metadata: { rewardId, simCanjeId: simRef.id },
          timestamp: new Date(),
        });

        return json({ ok: true, simCanjeId: simRef.id });
      }

      case "list_audit_log": {
        const limitN = Math.min(100, Math.max(10, typeof body?.limit === "number" ? body.limit : 50));
        const snap = await firestore
          .collection("security_audit_log")
          .orderBy("timestamp", "desc")
          .limit(limitN)
          .get();
        const entries = snap.docs.map((d: any) => {
          const data = d.data();
          return {
            id: d.id,
            adminUid: data.adminUid,
            targetUid: data.targetUid,
            email: data.email,
            action: data.action,
            coinsDelta: data.coinsDelta ?? 0,
            metadata: data.metadata ?? null,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : null,
          };
        });
        return json({ ok: true, entries });
      }

      case "set_admin_claim": {
        // Auto-promoción: el primer admin se asigna manualmente vía Firebase
        // console. Esta acción permite a un admin existente promover a otro.
        const uid: string = typeof body?.uid === "string" ? body.uid.trim() : "";
        if (!uid) return json({ error: "UID requerido" }, 400);
        await authAdmin.setCustomUserClaims(uid, { admin: true });
        await firestore.collection("security_audit_log").add({
          adminUid: caller.uid,
          targetUid: uid,
          email: null,
          action: "set_admin_claim",
          coinsDelta: 0,
          timestamp: new Date(),
        });
        return json({ ok: true, message: "Custom claim admin asignado" });
      }

      case "check_claims": {
        // Permite al cliente verificar si el token actual tiene claims admin/testAccount.
        return json({
          ok: true,
          uid: caller.uid,
          admin: caller.claims[ADMIN_CLAIM] === true,
          testAccount: caller.claims.testAccount === true,
        });
      }

      default:
        return json({ error: "Acción desconocida" }, 400);
    }
  } catch (err) {
    return json({ error: "Internal error", detail: String(err) }, 500);
  }
});
