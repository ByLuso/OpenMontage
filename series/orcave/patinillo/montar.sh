#!/bin/bash
# Uso: bash montar.sh [stage|stills t...|render [from to]|cover|audio|final]
set -euo pipefail
EP="$(cd "$(dirname "$0")" && pwd)"; RC="$EP/../../../remotion-composer"; DST="$RC/projects/orc-patinillo"; TOOLS="$EP/../../como-funciona/serie/tools"; SERIE="$EP/../../como-funciona/serie"
STEP=${1:-stage}; shift || true
case $STEP in
  stage) rm -rf "$DST"; mkdir -p "$DST"; cp -r "$SERIE/remotion" "$DST/kit2d"; cp -r "$SERIE/remotion3d" "$DST/kit3d"; sed -i "s/new THREE.Fog(\"#091830\", 9, 30)/new THREE.Fog(\"#091830\", 30, 75)/; s/near = 0.05; cam.far = 80/near = 0.1; cam.far = 150/; s/circleGeometry args={\[30, 64\]}/circleGeometry args={[60, 64]}/; s/metalness={0.35} envMapIntensity={0.6}/metalness={0.05} envMapIntensity={0.3}/; s/color=\"#0B1C36\" roughness={0.3}/color=\"#0B1C36\" roughness={0.9}/" "$DST/kit3d/Scene3D.tsx"; cp "$EP/remotion/"*.tsx "$EP/remotion/timing.json" "$DST/"
         python3 -c "import json;t=json.load(open('$EP/remotion/timing.json'));json.dump({'timing':t,'dpr':0.7},open('/tmp/props_orp.json','w'));json.dump({'timing':t,'dpr':1,'cover':True},open('/tmp/props_orp_cover.json','w'));json.dump({'timing':t,'dpr':0.4},open('/tmp/props_orp_still.json','w'))" ;;
  stills) cd "$RC" && for s in "$@"; do f=$(python3 -c "print(round($s*30))"); npx remotion still "projects/orc-patinillo/index.tsx" Patinillo "$EP/_snaps/t$(printf %05d $f).png" --frame=$f --props=/tmp/props_orp_still.json --public-dir="$EP/remotion/public" --gl=swangle --scale=0.4 --timeout=120000 --log=error; echo "t=$s"; done ;;
  render) cd "$RC" && FR=""; [ $# -ge 2 ] && FR="--frames=$1-$2"; OUT="$EP/video_sin_audio${3:-}.mp4"
          npx remotion render projects/orc-patinillo/index.tsx Patinillo "$OUT" $FR --props=/tmp/props_orp.json --public-dir="$EP/remotion/public" --gl=swangle --concurrency=3 --timeout=300000 --muted --crf=18 --log=error ;;
  cover) cd "$RC" && npx remotion still projects/orc-patinillo/index.tsx Patinillo "$EP/portada.png" --frame=150 --props=/tmp/props_orp_cover.json --public-dir="$EP/remotion/public" --gl=swangle --timeout=300000 --log=error ;;
  audio) cd "$EP" && MUSIC_DUCK=0.25 MUSIC_FULL=0.45 python "$TOOLS/mezcla.py" "$EP" artifacts/sfx.json audio.wav ;;
  final)
    cd "$EP"
    ffmpeg -v error -y -i video_sin_audio.mp4 -i portada.png -i audio.wav -filter_complex "[1:v]scale=1080:1920,format=yuv420p,setsar=1,loop=loop=0:size=1,setpts=N/30/TB[c];[0:v]format=yuv420p,setsar=1,trim=start_frame=1,setpts=PTS-STARTPTS[v];[c][v]concat=n=2:v=1:a=0[out]" \
      -map "[out]" -map 2:a -r 30 -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart orcave_valvulas_patinillo.mp4
    ffprobe -v error -count_frames -show_entries format=duration:stream=nb_read_frames -of compact orcave_valvulas_patinillo.mp4
    python "$TOOLS/verificar.py" beats.json orcave_valvulas_patinillo.mp4 2>&1 | grep -v -E "HF Hub|Warning" ;;
esac
