// Dibujos SVG planos del episodio «Cómo funciona una bomba de insulina». Sin marcas. Personas como siluetas neutras.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#0B1A30", sil: "#1C3557", silEdge: "#4A73A8" };

/** Engranaje que gira. */
export const Gear: React.FC<{ x: number; y: number; r: number; a: number; color?: string }> = ({ x, y, r, a, color = C.case3 }) => {
  const teeth = 10;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      {Array.from({ length: teeth }).map((_, i) => (
        <rect key={i} x={-r * 0.16} y={-r * 1.22} width={r * 0.32} height={r * 0.4} rx={3} fill={color} transform={`rotate(${(360 / teeth) * i})`} />
      ))}
      <circle r={r} fill={color} />
      <circle r={r * 0.35} fill={C.dark} />
    </g>
  );
};

/** Gota. */
export const Drop: React.FC<{ x: number; y: number; s?: number; color?: string; o?: number }> = ({ x, y, s = 1, color = K.cold, o = 1 }) => (
  <path d="M0 -16 C 6 -6 11 0 11 6 A 11 11 0 0 1 -11 6 C -11 0 -6 -6 0 -16 Z" fill={color} opacity={o} transform={`translate(${x} ${y}) scale(${s})`} />
);

/**
 * Bomba de insulina (caja tipo buscapersonas), cuerpo x 230-850, y 600-980.
 * open: 0 = tapa cerrada, 1 = tapa levantada (se ve el interior).
 * push: avance del émbolo 0-1. hi: pieza resaltada.
 */
