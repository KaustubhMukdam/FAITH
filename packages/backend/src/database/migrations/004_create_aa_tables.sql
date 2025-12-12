-- Create Account Aggregator consents table
CREATE TABLE IF NOT EXISTS aa_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consent_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'EXPIRED', 'REVOKED')),
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('FINVU', 'ONEMONEY', 'SETU', 'SAAFE')),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create linked bank accounts table
CREATE TABLE IF NOT EXISTS linked_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aa_consent_id UUID REFERENCES aa_consents(id) ON DELETE CASCADE,
  account_id VARCHAR(255) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL, -- Masked
  account_type VARCHAR(50) CHECK (account_type IN ('SAVINGS', 'CURRENT', 'CREDIT_CARD')),
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_aa_consents_user_id ON aa_consents(user_id);
CREATE INDEX idx_aa_consents_status ON aa_consents(status);
CREATE INDEX idx_linked_accounts_consent_id ON linked_bank_accounts(aa_consent_id);

-- Create triggers
CREATE TRIGGER update_aa_consents_updated_at BEFORE UPDATE ON aa_consents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
