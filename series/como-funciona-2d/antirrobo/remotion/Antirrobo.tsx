// Dibujos SVG del episodio «Cómo pita el arco de la tienda (las etiquetas antirrobo)». Coordenadas absolutas de 1080×1920.
// Colores de código: cian = el campo que lanza el arco, amarillo = la respuesta de la etiqueta / lo importante,
// naranja = energía (pulso del desactivador), rojo = alarma / error, blanco = texto. Grises azulados para carcasas.
// Sin marcas: etiquetas, arcos, caja y tienda genéricos. Las pinzas de ropa se dibujan solo por fuera.
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F", inner: "#0B1A30", metal: "#4F6A8C",
  strip: "#DDE6F0", magnet: "#5C6F8A", ok: "#3DDC84", floor: "#1A2B44", wood: "#3A5A80", copper: "#E0A33A", shirt: "#3E6AA0" };

export const glow = (c: string, r: number) => ({ filter: `drop-shadow(0 0 ${r}px ${c})` });

/** Ondas en abanico que salen de (x,y) hacia `dir` (grados, 0 = derecha, 90 = abajo). speed < 0: ondas que llegan. */
export const Waves: React.FC<{ x: number; y: number; dir: number; t: number; o?: number; color?: string; n?: number; r0?: number; step?: number; half?: number; speed?: number; dash?: string; w?: number }> =
  ({ x, y, dir, t, o = 1, color = K.cold, n = 4, r0 = 30, step = 70, half = 28, speed = 120, dash, w = 9 }) => o <= 0.01 ? null : (
    <g opacity={o}>
      {Array.from({ length: n }).map((_, k) => {
        const m = n * step;
        const r = r0 + ((((t * speed + k * step) % m) + m) % m);
        const a0 = ((dir - half) * Math.PI) / 180, a1 = ((dir + half) * Math.PI) / 180;
        const fade = 1 - (r - r0) / m;
        return <path key={k} d={`M${x + r * Math.cos(a0)},${y + r * Math.sin(a0)} A${r},${r} 0 0 1 ${x + r * Math.cos(a1)},${y + r * Math.sin(a1)}`}
          fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} opacity={clamp01(fade * 1.3)} style={glow(color, 6)} />;
      })}
    </g>
  );

/** Tira metálica vibrando: una línea ondulada horizontal centrada en (x,y), ancho w. amp = amplitud (0 = quieta). */
export const Strip: React.FC<{ x: number; y: number; w: number; h?: number; t: number; amp?: number; color?: string; o?: number; freq?: number }> =
  ({ x, y, w, h = 26, t, amp = 0, color = C.strip, o = 1, freq = 9 }) => {
    const N = 40; const top: string[] = []; const bot: string[] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N; const px = x - w / 2 + u * w;
      // modo fundamental (los extremos se mueven más) + temblor rápido
      const d = amp * Math.sin(t * 2 * Math.PI * freq) * Math.cos(Math.PI * u) * 14;
      top.push(`${px},${y - h / 2 + d}`); bot.unshift(`${px},${y + h / 2 + d}`);
    }
    return (
      <g opacity={o}>
        <polygon points={[...top, ...bot].join(" ")} fill={color} stroke={C.ink} strokeWidth={4} style={amp > 0.05 ? glow(K.flow, 10 * amp) : undefined} />
      </g>
    );
  };

/** Etiqueta acustomagnética (rectángulo con relieve), vista de frente. Centro (x,y); 640×220 a escala 1.
 *  open: la tapa se levanta y se ven la tira (arriba) y el imán (abajo). vib: vibración de la tira.
 *  hiMag: resalta el imán. dead: imán desmagnetizado (gris, sin polos). */
