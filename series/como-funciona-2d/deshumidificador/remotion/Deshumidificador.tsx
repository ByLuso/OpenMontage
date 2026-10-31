// Dibujos SVG planos del episodio «Cómo saca agua del aire un deshumidificador».
// Colores de código: cian = frío/agua/aire, naranja = calor, amarillo = lo importante, rojo = peligro.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = { shell: "#2B4A72", shell2: "#3E6AA0", light: "#9FB3CC", dark: "#132A4A", ink: "#06101F" };
const W = 1080, H = 1920;
export const Svg: React.FC<{ children: React.ReactNode; o?: number }> = ({ children, o = 1 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>{children}</svg>
);

// ---------- geometría del aparato (cuerpo x 215-865, y 440-1130) ----------
export const U = {
  x0: 215, x1: 865, y0: 440, y1: 1130,
  evap: { x: 440, y0: 590, y1: 880 }, // serpentín frío (vertical)
  cond: { x: 575, y0: 590, y1: 880 }, // serpentín caliente
  fan: { x: 740, y: 735, r: 88 },
  comp: { x: 320, y: 1030 },
  tank: { x0: 430, x1: 845, y0: 960, y1: 1115 },
};

/** Muestra un punto a lo largo de una polilínea (u en 0..1). */
const alongI = (pts: [number, number][], u: number): [number, number, number] => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const L = seg.reduce((a, b) => a + b, 0);
  let d = ((u % 1) + 1) % 1 * L;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) { const k = d / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k, i]; }
    d -= seg[i];
  }
  const q = pts[pts.length - 1]; return [q[0], q[1], seg.length - 1];
};
const along = (pts: [number, number][], u: number): [number, number] => { const [x, y] = alongI(pts, u); return [x, y]; };

/** Recorrido del aire: entra por la izquierda, frío, caliente, ventilador, sale por arriba. */
export const AIR: [number, number][] = [[70, 735], [215, 735], [440, 735], [575, 735], [740, 735], [740, 560], [740, 400]];

/** Partículas de aire. Color según el tramo: húmedo (blanco con gotitas), frío (cian), templado (naranja claro). */
export const AirFlow: React.FC<{ t: number; o: number; n?: number; speed?: number; lanes?: number }> = ({ t, o, n = 22, speed = 0.12, lanes = 3 }) => {
  if (o <= 0.01) return null;
  const out: React.ReactNode[] = [];
  for (let l = 0; l < lanes; l++) {
    for (let k = 0; k < n; k++) {
      const u = (t * speed + k / n + l * 0.37) % 1;
      const [x0, y0] = along(AIR, u);
      const dy = (l - (lanes - 1) / 2) * 46;
      const x = y0 < 720 ? x0 + dy : x0, y = y0 < 720 ? y0 : y0 + dy;
      const humid = x < U.evap.x, cold = x >= U.evap.x && x < U.cond.x && y > 700;
      const col = humid ? K.white : cold ? K.cold : "#FFB27A";
      const fade = Math.min(1, u * 8, (1 - u) * 8);
      out.push(<g key={`${l}-${k}`} opacity={o * fade}>
        <circle cx={x} cy={y} r={humid ? 9 : 7} fill={col} opacity={0.85} />
        {humid && <circle cx={x + 12} cy={y - 10} r={4} fill={K.cold} />}
      </g>);
    }
  }
  return <g>{out}</g>;
};

