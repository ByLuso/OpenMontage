// Dibujos SVG del episodio «Cómo funciona una cafetera de cápsulas». Todo en coordenadas absolutas de 1080×1920.
// Colores de código: naranja = calor, cian = agua, amarillo = lo importante, blanco = vapor, rojo = peligro.
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F", coffee: "#6B3F1F", coffee2: "#8A5530", crema: "#D9A35E", alu: "#C9D3E0", cal: "#F2EEE4" };

/** Pseudo-aleatorio determinista. */
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Línea de flujo animada (trazo discontinuo que avanza). */
export const Flow: React.FC<{ d: string; t: number; color?: string; w?: number; o?: number; speed?: number }> = ({ d, t, color = K.cold, w = 12, o = 1, speed = 160 }) => (
  <g opacity={o}>
    <path d={d} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={w + 8} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="26 22" strokeDashoffset={-t * speed} />
  </g>
);

/** Gotas que caen entre y0 e y1. */
export const Drips: React.FC<{ x: number; y0: number; y1: number; t: number; o: number; color?: string; n?: number; spread?: number; r?: number }> = ({ x, y0, y1, t, o, color = C.coffee2, n = 5, spread = 0, r = 9 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    {Array.from({ length: n }).map((_, i) => {
      const p = (t * 1.6 + i / n) % 1;
      const xx = x + (rnd(i + 3) - 0.5) * spread;
      return <ellipse key={i} cx={xx} cy={y0 + (y1 - y0) * p} rx={r * 0.8} ry={r * 1.25} fill={color} />;
    })}
  </g>
);

/** Taza vista de lado. `fill` 0-1 nivel de café, `crema` 0-1 capa de crema. */
export const Cup: React.FC<{ cx: number; y: number; w: number; fill: number; crema?: number; t: number; steam?: number; bubbles?: number }> = ({ cx, y, w, fill, crema = 0, t, steam = 0, bubbles = 0 }) => {
  const h = w * 0.78, x0 = cx - w / 2, x1 = cx + w / 2, inset = w * 0.08;
  const lvl = y + h - (h - 14) * clamp01(fill);
  const lx0 = x0 + inset * (1 - (y + h - lvl) / h) + 4, lx1 = x1 - inset * (1 - (y + h - lvl) / h) - 4;
  const ch = Math.max(0, h * 0.13 * crema);
  return (
    <g>
      <defs><clipPath id={`cup${cx}${y}`}><path d={`M${x0 + 8},${y + 8} L${x1 - 8},${y + 8} L${x1 - inset - 6},${y + h - 8} L${x0 + inset + 6},${y + h - 8} Z`} /></clipPath></defs>
      <path d={`M${x1 - 10},${y + h * 0.22} C${x1 + w * 0.32},${y + h * 0.18} ${x1 + w * 0.3},${y + h * 0.72} ${x1 - inset},${y + h * 0.7}`} fill="none" stroke={K.white} strokeWidth={w * 0.07} />
      <path d={`M${x0},${y} L${x1},${y} L${x1 - inset},${y + h} L${x0 + inset},${y + h} Z`} fill={K.white} />
      <g clipPath={`url(#cup${cx}${y})`}>
        <rect x={x0} y={lvl} width={w} height={h} fill={C.coffee} />
        {ch > 0.5 && <rect x={x0} y={lvl - 2} width={w} height={ch + 2} fill={C.crema} />}
        {bubbles > 0 && Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={lx0 + (lx1 - lx0) * rnd(i)} cy={lvl + ch * (0.3 + 0.5 * rnd(i + 9)) + Math.sin(t * 3 + i) * 2} r={3 + 5 * rnd(i + 20)} fill="#F6D9A8" opacity={bubbles * 0.9} />
        ))}
      </g>
      <rect x={x0 - 30} y={y + h} width={w + 60} height={14} rx={7} fill={C.case3} />
      {steam > 0 && [0, 1, 2].map((i) => {
        const p = (t * 0.6 + i / 3) % 1;
        const sx = cx + (i - 1) * w * 0.22;
        return <path key={i} d={`M${sx},${y - 20 - p * 120} q 18,-30 0,-60 q -18,-30 0,-60`} fill="none" stroke={K.white} strokeWidth={9} strokeLinecap="round" opacity={steam * 0.7 * Math.sin(Math.PI * p)} />;
      })}
    </g>
  );
};

