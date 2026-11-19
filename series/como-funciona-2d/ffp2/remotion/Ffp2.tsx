// Dibujos SVG planos del episodio «Cómo filtra una mascarilla FFP2». Sin marcas. Personas como siluetas neutras.
// Código de color: cian = aire, beige = partículas, amarillo = lo importante / carga eléctrica, rojo = fuga / aire sin filtrar.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = {
  case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#0B1A30", sil: "#1C3557", silEdge: "#4A73A8",
  mask: "#E9EFF6", maskEdge: "#9FB3CC", fold: "#B9C7D8", melt: "#F4E3A8", fiber: "#DCE6F2", part: "#D9C29A", partEdge: "#8C7B62",
};

/** Pseudoaleatorio determinista. */
export const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Partícula (polvo / gotita) redonda. */
export const Part: React.FC<{ x: number; y: number; r?: number; o?: number; col?: string }> = ({ x, y, r = 10, o = 1, col = C.part }) =>
  o <= 0.01 ? null : <circle cx={x} cy={y} r={r} fill={col} stroke={C.partEdge} strokeWidth={Math.max(1.5, r * 0.18)} opacity={o} />;

const MASK_D = "M -320 -30 C -310 -170 -160 -215 0 -215 C 160 -215 310 -170 320 -30 C 312 110 170 215 0 225 C -170 215 -312 110 -320 -30 Z";

/** Fibras al azar dentro de un rectángulo (para la capa central fundida-soplada). */
const fiberLines = (n: number, w: number, h: number, seed = 1) =>
  Array.from({ length: n }).map((_, i) => {
    const x1 = (rnd(i * 3 + seed) - 0.5) * w, y1 = (rnd(i * 5 + seed + 7) - 0.5) * h;
    const a = rnd(i * 7 + seed + 3) * Math.PI;
    const L = 160 + rnd(i + seed + 11) * 260;
    return { x1, y1, x2: x1 + L * Math.cos(a), y2: y1 + L * Math.sin(a), c: (rnd(i + seed) - 0.5) * 120 };
  });

/** Mascarilla FFP2 plegada, vista de frente, centrada en (x, y) (≈640 px de ancho a s = 1).
 *  open 0-1: las capas se separan (exterior abajo-izquierda, central en medio, interior arriba-derecha).
 *  sieve 0-1: aparece la falsa idea de «colador» (agujeros). charge 0-1: cargas «+» amarillas en la capa central. valve: lleva válvula. */
