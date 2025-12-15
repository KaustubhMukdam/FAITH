-- Account Aggregation Tables

-- Linked accounts table
CREATE TABLE IF NOT EXISTS linked_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('BANK_ACCOUNT', 'CREDIT_CARD', 'WALLET', 'INVESTMENT')),
  provider VARCHAR(100) NOT NULL,
  account_number VARCHAR(100),
  account_holder_name VARCHAR(255),
  ifsc_code VARCHAR(20),
  account_balance NUMERIC(15, 2),
  currency VARCHAR(10) DEFAULT 'INR',
  last_synced_at TIMESTAMP,
  sync_status VARCHAR(20) DEFAULT 'PENDING' CHECK (sync_status IN ('PENDING', 'ACTIVE', 'FAILED', 'DISABLED')),
  sync_frequency VARCHAR(20) DEFAULT 'DAILY' CHECK (sync_frequency IN ('REALTIME', 'HOURLY', 'DAILY', 'WEEKLY', 'MANUAL')),
  credentials_encrypted TEXT,
  metadata JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Account aggregator sessions
CREATE TABLE IF NOT EXISTS aa_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  consent_handle VARCHAR(255),
  consent_status VARCHAR(50) DEFAULT 'PENDING' CHECK (consent_status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
  fiu_id VARCHAR(100),
  accounts_discovered INTEGER DEFAULT 0,
  consent_start_date TIMESTAMP,
  consent_end_date TIMESTAMP,
  expires_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SMS parsed transactions (before mapping to transactions table)
CREATE TABLE IF NOT EXISTS sms_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  linked_account_id UUID REFERENCES linked_accounts(id) ON DELETE SET NULL,
  raw_sms TEXT NOT NULL,
  sender VARCHAR(50) NOT NULL,
  received_at TIMESTAMP NOT NULL,
  parsed_amount NUMERIC(15, 2),
  parsed_type VARCHAR(20) CHECK (parsed_type IN ('DEBIT', 'CREDIT')),
  parsed_merchant VARCHAR(255),
  parsed_category VARCHAR(50),
  account_number_hint VARCHAR(20),
  is_processed BOOLEAN DEFAULT false,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  confidence_score NUMERIC(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sync logs
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  linked_account_id UUID REFERENCES linked_accounts(id) ON DELETE SET NULL,
  sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN ('MANUAL', 'SCHEDULED', 'REALTIME', 'SMS_PARSE')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('STARTED', 'SUCCESS', 'FAILED', 'PARTIAL')),
  transactions_fetched INTEGER DEFAULT 0,
  transactions_created INTEGER DEFAULT 0,
  transactions_updated INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  metadata JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_linked_accounts_user_id ON linked_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_linked_accounts_sync_status ON linked_accounts(sync_status);
CREATE INDEX IF NOT EXISTS idx_aa_sessions_user_id ON aa_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_aa_sessions_session_id ON aa_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sms_transactions_user_id ON sms_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_transactions_processed ON sms_transactions(is_processed);
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_account ON sync_logs(linked_account_id);

-- Update triggers
CREATE TRIGGER linked_accounts_updated_at_trigger
  BEFORE UPDATE ON linked_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER aa_sessions_updated_at_trigger
  BEFORE UPDATE ON aa_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE linked_accounts IS 'User linked bank accounts and financial accounts';
COMMENT ON TABLE aa_sessions IS 'Account Aggregator consent sessions';
COMMENT ON TABLE sms_transactions IS 'Transactions parsed from SMS before processing';
COMMENT ON TABLE sync_logs IS 'Account sync history and logs';
COMMENT ON COLUMN linked_accounts.credentials_encrypted IS 'Encrypted credentials for account access';
COMMENT ON COLUMN sms_transactions.confidence_score IS 'ML confidence score for SMS parsing (0-1)';
