// Dibujos SVG planos del episodio «Cómo funciona un purificador de aire (filtro HEPA)». Sin marcas.
// Código de color: cian = aire limpio, beige = partículas de polvo, amarillo = lo importante, rojo = lo que se escapa / error,
// lila = moléculas de olor (gases), grises azulados = carcasa.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = {
  case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#0B1A30", deep: "#071224",
  part: "#D9C29A", partEdge: "#8C7B62", hepa: "#EEF2F7", pleat: "#B9C7D8", fiber: "#E6ECF4",
  mesh: "#7F95B3", carbon: "#232A33", carbonEdge: "#4A5666", odor: "#C792EA", hair: "#C9A27A",
};

/** Pseudoaleatorio determinista. */
export const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const cl = (x: number) => Math.max(0, Math.min(1, x));

/** Partícula de polvo redonda. */
export const Part: React.FC<{ x: number; y: number; r?: number; o?: number; col?: string }> = ({ x, y, r = 10, o = 1, col = C.part }) =>
  o <= 0.01 ? null : <circle cx={x} cy={y} r={r} fill={col} stroke={C.partEdge} strokeWidth={Math.max(1.5, r * 0.18)} opacity={o} />;

/** Molécula de olor (tres bolitas unidas). */
export const Molecule: React.FC<{ x: number; y: number; a?: number; s?: number; o?: number }> = ({ x, y, a = 0, s = 1, o = 1 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`} opacity={o}>
    <line x1={-16} y1={6} x2={0} y2={-6} stroke={C.odor} strokeWidth={5} /><line x1={0} y1={-6} x2={16} y2={6} stroke={C.odor} strokeWidth={5} />
    <circle cx={-16} cy={6} r={8} fill={C.odor} /><circle cx={0} cy={-6} r={10} fill={C.odor} /><circle cx={16} cy={6} r={8} fill={C.odor} />
  </g>
);

/** Aspas de ventilador que giran, centradas en (x, y). */
export const Fan: React.FC<{ x: number; y: number; r: number; t: number; speed?: number; hi?: number }> = ({ x, y, r, t, speed = 4, hi = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={C.deep} stroke={hi > 0.01 ? K.flow : C.case1} strokeWidth={6 + 6 * hi} />
    <g transform={`rotate(${(t * speed * 57.3) % 360})`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} transform={`rotate(${i * 72})`} d={`M 0 0 C ${r * 0.25} ${-r * 0.2} ${r * 0.55} ${-r * 0.55} ${r * 0.2} ${-r * 0.9} C ${-r * 0.05} ${-r * 0.7} ${-r * 0.12} ${-r * 0.3} 0 0 Z`} fill={C.case3} opacity={0.9} />
      ))}
    </g>
    <circle r={r * 0.16} fill={C.case2} stroke={C.case3} strokeWidth={4} />
  </g>
);

/** Banda de filtro plegado (zigzag) entre x0 y x1, centrada en y, alto h. folds: número de pliegues. */
const pleatPath = (x0: number, x1: number, y: number, h: number, folds: number, amp = 1) => {
  const pts: string[] = [];
  for (let i = 0; i <= folds * 2; i++) { const xx = x0 + ((x1 - x0) * i) / (folds * 2); pts.push(`${xx},${y + (i % 2 === 0 ? -h / 2 : h / 2) * amp}`); }
  return pts.join(" ");
};

/** Purificador de torre visto de frente, centrado en (x, y) (≈380 × 700 px a s = 1).
 *  open 0-1: la tapa frontal se desliza y deja ver el corte interior: entrada abajo → prefiltro → HEPA plegado → carbón → ventilador → salida arriba.
 *  sieve 0-1: aparecen los «agujeros» de colador que todos imaginan. hi*: resalta cada pieza. flow: aire y partículas en movimiento. */
export const Purifier: React.FC<{ x: number; y: number; s?: number; t: number; open?: number; sieve?: number; flow?: number;
  hiPre?: number; hiHepa?: number; hiCarbon?: number; hiFan?: number; o?: number; dirty?: number; blocked?: number }> =
  ({ x, y, s = 1, t, open = 0, sieve = 0, flow = 1, hiPre = 0, hiHepa = 0, hiCarbon = 0, hiFan = 0, o = 1, dirty = 0, blocked = 0 }) => {
    const id = `pu${Math.round(x)}${Math.round(y)}${Math.round(s * 100)}`;
    const N = 16;
    const air = flow * (1 - 0.85 * blocked);
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
        <defs><clipPath id={id}><rect x={-170} y={-120} width={340} height={450} rx={24} /></clipPath></defs>
        {/* sombra */}
        <ellipse cx={0} cy={365} rx={210} ry={22} fill="#000" opacity={0.25} />
        {/* cuerpo */}
        <rect x={-190} y={-350} width={380} height={700} rx={44} fill={C.case2} stroke={C.case1} strokeWidth={8} />
        {/* salida de arriba: rejilla */}
        <rect x={-150} y={-338} width={300} height={44} rx={14} fill={C.deep} />
        {[-120, -80, -40, 0, 40, 80, 120].map((d) => <line key={d} x1={d} y1={-332} x2={d} y2={-300} stroke={C.case3} strokeWidth={6} strokeLinecap="round" />)}
        {/* ventilador (siempre visible por su ventana) */}
        <Fan x={0} y={-205} r={78} t={t} speed={4 + 4 * air} hi={hiFan} />
        {/* interior en corte (se ve al abrir) */}
        <rect x={-170} y={-120} width={340} height={450} rx={24} fill={C.deep} />
        <g clipPath={`url(#${id})`}>
          {/* carbón activo: banda oscura de gránulos */}
          <rect x={-170} y={-110} width={340} height={80} fill={C.carbon} stroke={hiCarbon > 0.01 ? K.flow : C.carbonEdge} strokeWidth={4 + 6 * hiCarbon} />
          {Array.from({ length: 34 }).map((_, i) => <circle key={i} cx={-160 + (i % 17) * 20 + (Math.floor(i / 17) % 2) * 10} cy={-88 + Math.floor(i / 17) * 34} r={9} fill="#39424F" />)}
          {/* HEPA: banda plegada */}
          <rect x={-170} y={-10} width={340} height={150} fill="#1A2C46" />
          <polyline points={pleatPath(-165, 165, 65, 130, 9)} fill="none" stroke={hiHepa > 0.01 ? K.flow : C.hepa} strokeWidth={9 + 4 * hiHepa} strokeLinejoin="round"
            style={dirty > 0 ? { stroke: `rgb(${238 - 120 * dirty},${242 - 125 * dirty},${247 - 140 * dirty})` } : undefined} />
          {/* prefiltro: malla */}
          <rect x={-170} y={170} width={340} height={34} fill={C.dark} stroke={hiPre > 0.01 ? K.flow : C.mesh} strokeWidth={4 + 6 * hiPre} />
          {Array.from({ length: 17 }).map((_, i) => <line key={i} x1={-160 + i * 20} y1={172} x2={-160 + i * 20} y2={202} stroke={C.mesh} strokeWidth={3} />)}
          <line x1={-170} y1={187} x2={170} y2={187} stroke={C.mesh} strokeWidth={3} />
          {/* aire subiendo dentro */}
          {open > 0.2 && Array.from({ length: N }).map((_, i) => {
            const u = (t * 0.32 + i / N) % 1; const yy = 320 - 680 * u; const xx = (rnd(i) - 0.5) * 280 + 10 * Math.sin(t * 3 + i);
            const big = i % 3 === 0;
            const lim = big ? 175 : -5; // la grande se queda en el prefiltro, el resto en el HEPA
            if (yy > lim) return <Part key={i} x={xx} y={yy} r={big ? 13 : 6} o={air * cl(open * 2 - 0.4)} />;
            if (yy < -125) return <circle key={i} cx={xx * 0.6} cy={yy} r={7} fill={K.cold} opacity={air * cl(open * 2 - 0.4)} />;
            return null;
          })}
          {/* polvo atrapado */}
          {open > 0.2 && [[-120, 160, 13], [-40, 162, 12], [70, 160, 13], [130, 163, 11]].map(([a, b, r], i) => <Part key={i} x={a} y={b} r={r} o={cl(open * 2 - 0.4)} />)}
        </g>
        {/* entradas laterales */}
        {[-1, 1].map((sd) => <g key={sd}>{[230, 255, 280, 305].map((yy) => <line key={yy} x1={sd * 176} y1={yy} x2={sd * 186} y2={yy} stroke={C.deep} strokeWidth={8} strokeLinecap="round" />)}</g>)}
        {/* polvo que entra por los lados y aire limpio que sale por arriba */}
        {Array.from({ length: 8 }).map((_, i) => {
          const sd = i % 2 === 0 ? -1 : 1; const u = (t * 0.45 + i / 8) % 1;
          return <Part key={`in${i}`} x={sd * (330 - 140 * u)} y={265 + 30 * Math.sin(i * 2.1) + 8 * Math.sin(t * 4 + i)} r={7 + 5 * rnd(i)} o={air * Math.sin(Math.PI * u)} />;
        })}
        {Array.from({ length: 6 }).map((_, i) => {
          const u = (t * 0.6 + i / 6) % 1; const xx = -110 + 44 * i + 12 * Math.sin(t * 2 + i);
          return <path key={`out${i}`} d={`M ${xx} ${-360 - 120 * u} q 12 -22 0 -44`} fill="none" stroke={K.cold} strokeWidth={7} strokeLinecap="round" opacity={air * Math.sin(Math.PI * u)} />;
        })}
        {/* tapa frontal: se desliza hacia la izquierda y se va */}
        {open < 0.99 && (
          <g transform={`translate(${-300 * open} ${40 * open}) rotate(${-8 * open})`} opacity={1 - open}>
            <rect x={-176} y={-128} width={352} height={466} rx={28} fill={C.case2} stroke={C.case3} strokeWidth={5} />
            {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={-130} y={-80 + i * 44} width={260} height={14} rx={7} fill={C.case1} />)}
            <circle cx={0} cy={-100} r={8} fill={K.cold} opacity={0.6 + 0.4 * Math.sin(t * 3)} />
            {sieve > 0.01 && Array.from({ length: 42 }).map((_, i) => {
              const c = i % 6, r = Math.floor(i / 6);
              return <circle key={i} cx={-125 + c * 50 + (r % 2) * 25} cy={-60 + r * 56} r={16} fill={C.deep} stroke={C.case3} strokeWidth={3} opacity={sieve} />;
            })}
          </g>
        )}
      </g>
    );
  };

