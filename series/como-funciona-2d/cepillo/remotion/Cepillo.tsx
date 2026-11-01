// Dibujos SVG del episodio «Cómo funciona un cepillo de dientes eléctrico». Coordenadas absolutas de 1080×1920.
// Colores de código: naranja = energía/bobinas, cian = agua, amarillo = lo importante/corriente/campo, blanco = texto, rojo = peligro.
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F", inner: "#0B1A30", head: "#E8EEF5", bristle: "#BFE9FA",
  copper: "#E0893A", iron: "#6B7C93", board: "#1E5A46", gum: "#C85A6A", tooth: "#F4F1EA", old: "#D9C9A8" };

export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Línea de flujo animada (trazo discontinuo que avanza). */
export const Flow: React.FC<{ d: string; t: number; color?: string; w?: number; o?: number; speed?: number }> = ({ d, t, color = K.flow, w = 10, o = 1, speed = 160 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    <path d={d} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={w + 8} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="22 18" strokeDashoffset={-t * speed} />
  </g>
);

/** Columna de espiras en corte (circulitos de hilo). */
const Windings: React.FC<{ x: number; y: number; cols: number; rows: number; r: number; glow: number }> = ({ x, y, cols, rows, r, glow }) => (
  <g>
    {Array.from({ length: cols * rows }).map((_, i) => {
      const cx = x + (i % cols) * r * 2.1, cy = y + Math.floor(i / cols) * r * 2.1;
      return <circle key={i} cx={cx} cy={cy} r={r} fill={C.copper} stroke={C.ink} strokeWidth={2} style={glow > 0.05 ? { filter: `drop-shadow(0 0 ${6 * glow}px ${K.hot})` } : undefined} />;
    })}
  </g>
);

/** Líneas de campo magnético entre la bobina de la base y la del mango (en coordenadas locales del cepillo). */
const FieldLocal: React.FC<{ t: number; o: number; flip?: number }> = ({ t, o, flip = 1 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    {[0, 1, 2].map((k) => (
      <g key={k}>
        <ellipse cx={0} cy={780} rx={95 + k * 45} ry={70 + k * 28} fill="none" stroke={K.flow} strokeWidth={6} strokeDasharray="18 16" strokeDashoffset={flip * -t * (90 + k * 20)} opacity={0.95 - k * 0.22} />
      </g>
    ))}
  </g>
);

/**
 * Cepillo completo sobre su base. Altura local 0-880, centrado en x=0.
 * open: la tapa del mango se levanta y se ve el interior; field: campo magnético; charge: nivel de la pila;
 * current: corriente por los cables; motor: el motor gira; hi: resalta "coil" | "bat" | "motor" | "board"; vib: vibración del cabezal.
 */
export const Brush: React.FC<{ cx: number; y: number; s?: number; t: number; open?: number; field?: number; charge?: number; current?: number; motor?: number;
  hi?: string; vib?: number; baseOpen?: number; drops?: number; flip?: number; id?: string; coverDx?: number }> =
  ({ cx, y, s = 1, t, open = 0, field = 0, charge = 0.5, current = 0, motor = 0, hi = "", vib = 0, baseOpen, drops = 0, flip = 1, id = "b", coverDx = -330 }) => {
    const bo = baseOpen ?? open;
    const handle = "M-75,250 Q-75,235 -60,235 L60,235 Q75,235 75,250 C95,420 95,560 88,740 Q86,772 60,772 L-60,772 Q-86,772 -88,740 C-95,560 -95,420 -75,250 Z";
    const hiG = (k: string) => (hi === k ? { filter: `drop-shadow(0 0 14px ${K.flow})` } : undefined);
    const hx = vib * 7 * Math.sin(t * 2 * Math.PI * 9);
    const spin = motor * t * 8;
    return (
      <g transform={`translate(${cx},${y}) scale(${s})`}>
        {/* cable de la base */}
        <path d="M-215,860 C-300,860 -330,900 -420,900" fill="none" stroke={C.case1} strokeWidth={14} strokeLinecap="round" />
        {/* cuello y cabezal */}
        <g transform={`translate(${hx},0)`}>
          <path d="M-24,96 L-32,250 L32,250 L24,96 Z" fill={C.head} stroke={C.ink} strokeWidth={4} />
          <rect x={-38} y={0} width={76} height={112} rx={30} fill={C.head} stroke={C.ink} strokeWidth={4} />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={36} y={10 + i * 15} width={38} height={10} rx={4} fill={C.bristle} stroke={C.ink} strokeWidth={2} />
          ))}
        </g>
        {/* interior del mango */}
        <path d={handle} fill={C.inner} stroke={C.case1} strokeWidth={6} />
        <rect x={-6} y={110} width={12} height={160} fill={C.case3} />
        <g style={hiG("motor")}>
          <rect x={-50} y={262} width={100} height={120} rx={16} fill={C.case3} stroke={C.ink} strokeWidth={4} />
          <defs><clipPath id={`mot${id}`}><rect x={-44} y={270} width={88} height={104} rx={12} /></clipPath></defs>
          <g clipPath={`url(#mot${id})`}>
            {[0, 1, 2, 3, 4].map((k) => {
              const xx = -44 + ((k * 22 + spin * 22) % 110);
              return <rect key={k} x={xx} y={270} width={9} height={104} fill={C.case2} opacity={0.8} />;
            })}
          </g>
        </g>
        <g style={hiG("board")}>
          <rect x={-56} y={396} width={112} height={58} rx={8} fill={C.board} stroke={C.ink} strokeWidth={3} />
          <rect x={-20} y={410} width={40} height={30} rx={4} fill={K.ink} stroke={K.flow} strokeWidth={3} />
        </g>
        <g style={hiG("bat")}>
          <rect x={-20} y={466} width={40} height={14} rx={4} fill={C.case3} />
          <rect x={-46} y={478} width={92} height={176} rx={16} fill={K.ink} stroke={K.white} strokeWidth={5} />
          <rect x={-38} y={486 + 160 * (1 - clamp01(charge))} width={76} height={160 * clamp01(charge)} rx={10} fill={K.flow} />
          <path d="M6,520 L-12,566 L4,566 L-6,606 L16,556 L0,556 Z" fill={K.ink} opacity={0.6} />
        </g>
        {/* cables bobina → placa */}
        <path d="M-62,690 L-70,425 L-56,425" fill="none" stroke={K.flow} strokeWidth={5} opacity={0.5 + 0.5 * current} />
        <path d="M62,690 L70,425 L56,425" fill="none" stroke={K.flow} strokeWidth={5} opacity={0.5 + 0.5 * current} />
        {current > 0.02 && <path d="M-62,690 L-70,425 M62,690 L70,425" fill="none" stroke={K.white} strokeWidth={5} strokeDasharray="10 26" strokeDashoffset={-t * 120} opacity={current} />}
        {/* bobina del mango (alrededor del hueco del núcleo) */}
        <g style={hiG("coil")}>
          <Windings x={-66} y={688} cols={3} rows={3} r={8} glow={field} />
          <Windings x={32} y={688} cols={3} rows={3} r={8} glow={field} />
        </g>
        <rect x={-16} y={700} width={32} height={100} rx={8} fill={C.iron} stroke={C.ink} strokeWidth={3} />
        {/* tapa del mango: se levanta hacia la izquierda */}
        {open < 0.995 && (
          <g transform={`translate(${coverDx * open},${-40 * open}) rotate(${-14 * open})`} opacity={1 - 0.35 * open}>
            <path d={handle} fill={C.case2} stroke={C.ink} strokeWidth={5} />
            <path d="M-52,270 C-66,420 -66,560 -60,720" fill="none" stroke={K.white} strokeOpacity={0.25} strokeWidth={14} strokeLinecap="round" />
            <circle cx={0} cy={350} r={26} fill={C.case1} stroke={C.ink} strokeWidth={4} />
            <circle cx={0} cy={350} r={10} fill={C.case3} />
            <rect x={-30} y={420} width={60} height={10} rx={5} fill={charge > 0.95 ? K.flow : C.case1} />
          </g>
        )}
        {/* base */}
        <path d="M-170,782 L170,782 L222,872 Q226,884 212,884 L-212,884 Q-226,884 -222,872 Z" fill={C.inner} stroke={C.case1} strokeWidth={6} />
        <rect x={-16} y={782} width={32} height={90} fill={C.iron} />
        <g style={hiG("base")}>
          <Windings x={-78} y={798} cols={3} rows={4} r={8} glow={field} />
          <Windings x={44} y={798} cols={3} rows={4} r={8} glow={field} />
        </g>
        <g opacity={1 - 0.8 * bo}>
          <path d="M-170,782 L170,782 L222,872 Q226,884 212,884 L-212,884 Q-226,884 -222,872 Z" fill={C.case1} stroke={C.ink} strokeWidth={5} />
          <rect x={-150} y={782} width={300} height={14} rx={6} fill={C.case2} />
        </g>
        <circle cx={150} cy={845} r={10} fill={field > 0.3 ? K.flow : "#33435c"} style={field > 0.3 ? { filter: `drop-shadow(0 0 8px ${K.flow})` } : undefined} />
        <FieldLocal t={t} o={field} flip={flip} />
        {/* gotas de agua sobre el mango */}
        {drops > 0.01 && Array.from({ length: 7 }).map((_, i) => {
          const p = (t * 0.9 + i / 7) % 1;
          const xx = -70 + 140 * rnd(i + 2);
          const yy = 140 + p * 560;
          return <path key={i} d={`M${xx},${yy - 22} C${xx + 12},${yy - 4} ${xx + 12},${yy + 10} ${xx},${yy + 10} C${xx - 12},${yy + 10} ${xx - 12},${yy - 4} ${xx},${yy - 22} Z`} fill={K.cold} opacity={drops * Math.sin(Math.PI * p)} />;
        })}
      </g>
    );
  };

