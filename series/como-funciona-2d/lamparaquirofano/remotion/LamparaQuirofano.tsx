// Dibujos SVG planos del episodio «Cómo funciona la lámpara del quirófano» (ESPECIAL HOSPITAL). Sin marcas.
// Personas = siluetas neutras. Tejido esquemático; el rojo #E53935 solo como color de muestra.
// Código de color: amarillo = la luz / lo importante, naranja = calor e infrarrojo, cian = luz fría,
// rojo #E53935 = error, grises azulados = carcasas.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = {
  case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#0B1A30", sil: "#2A4E7A", silEdge: "#5A86BE",
  steel: "#C9D6E6", sheet: "#2F7F8C", sheetEdge: "#5FB3BF", red: "#E53935", beam: "#FFF4C2", shadow: "#020812",
};

type Obst = { x: number; y: number; r: number };

/** Posiciones de los led (en coordenadas locales de la cúpula, cara inferior en y = 0). */
export const ledXs = (w: number, n: number) => Array.from({ length: n }).map((_, i) => -w / 2 + 50 + (i * (w - 100)) / (n - 1));

/** ¿El segmento (ax,ay)-(bx,by) corta el círculo? Devuelve la fracción del segmento donde choca (o 1). */
const hit = (ax: number, ay: number, bx: number, by: number, o: Obst) => {
  const dx = bx - ax, dy = by - ay, fx = ax - o.x, fy = ay - o.y;
  const a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), c = fx * fx + fy * fy - o.r * o.r;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return 1;
  const u = (-b - Math.sqrt(disc)) / (2 * a);
  return u >= 0 && u <= 1 ? u : 1;
};

/** Haces: cada led manda un rayo al mismo punto (tx,ty). Los que choca un obstáculo se cortan ahí.
 * Debajo, la sombra en la mesa: tan oscura como la fracción de rayos tapados. */
export const Beams: React.FC<{ x0: number; y0: number; xs: number[]; tx: number; ty: number; obst?: Obst[]; o?: number; t: number; spread?: number; shadowY?: number; hard?: boolean }> =
  ({ x0, y0, xs, tx, ty, obst = [], o = 1, t, spread = 0, shadowY, hard = false }) => {
    let blocked = 0;
    const rays = xs.map((lx, i) => {
      const ax = x0 + lx, ay = y0;
      const bx = tx + spread * (i / (xs.length - 1) - 0.5), by = ty;
      let u = 1;
      obst.forEach((ob) => { u = Math.min(u, hit(ax, ay, bx, by, ob)); });
      if (u < 1) blocked++;
      return { ax, ay, ex: ax + (bx - ax) * u, ey: ay + (by - ay) * u, u, i };
    });
    const frac = blocked / xs.length;
    const sy = shadowY ?? ty;
    return (
      <g opacity={o}>
        {rays.map((r) => (
          <line key={r.i} x1={r.ax} y1={r.ay} x2={r.ex} y2={r.ey} stroke={r.u < 1 ? K.hot : C.beam} strokeWidth={r.u < 1 ? 3 : 4}
            opacity={(r.u < 1 ? 0.35 : 0.45) + 0.1 * Math.sin(t * 5 + r.i)} strokeLinecap="round" />
        ))}
        <ellipse cx={tx} cy={ty} rx={110 + spread / 2} ry={22} fill={C.beam} opacity={0.55 * (1 - frac * 0.5)} />
        {obst.length > 0 && obst.map((ob, k) => (
          <ellipse key={k} cx={tx + (ob.x - tx) * 0.25} cy={sy} rx={hard ? 70 : 60} ry={hard ? 18 : 14} fill={C.shadow}
            opacity={hard ? 0.95 : Math.min(0.45, frac * 1.1)} />
        ))}
      </g>
    );
  };

/** Cúpula vista de lado. Origen: centro de la cara inferior (la que da luz). w = ancho.
 * open: la carcasa se levanta y deja ver los led. glow: brillo de los led. handle: resalta el asa estéril. */
