// Dibujos SVG del episodio 169 · Cómo corrige la miopía la operación láser de los ojos (ESPECIAL HOSPITAL).
// Planos y esquemáticos: ojo en corte, córnea ampliada con su tapa, haz ultravioleta, ojo de frente con el seguidor.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = {
  case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F",
  sclera: "#E9EEF5", corneaFill: "rgba(53,196,240,0.22)", lens: "rgba(53,196,240,0.45)",
  retina: K.hot, iris: "#3E6AA0", stroma: "#9FD7EE", stroma2: "#6FB8DA", epi: "#CDEFFB", uv: K.cold,
};

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

/* ------------------------------------------------------------------ */
/* Ojo en corte lateral: la luz entra por la izquierda (córnea) y enfoca hacia la derecha (retina). */
export type EyeProps = {
  cx: number; cy: number; R: number;
  len?: number;        // alargamiento del globo (1 = normal)
  flat?: number;       // 0 = córnea curva (miope), 1 = centro aplanado
  gap?: number;        // distancia (px) del foco por delante de la retina
  rays?: number;       // opacidad de los rayos
  t: number;
  glowCornea?: number; // resalte amarillo de la córnea
  dimInside?: number;  // 0..1 atenúa cristalino y retina («no se toca»)
  flap?: number;       // 0..1 tapa levantada (gancho)
  showLabels?: boolean;
};

export const eyeGeom = (cx: number, cy: number, R: number, len = 1, flat = 0) => {
  const a = R * len, b = R;
  const h = 0.5 * b;
  const xc = cx - a * Math.sqrt(1 - 0.25); // donde la córnea se une al globo
  const bulge = R * (0.26 - 0.1 * flat);
  const retinaX = cx + a * 0.985;
  return { a, b, h, xc, bulge, retinaX, apex: xc - bulge };
};

