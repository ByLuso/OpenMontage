// Dibujos SVG del episodio «Cómo te cobra el peaje sin pararte (telepeaje)». Coordenadas absolutas de 1080×1920.
// Colores de código: cian = microondas que lanza el peaje (aire/radio), amarillo = el eco con tu número / lo importante,
// naranja = energía (el aparato «se despierta»), rojo = error / sin aparato / capa que bloquea, blanco = texto.
// Grises azulados para carcasas. Sin marcas: aparato, coche, pórtico y cámaras genéricos.
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F", inner: "#0B1A30", board: "#1E5A46",
  road: "#1A2B44", line: "#9FB3CC", glass: "#16304F", metal: "#4F6A8C", ok: "#3DDC84", snow: "#E8F1FA", mount: "#3A5A80" };

const glow = (c: string, r: number) => ({ filter: `drop-shadow(0 0 ${r}px ${c})` });

/** Número de ejemplo que «deletrea» el aparato (inventado). */
export const NUM = "4 0 7 2 9 1";
/** Bits de ejemplo para el eco modulado. */
export const BITS = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0];

/**
 * El aparatito del parabrisas, de frente. Centro (x,y); 600×300 a escala 1.
 * open: la tapa frontal se levanta y se ve la placa (antena plana, chip, pila de botón, zumbador).
 * wake: brillo naranja del chip (se despierta). beep: anillos del zumbador. hi: "antena" | "chip".
 */
export const Tag: React.FC<{ x: number; y: number; s?: number; t: number; open?: number; wake?: number; beep?: number; hi?: string; o?: number; rot?: number; cross?: number; lift?: number }> =
  ({ x, y, s = 1, t, open = 0, wake = 0, beep = 0, hi = "", o = 1, rot = 0, cross = 0, lift = -330 }) => (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
      {/* soporte adhesivo arriba */}
      <rect x={-170} y={-196} width={340} height={56} rx={16} fill={C.case3} stroke={C.ink} strokeWidth={6} />
      {/* carcasa de atrás */}
      <rect x={-300} y={-150} width={600} height={300} rx={46} fill={C.case1} stroke={C.ink} strokeWidth={6} />
      {/* placa */}
      <rect x={-268} y={-122} width={536} height={244} rx={22} fill={C.board} stroke={C.ink} strokeWidth={4} />
      <path d="M-120,0 L-40,0 M60,-10 L120,-60 M60,30 L150,60" stroke={K.flow} strokeOpacity={0.5} strokeWidth={4} fill="none" />
      {/* antena plana (parche) */}
      <g style={hi === "antena" ? glow(K.flow, 16) : undefined}>
        <rect x={-240} y={-84} width={130} height={130} rx={6} fill="#C9A23A" stroke={K.flow} strokeWidth={hi === "antena" ? 6 : 3} />
        <rect x={-182} y={46} width={14} height={50} fill="#C9A23A" />
      </g>
      {/* chip */}
      <g style={wake > 0.05 ? glow(K.hot, 18 * wake) : hi === "chip" ? glow(K.flow, 14) : undefined}>
        <rect x={-60} y={-50} width={110} height={100} rx={8} fill={K.ink} stroke={wake > 0.05 ? K.hot : C.case3} strokeWidth={4} />
        {[0, 1, 2, 3].map((k) => <g key={k}><rect x={-50 + k * 26} y={-62} width={9} height={12} fill={C.case3} /><rect x={-50 + k * 26} y={50} width={9} height={12} fill={C.case3} /></g>)}
        <circle cx={-5} cy={0} r={14} fill={K.hot} opacity={wake} />
      </g>
      {/* pila de botón */}
      <circle cx={170} cy={-30} r={62} fill="#B8C4D4" stroke={C.ink} strokeWidth={5} />
      <circle cx={170} cy={-30} r={44} fill="none" stroke="#8A97A8" strokeWidth={4} />
      {/* zumbador */}
      <circle cx={170} cy={82} r={28} fill={C.inner} stroke={C.case3} strokeWidth={4} />
      {/* tapa frontal: se levanta */}
      {open < 0.995 && (
        <g transform={`translate(0,${lift * open}) rotate(${-5 * open})`} opacity={1 - 0.2 * open}>
          <rect x={-300} y={-150} width={600} height={300} rx={46} fill={C.case2} stroke={C.ink} strokeWidth={6} />
          <rect x={-276} y={-130} width={552} height={40} rx={20} fill="#ffffff" opacity={0.08} />
          {/* rejilla del zumbador */}
          {[0, 1, 2].map((k) => <rect key={k} x={140} y={44 + k * 22} width={110} height={9} rx={4} fill={C.case1} />)}
          {/* led */}
          <circle cx={-220} cy={70} r={20} fill={beep > 0.1 ? C.ok : "#25543B"} stroke={C.ink} strokeWidth={4} style={beep > 0.1 ? glow(C.ok, 14) : undefined} />
        </g>
      )}
      {/* anillos del pitido */}
      {beep > 0.01 && [0, 1, 2].map((k) => {
        const p = ((t * 2.2 + k / 3) % 1);
        return <path key={k} d={`M${300 + 30 + p * 90},${-60 - p * 30} Q${350 + p * 130},0 ${300 + 30 + p * 90},${60 + p * 30}`} fill="none" stroke={K.white} strokeWidth={7} strokeLinecap="round" opacity={beep * (1 - p)} />;
      })}
      {cross > 0.01 && <path d="M-200,-110 L200,110 M200,-110 L-200,110" stroke={K.warn} strokeWidth={26} strokeLinecap="round" opacity={cross} />}
    </g>
  );

