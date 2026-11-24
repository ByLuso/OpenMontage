// Dibujos SVG del episodio «sensores de aparcamiento». Todos son <g> para meter dentro de un <svg 1080×1920>. Sin marcas.
import React from "react";
import { K, FONT } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#06101F", body: "#3E6AA0", bumper: "#2B4A72", glass: "#1b3354", wall: "#56657c", brick: "#475569", mud: "#7A5B3C", ice: "#CFEFFF", tyre: "#151d2a" };

export const glow = (v: number, col: string, px = 16) => (v > 0.05 ? { filter: `drop-shadow(0 0 ${px * v}px ${col})` } : {});
const rad = (a: number) => (a * Math.PI) / 180;
/** Trozo de arco de radio r centrado en (cx, cy) entre los ángulos a0 y a1 (grados, 0 = derecha, 90 = abajo). */
export const arcD = (cx: number, cy: number, r: number, a0: number, a1: number) =>
  `M ${(cx + r * Math.cos(rad(a0))).toFixed(1)} ${(cy + r * Math.sin(rad(a0))).toFixed(1)} A ${r} ${r} 0 0 1 ${(cx + r * Math.cos(rad(a1))).toFixed(1)} ${(cy + r * Math.sin(rad(a1))).toFixed(1)}`;

/** Ondas de sonido que salen de (x, y) hacia el ángulo dir (grados). phase avanza con el tiempo. */
export const Waves: React.FC<{ x: number; y: number; dir: number; phase: number; n?: number; r0?: number; r1?: number; spread?: number; color?: string; w?: number; o?: number }> =
  ({ x, y, dir, phase, n = 4, r0 = 30, r1 = 300, spread = 34, color = K.cold, w = 9, o = 1 }) => (
    <g opacity={o}>
      {Array.from({ length: n }).map((_, k) => {
        const f = (((phase + k / n) % 1) + 1) % 1;
        const r = r0 + f * (r1 - r0);
        return spread >= 180 ? <circle key={k} cx={x} cy={y} r={r} stroke={color} strokeWidth={w} fill="none" opacity={(1 - f) * 0.95} /> : <path key={k} d={arcD(x, y, r, dir - spread, dir + spread)} stroke={color} strokeWidth={w} strokeLinecap="round" fill="none" opacity={(1 - f) * 0.95} />;
      })}
    </g>
  );

/** Sensor visto de frente (el «circulito»): aro + tapa. hi 0→1 = se enciende en amarillo. */
export const SensorFace: React.FC<{ x: number; y: number; r: number; hi?: number; o?: number }> = ({ x, y, r, hi = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o} style={glow(hi, K.flow, 14)}>
    <circle r={r * 1.18} fill={C.dark} opacity={0.55} />
    <circle r={r} fill={hi > 0.5 ? "#e8d27a" : C.case3} />
    <circle r={r * 0.78} fill={hi > 0.5 ? K.flow : "#b7c6da"} />
    <circle cx={-r * 0.28} cy={-r * 0.3} r={r * 0.2} fill="#ffffff" opacity={0.35} />
  </g>
);

/** Interior del sensor visto de frente: carcasa abierta con el disco piezoeléctrico (amarillo) y sus dos cables. */
export const SensorInside: React.FC<{ x: number; y: number; r: number; vib?: number; t: number }> = ({ x, y, r, vib = 0, t }) => {
  const j = vib * r * 0.03 * Math.sin(t * 90);
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * 1.18} fill={C.dark} />
      <circle r={r} fill={C.case1} stroke={C.case3} strokeWidth={r * 0.05} />
      <circle r={r * 0.78} fill="#0d1d33" />
      <g transform={`translate(${j} 0)`} style={glow(0.6 + 0.4 * vib, K.flow, 18)}>
        <circle r={r * 0.6} fill={C.case3} />
        <circle r={r * 0.46} fill={K.flow} />
        <circle r={r * 0.46} fill="none" stroke="#fff3b0" strokeWidth={r * 0.03} opacity={0.6} />
      </g>
    </g>
  );
};

/** Parachoques en primer plano (banda ancha) con agujeros para los sensores. */
export const BumperBand: React.FC<{ y: number; h: number }> = ({ y, h }) => (
  <g>
    <rect x={-40} y={y - h / 2} width={1160} height={h} rx={60} fill={C.bumper} />
    <rect x={-40} y={y - h / 2} width={1160} height={h * 0.16} rx={20} fill={C.case2} opacity={0.6} />
    <rect x={-40} y={y + h / 2 - h * 0.12} width={1160} height={h * 0.12} fill={C.dark} opacity={0.35} />
  </g>
);

