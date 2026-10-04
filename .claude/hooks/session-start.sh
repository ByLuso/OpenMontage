#!/bin/bash
# SessionStart hook: installs every OpenMontage tool that runs on a CPU-only
# Claude Code on the web container. Idempotent; each step skips work already done.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

PIP="pip install -q --disable-pip-version-check --root-user-action=ignore"
BLENDER_VERSION="4.5.3"
BLENDER_DIR=".runtime/blender-${BLENDER_VERSION}-linux-x64"
PIPER_MODELS="$HOME/.piper/models"

# --- System packages (Manim: cairo/pango + LaTeX) ---
APT_PKGS="libcairo2-dev libpango1.0-dev pkg-config texlive-latex-base texlive-latex-extra texlive-fonts-recommended dvisvgm"
if ! dpkg -s $APT_PKGS >/dev/null 2>&1; then
  apt-get update -q >/dev/null
  DEBIAN_FRONTEND=noninteractive apt-get install -y -q $APT_PKGS >/dev/null
fi

# --- Python: core + dev ---
$PIP -r requirements-dev.txt

# --- Python: CPU torch first so later packages don't pull CUDA wheels ---
$PIP torch torchvision --index-url https://download.pytorch.org/whl/cpu

# --- Python: local tools ---
$PIP yt-dlp youtube-transcript-api faster-whisper whisperx Pygments \
  mediapipe opencv-python piper-tts transformers accelerate diffusers \
  realesrgan gfpgan "rembg[cpu]" manim

# whisperx pulls a CUDA build of torchaudio from PyPI; swap in the CPU build of the same version.
if ! python -c "import torchaudio" >/dev/null 2>&1; then
  TA_VERSION=$(python -c "import importlib.metadata as m; print(m.version('torchaudio').split('+')[0])")
  $PIP --force-reinstall --no-deps "torchaudio==${TA_VERSION}" --index-url https://download.pytorch.org/whl/cpu
fi

# basicsr (used by realesrgan/gfpgan) imports a module removed in newer torchvision.
BASICSR_DIR=$(python -c "import importlib.util as u; s=u.find_spec('basicsr'); print(s.submodule_search_locations[0] if s else '')")
if [ -n "$BASICSR_DIR" ]; then
  sed -i 's/torchvision.transforms.functional_tensor/torchvision.transforms.functional/' \
    "$BASICSR_DIR/data/degradations.py"
fi

# --- Node: Remotion ---
(cd remotion-composer && npm install --no-audit --no-fund --loglevel=error)

# --- Deno (yt-dlp YouTube support) ---
if [ ! -x "$HOME/.deno/bin/deno" ]; then
  curl -fsSL https://deno.land/install.sh | sh -s -- -y >/dev/null
fi
ln -sf "$HOME/.deno/bin/deno" /usr/local/bin/deno

# --- Blender LTS (portable, under the git-ignored .runtime/) ---
if [ ! -x "$BLENDER_DIR/blender" ]; then
  mkdir -p .runtime
  curl -fsSL "https://download.blender.org/release/Blender${BLENDER_VERSION%.*}/blender-${BLENDER_VERSION}-linux-x64.tar.xz" \
    | tar xJ -C .runtime
fi
ln -sf "$CLAUDE_PROJECT_DIR/$BLENDER_DIR/blender" /usr/local/bin/blender

# --- Piper voices (Spanish + English) ---
mkdir -p "$PIPER_MODELS"
for voice in es/es_ES/davefx/medium/es_ES-davefx-medium \
             es/es_MX/claude/high/es_MX-claude-high \
             en/en_US/lessac/medium/en_US-lessac-medium; do
  name=$(basename "$voice")
  for ext in onnx onnx.json; do
    if [ ! -s "$PIPER_MODELS/$name.$ext" ]; then
      curl -fsSL -o "$PIPER_MODELS/$name.$ext" \
        "https://huggingface.co/rhasspy/piper-voices/resolve/main/$voice.$ext"
    fi
  done
done

# --- Local music library folder (drop royalty-free tracks here) ---
mkdir -p music_library
