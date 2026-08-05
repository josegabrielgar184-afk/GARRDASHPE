import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCUk2GWPm_AcBOFvzCpw1K5E-P5FdfeBho",
  authDomain: "garrdash.firebaseapp.com",
  projectId: "garrdash",
  storageBucket: "garrdash.firebasestorage.app",
  messagingSenderId: "913250323167",
  appId: "1:913250323167:web:9a04296cfb1566de51f76a"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

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
      nombre: user.email ? user.email.split('@')[0] : "Player",
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
