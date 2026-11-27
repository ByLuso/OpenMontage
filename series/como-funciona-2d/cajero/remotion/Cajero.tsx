// Dibujos SVG del episodio «cómo sabe el cajero cuántos billetes darte (y que no van pegados)». Todos son <g> para meter en un <svg 1080×1920>.
// Cajero, tarjeta, banco y billetes GENÉRICOS (sin marcas ni diseño real). Nada de detalles de seguridad: solo el recorrido del billete.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = {
  case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#06101F", go: "#2EE59D",
  paper: "#B9D3C2", paperHi: "#E4EFE6", print: "#4F8574", rubber: "#2A2F3A", rubberHi: "#4A5262", screen: "#0B2A4A",
};
export const FONTF = "MontserratSerie";

const T = (x: number, y: number, s = 1, r = 0) => `translate(${x} ${y}) rotate(${r}) scale(${s})`;

/** Billete genérico de frente, centrado en (x, y). */
export const Note: React.FC<{ x: number; y: number; w?: number; h?: number; rot?: number; val?: string; tint?: string; o?: number; warn?: number }> =
  ({ x, y, w = 260, h = 130, rot = 0, val = "20", tint = C.paper, o = 1, warn = 0 }) => (
    <g transform={T(x, y, 1, rot)} opacity={o}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill={tint} stroke={warn > 0.05 ? K.warn : C.dark} strokeWidth={warn > 0.05 ? 6 : 3} />
      <rect x={-w / 2 + 10} y={-h / 2 + 10} width={w - 20} height={h - 20} rx={6} fill="none" stroke={C.print} strokeWidth={3} opacity={0.5} />
      <circle cx={-w * 0.22} cy={0} r={h * 0.26} fill="none" stroke={C.print} strokeWidth={4} opacity={0.55} />
      <text x={w * 0.2} y={h * 0.16} textAnchor="middle" fontFamily={FONTF} fontWeight={900} fontSize={h * 0.46} fill={C.print}>{val}</text>
    </g>
  );

/** Billete visto de canto (tira fina) para el recorrido interior. */
export const Edge: React.FC<{ x: number; y: number; w?: number; th?: number; rot?: number; color?: string; o?: number }> = ({ x, y, w = 200, th = 12, rot = 0, color = C.paper, o = 1 }) => (
  <g transform={T(x, y, 1, rot)} opacity={o}>
    <rect x={-w / 2} y={-th / 2} width={w} height={th} rx={3} fill={color} stroke={C.dark} strokeWidth={2} />
  </g>
);

/** Rueda de goma (gira con `ang` grados). */
export const Wheel: React.FC<{ x: number; y: number; r?: number; ang: number; glow?: number; o?: number; hub?: string }> = ({ x, y, r = 60, ang, glow = 0, o = 1, hub = C.case3 }) => (
  <g transform={T(x, y, 1, ang)} opacity={o}>
    <circle r={r} fill={C.rubber} stroke={glow > 0.05 ? K.flow : C.rubberHi} strokeWidth={8} style={glow > 0.05 ? { filter: `drop-shadow(0 0 ${12 * glow}px ${K.flow})` } : {}} />
    {Array.from({ length: 12 }).map((_, k) => (
      <rect key={k} x={-5} y={-r - 2} width={10} height={14} rx={3} fill={C.rubberHi} transform={`rotate(${k * 30})`} />
    ))}
    <circle r={r * 0.42} fill={C.case2} />
    {[0, 120, 240].map((a) => <rect key={a} x={-5} y={-r * 0.4} width={10} height={r * 0.4} fill={C.case1} transform={`rotate(${a})`} />)}
    <circle r={r * 0.16} fill={hub} />
  </g>
);

