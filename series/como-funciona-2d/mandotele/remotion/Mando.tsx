// Dibujos SVG del episodio «Cómo funciona el mando a distancia de la tele (infrarrojos)». Coordenadas absolutas de 1080×1920.
// Colores de código: naranja = luz infrarroja/energía, cian = ultrasonidos/frío, amarillo = lo importante/corriente/código,
// blanco = texto, rojo = error/ruido. Grises azulados para carcasas. Sin marcas: mando, tele y móvil genéricos.
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F", inner: "#0B1A30", board: "#1E5A46", board2: "#2C7A5E",
  gold: "#E0B84A", rubber: "#5B6B82", carbon: "#14181F", screen: "#0A1424", glass: "#16304F", dog: "#C98E5A", dog2: "#8E5E36", noise: "#7C8DA6" };

export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const glow = (c: string, r: number) => ({ filter: `drop-shadow(0 0 ${r}px ${c})` });

/** Código de ejemplo (16 bits): 8 de aparato + 8 de orden. */
export const BITS = [0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0];

/** Destello del led infrarrojo (naranja con halo). */
export const LedGlow: React.FC<{ x: number; y: number; o: number; r?: number }> = ({ x, y, o, r = 46 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r * 1.9} fill={K.hot} opacity={0.18} />
    <circle cx={x} cy={y} r={r} fill={K.hot} opacity={0.45} />
    <circle cx={x} cy={y} r={r * 0.4} fill="#FFD9B8" />
  </g>
);

/**
 * Mando tumbado (horizontal) visto desde arriba. Centro en (x,y); ancho 720·s, alto 220·s; el led está en el extremo derecho.
 * open: la tapa de arriba se levanta (shellDy) y se ve la placa. led: brillo del led. press: índice del botón pulsado (0 = encendido).
 * hi: resalta "chip" | "contacts" | "led".
 */
