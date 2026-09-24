#!/usr/bin/env bash
set -u -o pipefail

failures=()
started="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

run(){
  local label="$1"; shift
  printf '\n==== %s ====\n' "$label"
  if "$@"; then
    printf 'PASS: %s\n' "$label"
  else
    local code=$?
    printf 'FAIL: %s (exit %s)\n' "$label" "$code"
    failures+=("$label")
  fi
}

run_shell(){
  local label="$1"; shift
  printf '\n==== %s ====\n' "$label"
  if bash -lc "$*"; then
    printf 'PASS: %s\n' "$label"
  else
    local code=$?
    printf 'FAIL: %s (exit %s)\n' "$label" "$code"
    failures+=("$label")
  fi
}

run "JavaScript syntax" bash -lc "set -e; find js tests -type f -name '*.js' -print0 | while IFS= read -r -d '' f; do node --check \"\$f\"; done; node --check js/data.js"
run "Runtime/assets/static audit" node tests/emoji-drops-static-audit-v3.js
run "Release readiness" node tests/emoji-drops-release-readiness.js
run "Engineering audit" node tests/emoji-drops-engineering-audit.js
run "Economy self-test" node tests/emoji-drops-economy-self-test.js
run "Economy final gate" node tests/emoji-drops-economy-final-gate.js
run "Weighted economy report" node tests/emoji-drops-economy-report.js
run "Economy source audit" node tests/emoji-drops-economy-source-audit.js
run "Runtime hardening" node tests/emoji-drops-runtime-hardening-self-test.js
run "Transaction layer" node tests/emoji-drops-transaction-self-test.js
run "Reliability/storage" node tests/emoji-drops-reliability-self-test.js
run "Final quality invariants" node tests/emoji-drops-final-quality-self-test.js
run "Release polish/currency UX" node tests/emoji-drops-release-polish-self-test.js
run "Product quality" node tests/emoji-drops-product-self-test.js
run "Product-plus retirement" node tests/emoji-drops-product-plus-self-test.js
run "Action-resilience retirement" node tests/emoji-drops-action-resilience-self-test.js
run "P3/P4 contracts" node tests/emoji-drops-p3-p4-self-test.js
run "Supabase schema security/atomicity" node tests/emoji-drops-supabase-schema-audit.js
run "Committed fairness" node tests/emoji-drops-fairness-contract.js
run "Auth/local/cloud boundary" node tests/emoji-drops-auth-boundary-self-test.js
run "Server/frontend catalog consistency" node tests/emoji-drops-catalog-consistency.js
run "Canonical economy consistency" node tests/emoji-drops-canonical-economy-consistency.js
run "Security/privacy audit" node tests/emoji-drops-security-audit.js
run "Market privacy" node tests/emoji-drops-market-privacy-self-test.js
run "Market race contract" node tests/emoji-drops-market-race-contract.js
run "10/20/50 concurrency model" node tests/emoji-drops-concurrency-model.js
run "DB performance/index contract" node tests/emoji-drops-db-performance-contract.js
run "Live Drops realtime lifecycle" node tests/emoji-drops-live-realtime-contract.js
run "Market production migration" node tests/emoji-drops-market-migration-audit.js
run "Final hardening" node -e "const fs=require('fs');const s=fs.readFileSync('js/emoji-drops-final-hardening.js','utf8');for(const x of ['aria-live','aria-modal','Escape','focus-trap','PerformanceObserver','storageHealth','stateHealth'])if(!s.includes(x))throw Error(x);console.log('Final hardening contract OK')"

printf '\n==== Browser dependencies ====\n'
if npm install --no-save --no-package-lock playwright@1.55.0 axe-core@4.13.0 && npx playwright install --with-deps chromium webkit; then
  echo "PASS: Browser dependencies"
else
  failures+=("Browser dependencies")
fi

run "Focused case diagnostic" node tests/emoji-drops-case-diagnostic.js
run "Browser E2E matrix" node tests/emoji-drops-browser-e2e.js
run "Upgrade E2E" node tests/emoji-drops-upgrade-e2e-v2.js
run "Accessibility E2E" node tests/emoji-drops-accessibility-e2e.js
run "Performance lifecycle" node tests/emoji-drops-performance-diagnose.js
run "Performance budget" node tests/emoji-drops-performance-budget-e2e.js
run "Mobile responsive/touch" node tests/emoji-drops-mobile-e2e.js
run "100-cycle long session" node tests/emoji-drops-long-session-e2e.js
run "Recovery/multi-tab" node tests/emoji-drops-recovery-e2e.js
run "Live Supabase anonymous security" node tests/emoji-drops-supabase-anon-security-e2e.js
run "Architecture audit" node tests/emoji-drops-architecture-audit.js
run "Visual regression smoke" node tests/emoji-drops-visual-regression-smoke.js
run "Production smoke" node tests/emoji-drops-production-smoke.js
run "Final P5/P3 contract" node tests/emoji-drops-p5-p3-self-test.js

finished="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
printf '\n==== RELEASE QA SUMMARY ====\n'
printf 'Started: %s\nFinished: %s\n' "$started" "$finished"
if ((${#failures[@]})); then
  printf 'FAILED CHECKS (%s):\n' "${#failures[@]}"
  printf ' - %s\n' "${failures[@]}"
  exit 1
fi
printf 'ALL RELEASE QA CHECKS PASSED.\n'
