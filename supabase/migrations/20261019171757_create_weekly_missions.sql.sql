-- Misiones semanales de GarrDash
-- Tabla de progreso por usuario+semana+mission_id (idempotente via PK compuesta)

CREATE TABLE IF NOT EXISTS weekly_mission_progress (
  uid text NOT NULL,
  week_key text NOT NULL,
  mission_id text NOT NULL,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed boolean NOT NULL DEFAULT false,
  claimed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (uid, week_key, mission_id)
);

ALTER TABLE weekly_mission_progress ENABLE ROW LEVEL SECURITY;

-- App con login: solo authenticated. Cada usuario solo ve/edita su progreso.
CREATE POLICY "select_own_missions" ON weekly_mission_progress FOR SELECT
  TO authenticated USING (auth.uid()::text = uid);
CREATE POLICY "insert_own_missions" ON weekly_mission_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = uid);
CREATE POLICY "update_own_missions" ON weekly_mission_progress FOR UPDATE
  TO authenticated USING (auth.uid()::text = uid) WITH CHECK (auth.uid()::text = uid);

-- Indice para consultas rapidas por semana
CREATE INDEX IF NOT EXISTS idx_weekly_mission_week ON weekly_mission_progress (week_key);

-- Tabla de reclamos de misiones (auditoria + anti-doble-reclamo)
CREATE TABLE IF NOT EXISTS weekly_mission_claims (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid text NOT NULL,
  week_key text NOT NULL,
  mission_id text NOT NULL,
  amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (uid, week_key, mission_id)
);

ALTER TABLE weekly_mission_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_claims" ON weekly_mission_claims FOR SELECT
  TO authenticated USING (auth.uid()::text = uid);
CREATE POLICY "insert_own_claims" ON weekly_mission_claims FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = uid);
