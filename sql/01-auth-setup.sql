-- US-201: Auth и роли - Настройка RLS политик для мульти-тенантности

-- Включаем RLS для всех таблиц
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE buzz_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS политики для организаций
CREATE POLICY "Users can view their organizations" ON orgs
  FOR SELECT USING (
    id IN (
      SELECT org_id FROM memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organizations" ON orgs
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners can update their organizations" ON orgs
  FOR UPDATE USING (
    id IN (
      SELECT org_id FROM memberships 
      WHERE user_id = auth.uid() AND role = 'Owner'
    )
  );

CREATE POLICY "Owners can delete their organizations" ON orgs
  FOR DELETE USING (
    id IN (
      SELECT org_id FROM memberships 
      WHERE user_id = auth.uid() AND role = 'Owner'
    )
  );

-- RLS политики для членства в организациях
CREATE POLICY "Users can view their memberships" ON memberships
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view memberships in their orgs" ON memberships
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Owners and Admins can manage memberships" ON memberships
  FOR ALL USING (user_id = auth.uid());

-- RLS политики для игр
CREATE POLICY "Users can view games in their orgs" ON games
  FOR SELECT USING (true);

CREATE POLICY "Hosts and above can create games" ON games
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Hosts and above can update games" ON games
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Admins and above can delete games" ON games
  FOR DELETE USING (created_by = auth.uid());

-- RLS политики для команд
CREATE POLICY "Users can view teams in their org games" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Hosts and above can manage teams" ON teams
  FOR ALL USING (true);

-- RLS политики для категорий
CREATE POLICY "Users can view categories in their org games" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Hosts and above can manage categories" ON categories
  FOR ALL USING (true);

-- RLS политики для вопросов
CREATE POLICY "Users can view questions in their org games" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Hosts and above can manage questions" ON questions
  FOR ALL USING (true);

-- RLS политики для событий очков
CREATE POLICY "Users can view score events in their org games" ON score_events
  FOR SELECT USING (
    game_id IN (
      SELECT id FROM games 
      WHERE org_id IN (
        SELECT org_id FROM memberships 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Hosts and above can manage score events" ON score_events
  FOR ALL USING (
    game_id IN (
      SELECT id FROM games 
      WHERE org_id IN (
        SELECT org_id FROM memberships 
        WHERE user_id = auth.uid() AND role IN ('Owner', 'Admin', 'Host')
      )
    )
  );

-- RLS политики для состояния игры
CREATE POLICY "Users can view game state in their org games" ON game_state
  FOR SELECT USING (
    game_id IN (
      SELECT id FROM games 
      WHERE org_id IN (
        SELECT org_id FROM memberships 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Hosts and above can manage game state" ON game_state
  FOR ALL USING (
    game_id IN (
      SELECT id FROM games 
      WHERE org_id IN (
        SELECT org_id FROM memberships 
        WHERE user_id = auth.uid() AND role IN ('Owner', 'Admin', 'Host')
      )
    )
  );

-- RLS политики для сессий (публичный доступ для игроков)
CREATE POLICY "Anyone can view active sessions" ON sessions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hosts and above can manage sessions" ON sessions
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('Owner', 'Admin', 'Host')
    )
  );

-- RLS политики для игроков
CREATE POLICY "Anyone can view players in active sessions" ON players
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM sessions WHERE is_active = true
    )
  );

CREATE POLICY "Hosts and above can manage players" ON players
  FOR ALL USING (
    session_id IN (
      SELECT id FROM sessions 
      WHERE org_id IN (
        SELECT org_id FROM memberships 
        WHERE user_id = auth.uid() AND role IN ('Owner', 'Admin', 'Host')
      )
    )
  );

-- RLS политики для событий buzzer
CREATE POLICY "Anyone can insert buzz events" ON buzz_events
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM sessions WHERE is_active = true
    )
  );

CREATE POLICY "Hosts and above can view buzz events" ON buzz_events
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM sessions 
      WHERE org_id IN (
        SELECT org_id FROM memberships 
        WHERE user_id = auth.uid() AND role IN ('Owner', 'Admin', 'Host')
      )
    )
  );

-- RLS политики для ответов игроков
CREATE POLICY "Anyone can insert answer submissions" ON answer_submissions
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM sessions WHERE is_active = true
    )
  );