/** Iconos de la idea clave. */
export const CoilIcon: React.FC<{ x: number; y: number; t: number; o: number }> = ({ x, y, t, o }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    {[0, 1, 2].map((k) => <ellipse key={k} cx={0} cy={0} rx={60 + k * 26} ry={40 + k * 18} fill="none" stroke={K.flow} strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={-t * 80} opacity={0.9 - k * 0.25} />)}
    <Windings x={-46} y={-8} cols={6} rows={1} r={8} glow={1} />
  </g>
);
export const BatIcon: React.FC<{ x: number; y: number; lvl: number; o: number }> = ({ x, y, lvl, o }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-22} y={-104} width={44} height={16} rx={4} fill={C.case3} />
    <rect x={-56} y={-90} width={112} height={180} rx={18} fill={K.ink} stroke={K.white} strokeWidth={6} />
    <rect x={-46} y={-80 + 160 * (1 - lvl)} width={92} height={160 * lvl} rx={10} fill={K.flow} />
  </g>
);
export const Gear: React.FC<{ x: number; y: number; r: number; a: number; teeth?: number; color?: string }> = ({ x, y, r, a, teeth = 10, color = C.case3 }) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const ang = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 ? r : r * 1.2;
    const d = Math.PI / (teeth * 2) * 0.6;
    pts.push(`${Math.cos(ang - d) * rr},${Math.sin(ang - d) * rr}`, `${Math.cos(ang + d) * rr},${Math.sin(ang + d) * rr}`);
  }
  return (
    <g transform={`translate(${x},${y}) rotate(${a})`}>
      <polygon points={pts.join(" ")} fill={color} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      <circle r={r * 0.32} fill={C.case1} stroke={C.ink} strokeWidth={4} />
    </g>
  );
};

