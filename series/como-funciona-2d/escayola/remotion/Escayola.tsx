// Dibujos SVG planos del episodio «Cómo funciona una escayola» (ESPECIAL HOSPITAL). Sin marcas. El brazo es una silueta neutra.
// Código de color: amarillo = lo importante (callo, hueso que se repara), naranja = calor, cian = agua, rojo = error/peligro/sangre esquemática.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = {
  case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#0B1A30", sil: "#1C3557", silEdge: "#4A73A8",
  bone: "#EFE6CF", boneEdge: "#B8A782", marrow: "#D9C79C", stock: "#C9D6E6", pad: "#F3EEDF", padLine: "#CFC4A6",
  plaster: "#F7F7F2", plasterEdge: "#B9C2CC", fiber: "#3E86C9", fiberEdge: "#1E4E80", skin: "#2A4E7A",
};

export const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Contorno ahusado (brazo / capas) de x0 a x1, semialtura h0 → h1, centrado en y = 0. */
const taper = (x0: number, x1: number, h0: number, h1: number) =>
  `M ${x0} ${-h0} C ${x0 + (x1 - x0) * 0.4} ${-h0} ${x0 + (x1 - x0) * 0.7} ${-h1} ${x1} ${-h1} Q ${x1 + 22} 0 ${x1} ${h1} C ${x0 + (x1 - x0) * 0.7} ${h1} ${x0 + (x1 - x0) * 0.4} ${h0} ${x0} ${h0} Q ${x0 - 22} 0 ${x0} ${-h0} Z`;

/** Antebrazo de perfil (silueta neutra) con mano, mirando a la derecha. Centro (0, 0); codo hacia x ≈ -420, muñeca x ≈ 260. */
const ARM = "M -440 -100 C -200 -100 60 -78 250 -66 C 300 -64 330 -88 372 -96 C 400 -100 418 -84 408 -70 C 398 -58 372 -52 360 -40 C 400 -40 440 -30 450 -6 C 458 20 440 48 410 58 C 360 74 300 70 250 66 C 60 78 -200 100 -440 100 Q -500 0 -440 -100 Z";

/** Hueso largo (horizontal) con fractura en x = 0. gap: separación de los fragmentos. callus 0-1: callo que crece y une. wob: giro del fragmento derecho (grados). */
export const Bone: React.FC<{ x: number; y: number; s?: number; gap?: number; callus?: number; wob?: number; hi?: number; o?: number; t?: number }> =
  ({ x, y, s = 1, gap = 8, callus = 0, wob = 0, hi = 0, o = 1, t = 0 }) => {
    const L = 330, h = 30;
    const CR = [[0, -h], [10, -h * 0.5], [-8, -h * 0.05], [9, h * 0.45], [-2, h]];
    const cr = (dx: number) => CR.map(([cx, cy]) => `L ${cx + dx} ${cy}`).join(" ");
    const crR = (dx: number) => [...CR].reverse().map(([cx, cy]) => `L ${cx + dx} ${cy}`).join(" ");
    // fragmento izquierdo: cabeza redondeada en -L, borde de arriba hasta la grieta, baja por la grieta y vuelve por abajo
    const leftD = `M ${-L} ${-h} C ${-L - 20} ${-h - 30} ${-L - 60} ${-h - 20} ${-L - 56} 0 C ${-L - 60} ${h + 20} ${-L - 20} ${h + 30} ${-L} ${h} ` +
      `L ${-2 - gap / 2} ${h} ${crR(-gap / 2)} Z`;
    const rightD = `M ${L} ${-h} C ${L + 20} ${-h - 30} ${L + 60} ${-h - 20} ${L + 56} 0 C ${L + 60} ${h + 20} ${L + 20} ${h + 30} ${L} ${h} ` +
      `L ${-2 + gap / 2} ${h} ${crR(gap / 2)} Z`;
    void cr;
    const cw = 30 + 70 * callus;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
        {callus > 0.01 && (
          <ellipse cx={0} cy={0} rx={cw} ry={h + 18 * callus} fill={K.flow} opacity={0.35 + 0.5 * callus} stroke={K.flow} strokeWidth={4}
            style={{ filter: `drop-shadow(0 0 ${8 + 10 * hi}px ${K.flow})` }} />
        )}
        <path d={leftD} fill={C.bone} stroke={hi > 0.01 ? K.flow : C.boneEdge} strokeWidth={5} strokeLinejoin="round" />
        <g transform={`rotate(${wob} ${gap / 2} 0)`}>
          <path d={rightD} fill={C.bone} stroke={hi > 0.01 ? K.flow : C.boneEdge} strokeWidth={5} strokeLinejoin="round" />
        </g>
        <line x1={-L + 20} y1={0} x2={-60} y2={0} stroke={C.marrow} strokeWidth={10} strokeLinecap="round" opacity={0.6} />
        <line x1={60} y1={0} x2={L - 20} y2={0} stroke={C.marrow} strokeWidth={10} strokeLinecap="round" opacity={0.6} transform={`rotate(${wob} ${gap / 2} 0)`} />
        {callus > 0.01 && Array.from({ length: 7 }).map((_, i) => (
          <circle key={i} cx={(rnd(i) - 0.5) * cw * 1.4} cy={(rnd(i + 9) - 0.5) * 2 * (h + 6)} r={4 + 3 * rnd(i + 3)} fill={K.flow} opacity={callus * (0.6 + 0.4 * Math.sin(t * 4 + i))} />
        ))}
      </g>
    );
  };

