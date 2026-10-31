#!/bin/bash
# Voz + public/ + capturas con tiempos reales. Uso: bash serie/tools/prep.sh <slug> <CompId> [--no-tts]
set -e
CF=/home/user/OpenMontage/projects/como-funciona; cd $CF
E=$1; ID=$2
if [ "$3" == "--no-tts" ]; then echo "(reutiliza voz_raw.wav)"; fi
python3 serie/tools/voz.py $E 2>&1 | grep -v -i "warn" | tail -18
P=$E/remotion/public; mkdir -p $P/sfx $P/fonts
cp serie/sfx/*.wav $P/sfx/; cp serie/fonts/* $P/fonts/
cp $E/artifacts/timing.json $E/remotion/timing.json
bash serie/tools/stage.sh $E >/dev/null
T=$(python3 -c "
import json;t=json.load(open('$E/artifacts/timing.json'))
xs=[0.05]+[round(b['s']+(b['e']-b['s'])*f,1) for b in t['beats'] for f in (0.3,0.85)]+[t['voiceEnd']+1.2]
print(' '.join(map(str,xs)))")
rm -rf $E/snapshots/real; mkdir -p $E/snapshots/real
cd /home/user/OpenMontage/remotion-composer
node projects/_tools/stills.mjs $E $ID 0.5 0 ../projects/como-funciona/$E/snapshots/real $T 2>&1 | tail -1
cd $CF; python3 serie/tools/sheet.py $E/snapshots/real /tmp/claude-0/real_$E 9 | tail -3
