// Dibujos SVG planos del episodio «Cómo se limpia solo un horno pirolítico» (n.º 148).
// Colores de código: naranja = calor, cian = agua/aire frío, amarillo = lo importante, blanco = vapor/humo limpio, rojo = peligro.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = { shell: "#2B4A72", shell2: "#3E6AA0", light: "#9FB3CC", dark: "#132A4A", ink: "#06101F", metal: "#C9D6E6", grease: "#7A4A22", grease2: "#A0642C", ash: "#D9DEE6", smoke: "#6E7480" };
const W = 1080, H = 1920;
export const Svg: React.FC<{ children: React.ReactNode; o?: number }> = ({ children, o = 1 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>{children}</svg>
);
const cl = (x: number) => Math.max(0, Math.min(1, x));
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** Mezcla dos colores #rrggbb. */
export const mix = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b), q = cl(k);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * q)).join(",")})`;
};

// manchas de grasa en el interior (coordenadas locales del horno)
const BLOBS: [number, number, number][] = [
  [340, 690, 26], [455, 668, 16], [610, 700, 30], [735, 676, 18], [380, 820, 20], [520, 800, 14], [700, 830, 24],
  [330, 950, 22], [450, 975, 30], [600, 960, 20], [730, 975, 28], [560, 900, 12],
];
const blobPath = (x: number, y: number, r: number, seed: number) => {
  const pts = Array.from({ length: 7 }).map((_, k) => {
    const a = (k / 7) * Math.PI * 2;
    const rr = r * (0.75 + 0.35 * Math.abs(Math.sin(seed * 3.1 + k * 1.7)));
    return [x + rr * Math.cos(a), y + rr * Math.sin(a) * 0.8];
  });
  return "M " + pts.map((p, i) => {
    const n = pts[(i + 1) % pts.length];
    return `${p[0].toFixed(1)} ${p[1].toFixed(1)} Q ${((p[0] + n[0]) / 2 + (p[0] - x) * 0.2).toFixed(1)} ${((p[1] + n[1]) / 2 + (p[1] - y) * 0.2).toFixed(1)}`;
  }).join(" ") + ` ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} Z`;
};

/** Candado: lock 0 = abierto, 1 = cerrado. */
export const Padlock: React.FC<{ x: number; y: number; lock: number; s?: number; color?: string; o?: number }> = ({ x, y, lock, s = 1, color = K.flow, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -26 -4 L -26 -30 A 26 26 0 0 1 26 -30 L 26 -4" transform={`translate(0 ${-22 * (1 - lock)}) rotate(${-25 * (1 - lock)} 26 -4)`} fill="none" stroke={color} strokeWidth={11} strokeLinecap="round" />
    <rect x={-40} y={-10} width={80} height={64} rx={12} fill={color} stroke={C.ink} strokeWidth={4} />
    <circle cx={0} cy={16} r={9} fill={C.ink} /><rect x={-4} y={18} width={8} height={18} rx={3} fill={C.ink} />
  </g>
);

/** Termómetro vertical: level 0-1. */
export const Thermo: React.FC<{ x: number; y: number; level: number; h?: number; o?: number }> = ({ x, y, level, h = 300, o = 1 }) => {
  const col = mix(K.cold, K.hot, level);
  return (
    <g opacity={o}>
      <rect x={x - 22} y={y - h} width={44} height={h + 10} rx={22} fill={C.dark} stroke={C.light} strokeWidth={5} />
      <rect x={x - 11} y={y - (h - 20) * cl(level)} width={22} height={(h - 20) * cl(level) + 10} rx={11} fill={col} />
      <circle cx={x} cy={y + 30} r={40} fill={col} stroke={C.light} strokeWidth={5} />
      {[0.25, 0.5, 0.75].map((k) => <line key={k} x1={x + 24} x2={x + 40} y1={y - (h - 20) * k} y2={y - (h - 20) * k} stroke={C.light} strokeWidth={4} />)}
    </g>
  );
};

/**
 * Horno de frente. Cuerpo x 220-860, y 520-1060 (centro 540, 790).
 * open: la puerta se abate hacia abajo · glow: calor interior · dirt: cantidad de mugre · ash: la mugre se vuelve ceniza
 * wipe: un trapo pasa y se lleva la ceniza · lock: candado · panels: paneles porosos (catalítico) · water: agua abajo · steamy: vapor
 * tray: bandeja dentro (0) → fuera (1) · chunk: resto grande de comida · smoke: humillo saliendo arriba
 */
export const Oven: React.FC<{
  t: number; open?: number; glow?: number; dirt?: number; ash?: number; wipe?: number; lock?: number; lockO?: number;
  panels?: number; eat?: number; water?: number; steamy?: number; soften?: number; tray?: number; trayX?: number; chunk?: number; smoke?: number;
  food?: number; s?: number; cx?: number; cy?: number; display?: string;
}> = ({ t, open = 0, glow = 0, dirt = 1, ash = 0, wipe = 0, lock = 0, lockO = 0, panels = 0, eat = 0, water = 0, steamy = 0, soften = 0,
  tray = 0, trayX = 0, chunk = 0, smoke = 0, food = 0, s = 1, cx = 540, cy = 790, display }) => {
  const g = glow * (0.85 + 0.15 * Math.sin(t * 6));
  const wx = 280 + 540 * cl(wipe); // posición del trapo
  const doorK = 1 - 0.88 * cl(open);
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s}) translate(-540 -790)`}>
      <ellipse cx={540} cy={1075} rx={360} ry={18} fill="#000" opacity={0.3} />
      {/* cuerpo */}
      <rect x={220} y={520} width={640} height={540} rx={26} fill={C.shell} stroke={C.shell2} strokeWidth={6} />
      {/* panel de mandos */}
      <rect x={240} y={538} width={600} height={70} rx={14} fill={C.dark} />
      <circle cx={300} cy={573} r={22} fill={C.light} /><line x1={300} y1={573} x2={300 + 16 * Math.cos(-1.2)} y2={573 + 16 * Math.sin(-1.2)} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <circle cx={780} cy={573} r={22} fill={C.light} /><line x1={780} y1={573} x2={792} y2={560} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <rect x={450} y={552} width={180} height={42} rx={8} fill={C.ink} stroke={C.shell2} strokeWidth={3} />
      {display && <text x={540} y={583} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={28} fill={glow > 0.3 ? K.hot : K.cold}>{display}</text>}
      {/* rejilla de salida de humos bajo el panel */}
      {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={470 + k * 24} y={612} width={14} height={6} rx={3} fill={C.ink} opacity={0.7} />)}
      {/* cavidad */}
      <rect x={280} y={640} width={520} height={370} rx={12} fill={C.ink} />
      <rect x={280} y={640} width={520} height={370} rx={12} fill={K.hot} opacity={0.55 * g} />
      <ellipse cx={540} cy={825} rx={230} ry={160} fill={K.flow} opacity={0.22 * g} />
      {/* paneles porosos laterales (catalítico) */}
      {panels > 0.01 && [290, 740].map((px) => (
        <g key={px} opacity={panels}>
          <rect x={px} y={652} width={50} height={346} rx={8} fill="#3A3F4A" stroke={K.flow} strokeWidth={3} />
          {Array.from({ length: 30 }).map((_, k) => <circle key={k} cx={px + 13 + (k % 3) * 12} cy={668 + Math.floor(k / 3) * 33} r={4} fill={C.ink} />)}
        </g>
      ))}
      {/* guías / rejilla */}
      <line x1={295} x2={785} y1={760} y2={760} stroke={C.light} strokeWidth={3} opacity={0.35} />
      <line x1={295} x2={785} y1={880} y2={880} stroke={C.light} strokeWidth={3} opacity={0.35} />
      {/* bandeja */}
      {tray < 0.99 && (
        <g transform={`translate(${trayX} 0)`} opacity={1 - tray}>
          <rect x={320} y={868} width={440} height={22} rx={6} fill={C.light} stroke={C.ink} strokeWidth={3} />
          <rect x={320} y={868} width={440} height={8} rx={4} fill={C.metal} />
        </g>
      )}
      {/* comida en la bandeja (catalítico) */}
      {food > 0.01 && <ellipse cx={540} cy={850} rx={90} ry={30} fill={K.hot} opacity={food} />}
      {/* resto grande de comida */}
      {chunk > 0.01 && <path d={blobPath(560, 930, 46, 9)} fill={C.grease} stroke="#3B2410" strokeWidth={4} opacity={chunk} />}
      {/* mugre → ceniza */}
      {dirt > 0.01 && BLOBS.map(([x0, y, r], k) => {
        const onPanel = panels > 0.01 && (x0 < 390 || x0 > 695);
        if (panels > 0.01 && !onPanel) return null;
        const x = onPanel ? (x0 < 540 ? 315 : 765) : x0;
        const gone = (wipe > 0 && y > 930 && x < wx ? 1 : 0) + (wipe > 0 && y <= 930 ? cl(wipe * 1.3 - 0.2) : 0);
        const eaten = onPanel ? cl(eat * 1.2 - (k % 3) * 0.1) : 0;
        const sl = soften * 18 * ((k % 2) + 0.5);
        const o = dirt * (1 - cl(gone)) * (1 - eaten);
        if (o <= 0.01) return null;
        return <path key={k} d={blobPath(x, y + sl, r * (1 - 0.35 * ash) * (1 + 0.15 * soften), k)} fill={onPanel ? "#D08A40" : mix(k % 2 ? C.grease : C.grease2, C.ash, ash)} stroke={onPanel ? C.ink : "none"} strokeWidth={3} opacity={o * (1 - 0.35 * soften)} />;
      })}
      {/* agua abajo y vapor (hidrólisis) */}
      {water > 0.01 && <rect x={300} y={962} width={480} height={22} rx={8} fill={K.cold} opacity={0.85 * water} />}
      {steamy > 0.01 && Array.from({ length: 12 }).map((_, k) => {
        const u = (t * 0.45 + k / 12) % 1;
        const x = 320 + (k * 41) % 440 + 20 * Math.sin(t * 2 + k);
        return <circle key={k} cx={x} cy={965 - 300 * u} r={14 + 22 * u} fill={K.white} opacity={steamy * 0.55 * (1 - u) * Math.min(1, u * 5)} />;
      })}
      {/* trapo húmedo */}
      {wipe > 0.001 && wipe < 0.999 && (
        <g transform={`translate(${wx} 975) rotate(${6 * Math.sin(t * 10)})`}>
          <rect x={-55} y={-30} width={110} height={60} rx={14} fill={K.cold} stroke={C.ink} strokeWidth={4} />
          <path d="M -40 -8 L 40 -8 M -40 10 L 40 10" stroke={K.white} strokeWidth={4} opacity={0.6} />
        </g>
      )}
      {/* puerta (se abate hacia abajo, bisagra en y 1040) */}
      <g transform={`translate(0 1040) scale(1 ${doorK}) translate(0 -1040)`}>
        <rect x={250} y={622} width={580} height={418} rx={18} fill={C.shell2} opacity={0.35 + 0.6 * open} stroke={C.light} strokeWidth={5} />
        <rect x={290} y={652} width={500} height={350} rx={10} fill="#0B1B33" opacity={0.25 + 0.7 * open} />
        <rect x={270} y={634} width={540} height={20} rx={10} fill={C.light} />
        <path d="M 320 690 L 380 690 L 330 760 Z" fill={K.white} opacity={0.12 * (1 - open)} />
      </g>
      {/* candado sobre el asa */}
      {lockO > 0.01 && <Padlock x={540} y={690} lock={lock} s={1.15} o={lockO} />}
      {/* humillo saliendo por la rejilla */}
      {smoke > 0.01 && Array.from({ length: 8 }).map((_, k) => {
        const u = (t * 0.5 + k / 8) % 1;
        return <circle key={k} cx={500 + (k % 4) * 25 + 30 * Math.sin(t * 1.5 + k) * u} cy={612 - 200 * u} r={12 + 26 * u} fill="#8A92A0" opacity={smoke * 0.9 * (1 - u) * Math.min(1, u * 5)} />;
      })}
    </g>
  );
};

