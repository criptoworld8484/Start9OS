#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if ! command -v start-cli >/dev/null; then
  echo "Install start-cli: curl -fsSL https://start9.com/start-cli/install.sh | sh" >&2
  exit 1
fi

if ! command -v podman >/dev/null && ! command -v docker >/dev/null; then
  echo "Podman or Docker is required. On Ubuntu: sudo apt install podman uidmap" >&2
  exit 1
fi

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Initializing git repo (required by start-cli s9pk pack)..."
  git init
  git add -A
  git commit -m "Build frigate StartOS package"
fi

npm ci
npm run check

if [ ! -f "$HOME/.startos/developer.key.pem" ]; then
  start-cli init-key
fi

ARCH="${1:-all}"
case "$ARCH" in
  x86_64|aarch64) make "arch/$ARCH" ;;
  all|"") make ;;
  *) echo "Usage: $0 [x86_64|aarch64|all]" >&2; exit 1 ;;
esac

ls -lh *.s9pk 2>/dev/null || true