export const Mask: React.FC<{ x: number; y: number; s?: number; t: number; open?: number; sieve?: number; charge?: number; valve?: boolean; o?: number; straps?: boolean; meltHi?: number }> =
  ({ x, y, s = 1, t, open = 0, sieve = 0, charge = 0, valve = false, o = 1, straps = true, meltHi = 0 }) => {
    const id = `mk${Math.round(x)}${Math.round(y)}${Math.round(s * 100)}`;
    const fl = fiberLines(46, 640, 440, 3);
    const dx = 190 * open, dy = 95 * open;
    const layer = (kind: "in" | "mid" | "out", ox: number, oy: number) => (
      <g transform={`translate(${ox} ${oy})`}>
        <path d={MASK_D} fill={kind === "mid" ? C.melt : kind === "in" ? "#CFDBE8" : C.mask} stroke={kind === "mid" && meltHi > 0.01 ? K.flow : C.maskEdge} strokeWidth={kind === "mid" ? 6 + 6 * meltHi : 6}
          opacity={kind === "out" ? 1 - 0.22 * open : 1} />
        {kind === "mid" && (
          <g clipPath={`url(#${id})`}>
            {fl.map((f, i) => <path key={i} d={`M ${f.x1} ${f.y1} Q ${(f.x1 + f.x2) / 2 + f.c} ${(f.y1 + f.y2) / 2 - f.c} ${f.x2} ${f.y2}`} fill="none" stroke="#B99A4E" strokeWidth={3} opacity={0.75} />)}
          </g>
        )}
        {kind !== "mid" && (
          <>
            <path d="M -312 -60 C -150 -95 150 -95 312 -60" fill="none" stroke={C.fold} strokeWidth={5} />
            <path d="M -300 70 C -150 40 150 40 300 70" fill="none" stroke={C.fold} strokeWidth={5} />
          </>
        )}
      </g>
    );
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
        <defs><clipPath id={id}><path d={MASK_D} /></clipPath></defs>
        {straps && open < 0.5 && (
          <g fill="none" stroke={C.case3} strokeWidth={10} opacity={1 - 2 * open}>
            <path d="M -316 -70 C -420 -110 -430 120 -300 80" />
            <path d="M 316 -70 C 420 -110 430 120 300 80" />
          </g>
        )}
        {open > 0.01 && layer("in", dx, -dy)}
        {open > 0.01 && layer("mid", 0, 0)}
        <g opacity={open > 0.01 ? 0.9 : 1}>{layer("out", -dx, dy)}</g>
        {charge > 0.01 && [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i / 8) * Math.PI * 2 + t * 0.4; const rx = 250, ry = 150;
          return <text key={i} x={rx * Math.cos(a)} y={ry * Math.sin(a) + 16} textAnchor="middle" fontSize={50} fontWeight={900} fill={K.flow} fontFamily="MontserratSerie" stroke={C.dark} strokeWidth={3} paintOrder="stroke" opacity={charge * (0.7 + 0.3 * Math.sin(t * 5 + i))}>+</text>;
        })}
        {/* clip de la nariz */}
        <rect x={-110 - dx} y={-200 + dy} width={220} height={18} rx={9} fill={C.case3} opacity={1 - 0.6 * open} />
        {valve && open < 0.01 && (
          <g transform="translate(170 90)">
            <circle r={62} fill={C.case2} stroke={C.case3} strokeWidth={6} />
            {[-30, -10, 10, 30].map((d) => <rect key={d} x={-40} y={d - 5} width={80} height={10} rx={5} fill={C.dark} />)}
          </g>
        )}
        {sieve > 0.01 && open < 0.5 && (
          <g clipPath={`url(#${id})`} opacity={sieve * (1 - 2 * open)}>
            {Array.from({ length: 70 }).map((_, i) => { const c = i % 10, r = Math.floor(i / 10); return <circle key={i} cx={-280 + c * 62 + (r % 2) * 31} cy={-180 + r * 62} r={17} fill={C.dark} stroke={C.case3} strokeWidth={3} />; })}
          </g>
        )}
      </g>
    );
  };

/** Silueta neutra de perfil mirando a la derecha, con mascarilla. Centro de la cabeza en (x, y).
 *  gap 0-1: la mascarilla queda holgada (separada de la cara). valve: válvula frontal. flip: mira a la izquierda (sin mascarilla si mask = false). */
export const Head: React.FC<{ x: number; y: number; s?: number; o?: number; gap?: number; valve?: boolean; flip?: boolean; mask?: boolean; hi?: number }> =
  ({ x, y, s = 1, o = 1, gap = 0, valve = false, flip = false, mask = true, hi = 0 }) => (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={o}>
      {/* cabeza de perfil mirando a la derecha */}
      <path d="M -40 -150 C -130 -150 -160 -80 -150 0 C -145 50 -120 80 -110 110 L -110 170 L 20 170 L 20 120 C 40 110 60 95 60 70 L 60 40 L 85 30 L 60 0 C 70 -90 30 -150 -40 -150 Z" fill={C.sil} stroke={C.silEdge} strokeWidth={6} />
      <path d="M 130 170 Q 60 140 0 160 L -200 160 Q -260 180 -270 260 L -270 330 L 160 330 L 160 260 Q 160 190 130 170 Z" fill={C.sil} stroke={C.silEdge} strokeWidth={6} />
      {mask && (
        <g transform={`translate(${26 * gap} 0) rotate(${-6 * gap} 70 60)`}>
          <path d="M -40 40 C -60 30 -60 0 -50 -5" fill="none" stroke={C.case3} strokeWidth={7} />
          <path d="M 40 -8 C 80 -14 115 20 118 62 C 120 105 90 135 40 140 C 30 100 30 30 40 -8 Z" fill={C.mask} stroke={hi > 0.01 ? K.flow : C.maskEdge} strokeWidth={6 + 4 * hi} />
          <path d="M 52 40 C 80 38 100 52 112 66" fill="none" stroke={C.fold} strokeWidth={4} />
          <line x1={-50} y1={-5} x2={42} y2={-6} stroke={C.case3} strokeWidth={7} />
          <line x1={-40} y1={40} x2={36} y2={110} stroke={C.case3} strokeWidth={7} />
          {valve && <g transform="translate(112 78)"><circle r={28} fill={C.case2} stroke={C.case3} strokeWidth={5} />{[-10, 0, 10].map((d) => <rect key={d} x={-16} y={d - 3} width={32} height={6} rx={3} fill={C.dark} />)}</g>}
        </g>
      )}
    </g>
  );

