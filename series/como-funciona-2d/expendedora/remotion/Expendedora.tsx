// Dibujos SVG del episodio «cómo sabe la máquina expendedora qué moneda le has metido». Todos son <g> para un <svg 1080×1920>.
// Monedas y máquina GENÉRICAS (sin marcas ni diseños nacionales reales).
import React from "react";
import { K } from "./kit2d/Kit";

export const C = {
  case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#06101F", go: "#2EE59D",
  cu: "#C9743C", cuHi: "#E89A62", steel: "#8E9BAD", gold: "#D9B44A", goldHi: "#F2D37A", silver: "#C9D3DE", silverHi: "#EEF3F8",
  nickel: "#B8C4D0", wire: "#E08A3C", field: "#9FE3FF",
};

const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export type CoinKind = "cu" | "gold" | "e1" | "e2";
/** Moneda genérica vista de frente. e1 = anillo dorado y centro plateado; e2 = al revés. */
export const Coin: React.FC<{ x: number; y: number; r: number; kind?: CoinKind; rot?: number; val?: string; o?: number; glow?: string }> =
  ({ x, y, r, kind = "cu", rot = 0, val, o = 1, glow }) => {
    const bi = kind === "e1" || kind === "e2";
    const ring = kind === "e1" ? C.gold : kind === "e2" ? C.silver : kind === "gold" ? C.gold : C.cu;
    const core = kind === "e1" ? C.silver : kind === "e2" ? C.gold : ring;
    const hi = kind === "cu" ? C.cuHi : kind === "gold" ? C.goldHi : C.silverHi;
    const v = val ?? (kind === "e2" ? "2" : kind === "e1" ? "1" : kind === "gold" ? "20" : "5");
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o} style={glow ? { filter: `drop-shadow(0 0 18px ${glow})` } : undefined}>
        <circle r={r} fill={ring} stroke={C.dark} strokeWidth={Math.max(3, r * 0.04)} />
        <circle r={r * 0.9} fill="none" stroke={hi} strokeWidth={r * 0.03} opacity={0.8} />
        {bi && <circle r={r * 0.68} fill={core} stroke={C.dark} strokeWidth={r * 0.025} />}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const rr = r * (bi ? 0.79 : 0.8);
          return <circle key={i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r={r * 0.035} fill={C.dark} opacity={0.35} />;
        })}
        <text x={0} y={r * 0.2} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={r * (v.length > 1 ? 0.6 : 0.75)} fill={C.dark} opacity={0.55}>{v}</text>
        <ellipse cx={-r * 0.35} cy={-r * 0.4} rx={r * 0.28} ry={r * 0.12} fill="#FFFFFF" opacity={0.25} transform={`rotate(-35 ${-r * 0.35} ${-r * 0.4})`} />
      </g>
    );
  };

/** Moneda vista de canto (rectángulo redondeado): para el grosor. */
export const CoinSide: React.FC<{ x: number; y: number; w: number; h: number; color?: string }> = ({ x, y, w, h, color = C.cu }) => (
  <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h * 0.3} fill={color} stroke={C.dark} strokeWidth={4} />
    {Array.from({ length: 22 }).map((_, i) => (
      <line key={i} x1={x - w / 2 + 14 + i * ((w - 28) / 21)} y1={y - h / 2 + 5} x2={x - w / 2 + 14 + i * ((w - 28) / 21)} y2={y + h / 2 - 5} stroke={C.dark} strokeWidth={2} opacity={0.25} />
    ))}
  </g>
);

