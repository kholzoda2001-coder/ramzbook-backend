#!/bin/bash
cd "$(dirname "$0")/../.."
mkdir -p tmp/image-list/people
while IFS=$'\t' read -r file url; do
  dest="tmp/image-list/people/${file}.png"
  if [ -f "$dest" ]; then
    echo "skip $file (exists)"
    continue
  fi
  n=0
  until [ $n -ge 5 ]; do
    code=$(curl -s -o "$dest.tmp" -w "%{http_code}" --max-time 40 "$url")
    if [ "$code" = "200" ]; then
      mv "$dest.tmp" "$dest"
      size=$(stat -c%s "$dest" 2>/dev/null || wc -c < "$dest")
      echo "OK $file ($size bytes)"
      break
    fi
    n=$((n+1))
    echo "retry $file ($n/5) http=$code"
    rm -f "$dest.tmp"
    sleep 6
  done
  if [ ! -f "$dest" ]; then
    echo "FAIL $file"
  fi
  sleep 2
done < tmp/image-list/urls-people-remaining.tsv
echo "DONE"