/** Líneas de corriente alrededor de un cilindro (fibra) de radio R centrado en (0, 0): flujo de izquierda a derecha. Devuelve y(x) para la línea de valor psi. */
export const streamY = (psi: number, x: number, R: number) => {
  // y (1 - R²/(x²+y²)) = psi, rama superior (psi > 0) o inferior (psi < 0)
  const sg = psi >= 0 ? 1 : -1; const p = Math.abs(psi);
  let lo = 0, hi = p + 3 * R;
  for (let k = 0; k < 40; k++) {
    const m = (lo + hi) / 2; const r2 = x * x + m * m;
    const f = r2 < R * R ? -1 : m * (1 - (R * R) / r2) - p;
    if (f > 0) hi = m; else lo = m;
  }
  return sg * Math.max(hi, Math.sqrt(Math.max(0, R * R - x * x)) + 0.5);
};

/** Escena ampliada de una fibra con el aire rodeándola. mode: mecanismo que se ilustra. Centro (x, y). p: avance 0-1 de la partícula protagonista. */
export const FiberZoom: React.FC<{ x: number; y: number; t: number; mode: "impact" | "intercept" | "diffuse" | "electro"; p: number; charge?: number; hi?: number; o?: number }> =
  ({ x, y, t, mode, p, charge = 0, hi = 0, o = 1 }) => {
    const R = 95, W = 900, H = 640;
    const id = `fz${mode}`;
    const xs = Array.from({ length: 61 }).map((_, i) => -W / 2 + (W * i) / 60);
    const psis = [-250, -175, -110, -55, -18, 18, 55, 110, 175, 250];
    const line = (psi: number) => xs.map((xx) => `${xx},${streamY(psi, xx, R)}`).join(" ");
    // trayectoria de la protagonista
    let px = 0, py = 0, pr = 12; const trail: [number, number][] = [];
    const x0 = -W / 2 - 20;
    if (mode === "impact") {
      pr = 30; const y0 = -30; const xh = -Math.sqrt((R + pr) ** 2 - y0 * y0);
      const xx = x0 + (xh - x0) * Math.min(1, p); px = xx; py = y0;
      for (let k = 0; k <= 20; k++) trail.push([x0 + (px - x0) * (k / 20), y0]);
    } else if (mode === "intercept") {
      pr = 16; const yc = R + pr; const psi = yc - (R * R) / yc;
      const xx = x0 + (0 - x0) * Math.min(1, p); px = xx; py = -streamY(psi, xx, R);
      for (let k = 0; k <= 30; k++) { const q = x0 + (px - x0) * (k / 30); trail.push([q, -streamY(psi, q, R)]); }
    } else if (mode === "diffuse") {
      pr = 8; const n = 46; const end = Math.max(1, Math.round(Math.min(1, p) * n));
      // camino en zigzag que acaba tocando la fibra por arriba a la izquierda
      const tx = -(R + pr) * Math.cos(0.9), ty = -(R + pr) * Math.sin(0.9);
      for (let k = 0; k <= end; k++) {
        const u = k / n; const bx = x0 + (tx - x0) * u; const by = -150 + (ty + 150) * u * u;
        const j = k === n ? 0 : 1;
        trail.push([bx + j * (rnd(k + 1) - 0.5) * 70, by + j * (rnd(k + 41) - 0.5) * 90 * (1 - u * 0.6)]);
      }
      [px, py] = trail[trail.length - 1];
    } else {
      pr = 13; const psi = 150; const ang = -1.95; const cx = (R + pr) * Math.cos(ang), cy = (R + pr) * Math.sin(ang);
      const N = 30;
      for (let k = 0; k <= Math.round(N * Math.min(1, p)); k++) {
        const u = k / N; const xx = x0 + (cx - x0) * u; const yl = -streamY(psi, xx, R);
        const b = Math.pow(Math.max(0, (u - 0.45) / 0.55), 1.6);
        trail.push([xx, yl + (cy - yl) * b]);
      }
      [px, py] = trail[trail.length - 1];
    }
    const stuck = p >= 1;
    // otras partículas que ya se quedaron pegadas (acumuladas)
    const old: [number, number, number][] = mode === "impact" ? [[-2.9, 26, 0], [3.4, 22, 0]] : mode === "intercept" ? [[-1.9, 14, 0], [2.0, 15, 0]] : mode === "diffuse" ? [[-2.6, 7, 0], [2.2, 8, 0], [-0.4, 7, 0], [1.2, 7, 0]] : [[-2.2, 12, 0], [-0.6, 12, 0], [2.4, 12, 0], [1.4, 12, 0]];
    return (
      <g transform={`translate(${x} ${y})`} opacity={o}>
        <defs><clipPath id={id}><rect x={-W / 2} y={-H / 2} width={W} height={H} rx={44} /></clipPath></defs>
        <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={44} fill="rgba(6,16,31,0.55)" stroke={C.case2} strokeWidth={5} />
        <g clipPath={`url(#${id})`}>
          {/* corrientes de aire */}
          {psis.map((ps, i) => (
            <polyline key={i} points={line(ps)} fill="none" stroke={K.cold} strokeWidth={4} strokeDasharray="18 16" strokeDashoffset={-t * 90} opacity={0.5} />
          ))}
          {/* fibras vecinas (cortes) para sugerir la maraña */}
          {[[-360, -250, 55], [380, 240, 65], [-330, 260, 45], [360, -260, 50]].map(([fx, fy, fr], i) => <circle key={i} cx={fx} cy={fy} r={fr} fill={C.fiber} opacity={0.25} />)}
          {/* fibra central (corte) */}
          <circle cx={0} cy={0} r={R} fill={C.melt} stroke={hi > 0.01 ? K.flow : "#B99A4E"} strokeWidth={6 + 6 * hi} />
          {charge > 0.01 && [0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2 + 0.3; return <text key={i} x={(R - 34) * Math.cos(a)} y={(R - 34) * Math.sin(a) + 14} textAnchor="middle" fontSize={40} fontWeight={900} fill="#8A6A10" fontFamily="MontserratSerie" opacity={charge}>+</text>; })}
          {charge > 0.01 && <circle cx={0} cy={0} r={R + 22 + 6 * Math.sin(t * 6)} fill="none" stroke={K.flow} strokeWidth={4} strokeDasharray="6 12" opacity={0.7 * charge} />}
          {old.map(([a, r], i) => <Part key={i} x={(R + r) * Math.cos(a)} y={(R + r) * Math.sin(a)} r={r} o={0.85} />)}
          {/* estela y protagonista */}
          {trail.length > 1 && <polyline points={trail.map((q) => q.join(",")).join(" ")} fill="none" stroke={K.white} strokeWidth={mode === "diffuse" ? 3 : 4} strokeDasharray={mode === "diffuse" ? "none" : "4 10"} opacity={0.55} />}
          <Part x={px} y={py} r={pr} />
          {stuck && <circle cx={px} cy={py} r={pr + 10 + 4 * Math.sin(t * 8)} fill="none" stroke={K.flow} strokeWidth={4} />}
        </g>
      </g>
    );
  };

