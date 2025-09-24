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