/** Cápsula en corte (vertical, lado estrecho arriba). fill = agua dentro, bulge = la tapa empuja, tear = la tapa se rasga. */
export const CapsuleX: React.FC<{ cx: number; top: number; h: number; wTop: number; wBot: number; t: number; water?: number; bulge?: number; tear?: number; holes?: number; grounds?: number; cut?: boolean; plate?: boolean }> =
  ({ cx, top, h, wTop, wBot, t, water = 0, bulge = 0, tear = 0, holes = 0, grounds = 1, cut = true, plate = true }) => {
    const bot = top + h, fl = wBot * 0.58, wall = 12;
    const body = `M${cx - wTop / 2},${top} L${cx + wTop / 2},${top} L${cx + wBot / 2},${bot} L${cx - wBot / 2},${bot} Z`;
    const n = 7, pw = (wBot - 40) / n;               // pirámides de la placa
    const by = bot + 6 + bulge * 18;                 // la tapa se abomba hacia la placa
    const plateTop = bot + 26;
    const id = `cap${cx}${top}`;
    return (
      <g>
        <defs><clipPath id={id}><path d={`M${cx - wTop / 2 + wall},${top + wall} L${cx + wTop / 2 - wall},${top + wall} L${cx + wBot / 2 - wall},${bot} L${cx - wBot / 2 + wall},${bot} Z`} /></clipPath></defs>
        {/* cuerpo de aluminio */}
        <path d={body} fill={C.alu} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <rect x={cx - fl} y={bot - 10} width={fl * 2} height={16} rx={6} fill={C.alu} stroke={C.ink} strokeWidth={4} />
        {cut && (
          <g clipPath={`url(#${id})`}>
            <rect x={cx - wBot} y={top} width={wBot * 2} height={h + 10} fill="#3A2412" />
            {Array.from({ length: Math.round(110 * grounds) }).map((_, i) => (
              <circle key={i} cx={cx - wBot / 2 + wBot * rnd(i)} cy={top + 10 + h * rnd(i + 500)} r={4 + 5 * rnd(i + 900)} fill={i % 3 ? C.coffee : C.coffee2} />
            ))}
            {water > 0 && (
              <g opacity={0.75}>
                <rect x={cx - wBot} y={top} width={wBot * 2} height={h * clamp01(water)} fill={K.cold} opacity={0.38} />
                {Array.from({ length: 10 }).map((_, i) => {
                  const p = (t * 0.9 + i / 10) % 1;
                  const yy = top + 20 + p * h * clamp01(water);
                  return <path key={i} d={`M${cx - wTop / 2 + 20 + (wTop - 40) * rnd(i + 40)},${yy} l0,30`} stroke={K.white} strokeWidth={5} strokeLinecap="round" opacity={0.7} />;
                })}
              </g>
            )}
          </g>
        )}
        {/* tapa (lámina) */}
        <path d={`M${cx - wBot / 2},${bot} Q${cx},${by + bulge * 30} ${cx + wBot / 2},${bot}`} fill="none" stroke={tear > 0.5 ? K.flow : C.alu} strokeWidth={7} strokeDasharray={tear > 0.02 ? `${pw * (1 - 0.55 * tear)} ${pw * 0.55 * tear}` : undefined} strokeDashoffset={-pw * 0.2} />
        {/* placa con pirámides */}
        {plate && (
          <g>
            <rect x={cx - wBot / 2 - 30} y={plateTop + 18} width={wBot + 60} height={34} rx={8} fill={C.case2} stroke={C.ink} strokeWidth={4} />
            {Array.from({ length: n }).map((_, i) => {
              const x = cx - wBot / 2 + 20 + pw * i;
              return <path key={i} d={`M${x + 4},${plateTop + 20} L${x + pw * 0.3},${plateTop - 4} L${x + pw * 0.7},${plateTop - 4} L${x + pw - 4},${plateTop + 20} Z`} fill={C.case3} stroke={C.ink} strokeWidth={3} />;
            })}
          </g>
        )}
        {/* chorritos por los agujeros */}
        {holes > 0.01 && Array.from({ length: n - 1 }).map((_, i) => {
          const x = cx - wBot / 2 + 20 + pw * (i + 1);
          return <Drips key={i} x={x} y0={plateTop + 56} y1={plateTop + 150} t={t + i * 0.13} o={holes} n={3} r={6} />;
        })}
      </g>
    );
  };