/** Frontal del cajero, centrado en (x, y). open 0→1: la carcasa se parte en dos y deja ver el interior (children). */
export const Atm: React.FC<{ x: number; y: number; s?: number; t: number; open?: number; cash?: number; screenText?: string; spin?: number; children?: React.ReactNode; cardIn?: number; screenColor?: string }> =
  ({ x, y, s = 1, t, open = 0, cash = 0, screenText = "", spin = 0, children, cardIn = 0, screenColor = K.cold }) => {
    const W = 600, H = 760, gap = 190 * open;
    const half = (side: -1 | 1) => (
      <g transform={`translate(${side * gap} 0)`}>
        <g clipPath={`url(#atm-${side < 0 ? "l" : "r"})`}>
          <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={34} fill={C.case2} stroke={C.case3} strokeWidth={6} />
          <rect x={-W / 2 + 20} y={-H / 2 + 20} width={W - 40} height={70} rx={16} fill={C.case1} />
          <rect x={-W / 2 + 60} y={-H / 2 + 40} width={W - 120} height={30} rx={8} fill={C.case3} opacity={0.35} />
          {/* pantalla */}
          <rect x={-210} y={-H / 2 + 120} width={420} height={250} rx={18} fill={C.dark} stroke={C.case1} strokeWidth={10} />
          <rect x={-190} y={-H / 2 + 140} width={380} height={210} rx={10} fill={C.screen} />
          {screenText && <text x={0} y={-H / 2 + 255} textAnchor="middle" fontFamily={FONTF} fontWeight={900} fontSize={46} fill={screenColor}>{screenText}</text>}
          {spin > 0.01 && (
            <g transform={`translate(0 ${-H / 2 + 245})`} opacity={spin}>
              {Array.from({ length: 8 }).map((_, k) => (
                <circle key={k} cx={46 * Math.cos(k * Math.PI / 4 + t * 5)} cy={46 * Math.sin(k * Math.PI / 4 + t * 5)} r={6 + k * 1.2} fill={K.cold} opacity={0.3 + k * 0.09} />
              ))}
            </g>
          )}
          {/* teclado */}
          {Array.from({ length: 12 }).map((_, k) => (
            <rect key={k} x={-200 + (k % 3) * 68} y={30 + Math.floor(k / 3) * 54} width={56} height={42} rx={8} fill={C.case3} stroke={C.case1} strokeWidth={3} />
          ))}
          {/* ranura de la tarjeta */}
          <rect x={60} y={40} width={160} height={70} rx={12} fill={C.case1} />
          <rect x={80} y={68} width={120} height={14} rx={7} fill={C.dark} />
          {/* boca de los billetes */}
          <rect x={-200} y={260} width={400} height={70} rx={14} fill={C.case1} />
          <rect x={-170} y={285} width={340} height={20} rx={8} fill={C.dark} />
        </g>
      </g>
    );
    return (
      <g transform={T(x, y, s)}>
        <defs>
          <clipPath id="atm-l"><path d={`M ${-W} ${-H} L 10 ${-H} L -20 -60 L 15 120 L -10 ${H} L ${-W} ${H} Z`} /></clipPath>
          <clipPath id="atm-r"><path d={`M 10 ${-H} L ${W} ${-H} L ${W} ${H} L -10 ${H} L 15 120 L -20 -60 Z`} /></clipPath>
        </defs>
        {open > 0.01 && (
          <g opacity={Math.min(1, open * 1.5)}>
            <rect x={-W / 2 + 10} y={-H / 2 + 10} width={W - 20} height={H - 20} rx={30} fill="#0A1A30" stroke={C.case1} strokeWidth={6} />
            {children}
          </g>
        )}
        {half(-1)}{half(1)}
        {/* tarjeta entrando */}
        {cardIn > 0.01 && (
          <g transform={`translate(140 ${75 - 120 * (1 - cardIn)})`}>
            <rect x={-50} y={-90} width={100} height={92} rx={8} fill={K.cold} stroke={C.dark} strokeWidth={3} />
            <rect x={-20} y={-70} width={34} height={26} rx={5} fill={K.flow} />
          </g>
        )}
        {/* billetes asomando por la boca */}
        {cash > 0.01 && (
          <g>
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={-150 + k * 4} y={295 - 80 * cash + k * 4} width={300} height={80 * cash} rx={6} fill={k % 2 ? C.paperHi : C.paper} stroke={C.dark} strokeWidth={2} />
            ))}
            <rect x={-200} y={295} width={400} height={40} rx={10} fill={C.case1} />
          </g>
        )}
      </g>
    );
  };

