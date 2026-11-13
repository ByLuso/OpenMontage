// Dibujos SVG del episodio «cómo sabe el semáforo que hay un coche esperando». Todos son <g> para meter en un <svg 1080×1920>.
import React from "react";
import { K, FONT } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", asph: "#1A2638", asph2: "#223149", groove: "#050A12", dark: "#06101F", go: "#2EE59D", amber: "#FFB020" };

export type Light = "r" | "a" | "g" | "off";
const lampCol = (k: Light, on: Light) => (k === on ? (k === "r" ? K.warn : k === "a" ? C.amber : C.go) : k === "r" ? "#3a1c24" : k === "a" ? "#3a301a" : "#16352c");

/** Semáforo vertical: cabeza centrada en (x, y) de 150×400 a escala s. pole = largo del poste hacia abajo (px sin escalar). */
export const TrafficLight: React.FC<{ x: number; y: number; s?: number; on: Light; pole?: number; t?: number }> = ({ x, y, s = 1, on, pole = 0, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {pole > 0 && <rect x={-14} y={190} width={28} height={pole} fill={C.case1} stroke={C.case3} strokeOpacity={0.4} strokeWidth={3} />}
    <rect x={-75} y={-200} width={150} height={400} rx={34} fill={C.case1} stroke={C.case3} strokeWidth={6} />
    {(["r", "a", "g"] as Light[]).map((k, i) => {
      const cy = -125 + i * 125;
      const lit = k === on;
      const col = lampCol(k, on);
      return (
        <g key={k}>
          <path d={`M -62 ${cy - 56} Q 0 ${cy - 86} 62 ${cy - 56}`} fill="none" stroke={C.dark} strokeWidth={10} strokeLinecap="round" />
          <circle cx={0} cy={cy} r={50} fill={col} style={lit ? { filter: `drop-shadow(0 0 ${22 + 6 * Math.sin(t * 4)}px ${col})` } : {}} />
          {lit && <circle cx={-16} cy={cy - 16} r={14} fill="#fff" opacity={0.35} />}
        </g>
      );
    })}
  </g>
);

/** Carril visto desde arriba: asfalto, bordes discontinuos y línea de parada arriba (los coches van hacia arriba). */
export const Lane: React.FC<{ x0: number; x1: number; y0: number; y1: number; stop?: number; t?: number; crossing?: boolean }> = ({ x0, x1, y0, y1, stop, crossing = false }) => (
  <g>
    <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={C.asph} />
    {[x0, x1].map((x) => <line key={x} x1={x} y1={y0} x2={x} y2={y1} stroke={K.white} strokeOpacity={0.55} strokeWidth={8} strokeDasharray="44 34" />)}
    {stop !== undefined && <rect x={x0} y={stop - 10} width={x1 - x0} height={20} fill={K.white} opacity={0.9} />}
    {crossing && stop !== undefined && Array.from({ length: 6 }).map((_, i) => (
      <rect key={i} x={x0 + 20 + i * ((x1 - x0 - 40) / 6)} y={stop - 120} width={(x1 - x0 - 40) / 6 - 26} height={80} fill={K.white} opacity={0.75} />
    ))}
  </g>
);

/** Espira vista desde arriba: corte rectangular (ranura oscura) con el cable. glow 0→1 enciende el cable; current 0→1 muestra la corriente que va y viene. */
export const LoopTop: React.FC<{ cx: number; cy: number; w: number; h: number; glow?: number; current?: number; t: number; lead?: number; color?: string }> =
  ({ cx, cy, w, h, glow = 0, current = 0, t, lead = 0, color = K.flow }) => {
    const x = cx - w / 2, y = cy - h / 2;
    const per = 2 * (w + h);
    const dir = Math.sin(t * 2 * Math.PI * 0.8); // va y viene (cámara lenta)
    const d = `M ${cx} ${y} H ${x + w} V ${y + h} H ${x} V ${y} Z`;
    return (
      <g>
        {lead > 0 && <path d={`M ${x + w} ${cy} H ${x + w + lead}`} stroke={C.groove} strokeWidth={16} strokeLinecap="round" />}
        <path d={d} fill="none" stroke={C.groove} strokeWidth={18} strokeLinejoin="miter" />
        {/* cortes diagonales de las esquinas, como en la calle */}
        {[[x, y, 1, 1], [x + w, y, -1, 1], [x + w, y + h, -1, -1], [x, y + h, 1, -1]].map(([px, py, sx, sy], i) => (
          <line key={i} x1={px} y1={py} x2={px + sx * 26} y2={py + sy * 26} stroke={C.groove} strokeWidth={12} strokeLinecap="round" />
        ))}
        {glow > 0.01 && <>
          {lead > 0 && <path d={`M ${x + w} ${cy} H ${x + w + lead}`} stroke={color} strokeWidth={6} opacity={glow} />}
          <path d={d} fill="none" stroke={color} strokeWidth={6} opacity={glow} style={{ filter: `drop-shadow(0 0 ${8 + 10 * glow}px ${color})` }} />
        </>}
        {current > 0.01 && <path d={d} fill="none" stroke={K.white} strokeWidth={8} strokeDasharray={`16 ${per / 14 - 16}`}
          strokeDashoffset={-dir * 70} strokeLinecap="round" opacity={current} />}
      </g>
    );
  };

/** Campo magnético de la espira (rectángulos que laten hacia fuera). */
export const Field: React.FC<{ cx: number; cy: number; w: number; h: number; t: number; o?: number; color?: string; k?: number }> = ({ cx, cy, w, h, t, o = 1, color = K.cold, k = 1 }) => {
  if (o <= 0.01) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const p = (t * 0.7 + i / 3) % 1;
        const g = 20 + p * 110 * k;
        return <rect key={i} x={cx - w / 2 - g} y={cy - h / 2 - g} width={w + 2 * g} height={h + 2 * g} rx={30 + g} fill="none" stroke={color} strokeWidth={5} opacity={o * (1 - p) * 0.8} strokeDasharray="14 12" />;
      })}
    </g>
  );
};

