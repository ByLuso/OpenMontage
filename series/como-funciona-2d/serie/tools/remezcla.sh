#!/bin/bash
# Cambia la música de un vídeo ya renderizado sin volver a renderizar la imagen. Uso: remezcla.sh <slug> <musica.mp3>
set -e
CF=/home/user/OpenMontage/projects/como-funciona; cd $CF
E=$1; M=$2; P=$E/remotion/public
cp $M $P/music.mp3
python3 serie/tools/sfx_times.py $E > /tmp/claude-0/${E}_sfx.json
python3 serie/tools/mezcla.py $E /tmp/claude-0/${E}_sfx.json /tmp/claude-0/${E}_audio.wav >/dev/null
ffmpeg -v error -y -i $E/$E.mp4 -i /tmp/claude-0/${E}_audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart /tmp/claude-0/${E}_new.mp4
mv /tmp/claude-0/${E}_new.mp4 $E/$E.mp4; echo "$E OK"
