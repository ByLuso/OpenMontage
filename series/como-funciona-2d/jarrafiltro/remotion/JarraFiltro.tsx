// Dibujos SVG planos del episodio «Cómo funciona una jarra con filtro de agua».
// Colores de código: cian = agua, amarillo = lo importante (cloro, iones que entran), blanco = cal (calcio/magnesio), rojo = bacterias/peligro.
import React from "react";
import { K, FONT } from "./kit2d/Kit";

export const C = { shell: "#2B4A72", shell2: "#3E6AA0", light: "#9FB3CC", dark: "#132A4A", ink: "#06101F", carbon: "#24252B", carbon2: "#4A4C55", resin: "#E8D9A8", green: "#2F7D5B" };
const W = 1080, H = 1920;
const sm = (x: number) => { const k = Math.max(0, Math.min(1, x)); return k * k * (3 - 2 * k); };
const rnd = (i: number) => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const Svg: React.FC<{ children: React.ReactNode; o?: number }> = ({ children, o = 1 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>{children}</svg>
);

// ---------- la jarra (cuerpo x 300-780, y 480-1125; asa hasta x ≈ 918) ----------
const BODY = "M300 480 L780 480 L760 1100 Q758 1125 735 1125 L345 1125 Q322 1125 320 1100 Z";
const HOPPER = "M335 495 L745 495 L745 690 L610 725 L470 725 L335 690 Z";

/** Granos del interior del cartucho: carbón (negro, irregular) y resina (bolitas claras). */
const CartFill: React.FC<{ x0: number; x1: number; y0: number; y1: number }> = ({ x0, x1, y0, y1 }) => {
  const items: React.ReactNode[] = [];
  let k = 0;
  for (let y = y0 + 10; y < y1 - 6; y += 17) for (let x = x0 + 10 + ((y / 17) % 2) * 8; x < x1 - 6; x += 18) {
    k++;
    const r = rnd(k);
    if (r < 0.55) {
      const s = 7 + 3 * rnd(k + 99);
      items.push(<polygon key={k} points={`${x - s},${y - s * 0.4} ${x - s * 0.2},${y - s} ${x + s},${y - s * 0.5} ${x + s * 0.7},${y + s * 0.8} ${x - s * 0.6},${y + s * 0.7}`} fill={C.carbon} stroke={C.carbon2} strokeWidth={1.5} />);
    } else items.push(<circle key={k} cx={x} cy={y} r={6.5} fill={C.resin} stroke="#BFAE7A" strokeWidth={1.5} />);
  }
  return <g>{items}</g>;
};

export const Jug: React.FC<{ t: number; open?: number; cut?: number; up?: number; low?: number; flow?: number; hl?: "cart" | "low" | "top"; sparkle?: number }> =
  ({ t, open = 0, cut = 0, up = 0.6, low = 0.3, flow = 0, hl, sparkle = 0 }) => {
    const upTop = 690 - 185 * up;
    const lowTop = 1122 - 370 * low;
    const cx0 = 478, cx1 = 602, cy0 = 712, cy1 = 932;
    const dx = 78 * sm(cut);
    const pulse = 0.55 + 0.35 * Math.sin(t * 5);
    return (
      <g>
        <defs>
          <clipPath id="jf-body"><path d={BODY} /></clipPath>
          <clipPath id="jf-hop"><path d={HOPPER} /></clipPath>
        </defs>
        {/* asa y pico */}
        <path d="M778 545 C 905 545, 912 610, 906 700 L900 880 C 897 975, 860 1000, 770 1000" fill="none" stroke={C.shell2} strokeWidth={38} strokeLinecap="round" />
        <path d="M300 482 L238 462 L306 540 Z" fill={C.dark} stroke={C.light} strokeWidth={6} strokeLinejoin="round" />
        {/* cuerpo transparente */}
        <path d={BODY} fill="#0B1E38" fillOpacity={0.75} />
        {/* agua filtrada abajo */}
        <g clipPath="url(#jf-body)">
          <path d={`M290 ${lowTop} ${Array.from({ length: 13 }, (_, i) => `L${290 + i * 42} ${lowTop + 6 * Math.sin(t * 3 + i * 0.9)}`).join(" ")} L800 1130 L290 1130 Z`} fill={K.cold} opacity={0.55} />
          {hl === "low" && <rect x={290} y={lowTop - 4} width={510} height={1130 - lowTop} fill="none" stroke={K.flow} strokeWidth={8} opacity={pulse} />}
          {sparkle > 0.01 && Array.from({ length: 7 }, (_, i) => {
            const x = 360 + rnd(i + 40) * 360, y = lowTop + 50 + rnd(i + 60) * Math.max(40, 1060 - lowTop - 50);
            const s = (10 + 8 * Math.sin(t * 4 + i * 1.7)) * sparkle;
            return <path key={i} d={`M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3} Z`} fill={K.white} opacity={0.9} />;
          })}
        </g>
        {/* depósito de arriba (tolva) con el agua del grifo */}
        <path d={HOPPER} fill="#10294A" />
        <g clipPath="url(#jf-hop)">
          <path d={`M330 ${upTop} ${Array.from({ length: 11 }, (_, i) => `L${330 + i * 42} ${upTop + 5 * Math.sin(t * 3.4 + i)}`).join(" ")} L760 740 L330 740 Z`} fill={K.cold} opacity={0.6} />
          {flow > 0.01 && [380, 460, 620, 700].map((x, i) => {
            const y = upTop + 20 + (((t * 70 + i * 40) % 120));
            return y < 680 ? <path key={i} d={`M${x} ${y} l0 26 m-10 -10 l10 10 l10 -10`} stroke={K.white} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7 * flow} /> : null;
          })}
        </g>
        <path d={HOPPER} fill="none" stroke={C.light} strokeWidth={5} opacity={0.85} />
        {/* gotas que caen del cartucho */}
        {flow > 0.01 && Array.from({ length: 5 }, (_, i) => {
          const ph = ((t * 1.3 + i / 5) % 1);
          const y = cy1 + 10 + ph * Math.max(30, lowTop - cy1 - 10);
          if (y > lowTop) return null;
          return <ellipse key={i} cx={540 + (i % 2 ? 14 : -14)} cy={y} rx={8} ry={12} fill={K.cold} opacity={flow * (1 - ph * 0.3)} />;
        })}
        {/* cartucho: interior + dos mitades de carcasa que se separan */}
        <rect x={cx0} y={cy0} width={cx1 - cx0} height={cy1 - cy0} rx={16} fill={C.ink} />
        <g opacity={0.25 + 0.75 * sm(cut)}><CartFill x0={cx0} x1={cx1} y0={cy0} y1={cy1} /></g>
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * dx} 0)`}>
            <path d={s < 0 ? `M540 ${cy0} L${cx0 + 16} ${cy0} Q${cx0} ${cy0} ${cx0} ${cy0 + 16} L${cx0} ${cy1 - 16} Q${cx0} ${cy1} ${cx0 + 16} ${cy1} L540 ${cy1} Z`
              : `M540 ${cy0} L${cx1 - 16} ${cy0} Q${cx1} ${cy0} ${cx1} ${cy0 + 16} L${cx1} ${cy1 - 16} Q${cx1} ${cy1} ${cx1 - 16} ${cy1} L540 ${cy1} Z`}
              fill={C.shell} stroke={C.light} strokeWidth={4} opacity={1 - 0.15 * sm(cut)} />
            {[0, 1, 2, 3, 4, 5].map((j) => <line key={j} x1={540 + s * 20} x2={540 + s * 46} y1={cy0 + 40 + j * 30} y2={cy0 + 40 + j * 30} stroke={C.dark} strokeWidth={6} strokeLinecap="round" />)}
          </g>
        ))}
        {cut > 0.02 && <rect x={cx0} y={cy0} width={cx1 - cx0} height={cy1 - cy0} rx={16} fill="none" stroke={K.flow} strokeWidth={4} strokeDasharray="10 8" opacity={sm(cut)} />}
        {/* tapón del cartucho */}
        <rect x={452} y={690} width={176} height={32} rx={10} fill={C.shell2} stroke={C.light} strokeWidth={4} />
        {hl === "cart" && <rect x={cx0 - 14 - dx} y={680} width={cx1 - cx0 + 28 + 2 * dx} height={cy1 - 680 + 14} rx={22} fill="none" stroke={K.flow} strokeWidth={7} opacity={pulse} />}
        {/* contorno del cuerpo */}
        <path d={BODY} fill="none" stroke={C.light} strokeWidth={8} strokeLinejoin="round" />
        <path d="M335 540 L350 1070" stroke={K.white} strokeWidth={8} opacity={0.18} strokeLinecap="round" />
        {/* tapa que se levanta */}
        <g transform={`translate(${-10 * sm(open)} ${-35 * sm(open)}) rotate(${3 * sm(open)} 300 470)`}>
          <rect x={282} y={446} width={516} height={40} rx={16} fill={C.shell2} stroke={C.light} strokeWidth={5} />
          <rect x={300} y={428} width={100} height={24} rx={10} fill={C.shell} stroke={C.light} strokeWidth={4} />
        </g>
        {hl === "top" && <rect x={326} y={upTop - 12} width={428} height={700 - upTop + 12} rx={14} fill="none" stroke={K.flow} strokeWidth={7} opacity={pulse} />}
      </g>
    );
  };

// ---------- grano de carbón activado con poros y moléculas que se quedan pegadas ----------
export const Grain: React.FC<{ cx: number; cy: number; r: number; t: number; catchP?: number; n?: number; label?: string }> = ({ cx, cy, r, t, catchP = 0, n = 14, label }) => {
  const pts = Array.from({ length: 13 }, (_, i) => {
    const a = (i / 13) * Math.PI * 2, rr = r * (0.82 + 0.18 * rnd(i + 3));
    return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
  }).join(" ");
  const pores = Array.from({ length: n }, (_, i) => {
    const a = rnd(i + 11) * Math.PI * 2, d = r * (0.12 + 0.58 * rnd(i + 23));
    return [cx + d * Math.cos(a), cy + d * Math.sin(a), r * (0.05 + 0.04 * rnd(i + 31))] as const;
  });
  return (
    <g>
      <polygon points={pts} fill={C.carbon} stroke={C.carbon2} strokeWidth={Math.max(3, r * 0.025)} strokeLinejoin="round" />
      {pores.map(([x, y, pr], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={pr} fill="#0A0A0D" stroke="#3A3C44" strokeWidth={2} />
          <path d={`M${x} ${y} l${pr * 1.6} ${pr * 0.7} M${x} ${y} l${-pr * 1.2} ${pr * 1.4} M${x} ${y} l${pr * 0.3} ${-pr * 1.7}`} stroke="#0A0A0D" strokeWidth={Math.max(2, pr * 0.35)} strokeLinecap="round" />
        </g>
      ))}
      {/* moléculas: entran desde fuera y se quedan pegadas en los poros */}
      {pores.map(([x, y, pr], i) => {
        const k = sm(catchP * 1.6 - (i / n) * 0.6);
        const a = rnd(i + 51) * Math.PI * 2 + t * 0.4, d = r * 1.35;
        const sx = cx + d * Math.cos(a), sy = cy + d * Math.sin(a);
        const mx = lerp(sx, x, k), my = lerp(sy, y, k) + (1 - k) * 8 * Math.sin(t * 3 + i);
        const col = i % 3 === 0 ? K.white : K.flow;
        return <g key={`m${i}`} opacity={0.35 + 0.65 * Math.max(k, catchP > 0.01 ? 1 : 0.3)}>
          <circle cx={mx} cy={my} r={Math.max(7, pr * 0.65)} fill={col} />
          {k > 0.95 && <circle cx={mx} cy={my} r={Math.max(7, pr * 0.65) + 6} fill="none" stroke={col} strokeWidth={3} opacity={0.6 + 0.3 * Math.sin(t * 6 + i)} />}
        </g>;
      })}
      {label && <text x={cx} y={cy + r * 0.1} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.42} fill={K.white} stroke={C.ink} strokeWidth={8} paintOrder="stroke">{label}</text>}
    </g>
  );
};

// ---------- bolita de resina: la cal (Ca, Mg) entra y salen otros iones ----------
export const Resin: React.FC<{ cx: number; cy: number; r: number; t: number; swap?: number }> = ({ cx, cy, r, t, swap = 0 }) => {
  const sites = [0, 1, 2, 3, 4, 5].map((i) => (i / 6) * Math.PI * 2 - Math.PI / 2 + 0.3);
  return (
    <g>
      <defs>
        <radialGradient id={`jf-res-${cx}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFF6DA" /><stop offset="70%" stopColor={C.resin} /><stop offset="100%" stopColor="#B9A56C" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r * 1.55} fill={K.cold} opacity={0.08 + 0.04 * Math.sin(t * 2)} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#jf-res-${cx})`} stroke="#8F7E4C" strokeWidth={Math.max(3, r * 0.03)} />
      {sites.map((a, i) => {
        const k = sm(swap * 1.5 - i * 0.08);
        const ix = cx + r * 0.98 * Math.cos(a), iy = cy + r * 0.98 * Math.sin(a);
        // ion amarillo (sale)
        const ox = lerp(ix, cx + r * 1.6 * Math.cos(a + 0.4), k), oy = lerp(iy, cy + r * 1.6 * Math.sin(a + 0.4), k) + k * 6 * Math.sin(t * 3 + i);
        // calcio / magnesio (entra)
        const cA = a - 0.45, fx = cx + r * 1.6 * Math.cos(cA), fy = cy + r * 1.6 * Math.sin(cA);
        const px = lerp(fx, ix, k), py = lerp(fy, iy, k) + (1 - k) * 8 * Math.sin(t * 2.5 + i);
        const ir = Math.max(10, r * 0.13), cr = Math.max(14, r * 0.19);
        return (
          <g key={i}>
            <circle cx={ox} cy={oy} r={ir} fill={K.flow} />
            <text x={ox} y={oy + ir * 0.45} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={ir * 1.3} fill={C.ink}>+</text>
            <circle cx={px} cy={py} r={cr} fill={K.white} stroke={C.light} strokeWidth={3} />
            <text x={px} y={py + cr * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={cr * 0.95} fill={C.ink}>{i % 2 ? "Mg" : "Ca"}</text>
          </g>
        );
      })}
    </g>
  );
};

