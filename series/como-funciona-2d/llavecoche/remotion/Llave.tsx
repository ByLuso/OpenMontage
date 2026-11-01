// Dibujos SVG del episodio «la llave sin llave (keyless)». Todos son <g> para meter dentro de un <svg 1080×1920>.
import React from "react";
import { K, FONT } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", pcb: "#123156", dark: "#06101F", metal: "#C9D3E0", skin: "#F3C9A0" };

/** Llave keyless (llavero). open 0→1: la tapa se desliza a la izquierda y deja ver la placa (bobina, chip, antena, pila).
 *  blade 0→1 saca la llave de metal por abajo. hi: resalta "coil" | "chip" | "cell" | "ant". */
export const SmartKey: React.FC<{ cx: number; cy: number; s?: number; open?: number; blade?: number; t: number; led?: number; chipGlow?: number; coilGlow?: number; antGlow?: number; cellLevel?: number; rot?: number; o?: number }> =
  ({ cx, cy, s = 1, open = 0, blade = 0, t, led = 0, chipGlow = 0, coilGlow = 0, antGlow = 0, cellLevel = 1, rot = 0, o = 1 }) => {
    const W = 260, H = 420;
    const shift = 0.47 * W * open; // el conjunto se corre a la derecha para que la tapa no se salga
    const shell = (
      <>
        <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={110} fill={C.case2} stroke={C.case3} strokeWidth={6} />
        <rect x={-W / 2 + 22} y={-H / 2 + 22} width={W - 44} height={H - 44} rx={92} fill="none" stroke={C.case1} strokeWidth={4} opacity={0.6} />
        {/* botones: cerrar / abrir */}
        {[-70, 40].map((y, i) => (
          <g key={y} transform={`translate(0 ${y})`}>
            <circle r={52} fill={C.case1} />
            <circle r={44} fill={C.case3} />
            <g transform="translate(0 6)" fill="none" stroke={C.case1} strokeWidth={7} strokeLinecap="round">
              <rect x={-17} y={-6} width={34} height={26} rx={5} fill={C.case1} stroke="none" />
              <path d={i === 0 ? "M -10 -6 V -16 Q -10 -28 0 -28 Q 10 -28 10 -16 V -6" : "M -10 -6 V -16 Q -10 -28 0 -28 Q 10 -28 10 -18"} />
            </g>
          </g>
        ))}
        <circle cx={0} cy={140} r={10} fill={led > 0.05 ? K.flow : "#4b5a33"} style={led > 0.05 ? { filter: `drop-shadow(0 0 ${14 * led}px ${K.flow})` } : {}} />
        <rect x={-30} y={-H / 2 - 30} width={60} height={46} rx={20} fill="none" stroke={C.case3} strokeWidth={10} />
      </>
    );
    const cellCol = cellLevel < 0.25 ? K.warn : C.metal;
    return (
      <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`} opacity={o}>
        {/* llave de metal escondida (sale por abajo) */}
        <g transform={`translate(${shift} ${H / 2 - 40 + 230 * blade})`}>
          <path d="M -22 -200 H 22 V -10 L 0 30 L -22 -10 Z" fill={C.metal} stroke={C.case1} strokeWidth={4} />
          <path d="M -6 -180 V 0" stroke={C.case1} strokeWidth={5} opacity={0.5} />
          {[-150, -110, -70, -30].map((y, i) => <rect key={y} x={14} y={y} width={10} height={i % 2 ? 22 : 14} fill={C.case1} />)}
        </g>
        <g transform={`translate(${shift} 0)`}>
          {/* placa interior */}
          <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={110} fill={C.case1} stroke={C.case3} strokeWidth={6} />
          <rect x={-W / 2 + 18} y={-H / 2 + 18} width={W - 36} height={H - 36} rx={92} fill={C.pcb} stroke={K.flow} strokeOpacity={0.3} strokeWidth={3} />
          {/* antena de radio (UHF): pista amarilla en lazo */}
          <path d="M -80 -150 Q -80 -175 -50 -175 H 50 Q 80 -175 80 -150 V -120" fill="none" stroke={K.flow} strokeWidth={7} strokeLinecap="round"
            opacity={0.55 + 0.45 * antGlow} style={antGlow > 0.05 ? { filter: `drop-shadow(0 0 ${14 * antGlow}px ${K.flow})` } : {}} />
          {/* chip */}
          <g style={chipGlow > 0.05 ? { filter: `drop-shadow(0 0 ${8 + 14 * chipGlow + 4 * Math.sin(t * 7)}px ${K.flow})` } : {}}>
            <rect x={-50} y={-128} width={100} height={84} rx={10} fill={C.dark} stroke={K.flow} strokeWidth={5} />
            {[-30, -10, 10, 30].map((x) => <rect key={x} x={x - 4} y={-140} width={8} height={12} fill={C.case3} />)}
            {[-30, -10, 10, 30].map((x) => <rect key={x + 1} x={x - 4} y={-44} width={8} height={12} fill={C.case3} />)}
            <circle cx={0} cy={-86} r={14} fill={K.flow} opacity={0.25 + 0.75 * chipGlow} />
          </g>
          {/* bobina de baja frecuencia: barrita con espiras */}
          <g style={coilGlow > 0.05 ? { filter: `drop-shadow(0 0 ${16 * coilGlow}px ${K.cold})` } : {}}>
            <rect x={-85} y={-6} width={170} height={36} rx={10} fill="#3b4656" />
            {Array.from({ length: 11 }).map((_, i) => (
              <rect key={i} x={-75 + i * 14.5} y={-12} width={8} height={48} rx={3} fill={coilGlow > 0.3 ? K.cold : "#b8763f"} />
            ))}
          </g>
          {/* pila de botón */}
          <g transform="translate(0 112)">
            <circle r={64} fill={cellCol} stroke={C.case1} strokeWidth={6} />
            <circle r={48} fill="none" stroke={C.case3} strokeWidth={4} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.case1}>3V</text>
          </g>
        </g>
        {/* tapa (se desliza a la izquierda) */}
        <g transform={`translate(${shift - 0.94 * W * open} ${-10 * open}) rotate(${-6 * open})`}>{shell}</g>
      </g>
    );
  };

/** Ondas saliendo de (x, y) en la dirección ang (grados). LF = lentas y cortas (cian); UHF = rápidas y largas (amarillo). */
export const Waves: React.FC<{ x: number; y: number; t: number; reach?: number; color?: string; ang?: number; o?: number; speed?: number; spread?: number; n?: number; w?: number }> =
  ({ x, y, t, reach = 380, color = K.flow, ang = 0, o = 1, speed = 0.9, spread = 40, n = 4, w = 10 }) => {
    if (o <= 0.01) return null;
    const a = (spread * Math.PI) / 180;
    const arcs = Array.from({ length: n }).map((_, i) => {
      const p = (((t * speed + i / n) % 1) + 1) % 1;
      const r = 26 + p * reach;
      const big = spread > 90 ? 1 : 0;
      const d = `M ${r * Math.cos(-a)} ${r * Math.sin(-a)} A ${r} ${r} 0 ${big} 1 ${r * Math.cos(a)} ${r * Math.sin(a)}`;
      return <path key={i} d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" opacity={(1 - p) * o} />;
    });
    return <g transform={`translate(${x} ${y}) rotate(${ang})`} style={{ filter: `drop-shadow(0 0 8px ${color})` }}>{arcs}</g>;
  };

/** Coche de perfil (mirando a la derecha). (cx, cy) = centro, a la altura de los ejes. Manilla delantera en (cx-30s, cy-150s). */
export const CarSide: React.FC<{ cx: number; cy: number; s?: number; t: number; blink?: number; handleHi?: number; antennas?: number; color?: string; o?: number }> =
  ({ cx, cy, s = 1, t, blink = 0, handleHi = 0, antennas = 0, color = K.hot, o = 1 }) => {
    const on = blink > 0.05 && Math.sin(t * 14) > 0;
    return (
      <g transform={`translate(${cx} ${cy}) scale(${s})`} opacity={o}>
        <ellipse cx={0} cy={50} rx={400} ry={22} fill="#000" opacity={0.25} />
        <path d="M -390 20 L -390 -110 Q -385 -150 -330 -160 L -230 -175 L -140 -270 Q -120 -290 -90 -290 L 130 -290 Q 160 -290 180 -270 L 270 -175 L 350 -160 Q 395 -150 395 -110 L 395 20 Z"
          fill={color} stroke={C.dark} strokeWidth={6} />
        <path d="M -205 -180 L -128 -262 H 52 V -180 Z" fill={C.dark} opacity={0.75} />
        <path d="M 72 -180 V -262 H 140 L 222 -180 Z" fill={C.dark} opacity={0.75} />
        <path d="M 60 -180 V 0 M -215 -175 V 0" stroke={C.dark} strokeWidth={5} opacity={0.45} fill="none" />
        {/* manilla */}
        <rect x={-62} y={-157} width={64} height={16} rx={8} fill={handleHi > 0.05 ? K.flow : C.case1}
          style={handleHi > 0.05 ? { filter: `drop-shadow(0 0 ${16 * handleHi}px ${K.flow})` } : {}} />
        <rect x={110} y={-157} width={64} height={16} rx={8} fill={C.case1} />
        {/* faros e intermitentes */}
        <rect x={360} y={-140} width={34} height={22} rx={8} fill={K.flow} opacity={on ? 1 : 0.7} style={on ? { filter: `drop-shadow(0 0 20px ${K.flow})` } : {}} />
        <rect x={-390} y={-140} width={24} height={24} rx={6} fill={on ? K.flow : K.warn} style={on ? { filter: `drop-shadow(0 0 20px ${K.flow})` } : {}} />
        <path d="M 52 -205 l 30 -8 v 22 z" fill={C.dark} />
        {[-250, 250].map((x) => (
          <g key={x} transform={`translate(${x} 0)`}>
            <circle r={66} fill={C.dark} />
            <circle r={34} fill={C.case3} />
            <g transform={`rotate(${0})`}><circle r={10} fill={C.case1} /></g>
          </g>
        ))}
        {/* antenas de baja frecuencia (puntos cian) */}
        {antennas > 0.01 && [[-30, -170], [140, -170], [-10, -120], [-300, -130]].map(([x, y], i) => (
          <g key={i} opacity={antennas}>
            <circle cx={x} cy={y} r={11} fill={K.cold} />
            <circle cx={x} cy={y} r={11 + 14 * ((t * 1.2 + i * 0.25) % 1)} fill="none" stroke={K.cold} strokeWidth={4} opacity={1 - ((t * 1.2 + i * 0.25) % 1)} />
          </g>
        ))}
      </g>
    );
  };

/** Coche visto desde arriba (morro arriba). Zona interior punteada; antenas interiores; botón de arranque. */
export const CarTop: React.FC<{ cx: number; cy: number; s?: number; t: number; zone?: number; zoneColor?: string; antennas?: number; start?: number }> =
  ({ cx, cy, s = 1, t, zone = 0, zoneColor = K.cold, antennas = 1, start = 0 }) => (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      {[[-190, -210], [190, -210], [-190, 220], [190, 220]].map(([x, y], i) => <rect key={i} x={x - 26} y={y - 60} width={52} height={120} rx={16} fill={C.dark} />)}
      <rect x={-180} y={-350} width={360} height={700} rx={140} fill={K.hot} stroke={C.dark} strokeWidth={6} />
      <path d="M -140 -170 Q 0 -215 140 -170 L 120 -100 Q 0 -125 -120 -100 Z" fill={C.dark} opacity={0.75} />
      <path d="M -130 230 Q 0 265 130 230 L 115 180 Q 0 200 -115 180 Z" fill={C.dark} opacity={0.75} />
      <rect x={-150} y={-100} width={300} height={290} rx={30} fill="#7a3a12" opacity={0.85} />
      {[[-70, -30], [70, -30], [-70, 110], [70, 110]].map(([x, y], i) => <rect key={i} x={x - 48} y={y - 42} width={96} height={84} rx={22} fill="#5a2a0c" />)}
      <rect x={-140} y={-92} width={280} height={276} rx={26} fill={zoneColor} opacity={0.12 * zone} />
      <rect x={-140} y={-92} width={280} height={276} rx={26} fill="none" stroke={zoneColor} strokeWidth={6} strokeDasharray="18 12"
        strokeDashoffset={-t * 40} opacity={zone} />
      {[[0, -70], [0, 40], [0, 160]].map(([x, y], i) => (
        <g key={i} opacity={antennas}>
          <circle cx={x} cy={y} r={11} fill={K.cold} />
          <circle cx={x} cy={y} r={11 + 26 * ((t * 1.1 + i * 0.33) % 1)} fill="none" stroke={K.cold} strokeWidth={4} opacity={1 - ((t * 1.1 + i * 0.33) % 1)} />
        </g>
      ))}
      <g transform="translate(95 -84)">
        <circle r={20} fill={start > 0.5 ? K.flow : C.case3} style={start > 0.5 ? { filter: `drop-shadow(0 0 16px ${K.flow})` } : {}} />
      </g>
      <rect x={-140} y={-345} width={60} height={22} rx={8} fill={K.flow} opacity={0.8} />
      <rect x={80} y={-345} width={60} height={22} rx={8} fill={K.flow} opacity={0.8} />
    </g>
  );

/** Mano estilizada con el índice apuntando a la izquierda-arriba (toca en (x, y)). */
export const Hand: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={10} y={-10} width={120} height={30} rx={15} fill={C.skin} stroke={C.dark} strokeWidth={4} />
    <rect x={90} y={-30} width={120} height={120} rx={36} fill={C.skin} stroke={C.dark} strokeWidth={4} />
    <rect x={70} y={40} width={70} height={28} rx={14} fill={C.skin} stroke={C.dark} strokeWidth={4} />
    <rect x={190} y={0} width={130} height={70} rx={20} fill={C.case2} stroke={C.dark} strokeWidth={4} />
  </g>
);

/** Bocadillo con texto (pregunta / respuesta). tail: dirección de la colita. */
export const Bubble: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; o?: number; tail?: "down" | "up" | "left" | "right"; w?: number }> =
  ({ x, y, text, color = K.cold, size = 56, o = 1, tail = "down", w }) => {
    if (o <= 0.01) return null;
    const ww = w ?? Math.max(110, text.length * size * 0.66 + 50), hh = size * 1.7;
    const tl = tail === "down" ? `M ${-18} ${hh / 2 - 2} L 0 ${hh / 2 + 30} L 18 ${hh / 2 - 2} Z`
      : tail === "up" ? `M ${-18} ${-hh / 2 + 2} L 0 ${-hh / 2 - 30} L 18 ${-hh / 2 + 2} Z`
        : tail === "left" ? `M ${-ww / 2 + 2} -16 L ${-ww / 2 - 30} 0 L ${-ww / 2 + 2} 16 Z` : `M ${ww / 2 - 2} -16 L ${ww / 2 + 30} 0 L ${ww / 2 - 2} 16 Z`;
    return (
      <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * o})`} opacity={o}>
        <path d={tl} fill={color} />
        <rect x={-ww / 2} y={-hh / 2} width={ww} height={hh} rx={hh / 2} fill="rgba(6,16,31,0.92)" stroke={color} strokeWidth={6} />
        <text x={0} y={size * 0.35} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} letterSpacing={2}>{text}</text>
      </g>
    );
  };