/** Puntas que pinchan el lado estrecho. p 0 = arriba, 1 = clavadas. */
export const Blades: React.FC<{ cx: number; y: number; p: number; w?: number }> = ({ cx, y, p, w = 140 }) => (
  <g transform={`translate(0 ${-70 * (1 - p)})`}>
    <rect x={cx - w / 2 - 30} y={y - 70} width={w + 60} height={40} rx={10} fill={C.case2} stroke={C.ink} strokeWidth={4} />
    {[-1, 0, 1].map((k) => (
      <path key={k} d={`M${cx + k * w * 0.38 - 14},${y - 32} L${cx + k * w * 0.38 + 14},${y - 32} L${cx + k * w * 0.38},${y + 30} Z`} fill={K.white} stroke={C.ink} strokeWidth={3} />
    ))}
  </g>
);

/** Depósito con nivel de agua y ondas. */
export const Tank: React.FC<{ x: number; y: number; w: number; h: number; t: number; level?: number }> = ({ x, y, w, h, t, level = 0.75 }) => {
  const ly = y + h * (1 - level);
  const wave = Array.from({ length: 9 }).map((_, i) => `${x + (w * i) / 8},${ly + 6 * Math.sin(t * 3 + i)}`).join(" L");
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={18} fill="rgba(53,196,240,0.10)" stroke={C.case3} strokeWidth={6} />
      <path d={`M${wave} L${x + w},${y + h - 18} Q${x + w},${y + h} ${x + w - 18},${y + h} L${x + 18},${y + h} Q${x},${y + h} ${x},${y + h - 18} Z`} fill={K.cold} opacity={0.75} />
    </g>
  );
};

/** Bomba vibratoria: cilindro con bobina que tiembla. */
export const Pump: React.FC<{ x: number; y: number; w: number; h: number; t: number; on: number; glow?: number }> = ({ x, y, w, h, t, on, glow = 0 }) => {
  const j = on * 3 * Math.sin(t * 90);
  return (
    <g transform={`translate(${j} 0)`}>
      {glow > 0 && <rect x={x - 12} y={y - 12} width={w + 24} height={h + 24} rx={24} fill="none" stroke={K.flow} strokeWidth={6} opacity={glow} />}
      <rect x={x} y={y} width={w} height={h} rx={16} fill={C.case2} stroke={C.ink} strokeWidth={5} />
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={x + w * 0.2 + (w * 0.6 * i) / 7} y={y + 8} width={w * 0.05} height={h - 16} rx={3} fill={K.hot} opacity={0.85} />
      ))}
      <rect x={x - 22} y={y + h * 0.3} width={24} height={h * 0.4} rx={5} fill={C.case3} stroke={C.ink} strokeWidth={3} />
      <rect x={x + w - 2} y={y + h * 0.3} width={24} height={h * 0.4} rx={5} fill={C.case3} stroke={C.ink} strokeWidth={3} />
      {on > 0 && [0, 1].map((k) => (
        <path key={k} d={`M${x + w / 2 - 50 + k * 100},${y - 18} l-10,-16 l10,-16`} fill="none" stroke={K.flow} strokeWidth={5} strokeLinecap="round" opacity={on * (0.5 + 0.5 * Math.sin(t * 20 + k))} />
      ))}
    </g>
  );
};

