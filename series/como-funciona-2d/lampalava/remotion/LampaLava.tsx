// Dibujos SVG planos del episodio «Cómo funciona una lámpara de lava» (n.º 139).
// Colores de código: naranja = calor (cera caliente), cian = frío/líquido, amarillo = lo importante, blanco = texto, rojo = error.
import React from "react";
import { K, FONT } from "./kit2d/Kit";

export const C = { shell: "#2B4A72", shell2: "#3E6AA0", light: "#9FB3CC", dark: "#132A4A", ink: "#06101F", metal: "#C9D6E6", liquid: "#16396A", waxCold: "#B5532A" };
const W = 1080, H = 1920;
export const Svg: React.FC<{ children: React.ReactNode; o?: number }> = ({ children, o = 1 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>{children}</svg>
);
const cl = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- la lámpara (de pie, centrada en x 540) ----------
// tapa y 395-470 · cristal y 470-975 (más ancho en y 760) · base y 975-1135 con la bombilla dentro (y ≈ 1050) · muelle en y ≈ 955.
const GLASS = "M 462 470 C 400 600, 375 690, 375 760 C 375 860, 410 930, 422 975 L 658 975 C 670 930, 705 860, 705 760 C 705 690, 680 600, 618 470 Z";
export const LP = { bulb: { x: 540, y: 1052 }, coil: { x: 540, y: 955 }, top: 520, bottom: 935 };

let uid = 0;
export const Lamp: React.FC<{
  t: number; heat?: number; flow?: number; cut?: number; open?: number; hl?: "bulb" | "coil" | "wax" | "liquid" | null;
  arrows?: number; cloudy?: number; shake?: number; merge?: number; s?: number; cx?: number; cy?: number; speed?: number;
}> = ({ t, heat = 1, flow = 1, cut = 0, open = 0, hl = null, arrows = 0, cloudy = 0, shake = 0, merge = 0, s = 1, cx = 540, cy = 770, speed = 1 }) => {
  const id = React.useMemo(() => `lp${uid++}`, []);
  const dim = (k: string) => (hl && hl !== k && !(k === "wax" && hl === "coil") ? 0.45 : 1);
  const glow = heat * (0.8 + 0.2 * Math.sin(t * 4));
  const rot = shake * 7 * Math.sin(t * 22);
  // gotas de cera: suben por el centro y bajan por los lados
  const blobs = Array.from({ length: 5 }).map((_, k) => {
    const u = (t * 0.11 * speed + k / 5 + 0.07 * k * k) % 1;
    const up = u < 0.5;
    const hgt = Math.sin(Math.PI * u);
    const yy = LP.bottom - (LP.bottom - LP.top - 40 * (k % 2)) * hgt;
    const y = lerp(LP.bottom + 8, yy, flow);
    const x = 540 + flow * ((up ? -1 : 1) * (k % 2 ? 1 : -1) * 55 * Math.sin(Math.PI * u) + 18 * Math.sin(t * 0.9 + k * 2));
    const r = (30 + 9 * ((k * 7) % 3)) * (up ? 1.05 : 0.92);
    const hot = cl(1 - (LP.bottom - y) / (LP.bottom - LP.top)) * 0.6 + (up ? 0.4 : 0);
    return { x, y, r, hot, k };
  });
  const puddle = Math.min(1, 1 - 0.55 * flow + 0.45 * merge);
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s}) translate(-540 -770) rotate(${rot} 540 1135)`}>
      <defs>
        <clipPath id={`${id}g`}><path d={GLASS} /></clipPath>
        <radialGradient id={`${id}h`} cx="50%" cy="100%" r="80%">
          <stop offset="0%" stopColor={K.hot} stopOpacity={0.55} />
          <stop offset="100%" stopColor={K.hot} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}b`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={K.flow} stopOpacity={0.9} />
          <stop offset="100%" stopColor={K.hot} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* sombra */}
      <ellipse cx={540} cy={1140} rx={250} ry={16} fill="#000" opacity={0.3} />
      {/* halo de luz */}
      <ellipse cx={540} cy={770} rx={260} ry={360} fill={K.hot} opacity={0.07 * glow} />
      {/* cristal con líquido */}
      <g opacity={dim("liquid") === 1 || hl === "wax" || hl === "coil" ? 1 : 0.6}>
        <path d={GLASS} fill={C.liquid} stroke={hl === "liquid" ? K.cold : C.light} strokeWidth={hl === "liquid" ? 8 : 6} />
        <g clipPath={`url(#${id}g)`}>
          <rect x={360} y={600} width={360} height={380} fill={`url(#${id}h)`} opacity={glow} />
          {/* charco de cera en el fondo */}
          <g opacity={dim("wax")}>
            <ellipse cx={540 + 6 * Math.sin(t)} cy={968} rx={115 * (0.6 + 0.4 * puddle)} ry={22 + 26 * puddle + 3 * Math.sin(t * 2)} fill={K.hot} />
            <ellipse cx={540 + 6 * Math.sin(t)} cy={968} rx={115 * (0.6 + 0.4 * puddle)} ry={22 + 26 * puddle} fill={C.waxCold} opacity={1 - heat} />
            {/* gotas */}
            {blobs.map((b) => {
              const m = merge > 0 && b.y > LP.bottom - 260 ? merge : 0;
              const rx = b.r * (1 + 0.1 * Math.sin(t * 3 + b.k)), ry = b.r * (1.12 + 0.1 * Math.cos(t * 2.6 + b.k));
              const bx = lerp(b.x, 540, m), by = lerp(b.y, 958, m);
              return <g key={b.k}>
                <ellipse cx={bx} cy={by} rx={rx} ry={ry} fill={C.waxCold} />
                <ellipse cx={bx} cy={by} rx={rx} ry={ry} fill={K.hot} opacity={cl(0.25 + b.hot * heat)} />
                <ellipse cx={bx - rx * 0.35} cy={by - ry * 0.4} rx={rx * 0.22} ry={ry * 0.14} fill={K.white} opacity={0.35} />
              </g>;
            })}
          </g>
          {/* líquido turbio */}
          {cloudy > 0.01 && <rect x={360} y={460} width={360} height={530} fill="#B9C9DE" opacity={0.62 * cloudy} />}
          {cloudy > 0.01 && Array.from({ length: 40 }).map((_, k) => (
            <circle key={k} cx={385 + ((k * 73) % 310)} cy={500 + ((k * 131) % 460) + 6 * Math.sin(t * 2 + k)} r={3 + (k % 4)} fill={K.hot} opacity={0.6 * cloudy} />
          ))}
          {/* brillo del cristal */}
          <path d="M 430 560 C 405 650, 395 720, 398 800" stroke={K.white} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.18} />
        </g>
        {/* muelle */}
        <g opacity={dim("coil")}>
          <path d={`M 470 ${LP.coil.y} ` + Array.from({ length: 14 }).map((_, i) => `L ${475 + i * 10} ${LP.coil.y + (i % 2 ? -12 : 12)}`).join(" ") + ` L 610 ${LP.coil.y}`}
            stroke={hl === "coil" ? K.flow : C.metal} strokeWidth={hl === "coil" ? 7 : 5} fill="none" strokeLinejoin="round" />
          {hl === "coil" && <rect x={455} y={928} width={170} height={56} rx={14} fill="none" stroke={K.flow} strokeWidth={4} strokeDasharray="10 8" />}
        </g>
      </g>
      {/* flechas de convección */}
      {arrows > 0.01 && (
        <g opacity={arrows} fill="none" strokeWidth={9} strokeLinecap="round" strokeDasharray="22 16" strokeDashoffset={-t * 60}>
          <path d="M 540 900 L 540 560" stroke={K.hot} />
          <path d="M 528 580 L 540 556 L 552 580" stroke={K.hot} strokeDasharray="none" />
          <path d="M 470 560 C 420 640, 410 760, 445 900" stroke={K.cold} />
          <path d="M 610 560 C 660 640, 670 760, 635 900" stroke={K.cold} />
          <path d="M 430 880 L 445 904 L 460 882" stroke={K.cold} strokeDasharray="none" />
          <path d="M 620 882 L 635 904 L 650 880" stroke={K.cold} strokeDasharray="none" />
        </g>
      )}
      {/* aro y base */}
      <g opacity={hl && hl !== "bulb" ? 0.8 : 1}>
        <path d="M 422 985 L 658 985 L 760 1135 L 320 1135 Z" fill={C.shell} fillOpacity={1 - 0.75 * cut} stroke={C.light} strokeWidth={6} />
        {cut > 0.02 && (
          <g opacity={cut}>
            {/* bombilla */}
            <circle cx={LP.bulb.x} cy={LP.bulb.y} r={90} fill={`url(#${id}b)`} opacity={glow} />
            <rect x={522} y={1080} width={36} height={34} rx={5} fill={C.light} />
            <circle cx={LP.bulb.x} cy={LP.bulb.y} r={38} fill={heat > 0.1 ? "#FFE9A8" : "#5A6B82"} stroke={hl === "bulb" ? K.flow : C.light} strokeWidth={4} />
            <path d="M 524 1056 L 532 1042 L 540 1056 L 548 1042 L 556 1056" stroke={heat > 0.1 ? K.hot : C.light} strokeWidth={4} fill="none" />
            {/* ondas de calor hacia arriba */}
            {hl === "bulb" && [0, 1, 2].map((k) => {
              const u = (t * 0.8 + k / 3) % 1;
              const y0 = 1000 - 150 * u;
              return <path key={k} d={`M 500 ${y0} q 10 -14 20 0 t 20 0 t 20 0 t 20 0`} stroke={K.hot} strokeWidth={6} fill="none" strokeLinecap="round" opacity={heat * (1 - u) * Math.min(1, u * 5)} />;
            })}
          </g>
        )}
        <rect x={410} y={968} width={260} height={24} rx={8} fill={C.shell2} stroke={C.light} strokeWidth={4} />
        <path d="M 760 1120 C 820 1125, 850 1140, 880 1135" fill="none" stroke={C.light} strokeWidth={10} strokeLinecap="round" />
      </g>
      {/* tapa (se levanta con open) */}
      <g transform={`translate(${open * 40} ${-open * 150}) rotate(${open * 18} 540 430)`}>
        <path d="M 455 478 L 485 395 Q 540 383 595 395 L 625 478 Z" fill={C.shell} stroke={C.light} strokeWidth={6} />
        <rect x={448} y={466} width={184} height={18} rx={7} fill={C.shell2} stroke={C.light} strokeWidth={4} />
      </g>
    </g>
  );
};

