'use client';

import { db } from '@/lib/firebase';
import {
  doc, updateDoc, setDoc, increment, serverTimestamp, collection, addDoc,
  query, where, getDocs, limit, getDoc,
} from 'firebase/firestore';
import { RETURN_REWARD_COINS, RETURN_REWARD_THRESHOLD_DAYS } from '@/lib/config';

let lastPresenceUpdate = 0;
let lastPresenceScreen = '';
const PRESENCE_THROTTLE_MS = 3 * 60 * 1000;

export interface FinalizarPartidaParams {
  userId: string;
  monedas: number;
  puntos: number;
  modoJuego: string;
  nivel?: number;
  tiempoJugadoSeg?: number;
}

export async function finalizarPartida(params: FinalizarPartidaParams): Promise<{ ok: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'usuarios', params.userId);

    await updateDoc(userRef, {
      coins: increment(params.monedas),
      puntos: increment(params.puntos),
      lastActive: serverTimestamp(),
      ...(params.tiempoJugadoSeg ? { tiempo_jugado_min: increment(Math.round(params.tiempoJugadoSeg / 60)) } : {}),
    });

    await addDoc(collection(db, 'scores_survival'), {
      userId: params.userId,
      score: params.puntos,
      coins: params.monedas,
      mode: params.modoJuego,
      level: params.nivel ?? 1,
      createdAt: serverTimestamp(),
    });

    const weeklyRef = doc(db, 'scores_weekly', params.userId);
    const weeklySnap = await getDoc(weeklyRef);
    if (!weeklySnap.exists() || (weeklySnap.data()?.bestScore ?? 0) < params.puntos) {
      await setDoc(weeklyRef, {
        userId: params.userId,
        bestScore: params.puntos,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al finalizar partida';
    return { ok: false, error: msg };
  }
}

export async function actualizarPresencia(userId: string, pantallaActual: string): Promise<void> {
  const now = Date.now();
  if (pantallaActual === lastPresenceScreen && now - lastPresenceUpdate < PRESENCE_THROTTLE_MS) return;
  if (now - lastPresenceUpdate < 5000) return;

  lastPresenceUpdate = now;
  lastPresenceScreen = pantallaActual;

  try {
    await updateDoc(doc(db, 'usuarios', userId), {
      lastActive: serverTimestamp(),
      pantalla_actual: pantallaActual,
    });
  } catch {}
}

export async function verificarBonoRetorno(userId: string): Promise<{ awarded: boolean; coins: number }> {
  try {
    const userRef = doc(db, 'usuarios', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { awarded: false, coins: 0 };

    const data = snap.data();
    if (data.returnRewardClaimed) return { awarded: false, coins: 0 };

    const lastLogin = data.lastLogin ?? data.lastActive;
    if (!lastLogin) return { awarded: false, coins: 0 };

    const lastLoginDate = lastLogin.toDate ? lastLogin.toDate() : new Date(lastLogin);
    const daysSince = (Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSince >= RETURN_REWARD_THRESHOLD_DAYS) {
      await updateDoc(userRef, {
        coins: increment(RETURN_REWARD_COINS),
        returnRewardClaimed: true,
        lastLogin: serverTimestamp(),
      });
      return { awarded: true, coins: RETURN_REWARD_COINS };
    }

    return { awarded: false, coins: 0 };
  } catch {
    return { awarded: false, coins: 0 };
  }
}

export async function fetchInactiveUsers(): Promise<Array<{ uid: string; nombre: string; lastActive: Date | null }>> {
  try {
    const threshold = new Date(Date.now() - RETURN_REWARD_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);
    const q = query(collection(db, 'usuarios'), where('lastActive', '<', threshold), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      uid: d.id,
      nombre: (d.data().nombre ?? d.data().nickname ?? 'Usuario') as string,
      lastActive: d.data().lastActive?.toDate ? d.data().lastActive.toDate() : null,
    }));
  } catch {
    return [];
  }
}