/** Corriente alterna → circuito → continua → pila. */
export const Charger: React.FC<{ t: number; ac: number; dc: number; lvl: number }> = ({ t, ac, dc, lvl }) => {
  const wave = Array.from({ length: 41 }).map((_, i) => `${i ? "L" : "M"}${150 + i * 6.5},${700 + 46 * Math.sin(i * 0.55 - t * 9)}`).join(" ");
  return (
    <g>
      <g transform="translate(150,700)">
        <Windings x={-60} y={-60} cols={2} rows={6} r={10} glow={ac} />
      </g>
      <path d={wave} fill="none" stroke={K.flow} strokeWidth={8} strokeLinecap="round" opacity={0.3 + 0.7 * ac} />
      <rect x={430} y={630} width={170} height={140} rx={16} fill={C.board} stroke={C.ink} strokeWidth={5} />
      <rect x={485} y={670} width={60} height={60} rx={6} fill={K.ink} stroke={K.flow} strokeWidth={4} />
      <Flow d="M610,700 L740,700" t={t} o={0.3 + 0.7 * dc} />
      <BatIcon x={850} y={700} lvl={lvl} o={1} />
    </g>
  );
};

/** Cabezal redondo de frente (oscilante-rotatorio) con su mecanismo de engranajes debajo. */
export const RoundHead: React.FC<{ t: number; on: number; gears: number }> = ({ t, on, gears }) => {
  const a = on * 24 * Math.sin(t * 2 * Math.PI * 2.2);
  const g = gears * t * 160;
  const tufts = [] as { x: number; y: number }[];
  [0, 1, 2].forEach((ring) => { const n = ring === 0 ? 1 : ring * 8; for (let i = 0; i < n; i++) { const an = (i / n) * Math.PI * 2; tufts.push({ x: Math.cos(an) * ring * 62, y: Math.sin(an) * ring * 62 }); } });
  return (
    <g>
      {/* mango y cuello */}
      <path d="M500,760 L480,1130 L600,1130 L580,760 Z" fill={C.case2} stroke={C.ink} strokeWidth={5} opacity={0.35} />
      <rect x={515} y={720} width={50} height={80} fill={C.head} stroke={C.ink} strokeWidth={4} />
      <g transform={`rotate(${a} 540 590)`}>
        <circle cx={540} cy={590} r={175} fill={C.head} stroke={C.ink} strokeWidth={6} />
        {tufts.map((p, i) => <circle key={i} cx={540 + p.x} cy={590 + p.y} r={22} fill={i % 5 === 0 ? K.cold : C.bristle} stroke={C.ink} strokeWidth={3} />)}
        <path d="M540,430 L540,470" stroke={K.flow} strokeWidth={10} strokeLinecap="round" />
      </g>
      <path d={`M${400},${420} A 190 190 0 0 0 ${360},${560}`} fill="none" stroke={K.flow} strokeWidth={8} strokeLinecap="round" opacity={on} />
      <path d={`M${680},${420} A 190 190 0 0 1 ${720},${560}`} fill="none" stroke={K.flow} strokeWidth={8} strokeLinecap="round" opacity={on} />
      <path d="M352,540 l8,26 l20,-18 M728,540 l-8,26 l-20,-18" fill="none" stroke={K.flow} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={on} />
      <g opacity={0.35 + 0.65 * gears}>
        <Gear x={430} y={960} r={70} a={g} teeth={11} />
        <Gear x={585} y={960} r={52} a={-g * 1.35 + 9} teeth={8} color={K.flow} />
        <line x1={585} y1={960} x2={540 + 30 * Math.sin(g * Math.PI / 180)} y2={810} stroke={C.case3} strokeWidth={14} strokeLinecap="round" />
      </g>
    </g>
  );
};

