# Notas del piloto · tostadora (v3-A, 3D procedural, coste 0)

**Resultado:** `tostadora3d.mp4`, 1080x1920, 30 fps, 98,6 s (2.958 frames), H.264 + AAC, −16,5 LUFS integrados. Portada en `portada.png`.

## Guion
- **276 palabras en 16 beats:** 17 · 18 · 18 · 16 · 19 · 17 · 16 · 17 · 18 · 18 · 19 · 19 · 18 · 17 · 17 · 12.
- **Reparto:** beats PJ (personaje) 1, 2, 4, 15 y 16; beats TECH 3, 5-14 (en el 14 el personaje celebra de fondo).
- **Aproximado:** "unos seiscientos grados". Las fuentes dan entre 538 y 649 °C; ver `fuentes.md`.
- **Voz:** Gemini TTS `gemini-3.8-flash-tts`, Puck, es-ES, gratis. Tempo final de 2,85 palabras/s; 96 % de las palabras alineadas.

## Rendimiento sin GPU (SwiftShader `--gl=swangle`, 4 núcleos)
- **Capturas a media resolución:** 7-20 s cada una.
- **Vídeo:** unos **2,1 s por frame** con `dpr` 0,7 (el 3D a resolución interna 756x1344; el texto 2D a resolución completa), concurrencia 3. Unos 1 h 45 min por episodio.
- **Límite de 2 h por proceso en segundo plano:** se renderiza en 2 tramos con `serie/tools/render_tramo.sh` y se unen con el filtro `concat` de ffmpeg. `concat -c copy` rompe las marcas de tiempo.
- **Audio:** con `serie/tools/mezcla.py` (ffmpeg). El render de audio de Remotion también evalúa cada frame 3D y tarda casi lo mismo que el vídeo.
- **Bloom:** sustituido por sprites aditivos (`Glow`). Las sombras PCF suaves a 1024 y el corte con `clippingPlanes` funcionan bien.
- **No sirve para 5 vídeos en paralelo** en este contenedor: son unas 9 h por tanda en serie. Recomendación: tandas de 2-3 episodios, o bajar a `dpr` 0,6.

## Comprobaciones
- **Movimiento:** la diferencia media entre el inicio y el final de cada beat está entre 22 y 95. Ningún beat queda quieto.
- **Zonas seguras:** etiquetas limitadas a x 60-940; subtítulos en y 1190-1420.
- **Fallo encontrado y corregido:** cambiar `material.transparent` en caliente no se aplica sin recompilar. El pan se atenuaba en las capturas sueltas pero no en el vídeo; ahora es siempre transparente.

## Pendiente o mejorable
- La carcasa se lee como aluminio translúcido; podría tener más carácter (bordes redondeados grandes y frontal cromado).
- El macro de Maillard es un plano de pan bastante plano: podría acercarse la resistencia al rojo en el borde.
- El vapor del beat 10 se lee como "estrellas" sobre el fondo oscuro.
- Las manos del personaje no agarran de verdad: los objetos flotan a la altura de la mano.