/** Lupa con fibras cortadas (círculos) muy separadas: los huecos son más grandes que las partículas, que acaban pegadas a ellas. */
export const GapView: React.FC<{ x: number; y: number; r?: number; t: number; catchP?: number; gapHi?: number }> = ({ x, y, r = 300, t, catchP = 1, gapHi = 0 }) => {
  const fib = [[-170, -150], [60, -190], [210, -40], [-60, 10], [-200, 140], [90, 170], [230, 230], [-20, -320], [320, 120], [-320, -10]];
  const R = 34;
  const id = "gapv";
  const nStuck = Math.round(14 * catchP);
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs><clipPath id={id}><circle r={r} /></clipPath></defs>
      <circle r={r} fill="rgba(6,16,31,0.75)" stroke={C.case3} strokeWidth={10} />
      <g clipPath={`url(#${id})`}>
        {/* aire que pasa */}
        {[-220, -110, 0, 110, 220].map((yy, i) => <path key={i} d={`M ${-r} ${yy} C ${-r / 2} ${yy - 30} ${r / 2} ${yy + 30} ${r} ${yy}`} fill="none" stroke={K.cold} strokeWidth={4} strokeDasharray="16 16" strokeDashoffset={-t * 80} opacity={0.4} />)}
        {fib.map(([fx, fy], i) => <circle key={i} cx={fx} cy={fy} r={R} fill={C.fiber} stroke={C.pleat} strokeWidth={4} />)}
        {/* partículas ya pegadas */}
        {Array.from({ length: nStuck }).map((_, i) => { const f = fib[i % fib.length]; const a = rnd(i + 30) * 6.28; return <Part key={i} x={f[0] + (R + 8) * Math.cos(a)} y={f[1] + (R + 8) * Math.sin(a)} r={8} />; })}
        {/* partículas en camino: van hacia una fibra y se pegan */}
        {Array.from({ length: 7 }).map((_, i) => {
          const f = fib[(i * 3) % fib.length]; const a = Math.PI + (rnd(i + 5) - 0.5) * 1.6;
          const tx = f[0] + (R + 8) * Math.cos(a), ty = f[1] + (R + 8) * Math.sin(a);
          const sx = -r - 20, sy = ty + (rnd(i + 9) - 0.5) * 120;
          const k = (t * 0.4 + i / 7) % 1; const u = cl(k * 1.4);
          return <Part key={`m${i}`} x={sx + (tx - sx) * u} y={sy + (ty - sy) * u + 14 * Math.sin(u * 9)} r={8} o={Math.min(1, k * 6) * (k > 0.9 ? (1 - k) * 10 : 1)} />;
        })}
      </g>
      {/* mango de la lupa */}
      <line x1={r * 0.72} y1={r * 0.72} x2={r * 0.98} y2={r * 0.98} stroke={C.case3} strokeWidth={30} strokeLinecap="round" />
      {gapHi > 0.01 && (
        <g opacity={gapHi}>
          {/* hueco entre dos fibras: flecha doble */}
          <line x1={-60 + R} y1={10} x2={210 - R} y2={-40} stroke={K.flow} strokeWidth={6} />
          <circle cx={-60 + R} cy={10} r={8} fill={K.flow} /><circle cx={210 - R} cy={-40} r={8} fill={K.flow} />
          <Part x={75} y={-40} r={8} />
        </g>
      )}
    </g>
  );
};