export async function fetchActiveUsersNow(): Promise<Array<{ uid: string; nombre: string; pantalla: string }>> {
  try {
    const threshold = new Date(Date.now() - 10 * 60 * 1000);
    const q = query(collection(db, 'usuarios'), where('lastActive', '>', threshold), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      uid: d.id,
      nombre: (d.data().nombre ?? d.data().nickname ?? 'Usuario') as string,
      pantalla: (d.data().pantalla_actual ?? 'unknown') as string,
    }));
  } catch {
    return [];
  }
}

export async function fetchSuggestions(): Promise<Array<{
  id: string; text: string; userId: string; nombre: string; createdAt: Date | null; atendida: boolean;
}>> {
  try {
    const snap = await getDocs(collection(db, 'sugerencias'));
    
    const docs = snap.docs.map((d) => {
      const data = d.data();
      const isAttended = data.atendida === true || data.estado === 'atendida' || data.estado === 'descartada';
      return {
        id: d.id,
        text: (data.text || data.mensaje || data.texto || '') as string,
        userId: (data.userId || '') as string,
        nombre: (data.nombre || data.nickname || 'Usuario') as string,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
        atendida: isAttended,
      };
    });

    return docs
      .filter((item) => !item.atendida)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, 50);
  } catch (err) {
    console.error('Error al cargar sugerencias:', err);
    return [];
  }
}

export async function handleSuggestion(suggestionId: string, action: 'coherent' | 'simple' | 'discard', userId?: string): Promise<{ ok: boolean }> {
  try {
    const sugRef = doc(db, 'sugerencias', suggestionId);

    if (action === 'coherent' && userId) {
      // 1. Sumar 100 monedas al usuario
      await updateDoc(doc(db, 'usuarios', userId), { coins: increment(100) });
      await updateDoc(sugRef, { atendida: true, estado: 'atendida', attendedAt: serverTimestamp(), rewardGiven: 100 });

      // 2. Enviar notificación al usuario
      await addDoc(collection(db, 'notifications'), {
        userId: userId,
        title: '🎯 ¡Sugerencia Aprobada!',
        body: 'Tu sugerencia fue calificada como coherente. ¡Has recibido 100 monedas de regalo!',
        type: 'suggestion_reward',
        createdAt: serverTimestamp(),
        read: false,
      });

    } else if (action === 'simple' && userId) {
      // 1. Sumar 5 monedas al usuario
      await updateDoc(doc(db, 'usuarios', userId), { coins: increment(5) });
      await updateDoc(sugRef, { atendida: true, estado: 'atendida', attendedAt: serverTimestamp(), rewardGiven: 5 });

      // 2. Enviar notificación al usuario
      await addDoc(collection(db, 'notifications'), {
        userId: userId,
        title: '💬 ¡Sugerencia Recibida!',
        body: 'Gracias por colaborar con el juego. Has recibido 5 monedas de regalo.',
        type: 'suggestion_reward',
        createdAt: serverTimestamp(),
        read: false,
      });

    } else {
      await updateDoc(sugRef, { atendida: true, estado: 'descartada', attendedAt: serverTimestamp() });
    }

    return { ok: true };
  } catch (err) {
    console.error('Error procesando sugerencia:', err);
    return { ok: false };
  }
}

export async function sendWinBackPush(inactiveUsers: Array<{ uid: string }>): Promise<{ ok: boolean; count: number }> {
  try {
    for (const user of inactiveUsers) {
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: '¡Te extrañan en GarrDash!',
        body: 'Entra hoy y reclama tu bono de 300 monedas',
        type: 'winback',
        createdAt: serverTimestamp(),
        read: false,
      });
    }
    return { ok: true, count: inactiveUsers.length };
  } catch {
    return { ok: false, count: 0 };
  }
}

export async function sendPromoPush(title: string, body: string, duration: string): Promise<{ ok: boolean }> {
  try {
    await addDoc(collection(db, 'notifications'), {
      title,
      body,
      type: 'promo',
      duration,
      createdAt: serverTimestamp(),
      broadcast: true,
      read: false,
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
