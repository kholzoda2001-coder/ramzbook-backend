#!/usr/bin/env bash
# Patient downloader for the Pollinations free tier.
#
# The A1 and A2 batches ran with a 2-second gap and 3 retries. Partway through
# the B1 batch the service began answering 429 "Queue full for IP: 1 request
# already queued (max: 1)" — the free allowance is now one in-flight request,
# and it needs a real pause between them, not just serialisation. So: a long
# base gap, up to 8 attempts, and backoff that grows on every 429.
#
# usage: _images-dl-patient.sh <tsv> <outdir>
set -u
TSV="$1"
OUT="$2"
GAP="${3:-12}"
mkdir -p "$OUT"

ok=0; fail=0; skip=0
total=$(wc -l < "$TSV")
i=0
while IFS=$'\t' read -r key url; do
  i=$((i+1))
  [ -z "$key" ] && continue
  f="$OUT/$key.png"
  if [ -f "$f" ] && [ "$(stat -c%s "$f")" -gt 12000 ]; then
    skip=$((skip+1)); continue
  fi
  got=0
  for attempt in 1 2 3 4 5 6 7 8; do
    curl -sS -L --max-time 240 -o "$f" "$url" 2>/dev/null
    sz=0; [ -f "$f" ] && sz=$(stat -c%s "$f")
    if [ "$sz" -gt 12000 ]; then got=1; break; fi
    # a small body is the JSON 429/500 page — wait longer each time
    rm -f "$f"
    sleep $((GAP + attempt * 8))
  done
  if [ "$got" = 1 ]; then
    ok=$((ok+1)); echo "[$i/$total] ok   $key ($((sz/1024))KB)"
  else
    fail=$((fail+1)); echo "[$i/$total] FAIL $key"
  fi
  sleep "$GAP"
done < "$TSV"

echo "---- ok=$ok skip=$skip fail=$fail ----"
