// Dibujos SVG del episodio «Cómo funciona el detector de monóxido de carbono». Coordenadas absolutas de 1080×1920.
// Amarillo = corriente/electrones, rojo = oxígeno del CO y alarma, cian = electrolito y oxígeno del aire, blanco/gris = gas.
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#040A14", shell: "#DCE5EF", shell2: "#B9C8D9", brass: "#E0B84A", skin: "#C98E74", ok: "#35C4F0" };
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Molécula de CO (carbono gris + oxígeno rojo). */
export const Mol: React.FC<{ x: number; y: number; s?: number; o?: number; rot?: number }> = ({ x, y, s = 1, o = 1, rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <circle cx={-10} r={14} fill={C.case3} stroke={C.dark} strokeWidth={2} />
    <circle cx={13} r={12} fill={K.warn} stroke={C.dark} strokeWidth={2} />
  </g>
);

/** Aparato visto de frente (disco con ranuras, piloto y botón). press 0-1: botón hundido; alarm 0-1: suena. */
export const Face: React.FC<{ x: number; y: number; s?: number; t: number; press?: number; alarm?: number; rot?: number; o?: number }> = ({ x, y, s = 1, t, press = 0, alarm = 0, rot = 0, o = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    {alarm > 0.01 && [0, 1, 2].map((k) => {
      const p = (t * 1.2 + k / 3) % 1;
      return <circle key={k} r={265 + 120 * p} fill="none" stroke={K.warn} strokeWidth={8} opacity={alarm * (1 - p) * 0.8} />;
    })}
    <circle r={272} fill={C.case1} />
    <circle r={256} fill={C.shell} />
    <circle r={206} fill={C.shell2} />
    {Array.from({ length: 12 }).map((_, k) => (
      <g key={k} transform={`rotate(${k * 30})`}><rect x={150} y={-9} width={86} height={18} rx={9} fill={C.case2} /></g>
    ))}
    <circle r={92} fill={C.case3} stroke={C.case1} strokeWidth={8} />
    <circle r={74 - 10 * press} fill={press > 0.1 ? K.flow : C.shell} stroke={C.case2} strokeWidth={6} />
    <circle cx={0} cy={-150} r={16} fill={alarm > 0.05 ? K.warn : K.cold} opacity={0.6 + 0.4 * Math.sin(t * 5)} style={{ filter: `drop-shadow(0 0 8px ${alarm > 0.05 ? K.warn : K.cold})` }} />
  </g>
);

/** Celda electroquímica en corte (centro 0,0; contenedor 520×560). gas: moléculas cayendo; react: reacción; cur: corriente (0-1); aging: desgaste (0-1). */
export const Cell: React.FC<{ x: number; y: number; s?: number; t: number; gas?: number; react?: number; cur?: number; hi?: string; meter?: boolean; aging?: number; o?: number }> =
  ({ x, y, s = 1, t, gas = 0, react = 0, cur = 0, hi = "", meter = true, aging = 0, o = 1 }) => {
    const mols = gas > 0.01 ? Array.from({ length: 11 }).map((_, i) => {
      const p = (t * 0.28 + rnd(i + 5)) % 1;
      const mx = -170 + 340 * rnd(i + 1);
      const y0 = -330, y1 = -122;
      const yy = y0 + (y1 - y0) * p;
      const gone = p > 0.93 && react > 0.3;
      return { mx: mx + 10 * Math.sin(t * 2 + i), yy, o: gone ? 0 : gas * Math.min(1, p * 6) * (yy > -270 && yy < -250 ? 0.6 : 1), rot: 40 * Math.sin(t + i) };
    }) : [];
    const o2 = react > 0.01 ? Array.from({ length: 6 }).map((_, i) => {
      const p = (t * 0.3 + rnd(i + 30)) % 1;
      return { x: -150 + 300 * rnd(i + 40), y: 40 + (100 - 40) * p, o: react * Math.sin(Math.PI * p) };
    }) : [];
    const elecO = 1 - 0.55 * aging;
    const wire = (d: string, k: number) => (
      <g>
        <path d={d} fill="none" stroke={C.case3} strokeWidth={9} strokeLinejoin="round" />
        {cur > 0.01 && <path d={d} fill="none" stroke={K.flow} strokeWidth={9} strokeLinejoin="round" strokeDasharray="6 26" strokeLinecap="round" strokeDashoffset={-(t * 90 * k)} opacity={clamp01(cur * 1.4)} style={{ filter: `drop-shadow(0 0 6px ${K.flow})` }} />}
      </g>
    );
    const ang = -60 + 120 * clamp01(cur);
    return (
      <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
        <rect x={-272} y={-292} width={544} height={584} rx={34} fill={C.case1} />
        <rect x={-260} y={-280} width={520} height={560} rx={26} fill={C.dark} stroke={hi === "box" ? K.flow : C.case3} strokeWidth={6} />
        {/* electrolito */}
        <rect x={-254} y={-170} width={508} height={444} rx={22} fill={K.cold} opacity={0.28} />
        {/* barrera porosa */}
        <g>
          <rect x={-260} y={-282} width={520} height={34} fill={hi === "barrier" ? K.flow : C.case2} opacity={hi === "barrier" ? 0.9 : 1} />
          {Array.from({ length: 11 }).map((_, k) => <circle key={k} cx={-225 + 45 * k} cy={-265} r={7} fill={C.dark} />)}
        </g>
        {/* electrodos */}
        <rect x={-210} y={-124} width={420} height={28} rx={8} fill={C.brass} opacity={elecO} stroke={hi === "work" ? K.flow : "none"} strokeWidth={5} />
        <rect x={-210} y={98} width={420} height={28} rx={8} fill={C.brass} opacity={elecO} />
        {react > 0.01 && <rect x={-210} y={-124} width={420} height={28} rx={8} fill={K.flow} opacity={react * (0.45 + 0.35 * Math.sin(t * 8))} style={{ filter: `drop-shadow(0 0 14px ${K.flow})` }} />}
        {/* oxígeno del aire al otro electrodo */}
        {o2.map((q, i) => <circle key={i} cx={q.x} cy={q.y} r={10} fill={K.cold} opacity={q.o} />)}
        {/* gas */}
        {mols.map((q, i) => <Mol key={i} x={q.mx} y={q.yy} o={q.o} rot={q.rot} />)}
        {/* cables y medidor */}
        {meter && (
          <g>
            {wire("M210,-110 H560 V-92", 1)}
            {wire("M210,112 H560 V92", 1)}
            <circle cx={560} cy={0} r={96} fill={C.case1} />
            <circle cx={560} cy={0} r={82} fill={C.shell} />
            <path d="M505,35 A62,62 0 0 1 615,35" fill="none" stroke={C.case3} strokeWidth={8} strokeLinecap="round" />
            <g transform={`translate(560,28) rotate(${ang})`}><rect x={-4} y={-66} width={8} height={72} rx={4} fill={K.warn} /></g>
            <circle cx={560} cy={28} r={11} fill={C.case1} />
          </g>
        )}
      </g>
    );
  };

/** Medidor suelto con aguja (centro x,y, radio r). */
export const Meter: React.FC<{ x: number; y: number; r?: number; v: number; o?: number }> = ({ x, y, r = 110, v, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${r / 96})`} opacity={o}>
    <circle r={96} fill={C.case1} /><circle r={82} fill={C.shell} />
    <path d="M-55,7 A62,62 0 0 1 55,7" fill="none" stroke={C.case3} strokeWidth={8} strokeLinecap="round" />
    <g transform={`translate(0,0) rotate(${-60 + 120 * clamp01(v)})`}><rect x={-4} y={-66} width={8} height={72} rx={4} fill={K.warn} /></g>
    <circle r={11} fill={C.case1} />
  </g>
);

/** Curva de alarma: gas (vertical) frente a tiempo (horizontal). Dos puntos: mucho gas (llega pronto) y poco gas (tarda). */
export const AlarmCurve: React.FC<{ x: number; y: number; w: number; h: number; p1: number; p2: number }> = ({ x, y, w, h, p1, p2 }) => {
  const thr = (u: number) => 0.2 + 0.7 * Math.pow(1 - u, 2);
  const pts = Array.from({ length: 41 }).map((_, k) => { const u = k / 40; return `${x + u * w},${y + h * (1 - thr(u))}`; });
  const g1 = 0.85, g2 = 0.3;
  const u1 = 1 - Math.sqrt((g1 - 0.2) / 0.7), u2 = 1 - Math.sqrt((g2 - 0.2) / 0.7);
  const e1 = u1 * p1, e2 = u2 * p2;
  return (
    <g>
      <path d={`M${x},${y} L${pts.join(" L")} L${x + w},${y} Z`} fill={K.warn} opacity={0.16} />
      <path d={`M${x},${y} V${y + h} H${x + w}`} fill="none" stroke={C.case3} strokeWidth={7} strokeLinecap="round" />
      <polyline points={pts.join(" ")} fill="none" stroke={K.flow} strokeWidth={8} strokeLinecap="round" />
      <path d={`M${x},${y + h * (1 - g1)} H${x + e1 * w}`} stroke={K.white} strokeWidth={6} strokeDasharray="4 12" strokeLinecap="round" />
      <circle cx={x + e1 * w} cy={y + h * (1 - g1)} r={15} fill={p1 >= 0.99 ? K.warn : K.white} />
      <path d={`M${x},${y + h * (1 - g2)} H${x + e2 * w}`} stroke={K.white} strokeWidth={6} strokeDasharray="4 12" strokeLinecap="round" />
      <circle cx={x + e2 * w} cy={y + h * (1 - g2)} r={15} fill={p2 >= 0.99 ? K.warn : K.white} />
    </g>
  );
};

/** Recta gas → corriente con un punto que sube. */
export const Linear: React.FC<{ x: number; y: number; w: number; h: number; p: number }> = ({ x, y, w, h, p }) => (
  <g>
    <path d={`M${x},${y} V${y + h} H${x + w}`} fill="none" stroke={C.case3} strokeWidth={7} strokeLinecap="round" />
    <path d={`M${x},${y + h} L${x + w * p},${y + h - h * p}`} stroke={K.flow} strokeWidth={9} strokeLinecap="round" />
    <path fill="none" d={`M${x + w * p},${y + h} V${y + h - h * p} H${x}`} stroke={K.white} strokeWidth={4} strokeDasharray="4 12" strokeLinecap="round" opacity={p > 0.02 ? 0.8 : 0} />
    <circle cx={x + w * p} cy={y + h - h * p} r={16} fill={K.flow} style={{ filter: `drop-shadow(0 0 8px ${K.flow})` }} />
  </g>
);

/** Cámara de humo simplificada (episodio 153): círculo oscuro con haz y sensor. */
export const MiniChamber: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={190} fill={C.case1} /><circle r={175} fill={C.dark} stroke={C.case3} strokeWidth={5} />
    <rect x={-150} y={-12} width={40} height={24} rx={6} fill={K.flow} />
    <path d="M-110,0 L120,0" stroke={K.flow} strokeWidth={8} opacity={0.9} />
    <path d="M40,0 L70,70" stroke={K.flow} strokeWidth={5} opacity={0.5 + 0.5 * Math.sin(t * 6)} strokeDasharray="8 8" />
    <circle cx={75} cy={85} r={18} fill={K.cold} />
    {Array.from({ length: 9 }).map((_, i) => <circle key={i} cx={-60 + 150 * rnd(i + 2) + 8 * Math.sin(t * 2 + i)} cy={-60 + 120 * rnd(i + 9) + 6 * Math.cos(t * 1.7 + i)} r={8 + 5 * rnd(i)} fill={C.case3} opacity={0.7} />)}
  </g>
);

export const Cross: React.FC<{ x: number; y: number; r?: number; color?: string; p?: number }> = ({ x, y, r = 40, color = K.warn, p = 1 }) => p <= 0.01 ? null : (
  <g opacity={p} stroke={color} strokeWidth={14} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px #000)" }}>
    <path d={`M${x - r},${y - r} L${x + r},${y + r}`} /><path d={`M${x + r},${y - r} L${x - r},${y + r}`} />
  </g>
);

/** Nariz esquemática (para «no se huele»). */
export const Nose: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill="none" stroke={K.white} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
    <path d="M0,-80 C10,-30 40,10 50,40 C60,70 20,80 0,60 C-20,80 -60,70 -50,40 C-40,10 -10,-30 0,-80 Z" fill={C.skin} stroke={C.case1} />
    <circle cx={-18} cy={50} r={8} fill={C.dark} stroke="none" /><circle cx={18} cy={50} r={8} fill={C.dark} stroke="none" />
  </g>
);

/** Dedo que pulsa. */
export const Finger: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-34} y={0} width={68} height={230} rx={34} fill={C.skin} stroke="#8A5A46" strokeWidth={5} />
    <rect x={-18} y={10} width={36} height={22} rx={11} fill="#E3B29B" />
  </g>
);

/** Plano de casa visto desde arriba: dormitorio a la izquierda, cocina a la derecha. */
export const Plan: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={0} y={0} width={840} height={520} rx={16} fill="rgba(6,16,31,0.7)" stroke={C.case3} strokeWidth={8} />
    <path d="M420,0 V200 M420,320 V520" stroke={C.case3} strokeWidth={8} />
    {/* cama */}
    <rect x={70} y={150} width={240} height={290} rx={16} fill={C.case2} />
    <rect x={90} y={170} width={90} height={60} rx={14} fill={C.shell} /><rect x={200} y={170} width={90} height={60} rx={14} fill={C.shell} />
    {/* fogones */}
    <rect x={500} y={330} width={200} height={140} rx={14} fill={C.case2} />
    {[[550, 365], [650, 365], [550, 435], [650, 435]].map(([a, b], k) => <circle key={k} cx={a} cy={b} r={24} fill="none" stroke={C.case3} strokeWidth={6} />)}
    {/* caldera con llama */}
    <rect x={700} y={40} width={110} height={150} rx={14} fill={C.case2} />
    <path d={`M755,${150 - 5 * Math.sin(t * 9)} C725,120 745,100 755,80 C765,100 785,120 755,${150 - 5 * Math.sin(t * 9)} Z`} fill={K.hot} />
  </g>
);

export const Det: React.FC<{ x: number; y: number; r?: number; color?: string }> = ({ x, y, r = 34, color = C.shell }) => (
  <g><circle cx={x} cy={y} r={r + 6} fill={C.case1} /><circle cx={x} cy={y} r={r} fill={color} /><circle cx={x} cy={y} r={r * 0.38} fill={C.case3} /></g>
);
