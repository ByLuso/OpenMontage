# Serie "Cómo funciona X" (@destripando.cosas) · v3-A (3D procedural, coste 0)

Copia de seguridad versionada de la serie. `projects/` está en `.gitignore`, así que el trabajo vivo se hace allí y se guarda aquí.

**Restaurar en una sesión nueva:**
```bash
mkdir -p projects && cp -r series/como-funciona projects/
cd projects/como-funciona
# música del bed (licencia de Pixabay: no se redistribuye en el repo)
python - <<'PY'
import sys; sys.path.insert(0, "../..")
from tools.tool_registry import registry; registry.discover()
registry._tools["pixabay_music"].execute({"query": "explainer atlasaudio", "min_duration": 100, "output_path": "serie/musica/bed_explainer_atlasaudio.mp3"})
PY
```

**Contenido**
- `serie/remotion3d/`: Kit3D (escena, cámara, corte, flujos, brillos, piezas) y el personaje guía (`Guide.tsx`).
- `serie/remotion/Kit.tsx`: capa 2D (subtítulos, etiquetas, línea de tiempo, medidor, intro, cierre).
- `serie/tools/`:
  - `voz.py`: Gemini TTS + alineación palabra a palabra.
  - `sfx.py`: efectos sintetizados.
  - `stage.sh`: copia el código a `remotion-composer`.
  - `stills.mjs`: capturas.
  - `sheet.py`: hojas de contacto.
- `serie/personaje.md`, `serie/estilo_gen.md`: personaje y capa de personaje (opción A).
- `tostadora3d/`: episodio piloto. Faltan `public/` (voz, música, efectos y fuentes) y el vídeo, que se regeneran.

**Flujo de un episodio (desde `projects/como-funciona/`)**
1. Escribir `beats.json`, `fuentes.md`, `meta.json`, `sb_src.json` y `model3d.md` (ver el brief).
2. Generar la voz: `python serie/tools/voz.py <slug>` (crea `remotion/public/voz.wav` y `artifacts/timing.json`; copia `timing.json` a `remotion/`).
3. Preparar `public/`: copiar `serie/sfx/*.wav` a `public/sfx/`, `serie/fonts/*` a `public/fonts/` y el bed como `public/music.mp3`.
4. Copiar el código y hacer capturas:
   ```bash
   bash serie/tools/stage.sh <slug>
   cd ../../remotion-composer
   node projects/_tools/stills.mjs <slug> <CompId> 0.5 0 <dir> t1 t2 ...
   ```
5. Render final:
   ```bash
   npx remotion render projects/cf-<slug>/index.tsx <CompId> out.mp4 \
     --public-dir=../projects/como-funciona/<slug>/remotion/public \
     --gl=swangle --concurrency=3 --timeout=300000
   ```
