#!/bin/bash
# Copia el código de un episodio + kits a remotion-composer/projects/cf-<slug>/ para que resuelva node_modules.
# Uso: bash serie/tools/stage.sh <slug>
set -euo pipefail
CF="$(cd "$(dirname "$0")/../.." && pwd)"
SLUG="$1"
DST="$(cd "$CF/../.." && pwd)/remotion-composer/projects/cf-$SLUG"
rm -rf "$DST" && mkdir -p "$DST"
cp -r "$CF/serie/remotion3d" "$DST/kit3d"
cp -r "$CF/serie/remotion" "$DST/kit2d"
find "$CF/$SLUG/remotion" -maxdepth 1 -type f -exec cp {} "$DST/" \;
mkdir -p "$(dirname "$DST")/_tools" && cp "$CF/serie/tools/stills.mjs" "$(dirname "$DST")/_tools/"
echo "$DST"
