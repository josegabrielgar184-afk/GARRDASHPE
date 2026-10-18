/*
# Create arcade_credit_log ledger (recompensas de Arcade Hub)

1. New Tables
- `arcade_credit_log` — registro idempotente de recompensas de monedas por progreso
  en los minijuegos del Arcade Hub, aprobadas por el servidor (Edge Function).
  - `id` (uuid, primary key)
  - `uid` (text, Firebase UID del jugador)
  - `game` (text: 'neonbreaker' | 'tower' | 'canicas')
  - `session_id` (text, identificador unico generado por partida en el cliente)
  - `metrics` (jsonb, metricas de progreso reportadas: bloques, niveles, perfectos, explosiones)
  - `amount` (integer, monedas calculadas por el servidor a partir de las formulas de balance)
  - `status` (text, default 'credited')
  - `created_at` (timestamptz)
2. Security
- RLS habilitada SIN politicas: niega todo acceso a clientes anon/authenticated.
  Solo el service role (usado por la Edge Function) puede leer y escribir.
3. Important Notes
- Restriccion UNIQUE (uid, game, session_id): una misma partida no puede acreditarse dos veces.
- Tabla nueva y vacia: no modifica saldos, canjes, llaves ni datos existentes.
- El tope diario se calcula consultando esta tabla (sum de amount en 24h).
*/
CREATE TABLE IF NOT EXISTS arcade_credit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid text NOT NULL,
  game text NOT NULL,
  session_id text NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'credited',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE arcade_credit_log ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_arcade_credit_unique_session
ON arcade_credit_log(uid, game, session_id);

CREATE INDEX IF NOT EXISTS idx_arcade_credit_uid_time
ON arcade_credit_log(uid, created_at);