/** Bandeja suelta (para el truco): x,y centro. */
export const Tray: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => (
  <g opacity={o}>
    <rect x={x - 220} y={y - 11} width={440} height={22} rx={6} fill={C.light} stroke={C.ink} strokeWidth={3} />
    <rect x={x - 220} y={y - 11} width={440} height={8} rx={4} fill={C.metal} />
  </g>
);

/** Cruz roja. */
export const Cross: React.FC<{ x: number; y: number; p: number; s?: number }> = ({ x, y, p, s = 1 }) => p <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * p)})`} opacity={p}>
    <circle r={52} fill={K.warn} stroke={C.ink} strokeWidth={5} />
    <path d="M -24 -24 L 24 24 M 24 -24 L -24 24" stroke={K.white} strokeWidth={12} strokeLinecap="round" />
  </g>
);

/**
 * Corte lateral del horno (puerta a la izquierda). Caja x 200-880, y 560-1060.
 * heat: calor dentro · ins: aislante resaltado · glass: cristales resaltados · cool: flechas de aire frío fuera
 * smoke: humo que sube al catalizador · cat: catalizador resaltado
 */
export const Section: React.FC<{ t: number; heat?: number; ins?: number; glass?: number; cool?: number; smoke?: number; cat?: number; clean?: number }> =
  ({ t, heat = 1, ins = 0, glass = 0, cool = 0, smoke = 0, cat = 0, clean = 0 }) => {
    const g = heat * (0.85 + 0.15 * Math.sin(t * 6));
    // recorrido del humo: cavidad → catalizador (arriba, detrás) → conducto → salida delante bajo el panel
    const path: [number, number][] = [[560, 900], [600, 760], [690, 690], [700, 640], [620, 610], [420, 610], [260, 610], [170, 640]];
    const at = (u: number) => {
      const f = u * (path.length - 1), i = Math.min(path.length - 2, Math.floor(f)), k = f - i;
      return [path[i][0] + (path[i + 1][0] - path[i][0]) * k, path[i][1] + (path[i + 1][1] - path[i][1]) * k];
    };
    return (
      <g>
        <ellipse cx={540} cy={1075} rx={360} ry={18} fill="#000" opacity={0.3} />
        {/* carcasa */}
        <rect x={200} y={560} width={680} height={500} rx={22} fill={C.shell} stroke={C.shell2} strokeWidth={6} />
        {/* aislante (paredes gruesas) */}
        <g opacity={0.45 + 0.55 * ins}>
          <rect x={300} y={670} width={540} height={350} rx={14} fill="#C9A43A" />
          {Array.from({ length: 22 }).map((_, k) => <line key={k} x1={300 + k * 26} y1={670} x2={300 + k * 26 - 40} y2={1020} stroke={C.ink} strokeWidth={3} opacity={0.35} />)}
        </g>
        {/* cavidad */}
        <rect x={340} y={710} width={460} height={270} rx={10} fill={C.ink} />
        <rect x={340} y={710} width={460} height={270} rx={10} fill={K.hot} opacity={0.6 * g} />
        <ellipse cx={570} cy={845} rx={180} ry={100} fill={K.flow} opacity={0.25 * g} />
        {/* ondas de calor dentro */}
        {heat > 0.05 && [0, 1, 2].map((k) => {
          const u = (t * 0.6 + k / 3) % 1;
          return <path key={k} d={`M ${430 + k * 110} ${960 - 200 * u} q 15 -20 0 -40 q -15 -20 0 -40`} stroke={K.flow} strokeWidth={6} fill="none" opacity={heat * (1 - u)} strokeLinecap="round" />;
        })}
        {/* panel de mandos arriba delante */}
        <rect x={200} y={560} width={680} height={40} rx={14} fill={C.dark} />
        {/* catalizador arriba detrás */}
        <g>
          <rect x={650} y={622} width={120} height={46} rx={8} fill={C.dark} stroke={cat > 0.5 ? K.flow : C.light} strokeWidth={cat > 0.5 ? 6 : 3} />
          {Array.from({ length: 10 }).map((_, k) => <rect key={k} x={660 + (k % 5) * 21} y={630 + Math.floor(k / 5) * 18} width={14} height={12} rx={2} fill={mix(C.light, K.flow, cat)} />)}
          {cat > 0.01 && <rect x={638} y={612} width={144} height={66} rx={12} fill="none" stroke={K.flow} strokeWidth={4} strokeDasharray="10 8" opacity={cat} />}
        </g>
        {/* conducto de salida hacia delante */}
        <path d="M 650 640 L 640 615 L 190 615" stroke={C.light} strokeWidth={4} fill="none" opacity={0.5} strokeDasharray="8 8" />
        {/* puerta con varios cristales (izquierda) */}
        <g>
          <rect x={150} y={640} width={60} height={410} rx={10} fill={C.shell2} stroke={C.light} strokeWidth={4} />
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={160 + k * 12} y={680} width={6} height={330} rx={3} fill={mix(K.cold, K.hot, (3 - k) / 3 * heat * 0.9)} opacity={0.5 + 0.5 * glass} />
          ))}
          {glass > 0.01 && <rect x={140} y={668} width={80} height={354} rx={12} fill="none" stroke={K.flow} strokeWidth={4} strokeDasharray="10 8" opacity={glass} />}
        </g>
        {/* aire frío fuera */}
        {cool > 0.01 && [0, 1, 2].map((k) => {
          const u = (t * 0.7 + k / 3) % 1;
          return <path key={k} d={`M ${110} ${1000 - 330 * u} l 0 -40 m -14 14 l 14 -14 l 14 14`} stroke={K.cold} strokeWidth={6} fill="none" opacity={cool * Math.min(1, (1 - u) * 3)} strokeLinecap="round" />;
        })}
        {/* humo: gris antes del catalizador, blanco después */}
        {smoke > 0.01 && Array.from({ length: 14 }).map((_, k) => {
          const u = (t * 0.22 + k / 14) % 1;
          const [x, y] = at(u);
          const after = u > 0.45;
          const c = after ? mix(C.smoke, K.white, clean) : C.smoke;
          return <circle key={k} cx={x} cy={y} r={after ? 14 : 20} fill={c} opacity={smoke * 0.85 * Math.min(1, (1 - u) * 5) * Math.min(1, u * 8)} />;
        })}
      </g>
    );
  };

/** Molécula de grasa (cadena) que se rompe: brk 0→1; los trozos suben como gases y abajo queda ceniza. */
export const Grease: React.FC<{ t: number; brk: number; heat: number; ash: number }> = ({ t, brk, heat, ash }) => {
  const N = 12;
  return (
    <g>
      {/* llama de calor de fondo */}
      <ellipse cx={540} cy={1010} rx={330} ry={40} fill={K.hot} opacity={0.5 * heat * (0.8 + 0.2 * Math.sin(t * 7))} />
      {[0, 1, 2, 3, 4].map((k) => {
        const u = (t * 0.8 + k / 5) % 1;
        return <path key={k} d={`M ${300 + k * 120} ${1000 - 70 * u} q 14 -18 0 -36 q -14 -18 0 -36`} stroke={K.hot} strokeWidth={6} fill="none" opacity={heat * (1 - u)} strokeLinecap="round" />;
      })}
      {Array.from({ length: N }).map((_, k) => {
        const x0 = 240 + k * 55, y0 = 840 + 40 * Math.sin(k * 0.9 + t * 1.5);
        const u = cl(brk * 1.4 - (k % 4) * 0.12);
        const up = u * (110 + (k % 3) * 40), dx = u * 60 * Math.sin(k * 2.3);
        const gas = k % 3 !== 0; // dos de cada tres trozos se van como gas
        const x = x0 + dx, y = gas ? y0 - up : y0 + u * (110 - (k % 2) * 10);
        const col = gas ? mix(C.grease2, "#B8BEC8", u) : mix(C.grease2, C.ash, cl(ash));
        return (
          <g key={k}>
            {k < N - 1 && brk < 0.35 && <line x1={x0} y1={y0} x2={240 + (k + 1) * 55} y2={840 + 40 * Math.sin((k + 1) * 0.9 + t * 1.5)} stroke={C.grease} strokeWidth={10} opacity={1 - brk * 2.8} />}
            <circle cx={x} cy={y} r={gas ? 22 + 18 * u : 22 - 8 * u} fill={col} stroke={gas ? "none" : C.ink} strokeWidth={3} opacity={gas ? 1 - 0.6 * u : 1} />
          </g>
        );
      })}
      {/* montoncito de ceniza */}
      <path d={`M ${540 - 230 * ash} 975 Q 540 ${975 - 50 * ash} ${540 + 230 * ash} 975 Z`} fill={C.ash} opacity={ash} />
    </g>
  );
};

/** Reloj: hand 0-1 (vuelta), arc de 1 h a h (0-3 sobre 3 horas). */
export const Clock: React.FC<{ t: number; hours: number }> = ({ t, hours }) => {
  const cx = 540, cy = 770, r = 210;
  const arc = (h: number) => {
    const a = -Math.PI / 2 + (h / 3) * Math.PI * 2 * 0.999;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const [ex, ey] = arc(hours);
  const big = hours / 3 > 0.5 ? 1 : 0;
  const ang = t * 120;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 30} fill={C.dark} stroke={C.shell2} strokeWidth={8} />
      {hours > 0.01 && <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 ${big} 1 ${ex} ${ey}`} stroke={K.hot} strokeWidth={30} fill="none" strokeLinecap="round" />}
      {[0, 1, 2].map((h) => {
        const a = -Math.PI / 2 + (h / 3) * Math.PI * 2;
        return <text key={h} x={cx + (r - 62) * Math.cos(a)} y={cy + (r - 62) * Math.sin(a) + 16} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={46} fill={K.white}>{h === 0 ? "3 h" : `${h} h`}</text>;
      })}
      <line x1={cx} y1={cy} x2={cx + 130 * Math.cos((ang - 90) * Math.PI / 180)} y2={cy + 130 * Math.sin((ang - 90) * Math.PI / 180)} stroke={K.flow} strokeWidth={12} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={18} fill={K.flow} />
    </g>
  );
};

