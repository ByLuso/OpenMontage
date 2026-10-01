#!/bin/bash
# SessionStart hook: installs OpenMontage dependencies in Claude Code on the web
# so tools, tests and all render runtimes work without manual setup.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Python: core + dev deps (pytest) + yt-dlp for reference-video ingest
pip install --quiet --root-user-action=ignore -r requirements-dev.txt yt-dlp

# Remotion composition runtime
(cd remotion-composer && npm install --no-audit --no-fund --loglevel=error)

# Warm the HyperFrames npx cache (non-fatal if the registry is unreachable)
npx --yes hyperframes --version >/dev/null 2>&1 || echo "hyperframes cache warm skipped"

echo 'export PYTHONPATH="."' >> "$CLAUDE_ENV_FILE"