// ---------- pista de tenis vista desde arriba (23,77 × 10,97 m), en vertical ----------
export const Court: React.FC<{ x: number; y: number; w: number; o?: number }> = ({ x, y, w, o = 1 }) => {
  const h = w * (23.77 / 10.97), sx = w * (1.37 / 10.97), sv = h * (6.4 / 23.77);
  const lw = Math.max(2, w * 0.025);
  return (
    <g opacity={o}>
      <rect x={x - w * 0.08} y={y - w * 0.08} width={w * 1.16} height={h + w * 0.16} rx={6} fill="#245E46" />
      <rect x={x} y={y} width={w} height={h} fill={C.green} stroke={K.white} strokeWidth={lw} />
      <line x1={x + sx} x2={x + sx} y1={y} y2={y + h} stroke={K.white} strokeWidth={lw} />
      <line x1={x + w - sx} x2={x + w - sx} y1={y} y2={y + h} stroke={K.white} strokeWidth={lw} />
      <line x1={x + sx} x2={x + w - sx} y1={y + h / 2 - sv} y2={y + h / 2 - sv} stroke={K.white} strokeWidth={lw} />
      <line x1={x + sx} x2={x + w - sx} y1={y + h / 2 + sv} y2={y + h / 2 + sv} stroke={K.white} strokeWidth={lw} />
      <line x1={x + w / 2} x2={x + w / 2} y1={y + h / 2 - sv} y2={y + h / 2 + sv} stroke={K.white} strokeWidth={lw} />
      <line x1={x - w * 0.06} x2={x + w * 1.06} y1={y + h / 2} y2={y + h / 2} stroke={C.ink} strokeWidth={lw * 2.2} />
    </g>
  );
};