/** Corte lateral del sensor (mira a la derecha): carcasa, membrana de aluminio, disco piezo y cables. bend = cuánto se dobla la membrana (−1…1). */
export const SensorCut: React.FC<{ x: number; y: number; s: number; bend?: number; hi?: number; wire?: number }> = ({ x, y, s, bend = 0, hi = 0, wire = 0 }) => {
  const b = bend * 16;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* cables hacia la izquierda */}
      <path d="M -150 -30 C -230 -30 -250 -80 -330 -80" stroke={wire > 0.05 ? K.flow : C.case3} strokeWidth={12} fill="none" style={glow(wire, K.flow, 12)} />
      <path d="M -150 30 C -230 30 -250 80 -330 80" stroke={wire > 0.05 ? K.flow : C.case3} strokeWidth={12} fill="none" style={glow(wire, K.flow, 12)} />
      {/* carcasa (vaso) */}
      <path d="M -160 -130 H 120 V -110 H -130 V 110 H 120 V 130 H -160 Z" fill={C.case2} stroke={C.case3} strokeWidth={4} />
      <rect x={-130} y={-110} width={250} height={220} fill="#0d1d33" />
      {/* espuma de relleno */}
      <rect x={-125} y={-100} width={170} height={200} rx={10} fill={C.case1} opacity={0.7} />
      {/* membrana metálica (la tapa que ves desde fuera) */}
      <path d={`M 120 -130 Q ${150 + b} 0 120 130`} stroke={C.case3} strokeWidth={22} fill="none" />
      {/* disco piezoeléctrico pegado a la membrana */}
      <g style={glow(hi, K.flow, 18)}>
        <path d={`M 88 -80 Q ${112 + b * 0.9} 0 88 80 L 64 80 Q ${88 + b * 0.9} 0 64 -80 Z`} fill={hi > 0.05 ? K.flow : "#d8c46a"} />
      </g>
      <path d="M 64 -40 C 20 -40 -40 -30 -150 -30" stroke={C.case3} strokeWidth={6} fill="none" />
      <path d="M 64 40 C 20 40 -40 30 -150 30" stroke={C.case3} strokeWidth={6} fill="none" />
    </g>
  );
};

/** Pared de ladrillo vertical (vista lateral) con la cara en x. */
export const Wall: React.FC<{ x: number; y0: number; y1: number; w?: number; hi?: number }> = ({ x, y0, y1, w = 90, hi = 0 }) => (
  <g>
    <rect x={x} y={y0} width={w} height={y1 - y0} fill={C.wall} />
    {Array.from({ length: Math.ceil((y1 - y0) / 50) }).map((_, i) => (
      <g key={i}>
        <path d={`M ${x} ${y0 + i * 50} H ${x + w}`} stroke={C.dark} strokeWidth={4} opacity={0.5} />
        <path d={`M ${x + (i % 2 ? w * 0.35 : w * 0.7)} ${y0 + i * 50} V ${Math.min(y1, y0 + i * 50 + 50)}`} stroke={C.dark} strokeWidth={4} opacity={0.5} />
      </g>
    ))}
    <rect x={x - 4} y={y0} width={8} height={y1 - y0} fill={hi > 0.05 ? K.flow : C.case3} style={glow(hi, K.flow, 12)} />
  </g>
);

/** Ida y vuelta de UN pulso entre el sensor (sx) y la pared (wx), a la altura y. u 0→1: 0-0,5 va (cian), 0,5-1 vuelve (amarillo). */
export const PingPong: React.FC<{ sx: number; wx: number; y: number; u: number; o?: number; spread?: number }> = ({ sx, wx, y, u, o = 1, spread = 22 }) => {
  const D = wx - sx;
  if (u < 0.5) {
    const r = Math.max(8, 2 * u * D);
    return (
      <g opacity={o}>
        {[0, 1, 2].map((k) => <path key={k} d={arcD(sx, y, Math.max(6, r - k * 26), -spread, spread)} stroke={K.cold} strokeWidth={10 - k * 2} strokeLinecap="round" fill="none" opacity={1 - k * 0.3} />)}
      </g>
    );
  }
  const r = Math.max(8, 2 * (u - 0.5) * D);
  return (
    <g opacity={o}>
      {[0, 1, 2].map((k) => <path key={k} d={arcD(wx, y, Math.max(6, r - k * 26), 180 - spread, 180 + spread)} stroke={K.flow} strokeWidth={10 - k * 2} strokeLinecap="round" fill="none" opacity={(1 - k * 0.3) * 0.95} />)}
    </g>
  );
};