/** Candado. open 0→1 levanta el arco. */
export const Padlock: React.FC<{ x: number; y: number; s?: number; open?: number; color?: string; o?: number }> = ({ x, y, s = 1, open = 0, color = K.flow, o = 1 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} style={{ filter: `drop-shadow(0 0 12px ${color})` }}>
    <path d={`M -34 ${-10 - 26 * open} V ${-44 - 26 * open} Q -34 ${-84 - 26 * open} 0 ${-84 - 26 * open} Q 34 ${-84 - 26 * open} 34 ${-44 - 26 * open} V ${-30 + 4 * open}`}
      fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" transform={open > 0 ? `rotate(${-18 * open} -34 -10)` : ""} />
    <rect x={-56} y={-20} width={112} height={92} rx={16} fill={color} />
    <circle cx={0} cy={18} r={12} fill={C.dark} /><rect x={-5} y={18} width={10} height={28} fill={C.dark} />
  </g>
);

/** Pila de botón grande. level 0-1. */
export const CoinCell: React.FC<{ x: number; y: number; r?: number; level?: number; o?: number }> = ({ x, y, r = 160, level = 1, o = 1 }) => {
  const col = level < 0.25 ? K.warn : C.metal;
  return (
    <g transform={`translate(${x} ${y})`} opacity={o}>
      <ellipse cx={0} cy={r * 0.16} rx={r} ry={r} fill="#6f7d90" />
      <circle r={r} fill={col} stroke={C.case1} strokeWidth={8} />
      <circle r={r * 0.78} fill="none" stroke={C.case3} strokeWidth={6} />
      <text x={0} y={-r * 0.18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.42} fill={C.case1}>+</text>
      <text x={0} y={r * 0.34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.36} fill={C.case1}>3 V</text>
    </g>
  );
};

