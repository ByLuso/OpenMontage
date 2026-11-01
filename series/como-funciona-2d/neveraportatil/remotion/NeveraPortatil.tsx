// Dibujos SVG del episodio «Cómo enfría una nevera portátil de coche sin gas ni compresor (efecto Peltier)».
// Todo en coordenadas del lienzo 1080×1920. Colores de la serie: naranja calor, cian frío/aire, amarillo corriente/lo importante, rojo error.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = { shell: "#3E6AA0", dark: "#2B4A72", light: "#9FB3CC", deep: "#16294A", hole: "#0A1528", ceramic: "#E8EEF6", tab: "#C9D3E0" };
const cl = (x: number) => Math.max(0, Math.min(1, x));
const mix = (a: string, b: string, k: number) => {
  const p = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = p(a), B = p(b), q = cl(k);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * q)).join(",")})`;
};

/** Ventilador visto de frente: aspas que giran. */
export const Fan: React.FC<{ x: number; y: number; r: number; t: number; speed?: number; color?: string; glow?: number }> = ({ x, y, r, t, speed = 1, color = C.light, glow = 0 }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={r} fill={C.hole} stroke={glow > 0.01 ? K.flow : C.dark} strokeWidth={6} />
    {glow > 0.01 && <circle r={r + 14} fill="none" stroke={K.flow} strokeWidth={6} opacity={glow * (0.5 + 0.5 * Math.sin(t * 6))} />}
    <g transform={`rotate(${t * 900 * speed})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} transform={`rotate(${a})`} d={`M 0,0 C ${r * 0.25},${-r * 0.2} ${r * 0.55},${-r * 0.55} ${r * 0.18},${-r * 0.9} C ${-r * 0.1},${-r * 0.6} ${-r * 0.12},${-r * 0.3} 0,0 Z`} fill={color} />
      ))}
    </g>
    <circle r={r * 0.16} fill={C.dark} stroke={C.light} strokeWidth={3} />
  </g>
);

/** Rejilla de ventilación (ranuras). `covered` 0-1 la tapa con un trapo rojo. */
export const Grille: React.FC<{ x: number; y: number; w: number; h: number; n?: number; covered?: number }> = ({ x, y, w, h, n = 6, covered = 0 }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={10} fill={C.deep} />
    {Array.from({ length: n }, (_, k) => <rect key={k} x={x + 14} y={y + 10 + k * ((h - 20) / n)} width={w - 28} height={(h - 20) / n * 0.5} rx={4} fill={C.hole} />)}
    {covered > 0.01 && <path d={`M ${x - 20},${y - 14} Q ${x + w / 2},${y - 40 + 20 * (1 - covered)} ${x + w + 20},${y - 14} L ${x + w + 26},${y + h * covered + 14} Q ${x + w / 2},${y + h * covered + 34} ${x - 26},${y + h * covered + 14} Z`} fill={K.warn} opacity={0.92} />}
  </g>
);

/** Lata de refresco simple. */
export const Can: React.FC<{ x: number; y: number; h?: number; color?: string; o?: number }> = ({ x, y, h = 120, color = K.cold, o = 1 }) => {
  const w = h * 0.55;
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - h} width={w} height={h} rx={10} fill={color} />
      <rect x={x - w / 2} y={y - h} width={w} height={14} rx={6} fill={C.light} />
      <rect x={x - w / 2} y={y - 14} width={w} height={14} rx={6} fill={C.light} />
      <rect x={x - w / 2 + 8} y={y - h + 26} width={8} height={h - 52} rx={4} fill="#FFFFFF" opacity={0.45} />
    </g>
  );
};

/** Placa Peltier vista de frente: cuadrado cerámico con su cuadrícula y los dos cables. */
export const PeltierTile: React.FC<{ x: number; y: number; s: number; t: number; glow?: number; cold?: number }> = ({ x, y, s, t, glow = 0, cold = 0 }) => {
  const g = 8, cell = s / g;
  const face = mix(C.ceramic, "#BFEFFF", cold);
  return (
    <g>
      {glow > 0.01 && <rect x={x - s / 2 - 18} y={y - s / 2 - 18} width={s + 36} height={s + 36} rx={18} fill="none" stroke={K.flow} strokeWidth={6} opacity={glow * (0.6 + 0.4 * Math.sin(t * 5))} />}
      <path d={`M ${x - s / 2 + 6},${y + s / 2 - 30} C ${x - s / 2 - 80},${y + s / 2 + 10} ${x - s / 2 - 40},${y + s / 2 + 110} ${x - s / 2 - 120},${y + s / 2 + 130}`} fill="none" stroke={K.warn} strokeWidth={10} strokeLinecap="round" />
      <path d={`M ${x - s / 2 + 6},${y + s / 2 - 12} C ${x - s / 2 - 50},${y + s / 2 + 40} ${x - s / 2 + 10},${y + s / 2 + 130} ${x - s / 2 - 60},${y + s / 2 + 160}`} fill="none" stroke="#1C1F26" strokeWidth={10} strokeLinecap="round" />
      <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={8} fill={face} stroke={C.light} strokeWidth={4} />
      {Array.from({ length: g * g }, (_, k) => {
        const i = k % g, j = Math.floor(k / g);
        return <rect key={k} x={x - s / 2 + i * cell + cell * 0.18} y={y - s / 2 + j * cell + cell * 0.18} width={cell * 0.64} height={cell * 0.64} rx={3} fill={C.light} opacity={0.35} />;
      })}
    </g>
  );
};