/** Bobina vista de frente: anillo de hilo de cobre con núcleo; `on` la enciende y saca el campo. */
export const Coil: React.FC<{ x: number; y: number; r: number; on?: number; t: number; field?: number }> = ({ x, y, r, on = 0, t, field = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    {field > 0.01 && [0, 1, 2].map((k) => {
      const ph = ((t * 0.8 + k / 3) % 1);
      return <circle key={k} r={r * (1 + ph * 0.9)} fill="none" stroke={C.field} strokeWidth={4} opacity={field * (1 - ph) * 0.8} />;
    })}
    <circle r={r} fill="none" stroke={C.wire} strokeWidth={r * 0.34} opacity={0.92} style={on > 0.01 ? { filter: `drop-shadow(0 0 ${14 * on}px ${K.flow})` } : undefined} />
    {Array.from({ length: 28 }).map((_, i) => {
      const a = (i / 28) * Math.PI * 2;
      return <line key={i} x1={Math.cos(a) * r * 0.84} y1={Math.sin(a) * r * 0.84} x2={Math.cos(a) * r * 1.16} y2={Math.sin(a) * r * 1.16} stroke={C.dark} strokeWidth={2.5} opacity={0.45} />;
    })}
    <circle r={r * 1.18} fill="none" stroke={K.flow} strokeWidth={5} opacity={0.9 * on} />
  </g>
);

/** Corrientes de Foucault: bucles amarillos que giran dentro de la moneda. */
export const Eddy: React.FC<{ x: number; y: number; r: number; t: number; o: number }> = ({ x, y, r, t, o }) => o <= 0.01 ? null : (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    {[0.35, 0.6, 0.85].map((k, i) => {
      const c = 2 * Math.PI * r * k;
      return <circle key={i} r={r * k} fill="none" stroke={K.flow} strokeWidth={6} strokeDasharray={`${c * 0.22} ${c * 0.1}`} strokeDashoffset={-t * 260 * (i % 2 ? -1 : 1)}
        strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${K.flow})` }} />;
    })}
  </g>
);

/** Imán de herradura (gris con polos blancos). */
export const Magnet: React.FC<{ x: number; y: number; s?: number; rot?: number; o?: number; pull?: number; t?: number }> = ({ x, y, s = 1, rot = 0, o = 1, pull = 0, t = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <path d="M -90 -110 L -90 10 A 90 90 0 0 0 90 10 L 90 -110 L 40 -110 L 40 10 A 40 40 0 0 1 -40 10 L -40 -110 Z" fill={C.case3} stroke={C.dark} strokeWidth={5} />
    <rect x={-90} y={-150} width={50} height={44} fill={K.white} stroke={C.dark} strokeWidth={5} />
    <rect x={40} y={-150} width={50} height={44} fill={K.white} stroke={C.dark} strokeWidth={5} />
    <text x={-65} y={-118} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={28} fill={C.dark}>N</text>
    <text x={65} y={-118} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={28} fill={C.dark}>S</text>
    {pull > 0.01 && [0, 1, 2].map((k) => {
      const ph = (t * 1.2 + k / 3) % 1;
      return <path key={k} d={`M -65 ${-160 - ph * 70} Q 0 ${-215 - ph * 70} 65 ${-160 - ph * 70}`} fill="none" stroke={C.field} strokeWidth={4} opacity={pull * (1 - ph)} />;
    })}
  </g>
);

/** Señal (onda) con forma según la aleación: amp, frecuencia y fase. */
export const Signal: React.FC<{ x: number; y: number; w: number; h: number; t: number; amp: number; f: number; color?: string; o?: number; dip?: number; sw?: number }> =
  ({ x, y, w, h, t, amp, f, color = K.flow, o = 1, dip = 0, sw = 6 }) => {
    const n = 60;
    const pts = Array.from({ length: n + 1 }).map((_, i) => {
      const u = i / n;
      const bump = Math.exp(-Math.pow((u - 0.5) / 0.16, 2));
      const yy = -h / 2 * (amp * bump * Math.sin(u * Math.PI * 2 * f + t * 3) * 0.6 + dip * bump);
      return `${(x - w / 2 + u * w).toFixed(1)},${(y + yy).toFixed(1)}`;
    });
    return (
      <g opacity={o}>
        <rect x={x - w / 2 - 14} y={y - h / 2 - 12} width={w + 28} height={h + 24} rx={16} fill="rgba(6,16,31,0.75)" stroke={C.case2} strokeWidth={3} />
        <line x1={x - w / 2} y1={y} x2={x + w / 2} y2={y} stroke={C.case2} strokeWidth={2} strokeDasharray="6 8" />
        <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </g>
    );
  };

// ---------------- mecanismo de monedas (validador) ----------------
// Coordenadas locales (centro 0,0), unos 600 × 760.
export const RAMP = { x0: -210, y0: -250, x1: 190, y1: -40 };
export const COILP = 0.55; // posición de las bobinas en la rampa (0-1)
export const EYEP = 0.25; // sensores de tamaño
const rampPt = (p: number, r: number) => {
  const { x0, y0, x1, y1 } = RAMP;
  const L = Math.hypot(x1 - x0, y1 - y0);
  const nx = (y1 - y0) / L, ny = -(x1 - x0) / L; // normal hacia arriba
  return { x: x0 + (x1 - x0) * p + nx * r, y: y0 + (y1 - y0) * p + ny * r };
};
/** Posición de la moneda: 0-1 por la rampa; 1-2 cae por el canal (accept → izquierda / hucha; reject → derecha / devolución). */
export const coinPos = (p: number, r: number, accept = true) => {
  if (p <= 1) return rampPt(Math.max(0, p), r);
  const q = Math.min(1, p - 1);
  const a = rampPt(1, r);
  const end = accept ? { x: -110, y: 300 } : { x: 225, y: 300 };
  const mid = accept ? { x: 150, y: 70 } : { x: 225, y: 60 };
  const u = q * q;
  const x = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * mid.x + u * u * end.x;
  const y = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * mid.y + u * u * end.y;
  return { x, y };
};

export const Mech: React.FC<{
  x: number; y: number; s?: number; t: number; coin?: number; coinR?: number; kind?: CoinKind; val?: string; accept?: boolean;
  coils?: number; field?: number; eddy?: number; eyes?: number; gate?: number; gateRed?: number; hucha?: number; ret?: number; magnet?: number; showCoin?: boolean;
}> = ({ x, y, s = 1, t, coin = 0.4, coinR = 44, kind = "cu", val, accept = true, coils = 0, field = 0, eddy = 0, eyes = 0, gate = 0, gateRed = 0, hucha = 0.4, ret = 0.4, magnet = 0, showCoin = true }) => {
  const { x0, y0, x1, y1 } = RAMP;
  const cp = coinPos(coin, coinR, accept);
  const cc = rampPt(COILP, coinR);
  const ey = rampPt(EYEP, coinR);
  const roll = (coin * 700) % 360;
  const gateAng = -40 + 80 * gate; // −40: cerrado hacia devolución… 40: abierto hacia la hucha
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* carcasa */}
      <rect x={-300} y={-380} width={600} height={760} rx={34} fill={C.case1} stroke={C.dark} strokeWidth={6} />
      <rect x={-270} y={-350} width={540} height={700} rx={24} fill="#16304F" />
      {/* ranura */}
      <rect x={-262} y={-372} width={120} height={22} rx={8} fill={C.dark} />
      <rect x={-250} y={-366} width={96} height={10} rx={5} fill={C.case3} opacity={0.6} />
      {/* rampa */}
      <line x1={x0 - 30} y1={y0 - 14} x2={x1 + 10} y2={y1 + 5} stroke={C.case3} strokeWidth={16} strokeLinecap="round" />
      <line x1={x0 - 30} y1={y0 - 14} x2={x1 + 10} y2={y1 + 5} stroke={C.dark} strokeWidth={4} strokeLinecap="round" opacity={0.4} />
      {/* sensores de tamaño (ojos) */}
      <g opacity={0.35 + 0.65 * eyes}>
        {[-1, 1].map((k) => {
          const px = ey.x + k * 0, py = ey.y - k * (coinR + 34);
          return <rect key={k} x={px - 20} y={py - 12} width={40} height={24} rx={6} fill={C.case2} stroke={C.dark} strokeWidth={3} />;
        })}
        <line x1={ey.x} y1={ey.y - coinR - 22} x2={ey.x} y2={ey.y + coinR + 22} stroke={K.cold} strokeWidth={5} strokeDasharray="10 8" opacity={eyes} style={{ filter: `drop-shadow(0 0 8px ${K.cold})` }} />
      </g>
      {/* canales de salida */}
      <path d="M 150 40 L 40 120 L -140 250 L -140 340" fill="none" stroke={C.case3} strokeWidth={10} opacity={0.5} />
      <path d="M 260 40 L 260 340" fill="none" stroke={C.case3} strokeWidth={10} opacity={0.5} />
      {/* hucha (izquierda) */}
      <rect x={-250} y={270} width={230} height={70} rx={14} fill={C.case2} stroke={hucha > 0.5 ? C.go : C.dark} strokeWidth={5} opacity={0.4 + 0.6 * hucha} />
      {/* cajetín de devolución (derecha) */}
      <rect x={160} y={270} width={120} height={70} rx={14} fill={C.case2} stroke={ret > 0.5 ? K.warn : C.dark} strokeWidth={5} opacity={0.4 + 0.6 * ret} />
      {/* imán fijo (opcional) bajo la rampa */}
      {magnet > 0.01 && <Magnet x={cc.x + 60} y={cc.y + 150} s={0.5} rot={0} o={magnet} pull={magnet} t={t} />}
      {/* moneda */}
      {showCoin && <Coin x={cp.x} y={cp.y} r={coinR} kind={kind} val={val} rot={roll} />}
      <Eddy x={cp.x} y={cp.y} r={coinR * 0.95} t={t} o={eddy} />
      {/* bobina (delante de la moneda) */}
      <Coil x={cc.x} y={cc.y} r={coinR * 1.25} on={coils} t={t} field={field} />
      {/* compuerta */}
      <g transform={`translate(205 40) rotate(${gateAng})`}>
        <rect x={-8} y={0} width={16} height={90} rx={8} fill={gateRed > 0.5 ? K.warn : gate > 0.5 ? C.go : C.case3} stroke={C.dark} strokeWidth={3} />
      </g>
      <circle cx={205} cy={40} r={14} fill={C.case2} stroke={C.dark} strokeWidth={3} />
    </g>
  );
};

/** Máquina expendedora genérica (fachada). `open` 0→1 separa las dos mitades. */
export const Vending: React.FC<{ x: number; y: number; t: number; open?: number; W?: number; H?: number }> = ({ x, y, t, open = 0, W = 640, H = 860 }) => {
  const L = x - W / 2, T = y - H / 2;
  const cans = ["#35C4F0", "#FF7A1A", "#FFD23F", "#2EE59D", "#9FB3CC"];
  const half = (side: 0 | 1) => (
    <g transform={`translate(${(side ? 1 : -1) * 200 * open} 0)`}>
      <clipPath id={`vh${side}`}><rect x={side ? x : L - 10} y={T - 10} width={W / 2 + 10} height={H + 20} /></clipPath>
      <g clipPath={`url(#vh${side})`}>
        <rect x={L} y={T} width={W} height={H} rx={36} fill={C.case2} stroke={C.dark} strokeWidth={7} />
        <rect x={L + 34} y={T + 40} width={W * 0.62} height={H * 0.68} rx={18} fill="#0B1C33" stroke={C.dark} strokeWidth={5} />
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            {[0, 1, 2, 3].map((c) => (
              <rect key={c} x={L + 56 + c * 88} y={T + 66 + r * 140} width={60} height={104} rx={14} fill={cans[(r + c) % 5]} opacity={0.9} stroke={C.dark} strokeWidth={4} />
            ))}
            <rect x={L + 44} y={T + 176 + r * 140} width={W * 0.62 - 20} height={10} rx={5} fill={C.case3} opacity={0.6} />
          </g>
        ))}
        <rect x={L + 34} y={T + H * 0.68 + 70} width={W * 0.62} height={110} rx={16} fill={C.dark} />
        {/* panel de monedas */}
        <rect x={L + W * 0.72} y={T + 40} width={W * 0.22} height={H * 0.68} rx={14} fill={C.case1} stroke={C.dark} strokeWidth={4} />
        <rect x={L + W * 0.75} y={T + 70} width={W * 0.16} height={60} rx={8} fill="#0B1C33" />
        <text x={L + W * 0.83} y={T + 112} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={32} fill={K.flow}>{(1.5 + 0 * t).toFixed(2).replace(".", ",")}</text>
        {[0, 1, 2].map((r) => [0, 1].map((c) => (
          <rect key={`${r}${c}`} x={L + W * 0.755 + c * 52} y={T + 160 + r * 52} width={40} height={40} rx={8} fill={C.case3} stroke={C.dark} strokeWidth={3} />
        )))}
        <rect x={L + W * 0.79} y={T + 340} width={W * 0.08} height={54} rx={8} fill={C.dark} />
        <rect x={L + W * 0.81} y={T + 350} width={W * 0.04} height={34} rx={4} fill={K.flow} opacity={0.5 + 0.3 * Math.sin(t * 4)} />
        <rect x={L + W * 0.76} y={T + 450} width={W * 0.14} height={70} rx={10} fill={C.dark} />
      </g>
    </g>
  );
  return <g>{half(0)}{half(1)}</g>;
};

