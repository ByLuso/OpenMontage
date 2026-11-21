# Publicación · ep. 152 · Cómo funciona el mando a distancia de la tele

**Título:** Cómo funciona el mando a distancia de la tele (infrarrojos)
**Portada:** «HABLA CON LUZ **INVISIBLE**» + chip «CÓMO FUNCIONA · 152» (mando abierto: tapa con botones levantada, placa con chip y el led infrarrojo encendido). Captura en `snapshots/portada.png`.

## Descripción de TikTok (copiar)
```
¿Sabías que el primer mando de ultrasonidos, de 1956, no llevaba pilas: era puramente mecánico? 🔨 ¿Cuántos mandos tienes ahora mismo en el salón?

Botón, código, luz que parpadea y tele que escucha: así cambia de canal tu mando 📺

#comofunciona #mandoadistancia #infrarrojos #tecnologia #aprendeentiktok
```

## Notas
- Sin marcas en el guion ni en pantalla: mando, tele, móvil, «pistola de luz» de 1955 y mando de ultrasonidos de 1956 son genéricos. Los nombres de los modelos históricos y de su fabricante solo aparecen en `fuentes.md`.
- Datos aproximados (detalle en `fuentes.md`): «unas treinta y ocho mil veces por segundo» (38 kHz es la portadora más común; hay mandos de 30 a 56 kHz); «casi nunca sirve con otra marca» (protocolos no estándar; los mandos universales y algunos fabricantes comparten protocolo); truco de la cámara (algunas cámaras, sobre todo traseras, filtran el infrarrojo); «algunos perros oían el ultrasonido» (anécdota recogida en varias fuentes, sin estudio).
- En pantalla el parpadeo se ve a 8 cambios/s y las ráfagas muy espaciadas: es imposible dibujar 38 000 parpadeos por segundo; la lupa del beat 6 lo representa.
- El destello en el visor del móvil se dibuja blanco-lila neutro (según la cámara se ve blanco, morado o rosa).
- Timing provisional (`fake_timing.py`, 76,8 s). Los años «1955» y «1956» se leen largos («mil novecientos cincuenta y cinco»): con la voz real los beats 11 y 12 durarán algo más. Comprobad que «esperas» (beat 1, primer efecto) cae después de 2 s (en el provisional, 3,2 s).
