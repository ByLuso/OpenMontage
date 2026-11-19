---
name: explicador-3d-noche
description: Vídeo explicativo vertical (9:16, ≤90 s) en 3D con estética nocturna cinematográfica — edificio en corte de noche, salones amueblados con luz cálida, maniquí articulado, oclusión ambiental + bloom, rótulos sobrios con letra pequeña monoespaciada — renderizado con Remotion + three.js en CPU. Úsala cuando el usuario pida un vídeo "como el de Orcave", "estilo nocturno", "con la misma calidad que los anteriores", un explicador 3D de instalaciones / climatización / fontanería / cómo funciona algo de una casa, o un vídeo para una empresa con su logo y voz en español de España.
---

# Explicador 3D nocturno (método "Orcave")

Plantilla de referencia ya hecha y aprobada por el usuario ("te han quedado de 10"):
`series/orcave/noche/` (vídeo "válvulas del patinillo", 76 s). **Parte siempre de ella**: copia, cambia guion,
escenario y planos. No empieces de cero ni con el kit 3D antiguo (`series/como-funciona/serie/remotion3d/Scene3D.tsx`
da un aspecto plano y claro que el usuario ya descartó).

Estilo de referencia que el usuario mostró: explicadores 3D de TikTok tipo @m8d_io — noche, interior acogedor con
lámparas cálidas, maniquí liso sin rostro, objetos en "rayos X", cifras grandes y letra pequeña técnica.

## 1. Brief y guion (antes de tocar código)

- Duración **máximo 90 s** (el usuario lo pide expresamente; 120 s "es muy largo"). ~210 palabras ≈ 74 s con TEMPO=1.0.
- Español de España, tono cercano y tranquilizador. Gancho en la primera frase (problema visible), explicación,
  el problema concreto, la solución (el técnico de la empresa), consejo y cierre con marca y eslogan.
- No metas historia/evolución si no la piden. Céntrate en lo que el cliente quiere contar.
- Guarda el guion como `beats.json`: lista de 9–12 frases (un "beat" = una escena).
- Pide al usuario lo que falte: **logo** (archivo), nombre comercial, eslogan, teléfono/web si quieren CTA.

## 2. Montar el proyecto

`projects/` está en `.gitignore`: se trabaja en `projects/<cliente>/<video>/` y **al final se copia a
`series/<cliente>/<video>/`** y se hace commit. Restaurar la plantilla: ver `series/orcave/noche/README.md`.

```
projects/<cliente>/<video>/
  beats.json  montar.sh  sheet.sh  artifacts/{timing.json,sfx.json}
  remotion/  Composition.tsx  Models.tsx  Mannequin.tsx  SceneNight.tsx  Fonts.ts  AssetGLB.tsx  index.tsx  timing.json
  remotion/public/  voz.wav  music.mp3  *.glb  fonts/  sfx/  logo_<cliente>_hd.png
```
En `montar.sh` cambia `DST`, el id de composición y el nombre del mp4 final. Dependencias de remotion-composer:
`npm ci` y, si faltan, `@react-three/postprocessing@2.16.6 postprocessing@6.36.4 n8ao@1.9.4`.

## 3. Recursos (todos gratis)

- **Voz**: `TEMPO=1.0 python3 series/como-funciona/serie/tools/voz.py projects/<...>` (Gemini TTS, voz Puck es-ES,
  escribe `voz.wav` y `artifacts/timing.json` con tiempos por palabra). Luego pon `duration = voiceEnd + ~4.5 s` y
  copia `timing.json` a `remotion/`. Verifica con `python3 series/orcave/noche/verificar.py beats.json voz.wav`
  (similitud ≥ 0,95; las diferencias tipo "instalación es" son de la transcripción).
  - Si falla: `pip install faster-whisper "google-genai==1.47.0" "av<14"` (google-genai 3.x rompe `speechConfig`;
    av ≥14 rompe faster-whisper).
- **Modelos 3D**: Poly Haven (CC0, sin atribución). `series/orcave/tools/fetch.py` (necesita User-Agent, ya lo lleva)
  + `gltf-transform copy` y `center --pivot below` → GLB con base en el suelo. Mira miniaturas
  (`https://cdn.polyhaven.com/asset_img/thumbs/<id>.png`) antes de elegir: muchos muebles son clásicos.
  Lo que no exista moderno, modélalo (sofá con `roundedBox`, lámpara de pie, cuadro con textura de lienzo).
- **Música**: ElevenLabs Music y Pixabay **no funcionan** aquí (plan gratuito / 403). Usa Lyria:
  `python3 series/orcave/tools/musica_lyria.py salida.wav 82` → `ffmpeg ... afade in/out, loudnorm=I=-18` → `music.mp3`.