/** Cronómetro: frac 0→1 = vuelta de la aguja. */
export const Stopwatch: React.FC<{ x: number; y: number; r: number; frac: number; hi?: number; o?: number }> = ({ x, y, r, frac, hi = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <rect x={-r * 0.16} y={-r * 1.32} width={r * 0.32} height={r * 0.22} rx={r * 0.05} fill={C.case3} />
    <rect x={-r * 0.06} y={-r * 1.14} width={r * 0.12} height={r * 0.16} fill={C.case3} />
    <circle r={r} fill={C.case1} stroke={hi > 0.05 ? K.flow : C.case3} strokeWidth={r * 0.1} style={glow(hi, K.flow, 12)} />
    {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-r * 0.025} y={-r * 0.86} width={r * 0.05} height={r * 0.14} fill={C.case3} transform={`rotate(${i * 30})`} />)}
    <path d={`M 0 0 L 0 ${-r * 0.8}`} stroke={K.flow} strokeWidth={r * 0.07} strokeLinecap="round" transform={`rotate(${frac * 360})`} />
    <circle r={r * 0.09} fill={K.flow} />
  </g>
);

/** Coche visto desde arriba con la trasera hacia arriba (y = borde del parachoques trasero). hiS = brillo de cada uno de los 4 sensores. */
export const CarTop: React.FC<{ x: number; y: number; s?: number; hiS?: number[] }> = ({ x, y, s = 1, hiS = [0, 0, 0, 0] }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-1, 1].map((sx) => <rect key={sx} x={sx * 238 - 26} y={70} width={52} height={120} rx={14} fill={C.tyre} />)}
    <path d="M -230 40 Q -240 0 -200 -6 H 200 Q 240 0 230 40 V 560 H -230 Z" fill={C.body} />
    <rect x={-190} y={60} width={380} height={130} rx={30} fill={C.glass} />
    <rect x={-170} y={210} width={340} height={300} rx={24} fill={C.case2} opacity={0.7} />
    <rect x={-236} y={-14} width={472} height={44} rx={22} fill={C.bumper} />
    {[-165, -55, 55, 165].map((sx, i) => <SensorFace key={i} x={sx} y={8} r={14} hi={hiS[i] ?? 0} />)}
  </g>
);

/** Coche de perfil (morro a la izquierda, trasera a la derecha en x). sensorHi = el sensor trasero se enciende. */
export const CarSide: React.FC<{ x: number; y: number; s?: number; sensorHi?: number; wheel?: number }> = ({ x, y, s = 1, sensorHi = 0, wheel = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -560 -20 Q -560 -80 -500 -90 L -380 -110 L -280 -210 Q -260 -228 -230 -228 H -60 Q -30 -228 -10 -205 L 50 -110 Q 0 -100 0 -60 V 10 Q 0 40 -30 40 H -540 Q -560 40 -560 -20 Z" fill={C.body} />
    <path d="M -360 -112 L -272 -198 H -170 V -112 Z" fill={C.glass} />
    <path d="M -150 -198 H -66 Q -50 -198 -38 -182 L 8 -112 H -150 Z" fill={C.glass} />
    <rect x={-40} y={-30} width={46} height={50} rx={14} fill={C.bumper} />
    <SensorFace x={-2} y={-8} r={9} hi={sensorHi} />
    {[-440, -120].map((wx) => (
      <g key={wx} transform={`translate(${wx} 40) rotate(${wheel})`}>
        <circle r={62} fill={C.tyre} />
        <circle r={34} fill={C.case3} />
        <rect x={-6} y={-30} width={12} height={60} fill={C.case1} />
      </g>
    ))}
  </g>
);

/** Murciélago (silueta) en (x, y), escala s, aleteo flap −1…1, mirando a la derecha. */
export const Bat: React.FC<{ x: number; y: number; s?: number; flap: number; color?: string; o?: number }> = ({ x, y, s = 1, flap, color = "#C7D3E3", o = 1 }) => {
  const f = flap * 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <path d={`M 0 0 C -40 ${-30 - f} -110 ${-60 - f} -170 ${-40 - f * 1.6} C -150 ${-10 - f * 0.8} -130 ${0 - f * 0.4} -120 ${20 - f * 0.2} C -95 5 -70 10 -55 25 C -40 10 -20 10 0 18 Z`} fill={color} />
      <path d={`M 0 0 C 40 ${-30 - f} 110 ${-60 - f} 170 ${-40 - f * 1.6} C 150 ${-10 - f * 0.8} 130 ${0 - f * 0.4} 120 ${20 - f * 0.2} C 95 5 70 10 55 25 C 40 10 20 10 0 18 Z`} fill={color} />
      <ellipse cx={0} cy={10} rx={26} ry={34} fill={color} />
      <circle cx={0} cy={-26} r={20} fill={color} />
      <path d="M -14 -40 L -10 -64 L 0 -44 Z M 14 -40 L 10 -64 L 0 -44 Z" fill={color} />
      <circle cx={-7} cy={-28} r={4} fill={C.dark} />
      <circle cx={7} cy={-28} r={4} fill={C.dark} />
    </g>
  );
};

