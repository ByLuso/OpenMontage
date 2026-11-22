// Dibujos SVG del episodio «Cómo funciona la raqueta eléctrica matamosquitos». Coordenadas absolutas de 1080×1920.
// Colores de código: amarillo = tensión/corriente (lo importante), cian = la otra capa / el aire, naranja = calor,
// rojo = peligro. Grises azulados para carcasas. Sin marcas: raqueta genérica. Capas como «un polo / el otro» (sin + ni −).
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#040A14", wire: "#7F93AD", cell: "#5E7FA8", cellTop: "#C9D6E6", skin: "#C98E74", green: "#5BE37D" };

export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Rayo dentado entre dos puntos (seed cambia con el tiempo para que chisporrotee). */
export const Bolt: React.FC<{ x1: number; y1: number; x2: number; y2: number; t: number; o?: number; color?: string; w?: number; n?: number; jag?: number }> =
  ({ x1, y1, x2, y2, t, o = 1, color = K.flow, w = 8, n = 7, jag = 22 }) => {
    if (o <= 0.01) return null;
    const seed = Math.floor(t * 18);
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const pts = Array.from({ length: n + 1 }).map((_, k) => {
      const f = k / n, j = k === 0 || k === n ? 0 : (rnd(seed * 13 + k) - 0.5) * 2 * jag;
      return `${x1 + dx * f + nx * j},${y1 + dy * f + ny * j}`;
    }).join(" ");
    return (
      <g opacity={o}>
        <polyline points={pts} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth={w * 3} strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={pts} fill="none" stroke="#FFF7CC" strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
      </g>
    );
  };

/** Pila AA vertical, centro (x, y), 110×300·s. glow resalta en amarillo. */
export const Cell: React.FC<{ x: number; y: number; s?: number; glow?: number }> = ({ x, y, s = 1, glow = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-24} y={-168} width={48} height={26} rx={8} fill={C.cellTop} />
    <rect x={-55} y={-150} width={110} height={300} rx={22} fill={C.cell} stroke={glow > 0.01 ? K.flow : C.case3} strokeWidth={6 + 4 * glow}
      style={glow > 0.01 ? { filter: `drop-shadow(0 0 ${16 * glow}px ${K.flow})` } : undefined} />
    <rect x={-55} y={-150} width={110} height={70} rx={22} fill={C.cellTop} opacity={0.9} />
    <rect x={-40} y={-60} width={14} height={180} rx={7} fill="#FFFFFF" opacity={0.18} />
  </g>
);

/** Cabeza de la raqueta: marco ovalado + malla. grid: rejilla con tensión (0-1). */
export const Head: React.FC<{ x: number; y: number; rx: number; ry: number; t: number; grid?: number; spark?: number }> = ({ x, y, rx, ry, t, grid = 0, spark = 0 }) => {
  const id = `hc${Math.round(x)}_${Math.round(y)}_${Math.round(rx)}`;
  const step = 34;
  const vs = Array.from({ length: Math.ceil((2 * rx) / step) }).map((_, k) => x - rx + step / 2 + k * step);
  const hs = Array.from({ length: Math.ceil((2 * ry) / step) }).map((_, k) => y - ry + step / 2 + k * step);
  const g = clamp01(grid);
  const flick = 0.75 + 0.25 * Math.sin(t * 23);
  return (
    <g>
      <defs><clipPath id={id}><ellipse cx={x} cy={y} rx={rx - 4} ry={ry - 4} /></clipPath></defs>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={C.dark} opacity={0.65} />
      <g clipPath={`url(#${id})`}>
        {vs.map((vx, k) => <line key={`v${k}`} x1={vx} x2={vx} y1={y - ry} y2={y + ry} stroke={C.wire} strokeWidth={4} />)}
        {hs.map((hy, k) => <line key={`h${k}`} x1={x - rx} x2={x + rx} y1={hy} y2={hy} stroke={C.wire} strokeWidth={4} />)}
        {g > 0.01 && (
          <g opacity={g * flick} style={{ filter: `drop-shadow(0 0 8px ${K.flow})` }}>
            {vs.map((vx, k) => k % 2 === 0 ? <line key={`gv${k}`} x1={vx} x2={vx} y1={y - ry} y2={y + ry} stroke={K.flow} strokeWidth={5} /> : null)}
          </g>
        )}
      </g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="none" stroke={C.case2} strokeWidth={30} />
      <ellipse cx={x} cy={y} rx={rx + 12} ry={ry + 12} fill="none" stroke={C.case1} strokeWidth={6} />
      {spark > 0.01 && [0, 1, 2].map((k) => {
        const a = rnd(Math.floor(t * 6) * 7 + k) * Math.PI * 2, r = 0.55 * rnd(Math.floor(t * 6) * 3 + k + 9);
        const px = x + rx * r * Math.cos(a), py = y + ry * r * Math.sin(a);
        return <Bolt key={k} x1={px - 26} y1={py - 26} x2={px + 26} y2={py + 26} t={t + k} o={spark * (0.5 + 0.5 * Math.sin(t * 30 + k * 2))} w={5} n={4} jag={12} />;
      })}
    </g>
  );
};

