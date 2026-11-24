// Dibujos SVG del episodio «Cómo funciona un aerogenerador». Coordenadas absolutas de 1080×1920.
// Colores de código: cian = aire/viento, naranja = giro/energía mecánica, amarillo = lo importante/corriente,
// blanco = texto, rojo = peligro/parada. Grises azulados para carcasas. Sin marcas: aerogenerador genérico.
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F", inner: "#0B1A30", shell: "#E9EEF5", shell2: "#B9C6D6",
  blade: "#F2F5FA", blade2: "#C9D4E2", steel: "#7F93AD", copper: "#D9873B", copper2: "#A8622A", bus: "#FFD23F", glass: "#8FE3FF" };

const glow = (c: string, r: number) => ({ filter: `drop-shadow(0 0 ${r}px ${c})` });
const deg = (r: number) => (r * 180) / Math.PI;

/** Ángulo del rotor que gira a `w` rad/s y frena suavemente desde `stopAt` (τ = 0,8 s). */
export const spinAngle = (t: number, w: number, stopAt = Infinity, tau = 0.8) =>
  t < stopAt ? w * t : w * stopAt + w * tau * (1 - Math.exp(-(t - stopAt) / tau));

/** Silueta de una pala (apunta hacia arriba desde el origen), largo L. */
const bladePath = (L: number) => {
  const w = L * 0.1;
  return `M${-w * 0.35},0 C${-w * 0.9},${-L * 0.12} ${-w * 0.75},${-L * 0.3} ${-w * 0.45},${-L * 0.6} L${-w * 0.12},${-L} Q0,${-L * 1.01} ${w * 0.1},${-L * 0.99} L${w * 0.3},${-L * 0.6} C${w * 0.45},${-L * 0.3} ${w * 0.5},${-L * 0.12} ${w * 0.35},0 Z`;
};

/** Aerogenerador visto de frente: torre, góndola, buje y 3 palas que giran (rot en radianes). */
export const Turbine: React.FC<{ x: number; baseY: number; hubY: number; L: number; rot: number; o?: number; trail?: number }> = ({ x, baseY, hubY, L, rot, o = 1, trail = 0 }) => {
  const tw0 = Math.max(14, L * 0.09), tw1 = Math.max(24, L * 0.16);
  return (
    <g opacity={o}>
      <path d={`M${x - tw0 / 2},${hubY} L${x + tw0 / 2},${hubY} L${x + tw1 / 2},${baseY} L${x - tw1 / 2},${baseY} Z`} fill={C.shell2} stroke={C.ink} strokeWidth={4} />
      <rect x={x - L * 0.12} y={hubY - L * 0.07} width={L * 0.24} height={L * 0.14} rx={L * 0.05} fill={C.shell} stroke={C.ink} strokeWidth={4} />
      {trail > 0.01 && [0, 1, 2].map((k) => {
        const a = rot + (k * 2 * Math.PI) / 3;
        const a0 = a - 0.9;
        const p = (aa: number) => `${x + L * Math.sin(aa)},${hubY - L * Math.cos(aa)}`;
        return <path key={k} d={`M${p(a0)} A${L},${L} 0 0 1 ${p(a)}`} fill="none" stroke={K.hot} strokeWidth={10} strokeLinecap="round" opacity={0.75 * trail} style={glow(K.hot, 10)} />;
      })}
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${x},${hubY}) rotate(${deg(rot) + k * 120})`}>
          <path d={bladePath(L)} fill={C.blade} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M0,${-L * 0.08} L0,${-L * 0.85}`} stroke={C.blade2} strokeWidth={3} />
        </g>
      ))}
      <circle cx={x} cy={hubY} r={Math.max(10, L * 0.08)} fill={C.shell} stroke={C.ink} strokeWidth={4} />
      <circle cx={x} cy={hubY} r={Math.max(4, L * 0.03)} fill={C.case2} />
    </g>
  );
};