export const Remote: React.FC<{ x: number; y: number; s?: number; rot?: number; t: number; open?: number; led?: number; press?: number; pressK?: number;
  hi?: string; shellDy?: number; o?: number; id?: string }> = ({ x, y, s = 1, rot = 0, t, open = 0, led = 0, press = -1, pressK = 0, hi = "", shellDy = -280, o = 1, id = "r" }) => {
  const hiG = (k: string) => (hi === k ? glow(K.flow, 14) : undefined);
  const btns: { x: number; y: number; r: number; c: string }[] = [{ x: -290, y: 0, r: 30, c: K.warn }];
  for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) btns.push({ x: -190 + col * 62, y: -58 + row * 58, r: 22, c: C.case3 });
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
      {/* carcasa de abajo */}
      <rect x={-360} y={-110} width={720} height={220} rx={90} fill={C.case1} stroke={C.ink} strokeWidth={6} />
      {/* placa */}
      <rect x={-320} y={-84} width={640} height={168} rx={26} fill={C.board} stroke={C.ink} strokeWidth={4} />
      {/* pistas */}
      <path d="M-290,0 L-250,0 L-250,70 L60,70 L60,20 M-190,-58 L-190,-80 L80,-80 L80,-20 M130,0 L300,0" fill="none" stroke={K.flow} strokeOpacity={0.55} strokeWidth={4} />
      {/* contactos (peines dorados bajo cada botón) */}
      <g style={hiG("contacts")}>
        {btns.map((b, i) => (
          <g key={i} transform={`translate(${b.x},${b.y})`}>
            <circle r={b.r * 0.85} fill="#173f31" stroke={C.gold} strokeWidth={3} />
            <path d={`M${-b.r * 0.5},${-b.r * 0.3} L${b.r * 0.5},${-b.r * 0.3} M${-b.r * 0.5},${b.r * 0.3} L${b.r * 0.5},${b.r * 0.3}`} stroke={C.gold} strokeWidth={4} />
            {i === press && pressK > 0.01 && <circle r={b.r} fill={K.flow} opacity={0.6 * pressK} style={glow(K.flow, 12)} />}
          </g>
        ))}
      </g>
      {/* chip */}
      <g style={hiG("chip")}>
        <rect x={40} y={-44} width={96} height={88} rx={8} fill={K.ink} stroke={hi === "chip" ? K.flow : C.case3} strokeWidth={4} />
        {[0, 1, 2, 3].map((k) => <g key={k}><rect x={48 + k * 22} y={-56} width={8} height={12} fill={C.case3} /><rect x={48 + k * 22} y={44} width={8} height={12} fill={C.case3} /></g>)}
        <text x={88} y={10} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={22} fill={hi === "chip" ? K.flow : C.case3}>
          {BITS.slice(Math.floor(t * 6) % 8, (Math.floor(t * 6) % 8) + 4).join("")}
        </text>
      </g>
      {/* pilas (asoman por debajo de la placa a la izquierda) */}
      {/* led infrarrojo en la punta */}
      <g style={hiG("led")}>
        <rect x={318} y={-24} width={22} height={48} fill={C.case3} />
        <path d="M340,-26 L362,-26 Q392,0 362,26 L340,26 Z" fill="#4A2E2A" stroke={C.ink} strokeWidth={3} />
      </g>
      <LedGlow x={370} y={0} o={led} r={40} />
      {/* tapa de arriba con los botones: se levanta */}
      {open < 0.995 && (
        <g transform={`translate(${0},${shellDy * open}) rotate(${-4 * open})`} opacity={1 - 0.25 * open}>
          <rect x={-360} y={-110} width={720} height={220} rx={90} fill={C.case2} stroke={C.ink} strokeWidth={6} />
          <rect x={-340} y={-92} width={680} height={36} rx={18} fill="#ffffff" opacity={0.08} />
          {btns.map((b, i) => {
            const dn = i === press ? pressK : 0;
            return <circle key={i} cx={b.x} cy={b.y + 4 * dn} r={b.r * (1 - 0.08 * dn)} fill={b.c} stroke={C.ink} strokeWidth={4} />;
          })}
          {/* cruceta */}
          <circle cx={150} cy={0} r={70} fill={C.case1} stroke={C.ink} strokeWidth={4} />
          <circle cx={150} cy={0} r={30} fill={C.case3} stroke={C.ink} strokeWidth={4} />
          {[0, 90, 180, 270].map((a) => <path key={a} d="M150,-58 l-10,14 h20 Z" fill={C.case3} transform={`rotate(${a} 150 0)`} />)}
          <rect x={250} y={-50} width={44} height={100} rx={22} fill={C.case1} stroke={C.ink} strokeWidth={4} />
          <path d="M340,-26 L362,-26 Q392,0 362,26 L340,26 Z" fill="#4A2E2A" stroke={C.ink} strokeWidth={3} />
        </g>
      )}
      {open >= 0.995 && <path d="M340,-26 L362,-26 Q392,0 362,26 L340,26 Z" fill="#4A2E2A" stroke={C.ink} strokeWidth={3} opacity={0} />}
      <defs><clipPath id={`clip${id}`}><rect x={-360} y={-110} width={720} height={220} rx={90} /></clipPath></defs>
    </g>
  );
};

