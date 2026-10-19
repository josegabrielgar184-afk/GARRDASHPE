/*
# Create monthly ranking system (TOP MENSUAL seguro)

1. New Tables
- `monthly_matches` — registro idempotente de cada partida acreditada para el
  ranking mensual. Una fila por partida validada por el servidor (Edge Function).
  El cliente envia metricas de progreso + session_id; el servidor decide los
  puntos. Restriccion UNIQUE (uid, month_key, mode, session_id) evita duplicados.
- `monthly_totals` — total acumulado por jugador y mes. Lo mantiene la RPC
  monthly_credit_atomic de forma transaccional. Permite leer el TOP sin sumar
  miles de partidas en cada lectura.
- `monthly_champions` — historial de campeones de meses cerrados. Lo escribe un
  cron/Edge Function al cambiar de mes; no se toca en la acreditacion.
2. Security
- RLS habilitada SIN politicas en monthly_matches y monthly_champions: niega
  todo acceso a clientes anon/authenticated. Solo el service role (Edge Function)
  puede leer y escribir.
- monthly_totals: RLS habilitada con politica de lectura para anon/authenticated
  (el cliente necesita ver el ranking) y sin politicas de escritura (solo el
  service role escribe via RPC SECURITY DEFINER).
3. Important Notes
- Tablas nuevas y vacias: no modifica saldos, canjes, llaves, scores_weekly,
  usuarios ni ningun dato existente.
- La acreditacion es transaccional via monthly_credit_atomic (SECURITY DEFINER):
  inserta la partida y suma al total en una sola transaccion.
*/

CREATE TABLE IF NOT EXISTS monthly_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid text NOT NULL,
  month_key text NOT NULL,
  mode text NOT NULL,
  session_id text NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_score integer NOT NULL DEFAULT 0,
  points integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE monthly_matches ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_matches_unique
ON monthly_matches(uid, month_key, mode, session_id);

CREATE INDEX IF NOT EXISTS idx_monthly_matches_uid_time
ON monthly_matches(uid, created_at);

CREATE INDEX IF NOT EXISTS idx_monthly_matches_month
ON monthly_matches(month_key, created_at);

CREATE TABLE IF NOT EXISTS monthly_totals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid text NOT NULL,
  month_key text NOT NULL,
  total_points integer NOT NULL DEFAULT 0,
  matches_count integer NOT NULL DEFAULT 0,
  last_played timestamptz DEFAULT now(),
  player_name text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE monthly_totals ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_totals_uid_month
ON monthly_totals(uid, month_key);

CREATE INDEX IF NOT EXISTS idx_monthly_totals_month_points
ON monthly_totals(month_key, total_points DESC);

CREATE TABLE IF NOT EXISTS monthly_champions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_key text NOT NULL UNIQUE,
  uid text NOT NULL,
  player_name text NOT NULL,
  total_points integer NOT NULL,
  matches_count integer NOT NULL DEFAULT 0,
  closed_at timestamptz DEFAULT now()
);

ALTER TABLE monthly_champions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_monthly_champions_month
ON monthly_champions(month_key DESC);

-- Politica de lectura publica de monthly_totals (el ranking es publico).
CREATE POLICY "read_monthly_totals" ON monthly_totals FOR SELECT
  TO anon, authenticated USING (true);

-- Politica de lectura publica del historial de campeones.
CREATE POLICY "read_monthly_champions" ON monthly_champions FOR SELECT
  TO anon, authenticated USING (true);

/*
# Acreditacion atomica: inserta una partida y suma al total mensual.
# SECURITY DEFINER: ejecuta como service_role (ignora RLS) para escribir
# monthly_totals. El service role (Edge Function) la invoca.
# Devuelve el total actualizado del jugador en ese mes.
*/
CREATE OR REPLACE FUNCTION monthly_credit_atomic(
  p_uid text,
  p_month_key text,
  p_mode text,
  p_session_id text,
  p_metrics jsonb,
  p_raw_score integer,
  p_points integer,
  p_player_name text
)
RETURNS table(total_points integer, matches_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_id uuid;
  v_total integer;
  v_count integer;
BEGIN
  -- Idempotencia: si la partida ya existe, no acredita doble.
  SELECT id INTO v_existing_id
  FROM monthly_matches
  WHERE uid = p_uid AND month_key = p_month_key AND mode = p_mode AND session_id = p_session_id
  LIMIT 1;
  IF FOUND THEN
    SELECT total_points, matches_count INTO v_total, v_count
    FROM monthly_totals
    WHERE uid = p_uid AND month_key = p_month_key;
    RETURN QUERY SELECT COALESCE(v_total, 0), COALESCE(v_count, 0);
    RETURN;
  END IF;

  -- Inserta la partida.
  INSERT INTO monthly_matches (uid, month_key, mode, session_id, metrics, raw_score, points)
  VALUES (p_uid, p_month_key, p_mode, p_session_id, p_metrics, p_raw_score, p_points);

  -- Upsert atomico del total mensual.
  INSERT INTO monthly_totals (uid, month_key, total_points, matches_count, last_played, player_name, updated_at)
  VALUES (p_uid, p_month_key, p_points, 1, now(), p_player_name, now())
  ON CONFLICT (uid, month_key)
  DO UPDATE SET
    total_points = monthly_totals.total_points + EXCLUDED.total_points,
    matches_count = monthly_totals.matches_count + 1,
    last_played = now(),
    player_name = EXCLUDED.player_name,
    updated_at = now();

  SELECT total_points, matches_count INTO v_total, v_count
  FROM monthly_totals
  WHERE uid = p_uid AND month_key = p_month_key;

  RETURN QUERY SELECT COALESCE(v_total, 0), COALESCE(v_count, 0);
END;
$$;

REVOKE ALL ON FUNCTION monthly_credit_atomic(text, text, text, text, jsonb, integer, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION monthly_credit_atomic(text, text, text, text, jsonb, integer, integer, text) TO service_role;

/*
# tope por partida y modo en las ultimas 24h (anti-spam de partidas faciles).
# La usa la Edge Function para limitar cuantas partidas del mismo modo puede
# acreditar un jugador por dia.
*/
CREATE OR REPLACE FUNCTION monthly_matches_since(p_uid text, p_mode text, p_since timestamptz)
RETURNS integer
LANGUAGE sql STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM monthly_matches
  WHERE uid = p_uid AND mode = p_mode AND created_at >= p_since;
$$;

REVOKE ALL ON FUNCTION monthly_matches_since(text, text, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION monthly_matches_since(text, text, timestamptz) TO service_role;