/** Tarjeta genérica con chip. */
export const Card: React.FC<{ x: number; y: number; s?: number; rot?: number; chip?: number; o?: number }> = ({ x, y, s = 1, rot = 0, chip = 0, o = 1 }) => (
  <g transform={T(x, y, s, rot)} opacity={o}>
    <defs>
      <linearGradient id="cardg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3E6AA0" /><stop offset="1" stopColor="#1C3558" /></linearGradient>
    </defs>
    <rect x={-170} y={-107} width={340} height={214} rx={22} fill="url(#cardg)" stroke={C.case3} strokeWidth={4} />
    <path d="M -170 40 Q 0 -10 170 30" fill="none" stroke={K.cold} strokeWidth={6} opacity={0.35} />
    <g transform="translate(-95 -20)" style={chip > 0.05 ? { filter: `drop-shadow(0 0 ${16 * chip}px ${K.flow})` } : {}}>
      <rect x={-38} y={-30} width={76} height={60} rx={10} fill={K.flow} stroke="#B8901A" strokeWidth={3} />
      <path d="M -38 -8 H -12 V -30 M 38 -8 H 12 V -30 M -38 10 H -12 V 30 M 38 10 H 12 V 30 M -12 -8 H 12 V 10 H -12 Z" fill="none" stroke="#B8901A" strokeWidth={3} />
    </g>
    {[0, 1, 2, 3].map((k) => <rect key={k} x={-120 + k * 66} y={52} width={52} height={14} rx={7} fill={C.case3} opacity={0.6} />)}
  </g>
);

/** Teclado con pantallita de puntos del PIN (n puntos encendidos de `slots`). */
export const Keypad: React.FC<{ x: number; y: number; s?: number; n: number; slots?: number; press?: number; o?: number }> = ({ x, y, s = 1, n, slots = 4, press = -1, o = 1 }) => (
  <g transform={T(x, y, s)} opacity={o}>
    <rect x={-150} y={-210} width={300} height={420} rx={26} fill={C.case2} stroke={C.case3} strokeWidth={5} />
    <rect x={-120} y={-186} width={240} height={70} rx={12} fill={C.dark} />
    {Array.from({ length: slots }).map((_, k) => (
      <circle key={k} cx={-((slots - 1) * 44) / 2 + k * 44} cy={-151} r={13} fill={k < n ? K.flow : "#33435c"} style={k < n ? { filter: `drop-shadow(0 0 6px ${K.flow})` } : {}} />
    ))}
    {Array.from({ length: 12 }).map((_, k) => (
      <g key={k}>
        <rect x={-110 + (k % 3) * 78} y={-92 + Math.floor(k / 3) * 74} width={64} height={58} rx={10} fill={k === press ? K.flow : C.case3} stroke={C.case1} strokeWidth={3} />
        <text x={-78 + (k % 3) * 78} y={-50 + Math.floor(k / 3) * 74} textAnchor="middle" fontFamily={FONTF} fontWeight={900} fontSize={30} fill={C.dark}>{["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"][k]}</text>
      </g>
    ))}
  </g>
);

/** Banco genérico (edificio con columnas). */
export const Bank: React.FC<{ x: number; y: number; s?: number; o?: number; glow?: number }> = ({ x, y, s = 1, o = 1, glow = 0 }) => (
  <g transform={T(x, y, s)} opacity={o} style={glow > 0.05 ? { filter: `drop-shadow(0 0 ${14 * glow}px ${C.go})` } : {}}>
    <path d="M -150 -60 L 0 -150 L 150 -60 Z" fill={C.case3} stroke={C.case1} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-140} y={-60} width={280} height={24} fill={C.case3} />
    {[-105, -35, 35, 105].map((cx) => <rect key={cx} x={cx - 16} y={-36} width={32} height={140} fill={C.case2} stroke={C.case1} strokeWidth={4} />)}
    <rect x={-160} y={104} width={320} height={30} rx={6} fill={C.case3} />
    <circle cx={0} cy={-92} r={22} fill={C.case2} />
  </g>
);

