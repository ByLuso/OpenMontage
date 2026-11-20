// Dibujos SVG planos del episodio «Cómo funciona el bolígrafo borrable» (n.º 146).
// Colores de código: naranja = calor, cian = frío, amarillo = lo importante (revelador), blanco = texto, rojo = peligro.
// La tinta del boli va en azul tinta (INK), distinto del cian del frío.
import React from "react";
import { K, FONT } from "./kit2d/Kit";

export const C = { shell: "#2B4A72", shell2: "#3E6AA0", light: "#9FB3CC", dark: "#132A4A", ink: "#06101F", paper: "#EEF2F8", rule: "#B9C8DC", rubber: "#E9A28F", metal: "#C9D6E6" };
export const INK = "#3E6BFF";
const W = 1080, H = 1920;
export const Svg: React.FC<{ children: React.ReactNode; o?: number }> = ({ children, o = 1 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>{children}</svg>
);
const cl = (x: number) => Math.max(0, Math.min(1, x));
export const mix = (a: string, b: string, k: number) => {
  const p = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = p(a), B = p(b), q = cl(k);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * q).toString(16).padStart(2, "0")).join("");
};

// ---------- el boli (dibujado en horizontal: punta a la izquierda, goma a la derecha) ----------
/** open: el cuerpo se parte a lo largo y la mitad de arriba se levanta, dejando ver el cartucho de tinta. */
export const Pen: React.FC<{ cx: number; cy: number; len?: number; angle?: number; open?: number; t: number; glow?: number }> = ({ cx, cy, len = 820, angle = -28, open = 0, t, glow = 0 }) => {
  const L = len, h = L * 0.12; // grosor
  const x0 = -L / 2, x1 = L / 2;
  const tip = L * 0.14, er = L * 0.11;
  const lift = open * h * 1.25;
  const caps = Array.from({ length: 14 }, (_, i) => i);
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
      <ellipse cx={0} cy={h * 1.3} rx={L * 0.5} ry={h * 0.22} fill="#000" opacity={0.3} />
      {/* goma (punta de fricción) */}
      <rect x={x1 - er} y={-h * 0.42} width={er + 6} height={h * 0.84} rx={h * 0.3} fill={C.rubber} stroke={C.ink} strokeWidth={4} />
      <rect x={x1 - er} y={-h * 0.42} width={er + 6} height={h * 0.84} rx={h * 0.3} fill={K.hot} opacity={0.6 * cl(glow) * (0.8 + 0.2 * Math.sin(t * 12))} />
      {/* punta metálica */}
      <path d={`M ${x0 + tip} ${-h * 0.38} L ${x0 + 10} ${-h * 0.06} L ${x0} 0 L ${x0 + 10} ${h * 0.06} L ${x0 + tip} ${h * 0.38} Z`} fill={C.metal} stroke={C.ink} strokeWidth={4} />
      <circle cx={x0 + 3} cy={0} r={5} fill={INK} />
      {/* mitad de abajo del cuerpo + cartucho por dentro */}
      <path d={`M ${x0 + tip} 0 L ${x1 - er} 0 L ${x1 - er} ${h / 2} Q ${x1 - er} ${h / 2} ${x1 - er - 10} ${h / 2} L ${x0 + tip} ${h / 2} Z`} fill={C.shell} stroke={C.ink} strokeWidth={4} />
      <g opacity={cl(open * 2)}>
        <rect x={x0 + tip - 8} y={-h * 0.14} width={L - tip - er - 30} height={h * 0.28} rx={h * 0.12} fill="#DDE6F2" stroke={C.ink} strokeWidth={3} />
        <rect x={x0 + tip - 8} y={-h * 0.11} width={(L - tip - er - 30) * 0.72} height={h * 0.22} rx={h * 0.1} fill={INK} />
        {caps.map((i) => {
          const u = ((i / caps.length + t * 0.08) % 1);
          const px = x0 + tip + u * (L - tip - er - 30) * 0.7;
          return <circle key={i} cx={px} cy={Math.sin(i * 2.1 + t * 2) * h * 0.05} r={h * 0.045} fill="#8FB0FF" opacity={0.9} />;
        })}
      </g>
      {/* mitad de arriba del cuerpo (se levanta) */}
      <g transform={`translate(0 ${-lift}) rotate(${-4 * open} ${x1 - er} 0)`}>
        <path d={`M ${x0 + tip} ${-h / 2} L ${x1 - er} ${-h / 2} L ${x1 - er} 0 L ${x0 + tip} 0 Z`} fill={C.shell2} stroke={C.ink} strokeWidth={4} />
        <rect x={x0 + tip} y={-h / 2} width={L * 0.2} height={h / 2} fill={C.dark} opacity={0.5} />
        {/* clip */}
        <rect x={x1 - er - L * 0.3} y={-h / 2 - h * 0.2} width={L * 0.27} height={h * 0.16} rx={h * 0.08} fill={C.light} stroke={C.ink} strokeWidth={3} />
        <rect x={x0 + tip + 20} y={-h * 0.4} width={L * 0.5} height={h * 0.08} rx={h * 0.04} fill="#FFFFFF" opacity={0.18} />
      </g>
    </g>
  );
};