/** Habitación en planta con el purificador: el aire da vueltas, entra sucio por abajo y sale limpio por arriba. */
export const Room: React.FC<{ x: number; y: number; t: number; w?: number; h?: number; hiIn?: number; hiOut?: number }> = ({ x, y, t, w = 820, h = 640, hiIn = 0, hiOut = 0 }) => {
  const N = 22;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} fill="rgba(6,16,31,0.5)" stroke={C.case3} strokeWidth={8} />
      {/* ventana y sofá (decorado) */}
      <rect x={-w / 2 + 60} y={-h / 2 - 8} width={180} height={16} rx={6} fill={K.cold} opacity={0.6} />
      <rect x={w / 2 - 250} y={h / 2 - 120} width={200} height={80} rx={20} fill={C.case1} stroke={C.case2} strokeWidth={5} />
      {/* bucle de aire */}
      {Array.from({ length: N }).map((_, i) => {
        const u = (t * 0.12 + i / N) % 1; const a = -Math.PI / 2 + u * Math.PI * 2;
        const px = (w / 2 - 110) * Math.cos(a) * (0.75 + 0.2 * rnd(i)), py = (h / 2 - 90) * Math.sin(a) * (0.75 + 0.2 * rnd(i + 3));
        const clean = u < 0.5; // recién salido del purificador
        return clean ? <circle key={i} cx={px} cy={py} r={9} fill={K.cold} opacity={0.4 + 0.5 * hiOut} /> : <Part key={i} x={px} y={py} r={9} o={0.5 + 0.5 * hiIn} />;
      })}
      <Purifier x={0} y={30} s={0.36} t={t} />
    </g>
  );
};

