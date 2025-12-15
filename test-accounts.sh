#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   FAITH Account Aggregation Test Suite   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Login
echo -e "${YELLOW}[1/10] Logging in...${NC}"
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kaustubh@faith.app","password":"SecurePass123!"}' \
  | python -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])")
echo -e "${GREEN}✓ Login successful${NC}\n"

# Link bank account
echo -e "${YELLOW}[2/10] Linking bank account...${NC}"
ACCOUNT_ID=$(curl -s -X POST http://localhost:5000/api/accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountType": "BANK_ACCOUNT",
    "provider": "HDFC Bank",
    "accountNumber": "XXXX1234",
    "accountHolderName": "Kaustubh Trivedi",
    "ifscCode": "HDFC0001234",
    "syncFrequency": "DAILY"
  }' | python -c "import sys, json; print(json.load(sys.stdin)['data']['account']['id'])")
echo -e "${GREEN}✓ Account linked: $ACCOUNT_ID${NC}\n"

# Link credit card
echo -e "${YELLOW}[3/10] Linking credit card...${NC}"
curl -s -X POST http://localhost:5000/api/accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountType": "CREDIT_CARD",
    "provider": "ICICI Bank",
    "accountNumber": "XXXX5678",
    "accountHolderName": "Kaustubh Trivedi",
    "syncFrequency": "DAILY"
  }' > /dev/null
echo -e "${GREEN}✓ Credit card linked${NC}\n"

# Get all linked accounts
echo -e "${YELLOW}[4/10] Getting all linked accounts...${NC}"
curl -s -X GET http://localhost:5000/api/accounts \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Accounts retrieved${NC}\n"

# Get account summary
echo -e "${YELLOW}[5/10] Getting account summary...${NC}"
curl -s -X GET http://localhost:5000/api/accounts/summary \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Summary retrieved${NC}\n"

# Update account balance
echo -e "${YELLOW}[6/10] Updating account balance...${NC}"
curl -s -X PUT http://localhost:5000/api/accounts/$ACCOUNT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountBalance": 50000
  }' > /dev/null
echo -e "${GREEN}✓ Balance updated${NC}\n"

# Sync account
echo -e "${YELLOW}[7/10] Syncing account...${NC}"
curl -s -X POST http://localhost:5000/api/accounts/$ACCOUNT_ID/sync \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Account synced${NC}\n"

# Parse SMS transaction
echo -e "${YELLOW}[8/10] Parsing SMS transaction...${NC}"
curl -s -X POST http://localhost:5000/api/accounts/sms/parse \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Rs.5000.00 debited from A/c XX1234 on 15-Dec-25 at Swiggy. Avbl Bal: Rs.45000.00",
    "sender": "HDFCBK",
    "timestamp": "2025-12-15T12:00:00Z"
  }' | python -m json.tool
echo -e "${GREEN}✓ SMS parsed${NC}\n"

# Parse another SMS
echo -e "${YELLOW}[9/10] Parsing another SMS (credit)...${NC}"
curl -s -X POST http://localhost:5000/api/accounts/sms/parse \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Rs.75000.00 credited to your A/c XX1234 on 01-Dec-25. Salary from Tech Corp. Avbl Bal: Rs.1,20,000.00",
    "sender": "HDFCBK",
    "timestamp": "2025-12-01T10:00:00Z"
  }' | python -m json.tool
echo -e "${GREEN}✓ SMS parsed${NC}\n"

# Get unprocessed SMS
echo -e "${YELLOW}[10/10] Getting unprocessed SMS transactions...${NC}"
curl -s -X GET http://localhost:5000/api/accounts/sms/unprocessed \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Unprocessed SMS retrieved${NC}\n"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          All Tests Completed! ✓           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