/** Tele genérica. Centro de la pantalla en (x,y); ancho 400·s. ch: número de canal que se ve; recv: brillo del receptor; on: encendida. */
export const TV: React.FC<{ x: number; y: number; s?: number; t: number; ch?: string; recv?: number; on?: number; o?: number; chFlash?: number; cells?: number }> =
  ({ x, y, s = 1, t, ch = "", recv = 0, on = 1, o = 1, chFlash = 0, cells = 0 }) => (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      <rect x={-200} y={-125} width={400} height={250} rx={14} fill={C.case1} stroke={C.ink} strokeWidth={6} />
      <rect x={-184} y={-110} width={368} height={210} rx={6} fill={C.screen} />
      <g opacity={on}>
        <rect x={-184} y={-110} width={368} height={210} rx={6} fill={C.glass} />
        <path d={`M-184,40 Q-90,${-10 + 8 * Math.sin(t * 2)} 0,30 T184,10 L184,100 L-184,100 Z`} fill={C.case2} opacity={0.6} />
        <circle cx={110} cy={-50} r={26} fill={K.flow} opacity={0.5} />
        {ch && <text x={-150} y={-60} fontFamily="MontserratSerie, sans-serif" fontWeight={900} fontSize={54} fill={K.white} opacity={0.6 + 0.4 * chFlash} style={chFlash > 0.05 ? glow(K.flow, 12 * chFlash) : undefined}>{ch}</text>}
      </g>
      {/* receptor infrarrojo: ventanita oscura abajo */}
      <rect x={-30} y={104} width={60} height={18} rx={6} fill="#3a1410" stroke={recv > 0.05 ? K.hot : C.ink} strokeWidth={3} style={recv > 0.05 ? glow(K.hot, 12 * recv) : undefined} />
      {/* fotocélulas en las esquinas (tele antigua) */}
      {cells > 0.01 && [[-170, -96], [170, -96], [-170, 86], [170, 86]].map(([a, b], k) => <circle key={k} cx={a} cy={b} r={13} fill={K.flow} opacity={0.4 + 0.6 * cells} stroke={C.ink} strokeWidth={3} />)}
      <rect x={-60} y={125} width={120} height={22} fill={C.case1} stroke={C.ink} strokeWidth={4} />
      <rect x={-130} y={145} width={260} height={16} rx={8} fill={C.case1} stroke={C.ink} strokeWidth={4} />
    </g>
  );

/** Tren de ráfagas: entre x0 y x1 en y; bits (pulso corto = 0, largo = 1, estilo «distancia entre pulsos»); scroll desplaza. */
export const Bursts: React.FC<{ x0: number; x1: number; y: number; h?: number; bits?: number[]; scroll?: number; o?: number; color?: string; fineK?: number; showBits?: number }> =
  ({ x0, x1, y, h = 70, bits = BITS, scroll = 0, o = 1, color = K.hot, fineK = 0, showBits = 0 }) => {
    if (o <= 0.01) return null;
    const unit = 22; // ráfaga
    const items: { x: number; b: number }[] = [];
    let cx = 0;
    for (let k = 0; k < bits.length * 3; k++) { const b = bits[k % bits.length]; items.push({ x: cx, b }); cx += unit + (b ? unit * 2.4 : unit * 0.9); }
    const total = cx;
    return (
      <g opacity={o}>
        <defs><clipPath id={`bc${x0}${y}`}><rect x={x0} y={y - h - 40} width={x1 - x0} height={h + 90} /></clipPath></defs>
        <line x1={x0} y1={y} x2={x1} y2={y} stroke={C.case3} strokeOpacity={0.4} strokeWidth={4} />
        <g clipPath={`url(#bc${x0}${y})`}>
          {items.map((it, k) => {
            const xx = x0 + ((it.x - scroll) % total + total) % total;
            if (xx > x1 + 30) return null;
            return (
              <g key={k}>
                <rect x={xx} y={y - h} width={unit} height={h} rx={3} fill={color} opacity={0.9} />
                {fineK > 0.01 && Array.from({ length: 4 }).map((_, j) => <line key={j} x1={xx + 3 + j * 5.3} y1={y - h} x2={xx + 3 + j * 5.3} y2={y} stroke={K.ink} strokeWidth={2} opacity={fineK} />)}
                {showBits > 0.01 && <text x={xx + unit / 2 + (it.b ? unit * 1.2 : unit * 0.45)} y={y + 36} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={28} fill={K.flow} opacity={showBits}>{it.b}</text>}
              </g>
            );
          })}
        </g>
      </g>
    );
  };