/** Coche visto desde arriba, morro hacia arriba. Centro (cx, cy), 200×400 a escala s. */
export const CarTop: React.FC<{ cx: number; cy: number; s?: number; color?: string; o?: number }> = ({ cx, cy, s = 1, color = K.hot, o = 1 }) => (
  <g transform={`translate(${cx} ${cy}) scale(${s})`} opacity={o}>
    {[[-104, -130], [84, -130], [-104, 80], [84, 80]].map(([x, y], i) => <rect key={i} x={x} y={y} width={20} height={64} rx={8} fill={C.dark} />)}
    <rect x={-95} y={-200} width={190} height={400} rx={60} fill={color} stroke={C.dark} strokeOpacity={0.4} strokeWidth={5} />
    <path d="M -72 -95 Q 0 -125 72 -95 L 62 -40 Q 0 -55 -62 -40 Z" fill={C.dark} opacity={0.75} />
    <rect x={-66} y={-30} width={132} height={130} rx={18} fill="#000" opacity={0.18} />
    <path d="M -62 115 Q 0 128 62 115 L 70 150 Q 0 165 -70 150 Z" fill={C.dark} opacity={0.75} />
    <rect x={-80} y={-198} width={40} height={14} rx={6} fill="#fff7c2" />
    <rect x={40} y={-198} width={40} height={14} rx={6} fill="#fff7c2" />
  </g>
);

