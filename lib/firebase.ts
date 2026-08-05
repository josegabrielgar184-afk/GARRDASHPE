import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function verificarYCrearUsuario(user: any) {
  if (!user) return;
  const userRef = doc(db, "usuarios", user.uid);
  const docSnap = await getDoc(userRef);

  // Si el usuario es nuevo y no existe en Firestore, se le crea su perfil limpio con toda la estructura
  if (!docSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || "",
      nombre: user.displayName || "Nuevo Jugador",
      edad: 0, // O pedirselo en un registro
      nacionalidad: "Perú",
      rol: "jugador",
      coins: 200, // Tus monedas iniciales de bienvenida
      diamantes: 0,
      puntos: 0,
      bestScore: 0,
      bestScoreApocalipsis: 0,
      campaignLevel: 1, // Empieza desde el nivel 1
      campaignKeys: 0,
      campaignStars: {}, // Vacío para que las vaya ganando
      towerLevels: {
        drone: 1, // Torres base en nivel inicial
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
