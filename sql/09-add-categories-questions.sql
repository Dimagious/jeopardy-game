-- US-203: Добавление категорий и вопросов для Demo Game (Copy)

-- Сначала найдем ID игры "Demo Game (Copy)"
-- SELECT id, title FROM games WHERE title LIKE '%Copy%';

-- Добавляем категории для Demo Game (Copy)
-- Нужно найти актуальный game_id для "Demo Game (Copy)"
INSERT INTO categories (id, game_id, name, color, order_index, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440020', (SELECT id FROM games WHERE title = 'Demo Game (Copy)' LIMIT 1), 'История', '#3B82F6', 1, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440021', (SELECT id FROM games WHERE title = 'Demo Game (Copy)' LIMIT 1), 'Наука', '#EF4444', 2, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440022', (SELECT id FROM games WHERE title = 'Demo Game (Copy)' LIMIT 1), 'Спорт', '#10B981', 3, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Добавляем вопросы для категории "История"
INSERT INTO questions (id, category_id, value, text, answer, order_index, is_locked, is_done, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440020', 100, 'В каком году началась Вторая мировая война?', '1939', 1, false, false, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440020', 200, 'Кто был первым президентом США?', 'Джордж Вашингтон', 2, false, false, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440020', 300, 'В каком году пала Берлинская стена?', '1989', 3, false, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Добавляем вопросы для категории "Наука"
INSERT INTO questions (id, category_id, value, text, answer, order_index, is_locked, is_done, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440021', 100, 'Какая планета ближайшая к Солнцу?', 'Меркурий', 1, false, false, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440021', 200, 'Сколько костей в теле взрослого человека?', '206', 2, false, false, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440021', 300, 'Какой газ составляет 78% атмосферы Земли?', 'Азот', 3, false, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Добавляем вопросы для категории "Спорт"
INSERT INTO questions (id, category_id, value, text, answer, order_index, is_locked, is_done, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440022', 100, 'В каком году проходили Олимпийские игры в Москве?', '1980', 1, false, false, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440022', 200, 'Сколько игроков в команде по футболу?', '11', 2, false, false, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440022', 300, 'Кто выиграл чемпионат мира по футболу 2018?', 'Франция', 3, false, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
