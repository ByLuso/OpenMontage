// Dibujos SVG del episodio «Cómo funciona una linterna de manivela». Coordenadas absolutas de 1080×1920.
// Amarillo = corriente/luz, naranja = cobre y alterna, rojo/cian = polos del imán, grises azulados = carcasas. Sin marcas.
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#040A14", shell: "#DCE5EF", cu: "#D08A45", skin: "#C98E74" };
const FF = "MontserratSerie";
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Rotor: imán redondo con polo norte (rojo) y sur (cian). */
export const Rotor: React.FC<{ x: number; y: number; r?: number; ang: number; o?: number }> = ({ x, y, r = 60, ang, o = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${ang})`} opacity={o}>
    <path d={`M0,${-r} A${r},${r} 0 0 1 0,${r} Z`} fill={K.warn} />
    <path d={`M0,${-r} A${r},${r} 0 0 0 0,${r} Z`} fill={K.cold} />
    <circle r={r} fill="none" stroke={C.dark} strokeWidth={5} />
    <text x={r * 0.45} y={r * 0.2} textAnchor="middle" fontFamily={FF} fontWeight={900} fontSize={r * 0.6} fill={C.dark}>N</text>
    <text x={-r * 0.45} y={r * 0.2} textAnchor="middle" fontFamily={FF} fontWeight={900} fontSize={r * 0.6} fill={C.dark}>S</text>
    <circle r={8} fill={C.dark} />
  </g>
);

/** Bobina de cobre (rectángulo con espiras). */
export const Coil: React.FC<{ x: number; y: number; w?: number; h?: number; glow?: number }> = ({ x, y, w = 70, h = 170, glow = 0 }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={12} fill={C.dark} stroke={glow > 0.05 ? K.flow : C.cu} strokeWidth={6} style={glow > 0.05 ? { filter: `drop-shadow(0 0 ${12 * glow}px ${K.flow})` } : undefined} />
    {Array.from({ length: 9 }).map((_, k) => <path key={k} d={`M${-w / 2 + 4},${-h / 2 + 16 + (k * (h - 32)) / 8} L${w / 2 - 4},${-h / 2 + 4 + (k * (h - 32)) / 8}`} stroke={C.cu} strokeWidth={9} strokeLinecap="round" />)}
  </g>
);

/** Bombilla LED con brillo. */
export const Led: React.FC<{ x: number; y: number; s?: number; on: number; o?: number }> = ({ x, y, s = 1, on, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    {on > 0.02 && <circle r={90} fill={K.flow} opacity={0.22 * on} />}
    <circle r={40} fill={on > 0.02 ? K.flow : C.case1} stroke={C.case3} strokeWidth={6} style={on > 0.02 ? { filter: `drop-shadow(0 0 ${22 * on}px ${K.flow})` } : undefined} />
    <rect x={-22} y={36} width={44} height={26} rx={6} fill={C.case3} />
    <path d="M-12,12 L0,-14 L12,12" fill="none" stroke={on > 0.02 ? "#fff" : C.case3} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

/** Generador: rotor entre dos bobinas y cable a una bombilla. spin: ángulo; cur: corriente (0-1). */
export const Gen: React.FC<{ x: number; y: number; s?: number; t: number; spin: number; cur?: number; lamp?: boolean; hi?: string; o?: number }> = ({ x, y, s = 1, t, spin, cur = 0, lamp = true, hi = "", o = 1 }) => {
  const wire = "M-140,75 V200 H-40 M140,75 V200 H40";
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      <Coil x={-140} y={0} glow={cur} />
      <Coil x={140} y={0} glow={cur} />
      <Rotor x={0} y={0} r={64} ang={spin} />
      {hi === "rotor" && <circle r={86} fill="none" stroke={K.flow} strokeWidth={6} strokeDasharray="12 10" />}
      <path d={wire} fill="none" stroke={C.case3} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
      {cur > 0.02 && <path d={wire} fill="none" stroke={K.flow} strokeWidth={9} strokeLinejoin="round" strokeDasharray="6 28" strokeLinecap="round" strokeDashoffset={-t * 100} opacity={clamp01(cur * 1.3)} style={{ filter: `drop-shadow(0 0 6px ${K.flow})` }} />}
      {lamp && <Led x={0} y={235} s={0.8} on={cur > 0.05 ? 0.5 + 0.5 * cur : 0} />}
    </g>
  );
};

/** Engranaje con n dientes. */
export const Gear: React.FC<{ x: number; y: number; r: number; n: number; ang: number; color?: string }> = ({ x, y, r, n, ang, color = C.case2 }) => {
  const w = (2 * Math.PI) / n, ri = r * 0.84;
  const p = (rad: number, a: number) => `${rad * Math.cos(a)},${rad * Math.sin(a)}`;
  let d = "";
  for (let k = 0; k < n; k++) { const a = k * w; d += `${k ? "L" : "M"}${p(ri, a - 0.32 * w)} L${p(r, a - 0.16 * w)} L${p(r, a + 0.16 * w)} L${p(ri, a + 0.32 * w)} `; }
  return (
    <g transform={`translate(${x},${y}) rotate(${ang})`}>
      <path d={d + "Z"} fill={color} stroke={C.dark} strokeWidth={4} strokeLinejoin="round" />
      <circle r={r * 0.22} fill={C.dark} />
      <circle r={r * 0.5} fill="none" stroke={C.dark} strokeWidth={4} opacity={0.5} />
    </g>
  );
};

/** Linterna horizontal. crank: ángulo de la manivela; beam: haz; open: muestra el generador dentro. */
export const Torch: React.FC<{ x: number; y: number; s?: number; t: number; crank: number; beam?: number; open?: number }> = ({ x, y, s = 1, t, crank, beam = 0, open = 0 }) => {
  const ka = (crank * Math.PI) / 180;
  const kx = -120 + 70 * Math.cos(ka), ky = 70 * Math.sin(ka);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {beam > 0.02 && <path d="M280,-95 L760,-250 L760,250 L280,95 Z" fill={K.flow} opacity={0.22 * beam} />}
      <path d="M150,-65 L275,-118 L275,118 L150,65 Z" fill={C.case1} stroke={C.case3} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={275} cy={0} rx={22} ry={104} fill={beam > 0.02 ? K.flow : C.shell} opacity={beam > 0.02 ? 0.5 + 0.5 * beam : 1} style={beam > 0.02 ? { filter: `drop-shadow(0 0 18px ${K.flow})` } : undefined} />
      <rect x={-250} y={-65} width={400} height={130} rx={26} fill={C.case2} stroke={C.case3} strokeWidth={6} opacity={1 - 0.8 * open} />
      <rect x={-250} y={-65} width={400} height={130} rx={26} fill="none" stroke={C.case3} strokeWidth={6} />
      {open > 0.02 && <g opacity={open}><Gen x={0} y={-5} s={0.55} t={t} spin={crank * 6} cur={0} lamp={false} /></g>}
      {/* manivela */}
      <circle cx={-120} cy={0} r={78} fill="none" stroke={C.dark} strokeWidth={4} strokeDasharray="6 10" opacity={0.6} />
      <path d={`M-120,0 L${kx},${ky}`} stroke={K.flow} strokeWidth={14} strokeLinecap="round" />
      <circle cx={kx} cy={ky} r={20} fill={K.flow} stroke={C.dark} strokeWidth={5} />
      <circle cx={-120} cy={0} r={14} fill={C.dark} />
    </g>
  );
};

/** Imán de barra (N rojo, S cian). */
export const Bar: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 190, h = 70 }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-w / 2} y={-h / 2} width={w / 2} height={h} fill={C.case1} stroke={C.dark} strokeWidth={4} />
    <rect x={0} y={-h / 2} width={w / 2} height={h} fill={K.warn} stroke={C.dark} strokeWidth={4} />
    <rect x={-w / 2} y={-h / 2} width={w / 2} height={h} fill={K.cold} stroke={C.dark} strokeWidth={4} />
    <text x={-w / 4} y={h * 0.18} textAnchor="middle" fontFamily={FF} fontWeight={900} fontSize={h * 0.55} fill={C.dark}>S</text>
    <text x={w / 4} y={h * 0.18} textAnchor="middle" fontFamily={FF} fontWeight={900} fontSize={h * 0.55} fill={C.dark}>N</text>
  </g>
);

/** Onda alterna (naranja), rectificada (amarilla) o recta. */
export const Wave: React.FC<{ x1: number; x2: number; y: number; amp?: number; t: number; kind: "ac" | "rect"; o?: number; cycles?: number }> = ({ x1, x2, y, amp = 50, t, kind, o = 1, cycles = 3 }) => {
  const pts = Array.from({ length: 81 }).map((_, k) => { const u = k / 80; const v = Math.sin(u * cycles * 2 * Math.PI - t * 6); return `${x1 + (x2 - x1) * u},${y - amp * (kind === "rect" ? Math.abs(v) : v)}`; });
  return <polyline opacity={o} points={pts.join(" ")} fill="none" stroke={kind === "ac" ? K.hot : K.flow} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${kind === "ac" ? K.hot : K.flow})` }} />;
};