/** Tubos de cambio con monedas apiladas. fill[i] 0-1. */
export const Tubes: React.FC<{ x: number; y: number; fill: number[]; t: number; kinds: CoinKind[]; o?: number }> = ({ x, y, fill, t, kinds, o = 1 }) => {
  const n = fill.length, gap = 130, tw = 100, th = 420;
  return (
    <g opacity={o}>
      {fill.map((f, i) => {
        const cx = x + (i - (n - 1) / 2) * gap;
        const k = kinds[i];
        const col = k === "cu" ? C.cu : k === "gold" ? C.gold : k === "e1" ? C.gold : C.silver;
        const nC = Math.round(f * 20);
        return (
          <g key={i}>
            <rect x={cx - tw / 2} y={y - th} width={tw} height={th} rx={12} fill="rgba(159,179,204,0.12)" stroke={C.case3} strokeWidth={4} />
            {Array.from({ length: nC }).map((_, j) => (
              <rect key={j} x={cx - tw / 2 + 8} y={y - 8 - (j + 1) * 20} width={tw - 16} height={17} rx={6} fill={col} stroke={C.dark} strokeWidth={2.5} />
            ))}
          </g>
        );
      })}
    </g>
  );
};

/** Vasija de Herón (esquemática): ranura, platillo, palanca, válvula y caño. `tilt` 0→1 la moneda inclina el platillo; `flow` el agua. */
export const Heron: React.FC<{ x: number; y: number; t: number; tilt: number; flow: number; coinY: number; showCoin: number }> = ({ x, y, t, tilt, flow, coinY, showCoin }) => {
  const ang = 14 * tilt;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* vasija */}
      <path d="M -170 -300 L 170 -300 L 200 -240 L 230 200 Q 230 300 120 320 L -120 320 Q -230 300 -230 200 L -200 -240 Z" fill="#B8865A" stroke={C.dark} strokeWidth={7} />
      <path d="M -150 -230 L 150 -230" stroke={C.dark} strokeWidth={4} opacity={0.35} />
      <path d="M -190 150 L 190 150" stroke={C.dark} strokeWidth={4} opacity={0.35} />
      {[-120, -40, 40, 120].map((k) => <circle key={k} cx={k} cy={190} r={14} fill={C.dark} opacity={0.25} />)}
      {/* ventana de corte */}
      <rect x={-170} y={-210} width={340} height={340} rx={24} fill="#0B1C33" stroke={C.dark} strokeWidth={5} />
      {/* depósito de agua */}
      <rect x={-150} y={-30} width={300} height={140} rx={14} fill={K.cold} opacity={0.55} />
      {/* ranura arriba */}
      <rect x={-50} y={-312} width={100} height={20} rx={6} fill={C.dark} />
      {/* palanca y platillo */}
      <g transform={`translate(0 -110) rotate(${ang})`}>
        <line x1={-130} y1={0} x2={120} y2={0} stroke={C.case3} strokeWidth={12} strokeLinecap="round" />
        <path d="M -150 -6 L -80 -6 L -95 16 L -135 16 Z" fill={C.case3} stroke={C.dark} strokeWidth={3} />
        <rect x={100} y={-30} width={36} height={60} rx={6} fill={C.case1} stroke={C.dark} strokeWidth={3} />
      </g>
      <circle cx={0} cy={-110} r={12} fill={C.case2} stroke={C.dark} strokeWidth={3} />
      {/* varilla a la válvula */}
      <line x1={118} y1={-110 + 118 * Math.tan((ang * Math.PI) / 180)} x2={118} y2={40} stroke={C.case3} strokeWidth={8} />
      <rect x={100} y={40 + 20 * tilt} width={36} height={20} rx={4} fill={K.flow} stroke={C.dark} strokeWidth={3} />
      {/* caño */}
      <path d="M 150 70 L 280 70 L 280 100" fill="none" stroke="#B8865A" strokeWidth={26} strokeLinejoin="round" />
      <path d="M 150 70 L 280 70 L 280 100" fill="none" stroke={C.dark} strokeWidth={4} opacity={0.4} />
      {flow > 0.01 && Array.from({ length: 6 }).map((_, i) => {
        const ph = (t * 1.6 + i / 6) % 1;
        return <ellipse key={i} cx={280 + 4 * Math.sin(i)} cy={120 + ph * 200} rx={10} ry={16} fill={K.cold} opacity={flow * (1 - ph * 0.6)} />;
      })}
      {/* moneda */}
      {showCoin > 0.01 && <Coin x={-115} y={coinY} r={26} kind="cu" val=" " o={showCoin} />}
    </g>
  );
};

