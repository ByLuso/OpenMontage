// Dibujos SVG del episodio «mando del garaje». Todos son <g> para meter dentro de un <svg 1080×1920>.
import React from "react";
import { K, FONT } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", pcb: "#123156", dark: "#06101F" };

/** Mando de garaje (llavero). open 0→1 separa las dos mitades de la carcasa y deja ver la placa. */
export const Remote: React.FC<{ cx: number; cy: number; s?: number; open?: number; press?: number; led?: number; old?: boolean; t: number }> =
  ({ cx, cy, s = 1, open = 0, press = 0, led = 0, old = false, t }) => {
    const W = 92 * open;
    const half = (side: 1 | -1) =>
      `M 0 -250 L ${side * -95} -250 Q ${side * -190} -250 ${side * -190} -150 L ${side * -190} 150 Q ${side * -190} 250 ${side * -95} 250 L 0 250 Z`;
    const shell = old ? "#566b86" : C.case2;
    const btn = (x: number) => (
      <g transform={`translate(${x} 40) scale(${1 - 0.08 * press})`}>
        <circle r={62} fill={C.case1} />
        <circle r={52} fill={press > 0.5 ? "#c9d6e6" : C.case3} />
        <circle r={52} fill="none" stroke={C.dark} strokeOpacity={0.25} strokeWidth={4} />
      </g>
    );
    return (
      <g transform={`translate(${cx} ${cy}) scale(${s})`}>
        {/* placa interior */}
        <g opacity={Math.min(1, open * 3)}>
          <rect x={-165} y={-225} width={330} height={450} rx={60} fill={C.pcb} stroke={K.flow} strokeOpacity={0.35} strokeWidth={4} />
          <path d="M -130 -190 H 130 V 190" fill="none" stroke={K.flow} strokeWidth={8} strokeLinecap="round" opacity={0.85} />
          <path d="M -60 -60 H -120 V 60 M 60 -60 H 120 V 20" fill="none" stroke={K.flow} strokeWidth={5} opacity={0.6} />
          {old ? null : <>
            <rect x={-64} y={-118} width={128} height={104} rx={10} fill={C.dark} stroke={K.flow} strokeWidth={5}
              style={{ filter: `drop-shadow(0 0 ${10 + 8 * Math.sin(t * 5)}px ${K.flow})` }} />
            {[-40, -14, 12, 38].map((x) => <rect key={x} x={x - 5} y={-132} width={10} height={14} fill={C.case3} />)}
            {[-40, -14, 12, 38].map((x) => <rect key={x + 1} x={x - 5} y={-14} width={10} height={14} fill={C.case3} />)}
          </>}
          <circle cx={0} cy={110} r={78} fill={C.case3} stroke={C.case1} strokeWidth={8} />
          <text x={0} y={128} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.case1}>+</text>
        </g>
        {/* carcasa en dos mitades */}
        <g transform={`translate(${-W} ${-8 * open}) rotate(${-3 * open})`}>
          <path d={half(1)} fill={shell} stroke={C.case3} strokeWidth={6} />
          {btn(-88)}
        </g>
        <g transform={`translate(${W} ${-8 * open}) rotate(${3 * open})`}>
          <path d={half(-1)} fill={shell} stroke={C.case3} strokeWidth={6} />
          {btn(88)}
          <circle cx={60} cy={-170} r={14} fill={led > 0.05 ? K.warn : "#5a2630"} style={led > 0.05 ? { filter: `drop-shadow(0 0 ${14 * led}px ${K.warn})` } : {}} />
        </g>
        {open < 0.05 && <line x1={0} y1={-246} x2={0} y2={246} stroke={C.case1} strokeWidth={3} opacity={0.5} />}
      </g>
    );
  };

/** Ondas de radio saliendo de (x, y) hacia la derecha (ang en grados). reach = alcance en px. */
export const Waves: React.FC<{ x: number; y: number; t: number; reach?: number; color?: string; ang?: number; o?: number; speed?: number }> =
  ({ x, y, t, reach = 380, color = K.flow, ang = 0, o = 1, speed = 0.9 }) => {
    if (o <= 0.01) return null;
    const arcs = [0, 1, 2, 3].map((i) => {
      const p = (t * speed + i / 4) % 1;
      const r = 30 + p * reach;
      const a = (40 * Math.PI) / 180;
      const d = `M ${r * Math.cos(-a)} ${r * Math.sin(-a)} A ${r} ${r} 0 0 1 ${r * Math.cos(a)} ${r * Math.sin(a)}`;
      return <path key={i} d={d} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" opacity={(1 - p) * o} />;
    });
    return <g transform={`translate(${x} ${y}) rotate(${ang})`} style={{ filter: `drop-shadow(0 0 8px ${color})` }}>{arcs}</g>;
  };