export const Eye: React.FC<EyeProps> = ({ cx, cy, R, len = 1, flat = 0, gap = 0, rays = 1, t, glowCornea = 0, dimInside = 0, flap = 0 }) => {
  const g = eyeGeom(cx, cy, R, len, flat);
  const { a, b, h, xc, bulge, retinaX } = g;
  const fx = retinaX - gap;
  // superficie de la córnea en la altura dy
  const corneaX = (dy: number) => xc - bulge * (1 - (dy / h) ** 2);
  const rayYs = [-0.36, -0.18, 0, 0.18, 0.36].map((k) => k * b);
  const flow = (t * 220) % 40;
  const inside = 1 - 0.75 * dimInside;
  const blurR = Math.min(46, Math.abs(gap) * 0.32);
  const lensX = cx - a * 0.6;
  const corneaPath = `M ${xc} ${cy - h} Q ${xc - bulge * 2} ${cy} ${xc} ${cy + h}`;
  return (
    <g>
      {/* globo */}
      <ellipse cx={cx} cy={cy} rx={a} ry={b} fill={C.case1} stroke={C.case3} strokeWidth={8} />
      <ellipse cx={cx} cy={cy} rx={a - 26} ry={b - 26} fill="#163257" opacity={0.9} />
      {/* retina */}
      <path d={`M ${cx + (a - 14) * Math.cos(1.0)} ${cy - (b - 14) * Math.sin(1.0)} A ${a - 14} ${b - 14} 0 0 1 ${cx + (a - 14) * Math.cos(1.0)} ${cy + (b - 14) * Math.sin(1.0)}`}
        fill="none" stroke={C.retina} strokeWidth={16} strokeLinecap="round" opacity={inside} />
      {/* nervio óptico */}
      <rect x={cx + a - 20} y={cy - 30} width={90} height={60} rx={20} fill={C.case2} opacity={0.8 * inside} />
      {/* cristalino */}
      <ellipse cx={lensX} cy={cy} rx={R * 0.11} ry={R * 0.32} fill={C.lens} stroke={K.cold} strokeWidth={4} opacity={inside} />
      {/* iris */}
      <rect x={lensX - R * 0.16} y={cy - b * 0.62} width={14} height={b * 0.3} rx={6} fill={C.case2} opacity={inside} />
      <rect x={lensX - R * 0.16} y={cy + b * 0.32} width={14} height={b * 0.3} rx={6} fill={C.case2} opacity={inside} />
      {/* córnea: hueco blanco que la separa del globo + la cúpula transparente */}
      <path d={`${corneaPath} L ${xc + 30} ${cy + h} L ${xc + 30} ${cy - h} Z`} fill="#163257" />
      <path d={`${corneaPath}`} fill={C.corneaFill} stroke={glowCornea > 0.01 ? K.flow : K.cold} strokeWidth={10 + 4 * glowCornea}
        style={glowCornea > 0.01 ? { filter: `drop-shadow(0 0 ${18 * glowCornea}px ${K.flow})` } : undefined} />
      {flap > 0.01 && (
        <g transform={`rotate(${-50 * flap} ${xc} ${cy - h})`}>
          <path d={`M ${xc} ${cy - h} Q ${xc - (bulge + 10) * 2} ${cy} ${xc} ${cy + h}`} fill="none" stroke={K.flow} strokeWidth={10}
            style={{ filter: `drop-shadow(0 0 12px ${K.flow})` }} />
        </g>
      )}
      {/* rayos de luz */}
      {rays > 0.01 && rayYs.map((dy, i) => {
        const x1 = corneaX(dy);
        const y1 = cy + dy;
        const sx = (fx - x1);
        const sy = (cy - y1);
        // tras el foco, la recta sigue hasta la retina
        const k = (retinaX - x1) / Math.max(1, sx);
        const x2 = retinaX, y2 = y1 + sy * k;
        return (
          <g key={i} opacity={rays}>
            <line x1={60} y1={y1} x2={x1} y2={y1} stroke={K.flow} strokeWidth={6} strokeDasharray="26 14" strokeDashoffset={-flow} strokeLinecap="round" />
            <line x1={x1} y1={y1} x2={fx} y2={cy} stroke={K.flow} strokeWidth={6} strokeLinecap="round" />
            {gap > 4 && <line x1={fx} y1={cy} x2={x2} y2={y2} stroke={K.flow} strokeWidth={4} opacity={0.5} strokeLinecap="round" />}
          </g>
        );
      })}
      {rays > 0.01 && (
        <g opacity={rays}>
          {gap > 4 ? (
            <>
              <circle cx={fx} cy={cy} r={11} fill={K.flow} />
              <ellipse cx={retinaX - 6} cy={cy} rx={10} ry={blurR + 8} fill={K.warn} opacity={0.75} />
            </>
          ) : (
            <circle cx={retinaX - 6} cy={cy} r={16 + 3 * Math.sin(t * 6)} fill={K.flow} style={{ filter: `drop-shadow(0 0 14px ${K.flow})` }} />
          )}
        </g>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Córnea ampliada en corte: banda curva con su tapa (bisagra a la derecha) y el lecho que el láser talla. */
export type SlabProps = {
  x: number; y: number; w: number;
  flap?: number;   // 0..1 tapa levantada
  abl?: number;    // 0..1 tejido quitado (más en el centro)
  drape?: number;  // 0..1 la tapa se adapta al lecho nuevo
  beam?: number;   // 0..1 haz ultravioleta
  t: number;
  cutLine?: number; // 0..1 línea de corte (dibujándose)
  cutColor?: string;
};

const N = 48;
export const Slab: React.FC<SlabProps> = ({ x, y, w, flap = 0, abl = 0, drape = 0, beam = 0, t, cutLine = 0, cutColor = K.flow }) => {
  const k = 0.2 * w, T = 150, f = 40, depth = 46, edge = 0.78;
  const X = (u: number) => x + (u * w) / 2;
  const surf = (u: number) => y - k * (1 - u * u);
  const dip = (u: number) => (Math.abs(u) < 0.7 ? (1 - (u / 0.7) ** 2) : 0) * depth;
  const bed = (u: number) => surf(u) + f + abl * dip(u);
  const us = Array.from({ length: N + 1 }, (_, i) => -1 + (2 * i) / N);
  const inner = us.filter((u) => Math.abs(u) <= edge);
  // estroma: base + techo (lecho dentro de la tapa, superficie fuera)
  const top = us.map((u) => `${X(u)},${Math.abs(u) <= edge ? bed(u) : surf(u)}`);
  const bottom = us.slice().reverse().map((u) => `${X(u)},${surf(u) + T}`);
  const stroma = `M ${top.join(" L ")} L ${bottom.join(" L ")} Z`;
  // tapa: entre el lecho (original o el nuevo, según drape) y su cara externa
  const fl = (u: number) => surf(u) + f + abl * drape * dip(u);
  const flapUp = inner.map((u) => `${X(u)},${fl(u) - f}`);
  const flapDn = inner.slice().reverse().map((u) => `${X(u)},${fl(u)}`);
  const flapPath = `M ${flapUp.join(" L ")} L ${flapDn.join(" L ")} Z`;
  const hx = X(edge), hy = surf(edge);
  // tejido quitado (fantasma punteado)
  const gone = abl > 0.01 ? `M ${inner.map((u) => `${X(u)},${surf(u) + f}`).join(" L ")} L ${inner.slice().reverse().map((u) => `${X(u)},${bed(u)}`).join(" L ")} Z` : "";
  const pulse = 0.6 + 0.4 * Math.sin(t * 40);
  const cutPts = inner.filter((_, i) => i / (inner.length - 1) <= cutLine).map((u) => `${X(u)},${surf(u) + f}`);
  return (
    <g>
      <path d={stroma} fill={C.stroma2} stroke={C.case3} strokeWidth={4} />
      {/* fibras del estroma */}
      {[0.3, 0.55, 0.8].map((q, i) => (
        <path key={i} d={`M ${us.map((u) => `${X(u)},${surf(u) + f + 8 + (T - f - 8) * q}`).join(" L ")}`} fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.25} />
      ))}
      {gone && <path d={gone} fill="none" stroke={K.white} strokeWidth={3} strokeDasharray="8 8" opacity={0.7 * (1 - drape)} />}
      {/* periferia de la capa externa (sin cortar) */}
      {[[-1, -edge], [edge, 1]].map(([u0, u1], i) => {
        const s = us.filter((u) => u >= u0 - 1e-6 && u <= u1 + 1e-6);
        return <path key={i} d={`M ${s.map((u) => `${X(u)},${surf(u)}`).join(" L ")} L ${s.slice().reverse().map((u) => `${X(u)},${surf(u) + f}`).join(" L ")} Z`} fill={C.epi} stroke={C.case3} strokeWidth={3} />;
      })}
      {cutLine > 0.01 && cutPts.length > 1 && <path d={`M ${cutPts.join(" L ")}`} fill="none" stroke={cutColor} strokeWidth={6} strokeDasharray="4 8" strokeLinecap="round" />}
      {/* tapa con bisagra a la derecha */}
      <g transform={`rotate(${150 * flap} ${hx} ${hy})`}>
        <path d={flapPath} fill={C.epi} stroke={flap > 0.02 ? K.flow : C.case3} strokeWidth={flap > 0.02 ? 5 : 3} />
      </g>
      {/* haz ultravioleta */}
      {beam > 0.01 && (
        <g opacity={beam}>
          <polygon points={`${x - 26},${y - 330} ${x + 26},${y - 330} ${x + 120},${bed(0) - 4} ${x - 120},${bed(0) - 4}`} fill={C.uv} opacity={0.18 * pulse} />
          <polygon points={`${x - 10},${y - 330} ${x + 10},${y - 330} ${x + 60},${bed(0) - 4} ${x - 60},${bed(0) - 4}`} fill={C.uv} opacity={0.55 * pulse} />
          {Array.from({ length: 10 }, (_, i) => {
            const ph = (t * 1.6 + i * 0.137) % 1;
            const ux = Math.sin(i * 12.9898) * 0.5;
            return <circle key={i} cx={X(ux) + Math.sin(i * 3.1 + t * 3) * 24 * ph} cy={bed(ux) - 10 - 160 * ph} r={6 * (1 - ph) + 2} fill={K.white} opacity={(1 - ph) * 0.9} />;
          })}
        </g>
      )}
    </g>
  );
};
export const slabBed = (x: number, y: number, w: number, abl: number, u: number) => {
  const k = 0.2 * w, f = 40, depth = 46;
  const surf = y - k * (1 - u * u);
  const dip = (Math.abs(u) < 0.7 ? (1 - (u / 0.7) ** 2) : 0) * depth;
  return { x: x + (u * w) / 2, y: surf + f + abl * dip, surf };
};

/* ------------------------------------------------------------------ */
/* Cadena de moléculas que se rompe (fotoablación). */
export const Chain: React.FC<{ x: number; y: number; n?: number; gapW?: number; p: number; t: number }> = ({ x, y, n = 7, gapW = 86, p, t }) => {
  const x0 = x - ((n - 1) * gapW) / 2;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const brk = clamp(p * 1.4 - Math.abs(i - (n - 1) / 2) * 0.12);
        const dy = -70 * brk + 6 * Math.sin(t * 4 + i) * brk;
        const dx = (i - (n - 1) / 2) * 14 * brk;
        const cx = x0 + i * gapW + dx, cy = y + dy * (i % 2 ? 1 : 0.6);
        const next = i < n - 1 ? { cx: x0 + (i + 1) * gapW + (i + 1 - (n - 1) / 2) * 14 * brk, cy: y + (-70 * brk) * ((i + 1) % 2 ? 1 : 0.6) } : null;
        return (
          <g key={i}>
            {next && <line x1={cx} y1={cy} x2={next.cx} y2={next.cy} stroke={K.white} strokeWidth={8} strokeLinecap="round" opacity={1 - brk} />}
            <circle cx={cx} cy={cy} r={22} fill={i % 2 ? C.stroma : C.stroma2} stroke={C.ink} strokeWidth={4} />
          </g>
        );
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Ojo de frente con el seguidor (retícula). */
export const EyeFront: React.FC<{ x: number; y: number; w: number; gx: number; gy: number; tx: number; ty: number; lost?: number; t: number }> = ({ x, y, w, gx, gy, tx, ty, lost = 0, t }) => {
  const h = w * 0.46;
  const ir = h * 0.52;
  const px = x + gx, py = y + gy;
  const rx = x + tx, ry = y + ty;
  const col = lost > 0.5 ? K.warn : K.flow;
  const eyePath = `M ${x - w / 2} ${y} Q ${x} ${y - h * 1.35} ${x + w / 2} ${y} Q ${x} ${y + h * 1.35} ${x - w / 2} ${y} Z`;
  return (
    <g>
      <defs><clipPath id="eyeclip"><path d={eyePath} /></clipPath></defs>
      <path d={eyePath} fill={C.sclera} stroke={C.case3} strokeWidth={8} />
      <g clipPath="url(#eyeclip)">
        <circle cx={px} cy={py} r={ir} fill={C.iris} />
        <circle cx={px} cy={py} r={ir * 0.82} fill="none" stroke={K.cold} strokeWidth={6} opacity={0.6} />
        <circle cx={px} cy={py} r={ir * 0.42} fill={C.ink} />
        <circle cx={px - ir * 0.25} cy={py - ir * 0.28} r={ir * 0.12} fill={K.white} opacity={0.85} />
      </g>
      {/* retícula del seguidor */}
      <g opacity={0.95}>
        <circle cx={rx} cy={ry} r={ir * 1.15} fill="none" stroke={col} strokeWidth={5} strokeDasharray="18 12" transform={`rotate(${t * 60} ${rx} ${ry})`} />
        {[0, 90, 180, 270].map((a) => {
          const r0 = ir * 1.25, r1 = ir * 1.6, s = Math.sin((a * Math.PI) / 180), c = Math.cos((a * Math.PI) / 180);
          return <line key={a} x1={rx + c * r0} y1={ry + s * r0} x2={rx + c * r1} y2={ry + s * r1} stroke={col} strokeWidth={6} strokeLinecap="round" />;
        })}
        <circle cx={rx} cy={ry} r={7} fill={col} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Placa de circuito y hueso de pavo (curiosidad de 1981). */
export const Board: React.FC<{ x: number; y: number; p: number; t: number }> = ({ x, y, p, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-170} y={-120} width={340} height={240} rx={16} fill={C.case1} stroke={C.case3} strokeWidth={5} />
    {[-80, -20, 40].map((yy, i) => (
      <path key={i} d={`M -150 ${yy} H ${-40 + i * 20} V ${yy + 40} H 150`} fill="none" stroke={K.flow} strokeWidth={6} opacity={0.75} />
    ))}
    {[-110, 0, 110].map((xx) => <rect key={xx} x={xx - 22} y={-12} width={44} height={44} rx={6} fill={C.case2} stroke={C.ink} strokeWidth={3} />)}
    {/* surco grabado por el láser */}
    <line x1={-150} y1={92} x2={-150 + 300 * p} y2={92} stroke={K.cold} strokeWidth={8} strokeLinecap="round" />
    {p > 0.02 && p < 0.99 && <circle cx={-150 + 300 * p} cy={92} r={12 + 4 * Math.sin(t * 30)} fill={K.cold} opacity={0.9} />}
  </g>
);

export const Drumstick: React.FC<{ x: number; y: number; p: number; t: number }> = ({ x, y, p, t }) => (
  <g transform={`translate(${x} ${y}) rotate(-20)`}>
    {/* hueso */}
    <rect x={-150} y={-22} width={250} height={44} rx={22} fill={C.sclera} stroke={C.case3} strokeWidth={4} />
    <circle cx={-160} cy={-24} r={30} fill={C.sclera} stroke={C.case3} strokeWidth={4} />
    <circle cx={-160} cy={24} r={30} fill={C.sclera} stroke={C.case3} strokeWidth={4} />
    {/* cartílago en el extremo */}
    <ellipse cx={120} cy={0} rx={70} ry={62} fill="#CFE6F0" stroke={C.case3} strokeWidth={4} />
    {/* corte limpio */}
    <line x1={120} y1={-56} x2={120} y2={-56 + 112 * p} stroke={K.cold} strokeWidth={6} strokeLinecap="round" />
    {p > 0.02 && p < 0.99 && <circle cx={120} cy={-56 + 112 * p} r={10 + 3 * Math.sin(t * 30)} fill={K.cold} />}
  </g>
);

/* ------------------------------------------------------------------ */
/* Barra de tiempo: «operación: minutos» frente a «láser: segundos». */
export const TimeBars: React.FC<{ x: number; y: number; w: number; p1: number; p2: number }> = ({ x, y, w, p1, p2 }) => (
  <g>
    <rect x={x} y={y} width={w} height={70} rx={20} fill="rgba(255,255,255,0.08)" stroke={C.case3} strokeWidth={3} />
    <rect x={x} y={y} width={w * p1} height={70} rx={20} fill={C.case2} />
    <rect x={x} y={y + 200} width={w} height={70} rx={20} fill="rgba(255,255,255,0.08)" stroke={C.case3} strokeWidth={3} />
    <rect x={x} y={y + 200} width={Math.max(0, w * 0.04 * p2)} height={70} rx={14} fill={K.cold} style={{ filter: `drop-shadow(0 0 12px ${K.cold})` }} />
  </g>
);

/* Reloj sencillo. */
export const Clock: React.FC<{ x: number; y: number; r: number; t: number; speed?: number; color?: string }> = ({ x, y, r, t, speed = 1, color = K.white }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={C.case1} stroke={color} strokeWidth={6} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <line key={i} x1={Math.cos(a) * r * 0.78} y1={Math.sin(a) * r * 0.78} x2={Math.cos(a) * r * 0.9} y2={Math.sin(a) * r * 0.9} stroke={color} strokeWidth={4} />;
    })}
    <line x1={0} y1={0} x2={0} y2={-r * 0.72} stroke={color} strokeWidth={6} strokeLinecap="round" transform={`rotate(${t * 90 * speed})`} />
    <circle r={8} fill={color} />
  </g>
);

/* Barras de reparto del enfoque: córnea (2/3) + cristalino (1/3). */
export const FocusBar: React.FC<{ x: number; y: number; w: number; p: number }> = ({ x, y, w, p }) => (
  <g>
    <rect x={x} y={y} width={w} height={64} rx={18} fill="rgba(255,255,255,0.08)" stroke={C.case3} strokeWidth={3} />
    <rect x={x} y={y} width={(w * 2 / 3) * p} height={64} rx={18} fill={K.flow} />
    <rect x={x + (w * 2) / 3 + 6} y={y} width={Math.max(0, (w / 3 - 6) * p)} height={64} rx={18} fill={K.cold} opacity={0.8} />
  </g>
);