/** Engranaje: radio r, n dientes. */
const gearPath = (r: number, n: number, d = 0.14) => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI, s = (Math.PI / n);
    const ro = r * (1 + d / 2), ri = r * (1 - d / 2);
    const q = [[a - s * 0.5, ri], [a - s * 0.3, ro], [a + s * 0.3, ro], [a + s * 0.5, ri], [a + s * 1.5, ri]];
    q.forEach(([aa, rr], j) => pts.push(`${i === 0 && j === 0 ? "M" : "L"}${(rr * Math.cos(aa)).toFixed(1)},${(rr * Math.sin(aa)).toFixed(1)}`));
  }
  return pts.join(" ") + " Z";
};
export const Gear: React.FC<{ x: number; y: number; r: number; n: number; a: number; color?: string; hi?: number }> = ({ x, y, r, n, a, color = C.steel, hi = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${deg(a)})`} style={hi > 0.01 ? glow(K.flow, 14 * hi) : undefined}>
    <path d={gearPath(r, n)} fill={color} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    <circle r={r * 0.62} fill="none" stroke={C.ink} strokeWidth={3} opacity={0.5} />
    {[0, 1, 2, 3].map((k) => <line key={k} x1={0} y1={0} x2={r * 0.6 * Math.cos(k * Math.PI / 2)} y2={r * 0.6 * Math.sin(k * Math.PI / 2)} stroke={C.ink} strokeWidth={Math.max(3, r * 0.06)} opacity={0.55} />)}
    <circle r={r * 0.16} fill={C.case3} stroke={C.ink} strokeWidth={3} />
  </g>
);

/** Par de engranajes de la multiplicadora: el grande gira despacio (a) y el pequeño x(R/r) más rápido. */
export const GearPair: React.FC<{ x: number; y: number; R?: number; r?: number; a: number; hiBig?: number; hiSmall?: number }> = ({ x, y, R = 200, r = 70, a, hiBig = 0, hiSmall = 0 }) => {
  const nB = 30, nS = Math.round((30 * r) / R);
  return (
    <g>
      <Gear x={x} y={y} r={R} n={nB} a={a} color={C.case3} hi={hiBig} />
      <Gear x={x + R + r} y={y} r={r} n={nS} a={-a * (R / r) + Math.PI / nS} color={K.hot} hi={hiSmall} />
    </g>
  );
};

/** Anemómetro: mástil y tres cazoletas que giran (vista lateral). */
export const Anemometer: React.FC<{ x: number; y: number; s?: number; t: number; o?: number; w?: number }> = ({ x, y, s = 1, t, o = 1, w = 6 }) => (
  <g opacity={o} transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-5} y={0} width={10} height={90} fill={C.case3} stroke={C.ink} strokeWidth={3} />
    {[0, 1, 2].map((k) => {
      const a = t * w + (k * 2 * Math.PI) / 3;
      const cx = 70 * Math.cos(a), depth = Math.sin(a);
      return <g key={k} opacity={0.55 + 0.45 * (depth + 1) / 2}>
        <line x1={0} y1={0} x2={cx} y2={0} stroke={C.case3} strokeWidth={6} />
        <circle cx={cx} cy={0} r={17 + 4 * depth} fill={C.shell} stroke={C.ink} strokeWidth={3} />
        <circle cx={cx + (Math.cos(a + Math.PI / 2) > 0 ? 5 : -5)} cy={0} r={8 + 2 * depth} fill={C.case2} />
      </g>;
    })}
    <circle cx={0} cy={0} r={9} fill={C.case2} stroke={C.ink} strokeWidth={3} />
  </g>
);

/** Veleta: flecha con aleta de cola; `a` = desvío en grados. */
export const Vane: React.FC<{ x: number; y: number; s?: number; a?: number; o?: number }> = ({ x, y, s = 1, a = 0, o = 1 }) => (
  <g opacity={o} transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-5} y={0} width={10} height={90} fill={C.case3} stroke={C.ink} strokeWidth={3} />
    <g transform={`rotate(${a})`}>
      <line x1={-80} y1={0} x2={70} y2={0} stroke={C.case3} strokeWidth={7} />
      <path d="M-100,0 L-70,-16 L-70,16 Z" fill={K.flow} stroke={C.ink} strokeWidth={3} />
      <path d="M40,0 L95,-48 L110,-48 L95,0 Z" fill={C.shell} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
    </g>
    <circle cx={0} cy={0} r={9} fill={C.case2} stroke={C.ink} strokeWidth={3} />
  </g>
);

/**
 * Góndola en corte (vista lateral). Centro (x, y), ancho w, alto h. El buje y las palas quedan a la izquierda.
 * open 0→1: la tapa sube (×lift) y la carcasa se vuelve transparente: se ve el eje lento, la multiplicadora, el eje rápido y el generador.
 * direct: sin multiplicadora (generador grande pegado al buje).
 */
export const Nacelle: React.FC<{ x: number; y: number; w: number; h: number; t: number; rot: number; open: number; lift?: number; bladeL?: number;
  gen?: number; gear?: number; sensors?: number; direct?: boolean; tower?: number; o?: number; fast?: number }> =
  ({ x, y, w, h, t, rot, open, lift = 1, bladeL = 0, gen = 0, gear = 0, sensors = 1, direct = false, tower = 0, o = 1, fast }) => {
    const x0 = x - w / 2, x1 = x + w / 2, y0 = y - h / 2, y1 = y + h / 2;
    const hubX = x0 - h * 0.18, hubR = h * 0.42;
    const dy = -open * lift * h * 0.55;
    const shellPath = `M${x0},${y0 + h * 0.18} Q${x0},${y0} ${x0 + h * 0.2},${y0} L${x1 - h * 0.25},${y0} Q${x1},${y0} ${x1},${y0 + h * 0.3} L${x1},${y1 - h * 0.15} Q${x1},${y1} ${x1 - h * 0.15},${y1} L${x0 + h * 0.15},${y1} Q${x0},${y1} ${x0},${y1 - h * 0.15} Z`;
    const lidPath = `M${x0},${y + 0.0 * h} L${x0},${y0 + h * 0.18} Q${x0},${y0} ${x0 + h * 0.2},${y0} L${x1 - h * 0.25},${y0} Q${x1},${y0} ${x1},${y0 + h * 0.3} L${x1},${y} Z`;
    const fastA = (fast ?? rot * 3);
    // posiciones internas
    const gbX = x0 + w * 0.36, genX = x0 + w * 0.68;
    return (
      <g opacity={o}>
        {tower > 0 && <path d={`M${x - h * 0.22},${y1 - 4} L${x + h * 0.22},${y1 - 4} L${x + h * 0.34},${tower} L${x - h * 0.34},${tower} Z`} fill={C.shell2} stroke={C.ink} strokeWidth={5} />}
        {/* interior */}
        <path d={shellPath} fill={C.inner} stroke={C.case2} strokeWidth={3} />
        <g opacity={clamp01(open * 1.6)}>
          {/* eje lento */}
          <rect x={x0 - 6} y={y - h * 0.09} width={(direct ? w * 0.12 : gbX - x0 - w * 0.08)} height={h * 0.18} fill={C.steel} stroke={C.ink} strokeWidth={3} />
          {!direct && <>
            {/* multiplicadora */}
            <g style={gear > 0.01 ? glow(K.flow, 16 * gear) : undefined}>
              <rect x={gbX - w * 0.1} y={y - h * 0.34} width={w * 0.2} height={h * 0.62} rx={10} fill={C.case2} stroke={gear > 0.01 ? K.flow : C.ink} strokeWidth={4} />
              <Gear x={gbX - w * 0.025} y={y - h * 0.04} r={h * 0.2} n={16} a={rot} color={C.case3} />
              <Gear x={gbX + w * 0.05} y={y - h * 0.04} r={h * 0.09} n={8} a={-rot * 2.2} color={K.hot} />
            </g>
            {/* eje rápido */}
            <rect x={gbX + w * 0.1} y={y - h * 0.05} width={genX - gbX - w * 0.2} height={h * 0.1} fill={C.steel} stroke={C.ink} strokeWidth={2} />
            {[0, 1, 2].map((k) => <rect key={k} x={gbX + w * 0.1 + ((fastA * 30 + k * 40) % Math.max(1, genX - gbX - w * 0.2 - 8))} y={y - h * 0.05} width={8} height={h * 0.1} fill={K.hot} opacity={0.9} />)}
          </>}
          {/* generador */}
          {(() => {
            const gx = direct ? x0 + w * 0.12 : genX - w * 0.1, gw = direct ? w * 0.22 : w * 0.2, gh = direct ? h * 0.86 : h * 0.6;
            return <g style={gen > 0.01 ? glow(K.flow, 20 * gen) : undefined}>
              <rect x={gx} y={y - gh / 2} width={gw} height={gh} rx={12} fill={C.case1} stroke={gen > 0.01 ? K.flow : C.ink} strokeWidth={4} />
              {Array.from({ length: 5 }).map((_, k) => (
                <rect key={k} x={gx + 8 + k * (gw - 16) / 5} y={y - gh / 2 + 8} width={(gw - 16) / 5 - 6} height={gh - 16} rx={4} fill={C.copper}
                  opacity={0.75 + 0.25 * Math.sin(t * 8 + k)} />
              ))}
              {gen > 0.01 && <rect x={gx} y={y - gh / 2} width={gw} height={gh} rx={12} fill={K.flow} opacity={0.25 * gen * (0.7 + 0.3 * Math.sin(t * 10))} />}
            </g>;
          })()}
          {/* armario de control */}
          <rect x={x1 - w * 0.1} y={y - h * 0.2} width={w * 0.07} height={h * 0.5} rx={6} fill={C.case2} stroke={C.ink} strokeWidth={3} />
          <circle cx={x1 - w * 0.065} cy={y - h * 0.08} r={5} fill={Math.floor(t * 2) % 2 ? K.flow : "#2E7D32"} />
        </g>
        {/* carcasa que se vuelve transparente */}
        <path d={shellPath} fill={C.shell} stroke={C.ink} strokeWidth={5} opacity={1 - clamp01(open * 1.4)} />
        <path d={`M${x0 + w * 0.08},${y + h * 0.28} L${x1 - w * 0.08},${y + h * 0.28}`} stroke={C.shell2} strokeWidth={6} strokeLinecap="round" opacity={1 - clamp01(open * 1.4)} />
        {/* tapa (mitad de arriba) que se levanta, con los sensores */}
        <g transform={`translate(${-open * lift * 12},${dy}) rotate(${-4 * open * lift} ${x0} ${y})`}>
          <path d={lidPath} fill={C.shell} stroke={C.ink} strokeWidth={5} opacity={lift > 0 ? 1 : 1 - clamp01(open * 1.4)} />
          <g opacity={sensors * (lift > 0 ? 1 : 1 - clamp01(open * 1.4) * 0.3)}>
            <Anemometer x={x1 - w * 0.2} y={y0 - h * 0.34} s={h / 330} t={t} />
            <Vane x={x1 - w * 0.08} y={y0 - h * 0.3} s={h / 330} a={6 * Math.sin(t * 1.3)} />
          </g>
        </g>
        {/* palas (vista lateral: se acortan al girar) y buje */}
        {bladeL > 0 && [0, 1, 2].map((k) => {
          const a = rot + (k * 2 * Math.PI) / 3;
          const ly = -bladeL * Math.cos(a), front = Math.sin(a);
          const wd = bladeL * 0.2 * (0.5 + 0.5 * Math.abs(front));
          const sg = ly < 0 ? -1 : 1;
          return <path key={k} d={`M${hubX - wd / 2},${y} L${hubX - wd * 0.28},${y + ly} L${hubX + wd * 0.22},${y + ly} L${hubX + wd / 2},${y + sg * 4} Z`}
            fill={front > 0 ? C.blade : C.blade2} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />;
        })}
        <path d={`M${hubX + hubR * 0.3},${y - hubR} Q${hubX - hubR * 1.4},${y - hubR * 0.9} ${hubX - hubR * 1.5},${y} Q${hubX - hubR * 1.4},${y + hubR * 0.9} ${hubX + hubR * 0.3},${y + hubR} Z`}
          fill={C.shell} stroke={C.ink} strokeWidth={5} />
      </g>
    );
  };

/** Autobús de lado, largo len, apoyado en y (ruedas). */
export const Bus: React.FC<{ x: number; y: number; len: number; o?: number }> = ({ x, y, len, o = 1 }) => {
  const h = len * 0.26, x0 = x - len / 2;
  return (
    <g opacity={o}>
      <rect x={x0} y={y - h - 18} width={len} height={h} rx={18} fill={C.bus} stroke={C.ink} strokeWidth={5} />
      {Array.from({ length: 6 }).map((_, k) => <rect key={k} x={x0 + 30 + k * (len - 60) / 6} y={y - h - 4} width={(len - 60) / 6 - 12} height={h * 0.35} rx={6} fill={C.inner} opacity={0.85} />)}
      <rect x={x0 + 12} y={y - h - 4} width={22} height={h * 0.7} rx={4} fill={C.inner} opacity={0.85} />
      {[0.18, 0.8].map((f) => <g key={f}><circle cx={x0 + len * f} cy={y - 18} r={h * 0.18} fill={C.ink} /><circle cx={x0 + len * f} cy={y - 18} r={h * 0.08} fill={C.case3} /></g>)}
    </g>
  );
};

/** Flecha de cota vertical (de y0 a y1) con topes. */
export const Dim: React.FC<{ x: number; y0: number; y1: number; o?: number; color?: string }> = ({ x, y0, y1, o = 1, color = K.flow }) => o <= 0.01 ? null : (
  <g opacity={o} stroke={color} strokeWidth={5} strokeLinecap="round">
    <line x1={x} y1={y0} x2={x} y2={y1} />
    <line x1={x - 18} y1={y0} x2={x + 18} y2={y0} />
    <line x1={x - 18} y1={y1} x2={x + 18} y2={y1} />
    <path d={`M${x - 12},${y0 + 18} L${x},${y0 + 4} L${x + 12},${y0 + 18}`} fill="none" />
    <path d={`M${x - 12},${y1 - 18} L${x},${y1 - 4} L${x + 12},${y1 - 18}`} fill="none" />
  </g>
);
/** Cota horizontal. */
export const DimH: React.FC<{ y: number; x0: number; x1: number; o?: number; color?: string }> = ({ y, x0, x1, o = 1, color = K.flow }) => o <= 0.01 ? null : (
  <g opacity={o} stroke={color} strokeWidth={5} strokeLinecap="round">
    <line x1={x0} y1={y} x2={x1} y2={y} />
    <line x1={x0} y1={y - 16} x2={x0} y2={y + 16} />
    <line x1={x1} y1={y - 16} x2={x1} y2={y + 16} />
  </g>
);

/** Perfil de ala (NACA 4412 aprox.) de cuerda c, centrado en (x,y), girado `a` grados. plate = 1 → placa plana. */
export const airfoilPath = (c: number, plate = 0) => {
  const N = 40, up: string[] = [], lo: string[] = [];
  for (let i = 0; i <= N; i++) {
    const xx = (1 - Math.cos((i / N) * Math.PI)) / 2;
    const th = 0.15 * (1 - plate * 0.8);
    const yt = 5 * th * (0.2969 * Math.sqrt(xx) - 0.126 * xx - 0.3516 * xx * xx + 0.2843 * xx ** 3 - 0.1036 * xx ** 4);
    const m = 0.04 * (1 - plate), p = 0.4;
    const yc = xx < p ? (m / (p * p)) * (2 * p * xx - xx * xx) : (m / ((1 - p) ** 2)) * (1 - 2 * p + 2 * p * xx - xx * xx);
    up.push(`${((xx - 0.35) * c).toFixed(1)},${(-(yc + yt) * c).toFixed(1)}`);
    lo.push(`${((xx - 0.35) * c).toFixed(1)},${(-(yc - yt) * c).toFixed(1)}`);
  }
  return `M${up.join(" L")} L${lo.reverse().join(" L")} Z`;
};
export const Airfoil: React.FC<{ x: number; y: number; c: number; a?: number; plate?: number; o?: number; hi?: number; fill?: string }> = ({ x, y, c, a = 0, plate = 0, o = 1, hi = 0, fill = C.blade }) => (
  <g opacity={o} transform={`translate(${x},${y}) rotate(${a})`} style={hi > 0.01 ? glow(K.flow, 16 * hi) : undefined}>
    <path d={airfoilPath(c, plate)} fill={fill} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

/** Líneas de viento que avanzan de izquierda a derecha. bend: curvatura sobre un ala centrada en (cx, cy) de cuerda c. */
export const Wind: React.FC<{ x0: number; x1: number; ys: number[]; t: number; o?: number; speed?: number; color?: string; bend?: { cx: number; cy: number; c: number }; fastTop?: number; w?: number }> =
  ({ x0, x1, ys, t, o = 1, speed = 260, color = K.cold, bend, fastTop = 0, w = 6 }) => o <= 0.01 ? null : (
    <g opacity={o}>
      {ys.map((yy, k) => {
        let d = `M${x0},${yy} L${x1},${yy}`;
        let sp = speed;
        if (bend) {
          const above = yy < bend.cy;
          const dist = Math.abs(yy - bend.cy);
          const amp = Math.max(0, (above ? 0.28 : 0.1) * bend.c - dist * 0.25) * (above ? -1 : 1);
          const L = bend.cx - bend.c * 0.55, R = bend.cx + bend.c * 0.75;
          d = `M${x0},${yy} L${L},${yy} C${bend.cx - bend.c * 0.25},${yy + amp} ${bend.cx + bend.c * 0.25},${yy + amp} ${R},${yy + (above ? amp * 0.15 : 0)} L${x1},${yy + (above ? amp * 0.15 : 0)}`;
          if (above) sp = speed * (1 + fastTop * 0.9);
        }
        return <path key={k} d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray="60 70" strokeDashoffset={-(t * sp + k * 37)} opacity={0.85} />;
      })}
    </g>
  );

/** Flecha gruesa. */
export const Arrow: React.FC<{ x0: number; y0: number; x1: number; y1: number; color?: string; o?: number; w?: number }> = ({ x0, y0, x1, y1, color = K.flow, o = 1, w = 12 }) => {
  if (o <= 0.01) return null;
  const a = Math.atan2(y1 - y0, x1 - x0), hl = w * 2.6;
  const bx = x1 - hl * Math.cos(a), by = y1 - hl * Math.sin(a);
  const px = Math.cos(a + Math.PI / 2), py = Math.sin(a + Math.PI / 2);
  return (
    <g opacity={o} style={glow(color, 8)}>
      <line x1={x0} y1={y0} x2={bx} y2={by} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${x1},${y1} L${bx + px * hl * 0.7},${by + py * hl * 0.7} L${bx - px * hl * 0.7},${by - py * hl * 0.7} Z`} fill={color} />
    </g>
  );
};