/** Serpentín vertical con aletas. */
export const Coil: React.FC<{ x: number; y0: number; y1: number; color: string; glow?: number; frost?: number }> = ({ x, y0, y1, color, glow = 0, frost = 0 }) => {
  const n = 9, w = 34;
  let d = `M ${x - w} ${y0}`;
  for (let i = 0; i < n; i++) {
    const ya = y0 + ((y1 - y0) * i) / n, yb = y0 + ((y1 - y0) * (i + 1)) / n;
    d += ` L ${i % 2 ? x - w : x + w} ${ya} A 16 16 0 0 ${i % 2 ? 0 : 1} ${i % 2 ? x - w : x + w} ${yb}`;
  }
  return (
    <g>
      {glow > 0 && <rect x={x - w - 30} y={y0 - 20} width={2 * w + 60} height={y1 - y0 + 40} rx={30} fill={color} opacity={0.22 * glow} />}
      {Array.from({ length: 14 }).map((_, i) => (
        <line key={i} x1={x - w - 12} x2={x + w + 12} y1={y0 + 8 + ((y1 - y0 - 16) * i) / 13} y2={y0 + 8 + ((y1 - y0 - 16) * i) / 13} stroke={C.light} strokeWidth={3} opacity={0.45} />
      ))}
      <path d={d} fill="none" stroke={color} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
      {frost > 0 && Array.from({ length: 10 }).map((_, i) => (
        <circle key={i} cx={x + ((i * 37) % 60) - 30} cy={y0 + 20 + i * 26} r={5} fill={K.white} opacity={0.7 * frost} />
      ))}
    </g>
  );
};

/** Ventilador que gira. */
export const Fan: React.FC<{ x: number; y: number; r: number; t: number; speed?: number; hl?: number }> = ({ x, y, r, t, speed = 1, hl = 0 }) => (
  <g>
    <circle cx={x} cy={y} r={r + 14} fill={C.dark} stroke={hl > 0.5 ? K.flow : C.light} strokeWidth={6} />
    <g transform={`rotate(${t * 520 * speed} ${x} ${y})`}>
      {[0, 90, 180, 270].map((a) => (
        <path key={a} transform={`rotate(${a} ${x} ${y})`} d={`M ${x} ${y} C ${x + r * 0.2} ${y - r * 0.9}, ${x + r * 0.8} ${y - r * 0.9}, ${x + r * 0.55} ${y - r * 0.15} Z`} fill={hl > 0.5 ? K.flow : C.light} />
      ))}
    </g>
    <circle cx={x} cy={y} r={16} fill={C.shell2} stroke={K.ink} strokeWidth={4} />
  </g>
);