/**
 * Raqueta completa vista de frente. Cabeza centrada en (x, y) con radios 300·s × 310·s; el mango va debajo.
 * open: la tapa del mango se desliza y enseña las dos pilas (0-1). grid: rejilla con tensión. led: lucecita. press: botón pulsado.
 */
export const Racket: React.FC<{ x: number; y: number; s?: number; t: number; open?: number; grid?: number; led?: number; press?: number; spark?: number; cells?: number }> =
  ({ x, y, s = 1, t, open = 0, grid = 0, led = 0, press = 0, spark = 0, cells = 0 }) => {
    const rx = 300 * s, ry = 310 * s;
    const ny = y + ry + 6 * s; // arranque del cuello
    const hx = x - 58 * s, hy = ny + 70 * s, hw = 116 * s, hh = 300 * s;
    return (
      <g>
        {/* cuello */}
        <path d={`M${x - 40 * s},${ny - 14 * s} L${x - 58 * s},${hy + 6 * s} L${x + 58 * s},${hy + 6 * s} L${x + 40 * s},${ny - 14 * s} Z`} fill={C.case2} />
        {/* mango */}
        <rect x={hx} y={hy} width={hw} height={hh} rx={30 * s} fill={C.case1} stroke={C.case2} strokeWidth={6 * s} />
        {/* pilas dentro */}
        <g opacity={clamp01(open * 1.4)}>
          <rect x={hx + 12 * s} y={hy + 90 * s} width={hw - 24 * s} height={hh - 104 * s} rx={16 * s} fill={C.dark} />
          <Cell x={x} y={hy + 142 * s} s={0.32 * s} glow={cells} />
          <Cell x={x} y={hy + 248 * s} s={0.32 * s} glow={cells} />
        </g>
        {/* tapa que se desliza */}
        <g transform={`translate(${open * 170 * s},${open * 40 * s}) rotate(${open * 18},${x},${hy + 190 * s})`} opacity={1 - 0.15 * open}>
          <rect x={hx + 10 * s} y={hy + 88 * s} width={hw - 20 * s} height={hh - 100 * s} rx={18 * s} fill={C.case2} stroke={C.case3} strokeWidth={4 * s} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={x - 30 * s} x2={x + 30 * s} y1={hy + (150 + 30 * k) * s} y2={hy + (150 + 30 * k) * s} stroke={C.case1} strokeWidth={6 * s} strokeLinecap="round" />)}
        </g>
        {/* botón */}
        <rect x={x - 26 * s} y={hy + 22 * s + 4 * press * s} width={52 * s} height={30 * s} rx={10 * s} fill={press > 0.5 ? K.flow : C.case3} />
        {/* LED */}
        <circle cx={x} cy={hy + 72 * s} r={11 * s} fill={led > 0.05 ? C.green : "#24384F"} opacity={0.4 + 0.6 * Math.max(led, 0.0)}
          style={led > 0.05 ? { filter: `drop-shadow(0 0 ${14 * led}px ${C.green})` } : undefined} />
        <Head x={x} y={y} rx={rx} ry={ry} t={t} grid={grid} spark={spark} />
      </g>
    );
  };