/** Signo «+» o «−» en un círculo. */
export const Sign: React.FC<{ x: number; y: number; plus?: boolean; color: string; o?: number; r?: number }> = ({ x, y, plus = false, color, o = 1, r = 30 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill={C.inner} stroke={color} strokeWidth={5} />
    <line x1={x - r * 0.5} y1={y} x2={x + r * 0.5} y2={y} stroke={color} strokeWidth={7} strokeLinecap="round" />
    {plus && <line x1={x} y1={y - r * 0.5} x2={x} y2={y + r * 0.5} stroke={color} strokeWidth={7} strokeLinecap="round" />}
  </g>
);

/** Generador visto de frente: estator con bobinas de cobre y rotor de imanes (naranja/cian) que gira. */
export const Generator: React.FC<{ x: number; y: number; R: number; a: number; t: number; o?: number; mag?: number; coil?: number; current?: number }> =
  ({ x, y, R, a, t, o = 1, mag = 1, coil = 1, current = 0 }) => {
    const nC = 12, nM = 8;
    return (
      <g opacity={o}>
        <circle cx={x} cy={y} r={R} fill={C.case1} stroke={C.ink} strokeWidth={6} />
        <circle cx={x} cy={y} r={R * 0.93} fill="none" stroke={C.case2} strokeWidth={4} />
        <g opacity={0.35 + 0.65 * coil}>
          {Array.from({ length: nC }).map((_, k) => {
            const ang = (k / nC) * 360;
            const pulse = current * (0.5 + 0.5 * Math.sin(t * 9 - k * 0.9));
            return <g key={k} transform={`translate(${x},${y}) rotate(${ang})`}>
              <rect x={-R * 0.11} y={-R * 0.88} width={R * 0.22} height={R * 0.3} rx={6} fill={C.copper} stroke={C.copper2} strokeWidth={3} />
              {[0, 1, 2].map((j) => <line key={j} x1={-R * 0.11} y1={-R * 0.82 + j * R * 0.09} x2={R * 0.11} y2={-R * 0.82 + j * R * 0.09} stroke={C.copper2} strokeWidth={3} />)}
              {pulse > 0.02 && <rect x={-R * 0.11} y={-R * 0.88} width={R * 0.22} height={R * 0.3} rx={6} fill={K.flow} opacity={0.75 * pulse} style={glow(K.flow, 10)} />}
            </g>;
          })}
        </g>
        <circle cx={x} cy={y} r={R * 0.56} fill={C.inner} stroke={C.ink} strokeWidth={4} />
        <g transform={`translate(${x},${y}) rotate(${deg(a)})`} opacity={0.35 + 0.65 * mag}>
          {Array.from({ length: nM }).map((_, k) => {
            const a0 = (k / nM) * 2 * Math.PI, a1 = ((k + 1) / nM) * 2 * Math.PI, r0 = R * 0.2, r1 = R * 0.52;
            const p = (aa: number, rr: number) => `${(rr * Math.cos(aa)).toFixed(1)},${(rr * Math.sin(aa)).toFixed(1)}`;
            return <path key={k} d={`M${p(a0, r0)} L${p(a0, r1)} A${r1},${r1} 0 0 1 ${p(a1, r1)} L${p(a1, r0)} A${r0},${r0} 0 0 0 ${p(a0, r0)} Z`}
              fill={k % 2 ? K.cold : K.hot} stroke={C.ink} strokeWidth={3} />;
          })}
          {Array.from({ length: nM }).map((_, k) => {
            const am = ((k + 0.5) / nM) * 2 * Math.PI;
            return <text key={k} x={R * 0.38 * Math.cos(am)} y={R * 0.38 * Math.sin(am) + R * 0.05} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900}
              fontSize={R * 0.13} fill={C.ink}>{k % 2 ? "S" : "N"}</text>;
          })}
          <circle r={R * 0.18} fill={C.case3} stroke={C.ink} strokeWidth={4} />
        </g>
      </g>
    );
  };

