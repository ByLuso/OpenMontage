# Publicación · ep. 161 · Cómo funciona la raqueta eléctrica matamosquitos

**Título:** Cómo funciona la raqueta eléctrica matamosquitos
**Portada:** «DOS PILAS, MILES DE **VOLTIOS**» + chip «CÓMO FUNCIONA · 161» (raqueta con el mango abierto y las dos pilas a la vista, la rejilla encendida en amarillo con chispitas y el LED verde). Captura en `snapshots/portada.png`.

## Descripción de TikTok (copiar)
```
¿Sabías que la raqueta matamosquitos eléctrica se patentó en 1996? 🦟 ¿Tú eres más de raqueta o de zapatilla?

Dos pilas, un oscilador, una escalera de diodos y una rejilla de tres capas: así convierte tres voltios en miles ⚡ Y ojo: la rejilla no se toca, ni se acerca a personas o animales.

#comofunciona #matamosquitos #ciencia #electronica #aprendeentiktok
```

## Notas
- Sin marcas en el guion ni en pantalla: raqueta, pilas y componentes genéricos. Las marcas solo aparecen en `fuentes.md` (fichas y manuales).
- Seguridad: el beat 9 deja claro que tocar la rejilla da un calambrazo (sin decir que «no pasa nada») y el beat 10 dice que no se toque ni se acerque a personas o animales. En pantalla nunca se ve a una persona ni a un animal recibiendo la descarga: solo señales de prohibido. Sin consejos médicos.
- Datos aproximados (detalle en `fuentes.md`): «miles de voltios» (lo típico es ~1.000-3.000 V; Wikipedia da 500-3.000 V); «dos pilas de voltio y medio» (hay modelos recargables de litio); «calambrazo» (las fuentes hablan de un picotazo/sacudida; ninguna dice «painful»); «tres mil voltios por milímetro» (valor de referencia, cambia con presión, humedad y forma de los electrodos); «trueno en miniatura» (comparación).
- No se dicen los polos (+/−) de las capas: las fuentes no coinciden. Tampoco la separación entre capas (no hay fuente).
- Dato que no cabía: la chispa puede prender alcohol o colonias en la piel (caso clínico en PMC4441306). Puede ir en un comentario fijado si hace falta.
- Timing provisional (`fake_timing.py`, 78,2 s). Con la voz real a ~2,85 palabras/s (214 palabras) debería quedar en ~75-78 s, cerca del máximo de 80: si la voz sale lenta, recortar el beat 10 o el 12. Con la voz real, comprobad que «miles» (beat 1, primer efecto) cae después de los 2 s (en el provisional cae a 5,0 s).