/** Onda: continua (línea plana) o alterna (seno que corre). */
export const Wave: React.FC<{ x: number; y: number; w: number; amp: number; t: number; ac?: number; color?: string; o?: number; cycles?: number; sw?: number }> =
  ({ x, y, w, amp, t, ac = 1, color = K.flow, o = 1, cycles = 3, sw = 7 }) => {
    const pts = Array.from({ length: 61 }).map((_, k) => {
      const f = k / 60;
      return `${x + w * f},${y - amp * ac * Math.sin(2 * Math.PI * (cycles * f - t * 1.2))}`;
    }).join(" ");
    return <polyline points={pts} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" opacity={o} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />;
  };

/** Transformador: núcleo + dos bobinas (la de la derecha con muchas más vueltas). */
export const Transformer: React.FC<{ x: number; y: number; s?: number; t: number; on?: number }> = ({ x, y, s = 1, t, on = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-150} y={-150} width={300} height={300} rx={18} fill="none" stroke={C.case3} strokeWidth={46} />
    {/* bobina primaria: pocas vueltas */}
    {Array.from({ length: 4 }).map((_, k) => (
      <rect key={`p${k}`} x={-186} y={-80 + k * 44} width={72} height={26} rx={10} fill={K.hot} opacity={0.55 + 0.45 * on * (0.5 + 0.5 * Math.sin(t * 9 - k))} />
    ))}
    {/* bobina secundaria: muchas vueltas */}
    {Array.from({ length: 12 }).map((_, k) => (
      <rect key={`s${k}`} x={114} y={-118 + k * 20} width={72} height={13} rx={5} fill={K.flow} opacity={0.4 + 0.6 * on * (0.5 + 0.5 * Math.sin(t * 9 - k * 0.6))} />
    ))}
  </g>
);

/** Diodo (triángulo + barra) apuntando en el ángulo dado. */
const Diode: React.FC<{ x1: number; y1: number; x2: number; y2: number; on: number }> = ({ x1, y1, x2, y2, on }) => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, a = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const col = on > 0.5 ? K.flow : C.case3;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={6} />
      <g transform={`translate(${mx},${my}) rotate(${a})`}>
        <path d="M-20,-22 L20,0 L-20,22 Z" fill={col} />
        <rect x={20} y={-24} width={8} height={48} fill={col} />
      </g>
    </g>
  );
};

/** Condensador pequeño (dos placas) en vertical en (x, y). */
const Cap: React.FC<{ x: number; y: number; on: number }> = ({ x, y, on }) => {
  const col = on > 0.5 ? K.flow : C.case3;
  return (
    <g style={on > 0.5 ? { filter: `drop-shadow(0 0 8px ${K.flow})` } : undefined}>
      <line x1={x} y1={y - 44} x2={x} y2={y - 10} stroke={col} strokeWidth={6} />
      <line x1={x} y1={y + 10} x2={x} y2={y + 44} stroke={col} strokeWidth={6} />
      <rect x={x - 32} y={y - 14} width={64} height={9} rx={3} fill={col} />
      <rect x={x - 32} y={y + 5} width={64} height={9} rx={3} fill={col} />
    </g>
  );
};

/**
 * Escalera multiplicadora (estilo Cockcroft–Walton): fila de condensadores arriba y abajo, diodos en zigzag entre medias.
 * p: avance de la carga (0-1), se encienden los peldaños de izquierda a derecha. Ancho total ≈ 4·dx.
 */
