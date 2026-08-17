#!/usr/bin/env bash
# Расмҳои олмониро аз Pollinations пай дар пай бор мекунад.
# Пай дар пай ҚАСДАН: эндпойнти ройгон ба дархостҳои мувозӣ 429 медиҳад ва
# fetch-и Node дар Windows дар ин ҳолат овезон мешавад — curl як-як кор мекунад.
set -u
TSV="$(dirname "$0")/_de-images-urls.tsv"
OUT="${1:?Истифода: bash _de-images-dl.sh <роҳ ба images/de>}"
mkdir -p "$OUT"

ok=0; fail=0; skip=0
total=$(grep -c . "$TSV")
i=0
while IFS=$'\t' read -r key url; do
  [ -z "$key" ] && continue
  i=$((i+1))
  f="$OUT/$key.png"
  if [ -s "$f" ]; then skip=$((skip+1)); echo "[$i/$total] $key — аллакай ҳаст"; continue; fi
  # 180s: FLUX барои як расм то ду дақиқа мегирад.
  if curl -sS -f --max-time 180 -o "$f" "$url"; then
    sz=$(wc -c < "$f")
    # Ҷавоби хатогии эндпойнт низ 200 мегирад, вале хеле хурд аст.
    if [ "$sz" -lt 20000 ]; then rm -f "$f"; fail=$((fail+1)); echo "[$i/$total] $key — ҷавоби хеле хурд ($sz b)"; else
      ok=$((ok+1)); echo "[$i/$total] $key — ${sz} b"
    fi
  else
    rm -f "$f"; fail=$((fail+1)); echo "[$i/$total] $key — НОКОМ"
  fi
  sleep 2
done < "$TSV"

echo
echo "тайёр: $ok · буд: $skip · ноком: $fail"
