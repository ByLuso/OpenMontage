// Dibujos SVG del episodio «Cómo funciona el alcoholímetro». Coordenadas absolutas de 1080×1920.
// Colores de código: naranja = luz infrarroja/energía, cian = aire/aliento, amarillo = corriente/lo importante,
// rojo = sangre esquemática y error, lila = moléculas de alcohol (etanol). Grises azulados para carcasas. Sin marcas: aparatos genéricos.
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F", inner: "#0B1A30", pt: "#C9D6E6", elec: "#1E3A5F",
  etoh: "#C58BFF", blood: "#E53935", glass: "rgba(201,214,230,0.18)", purple: "#8E3FD0", orange: "#F08A24", green: "#3FAF5A" };

export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Molécula de alcohol (esquema de tres bolitas). */
export const Mol: React.FC<{ x: number; y: number; s?: number; o?: number; rot?: number; color?: string }> = ({ x, y, s = 1, o = 1, rot = 0, color = C.etoh }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <line x1={-14} y1={0} x2={14} y2={-6} stroke={color} strokeWidth={5} />
    <circle cx={-14} cy={0} r={11} fill={color} />
    <circle cx={6} cy={-4} r={11} fill={color} />
    <circle cx={22} cy={-12} r={7} fill="#FFFFFF" opacity={0.9} />
  </g>
);

/** Línea de flujo animada (trazo discontinuo que avanza). */
export const Flow: React.FC<{ d: string; t: number; color?: string; w?: number; o?: number; speed?: number }> = ({ d, t, color = K.flow, w = 10, o = 1, speed = 160 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    <path d={d} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={w + 8} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="22 18" strokeDashoffset={-t * speed} />
  </g>
);

/** Rayo (electricidad). */
export const Bolt: React.FC<{ x: number; y: number; s?: number; o?: number; color?: string }> = ({ x, y, s = 1, o = 1, color = K.flow }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M14,-70 L-34,8 L-4,8 L-16,70 L34,-12 L4,-12 Z" fill={color} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 14px ${color})` }} />
  </g>
);

/** Pila de combustible en corte: platino arriba y abajo, electrolito en medio, cable con medidor de corriente. `rate` 0-1 = cuánto alcohol llega. */
export const FuelCell: React.FC<{ x: number; y: number; s?: number; t: number; rate: number; o?: number; meter?: boolean; mols?: number }> = ({ x, y, s = 1, t, rate, o = 1, meter = true, mols = 1 }) => {
  const nM = Math.round(3 + 9 * rate);
  const nE = Math.round(2 + 10 * rate);
  const ang = -70 + 140 * clamp01(rate);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      {/* cable exterior: del platino de arriba al de abajo pasando por el medidor */}
      <path d="M-230,-75 L-300,-75 L-300,195 L300,195 L300,75 L230,75" fill="none" stroke={C.case3} strokeWidth={10} strokeLinejoin="round" />
      {meter && rate > 0.01 && (
        <path d="M-230,-75 L-300,-75 L-300,195 L300,195 L300,75 L230,75" fill="none" stroke={K.flow} strokeWidth={10} strokeLinejoin="round"
          strokeDasharray="6 30" strokeDashoffset={-t * (60 + 240 * rate)} opacity={0.4 + 0.6 * rate} style={{ filter: `drop-shadow(0 0 8px ${K.flow})` }} />
      )}
      {meter && (
        <g transform="translate(0,195)">
          <circle r={62} fill={C.ink} stroke={C.case3} strokeWidth={8} />
          <path d="M-42,10 A44,44 0 0 1 42,10" fill="none" stroke={C.case2} strokeWidth={6} />
          <line x1={0} y1={10} x2={44 * Math.sin((ang * Math.PI) / 180)} y2={10 - 44 * Math.cos((ang * Math.PI) / 180)} stroke={K.flow} strokeWidth={7} strokeLinecap="round" />
          <circle cy={10} r={8} fill={K.flow} />
        </g>
      )}
      {/* capas */}
      <rect x={-230} y={-95} width={460} height={40} rx={10} fill={C.pt} stroke={C.ink} strokeWidth={5} />
      <rect x={-230} y={-55} width={460} height={110} fill={C.elec} stroke={C.ink} strokeWidth={5} />
      <rect x={-230} y={55} width={460} height={40} rx={10} fill={C.pt} stroke={C.ink} strokeWidth={5} />
      {/* iones que bajan por el electrolito */}
      {Array.from({ length: 6 }).map((_, k) => { const p = (t * 0.8 + k / 6) % 1; return <circle key={k} cx={-180 + k * 72} cy={-45 + p * 90} r={7} fill={K.white} opacity={0.6 * Math.sin(Math.PI * p) * (0.3 + 0.7 * rate)} />; })}
      {/* moléculas de alcohol que caen sobre el platino de arriba */}
      {mols > 0 && Array.from({ length: nM }).map((_, k) => {
        const p = (t * 0.7 + rnd(k) ) % 1;
        const xx = -200 + 400 * rnd(k + 20); const yy = -300 + 200 * p;
        return <Mol key={k} x={xx} y={yy} s={0.9} rot={40 * Math.sin(t * 2 + k)} o={mols * Math.min(1, (1 - p) * 4) * Math.min(1, p * 5)} />;
      })}
      {/* chispitas de electrones en el platino */}
      {Array.from({ length: nE }).map((_, k) => { const p = (t * 1.6 + rnd(k + 50)) % 1; return <circle key={k} cx={-210 + 420 * rnd(k + 70)} cy={-100 - 30 * p} r={6} fill={K.flow} opacity={rate * Math.sin(Math.PI * p)} />; })}
    </g>
  );
};