export const Ladder: React.FC<{ x: number; y: number; t: number; p?: number; n?: number; dx?: number; h?: number }> = ({ x, y, t, p = 0, n = 4, dx = 190, h = 300 }) => {
  const top = y - h / 2, bot = y + h / 2;
  const nodesTop = Array.from({ length: n }).map((_, k) => x + dx * (k + 0.5));
  const nodesBot = Array.from({ length: n + 1 }).map((_, k) => x + dx * k);
  const lit = (k: number) => (p * (2 * n) > k ? 1 : 0);
  return (
    <g>
      {/* raíles */}
      <line x1={x} y1={top} x2={x + dx * n} y2={top} stroke={C.case1} strokeWidth={4} strokeDasharray="6 10" />
      <line x1={x} y1={bot} x2={x + dx * n} y2={bot} stroke={C.case1} strokeWidth={4} strokeDasharray="6 10" />
      {/* diodos en zigzag */}
      {Array.from({ length: 2 * n }).map((_, k) => {
        const j = Math.floor(k / 2);
        const [x1, y1, x2, y2] = k % 2 === 0 ? [nodesBot[j], bot, nodesTop[j], top] : [nodesTop[j], top, nodesBot[j + 1], bot];
        return <Diode key={k} x1={x1} y1={y1} x2={x2} y2={y2} on={lit(k)} />;
      })}
      {/* condensadores: verticales en los nodos, colgando de cada raíl */}
      {nodesTop.map((nx, k) => <Cap key={`ct${k}`} x={nx} y={top - 70} on={lit(2 * k)} />)}
      {nodesBot.slice(1).map((nx, k) => <Cap key={`cb${k}`} x={nx} y={bot + 70} on={lit(2 * k + 1)} />)}
      {nodesTop.map((nx, k) => <circle key={`nt${k}`} cx={nx} cy={top} r={10} fill={lit(2 * k) ? K.flow : C.case3} />)}
      {nodesBot.map((nx, k) => <circle key={`nb${k}`} cx={nx} cy={bot} r={10} fill={k === 0 || lit(2 * k - 1) ? K.flow : C.case3} />)}
      {/* carga que viaja */}
      {p > 0.02 && p < 0.99 && (() => {
        const k = Math.min(2 * n - 1, Math.floor(p * 2 * n)), j = Math.floor(k / 2), f = (p * 2 * n) % 1;
        const [x1, y1, x2, y2] = k % 2 === 0 ? [nodesBot[j], bot, nodesTop[j], top] : [nodesTop[j], top, nodesBot[j + 1], bot];
        return <circle cx={x1 + (x2 - x1) * f} cy={y1 + (y2 - y1) * f} r={14 + 3 * Math.sin(t * 12)} fill="#FFF7CC" style={{ filter: `drop-shadow(0 0 12px ${K.flow})` }} />;
      })()}
    </g>
  );
};

/** Condensador grande (cilindro) que se llena de carga amarilla. */
export const BigCap: React.FC<{ x: number; y: number; s?: number; fill?: number; t: number; o?: number }> = ({ x, y, s = 1, fill = 0, t, o = 1 }) => {
  const H = 240, W = 140, f = clamp01(fill);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={24} fill={C.case1} stroke={C.case3} strokeWidth={6} />
      <rect x={-W / 2 + 14} y={H / 2 - 14 - (H - 28) * f} width={W - 28} height={(H - 28) * f} rx={14} fill={K.flow} opacity={0.85 + 0.15 * Math.sin(t * 6)}
        style={{ filter: `drop-shadow(0 0 12px ${K.flow})` }} />
      <ellipse cx={0} cy={-H / 2} rx={W / 2} ry={16} fill={C.case2} stroke={C.case3} strokeWidth={6} />
      <line x1={-30} y1={-H / 2 - 16} x2={-30} y2={-H / 2 - 60} stroke={C.case3} strokeWidth={8} />
      <line x1={30} y1={-H / 2 - 16} x2={30} y2={-H / 2 - 60} stroke={C.case3} strokeWidth={8} />
    </g>
  );
};

/** Caja de circuito con etiqueta dentro (texto SVG). */
export const Box: React.FC<{ x: number; y: number; w: number; h: number; text?: string; color?: string; o?: number; hi?: number }> = ({ x, y, w, h, text, color = C.case3, o = 1, hi = 0 }) => (
  <g opacity={o}>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={20} fill={C.case1} stroke={hi > 0.5 ? K.flow : color} strokeWidth={6}
      style={hi > 0.5 ? { filter: `drop-shadow(0 0 10px ${K.flow})` } : undefined} />
    {text && <text x={x} y={y + 12} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={34} fill={K.white}>{text}</text>}
  </g>
);

