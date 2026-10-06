import { NextResponse } from 'next/server';

// OFFERWALL POSTBACK — TEMPORALMENTE DESHABILITADO
//
// Este endpoint recibía callbacks de AdGem/CPAlead que acreditaban monedas
// directamente a un usuario sin autenticación ni verificación de firma.
// Cualquiera con el URL podría haber acreditado monedas arbitrarias.
//
// La acreditación automática está DESHABILITADA hasta que se integre el
// mecanismo de verificación oficial del proveedor (HMAC/signature/IP allowlist).
//
// La estructura se conserva para reactivarla cuando se tenga la documentación
// oficial del proveedor de Offerwall.

export async function GET(request: Request) {
  // No acreditar monedas. Responder 200 para que el proveedor no reintente.
  // Log mínimo para diagnóstico futuro sin exponer datos.
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid') || searchParams.get('subid') || 'unknown';
  console.warn(`[postback] Recibido callback deshabilitado para uid=${uid}. Acreditación OFF.`);
  return NextResponse.json(
    { success: false, message: 'Acreditación temporalmente deshabilitada' },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid') || searchParams.get('subid') || 'unknown';
  console.warn(`[postback] Recibido POST callback deshabilitado para uid=${uid}. Acreditación OFF.`);
  return NextResponse.json(
    { success: false, message: 'Acreditación temporalmente deshabilitada' },
    { status: 200 }
  );
}