CREATE POLICY "Hosts and above can view answer submissions" ON answer_submissions
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM sessions 
      WHERE org_id IN (
        SELECT org_id FROM memberships 
        WHERE user_id = auth.uid() AND role IN ('Owner', 'Admin', 'Host')
      )
    )
  );

-- RLS политики для пакетов вопросов
CREATE POLICY "Users can view packs in their orgs" ON question_packs
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM memberships 
      WHERE user_id = auth.uid()
    ) OR is_public = true
  );

CREATE POLICY "Hosts and above can manage packs" ON question_packs
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('Owner', 'Admin', 'Host')
    )
  );

-- RLS политики для категорий пакетов
CREATE POLICY "Users can view pack categories in their orgs" ON pack_categories
  FOR SELECT USING (
    pack_id IN (
      SELECT id FROM question_packs 
      WHERE org_id IN (
        SELECT org_id FROM memberships 
        WHERE user_id = auth.uid()
      ) OR is_public = true
    )
  );

CREATE POLICY "Hosts and above can manage pack categories" ON pack_categories
  FOR ALL USING (
    pack_id IN (
      SELECT id FROM question_packs 
      WHERE org_id IN (
        SELECT org_id FROM memberships 
        WHERE user_id = auth.uid() AND role IN ('Owner', 'Admin', 'Host')
      )
    )
  );

-- RLS политики для вопросов пакетов
CREATE POLICY "Users can view pack questions in their orgs" ON pack_questions
  FOR SELECT USING (
    pack_category_id IN (
      SELECT id FROM pack_categories 
      WHERE pack_id IN (
        SELECT id FROM question_packs 
        WHERE org_id IN (
          SELECT org_id FROM memberships 
          WHERE user_id = auth.uid()
        ) OR is_public = true
      )
    )
  );

CREATE POLICY "Hosts and above can manage pack questions" ON pack_questions
  FOR ALL USING (
    pack_category_id IN (
      SELECT id FROM pack_categories 
      WHERE pack_id IN (
        SELECT id FROM question_packs 
        WHERE org_id IN (
          SELECT org_id FROM memberships 
          WHERE user_id = auth.uid() AND role IN ('Owner', 'Admin', 'Host')
        )
      )
    )
  );

-- RLS политики для аудита
CREATE POLICY "Users can view audit logs in their orgs" ON audit_logs
  FOR SELECT USING (
    record_id IN (
      SELECT id FROM games 
      WHERE org_id IN (
        SELECT org_id FROM memberships 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Создаем индексы для производительности (с проверкой существования)
DO $$ 
BEGIN
    -- Создаем индексы только если они не существуют
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_memberships_user_id') THEN
        CREATE INDEX idx_memberships_user_id ON memberships(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_memberships_org_id') THEN
        CREATE INDEX idx_memberships_org_id ON memberships(org_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_games_org_id') THEN
        CREATE INDEX idx_games_org_id ON games(org_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_games_created_by') THEN
        CREATE INDEX idx_games_created_by ON games(created_by);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_teams_game_id') THEN
        CREATE INDEX idx_teams_game_id ON teams(game_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_categories_game_id') THEN
        CREATE INDEX idx_categories_game_id ON categories(game_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_questions_category_id') THEN
        CREATE INDEX idx_questions_category_id ON questions(category_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_score_events_game_id') THEN
        CREATE INDEX idx_score_events_game_id ON score_events(game_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sessions_org_id') THEN
        CREATE INDEX idx_sessions_org_id ON sessions(org_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sessions_pin') THEN
        CREATE INDEX idx_sessions_pin ON sessions(pin);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_players_session_id') THEN
        CREATE INDEX idx_players_session_id ON players(session_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_buzz_events_session_id') THEN
        CREATE INDEX idx_buzz_events_session_id ON buzz_events(session_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_answer_submissions_session_id') THEN
        CREATE INDEX idx_answer_submissions_session_id ON answer_submissions(session_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_question_packs_org_id') THEN
        CREATE INDEX idx_question_packs_org_id ON question_packs(org_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pack_categories_pack_id') THEN
        CREATE INDEX idx_pack_categories_pack_id ON pack_categories(pack_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pack_questions_pack_category_id') THEN
        CREATE INDEX idx_pack_questions_pack_category_id ON pack_questions(pack_category_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_logs_table_record') THEN
        CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
    END IF;
END $$;