// ---------- vaso de prueba: un taco de cera que se hunde en frío y flota en caliente ----------
export const Beaker: React.FC<{ t: number; x: number; y?: number; temp: number; rise: number; o?: number }> = ({ t, x, y = 780, temp, rise, o = 1 }) => {
  const top = y - 230, bot = y + 230;
  const by = lerp(bot - 70, top + 70, rise) + 6 * Math.sin(t * 2 + x);
  const sz = 92 * (1 + 0.1 * temp);
  return (
    <g opacity={o}>
      <rect x={x - 140} y={top} width={280} height={460} rx={26} fill={C.liquid} stroke={C.light} strokeWidth={6} />
      <rect x={x - 134} y={top + 6} width={268} height={30} rx={12} fill={K.cold} opacity={0.25} />
      <rect x={x - sz / 2} y={by - sz / 2} width={sz} height={sz} rx={26} fill={C.waxCold} />
      <rect x={x - sz / 2} y={by - sz / 2} width={sz} height={sz} rx={26} fill={K.hot} opacity={temp} />
      {temp > 0.05 && <rect x={x - sz / 2 - 10} y={by - sz / 2 - 10} width={sz + 20} height={sz + 20} rx={32} fill="none" stroke={K.hot} strokeWidth={4} opacity={0.5 * temp * (0.7 + 0.3 * Math.sin(t * 5))} />}
      {/* flecha */}
      <g opacity={0.9}>
        {rise > 0.05 && temp > 0.5
          ? <path d={`M ${x + 95} ${by + 50} L ${x + 95} ${by - 30} M ${x + 80} ${by - 12} L ${x + 95} ${by - 32} L ${x + 110} ${by - 12}`} stroke={K.hot} strokeWidth={8} fill="none" strokeLinecap="round" />
          : <path d={`M ${x + 95} ${by - 50} L ${x + 95} ${by + 30} M ${x + 80} ${by + 12} L ${x + 95} ${by + 32} L ${x + 110} ${by + 12}`} stroke={K.cold} strokeWidth={8} fill="none" strokeLinecap="round" />}
      </g>
    </g>
  );
};

