#!/usr/bin/env bash
# Simple smoke tests for deployed backend + frontend
set -euo pipefail

BACKEND_URL=${BACKEND_URL:-https://healthcard-backend-zsx7.onrender.com}
FRONTEND_URL=${FRONTEND_URL:-$BACKEND_URL}

echo "Checking backend health endpoint: $BACKEND_URL/health"
curl -sS -f "$BACKEND_URL/health" | jq || true

echo "Fetching frontend root (first 200 chars): $FRONTEND_URL"
curl -sS "$FRONTEND_URL" | head -c 200 | sed -e 's/$/\n/'

echo "Smoke tests completed"
