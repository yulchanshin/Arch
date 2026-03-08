#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd "$(dirname "$0")"

npx concurrently --kill-others \
  --names "frontend,backend" --prefix-colors "cyan,yellow" \
  "cd frontend && npx vite" \
  "cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000"