// ---------- papel con escritura ----------
/** Garabato que imita letra corrida (bucles), de x a x+w. */
export const scribble = (x: number, y: number, w: number, seed = 0, amp = 18) => {
  let d = "";
  const n = Math.round(w / 2.2);
  for (let i = 0; i <= n; i++) {
    const u = i / n, X = x + u * w;
    const ph = u * w * 0.16 + seed;
    const wob = Math.sin(seed * 3.1 + u * 9) * 0.35;
    const Y = y - amp * (0.55 + wob * 0.4) * Math.abs(Math.sin(ph * 0.5)) + 5 * Math.cos(ph);
    const Xc = X + 7 * Math.cos(ph);
    // pequeños huecos entre «palabras»
    const gap = Math.sin(u * 14 + seed) > 0.93;
    d += `${i === 0 || gap ? "M" : "L"} ${Xc.toFixed(1)} ${Y.toFixed(1)} `;
  }
  return d;
};
/** Hoja de papel con renglones; `vis[i]` = 0..1 lo visible que está cada renglón escrito. `ghost` = contorno punteado de lo «borrado». */
export const Paper: React.FC<{ x: number; y: number; w: number; h: number; vis: number[]; ghost?: number; rot?: number; ink?: string; frost?: number; heat?: number; t: number }> =
  ({ x, y, w, h, vis, ghost = 0, rot = 0, ink = INK, frost = 0, heat = 0, t }) => {
    const n = vis.length, gap = (h - 120) / Math.max(1, n);
    return (
      <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
        <rect x={x + 10} y={y + 14} width={w} height={h} rx={14} fill="#000" opacity={0.3} />
        <rect x={x} y={y} width={w} height={h} rx={14} fill={C.paper} />
        <rect x={x} y={y} width={w} height={h} rx={14} fill={K.hot} opacity={0.22 * cl(heat) * (0.85 + 0.15 * Math.sin(t * 7))} />
        <line x1={x + 70} y1={y} x2={x + 70} y2={y + h} stroke="#F2A0A0" strokeWidth={3} />
        {vis.map((_, i) => <line key={`r${i}`} x1={x + 20} y1={y + 90 + i * gap} x2={x + w - 20} y2={y + 90 + i * gap} stroke={C.rule} strokeWidth={2.5} />)}
        {vis.map((v, i) => {
          const d = scribble(x + 95, y + 82 + i * gap, w - 150 - (i % 2) * 70, i * 1.7, Math.min(26, gap * 0.45));
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={cl(v)} />
              {ghost > 0.01 && <path d={d} fill="none" stroke="#7F93B4" strokeWidth={3} strokeDasharray="5 9" strokeLinecap="round" opacity={ghost * (1 - cl(v))} />}
            </g>
          );
        })}
        {frost > 0.01 && <rect x={x} y={y} width={w} height={h} rx={14} fill={K.cold} opacity={0.18 * frost} />}
      </g>
    );
  };

