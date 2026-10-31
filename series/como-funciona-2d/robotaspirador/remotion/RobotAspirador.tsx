// Dibujos SVG del episodio «Cómo sabe un robot aspirador por dónde ha pasado».
// Todo en coordenadas del lienzo 1080×1920. Colores de la serie: naranja calor, cian aire/agua, amarillo lo importante, rojo error.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = { shell: "#3E6AA0", dark: "#2B4A72", light: "#9FB3CC", deep: "#16294A", hole: "#0A1528", tyre: "#1B2A44" };

type P = [number, number];
export type Seg = [number, number, number, number];

/** Segmentos de un rectángulo. */
export const rectSegs = (x0: number, y0: number, x1: number, y1: number): Seg[] => [[x0, y0, x1, y0], [x1, y0, x1, y1], [x1, y1, x0, y1], [x0, y1, x0, y0]];

/** Distancia desde (ox, oy) en el ángulo a (rad) hasta el primer segmento que corta. */
export const rayDist = (ox: number, oy: number, a: number, segs: Seg[]) => {
  const dx = Math.cos(a), dy = Math.sin(a);
  let best = 2000;
  for (const [x1, y1, x2, y2] of segs) {
    const ex = x2 - x1, ey = y2 - y1;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const u = ((x1 - ox) * ey - (y1 - oy) * ex) / den;
    const v = ((x1 - ox) * dy - (y1 - oy) * dx) / den;
    if (u > 0.5 && v >= 0 && v <= 1 && u < best) best = u;
  }
  return best;
};

/** Recorrido en filas (cortacésped) dentro de un rectángulo. */
export const lanes = (x0: number, x1: number, y0: number, dy: number, n: number): P[] => {
  const pts: P[] = [];
  for (let i = 0; i < n; i++) {
    const y = y0 + i * dy;
    if (i % 2 === 0) pts.push([x0, y], [x1, y]); else pts.push([x1, y], [x0, y]);
  }
  return pts;
};

/** Recorrido de rebotes «al azar» (determinista) dentro de un rectángulo. */
export const bounce = (x0: number, y0: number, x1: number, y1: number, n: number, seed = 3): P[] => {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  let x = (x0 + x1) / 2, y = (y0 + y1) / 2, a = 0.7;
  const pts: P[] = [[x, y]];
  for (let k = 0; k < n; k++) {
    const dx = Math.cos(a), dy = Math.sin(a);
    const tx = dx > 0 ? (x1 - x) / dx : (x0 - x) / dx;
    const ty = dy > 0 ? (y1 - y) / dy : (y0 - y) / dy;
    const d = Math.min(tx, ty);
    x += dx * d; y += dy * d; pts.push([x, y]);
    // rebote con giro aleatorio hacia dentro
    const nx = tx < ty ? (dx > 0 ? -1 : 1) : 0, ny = tx < ty ? 0 : (dy > 0 ? -1 : 1);
    const base = Math.atan2(ny, nx);
    a = base + (rnd() - 0.5) * 2.4;
  }
  return pts;
};