/** Alcoholímetro de mano genérico. `open` 0-1 separa la tapa frontal hacia la derecha y deja ver la pila. */
export const Device: React.FC<{ id: string; x: number; y: number; s?: number; t: number; open?: number; reading?: string; readColor?: string; glow?: number; shellDx?: number; blow?: number }> =
  ({ id, x, y, s = 1, t, open = 0, reading = "", readColor = K.flow, glow = 0, shellDx = 360, blow = 0 }) => (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <defs><clipPath id={`in-${id}`}><rect x={-140} y={-250} width={280} height={500} rx={60} /></clipPath></defs>
      {/* boquilla */}
      <rect x={-34} y={-400} width={68} height={170} rx={20} fill="#E8EEF6" stroke={C.ink} strokeWidth={6} />
      <rect x={-20} y={-400} width={40} height={14} rx={6} fill={C.ink} opacity={0.6} />
      {blow > 0.01 && Array.from({ length: 4 }).map((_, k) => { const p = (t * 1.5 + k / 4) % 1; return <circle key={k} cx={4 * Math.sin(t * 8 + k)} cy={-470 + p * 120} r={10 + 6 * p} fill={K.cold} opacity={blow * 0.8 * Math.sin(Math.PI * p)} />; })}
      {/* interior */}
      <rect x={-150} y={-260} width={300} height={520} rx={70} fill={C.inner} stroke={C.ink} strokeWidth={8} />
      <g clipPath={`url(#in-${id})`}>
        <path d="M0,-230 L0,-150" stroke={K.cold} strokeWidth={14} opacity={0.5} />
        <FuelCell x={0} y={-60} s={0.5} t={t} rate={glow} meter={false} mols={glow} />
        <path d="M-115,-60 L-120,140 L120,140 L115,-30" fill="none" stroke={glow > 0.05 ? K.flow : C.case3} strokeWidth={8} strokeDasharray={glow > 0.05 ? "6 16" : undefined} strokeDashoffset={-t * 120}
          style={glow > 0.05 ? { filter: `drop-shadow(0 0 8px ${K.flow})` } : undefined} />
        <rect x={-70} y={120} width={140} height={70} rx={10} fill="#1E5A46" stroke={C.ink} strokeWidth={4} />
        {[0, 1, 2, 3].map((k) => <rect key={k} x={-56 + k * 32} y={136} width={20} height={36} rx={3} fill="#0F2E24" />)}
      </g>
      <Bolt x={0} y={-60} s={0.9 * glow} o={glow > 0.3 ? (glow - 0.3) / 0.7 : 0} />
      {/* tapa frontal */}
      <g transform={`translate(${shellDx * open},${-20 * open}) rotate(${8 * open})`}>
        <rect x={-150} y={-260} width={300} height={520} rx={70} fill={C.case2} stroke={C.ink} strokeWidth={8} />
        <rect x={-150} y={-260} width={300} height={520} rx={70} fill="none" stroke={C.case3} strokeWidth={4} opacity={0.6} transform="translate(0,6) scale(0.97)" />
        <rect x={-110} y={-200} width={220} height={130} rx={18} fill={C.ink} stroke={C.case1} strokeWidth={6} />
        <text x={0} y={-118} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={58} fill={readColor} style={{ filter: `drop-shadow(0 0 8px ${readColor})` }}>{reading}</text>
        <circle cx={0} cy={90} r={46} fill={C.case1} stroke={C.ink} strokeWidth={6} />
        <circle cx={0} cy={90} r={30} fill={C.case3} />
        {[0, 1, 2].map((k) => <rect key={k} x={-60} y={170 + k * 22} width={120} height={8} rx={4} fill={C.case1} />)}
      </g>
    </g>
  );

/** Perfil neutro de cabeza (silueta) mirando a la derecha. Boca en (x+118, y+40) a escala 1. */
export const Head: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-20,-150 C60,-152 110,-100 112,-30 L132,8 L114,18 L120,36 L112,48 L116,62 C112,90 80,96 50,92 L40,150 L-60,150 L-56,80 C-110,40 -120,-40 -90,-100 C-75,-130 -50,-148 -20,-150 Z"
      fill={C.case1} stroke={C.case3} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

