#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
container="t02-domain-$$"
cleanup() { docker stop "$container" >/dev/null 2>&1 || true; }
trap cleanup EXIT
# Brak wystawionego portu; wyłącznie pusty kontener do testu.
docker run --rm -d --name "$container" -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16 >/dev/null
ready=0
for attempt in {1..120}; do
  if docker exec "$container" pg_isready -U postgres >/dev/null 2>&1; then ready=1; break; fi
  sleep 0.5
done
if [ "$ready" -ne 1 ]; then
  echo "PostgreSQL nie uruchomił się w 60 sekund" >&2
  exit 1
fi
docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres < scripts/t02_test_auth_shim.sql
docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres < supabase/migrations/20261011160000_t02_domain.sql
docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres < scripts/t02_database_test.sql