const plen = (pts: P[]) => pts.slice(1).reduce((acc, p, i) => acc + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
/** Primer tramo de la polilínea (fracción 0-1) y el punto de cabeza. */
export const partial = (pts: P[], frac: number): { pts: P[]; head: P; ang: number } => {
  const total = plen(pts);
  let left = Math.max(0, Math.min(1, frac)) * total;
  const out: P[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const d = Math.hypot(bx - ax, by - ay);
    const ang = Math.atan2(by - ay, bx - ax);
    if (left <= d) { const h: P = [ax + (bx - ax) * (left / Math.max(d, 1e-6)), ay + (by - ay) * (left / Math.max(d, 1e-6))]; out.push(h); return { pts: out, head: h, ang }; }
    left -= d; out.push([bx, by]);
  }
  const n = pts.length;
  return { pts: out, head: pts[n - 1], ang: Math.atan2(pts[n - 1][1] - pts[n - 2][1], pts[n - 1][0] - pts[n - 2][0]) };
};
export const toD = (pts: P[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

/** Cepillo lateral giratorio. */
const SideBrush: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${t * 720})`}>
    {[0, 120, 240].map((a) => (
      <g key={a} transform={`rotate(${a})`}>
        <line x1={0} y1={0} x2={0} y2={-88 * s} stroke={K.white} strokeWidth={6} strokeLinecap="round" opacity={0.85} />
        <line x1={0} y1={0} x2={14 * s} y2={-82 * s} stroke={C.light} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      </g>
    ))}
    <circle r={16} fill={C.light} stroke={K.ink} strokeWidth={3} />
  </g>
);

/** Mini plano de una casa (para el interior del robot del gancho). */
const MiniMap: React.FC<{ glow: number; t: number }> = ({ glow, t }) => (
  <g opacity={glow}>
    <rect x={-170} y={-150} width={340} height={300} fill="none" stroke={K.cold} strokeWidth={8} />
    <line x1={10} y1={-150} x2={10} y2={-20} stroke={K.cold} strokeWidth={8} />
    <line x1={10} y1={50} x2={10} y2={150} stroke={K.cold} strokeWidth={8} />
    <line x1={10} y1={20} x2={110} y2={20} stroke={K.cold} strokeWidth={8} />
    <rect x={-140} y={60} width={110} height={60} fill={K.cold} opacity={0.35} />
    <circle cx={-80} cy={-60} r={16 + 4 * Math.sin(t * 6)} fill={K.flow} />
    <circle cx={-80} cy={-60} r={30 + 18 * ((t * 1.2) % 1)} fill="none" stroke={K.flow} strokeWidth={4} opacity={1 - ((t * 1.2) % 1)} />
  </g>
);

/** Robot visto desde arriba. Mira hacia arriba con heading = 0 (grados). */
export const RobotTop: React.FC<{ cx: number; cy: number; r: number; t: number; open?: number; laser?: number; laserLen?: number; bump?: number; heading?: number; id?: string; brush?: boolean }> =
  ({ cx, cy, r, t, open = 0, laser = 0, laserLen = 560, bump = 0, heading = 0, id = "rt", brush = true }) => {
    const s = r / 300;
    const spin = t * 540;
    const cover = (
      <g>
        <circle r={300} fill={C.shell} stroke={C.light} strokeWidth={6} />
        <circle r={252} fill="none" stroke={C.dark} strokeWidth={5} />
        <circle cx={0} cy={-105} r={80} fill={C.deep} stroke={C.light} strokeWidth={5} />
        <g transform={`translate(0,-105) rotate(${spin})`}>
          <rect x={-40} y={-14} width={80} height={28} rx={8} fill={C.dark} stroke={C.light} strokeWidth={3} />
          <circle cx={36} cy={0} r={8} fill={K.flow} />
        </g>
        <circle cx={0} cy={125} r={36} fill="none" stroke={K.flow} strokeWidth={6} />
        <line x1={0} y1={105} x2={0} y2={125} stroke={K.flow} strokeWidth={6} strokeLinecap="round" />
        <path d={`M ${Math.cos(-2.45) * 304},${Math.sin(-2.45) * 304} A 304 304 0 0 1 ${Math.cos(-0.69) * 304},${Math.sin(-0.69) * 304}`}
          transform={`translate(0,${bump * 16})`} fill="none" stroke={bump > 0.05 ? K.flow : C.light} strokeWidth={20} strokeLinecap="round" />
      </g>
    );
    return (
      <g transform={`translate(${cx},${cy}) rotate(${heading}) scale(${s})`}>
        {laser > 0 && (
          <g transform={`translate(0,-105) rotate(${spin})`} opacity={laser}>
            <line x1={0} y1={0} x2={laserLen / s} y2={0} stroke={K.flow} strokeWidth={6 / Math.max(s, 0.4)} opacity={0.9} />
            <line x1={0} y1={0} x2={laserLen / s} y2={0} stroke={K.flow} strokeWidth={22 / Math.max(s, 0.4)} opacity={0.18} />
          </g>
        )}
        {brush && <SideBrush x={-215} y={-205} t={t} />}
        {open > 0.001 ? (
          <>
            <defs>
              <clipPath id={`${id}L`}><rect x={-320} y={-320} width={320} height={640} /></clipPath>
              <clipPath id={`${id}R`}><rect x={0} y={-320} width={320} height={640} /></clipPath>
            </defs>
            <circle r={292} fill={C.hole} stroke={C.dark} strokeWidth={6} />
            <MiniMap glow={Math.min(1, open * 1.5)} t={t} />
            <g transform={`translate(${-open * 200},${open * 20}) rotate(${-open * 10})`} clipPath={`url(#${id}L)`}>{cover}</g>
            <g transform={`translate(${open * 200},${open * 20}) rotate(${open * 10})`} clipPath={`url(#${id}R)`}>{cover}</g>
          </>
        ) : cover}
      </g>
    );
  };