/** Prefiltro de lado: una malla vertical; pelos, pelusas y polvo gordo se quedan; lo fino pasa. */
export const PreMesh: React.FC<{ x: number; y: number; t: number; hair?: number; lint?: number; dust?: number; fine?: number }> = ({ x, y, t, hair = 1, lint = 1, dust = 1, fine = 1 }) => {
  const H = 640;
  const stuck = (p: number, x0: number, y0: number) => ({ xx: x0 - 40 - 320 * (1 - p), yy: y0 });
  const loop = (k: number) => cl(((t * 0.35 + k) % 1) * 1.5);
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* corriente de aire */}
      {[-240, -120, 0, 120, 240].map((yy, i) => <line key={i} x1={-440} y1={yy} x2={420} y2={yy} stroke={K.cold} strokeWidth={4} strokeDasharray="18 18" strokeDashoffset={-t * 90} opacity={0.35} />)}
      {/* malla */}
      <rect x={-22} y={-H / 2} width={44} height={H} rx={12} fill={C.dark} stroke={C.mesh} strokeWidth={5} />
      {Array.from({ length: 21 }).map((_, i) => <rect key={i} x={-22} y={-H / 2 + 14 + i * 30} width={44} height={10} fill={C.mesh} />)}
      {/* pelo rizado */}
      {[0, 1].map((k) => { const p = loop(k * 0.5) * hair; const s = stuck(p, 0, -200 + k * 90);
        return <path key={`h${k}`} d={`M ${s.xx} ${s.yy - 60} c 40 20 -40 40 0 60 s -40 40 0 60`} fill="none" stroke={C.hair} strokeWidth={7} strokeLinecap="round" opacity={hair} />; })}
      {/* pelusa (bola deshilachada) */}
      {[0].map((k) => { const p = loop(0.3) * lint; const s = stuck(p, 0, 40);
        return <g key={`l${k}`} opacity={lint} transform={`translate(${s.xx - 20} ${s.yy})`}>
          {Array.from({ length: 10 }).map((_, j) => <line key={j} x1={0} y1={0} x2={44 * Math.cos(j * 0.63)} y2={44 * Math.sin(j * 0.63)} stroke="#D7DEE8" strokeWidth={5} strokeLinecap="round" />)}
          <circle r={24} fill="#D7DEE8" /></g>; })}
      {/* polvo gordo */}
      {[0, 1, 2].map((k) => { const p = loop(0.15 + k * 0.33) * dust; const s = stuck(p, 0, 170 + k * 50);
        return <Part key={`d${k}`} x={s.xx + 10} y={s.yy} r={22} o={dust} />; })}
      {/* lo fino pasa por la malla */}
      {Array.from({ length: 6 }).map((_, k) => { const u = (t * 0.5 + k / 6) % 1;
        return <Part key={`f${k}`} x={-420 + 840 * u} y={-H / 2 + 19 + (3 + k * 3) * 30 + 5} r={5} o={fine * Math.sin(Math.PI * u)} />; })}
    </g>
  );
};

/** Fibras al azar (maraña) dentro de un círculo de radio r. */
const tangle = (n: number, r: number, seed = 1) => Array.from({ length: n }).map((_, i) => {
  const cx = (rnd(i * 3 + seed) - 0.5) * r * 1.5, cy = (rnd(i * 5 + seed + 7) - 0.5) * r * 1.5, a = rnd(i * 7 + seed + 3) * Math.PI, L = r * 2.2;
  const bend = (rnd(i + seed + 11) - 0.5) * r * 0.6;
  return `M ${cx - L * Math.cos(a)} ${cy - L * Math.sin(a)} Q ${cx + bend} ${cy - bend} ${cx + L * Math.cos(a)} ${cy + L * Math.sin(a)}`;
});

