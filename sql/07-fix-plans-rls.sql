-- US-203: Временное отключение RLS для планов (для разработки)

-- Отключаем RLS для планов (временно для разработки)
ALTER TABLE plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE org_plans DISABLE ROW LEVEL SECURITY;

-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can view plans" ON plans;
DROP POLICY IF EXISTS "Users can view org plans in their orgs" ON org_plans;
DROP POLICY IF EXISTS "Owners can manage org plans" ON org_plans;

-- Создаем простые политики (временно для разработки)
CREATE POLICY "Allow all for plans" ON plans
  FOR ALL USING (true);

CREATE POLICY "Allow all for org_plans" ON org_plans
  FOR ALL USING (true);

-- Включаем RLS обратно
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_plans ENABLE ROW LEVEL SECURITY;