// ---------- zoom: una columna de líquido con UNA gota (sube al calentarse, baja al enfriarse) ----------
export const Column: React.FC<{ t: number; y: number; size: number; temp: number; expand?: number; shrink?: number; up?: number; down?: number }> =
  ({ t, y, size, temp, expand = 0, shrink = 0, up = 0, down = 0 }) => {
    const top = 430, bot = 1110;
    const by = lerp(bot - 110, top + 120, y);
    const r = 70 * size;
    return (
      <g>
        <defs>
          <linearGradient id="colg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={K.cold} stopOpacity={0.35} />
            <stop offset="55%" stopColor={C.liquid} stopOpacity={1} />
            <stop offset="100%" stopColor={K.hot} stopOpacity={0.45} />
          </linearGradient>
        </defs>
        <rect x={330} y={top} width={420} height={bot - top} rx={40} fill="url(#colg)" stroke={C.light} strokeWidth={6} />
        {/* termómetro lateral */}
        <text x={300} y={top + 40} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={36} fill={K.cold}>frío</text>
        <text x={300} y={bot - 20} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={36} fill={K.hot}>calor</text>
        <ellipse cx={540} cy={by} rx={r * (1 + 0.06 * Math.sin(t * 3))} ry={r * (1.12 + 0.06 * Math.cos(t * 2.4))} fill={C.waxCold} />
        <ellipse cx={540} cy={by} rx={r * (1 + 0.06 * Math.sin(t * 3))} ry={r * (1.12 + 0.06 * Math.cos(t * 2.4))} fill={K.hot} opacity={temp} />
        <ellipse cx={540 - r * 0.35} cy={by - r * 0.45} rx={r * 0.22} ry={r * 0.14} fill={K.white} opacity={0.35} />
        {/* flechas de dilatar (hacia fuera) o contraer (hacia dentro) */}
        {[0, 1, 2, 3, 4, 5].map((k) => {
          const a = (k / 6) * Math.PI * 2 + 0.3;
          const o = Math.max(expand, shrink);
          if (o < 0.02) return null;
          const out = expand >= shrink;
          const r0 = r * 1.25 + (out ? 8 * Math.sin(t * 6) : 0), r1 = r0 + 42;
          const [s0, s1] = out ? [r0, r1] : [r1, r0];
          const x0 = 540 + s0 * Math.cos(a), y0 = by + s0 * Math.sin(a), x1 = 540 + s1 * Math.cos(a), y1 = by + s1 * Math.sin(a);
          const hx = 540 + (s1 - (out ? 14 : -14)) * Math.cos(a), hy = by + (s1 - (out ? 14 : -14)) * Math.sin(a);
          const px = -Math.sin(a) * 12, py = Math.cos(a) * 12;
          const col = out ? K.hot : K.cold;
          return <g key={k} opacity={o} stroke={col} strokeWidth={7} strokeLinecap="round" fill="none">
            <path d={`M ${x0} ${y0} L ${x1} ${y1}`} />
            <path d={`M ${hx + px} ${hy + py} L ${x1} ${y1} L ${hx - px} ${hy - py}`} />
          </g>;
        })}
        {/* flecha de subir / bajar */}
        {up > 0.02 && <path d={`M 690 ${by + 60} L 690 ${by - 80} M 668 ${by - 54} L 690 ${by - 84} L 712 ${by - 54}`} stroke={K.hot} strokeWidth={10} fill="none" strokeLinecap="round" opacity={up} />}
        {down > 0.02 && <path d={`M 690 ${by - 60} L 690 ${by + 80} M 668 ${by + 54} L 690 ${by + 84} L 712 ${by + 54}`} stroke={K.cold} strokeWidth={10} fill="none" strokeLinecap="round" opacity={down} />}
      </g>
    );
  };