/** Rayo de luz (discontinuo que avanza) entre dos puntos. ghost: muy tenue (lo que tus ojos no ven). */
export const Beam: React.FC<{ a: [number, number]; b: [number, number]; t: number; o: number; color?: string; w?: number }> = ({ a, b, t, o, color = K.hot, w = 10 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    <path d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke={color} strokeOpacity={0.22} strokeWidth={w * 3.2} strokeLinecap="round" />
    <path d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray="20 16" strokeDashoffset={-t * 160} />
  </g>
);

/** Ojo (con aspa roja si no ve). */
export const Eye: React.FC<{ x: number; y: number; s?: number; o?: number; cross?: number }> = ({ x, y, s = 1, o = 1, cross = 0 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-80,0 Q0,-62 80,0 Q0,62 -80,0 Z" fill={K.white} stroke={C.ink} strokeWidth={5} />
    <circle r={28} fill={C.case2} stroke={C.ink} strokeWidth={4} />
    <circle r={12} fill={K.ink} />
    {cross > 0.01 && <path d="M-70,-56 L70,56 M70,-56 L-70,56" stroke={K.warn} strokeWidth={14} strokeLinecap="round" opacity={cross} />}
  </g>
);

/** Corte de una tecla: goma con pastilla de carbono sobre los contactos de la placa. press 0-1. */
export const KeyCut: React.FC<{ x: number; y: number; s?: number; press: number; current: number; t: number }> = ({ x, y, s = 1, press, current, t }) => {
  const d = 112 * clamp01(press); // la pastilla (abajo en y=-2+d) llega a los contactos (y=110)
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* placa */}
      <rect x={-330} y={120} width={660} height={60} rx={8} fill={C.board} stroke={C.ink} strokeWidth={5} />
      {/* contactos: dos peines dorados */}
      {[-1, 1].map((k) => <rect key={k} x={k < 0 ? -110 : 12} y={110} width={98} height={14} fill={C.gold} stroke={C.ink} strokeWidth={3} />)}
      {/* pistas a izquierda y derecha, se iluminan con la corriente */}
      <path d="M-110,117 L-320,117" stroke={current > 0.05 ? K.flow : C.gold} strokeWidth={8} style={current > 0.05 ? glow(K.flow, 10 * current) : undefined} />
      <path d="M110,117 L320,117" stroke={current > 0.05 ? K.flow : C.gold} strokeWidth={8} style={current > 0.05 ? glow(K.flow, 10 * current) : undefined} />
      {current > 0.05 && <path d="M-300,117 L300,117" stroke={K.flow} strokeWidth={6} strokeDasharray="18 14" strokeDashoffset={-t * 200} opacity={current} />}
      {/* tapa del mando (corte) */}
      <path d="M-330,-150 L-160,-150 L-160,-60 M160,-60 L160,-150 L330,-150" fill="none" stroke={C.case2} strokeWidth={26} strokeLinejoin="round" />
      {/* goma: faldón + cúpula + pastilla */}
      <g transform={`translate(0,${d})`}>
        <rect x={-120} y={-200} width={240} height={110} rx={30} fill={C.rubber} stroke={C.ink} strokeWidth={5} />
        <rect x={-100} y={-40 - d * 0} width={200} height={38} rx={10} fill={C.carbon} stroke={C.ink} strokeWidth={4} />
      </g>
      <path d={`M-120,${-100 + d} C-150,${-40 + d * 0.5} -230,20 -330,40 L-330,60 C-220,40 -160,${-10 + d * 0.5} -100,${-2 + d}`} fill={C.rubber} stroke={C.ink} strokeWidth={4} />
      <path d={`M120,${-100 + d} C150,${-40 + d * 0.5} 230,20 330,40 L330,60 C220,40 160,${-10 + d * 0.5} 100,${-2 + d}`} fill={C.rubber} stroke={C.ink} strokeWidth={4} />
      <rect x={-100} y={-100 + d} width={200} height={100} fill={C.rubber} stroke={C.ink} strokeWidth={4} />
      <rect x={-96} y={-38 + d} width={192} height={36} rx={10} fill={C.carbon} stroke={current > 0.05 ? K.flow : C.ink} strokeWidth={4} />
      {/* dedo */}
      <path d={`M-70,${-420 + d} Q-80,${-250 + d} -60,${-210 + d} Q0,${-185 + d} 60,${-210 + d} Q80,${-250 + d} 70,${-420 + d}`} fill="#C98E74" stroke={C.ink} strokeWidth={5} opacity={clamp01(press * 3 + 0.4)} />
    </g>
  );
};