/** Botón de arranque con símbolo de encendido. lit 0-1. */
export const StartButton: React.FC<{ x: number; y: number; s?: number; lit?: number }> = ({ x, y, s = 1, lit = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={150} fill={C.case1} stroke={C.case3} strokeWidth={8} />
    <circle r={112} fill={C.dark} stroke={lit > 0.5 ? K.flow : C.case2} strokeWidth={10}
      style={lit > 0.05 ? { filter: `drop-shadow(0 0 ${28 * lit}px ${K.flow})` } : {}} />
    <g stroke={lit > 0.5 ? K.flow : C.case3} strokeWidth={14} strokeLinecap="round" fill="none">
      <path d="M -34 -38 A 50 50 0 1 0 34 -38" />
      <path d="M 0 -64 V -10" />
    </g>
  </g>
);

/** Casa sencilla con puerta y ventana. */
export const House: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 340, h = 300 }) => (
  <g>
    <path d={`M ${x - 24} ${y} L ${x + w / 2} ${y - 150} L ${x + w + 24} ${y} Z`} fill={C.case1} stroke={C.case3} strokeWidth={5} />
    <rect x={x} y={y} width={w} height={h} fill={C.case2} stroke={C.case3} strokeWidth={5} />
    <rect x={x + 36} y={y + 50} width={110} height={90} rx={8} fill={C.dark} stroke={C.case3} strokeWidth={4} />
    <rect x={x + w - 130} y={y + h - 190} width={96} height={190} rx={6} fill={C.case1} stroke={C.case3} strokeWidth={4} />
    <circle cx={x + w - 50} cy={y + h - 96} r={7} fill={K.flow} />
  </g>
);