/** Puerta de garaje. open 0→1 la sube. */
export const Door: React.FC<{ x: number; y: number; w: number; h: number; open?: number }> = ({ x, y, w, h, open = 0 }) => {
  const ph = h * (1 - open);
  const slats = Math.ceil(ph / 60);
  return (
    <g>
      <rect x={x - 18} y={y - 18} width={w + 36} height={h + 18} rx={10} fill={C.case1} stroke={C.case3} strokeWidth={5} />
      <rect x={x} y={y} width={w} height={h} fill={C.dark} />
      <rect x={x} y={y + h - 14} width={w} height={14} fill={K.flow} opacity={0.35 * open} />
      {/* coche dentro */}
      <g transform={`translate(${x + w / 2} ${y + h - 20}) scale(${w / 340})`} opacity={0.9}>
        <path d="M -140 0 V -50 Q -140 -70 -115 -72 L -80 -120 Q -72 -132 -55 -132 H 55 Q 72 -132 80 -120 L 115 -72 Q 140 -70 140 -50 V 0 Z" fill={K.hot} />
        <path d="M -62 -116 H 62 L 92 -76 H -92 Z" fill={C.dark} opacity={0.7} />
        <circle cx={-80} cy={0} r={26} fill={C.dark} /><circle cx={80} cy={0} r={26} fill={C.dark} />
        <rect x={-130} y={-56} width={28} height={14} rx={5} fill={K.flow} /><rect x={102} y={-56} width={28} height={14} rx={5} fill={K.flow} />
      </g>
      <rect x={x} y={y} width={w} height={ph} fill={C.case2} />
      {Array.from({ length: slats }).map((_, i) => {
        const yy = y + ph - (i + 1) * 60;
        return yy > y - 1 ? <line key={i} x1={x} x2={x + w} y1={yy} y2={yy} stroke={C.case1} strokeWidth={6} /> : null;
      })}
      {ph > 30 && <rect x={x + w / 2 - 40} y={y + ph - 34} width={80} height={14} rx={7} fill={C.case3} />}
    </g>
  );
};

/** Motor/receptor del garaje con antena y pantallita. */
export const Motor: React.FC<{ cx: number; cy: number; s?: number; screen?: string; screenColor?: string; t: number; glow?: number }> =
  ({ cx, cy, s = 1, screen = "", screenColor = K.flow, t, glow = 0 }) => (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <line x1={110} y1={-100} x2={150} y2={-200} stroke={C.case3} strokeWidth={8} strokeLinecap="round" />
      <circle cx={150} cy={-200} r={10} fill={K.flow} opacity={0.5 + 0.5 * Math.sin(t * 6)} />
      <rect x={-160} y={-100} width={320} height={200} rx={26} fill={C.case1} stroke={C.case3} strokeWidth={6}
        style={glow > 0.01 ? { filter: `drop-shadow(0 0 ${24 * glow}px ${K.flow})` } : {}} />
      <rect x={-120} y={-66} width={240} height={96} rx={12} fill={C.dark} stroke={screenColor} strokeOpacity={0.6} strokeWidth={4} />
      <text x={0} y={2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={screenColor}>{screen}</text>
      {[-90, -60, -30].map((x) => <rect key={x} x={x} y={52} width={18} height={30} rx={4} fill={C.case2} />)}
      <circle cx={100} cy={66} r={14} fill={K.cold} opacity={0.6 + 0.4 * Math.sin(t * 3)} />
    </g>
  );

/** Llave (el secreto compartido). */
export const KeyIcon: React.FC<{ x: number; y: number; s?: number; color?: string; o?: number; rot?: number }> = ({ x, y, s = 1, color = K.flow, o = 1, rot = 0 }) =>
  o <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o} style={{ filter: `drop-shadow(0 0 10px ${color})` }}>
      <circle cx={-60} cy={0} r={36} fill="none" stroke={color} strokeWidth={16} />
      <rect x={-26} y={-8} width={110} height={16} rx={6} fill={color} />
      <rect x={52} y={6} width={14} height={26} fill={color} />
      <rect x={74} y={6} width={14} height={36} fill={color} />
    </g>
  );

