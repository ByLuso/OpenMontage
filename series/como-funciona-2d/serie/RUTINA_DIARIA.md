# Rutina diaria · @destripando.cosas (dos tareas programadas: MAÑANA = entregar, TARDE = fabricar)

**Regla del usuario (21-11): lo primero que ve al despertarse son las descripciones.** Por eso la mañana SOLO sube y manda las descripciones, sin ningún otro mensaje antes ni después. Fabricar va por la tarde.

Objetivo: **3 vídeos al día** en la bandeja de TikTok del usuario + sus descripciones en el chat. Los vídeos se fabrican en **tandas de 6** (1 de hospital por tanda) y se entregan de 3 en 3.

Estado: `projects/como-funciona/cola.json` → `{"listos": [slug, ...], "entregados": [slug, ...]}` (en orden).

## MAÑANA (8:42): pasos 1, 2 y 3. Nada más.
El mensaje del paso 3 es el ÚNICO de la mañana: no escribas avisos, informes ni «voy a…» antes ni después. Si algo falla, una línea al final de ese mismo mensaje.

## TARDE (16:13): pasos 1 (sin TikTok), 4 y 5
Fabricar si en `listos` quedan menos de 6. Trabaja en silencio: sin mensajes intermedios; al terminar, una sola línea («Tanda <n1>-<n6> lista: N vídeos en cola»).

## Pasos
1. **Comprobar el entorno** (desde `/home/user/OpenMontage`):
   - Si no existe `projects/como-funciona/`, restaurarla desde git: `git fetch origin claude/zealous-pascal-d0s2ic && git checkout origin/claude/zealous-pascal-d0s2ic -- series/como-funciona-2d && mkdir -p projects && cp -r series/como-funciona-2d projects/como-funciona && git rm -r -q --cached series/como-funciona-2d && rm -rf series/como-funciona-2d`.
   - Si falta `serie/musica/bed.mp3` (música «Funky», no está en git por licencia): pedírsela al usuario en el chat y usar mientras `bed_sint.mp3` solo si el usuario lo acepta; si no, entregar esa jornada sin música no: esperar.
   - Si `python3 serie/tools/tiktok.py status x` dice «No hay tokens», el permiso de TikTok se ha perdido: generar `auth-url`, pedir al usuario la dirección de vuelta y hacer `exchange`. Mientras tanto, entregar los vídeos en el chat (SendUserFile).
   - Instalar si faltan: `pip install faster-whisper`, `av==14.4.0` si `av` falla (o usar el arreglo ya presente en voz.py).
2. **Entregar 3**: los 3 primeros de `listos` → para cada uno:
   - `python3 serie/tools/tiktok.py upload <slug>/<slug>.mp4` (recodifica y sube a la bandeja).
   - Pasarlo a `entregados` en `cola.json`.
3. **Mensaje al usuario** (corto y limpio), con este formato exacto por vídeo:
   ```
   **<N> · <Título>**
   ```(bloque de código con la descripción: «¿Sabías que…?» + línea en blanco + hashtags)```
   ```
   Al principio, una línea: «Tienes 3 vídeos nuevos en tu bandeja de TikTok. Pega la descripción y activa "Contenido generado por IA".» Al final, nada más (sin informes técnicos salvo que algo falle).
4. **Fabricar la siguiente tanda** (solo por la TARDE) si en `listos` quedan menos de 6: 6 episodios nuevos (n consecutivos tras el último de `progreso.md`), 1 de hospital, temas que no estén ya en `progreso.md`, con agentes según `serie/BRIEF_EPISODIO.md` (gancho estilo §3). Después, para cada uno: `prep.sh` → revisar las hojas de capturas → corregir → `render.sh` → comprobar ✅. Solo los que pasan van a `listos`. Si el límite de uso corta el trabajo, seguir en la siguiente ejecución.
   - Si por la mañana hay menos de 3 en `listos`, entregar los que haya y decirlo en una línea al final del mensaje; la tarde fabrica.
5. **Guardar**: añadir las filas a `progreso.md` y ejecutar `bash serie/tools/backup.sh "tanda <n1>-<n6>"`.

## Reglas
- TikTok admite como mucho unos 5 borradores pendientes sin abrir («spam_risk_too_many_pending_share»). Si sale ese error, no reintentar: entregar ese vídeo al día siguiente y avisar al usuario de que abra/publique los que tiene.
- Nunca publicar nada fuera de la bandeja (solo `upload`, que deja borradores).
- No subir un vídeo con ❌ sin revisar a mano; si no se puede arreglar, no se entrega y se dice en una línea.
- Datos verificados con ≥2 fuentes, sin marcas, sin consejos médicos (ver BRIEF).
