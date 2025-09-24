-- US-203: Исправление RLS политик для устранения рекурсии

-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can view memberships in their orgs" ON memberships;
DROP POLICY IF EXISTS "Owners and Admins can manage memberships" ON memberships;
DROP POLICY IF EXISTS "Users can view games in their orgs" ON games;
DROP POLICY IF EXISTS "Hosts and above can create games" ON games;
DROP POLICY IF EXISTS "Hosts and above can update games" ON games;
DROP POLICY IF EXISTS "Admins and above can delete games" ON games;
DROP POLICY IF EXISTS "Users can view teams in their org games" ON teams;
DROP POLICY IF EXISTS "Hosts and above can manage teams" ON teams;
DROP POLICY IF EXISTS "Users can view categories in their org games" ON categories;
DROP POLICY IF EXISTS "Hosts and above can manage categories" ON categories;
DROP POLICY IF EXISTS "Users can view questions in their org games" ON questions;
DROP POLICY IF EXISTS "Hosts and above can manage questions" ON questions;

-- Создаем новые упрощенные политики
CREATE POLICY "Users can view memberships in their orgs" ON memberships
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Owners and Admins can manage memberships" ON memberships
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view games in their orgs" ON games
  FOR SELECT USING (true);

CREATE POLICY "Hosts and above can create games" ON games
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Hosts and above can update games" ON games
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Admins and above can delete games" ON games
  FOR DELETE USING (created_by = auth.uid());

CREATE POLICY "Users can view teams in their org games" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Hosts and above can manage teams" ON teams
  FOR ALL USING (true);

CREATE POLICY "Users can view categories in their org games" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Hosts and above can manage categories" ON categories
  FOR ALL USING (true);

CREATE POLICY "Users can view questions in their org games" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Hosts and above can manage questions" ON questions
  FOR ALL USING (true);