/** Compresor: cápsula que late. */
export const Compressor: React.FC<{ x: number; y: number; t: number; hl?: number; s?: number }> = ({ x, y, t, hl = 0, s = 1 }) => {
  const p = 1 + 0.03 * Math.sin(t * 18) * (0.3 + hl);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * p}) translate(${-x} ${-y})`}>
      <rect x={x - 70} y={y - 75} width={140} height={150} rx={60} fill={hl > 0.5 ? "#5A7FB0" : C.shell2} stroke={hl > 0.5 ? K.flow : C.light} strokeWidth={6} />
      <rect x={x - 50} y={y - 30} width={100} height={14} rx={7} fill={C.dark} />
      <rect x={x - 50} y={y + 2} width={100} height={14} rx={7} fill={C.dark} />
      <rect x={x - 80} y={y + 66} width={160} height={16} rx={6} fill={C.light} />
    </g>
  );
};

/** Gotas que caen de (x, y0) a y1. */
export const Drops: React.FC<{ t: number; x: number; y0: number; y1: number; o: number; n?: number; spread?: number; rate?: number }> = ({ t, x, y0, y1, o, n = 5, spread = 50, rate = 0.9 }) => {
  if (o <= 0.01) return null;
  return (
    <g opacity={o}>
      {Array.from({ length: n }).map((_, i) => {
        const u = (t * rate + i / n) % 1;
        const xx = x + ((i * 53) % (2 * spread + 1)) - spread;
        const y = y0 + (y1 - y0) * u * u;
        return <path key={i} d={`M ${xx} ${y - 18} C ${xx + 11} ${y - 2}, ${xx + 11} ${y + 10}, ${xx} ${y + 10} C ${xx - 11} ${y + 10}, ${xx - 11} ${y - 2}, ${xx} ${y - 18} Z`} fill={K.cold} opacity={Math.min(1, (1 - u) * 5)} />;
      })}
    </g>
  );
};

/** Agua en un recipiente con ola. */
export const Water: React.FC<{ x0: number; x1: number; y0: number; y1: number; level: number; t: number }> = ({ x0, x1, y0, y1, level, t }) => {
  const top = y1 - (y1 - y0) * Math.max(0, Math.min(1, level));
  let d = `M ${x0} ${y1} L ${x0} ${top}`;
  for (let x = x0; x <= x1; x += 20) d += ` L ${x} ${top + 5 * Math.sin(x / 30 + t * 4)}`;
  d += ` L ${x1} ${y1} Z`;
  return level > 0.01 ? <path d={d} fill={K.cold} opacity={0.85} /> : null;
};

/** Circuito de refrigerante: compresor → condensador → evaporador → compresor. */
export const LOOP: [number, number][] = [[262, 980], [262, 545], [575, 545], [575, 915], [507, 915], [507, 572], [440, 572], [440, 925], [345, 925], [345, 958]];
const HOT_END = 3; // índice del punto donde acaba el tramo caliente (salida del condensador)
export const Pipes: React.FC<{ o: number; t: number; dots?: number }> = ({ o, t, dots = 0 }) => {
  const d = "M " + LOOP.map((p) => p.join(" ")).join(" L ");
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke={C.light} strokeWidth={8} strokeLinejoin="round" opacity={0.6} />
      {dots > 0 && Array.from({ length: 34 }).map((_, i) => {
        const u = (t * 0.09 + i / 34) % 1;
        const [x, y, si] = alongI(LOOP, u);
        const hot = si < HOT_END; // del compresor a la salida del condensador: gas apretado y caliente
        return <circle key={i} cx={x} cy={y} r={9} fill={hot ? K.hot : K.cold} opacity={dots} stroke={K.ink} strokeWidth={2} />;
      })}
    </g>
  );
};

/** El deshumidificador completo. open: 0 cerrado → 1 tapa frontal fuera. hl: pieza resaltada. */
export const Unit: React.FC<{ t: number; open?: number; hl?: "fan" | "evap" | "cond" | "comp" | "tank" | null; air?: number; drops?: number; level?: number; loop?: number; frost?: number }> =
  ({ t, open = 1, hl = null, air = 0, drops = 0, level = 0.35, loop = 0, frost = 0 }) => {
    const dim = (k: string) => (hl && hl !== k ? 0.35 : 1);
    const { x0, x1, y0, y1, evap, cond, fan, comp, tank } = U;
    const cover = Math.max(0, Math.min(1, open));
    const slide = cover * 260, fadeCover = 1 - Math.min(1, cover * 1.6);
    return (
      <g transform="translate(540 1130) scale(0.95) translate(-540 -1130)">
        {/* sombra y carcasa */}
        <ellipse cx={540} cy={y1 + 18} rx={360} ry={22} fill="#000" opacity={0.3} />
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={46} fill={C.shell} stroke={C.light} strokeWidth={8} />
        <rect x={x0 + 22} y={y0 + 22} width={x1 - x0 - 44} height={y1 - y0 - 44} rx={30} fill={C.dark} />
        {/* rejilla de salida arriba */}
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={660 + i * 34} y={y0 - 6} width={18} height={30} rx={6} fill={C.light} />)}
        {/* rejilla de entrada a la izquierda */}
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={x0 - 6} y={630 + i * 34} width={30} height={16} rx={6} fill={C.light} />)}
        <g opacity={dim("comp")}><Pipes o={1} t={t} dots={loop} /></g>
        <g opacity={dim("evap")}><Coil x={evap.x} y0={evap.y0} y1={evap.y1} color={K.cold} glow={hl === "evap" ? 1 : 0} frost={frost} /></g>
        <g opacity={dim("cond")}><Coil x={cond.x} y0={cond.y0} y1={cond.y1} color={K.hot} glow={hl === "cond" ? 1 : 0} /></g>
        <g opacity={dim("fan")}><Fan x={fan.x} y={fan.y} r={fan.r} t={t} hl={hl === "fan" ? 1 : 0} /></g>
        <g opacity={dim("comp")}><Compressor x={comp.x} y={comp.y} t={t} hl={hl === "comp" ? 1 : 0} /></g>
        {/* depósito */}
        <g opacity={dim("tank")}>
          <rect x={tank.x0} y={tank.y0} width={tank.x1 - tank.x0} height={tank.y1 - tank.y0} rx={18} fill="#0B1E38" stroke={hl === "tank" ? K.flow : C.light} strokeWidth={6} />
          <Water x0={tank.x0 + 6} x1={tank.x1 - 6} y0={tank.y0 + 10} y1={tank.y1 - 6} level={level} t={t} />
        </g>
        <Drops t={t} x={evap.x} y0={evap.y1 + 10} y1={tank.y0 + 30} o={drops} n={4} spread={22} />
        <AirFlow t={t} o={air} />
        {/* tapa frontal: dos mitades que se separan */}
        {cover < 1 && (
          <g opacity={fadeCover}>
            <g transform={`translate(${-slide} 0)`}>
              <rect x={x0} y={y0} width={(x1 - x0) / 2} height={y1 - y0} rx={46} fill={C.shell2} stroke={C.light} strokeWidth={8} />
            </g>
            <g transform={`translate(${slide} 0)`}>
              <rect x={540} y={y0} width={(x1 - x0) / 2} height={y1 - y0} rx={46} fill={C.shell2} stroke={C.light} strokeWidth={8} />
            </g>
            <g transform={`translate(0 ${-cover * 200})`}>
              <rect x={400} y={520} width={280} height={110} rx={22} fill={C.dark} stroke={C.light} strokeWidth={5} />
              <path d="M 540 548 C 562 578, 566 596, 540 606 C 514 596, 518 578, 540 548 Z" fill={K.cold} />
              {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={300} y={700 + i * 34} width={480} height={14} rx={7} fill={C.dark} opacity={0.6} />)}
              <rect x={340} y={990} width={400} height={20} rx={10} fill={C.light} opacity={0.7} />
            </g>
          </g>
        )}
      </g>
    );
  };

/** Vaso frío con vapor que se convierte en gotas. */
export const ColdGlass: React.FC<{ t: number; cond: number }> = ({ t, cond }) => (
  <g>
    <path d="M 420 560 L 660 560 L 630 1060 L 450 1060 Z" fill="#163B66" stroke={C.light} strokeWidth={7} strokeLinejoin="round" />
    <path d="M 432 660 L 648 660 L 630 1052 L 450 1052 Z" fill={K.cold} opacity={0.35} />
    {[[480, 720], [560, 700], [520, 800], [600, 790]].map(([x, y], i) => (
      <rect key={i} x={x - 30} y={y - 30 + 6 * Math.sin(t * 2 + i)} width={60} height={60} rx={12} fill={K.white} opacity={0.6} transform={`rotate(${15 * i} ${x} ${y})`} />
    ))}
    {/* vapor que se acerca */}
    {Array.from({ length: 16 }).map((_, i) => {
      const side = i % 2 ? 1 : -1;
      const u = (t * 0.25 + i / 16) % 1;
      const x = 540 + side * (380 - 250 * u), y = 600 + ((i * 97) % 420);
      return <circle key={i} cx={x} cy={y} r={8} fill={K.white} opacity={0.7 * (1 - u)} />;
    })}
    {/* gotas en el cristal */}
    {Array.from({ length: 10 }).map((_, i) => {
      const side = i % 2 ? 1 : -1;
      const y = 620 + ((i * 61 + t * 60 * (0.5 + (i % 3) * 0.3)) % 420);
      const x = 540 + side * (118 - (y - 560) * 0.06);
      return <circle key={i} cx={x} cy={y} r={11} fill={K.cold} opacity={cond} stroke={K.ink} strokeWidth={2} />;
    })}
  </g>
);

/** Rueda de zeolita (desecante) que gira, con sector de secado caliente. */
export const Wheel: React.FC<{ t: number; heat: number; x?: number; y?: number; r?: number }> = ({ t, heat, x = 540, y = 760, r = 250 }) => {
  const cells: React.ReactNode[] = [];
  for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
    const cx = i * 44 + (j % 2 ? 22 : 0), cy = j * 38;
    if (Math.hypot(cx, cy) > r - 30) continue;
    cells.push(<polygon key={`${i}${j}`} points={[0, 1, 2, 3, 4, 5].map((k) => `${cx + 20 * Math.cos(Math.PI / 3 * k + Math.PI / 6)},${cy + 20 * Math.sin(Math.PI / 3 * k + Math.PI / 6)}`).join(" ")} fill="#C9B98E" stroke={C.ink} strokeWidth={3} />);
  }
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#8C7A55" stroke={C.light} strokeWidth={10} />
      <g transform={`translate(${x} ${y}) rotate(${t * 25})`}>{cells}</g>
      {/* sector de secado (calor) */}
      <path d={`M ${x} ${y} L ${x + r} ${y - 90} A ${r} ${r} 0 0 1 ${x + r} ${y + 90} Z`} fill={K.hot} opacity={0.45 * heat} />
      <circle cx={x} cy={y} r={30} fill={C.shell2} stroke={C.ink} strokeWidth={5} />
    </g>
  );
};

/** Gotas atrapadas por la rueda: entran por la izquierda y desaparecen en ella. */
export const Captured: React.FC<{ t: number; o: number }> = ({ t, o }) => (
  <g opacity={o}>
    {Array.from({ length: 14 }).map((_, i) => {
      const u = (t * 0.35 + i / 14) % 1;
      const x = 80 + 300 * u, y = 600 + ((i * 71) % 320);
      return <g key={i} opacity={Math.min(1, (1 - u) * 3)}>
        <circle cx={x} cy={y} r={9} fill={K.white} opacity={0.8} />
        <circle cx={x + 12} cy={y - 10} r={5} fill={K.cold} />
      </g>;
    })}
  </g>
);

/** Ventana de dos hojas que se cierran (close 0 → abierta, 1 → cerrada). */
export const Window: React.FC<{ close: number; t: number }> = ({ close, t }) => {
  const x0 = 290, x1 = 790, y0 = 470, y1 = 900, w = (x1 - x0) / 2;
  const open = 1 - close;
  return (
    <g>
      <rect x={x0 - 20} y={y0 - 20} width={x1 - x0 + 40} height={y1 - y0 + 40} rx={14} fill={C.shell} stroke={C.light} strokeWidth={8} />
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#1B3A63" />
      <ellipse cx={430} cy={580} rx={90} ry={34} fill={K.white} opacity={0.35} />
      <ellipse cx={660} cy={650} rx={70} ry={26} fill={K.white} opacity={0.3} />
      {/* aire húmedo de fuera, entra si está abierta */}
      {open > 0.05 && Array.from({ length: 10 }).map((_, i) => {
        const u = (t * 0.3 + i / 10) % 1;
        return <circle key={i} cx={540 + ((i * 41) % 120) - 60} cy={y0 + 40 + ((i * 67) % 340)} r={8 + 14 * u} fill={K.white} opacity={0.5 * (1 - u) * open} />;
      })}
      <g transform={`translate(${-open * w * 0.85} 0)`}>
        <rect x={x0} y={y0} width={w} height={y1 - y0} fill={K.cold} opacity={0.18} stroke={C.light} strokeWidth={10} />
        <line x1={x0} x2={x0 + w} y1={(y0 + y1) / 2} y2={(y0 + y1) / 2} stroke={C.light} strokeWidth={8} />
        <rect x={x0 + w - 26} y={(y0 + y1) / 2 - 40} width={12} height={80} rx={6} fill={K.flow} />
      </g>
      <g transform={`translate(${open * w * 0.85} 0)`}>
        <rect x={x0 + w} y={y0} width={w} height={y1 - y0} fill={K.cold} opacity={0.18} stroke={C.light} strokeWidth={10} />
        <line x1={x0 + w} x2={x1} y1={(y0 + y1) / 2} y2={(y0 + y1) / 2} stroke={C.light} strokeWidth={8} />
      </g>
    </g>
  );
};

/** Barra de humedad 0-100 % con la zona buena 40-60 % y una aguja. */
export const HumBar: React.FC<{ value: number; band: number; y?: number }> = ({ value, band, y = 1010 }) => {
  const x0 = 140, x1 = 940, X = (v: number) => x0 + ((x1 - x0) * v) / 100;
  const good = value >= 40 && value <= 60;
  return (
    <g>
      <rect x={x0} y={y - 18} width={x1 - x0} height={36} rx={18} fill="rgba(255,255,255,0.15)" />
      <rect x={X(40)} y={y - 18} width={X(60) - X(40)} height={36} fill={K.flow} opacity={0.35 + 0.6 * band} />
      <rect x={X(60)} y={y - 18} width={x1 - X(60)} height={36} rx={18} fill={K.cold} opacity={0.35} />
      <g transform={`translate(${X(value)} 0)`}>
        <path d={`M 0 ${y - 24} L -18 ${y - 58} L 18 ${y - 58} Z`} fill={good ? K.flow : K.white} stroke={K.ink} strokeWidth={3} />
      </g>
    </g>
  );
};

/** Vaso de agua y lechuga del huerto, tachados. */
export const NoDrink: React.FC<{ t: number; x: number; cross: number }> = ({ t, x, cross }) => (
  <g>
    <path d={`M ${x - 95} 600 L ${x + 95} 600 L ${x + 75} 960 L ${x - 75} 960 Z`} fill="#163B66" stroke={C.light} strokeWidth={7} />
    <path d={`M ${x - 87} 680 L ${x + 87} 680 L ${x + 75} 952 L ${x - 75} 952 Z`} fill={K.cold} opacity={0.6} />
    {Array.from({ length: 7 }).map((_, i) => (
      <g key={i} transform={`translate(${x - 50 + ((i * 37) % 100)} ${720 + ((i * 53) % 200) + 6 * Math.sin(t * 3 + i)})`}>
        <circle r={10} fill={K.warn} />
        {[0, 60, 120, 180, 240, 300].map((a) => <line key={a} x1={0} y1={0} x2={16 * Math.cos((a * Math.PI) / 180)} y2={16 * Math.sin((a * Math.PI) / 180)} stroke={K.warn} strokeWidth={3} />)}
      </g>
    ))}
    <Cross x={x} y={780} p={cross} />
  </g>
);
export const Lettuce: React.FC<{ x: number; cross: number; t: number }> = ({ x, cross, t }) => (
  <g>
    <rect x={x - 110} y={900} width={220} height={70} rx={12} fill="#6B4A2E" />
    {[-70, -35, 0, 35, 70].map((dx, i) => (
      <ellipse key={i} cx={x + dx} cy={830 + Math.abs(dx) * 0.5} rx={46} ry={80} fill={i % 2 ? "#5FBF5A" : "#7FD86F"} transform={`rotate(${dx * 0.5 + 2 * Math.sin(t * 2 + i)} ${x + dx} 900)`} />
    ))}
    <Cross x={x} y={820} p={cross} />
  </g>
);
export const Cross: React.FC<{ x: number; y: number; p: number }> = ({ x, y, p }) => p <= 0.01 ? null : (
  <g opacity={Math.min(1, p * 2)} transform={`translate(${x} ${y}) scale(${1.4 - 0.4 * p})`}>
    <line x1={-120} y1={-120} x2={120} y2={120} stroke={K.warn} strokeWidth={26} strokeLinecap="round" />
    <line x1={120} y1={-120} x2={-120} y2={120} stroke={K.warn} strokeWidth={26} strokeLinecap="round" />
  </g>
);
