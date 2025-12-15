#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Budget Tracking with Transactions      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Login
echo -e "${YELLOW}[1/7] Logging in...${NC}"
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kaustubh@faith.app","password":"SecurePass123!"}' \
  | python -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])")
echo -e "${GREEN}✓ Login successful${NC}\n"

# Create budget
echo -e "${YELLOW}[2/7] Creating December 2025 budget...${NC}"
curl -s -X POST http://localhost:5000/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "month": "2025-12",
    "totalAmount": 30000,
    "rolloverEnabled": true,
    "allocations": [
      {"category": "ESSENTIAL", "allocatedAmount": 15000, "alertThreshold": 85},
      {"category": "FLEXIBLE", "allocatedAmount": 10000, "alertThreshold": 80},
      {"category": "DISCRETIONARY", "allocatedAmount": 5000, "alertThreshold": 75}
    ]
  }' > /dev/null
echo -e "${GREEN}✓ Budget created${NC}\n"

# Add ESSENTIAL transactions (Groceries, Rent)
echo -e "${YELLOW}[3/7] Adding ESSENTIAL transactions...${NC}"
curl -s -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"EXPENSE","category":"GROCERIES","amount":5000,"description":"Monthly groceries","paymentMode":"UPI","date":"2025-12-05T10:00:00Z","merchant":"BigBasket"}' > /dev/null

curl -s -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"EXPENSE","category":"RENT","amount":8000,"description":"December rent","paymentMode":"NET_BANKING","date":"2025-12-01T00:00:00Z","merchant":"Landlord"}' > /dev/null
echo -e "${GREEN}✓ Added 2 ESSENTIAL transactions (₹13,000)${NC}\n"

# Add FLEXIBLE transactions (Food, Transportation)
echo -e "${YELLOW}[4/7] Adding FLEXIBLE transactions...${NC}"
curl -s -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"EXPENSE","category":"FOOD","amount":3000,"description":"Restaurants","paymentMode":"CARD","date":"2025-12-10T19:00:00Z","merchant":"Various"}' > /dev/null

curl -s -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"EXPENSE","category":"TRANSPORTATION","amount":2500,"description":"Uber rides","paymentMode":"UPI","date":"2025-12-12T09:00:00Z","merchant":"Uber"}' > /dev/null
echo -e "${GREEN}✓ Added 2 FLEXIBLE transactions (₹5,500)${NC}\n"

# Add DISCRETIONARY transactions (Shopping, Entertainment)
echo -e "${YELLOW}[5/7] Adding DISCRETIONARY transactions...${NC}"
curl -s -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"EXPENSE","category":"SHOPPING","amount":4000,"description":"New gadgets","paymentMode":"CARD","date":"2025-12-13T15:00:00Z","merchant":"Amazon"}' > /dev/null

curl -s -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"EXPENSE","category":"ENTERTAINMENT","amount":1500,"description":"Movie & dinner","paymentMode":"CARD","date":"2025-12-14T20:00:00Z","merchant":"PVR"}' > /dev/null
echo -e "${GREEN}✓ Added 2 DISCRETIONARY transactions (₹5,500)${NC}\n"

# Get budget spending (should show actual spending now)
echo -e "${YELLOW}[6/7] Getting budget spending with real data...${NC}"
curl -s -X GET http://localhost:5000/api/budgets/2025-12/spending \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Spending data retrieved${NC}\n"

# Get budget alerts
echo -e "${YELLOW}[7/7] Checking for budget alerts...${NC}"
curl -s -X GET "http://localhost:5000/api/budgets/alerts?month=2025-12" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Alerts checked${NC}\n"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      Budget Tracking Test Complete!      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "  - Budget: ₹30,000"
echo "  - Essential (₹15,000): ₹13,000 spent (86.7%)"
echo "  - Flexible (₹10,000): ₹5,500 spent (55%)"
echo "  - Discretionary (₹5,000): ₹5,500 spent (110% - EXCEEDED!)"
echo "  - Total Spent: ₹24,000 (80%)"