/** Lupa sobre la maraña de fibras: los huecos son más grandes que las partículas, que se quedan pegadas a las fibras. */
export const FiberMesh: React.FC<{ x: number; y: number; r?: number; t: number; catchP?: number; gapHi?: number }> = ({ x, y, r = 330, t, catchP = 1, gapHi = 0 }) => {
  // fibras que cruzan la lupa: rectas por un punto interior con ángulo al azar
  const fl = Array.from({ length: 13 }).map((_, i) => {
    const cx = (rnd(i * 3 + 9) - 0.5) * r * 1.4, cy = (rnd(i * 5 + 17) - 0.5) * r * 1.4, a = rnd(i * 7 + 2) * Math.PI, L = r * 2.2;
    return { x1: cx - L * Math.cos(a), y1: cy - L * Math.sin(a), x2: cx + L * Math.cos(a), y2: cy + L * Math.sin(a) };
  });
  const id = "fmesh";
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs><clipPath id={id}><circle r={r} /></clipPath></defs>
      <circle r={r} fill="rgba(6,16,31,0.7)" stroke={C.case3} strokeWidth={10} />
      <g clipPath={`url(#${id})`}>
        {fl.map((f, i) => <path key={i} d={`M ${f.x1} ${f.y1} L ${f.x2} ${f.y2}`} stroke={C.melt} strokeWidth={14} strokeLinecap="round" opacity={0.9} />)}
        {/* partículas que llegan y se pegan a las fibras */}
        {Array.from({ length: 12 }).map((_, i) => {
          const u = Math.min(1, ((t * 0.35 + i / 12) % 1) * 1.6);
          const k = i < Math.round(12 * catchP) ? 1 : 0;
          const f = fl[i % fl.length];
          const q = 0.35 + 0.3 * rnd(i + 3); const tx = f.x1 + (f.x2 - f.x1) * q, ty = f.y1 + (f.y2 - f.y1) * q - 12;
          const sx = -r - 20, sy = (rnd(i + 70) - 0.5) * r * 1.6;
          const xx = k ? sx + (tx - sx) * u : sx + (r * 2.4) * u, yy = k ? sy + (ty - sy) * u : sy;
          return <Part key={i} x={xx} y={yy} r={7 + 3 * rnd(i)} o={Math.min(1, u * 5)} />;
        })}
      </g>
      {/* mango de la lupa */}
      <line x1={r * 0.72} y1={r * 0.72} x2={r * 1.0} y2={r * 1.0} stroke={C.case3} strokeWidth={30} strokeLinecap="round" />
      {gapHi > 0.01 && (
        <g opacity={gapHi}>
          <circle cx={-40} cy={-40} r={70} fill="none" stroke={K.flow} strokeWidth={6} strokeDasharray="12 10" />
        </g>
      )}
    </g>
  );
};