// ---------- grifo + chorro + vaso ----------
export const Tap: React.FC<{ t: number; x?: number; y?: number; o?: number }> = ({ t, x = 420, y = 520, o = 1 }) => (
  <g opacity={o}>
    <rect x={x - 230} y={y - 40} width={90} height={80} rx={12} fill={C.shell} stroke={C.light} strokeWidth={5} />
    <path d={`M${x - 140} ${y - 26} L${x + 20} ${y - 26} Q${x + 70} ${y - 26} ${x + 70} ${y + 24} L${x + 70} ${y + 70} L${x + 20} ${y + 70} L${x + 20} ${y + 26} L${x - 140} ${y + 26} Z`} fill={C.shell2} stroke={C.light} strokeWidth={5} strokeLinejoin="round" />
    <rect x={x - 70} y={y - 76} width={20} height={50} fill={C.light} />
    <rect x={x - 110} y={y - 92} width={100} height={22} rx={10} fill={C.shell2} stroke={C.light} strokeWidth={4} />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={x + 30} y={y + 72 + ((t * 300 + i * 60) % 330)} width={30} height={40} rx={14} fill={K.cold} opacity={0.75} />)}
    <rect x={x + 32} y={y + 72} width={26} height={340} fill={K.cold} opacity={0.35} />
  </g>
);

