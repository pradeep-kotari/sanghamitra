#!/usr/bin/env bash
# Pull every archived URL for sanghamitra.org at raw fidelity (id_ = no Wayback banner).
set -u
mkdir -p files
ok=0; fail=0; skip=0
while read -r ts url mime status len; do
  [ -z "${url:-}" ] && continue
  # path under the domain, normalised
  rel=$(printf '%s' "$url" | sed -E 's|^https?://||; s|^www\.||; s|^sanghamitra\.org(:80)?/?||')
  [ -z "$rel" ] && rel="index.html"
  case "$rel" in */) rel="${rel}index.html";; esac
  out="files/$rel"
  if [ -s "$out" ]; then skip=$((skip+1)); continue; fi
  mkdir -p "$(dirname "$out")"
  code=$(curl -sL --max-time 90 --retry 3 --retry-delay 5 \
      -A "Mozilla/5.0 (research archive copy)" \
      -w '%{http_code}' -o "$out" \
      "https://web.archive.org/web/${ts}id_/${url}")
  if [ "$code" = "200" ] && [ -s "$out" ]; then
    ok=$((ok+1)); printf 'OK   %s\n' "$rel"
  else
    fail=$((fail+1)); rm -f "$out"; printf 'FAIL %s (%s)\n' "$rel" "$code"
  fi
  sleep 1
done < cdx.txt
printf '\nDONE ok=%d fail=%d skip=%d\n' "$ok" "$fail" "$skip"
