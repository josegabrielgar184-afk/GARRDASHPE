'use client';

import { isProduction } from '@/lib/ad-security';

// Política de "continuar partida con anuncio recompensado" en Arcade Hub.
//
// Las monedas de GarrDash se pueden canjear por diamantes de Free Fire, asi que
// permitir que un anuncio incremente la obtencion de premios canjeables puede
// violar las politicas de AdMob y Google Play. Mientras no se confirme la
// compatibilidad, la continuacion queda deshabilitada en produccion. En
// desarrollo/navegador sigue activa para poder probarla.
export function isRewardedContinueEnabled(): boolean {
  return !isProduction();
}

// Maximo UNA continuation por partida; el juego lleva la cuenta y llama a estas
// funciones desde su estado (no aqui) para evitar duplicados.
export const CONTINUE_LABEL = 'Ver anuncio para continuar';
export const END_LABEL = 'Terminar partida';