/** Coche de lado, mirando a la derecha. (cx, base) = centro abajo (suelo). ~380 px de largo a s=1. */
export const CarSide: React.FC<{ cx: number; base: number; s?: number; color?: string; t?: number; spin?: number }> = ({ cx, base, s = 1, color = K.hot, spin = 0 }) => (
  <g transform={`translate(${cx} ${base}) scale(${s})`}>
    <path d="M -190 -50 Q -192 -100 -150 -108 L -95 -112 L -50 -165 Q -35 -178 0 -178 L 70 -178 Q 100 -178 120 -150 L 150 -112 L 175 -106 Q 195 -100 192 -60 L 190 -40 Q 188 -30 175 -30 L -175 -30 Q -190 -30 -190 -50 Z"
      fill={color} stroke={C.dark} strokeOpacity={0.4} strokeWidth={5} />
    <path d="M -80 -112 L -42 -158 Q -32 -166 -10 -166 L 20 -166 L 20 -112 Z M 35 -112 L 35 -166 L 68 -166 Q 92 -166 106 -146 L 132 -112 Z" fill={C.dark} opacity={0.7} />
    {[-118, 118].map((x) => (
      <g key={x} transform={`translate(${x} -30) rotate(${spin})`}>
        <circle r={44} fill={C.dark} /><circle r={22} fill={C.case3} />
        <rect x={-4} y={-22} width={8} height={44} fill={C.case1} />
      </g>
    ))}
    <rect x={172} y={-96} width={18} height={14} rx={4} fill="#fff7c2" />
  </g>
);

/** Corte transversal del asfalto con la ranura y las vueltas de cable (círculos). open separa las dos mitades. */
export const RoadSection: React.FC<{ x0: number; x1: number; y: number; slots: number[]; open?: number; glow?: number; t: number; h?: number }> =
  ({ x0, x1, y, slots, open = 0, glow = 0, t, h = 130 }) => {
    const gap = 70 * open;
    return (
      <g>
        <rect x={x0} y={y} width={x1 - x0} height={h} fill="#141c29" />
        {slots.map((sx, i) => (
          <g key={i}>
            <rect x={sx - 18 - gap / 2} y={y - 4} width={36 + gap} height={70 + 30 * open} fill={C.groove} />
            {[0, 1, 2].map((k) => (
              <circle key={k} cx={sx} cy={y + 16 + k * 18 + 10 * open * k} r={8 + 3 * open} fill={K.flow}
                opacity={0.35 + 0.65 * glow} style={glow > 0.1 ? { filter: `drop-shadow(0 0 ${6 + 6 * Math.sin(t * 6 + k)}px ${K.flow})` } : {}} />
            ))}
          </g>
        ))}
        {/* capa de rodadura (asfalto), partida por las ranuras */}
        {[x0, ...slots].map((sx, i) => {
          const a = i === 0 ? x0 : sx + 18 + gap / 2;
          const b = i < slots.length ? slots[i] - 18 - gap / 2 : x1;
          return <rect key={i} x={a} y={y - 6 - 8 * open} width={Math.max(0, b - a)} height={46} fill={C.asph2} stroke={C.groove} strokeWidth={3} />;
        })}
      </g>
    );
  };

/** Caja del detector / armario del cruce. */
export const Box: React.FC<{ x: number; y: number; w?: number; h?: number; title?: string; led?: number; color?: string; children?: React.ReactNode }> =
  ({ x, y, w = 240, h = 180, title, led = 0, color = K.flow, children }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={22} fill={C.case1} stroke={C.case3} strokeWidth={6} />
      <circle cx={w / 2 - 26} cy={-h / 2 + 26} r={11} fill={led > 0.05 ? color : "#38475c"} style={led > 0.05 ? { filter: `drop-shadow(0 0 ${12 * led}px ${color})` } : {}} />
      {title && <text x={0} y={h / 2 - 22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.case3}>{title}</text>}
      {children}
    </g>
  );