export const Dome: React.FC<{ w?: number; n?: number; open?: number; glow?: number; handle?: number; arm?: number; t: number; tilt?: number }> =
  ({ w = 600, n = 13, open = 0, glow = 1, handle = 0, arm = 220, t, tilt = 0 }) => {
    const h = w * 0.26;
    const xs = ledXs(w, n);
    return (
      <g transform={`rotate(${tilt})`}>
        {/* brazo al techo */}
        <path d={`M 0 ${-h - 10} L 0 ${-h - arm * 0.55} L ${w * 0.22} ${-h - arm}`} fill="none" stroke={C.case3} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={0} cy={-h - arm * 0.55} r={14} fill={C.case1} stroke={C.case3} strokeWidth={4} />
        {/* interior: placa con los led */}
        <path d={`M ${-w / 2} 0 Q ${-w / 2} ${-h * 0.9} 0 ${-h * 0.95} Q ${w / 2} ${-h * 0.9} ${w / 2} 0 Z`} fill={C.dark} stroke={C.case3} strokeWidth={4} />
        {xs.map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={-12} r={15} fill={C.beam} opacity={0.15 + 0.85 * glow * (0.85 + 0.15 * Math.sin(t * 6 + i))} />
            <circle cx={x} cy={-12} r={24} fill="none" stroke={C.beam} strokeWidth={3} opacity={0.4 * glow} />
          </g>
        ))}
        {/* carcasa que se levanta */}
        <g transform={`translate(0 ${-110 * open}) rotate(${-6 * open})`} opacity={1 - 0.65 * open}>
          <path d={`M ${-w / 2 - 14} 4 Q ${-w / 2 - 10} ${-h * 1.05} 0 ${-h - 8} Q ${w / 2 + 10} ${-h * 1.05} ${w / 2 + 14} 4 Z`} fill={C.case2} stroke={C.case3} strokeWidth={5} />
          <path d={`M ${-w * 0.32} ${-h * 0.62} Q 0 ${-h * 0.86} ${w * 0.32} ${-h * 0.62}`} fill="none" stroke={C.case3} strokeWidth={4} opacity={0.6} />
        </g>
        {/* aro inferior */}
        <rect x={-w / 2 - 14} y={-6} width={w + 28} height={14} rx={7} fill={C.case1} stroke={C.case3} strokeWidth={4} />
        {/* asa estéril central */}
        <rect x={-16} y={6} width={32} height={70} rx={14} fill={handle > 0.01 ? K.flow : C.steel} stroke={C.case1} strokeWidth={4} opacity={0.9} />
        {handle > 0.01 && <rect x={-30} y={-4} width={60} height={92} rx={22} fill="none" stroke={K.flow} strokeWidth={5} strokeDasharray="8 8" opacity={handle} />}
      </g>
    );
  };

/** Cúpula vista desde abajo: anillos de led. Origen: centro. */
export const DomeBelow: React.FC<{ r?: number; t: number; lit?: number; aim?: number }> = ({ r = 300, t, lit = 1, aim = 0 }) => {
  const rings = [{ rr: r * 0.32, n: 8 }, { rr: r * 0.55, n: 14 }, { rr: r * 0.78, n: 20 }];
  let k = 0;
  return (
    <g>
      <circle r={r + 16} fill={C.case1} stroke={C.case3} strokeWidth={6} />
      <circle r={r} fill={C.dark} stroke={C.case3} strokeWidth={3} />
      {rings.map((g, gi) => Array.from({ length: g.n }).map((_, i) => {
        const a = (i / g.n) * Math.PI * 2 + gi * 0.2;
        const x = g.rr * Math.cos(a), y = g.rr * Math.sin(a);
        const idx = k++;
        const on = Math.min(1, Math.max(0, lit * 42 - idx * 0.9));
        return (
          <g key={`${gi}-${i}`}>
            <circle cx={x} cy={y} r={13} fill={C.beam} opacity={0.12 + 0.88 * on * (0.85 + 0.15 * Math.sin(t * 6 + idx))} />
            {aim > 0.01 && <line x1={x} y1={y} x2={x * (1 - 0.35 * aim)} y2={y * (1 - 0.35 * aim)} stroke={K.flow} strokeWidth={4} opacity={0.8 * aim} strokeLinecap="round" />}
          </g>
        );
      }))}
      {/* asa central */}
      <circle r={34} fill={C.steel} stroke={C.case1} strokeWidth={5} />
      {aim > 0.01 && <circle r={10 + 6 * Math.sin(t * 5)} fill={K.flow} opacity={aim} />}
    </g>
  );
};