/** Pulmones esquemáticos. */
export const Lungs: React.FC<{ x: number; y: number; s?: number; t: number; o?: number; air?: number }> = ({ x, y, s = 1, t, o = 1, air = 0 }) => {
  const br = 1 + 0.04 * Math.sin(t * 2.5);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      <g transform={`scale(${br})`}>
        <path d="M-30,-120 C-120,-130 -190,-20 -190,90 C-190,170 -120,190 -50,160 C-30,150 -26,120 -26,90 Z" fill="#C2566B" stroke={C.ink} strokeWidth={6} />
        <path d="M30,-120 C120,-130 190,-20 190,90 C190,170 120,190 50,160 C30,150 26,120 26,90 Z" fill="#C2566B" stroke={C.ink} strokeWidth={6} />
      </g>
      <path d="M0,-220 L0,-90 M0,-90 L-70,-30 M-70,-30 L-110,40 M-70,-30 L-60,70 M0,-90 L70,-30 M70,-30 L110,40 M70,-30 L60,70" fill="none" stroke="#F2D6DC" strokeWidth={14} strokeLinecap="round" />
      {air > 0.01 && <path d="M0,-90 L0,-220" stroke={K.cold} strokeWidth={10} strokeDasharray="14 14" strokeDashoffset={t * 80} opacity={air} />}
    </g>
  );
};

/** Gota de sangre. */
export const Drop: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M0,-90 C30,-40 60,-10 60,30 C60,66 33,90 0,90 C-33,90 -60,66 -60,30 C-60,-10 -30,-40 0,-90 Z" fill={C.blood} stroke={C.ink} strokeWidth={6} />
    <ellipse cx={-22} cy={20} rx={10} ry={18} fill="#FFFFFF" opacity={0.35} />
  </g>
);

/** Nube de aliento. */
export const Cloud: React.FC<{ x: number; y: number; s?: number; o?: number; t: number }> = ({ x, y, s = 1, o = 1, t }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y}) scale(${s * (1 + 0.03 * Math.sin(t * 3))})`} opacity={o}>
    <path d="M-90,40 C-140,40 -140,-20 -95,-25 C-100,-75 -30,-90 -10,-50 C10,-95 90,-85 85,-30 C135,-30 140,40 90,40 Z" fill="rgba(53,196,240,0.35)" stroke={K.cold} strokeWidth={7} />
  </g>
);

/** Reloj de espera. `p` 0-1 avance. */
export const Timer: React.FC<{ x: number; y: number; r?: number; p: number; o?: number }> = ({ x, y, r = 70, p, o = 1 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <circle r={r} fill={C.ink} stroke={C.case3} strokeWidth={8} />
    {p > 0.001 && <path d={`M0,0 L0,${-r + 12} A${r - 12},${r - 12} 0 ${p > 0.5 ? 1 : 0} 1 ${(r - 12) * Math.sin(2 * Math.PI * Math.min(p, 0.999))},${-(r - 12) * Math.cos(2 * Math.PI * Math.min(p, 0.999))} Z`} fill={K.cold} opacity={0.8} />}
    <rect x={-14} y={-r - 26} width={28} height={18} rx={4} fill={C.case3} />
  </g>
);

/** Tubo de cristal con cristales: `p` 0-1 avance del verde desde la boquilla (izquierda). */
export const CrystalTube: React.FC<{ x: number; y: number; w?: number; p: number; t: number }> = ({ x, y, w = 700, p, t }) => {
  const n = 46;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-w / 2 - 70} y={-26} width={90} height={52} rx={14} fill="#E8EEF6" stroke={C.ink} strokeWidth={5} />
      <rect x={-w / 2} y={-55} width={w} height={110} rx={55} fill={C.glass} stroke={C.pt} strokeWidth={6} />
      {Array.from({ length: n }).map((_, k) => {
        const fx = k / (n - 1); const g = clamp01((p * 1.08 - fx) * 8);
        const col = g > 0.5 ? C.green : C.orange;
        return [0, 1, 2].map((j) => (
          <rect key={`${k}-${j}`} x={-w / 2 + 40 + fx * (w - 80) - 7} y={-34 + j * 22 + 6 * rnd(k * 3 + j)} width={14} height={14} rx={3} fill={col} transform={`rotate(${45 * rnd(k + j * 7)} ${-w / 2 + 40 + fx * (w - 80)} ${-27 + j * 22})`} />
        ));
      })}
      <rect x={-w / 2 + 10} y={-46} width={w - 20} height={16} rx={8} fill="#FFFFFF" opacity={0.18} />
      <path d={`M${w / 2},0 L${w / 2 + 40},0`} stroke={C.pt} strokeWidth={14} />
      <ellipse cx={w / 2 + 120 + 6 * Math.sin(t * 2)} cy={0} rx={90 + 10 * Math.sin(t * 2)} ry={110} fill="rgba(53,196,240,0.25)" stroke={K.cold} strokeWidth={6} />
    </g>
  );
};
