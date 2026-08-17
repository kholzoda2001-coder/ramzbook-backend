#!/usr/bin/env bash
# Sequential download of the A2 picture batch from Pollinations.
# Sequential on purpose: the free endpoint answers 429 to parallel requests, and
# Node's fetch hangs on Windows for these — plain curl one at a time is what
# worked for the A1 batches.
set -u
TSV="$(dirname "$0")/_b1-images-urls.tsv"
OUT="$1"
mkdir -p "$OUT"

ok=0; fail=0; skip=0
total=$(wc -l < "$TSV")
i=0
while IFS=$'\t' read -r key url; do
  i=$((i+1))
  [ -z "$key" ] && continue
  f="$OUT/$key.png"
  # >12KB and a real image = already downloaded (see the A1 note: a 40KB floor
  # wrongly rejected small but perfectly good pictures).
  if [ -f "$f" ] && [ "$(stat -c%s "$f")" -gt 12000 ]; then
    skip=$((skip+1)); continue
  fi
  got=0
  for attempt in 1 2 3; do
    curl -sS -L --max-time 180 -o "$f" "$url" 2>/dev/null
    if [ -f "$f" ] && [ "$(stat -c%s "$f")" -gt 12000 ]; then got=1; break; fi
    sleep $((attempt * 5))
  done
  if [ "$got" = 1 ]; then
    ok=$((ok+1)); echo "[$i/$total] ok   $key ($(( $(stat -c%s "$f") / 1024 ))KB)"
  else
    fail=$((fail+1)); rm -f "$f"; echo "[$i/$total] FAIL $key"
  fi
  sleep 2
done < "$TSV"

echo "---- ok=$ok skip=$skip fail=$fail ----"