/** Rayo de energía. */
export const Bolt: React.FC<{ t: number; x: number; y: number; s?: number; p?: number }> = ({ t, x, y, s = 1, p = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * (1 + 0.04 * Math.sin(t * 8))})`} opacity={p}>
    <circle r={230} fill={K.flow} opacity={0.12 + 0.06 * Math.sin(t * 8)} />
    <path d="M 30 -200 L -110 30 L -10 30 L -50 200 L 110 -40 L 10 -40 Z" fill={K.flow} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
  </g>
);

/** Ventana abierta (izquierda) con aire entrando. */
export const Window: React.FC<{ t: number; x: number; y: number; open: number; o?: number }> = ({ t, x, y, open, o = 1 }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={200} height={260} rx={10} fill="#0B1B33" stroke={C.light} strokeWidth={6} />
    <rect x={x + 10} y={y + 10} width={180} height={240} fill="#1C3D6B" />
    <circle cx={x + 140} cy={y + 70} r={26} fill={K.flow} opacity={0.8} />
    <g transform={`translate(${x + 10} ${y + 10}) skewY(${-18 * open}) scale(${1 - 0.55 * open} 1)`}>
      <rect width={180} height={240} fill={C.light} opacity={0.35} stroke={C.light} strokeWidth={4} />
    </g>
    {open > 0.05 && [0, 1, 2].map((k) => {
      const u = (t * 0.8 + k / 3) % 1;
      return <path key={k} d={`M ${x + 160 + 120 * u} ${y + 70 + k * 60} q 20 -12 40 0 q 20 12 40 0`} stroke={K.cold} strokeWidth={6} fill="none" opacity={open * (1 - u)} strokeLinecap="round" />;
    })}
  </g>
);