/** Bloque de goma (vista de lado) que roza de un lado a otro con ondas de calor. */
export const Rubber: React.FC<{ x: number; y: number; t: number; rub: number; o?: number }> = ({ x, y, t, rub, o = 1 }) => {
  const dx = rub * 70 * Math.sin(t * 14);
  return (
    <g opacity={o} transform={`translate(${x + dx} ${y}) rotate(-12)`}>
      <rect x={-34} y={-260} width={68} height={240} rx={14} fill={C.shell2} stroke={C.ink} strokeWidth={4} />
      <rect x={-30} y={-40} width={60} height={50} rx={16} fill={mix(C.rubber, K.hot, rub * 0.7)} stroke={C.ink} strokeWidth={4} />
      {rub > 0.05 && [0, 1, 2].map((k) => {
        const ph = (t * 1.6 + k / 3) % 1;
        return <path key={k} d={`M ${-50 + k * 50} ${20 - ph * 10} q 12 -20 0 -40 q -12 -20 0 -40`} transform={`translate(${-dx * 0.5} ${-ph * 50})`} fill="none" stroke={K.hot} strokeWidth={6} strokeLinecap="round" opacity={rub * (1 - ph)} />;
      })}
    </g>
  );
};

// ---------- la cápsula por dentro ----------
// colorante = rombo grande (azul cuando va pegado al revelador, contorno gris si no);
// revelador = triangulito amarillo; regulador = hexágono naranja-blanco (cera).
const hex = (x: number, y: number, r: number) => Array.from({ length: 6 }, (_, i) => `${(x + r * Math.cos(i * Math.PI / 3)).toFixed(1)},${(y + r * Math.sin(i * Math.PI / 3)).toFixed(1)}`).join(" ");
const PTS = [[-0.42, -0.3], [0.1, -0.5], [0.45, -0.15], [-0.15, 0.05], [0.3, 0.38], [-0.45, 0.32], [0.02, 0.5]];
const REG = [[-0.12, -0.24], [0.35, 0.1], [-0.3, 0.6], [0.6, -0.42], [-0.62, 0.0], [0.15, 0.25]];
/**
 * dye/dev/reg: cuánto se ve cada componente (0..1). sep: 0 = colorante y revelador pegados, 1 = el regulador se lleva al revelador.
 * color: 0..1 lo azul que está el colorante (por defecto 1 - sep).
 */
