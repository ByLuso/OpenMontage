# Modelo 3D · tostadora (1 unidad = 10 cm, base en y = 0, corte por el frente)

| Pieza | Geometría | Tamaño relativo | Material | Color | Beat(s) |
|---|---|---|---|---|---|
| Carcasa (4 muros, base y 5 tiras de tapa) | cajas redondeadas (`RoundedBoxGeometry`) | 2,8 × 1,9 × 1,7 | aluminio cepillado #C9D2DC; caras interiores #2A3A52 | neutro | 1, 4, 13, 14, 16 |
| Ranuras | huecos entre las tiras de la tapa | 2,0 × 0,38 | — | — | 1 |
| Placas de mica (×3) | caja fina | 1,9 × 1,4 × 0,02 | mica translúcida #D9C9A8 | neutro (destello en el 9) | 8, 9 |
| Resistencias de nicromo (×4 caras) | tubo por zigzag de 12 picos | Ø 0,03 | gris → emisivo | naranja #FF7A1A con calor | 1, 3, 5, 8, 10 |
| Rebanadas de pan (×2) | extrusión de silueta con copete y bisel | 1,5 × 1,35 × 0,17 | miga con textura de poros + corteza | crema → dorado → negro | 4, 5, 10, 11, 13, 15 |
| Carro (bandejas + trineo) | cajas | 1,7 × 0,03 × 0,16 | acero | neutro | 6, 13 |
| Palanca | caja redondeada | 0,3 × 0,14 × 0,42 | plástico oscuro | neutro | 6 |
| Muelle | tubo helicoidal escalado en y | Ø 0,14, 0,14-0,88 de alto | acero | neutro | 6, 13 |
| Electroimán | cilindro + bobina helicoidal | Ø 0,2 | acero + cobre | cian #35C4F0 encendido | 7, 13 |
| Placa del temporizador | caja + chips + condensador | 0,42 × 0,5 | PCB #1E6B47 | neutro | 12 |
| Rueda del tostado | cilindro con marca | Ø 0,27 | plástico oscuro + marca amarilla | — | 12 |
| Guías de alambre, eje, cable y patas | cilindros y tubos | — | acero / plástico oscuro | neutro | — |

**Rutas de flujo**
- Corriente (amarilla): por el zigzag de la cara delantera de la placa central mientras hay calor (beats 6-13 y 14).
- Calor radiante (naranja): 60 carriles rectos de placa → pan (4 caras × 15 puntos) en los beats 5 y 10-11.
- Vapor (blanco): partículas que suben desde el borde del pan en los beats 10-11.

**Corte:** plano z ≤ c, con c animado de 1,0 a 0,42 entre 1,6 y 4,4 s (se quita la pared frontal y la placa delantera). Se cierra en el cierre. El pan delantero no se recorta: se atenúa en los beats 8-9 para ver la resistencia. La pared lateral derecha se vuelve translúcida en los beats 6-7 y 12-13.

**Presupuesto:** ~120k triángulos con el personaje. Partículas con `Points` aditivos. Nada descargado; todo es procedural.
