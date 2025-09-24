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