export const Glass: React.FC<{ t: number; x: number; y: number; w?: number; h?: number; level?: number; sparkle?: number }> = ({ t, x, y, w = 220, h = 300, level = 0.7, sparkle = 0 }) => {
  const top = y + h - level * (h - 20);
  return (
    <g>
      <clipPath id={`jf-gl-${x}`}><path d={`M${x - w / 2} ${y} L${x + w / 2} ${y} L${x + w * 0.4} ${y + h} L${x - w * 0.4} ${y + h} Z`} /></clipPath>
      <g clipPath={`url(#jf-gl-${x})`}>
        <path d={`M${x - w} ${top} ${Array.from({ length: 9 }, (_, i) => `L${x - w / 2 + i * (w / 8)} ${top + 5 * Math.sin(t * 4 + i)}`).join(" ")} L${x + w} ${y + h + 10} L${x - w} ${y + h + 10} Z`} fill={K.cold} opacity={0.6} />
      </g>
      <path d={`M${x - w / 2} ${y} L${x + w / 2} ${y} L${x + w * 0.4} ${y + h} L${x - w * 0.4} ${y + h} Z`} fill="none" stroke={C.light} strokeWidth={7} strokeLinejoin="round" />
      {sparkle > 0.01 && [0, 1, 2].map((i) => {
        const sx = x - w * 0.25 + i * w * 0.25, sy = top + 40 + (i % 2) * 50, s = (14 + 6 * Math.sin(t * 5 + i)) * sparkle;
        return <path key={i} d={`M${sx} ${sy - s} L${sx + s * 0.3} ${sy - s * 0.3} L${sx + s} ${sy} L${sx + s * 0.3} ${sy + s * 0.3} L${sx} ${sy + s} L${sx - s * 0.3} ${sy + s * 0.3} L${sx - s} ${sy} L${sx - s * 0.3} ${sy - s * 0.3} Z`} fill={K.white} />;
      })}
    </g>
  );
};

