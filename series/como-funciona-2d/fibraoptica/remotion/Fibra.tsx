// Dibujos SVG del episodio «Cómo llega internet por la fibra óptica de tu casa». Coordenadas absolutas de 1080×1920.
// Colores de código: naranja = luz del láser (infrarroja), cian = vidrio/agua/mar, amarillo = lo importante/señal eléctrica,
// blanco = texto, rojo = peligro. Grises azulados para carcasas. Sin marcas: cable, router y central genéricos.
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F", inner: "#0B1A30", glass: "#8FE3FF", glass2: "#1F6F92",
  jacket: "#E9EEF5", jacket2: "#B9C6D6", kevlar: "#E8C46A", hair: "#6B4A2E", hair2: "#8A6440", sea: "#0D3A5C", sea2: "#0A2B45", sand: "#5A4A36", land: "#2F5E45", water: "#5FD0F5" };

const glow = (c: string, r: number) => ({ filter: `drop-shadow(0 0 ${r}px ${c})` });
/** Código de ejemplo para los destellos. */
export const BITS = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1];

/** Pulsos de luz que avanzan por una recta (x0→x1) a la altura y. */
export const Pulses: React.FC<{ x0: number; x1: number; y: number; t: number; speed?: number; gap?: number; r?: number; o?: number; color?: string; dir?: number }> =
  ({ x0, x1, y, t, speed = 260, gap = 90, r = 12, o = 1, color = K.hot, dir = 1 }) => {
    if (o <= 0.01) return null;
    const L = Math.abs(x1 - x0), n = Math.ceil(L / gap) + 1;
    return (
      <g opacity={o}>
        {Array.from({ length: n }).map((_, k) => {
          const s = ((t * speed + k * gap) % (n * gap));
          if (s > L) return null;
          const x = dir > 0 ? Math.min(x0, x1) + s : Math.max(x0, x1) - s;
          const on = BITS[k % BITS.length];
          const edge = Math.min(1, s / 30, (L - s) / 30);
          return <g key={k} opacity={edge * (on ? 1 : 0.3)}>
            <circle cx={x} cy={y} r={r * 2.2} fill={color} opacity={0.22} />
            <circle cx={x} cy={y} r={r} fill={on ? "#FFE2C4" : color} />
          </g>;
        })}
      </g>
    );
  };

/**
 * Cable de fibra de casa (visto de lado), horizontal entre x0 y x1, centro y.
 * open 0→1: la funda blanca se parte (mitad de arriba sube, de abajo baja) y aparece el hilo de cristal con la luz dentro.
 */
export const DropCable: React.FC<{ x0: number; x1: number; y: number; t: number; open: number; light?: number; h?: number }> = ({ x0, x1, y, t, open, light = 1, h = 150 }) => {
  const dy = 140 * open;
  const w = x1 - x0;
  return (
    <g>
      {/* hilo de cristal (visible al abrir) */}
      <g opacity={0.25 + 0.75 * open}>
        <rect x={x0 + 10} y={y - 30} width={w - 20} height={60} rx={30} fill={C.glass2} opacity={0.55} stroke={C.glass} strokeWidth={4} />
        <rect x={x0 + 10} y={y - 9} width={w - 20} height={18} rx={9} fill={C.glass} opacity={0.85} />
        <Pulses x0={x0 + 20} x1={x1 - 20} y={y} t={t} r={11} gap={80} o={light * open} />
      </g>
      {/* fibras de refuerzo amarillentas */}
      <g opacity={open * 0.9}>
        {[-1, 1].map((sg) => <path key={sg} d={`M${x0 + 20},${y + sg * (46 + dy * 0.35)} Q${x0 + w / 2},${y + sg * (60 + dy * 0.45)} ${x1 - 20},${y + sg * (46 + dy * 0.35)}`}
          fill="none" stroke={C.kevlar} strokeWidth={5} strokeDasharray="14 10" />)}
      </g>
      {/* funda: dos mitades */}
      {[-1, 1].map((sg) => (
        <g key={sg} transform={`translate(0,${sg * dy})`}>
          <path d={sg < 0
            ? `M${x0 + h / 2},${y - h / 2} L${x1 - h / 2},${y - h / 2} A${h / 2},${h / 2} 0 0 1 ${x1},${y} L${x0},${y} A${h / 2},${h / 2} 0 0 1 ${x0 + h / 2},${y - h / 2} Z`
            : `M${x0},${y} L${x1},${y} A${h / 2},${h / 2} 0 0 1 ${x1 - h / 2},${y + h / 2} L${x0 + h / 2},${y + h / 2} A${h / 2},${h / 2} 0 0 1 ${x0},${y} Z`}
            fill={C.jacket} stroke={C.ink} strokeWidth={6} />
          <path d={`M${x0 + 70},${y + sg * h * 0.3} L${x1 - 70},${y + sg * h * 0.3}`} stroke={C.jacket2} strokeWidth={8} strokeLinecap="round" />
          {/* corte: línea de rotura dentada */}
          <path d={Array.from({ length: 24 }).map((_, k) => `${k ? "L" : "M"}${x0 + 20 + k * (w - 40) / 23},${y + (k % 2 ? 6 : -6) * sg}`).join(" ")}
            fill="none" stroke={C.ink} strokeWidth={4} opacity={open > 0.02 ? 1 : 0} />
        </g>
      ))}
    </g>
  );
};