export const AMTag: React.FC<{ x: number; y: number; s?: number; t: number; open?: number; vib?: number; hiMag?: number; dead?: number; lift?: number; o?: number; rot?: number }> =
  ({ x, y, s = 1, t, open = 1, vib = 0, hiMag = 0, dead = 0, lift = -300, o = 1, rot = 0 }) => (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
      {/* base adhesiva */}
      <rect x={-340} y={-130} width={680} height={260} rx={30} fill={C.case3} stroke={C.ink} strokeWidth={6} />
      {/* hueco interior */}
      <rect x={-300} y={-96} width={600} height={192} rx={18} fill={C.inner} stroke={C.ink} strokeWidth={4} />
      {/* tira (resonador) */}
      <Strip x={0} y={-36} w={540} h={34} t={t} amp={vib} />
      {/* imán de polarización */}
      <g style={hiMag > 0.05 ? glow(K.flow, 16 * hiMag) : undefined}>
        <rect x={-270} y={22} width={540} height={46} rx={6} fill={dead > 0.5 ? "#4A5466" : C.magnet} stroke={hiMag > 0.05 ? K.flow : C.ink} strokeWidth={hiMag > 0.05 ? 6 : 4} />
        <g opacity={1 - dead}>
          <rect x={-270} y={22} width={270} height={46} rx={6} fill={K.warn} opacity={0.75} />
          <rect x={0} y={22} width={270} height={46} rx={6} fill={K.cold} opacity={0.75} />
          <text x={-135} y={57} textAnchor="middle" fontFamily="sans-serif" fontWeight={900} fontSize={34} fill={K.white}>N</text>
          <text x={135} y={57} textAnchor="middle" fontFamily="sans-serif" fontWeight={900} fontSize={34} fill={K.white}>S</text>
        </g>
      </g>
      {/* tapa */}
      {open < 0.995 && (
        <g transform={`translate(0,${lift * open}) rotate(${-4 * open})`} opacity={1 - 0.15 * open}>
          <rect x={-340} y={-130} width={680} height={260} rx={30} fill="#E8EEF5" stroke={C.ink} strokeWidth={6} />
          <rect x={-300} y={-96} width={600} height={192} rx={18} fill="none" stroke={C.case3} strokeWidth={5} />
          {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={-250 + k * 90} y={-20} width={40} height={40} rx={4} fill={C.case3} opacity={0.6} />)}
        </g>
      )}
    </g>
  );

/** Etiqueta de radiofrecuencia: pegatina cuadrada con espiral plana (bobina) y condensador. Centro (x,y); 420×420 a escala 1.
 *  hiCoil / hiCap: resaltes. ring: brillo de resonancia. burnt: condensador dañado. */