/** Chip grande con patitas. */
export const Chip8: React.FC<{ x: number; y: number; t: number; hot?: number }> = ({ x, y, t, hot = 0 }) => (
  <g transform={`translate(${x},${y})`}>
    {Array.from({ length: 6 }).map((_, k) => <g key={k}>
      <rect x={-118} y={-90 + k * 34} width={28} height={14} fill={C.case3} />
      <rect x={90} y={-90 + k * 34} width={28} height={14} fill={C.case3} />
    </g>)}
    <rect x={-92} y={-110} width={184} height={220} rx={12} fill={K.ink} stroke={hot > 0.05 ? K.flow : C.case3} strokeWidth={5} style={hot > 0.05 ? glow(K.flow, 14 * hot) : undefined} />
    <circle cx={-64} cy={-82} r={8} fill={C.case3} />
    <text x={0} y={14} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={40} fill={K.flow} opacity={0.3 + 0.7 * hot}>{["0101", "1100", "0011", "1010"][Math.floor(t * 5) % 4]}</text>
  </g>
);

/** Sol con rayos que giran. */
export const Sun: React.FC<{ x: number; y: number; r?: number; t: number; o?: number }> = ({ x, y, r = 60, t, o = 1 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <g transform={`rotate(${t * 20})`}>{Array.from({ length: 10 }).map((_, k) => <rect key={k} x={-6} y={-r - 36} width={12} height={26} rx={6} fill={K.flow} transform={`rotate(${k * 36})`} />)}</g>
    <circle r={r} fill={K.flow} stroke={K.hot} strokeWidth={6} />
  </g>
);

/** Bombilla. */
export const Bulb: React.FC<{ x: number; y: number; s?: number; o?: number; t: number }> = ({ x, y, s = 1, o = 1, t }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <circle cy={-10} r={74} fill={K.flow} opacity={0.15 + 0.05 * Math.sin(t * 9)} />
    <path d="M-44,20 C-80,-20 -60,-80 0,-80 C60,-80 80,-20 44,20 L36,44 L-36,44 Z" fill="#FFF3B0" stroke={C.ink} strokeWidth={5} />
    <path d="M-18,30 L-10,-20 L0,0 L10,-20 L18,30" fill="none" stroke={K.hot} strokeWidth={5} />
    <rect x={-34} y={44} width={68} height={40} rx={6} fill={C.case3} stroke={C.ink} strokeWidth={5} />
  </g>
);

/** Ruido infrarrojo: línea temblorosa. */
export const NoiseLine: React.FC<{ x0: number; x1: number; y: number; t: number; a?: number; o?: number; color?: string }> = ({ x0, x1, y, t, a = 26, o = 1, color = C.noise }) => o <= 0.01 ? null : (
  <path opacity={o} fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round"
    d={Array.from({ length: 50 }).map((_, i) => { const x = x0 + ((x1 - x0) * i) / 49; const v = a * (Math.sin(i * 0.9 + t * 7) * 0.5 + (rnd(i + Math.floor(t * 8) * 50) - 0.5)); return `${i ? "L" : "M"}${x.toFixed(1)},${(y - a - v).toFixed(1)}`; }).join(" ")} />
);

/** Móvil vertical con la cámara mostrando el mando; flash: destello en la pantalla; front: se ve el lado de la pantalla con la cámara delantera marcada. */
export const Phone: React.FC<{ x: number; y: number; s?: number; t: number; flash?: number; frontHi?: number; backHi?: number }> = ({ x, y, s = 1, t, flash = 0, frontHi = 0, backHi = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-150} y={-290} width={300} height={580} rx={40} fill={C.case1} stroke={C.ink} strokeWidth={6} />
    <rect x={-134} y={-260} width={268} height={520} rx={26} fill={C.screen} />
    {/* visor: el mando de frente con el led */}
    <g transform="translate(0,40) scale(0.42) rotate(-90)">
      <Remote x={0} y={0} t={t} />
    </g>
    {/* destello en el visor (justo en el led) */}
    {flash > 0.01 && <g opacity={flash}>
      <circle cx={0} cy={-122} r={58} fill="#E8D8FF" opacity={0.35} />
      <circle cx={0} cy={-122} r={26} fill="#F4EEFF" style={glow("#E8D8FF", 18)} />
    </g>}
    {/* cámara delantera (arriba de la pantalla) */}
    <circle cx={0} cy={-274} r={9} fill={K.ink} stroke={frontHi > 0.05 ? K.flow : C.case3} strokeWidth={3} style={frontHi > 0.05 ? glow(K.flow, 12 * frontHi) : undefined} />
    {backHi > 0.01 && <g opacity={backHi}><rect x={-140} y={-250} width={140} height={60} rx={14} fill="rgba(6,16,31,0.7)" /></g>}
  </g>
);

/** Pistola de luz de 1955 (genérica, estilo rayo). Boca del cañón en (x+150, y-20). */
export const RayGun: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-120,-60 L100,-60 Q130,-60 130,-30 L130,10 Q130,20 120,20 L-20,20 L-40,120 Q-44,140 -64,140 L-96,140 Q-112,140 -110,122 L-90,20 L-120,20 Q-150,20 -150,-10 L-150,-30 Q-150,-60 -120,-60 Z" fill={C.case3} stroke={C.ink} strokeWidth={6} />
    <rect x={128} y={-46} width={30} height={52} rx={6} fill={C.case2} stroke={C.ink} strokeWidth={5} />
    <rect x={-100} y={-48} width={170} height={16} rx={8} fill="#ffffff" opacity={0.25} />
    <path d="M-30,20 Q-10,60 -40,64" fill="none" stroke={C.ink} strokeWidth={6} />
  </g>
);