/** Robot visto de lado, apoyado en el suelo `y`, con el frontal en `x` (mira a la derecha). Devuelve también dónde está el emisor de abajo. */
export const robotSideEmitter = (x: number, y: number) => ({ ex: x - 46, ey: y - 20 });
export const RobotSide: React.FC<{ x: number; y: number; t: number; w?: number; moving?: number }> = ({ x, y, t, w = 360, moving = 1 }) => {
  const wheel = (wx: number) => (
    <g transform={`translate(${wx},${y - 26}) rotate(${t * 400 * moving})`}>
      <circle r={26} fill={C.tyre} stroke={C.light} strokeWidth={5} />
      <line x1={-18} y1={0} x2={18} y2={0} stroke={C.light} strokeWidth={4} />
    </g>
  );
  return (
    <g>
      <rect x={x - w / 2 - 50} y={y - 146} width={100} height={40} rx={10} fill={C.deep} stroke={C.light} strokeWidth={4} />
      <rect x={x - w} y={y - 116} width={w} height={86} rx={40} fill={C.shell} stroke={C.light} strokeWidth={5} />
      <rect x={x - w + 30} y={y - 80} width={w - 60} height={8} rx={4} fill={C.dark} />
      {wheel(x - w * 0.28)}
      {wheel(x - w * 0.74)}
      <rect x={x - 16} y={y - 108} width={20} height={70} rx={8} fill={C.light} />
      <rect x={x - 58} y={y - 34} width={24} height={14} rx={4} fill={K.flow} stroke={K.ink} strokeWidth={2} />
    </g>
  );
};

/** Haz infrarrojo de un emisor hacia el suelo. mode: "ok" rebota, "cliff" no vuelve, "absorb" se apaga en la alfombra. */
export const IRBeam: React.FC<{ ex: number; ey: number; floorY: number; t: number; mode: "ok" | "cliff" | "absorb"; o?: number }> = ({ ex, ey, floorY, t, mode, o = 1 }) => {
  const dash = { strokeDasharray: "16 12", strokeDashoffset: -t * 90 } as const;
  if (mode === "ok") return (
    <g opacity={o}>
      <line x1={ex} y1={ey} x2={ex + 12} y2={floorY} stroke={K.flow} strokeWidth={7} {...dash} />
      <line x1={ex + 12} y1={floorY} x2={ex + 24} y2={ey} stroke={K.flow} strokeWidth={7} {...dash} />
      <circle cx={ex + 12} cy={floorY} r={10 + 3 * Math.sin(t * 10)} fill={K.flow} opacity={0.8} />
    </g>
  );
  if (mode === "cliff") return (
    <g opacity={o}>
      <defs><linearGradient id="irfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={K.flow} stopOpacity={1} /><stop offset="1" stopColor={K.flow} stopOpacity={0} /></linearGradient></defs>
      <rect x={ex - 4} y={ey} width={10} height={floorY - ey} fill="url(#irfade)" />
    </g>
  );
  return (
    <g opacity={o}>
      <line x1={ex} y1={ey} x2={ex + 8} y2={floorY} stroke={K.flow} strokeWidth={7} {...dash} />
      <circle cx={ex + 8} cy={floorY} r={14 + 8 * ((t * 2) % 1)} fill="none" stroke={K.warn} strokeWidth={4} opacity={1 - ((t * 2) % 1)} />
    </g>
  );
};