/** Disipador de aletas (de pie). `color` según caliente/frío. `down` = aletas hacia abajo. */
export const Heatsink: React.FC<{ x: number; y: number; w: number; h: number; color?: string; down?: boolean; n?: number }> = ({ x, y, w, h, color = C.light, down = false, n = 11 }) => {
  const base = 18;
  const fw = (w / n) * 0.45;
  return (
    <g>
      <rect x={x - w / 2} y={down ? y : y + h - base} width={w} height={base} rx={4} fill={color} />
      {Array.from({ length: n }, (_, k) => (
        <rect key={k} x={x - w / 2 + (k + 0.5) * (w / n) - fw / 2} y={down ? y + base : y} width={fw} height={h - base} rx={3} fill={color} />
      ))}
    </g>
  );
};

/** Nevera portátil de coche, vista de frente. La placa va en la tapa: `open` levanta la tapa y deja ver el módulo y el interior. */
export const Cooler: React.FC<{ cx: number; cy: number; w: number; t: number; open?: number; fan?: number; covered?: number; hot?: number; cans?: boolean; id?: string; inside?: number; lift?: number }> =
  ({ cx, cy, w, t, open = 0, fan = 1, covered = 0, hot = 0, cans = true, id = "c", inside = 0, lift: liftK = 0.42 }) => {
    const h = w * 0.68;                 // cuerpo
    const lidH = w * 0.2;
    const x0 = cx - w / 2, yb = cy - h / 2 + lidH * 0.5; // arriba del cuerpo
    const lift = open * w * liftK;
    const ly = yb - lidH - lift;         // arriba de la tapa
    const gw = w * 0.34, gh = lidH * 0.62;
    const insideCold = Math.max(open, inside);
    return (
      <g>
        <defs>
          <clipPath id={`box-${id}`}><rect x={x0 + 26} y={yb + 4} width={w - 52} height={h - 40} rx={14} /></clipPath>
        </defs>
        {/* sombra */}
        <ellipse cx={cx} cy={yb + h + 18} rx={w * 0.52} ry={22} fill="#000" opacity={0.25} />
        {/* cuerpo */}
        <rect x={x0} y={yb} width={w} height={h} rx={26} fill={C.shell} />
        <rect x={x0} y={yb + h - 34} width={w} height={34} rx={14} fill={C.dark} />
        {/* interior visible cuando la tapa sube */}
        <g opacity={cl(insideCold * 1.4)} clipPath={`url(#box-${id})`}>
          <rect x={x0 + 26} y={yb + 4} width={w - 52} height={h - 40} fill={C.hole} />
          <rect x={x0 + 26} y={yb + 4} width={w - 52} height={h - 40} fill={K.cold} opacity={0.1 + 0.06 * Math.sin(t * 2)} />
          {cans && [0.24, 0.42, 0.6, 0.78].map((f, k) => <Can key={k} x={x0 + w * f} y={yb + h - 40} h={w * 0.26} color={k % 2 ? K.cold : "#5ED3F5"} />)}
          {Array.from({ length: 5 }, (_, k) => {
            const ph = (t * 0.5 + k / 5) % 1;
            return <circle key={k} cx={x0 + w * (0.2 + 0.15 * k)} cy={yb + 10 + ph * (h * 0.6)} r={6} fill={K.cold} opacity={0.7 * (1 - ph)} />;
          })}
        </g>
        {/* tapa cerrada: tapa de cuerpo (borde) */}
        <rect x={x0 + 10} y={yb - 6} width={w - 20} height={14} rx={6} fill={C.dark} opacity={1 - cl(open * 3)} />
        {/* módulo bajo la tapa (se ve al abrir): disipador frío + placa */}
        <g opacity={cl(open * 2)}>
          <Heatsink x={cx} y={ly + lidH} w={w * 0.36} h={lift * 0.55} color={K.cold} down />
          <rect x={cx - w * 0.12} y={ly + lidH - 6} width={w * 0.24} height={14} rx={3} fill={C.ceramic} />
        </g>
        {/* tapa */}
        <rect x={x0 - 8} y={ly} width={w + 16} height={lidH} rx={26} fill={C.light} />
        <rect x={x0 - 8} y={ly + lidH - 18} width={w + 16} height={18} rx={8} fill={C.shell} opacity={0.6} />
        <Grille x={cx - gw / 2} y={ly + (lidH - gh) / 2 - 4} w={gw} h={gh} n={5} covered={covered} />
        <g opacity={0.55}><Fan x={cx} y={ly + lidH / 2 - 4} r={gh * 0.42} t={t} speed={fan} color={C.light} /></g>
        {/* asa */}
        <path d={`M ${x0 + w * 0.1},${ly + 10} C ${x0 + w * 0.1},${ly - w * 0.22} ${x0 + w * 0.9},${ly - w * 0.22} ${x0 + w * 0.9},${ly + 10}`} fill="none" stroke={C.dark} strokeWidth={22} strokeLinecap="round" />
        {/* aire caliente que sale por la rejilla */}
        {fan > 0.05 && covered < 0.5 && Array.from({ length: 6 }, (_, k) => {
          const ph = (t * 0.9 + k / 6) % 1;
          const side = k % 2 ? 1 : -1;
          return <path key={k} d={`M ${cx + side * (gw / 2 + 10)},${ly + lidH / 2} q ${side * 30},-20 ${side * (40 + 110 * ph)},${-10 - 30 * ph}`} fill="none" stroke={K.hot} strokeWidth={8} strokeLinecap="round" opacity={0.7 * (1 - ph) * fan} />;
        })}
        {/* calor atrapado */}
        {hot > 0.01 && <ellipse cx={cx} cy={ly + lidH / 2} rx={w * 0.45} ry={lidH * 0.9} fill={K.hot} opacity={0.28 * hot * (0.8 + 0.2 * Math.sin(t * 7))} />}
        {/* enchufe de mechero */}
        <path d={`M ${x0 + w},${yb + h * 0.55} C ${x0 + w + 70},${yb + h * 0.6} ${x0 + w + 30},${yb + h + 40} ${x0 + w + 100},${yb + h + 60}`} fill="none" stroke="#1C1F26" strokeWidth={12} strokeLinecap="round" />
      </g>
    );
  };