/** HEPA: lupa sobre la maraña de fibras + panel plegado en acordeón debajo. fold 0-1: de tira lisa a acordeón. tangleHi: resalta la lupa. */
export const HepaFold: React.FC<{ x: number; yZoom: number; yPleat: number; t: number; fold: number; tangleHi?: number; zoomO?: number }> = ({ x, yZoom, yPleat, t, fold, tangleHi = 0, zoomO = 1 }) => {
  const r = 220; const fl = tangle(30, r, 5); const id = "hepz";
  const folds = 8; const W = 700; const amp = fold;
  return (
    <g>
      <g transform={`translate(${x} ${yZoom})`} opacity={zoomO}>
        <defs><clipPath id={id}><circle r={r} /></clipPath></defs>
        <circle r={r} fill="rgba(6,16,31,0.8)" stroke={tangleHi > 0.01 ? K.flow : C.case3} strokeWidth={10} />
        <g clipPath={`url(#${id})`}>
          {fl.map((d, i) => <path key={i} d={d} fill="none" stroke={C.fiber} strokeWidth={4 + 3 * rnd(i)} opacity={0.85} />)}
          {[0, 1, 2, 3, 4].map((i) => { const u = (t * 0.3 + i / 5) % 1; return <Part key={i} x={-r + 2 * r * u} y={-120 + 60 * i + 20 * Math.sin(t * 3 + i)} r={6} o={Math.sin(Math.PI * u) * (u < 0.55 ? 1 : 0)} />; })}
          {[[-60, -40], [40, 30], [-20, 110], [100, -90], [-130, 60]].map(([a, b], i) => <Part key={`s${i}`} x={a} y={b} r={7} />)}
        </g>
      </g>
      {/* línea de la lupa al panel */}
      <line x1={x} y1={yZoom + r} x2={x} y2={yPleat - 70} stroke={C.case3} strokeWidth={4} strokeDasharray="8 10" opacity={zoomO * 0.8} />
      {/* panel: marco y papel plegado */}
      <g transform={`translate(${x} ${yPleat})`}>
        <rect x={-W / 2 - 20} y={-80} width={W + 40} height={160} rx={18} fill="#1A2C46" stroke={C.case2} strokeWidth={6} />
        <polyline points={pleatPath(-W / 2, W / 2, 0, 130, folds, Math.max(0.04, amp))} fill="none" stroke={C.hepa} strokeWidth={10} strokeLinejoin="round" />
      </g>
    </g>
  );
};

/** Líneas de corriente alrededor de un cilindro de radio R centrado en el origen (flujo de izquierda a derecha): y(x) para psi. */
const streamY = (psi: number, x: number, R: number) => {
  const sg = psi >= 0 ? 1 : -1; const p = Math.abs(psi);
  let lo = 0, hi = p + 3 * R;
  for (let k = 0; k < 36; k++) { const m = (lo + hi) / 2; const r2 = x * x + m * m; const f = r2 < R * R ? -1 : m * (1 - (R * R) / r2) - p; if (f > 0) hi = m; else lo = m; }
  return sg * Math.max(hi, Math.sqrt(Math.max(0, R * R - x * x)) + 0.5);
};