/** Brazo con escayola, vista lateral. Centro (x, y), ~860 px de ancho a s = 1.
 *  stock / pad / cast 0-1: avance de cada capa (de izquierda a derecha). mat: "yeso" o "fibra". open 0-1: la mitad de arriba de la escayola se levanta.
 *  bone: se ve el hueso por transparencia. callus 0-1. heat 0-1: ondas de calor. wet 0-1: el acolchado se empapa (cian). itch 0-1: rayitas de picor. */
export const Arm: React.FC<{ x: number; y: number; s?: number; t: number; stock?: number; pad?: number; cast?: number; mat?: "yeso" | "fibra"; open?: number; bone?: number; callus?: number;
  heat?: number; wet?: number; itch?: number; hiLayer?: "stock" | "pad" | "cast" | ""; cut?: number; o?: number; inner?: boolean }> =
  ({ x, y, s = 1, t, stock = 1, pad = 1, cast = 1, mat = "yeso", open = 0, bone = 0, callus = 0, heat = 0, wet = 0, itch = 0, hiLayer = "", cut = 0, o = 1, inner = false }) => {
    const lin = inner ? 1 : 1 - Math.min(1, open * 1.6); // al abrir, el forro se aparta y se ve el hueso
    const id = `arm${Math.round(x)}${Math.round(y)}${Math.round(s * 100)}`;
    const X0 = -360, X1 = 300;
    const castD = taper(X0, X1, 128, 98), padD = taper(X0 - 12, X1 + 10, 114, 86), stockD = taper(X0 - 34, X1 + 30, 104, 76);
    const clipW = (p: number, a: number, b: number) => a - 40 + (b - a + 80) * p;
    const castFill = mat === "yeso" ? C.plaster : C.fiber, castEdge = mat === "yeso" ? C.plasterEdge : C.fiberEdge;
    const lift = 150 * open;
    const castBody = (half: "top" | "bot" | "all") => (
      <g clipPath={`url(#${id}c)`}>
        <g clipPath={half === "all" ? undefined : `url(#${id}${half})`}>
          <path d={castD} fill={castFill} stroke={hiLayer === "cast" ? K.flow : castEdge} strokeWidth={hiLayer === "cast" ? 9 : 6} />
          {/* vueltas de venda */}
          {Array.from({ length: 11 }).map((_, i) => { const xx = X0 + 30 + i * 58; return <path key={i} d={`M ${xx} -126 C ${xx + 30} -40 ${xx + 10} 40 ${xx + 40} 124`} fill="none" stroke={mat === "yeso" ? "#DDE2E8" : C.fiberEdge} strokeWidth={4} opacity={0.8} />; })}
          {mat === "fibra" && Array.from({ length: 60 }).map((_, i) => { const c = i % 15, r = Math.floor(i / 15); return <circle key={i} cx={X0 + 20 + c * 44 + (r % 2) * 22} cy={-75 + r * 50} r={5} fill={C.fiberEdge} opacity={0.5} />; })}
        </g>
      </g>
    );
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
        <defs>
          <clipPath id={`${id}c`}><rect x={-600} y={-400} width={clipW(cast, X0, X1) + 600} height={800} /></clipPath>
          <clipPath id={`${id}p`}><rect x={-600} y={-400} width={clipW(pad, X0, X1) + 600} height={800} /></clipPath>
          <clipPath id={`${id}s`}><rect x={-600} y={-400} width={clipW(stock, X0, X1) + 600} height={800} /></clipPath>
          <clipPath id={`${id}top`}><rect x={-600} y={-400} width={1200} height={400} /></clipPath>
          <clipPath id={`${id}bot`}><rect x={-600} y={0} width={1200} height={400} /></clipPath>
        </defs>
        {/* brazo (silueta) */}
        <path d={ARM} fill={C.sil} stroke={C.silEdge} strokeWidth={6} />
        {/* media */}
        {stock > 0.01 && lin > 0.01 && <g clipPath={`url(#${id}s)`} opacity={lin}><path d={stockD} fill={C.stock} stroke={hiLayer === "stock" ? K.flow : C.case3} strokeWidth={hiLayer === "stock" ? 8 : 4} opacity={0.95} />
          {Array.from({ length: 22 }).map((_, i) => <line key={i} x1={X0 - 20 + i * 30} y1={-90} x2={X0 - 20 + i * 30} y2={90} stroke={C.case3} strokeWidth={2} opacity={0.5} />)}</g>}
        {/* acolchado de algodón */}
        {pad > 0.01 && lin > 0.01 && <g clipPath={`url(#${id}p)`} opacity={lin}><path d={padD} fill={wet > 0.01 ? mixHex(C.pad, "#7FD3F2", wet) : C.pad} stroke={hiLayer === "pad" ? K.flow : C.padLine} strokeWidth={hiLayer === "pad" ? 8 : 4} />
          {Array.from({ length: 14 }).map((_, i) => { const xx = X0 + i * 48; return <path key={i} d={`M ${xx} -112 C ${xx + 40} -40 ${xx + 8} 40 ${xx + 50} 110`} fill="none" stroke={C.padLine} strokeWidth={4} opacity={0.7} />; })}</g>}
        {/* escayola: entera o abierta en dos mitades */}
        {cast > 0.01 && open < 0.01 && castBody("all")}
        {cast > 0.01 && open >= 0.01 && (
          <>
            <g transform={`translate(0 ${lift * 0.25})`}>{castBody("bot")}</g>
            <g transform={`translate(0 ${-lift}) rotate(${-5 * open} ${X0} 0)`}>{castBody("top")}</g>
          </>
        )}
        {/* línea de corte */}
        {cut > 0.01 && <line x1={X0 - 10} y1={-2} x2={X0 - 10 + (X1 - X0 + 20) * cut} y2={-2} stroke={K.warn} strokeWidth={6} strokeDasharray="18 10" />}
        {/* hueso visto «por rayos» */}
        {bone > 0.01 && <Bone x={-40} y={0} s={0.82} gap={10} callus={callus} o={bone} t={t} hi={callus > 0.5 ? 1 : 0} />}
        {/* calor */}
        {heat > 0.01 && [0, 1, 2, 3, 4].map((i) => { const u = (t * 0.7 + i / 5) % 1; const xx = X0 + 70 + i * 130; return (
          <path key={i} d={`M ${xx} ${-140 - 120 * u} q 18 -20 0 -40 q -18 -20 0 -40`} fill="none" stroke={K.hot} strokeWidth={8} strokeLinecap="round" opacity={heat * Math.sin(Math.PI * u)} />); })}
        {/* picor */}
        {itch > 0.01 && [0, 1, 2, 3, 4, 5].map((i) => { const xx = X0 + 80 + i * 100, yy = (i % 2 ? -1 : 1) * 30; const k = 0.6 + 0.4 * Math.sin(t * 9 + i * 2);
          return <path key={i} d={`M ${xx - 22} ${yy} l 11 -14 l 11 14 l 11 -14 l 11 14`} fill="none" stroke={K.flow} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={itch * k} />; })}
      </g>
    );
  };

