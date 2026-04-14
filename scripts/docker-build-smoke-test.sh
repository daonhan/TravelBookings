#!/usr/bin/env bash
# Docker Build Smoke Test
# Verifies that all Dockerfiles in the project build successfully.
# Usage: ./scripts/docker-build-smoke-test.sh
# Exit code: 0 if all builds pass, 1 if any build fails.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

# Services to build (service name : Dockerfile path)
declare -A SERVICES=(
  ["travelbooking-api"]="src/Services/TravelBooking/Dockerfile"
  ["eventmanagement-api"]="src/Services/EventManagement/Dockerfile"
  ["payment-api"]="src/Services/Payment/Dockerfile"
  ["notification-api"]="src/Services/Notification/Dockerfile"
  ["reporting-api"]="src/Services/Reporting/Dockerfile"
  ["gateway-api"]="src/Gateway/Dockerfile"
  ["frontend"]="src/Frontend/Dockerfile"
)

PASS=0
FAIL=0
FAILED_SERVICES=()

echo "========================================"
echo " Docker Build Smoke Test"
echo "========================================"
echo ""

for SERVICE in "${!SERVICES[@]}"; do
  DOCKERFILE="${SERVICES[$SERVICE]}"
  echo -n "Building $SERVICE ($DOCKERFILE)... "

  if docker build -f "$DOCKERFILE" --target prod -t "travelbookings-test/$SERVICE:smoke" . > /dev/null 2>&1; then
    echo "PASS"
    ((PASS++))
  else
    echo "FAIL"
    ((FAIL++))
    FAILED_SERVICES+=("$SERVICE")
  fi
done

echo ""
echo "========================================"
echo " Results: $PASS passed, $FAIL failed"
echo "========================================"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "Failed services:"
  for S in "${FAILED_SERVICES[@]}"; do
    echo "  - $S"
  done
  echo ""
  echo "Re-run with verbose output to debug:"
  echo "  docker build -f <dockerfile> --target prod -t test ."
  exit 1
fi

echo ""
echo "All Docker images built successfully."
exit 0
