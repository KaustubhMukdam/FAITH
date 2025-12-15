#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      FAITH Budget API Test Suite         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Login
echo -e "${YELLOW}[1/8] Logging in...${NC}"
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kaustubh@faith.app","password":"SecurePass123!"}' \
  | python -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['accessToken'])")
echo -e "${GREEN}✓ Login successful${NC}\n"

# Create budget for current month
echo -e "${YELLOW}[2/8] Creating budget for December 2025...${NC}"
curl -s -X POST http://localhost:5000/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "month": "2025-12",
    "totalAmount": 50000,
    "rolloverEnabled": true,
    "allocations": [
      {
        "category": "ESSENTIAL",
        "allocatedAmount": 25000,
        "alertThreshold": 85
      },
      {
        "category": "FLEXIBLE",
        "allocatedAmount": 15000,
        "alertThreshold": 80
      },
      {
        "category": "DISCRETIONARY",
        "allocatedAmount": 10000,
        "alertThreshold": 75
      }
    ]
  }' | python -m json.tool
echo -e "${GREEN}✓ Budget created${NC}\n"

# Get all budgets
echo -e "${YELLOW}[3/8] Getting all budgets...${NC}"
curl -s -X GET http://localhost:5000/api/budgets \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Budgets retrieved${NC}\n"

# Get budget by month
echo -e "${YELLOW}[4/8] Getting budget for December 2025...${NC}"
curl -s -X GET http://localhost:5000/api/budgets/2025-12 \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Budget retrieved${NC}\n"

# Get budget spending
echo -e "${YELLOW}[5/8] Getting budget spending...${NC}"
curl -s -X GET http://localhost:5000/api/budgets/2025-12/spending \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Spending retrieved${NC}\n"

# Get budget summary
echo -e "${YELLOW}[6/8] Getting budget summary...${NC}"
curl -s -X GET http://localhost:5000/api/budgets/2025-12/summary \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Summary retrieved${NC}\n"

# Get budget alerts
echo -e "${YELLOW}[7/8] Getting budget alerts...${NC}"
curl -s -X GET "http://localhost:5000/api/budgets/alerts?month=2025-12" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Alerts retrieved${NC}\n"

# Delete budget
echo -e "${YELLOW}[8/8] Deleting budget...${NC}"
curl -s -X DELETE http://localhost:5000/api/budgets/2025-12 \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo -e "${GREEN}✓ Budget deleted${NC}\n"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          All Tests Completed! ✓           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