/** Mesa de operaciones con paciente bajo la sábana (silueta neutra). Origen: centro de la superficie. Ancho ~520. */
export const Table: React.FC<{ o?: number; s?: number }> = ({ o = 1, s = 1 }) => (
  <g opacity={o} transform={`scale(${s})`}>
    <rect x={-30} y={30} width={60} height={160} fill={C.case1} stroke={C.case3} strokeWidth={4} />
    <rect x={-120} y={180} width={240} height={16} rx={6} fill={C.case1} stroke={C.case3} strokeWidth={4} />
    <rect x={-260} y={0} width={520} height={34} rx={10} fill={C.case2} stroke={C.case3} strokeWidth={4} />
    <circle cx={-220} cy={-28} r={30} fill={C.sil} stroke={C.silEdge} strokeWidth={4} />
    <path d="M -186 0 C -186 -50 -80 -62 10 -58 C 120 -54 220 -44 244 0 Z" fill={C.sheet} stroke={C.sheetEdge} strokeWidth={4} />
    <ellipse cx={0} cy={-56} rx={46} ry={10} fill="#A44E63" opacity={0.9} />
  </g>
);

/** Mano en silueta (vista de lado, dedos hacia abajo-izquierda). Origen: centro de la palma. */
export const Hand: React.FC<{ o?: number; s?: number; glove?: boolean }> = ({ o = 1, s = 1, glove = false }) => (
  <g opacity={o} transform={`scale(${s})`}>
    <rect x={30} y={-26} width={160} height={52} rx={22} fill={glove ? "#4FA3C7" : C.sil} stroke={C.silEdge} strokeWidth={4} />
    <path d="M 40 -34 C 10 -40 -50 -30 -70 -6 C -84 10 -70 26 -46 24 L 40 30 Z" fill={glove ? "#4FA3C7" : C.sil} stroke={C.silEdge} strokeWidth={4} />
    <path d="M -10 -32 C -10 -60 20 -64 26 -40" fill={glove ? "#4FA3C7" : C.sil} stroke={C.silEdge} strokeWidth={4} />
  </g>
);

/** Cabeza y hombros en silueta (de perfil, mirando a la mesa). Origen: centro de la cabeza. */
export const Head: React.FC<{ o?: number; s?: number }> = ({ o = 1, s = 1 }) => (
  <g opacity={o} transform={`scale(${s})`}>
    <path d="M -150 150 C -150 70 -90 52 -40 48 L 40 48 C 90 52 150 70 150 150 Z" fill={C.sil} stroke={C.silEdge} strokeWidth={4} />
    <circle cx={0} cy={0} r={58} fill={C.sil} stroke={C.silEdge} strokeWidth={4} />
    <path d="M -58 -6 C -50 -60 50 -66 60 -10" fill="#4FA3C7" opacity={0.85} />
  </g>
);

/** Bombilla corriente colgando. Origen: centro de la bombilla. */
export const Bulb: React.FC<{ t: number; o?: number }> = ({ t, o = 1 }) => (
  <g opacity={o}>
    <line x1={0} y1={-200} x2={0} y2={-56} stroke={C.case3} strokeWidth={6} />
    <rect x={-22} y={-60} width={44} height={30} rx={4} fill={C.case2} stroke={C.case3} strokeWidth={4} />
    <circle cx={0} cy={0} r={40 + 2 * Math.sin(t * 5)} fill={C.beam} />
    <circle cx={0} cy={0} r={64} fill={C.beam} opacity={0.18} />
  </g>
);