export const Capsule: React.FC<{ cx: number; cy: number; r: number; t: number; dye?: number; dev?: number; reg?: number; sep?: number; pair?: number; color?: number; heat?: number; cold?: number }> =
  ({ cx, cy, r, t, dye = 1, dev = 1, reg = 1, sep = 0, pair = 1, color, heat = 0, cold = 0 }) => {
    const col = color ?? cl(pair) * (1 - cl(sep));
    const s = r / 300;
    return (
      <g>
        <circle cx={cx} cy={cy} r={r + 26 * s} fill={K.hot} opacity={0.25 * cl(heat) * (0.8 + 0.2 * Math.sin(t * 6))} />
        <circle cx={cx} cy={cy} r={r + 26 * s} fill={K.cold} opacity={0.25 * cl(cold)} />
        <circle cx={cx} cy={cy} r={r} fill="#16365E" stroke={C.light} strokeWidth={8 * s} />
        <circle cx={cx} cy={cy} r={r} fill={INK} opacity={0.22 * col} />
        <path d={`M ${cx - r * 0.62} ${cy - r * 0.55} A ${r * 0.85} ${r * 0.85} 0 0 1 ${cx + r * 0.1} ${cy - r * 0.86}`} stroke="#FFFFFF" strokeWidth={10 * s} fill="none" opacity={0.25} strokeLinecap="round" />
        {/* regulador */}
        <g opacity={reg}>
          {REG.map(([a, b], i) => {
            const x = cx + a * r * 0.9 + 6 * s * Math.sin(t * 1.3 + i), y = cy + b * r * 0.75 + 6 * s * Math.cos(t * 1.1 + i * 2);
            const melt = cl(heat);
            return <polygon key={i} points={hex(x, y, 30 * s * (1 + 0.08 * melt * Math.sin(t * 8 + i)))} fill={mix("#F4E9D8", K.hot, melt * 0.6)} stroke={C.ink} strokeWidth={4 * s} />;
          })}
        </g>
        {PTS.map(([a, b], i) => {
          const jx = 7 * s * Math.sin(t * 1.7 + i * 1.3), jy = 7 * s * Math.cos(t * 1.4 + i);
          const x = cx + a * r + jx, y = cy + b * r * 0.9 + jy;
          // posición del revelador: pegado al colorante, o junto al hexágono más cercano
          const R0 = REG[i % REG.length];
          const rx = cx + R0[0] * r * 0.9 + 40 * s, ry = cy + R0[1] * r * 0.75 - 10 * s;
          const k = cl(sep);
          const p = cl(pair);
          const dvx0 = x + 36 * s + (1 - p) * 30 * s, dvy0 = y - 6 * s + (1 - p) * 24 * s * (i % 2 ? 1 : -1);
          const dvx = dvx0 + (rx - dvx0) * k, dvy = dvy0 + (ry - dvy0) * k;
          const dc = mix("#5E6E88", INK, col);
          return (
            <g key={i}>
              <g opacity={dye}>
                <polygon points={`${x},${y - 30 * s} ${x + 24 * s},${y} ${x},${y + 30 * s} ${x - 24 * s},${y}`} fill={col > 0.05 ? dc : "none"} fillOpacity={0.15 + 0.85 * col} stroke={col > 0.5 ? "#BFD0FF" : "#8FA3C2"} strokeWidth={4 * s} strokeDasharray={col < 0.3 ? `${8 * s} ${6 * s}` : undefined} />
                {col > 0.3 && <circle cx={x} cy={y} r={40 * s} fill={INK} opacity={0.3 * col} />}
              </g>
              <g opacity={dev}>
                <polygon points={`${dvx - 13 * s},${dvy + 11 * s} ${dvx + 13 * s},${dvy + 11 * s} ${dvx},${dvy - 13 * s}`} fill={K.flow} stroke={C.ink} strokeWidth={3 * s} />
              </g>
            </g>
          );
        })}
      </g>
    );
  };

// ---------- termómetro ----------
export const Thermo: React.FC<{ x: number; y: number; h?: number; val: number; min?: number; max?: number; o?: number }> = ({ x, y, h = 420, val, min = -20, max = 80, o = 1 }) => {
  const f = cl((val - min) / (max - min));
  const col = val < 0 ? K.cold : val > 50 ? K.hot : K.flow;
  const z = cl((0 - min) / (max - min));
  return (
    <g opacity={o}>
      <rect x={x - 30} y={y - h} width={60} height={h} rx={30} fill={C.dark} stroke={C.light} strokeWidth={5} />
      <circle cx={x} cy={y + 30} r={50} fill={C.dark} stroke={C.light} strokeWidth={5} />
      <rect x={x - 16} y={y - h * f} width={32} height={h * f + 20} rx={16} fill={col} />
      <circle cx={x} cy={y + 30} r={36} fill={col} />
      <line x1={x + 34} y1={y - h * z} x2={x + 56} y2={y - h * z} stroke={C.light} strokeWidth={4} />
      <text x={x} y={y + 128} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={col} style={{ filter: `drop-shadow(0 0 8px ${col})` }}>{`${Math.round(val)} °C`}</text>
    </g>
  );
};