/** Una de las tres trampas en una franja: fibra (corte) en (x, y) con el aire rodeándola y la partícula protagonista. p: avance 0-1. */
export const Trap: React.FC<{ x: number; y: number; t: number; mode: "impact" | "intercept" | "diffuse"; p: number; o?: number; hi?: number }> = ({ x, y, t, mode, p, o = 1, hi = 0 }) => {
  const R = 52, W = 620, H = 210;
  const xs = Array.from({ length: 41 }).map((_, i) => -W / 2 + (W * i) / 40);
  const id = `tr${mode}`;
  const line = (psi: number) => xs.map((xx) => `${xx},${streamY(psi, xx, R)}`).join(" ");
  const x0 = -W / 2 - 10; let px = 0, py = 0, pr = 10; const trail: [number, number][] = [];
  if (mode === "impact") {
    pr = 22; const y0 = -10; const xh = -Math.sqrt((R + pr) ** 2 - y0 * y0);
    px = x0 + (xh - x0) * p; py = y0; trail.push([x0, y0], [px, py]);
  } else if (mode === "intercept") {
    pr = 13; const yc = R + pr; const psi = yc - (R * R) / yc;
    for (let k = 0; k <= 24; k++) { const q = x0 + (0 - x0) * p * (k / 24); trail.push([q, -streamY(psi, q, R)]); }
    [px, py] = trail[trail.length - 1];
  } else {
    pr = 6; const n = 34; const end = Math.max(1, Math.round(p * n)); const tx = -(R + pr) * Math.cos(0.8), ty = -(R + pr) * Math.sin(0.8);
    for (let k = 0; k <= end; k++) { const u = k / n; const j = k === n ? 0 : 1; trail.push([x0 + (tx - x0) * u + j * (rnd(k + 1) - 0.5) * 50, -60 + (ty + 60) * u * u + j * (rnd(k + 41) - 0.5) * 60 * (1 - 0.6 * u)]); }
    [px, py] = trail[trail.length - 1];
  }
  const stuck = p >= 1;
  return (
    <g transform={`translate(${x} ${y})`} opacity={o}>
      <defs><clipPath id={id}><rect x={-W / 2} y={-H / 2} width={W} height={H} rx={30} /></clipPath></defs>
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={30} fill="rgba(6,16,31,0.6)" stroke={hi > 0.01 ? K.flow : C.case2} strokeWidth={5} />
      <g clipPath={`url(#${id})`}>
        {[-140, -80, -35, 35, 80, 140].map((ps, i) => <polyline key={i} points={line(ps)} fill="none" stroke={K.cold} strokeWidth={3} strokeDasharray="14 14" strokeDashoffset={-t * 80} opacity={0.45} />)}
        <circle cx={0} cy={0} r={R} fill={C.fiber} stroke={C.pleat} strokeWidth={5} />
        {trail.length > 1 && <polyline points={trail.map((q) => q.join(",")).join(" ")} fill="none" stroke={K.white} strokeWidth={3} strokeDasharray={mode === "diffuse" ? "none" : "4 9"} opacity={0.55} />}
        <Part x={px} y={py} r={pr} />
        {stuck && <circle cx={px} cy={py} r={pr + 9 + 3 * Math.sin(t * 8)} fill="none" stroke={K.flow} strokeWidth={4} />}
      </g>
    </g>
  );
};

/** Gráfica «cuánto se escapa según el tamaño»: campana con máximo entre 0,1 y 0,3 µm. draw 0-1 dibuja la curva; peak resalta la cima. */
export const EscapeChart: React.FC<{ x0: number; x1: number; y0: number; y1: number; draw: number; peak: number }> = ({ x0, x1, y0, y1, draw, peak }) => {
  const lx = (d: number) => x0 + ((Math.log10(d) + 2) / 3) * (x1 - x0); // 0,01 → 10 µm
  const f = (l: number) => Math.exp(-((l + 0.65) ** 2) / (2 * 0.38 ** 2));
  const pts: [number, number][] = Array.from({ length: 71 }).map((_, i) => { const l = -2 + (3 * i) / 70; return [x0 + ((l + 2) / 3) * (x1 - x0), y1 - (y1 - y0 - 30) * (0.05 + 0.9 * f(l))]; });
  const pp = pts.slice(0, Math.max(2, Math.round(pts.length * draw)));
  const ax = lx(0.1), bx = lx(0.3);
  return (
    <g>
      {peak > 0.01 && <rect x={ax} y={y0} width={bx - ax} height={y1 - y0} fill={K.flow} opacity={0.14 * peak} />}
      <line x1={x0} y1={y1} x2={x1 + 10} y2={y1} stroke={C.case3} strokeWidth={5} />
      <line x1={x0} y1={y1} x2={x0} y2={y0 - 10} stroke={C.case3} strokeWidth={5} />
      {[0.01, 0.1, 1, 10].map((d) => <line key={d} x1={lx(d)} y1={y1} x2={lx(d)} y2={y1 + 14} stroke={C.case3} strokeWidth={4} />)}
      <polygon points={`${pp[0][0]},${y1} ${pp.map((q) => q.join(",")).join(" ")} ${pp[pp.length - 1][0]},${y1}`} fill={K.warn} opacity={0.18} />
      <polyline points={pp.map((q) => q.join(",")).join(" ")} fill="none" stroke={K.warn} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
      {/* tamaños dibujados bajo el eje */}
      <Part x={lx(0.02)} y={y1 + 50} r={4} /><Part x={lx(0.2)} y={y1 + 50} r={8} /><Part x={lx(3)} y={y1 + 50} r={18} />
    </g>
  );
};