/** Repetidor genérico (aparato rojo con antena). */
export const Relay: React.FC<{ x: number; y: number; s?: number; t: number; on?: number }> = ({ x, y, s = 1, t, on = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={34} y1={-46} x2={56} y2={-110} stroke={C.case3} strokeWidth={8} strokeLinecap="round" />
    <circle cx={56} cy={-110} r={9} fill={K.warn} opacity={on > 0.05 ? 0.5 + 0.5 * Math.sin(t * 10) : 0.4} />
    <rect x={-70} y={-48} width={140} height={96} rx={18} fill="#3a1c26" stroke={K.warn} strokeWidth={6} />
    {[-36, -12, 12].map((xx) => <rect key={xx} x={xx} y={-14} width={14} height={28} rx={4} fill={K.warn} opacity={on > 0.05 ? 0.9 : 0.4} />)}
  </g>
);

/** Funda que bloquea la señal. cover 0→1 la sube tapando lo que haya detrás. */
export const Pouch: React.FC<{ x: number; y: number; w?: number; h?: number; cover?: number }> = ({ x, y, w = 300, h = 440, cover = 1 }) => {
  const yy = y + h / 2 + (1 - cover) * (h + 40);
  return (
    <g>
      <defs><clipPath id="pouchclip"><rect x={x - w / 2 - 20} y={y - h / 2 - 60} width={w + 40} height={h + 140} /></clipPath></defs>
      <g clipPath="url(#pouchclip)">
        <g transform={`translate(${x} ${yy})`}>
          <rect x={-w / 2} y={-h} width={w} height={h} rx={34} fill="#26303d" stroke={C.case3} strokeWidth={6} />
          <rect x={-w / 2 + 16} y={-h + 16} width={w - 32} height={h - 32} rx={24} fill="none" stroke={C.case3} strokeWidth={4} strokeDasharray="14 10" opacity={0.7} />
          {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={-w / 2 + 30} x2={w / 2 - 30} y1={-h + 70 + i * 60} y2={-h + 70 + i * 60} stroke="#3b4a5e" strokeWidth={6} />)}
        </g>
      </g>
    </g>
  );
};

