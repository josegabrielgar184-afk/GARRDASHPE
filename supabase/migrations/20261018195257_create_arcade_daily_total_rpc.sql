/*
# Create arcade_daily_total RPC (tope diario de recompensas de arcade)

1. New Functions
- `arcade_daily_total(p_uid, p_game, p_since)` — suma las monedas ya acreditadas
  a un jugador para un juego desde una fecha dada (ventana de 24h).
  La usa la Edge Function arcade-credit para aplicar el tope diario anti-abuso.
2. Security
- Sin SECURITY DEFINER: la ejecuta el service role (que ya ignora RLS).
- EXECUTE revocado a PUBLIC/anon/authenticated: solo service_role puede llamarla.
3. Important Notes
- Funcion de lectura pura: no modifica datos ni saldos.
*/
CREATE OR REPLACE FUNCTION arcade_daily_total(p_uid text, p_game text, p_since timestamptz)
RETURNS integer
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(SUM(amount), 0)::integer
  FROM arcade_credit_log
  WHERE uid = p_uid AND game = p_game AND created_at >= p_since;
$$;

REVOKE ALL ON FUNCTION arcade_daily_total(text, text, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION arcade_daily_total(text, text, timestamptz) TO service_role;