/** Pantalla con onda senoidal: freq = ciclos visibles; shift desplaza la fase con el tiempo. */
export const Scope: React.FC<{ x: number; y: number; w: number; h: number; t: number; freq: number; amp?: number; color?: string; o?: number }> =
  ({ x, y, w, h, t, freq, amp = 0.38, color = K.flow, o = 1 }) => {
    const n = 120;
    const pts = Array.from({ length: n + 1 }, (_, i) => {
      const u = i / n;
      return `${x - w / 2 + u * w},${y - Math.sin(u * freq * 2 * Math.PI - t * 6) * amp * h}`;
    }).join(" ");
    return (
      <g opacity={o}>
        <rect x={x - w / 2 - 14} y={y - h / 2 - 14} width={w + 28} height={h + 28} rx={18} fill={C.dark} stroke={C.case2} strokeWidth={5} />
        <line x1={x - w / 2} y1={y} x2={x + w / 2} y2={y} stroke={C.case2} strokeWidth={2} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </g>
    );
  };

/** Chip/cerebro del controlador. */
export const Brain: React.FC<{ x: number; y: number; s?: number; t: number; glow?: number }> = ({ x, y, s = 1, t, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-45, -15, 15, 45].map((k) => <g key={k}>
      <rect x={k - 6} y={-100} width={12} height={22} fill={C.case3} /><rect x={k - 6} y={78} width={12} height={22} fill={C.case3} />
      <rect x={-100} y={k - 6} width={22} height={12} fill={C.case3} /><rect x={78} y={k - 6} width={22} height={12} fill={C.case3} />
    </g>)}
    <rect x={-80} y={-80} width={160} height={160} rx={18} fill={C.dark} stroke={K.flow} strokeWidth={6}
      style={{ filter: `drop-shadow(0 0 ${6 + 18 * glow + 4 * Math.sin(t * 5)}px ${K.flow})` }} />
    <path d="M -40 -20 H 0 V 25 H 40 M -40 30 H -15 M 20 -35 V -10 H 40" stroke={K.flow} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.85} />
  </g>
);

