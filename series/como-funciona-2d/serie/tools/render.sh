#!/bin/bash
# Render final: vídeo (Remotion) + mezcla de audio (ffmpeg) + portada + comprobaciones.
# Uso: bash serie/tools/render.sh <slug> <CompId>
set -e
CF=/home/user/OpenMontage/projects/como-funciona; cd $CF
E=$1; ID=$2; P=$E/remotion/public
cp $E/artifacts/timing.json $E/remotion/timing.json
bash serie/tools/stage.sh $E >/dev/null
M=serie/musica/bed.mp3; ffprobe -v error $M >/dev/null 2>&1 || M=serie/musica/bed_sint.mp3; cp $M $P/music.mp3
cd /home/user/OpenMontage/remotion-composer
npx remotion render projects/cf-$E/index.tsx $ID /tmp/claude-0/${E}_video.mp4 --public-dir=../projects/como-funciona/$E/remotion/public \
  --props="{\"timing\":$(cat ../projects/como-funciona/$E/artifacts/timing.json | tr -d '\n')}" --concurrency=4 --crf=18 --muted --timeout=180000 2>&1 | grep -E "Rendered|Error|error" | tail -2
npx remotion still projects/cf-$E/index.tsx Portada ../projects/como-funciona/$E/portada.png --timeout=180000 --public-dir=../projects/como-funciona/$E/remotion/public 2>&1 | tail -1
cd $CF
python3 serie/tools/sfx_times.py $E > /tmp/claude-0/${E}_sfx.json
python3 serie/tools/mezcla.py $E /tmp/claude-0/${E}_sfx.json /tmp/claude-0/${E}_audio.wav
ffmpeg -v error -y -i /tmp/claude-0/${E}_video.mp4 -i /tmp/claude-0/${E}_audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $E/$E.mp4
python3 serie/tools/postcheck.py $E 2>&1 | grep -v -i warn
find /tmp -maxdepth 1 -name 'remotion-*' -mmin +1 -exec rm -rf {} + 2>/dev/null || true