/** Robot visto desde abajo: cepillo lateral, rodillo, ventilador y depósito. */
export const BottomView: React.FC<{ cx: number; cy: number; t: number; air: number; dust: number }> = ({ cx, cy, t, air, dust }) => {
  const roll = (t * 160) % 40;
  // partículas: del borde izquierdo al cepillo lateral, luego al rodillo
  const parts = Array.from({ length: 10 }, (_, i) => {
    const ph = ((t * 0.55 + i / 10) % 1);
    let x: number, y: number;
    if (ph < 0.5) { const k = ph / 0.5; x = -390 + 190 * k; y = -260 + 60 * k + 20 * Math.sin(i); }
    else if (ph < 0.8) { const k = (ph - 0.5) / 0.3; x = -200 + 170 * k; y = -200 + 270 * k; }
    else { const k = (ph - 0.8) / 0.2; x = -30 + 30 * k; y = 70 + 120 * k * air; }
    return { x, y, o: ph > 0.8 ? (air > 0.5 ? 1 - (ph - 0.8) / 0.2 : 0.2) : 1 };
  });
  return (
    <g transform={`translate(${cx},${cy})`}>
      <circle r={300} fill={C.dark} stroke={C.light} strokeWidth={6} />
      <circle r={262} fill="none" stroke={C.deep} strokeWidth={4} />
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <rect x={sd * 220 - 26} y={-75} width={52} height={150} rx={20} fill={C.tyre} stroke={C.light} strokeWidth={4} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={sd * 220 - 22} x2={sd * 220 + 22} y1={-60 + ((k * 40 + t * 120) % 150)} y2={-60 + ((k * 40 + t * 120) % 150)} stroke={C.light} strokeWidth={3} opacity={0.6} />)}
        </g>
      ))}
      <circle cx={0} cy={-210} r={22} fill={C.tyre} stroke={C.light} strokeWidth={4} />
      {/* rodillo */}
      <clipPath id="rollclip"><rect x={-160} y={30} width={320} height={84} rx={30} /></clipPath>
      <rect x={-160} y={30} width={320} height={84} rx={30} fill={C.hole} stroke={C.light} strokeWidth={5} />
      <g clipPath="url(#rollclip)">
        {Array.from({ length: 12 }, (_, k) => <line key={k} x1={-200 + k * 40 + roll} y1={30} x2={-160 + k * 40 + roll} y2={114} stroke={K.hot} strokeWidth={8} opacity={0.85} />)}
      </g>
      {/* conducto, depósito y ventilador */}
      <rect x={-130} y={150} width={260} height={100} rx={18} fill={C.deep} stroke={C.light} strokeWidth={5} />
      <rect x={-122} y={250 - 8 - 70 * dust} width={244} height={70 * dust + 2} rx={10} fill="#8A97AB" opacity={0.75} />
      <g transform={`translate(190,175) rotate(${t * 900 * (0.2 + air)})`}>
        <circle r={58} fill={C.hole} stroke={K.cold} strokeWidth={5} />
        {[0, 72, 144, 216, 288].map((a) => <path key={a} d="M0,0 Q24,-18 8,-50" stroke={K.cold} strokeWidth={8} fill="none" strokeLinecap="round" transform={`rotate(${a})`} />)}
      </g>
      <g opacity={air}>
        {[0, 1, 2].map((k) => {
          const ph = (t * 1.5 + k / 3) % 1;
          return <path key={k} d={`M ${-40 + 0},${110 + 40 * ph} q 40,30 90,${20 + 10 * ph}`} stroke={K.cold} strokeWidth={6} fill="none" strokeLinecap="round" opacity={1 - ph} />;
        })}
        <path d="M 130,200 l 0,0" />
      </g>
      <SideBrush x={-200} y={-200} t={t} s={1.15} />
      {parts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={9} fill="#C9B79A" opacity={p.o} />)}
    </g>
  );
};

/** Rueda con disco codificador ranurado y sensor de horquilla. Devuelve el número de pulsos contados. */
export const encoderPulses = (ang: number) => Math.floor(ang / 30);
export const WheelEncoder: React.FC<{ cx: number; cy: number; ang: number; t: number }> = ({ cx, cy, ang, t }) => {
  const slotPhase = ((ang % 30) + 30) % 30;
  const lit = slotPhase < 6 || slotPhase > 24;
  return (
    <g transform={`translate(${cx},${cy})`}>
      <circle r={230} fill={C.tyre} stroke={C.light} strokeWidth={8} />
      {Array.from({ length: 24 }, (_, k) => <rect key={k} x={-10} y={-236} width={20} height={22} fill={C.light} opacity={0.5} transform={`rotate(${k * 15 + ang})`} />)}
      <g transform={`rotate(${ang})`}>
        <circle r={160} fill={C.shell} stroke={C.light} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, k) => <rect key={k} x={-11} y={-150} width={22} height={44} rx={4} fill={C.hole} transform={`rotate(${k * 30})`} />)}
        <circle r={40} fill={C.dark} stroke={C.light} strokeWidth={5} />
      </g>
      {/* horquilla: emisor arriba, receptor abajo, en la vertical de las ranuras (y = -128) */}
      <g transform="translate(0,-128)">
        <rect x={-30} y={-82} width={60} height={40} rx={8} fill={C.deep} stroke={K.flow} strokeWidth={4} />
        <rect x={-30} y={42} width={60} height={40} rx={8} fill={C.deep} stroke={K.flow} strokeWidth={4} />
        <line x1={0} y1={-42} x2={0} y2={42} stroke={K.flow} strokeWidth={lit ? 10 : 3} opacity={lit ? 1 : 0.25} />
        {lit && <circle cx={0} cy={62} r={12} fill={K.flow} />}
      </g>
    </g>
  );
};

