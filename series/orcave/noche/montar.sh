#!/bin/bash
# Uso: bash montar.sh [stage|stills t...|render [from to sufijo]|cover|audio|final]
set -euo pipefail
EP="$(cd "$(dirname "$0")" && pwd)"; RC="$EP/../../../remotion-composer"; DST="$RC/projects/orc-noche"; SERIE="$EP/../../../series/como-funciona/serie"
PROPS="$EP/_props"; mkdir -p "$PROPS" "$EP/_snaps"
STEP=${1:-stage}; shift || true
case $STEP in
  stage) rm -rf "$DST"; mkdir -p "$DST"; cp -r "$SERIE/remotion3d" "$DST/kit3d"; cp "$EP/remotion/"*.tsx "$EP/remotion/"*.ts "$EP/remotion/timing.json" "$DST/"
         LOGO=$([ -f "$EP/remotion/public/logo_orcave_hd.png" ] && echo True || echo False)
         python3 -c "import json;t=json.load(open('$EP/remotion/timing.json'));L=$LOGO;json.dump({'timing':t,'dpr':0.75,'logo':L},open('$PROPS/render.json','w'));json.dump({'timing':t,'dpr':1,'cover':True,'logo':L},open('$PROPS/cover.json','w'));json.dump({'timing':t,'dpr':0.5,'logo':L},open('$PROPS/still.json','w'))" ;;
  stills) cd "$RC" && for s in "$@"; do f=$(python3 -c "print(round($s*30))"); npx remotion still projects/orc-noche/index.tsx Noche "$EP/_snaps/t$(printf %05d $f).png" --frame=$f --props="$PROPS/still.json" --public-dir="$EP/remotion/public" --gl=swangle --scale=0.4 --timeout=180000 --log=error; echo "t=$s"; done ;;
  render) cd "$RC" && FR=""; [ $# -ge 2 ] && FR="--frames=$1-$2"; OUT="$EP/video_sin_audio${3:-}.mp4"
          npx remotion render projects/orc-noche/index.tsx Noche "$OUT" $FR --props="$PROPS/render.json" --public-dir="$EP/remotion/public" --gl=swangle --concurrency=3 --timeout=300000 --muted --crf=16 --log=error ;;
  cover) cd "$RC" && npx remotion still projects/orc-noche/index.tsx Noche "$EP/portada.png" --frame=60 --props="$PROPS/cover.json" --public-dir="$EP/remotion/public" --gl=swangle --timeout=300000 --log=error ;;
  audio) cd "$EP" && MUSIC_DUCK=0.22 MUSIC_FULL=0.42 python3 "$SERIE/tools/mezcla.py" "$EP" artifacts/sfx.json audio.wav ;;
  final)
    cd "$EP"
    ffmpeg -v error -y -i video_sin_audio.mp4 -i portada.png -i audio.wav -filter_complex "[1:v]scale=1080:1920,format=yuv420p,setsar=1,loop=loop=0:size=1,setpts=N/30/TB[c];[0:v]format=yuv420p,setsar=1,trim=start_frame=1,setpts=PTS-STARTPTS[v];[c][v]concat=n=2:v=1:a=0[out]" \
      -map "[out]" -map 2:a -r 30 -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart orcave_patinillo_noche.mp4
    ffprobe -v error -show_entries format=duration -of compact orcave_patinillo_noche.mp4
    python3 ../verificar.py beats.json orcave_patinillo_noche.mp4 2>&1 | grep -v -E "Warn|warn" ;;
esac