/** Canto de la moneda de 2 €: banda que gira con la leyenda grabada pasando. */
export const Edge: React.FC<{ x: number; y: number; w: number; h: number; t: number; text: string; o?: number; color?: string }> = ({ x, y, w, h, t, text, o = 1, color = C.silver }) => {
  const id = `edge${Math.round(x)}${Math.round(y)}`;
  const per = Math.max(60, text.length * h * 0.42 * 0.66);
  return (
    <g opacity={o}>
      <defs><clipPath id={id}><rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} /></clipPath>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#06101F" stopOpacity={0.6} /><stop offset="0.25" stopColor="#06101F" stopOpacity={0} /><stop offset="0.75" stopColor="#06101F" stopOpacity={0} /><stop offset="1" stopColor="#06101F" stopOpacity={0.6} />
        </linearGradient></defs>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill={color} stroke={C.dark} strokeWidth={5} />
      <g clipPath={`url(#${id})`}>
        {Array.from({ length: 50 }).map((_, i) => <line key={i} x1={x - w / 2 + i * (w / 50)} y1={y - h / 2} x2={x - w / 2 + i * (w / 50)} y2={y - h / 2 + h * 0.18} stroke={C.dark} strokeWidth={3} opacity={0.4} />)}
        {Array.from({ length: 50 }).map((_, i) => <line key={`b${i}`} x1={x - w / 2 + i * (w / 50)} y1={y + h / 2 - h * 0.18} x2={x - w / 2 + i * (w / 50)} y2={y + h / 2} stroke={C.dark} strokeWidth={3} opacity={0.4} />)}
        <text x={x - w / 2 - per + ((t * 90) % per)} y={y + h * 0.17} fontFamily="MontserratSerie" fontWeight={900} fontSize={h * 0.42} fill={C.dark} opacity={0.75}>{text.repeat(Math.ceil((w * 2) / per) + 1)}</text>
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={`url(#${id}g)`} />
      </g>
    </g>
  );
};

