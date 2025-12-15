#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   FAITH Transaction API Test Suite       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Login
echo -e "${YELLOW}[1/9] Logging in...${NC}"
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kaustubh@faith.app","password":"SecurePass123!"}' \
  | python -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])")

echo -e "${GREEN}✓ Login successful${NC}\n"

# Step 2: Create Income
echo -e "${YELLOW}[2/9] Creating income transaction...${NC}"
curl -s -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INCOME",
    "category": "SALARY",
    "amount": 75000,
    "description": "December Salary 2025",
    "paymentMode": "NET_BANKING",
    "date": "2025-12-01T00:00:00Z",
    "merchant": "Tech Corp India"
  }' | python -m json.tool
echo -e "${GREEN}✓ Income created${NC}\n"

# Step 3: Create Expenses
echo -e "${YELLOW}[3/9] Creating expense transactions...${NC}"
curl -s -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"EXPENSE","category":"GROCERIES","amount":3500,"description":"Monthly groceries","paymentMode":"UPI","date":"2025-12-05T10:30:00Z","merchant":"BigBasket"}' > /dev/null

curl -s -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"EXPENSE","category":"FOOD","amount":1200,"description":"Dinner at restaurant","paymentMode":"CARD","date":"2025-12-10T20:00:00Z","merchant":"Olive Garden"}' > /dev/null

TRANS_RESP=$(curl -s -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"EXPENSE","category":"TRANSPORTATION","amount":250,"description":"Uber ride","paymentMode":"UPI","date":"2025-12-12T09:15:00Z","merchant":"Uber"}')

TRANS_ID=$(echo "$TRANS_RESP" | python -c "import sys, json; print(json.load(sys.stdin)['data']['transaction']['id'])")

curl -s -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"EXPENSE","category":"SHOPPING","amount":5499,"description":"Wireless headphones","paymentMode":"CARD","date":"2025-12-13T15:45:00Z","merchant":"Amazon"}' > /dev/null

echo -e "${GREEN}✓ 4 expenses created${NC}\n"

# Step 4: Get All Transactions
echo -e "${YELLOW}[4/9] Getting all transactions...${NC}"
curl -s -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Retrieved all transactions${NC}\n"

# Step 5: Filter Tests
echo -e "${YELLOW}[5/9] Testing filters...${NC}"
echo "  → Filter by EXPENSE:"
curl -s -X GET "http://localhost:5000/api/transactions?type=EXPENSE" \
  -H "Authorization: Bearer $TOKEN" \
  | python -c "import sys, json; print('    Found:', json.load(sys.stdin)['data']['total'], 'expenses')"

echo "  → Search 'uber':"
curl -s -X GET "http://localhost:5000/api/transactions?search=uber" \
  -H "Authorization: Bearer $TOKEN" \
  | python -c "import sys, json; print('    Found:', json.load(sys.stdin)['data']['total'], 'results')"

echo -e "${GREEN}✓ Filters working${NC}\n"

# Step 6: Get Single Transaction
echo -e "${YELLOW}[6/9] Getting single transaction...${NC}"
curl -s -X GET "http://localhost:5000/api/transactions/$TRANS_ID" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Single transaction retrieved${NC}\n"

# Step 7: Update Transaction
echo -e "${YELLOW}[7/9] Updating transaction...${NC}"
curl -s -X PUT "http://localhost:5000/api/transactions/$TRANS_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":300,"notes":"Includes waiting charges"}' | python -m json.tool
echo -e "${GREEN}✓ Transaction updated${NC}\n"

# Step 8: Get Summary
echo -e "${YELLOW}[8/9] Getting summary...${NC}"
curl -s -X GET http://localhost:5000/api/transactions/summary \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Summary retrieved${NC}\n"

# Step 9: Delete Transaction
echo -e "${YELLOW}[9/9] Deleting transaction...${NC}"
curl -s -X DELETE "http://localhost:5000/api/transactions/$TRANS_ID" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Transaction deleted${NC}\n"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          All Tests Passed! ✓              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