/** Base de carga con haz infrarrojo en abanico hacia arriba. */
export const Dock: React.FC<{ x: number; y: number; t: number; beam: number }> = ({ x, y, t, beam }) => (
  <g>
    <g opacity={0.15 + 0.6 * beam}>
      <path d={`M ${x},${y - 40} L ${x - 300},${y - 520} L ${x + 300},${y - 520} Z`} fill={K.flow} opacity={0.12} />
      {[0, 1, 2, 3].map((k) => {
        const ph = (t * 0.8 + k / 4) % 1;
        const rr = 60 + 460 * ph;
        return <path key={k} d={`M ${x - rr * 0.53},${y - 40 - rr * 0.85} A ${rr} ${rr} 0 0 1 ${x + rr * 0.53},${y - 40 - rr * 0.85}`} fill="none" stroke={K.flow} strokeWidth={6} opacity={(1 - ph) * 0.9} />;
      })}
    </g>
    <rect x={x - 90} y={y - 50} width={180} height={70} rx={16} fill={C.dark} stroke={C.light} strokeWidth={5} />
    <circle cx={x} cy={y - 26} r={10} fill={K.flow} />
    <rect x={x - 50} y={y - 58} width={24} height={10} rx={3} fill={C.light} />
    <rect x={x + 26} y={y - 58} width={24} height={10} rx={3} fill={C.light} />
  </g>
);

/** Pila con nivel de carga. */
export const Battery: React.FC<{ x: number; y: number; level: number; o: number }> = ({ x, y, level, o }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-70} y={-34} width={130} height={68} rx={12} fill={K.ink} stroke={K.white} strokeWidth={6} />
    <rect x={62} y={-14} width={14} height={28} rx={4} fill={K.white} />
    <rect x={-60} y={-24} width={110 * level} height={48} rx={6} fill={level > 0.6 ? K.flow : K.hot} />
  </g>
);

/** Calcetín visto desde arriba. */
export const Sock: React.FC<{ x: number; y: number; rot?: number; o?: number }> = ({ x, y, rot = 0, o = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}>
    <path d="M -40,-110 L 40,-110 L 40,20 Q 40,60 80,70 Q 130,80 120,120 Q 110,150 60,140 L -10,120 Q -40,110 -40,70 Z" fill={K.white} stroke={K.ink} strokeWidth={4} />
    <rect x={-40} y={-110} width={80} height={26} fill={K.hot} />
  </g>
);

/** Iconos del resumen. */
export const Icon: React.FC<{ kind: "mide" | "ubica" | "planifica" | "casa"; x: number; y: number; on: number; t: number }> = ({ kind, x, y, on, t }) => {
  const col = on > 0.5 ? K.flow : C.light;
  const sc = 1 + 0.12 * on * Math.max(0, Math.sin(t * 5));
  return (
    <g transform={`translate(${x},${y}) scale(${sc})`} opacity={0.35 + 0.65 * on}>
      <circle r={78} fill="rgba(6,16,31,0.8)" stroke={col} strokeWidth={5} />
      {kind === "mide" && <>{[20, 38, 56].map((r) => <path key={r} d={`M ${r * 0.7},${-r * 0.7} A ${r} ${r} 0 0 1 ${r * 0.7},${r * 0.7}`} fill="none" stroke={col} strokeWidth={7} transform="translate(-26,0)" />)}<circle cx={-26} cy={0} r={8} fill={col} /></>}
      {kind === "ubica" && <><path d="M 0,44 C -38,0 -36,-44 0,-44 C 36,-44 38,0 0,44 Z" fill={col} /><circle cx={0} cy={-14} r={13} fill={K.ink} /></>}
      {kind === "planifica" && <path d="M -40,-36 L 40,-36 L 40,-12 L -40,-12 L -40,12 L 40,12 L 40,36 L -40,36" fill="none" stroke={col} strokeWidth={7} strokeLinejoin="round" />}
      {kind === "casa" && <path d="M -42,6 L 0,-38 L 42,6 L 30,6 L 30,40 L -30,40 L -30,6 Z" fill={col} />}
    </g>
  );
};