/** Interruptor ON/OFF. on 0→1. */
export const Toggle: React.FC<{ x: number; y: number; on: number; label: string; s?: number; o?: number }> = ({ x, y, on, label, s = 1, o = 1 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-150} y={-70} width={300} height={140} rx={24} fill="rgba(6,16,31,0.9)" stroke={C.case3} strokeWidth={4} />
    <text x={0} y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={K.white}>{label}</text>
    <rect x={-60} y={2} width={120} height={50} rx={25} fill={on > 0.5 ? K.cold : "#56637a"} />
    <circle cx={-34 + 68 * on} cy={27} r={20} fill={K.white} />
  </g>
);

/** Llave tachada / con aspa. */
export const Cross: React.FC<{ x: number; y: number; s?: number; o?: number; color?: string }> = ({ x, y, s = 1, o = 1, color = K.warn }) => o <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} stroke={color} strokeWidth={16} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
    <path d="M -40 -40 L 40 40 M 40 -40 L -40 40" />
  </g>
);

/** Zzz (la llave duerme). */
export const Zzz: React.FC<{ x: number; y: number; t: number; o?: number }> = ({ x, y, t, o = 1 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    {[0, 1, 2].map((i) => {
      const p = ((t * 0.6 + i / 3) % 1);
      return <text key={i} x={x + 40 * p + i * 6} y={y - 90 * p} fontFamily={FONT} fontWeight={900} fontSize={34 + 22 * p} fill={K.cold} opacity={1 - p}>Z</text>;
    })}
  </g>
);

/** Caja de texto dentro del SVG (códigos). */
export const Tag: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; o?: number; w?: number }> = ({ x, y, text, color = K.white, size = 46, o = 1, w }) => {
  if (o <= 0.01) return null;
  const ww = w ?? text.length * size * 0.7 + 40;
  return (
    <g opacity={o}>
      <rect x={x - ww / 2} y={y - size * 0.85} width={ww} height={size * 1.6} rx={14} fill="rgba(6,16,31,0.88)" stroke={color} strokeWidth={4} />
      <text x={x} y={y + size * 0.33} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} letterSpacing={2}>{text}</text>
    </g>
  );
};
