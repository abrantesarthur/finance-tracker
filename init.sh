#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "Installing dependencies..."
bun install

echo "Pushing database schema..."
bun run --filter server db:push

echo "Starting dev servers..."
bun run dev &
DEV_PID=$!

cleanup() {
  kill $DEV_PID 2>/dev/null || true
}
trap cleanup EXIT

echo "Waiting for servers to start..."
TIMEOUT=30
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
  SERVER_UP=false
  WEB_UP=false

  if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    SERVER_UP=true
  fi

  if curl -s http://localhost:5173/ > /dev/null 2>&1; then
    WEB_UP=true
  fi

  if $SERVER_UP && $WEB_UP; then
    echo ""
    echo "Both servers are up!"
    echo "  Server: http://localhost:3000"
    echo "  Web:    http://localhost:5173"
    # Keep running — don't exit so servers stay alive
    wait $DEV_PID
    exit 0
  fi

  sleep 1
  ELAPSED=$((ELAPSED + 1))
done

echo "Timeout: servers did not start within ${TIMEOUT}s"
exit 1