export const RFTag: React.FC<{ x: number; y: number; s?: number; hiCoil?: number; hiCap?: number; ring?: number; burnt?: number; o?: number; rot?: number }> =
  ({ x, y, s = 1, hiCoil = 0, hiCap = 0, ring = 0, burnt = 0, o = 1, rot = 0 }) => {
    const turns = 6; let d = "";
    for (let k = 0; k < turns; k++) {
      const a = 170 - k * 22;
      d += `${k === 0 ? "M" : "L"}${-a},${-a} L${a},${-a} L${a},${a} L${-a + 22},${a} L${-a + 22},${-a + 22} `;
    }
    const coilCol = ring > 0.05 || hiCoil > 0.05 ? K.flow : C.copper;
    return (
      <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
        <rect x={-210} y={-210} width={420} height={420} rx={22} fill="#F2F5F9" stroke={C.ink} strokeWidth={6} />
        <path d={d} fill="none" stroke={coilCol} strokeWidth={10} strokeLinejoin="round" style={ring > 0.05 ? glow(K.flow, 14 * ring) : hiCoil > 0.05 ? glow(K.flow, 10 * hiCoil) : undefined} />
        {/* condensador: dos placas */}
        <g transform="translate(0,0)" style={hiCap > 0.05 ? glow(K.flow, 12 * hiCap) : undefined}>
          <rect x={-46} y={-40} width={92} height={22} rx={3} fill={burnt > 0.5 ? "#555" : C.copper} stroke={hiCap > 0.05 ? K.flow : C.ink} strokeWidth={hiCap > 0.05 ? 5 : 3} />
          <rect x={-46} y={18} width={92} height={22} rx={3} fill={burnt > 0.5 ? "#555" : C.copper} stroke={hiCap > 0.05 ? K.flow : C.ink} strokeWidth={hiCap > 0.05 ? 5 : 3} />
          <line x1={0} y1={-18} x2={0} y2={18} stroke={C.ink} strokeWidth={4} strokeDasharray="6 6" />
        </g>
        {burnt > 0.01 && (
          <g opacity={burnt}>
            <circle r={40} fill={K.hot} opacity={0.35} style={glow(K.hot, 20)} />
            <path d="M-60,-60 L60,60 M60,-60 L-60,60" stroke={K.warn} strokeWidth={16} strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };

/** Poste del arco de la tienda (panel vertical con antena). Base en (x, y). alarm: luz roja arriba. */
export const Gate: React.FC<{ x: number; y: number; h?: number; s?: number; tx?: number; alarm?: number; o?: number }> =
  ({ x, y, h = 620, s = 1, tx = 0, alarm = 0, o = 1 }) => (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      <rect x={-60} y={-18} width={120} height={28} rx={8} fill={C.metal} stroke={C.ink} strokeWidth={4} />
      <rect x={-40} y={-h} width={80} height={h - 10} rx={26} fill="rgba(159,179,204,0.25)" stroke={C.case3} strokeWidth={6} />
      {/* bobina interior */}
      <rect x={-24} y={-h + 40} width={48} height={h - 100} rx={14} fill="none" stroke={tx > 0.05 ? K.cold : C.case2} strokeWidth={6} style={tx > 0.05 ? glow(K.cold, 12 * tx) : undefined} />
      <rect x={-34} y={-h - 4} width={68} height={30} rx={12} fill={alarm > 0.05 ? K.warn : "#5A2A30"} stroke={C.ink} strokeWidth={4} style={alarm > 0.05 ? glow(K.warn, 26 * alarm) : undefined} />
    </g>
  );

/** Bolsa de la compra. Centro (x,y). tag: etiqueta (amarilla si «contesta») asomando. */
export const Bag: React.FC<{ x: number; y: number; s?: number; tagHi?: number; o?: number; color?: string }> = ({ x, y, s = 1, tagHi = 0, o = 1, color = "#C9D6E6" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-70,-110 Q-70,-190 0,-190 Q70,-190 70,-110" fill="none" stroke={C.case3} strokeWidth={12} />
    <path d="M-120,-110 L120,-110 L100,140 L-100,140 Z" fill={color} stroke={C.ink} strokeWidth={6} />
    <rect x={-50} y={-20} width={100} height={36} rx={6} fill={tagHi > 0.05 ? K.flow : C.case3} stroke={C.ink} strokeWidth={4} style={tagHi > 0.05 ? glow(K.flow, 14 * tagHi) : undefined} />
  </g>
);

/** Silueta neutra caminando (persona). Pies en (x,y). */
export const Person: React.FC<{ x: number; y: number; s?: number; t: number; o?: number }> = ({ x, y, s = 1, t, o = 1 }) => {
  const sw = Math.sin(t * 7) * 18;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      <circle cx={0} cy={-330} r={42} fill={C.case3} />
      <rect x={-46} y={-280} width={92} height={160} rx={36} fill={C.case3} />
      <path d={`M-18,-130 L${-30 - sw},0 M18,-130 L${30 + sw},0`} stroke={C.case3} strokeWidth={30} strokeLinecap="round" />
    </g>
  );
};

/** Mostrador de caja con el desactivador (placa con espiras). Centro de la placa en (x,y). pulse: brillo naranja. */
export const Counter: React.FC<{ x: number; y: number; t: number; pulse?: number; o?: number; w?: number }> = ({ x, y, t, pulse = 0, o = 1, w = 860 }) => (
  <g opacity={o}>
    <rect x={x - w / 2} y={y + 40} width={w} height={240} rx={16} fill={C.case1} stroke={C.ink} strokeWidth={6} />
    <rect x={x - w / 2 - 20} y={y + 20} width={w + 40} height={34} rx={10} fill={C.wood} stroke={C.ink} strokeWidth={5} />
    <g transform={`translate(${x},${y + 10})`}>
      <rect x={-200} y={-16} width={400} height={36} rx={12} fill="#1C2E48" stroke={pulse > 0.05 ? K.hot : C.case3} strokeWidth={5} style={pulse > 0.05 ? glow(K.hot, 18 * pulse) : undefined} />
      {[0, 1, 2].map((k) => <ellipse key={k} cx={0} cy={0} rx={60 + k * 45} ry={9 + k * 2} fill="none" stroke={pulse > 0.05 ? K.hot : C.case2} strokeWidth={4} opacity={pulse > 0.05 ? 0.5 + 0.5 * Math.abs(Math.sin(t * 6 + k)) : 0.7} />)}
    </g>
  </g>
);

/** Camiseta con pinza dura (solo por fuera). Centro (x,y). pull: la pinza se aleja hacia la derecha-arriba. */
export const Shirt: React.FC<{ x: number; y: number; s?: number; pull?: number; o?: number; tagHi?: number }> = ({ x, y, s = 1, pull = 0, o = 1, tagHi = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-120,-200 L-260,-120 L-200,0 L-150,-30 L-150,240 L150,240 L150,-30 L200,0 L260,-120 L120,-200 Q0,-130 -120,-200 Z" fill={C.shirt} stroke={C.ink} strokeWidth={6} />
    <g transform={`translate(${60 + 200 * pull},${120 - 180 * pull}) rotate(${-20 * pull})`} style={tagHi > 0.05 ? glow(K.flow, 12 * tagHi) : undefined}>
      <ellipse cx={0} cy={0} rx={78} ry={56} fill="#E8EEF5" stroke={tagHi > 0.05 ? K.flow : C.ink} strokeWidth={6} />
      <ellipse cx={0} cy={0} rx={38} ry={26} fill={C.case3} stroke={C.ink} strokeWidth={4} />
      <circle cx={0} cy={0} r={10} fill={C.metal} />
    </g>
  </g>
);

/** Fachada de tienda genérica con puerta y toldo. Centro inferior (x,y). */
export const Shop: React.FC<{ x: number; y: number; w?: number; h?: number; o?: number; old?: boolean }> = ({ x, y, w = 820, h = 560, o = 1, old = false }) => (
  <g opacity={o}>
    <rect x={x - w / 2} y={y - h} width={w} height={h} rx={10} fill={old ? "#4A3A5C" : C.case1} stroke={C.ink} strokeWidth={6} />
    {Array.from({ length: 8 }).map((_, k) => (
      <path key={k} d={`M${x - w / 2 + k * (w / 8)},${y - h + 10} l${w / 8},0 l-${w / 16},70 z`} fill={k % 2 ? K.white : old ? K.hot : K.warn} opacity={0.85} />
    ))}
    <rect x={x - 130} y={y - 330} width={260} height={330} fill={C.inner} stroke={C.case3} strokeWidth={5} />
    <rect x={x - w / 2 + 40} y={y - 330} width={180} height={200} fill="rgba(53,196,240,0.18)" stroke={C.case3} strokeWidth={5} />
    <rect x={x + w / 2 - 220} y={y - 330} width={180} height={200} fill="rgba(53,196,240,0.18)" stroke={C.case3} strokeWidth={5} />
  </g>
);

/** Campana (para «como una campana»). Centro (x,y). swing: oscilación. */
export const Bell: React.FC<{ x: number; y: number; s?: number; t: number; swing?: number; o?: number }> = ({ x, y, s = 1, t, swing = 0, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${swing * 14 * Math.sin(t * 9)})`} opacity={o}>
    <path d="M-70,40 Q-70,-80 0,-80 Q70,-80 70,40 L90,60 L-90,60 Z" fill={K.flow} stroke={C.ink} strokeWidth={6} />
    <circle cx={0} cy={74} r={16} fill={K.flow} stroke={C.ink} strokeWidth={5} />
    <rect x={-10} y={-104} width={20} height={26} rx={6} fill={K.flow} stroke={C.ink} strokeWidth={5} />
  </g>
);

/** Oreja esquemática. Centro (x,y). cross: aspa roja. */
export const Ear: React.FC<{ x: number; y: number; s?: number; cross?: number; o?: number }> = ({ x, y, s = 1, cross = 0, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-40,60 Q-80,40 -70,-20 Q-60,-100 10,-100 Q80,-100 80,-20 Q80,30 30,50 Q10,60 10,90 Q10,120 -20,110" fill="none" stroke={C.case3} strokeWidth={18} strokeLinecap="round" />
    <path d="M-20,-10 Q-10,-50 25,-45 Q50,-40 40,-5" fill="none" stroke={C.case3} strokeWidth={12} strokeLinecap="round" />
    {cross > 0.01 && <path d="M-90,-110 L100,120 M100,-110 L-90,120" stroke={K.warn} strokeWidth={18} strokeLinecap="round" opacity={cross} />}
  </g>
);

/** Gráfica de la señal: pulso del arco (cian) y, tras él, el «eco» de la tira que se apaga (amarillo).
 *  Caja en (x,y) de w×h. p: avance del dibujo 0-1. ring: muestra el eco. */
export const Scope: React.FC<{ x: number; y: number; w?: number; h?: number; p: number; ring?: number; o?: number }> = ({ x, y, w = 860, h = 300, p, ring = 1, o = 1 }) => {
  const mid = y + h / 2; const N = 260; const pulseEnd = 0.38;
  const pts: string[] = []; const pts2: string[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N; if (u > p) break;
    const px = x + 20 + u * (w - 40);
    if (u <= pulseEnd) pts.push(`${px},${mid + (h * 0.38) * Math.sin(u * 140)}`);
    else pts2.push(`${px},${mid + ring * (h * 0.34) * Math.exp(-(u - pulseEnd) * 6) * Math.sin(u * 140)}`);
  }
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={20} fill="rgba(6,16,31,0.85)" stroke={C.case2} strokeWidth={4} />
      <line x1={x + 20} y1={mid} x2={x + w - 20} y2={mid} stroke={C.case1} strokeWidth={3} />
      <line x1={x + 20 + pulseEnd * (w - 40)} y1={y + 16} x2={x + 20 + pulseEnd * (w - 40)} y2={y + h - 16} stroke={C.case3} strokeWidth={3} strokeDasharray="10 8" />
      {pts.length > 1 && <polyline points={pts.join(" ")} fill="none" stroke={K.cold} strokeWidth={6} style={glow(K.cold, 6)} />}
      {pts2.length > 1 && <polyline points={pts2.join(" ")} fill="none" stroke={K.flow} strokeWidth={6} style={glow(K.flow, 6)} />}
    </g>
  );
};

/** Notas musicales que suben (la tira «canta»). */
export const Notes: React.FC<{ x: number; y: number; t: number; o?: number; n?: number; spread?: number }> = ({ x, y, t, o = 1, n = 3, spread = 260 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    {Array.from({ length: n }).map((_, k) => {
      const p = (t * 0.7 + k / n) % 1;
      const nx = x - spread / 2 + (k / Math.max(1, n - 1)) * spread + 20 * Math.sin(t * 3 + k);
      const ny = y - p * 200;
      return (
        <g key={k} transform={`translate(${nx},${ny})`} opacity={clamp01((1 - p) * 1.6)} style={glow(K.flow, 8)}>
          <ellipse cx={0} cy={0} rx={22} ry={16} fill={K.flow} transform="rotate(-20)" />
          <rect x={16} y={-70} width={8} height={70} fill={K.flow} />
          <path d="M24,-70 Q50,-60 46,-36" stroke={K.flow} strokeWidth={8} fill="none" />
        </g>
      );
    })}
  </g>
);