- **Efectos**: `series/como-funciona/serie/sfx/*.wav`; lista con
  `python3 series/cuerpo/_kit/sfx_lista.py <carpeta> '<json>'` ejecutado desde la carpeta padre.
- **Logo**: `python3 series/orcave/tools/limpiar_logo.py <logo.jpg> remotion/public` → PNG transparente nítido.
  ⚠️ `.gitignore` ignora `logo_*.png`: guárdalo con `git add -f`, o se pierde al reiniciar el contenedor.
- **Fuentes**: Inter 600/800/900 + IBM Plex Mono 400/500 (`@fontsource`), en `public/fonts/`.

## 4. Estética (lo que da la calidad)

- `SceneNight.tsx`: fondo casi negro, `ACESFilmic`, entorno tenue (0,1–0,18), **N8AO + Bloom + Noise + Vignette**.
  Funciona en CPU (`--gl=swangle`) y apenas encarece el render.
- Luz: nada de luz plana. Cada estancia con lámpara de techo (spot con sombra 512) + lámpara de pie (point) cálidas
  (#FFC48A), luna fría tenue, relleno hemisférico bajo. Lo caliente es emisivo para que el bloom lo haga brillar.
- Escenario: edificio en corte (frente abierto), 3 plantas, paredes verde salvia oscuro, tarima de madera (textura
  dibujada en canvas), ventana con ciudad de noche, ciudad lejana, nieve. Rellano/patinillo con fluorescente frío.
- **Maniquí** (`Mannequin.tsx`): poses `sitPose(seat, cold, frame)` (abrazado y temblando ↔ relajado),
  `kneelPose(reach)`, `mixPose`, y `reachRight(...)` (cinemática inversa: la mano llega a un punto 3D y lo sigue).
  Convención: en segmentos que cuelgan, flexión adelante = x negativa; en tronco/cabeza/raíz, x positiva.
  Técnico de la empresa = polo con el color de marca + pantalón marino.
- Rótulos (`Composition.tsx`): subtítulos Inter 800 64 px con palabra activa en color de marca; `Head` (titular
  arriba), `Big` (cifra grande), `Label` (caja oscura translúcida + línea guía a un punto 3D proyectado),
  `Fine` (letra pequeña monoespaciada en mayúsculas, dato técnico), logo fijo arriba a la izquierda en tarjeta blanca,
  tarjeta final con logo + eslogan. Nada de píldoras de colores chillones.

## 5. Cámara y comprobación visual (obligatorio)

- `shot(frame, target, dist, az, el)`: subir `target.y` **baja** el objeto en pantalla (y viceversa); los objetos
  más lejanos que el target salen más arriba. Ajusta mirando fotogramas, no a ojo.
- Antes de renderizar: `bash montar.sh stage && bash montar.sh stills <t1> <t2> ...` en **cada beat** y en las
  transiciones, y `bash sheet.sh hoja.png <pngs>` para verlas juntas. Revisa: nada tapa el objeto clave
  (personajes delante de la válvula), etiquetas no pisan la letra pequeña ni los subtítulos, titulares no se
  solapan en los cruces, cámara no dentro de paredes, encuadres no cortados. Corrige y repite hasta que esté limpio.

## 6. Render y montaje

- ~3,5 s/fotograma (2280 fotogramas ≈ 2 h 15 min). Las tareas en segundo plano mueren a las 2 h y el contenedor
  puede reiniciarse: renderiza **en dos mitades con `nohup`** (`render 0 1139 _a`, `render 1140 2279 _b`) y espera
  con un bucle `until grep -q ...` en segundo plano. Los archivos de `projects/` sobreviven al reinicio.
- Un arreglo pequeño después del render: renderiza solo ese tramo (`render 150 209 _fix`) y empálmalo con ffmpeg
  (`trim` + `concat`) en vez de repetir todo.
- `bash montar.sh cover` (portada = primer fotograma), `audio` (voz + música con ducking + efectos), `final`
  (mp4 + verificación de la voz). Extrae 8–10 fotogramas del mp4 final y míralos antes de enviarlo.

## 7. Entrega

- Envía el mp4 (y la portada) con `SendUserFile`. Incluye descripción para TikTok/Reels con emojis, hashtags en
  español, y aclara licencias (Poly Haven CC0, música Lyria generada).
- Copia las fuentes a `series/<cliente>/<video>/` (incluido el logo con `git add -f`), commit y push.
- Sé honesto en el resumen: qué falta (logo, CTA), qué no has comprobado (p. ej. el volumen de la mezcla).