/** Mosquito estilizado (de perfil), centro (x, y). zap: chispazo encima. */
export const Mosquito: React.FC<{ x: number; y: number; s?: number; t: number; rot?: number; o?: number; zap?: number; flip?: boolean }> =
  ({ x, y, s = 1, t, rot = 0, o = 1, zap = 0, flip = false }) => {
    const flap = Math.sin(t * 60) * 0.5 + 0.5;
    const body = zap > 0.5 ? "#1C2430" : "#3B4656";
    return (
      <g transform={`translate(${x},${y}) rotate(${rot}) scale(${flip ? -s : s},${s})`} opacity={o}>
        {/* alas */}
        <ellipse cx={-6} cy={-34} rx={46} ry={14 + 8 * flap} transform="rotate(-24)" fill="#DCEBFA" opacity={0.55} stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={2} />
        <ellipse cx={4} cy={-30} rx={40} ry={10 + 6 * (1 - flap)} transform="rotate(-8)" fill="#DCEBFA" opacity={0.4} />
        {/* patas */}
        {[-22, -6, 10].map((px, k) => (
          <path key={k} d={`M${px},6 q${-10 - k * 6},26 ${-24 - k * 10},58`} fill="none" stroke={body} strokeWidth={4} strokeLinecap="round" />
        ))}
        {/* abdomen, tórax, cabeza, pico */}
        <ellipse cx={-52} cy={6} rx={50} ry={13} transform="rotate(10)" fill={body} />
        {[-80, -64, -48, -32].map((bx, k) => <line key={k} x1={bx} y1={-2 + k * 2} x2={bx} y2={18 + k * 2} stroke="#5A6779" strokeWidth={3} />)}
        <ellipse cx={8} cy={0} rx={22} ry={18} fill={body} />
        <circle cx={34} cy={4} r={11} fill={body} />
        <circle cx={38} cy={1} r={4} fill="#C7D3E0" />
        <line x1={42} y1={10} x2={82} y2={30} stroke={body} strokeWidth={4} strokeLinecap="round" />
      </g>
    );
  };

/**
 * Capas de la rejilla en despiece (vistas en perspectiva): arriba y abajo las de fuera (cian, «el otro polo»),
 * en medio la central (amarilla, «un polo»). sep: separación del despiece (0 = juntas, 1 = separadas). hi: "mid" | "out".
 */
export const Layers: React.FC<{ x: number; y: number; t: number; sep?: number; hi?: string; o?: number }> = ({ x, y, t, sep = 1, hi = "", o = 1 }) => {
  const gap = 40 + 170 * sep;
  const W = 640, D = 150, sk = 120;
  const layer = (cy: number, col: string, glow: boolean, k: number) => {
    const p = `M${x - W / 2 + sk},${cy - D / 2} L${x + W / 2 + sk},${cy - D / 2} L${x + W / 2 - sk},${cy + D / 2} L${x - W / 2 - sk},${cy + D / 2} Z`;
    const lines = Array.from({ length: 11 }).map((_, j) => {
      const f = (j + 0.5) / 11;
      return <line key={j} x1={x - W / 2 + sk + W * f} y1={cy - D / 2} x2={x - W / 2 - sk + W * f} y2={cy + D / 2} stroke={col} strokeWidth={5} opacity={0.9} />;
    });
    const rows = Array.from({ length: 3 }).map((_, j) => {
      const f = (j + 1) / 4, yy = cy - D / 2 + D * f, xs = x - W / 2 + sk - 2 * sk * f;
      return <line key={`r${j}`} x1={xs} y1={yy} x2={xs + W} y2={yy} stroke={col} strokeWidth={4} opacity={0.7} />;
    });
    return (
      <g key={k} style={glow ? { filter: `drop-shadow(0 0 ${10 + 4 * Math.sin(t * 8)}px ${col})` } : undefined}>
        <path d={p} fill="rgba(6,16,31,0.55)" stroke={col} strokeWidth={glow ? 8 : 5} />
        {lines}{rows}
      </g>
    );
  };
  return (
    <g opacity={o}>
      {layer(y - gap, K.cold, hi === "out", 0)}
      {layer(y, K.flow, hi === "mid", 1)}
      {layer(y + gap, K.cold, hi === "out", 2)}
    </g>
  );
};