// ---------- reloj: la aguja barre y el arco se rellena (p de 0 a 1) ----------
export const Clock: React.FC<{ x: number; y: number; p: number; r?: number; color?: string; o?: number; text?: string }> = ({ x, y, p, r = 95, color = K.flow, o = 1, text }) => {
  const a = p * Math.PI * 2;
  const large = p > 0.5 ? 1 : 0;
  const ex = x + (r - 14) * Math.sin(a), ey = y - (r - 14) * Math.cos(a);
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill={C.dark} stroke={C.light} strokeWidth={7} />
      {p > 0.01 && p < 0.999 && <path d={`M ${x} ${y} L ${x} ${y - r + 14} A ${r - 14} ${r - 14} 0 ${large} 1 ${ex} ${ey} Z`} fill={color} opacity={0.35} />}
      {p >= 0.999 && <circle cx={x} cy={y} r={r - 14} fill={color} opacity={0.35} />}
      {[0, 1, 2, 3].map((k) => <line key={k} x1={x + (r - 10) * Math.sin(k * Math.PI / 2)} y1={y - (r - 10) * Math.cos(k * Math.PI / 2)} x2={x + (r - 24) * Math.sin(k * Math.PI / 2)} y2={y - (r - 24) * Math.cos(k * Math.PI / 2)} stroke={C.light} strokeWidth={6} />)}
      <line x1={x} y1={y} x2={ex} y2={ey} stroke={color} strokeWidth={8} strokeLinecap="round" />
      <circle cx={x} cy={y} r={9} fill={color} />
      {text && <text x={x} y={y + r + 52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={color}>{text}</text>}
    </g>
  );
};

