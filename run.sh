#!/usr/bin/env bash
# Збирає сайт на ТЕСТОВИХ даних, запускає його разом із приймачем вебхука і проганяє e2e.
# Після тестів обов'язково виконайте звичайний `npm run build` для робочих даних.
set -euo pipefail
cd "$(dirname "$0")/.."
node tests/make-fixture.mjs >/dev/null
node scripts/import-catalog.mjs tests/.out/test-feed.xml --out tests/.out/catalog.json >/dev/null
cp tests/fixtures/store.test.json tests/.out/store.json
rm -f tests/.out/orders.jsonl
export CATALOG_PATH=tests/.out/catalog.json STORE_PATH=tests/.out/store.json \
  ORDER_WEBHOOK_URL=http://127.0.0.1:4100/ ORDER_WEBHOOK_SECRET=test-secret NEXT_TELEMETRY_DISABLED=1
npx next build >/dev/null
node tests/webhook-receiver.mjs & RECV=$!
npx next start -p 3100 & SRV=$!
trap 'kill $RECV $SRV 2>/dev/null' EXIT
for _ in $(seq 30); do curl -sf localhost:3100 >/dev/null && break; sleep 1; done
NODE_PATH="${NODE_PATH:-$(npm root -g)}" node tests/e2e.mjs