/** Rayos de un solo punto que cortan en el obstáculo: deja una sombra negra dura en el suelo. */
export const PointLight: React.FC<{ x: number; y: number; floorY: number; t: number; obst: Obst; o?: number }> = ({ x, y, floorY, t, obst, o = 1 }) => {
  const angles = Array.from({ length: 11 }).map((_, i) => -0.42 + i * 0.084);
  return (
    <g opacity={o}>
      {angles.map((a, i) => {
        const bx = x + Math.tan(a) * (floorY - y), by = floorY;
        const u = hit(x, y, bx, by, obst);
        return <line key={i} x1={x} y1={y} x2={x + (bx - x) * u} y2={y + (by - y) * u} stroke={C.beam} strokeWidth={3} opacity={0.35 + 0.08 * Math.sin(t * 5 + i)} />;
      })}
      {/* sombra dura: proyección del obstáculo */}
      {(() => {
        const k = (floorY - y) / (obst.y - y);
        const cx = x + (obst.x - x) * k, rx = obst.r * k;
        return <ellipse cx={cx} cy={floorY} rx={rx} ry={16} fill={C.shadow} opacity={0.97} />;
      })()}
    </g>
  );
};

/** Espectro: banda visible + zona infrarroja, con dos curvas (bombilla antigua y led). Caja x0..x1, base y. */
export const Spectrum: React.FC<{ x0: number; x1: number; y: number; h: number; t: number; old?: number; led?: number; ir?: number }> =
  ({ x0, x1, y, h, t, old = 1, led = 1, ir = 0 }) => {
    const W = x1 - x0, vis1 = x0 + W * 0.55;
    const N = 60;
    const pts = (f: (u: number) => number) => Array.from({ length: N + 1 }).map((_, i) => { const u = i / N; return `${x0 + u * W},${y - h * f(u)}`; }).join(" ");
    const oldF = (u: number) => 0.15 + 0.8 * Math.min(1, u * 1.15) * (1 - 0.25 * Math.max(0, u - 0.85) / 0.15);
    const ledF = (u: number) => u > 0.62 ? 0.03 : 0.75 * Math.exp(-Math.pow((u - 0.12) / 0.05, 2)) + 0.55 * Math.exp(-Math.pow((u - 0.33) / 0.12, 2));
    const cols = ["#7B4DFF", "#3D7BFF", "#35C4F0", "#3DDC84", "#FFD23F", "#FF7A1A", "#E53935"];
    return (
      <g>
        <defs>
          <linearGradient id="visband" x1="0" x2="1" y1="0" y2="0">
            {cols.map((c, i) => <stop key={i} offset={i / (cols.length - 1)} stopColor={c} />)}
          </linearGradient>
        </defs>
        <rect x={x0} y={y + 14} width={vis1 - x0} height={26} rx={6} fill="url(#visband)" />
        <rect x={vis1} y={y + 14} width={x1 - vis1} height={26} rx={6} fill={K.hot} opacity={0.25 + 0.6 * ir} />
        <rect x={vis1} y={y - h - 20} width={x1 - vis1} height={h + 20} fill={K.hot} opacity={0.12 * ir + 0.04 * ir * Math.sin(t * 4)} />
        <line x1={x0} y1={y} x2={x1} y2={y} stroke={C.case3} strokeWidth={4} />
        <line x1={vis1} y1={y - h - 20} x2={vis1} y2={y + 40} stroke={C.case3} strokeWidth={3} strokeDasharray="8 8" />
        <polyline points={pts(oldF)} fill="none" stroke={K.hot} strokeWidth={8} strokeLinejoin="round" opacity={old} />
        <polyline points={pts(ledF)} fill="none" stroke={K.cold} strokeWidth={8} strokeLinejoin="round" opacity={led} />
      </g>
    );
  };

