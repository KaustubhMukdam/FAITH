-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  category VARCHAR(50) NOT NULL,
  merchant VARCHAR(255),
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('DEBIT', 'CREDIT')),
  source VARCHAR(50) NOT NULL CHECK (source IN ('ACCOUNT_AGGREGATOR', 'SMS_PARSED', 'MANUAL_ENTRY', 'BANK_SYNC')),
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_user_timestamp ON transactions(user_id, timestamp DESC);