/** Ondas en abanico que salen de (x,y) hacia `dir` (grados, 0 = derecha, 90 = abajo). */
export const Waves: React.FC<{ x: number; y: number; dir: number; t: number; o?: number; color?: string; n?: number; r0?: number; step?: number; half?: number; speed?: number; dash?: string; w?: number }> =
  ({ x, y, dir, t, o = 1, color = K.cold, n = 4, r0 = 30, step = 70, half = 28, speed = 120, dash, w = 9 }) => o <= 0.01 ? null : (
    <g opacity={o}>
      {Array.from({ length: n }).map((_, k) => {
        const r = r0 + ((t * speed + k * step) % (n * step));
        const a0 = ((dir - half) * Math.PI) / 180, a1 = ((dir + half) * Math.PI) / 180;
        const fade = 1 - (r - r0) / (n * step);
        return <path key={k} d={`M${x + r * Math.cos(a0)},${y + r * Math.sin(a0)} A${r},${r} 0 0 1 ${x + r * Math.cos(a1)},${y + r * Math.sin(a1)}`}
          fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} opacity={clamp01(fade * 1.3)} style={glow(color, 6)} />;
      })}
    </g>
  );

/** Panel de antena (visto de lado o de frente). */
export const Antenna: React.FC<{ x: number; y: number; s?: number; o?: number; hot?: number }> = ({ x, y, s = 1, o = 1, hot = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={-70} y={-40} width={140} height={80} rx={12} fill={C.case3} stroke={C.ink} strokeWidth={5} style={hot > 0.05 ? glow(K.cold, 16 * hot) : undefined} />
    {[0, 1, 2].map((k) => <rect key={k} x={-50 + k * 36} y={-22} width={28} height={44} rx={4} fill={C.case1} />)}
  </g>
);

/** Pórtico: dos postes y viga. La antena cuelga en (ax, y+60). */
export const Gantry: React.FC<{ x0: number; x1: number; y: number; h: number; o?: number }> = ({ x0, x1, y, h, o = 1 }) => (
  <g opacity={o}>
    <rect x={x0 - 18} y={y} width={36} height={h} fill={C.metal} stroke={C.ink} strokeWidth={4} />
    <rect x={x1 - 18} y={y} width={36} height={h} fill={C.metal} stroke={C.ink} strokeWidth={4} />
    <rect x={x0 - 30} y={y - 20} width={x1 - x0 + 60} height={44} rx={8} fill={C.metal} stroke={C.ink} strokeWidth={4} />
    {Array.from({ length: Math.floor((x1 - x0) / 60) }).map((_, k) => <path key={k} d={`M${x0 + k * 60},${y - 16} L${x0 + k * 60 + 30},${y + 20} L${x0 + k * 60 + 60},${y - 16}`} stroke={C.case1} strokeWidth={4} fill="none" />)}
  </g>
);

/** Coche de lado mirando a la derecha. Ancho ≈ 440·s. El aparatito va en el parabrisas (tagX, tagY relativos). */
export const Car: React.FC<{ x: number; y: number; s?: number; t: number; color?: string; tag?: boolean; tagGlow?: number; tagColor?: string; boxy?: boolean; spin?: number; o?: number }> =
  ({ x, y, s = 1, t, color = K.hot, tag = true, tagGlow = 0, tagColor = K.flow, boxy = false, spin = 1, o = 1 }) => {
    const wa = (t * 360 * spin) % 360;
    const body = boxy
      ? "M-220,40 L-220,-20 L-150,-25 L-110,-95 L90,-95 L130,-25 L220,-15 L220,40 Z"
      : "M-220,40 L-222,-10 Q-210,-30 -160,-34 L-100,-92 Q-80,-104 -40,-104 L60,-104 Q95,-104 120,-80 L160,-36 Q214,-30 222,-6 L222,40 Z";
    const win = boxy ? "M-135,-30 L-102,-82 L80,-82 L112,-30 Z" : "M-140,-38 L-92,-86 Q-80,-92 -50,-92 L58,-92 Q86,-92 104,-72 L138,-38 Z";
    return (
      <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
        <path d={body} fill={color} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d={win} fill={C.glass} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <line x1={0} y1={-90} x2={0} y2={-34} stroke={C.ink} strokeWidth={6} />
        <rect x={190} y={-6} width={26} height={14} rx={4} fill={K.flow} />
        {tag && <rect x={boxy ? 86 : 92} y={boxy ? -76 : -84} width={22} height={16} rx={4} fill={tagColor} stroke={C.ink} strokeWidth={3} style={tagGlow > 0.05 ? glow(tagColor, 12 * tagGlow) : undefined} />}
        {[-140, 140].map((wx) => (
          <g key={wx} transform={`translate(${wx},42) rotate(${wa})`}>
            <circle r={44} fill="#1B2433" stroke={C.ink} strokeWidth={6} />
            <circle r={20} fill={C.case3} />
            <path d="M0,-20 L0,20 M-20,0 L20,0" stroke={C.ink} strokeWidth={5} />
          </g>
        ))}
      </g>
    );
  };

/** Barrera de lado: poste en (x,y), brazo hacia la derecha que sube con `up` (0-1). */
export const Barrier: React.FC<{ x: number; y: number; up: number; len?: number; o?: number }> = ({ x, y, up, len = 360, o = 1 }) => (
  <g opacity={o}>
    <rect x={x - 30} y={y - 40} width={60} height={160} rx={10} fill={C.case2} stroke={C.ink} strokeWidth={5} />
    <g transform={`translate(${x},${y - 10}) rotate(${-80 * up})`}>
      <rect x={0} y={-14} width={len} height={28} rx={14} fill={K.white} stroke={C.ink} strokeWidth={4} />
      {Array.from({ length: Math.floor(len / 70) }).map((_, k) => <rect key={k} x={30 + k * 70} y={-14} width={32} height={28} fill={K.warn} />)}
    </g>
    <circle cx={x} cy={y - 10} r={16} fill={C.case3} stroke={C.ink} strokeWidth={4} />
  </g>
);

/** Semáforo pequeño (rojo / verde). */
export const Light: React.FC<{ x: number; y: number; green: number; s?: number; o?: number }> = ({ x, y, green, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={-40} y={-90} width={80} height={180} rx={18} fill={C.inner} stroke={C.ink} strokeWidth={5} />
    <circle cx={0} cy={-42} r={28} fill={K.warn} opacity={0.25 + 0.75 * (1 - green)} style={green < 0.5 ? glow(K.warn, 14) : undefined} />
    <circle cx={0} cy={42} r={28} fill={C.ok} opacity={0.25 + 0.75 * green} style={green > 0.5 ? glow(C.ok, 14) : undefined} />
  </g>
);

/** Cámara de vigilancia con destello. */
export const Camera: React.FC<{ x: number; y: number; s?: number; flash?: number; o?: number; dir?: number }> = ({ x, y, s = 1, flash = 0, o = 1, dir = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s * dir},${s})`} opacity={o}>
    <rect x={-70} y={-36} width={130} height={72} rx={14} fill={C.case3} stroke={C.ink} strokeWidth={5} />
    <rect x={56} y={-26} width={30} height={52} rx={6} fill={C.case1} stroke={C.ink} strokeWidth={4} />
    <circle cx={86} cy={0} r={16} fill={K.ink} stroke={C.case1} strokeWidth={4} />
    {flash > 0.01 && <circle cx={92} cy={0} r={26 + 30 * flash} fill={K.white} opacity={0.75 * flash} style={glow(K.white, 20)} />}
  </g>
);

/** Matrícula genérica (inventada). */
export const Plate: React.FC<{ x: number; y: number; s?: number; text?: string; o?: number; hi?: number }> = ({ x, y, s = 1, text = "1234 BCD", o = 1, hi = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={-210} y={-55} width={420} height={110} rx={12} fill={K.white} stroke={hi > 0.5 ? K.flow : C.ink} strokeWidth={hi > 0.5 ? 9 : 6} style={hi > 0.5 ? glow(K.flow, 14) : undefined} />
    <rect x={-204} y={-49} width={46} height={98} rx={6} fill="#2A55B0" />
    <text x={24} y={24} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={70} fill={K.ink}>{text}</text>
  </g>
);

/** Ficha de cuenta: silueta neutra + número + estado. */
export const Account: React.FC<{ x: number; y: number; num: string; hi?: number; paid?: number; o?: number; w?: number }> = ({ x, y, num, hi = 0, paid = 0, o = 1, w = 560 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-w / 2} y={-50} width={w} height={100} rx={18} fill="rgba(6,16,31,0.85)" stroke={hi > 0.5 ? K.flow : C.case1} strokeWidth={hi > 0.5 ? 6 : 4} style={hi > 0.5 ? glow(K.flow, 10) : undefined} />
    <circle cx={-w / 2 + 52} cy={-12} r={16} fill={C.case3} />
    <path d={`M${-w / 2 + 26},34 Q${-w / 2 + 52},-2 ${-w / 2 + 78},34 Z`} fill={C.case3} />
    <text x={-w / 2 + 110} y={16} fontFamily="monospace" fontWeight={900} fontSize={44} fill={hi > 0.5 ? K.flow : K.white}>{num}</text>
    {paid > 0.01 && (
      <g opacity={paid} transform={`translate(${w / 2 - 50},0)`}>
        <circle r={30} fill={C.ok} />
        <path d="M-14,0 L-4,12 L16,-12" stroke={K.ink} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    )}
  </g>
);

/** Moneda (cobro). */
export const Coin: React.FC<{ x: number; y: number; r?: number; o?: number }> = ({ x, y, r = 46, o = 1 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill={K.flow} stroke={C.ink} strokeWidth={5} />
    <circle cx={x} cy={y} r={r * 0.72} fill="none" stroke="#C9A23A" strokeWidth={5} />
  </g>
);

/** Flecha simple. */
export const Arrow: React.FC<{ x0: number; y0: number; x1: number; y1: number; color?: string; o?: number; w?: number }> = ({ x0, y0, x1, y1, color = K.white, o = 1, w = 10 }) => {
  if (o <= 0.01) return null;
  const a = Math.atan2(y1 - y0, x1 - x0), h = 26;
  return (
    <g opacity={o}>
      <line x1={x0} y1={y0} x2={x1 - Math.cos(a) * h * 0.6} y2={y1 - Math.sin(a) * h * 0.6} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${x1},${y1} L${x1 - h * Math.cos(a - 0.5)},${y1 - h * Math.sin(a - 0.5)} L${x1 - h * Math.cos(a + 0.5)},${y1 - h * Math.sin(a + 0.5)} Z`} fill={color} />
    </g>
  );
};

