#!/usr/bin/env bash
set -euo pipefail

APP_PORT=3000
STAGING_PORT=3002
GATEWAY_PORT=31415

show_ports() {
  echo "Listening processes:"
  for port in "$APP_PORT" "$STAGING_PORT" "$GATEWAY_PORT"; do
    echo
    echo "Port $port:"
    if ! lsof -nP -iTCP:"$port" -sTCP:LISTEN; then
      echo "  available"
    fi
  done
}

stop_port() {
  local port="$1"
  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"

  if [[ -z "$pids" ]]; then
    echo "No listening process found on port $port."
    return 0
  fi

  echo "Processes listening on port $port:"
  lsof -nP -iTCP:"$port" -sTCP:LISTEN
  echo
  echo "This sends SIGTERM only to the listed listener PID(s). It does not stop unrelated processes."
  read -r -p "Stop these process(es) gracefully? [y/N] " answer
  if [[ ! "$answer" =~ ^[Yy]$ ]]; then
    echo "No process stopped."
    return 0
  fi

  while read -r pid; do
    [[ -z "$pid" ]] || kill -TERM "$pid"
  done <<< "$pids"
  echo "Sent SIGTERM to the selected listener process(es)."
  echo "If a process does not exit, inspect it again before taking further action."
}

case "${1:-check}" in
  check)
    show_ports
    if lsof -nP -iTCP:"$APP_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
      echo
      echo "Port $APP_PORT is occupied; npm run dev will fail rather than switch ports."
      echo "Inspect it with: ./scripts/dev-ports.sh check"
      echo "Stop it selectively with: ./scripts/dev-ports.sh stop 3000"
      exit 1
    fi
    ;;
  stop)
    if [[ "${2:-}" != "$APP_PORT" ]]; then
      echo "Refusing to stop anything except the application port $APP_PORT." >&2
      echo "Usage: ./scripts/dev-ports.sh stop $APP_PORT" >&2
      exit 2
    fi
    stop_port "$APP_PORT"
    ;;
  *)
    echo "Usage: ./scripts/dev-ports.sh [check|stop 3000]" >&2
    exit 2
    ;;
esac