/** Mando de ultrasonidos de 1956 (genérico): caja con botones; dentro, martillito y varillas. hit: 0-1 golpe. */
export const UltraRemote: React.FC<{ x: number; y: number; s?: number; t: number; hit: number; open?: number }> = ({ x, y, s = 1, t, hit, open = 1 }) => {
  const ang = -40 + 40 * hit;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-160} y={-110} width={320} height={220} rx={26} fill={C.case1} stroke={C.ink} strokeWidth={6} />
      <rect x={-140} y={-90} width={280} height={180} rx={14} fill={C.inner} opacity={open} />
      {/* varillas de aluminio de distinta longitud */}
      {[0, 1, 2, 3].map((k) => <rect key={k} x={-10} y={-70 + k * 40} width={120 - k * 18} height={16} rx={8} fill={C.case3} stroke={C.ink} strokeWidth={3}
        style={k === 1 && hit > 0.4 ? glow(K.cold, 14) : undefined} transform={k === 1 && hit > 0.4 ? `translate(${2 * Math.sin(t * 90)},0)` : undefined} />)}
      {/* martillito */}
      <g transform={`translate(-80,-22) rotate(${ang})`}>
        <rect x={-6} y={-6} width={70} height={12} rx={6} fill={C.case2} stroke={C.ink} strokeWidth={3} />
        <rect x={52} y={-18} width={24} height={36} rx={6} fill={C.case3} stroke={C.ink} strokeWidth={3} />
      </g>
      <circle cx={-80} cy={-22} r={10} fill={C.case3} stroke={C.ink} strokeWidth={3} />
      {/* botones arriba */}
      {[-90, -30, 30, 90].map((bx, k) => <rect key={k} x={bx - 22} y={-138 + (k === 1 ? 8 * hit : 0)} width={44} height={30} rx={8} fill={k === 1 ? K.flow : C.case3} stroke={C.ink} strokeWidth={4} />)}
    </g>
  );
};