/** Gráfica «cuánto se escapa según el tamaño»: campana con máximo en ≈0,3 µm. Ejes de x0..x1 e y0 (arriba) ..y1 (abajo). draw 0-1 dibuja la curva. */
export const MppsChart: React.FC<{ x0: number; x1: number; y0: number; y1: number; draw: number; peak: number }> = ({ x0, x1, y0, y1, draw, peak }) => {
  const lx = (d: number) => x0 + ((Math.log10(d) + 2) / 3) * (x1 - x0); // 0,01 → 10 µm
  const f = (l: number) => Math.exp(-((l + 0.52) ** 2) / (2 * 0.42 ** 2));
  const pts: [number, number][] = Array.from({ length: 81 }).map((_, i) => { const l = -2 + (3 * i) / 80; return [x0 + ((l + 2) / 3) * (x1 - x0), y1 - (y1 - y0 - 30) * (0.04 + 0.92 * f(l))]; });
  const n = Math.max(2, Math.round(pts.length * draw));
  const pp = pts.slice(0, n);
  const px = lx(0.3), py = y1 - (y1 - y0 - 30) * 0.96;
  return (
    <g>
      <line x1={x0} y1={y1} x2={x1 + 10} y2={y1} stroke={C.case3} strokeWidth={5} />
      <line x1={x0} y1={y1} x2={x0} y2={y0 - 10} stroke={C.case3} strokeWidth={5} />
      {[0.01, 0.1, 1, 10].map((d) => <g key={d}><line x1={lx(d)} y1={y1} x2={lx(d)} y2={y1 + 14} stroke={C.case3} strokeWidth={4} /></g>)}
      <polygon points={`${pp[0][0]},${y1} ${pp.map((q) => q.join(",")).join(" ")} ${pp[pp.length - 1][0]},${y1}`} fill={K.warn} opacity={0.18} />
      <polyline points={pp.map((q) => q.join(",")).join(" ")} fill="none" stroke={K.warn} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
      {peak > 0.01 && (
        <g opacity={peak}>
          <line x1={px} y1={py} x2={px} y2={y1} stroke={K.flow} strokeWidth={4} strokeDasharray="10 8" />
          <circle cx={px} cy={py} r={14 + 3 * peak} fill={K.flow} />
        </g>
      )}
    </g>
  );
};

