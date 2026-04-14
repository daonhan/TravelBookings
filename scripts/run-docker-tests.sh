#!/usr/bin/env bash
# Docker Test Runner
# Orchestrates the full Docker testing pipeline:
#   1. Build smoke test (verify all Dockerfiles build)
#   2. Start the Docker Compose stack
#   3. Run integration tests (inside Docker)
#   4. Run Playwright E2E tests (from host against Docker stack)
#   5. Tear down and report results
#
# Usage:
#   ./scripts/run-docker-tests.sh [--skip-build] [--skip-e2e] [--skip-integration]
#
# Environment:
#   SA_PASSWORD — SQL Server password (default: SqlServer2022!)
#   CI          — set to "true" in CI environments
#
# Exit code: 0 if all tests pass, 1 if any fail.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

# Parse arguments
SKIP_BUILD=false
SKIP_E2E=false
SKIP_INTEGRATION=false

for arg in "$@"; do
  case $arg in
    --skip-build) SKIP_BUILD=true ;;
    --skip-e2e) SKIP_E2E=true ;;
    --skip-integration) SKIP_INTEGRATION=true ;;
    *) echo "Unknown argument: $arg"; exit 1 ;;
  esac
done

# Create test results directory
mkdir -p test-results

EXIT_CODE=0

# ------------------------------------------------------------------
# Step 1: Build Smoke Test
# ------------------------------------------------------------------
if [ "$SKIP_BUILD" = false ]; then
  echo ""
  echo "========================================"
  echo " Step 1: Docker Build Smoke Test"
  echo "========================================"
  echo ""

  if bash "$SCRIPT_DIR/docker-build-smoke-test.sh"; then
    echo "Build smoke test: PASSED"
  else
    echo "Build smoke test: FAILED"
    EXIT_CODE=1
  fi
else
  echo "Skipping build smoke test (--skip-build)"
fi

# ------------------------------------------------------------------
# Step 2: Start Docker Compose stack
# ------------------------------------------------------------------
echo ""
echo "========================================"
echo " Step 2: Starting Docker Compose stack"
echo "========================================"
echo ""

# Use the base compose file (not override, so prod targets are used)
docker compose -f docker-compose.yml --profile full up -d --build --wait --wait-timeout 300

echo "Stack is up and healthy."

# ------------------------------------------------------------------
# Step 3: Integration Tests
# ------------------------------------------------------------------
if [ "$SKIP_INTEGRATION" = false ]; then
  echo ""
  echo "========================================"
  echo " Step 3: Running Integration Tests"
  echo "========================================"
  echo ""

  # Run integration tests via docker compose test profile
  if docker compose -f docker-compose.yml -f docker-compose.test.yml \
    --profile test up --build --abort-on-container-exit --exit-code-from test-runner \
    test-runner 2>&1; then
    echo ""
    echo "Integration tests: PASSED"
  else
    echo ""
    echo "Integration tests: FAILED"
    EXIT_CODE=1
  fi

  # Copy test results from the volume
  CONTAINER_ID=$(docker ps -aq --filter "name=test-runner" | head -1)
  if [ -n "$CONTAINER_ID" ]; then
    docker cp "$CONTAINER_ID:/app/TestResults/." test-results/ 2>/dev/null || true
  fi
else
  echo "Skipping integration tests (--skip-integration)"
fi

# ------------------------------------------------------------------
# Step 4: Playwright E2E Tests
# ------------------------------------------------------------------
if [ "$SKIP_E2E" = false ]; then
  echo ""
  echo "========================================"
  echo " Step 4: Running Playwright E2E Tests"
  echo "========================================"
  echo ""

  cd "$REPO_ROOT/src/Frontend"

  # Install Playwright browsers if needed
  npx playwright install --with-deps chromium 2>/dev/null || true

  # Run only the Docker smoke tests against the running stack
  if FRONTEND_URL="http://localhost:${FRONTEND_HOST_PORT:-80}" CI=true \
    npx playwright test --config=playwright.docker.config.ts; then
    echo ""
    echo "E2E tests: PASSED"
  else
    echo ""
    echo "E2E tests: FAILED"
    EXIT_CODE=1
  fi

  # Copy E2E results
  cp -r test-results/* "$REPO_ROOT/test-results/" 2>/dev/null || true
  cp -r playwright-report "$REPO_ROOT/test-results/playwright-report" 2>/dev/null || true

  cd "$REPO_ROOT"
else
  echo "Skipping E2E tests (--skip-e2e)"
fi

# ------------------------------------------------------------------
# Step 5: Cleanup & Results
# ------------------------------------------------------------------
echo ""
echo "========================================"
echo " Step 5: Cleanup"
echo "========================================"
echo ""

docker compose -f docker-compose.yml -f docker-compose.test.yml --profile test --profile full down --volumes --remove-orphans 2>/dev/null || true

echo ""
echo "========================================"
echo " Test Results Summary"
echo "========================================"
echo ""

if [ -d "test-results" ]; then
  echo "Results saved to: test-results/"
  ls -la test-results/ 2>/dev/null || true
fi

echo ""
if [ "$EXIT_CODE" -eq 0 ]; then
  echo "ALL TESTS PASSED"
else
  echo "SOME TESTS FAILED — see results above"
fi

exit $EXIT_CODE
