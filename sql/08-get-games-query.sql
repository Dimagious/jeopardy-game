-- US-203: Запрос для получения игр с категориями и вопросами

-- Получить все игры для организации
SELECT 
  g.id,
  g.org_id,
  g.title,
  g.description,
  g.status,
  g.settings,
  g.created_by,
  g.created_at,
  g.updated_at,
  COUNT(DISTINCT c.id) as categories_count,
  COUNT(DISTINCT q.id) as questions_count
FROM games g
LEFT JOIN categories c ON g.id = c.game_id
LEFT JOIN questions q ON c.id = q.category_id
WHERE g.org_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY g.id, g.org_id, g.title, g.description, g.status, g.settings, g.created_by, g.created_at, g.updated_at
ORDER BY g.created_at DESC;

-- Получить конкретную игру с категориями и вопросами
SELECT 
  g.*,
  c.id as category_id,
  c.name as category_name,
  c.color as category_color,
  c.order_index as category_order,
  q.id as question_id,
  q.value as question_value,
  q.text as question_text,
  q.answer as question_answer,
  q.order_index as question_order,
  q.is_locked,
  q.is_done
FROM games g
LEFT JOIN categories c ON g.id = c.game_id
LEFT JOIN questions q ON c.id = q.category_id
WHERE g.id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY c.order_index ASC, q.order_index ASC;