/** Cabezal alargado sónico que vibra, con el electroimán y los imanes debajo. */
export const SonicHead: React.FC<{ t: number; on: number; mag: number }> = ({ t, on, mag }) => {
  const sw = Math.sin(t * 2 * Math.PI * 11);
  const dx = on * 12 * sw;
  return (
    <g>
      <g transform={`translate(${dx},0)`}>
        <path d="M520,690 L512,850 L568,850 L560,690 Z" fill={C.head} stroke={C.ink} strokeWidth={4} />
        <rect x={490} y={420} width={100} height={280} rx={46} fill={C.head} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={i % 2 ? 548 : 500} y={440 + Math.floor(i / 2) * 42} width={34} height={30} rx={8} fill={C.bristle} stroke={C.ink} strokeWidth={2.5} />
        ))}
      </g>
      {on > 0.05 && [-1, 1].map((sg) => [0, 1].map((k) => (
        <path key={`${sg}${k}`} d={`M${540 + sg * (80 + k * 26)},${480} q${sg * 14},${70} 0,${140}`} fill="none" stroke={K.flow} strokeWidth={6} strokeLinecap="round" opacity={on * (0.9 - 0.4 * k) * (0.6 + 0.4 * Math.abs(sw))} />
      )))}
      {/* electroimán en E con su bobina, y los imanes que se balancean */}
      <g opacity={0.35 + 0.65 * mag}>
        <path d="M380,900 L700,900 L700,930 L660,930 L660,1060 L620,1060 L620,930 L560,930 L560,1060 L520,1060 L520,930 L460,930 L460,1060 L420,1060 L420,930 L380,930 Z" fill={C.iron} stroke={C.ink} strokeWidth={4} />
        <Windings x={466} y={950} cols={2} rows={5} r={7} glow={mag * 0.8} />
        <Windings x={566} y={950} cols={2} rows={5} r={7} glow={mag * 0.8} />
        <g transform={`rotate(${mag * 10 * sw} 540 1100)`}>
          <rect x={430} y={1080} width={100} height={44} rx={6} fill={K.warn} stroke={C.ink} strokeWidth={4} />
          <rect x={550} y={1080} width={100} height={44} rx={6} fill={K.cold} stroke={C.ink} strokeWidth={4} />
          <rect x={534} y={850} width={12} height={230} fill={C.case3} />
        </g>
      </g>
    </g>
  );
};