/** Corte de la rejilla: tres filas de alambres vistos de canto (círculos). Fila central amarilla, las de fuera cian. */
export const Section: React.FC<{ x: number; y: number; t: number; gap?: number; o?: number; glowMid?: number }> = ({ x, y, t, gap = 150, o = 1, glowMid = 0 }) => {
  const xs = Array.from({ length: 7 }).map((_, k) => x - 390 + k * 130);
  const xsMid = Array.from({ length: 8 }).map((_, k) => x - 455 + k * 130);
  return (
    <g opacity={o}>
      {[y - gap, y + gap].map((yy, r) => xs.map((xx, k) => <circle key={`${r}_${k}`} cx={xx} cy={yy} r={20} fill={K.cold} stroke="#0E2240" strokeWidth={4} />))}
      {xsMid.map((xx, k) => (
        <circle key={`m${k}`} cx={xx} cy={y} r={20} fill={K.flow} stroke="#0E2240" strokeWidth={4}
          style={glowMid > 0.01 ? { filter: `drop-shadow(0 0 ${12 * glowMid + 3 * Math.sin(t * 9)}px ${K.flow})` } : undefined} />
      ))}
    </g>
  );
};

/** Dedo índice (mano esquemática) apuntando hacia abajo, punta en (x, y). */
export const Finger: React.FC<{ x: number; y: number; s?: number; o?: number; rot?: number }> = ({ x, y, s = 1, o = 1, rot = 0 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <rect x={-34} y={0} width={68} height={210} rx={34} fill={C.skin} />
    <rect x={-22} y={10} width={44} height={40} rx={14} fill="#E7B7A3" opacity={0.7} />
    <rect x={-90} y={170} width={180} height={190} rx={60} fill={C.skin} />
    <rect x={-80} y={340} width={160} height={120} rx={20} fill="#3E6AA0" />
  </g>
);

/** Señal de prohibido (círculo rojo con barra). */
export const NoSign: React.FC<{ x: number; y: number; r: number; o?: number }> = ({ x, y, r, o = 1 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill="none" stroke={K.warn} strokeWidth={r * 0.16} />
    <line x1={x - r * 0.7} y1={y - r * 0.7} x2={x + r * 0.7} y2={y + r * 0.7} stroke={K.warn} strokeWidth={r * 0.16} strokeLinecap="round" />
  </g>
);

/** Silueta neutra de persona (icono). */
export const Person: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={-70} r={34} fill={C.case3} />
    <path d="M-58,70 L-58,0 Q-58,-28 -30,-28 L30,-28 Q58,-28 58,0 L58,70 Z" fill={C.case3} />
  </g>
);

/** Huella de animal (icono). */
export const Paw: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o} fill={C.case3}>
    <ellipse cx={0} cy={22} rx={40} ry={32} />
    <ellipse cx={-44} cy={-22} rx={15} ry={20} />
    <ellipse cx={-16} cy={-48} rx={15} ry={20} />
    <ellipse cx={16} cy={-48} rx={15} ry={20} />
    <ellipse cx={44} cy={-22} rx={15} ry={20} />
  </g>
);

/** Ondas de presión del aire que se expanden desde (x, y). */
export const Rings: React.FC<{ x: number; y: number; t: number; o?: number; n?: number; R?: number }> = ({ x, y, t, o = 1, n = 4, R = 360 }) => (
  <g opacity={o}>
    {Array.from({ length: n }).map((_, k) => {
      const p = (t * 0.6 + k / n) % 1;
      return <circle key={k} cx={x} cy={y} r={40 + R * p} fill="none" stroke={K.cold} strokeWidth={10 * (1 - p) + 2} opacity={1 - p} />;
    })}
  </g>
);

/** Nube con rayo (icono de tormenta). */
export const Storm: React.FC<{ x: number; y: number; s?: number; o?: number; t: number }> = ({ x, y, s = 1, o = 1, t }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-90,20 a50,50 0 0,1 20,-90 a70,70 0 0,1 130,10 a50,50 0 0,1 30,80 Z" fill={C.case3} />
    <path d="M-10,30 L-34,90 L-6,90 L-24,150 L34,70 L6,70 L24,30 Z" fill={K.flow} opacity={0.7 + 0.3 * Math.sin(t * 14)} style={{ filter: `drop-shadow(0 0 10px ${K.flow})` }} />
  </g>
);