/** Sección transversal: funda, revestimiento (125 µm) y núcleo (9 µm), a escala con un pelo (~70 µm). Centro (x,y), escala px/µm. */
export const CrossSection: React.FC<{ x: number; y: number; k?: number; t: number; core?: number; clad?: number; o?: number; hiCore?: number }> =
  ({ x, y, k = 2.2, t, core = 1, clad = 1, o = 1, hiCore = 0 }) => (
    <g opacity={o}>
      <circle cx={x} cy={y} r={62.5 * k} fill={C.glass2} opacity={0.35 + 0.4 * clad} stroke={C.glass} strokeWidth={5} />
      <circle cx={x} cy={y} r={62.5 * k} fill="none" stroke={C.glass} strokeWidth={2} opacity={0.4} strokeDasharray="6 10" transform={`rotate(${t * 20} ${x} ${y})`} />
      <circle cx={x} cy={y} r={Math.max(4.5 * k, 8) * (1 + 0.15 * Math.sin(t * 6))} fill={K.hot} opacity={core} style={glow(K.hot, 10 + 14 * hiCore)} />
      <circle cx={x} cy={y} r={Math.max(4.5 * k, 8) * 0.45} fill="#FFE2C4" opacity={core} />
    </g>
  );

/** Pelo humano en sección (~70 µm) a la misma escala k. */
export const HairDot: React.FC<{ x: number; y: number; k?: number; o?: number }> = ({ x, y, k = 2.2, o = 1 }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={35 * k} fill={C.hair} stroke={C.ink} strokeWidth={5} />
    <circle cx={x - 10} cy={y - 12} r={35 * k * 0.55} fill={C.hair2} opacity={0.6} />
  </g>
);

/** Pelo visto de lado (tira ondulada). */
export const HairStrand: React.FC<{ x0: number; x1: number; y: number; t: number; w?: number; o?: number }> = ({ x0, x1, y, t, w = 26, o = 1 }) => (
  <path opacity={o} d={Array.from({ length: 21 }).map((_, i) => `${i ? "L" : "M"}${x0 + (i * (x1 - x0)) / 20},${y + 8 * Math.sin(i * 0.7 + t * 1.5)}`).join(" ")}
    fill="none" stroke={C.hair} strokeWidth={w} strokeLinecap="round" />
);

/**
 * Corte longitudinal de la fibra: revestimiento (banda ancha) + núcleo (banda estrecha) y un rayo que rebota en la frontera.
 * ray: opacidad del rayo; mirror: resalta la frontera (amarillo). Simplificado: en la fibra monomodo real la luz no «rebota» como un rayo.
 */
