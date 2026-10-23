#!/bin/bash
# Uso: bash montar.sh [stage|stills t...|render|cover|audio|final]
set -euo pipefail
EP="$(cd "$(dirname "$0")" && pwd)"; RC="$EP/../../../remotion-composer"; DST="$RC/projects/dm-hipertrofia"; TOOLS="$EP/../../como-funciona/serie/tools"
STEP=${1:-stage}; shift || true
case $STEP in
  stage) rm -rf "$DST"; mkdir -p "$DST"; cp -r "$EP/../../como-funciona/serie/remotion" "$DST/kit2d"; cp "$EP/remotion/"*.tsx "$EP/remotion/timing.json" "$DST/"
         python3 -c "import json;t=json.load(open('$EP/remotion/timing.json'));json.dump({'timing':t},open('/tmp/props_dm.json','w'));json.dump({'timing':t,'cover':True},open('/tmp/props_dm_cover.json','w'))" ;;
  stills) cd "$RC" && for s in "$@"; do f=$(python3 -c "print(round($s*30))"); npx remotion still "projects/dm-hipertrofia/index.tsx" Hipertrofia "$EP/_snaps/t$(printf %05d $f).png" --frame=$f --props=/tmp/props_dm.json --public-dir="$EP/remotion/public" --scale=0.4 --log=error; echo "t=$s"; done ;;
  render) cd "$RC" && npx remotion render projects/dm-hipertrofia/index.tsx Hipertrofia "$EP/video_sin_audio.mp4" --props=/tmp/props_dm.json --public-dir="$EP/remotion/public" --concurrency=3 --timeout=180000 --muted --crf=18 --log=error ;;
  cover) cd "$RC" && npx remotion still projects/dm-hipertrofia/index.tsx Hipertrofia "$EP/portada.png" --frame=0 --props=/tmp/props_dm_cover.json --public-dir="$EP/remotion/public" --log=error ;;
  audio) cd "$EP" && MUSIC_DUCK=0.22 MUSIC_FULL=0.4 python "$TOOLS/mezcla.py" "$EP" artifacts/sfx.json audio.wav ;;
  final)
    cd "$EP"
    ffmpeg -v error -y -i video_sin_audio.mp4 -i portada.png -i audio.wav -filter_complex "[1:v]scale=1080:1920,format=yuv420p,setsar=1,loop=loop=0:size=1,setpts=N/30/TB[c];[0:v]format=yuv420p,setsar=1,trim=start_frame=1,setpts=PTS-STARTPTS[v];[c][v]concat=n=2:v=1:a=0[out]" \
      -map "[out]" -map 2:a -r 30 -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart darkmuscle_hipertrofia.mp4
    ffprobe -v error -count_frames -show_entries format=duration:stream=nb_read_frames -of compact darkmuscle_hipertrofia.mp4
    python "$TOOLS/verificar.py" beats.json darkmuscle_hipertrofia.mp4 2>&1 | grep -v -E "HF Hub|Warning" ;;
esac
