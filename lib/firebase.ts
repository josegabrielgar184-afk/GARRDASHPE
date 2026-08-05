import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Intentamos importar la configuración o usamos una inicialización segura
import firebaseConfig from "./config"; // o el archivo donde tengas tus credenciales, pero para asegurarnos:

// Inicialización ultra segura que evita cualquier conflicto de 'No Firebase App'
const app = getApps().length === 0 ? initializeApp({
  // Si tus credenciales están en otro archivo, aquí las aseguramos
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
}) : getApps()[0];

export const db = getFirestore(app);
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
