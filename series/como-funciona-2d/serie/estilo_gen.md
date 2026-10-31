# Capa de personaje (sustituye a la capa generativa de la v3) · opción A, coste 0

## 1. Decisión
La calibración del 2026-10-04 dio estos resultados:
- La clave de Google está en el **nivel gratuito**: cuota 0 para los modelos de imagen y para Veo (error 429 sin coste). Imagen 4 no existe para esta clave (404).
- Con facturación, cada vídeo costaría unos 10-26 $ con 7 clips de Veo. No compensa para una cuenta que empieza.
- **La voz de Gemini TTS sí funciona gratis.** La voz de la serie no cambia.

Por eso **los beats GEN pasan a ser beats PJ**: el personaje y el escenario se hacen en 3D procedural, en el mismo lienzo que los beats TECH. Si algún día se activa la facturación, las secciones 8.3-8.5 de la v3 siguen siendo válidas (ver el anexo).

## 2. Tipos de beat
| Tipo | Se usa para | Se hace con |
|---|---|---|
| **PJ** | Gancho (beat 1, primeros 3 s en acción), historia o antecedente, el personaje reaccionando, mito o remate, cierre | `Guide` + objeto protagonista + atrezo procedural (fuego, herramientas, objetos en la mano) |
| **TECH** | Componentes en orden de flujo, cifras, medidores, corte transversal, "idea clave" | Kit3D (corte, flujos, brillos, etiquetas ancladas, medidores) |

- PJ y TECH comparten mundo, luz y cámara. La transición es **un movimiento de cámara continuo** (dolly o travelling desde el personaje hacia el aparato), nunca un corte.
- En `sb_src.json`, cada beat lleva `tipo: "PJ" | "TECH"`. Los PJ llevan además `accion_personaje` (pose y acción en una frase) y `atrezo` (lo que hay en escena además del aparato).

## 3. Estilo de los beats PJ
- Mismo fondo azul noche con profundidad, suelo con reflejo tenue y luz de tres puntos: principal cálida y borde cian. El núcleo y los ojos cian del personaje casan con la luz de borde.
- El personaje a escala aproximada 0,6, junto al aparato. El aparato es el protagonista; el personaje lo acompaña.
- Atrezo procedural, siempre con los colores semánticos: fuego y calor en naranja (#FF7A1A), corriente en amarillo (#FFD23F), frío en cian (#35C4F0), vapor en blanco.
- Un gesto claro por beat: susto con salto, señalar, sujetar, celebrar, dudar, advertir o saludar.
- Sin texto dentro del 3D: todo el texto va en la capa 2D.

## 4. Presupuesto y rendimiento (medido en el piloto)
- **Coste por episodio: 0 €.** Voz con Gemini TTS en su cupo diario gratuito y música de Pixabay.
- **Capturas a media resolución:** 7-20 s cada una con `serie/tools/stills.mjs`, que empaqueta una sola vez.
- **Vídeo completo de unos 98 s:** ver la sección de entrega del piloto en `tostadora3d/NOTAS_PILOTO.md`.
- **Sin GPU:** el bloom se sustituye por sprites aditivos (`Glow`). Las sombras (PCF suave) y el corte con `clippingPlanes` funcionan con `--gl=swangle`.

## Anexo: si se activa la facturación de Google
Lo que admiten de verdad las herramientas:
- **`google_imagen`:** solo modelos Gemini de imagen (`gemini-3-pro-image` y similares) en 9:16, con `reference_image_paths`, que se añadió en esta calibración.
- **`veo_video`:** imagen→vídeo en 9:16, clips de 4, 6 u 8 s (en 1080p, solo 8 s), y audio siempre generado (se descarta).
- **Coste aproximado:** 0,04-0,13 $ por imagen; 1,20 $ (fast) o 3,20 $ (estándar) por clip de 8 s.
- **Uso razonable:** como mucho 1-3 clips por episodio, solo para el gancho. Los beats PJ en 3D son el respaldo, así que nunca bloquean el episodio.