/** Mezcla dos colores hex (0 = a, 1 = b). */
export const mixHex = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * Math.max(0, Math.min(1, k))).toString(16).padStart(2, "0")).join("");
};

/** Barreño de agua con un rollo de venda que se moja. dip 0-1: el rollo baja al agua. mat: color del rollo. */
export const Bowl: React.FC<{ x: number; y: number; t: number; dip?: number; mat?: "yeso" | "fibra"; heat?: number; s?: number }> = ({ x, y, t, dip = 0, mat = "yeso", heat = 0, s = 1 }) => {
  const ry = -150 + 150 * dip + 6 * Math.sin(t * 3);
  const fill = mat === "yeso" ? C.plaster : C.fiber, edge = mat === "yeso" ? C.plasterEdge : C.fiberEdge;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -260 0 L -210 190 Q -200 220 -170 220 L 170 220 Q 200 220 210 190 L 260 0 Z" fill={C.case1} stroke={C.case2} strokeWidth={8} />
      <ellipse cx={0} cy={0} rx={260} ry={46} fill={C.case2} />
      <ellipse cx={0} cy={22} rx={236} ry={36} fill={K.cold} opacity={0.85} />
      {[0, 1, 2].map((i) => { const u = (t * 0.6 + i / 3) % 1; return <ellipse key={i} cx={0} cy={22} rx={60 + 170 * u} ry={10 + 24 * u} fill="none" stroke="#BFEFFF" strokeWidth={4} opacity={(1 - u) * dip} />; })}
      {/* rollo */}
      <g transform={`translate(0 ${ry})`}>
        <rect x={-150} y={-70} width={300} height={140} rx={28} fill={fill} stroke={edge} strokeWidth={6} />
        {[-100, -50, 0, 50, 100].map((d) => <line key={d} x1={d} y1={-66} x2={d} y2={66} stroke={edge} strokeWidth={3} opacity={0.5} />)}
        <ellipse cx={150} cy={0} rx={26} ry={70} fill={fill} stroke={edge} strokeWidth={6} />
        <ellipse cx={150} cy={0} rx={9} ry={24} fill={edge} />
        {/* polvo blanco del yeso */}
        {mat === "yeso" && dip < 0.5 && Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={-130 + rnd(i) * 260} cy={80 + ((t * 40 + rnd(i + 4) * 80) % 80)} r={4} fill="#FFFFFF" opacity={0.6 * (1 - 2 * dip)} />)}
      </g>
      {heat > 0.01 && [0, 1, 2].map((i) => { const u = (t * 0.7 + i / 3) % 1; const xx = -120 + i * 120; return (
        <path key={i} d={`M ${xx} ${-120 - 160 * u} q 20 -22 0 -44 q -20 -22 0 -44`} fill="none" stroke={K.hot} strokeWidth={9} strokeLinecap="round" opacity={heat * Math.sin(Math.PI * u)} />); })}
    </g>
  );
};