/** Cámara en un brazo. */
export const Camera: React.FC<{ x: number; y: number; s?: number; t: number; o?: number; rec?: number }> = ({ x, y, s = 1, t, o = 1, rec = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d={`M -10 -10 L 160 120 L 280 120 L -10 -10 Z`} fill={K.cold} opacity={0.12 + 0.06 * Math.sin(t * 3)} transform="rotate(10)" />
    <rect x={-80} y={-40} width={140} height={80} rx={14} fill={C.case2} stroke={C.case3} strokeWidth={5} />
    <path d="M 60 -28 L 100 -40 L 100 40 L 60 28 Z" fill={C.case1} stroke={C.case3} strokeWidth={4} />
    <circle cx={-48} cy={-16} r={8} fill={rec > 0.5 ? K.warn : "#5a2630"} />
    <rect x={-20} y={40} width={16} height={40} fill={C.case1} />
  </g>
);

/** Radar: platillo con arcos que salen. */
export const Radar: React.FC<{ x: number; y: number; s?: number; t: number; o?: number }> = ({ x, y, s = 1, t, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    {[0, 1, 2].map((i) => {
      const p = (t * 0.8 + i / 3) % 1; const r = 60 + p * 130;
      return <path key={i} d={`M ${r * Math.cos(-0.6)} ${r * Math.sin(-0.6)} A ${r} ${r} 0 0 1 ${r * Math.cos(0.6)} ${r * Math.sin(0.6)}`} fill="none" stroke={K.cold} strokeWidth={6} opacity={1 - p} transform="rotate(30)" />;
    })}
    <rect x={-60} y={-55} width={90} height={110} rx={16} fill={C.case2} stroke={C.case3} strokeWidth={5} />
    {[-30, 0, 30].map((k) => <circle key={k} cx={-15} cy={k} r={9} fill={C.case1} />)}
  </g>
);

/** Reloj (ciclo de tiempo fijo). */
export const Clock: React.FC<{ x: number; y: number; s?: number; t: number; o?: number }> = ({ x, y, s = 1, t, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle r={80} fill={C.dark} stroke={K.flow} strokeWidth={8} />
    {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-3} y={-72} width={6} height={14} fill={C.case3} transform={`rotate(${i * 30})`} />)}
    <rect x={-4} y={-56} width={8} height={56} rx={4} fill={K.white} transform={`rotate(${t * 120})`} />
    <rect x={-5} y={-38} width={10} height={38} rx={5} fill={K.flow} transform={`rotate(${t * 10})`} />
    <circle r={8} fill={K.flow} />
  </g>
);

/** Bici vista desde arriba (morro arriba): dos ruedas finas y manillar. */
export const BikeTop: React.FC<{ cx: number; cy: number; s?: number; o?: number }> = ({ cx, cy, s = 1, o = 1 }) => (
  <g transform={`translate(${cx} ${cy}) scale(${s})`} opacity={o}>
    <rect x={-9} y={-170} width={18} height={110} rx={8} fill={C.dark} stroke={C.case3} strokeWidth={4} />
    <rect x={-9} y={60} width={18} height={110} rx={8} fill={C.dark} stroke={C.case3} strokeWidth={4} />
    <rect x={-5} y={-80} width={10} height={160} fill={K.cold} />
    <rect x={-60} y={-92} width={120} height={12} rx={6} fill={C.case3} />
    <ellipse cx={0} cy={20} rx={26} ry={40} fill={C.case2} />
    <circle cx={0} cy={-20} r={26} fill={K.white} opacity={0.9} />
  </g>
);

/** Moto de lado (simple). */
export const BikeSide: React.FC<{ cx: number; base: number; s?: number }> = ({ cx, base, s = 1 }) => (
  <g transform={`translate(${cx} ${base}) scale(${s})`}>
    {[-80, 80].map((x) => <g key={x}><circle cx={x} cy={-50} r={48} fill="none" stroke={C.dark} strokeWidth={14} /><circle cx={x} cy={-50} r={48} fill="none" stroke={C.case3} strokeWidth={4} /></g>)}
    <path d="M -80 -50 L -20 -110 L 50 -110 L 80 -50 M -20 -110 L 10 -50 L 50 -110 M 50 -110 L 40 -150 L 70 -150" fill="none" stroke={K.cold} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={-50} y={-125} width={60} height={14} rx={7} fill={C.dark} />
  </g>
);

/** Pulsador de peatones con pantalla. press 0→1 hunde el botón. */
export const PedButton: React.FC<{ x: number; y: number; s?: number; press?: number; lit?: number; text?: string; t: number }> = ({ x, y, s = 1, press = 0, lit = 0, text = "", t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-20} y={230} width={40} height={300} fill={C.case1} />
    <rect x={-150} y={-240} width={300} height={480} rx={36} fill={C.case2} stroke={C.case3} strokeWidth={6} />
    <rect x={-115} y={-205} width={230} height={120} rx={16} fill={C.dark} />
    <text x={0} y={-130} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={lit > 0.5 ? K.flow : "#4a5a70"}
      style={lit > 0.5 ? { filter: `drop-shadow(0 0 ${8 + 4 * Math.sin(t * 6)}px ${K.flow})` } : {}}>{text}</text>
    {/* peatón */}
    <g transform="translate(0 -30)" fill={K.white} opacity={0.85}>
      <circle cx={0} cy={-26} r={12} />
      <path d="M -6 -10 L 8 -10 L 14 22 L 24 46 L 14 50 L 2 26 L -10 50 L -20 46 L -8 20 Z" />
    </g>
    <g transform={`translate(0 110) scale(${1 - 0.12 * press})`}>
      <circle r={78} fill={C.case1} />
      <circle r={62} fill={press > 0.5 ? "#e8eef6" : C.case3} />
    </g>
  </g>
);

/** Mano (dedo índice) que apunta hacia la izquierda; pulsa al desplazarse. */
export const Finger: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={0} y={-18} width={120} height={36} rx={18} fill="#F2C9A0" />
    <rect x={90} y={-40} width={130} height={100} rx={40} fill="#F2C9A0" />
    <rect x={200} y={-50} width={80} height={120} rx={20} fill={K.cold} />
  </g>
);