/** Línea de red con paquetes que viajan de (x1,y1) a (x2,y2); back: paquetes de vuelta en verde. */
export const Net: React.FC<{ x1: number; y1: number; x2: number; y2: number; t: number; o: number; go?: number; back?: number; color?: string }> = ({ x1, y1, x2, y2, t, o, go = 1, back = 0, color = K.cold }) => o <= 0.01 ? null : (
  <g opacity={o}>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={5} strokeDasharray="4 16" strokeLinecap="round" opacity={0.6} />
    {go > 0.01 && [0, 1, 2].map((k) => { const p = (t * 0.8 + k / 3) % 1; return <circle key={k} cx={x1 + (x2 - x1) * p} cy={y1 + (y2 - y1) * p} r={12} fill={color} opacity={go} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />; })}
    {back > 0.01 && [0, 1].map((k) => { const p = (t * 0.8 + k / 2) % 1; return <circle key={k} cx={x2 + (x1 - x2) * p} cy={y2 + (y1 - y2) * p + 18} r={12} fill={C.go} opacity={back} style={{ filter: `drop-shadow(0 0 8px ${C.go})` }} />; })}
  </g>
);

/** Cajetín (casete) visto de lado con su montón de billetes y su valor. */
export const Cassette: React.FC<{ x: number; y: number; w?: number; h?: number; val: string; tint?: string; level?: number; o?: number; hi?: number }> =
  ({ x, y, w = 240, h = 300, val, tint = C.paper, level = 0.8, o = 1, hi = 0 }) => {
    const n = Math.round(18 * level);
    return (
      <g transform={T(x, y)} opacity={o}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill={C.case1} stroke={hi > 0.05 ? K.flow : C.case3} strokeWidth={6} style={hi > 0.05 ? { filter: `drop-shadow(0 0 ${12 * hi}px ${K.flow})` } : {}} />
        {Array.from({ length: n }).map((_, k) => (
          <rect key={k} x={-w / 2 + 20} y={h / 2 - 28 - k * 11} width={w - 40} height={9} rx={2} fill={k % 2 ? tint : C.paperHi} />
        ))}
        <rect x={-w / 2 + 30} y={-h / 2 - 40} width={w - 60} height={56} rx={12} fill={C.dark} stroke={tint} strokeWidth={4} />
        <text x={0} y={-h / 2 + 2} textAnchor="middle" fontFamily={FONTF} fontWeight={900} fontSize={40} fill={tint}>{val}</text>
      </g>
    );
  };

/** Sensor de paso: emisor arriba, receptor abajo, haz de luz (beam) y rodillos de grosor. */
export const Sensor: React.FC<{ x: number; y: number; t: number; beam?: number; warn?: number; o?: number; gapY?: number }> = ({ x, y, t, beam = 0, warn = 0, o = 1, gapY = 120 }) => {
  const col = warn > 0.5 ? K.warn : K.flow;
  return (
    <g transform={T(x, y)} opacity={o}>
      {beam > 0.01 && <rect x={-22} y={-gapY + 30} width={44} height={2 * gapY - 60} fill={col} opacity={0.35 * beam + 0.1 * beam * Math.sin(t * 12)} style={{ filter: `drop-shadow(0 0 16px ${col})` }} />}
      <rect x={-60} y={-gapY - 40} width={120} height={70} rx={14} fill={C.case2} stroke={C.case3} strokeWidth={5} />
      <circle cx={0} cy={-gapY + 14} r={14} fill={beam > 0.05 ? col : "#33435c"} />
      <rect x={-60} y={gapY - 30} width={120} height={70} rx={14} fill={C.case2} stroke={C.case3} strokeWidth={5} />
      <rect x={-18} y={gapY - 30} width={36} height={14} rx={4} fill={beam > 0.05 ? col : "#33435c"} />
    </g>
  );
};