/** Arcada dental vista desde arriba dividida en 4 zonas; `q` = zona activa (0-3), `done` = zonas terminadas. */
export const Mouth: React.FC<{ cx: number; cy: number; q: number; done: number; t: number }> = ({ cx, cy, q, done, t }) => {
  const teeth = 14;
  const arch = (upper: boolean) => Array.from({ length: teeth }).map((_, i) => {
    const a = Math.PI * (0.08 + 0.84 * (i / (teeth - 1)));
    const x = cx - Math.cos(a) * 250;
    const y = upper ? cy - 10 - Math.sin(a) * 200 : cy + 10 + Math.sin(a) * 200;
    const quad = upper ? (i < teeth / 2 ? 0 : 1) : (i < teeth / 2 ? 3 : 2);
    const act = quad === q;
    const fin = quad < done;
    return <rect key={`${upper}${i}`} x={x - 22} y={y - 22} width={44} height={44} rx={14} fill={act ? K.flow : fin ? K.cold : C.tooth} stroke={C.ink} strokeWidth={4}
      transform={act ? `translate(0,${2 * Math.sin(t * 20 + i)})` : undefined} style={act ? { filter: `drop-shadow(0 0 10px ${K.flow})` } : undefined} />;
  });
  return (
    <g>
      <line x1={cx - 280} y1={cy} x2={cx + 280} y2={cy} stroke={K.white} strokeOpacity={0.35} strokeWidth={4} strokeDasharray="14 12" />
      <line x1={cx} y1={cy - 230} x2={cx} y2={cy + 230} stroke={K.white} strokeOpacity={0.35} strokeWidth={4} strokeDasharray="14 12" />
      {arch(true)}{arch(false)}
    </g>
  );
};

/** Barra de 4 tramos de 30 s. */
export const QuadBar: React.FC<{ x: number; y: number; w: number; p: number }> = ({ x, y, w, p }) => (
  <g>
    {[0, 1, 2, 3].map((k) => {
      const f = clamp01(p * 4 - k);
      const sw = (w - 30) / 4;
      return (
        <g key={k}>
          <rect x={x + k * (sw + 10)} y={y} width={sw} height={34} rx={10} fill="rgba(255,255,255,0.12)" />
          <rect x={x + k * (sw + 10)} y={y} width={sw * f} height={34} rx={10} fill={f >= 1 ? K.cold : K.flow} />
        </g>
      );
    })}
  </g>
);

/** Cepillo de 1954 con cable hasta un enchufe de pared. */
export const OldBrush: React.FC<{ t: number; plug: number }> = ({ t, plug }) => {
  const coil = Array.from({ length: 60 }).map((_, i) => {
    const u = i / 59;
    const x = 540 + u * 300 + 18 * Math.cos(u * 40);
    const y = 1000 - u * 330 + 18 * Math.sin(u * 40) + 6 * Math.sin(t * 2 + u * 6);
    return `${i ? "L" : "M"}${x},${y}`;
  }).join(" ");
  return (
    <g>
      {/* enchufe de pared */}
      <rect x={800} y={560} width={150} height={190} rx={18} fill={C.tooth} stroke={C.ink} strokeWidth={5} />
      <circle cx={850} cy={655} r={11} fill={C.ink} /><circle cx={900} cy={655} r={11} fill={C.ink} />
      <path d={coil} fill="none" stroke={C.case1} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={828} y={640 - 30 * (1 - plug)} width={44} height={40} rx={8} fill={C.case1} stroke={C.ink} strokeWidth={4} transform={`translate(${-6 * (1 - plug)},0)`} />
      {/* cuerpo */}
      <g transform="rotate(-18 400 760)">
        <rect x={340} y={600} width={130} height={420} rx={50} fill={C.old} stroke={C.ink} strokeWidth={6} />
        <rect x={360} y={660} width={90} height={22} rx={8} fill="#B79F74" />
        <path d="M385,600 L380,420 L430,420 L425,600 Z" fill={C.head} stroke={C.ink} strokeWidth={5} />
        <rect x={372} y={340} width={66} height={100} rx={22} fill={C.head} stroke={C.ink} strokeWidth={5} />
        {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={436} y={348 + i * 18} width={34} height={11} rx={4} fill={C.bristle} stroke={C.ink} strokeWidth={2} />)}
      </g>
      <path d="M470,980 C500,1000 520,1000 540,1000" fill="none" stroke={C.case1} strokeWidth={12} strokeLinecap="round" />
    </g>
  );
};

