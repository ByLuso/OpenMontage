// Dibujos SVG planos del episodio «Cómo hace niebla fría un humidificador ultrasónico» (n.º 165).
// Colores de código: cian = agua/aire, amarillo = lo importante (el disco y sus ondas), naranja = calor, blanco = niebla, rojo = error.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = { shell: "#2B4A72", shell2: "#3E6AA0", light: "#9FB3CC", dark: "#132A4A", deep: "#0B1E38", ink: "#06101F", mineral: "#D9DEE6" };
const W = 1080, H = 1920;
export const Svg: React.FC<{ children: React.ReactNode; o?: number }> = ({ children, o = 1 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>{children}</svg>
);
const rnd = (k: number) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- geometría del aparato en corte (cuerpo x 220-860, y 460-1130) ----------
export const U = {
  x0: 220, x1: 860, y0: 460, y1: 1130,
  basin: { x0: 262, x1: 818, top: 840, floor: 1060 },
  disc: { x: 540, y: 1052, r: 78 },
  fan: { x: 345, y: 640, r: 72 },
  tank: { x0: 650, x1: 826, y0: 520, y1: 790 },
  nozzle: { x: 540, y: 430 },
  float: { x: 760 },
};
/** Altura de la superficie del agua para un nivel 0..1 (1 = lleno). */
export const surfY = (level: number) => U.basin.floor - 18 - (U.basin.floor - 18 - 880) * level;

/** Gotitas de niebla que suben desde (x, y0) hasta y1 y se deshacen. */
export const Mist: React.FC<{ t: number; o: number; x: number; y0: number; y1: number; n?: number; spread?: number; speed?: number; widen?: number }> =
  ({ t, o, x, y0, y1, n = 36, spread = 40, speed = 0.35, widen = 1.8 }) => {
    if (o <= 0.01) return null;
    return (
      <g>
        {Array.from({ length: n }).map((_, k) => {
          const u = (t * speed + k / n) % 1;
          const y = y0 + (y1 - y0) * u;
          const sx = spread * (1 + widen * u);
          const xx = x + (rnd(k) - 0.5) * 2 * sx + 10 * Math.sin(t * 2 + k);
          const r = 7 + 16 * u * rnd(k + 9);
          const a = Math.min(1, u * 6) * (1 - u) * 0.85;
          return <circle key={k} cx={xx} cy={y} r={r} fill={K.white} opacity={o * a} />;
        })}
      </g>
    );
  };

/** Ondas de ultrasonido: arcos amarillos que suben del disco a la superficie. */
export const Waves: React.FC<{ t: number; o: number; x: number; y0: number; y1: number; w?: number; n?: number; speed?: number }> = ({ t, o, x, y0, y1, w = 70, n = 5, speed = 1.6 }) => {
  if (o <= 0.01 || y0 - y1 < 20) return null;
  return (
    <g>
      {Array.from({ length: n }).map((_, k) => {
        const u = (t * speed + k / n) % 1;
        const y = y0 - (y0 - y1) * u;
        const ww = w * (1 + 0.5 * u);
        return <path key={k} d={`M ${x - ww} ${y + 10} Q ${x} ${y - 14} ${x + ww} ${y + 10}`} fill="none" stroke={K.flow} strokeWidth={6} strokeLinecap="round" opacity={o * (1 - u) * 0.95} />;
      })}
    </g>
  );
};

/** Superficie del agua con rizos finos y una pequeña fuente en el centro (se agita con `shake`). */
const surfacePath = (x0: number, x1: number, y: number, t: number, shake: number, cx: number, bump: number) => {
  let d = `M ${x0} ${y}`;
  for (let x = x0; x <= x1; x += 8) {
    const near = Math.exp(-(((x - cx) / 90) ** 2));
    const ripple = shake * (2 + 5 * near) * Math.sin(x * 0.35 + t * 40);
    d += ` L ${x} ${y + ripple - bump * near * 26}`;
  }
  return d;
};

/** Ventilador visto de frente (aspas que giran). */
export const Fan: React.FC<{ x: number; y: number; r: number; t: number; speed?: number; hl?: number }> = ({ x, y, r, t, speed = 1, hl = 0 }) => (
  <g>
    {hl > 0 && <circle cx={x} cy={y} r={r + 24} fill={K.cold} opacity={0.2 * hl} />}
    <circle cx={x} cy={y} r={r} fill={C.deep} stroke={C.light} strokeWidth={6} />
    <g transform={`rotate(${t * 520 * speed} ${x} ${y})`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M ${x} ${y} Q ${x + r * 0.55} ${y - r * 0.7} ${x + r * 0.15} ${y - r * 0.88} Z`} fill={C.light} opacity={0.9} transform={`rotate(${i * 72} ${x} ${y})`} />
      ))}
    </g>
    <circle cx={x} cy={y} r={r * 0.16} fill={C.shell2} stroke={C.ink} strokeWidth={3} />
  </g>
);

/** Disco piezoeléctrico (visto de lado, en el fondo). */
export const Disc: React.FC<{ x: number; y: number; r: number; t: number; on: number; hl?: number }> = ({ x, y, r, t, on, hl = 0 }) => {
  const jig = on * 2.2 * Math.sin(t * 60);
  return (
    <g>
      {hl > 0 && <ellipse cx={x} cy={y} rx={r + 34} ry={34} fill={K.flow} opacity={0.25 * hl} />}
      <ellipse cx={x} cy={y + 8} rx={r + 10} ry={16} fill={C.light} opacity={0.8} />
      <ellipse cx={x} cy={y + jig} rx={r} ry={14 + jig * 0.5} fill={on > 0.5 ? K.flow : "#C9A93A"} stroke={C.ink} strokeWidth={3} />
      <ellipse cx={x} cy={y - 2 + jig} rx={r * 0.55} ry={7} fill="#FFF3B0" opacity={0.7} />
    </g>
  );
};

/** El humidificador en corte. `open` 0 = carcasa cerrada; 1 = abierto (las dos mitades se separan). */
export const Humid: React.FC<{
  t: number; open?: number; on?: number; mist?: number; waves?: number; fan?: number; air?: number; level?: number;
  hl?: "disc" | "fan" | "float" | "surface" | null; floatHl?: number; led?: "on" | "off" | null; tankLevel?: number; minerals?: number;
}> = ({ t, open = 1, on = 1, mist = 1, waves = 0, fan = 1, air = 0, level = 1, hl = null, led = null, tankLevel = 0.7, minerals = 0 }) => {
  const b = U.basin, ys = surfY(level);
  const shake = on;
  const g = 280 * open; // separación de las mitades de la carcasa
  const fl = ys - 6;
  return (
    <g>
      {/* interior (visible cuando está abierto) */}
      <g opacity={0.25 + 0.75 * Math.min(1, open * 1.6)}>
        <rect x={U.x0} y={U.y0} width={U.x1 - U.x0} height={U.y1 - U.y0} rx={60} fill={C.dark} stroke={C.shell2} strokeWidth={8} />
        {/* chimenea y boquilla */}
        <rect x={496} y={U.y0 - 6} width={88} height={250} fill={C.deep} stroke={C.light} strokeWidth={4} opacity={0.9} />
        <rect x={472} y={U.nozzle.y - 14} width={136} height={44} rx={16} fill={C.shell2} stroke={C.light} strokeWidth={5} />
        {/* depósito de reserva */}
        <rect x={U.tank.x0} y={U.tank.y0} width={U.tank.x1 - U.tank.x0} height={U.tank.y1 - U.tank.y0} rx={20} fill={C.deep} stroke={C.light} strokeWidth={5} />
        <rect x={U.tank.x0 + 6} y={U.tank.y1 - 6 - (U.tank.y1 - U.tank.y0 - 12) * tankLevel} width={U.tank.x1 - U.tank.x0 - 12} height={(U.tank.y1 - U.tank.y0 - 12) * tankLevel} rx={14} fill={K.cold} opacity={0.55} />
        <rect x={720} y={U.tank.y1} width={28} height={b.top - U.tank.y1 + 30} fill={C.light} opacity={0.6} />
        {/* cubeta con agua */}
        <path d={`M ${b.x0} ${b.top} L ${b.x0} ${b.floor} L ${b.x1} ${b.floor} L ${b.x1} ${b.top}`} fill="none" stroke={C.light} strokeWidth={6} />
        <path d={`${surfacePath(b.x0 + 4, b.x1 - 4, ys, t, shake, 540, on * (level > 0.15 ? 1 : 0))} L ${b.x1 - 4} ${b.floor - 3} L ${b.x0 + 4} ${b.floor - 3} Z`} fill={K.cold} opacity={0.5} />
        <path d={surfacePath(b.x0 + 4, b.x1 - 4, ys, t, shake, 540, on * (level > 0.15 ? 1 : 0))} fill="none" stroke={hl === "surface" ? K.flow : K.cold} strokeWidth={hl === "surface" ? 7 : 5} />
        {minerals > 0 && Array.from({ length: 26 }).map((_, k) => (
          <circle key={k} cx={b.x0 + 30 + rnd(k) * (b.x1 - b.x0 - 60)} cy={ys + 20 + rnd(k + 3) * (b.floor - ys - 40)} r={5} fill={C.mineral} opacity={minerals * 0.9} />
        ))}
        {/* ondas y disco */}
        <Waves t={t} o={waves * on} x={540} y0={U.disc.y - 16} y1={ys + 18} />
        <Disc x={U.disc.x} y={U.disc.y} r={U.disc.r} t={t} on={on} hl={hl === "disc" ? 1 : 0} />
        {/* flotador del sensor de nivel */}
        <line x1={U.float.x} y1={b.top - 10} x2={U.float.x} y2={b.floor} stroke={C.light} strokeWidth={6} />
        {hl === "float" && <circle cx={U.float.x} cy={fl} r={52} fill={K.flow} opacity={0.25} />}
        <rect x={U.float.x - 30} y={fl - 18} width={60} height={36} rx={14} fill={hl === "float" ? K.flow : C.light} stroke={C.ink} strokeWidth={3} />
        {/* ventilador y aire */}
        <Fan x={U.fan.x} y={U.fan.y} r={U.fan.r} t={t} speed={fan} hl={hl === "fan" ? 1 : 0} />
        {air > 0.01 && Array.from({ length: 3 }).map((_, l) => Array.from({ length: 6 }).map((_, k) => {
          const u = (t * 0.5 + k / 6 + l * 0.17) % 1;
          const x = 420 + 90 * u, y = 640 + (l - 1) * 40 + 120 * u;
          return <path key={`${l}-${k}`} d={`M ${x - 18} ${y} L ${x + 18} ${y}`} stroke={K.cold} strokeWidth={6} strokeLinecap="round" opacity={air * Math.min(1, u * 5, (1 - u) * 5)} />;
        }))}
        {/* placa y cable */}
        <rect x={300} y={1074} width={150} height={40} rx={8} fill="#1E5A3A" stroke={C.ink} strokeWidth={3} />
        <path d={`M 450 1094 L ${U.disc.x - 30} 1094 L ${U.disc.x - 30} ${U.disc.y + 12}`} fill="none" stroke={K.flow} strokeWidth={4} opacity={0.4 + 0.6 * on} />
        {led && <circle cx={790} cy={1095} r={16} fill={led === "on" ? "#3BD16F" : K.warn} stroke={C.ink} strokeWidth={3} />}
        {/* niebla */}
        <Mist t={t} o={mist * on * (level > 0.15 ? 1 : 0)} x={540} y0={ys - 20} y1={U.nozzle.y - 10} n={28} spread={26} widen={0.5} speed={0.45} />
        <Mist t={t + 0.7} o={mist * on * (level > 0.15 ? 1 : 0)} x={540} y0={U.nozzle.y - 10} y1={300} n={20} spread={30} widen={2.2} speed={0.3} />
      </g>
      {/* carcasa: dos mitades que se separan al abrir */}
      {open < 0.999 && (
        <g opacity={1 - open}>
          <path d={`M ${540 - g} ${U.y0} L ${U.x0 + 60 - g} ${U.y0} Q ${U.x0 - g} ${U.y0} ${U.x0 - g} ${U.y0 + 60} L ${U.x0 - g} ${U.y1 - 60} Q ${U.x0 - g} ${U.y1} ${U.x0 + 60 - g} ${U.y1} L ${540 - g} ${U.y1} Z`} fill={C.shell2} stroke={C.light} strokeWidth={6} />
          <path d={`M ${540 + g} ${U.y0} L ${U.x1 - 60 + g} ${U.y0} Q ${U.x1 + g} ${U.y0} ${U.x1 + g} ${U.y0 + 60} L ${U.x1 + g} ${U.y1 - 60} Q ${U.x1 + g} ${U.y1} ${U.x1 - 60 + g} ${U.y1} L ${540 + g} ${U.y1} Z`} fill={C.shell2} stroke={C.light} strokeWidth={6} />
          <circle cx={540 - g - 120} cy={1040} r={22} fill={C.dark} stroke={C.light} strokeWidth={4} />
          <rect x={540 + g + 60} y={560} width={150} height={220} rx={20} fill={C.shell} stroke={C.light} strokeWidth={4} />
          <rect x={540 + g + 72} y={572 + 196 * (1 - tankLevel)} width={126} height={196 * tankLevel} rx={12} fill={K.cold} opacity={0.5} />
        </g>
      )}
    </g>
  );
};

/** Llama de «hervir» tachada (para desmontar el mito). */
export const Flame: React.FC<{ x: number; y: number; o: number; cross: number; s?: number }> = ({ x, y, o, cross, s = 1 }) => o <= 0.01 ? null : (
  <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={0} r={78} fill={C.deep} stroke={K.hot} strokeWidth={5} />
    <path d="M 0 -52 C 30 -18 40 6 30 30 C 22 50 -22 50 -30 30 C -40 6 -18 -6 -8 -30 C -4 -12 6 -8 0 -52 Z" fill={K.hot} />
    <path d="M 0 -6 C 14 10 16 24 10 34 C 4 42 -10 42 -14 32 C -18 20 -8 10 0 -6 Z" fill={K.flow} />
    {cross > 0.01 && <line x1={-60} y1={-60} x2={-60 + 120 * cross} y2={-60 + 120 * cross} stroke={K.warn} strokeWidth={14} strokeLinecap="round" />}
  </g>
);

/** Primer plano de la superficie del agua: rizos (olas capilares) y gotitas que saltan de las crestas. */
export const Surface: React.FC<{ t: number; amp: number; drops: number; x0?: number; x1?: number; y?: number; waves?: number; mag?: number }> = ({ t, amp, drops, x0 = 120, x1 = 960, y = 800, waves = 0, mag = 0 }) => {
  const lambda = 46;
  let d = `M ${x0} ${y}`;
  for (let x = x0; x <= x1; x += 4) d += ` L ${x} ${y + amp * 16 * Math.sin((x / lambda) * 2 * Math.PI) * Math.sin(t * 9)}`;
  const crests = Array.from({ length: Math.floor((x1 - x0) / lambda) }).map((_, i) => x0 + lambda * (i + 0.25));
  return (
    <g>
      <path d={`${d} L ${x1} 1110 L ${x0} 1110 Z`} fill={K.cold} opacity={0.45} />
      <path d={d} fill="none" stroke={K.cold} strokeWidth={6} />
      <Waves t={t} o={waves} x={540} y0={1100} y1={y + 40} w={300} n={4} speed={1.2} />
      {drops > 0.01 && crests.map((cx, i) => {
        const u = (t * 0.8 + rnd(i) ) % 1;
        const yy = y - 20 - 300 * u;
        return <circle key={i} cx={cx + 20 * Math.sin(u * 6 + i)} cy={yy} r={5 + 3 * rnd(i + 2)} fill={K.white} opacity={drops * (1 - u) * Math.min(1, u * 8)} />;
      })}
      {mag > 0.01 && (
        <g opacity={mag}>
          <circle cx={780} cy={540} r={120} fill={C.deep} stroke={K.flow} strokeWidth={8} />
          <line x1={695} y1={625} x2={620} y2={700} stroke={K.flow} strokeWidth={14} strokeLinecap="round" />
          {[[-40, -30, 14], [30, -50, 10], [10, 20, 18], [-50, 40, 9], [55, 35, 12]].map(([dx, dy, r], i) => (
            <circle key={i} cx={780 + dx} cy={540 + dy + 6 * Math.sin(t * 2 + i)} r={r} fill={K.white} />
          ))}
        </g>
      )}
    </g>
  );
};

/** Disco piezoeléctrico en primer plano con sus cables: se estira y encoge al ritmo de la corriente. */
export const Piezo: React.FC<{ t: number; on: number; slow?: number }> = ({ t, on, slow = 0 }) => {
  const ph = Math.sin(t * (2 * Math.PI) * (slow > 0.5 ? 1.2 : 14));
  const s = 1 + on * 0.06 * ph, th = 1 - on * 0.25 * ph;
  const cx = 540, cy = 760;
  return (
    <g>
      {/* cables y fuente */}
      <path d="M 300 760 L 220 760 L 220 1000 L 330 1000" fill="none" stroke={K.flow} strokeWidth={8} />
      <path d="M 780 760 L 860 760 L 860 1000 L 750 1000" fill="none" stroke={K.flow} strokeWidth={8} />
      <rect x={330} y={950} width={420} height={110} rx={22} fill={C.shell} stroke={C.light} strokeWidth={5} />
      <path d={`M 400 1005 ${Array.from({ length: 14 }).map((_, i) => `L ${400 + i * 20} ${1005 + 30 * Math.sin(i * 1.2 - t * 12) * on}`).join(" ")}`} fill="none" stroke={K.flow} strokeWidth={6} />
      {/* disco */}
      <g transform={`translate(${cx} ${cy}) scale(${s} ${th}) translate(${-cx} ${-cy})`}>
        <rect x={300} y={cy - 40} width={480} height={80} rx={40} fill="#C9A93A" stroke={C.ink} strokeWidth={4} />
        <rect x={330} y={cy - 40} width={420} height={16} rx={8} fill={C.light} />
        <rect x={330} y={cy + 24} width={420} height={16} rx={8} fill={C.light} />
      </g>
      {/* flechas de estirar/encoger */}
      <g opacity={on}>
        <path d={`M ${262 - 22 * ph} 760 l 34 -26 l 0 52 Z`} fill={K.white} />
        <path d={`M ${818 + 22 * ph} 760 l -34 -26 l 0 52 Z`} fill={K.white} />
      </g>
    </g>
  );
};

/** Comparación de frecuencias: onda que oyes (lenta) frente a la del disco (densísima). */
export const FreqCompare: React.FC<{ t: number; ear: number; disc: number }> = ({ t, ear, disc }) => {
  const row = (y: number, cycles: number, col: string, o: number) => {
    let d = `M 130 ${y}`;
    for (let x = 0; x <= 640; x += 2) d += ` L ${130 + x} ${y + 50 * Math.sin((x / 640) * cycles * 2 * Math.PI - t * 6)}`;
    return <path d={d} fill="none" stroke={col} strokeWidth={cycles > 20 ? 3 : 7} opacity={o} />;
  };
  return (
    <g>
      <rect x={100} y={560} width={700} height={170} rx={24} fill={C.deep} stroke={C.shell2} strokeWidth={4} opacity={0.3 + 0.7 * ear} />
      {row(645, 3, K.cold, 0.3 + 0.7 * ear)}
      <rect x={100} y={830} width={700} height={170} rx={24} fill={C.deep} stroke={K.flow} strokeWidth={4} opacity={0.3 + 0.7 * disc} />
      {row(915, 70, K.flow, 0.3 + 0.7 * disc)}
    </g>
  );
};

/** Oreja tachada (no oyes el ultrasonido). */
export const Ear: React.FC<{ x: number; y: number; o: number; cross: number; s?: number }> = ({ x, y, o, cross, s = 1 }) => o <= 0.01 ? null : (
  <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={0} r={70} fill={C.deep} stroke={C.light} strokeWidth={5} />
    <path d="M -18 38 C -30 30 -32 14 -26 2 C -40 -30 -10 -52 14 -44 C 38 -36 40 -6 22 8 C 10 18 12 32 -2 40 C -8 44 -14 42 -18 38 Z" fill="#F2C9A0" stroke={C.ink} strokeWidth={3} />
    <path d="M -6 -18 C 6 -28 22 -18 16 -4" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
    {cross > 0.01 && <line x1={-52} y1={-52} x2={-52 + 104 * cross} y2={-52 + 104 * cross} stroke={K.warn} strokeWidth={12} strokeLinecap="round" />}
  </g>
);

/** Mueble con polvo blanco que se va posando; gota ampliada con minerales dentro. */
export const Furniture: React.FC<{ t: number; dust: number; mag: number }> = ({ t, dust, mag }) => (
  <g>
    {/* mesa */}
    <rect x={150} y={940} width={780} height={34} rx={8} fill="#8A5A3A" stroke={C.ink} strokeWidth={3} />
    <rect x={190} y={974} width={30} height={150} fill="#6E4630" />
    <rect x={860} y={974} width={30} height={150} fill="#6E4630" />
    {/* polvo blanco sobre la mesa */}
    {Array.from({ length: 60 }).map((_, k) => (
      <circle key={k} cx={170 + rnd(k) * 740} cy={936 - rnd(k + 5) * 6} r={3 + 3 * rnd(k + 7)} fill={C.mineral} opacity={dust * (rnd(k + 1) < dust ? 1 : 0.15)} />
    ))}
    {/* gota ampliada con minerales */}
    <g opacity={mag} transform={`translate(0 ${6 * Math.sin(t * 2)})`}>
      <path d="M 540 470 C 600 560 640 610 640 660 C 640 720 595 760 540 760 C 485 760 440 720 440 660 C 440 610 480 560 540 470 Z" fill={K.cold} opacity={0.55} stroke={K.cold} strokeWidth={6} />
      {[[-40, -10], [20, 20], [-10, 60], [45, -40], [30, 70], [-50, 40], [0, -60]].map(([dx, dy], i) => (
        <rect key={i} x={540 + dx - 9} y={660 + dy - 9} width={18} height={18} rx={3} fill={C.mineral} stroke={C.ink} strokeWidth={2} transform={`rotate(${i * 25} ${540 + dx} ${660 + dy})`} />
      ))}
    </g>
  </g>
);

/** Nebulizador médico genérico (vaso + boquilla) con el mismo disco en el fondo. */
export const Nebulizer: React.FC<{ t: number; o: number; on: number }> = ({ t, o, on }) => (
  <g opacity={o}>
    <rect x={330} y={1010} width={420} height={110} rx={30} fill={C.shell} stroke={C.light} strokeWidth={5} />
    <path d="M 400 1010 L 380 680 L 700 680 L 680 1010 Z" fill={C.deep} stroke={C.light} strokeWidth={6} opacity={0.95} />
    <path d="M 392 880 L 688 880 L 682 1000 L 398 1000 Z" fill={K.cold} opacity={0.45} />
    <Waves t={t} o={on} x={540} y0={990} y1={890} w={70} n={3} />
    <ellipse cx={540} cy={1000} rx={70} ry={12} fill={K.flow} stroke={C.ink} strokeWidth={3} />
    {/* boquilla */}
    <path d="M 700 720 L 860 640 L 880 690 L 705 790 Z" fill={C.shell2} stroke={C.light} strokeWidth={5} />
    <Mist t={t} o={on} x={540} y0={860} y1={700} n={22} spread={50} widen={0.8} speed={0.5} />
    <Mist t={t + 0.3} o={on} x={870} y0={660} y1={520} n={12} spread={14} widen={1.5} speed={0.45} />
  </g>
);

/** Botella de agua destilada (sin marca) que vierte. */
export const Bottle: React.FC<{ t: number; x: number; y: number; pour: number }> = ({ t, x, y, pour }) => (
  <g transform={`translate(${x} ${y}) rotate(${-50 * pour})`}>
    <rect x={-70} y={-150} width={140} height={260} rx={34} fill={K.cold} opacity={0.35} stroke={C.light} strokeWidth={6} />
    <rect x={-30} y={-200} width={60} height={56} rx={10} fill={C.light} />
    <rect x={-58} y={-60} width={116} height={70} rx={10} fill={K.white} />
    <text x={0} y={-16} textAnchor="middle" fontFamily="sans-serif" fontWeight={900} fontSize={22} fill={C.ink}>H₂O</text>
  </g>
);

/** Barra de humedad con banda recomendada (30-50 %). */
export const HumBar: React.FC<{ value: number; band: number; x?: number; y0?: number; y1?: number }> = ({ value, band, x = 760, y0 = 560, y1 = 1060 }) => {
  const yv = (v: number) => y1 - (y1 - y0) * (v / 100);
  return (
    <g>
      <rect x={x - 46} y={y0} width={92} height={y1 - y0} rx={46} fill={C.deep} stroke={C.light} strokeWidth={6} />
      {band > 0.01 && <rect x={x - 70} y={yv(50)} width={140} height={yv(30) - yv(50)} rx={10} fill={K.flow} opacity={0.35 * band} stroke={K.flow} strokeWidth={4} />}
      <rect x={x - 32} y={yv(value)} width={64} height={y1 - 14 - yv(value)} rx={30} fill={K.cold} />
    </g>
  );
};

/** Burbuja de limpieza (esponja con brillos). */
export const Sponge: React.FC<{ t: number; x: number; y: number; o: number }> = ({ t, x, y, o }) => o <= 0.01 ? null : (
  <g opacity={o} transform={`translate(${x + 30 * Math.sin(t * 6)} ${y})`}>
    <rect x={-70} y={-40} width={140} height={80} rx={18} fill={K.flow} stroke={C.ink} strokeWidth={4} />
    <rect x={-70} y={-40} width={140} height={26} rx={12} fill="#3BD16F" />
    {[[-90, -60], [80, -70], [100, 30]].map(([dx, dy], i) => (
      <path key={i} d={`M ${dx} ${dy - 14} L ${dx + 4} ${dy - 4} L ${dx + 14} ${dy} L ${dx + 4} ${dy + 4} L ${dx} ${dy + 14} L ${dx - 4} ${dy + 4} L ${dx - 14} ${dy} L ${dx - 4} ${dy - 4} Z`} fill={K.white} opacity={0.5 + 0.5 * Math.sin(t * 5 + i)} />
    ))}
  </g>
);
