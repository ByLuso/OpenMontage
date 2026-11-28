// Dibujos SVG del episodio «Cómo carga un coche eléctrico en el punto de recarga». Coordenadas absolutas de 1080×1920.
// Naranja = corriente alterna, amarillo = corriente continua / lo importante, cian = señal de control, rojo = error. Sin marcas.
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#040A14", shell: "#DCE5EF", brass: "#E0B84A", glass: "#7FB6E0" };
const FF = "MontserratSerie";

/** Símbolos de conversión (~ = alterna, = continua) dentro de una caja. */
export const Conv: React.FC<{ x: number; y: number; w: number; h: number; glow?: number; dim?: number; t?: number }> = ({ x, y, w, h, glow = 0, dim = 1, t = 0 }) => (
  <g transform={`translate(${x},${y})`} opacity={dim}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill={C.case1} stroke={glow > 0.05 ? K.flow : C.case3} strokeWidth={6}
      style={glow > 0.05 ? { filter: `drop-shadow(0 0 ${10 + 8 * Math.sin(t * 6)}px ${K.flow})` } : undefined} />
    <text x={-w * 0.25} y={h * 0.18} textAnchor="middle" fontFamily={FF} fontWeight={900} fontSize={h * 0.55} fill={K.hot}>~</text>
    <path d={`M${-w * 0.07},0 h${w * 0.14} m${-w * 0.04},${-h * 0.1} l${w * 0.05},${h * 0.1} l${-w * 0.05},${h * 0.1}`} fill="none" stroke={K.white} strokeWidth={5} strokeLinecap="round" />
    <text x={w * 0.25} y={h * 0.2} textAnchor="middle" fontFamily={FF} fontWeight={900} fontSize={h * 0.5} fill={K.flow}>=</text>
  </g>
);

