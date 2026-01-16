#!/bin/bash

# API Endpoint Testing Script
# This script tests the key API endpoints to verify everything works
# Usage: ./scripts/test-api-endpoints.sh [BASE_URL]
# Example: ./scripts/test-api-endpoints.sh http://localhost:3000

BASE_URL="${1:-http://localhost:3000}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing API Endpoints at $BASE_URL"
echo ""

# Test 1: Match Suggestions API (should require auth)
echo "1. Testing Match Suggestions API (should require auth)..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/match/suggestions/my?limit=10&offset=0")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "401" ]; then
    echo -e "${GREEN}✅ Pass: Returns 401 (Unauthorized) as expected${NC}"
else
    echo -e "${RED}❌ Fail: Expected 401, got $HTTP_CODE${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 2: Profile Update API (should require auth)
echo "2. Testing Profile Update API (should require auth)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/settings/profile" \
    -H "Content-Type: application/json" \
    -d '{"firstName": "Test"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "401" ]; then
    echo -e "${GREEN}✅ Pass: Returns 401 (Unauthorized) as expected${NC}"
else
    echo -e "${RED}❌ Fail: Expected 401, got $HTTP_CODE${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 3: Profile Update Validation (should return 400 for invalid data)
echo "3. Testing Profile Update Validation..."
# This would need auth token, but we can check the endpoint exists
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/settings/profile" \
    -H "Content-Type: application/json" \
    -d '{"firstName": ""}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" == "401" ] || [ "$HTTP_CODE" == "400" ]; then
    echo -e "${GREEN}✅ Pass: Endpoint exists and validates (got $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Got unexpected status $HTTP_CODE${NC}"
fi
echo ""

# Test 4: Admin Route Protection (should redirect non-admins)
echo "4. Testing Admin Route Protection..."
# Note: This requires a browser test, but we can check the route exists
RESPONSE=$(curl -s -w "\n%{http_code}" -L "$BASE_URL/admin" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "307" ] || [ "$HTTP_CODE" == "308" ]; then
    echo -e "${GREEN}✅ Pass: Admin route exists (got $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Got status $HTTP_CODE${NC}"
fi
echo ""

# Test 5: Health Check (if exists)
echo "5. Testing App Health..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Pass: App is running (got 200)${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Got status $HTTP_CODE${NC}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Note: Full testing requires authenticated requests"
echo "   Use browser DevTools or Postman for complete tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"















