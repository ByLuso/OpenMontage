#!/bin/bash
# Montaje y verificación de un vídeo de la serie "cuerpo humano".
# Uso: bash montar.sh <organo> <CompId> <frameDePortada> [stage|stills t1 t2 ...|render|cover|audio|final]
set -euo pipefail
CU="$(cd "$(dirname "$0")" && pwd)"; ORG=$1; COMP=$2; COVERF=$3; STEP=${4:-all}; shift 4 || true
EP="$CU/$ORG"; RC="$CU/../../remotion-composer"; DST="$RC/projects/cu-$ORG"; TOOLS="$CU/../como-funciona/serie/tools"
stage() {
  rm -rf "$DST" && mkdir -p "$DST"
  cp -r "$CU/../como-funciona/serie/remotion3d" "$DST/kit3d"; cp -r "$CU/../como-funciona/serie/remotion" "$DST/kit2d"
  cp "$CU/_kit/"*.tsx "$DST/"; cp "$EP/remotion/"*.tsx "$EP/remotion/timing.json" "$DST/"
  sed -i 's|from "./kit2d/Kit"|from "./kit2d/Kit"|' "$DST/Common.tsx"
  mkdir -p "$EP/remotion/public/sfx" "$EP/remotion/public/fonts"
  cp "$CU/estomago/remotion/public/sfx/"*.wav "$CU/corazon/remotion/public/sfx/"*.wav "$EP/remotion/public/sfx/" 2>/dev/null || true
  cp "$CU/estomago/remotion/public/fonts/"* "$EP/remotion/public/fonts/"; cp "$CU/estomago/remotion/public/music.mp3" "$EP/remotion/public/music.mp3"
  cp "$CU/estomago/Montserrat-900.ttf" "$EP/"
  python3 -c "import json;t=json.load(open('$EP/remotion/timing.json'));json.dump({'timing':t,'dpr':0.7},open('/tmp/props_$ORG.json','w'));json.dump({'timing':t,'dpr':1,'cover':True},open('/tmp/props_${ORG}_cover.json','w'))"
}
case $STEP in
  stage) stage ;;
  stills) cd "$RC" && ROOT="projects/cu-$ORG" PUB="$EP/remotion/public" node projects/_tools/stills.mjs "$ORG" "$COMP" 0.4 0 "$CU/_snaps/$ORG" "$@" ;;
  render) cd "$RC" && npx remotion render "projects/cu-$ORG/index.tsx" "$COMP" "$EP/video_sin_audio.mp4" --props="/tmp/props_$ORG.json" \
            --public-dir="$EP/remotion/public" --gl=swangle --concurrency=3 --timeout=300000 --muted --crf=18 --log=error ;;
  cover) cd "$RC" && npx remotion still "projects/cu-$ORG/index.tsx" "$COMP" "$EP/portada.png" --frame="$COVERF" --props="/tmp/props_${ORG}_cover.json" \
            --public-dir="$EP/remotion/public" --gl=swangle --timeout=300000 --log=error ;;
  audio) cd "$EP" && MUSIC_DUCK=0.3 MUSIC_FULL=0.5 python "$TOOLS/mezcla.py" "$EP" artifacts/sfx.json audio.wav ;;
  final)
    cd "$EP"
    ffmpeg -v error -y -i video_sin_audio.mp4 -i portada.png -i audio.wav -filter_complex "[1:v]scale=1080:1920,format=yuv420p,setsar=1,loop=loop=0:size=1,setpts=N/30/TB[c];[0:v]format=yuv420p,setsar=1,trim=start_frame=1,setpts=PTS-STARTPTS[v];[c][v]concat=n=2:v=1:a=0,drawtext=fontfile=Montserrat-900.ttf:text='@anatomiaexpres':fontsize=70:fontcolor=white@0.22:x=(w-text_w)/2:y=(h-text_h)/2:shadowcolor=black@0.15:shadowx=2:shadowy=2[out]" \
      -map "[out]" -map 2:a -r 30 -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "${ORG}_final.mp4"
    ffprobe -v error -count_frames -show_entries format=duration:stream=nb_read_frames -of compact "${ORG}_final.mp4"
    python "$TOOLS/verificar.py" beats.json "${ORG}_final.mp4" 2>&1 | grep -v -E "HF Hub|Warning" ;;
esac
