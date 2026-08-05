import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db, app } from "././firebase"; // Aquí usamos tu configuración original intacta

// Inicializamos Auth utilizando la app real y correcta de tu proyecto
export const auth = getAuth(app);

export async function verificarYCrearUsuario(user: any) {
  if (!user) return;
  const userRef = doc(db, "usuarios", user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || "",
      nombre: user.displayName || "Nuevo Jugador",
      edad: 0,
      nacionalidad: "Perú",
      rol: "jugador",
      coins: 200,
      diamantes: 0,
      puntos: 0,
      bestScore: 0,
      bestScoreApocalipsis: 0,
      campaignLevel: 1,
      campaignKeys: 0,
      campaignStars: {},
      towerLevels: {
        drone: 1,
        medic: 1,
        turret: 1
      },
      totalRuns: 0,
      totalCoinsFromRuns: 0,
      tiempo_jugado_min: 0,
      es_vip: false,
      estado_canje: "ninguno",
      welcomeBonusClaimed: false,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });
  }
}