export const Pump: React.FC<{ t: number; open: number; push?: number; hi?: "dep" | "motor" | "tornillo" | "embolo" | "none"; flow?: number; spin?: number; dim?: number }> =
  ({ t, open, push = 0.15, hi = "none", flow = 0.6, spin = 1, dim = 0 }) => {
    const px = 430 + push * 260; // x del émbolo
    const glow = (k: string) => (hi === k ? 0.55 + 0.35 * Math.sin(t * 6) : 0);
    const thread = (t * 40 * spin) % 22;
    const dropsT = (t * 0.7) % 1;
    return (
      <g opacity={1 - dim * 0.7}>
        {/* tubo de salida */}
        <path d="M850 712 C 940 712 975 610 930 470" fill="none" stroke={C.case3} strokeWidth={14} strokeLinecap="round" opacity={0.9} />
        <path d="M850 712 C 940 712 975 610 930 470" fill="none" stroke={K.cold} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
        {flow > 0 && [0, 0.33, 0.66].map((k, i) => {
          const u = (dropsT + k) % 1;
          // aproximación de la curva
          const bx = (1 - u) ** 3 * 850 + 3 * (1 - u) ** 2 * u * 940 + 3 * (1 - u) * u * u * 975 + u ** 3 * 930;
          const by = (1 - u) ** 3 * 712 + 3 * (1 - u) ** 2 * u * 712 + 3 * (1 - u) * u * u * 610 + u ** 3 * 470;
          return <circle key={i} cx={bx} cy={by} r={7} fill={K.white} opacity={flow * (0.4 + 0.6 * Math.sin(Math.PI * u))} />;
        })}
        {/* cuerpo */}
        <rect x={230} y={600} width={620} height={380} rx={64} fill={C.case1} stroke={C.case2} strokeWidth={8} />
        {/* interior */}
        <g opacity={0.25 + 0.75 * open}>
          <rect x={250} y={620} width={580} height={340} rx={48} fill={C.dark} />
          {/* motor */}
          <rect x={262} y={646} width={110} height={130} rx={18} fill={C.case2} stroke={hi === "motor" ? K.flow : "none"} strokeWidth={6} />
          <Gear x={317} y={711} r={30} a={t * 220 * spin} color={hi === "motor" ? K.flow : C.case3} />
          {/* tornillo */}
          <rect x={372} y={699} width={px - 372} height={24} fill={hi === "tornillo" ? K.flow : C.case3} />
          {Array.from({ length: Math.ceil((px - 372) / 22) + 1 }).map((_, i) => {
            const x = 372 + i * 22 - thread;
            return x > 372 && x < px - 4 ? <line key={i} x1={x} y1={699} x2={x + 10} y2={723} stroke={C.dark} strokeWidth={4} /> : null;
          })}
          {/* depósito */}
          <rect x={420} y={656} width={400} height={110} rx={22} fill="none" stroke={hi === "dep" ? K.flow : C.case3} strokeWidth={6} />
          <rect x={px + 14} y={664} width={Math.max(0, 806 - px - 14)} height={94} rx={14} fill={K.cold} opacity={0.75} />
          {hi === "dep" && <rect x={412} y={648} width={416} height={126} rx={28} fill="none" stroke={K.flow} strokeWidth={4} opacity={glow("dep")} />}
          {/* boquilla */}
          <rect x={820} y={700} width={34} height={24} rx={6} fill={C.case3} />
          {/* émbolo */}
          <rect x={px} y={660} width={20} height={102} rx={6} fill={hi === "embolo" ? K.flow : K.white} />
          {/* placa y batería */}
          <rect x={268} y={806} width={300} height={136} rx={14} fill={C.case1} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M290 ${836 + i * 36} H ${400 + i * 30} V ${846 + i * 36} H 548`} fill="none" stroke={K.flow} strokeWidth={4}
              opacity={0.35 + 0.5 * Math.max(0, Math.sin(t * 5 - i * 1.3))} />
          ))}
          <rect x={430} y={828} width={70} height={46} rx={6} fill={C.dark} />
          <rect x={596} y={806} width={214} height={136} rx={16} fill={C.case2} />
          <rect x={612} y={826} width={40} height={96} rx={6} fill={K.flow} opacity={0.9} />
        </g>
        {/* tapa con pantalla */}
        {open < 0.999 && (
          <g transform={`translate(0 ${-open * 300}) rotate(${-open * 6} 540 600)`} opacity={1 - open}>
            <rect x={230} y={600} width={620} height={380} rx={64} fill={C.case2} stroke={C.case3} strokeWidth={6} />
            <rect x={286} y={646} width={330} height={190} rx={22} fill={C.dark} stroke={C.case1} strokeWidth={6} />
            {/* gráfica en la pantalla */}
            <polyline points="306,790 346,770 386,780 426,750 466,760 506,735 546,745 596,720" fill="none" stroke={K.cold} strokeWidth={6} strokeLinejoin="round" />
            <Drop x={566} y={690} s={1.2} />
            <circle cx={710} cy={700} r={38} fill={C.case1} />
            <circle cx={710} cy={800} r={38} fill={C.case1} />
            <rect x={300} y={880} width={300} height={40} rx={20} fill={C.case1} />
          </g>
        )}
      </g>
    );
  };

/** Silueta neutra de persona (cabeza + torso). Centro de la cabeza en (x, y), escala s. */
export const Person: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={0} r={78} fill={C.sil} stroke={C.silEdge} strokeWidth={6} />
    <path d="M-60 100 Q 0 80 60 100 L 150 150 Q 190 170 190 230 L 190 640 L -190 640 L -190 230 Q -190 170 -150 150 Z" fill={C.sil} stroke={C.silEdge} strokeWidth={6} />
  </g>
);

/** Páncreas esquemático (forma alargada). */
export const Pancreas: React.FC<{ x: number; y: number; s?: number; on: number; t: number }> = ({ x, y, s = 1, on, t }) => {
  const col = on > 0.5 ? K.flow : C.case3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-150 10 C -150 -40 -90 -50 -40 -30 C 10 -12 60 -40 110 -36 C 150 -32 160 0 140 16 C 110 40 60 22 10 34 C -40 46 -60 60 -100 58 C -140 56 -150 40 -150 10 Z"
        fill={col} opacity={0.35 + 0.55 * on} stroke={col} strokeWidth={5} />
      {on > 0.05 && [0, 1, 2, 3, 4, 5].map((i) => {
        const u = (t * 0.6 + i / 6) % 1;
        const ang = (i / 6) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(ang) * (60 + 120 * u)} cy={Math.sin(ang) * (30 + 80 * u)} r={8} fill={K.cold} opacity={on * (1 - u)} />;
      })}
    </g>
  );
};

/** Corte de piel: capas desde y0 hacia abajo, ancho completo x 90-990. */
export const Skin: React.FC<{ y0: number; h?: number }> = ({ y0, h = 420 }) => (
  <g>
    <rect x={90} y={y0} width={900} height={36} rx={10} fill={C.case3} />
    <rect x={90} y={y0 + 36} width={900} height={h * 0.55} fill={C.case2} opacity={0.75} />
    {Array.from({ length: 9 }).map((_, i) => (
      <circle key={i} cx={150 + i * 100 + (i % 2) * 30} cy={y0 + 90 + (i % 3) * 50} r={34} fill={C.case2} stroke={C.case3} strokeOpacity={0.35} strokeWidth={3} />
    ))}
    <rect x={90} y={y0 + 36 + h * 0.55} width={900} height={h * 0.45 - 36} rx={10} fill={C.case1} />
  </g>
);

/** Jeringa sin aguja (contorno). */
export const Syringe: React.FC<{ x: number; y: number; w?: number; o: number }> = ({ x, y, w = 420, o }) => (
  <g transform={`translate(${x - w / 2} ${y})`} opacity={o}>
    <rect x={0} y={-36} width={w * 0.78} height={72} rx={14} fill="none" stroke={K.white} strokeWidth={6} />
    <rect x={w * 0.25} y={-28} width={w * 0.52} height={56} rx={8} fill={K.cold} opacity={0.6} />
    <rect x={w * 0.21} y={-30} width={16} height={60} rx={4} fill={K.white} />
    <rect x={-w * 0.12} y={-6} width={w * 0.34} height={12} fill={K.white} />
    <rect x={-w * 0.14} y={-36} width={12} height={72} rx={4} fill={K.white} />
    <rect x={w * 0.78} y={-12} width={w * 0.1} height={24} rx={4} fill={K.white} />
  </g>
);

/** Plato con cubiertos. */
export const Plate: React.FC<{ x: number; y: number; s?: number; o?: number; color?: string }> = ({ x, y, s = 1, o = 1, color = K.white }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle r={60} fill="none" stroke={color} strokeWidth={8} />
    <circle r={36} fill="none" stroke={color} strokeWidth={4} opacity={0.6} />
    <rect x={-96} y={-56} width={10} height={112} rx={5} fill={color} />
    <rect x={86} y={-56} width={10} height={112} rx={5} fill={color} />
  </g>
);

/** Carpeta de informe con marcas (equipo médico, sin cruz). */
export const Clipboard: React.FC<{ x: number; y: number; s?: number; o?: number; p: number }> = ({ x, y, s = 1, o = 1, p }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-90} y={-120} width={180} height={240} rx={18} fill={C.case2} stroke={C.case3} strokeWidth={6} />
    <rect x={-40} y={-136} width={80} height={36} rx={10} fill={C.case3} />
    {[0, 1, 2].map((i) => (
      <g key={i} opacity={p > i / 3 ? 1 : 0.3}>
        <path d={`M-60 ${-50 + i * 60} l 14 14 l 24 -28`} fill="none" stroke={K.flow} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={-6} y={-46 + i * 60} width={60} height={10} rx={5} fill={K.white} opacity={0.8} />
      </g>
    ))}
  </g>
);

/** Sensor de glucosa: disco con filamento bajo la piel. */
export const Sensor: React.FC<{ x: number; y: number; s?: number; t: number; o?: number }> = ({ x, y, s = 1, t, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-6} y={0} width={12} height={110} rx={6} fill={K.white} opacity={0.85} />
    <ellipse cx={0} cy={-4} rx={130} ry={34} fill={K.white} opacity={0.35} />
    <rect x={-95} y={-60} width={190} height={60} rx={28} fill={C.case2} stroke={C.case3} strokeWidth={6} />
    <circle cx={0} cy={-30} r={14} fill={K.cold} opacity={0.5 + 0.5 * Math.sin(t * 6)} />
  </g>
);

/** Silueta con mochila enorme (prototipo de los años sesenta). */
export const Backpack: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-235} y={110} width={150} height={380} rx={20} fill={C.case2} stroke={C.case3} strokeWidth={6} />
    {[0, 1, 2].map((i) => <circle key={i} cx={-160} cy={170 + i * 90} r={26} fill={C.dark} stroke={K.flow} strokeWidth={4} />)}
    {[0, 1, 2].map((i) => <line key={i} x1={-160} y1={170 + i * 90} x2={-160 + 20 * Math.cos(t * 2 + i)} y2={170 + i * 90 + 20 * Math.sin(t * 2 + i)} stroke={K.flow} strokeWidth={4} />)}
    <Person x={0} y={0} s={0.8} />
    <path d="M-60 110 L -120 140" stroke={C.case3} strokeWidth={10} />
  </g>
);