/** Muestras de tejido: 4 tonos de rojo. washed: 1 = luz que falsea (tonos casi iguales). Origen: esquina sup. izq. */
export const Swatches: React.FC<{ washed?: number; o?: number; hi?: number }> = ({ washed = 0, o = 1, hi = 0 }) => {
  const reds = ["#E53935", "#B8283A", "#D9566B", "#8E1F2E"];
  const mix = (c: string) => {
    const n = parseInt(c.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const tr = 150, tg = 92, tb = 60; // tono marrón apagado
    const m = (a: number, z: number) => Math.round(a + (z - a) * washed * 0.82);
    return `rgb(${m(r, tr)},${m(g, tg)},${m(b, tb)})`;
  };
  return (
    <g opacity={o}>
      {reds.map((c, i) => (
        <rect key={i} x={(i % 2) * 150} y={Math.floor(i / 2) * 150} width={130} height={130} rx={18} fill={mix(c)}
          stroke={hi > 0.01 ? K.flow : C.case3} strokeWidth={hi > 0.01 ? 6 : 3} />
      ))}
    </g>
  );
};

/** Sol simple. */
export const Sun: React.FC<{ t: number; o?: number; r?: number }> = ({ t, o = 1, r = 46 }) => (
  <g opacity={o}>
    {Array.from({ length: 10 }).map((_, i) => { const a = (i / 10) * Math.PI * 2 + t * 0.4; return <line key={i} x1={Math.cos(a) * (r + 12)} y1={Math.sin(a) * (r + 12)} x2={Math.cos(a) * (r + 34)} y2={Math.sin(a) * (r + 34)} stroke={K.flow} strokeWidth={7} strokeLinecap="round" />; })}
    <circle r={r} fill={K.flow} />
  </g>
);

/** Quirófano antiguo: ventanal a la izquierda y claraboya en el techo, con rayos de sol hacia la mesa. */
export const OldRoom: React.FC<{ t: number; win?: number; sky?: number; sun?: number }> = ({ t, win = 1, sky = 1, sun = 1 }) => (
  <g>
    {/* paredes y techo */}
    <path d="M 100 420 L 980 420 L 980 1080 L 100 1080 Z" fill="#0F2747" stroke={C.case3} strokeWidth={4} />
    {/* claraboya */}
    <g opacity={0.35 + 0.65 * sky}>
      <rect x={400} y={404} width={280} height={32} rx={6} fill="#8FD3F0" stroke={C.case3} strokeWidth={4} />
      {[460, 520, 580, 640].map((x) => <line key={x} x1={x} y1={404} x2={x} y2={436} stroke={C.case3} strokeWidth={3} />)}
      <path d={`M 400 436 L 680 436 L 700 880 L 380 880 Z`} fill={C.beam} opacity={0.18 * sun + 0.04 * Math.sin(t * 3)} />
    </g>
    {/* ventanal */}
    <g opacity={0.35 + 0.65 * win}>
      <rect x={100} y={500} width={34} height={380} fill="#8FD3F0" stroke={C.case3} strokeWidth={4} />
      {[580, 660, 740, 820].map((y) => <line key={y} x1={100} y1={y} x2={134} y2={y} stroke={C.case3} strokeWidth={3} />)}
      <path d="M 134 500 L 134 880 L 560 900 L 330 520 Z" fill={C.beam} opacity={0.16 * sun + 0.04 * Math.sin(t * 3 + 1)} />
    </g>
    <line x1={100} y1={1080} x2={980} y2={1080} stroke={C.case3} strokeWidth={4} />
  </g>
);

/** Lámpara de 1919 (esquema): una bombilla en el centro y una corona de espejos que mandan la luz al mismo punto. Origen: bombilla. */
export const OldLamp: React.FC<{ t: number; rays?: number; tx: number; ty: number }> = ({ t, rays = 1, tx, ty }) => {
  const mirrors = [-250, -190, -130, 130, 190, 250];
  return (
    <g>
      <path d="M -300 -60 Q 0 -200 300 -60 L 300 -20 L -300 -20 Z" fill={C.case2} stroke={C.case3} strokeWidth={5} />
      <circle cx={0} cy={-10} r={30 + 2 * Math.sin(t * 5)} fill={C.beam} />
      {mirrors.map((mx, i) => {
        const my = -10;
        return (
          <g key={i}>
            <line x1={0} y1={-10} x2={mx} y2={my} stroke={C.beam} strokeWidth={3} opacity={0.5 * rays} strokeDasharray="6 8" />
            <rect x={mx - 6} y={my - 26} width={12} height={52} rx={3} fill="#BFE6F5" stroke={C.case3} strokeWidth={3} transform={`rotate(${mx < 0 ? 35 : -35} ${mx} ${my})`} />
            <line x1={mx} y1={my} x2={tx} y2={ty} stroke={C.beam} strokeWidth={4} opacity={(0.45 + 0.1 * Math.sin(t * 5 + i)) * rays} />
          </g>
        );
      })}
      <ellipse cx={tx} cy={ty} rx={90} ry={18} fill={C.beam} opacity={0.5 * rays} />
    </g>
  );
};
