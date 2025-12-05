#!/usr/bin/env bash
# scripts/dev-all.sh - start all services' dev servers concurrently

set -euo pipefail

# Services to start (modify if you add/remove services)
SERVICES=(
  "saas-portal"
  "saas-logistica"
  "saas-rrhh"
  "saas-adquisicion"
)

# Build commands for services that exist
CMDS=()
for svc in "${SERVICES[@]}"; do
  if [ -d "$svc" ]; then
    CMDS+=("cd $svc && npm run dev")
  fi
done

if [ ${#CMDS[@]} -eq 0 ]; then
  echo "No services found to start. Exiting."
  exit 1
fi

# Use npx concurrently to run them
npx concurrently "${CMDS[@]}"
