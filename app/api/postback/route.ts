import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid') || searchParams.get('subid');
    const payoutStr = searchParams.get('payout') || searchParams.get('amount');
    
    const payout = payoutStr ? parseFloat(payoutStr) : 0;

    if (!uid) {
      return NextResponse.json({ error: 'Falta el ID del usuario (uid)' }, { status: 400 });
    }

    // $1.00 dólar = 700 monedas (coincide con tu configuración del Offerwall)
    const coinsToAdd = Math.floor(payout * 700);

    if (coinsToAdd <= 0) {
      return NextResponse.json({ message: 'Payout muy bajo para sumar monedas' }, { status: 200 });
    }

    // Referencia al documento del usuario en la colección "usuarios"
    const userRef = doc(db, 'usuarios', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'Usuario no encontrado en Firebase' }, { status: 404 });
    }

    // Obtenemos las monedas actuales del campo "coins" y sumamos las nuevas
    const currentCoins = userSnap.data().coins || 0;
    const newCoins = currentCoins + coinsToAdd;

    // Actualizamos el campo "coins" en el documento del usuario
    await updateDoc(userRef, {
      coins: newCoins
    });

    return NextResponse.json({ success: true, added: coinsToAdd, total: newCoins }, { status: 200 });
  } catch (error) {
    console.error('Error en postback de CPAlead:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