/** Resultado: chorro de 10 000 partículas contra un panel HEPA; casi todas se quedan y solo alguna (roja) pasa. */
export const Result: React.FC<{ x: number; y: number; t: number; p: number }> = ({ x, y, t, p }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-50} y={-270} width={100} height={540} rx={20} fill="#1A2C46" stroke={C.case2} strokeWidth={6} />
    <polyline points={Array.from({ length: 19 }).map((_, i) => `${i % 2 === 0 ? -36 : 36},${-255 + i * 28.3}`).join(" ")} fill="none" stroke={C.hepa} strokeWidth={8} strokeLinejoin="round" />
    {/* montón de polvo que llega y se queda */}
    {Array.from({ length: 44 }).map((_, i) => {
      const c = i % 4, r = Math.floor(i / 4); const k = (t * 0.5 + rnd(i) ) % 1;
      const sx = -460, sy = -250 + r * 46 + (rnd(i + 3) - 0.5) * 20; const ex = -72 - c * 26, ey = sy;
      const stuckNow = cl(p * 1.3 - c * 0.08);
      const xx = stuckNow >= 1 ? ex : sx + (ex - sx) * Math.min(1, k * 1.3);
      return <Part key={i} x={xx} y={ey} r={10} o={stuckNow >= 1 ? 1 : Math.min(1, k * 5) * 0.9} />;
    })}
    {/* la que se escapa (muy de vez en cuando) */}
    {(() => { const k = (t * 0.33) % 1; return <Part x={-300 + 700 * k} y={20} r={10} col={K.warn} o={p * Math.sin(Math.PI * k)} />; })()}
  </g>
);

/** Gránulo de carbón activo ampliado, lleno de poros; las moléculas de olor llegan y se quedan pegadas en las paredes. */
export const Carbon: React.FC<{ x: number; y: number; t: number; stick: number; pores?: number }> = ({ x, y, t, stick, pores = 1 }) => {
  const blob = "M -300 -40 C -320 -170 -180 -240 -40 -220 C 80 -260 260 -200 300 -90 C 340 20 300 160 180 210 C 60 260 -120 250 -220 180 C -310 120 -290 40 -300 -40 Z";
  const holes = [[-170, -100, 46], [-20, -130, 38], [140, -90, 52], [-200, 60, 40], [-50, 30, 60], [140, 80, 44], [20, 170, 34], [230, -10, 26], [-120, 150, 28]];
  const nStick = Math.round(stick * 14);
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={blob} fill={C.carbon} stroke={C.carbonEdge} strokeWidth={8} />
      {holes.map(([a, b, r], i) => <g key={i} opacity={0.4 + 0.6 * pores}>
        <circle cx={a} cy={b} r={r} fill={C.deep} stroke="#39424F" strokeWidth={5} />
        <circle cx={a + r * 0.3} cy={b - r * 0.3} r={r * 0.35} fill="#05101F" />
      </g>)}
      {/* moléculas pegadas en las paredes de los poros */}
      {Array.from({ length: nStick }).map((_, i) => { const h = holes[i % holes.length]; const a = rnd(i + 12) * 6.28;
        return <Molecule key={i} x={h[0] + (h[2] - 6) * Math.cos(a)} y={h[1] + (h[2] - 6) * Math.sin(a)} a={(a * 57.3) + 90} s={0.7} />; })}
      {/* moléculas que llegan desde fuera */}
      {Array.from({ length: 6 }).map((_, i) => { const h = holes[(i * 2) % holes.length]; const k = (t * 0.35 + i / 6) % 1; const u = cl(k * 1.3);
        const sx = 380 * Math.cos(i * 1.1 + 0.4), sy = -330 + 40 * i;
        return <Molecule key={`m${i}`} x={sx + (h[0] - sx) * u} y={sy + (h[1] - sy) * u} a={t * 90 + i * 40} s={0.8} o={Math.min(1, k * 6) * (1 - cl((k - 0.85) * 7))} />; })}
    </g>
  );
};

/** Dos habitaciones en planta con el mismo purificador: la pequeña se limpia antes; boost 0-1 pone uno más potente en la grande. */
export const Rooms: React.FC<{ t: number; t0: number; boost: number; y: number }> = ({ t, t0, boost, y }) => {
  const room = (cx: number, w: number, speed: number, big: boolean) => {
    const k = Math.max(0, t - t0); const clean = cl(k * speed);
    const n = big ? 26 : 12;
    return (
      <g transform={`translate(${cx} ${y})`}>
        <rect x={-w / 2} y={-w / 2} width={w} height={w} rx={20} fill={`rgba(53,196,240,${0.05 + 0.18 * clean})`} stroke={C.case3} strokeWidth={7} />
        {Array.from({ length: n }).map((_, i) => <Part key={i} x={(rnd(i + (big ? 50 : 0)) - 0.5) * (w - 60) + 6 * Math.sin(t * 2 + i)} y={(rnd(i + 99 + (big ? 50 : 0)) - 0.5) * (w - 60)} r={8} o={rnd(i + 7) > clean ? 1 : 0} />)}
        <Purifier x={0} y={0} s={big ? 0.13 + 0.07 * boost : 0.13} t={t} />
        {/* soplido */}
        {[0, 1, 2].map((i) => { const u = (t * 0.8 + i / 3) % 1; const rr = 30 + u * (w / 2 - 40); return <circle key={i} r={rr} fill="none" stroke={K.cold} strokeWidth={4} opacity={0.5 * (1 - u)} />; })}
      </g>
    );
  };
  return (
    <g>
      {room(300, 300, 0.7, false)}
      {room(720, 420, 0.22 + 0.6 * boost, true)}
    </g>
  );
};