/** Espejito que brilla (metáfora del eco). */
export const Mirror: React.FC<{ x: number; y: number; s?: number; flash?: number; o?: number }> = ({ x, y, s = 1, flash = 0, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={70} ry={90} fill={C.case3} stroke={C.ink} strokeWidth={6} />
    <ellipse cx={0} cy={0} rx={54} ry={74} fill="#CFE6F7" />
    <path d="M-28,-40 L10,-62 M-34,-12 L26,-48" stroke={K.white} strokeWidth={8} strokeLinecap="round" />
    <rect x={-12} y={88} width={24} height={60} rx={8} fill={C.case3} stroke={C.ink} strokeWidth={5} />
    {flash > 0.01 && <circle cx={0} cy={0} r={100} fill={K.flow} opacity={0.35 * flash} style={glow(K.flow, 20)} />}
  </g>
);

/** Parabrisas visto desde dentro con capa metálica (rayado) y la «mirilla» de puntos junto al retrovisor. */
export const Windshield: React.FC<{ x: number; y: number; coat?: number; o?: number }> = ({ x, y, coat = 1, o = 1 }) => {
  const W = 860, H = 440;
  const pts = `${x - W / 2 + 70},${y - H / 2} ${x + W / 2 - 70},${y - H / 2} ${x + W / 2},${y + H / 2} ${x - W / 2},${y + H / 2}`;
  return (
    <g opacity={o}>
      <defs>
        <pattern id="coatP" width={22} height={22} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={22} height={22} fill="#1F3A5E" />
          <line x1={0} y1={0} x2={0} y2={22} stroke="#5D7FA8" strokeWidth={8} />
        </pattern>
        <clipPath id="wsClip"><polygon points={pts} /></clipPath>
      </defs>
      <polygon points={pts} fill={C.glass} />
      <g clipPath="url(#wsClip)" opacity={coat}>
        <rect x={x - W / 2} y={y - H / 2} width={W} height={H} fill="url(#coatP)" />
        {/* zona sin capa junto al retrovisor */}
        <rect x={x - 110} y={y - H / 2} width={220} height={150} fill={C.glass} />
        {Array.from({ length: 5 }).map((_, i) => Array.from({ length: 11 }).map((__, j) => (
          <circle key={`${i}-${j}`} cx={x - 100 + j * 20} cy={y - H / 2 + 158 + i * 14} r={4.5 - i * 0.7} fill={K.ink} />
        )))}
      </g>
      <polygon points={pts} fill="none" stroke={K.ink} strokeWidth={16} strokeLinejoin="round" />
      {/* retrovisor */}
      <rect x={x - 12} y={y - H / 2} width={24} height={70} fill={C.case1} />
      <rect x={x - 110} y={y - H / 2 + 60} width={220} height={64} rx={26} fill={C.case1} stroke={K.ink} strokeWidth={5} />
    </g>
  );
};

/** Montañas nevadas (fiordo) para Noruega. */
export const Mountains: React.FC<{ y: number; o?: number }> = ({ y, o = 1 }) => (
  <g opacity={o}>
    <path d={`M60,${y} L260,${y - 260} L420,${y - 80} L560,${y - 330} L760,${y - 60} L880,${y - 220} L1020,${y} Z`} fill={C.mount} />
    <path d={`M218,${y - 200} L260,${y - 260} L300,${y - 200} L278,${y - 210} L260,${y - 190} Z M510,${y - 260} L560,${y - 330} L610,${y - 258} L585,${y - 268} L560,${y - 245} L538,${y - 268} Z M848,${y - 176} L880,${y - 220} L912,${y - 176} L880,${y - 186} Z`} fill={C.snow} />
  </g>
);

/** Carretera vista de lado (franja con líneas que se desplazan). */
export const Road: React.FC<{ y: number; t: number; speed?: number; x0?: number; x1?: number; o?: number }> = ({ y, t, speed = 200, x0 = 40, x1 = 1040, o = 1 }) => (
  <g opacity={o}>
    <rect x={x0} y={y} width={x1 - x0} height={70} fill={C.road} />
    {Array.from({ length: 14 }).map((_, k) => {
      const xx = x0 + ((k * 90 - t * speed) % 1260 + 1260) % 1260 - 90;
      return xx > x0 - 60 && xx < x1 ? <rect key={k} x={Math.max(x0, xx)} y={y + 30} width={Math.min(50, x1 - Math.max(x0, xx))} height={10} fill={C.line} opacity={0.6} /> : null;
    })}
  </g>
);
