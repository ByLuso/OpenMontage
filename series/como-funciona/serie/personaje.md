# Personaje guía · serie "Cómo funciona X" (@destripando.cosas)

**Nombre de trabajo:** el Guía de Porcelana.
**Versión:** v3-A, en 3D procedural y gratis. Ya no se usan Imagen ni Veo.
**Código:** `serie/remotion3d/Guide.tsx`. Cada episodio lo copia tal cual con el Kit3D.

## Diseño (original)
- Esqueleto humano estilizado de **porcelana blanca brillante** (clearcoat), con **grietas doradas tipo kintsugi** en el cráneo, las clavículas, las costillas y la pelvis.
- **Núcleo cian luminoso** (#35C4F0) dentro de la caja torácica, que late suavemente. Ilumina las costillas desde dentro y brilla más cuando el aparato "se enciende" (prop `coreBoost`).
- Cráneo redondeado y grande (simpático, no tétrico). **Ojos grandes**: cuencas oscuras con iris cian luminoso y un punto de brillo; parpadea solo.
- Sin nariz. Boca tallada que cambia con la expresión. Cejas de porcelana.
- Manos articuladas: palma y cuatro dedos de dos falanges, más pulgar.
- Sin ropa, sin logos y sin texto.

## Por qué en 3D y no con IA generativa
- **Coste 0**: se renderiza en el contenedor.
- **Consistencia total**: es el mismo modelo en todos los episodios. No hace falta prueba de consistencia; la de la v3 con Imagen queda superada por construcción.
- **Mismo mundo que los planos técnicos**: misma luz, suelo y cámara, así que no hay "salto de estilo" entre los beats del personaje y los técnicos.

## Uso en Remotion
```tsx
import { Guide, POSES, mixPose } from "./kit3d/Guide";
import { keyed } from "./kit3d/anim";

const pose = keyed(frame, [
  { f: 0, v: POSES.peek },
  { f: 40, v: POSES.surprise },
], mixPose);

<Guide pose={pose} frame={frame} position={[-2.55, 0, 0.75]} rotationY={0.85} scale={0.62} />
```
- **Altura:** unas 4,4 unidades a escala 1. En el piloto se usa a escala 0,62, unos 2,7 u, junto a una tostadora de 1,9 u.
- **Poses (`POSES`):** `idle`, `surprise`, `peek` (asomado), `point` (señala hacia +x), `cheer`, `think` (duda, mano al mentón), `hold` (sujeta algo delante), `showTwo` (un objeto en cada mano), `wagNo` (dedo arriba: "ni se te ocurra"), `wave` (saludo).
- **Expresión** dentro de la pose: `eyeOpen` (0,6-1,4), `look` [x, y], `smile` (−1 duda · 0 · 1 alegría · 2 "¡oh!") y `brow` (−1 a 1).
- **Movimiento secundario recomendado:** salto breve (`root[1]`) en los sustos y los "¡pop!", y oscilación del antebrazo en `wagNo` y `wave`. Ver `tostadora3d/remotion/Composition.tsx`.
- **Objetos en la mano:** se colocan flotando a la altura de la mano, en coordenadas del mundo. Las posiciones de referencia del piloto están en el beat 15.

## Reglas
- Aparece en el gancho (los primeros 3 s, en acción), en la historia, en el remate y en el cierre (saluda).
- En los beats técnicos puede quedarse a un lado del aparato (`point`), pero nunca tapa el mecanismo.
- **Nunca** muestra solo un dato técnico ni una cifra: los datos van en los planos técnicos o en una etiqueta 2D.