// ---------- bacteria esquemática ----------
export const Bug: React.FC<{ x: number; y: number; s?: number; t: number; o?: number; rot?: number }> = ({ x, y, s = 1, t, o = 1, rot = 0 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) rotate(${rot + 8 * Math.sin(t * 3 + x)}) scale(${s})`} opacity={o}>
    <path d={`M-30 0 q-14 ${8 * Math.sin(t * 8)} -26 0 M30 0 q14 ${-8 * Math.sin(t * 8)} 26 0`} stroke={K.warn} strokeWidth={4} fill="none" strokeLinecap="round" />
    <rect x={-32} y={-15} width={64} height={30} rx={15} fill={K.warn} />
    <circle cx={-10} cy={-3} r={4} fill="#FFB3B0" /><circle cx={9} cy={4} r={3} fill="#FFB3B0" />
  </g>
);

// ---------- calendario con meses que pasan ----------
export const Calendar: React.FC<{ x: number; y: number; t: number; months: number }> = ({ x, y, t, months }) => (
  <g>
    <rect x={x - 150} y={y - 150} width={300} height={290} rx={22} fill={K.white} stroke={C.light} strokeWidth={5} />
    <rect x={x - 150} y={y - 150} width={300} height={80} rx={22} fill={K.warn} />
    <rect x={x - 150} y={y - 100} width={300} height={30} fill={K.warn} />
    {[-90, 90].map((d) => <rect key={d} x={x + d - 10} y={y - 175} width={20} height={50} rx={8} fill={C.shell2} />)}
    {Array.from({ length: 15 }, (_, i) => <rect key={i} x={x - 120 + (i % 5) * 50} y={y - 45 + Math.floor(i / 5) * 55} width={36} height={36} rx={6} fill={i < Math.round(months * 7.5) ? "#C9D4E3" : "#EEF2F7"} />)}
    <text x={x} y={y - 92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={K.white}>{months < 1.5 ? "MES 1" : "MES 2"}</text>
    <path d={`M${x + 150} ${y + 140} l-50 0 l50 -50 Z`} fill={C.light} opacity={0.6 + 0.2 * Math.sin(t * 3)} />
  </g>
);

/** Cartucho suelto (para el truco): viejo = más oscuro y con bacterias. */
export const Cartridge: React.FC<{ x: number; y: number; t: number; old: number }> = ({ x, y, t, old }) => (
  <g>
    <rect x={x - 90} y={y - 200} width={180} height={44} rx={12} fill={C.shell2} stroke={C.light} strokeWidth={4} />
    <rect x={x - 75} y={y - 160} width={150} height={330} rx={22} fill={C.shell} stroke={C.light} strokeWidth={4} />
    {[0, 1, 2, 3, 4, 5, 6].map((j) => <line key={j} x1={x - 45} x2={x + 45} y1={y - 120 + j * 40} y2={y - 120 + j * 40} stroke={C.dark} strokeWidth={8} strokeLinecap="round" />)}
    <rect x={x - 75} y={y - 160} width={150} height={330} rx={22} fill="#3B3420" opacity={0.55 * old} />
    {[[-40, -80], [35, -20], [-30, 60], [40, 110], [0, 10]].map(([dx, dy], i) => (
      <Bug key={i} x={x + dx} y={y + dy} s={0.55 + 0.1 * (i % 2)} t={t} o={sm(old * 2.2 - i * 0.25)} rot={i * 40} />
    ))}
  </g>
);

// ---------- nevera abierta con la jarra dentro ----------
export const Fridge: React.FC<{ t: number; open: number; children?: React.ReactNode }> = ({ t, open, children }) => {
  const dw = 420 * Math.cos(sm(open) * 1.25);
  return (
    <g>
      <rect x={300} y={450} width={480} height={680} rx={30} fill="#DDE6F1" stroke={C.light} strokeWidth={6} />
      <rect x={325} y={475} width={430} height={630} rx={18} fill="#0E2A4C" />
      <rect x={325} y={475} width={430} height={630} rx={18} fill={K.cold} opacity={0.12 + 0.04 * Math.sin(t * 2)} />
      <line x1={330} x2={750} y1={1000} y2={1000} stroke={C.light} strokeWidth={6} />
      {children}
      {/* copos */}
      {[0, 1, 2].map((i) => {
        const fx = 380 + i * 160, fy = 520 + 18 * Math.sin(t * 1.5 + i), s = 16;
        return <g key={i} stroke={K.white} strokeWidth={4} strokeLinecap="round" opacity={0.7}>
          <line x1={fx - s} x2={fx + s} y1={fy} y2={fy} /><line x1={fx - s / 2} x2={fx + s / 2} y1={fy - s * 0.87} y2={fy + s * 0.87} /><line x1={fx - s / 2} x2={fx + s / 2} y1={fy + s * 0.87} y2={fy - s * 0.87} />
        </g>;
      })}
      {/* puerta que gira hacia la izquierda */}
      <path d={`M300 450 L${300 - dw * 0.35} ${430} L${300 - dw * 0.35} ${1150} L300 1130 Z`} fill="#C6D3E3" stroke={C.light} strokeWidth={5} opacity={open > 0.02 ? 1 : 0} />
      {open < 0.02 && <rect x={300} y={450} width={480} height={680} rx={30} fill="#DDE6F1" stroke={C.light} strokeWidth={6} />}
    </g>
  );
};
