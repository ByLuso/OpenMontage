#!/bin/bash
# SessionStart hook for Claude Code on the web: installs Python deps, yt-dlp,
# Remotion node_modules, and makes headless Chromium trust the agent proxy CA.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Python dependencies (+ yt-dlp for source_ingest)
pip install -q -r requirements-dev.txt yt-dlp 2>&1 | grep -v "Running pip as the 'root' user" || true

# Remotion composer
if command -v npm >/dev/null 2>&1; then
  (cd remotion-composer && npm install --no-audit --no-fund --loglevel=error)
fi

# Let Remotion's headless Chromium trust the proxy CA (otherwise Google Fonts
# fail with ERR_CERT_AUTHORITY_INVALID and renders abort).
CA_BUNDLE=/root/.ccr/ca-bundle.crt
if [ -f "$CA_BUNDLE" ]; then
  if ! command -v certutil >/dev/null 2>&1; then
    (apt-get install -y -q libnss3-tools >/dev/null 2>&1 \
      || (apt-get update -q >/dev/null 2>&1 && apt-get install -y -q libnss3-tools >/dev/null 2>&1)) || true
  fi
  if command -v certutil >/dev/null 2>&1; then
    NSSDB="sql:$HOME/.pki/nssdb"
    mkdir -p "$HOME/.pki/nssdb"
    certutil -d "$NSSDB" -L >/dev/null 2>&1 || certutil -d "$NSSDB" -N --empty-password
    tmpdir=$(mktemp -d)
    csplit -s -z -f "$tmpdir/ca-" "$CA_BUNDLE" '/-----BEGIN CERTIFICATE-----/' '{*}'
    i=0
    for f in "$tmpdir"/ca-*; do
      certutil -d "$NSSDB" -A -t "C,," -n "ccr-proxy-$i" -i "$f" || true
      i=$((i + 1))
    done
    rm -rf "$tmpdir"
  fi
fi
