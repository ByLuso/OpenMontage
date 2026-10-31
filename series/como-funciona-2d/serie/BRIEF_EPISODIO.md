# BRIEF DE EPISODIO · «Cómo funciona X» (@destripando.cosas) · v4 (reconstruida el 31-10-2026)

Serie de TikTok en español de España. Vídeo vertical 1080×1920, 30 fps, animación 2D en Remotion sobre fondo azul noche, voz Gemini TTS (Puck, es-ES), subtítulos palabra a palabra, música de fondo suave y efectos.
Esta versión sustituye a la anterior, que se perdió. Todo lo que hay aquí manda.

## 1. Qué entregas (todo en `projects/como-funciona/<slug>/`)
- `beats.json`: LISTA DE CADENAS, una por beat (frase de voz). Nada más.
- `meta.json`: `{"n", "slug", "comp_id", "tema", "formato": "medio", "portada", "cta", "tiktok_gancho", "tiktok_hashtags", "hospital": bool, "ganchos_descartados": [...]}`.
- `fuentes.md`: tabla `| Dato del guion | Fuentes (≥2 URL completas por fila) | Estado |`. Estado = Verificado / **Aproximado** (si es una cifra redondeada o un rango) con explicación.
- `publicacion.md`: título, portada, descripción de TikTok (bloque copiable) y notas.
- `artifacts/cues.json`: efectos de sonido `[[beat, "palabra", "efecto", volumen], ...]` (beat 1-based; efectos disponibles: bubbles, click, ding, hiss, hum, metal, pop, rewind, stamp, sting, tick, whoosh; volumen 0,2-0,4; 6-12 efectos por vídeo; nada antes de 2 s salvo el whoosh automático).
- `remotion/`: copia de `serie/plantilla/remotion/` con `Composition.tsx` (episodio), `<Objeto>.tsx` (dibujos SVG), `Cover.tsx`, `index.tsx`. NO toques `serie/`.
- `snapshots/`: capturas revisadas.

## 2. Formato MEDIO (obligatorio)
- 170-215 palabras en total, 11-14 beats, 12-20 palabras por beat (el último ≤13). Duración final 60-80 s (la voz va a ~2,85 palabras/s).
- 2-3 beats de curiosidades o trucos verificados, señalados con «Curiosidad:», «Otra:» o «Truco:».
- Estructura: beat 1 gancho → beat 2 entrega la promesa → «La idea clave: …» → pasos «Primero / Segundo / Tercero / Cuarto» → curiosidades/trucos → cierre corto que resume.
- Lenguaje de calle, frases cortas, segunda persona («tu lavadora»). Números escritos en palabras si se leen («doscientos sesenta grados»); años en cifra («1981»).

## 3. GANCHO (beat 1) — estilo que pide el usuario
Voz de quien DESTRIPA el aparato delante de ti, con promesa fuerte y, si la hay, la historia del invento. Plantillas:
- «Todos creen que [X]… y están muy equivocados.»
- «Voy a abrir [X] y te juro que lo que hay dentro te va a volar la cabeza.»
- «[X] esconde [una historia / un secreto] que casi nadie conoce.»
- «Así se ve [X] por dentro, y te juro que no te lo esperas: …»
Reglas: tiene que ser VERDAD y cumplirse en el beat 2. PROHIBIDO inventar experiencias personales («encontré esto en un mercado», «llevo años…»). ≤20 palabras.
`portada` (≤5 palabras) resume la promesa; la última palabra es la clave (sale en amarillo). Es también el `HOOK` de `Composition.tsx`.

## 4. Datos
- Cada dato con ≥2 fuentes fiables que hayas ABIERTO de verdad (organismos oficiales, universidades, enciclopedias, fabricantes sin nombrarlos en el vídeo). Wikipedia solo como una de las dos.
- Nada de marcas en guion ni en pantalla.
- `tiktok_gancho`: «¿Sabías que …? <emoji> <pregunta>», con un dato verificado que NO aparezca en ningún beat y una pregunta distinta del CTA. `tiktok_hashtags`: 5, empezando por `#comofunciona` y terminando por `#aprendeentiktok`.
- CTA fijo: «Sígueme y el próximo aparato lo eliges tú.» (lo pone el `<Outro>`; NO va en `beats.json`).

## 5. Especial hospital (solo si `hospital: true`; uno por tanda)
Sin consejos médicos ni interpretación de resultados («eso lo decide tu médico»). Personas como siluetas neutras. Sangre esquemática (#E53935). Portada con «ESPECIAL HOSPITAL» (`HOSPITAL = true` en `Cover.tsx`).

## 6. Estilo visual
- Fondo `<Bg/>` azul noche. Dibujos SVG planos, limpios, grandes (el objeto ocupa ~60 % del ancho), con colores de código: naranja `#FF7A1A` = calor/energía, cian `#35C4F0` = frío/agua/aire, amarillo `#FFD23F` = lo importante/corriente, blanco = texto y vapor, rojo `#E53935` = error/peligro. Grises azulados para carcasas (`#2B4A72`, `#3E6AA0`, `#9FB3CC`).
- Cada beat es una `<Scene>` con su dibujo, un `<Chip>` arriba con el título de la sección y 1-3 `<Label>`. Movimiento continuo (algo gira, fluye, late) y cambios atados a palabras: `Wd(beat, "palabra")`.
- Beat 1: el objeto GRANDE en el centro desde el fotograma 0 (se ve detrás del `<HookTitle>`, que hace de portada los primeros 1,8 s). Al decir la palabra clave, algo se abre (corte que se separa, tapa que se levanta).
- Zonas seguras: texto entre x 60-1020 e y 260-1150. Los subtítulos ocupan y 1190-1420. Nada importante en x > 940 entre y 900-1420 (botones de TikTok). La marca de agua translúcida va en y ≈ 900 (no pongas texto pequeño ahí).
- Etiquetas: nunca dos en el mismo sitio a la vez (si una sustituye a otra, la segunda entra cuando la primera ya ha salido). Nada cortado por los bordes. Ninguna escena vacía al empezar (los elementos que entran después se ven atenuados desde el inicio).
- Mantén `<HookTitle>`, `<Captions>`, `<Outro question="Sígueme" sub="y el próximo aparato lo eliges tú">`, `<Watermark>` y `{debug && <SafeZones/>}` tal cual vienen en la plantilla.

## 7. Cómo probar (sin voz real)
La voz la genera el coordinador. Tú haz un `timing.json` provisional en `remotion/` con `python3 serie/tools/fake_timing.py <slug>` y capturas con:
```
bash serie/tools/stage.sh <slug>
cd ../../remotion-composer && node projects/_tools/stills.mjs <slug> <CompId> 0.5 1 /tmp/claude-0/<slug>_s t1 t2 ...
cd ../projects/como-funciona && python3 serie/tools/sheet.py /tmp/claude-0/<slug>_s /tmp/claude-0/<slug>_sheet 9
```
Revisa las hojas con Read y corrige. Haz como máximo ~40 capturas (CPU compartida). Nunca renderices el vídeo completo.

## 8. Al terminar responde con
Palabras totales y por beat, el guion, datos Aproximados, portada, `tiktok_gancho`, problemas pendientes y lista de archivos.
