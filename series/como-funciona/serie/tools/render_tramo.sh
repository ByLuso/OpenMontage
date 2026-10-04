#!/bin/bash
# Render por tramos (sin audio) para no pasar del límite de tiempo de un proceso.
# Uso: bash serie/tools/render_tramo.sh <slug> <CompId> <frameIni> <frameFin> <salida.mp4>
set -euo pipefail
CF="$(cd "$(dirname "$0")/../.." && pwd)"
SLUG=$1; COMP=$2; A=$3; B=$4; OUT=$5
cd "$CF/../../remotion-composer"
python3 -c "import json;t=json.load(open('projects/cf-$SLUG/timing.json'));json.dump({'timing':t,'dpr':0.7,'aa':True,'quality':'final'},open('/tmp/props_$SLUG.json','w'))"
npx remotion render "projects/cf-$SLUG/index.tsx" "$COMP" "$OUT" --props="/tmp/props_$SLUG.json" \
  --public-dir="../projects/como-funciona/$SLUG/remotion/public" --gl=swangle --concurrency=3 --timeout=300000 \
  --frames="$A-$B" --muted --crf=18 --log=error