/** Bichito (polilla) en (x, y). */
export const Moth: React.FC<{ x: number; y: number; s?: number; flap: number; o?: number }> = ({ x, y, s = 1, flap, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx={-22} cy={-4} rx={26} ry={16 + 8 * flap} fill={K.hot} opacity={0.85} transform="rotate(-25)" />
    <ellipse cx={22} cy={-4} rx={26} ry={16 + 8 * flap} fill={K.hot} opacity={0.85} transform="rotate(25)" />
    <ellipse cx={0} cy={0} rx={7} ry={22} fill="#ffd9b8" />
  </g>
);

/** Altavoz con ondas (para los pitidos). on 0→1 = suena. */
export const Speaker: React.FC<{ x: number; y: number; s?: number; on: number; color?: string }> = ({ x, y, s = 1, on, color = K.flow }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -70 -30 H -30 L 20 -75 V 75 L -30 30 H -70 Z" fill={on > 0.3 ? color : C.case3} style={glow(on, color, 20)} />
    {[50, 85, 120].map((r, i) => <path key={i} d={arcD(10, 0, r, -40, 40)} stroke={color} strokeWidth={12} strokeLinecap="round" fill="none" opacity={on * (1 - i * 0.22)} />)}
  </g>
);

/** Termómetro vertical. lvl 0→1, color del líquido. */
export const Thermo: React.FC<{ x: number; y: number; h: number; lvl: number; color: string }> = ({ x, y, h, lvl, color }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-26} y={-h} width={52} height={h} rx={26} fill={C.case1} stroke={C.case3} strokeWidth={5} />
    <circle cy={20} r={46} fill={C.case1} stroke={C.case3} strokeWidth={5} />
    <rect x={-12} y={-h * lvl + 6} width={24} height={h * lvl + 10} rx={12} fill={color} />
    <circle cy={20} r={32} fill={color} />
    {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={30} y={-h + 30 + i * ((h - 60) / 4)} width={22} height={6} fill={C.case3} />)}
  </g>
);

/** Ojo abierto (mirar). */
export const Eye: React.FC<{ x: number; y: number; s?: number; o?: number; look?: number }> = ({ x, y, s = 1, o = 1, look = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -110 0 Q 0 -90 110 0 Q 0 90 -110 0 Z" fill="#ffffff" />
    <circle cx={look * 20} r={40} fill={K.cold} />
    <circle cx={look * 20} r={18} fill={C.dark} />
    <circle cx={look * 20 - 10} cy={-12} r={7} fill="#ffffff" />
  </g>
);

/** Poste fino (vista lateral). */
export const Pole: React.FC<{ x: number; y0: number; y1: number; hi?: number }> = ({ x, y0, y1, hi = 0 }) => (
  <g>
    <rect x={x - 9} y={y0} width={18} height={y1 - y0} rx={8} fill={hi > 0.05 ? K.warn : C.case3} style={glow(hi, K.warn, 12)} />
    <rect x={x - 40} y={y1 - 10} width={80} height={14} rx={6} fill={C.case1} />
  </g>
);

/** Texto SVG sencillo. */
export const T: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; o?: number; anchor?: "start" | "middle" | "end" }> = ({ x, y, text, size = 36, color = K.white, o = 1, anchor = "middle" }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} opacity={o}>{text}</text>
);