/** Batería horizontal con nivel. */
export const Bat: React.FC<{ x: number; y: number; s?: number; soc: number; o?: number }> = ({ x, y, s = 1, soc, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={-80} y={-50} width={160} height={100} rx={14} fill={C.dark} stroke={C.case3} strokeWidth={7} />
    <rect x={80} y={-18} width={14} height={36} rx={5} fill={C.case3} />
    <rect x={-70} y={-40} width={140 * clamp01(soc)} height={80} rx={8} fill={K.flow} />
  </g>
);

/** Rueda de bici con dinamo de botella y faro. */
export const Wheel: React.FC<{ x: number; y: number; r?: number; ang: number }> = ({ x, y, r = 200, ang }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={r} fill="none" stroke={C.dark} strokeWidth={24} />
    <circle r={r} fill="none" stroke={C.case3} strokeWidth={8} />
    <g transform={`rotate(${ang})`}>
      {Array.from({ length: 12 }).map((_, k) => <line key={k} x1={0} y1={0} x2={r * Math.cos((k * Math.PI) / 6)} y2={r * Math.sin((k * Math.PI) / 6)} stroke={C.case3} strokeWidth={3} />)}
    </g>
    <circle r={20} fill={C.case2} stroke={C.dark} strokeWidth={4} />
  </g>
);

export const Cross: React.FC<{ x: number; y: number; r?: number; p?: number }> = ({ x, y, r = 40, p = 1 }) => p <= 0.01 ? null : (
  <g opacity={p} stroke={K.warn} strokeWidth={14} strokeLinecap="round"><path d={`M${x - r},${y - r} L${x + r},${y + r}`} /><path d={`M${x + r},${y - r} L${x - r},${y + r}`} /></g>
);