/** Termómetro sencillo. level 0-1. */
export const Thermo: React.FC<{ x: number; y: number; level: number; s?: number }> = ({ x, y, level, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-26} y={-200} width={52} height={250} rx={26} fill={C.dark} stroke={C.case3} strokeWidth={6} />
    <circle cx={0} cy={80} r={50} fill={K.hot} stroke={C.case3} strokeWidth={6} />
    <rect x={-12} y={50 - 230 * level} width={24} height={30 + 230 * level} rx={12} fill={K.hot} />
    {[0, 1, 2, 3].map((i) => <line key={i} x1={30} y1={-150 + i * 50} x2={50} y2={-150 + i * 50} stroke={C.case3} strokeWidth={4} />)}
  </g>
);

/** Barra de tiempo con dos tramos: rápido (minutos) y lento (días). p 0-1 avanza. */
export const TimeBar: React.FC<{ x0: number; x1: number; y: number; split: number; p: number; colA: string; colB: string }> = ({ x0, x1, y, split, p, colA, colB }) => {
  const xs = x0 + (x1 - x0) * split, xp = x0 + (x1 - x0) * p;
  return (
    <g>
      <rect x={x0} y={y - 22} width={x1 - x0} height={44} rx={22} fill={C.dark} stroke={C.case2} strokeWidth={4} />
      <rect x={x0} y={y - 22} width={Math.max(0, Math.min(xp, xs) - x0)} height={44} rx={22} fill={colA} />
      {xp > xs && <rect x={xs} y={y - 22} width={xp - xs} height={44} rx={10} fill={colB} />}
      <line x1={xs} y1={y - 40} x2={xs} y2={y + 40} stroke={C.case3} strokeWidth={5} />
    </g>
  );
};