/** Cuadrícula de 100 partículas que llegan a una capa filtrante vertical: k se quedan, el resto pasa. p 0-1: avance. */
export const Hundred: React.FC<{ xBar: number; y: number; p: number; kept?: number; t: number }> = ({ xBar, y, p, kept = 94, t }) => {
  const pass = new Set([7, 23, 41, 58, 76, 92].slice(0, 100 - kept));
  return (
    <g>
      <rect x={xBar - 34} y={y - 300} width={68} height={600} rx={20} fill={C.melt} stroke="#B99A4E" strokeWidth={5} />
      {fiberLines(14, 60, 580, 21).map((f, i) => <line key={i} x1={xBar + f.x1 * 0.5} y1={y + f.y1} x2={xBar + (f.x1 + (f.x2 - f.x1) * 0.15) * 0.5} y2={y + f.y1 + (f.y2 - f.y1) * 0.6} stroke="#B99A4E" strokeWidth={3} />)}
      {Array.from({ length: 100 }).map((_, i) => {
        const c = i % 10, r = Math.floor(i / 10);
        const sx = 110 + c * 34, sy = y - 250 + r * 54 + 6 * Math.sin(t * 2 + i);
        const ok = pass.has(i);
        const u = Math.min(1, Math.max(0, p * 1.4 - c * 0.04));
        const ex = ok ? 880 - 40 * rnd(i) : xBar - 50 - 30 * Math.floor(rnd(i + 5) * 4), ey = ok ? sy : y - 270 + r * 58 + (c % 3) * 8;
        const xx = sx + (ex - sx) * u, yy = sy + (ey - sy) * u;
        return <Part key={i} x={xx} y={yy} r={11} col={ok ? K.warn : C.part} />;
      })}
    </g>
  );
};

/** Grifo con chorro de agua y burbujas de jabón. Boca del grifo en (x, y). */
export const Tap: React.FC<{ x: number; y: number; t: number; flow?: number }> = ({ x, y, t, flow = 1 }) => (
  <g>
    <path d={`M ${x - 200} ${y - 120} L ${x - 40} ${y - 120} Q ${x + 10} ${y - 120} ${x + 10} ${y - 70} L ${x + 10} ${y - 20}`} fill="none" stroke={C.case3} strokeWidth={46} strokeLinecap="round" />
    <rect x={x - 26} y={y - 30} width={72} height={34} rx={8} fill={C.case2} />
    {flow > 0.01 && <rect x={x - 8} y={y + 4} width={36} height={300} rx={14} fill={K.cold} opacity={0.55 * flow} />}
    {flow > 0.01 && [0, 1, 2, 3, 4, 5].map((i) => { const u = (t * 1.2 + i / 6) % 1; return <ellipse key={i} cx={x + 10 + 6 * Math.sin(i)} cy={y + 10 + 290 * u} rx={10} ry={16} fill={K.cold} opacity={flow * 0.9} />; })}
  </g>
);

/** Burbujas de jabón que suben. */
export const Bubbles: React.FC<{ x: number; y: number; w: number; t: number; o?: number }> = ({ x, y, w, t, o = 1 }) => (
  <g opacity={o}>
    {Array.from({ length: 10 }).map((_, i) => { const u = (t * 0.4 + rnd(i) ) % 1; return <circle key={i} cx={x + (rnd(i + 4) - 0.5) * w + 14 * Math.sin(t * 2 + i)} cy={y - 260 * u} r={10 + 14 * rnd(i + 8)} fill="none" stroke={K.white} strokeWidth={4} opacity={Math.sin(Math.PI * u)} />; })}
  </g>
);

/** Colador de cocina (lo que «todos creen»): cuenco con agujeros. */
export const Colander: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -170 -40 L 170 -40 C 165 90 90 150 0 150 C -90 150 -165 90 -170 -40 Z" fill={C.case2} stroke={C.case3} strokeWidth={6} />
    <rect x={-190} y={-56} width={380} height={24} rx={12} fill={C.case3} />
    <rect x={180} y={-52} width={130} height={18} rx={9} fill={C.case3} />
    {[[-110, 10], [-55, 10], [0, 10], [55, 10], [110, 10], [-80, 60], [-25, 60], [30, 60], [85, 60], [-40, 105], [15, 105], [60, 105]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={12} fill={C.dark} />)}
  </g>
);