export const FiberZoom: React.FC<{ x0: number; x1: number; y: number; t: number; clad?: number; core?: number; ray?: number; mirror?: number; o?: number; speed?: number }> =
  ({ x0, x1, y, t, clad = 230, core = 120, ray = 1, mirror = 0, o = 1, speed = 240 }) => {
    const P = 170; // longitud de un rebote completo
    const hy = core / 2 - 6;
    const tri = (x: number) => { const u = (((x - x0) % P) + P) % P / P; return y + hy * (u < 0.5 ? 4 * u - 1 : 3 - 4 * u); };
    const pts = Array.from({ length: Math.ceil((x1 - x0) / (P / 2)) + 1 }).map((_, i) => { const x = Math.min(x1, x0 + (i * P) / 2); return `${x},${tri(x)}`; });
    const ph = [0, 0.33, 0.66].map((f) => { const L = x1 - x0; const s = ((t * speed) + f * L) % L; return x0 + s; });
    return (
      <g opacity={o}>
        <rect x={x0} y={y - clad / 2} width={x1 - x0} height={clad} fill={C.glass2} opacity={0.45} />
        <path d={`M${x0},${y - clad / 2} L${x1},${y - clad / 2} M${x0},${y + clad / 2} L${x1},${y + clad / 2}`} stroke={C.glass} strokeWidth={4} opacity={0.7} />
        <rect x={x0} y={y - core / 2} width={x1 - x0} height={core} fill={C.glass} opacity={0.32} />
        <path d={`M${x0},${y - core / 2} L${x1},${y - core / 2} M${x0},${y + core / 2} L${x1},${y + core / 2}`} stroke={mirror > 0.02 ? K.flow : C.glass}
          strokeWidth={4 + 4 * mirror} style={mirror > 0.02 ? glow(K.flow, 12 * mirror) : undefined} />
        <g opacity={ray}>
          <polyline points={pts.join(" ")} fill="none" stroke={K.hot} strokeWidth={5} opacity={0.45} strokeLinejoin="round" />
          {ph.map((x, i) => <g key={i}><circle cx={x} cy={tri(x)} r={24} fill={K.hot} opacity={0.3} /><circle cx={x} cy={tri(x)} r={12} fill="#FFE2C4" /></g>)}
        </g>
      </g>
    );
  };

/** Central: armario con un láser que dispara a la derecha. Centro (x,y). */
export const Central: React.FC<{ x: number; y: number; s?: number; t: number; laser: number }> = ({ x, y, s = 1, t, laser }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-130} y={-190} width={260} height={380} rx={22} fill={C.case1} stroke={C.ink} strokeWidth={6} />
    {[0, 1, 2, 3].map((r) => <g key={r}>
      <rect x={-100} y={-160 + r * 70} width={200} height={50} rx={8} fill={C.inner} stroke={C.case2} strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((c) => <circle key={c} cx={-75 + c * 26} cy={-135 + r * 70} r={6} fill={(r * 5 + c + Math.floor(t * 4)) % 3 === 0 ? K.cold : "#24456b"} />)}
    </g>)}
    {/* láser */}
    <rect x={90} y={110} width={110} height={56} rx={10} fill={C.case2} stroke={C.ink} strokeWidth={5} />
    <circle cx={200} cy={138} r={14} fill={laser > 0.5 ? "#FFE2C4" : "#5a3a24"} stroke={C.ink} strokeWidth={3} style={laser > 0.5 ? glow(K.hot, 18) : undefined} />
  </g>
);

/** Tira de bits: rectángulos brillantes (1) y tenues (0) que se desplazan. */
export const BitStrip: React.FC<{ x0: number; x1: number; y: number; t: number; o?: number; showBits?: number; speed?: number }> = ({ x0, x1, y, t, o = 1, showBits = 0, speed = 90 }) => {
  if (o <= 0.01) return null;
  const cw = 70, n = Math.floor((x1 - x0) / cw);
  const off = Math.floor(t * speed / cw);
  return (
    <g opacity={o}>
      <rect x={x0 - 14} y={y - 70} width={n * cw + 28} height={180} rx={18} fill="rgba(6,16,31,0.85)" stroke={K.hot} strokeWidth={4} />
      {Array.from({ length: n }).map((_, i) => {
        const b = BITS[(i + off) % BITS.length];
        return <g key={i}>
          <rect x={x0 + i * cw + 6} y={y - 52} width={cw - 12} height={84} rx={8} fill={K.hot} opacity={b ? 1 : 0.22} style={b ? glow(K.hot, 8) : undefined} />
          <text x={x0 + i * cw + cw / 2} y={y + 88} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={44} fill={b ? K.flow : K.white} opacity={showBits}>{b}</text>
        </g>;
      })}
    </g>
  );
};