/** Corte de la placa Peltier: dos cerámicas, bloquecitos N/P y pletinas en serpentina.
 *  build 0-1: aparecen los bloquecitos · dir +1 calor hacia arriba (fuera) / -1 al revés / 0 sin corriente · temp 0-1 colorea las caras · slab: dibuja la placa entera sin ver dentro. */
export const STACK = { x0: 170, x1: 910, yTop: 600, yBot: 880, plate: 40, n: 8 };
export const stackPellet = (i: number) => {
  const { x0, x1, n } = STACK;
  const step = (x1 - x0) / n;
  return { cx: x0 + step * (i + 0.5), w: step * 0.58 };
};
export const Stack: React.FC<{ t: number; build?: number; dir?: number; temp?: number; current?: number; heat?: number; slab?: number; labelsNP?: number; leads?: boolean }> =
  ({ t, build = 1, dir = 1, temp = 0, current = 0, heat = 0, slab = 0, labelsNP = 0, leads = true }) => {
    const { x0, x1, yTop, yBot, plate, n } = STACK;
    const pTop = yTop + plate, pBot = yBot - plate; // zona de los bloquecitos
    const up = dir >= 0;
    const topCol = mix(C.ceramic, up ? K.hot : K.cold, temp);
    const botCol = mix(C.ceramic, up ? K.cold : K.hot, temp);
    const P = Array.from({ length: n }, (_, i) => stackPellet(i));
    // serpentina de la corriente (electrones): entra por abajo del 0, sube N, baja P...
    const path: [number, number][] = [[x0 - 40, pBot + 60], [P[0].cx, pBot + 60]];
    P.forEach((p, i) => {
      const goingUp = i % 2 === 0;
      path.push([p.cx, goingUp ? pBot : pTop], [p.cx, goingUp ? pTop : pBot]);
    });
    path.push([P[n - 1].cx, pBot + 60], [x1 + 40, pBot + 60]);
    const segs = path.slice(1).map((q, k) => ({ a: path[k], b: q, L: Math.hypot(q[0] - path[k][0], q[1] - path[k][1]) }));
    const total = segs.reduce((s, g) => s + g.L, 0);
    const at = (d: number): [number, number] => {
      let r = ((d % total) + total) % total;
      for (const g of segs) { if (r <= g.L) { const k = r / g.L; return [g.a[0] + (g.b[0] - g.a[0]) * k, g.a[1] + (g.b[1] - g.a[1]) * k]; } r -= g.L; }
      return path[path.length - 1];
    };
    const sgn = dir >= 0 ? 1 : -1;
    return (
      <g>
        {/* cables a la batería */}
        {leads && <>
          <path d={`M ${x0 + 10},${pBot + 60} L ${x0 - 40},${pBot + 60} L ${x0 - 40},${yBot + 150}`} fill="none" stroke={K.warn} strokeWidth={10} strokeLinejoin="round" />
          <path d={`M ${x1 - 10},${pBot + 60} L ${x1 + 10},${pBot + 60} L ${x1 + 10},${yBot + 150}`} fill="none" stroke="#1C1F26" strokeWidth={10} strokeLinejoin="round" />
        </>}
        {/* cerámicas */}
        <rect x={x0 - 20} y={yTop} width={x1 - x0 + 40} height={plate} rx={8} fill={topCol} />
        <rect x={x0 - 20} y={yBot - plate} width={x1 - x0 + 40} height={plate} rx={8} fill={botCol} />
        {/* relleno macizo (antes de abrirla) */}
        {slab > 0.01 && <rect x={x0 - 20} y={pTop} width={x1 - x0 + 40} height={pBot - pTop} fill={C.dark} opacity={slab} />}
        {/* pletinas y bloquecitos */}
        <g opacity={1 - slab}>
          {P.map((p, i) => {
            const k = cl(build * n - i);
            const isN = i % 2 === 0;
            const nextTop = i % 2 === 0 && i < n - 1;
            const nextBot = i % 2 === 1 && i < n - 1;
            const step = P[1].cx - P[0].cx;
            return (
              <g key={i} opacity={0.2 + 0.8 * k}>
                {nextTop && <rect x={p.cx - p.w / 2} y={pTop} width={step + p.w} height={12} fill={C.tab} />}
                {nextBot && <rect x={p.cx - p.w / 2} y={pBot - 12} width={step + p.w} height={12} fill={C.tab} />}
                {(i === 0 || i === n - 1) && <rect x={p.cx - p.w / 2} y={pBot - 12} width={p.w} height={12} fill={C.tab} />}
                <rect x={p.cx - p.w / 2} y={pTop + 12} width={p.w} height={pBot - pTop - 24} rx={4} fill={isN ? "#4F78B0" : "#7D93B5"} stroke={C.deep} strokeWidth={3} />
                <text x={p.cx} y={(pTop + pBot) / 2 + 16} textAnchor="middle" fontFamily="MontserratSerie, sans-serif" fontWeight={900} fontSize={44} fill={K.white} opacity={labelsNP}>{isN ? "N" : "P"}</text>
              </g>
            );
          })}
          {/* corriente: puntos amarillos por la serpentina */}
          {current > 0.01 && Array.from({ length: 42 }, (_, k) => {
            const [px, py] = at((k / 42) * total + sgn * t * 260);
            return <circle key={k} cx={px} cy={py} r={7} fill={K.flow} opacity={current} />;
          })}
        </g>
        {/* calor: puntos naranjas que viajan de una cara a la otra por cada bloquecito (o por la placa entera) */}
        {heat > 0.01 && P.map((p, i) => Array.from({ length: 3 }, (_, k) => {
          const ph = (t * 0.7 + k / 3 + i * 0.13) % 1;
          const yy = up ? yBot + 40 - ph * (yBot - yTop + 80) : yTop - 40 + ph * (yBot - yTop + 80);
          const fade = Math.min(1, ph * 4, (1 - ph) * 4);
          return <circle key={`${i}-${k}`} cx={p.cx + (slab > 0.5 ? 20 * Math.sin(ph * 6 + i) : 0)} cy={yy} r={11} fill={K.hot} opacity={heat * fade} />;
        }))}
      </g>
    );
  };