/** Medidor de grosor horizontal (val 0→2 = uno → dos billetes). */
export const ThickBar: React.FC<{ x: number; y: number; w?: number; val: number; o?: number }> = ({ x, y, w = 420, val, o = 1 }) => {
  const k = Math.max(0, Math.min(2, val)) / 2;
  const col = val > 1.5 ? K.warn : val > 0.3 ? K.cold : C.case3;
  return (
    <g transform={T(x, y)} opacity={o}>
      <rect x={-w / 2} y={-22} width={w} height={44} rx={22} fill="rgba(6,16,31,0.85)" stroke={C.case3} strokeWidth={4} />
      <rect x={-w / 2 + 6} y={-16} width={(w - 12) * k} height={32} rx={16} fill={col} style={{ filter: `drop-shadow(0 0 8px ${col})` }} />
      <line x1={0} y1={-34} x2={0} y2={34} stroke={K.white} strokeWidth={4} strokeDasharray="6 6" />
      <line x1={w / 2 - 6} y1={-34} x2={w / 2 - 6} y2={34} stroke={K.warn} strokeWidth={4} strokeDasharray="6 6" />
    </g>
  );
};

/** Cajetín de rechazo (rojo). */
export const RejectBin: React.FC<{ x: number; y: number; w?: number; h?: number; o?: number; fill?: number; glow?: number }> = ({ x, y, w = 220, h = 180, o = 1, fill = 0, glow = 0 }) => (
  <g transform={T(x, y)} opacity={o}>
    <path d={`M ${-w / 2} ${-h / 2} L ${-w / 2 + 16} ${h / 2} L ${w / 2 - 16} ${h / 2} L ${w / 2} ${-h / 2}`} fill={C.case1} stroke={K.warn} strokeWidth={7} strokeLinejoin="round"
      style={glow > 0.05 ? { filter: `drop-shadow(0 0 ${14 * glow}px ${K.warn})` } : {}} />
    {Array.from({ length: Math.round(fill * 6) }).map((_, k) => (
      <rect key={k} x={-w / 2 + 30} y={h / 2 - 22 - k * 13} width={w - 60} height={10} rx={2} fill={C.paper} transform={`rotate(${(k % 2 ? 4 : -5)} 0 ${h / 2 - 20 - k * 13})`} />
    ))}
  </g>
);

/** Compuerta basculante (ang 0 = recto, >0 = desvía hacia abajo). */
export const Gate: React.FC<{ x: number; y: number; ang: number; warn?: number }> = ({ x, y, ang, warn = 0 }) => (
  <g transform={T(x, y, 1, ang)}>
    <path d="M 0 -14 L 120 -6 L 120 6 L 0 14 Z" fill={warn > 0.5 ? K.warn : C.case3} stroke={C.dark} strokeWidth={3} />
    <circle r={16} fill={C.case2} stroke={C.dark} strokeWidth={3} />
  </g>
);

/** Rueda apiladora con palas curvas. */
export const Stacker: React.FC<{ x: number; y: number; r?: number; ang: number; o?: number }> = ({ x, y, r = 120, ang, o = 1 }) => (
  <g transform={T(x, y, 1, ang)} opacity={o}>
    <circle r={r * 0.34} fill={C.case2} stroke={C.case3} strokeWidth={5} />
    {Array.from({ length: 8 }).map((_, k) => (
      <path key={k} d={`M ${r * 0.3} 0 Q ${r * 0.75} ${-r * 0.1} ${r} ${-r * 0.42}`} fill="none" stroke={C.case3} strokeWidth={12} strokeLinecap="round" transform={`rotate(${k * 45})`} />
    ))}
    <circle r={r * 0.12} fill={C.case1} />
  </g>
);

/** Correa entre dos poleas con marcas que se mueven. */
export const Belt: React.FC<{ x1: number; y1: number; x2: number; y2: number; t: number; o?: number; speed?: number }> = ({ x1, y1, x2, y2, t, o = 1, speed = 1 }) => {
  const L = Math.hypot(x2 - x1, y2 - y1), a = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g transform={`translate(${x1} ${y1}) rotate(${a})`} opacity={o}>
      <rect x={-26} y={-26} width={L + 52} height={52} rx={26} fill="none" stroke={C.rubberHi} strokeWidth={12} />
      <rect x={-26} y={-26} width={L + 52} height={52} rx={26} fill="none" stroke={C.case3} strokeWidth={4} strokeDasharray="14 22" strokeDashoffset={-t * 120 * speed} />
      <circle cx={0} cy={0} r={18} fill={C.case2} stroke={C.case3} strokeWidth={4} />
      <circle cx={L} cy={0} r={18} fill={C.case2} stroke={C.case3} strokeWidth={4} />
    </g>
  );
};

