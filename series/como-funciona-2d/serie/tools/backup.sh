#!/bin/bash
# Copia de seguridad del código y textos de la serie en git (series/como-funciona-2d/) y push a la rama de trabajo.
# Excluye vídeos, voz, música y capturas (se regeneran). Uso: bash serie/tools/backup.sh "mensaje"
set -e
cd /home/user/OpenMontage
rm -rf series/como-funciona-2d && mkdir -p series/como-funciona-2d
(cd projects/como-funciona && find . -type f ! -name '*.mp4' ! -name '*.mp3' ! -path '*/snapshots/*' ! -path '*/node_modules/*' \( ! -name '*.wav' -o -path './serie/sfx/*' \) -print0 \
  | xargs -0 -I{} cp --parents {} ../../series/como-funciona-2d/)
git add series/como-funciona-2d
git commit -q -m "${1:-como-funciona 2D: copia de seguridad}" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013BVWdUfedgL5hJSKE9bZ7n" || echo "(sin cambios)"
for i in 1 2 3 4; do git push -q -u origin claude/zealous-pascal-d0s2ic && break || sleep $((2**i)); done
echo "backup OK"
