#!/bin/bash
set -u

base_dir="/Users/taithai/Documents/GitHub/taithai_app/shopee_king_6914"
manifest="$base_dir/image_manifest.json"
failures="$base_dir/_partial/image_download_failures.tsv"

: > "$failures"

download_one() {
  local url="$1"
  local relative_path="$2"
  local destination="$base_dir/$relative_path"
  local temporary="$destination.part"

  mkdir -p "$(dirname "$destination")"
  if [ -s "$destination" ]; then
    return 0
  fi

  if curl -L --fail --silent --show-error \
    --retry 2 --connect-timeout 15 --max-time 90 \
    "$url" -o "$temporary"; then
    mv "$temporary" "$destination"
  else
    printf '%s\t%s\n' "$relative_path" "$url" >> "$failures"
    return 1
  fi
}

export -f download_one
export base_dir failures

jq -r '.[] | [.url, .suggested_path] | @tsv' "$manifest" |
  xargs -P 8 -n 2 bash -c 'download_one "$1" "$2"' _