/** Coche de perfil (genérico). Centro del suelo en (0,0). soc: nivel de batería (0-1). */
export const Car: React.FC<{ x: number; y: number; s?: number; t: number; soc?: number; ob?: number; obDim?: number; bat?: number; o?: number }> = ({ x, y, s = 1, t, soc = 0.4, ob = 0, obDim = 1, bat = 0, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-260,30 L-260,-30 Q-250,-60 -200,-66 L-110,-72 Q-70,-132 0,-136 L110,-136 Q170,-130 200,-72 L240,-62 Q262,-52 262,-20 L262,30 Z" fill={C.case2} stroke={C.case1} strokeWidth={8} />
    <path d="M-95,-72 Q-62,-118 -6,-120 L-6,-72 Z M12,-72 L12,-120 L108,-120 Q150,-114 172,-72 Z" fill={C.glass} opacity={0.85} />
    {/* batería bajo el suelo */}
    <rect x={-190} y={34} width={380} height={34} rx={8} fill={C.dark} stroke={bat > 0.05 ? K.flow : C.case3} strokeWidth={6}
      style={bat > 0.05 ? { filter: `drop-shadow(0 0 ${8 + 6 * Math.sin(t * 6)}px ${K.flow})` } : undefined} />
    <rect x={-184} y={40} width={368 * clamp01(soc)} height={22} rx={5} fill={K.flow} />
    {[-150, 150].map((wx) => (
      <g key={wx}><circle cx={wx} cy={56} r={50} fill={C.dark} /><circle cx={wx} cy={56} r={24} fill={C.case3} /></g>
    ))}
    {/* cargador interno junto al enchufe del coche */}
    {obDim > 0.01 && <Conv x={120} y={-18} w={110} h={64} glow={ob} dim={obDim} t={t} />}
    <circle cx={252} cy={-10} r={13} fill={K.cold} opacity={0.9} />
  </g>
);

/** Cargador de pared pequeño. */
export const Wall: React.FC<{ x: number; y: number; s?: number; t: number; on?: number }> = ({ x, y, s = 1, t, on = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-70} y={-260} width={140} height={260} rx={22} fill={C.case1} stroke={C.case3} strokeWidth={6} />
    <rect x={-46} y={-228} width={92} height={60} rx={10} fill={C.dark} />
    <circle cx={0} cy={-120} r={14} fill={on > 0.5 ? K.flow : K.cold} opacity={0.6 + 0.4 * Math.sin(t * 5)} />
    <rect x={-20} y={-90} width={40} height={50} rx={8} fill={C.case3} />
  </g>
);

/** Poste de carga rápida, alto y ancho, con el convertidor grande dentro. */
export const Pole: React.FC<{ x: number; y: number; s?: number; t: number; glow?: number; on?: number }> = ({ x, y, s = 1, t, glow = 0, on = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-120} y={-560} width={240} height={560} rx={26} fill={C.case1} stroke={C.case3} strokeWidth={8} />
    <rect x={-84} y={-520} width={168} height={110} rx={12} fill={C.dark} />
    <rect x={-70} y={-504} width={140 * (on > 0 ? 0.35 + 0.35 * Math.sin(t * 2) + 0.3 : 0.2)} height={16} rx={6} fill={K.flow} />
    <Conv x={0} y={-270} w={190} h={140} glow={glow} t={t} />
    <rect x={-40} y={-120} width={80} height={90} rx={10} fill={C.case3} />
  </g>
);

/** Onda alterna (naranja) o continua (amarilla) entre x1 y x2. */
export const Wave: React.FC<{ x1: number; x2: number; y: number; amp?: number; t: number; kind: "ac" | "dc"; o?: number; len?: number }> = ({ x1, x2, y, amp = 34, t, kind, o = 1, len = 1 }) => {
  const xe = x1 + (x2 - x1) * len;
  if (kind === "dc") return (
    <g opacity={o}>
      <path d={`M${x1},${y} H${xe}`} stroke={K.flow} strokeWidth={11} strokeLinecap="round" strokeDasharray="22 14" strokeDashoffset={-t * 70} style={{ filter: `drop-shadow(0 0 6px ${K.flow})` }} />
    </g>
  );
  const pts = Array.from({ length: 61 }).map((_, k) => { const u = k / 60; return `${x1 + (xe - x1) * u},${y + amp * Math.sin(u * 14 - t * 7)}`; });
  return <polyline opacity={o} points={pts.join(" ")} fill="none" stroke={K.hot} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${K.hot})` }} />;
};

/** Cable curvo entre dos puntos. */
export const Cable: React.FC<{ x1: number; y1: number; x2: number; y2: number }> = ({ x1, y1, x2, y2 }) => (
  <path d={`M${x1},${y1} C${x1 + 90},${y1 + 120} ${x2 - 90},${y2 + 120} ${x2},${y2}`} fill="none" stroke={C.dark} strokeWidth={16} strokeLinecap="round" />
);

/** Pulsos de señal piloto que viajan de (xa) a (xb) a la altura y; dir 1 = hacia xb. */
export const Pulses: React.FC<{ xa: number; xb: number; y: number; t: number; o?: number; color?: string; n?: number }> = ({ xa, xb, y, t, o = 1, color = K.cold, n = 5 }) => (
  <g opacity={o}>
    {Array.from({ length: n }).map((_, k) => {
      const p = (t * 0.6 + k / n) % 1;
      return <rect key={k} x={xa + (xb - xa) * p - 12} y={y - 18} width={24} height={36} rx={5} fill={color} opacity={Math.sin(Math.PI * p)} />;
    })}
  </g>
);

/** Onda cuadrada de la señal piloto con ancho de pulso (duty) variable. */
export const Duty: React.FC<{ x: number; y: number; w: number; h: number; duty: number; t: number }> = ({ x, y, w, h, duty, t }) => {
  const per = w / 4; const off = (t * 40) % per;
  let d = `M${x},${y + h}`;
  for (let k = -1; k < 5; k++) {
    const a = x + k * per - off + per, b = a + per * duty, c = a + per;
    const cl = (v: number) => Math.max(x, Math.min(x + w, v));
    d += ` L${cl(a)},${y + h} L${cl(a)},${y} L${cl(b)},${y} L${cl(b)},${y + h} L${cl(c)},${y + h}`;
  }
  return <path d={d} fill="none" stroke={K.cold} strokeWidth={9} strokeLinejoin="round" />;
};

/** Curva potencia frente a carga: alta hasta ~80 % y luego cae. p = avance (0-1). */
export const Taper: React.FC<{ x: number; y: number; w: number; h: number; p: number }> = ({ x, y, w, h, p }) => {
  const pw = (u: number) => (u < 0.78 ? 0.92 - 0.06 * u : 0.87 * Math.pow(1 - (u - 0.78) / 0.22, 1.5) * 0.9 + 0.08);
  const pts = Array.from({ length: 51 }).map((_, k) => { const u = (k / 50) * p; return `${x + w * u},${y + h * (1 - pw(u))}`; });
  return (
    <g>
      <path d={`M${x},${y} V${y + h} H${x + w}`} fill="none" stroke={C.case3} strokeWidth={7} strokeLinecap="round" />
      <path d={`M${x + 0.78 * w},${y} V${y + h}`} stroke={K.white} strokeWidth={4} strokeDasharray="6 12" opacity={0.7} />
      <polyline points={pts.join(" ")} fill="none" stroke={K.flow} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x + w * p} cy={y + h * (1 - pw(p))} r={16} fill={K.flow} style={{ filter: `drop-shadow(0 0 8px ${K.flow})` }} />
    </g>
  );
};

/** Icono de batería con nivel. */
export const Bat: React.FC<{ x: number; y: number; s?: number; soc: number; o?: number }> = ({ x, y, s = 1, soc, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={-80} y={-50} width={160} height={100} rx={14} fill={C.dark} stroke={C.case3} strokeWidth={7} />
    <rect x={80} y={-18} width={14} height={36} rx={5} fill={C.case3} />
    <rect x={-70} y={-40} width={140 * clamp01(soc)} height={80} rx={8} fill={K.flow} />
  </g>
);

/** Burbuja de habla (para «hablan»). */
export const Bubble: React.FC<{ x: number; y: number; w?: number; text: string; tail?: number; o?: number; color?: string }> = ({ x, y, w = 220, text, tail = 1, o = 1, color = K.cold }) => o <= 0.01 ? null : (
  <g opacity={o} transform={`translate(${x},${y})`}>
    <rect x={-w / 2} y={-40} width={w} height={80} rx={24} fill={C.dark} stroke={color} strokeWidth={6} />
    <path d={`M${-18 * tail},40 l${10 * tail},34 l${22 * tail},-34`} fill={C.dark} stroke={color} strokeWidth={6} strokeLinejoin="round" />
    <text x={0} y={13} textAnchor="middle" fontFamily={FF} fontWeight={900} fontSize={38} fill={color}>{text}</text>
  </g>
);