/** Calentador rápido (bloque con canal en zigzag). heat 0-1: el agua pasa de cian a naranja. cal 0-1: depósitos de cal. */
export const Thermo: React.FC<{ x: number; y: number; w: number; h: number; t: number; heat: number; flow?: number; cal?: number }> = ({ x, y, w, h, t, heat, flow = 1, cal = 0 }) => {
  const rows = 5, pad = w * 0.16;
  const pts: string[] = [];
  for (let i = 0; i < rows; i++) {
    const yy = y + h - pad - ((h - 2 * pad) * i) / (rows - 1);
    pts.push(i % 2 ? `${x + w - pad},${yy} L${x + pad},${yy}` : `${x + pad},${yy} L${x + w - pad},${yy}`);
  }
  const d = `M${x + pad},${y + h + 40} L${pts.join(" L")} L${x + (rows % 2 ? w - pad : pad)},${y - 40}`;
  const glow = 0.25 + 0.2 * Math.sin(t * 4);
  return (
    <g>
      <defs>
        <linearGradient id={`th${x}${y}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={K.cold} /><stop offset={clamp01(0.75 - 0.6 * heat)} stopColor={K.cold} />
          <stop offset={clamp01(0.85 - 0.5 * heat)} stopColor={K.hot} /><stop offset="1" stopColor={K.hot} />
        </linearGradient>
      </defs>
      <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} rx={26} fill={K.hot} opacity={heat * glow} />
      <rect x={x} y={y} width={w} height={h} rx={20} fill="#4A5D78" stroke={C.ink} strokeWidth={5} />
      {/* resistencia */}
      <path d={`M${x + 18},${y + 18} L${x + w - 18},${y + 18} L${x + w - 18},${y + h - 18} L${x + 18},${y + h - 18} Z`} fill="none" stroke={K.hot} strokeWidth={6} strokeDasharray="4 10" opacity={0.5 + 0.5 * heat} />
      <path d={d} fill="none" stroke={C.ink} strokeWidth={w * 0.13 + 8} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={`url(#th${x}${y})`} strokeWidth={w * 0.13 * (1 - 0.55 * cal)} strokeLinejoin="round" strokeDasharray="30 18" strokeDashoffset={-t * 150 * flow} />
      {cal > 0 && <path d={d} fill="none" stroke={C.cal} strokeWidth={w * 0.13} strokeLinejoin="round" strokeDasharray="10 26" opacity={cal} />}
    </g>
  );
};

/** Termómetro vertical. v 0-1. */
export const Thermometer: React.FC<{ x: number; y: number; h: number; v: number; color?: string }> = ({ x, y, h, v, color = K.hot }) => (
  <g>
    <rect x={x - 16} y={y} width={32} height={h} rx={16} fill="rgba(255,255,255,0.15)" stroke={K.white} strokeWidth={4} />
    <rect x={x - 8} y={y + h - (h - 16) * clamp01(v)} width={16} height={(h - 16) * clamp01(v) + 8} rx={8} fill={color} />
    <circle cx={x} cy={y + h + 22} r={30} fill={color} stroke={K.white} strokeWidth={4} />
  </g>
);

/** Cafetera completa en corte. open 0-1 = la carcasa se separa. flow 0-1 = el agua circula. */
export const Machine: React.FC<{ t: number; open: number; flow?: number; heat?: number; brew?: number; cupFill?: number; crema?: number; lever?: number; hi?: string; capsule?: boolean; s?: number; ox?: number; oy?: number; steam?: number }> =
  ({ t, open, flow = 0, heat = 0, brew = 0, cupFill = 0, crema = 0, lever = 1, hi = "", capsule = true, s = 1, ox = 0, oy = 0, steam = 0 }) => {
    const hl = (k: string) => (hi === k ? 1 : 0);
    const dim = (k: string) => (hi && hi !== k ? 0.45 : 1);
    return (
      <g transform={`translate(${ox} ${oy}) translate(540 770) scale(${s}) translate(-540 -770)`}>
        {/* base y bandeja */}
        <rect x={210} y={1040} width={660} height={44} rx={16} fill={C.case1} stroke={C.ink} strokeWidth={5} />
        <rect x={600} y={1020} width={230} height={24} rx={8} fill={C.case3} stroke={C.ink} strokeWidth={4} />
        {/* interior */}
        <rect x={232} y={452} width={616} height={588} rx={36} fill="#13294A" stroke={C.case2} strokeWidth={4} />
        <g opacity={dim("tank")}><Tank x={258} y={490} w={130} h={440} t={t} /></g>
        {/* tubos */}
        <Flow d="M323,930 L323,985 L398,985" t={t} o={0.25 + 0.75 * flow} />
        <Flow d="M456,950 L456,830" t={t} o={0.25 + 0.75 * flow} />
        <Flow d="M564,520 L564,500 L700,500 L700,520" t={t} o={(0.25 + 0.75 * flow) * (capsule ? 1 : 1)} color={heat > 0.5 ? K.hot : K.cold} />
        <g opacity={dim("pump")}><Pump x={420} y={950} w={90} h={70} t={t} on={flow} glow={hl("pump")} /></g>
        <g opacity={dim("thermo")}><Thermo x={430} y={560} w={160} h={230} t={t} heat={heat} flow={flow} /></g>
        {/* grupo de café */}
        <g opacity={dim("head")}>
          <rect x={610} y={520} width={180} height={34} rx={8} fill={C.case2} stroke={C.ink} strokeWidth={4} />
          {capsule && <CapsuleX cx={700} top={556} h={150} wTop={70} wBot={150} t={t} water={brew} tear={brew > 0.6 ? 1 : 0} holes={brew > 0.6 ? 1 : 0} plate={true} grounds={0.5} />}
          {!capsule && <Drips x={700} y0={560} y1={900} t={t} o={flow} color={K.cold} n={6} r={8} />}
        </g>
        <g opacity={dim("cup")}><Cup cx={715} y={880} w={140} fill={cupFill} crema={crema} t={t} steam={steam} /></g>
        {/* palanca */}
        <g transform={`rotate(${-28 * (1 - lever)} 640 470)`}>
          <rect x={600} y={440} width={240} height={34} rx={17} fill={C.case3} stroke={C.ink} strokeWidth={5} />
        </g>
        {/* carcasa que se abre por la mitad */}
        {open < 0.999 && (
          <g opacity={1 - 0.15 * open}>
            <g transform={`translate(${-330 * open} 0)`} opacity={1 - open}>
              <path d="M232,488 Q232,452 268,452 L540,452 L540,1040 L232,1040 Z" fill={C.case1} stroke={C.ink} strokeWidth={5} />
              <rect x={280} y={520} width={60} height={380} rx={20} fill={C.case2} opacity={0.6} />
            </g>
            <g transform={`translate(${330 * open} 0)`} opacity={1 - open}>
              <path d="M540,452 L812,452 Q848,452 848,488 L848,1040 L540,1040 Z" fill={C.case1} stroke={C.ink} strokeWidth={5} />
              <rect x={640} y={720} width={160} height={30} rx={10} fill={C.case2} />
              <circle cx={780} cy={500} r={14} fill={K.flow} />
            </g>
          </g>
        )}
      </g>
    );
  };

/** Documento de patente. */
export const Patent: React.FC<{ x: number; y: number; w: number; h: number; t: number }> = ({ x, y, w, h, t }) => (
  <g transform={`rotate(${-3 + Math.sin(t * 1.2) * 1.2} ${x + w / 2} ${y + h / 2})`}>
    <rect x={x + 14} y={y + 14} width={w} height={h} rx={14} fill="rgba(0,0,0,0.35)" />
    <rect x={x} y={y} width={w} height={h} rx={14} fill="#F4EBD6" stroke={C.ink} strokeWidth={5} />
    {Array.from({ length: 9 }).map((_, i) => (
      <rect key={i} x={x + 40} y={y + 260 + i * 34} width={(w - 80) * (0.6 + 0.4 * rnd(i + 70))} height={12} rx={6} fill="#B9AE96" />
    ))}
    <g transform={`translate(${x + w / 2} ${y + 150}) scale(0.62) translate(-540 -640)`}>
      <CapsuleX cx={540} top={560} h={150} wTop={70} wBot={150} t={t} cut={false} plate={false} />
    </g>
  </g>
);
