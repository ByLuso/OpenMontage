#!/bin/bash
# hoja de contactos: bash sheet.sh out.png f1.png f2.png ... (4 por fila)
out=$1; shift; n=$#; args=""; for f in "$@"; do args="$args -i $f"; done
lay=$(python3 -c "print('|'.join(f'{(i%4)*432}_{(i//4)*768}' for i in range($n)))")
ffmpeg -v error -y $args -filter_complex "$(for i in $(seq 0 $((n-1))); do echo -n "[$i]scale=432:768[s$i];"; done; for i in $(seq 0 $((n-1))); do echo -n "[s$i]"; done; echo "xstack=inputs=$n:layout=$lay")" $out