/** Trébol de radiactividad (señal de aviso), radio r. */
export const Trefoil: React.FC<{ x: number; y: number; r: number; o?: number }> = ({ x, y, r, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <circle r={r} fill={K.flow} stroke={C.deep} strokeWidth={Math.max(1.5, r * 0.08)} />
    {[0, 120, 240].map((a) => <path key={a} transform={`rotate(${a - 90})`} d={`M ${r * 0.2} 0 L ${r * 0.85} ${-r * 0.5} A ${r * 0.98} ${r * 0.98} 0 0 1 ${r * 0.85} ${r * 0.5} Z`} fill={C.deep} />)}
    <circle r={r * 0.16} fill={C.deep} />
  </g>
);

/** Laboratorio de los años 40: edificio con chimenea y un filtro en la salida; las partículas radiactivas se quedan en él. */
export const Lab: React.FC<{ x: number; y: number; t: number; filt: number }> = ({ x, y, t, filt }) => (
  <g transform={`translate(${x} ${y})`}>
    {/* edificio */}
    <rect x={-330} y={-40} width={520} height={330} rx={10} fill={C.case1} stroke={C.case2} strokeWidth={6} />
    {[-270, -170, -70, 30, 130].map((xx) => <rect key={xx} x={xx} y={20} width={60} height={70} rx={6} fill={K.flow} opacity={0.35} />)}
    <rect x={-100} y={170} width={90} height={120} rx={6} fill={C.dark} />
    {/* chimenea con filtro */}
    <rect x={200} y={-320} width={110} height={610} rx={10} fill={C.case2} stroke={C.case3} strokeWidth={6} />
    <rect x={185} y={-190} width={140} height={110} rx={12} fill="#1A2C46" stroke={filt > 0.01 ? K.flow : C.case3} strokeWidth={6 + 4 * filt} />
    <polyline points={Array.from({ length: 9 }).map((_, i) => `${200 + i * 13.75},${i % 2 === 0 ? -175 : -95}`).join(" ")} fill="none" stroke={C.hepa} strokeWidth={6} strokeLinejoin="round" />
    {/* partículas radiactivas subiendo: se quedan bajo el filtro */}
    {Array.from({ length: 5 }).map((_, i) => { const u = (t * 0.4 + i / 5) % 1; const yy = 260 - (260 + 60) * u; return <Trefoil key={i} x={232 + 46 * rnd(i)} y={Math.max(-58, yy)} r={14} o={yy < -58 ? 1 - (u - 0.9) * 10 : 1} />; })}
    {/* aire limpio que sale arriba */}
    {Array.from({ length: 4 }).map((_, i) => { const u = (t * 0.6 + i / 4) % 1; return <path key={i} d={`M ${230 + 20 * i} ${-330 - 120 * u} q 12 -20 0 -40`} fill="none" stroke={K.cold} strokeWidth={6} strokeLinecap="round" opacity={filt * Math.sin(Math.PI * u)} />; })}
  </g>
);

/** Filtro HEPA suelto (tarjeta plegada), sucio (dirty 0-1) o nuevo. */
export const FilterCard: React.FC<{ x: number; y: number; s?: number; dirty?: number; o?: number }> = ({ x, y, s = 1, dirty = 0, o = 1 }) => {
  const g = (v: number, d: number) => Math.round(v - d * dirty);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect x={-130} y={-170} width={260} height={340} rx={18} fill="#1A2C46" stroke={C.case3} strokeWidth={6} />
      <polyline points={Array.from({ length: 13 }).map((_, i) => `${-112 + i * 18.7},${i % 2 === 0 ? -150 : 150}`).join(" ")} fill="none"
        stroke={`rgb(${g(238, 110)},${g(242, 120)},${g(247, 140)})`} strokeWidth={9} strokeLinejoin="round" />
      {dirty > 0.3 && Array.from({ length: 16 }).map((_, i) => <Part key={i} x={(rnd(i + 3) - 0.5) * 220} y={(rnd(i + 8) - 0.5) * 300} r={7} o={dirty} col="#8F7F66" />)}
    </g>
  );
};

/** Cortina ondulada (para «no lo tapes»). */
export const Curtain: React.FC<{ x: number; y: number; h: number; o?: number }> = ({ x, y, h, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <rect x={-150} y={-h / 2 - 20} width={300} height={16} rx={8} fill={C.case3} />
    {[-120, -60, 0, 60, 120].map((d) => <path key={d} d={`M ${d - 30} ${-h / 2} Q ${d} ${-h / 2 + 30} ${d + 30} ${-h / 2} L ${d + 34} ${h / 2} Q ${d} ${h / 2 - 26} ${d - 34} ${h / 2} Z`} fill="#8E5B7A" stroke="#6B4058" strokeWidth={4} />)}
  </g>
);
