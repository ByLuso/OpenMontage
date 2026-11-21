# Publicación · ep. 156 · Cómo funciona un reloj de cuarzo (el de pila)

**Título:** Cómo funciona un reloj de cuarzo (el de pila)
**Portada:** «DENTRO VIBRA UN **CRISTAL**» + chip «CÓMO FUNCIONA · 156» (reloj de pulsera con la esfera levantada, la máquina a la vista y la cápsula del cristal encendida en cian). Captura en `snapshots/portada.png`.

## Descripción de TikTok (copiar)
```
¿Sabías que el truco del cuarzo lo descubrieron dos hermanos franceses en 1880, apretando cristales? ⌚ ¿Tu reloj de pila adelanta o atrasa?

Cristal que vibra, chip que divide y motor que salta: así marca cada segundo tu reloj de pila ⏱️

#comofunciona #reloj #cuarzo #ciencia #aprendeentiktok
```

## Notas
- Sin marcas en el guion ni en pantalla: reloj, pila, chip y laboratorio genéricos. Bell Labs y el modelo de 1969 solo aparecen en `fuentes.md`.
- Dato aproximado (detalle en `fuentes.md`): «unos quince segundos al mes» (cifra típica de un movimiento estándar; ±10-20 s/mes según el modelo).
- En pantalla las vibraciones van a 1,5-6 vaivenes/s (imposible dibujar 32.768) y el motor da un paso por segundo de reloj de vídeo.
- Timing provisional (`fake_timing.py`, 76,8 s; 213 palabras). Con la voz real, comprobad que «cristal» (beat 1, primer efecto, ~5 s) cae después de los 2 s y que la esfera se levanta en «dentro» (~4 s), ya con el título del gancho fuera.
- La cifra «treinta y dos mil setecientas sesenta y ocho» es larga para el TTS: revisad que Puck la lea seguida y sin trabarse.
