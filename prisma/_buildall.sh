#!/usr/bin/env bash
# Robust builder for pending A2 modules. Retries each pending module once per
# round; drops it from the queue on success. Tolerant of Neon's intermittent
# connection — keeps looping until all built or the round cap is hit.
cd "$(dirname "$0")/.." || exit 1
declare -A tag=( [a2-m7]="Модули 7" [a2-m8]="Модули 8" [a2-m9]="Модули 9" [a2-m10]="Модули 10" [a2-m11]="Модули 11" [a2-m12]="Модули 12" )
pending=(a2-m7 a2-m8 a2-m9 a2-m10 a2-m11 a2-m12)
for round in $(seq 1 120); do
  [ ${#pending[@]} -eq 0 ] && break
  still=()
  for f in "${pending[@]}"; do
    out=$(node "prisma/$f.mjs" 2>&1)
    if echo "$out" | grep -q "${tag[$f]} тайёр"; then
      echo "✅ $f (round $round): $(echo "$out" | grep -oE '[0-9]+ дарс, [0-9]+ калима' | head -1)"
    else
      still+=("$f")
    fi
  done
  pending=("${still[@]}")
  [ ${#pending[@]} -eq 0 ] && break
  echo "--- round $round: боқӣ мондаанд: ${pending[*]} ---"
  sleep 12
done
if [ ${#pending[@]} -eq 0 ]; then echo "🎉 ҲАМА МОДУЛҲО СОХТА ШУДАНД (M7-M12)"; else echo "❌ боқӣ монданд: ${pending[*]}"; fi