/** Ondas (arcos) desde un punto hacia `dir` grados. */
export const Waves: React.FC<{ x: number; y: number; t: number; o: number; dir?: number; color?: string; n?: number; r0?: number; step?: number }> =
  ({ x, y, t, o, dir = 0, color = K.cold, n = 3, r0 = 30, step = 40 }) => o <= 0.01 ? null : (
    <g transform={`translate(${x},${y}) rotate(${dir})`} opacity={o}>
      {Array.from({ length: n }).map((_, k) => {
        const p = (t * 1.4 + k / n) % 1;
        const r = r0 + p * step * n;
        return <path key={k} d={`M${r * Math.cos(-0.7)},${r * Math.sin(-0.7)} A${r},${r} 0 0 1 ${r * Math.cos(0.7)},${r * Math.sin(0.7)}`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" opacity={Math.sin(Math.PI * p)} />;
      })}
    </g>
  );

/** Perro sentado de perfil, mirando a la izquierda; ears: orejas levantadas 0-1. */
export const Dog: React.FC<{ x: number; y: number; s?: number; t: number; ears: number }> = ({ x, y, s = 1, t, ears }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {/* cola */}
    <path d={`M90,110 Q${150 + 10 * Math.sin(t * 10)},${60} ${140 + 14 * Math.sin(t * 10)},20`} fill="none" stroke={C.dog2} strokeWidth={18} strokeLinecap="round" />
    {/* cuerpo */}
    <path d="M-40,40 Q-60,180 -20,190 L110,190 Q140,150 110,80 Q80,20 -10,20 Z" fill={C.dog} stroke={C.ink} strokeWidth={6} />
    <rect x={-40} y={150} width={36} height={44} rx={14} fill={C.dog} stroke={C.ink} strokeWidth={5} />
    {/* cabeza */}
    <path d="M-110,-20 Q-130,-30 -128,-6 Q-126,14 -100,16 L-40,30 Q10,30 14,-20 Q10,-80 -40,-80 Q-80,-78 -90,-40 Z" fill={C.dog} stroke={C.ink} strokeWidth={6} />
    <circle cx={-126} cy={-12} r={10} fill={K.ink} />
    <circle cx={-56} cy={-42} r={8} fill={K.ink} />
    {/* oreja: caída → levantada */}
    <path d={`M-20,-70 Q${10 - 20 * ears},${-60 - 90 * ears} ${20 - 10 * ears},${-40 - 100 * ears} Q${30},${-30 - 20 * ears} 0,-40 Z`} fill={C.dog2} stroke={C.ink} strokeWidth={5} />
  </g>
);

/** Bocadillo de «idioma» con un patrón de ráfagas propio. */
export const Bubble: React.FC<{ x: number; y: number; w?: number; color: string; bits: number[]; o?: number; tail?: number }> = ({ x, y, w = 300, color, bits, o = 1, tail = -1 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-w / 2} y={-60} width={w} height={120} rx={30} fill="rgba(6,16,31,0.85)" stroke={color} strokeWidth={6} />
    <path d={`M${tail * 40},58 L${tail * 70},104 L${tail * 4},58 Z`} fill="rgba(6,16,31,0.85)" stroke={color} strokeWidth={6} strokeLinejoin="round" />
    {bits.map((b, k) => <rect key={k} x={-w / 2 + 26 + k * ((w - 52) / bits.length)} y={b ? -34 : -10} width={(w - 52) / bits.length - 8} height={b ? 68 : 20} rx={4} fill={color} />)}
  </g>
);

/** Flecha. */
export const Arrow: React.FC<{ x0: number; y0: number; x1: number; y1: number; o?: number; color?: string; w?: number }> = ({ x0, y0, x1, y1, o = 1, color = K.white, w = 10 }) => {
  if (o <= 0.01) return null;
  const a = Math.atan2(y1 - y0, x1 - x0), h = 26;
  return (
    <g opacity={o}>
      <path d={`M${x0},${y0} L${x1 - Math.cos(a) * h * 0.6},${y1 - Math.sin(a) * h * 0.6}`} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${x1},${y1} L${x1 - h * Math.cos(a - 0.5)},${y1 - h * Math.sin(a - 0.5)} L${x1 - h * Math.cos(a + 0.5)},${y1 - h * Math.sin(a + 0.5)} Z`} fill={color} />
    </g>
  );
};
