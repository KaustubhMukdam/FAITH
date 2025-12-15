-- Budget Management Tables

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  period VARCHAR(20) NOT NULL CHECK (period IN ('MONTHLY', 'QUARTERLY', 'YEARLY')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  alert_threshold NUMERIC(5, 2) DEFAULT 80.00 CHECK (alert_threshold > 0 AND alert_threshold <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Budget spending tracking view
CREATE OR REPLACE VIEW budget_spending AS
SELECT 
  b.id as budget_id,
  b.user_id,
  b.name,
  b.category,
  b.amount as budget_amount,
  b.period,
  b.start_date,
  b.end_date,
  b.alert_threshold,
  COALESCE(SUM(t.amount), 0) as spent_amount,
  b.amount - COALESCE(SUM(t.amount), 0) as remaining_amount,
  CASE 
    WHEN b.amount > 0 THEN ROUND((COALESCE(SUM(t.amount), 0) / b.amount * 100), 2)
    ELSE 0 
  END as spent_percentage
FROM budgets b
LEFT JOIN transactions t ON 
  t.user_id = b.user_id 
  AND t.category = b.category 
  AND t.type = 'DEBIT'
  AND t.timestamp >= b.start_date 
  AND t.timestamp <= b.end_date
WHERE b.is_active = true
GROUP BY b.id, b.user_id, b.name, b.category, b.amount, b.period, 
         b.start_date, b.end_date, b.alert_threshold;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period);
CREATE INDEX IF NOT EXISTS idx_budgets_dates ON budgets(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_budgets_active ON budgets(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER budgets_updated_at_trigger
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_budgets_updated_at();

-- Comments
COMMENT ON TABLE budgets IS 'User budget definitions and limits';
COMMENT ON VIEW budget_spending IS 'Real-time view of budget spending and remaining amounts';
COMMENT ON COLUMN budgets.alert_threshold IS 'Percentage at which to trigger budget alerts (default 80%)';
COMMENT ON COLUMN budgets.period IS 'Budget period: MONTHLY, QUARTERLY, or YEARLY';