/** Termómetro vertical con cifra. */
export const Thermo: React.FC<{ x: number; y: number; h: number; value: number; min: number; max: number; color: string; o?: number }> = ({ x, y, h, value, min, max, color, o = 1 }) => {
  const f = cl((value - min) / (max - min));
  return (
    <g opacity={o}>
      <rect x={x - 26} y={y - h} width={52} height={h} rx={26} fill={C.deep} stroke={C.light} strokeWidth={5} />
      <circle cx={x} cy={y + 20} r={44} fill={color} stroke={C.light} strokeWidth={5} />
      <rect x={x - 14} y={y - (h - 20) * f} width={28} height={(h - 20) * f + 20} rx={14} fill={color} />
      {[0.25, 0.5, 0.75].map((k) => <line key={k} x1={x + 26} y1={y - h * k} x2={x + 46} y2={y - h * k} stroke={C.light} strokeWidth={4} />)}
    </g>
  );
};

/** Reloj de bolsillo (Peltier era relojero). */
export const PocketWatch: React.FC<{ x: number; y: number; r: number; t: number }> = ({ x, y, r, t }) => (
  <g transform={`translate(${x},${y})`}>
    <circle cx={0} cy={-r - 34} r={26} fill="none" stroke={K.flow} strokeWidth={10} />
    <rect x={-18} y={-r - 16} width={36} height={26} rx={6} fill={K.flow} />
    <circle r={r} fill={K.flow} />
    <circle r={r * 0.88} fill={C.ceramic} />
    {Array.from({ length: 12 }, (_, k) => {
      const a = (k / 12) * Math.PI * 2;
      return <line key={k} x1={Math.sin(a) * r * 0.72} y1={-Math.cos(a) * r * 0.72} x2={Math.sin(a) * r * 0.82} y2={-Math.cos(a) * r * 0.82} stroke={C.deep} strokeWidth={k % 3 ? 4 : 8} />;
    })}
    <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={C.deep} strokeWidth={10} strokeLinecap="round" transform={`rotate(${t * 30})`} />
    <line x1={0} y1={0} x2={0} y2={-r * 0.7} stroke={K.warn} strokeWidth={6} strokeLinecap="round" transform={`rotate(${t * 360})`} />
    <circle r={10} fill={C.deep} />
  </g>
);