// ---------- hoja de calendario con el año ----------
export const Calendar: React.FC<{ x: number; y: number; year: string; o?: number; p?: number }> = ({ x, y, year, o = 1, p = 1 }) => (
  <g opacity={o} transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * p}) translate(${-x} ${-y})`}>
    <rect x={x - 150} y={y - 110} width={300} height={220} rx={22} fill={K.white} />
    <rect x={x - 150} y={y - 110} width={300} height={58} rx={22} fill={K.warn} />
    <rect x={x - 150} y={y - 75} width={300} height={23} fill={K.warn} />
    {[-90, -30, 30, 90].map((dx) => <circle key={dx} cx={x + dx} cy={y - 112} r={9} fill={C.light} />)}
    <text x={x} y={y + 52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={92} fill={C.ink}>{year}</text>
  </g>
);

// ---------- receta del líquido: vaso de agua + frasco secreto ----------
export const Recipe: React.FC<{ t: number; water: number; secret: number; lock: number }> = ({ t, water, secret, lock }) => (
  <g>
    {/* vaso de agua */}
    <g opacity={0.3 + 0.7 * water}>
      <path d="M 170 640 L 200 960 L 380 960 L 410 640 Z" fill="none" stroke={C.light} strokeWidth={7} strokeLinejoin="round" />
      <path d={`M 180 ${720 + 5 * Math.sin(t * 3)} L 194 955 L 386 955 L 400 ${720 + 5 * Math.sin(t * 3 + 1)} Z`} fill={K.cold} opacity={0.75} />
    </g>
    {/* + */}
    <g opacity={0.3 + 0.7 * secret} stroke={K.white} strokeWidth={12} strokeLinecap="round">
      <line x1={540} y1={760} x2={540} y2={840} /><line x1={500} y1={800} x2={580} y2={800} />
    </g>
    {/* frasco secreto */}
    <g opacity={0.3 + 0.7 * secret} transform={`rotate(${4 * Math.sin(t * 2)} 790 820)`}>
      <rect x={760} y={600} width={60} height={60} rx={8} fill={C.shell2} stroke={C.light} strokeWidth={5} />
      <path d="M 700 680 Q 700 650 740 650 L 840 650 Q 880 650 880 680 L 880 940 Q 880 965 855 965 L 725 965 Q 700 965 700 940 Z" fill={C.dark} stroke={C.light} strokeWidth={6} />
      <rect x={705} y={760} width={170} height={170} rx={12} fill={K.flow} opacity={0.9} />
      <text x={790} y={885} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130} fill={C.ink}>?</text>
    </g>
    {/* candado */}
    {lock > 0.01 && (
      <g opacity={lock} transform={`translate(0 ${(1 - lock) * -30})`}>
        <path d="M 760 600 L 760 560 Q 760 520 790 520 Q 820 520 820 560 L 820 600" fill="none" stroke={K.flow} strokeWidth={12} />
        <rect x={740} y={590} width={100} height={80} rx={14} fill={K.flow} />
        <circle cx={790} cy={625} r={10} fill={C.ink} />
      </g>
    )}
  </g>
);

/** Aspa roja (prohibido). */
export const Cross: React.FC<{ x: number; y: number; o: number; s?: number }> = ({ x, y, o, s = 1 }) => o <= 0.01 ? null : (
  <g opacity={o} stroke={K.warn} strokeWidth={16 * s} strokeLinecap="round">
    <line x1={x - 50 * s} y1={y - 50 * s} x2={x + 50 * s} y2={y + 50 * s} /><line x1={x + 50 * s} y1={y - 50 * s} x2={x - 50 * s} y2={y + 50 * s} />
  </g>
);
