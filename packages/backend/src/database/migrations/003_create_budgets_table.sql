-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  total_amount DECIMAL(15, 2) NOT NULL,
  rollover_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month)
);

-- Create budget allocations table
CREATE TABLE IF NOT EXISTS budget_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('ESSENTIAL', 'FLEXIBLE', 'DISCRETIONARY')),
  allocated_amount DECIMAL(15, 2) NOT NULL,
  spent_amount DECIMAL(15, 2) DEFAULT 0,
  rollover_percentage INT DEFAULT 0 CHECK (rollover_percentage >= 0 AND rollover_percentage <= 100),
  alert_threshold INT DEFAULT 85 CHECK (alert_threshold >= 0 AND alert_threshold <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(budget_id, category)
);

-- Create indexes
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_month ON budgets(month);
CREATE INDEX idx_budget_allocations_budget_id ON budget_allocations(budget_id);

-- Create triggers
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_allocations_updated_at BEFORE UPDATE ON budget_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
