# Исправление RLS политик для устранения рекурсии

## Проблема
Ошибка: `"infinite recursion detected in policy for relation "memberships"`

## Решение
Нужно применить исправленные RLS политики в Supabase.

## Инструкции

1. **Откройте Supabase Dashboard:**
   - Перейдите в ваш проект Supabase
   - Откройте раздел "SQL Editor"

2. **Создайте недостающие таблицы:**
   Скопируйте и выполните содержимое файла `sql/06-create-missing-tables.sql`:

```sql
-- US-203: Создание недостающих таблиц для планов

-- Создаем таблицу планов
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  caps JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создаем таблицу связей организаций с планами
CREATE TABLE IF NOT EXISTS org_plans (
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  since TIMESTAMPTZ DEFAULT NOW(),
  until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, plan_id)
);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_org_plans_org_id ON org_plans(org_id);
CREATE INDEX IF NOT EXISTS idx_org_plans_plan_id ON org_plans(plan_id);
CREATE INDEX IF NOT EXISTS idx_org_plans_active ON org_plans(active);

-- Включаем RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_plans ENABLE ROW LEVEL SECURITY;

-- RLS политики для планов
CREATE POLICY "Users can view plans" ON plans
  FOR SELECT USING (true);

-- RLS политики для связей организаций с планами
CREATE POLICY "Users can view org plans in their orgs" ON org_plans
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage org plans" ON org_plans
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM memberships 
      WHERE user_id = auth.uid() AND role = 'Owner'
    )
  );
```

3. **Выполните SQL скрипт для исправления RLS политик:**
   Скопируйте и выполните содержимое файла `sql/04-fix-rls-policies.sql`:

4. **Добавьте демо-данные:**
   Скопируйте и выполните содержимое файла `sql/05-add-demo-data.sql`:

```sql
-- US-203: Добавление демо-данных для тестирования

-- Добавляем демо-организацию
INSERT INTO orgs (id, name, description, created_by, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Demo Organization',
  'Тестовая организация для разработки',
  auth.uid(), -- Используем текущего пользователя
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Добавляем план для организации
INSERT INTO org_plans (org_id, plan_id, active, since)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'free',
  true,
  NOW()
) ON CONFLICT (org_id) DO NOTHING;

-- Добавляем пользователя как Owner организации
INSERT INTO memberships (user_id, org_id, role, created_at)
VALUES (
  auth.uid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'Owner',
  NOW()
) ON CONFLICT (user_id, org_id) DO NOTHING;

-- Добавляем демо-игру
INSERT INTO games (id, org_id, title, description, status, created_by, created_at, updated_at, settings)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'Demo Game',
  'Тестовая игра для разработки',
  'draft',
  auth.uid(), -- Используем текущего пользователя
  NOW(),
  NOW(),
  '{"gridRows": 5, "gridCols": 5, "maxTeams": 4, "gameMode": "jeopardy"}'
) ON CONFLICT (id) DO NOTHING;

-- Добавляем демо-категории
INSERT INTO categories (id, game_id, name, color, "order", created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'История', '#3B82F6', 1, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Наука', '#EF4444', 2, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Спорт', '#10B981', 3, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Добавляем демо-вопросы
INSERT INTO questions (id, category_id, value, text, answer, "order", is_locked, is_done, created_at, updated_at)
VALUES 
  -- История
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 100, 'В каком году началась Вторая мировая война?', '1939', 1, false, false, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 200, 'Кто был первым президентом США?', 'Джордж Вашингтон', 2, false, false, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 300, 'В каком году пала Берлинская стена?', '1989', 3, false, false, NOW(), NOW()),
  
  -- Наука
  ('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 100, 'Какая планета ближайшая к Солнцу?', 'Меркурий', 1, false, false, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 200, 'Сколько костей в теле взрослого человека?', '206', 2, false, false, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 300, 'Какой газ составляет 78% атмосферы Земли?', 'Азот', 3, false, false, NOW(), NOW()),
  
  -- Спорт
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440004', 100, 'В каком году проходили Олимпийские игры в Москве?', '1980', 1, false, false, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440004', 200, 'Сколько игроков в команде по футболу?', '11', 2, false, false, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 300, 'Кто выиграл чемпионат мира по футболу 2018?', 'Франция', 3, false, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
```

```sql
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
```

3. **Проверьте результат:**
   - После выполнения скрипта обновите страницу приложения
   - Ошибка рекурсии должна исчезнуть
   - Список игр должен загружаться корректно

## Что изменилось
- Упрощены RLS политики для устранения рекурсивных запросов
- Политики теперь используют простые условия без вложенных запросов к `memberships`
- Для разработки временно разрешен доступ ко всем данным (политики с `true`)