/** Espectro: visible (arcoíris) + infrarrojo; marcas en nm. x0..x1 cubren 350..1650 nm. */
export const Spectrum: React.FC<{ x0: number; x1: number; y: number; o?: number; mark?: number; t: number }> = ({ x0, x1, y, o = 1, mark = 0, t }) => {
  const nm = (v: number) => x0 + ((v - 350) / 1300) * (x1 - x0);
  return (
    <g opacity={o}>
      <defs>
        <linearGradient id="rainbow" x1="0" x2="1">
          {["#7B3FE4", "#3A6BFF", "#2FD3F0", "#3BE06A", "#F5E23A", "#FF9A2E", "#FF3B3B"].map((c, i) => <stop key={i} offset={i / 6} stopColor={c} />)}
        </linearGradient>
      </defs>
      <rect x={nm(380)} y={y - 40} width={nm(750) - nm(380)} height={80} rx={10} fill="url(#rainbow)" />
      <rect x={nm(750)} y={y - 40} width={nm(1650) - nm(750)} height={80} rx={10} fill="#2a1a24" stroke="#5a2f3a" strokeWidth={3} />
      {[1310, 1490].map((v) => (
        <g key={v} opacity={mark}>
          <rect x={nm(v) - 10} y={y - 52} width={20} height={104} rx={6} fill={K.hot} style={glow(K.hot, 10 + 6 * Math.sin(t * 5))} />
          <text x={nm(v)} y={y + 100} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={34} fill={K.hot}>{v}</text>
        </g>
      ))}
      <text x={nm(565)} y={y + 100} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={30} fill={K.white}>VISIBLE</text>
    </g>
  );
};

/** Ojo (con aspa roja si cross > 0). */
export const Eye: React.FC<{ x: number; y: number; s?: number; o?: number; cross?: number; danger?: number }> = ({ x, y, s = 1, o = 1, cross = 0, danger = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-120,0 Q0,-95 120,0 Q0,95 -120,0 Z" fill={K.white} stroke={C.ink} strokeWidth={7} />
    <circle r={44} fill={danger > 0.02 ? `rgb(${53 + 176 * danger},${196 - 139 * danger},${240 - 187 * danger})` : K.cold} stroke={C.ink} strokeWidth={5} />
    <circle r={20} fill={C.ink} />
    <circle cx={-14} cy={-14} r={9} fill={K.white} />
    {cross > 0.01 && <path d="M-110,-80 L110,80 M110,-80 L-110,80" stroke={K.warn} strokeWidth={18} strokeLinecap="round" opacity={cross} />}
  </g>
);

/** Casita sencilla; lit = ventanas encendidas. */
export const House: React.FC<{ x: number; y: number; s?: number; lit?: number; o?: number }> = ({ x, y, s = 1, lit = 0, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-60,-10 L0,-62 L60,-10 Z" fill={C.case2} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-48} y={-12} width={96} height={72} fill={C.case1} stroke={C.ink} strokeWidth={5} />
    <rect x={-32} y={4} width={26} height={24} fill={lit > 0.5 ? K.flow : C.inner} stroke={C.ink} strokeWidth={3} />
    <rect x={8} y={20} width={24} height={40} fill={C.inner} stroke={C.ink} strokeWidth={3} />
  </g>
);

/** Divisor óptico pasivo: caja donde una fibra entra por la izquierda y salen n por la derecha. */
export const Splitter: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={-80} y={-110} width={160} height={220} rx={20} fill={C.case1} stroke={C.ink} strokeWidth={6} />
    <path d="M-80,0 L-20,0 M-20,0 L80,-80 M-20,0 L80,-40 M-20,0 L80,0 M-20,0 L80,40 M-20,0 L80,80" stroke={C.glass} strokeWidth={5} fill="none" />
    <circle cx={-20} cy={0} r={10} fill={K.hot} />
    {/* sin enchufe: enchufe tachado */}
  </g>
);

/** Enchufe tachado (sin electricidad). */
export const NoPlug: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <circle r={52} fill="rgba(6,16,31,0.85)" stroke={K.warn} strokeWidth={7} />
    <rect x={-20} y={-14} width={40} height={36} rx={6} fill={C.case3} />
    <rect x={-13} y={-34} width={7} height={22} fill={C.case3} /><rect x={6} y={-34} width={7} height={22} fill={C.case3} />
    <path d="M-36,36 L36,-36" stroke={K.warn} strokeWidth={8} strokeLinecap="round" />
  </g>
);