/** Corte de una moneda: capas apiladas (de arriba abajo). */
export const Layers: React.FC<{ x: number; y: number; w: number; layers: { h: number; color: string }[]; o?: number; hl?: number; hlIdx?: number }> = ({ x, y, w, layers, o = 1, hl = 0, hlIdx = -1 }) => {
  const H = layers.reduce((a, l) => a + l.h, 0);
  let yy = y - H / 2;
  return (
    <g opacity={o}>
      {layers.map((l, i) => {
        const r = <rect key={i} x={x - w / 2} y={yy} width={w} height={l.h} fill={l.color} stroke={i === hlIdx && hl > 0.3 ? K.flow : C.dark} strokeWidth={i === hlIdx && hl > 0.3 ? 6 : 3}
          style={i === hlIdx && hl > 0.01 ? { filter: `drop-shadow(0 0 ${14 * hl}px ${K.flow})` } : undefined} />;
        yy += l.h;
        return r;
      })}
    </g>
  );
};

export const Check: React.FC<{ x: number; y: number; s?: number; o: number; color?: string }> = ({ x, y, s = 1, o, color = C.go }) => o <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s * (0.7 + 0.3 * o)})`} opacity={o}>
    <circle r={44} fill={color} stroke={C.dark} strokeWidth={5} />
    <path d="M -20 0 L -5 16 L 22 -16" fill="none" stroke={C.dark} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
export const Cross: React.FC<{ x: number; y: number; s?: number; o: number }> = ({ x, y, s = 1, o }) => o <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s * (0.7 + 0.3 * o)})`} opacity={o}>
    <circle r={44} fill={K.warn} stroke={C.dark} strokeWidth={5} />
    <path d="M -16 -16 L 16 16 M 16 -16 L -16 16" stroke={C.dark} strokeWidth={10} strokeLinecap="round" />
  </g>
);

/** Flecha de cota con extremos. */
export const Dim: React.FC<{ x1: number; y1: number; x2: number; y2: number; o: number; color?: string }> = ({ x1, y1, x2, y2, o, color = K.cold }) => {
  if (o <= 0.01) return null;
  const a = Math.atan2(y2 - y1, x2 - x1), k = 22;
  const head = (x: number, y: number, b: number) => `M ${x - Math.cos(b - 0.5) * k} ${y - Math.sin(b - 0.5) * k} L ${x} ${y} L ${x - Math.cos(b + 0.5) * k} ${y - Math.sin(b + 0.5) * k}`;
  return (
    <g opacity={o} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <path d={head(x2, y2, a)} /><path d={head(x1, y1, a + Math.PI)} />
    </g>
  );
};

export const speckle = rnd;