/** Bombilla; on 0→1 la enciende. */
export const Bulb: React.FC<{ x: number; y: number; s?: number; on?: number; o?: number }> = ({ x, y, s = 1, on = 0, o = 1 }) => (
  <g opacity={o} transform={`translate(${x},${y}) scale(${s})`}>
    {on > 0.01 && <circle cx={0} cy={-20} r={95} fill={K.flow} opacity={0.22 * on} />}
    <path d="M-48,-30 A55,55 0 1 1 48,-30 C40,-5 26,8 24,30 L-24,30 C-26,8 -40,-5 -48,-30 Z" fill={on > 0.01 ? K.flow : "#33435c"} stroke={C.ink} strokeWidth={5}
      style={on > 0.01 ? glow(K.flow, 24 * on) : undefined} />
    <path d="M-12,25 L-12,0 L0,-16 L12,0 L12,25" fill="none" stroke={on > 0.01 ? K.hot : C.case3} strokeWidth={4} />
    <rect x={-26} y={30} width={52} height={14} rx={4} fill={C.case3} stroke={C.ink} strokeWidth={4} />
    <rect x={-22} y={44} width={44} height={14} rx={4} fill={C.case3} stroke={C.ink} strokeWidth={4} />
    <path d="M-12,58 L12,58 L4,68 L-4,68 Z" fill={C.case2} stroke={C.ink} strokeWidth={3} />
  </g>
);