/** Iconos del resumen. */
export const Icon: React.FC<{ kind: "corriente" | "placa" | "calor"; x: number; y: number; on: number; t: number }> = ({ kind, x, y, on, t }) => {
  const col = on > 0.5 ? (kind === "calor" ? K.hot : K.flow) : C.light;
  const sc = 1 + 0.1 * on * Math.max(0, Math.sin(t * 5));
  return (
    <g transform={`translate(${x},${y}) scale(${sc})`} opacity={0.35 + 0.65 * on}>
      <circle r={86} fill="rgba(6,16,31,0.8)" stroke={col} strokeWidth={5} />
      {kind === "corriente" && <path d="M 10,-52 L -30,8 L -2,8 L -12,52 L 32,-10 L 4,-10 Z" fill={col} />}
      {kind === "placa" && <><rect x={-42} y={-42} width={84} height={84} rx={6} fill={col} />{[-21, 0, 21].map((a) => [-21, 0, 21].map((b) => <rect key={`${a}${b}`} x={a - 7} y={b - 7} width={14} height={14} rx={2} fill={K.ink} opacity={0.5} />))}</>}
      {kind === "calor" && <>{[-24, 0, 24].map((dx) => <path key={dx} d={`M ${dx},40 C ${dx - 16},20 ${dx + 16},4 ${dx},-16 L ${dx},-40`} fill="none" stroke={col} strokeWidth={8} strokeLinecap="round" />)}<path d="M -16,-30 L 0,-50 L 16,-30" fill="none" stroke={col} strokeWidth={8} strokeLinecap="round" transform="translate(24,0)" /></>}
    </g>
  );
};

/** Frigorífico de casa (silueta). */
export const HomeFridge: React.FC<{ x: number; y: number; h: number; o?: number }> = ({ x, y, h, o = 1 }) => {
  const w = h * 0.52;
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - h} width={w} height={h} rx={18} fill={C.light} />
      <line x1={x - w / 2} y1={y - h * 0.62} x2={x + w / 2} y2={y - h * 0.62} stroke={C.dark} strokeWidth={6} />
      <rect x={x + w / 2 - 34} y={y - h * 0.9} width={12} height={h * 0.2} rx={6} fill={C.dark} />
      <rect x={x + w / 2 - 34} y={y - h * 0.5} width={12} height={h * 0.25} rx={6} fill={C.dark} />
      {/* compresor abajo detrás */}
      <rect x={x - w / 2 + 16} y={y - 70} width={w * 0.45} height={56} rx={22} fill={C.dark} />
    </g>
  );
};