// ---------- lupa con un pelo y cápsulas diminutas ----------
export const Magnifier: React.FC<{ cx: number; cy: number; r: number; t: number; caps: number; hair: number; warm: number }> = ({ cx, cy, r, t, caps, hair, warm }) => {
  const id = "lupa146";
  const dots: [number, number][] = [];
  for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) dots.push([cx + i * 48 + (j % 2) * 24, cy + j * 42]);
  return (
    <g>
      <defs><clipPath id={id}><circle cx={cx} cy={cy} r={r} /></clipPath></defs>
      <line x1={cx + r * 0.72} y1={cy + r * 0.72} x2={cx + r * 1.05} y2={cy + r * 1.05} stroke={C.light} strokeWidth={46} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={r} fill={C.paper} />
      <g clipPath={`url(#${id})`}>
        <g opacity={caps}>
          {dots.map(([x, y], k) => {
            const c = cl(1 - warm * (0.5 + 0.5 * Math.sin(t * 2.2 + k * 0.4)));
            return <circle key={k} cx={x + 3 * Math.sin(t * 2 + k)} cy={y + 3 * Math.cos(t * 1.7 + k)} r={13} fill={mix("#C9D3E6", INK, c)} stroke="#8FA3C2" strokeWidth={2} />;
          })}
        </g>
        {/* el pelo: una banda gruesa que cruza la lupa */}
        <g opacity={hair}>
          <path d={`M ${cx - r * 1.2} ${cy - r * 0.95} C ${cx - r * 0.4} ${cy - r * 0.2}, ${cx + r * 0.3} ${cy + r * 0.2}, ${cx + r * 1.2} ${cy + r * 0.95}`} stroke="#6B4A2E" strokeWidth={120} fill="none" opacity={0.92} />
          <path d={`M ${cx - r * 1.2} ${cy - r * 0.95} C ${cx - r * 0.4} ${cy - r * 0.2}, ${cx + r * 0.3} ${cy + r * 0.2}, ${cx + r * 1.2} ${cy + r * 0.95}`} stroke="#8C6440" strokeWidth={30} fill="none" opacity={0.8} transform="translate(-22 18)" />
        </g>
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.light} strokeWidth={22} />
      <circle cx={cx} cy={cy} r={r - 11} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} />
    </g>
  );
};