/** Cable con puntos amarillos (corriente) de (x0,y0) a (x1,y1) por un codo. */
export const Wire: React.FC<{ pts: [number, number][]; t: number; o?: number; flow?: number }> = ({ pts, t, o = 1, flow = 1 }) => {
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke={C.copper2} strokeWidth={12} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={C.copper} strokeWidth={6} strokeLinejoin="round" />
      {flow > 0.01 && <path d={d} fill="none" stroke={K.flow} strokeWidth={10} strokeLinecap="round" strokeDasharray="6 34" strokeDashoffset={-t * 160} opacity={flow} style={glow(K.flow, 8)} />}
    </g>
  );
};

/** Góndola vista desde arriba, girada yaw grados (0 = mirando a la izquierda, de cara al viento). */
export const TopView: React.FC<{ x: number; y: number; yaw: number; t: number; o?: number; rotorL?: number }> = ({ x, y, yaw, t, o = 1, rotorL = 170 }) => (
  <g opacity={o} transform={`translate(${x},${y}) rotate(${yaw})`}>
    <rect x={-110} y={-62} width={300} height={124} rx={40} fill={C.shell} stroke={C.ink} strokeWidth={5} />
    <line x1={-80} y1={0} x2={160} y2={0} stroke={C.shell2} strokeWidth={6} strokeLinecap="round" />
    <circle cx={120} cy={-30} r={14} fill={C.case3} stroke={C.ink} strokeWidth={3} />
    <path d="M140,26 L190,10 L190,22 Z" fill={K.flow} stroke={C.ink} strokeWidth={3} />
    {/* palas vistas desde arriba: una línea que «parpadea» de largo al girar */}
    {[0, 1, 2].map((k) => {
      const a = t * 2.2 + (k * 2 * Math.PI) / 3;
      const l = rotorL * Math.sin(a);
      return <path key={k} d={`M-150,0 L-150,${l}`} stroke={Math.cos(a) > 0 ? C.blade : C.blade2} strokeWidth={22} strokeLinecap="round" />;
    })}
    <path d="M-110,-48 Q-190,-40 -195,0 Q-190,40 -110,48 Z" fill={C.shell} stroke={C.ink} strokeWidth={5} />
  </g>
);

/** Tarta: fracción `frac` destacada en cian. */
export const Pie: React.FC<{ x: number; y: number; r: number; frac: number; o?: number; hi?: number }> = ({ x, y, r, frac, o = 1, hi = 1 }) => {
  const a0 = -Math.PI / 2, a1 = a0 + frac * 2 * Math.PI;
  const p = (aa: number, rr = r) => `${(x + rr * Math.cos(aa)).toFixed(1)},${(y + rr * Math.sin(aa)).toFixed(1)}`;
  const mid = (a0 + a1) / 2, off = 26 * hi;
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill={C.case1} stroke={C.ink} strokeWidth={6} />
            <g transform={`translate(${off * Math.cos(mid)},${off * Math.sin(mid)})`} style={glow(K.cold, 18 * hi)}>
        <path d={`M${x},${y} L${p(a0)} A${r},${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${p(a1)} Z`} fill={K.cold} stroke={C.ink} strokeWidth={6} />
      </g>
    </g>
  );
};