/** Router de fibra (ONT) con antenas, luces y entrada de fibra a la izquierda. */
export const Router: React.FC<{ x: number; y: number; s?: number; t: number; on?: number; o?: number; wifi?: number }> = ({ x, y, s = 1, t, on = 1, o = 1, wifi = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    {[-1, 1].map((sg) => <rect key={sg} x={sg * 120 - 9} y={-200} width={18} height={130} rx={9} fill={C.case2} stroke={C.ink} strokeWidth={4} />)}
    <rect x={-190} y={-80} width={380} height={160} rx={30} fill={C.case1} stroke={C.ink} strokeWidth={6} />
    {[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={-120 + k * 60} cy={0} r={12} fill={on > 0.5 && (k + Math.floor(t * 5)) % 3 !== 0 ? (k === 0 ? K.cold : K.flow) : "#24456b"} />)}
    <rect x={-215} y={-18} width={30} height={36} rx={6} fill={C.case3} stroke={C.ink} strokeWidth={4} />
    {wifi > 0.01 && [0, 1, 2].map((k) => {
      const ph = ((t * 1.2 + k / 3) % 1);
      return <path key={k} d={`M${-60 - ph * 80},${-210 - ph * 60} Q0,${-260 - ph * 110} ${60 + ph * 80},${-210 - ph * 60}`} fill="none" stroke={K.cold} strokeWidth={9}
        strokeLinecap="round" opacity={wifi * (1 - ph)} />;
    })}
  </g>
);

/** Señal eléctrica (zigzag amarillo) que se desplaza entre x0 y x1. */
export const ElecWave: React.FC<{ x0: number; x1: number; y: number; t: number; o?: number; a?: number }> = ({ x0, x1, y, t, o = 1, a = 26 }) => {
  if (o <= 0.01) return null;
  const n = Math.floor((x1 - x0) / 16);
  const d = Array.from({ length: n + 1 }).map((_, i) => { const x = x0 + i * 16; const b = BITS[(i + Math.floor(t * 20)) % BITS.length]; return `${i ? "L" : "M"}${x},${y - (b ? a : -a)}`; }).join(" ");
  return <path d={d} fill="none" stroke={K.flow} strokeWidth={6} strokeLinejoin="round" opacity={o} style={glow(K.flow, 8)} />;
};

/** Extremo de fibra con conector, apuntando a la derecha; beam = cono de luz invisible (punteado). */
export const FiberEnd: React.FC<{ x: number; y: number; s?: number; beam?: number; t: number }> = ({ x, y, s = 1, beam = 0, t }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-420,0 L-120,0" stroke={C.jacket} strokeWidth={34} strokeLinecap="round" />
    <rect x={-130} y={-40} width={150} height={80} rx={12} fill={K.cold} stroke={C.ink} strokeWidth={6} />
    <rect x={20} y={-16} width={60} height={32} rx={6} fill={C.case3} stroke={C.ink} strokeWidth={4} />
    <circle cx={80} cy={0} r={7} fill="#FFE2C4" opacity={0.6 + 0.4 * Math.sin(t * 12)} />
    {beam > 0.01 && <path d="M84,0 L360,-90 L360,90 Z" fill={K.hot} opacity={0.12 * beam} stroke={K.hot} strokeWidth={4} strokeDasharray="12 12" strokeOpacity={0.6 * beam} />}
  </g>
);

/** Señal de peligro (triángulo). */
export const Warn: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M0,-80 L80,60 L-80,60 Z" fill={K.flow} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    <path d="M0,-30 L0,18" stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
    <circle cx={0} cy={40} r={8} fill={C.ink} />
  </g>
);

/** Experimento de 1842: depósito con agua, chorro curvo que sale por un agujero y guía la luz. light 0→1. */
export const WaterJet: React.FC<{ x: number; y: number; t: number; light: number; o?: number }> = ({ x, y, t, light, o = 1 }) => {
  // depósito a la izquierda; chorro desde (x+110, y+80) en parábola hasta el cubo
  const j0x = x + 110, j0y = y + 90;
  const par = (u: number) => [j0x + 380 * u, j0y + 360 * u * u] as const;
  const pts = Array.from({ length: 21 }).map((_, i) => par(i / 20));
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"}${px},${py}`).join(" ");
  const dots = [0, 0.33, 0.66].map((f) => par((t * 0.6 + f) % 1));
  return (
    <g opacity={o}>
      {/* lámpara detrás del depósito */}
      <circle cx={x - 210} cy={j0y} r={40} fill={K.flow} opacity={0.3 + 0.7 * light} style={glow(K.flow, 20 * light)} />
      <path d={`M${x - 170},${j0y} L${x - 110},${j0y}`} stroke={K.flow} strokeWidth={10} opacity={light} strokeDasharray="14 10" />
      {/* depósito */}
      <rect x={x - 110} y={y - 170} width={220} height={300} rx={14} fill="rgba(95,208,245,0.12)" stroke={C.case3} strokeWidth={6} />
      <rect x={x - 104} y={y - 100 + 6 * Math.sin(t * 2)} width={208} height={224 - 6 * Math.sin(t * 2)} rx={8} fill={C.water} opacity={0.45} />
      <path d={`M${x - 104},${j0y} L${x + 110},${j0y}`} stroke={K.flow} strokeWidth={8} opacity={0.8 * light} />
      {/* chorro */}
      <path d={d} fill="none" stroke={C.water} strokeWidth={34} strokeLinecap="round" opacity={0.8} />
      <path d={d} fill="none" stroke={K.flow} strokeWidth={14} strokeLinecap="round" opacity={light} style={glow(K.flow, 16 * light)} />
      {light > 0.05 && dots.map(([px, py], i) => <circle key={i} cx={px} cy={py} r={13} fill="#FFF6C8" opacity={light} />)}
      {/* cubo */}
      <path d={`M${j0x + 320},${j0y + 340} L${j0x + 450},${j0y + 340} L${j0x + 430},${j0y + 450} L${j0x + 340},${j0y + 450} Z`} fill={C.case1} stroke={C.ink} strokeWidth={6} />
      <ellipse cx={j0x + 385} cy={j0y + 345} rx={55} ry={12} fill={K.flow} opacity={0.6 * light} style={glow(K.flow, 14 * light)} />
    </g>
  );
};

