-- Encuestas del admin: una activa a la vez, un voto por jugador
CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options jsonb NOT NULL,        -- array de strings (2-5 respuestas)
  votes jsonb NOT NULL DEFAULT '[]',  -- array de {uid, option_index, voted_at}
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

-- Tabla de votos individuales para evitar doble voto via unique constraint
CREATE TABLE IF NOT EXISTS poll_votes (
  poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  uid text NOT NULL,
  option_index int NOT NULL,
  voted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (poll_id, uid)
);

ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Los jugadores (anon+authenticated) pueden ver encuestas activas y votar
CREATE POLICY "select_active_polls" ON polls FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- Solo admin puede insertar/actualizar/eliminar encuestas (vía service role desde edge function)
-- Pero el cliente admin usa el service role key via admin-ops edge function
-- Los jugadores NO pueden modificar encuestas directamente
CREATE POLICY "no_player_insert_polls" ON polls FOR INSERT
  TO anon, authenticated WITH CHECK (false);
CREATE POLICY "no_player_update_polls" ON polls FOR UPDATE
  TO anon, authenticated USING (false);
CREATE POLICY "no_player_delete_polls" ON polls FOR DELETE
  TO anon, authenticated USING (false);

-- Votos: un jugador autenticado puede insertar su propio voto
CREATE POLICY "insert_own_vote" ON poll_votes FOR INSERT
  TO authenticated WITH CHECK (true);

-- Puede ver sus propios votos
CREATE POLICY "select_own_votes" ON poll_votes FOR SELECT
  TO authenticated USING (true);

-- No puede modificar ni eliminar votos
CREATE POLICY "no_update_votes" ON poll_votes FOR UPDATE
  TO authenticated USING (false);
CREATE POLICY "no_delete_votes" ON poll_votes FOR DELETE
  TO authenticated USING (false);

-- Indice para busqueda rapida de encuesta activa
CREATE INDEX IF NOT EXISTS idx_polls_active ON polls(is_active) WHERE is_active = true;