/** Check verde. */
export const Check: React.FC<{ x: number; y: number; s?: number; o: number }> = ({ x, y, s = 1, o }) => o <= 0.01 ? null : (
  <path d={`M ${x - 34 * s} ${y} L ${x - 8 * s} ${y + 28 * s} L ${x + 40 * s} ${y - 30 * s}`} fill="none" stroke={C.go} strokeWidth={12 * s} strokeLinecap="round" strokeLinejoin="round"
    opacity={o} style={{ filter: `drop-shadow(0 0 8px ${C.go})` }} />
);
/** Cruz roja. */
export const Cross: React.FC<{ x: number; y: number; s?: number; o: number }> = ({ x, y, s = 1, o }) => o <= 0.01 ? null : (
  <g opacity={o} stroke={K.warn} strokeWidth={12 * s} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${K.warn})` }}>
    <line x1={x - 30 * s} y1={y - 30 * s} x2={x + 30 * s} y2={y + 30 * s} /><line x1={x + 30 * s} y1={y - 30 * s} x2={x - 30 * s} y2={y + 30 * s} />
  </g>
);

/** Anillo de cuenta atrás (p 0→1 consumido). */
export const Timer: React.FC<{ x: number; y: number; r?: number; p: number; o?: number }> = ({ x, y, r = 70, p, o = 1 }) => {
  const c = 2 * Math.PI * r, col = p > 0.75 ? K.warn : K.flow;
  return (
    <g transform={T(x, y)} opacity={o}>
      <circle r={r + 14} fill="rgba(6,16,31,0.85)" />
      <circle r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={14} />
      <circle r={r} fill="none" stroke={col} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${c * (1 - p)} ${c}`} transform="rotate(-90)" style={{ filter: `drop-shadow(0 0 8px ${col})` }} />
      <line x1={0} y1={0} x2={0} y2={-r * 0.6} stroke={K.white} strokeWidth={8} strokeLinecap="round" transform={`rotate(${p * 360})`} />
      <circle r={9} fill={K.white} />
    </g>
  );
};

/** Silueta neutra de persona (busto) con bocadillo de pensamiento opcional. */
export const Person: React.FC<{ x: number; y: number; s?: number; o?: number; color?: string }> = ({ x, y, s = 1, o = 1, color = C.case3 }) => (
  <g transform={T(x, y, s)} opacity={o}>
    <circle cx={0} cy={-90} r={62} fill={color} />
    <path d="M -110 90 Q -110 -10 0 -12 Q 110 -10 110 90 Z" fill={color} />
  </g>
);

/** Cajero antiguo (1967) simplificado: caja de pared con cajón. */
export const OldAtm: React.FC<{ x: number; y: number; s?: number; t: number; o?: number; drawer?: number }> = ({ x, y, s = 1, t, o = 1, drawer = 0 }) => (
  <g transform={T(x, y, s)} opacity={o}>
    <rect x={-260} y={-200} width={520} height={400} rx={18} fill="#6B5B45" stroke="#A8916E" strokeWidth={6} />
    <rect x={-230} y={-170} width={460} height={60} rx={8} fill="#3E3427" />
    {[0, 1, 2].map((k) => <circle key={k} cx={-150 + k * 70} cy={-40} r={18} fill="#A8916E" />)}
    <rect x={40} y={-70} width={150} height={60} rx={8} fill="#3E3427" />
    <rect x={-180} y={60 + 50 * drawer} width={360} height={90} rx={10} fill="#8A7658" stroke="#3E3427" strokeWidth={5} />
    <rect x={-50} y={95 + 50 * drawer} width={100} height={16} rx={8} fill="#3E3427" />
    {drawer > 0.1 && <rect x={-120} y={50 + 50 * drawer - 20 * Math.abs(Math.sin(t * 2))} width={240} height={26} rx={4} fill={C.paper} stroke={C.dark} strokeWidth={2} opacity={drawer} />}
  </g>
);