/** Corte transversal de la extremidad dentro de la escayola. swell 0-1: hinchazón. open: férula abierta (en C) o escayola cerrada. */
export const Section: React.FC<{ x: number; y: number; t: number; swell: number; open: boolean; s?: number; o?: number; ok?: number; arrows?: boolean }> = ({ x, y, t, swell, open, s = 1, o = 1, ok = 0, arrows = true }) => {
  const R = 120 + 46 * swell + 3 * Math.sin(t * 3);
  const ringR = open ? Math.max(178, R + 40) : 178;
  const squeeze = !open && R + 40 > 178;
  const gapA = open ? 0.34 + 0.5 * Math.max(0, (R + 40 - 178) / 46) : 0; // apertura (rad) de la C, que se abre al hincharse
  const arc = (r: number, a0: number, a1: number) => `M ${r * Math.cos(a0)} ${r * Math.sin(a0)} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)}`;
  const top = -Math.PI / 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {/* escayola */}
      {open ? <path d={arc(ringR + 16, top + gapA, top + 2 * Math.PI - gapA)} fill="none" stroke={C.plaster} strokeWidth={34} strokeLinecap="round" />
        : <circle r={ringR + 16} fill="none" stroke={squeeze ? K.warn : C.plaster} strokeWidth={34} />}
      {/* acolchado */}
      <circle r={Math.min(R + 22, open ? ringR - 2 : 176)} fill={C.pad} />
      {/* extremidad (silueta) */}
      <circle r={Math.min(R, open ? R : 156)} fill={squeeze ? mixHex(C.sil, K.warn, 0.45) : C.sil} stroke={C.silEdge} strokeWidth={6} />
      {/* hueso */}
      <circle cx={-30} cy={10} r={34} fill={C.bone} stroke={C.boneEdge} strokeWidth={5} />
      <circle cx={48} cy={-8} r={26} fill={C.bone} stroke={C.boneEdge} strokeWidth={5} />
      {squeeze && [0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2 + 0.3; const r0 = 210, k = 0.5 + 0.5 * Math.sin(t * 8);
        return <path key={i} d={`M ${r0 * Math.cos(a)} ${r0 * Math.sin(a)} L ${(r0 - 26 - 6 * k) * Math.cos(a)} ${(r0 - 26 - 6 * k) * Math.sin(a)}`} stroke={K.warn} strokeWidth={8} strokeLinecap="round" />; })}
      {arrows && open && swell > 0.05 && [-1, 1].map((d) => <path key={d} d={`M ${d * 30} ${-ringR - 60} l ${d * 40} -10 m ${-d * 14} -14 l ${d * 14} 14 l ${-d * 14} 14`} fill="none" stroke={K.cold} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={Math.min(1, swell * 2)} />)}
      {ok > 0.01 && <circle r={ringR + 40} fill="none" stroke={K.flow} strokeWidth={6} opacity={ok * (0.6 + 0.4 * Math.sin(t * 4))} />}
    </g>
  );
};