/** Grabadora maliciosa (genérica): caja roja con punto REC. */
export const Recorder: React.FC<{ cx: number; cy: number; s?: number; rec?: number; t: number }> = ({ cx, cy, s = 1, rec = 0, t }) => (
  <g transform={`translate(${cx} ${cy}) scale(${s})`}>
    <line x1={70} y1={-60} x2={100} y2={-140} stroke={C.case3} strokeWidth={8} strokeLinecap="round" />
    <rect x={-120} y={-64} width={240} height={128} rx={20} fill="#3a1c26" stroke={K.warn} strokeWidth={6} />
    <circle cx={-62} cy={0} r={26} fill={K.warn} opacity={rec > 0.05 ? 0.55 + 0.45 * Math.sin(t * 9) : 0.35} />
    <text x={22} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={K.warn}>REC</text>
  </g>
);

/** Fila de interruptores DIP. states: 1 = arriba. */
export const Dip: React.FC<{ cx: number; cy: number; states: number[]; w?: number; hi?: number }> = ({ cx, cy, states, w = 700, hi = 0 }) => {
  const n = states.length, cw = w / n;
  return (
    <g>
      <rect x={cx - w / 2 - 24} y={cy - 110} width={w + 48} height={220} rx={18} fill="#b8322f" stroke={C.dark} strokeWidth={5} />
      {states.map((st, i) => {
        const x = cx - w / 2 + i * cw + cw / 2;
        return (
          <g key={i}>
            <rect x={x - cw * 0.32} y={cy - 80} width={cw * 0.64} height={160} rx={8} fill={C.dark} />
            <rect x={x - cw * 0.26} y={st ? cy - 74 : cy + 4} width={cw * 0.52} height={70} rx={6} fill={hi > 0.5 ? K.flow : K.white} />
            <text x={x} y={cy + 140} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={K.white} opacity={0.75}>{i + 1}</text>
          </g>
        );
      })}
    </g>
  );
};

/** Pila con nivel 0-1. */
export const Battery: React.FC<{ x: number; y: number; level: number; s?: number }> = ({ x, y, level, s = 1 }) => {
  const col = level < 0.3 ? K.warn : level < 0.6 ? K.hot : K.cold;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-110} y={-50} width={210} height={100} rx={16} fill={C.dark} stroke={K.white} strokeWidth={8} />
      <rect x={104} y={-20} width={18} height={40} rx={4} fill={K.white} />
      <rect x={-98} y={-38} width={186 * Math.max(0.04, level)} height={76} rx={8} fill={col} style={{ filter: `drop-shadow(0 0 10px ${col})` }} />
    </g>
  );
};

/** Recta numérica de contadores: celdas de a a b. col(n) decide el color de cada celda. */
export const NumberLine: React.FC<{ a: number; b: number; x0: number; x1: number; y: number; col: (n: number) => string; label?: (n: number) => string }> =
  ({ a, b, x0, x1, y, col, label = (n) => String(n) }) => {
    const n = b - a + 1, cw = (x1 - x0) / n;
    return (
      <g>
        {Array.from({ length: n }).map((_, i) => {
          const v = a + i, c = col(v);
          return (
            <g key={i}>
              <rect x={x0 + i * cw + 3} y={y - 44} width={cw - 6} height={88} rx={10} fill={c} opacity={0.9} />
              <text x={x0 + i * cw + cw / 2} y={y + 13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.dark}>{label(v)}</text>
            </g>
          );
        })}
      </g>
    );
  };

/** Caja de texto dentro del SVG (códigos). */
export const Tag: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; o?: number; w?: number }> = ({ x, y, text, color = K.white, size = 46, o = 1, w }) => {
  if (o <= 0.01) return null;
  const ww = w ?? text.length * size * 0.7 + 40;
  return (
    <g opacity={o}>
      <rect x={x - ww / 2} y={y - size * 0.85} width={ww} height={size * 1.6} rx={14} fill="rgba(6,16,31,0.88)" stroke={color} strokeWidth={4} />
      <text x={x} y={y + size * 0.33} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} letterSpacing={2}>{text}</text>
    </g>
  );
};