/** Corte del océano: dos costas y un cable en el fondo con pulsos de luz. Ocupa x 60-1020. */
export const Ocean: React.FC<{ y: number; t: number; o?: number; light?: number }> = ({ y, t, o = 1, light = 1 }) => {
  const sea = `M60,${y} L1020,${y} L1020,${y + 420} L60,${y + 420} Z`;
  const floor = `M60,${y + 40} L170,${y + 60} Q260,${y + 330} 420,${y + 360} Q540,${y + 390} 660,${y + 355} Q820,${y + 320} 900,${y + 70} L1020,${y + 40} L1020,${y + 440} L60,${y + 440} Z`;
  const cable = `M120,${y + 40} Q200,${y + 60} 250,${y + 200} Q300,${y + 345} 420,${y + 350} Q540,${y + 380} 660,${y + 345} Q790,${y + 320} 840,${y + 190} Q880,${y + 70} 960,${y + 40}`;
  return (
    <g opacity={o}>
      <defs><linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.sea} /><stop offset="1" stopColor={C.sea2} /></linearGradient></defs>
      <path d={sea} fill="url(#seaG)" />
      {[0, 1, 2].map((k) => <path key={k} d={Array.from({ length: 25 }).map((_, i) => `${i ? "L" : "M"}${60 + i * 40},${y + 6 * Math.sin(i * 0.9 + t * 2 + k)}`).join(" ")}
        fill="none" stroke={C.water} strokeWidth={4} opacity={0.6 - k * 0.2} transform={`translate(0,${k * 14})`} />)}
      <path d={floor} fill={C.sand} />
      <path d={`M60,${y - 40} L60,${y + 50} L180,${y + 60} L150,${y - 20} Z`} fill={C.land} />
      <path d={`M1020,${y - 40} L1020,${y + 50} L890,${y + 70} L930,${y - 20} Z`} fill={C.land} />
      <path d={cable} fill="none" stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
      <path id="cableP" d={cable} fill="none" stroke={C.case3} strokeWidth={8} strokeLinecap="round" />
      <path d={cable} fill="none" stroke={K.hot} strokeWidth={8} strokeLinecap="round" strokeDasharray="18 52" strokeDashoffset={-t * 220} opacity={light} style={glow(K.hot, 8)} />
    </g>
  );
};

/** Flecha. */
export const Arrow: React.FC<{ x0: number; y0: number; x1: number; y1: number; color?: string; o?: number; w?: number }> = ({ x0, y0, x1, y1, color = K.white, o = 1, w = 8 }) => {
  const a = Math.atan2(y1 - y0, x1 - x0), h = 26;
  return (
    <g opacity={clamp01(o)}>
      <line x1={x0} y1={y0} x2={x1 - Math.cos(a) * h * 0.6} y2={y1 - Math.sin(a) * h * 0.6} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${x1},${y1} L${x1 - Math.cos(a - 0.5) * h},${y1 - Math.sin(a - 0.5) * h} L${x1 - Math.cos(a + 0.5) * h},${y1 - Math.sin(a + 0.5) * h} Z`} fill={color} />
    </g>
  );
};