/** Sierra oscilante: cuchilla redonda que va y viene (no gira). Centro de la cuchilla (x, y). */
export const Saw: React.FC<{ x: number; y: number; t: number; on?: number; s?: number }> = ({ x, y, t, on = 1, s = 1 }) => {
  const a = on * 9 * Math.sin(t * 2 * Math.PI * 2.2);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* cuerpo */}
      <rect x={-60} y={-430} width={120} height={330} rx={50} fill={C.case2} stroke={C.case3} strokeWidth={6} />
      <rect x={-34} y={-360} width={68} height={120} rx={20} fill={C.case1} />
      <rect x={-22} y={-120} width={44} height={60} fill={C.case3} />
      <g transform={`rotate(${a})`}>
        <circle r={110} fill="#C7D3E0" stroke="#7C8DA3" strokeWidth={6} />
        {Array.from({ length: 36 }).map((_, i) => { const q = (i / 36) * Math.PI * 2; return <path key={i} d={`M ${110 * Math.cos(q)} ${110 * Math.sin(q)} L ${122 * Math.cos(q + 0.06)} ${122 * Math.sin(q + 0.06)} L ${110 * Math.cos(q + 0.17)} ${110 * Math.sin(q + 0.17)}`} fill="#7C8DA3" />; })}
        <circle r={26} fill={C.case1} />
        <line x1={0} y1={-26} x2={0} y2={-90} stroke="#7C8DA3" strokeWidth={6} />
      </g>
    </g>
  );
};

/** Flecha curva de ida y vuelta (↔) alrededor de un punto: indica vaivén. */
export const Wobble: React.FC<{ x: number; y: number; r: number; o: number; col?: string }> = ({ x, y, r, o, col = K.flow }) => o <= 0.01 ? null : (
  <g transform={`translate(${x} ${y})`} opacity={o} fill="none" stroke={col} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round">
    <path d={`M ${-r * Math.sin(0.5)} ${r * Math.cos(0.5)} A ${r} ${r} 0 0 0 ${r * Math.sin(0.5)} ${r * Math.cos(0.5)}`} />
    <path d={`M ${-r * Math.sin(0.5)} ${r * Math.cos(0.5)} l -4 -26 M ${-r * Math.sin(0.5)} ${r * Math.cos(0.5)} l 24 -10`} />
    <path d={`M ${r * Math.sin(0.5)} ${r * Math.cos(0.5)} l 4 -26 M ${r * Math.sin(0.5)} ${r * Math.cos(0.5)} l -24 -10`} />
  </g>
);

/** Palito que entra en la escayola (para rascar) con cruz roja. p 0-1 entra. */
export const Stick: React.FC<{ x: number; y: number; p: number; t: number; cross?: number }> = ({ x, y, p, cross = 0 }) => p <= 0.01 ? null : (
  <g transform={`translate(${x - 140 * (1 - p)} ${y})`} opacity={Math.min(1, p * 3)}>
    <rect x={-220} y={-12} width={220} height={24} rx={12} fill="#C9A46A" stroke="#8C6B3C" strokeWidth={5} transform="rotate(-8)" />
    {cross > 0.01 && <g opacity={cross} stroke={K.warn} strokeWidth={16} strokeLinecap="round" transform="translate(-120 -100)"><line x1={-50} y1={-50} x2={50} y2={50} /><line x1={50} y1={-50} x2={-50} y2={50} /></g>}
  </g>
);

/** Herida esquemática (rasguño rojo). */
export const Scratch: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) => o <= 0.01 ? null : (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <path d="M -50 10 L -20 -8 L 8 8 L 36 -10 L 58 4" fill="none" stroke={K.warn} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={0} cy={22} r={7} fill={K.warn} /><circle cx={30} cy={16} r={5} fill={K.warn} />
  </g>
);

/** Gotas de agua que caen y rebotan sobre una superficie en y = 0 entre x0 y x1. */
export const Drops: React.FC<{ x0: number; x1: number; y: number; t: number; o: number }> = ({ x0, x1, y, t, o }) => o <= 0.01 ? null : (
  <g opacity={o}>
    {Array.from({ length: 7 }).map((_, i) => { const u = (t * 0.9 + rnd(i) ) % 1; const xx = x0 + (x1 - x0) * rnd(i + 20);
      return <path key={i} d={`M ${xx} ${y - 260 + 250 * u} q 12 18 0 28 q -12 -10 0 -28 Z`} fill={K.cold} opacity={Math.sin(Math.PI * u)} />; })}
  </g>
);