// ---------- congelador con la hoja dentro ----------
export const Freezer: React.FC<{ x: number; y: number; w: number; h: number; t: number; door: number; children?: React.ReactNode }> = ({ x, y, w, h, t, door, children }) => {
  const dw = w * (1 - 0.85 * cl(door));
  return (
    <g>
      <rect x={x + 12} y={y + 16} width={w} height={h} rx={26} fill="#000" opacity={0.3} />
      <rect x={x} y={y} width={w} height={h} rx={26} fill="#D7E2F0" stroke={C.light} strokeWidth={6} />
      <rect x={x + 26} y={y + 26} width={w - 52} height={h - 52} rx={14} fill="#0E2A48" />
      {children}
      {/* escarcha y copos */}
      {Array.from({ length: 9 }, (_, k) => {
        const u = ((k * 0.13 + t * 0.12) % 1);
        const fx = x + 60 + ((k * 97) % (w - 120)), fy = y + 50 + u * (h - 100);
        return <g key={k} opacity={0.7 * (1 - Math.abs(u - 0.5) * 1.6)} stroke={K.cold} strokeWidth={4} strokeLinecap="round">
          {[0, 60, 120].map((a) => <line key={a} x1={fx - 14 * Math.cos(a * Math.PI / 180)} y1={fy - 14 * Math.sin(a * Math.PI / 180)} x2={fx + 14 * Math.cos(a * Math.PI / 180)} y2={fy + 14 * Math.sin(a * Math.PI / 180)} />)}
        </g>;
      })}
      {/* puerta que se abre hacia la izquierda */}
      <g>
        <rect x={x} y={y} width={dw} height={h} rx={26} fill="#E9F0F8" stroke={C.light} strokeWidth={6} opacity={0.97} />
        {dw > 60 && <rect x={x + dw - 50} y={y + h * 0.35} width={18} height={h * 0.3} rx={9} fill={C.light} />}
        {dw > 200 && <text x={x + dw / 2} y={y + h / 2 + 16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={K.cold}>−18 °C</text>}
      </g>
    </g>
  );
};

// ---------- secador de pelo soplando aire caliente ----------
export const Dryer: React.FC<{ x: number; y: number; t: number; on: number; o?: number }> = ({ x, y, t, on, o = 1 }) => (
  <g opacity={o}>
    {/* aire caliente hacia la izquierda */}
    {on > 0.02 && Array.from({ length: 5 }, (_, k) => {
      const ph = (t * 1.4 + k / 5) % 1;
      const yy = y - 50 + k * 25;
      return <path key={k} d={`M ${x - 120 - ph * 260} ${yy} q -30 -14 -60 0 q -30 14 -60 0`} fill="none" stroke={K.hot} strokeWidth={7} strokeLinecap="round" opacity={on * (1 - ph)} />;
    })}
    <rect x={x + 60} y={y + 20} width={70} height={190} rx={22} fill={C.shell} stroke={C.ink} strokeWidth={5} transform={`rotate(12 ${x + 95} ${y + 20})`} />
    <path d={`M ${x - 120} ${y - 60} L ${x + 40} ${y - 80} L ${x + 40} ${y + 80} L ${x - 120} ${y + 60} Z`} fill={C.shell2} stroke={C.ink} strokeWidth={5} />
    <circle cx={x + 80} cy={y} r={100} fill={C.shell2} stroke={C.ink} strokeWidth={5} />
    <circle cx={x + 80} cy={y} r={60} fill={C.dark} />
    {[0, 1, 2, 3].map((k) => <line key={k} x1={x + 80} y1={y} x2={x + 80 + 52 * Math.cos(t * 20 + k * Math.PI / 2)} y2={y + 52 * Math.sin(t * 20 + k * Math.PI / 2)} stroke={C.light} strokeWidth={8} strokeLinecap="round" />)}
    <rect x={x - 130} y={y - 62} width={22} height={124} rx={6} fill={mix(C.dark, K.hot, on)} />
  </g>
);

// ---------- cheque esquemático (sin banco ni marca) ----------
export const Cheque: React.FC<{ x: number; y: number; w: number; h: number; vis: number; t: number; heat?: number }> = ({ x, y, w, h, vis, t, heat = 0 }) => (
  <g>
    <rect x={x + 10} y={y + 14} width={w} height={h} rx={16} fill="#000" opacity={0.3} />
    <rect x={x} y={y} width={w} height={h} rx={16} fill="#E4EEDF" />
    <rect x={x} y={y} width={w} height={h} rx={16} fill={K.hot} opacity={0.2 * cl(heat) * (0.85 + 0.15 * Math.sin(t * 7))} />
    <rect x={x + 18} y={y + 18} width={w - 36} height={h - 36} rx={10} fill="none" stroke="#9DB89A" strokeWidth={3} />
    {[0.38, 0.62].map((f, i) => <line key={i} x1={x + 40} y1={y + h * f} x2={x + w - 270} y2={y + h * f} stroke="#9DB89A" strokeWidth={3} />)}
    <rect x={x + w - 240} y={y + h * 0.22} width={190} height={74} rx={8} fill="none" stroke="#9DB89A" strokeWidth={3} />
    <line x1={x + w - 330} y1={y + h * 0.85} x2={x + w - 50} y2={y + h * 0.85} stroke="#9DB89A" strokeWidth={3} />
    <g opacity={cl(vis)}>
      <path d={scribble(x + 50, y + h * 0.36, w - 340, 2.3, 20)} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <path d={scribble(x + 50, y + h * 0.6, w - 420, 5.1, 20)} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <text x={x + w - 145} y={y + h * 0.22 + 54} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={INK}>500 €</text>
    </g>
    {/* la firma (también es de tinta borrable) */}
    <path d={scribble(x + w - 320, y + h * 0.82, 250, 7.7, 26)} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={cl(vis)} />
  </g>
);

// ---------- coche al sol (de lado) con la libreta en el salpicadero ----------
export const Car: React.FC<{ x: number; y: number; t: number; sun: number; heat: number; notes: number }> = ({ x, y, t, sun, heat, notes }) => (
  <g>
    {/* sol */}
    <g opacity={sun} transform={`translate(${x + 330} ${y - 300})`}>
      {Array.from({ length: 12 }, (_, k) => {
        const a = k * Math.PI / 6 + t * 0.3;
        return <line key={k} x1={95 * Math.cos(a)} y1={95 * Math.sin(a)} x2={135 * Math.cos(a)} y2={135 * Math.sin(a)} stroke={K.flow} strokeWidth={10} strokeLinecap="round" />;
      })}
      <circle r={75} fill={K.flow} />
    </g>
    <ellipse cx={x} cy={y + 190} rx={420} ry={22} fill="#000" opacity={0.35} />
    {/* carrocería */}
    <path d={`M ${x - 400} ${y + 150} L ${x - 400} ${y + 40} Q ${x - 395} ${y - 10} ${x - 330} ${y - 20} L ${x - 190} ${y - 30} L ${x - 90} ${y - 150} Q ${x - 70} ${y - 170} ${x - 30} ${y - 170} L ${x + 170} ${y - 170} Q ${x + 210} ${y - 170} ${x + 240} ${y - 130} L ${x + 310} ${y - 30} L ${x + 370} ${y - 20} Q ${x + 405} ${y - 10} ${x + 405} ${y + 40} L ${x + 405} ${y + 150} Z`}
      fill={C.shell2} stroke={C.ink} strokeWidth={6} />
    {/* ventanas: el interior se calienta */}
    <path d={`M ${x - 160} ${y - 40} L ${x - 75} ${y - 140} L ${x + 50} ${y - 140} L ${x + 50} ${y - 40} Z`} fill={mix("#1C3557", K.hot, heat * 0.55)} stroke={C.ink} strokeWidth={5} />
    <path d={`M ${x + 70} ${y - 40} L ${x + 70} ${y - 140} L ${x + 165} ${y - 140} Q ${x + 195} ${y - 140} ${x + 215} ${y - 110} L ${x + 265} ${y - 40} Z`} fill={mix("#1C3557", K.hot, heat * 0.55)} stroke={C.ink} strokeWidth={5} />
    {/* libreta en el salpicadero, junto al parabrisas */}
    <g transform={`rotate(-8 ${x - 115} ${y - 60})`}>
      <rect x={x - 150} y={y - 82} width={80} height={44} rx={5} fill={C.paper} />
      {[0, 1].map((k) => <path key={k} d={scribble(x - 140, y - 60 + k * 16, 56, k * 2.2, 6)} fill="none" stroke={INK} strokeWidth={3} opacity={notes} />)}
    </g>
    {/* ondas de calor sobre el techo */}
    {heat > 0.02 && [0, 1, 2].map((k) => {
      const ph = (t * 0.9 + k / 3) % 1;
      return <path key={k} d={`M ${x - 90 + k * 110} ${y - 190 - ph * 70} q 14 -22 0 -44 q -14 -22 0 -44`} fill="none" stroke={K.hot} strokeWidth={7} strokeLinecap="round" opacity={heat * (1 - ph)} />;
    })}
    <line x1={x - 10} y1={y - 30} x2={x - 10} y2={y + 140} stroke={C.ink} strokeWidth={4} opacity={0.6} />
    <rect x={x - 60} y={y + 10} width={40} height={10} rx={5} fill={C.light} />
    <rect x={x + 120} y={y + 10} width={40} height={10} rx={5} fill={C.light} />
    {/* ruedas */}
    {[x - 240, x + 250].map((wx, k) => (
      <g key={k}>
        <circle cx={wx} cy={y + 150} r={78} fill="#0B1424" stroke={C.ink} strokeWidth={5} />
        <circle cx={wx} cy={y + 150} r={38} fill={C.light} />
        <circle cx={wx} cy={y + 150} r={12} fill={C.dark} />
      </g>
    ))}
  </g>
);