/** Diente con encía y cabezal que aprieta; press 0-1, alarm 0-1 (sensor en rojo). */
export const Pressure: React.FC<{ t: number; press: number; alarm: number }> = ({ t, press, alarm }) => {
  const dx = -60 * press + 3 * Math.sin(t * 50) * (1 - alarm * 0.5);
  return (
    <g>
      {/* encía y diente */}
      <path d="M140,860 L430,860 L430,1120 L140,1120 Z" fill={C.gum} opacity={0.9} style={press > 0.6 ? { filter: `drop-shadow(0 0 ${16 * press}px ${K.warn})` } : undefined} />
      <path d="M170,480 C170,420 400,420 400,480 L410,860 C390,900 360,900 330,880 L285,800 L240,880 C210,900 180,900 160,860 Z" fill={C.tooth} stroke={C.ink} strokeWidth={6} />
      <path d="M210,520 C230,500 280,500 300,520" fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
      {press > 0.6 && <path d="M400,620 l-30,40 l24,10 l-30,44" fill="none" stroke={K.warn} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={ramp01(press)} />}
      {/* cepillo tumbado apretando */}
      <g transform={`translate(${dx},0)`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={470 - 16 * press * (i % 2)} y={560 + i * 40} width={60 + 16 * press * (i % 2)} height={26} rx={8} fill={C.bristle} stroke={C.ink} strokeWidth={3}
            transform={press > 0.5 ? `rotate(${(i - 2.5) * 6 * press} 530 ${573 + i * 40})` : undefined} />
        ))}
        <rect x={525} y={540} width={110} height={270} rx={44} fill={C.head} stroke={C.ink} strokeWidth={5} />
        <path d="M630,640 L780,650 L780,700 L630,710 Z" fill={C.head} stroke={C.ink} strokeWidth={5} />
        <rect x={770} y={600} width={190} height={150} rx={60} fill={C.case2} stroke={C.ink} strokeWidth={5} />
        <circle cx={850} cy={675} r={26} fill={alarm > 0.5 ? K.warn : "#33435c"} stroke={C.ink} strokeWidth={4} style={alarm > 0.5 ? { filter: `drop-shadow(0 0 ${22 * alarm}px ${K.warn})` } : undefined} />
      </g>
      {/* flecha de empuje */}
      <path d={`M${960 - 30 * press},${830} L${790 - 30 * press},${830}`} stroke={K.white} strokeWidth={14} strokeLinecap="round" opacity={0.3 + 0.7 * press} />
      <path d={`M${820 - 30 * press},${800} L${780 - 30 * press},${830} L${820 - 30 * press},${860}`} fill="none" stroke={K.white} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={0.3 + 0.7 * press} />
    </g>
  );
};
const ramp01 = (x: number) => clamp01((x - 0.6) / 0.4);

/** Cabezal de perfil: worn 0 = nuevo, 1 = cerdas abiertas. */
export const HeadSide: React.FC<{ x: number; y: number; worn: number; o?: number }> = ({ x, y, worn, o = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <path d="M-24,240 L-30,470 L30,470 L24,240 Z" fill={C.head} stroke={C.ink} strokeWidth={5} />
    <rect x={-45} y={0} width={90} height={250} rx={40} fill={C.head} stroke={C.ink} strokeWidth={5} />
    {Array.from({ length: 7 }).map((_, i) => {
      const yy = 20 + i * 32;
      const ang = worn * (i - 3) * 9 + worn * 12 * (i % 2 ? 1 : -1);
      return <rect key={i} x={40} y={yy} width={70} height={20} rx={6} fill={worn > 0.5 ? "#D7D2C2" : C.bristle} stroke={C.ink} strokeWidth={3} transform={`rotate(${ang} 42 ${yy + 10})`} />;
    })}
  </g>
);

/** Calendario con «3 MESES». */
export const Calendar: React.FC<{ x: number; y: number; p: number }> = ({ x, y, p }) => (
  <g transform={`translate(${x},${y}) scale(${0.8 + 0.2 * p})`} opacity={0.35 + 0.65 * p}>
    <rect x={-110} y={-100} width={220} height={210} rx={18} fill={K.white} stroke={C.ink} strokeWidth={5} />
    <rect x={-110} y={-100} width={220} height={56} rx={18} fill={K.warn} />
    <rect x={-110} y={-62} width={220} height={18} fill={K.warn} />
    {[-60, 0, 60].map((k) => <rect key={k} x={k - 8} y={-118} width={16} height={36} rx={6} fill={C.case1} />)}
  </g>
);
