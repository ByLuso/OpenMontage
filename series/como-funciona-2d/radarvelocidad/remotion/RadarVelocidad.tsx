// Dibujos SVG del episodio «radar de velocidad». Todos son <g> para meter dentro de un <svg 1080×1920>.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#06101F", metal: "#C9D3E0", rubber: "#151d2a", road: "#1B2D47", glass: "#7FD6F5" };

const glow = (v: number, col: string, px = 16) => (v > 0.05 ? { filter: `drop-shadow(0 0 ${px * v}px ${col})` } : {});
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Caja de radar fijo de carretera, de frente, sobre un poste. (x, y) = centro del borde superior de la caja (360×420 a escala 1).
 *  open: la tapa se parte en dos y se separa (deja ver la antena). La lente de la cámara se ve siempre por su ventana. */
export const RadarBox: React.FC<{ x: number; y: number; s?: number; t: number; open?: number; lensHi?: number; antHi?: number; flash?: number; pole?: number; o?: number }> =
  ({ x, y, s = 1, t, open = 0, lensHi = 0, antHi = 0, flash = 0, pole = 300, o = 1 }) => {
    const sep = 210 * open;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
        <rect x={-24} y={420} width={48} height={pole} fill={C.case1} stroke={C.case3} strokeWidth={4} />
        {/* caja (interior) */}
        <rect x={-180} y={0} width={360} height={420} rx={26} fill={C.dark} stroke={C.case3} strokeWidth={6} />
        {/* antena de microondas: rejilla de parches */}
        <g style={glow(antHi, K.cold, 22)}>
          <rect x={-135} y={36} width={270} height={170} rx={12} fill={C.case1} stroke={antHi > 0.05 ? K.cold : C.case3} strokeWidth={5} />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x={-112 + (i % 4) * 60} y={56 + Math.floor(i / 4) * 50} width={44} height={32} rx={5} fill={K.cold}
              opacity={0.35 + 0.65 * antHi * (0.6 + 0.4 * Math.sin(t * 6 + i))} />
          ))}
        </g>
        <rect x={-150} y={240} width={300} height={8} rx={4} fill={C.case2} />
        {/* tapa partida en dos */}
        {[-1, 1].map((side) => (
          <g key={side} transform={`translate(${side * sep} 0)`} opacity={1 - 0.55 * open}>
            <path d={side < 0 ? "M 0 0 H -154 Q -180 0 -180 26 V 394 Q -180 420 -154 420 H 0 Z" : "M 0 0 H 154 Q 180 0 180 26 V 394 Q 180 420 154 420 H 0 Z"}
              fill={C.case2} stroke={C.case3} strokeWidth={6} />
            <rect x={side < 0 ? -150 : 20} y={30} width={130} height={22} rx={6} fill={C.case1} />
            <rect x={side < 0 ? -150 : 20} y={66} width={130} height={22} rx={6} fill={C.case1} />
          </g>
        ))}
        {/* ventana de la cámara y flash */}
        <rect x={-110} y={250} width={220} height={140} rx={20} fill={C.dark} stroke={C.case3} strokeWidth={5} />
        <g style={glow(lensHi, K.flow, 20)}>
          <circle cx={-20} cy={320} r={56} fill={C.case1} stroke={lensHi > 0.05 ? K.flow : C.metal} strokeWidth={6} />
          <circle cx={-20} cy={320} r={34} fill={C.dark} />
          <circle cx={-32} cy={308} r={9} fill={C.glass} opacity={0.8} />
        </g>
        <rect x={52} y={282} width={44} height={76} rx={8} fill={flash > 0.05 ? K.white : C.case3} style={glow(flash, K.white, 40)} />
      </g>
    );
  };

/** Coche de perfil mirando a la izquierda, con las ruedas apoyadas en y. spin: giro de ruedas (rad). old: coche antiguo redondeado. */
export const Car: React.FC<{ x: number; y: number; s?: number; spin?: number; col?: string; old?: boolean; o?: number; plate?: boolean }> =
  ({ x, y, s = 1, spin = 0, col = K.hot, old = false, o = 1, plate = true }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {old ? (
        <>
          <path d="M -175 -40 Q -180 -95 -110 -100 L -70 -100 Q -50 -175 30 -175 Q 110 -175 130 -100 L 160 -95 Q 185 -90 180 -40 Z" fill={col} stroke={C.dark} strokeWidth={5} />
          <path d="M -40 -105 Q -25 -158 25 -158 Q 85 -158 100 -105 Z" fill={C.glass} opacity={0.85} />
          <path d="M -150 -40 Q -150 -95 -100 -95 Q -55 -95 -55 -40 Z M 60 -40 Q 60 -95 110 -95 Q 160 -95 160 -40 Z" fill={C.dark} opacity={0.35} />
        </>
      ) : (
        <>
          <path d="M -180 -40 L -175 -95 Q -170 -110 -150 -112 L -95 -118 L -45 -172 Q -35 -180 -20 -180 L 85 -180 Q 105 -180 118 -165 L 160 -118 Q 180 -112 182 -92 L 185 -40 Z" fill={col} stroke={C.dark} strokeWidth={5} />
          <path d="M -78 -120 L -36 -164 L 30 -164 L 30 -120 Z M 44 -120 L 44 -164 L 92 -164 L 130 -120 Z" fill={C.glass} opacity={0.85} />
          <rect x={-186} y={-92} width={22} height={16} rx={5} fill={K.flow} />
        </>
      )}
      {plate && <rect x={-188} y={-64} width={14} height={30} rx={3} fill={K.white} />}
      {[-105, 110].map((wx) => (
        <g key={wx} transform={`translate(${wx} -38) rotate(${(spin * 180) / Math.PI})`}>
          <circle r={40} fill={C.rubber} stroke={C.dark} strokeWidth={4} />
          <circle r={20} fill={C.metal} />
          {[0, 1, 2].map((k) => <rect key={k} x={-3} y={-20} width={6} height={40} fill={C.case1} transform={`rotate(${k * 60})`} />)}
        </g>
      ))}
    </g>
  );

/** Coche visto desde arriba, morro hacia arriba, centrado en (x, y). */
export const CarTop: React.FC<{ x: number; y: number; s?: number; col?: string; o?: number }> = ({ x, y, s = 1, col = K.hot, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-58} y={-110} width={116} height={220} rx={36} fill={col} stroke={C.dark} strokeWidth={5} />
    <path d="M -44 -52 Q 0 -70 44 -52 L 38 -18 L -38 -18 Z" fill={C.glass} opacity={0.85} />
    <path d="M -40 50 L 40 50 L 44 78 Q 0 90 -44 78 Z" fill={C.glass} opacity={0.6} />
    <rect x={-30} y={96} width={60} height={14} rx={3} fill={K.white} />
  </g>
);

/** Ondas que salen de (x, y) hacia una dirección (grados), como arcos que se alejan. */
export const Arcs: React.FC<{ x: number; y: number; dir: number; t: number; spread?: number; len?: number; n?: number; speed?: number; color?: string; o?: number; w?: number }> =
  ({ x, y, dir, t, spread = 50, len = 400, n = 4, speed = 0.9, color = K.cold, o = 1, w = 8 }) => o <= 0.01 ? null : (
    <g opacity={o}>
      {Array.from({ length: n }).map((_, k) => {
        const p = mod(t * speed + k / n, 1);
        const r = 30 + p * len;
        const a0 = ((dir - spread / 2) * Math.PI) / 180, a1 = ((dir + spread / 2) * Math.PI) / 180;
        return <path key={k} d={`M ${x + r * Math.cos(a0)} ${y + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${x + r * Math.cos(a1)} ${y + r * Math.sin(a1)}`}
          fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" opacity={(1 - p) * 0.95} />;
      })}
    </g>
  );

/** Tira de onda (seno) entre x0 y x1; lam = longitud de onda en px. */
export const WaveStrip: React.FC<{ x0: number; x1: number; y: number; lam: number; amp?: number; t: number; speed?: number; color?: string; o?: number; w?: number }> =
  ({ x0, x1, y, lam, amp = 30, t, speed = 160, color = K.cold, o = 1, w = 7 }) => {
    if (o <= 0.01) return null;
    let d = "";
    for (let x = x0; x <= x1; x += 4) {
      const yy = y + amp * Math.sin(((x - t * speed) / lam) * 2 * Math.PI);
      d += `${x === x0 ? "M" : "L"} ${x.toFixed(1)} ${yy.toFixed(1)} `;
    }
    return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" opacity={o} style={glow(0.6, color, 10)} />;
  };

/** Tira de onda «diferencia» (batido): seno rápido con envolvente lenta. */
export const BeatStrip: React.FC<{ x0: number; x1: number; y: number; t: number; o?: number; color?: string }> = ({ x0, x1, y, t, o = 1, color = K.white }) => {
  if (o <= 0.01) return null;
  let d = "", env = "";
  for (let x = x0; x <= x1; x += 4) {
    const e = Math.cos(((x - t * 120) / 520) * Math.PI);
    d += `${x === x0 ? "M" : "L"} ${x} ${(y + 44 * e * Math.sin((x / 46) * 2 * Math.PI)).toFixed(1)} `;
    env += `${x === x0 ? "M" : "L"} ${x} ${(y - 44 * Math.abs(e)).toFixed(1)} `;
  }
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke={color} strokeWidth={4} opacity={0.55} />
      <path d={env} fill="none" stroke={K.flow} strokeWidth={7} strokeLinecap="round" style={glow(0.7, K.flow, 10)} />
    </g>
  );
};

/** Carretera de perfil con rayas que corren (velocidad v en px/s hacia la derecha = el coche va a la izquierda). */
export const RoadSide: React.FC<{ y: number; t: number; v?: number; x0?: number; x1?: number }> = ({ y, t, v = 0, x0 = 60, x1 = 1020 }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={26} fill={C.road} />
    <path d={`M ${x0} ${y} H ${x1}`} stroke={C.case3} strokeWidth={6} />
    {Array.from({ length: 9 }).map((_, k) => {
      const xx = x0 + mod(k * 120 + t * v, x1 - x0 + 120) - 60;
      return xx < x0 || xx > x1 - 60 ? null : <rect key={k} x={xx} y={y + 10} width={60} height={7} rx={3} fill={C.case3} opacity={0.7} />;
    })}
  </g>
);

/** Líneas de velocidad detrás del coche. */
export const SpeedLines: React.FC<{ x: number; y: number; t: number; o?: number }> = ({ x, y, t, o = 1 }) => o <= 0.01 ? null : (
  <g opacity={o} stroke={K.white} strokeWidth={6} strokeLinecap="round">
    {[0, 1, 2].map((k) => { const p = mod(t * 2.2 + k / 3, 1); return <path key={k} d={`M ${x + 20 + p * 60} ${y - 40 - k * 40} h ${70 - p * 40}`} opacity={1 - p} />; })}
  </g>
);

/** Flecha recta. */
export const Arrow: React.FC<{ x0: number; y0: number; x1: number; y1: number; color?: string; o?: number; w?: number }> = ({ x0, y0, x1, y1, color = K.flow, o = 1, w = 10 }) => {
  if (o <= 0.01) return null;
  const a = Math.atan2(y1 - y0, x1 - x0);
  const h = 26;
  return (
    <g opacity={o} style={glow(0.7, color, 8)}>
      <path d={`M ${x0} ${y0} L ${x1 - Math.cos(a) * h * 0.6} ${y1 - Math.sin(a) * h * 0.6}`} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M ${x1} ${y1} L ${x1 - h * Math.cos(a - 0.5)} ${y1 - h * Math.sin(a - 0.5)} L ${x1 - h * Math.cos(a + 0.5)} ${y1 - h * Math.sin(a + 0.5)} Z`} fill={color} />
    </g>
  );
};

/** Pistola láser (lidar) mirando a la derecha, con la boca en (x + 100·s, y). */
export const LidarGun: React.FC<{ x: number; y: number; s?: number; hi?: number; o?: number }> = ({ x, y, s = 1, hi = 0, o = 1 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-100} y={-42} width={170} height={74} rx={16} fill={C.case2} stroke={C.case3} strokeWidth={5} />
    <rect x={60} y={-34} width={40} height={58} rx={8} fill={C.case1} stroke={C.case3} strokeWidth={4} />
    <circle cx={92} cy={-5} r={16} fill={K.hot} opacity={0.4 + 0.6 * hi} style={glow(hi, K.hot, 18)} />
    <rect x={-80} y={-60} width={60} height={20} rx={5} fill={C.case1} />
    <path d="M -60 32 L -84 130 H -40 L -18 32 Z" fill={C.case1} stroke={C.case3} strokeWidth={4} />
  </g>
);

/** Pórtico de tramo visto desde arriba (barra horizontal sobre la carretera) con dos cámaras. read: cono de lectura (0-1). col: color del cono. */
export const GantryTop: React.FC<{ y: number; x0?: number; x1?: number; read?: number; col?: string; dir?: 1 | -1 }> = ({ y, x0 = 330, x1 = 750, read = 0, col = K.flow, dir = 1 }) => (
  <g>
    {read > 0.01 && [450, 630].map((cx) => (
      <path key={cx} d={`M ${cx} ${y} L ${cx - 70} ${y + dir * 150} L ${cx + 70} ${y + dir * 150} Z`} fill={col} opacity={0.28 * read} style={glow(read, col, 14)} />
    ))}
    <rect x={x0} y={y - 14} width={x1 - x0} height={28} rx={8} fill={C.case2} stroke={C.case3} strokeWidth={4} />
    <rect x={x0 - 24} y={y - 30} width={36} height={60} rx={6} fill={C.case1} stroke={C.case3} strokeWidth={4} />
    <rect x={x1 - 12} y={y - 30} width={36} height={60} rx={6} fill={C.case1} stroke={C.case3} strokeWidth={4} />
    {[450, 630].map((cx) => <rect key={cx} x={cx - 26} y={y - 22} width={52} height={44} rx={8} fill={C.dark} stroke={read > 0.05 ? col : C.metal} strokeWidth={4} />)}
  </g>
);

/** Carretera vista desde arriba (vertical) con rayas centrales que bajan (v px/s). */
export const RoadTop: React.FC<{ y0: number; y1: number; t: number; v?: number; dark?: number }> = ({ y0, y1, t, v = 0, dark = 0 }) => (
  <g>
    {dark > 0.01 && <rect x={0} y={0} width={1080} height={1920} fill="#020812" opacity={0.55 * dark} />}
    <rect x={360} y={y0} width={360} height={y1 - y0} fill={C.road} />
    <path d={`M 360 ${y0} V ${y1} M 720 ${y0} V ${y1}`} stroke={C.case3} strokeWidth={6} />
    {Array.from({ length: 10 }).map((_, k) => {
      const yy = y0 + mod(k * 100 + t * v, y1 - y0);
      return yy > y1 - 50 ? null : <rect key={k} x={536} y={yy} width={8} height={50} rx={3} fill={C.case3} opacity={0.6} />;
    })}
    
  </g>
);

/** Panel de datos (rectángulo oscuro con texto en SVG). */
export const Panel: React.FC<{ x: number; y: number; w: number; h: number; lines: { text: string; color?: string; size?: number }[]; o?: number; border?: string }> =
  ({ x, y, w, h, lines, o = 1, border = C.case3 }) => o <= 0.01 ? null : (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={16} fill={C.dark} stroke={border} strokeWidth={5} />
      {lines.map((l, i) => (
        <text key={i} x={x} y={y - ((lines.length - 1) * (l.size ?? 40) * 0.6) + i * (l.size ?? 40) * 1.2 + (l.size ?? 40) * 0.35} textAnchor="middle"
          fontFamily="MontserratSerie" fontWeight={900} fontSize={l.size ?? 40} fill={l.color ?? K.white}>{l.text}</text>
      ))}
    </g>
  );

/** Foto de la cámara: marco con el morro del coche y la matrícula. */
export const Photo: React.FC<{ x: number; y: number; p: number; plateHi?: number }> = ({ x, y, p, plateHi = 0 }) => p <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) rotate(${-4 * (1 - p) + 3}) scale(${0.7 + 0.3 * p})`} opacity={Math.min(1, p * 1.5)}>
    <rect x={-250} y={-160} width={500} height={320} rx={10} fill={K.white} />
    <rect x={-232} y={-142} width={464} height={250} fill="#16294A" />
    {/* morro del coche de frente */}
    <path d="M -170 90 L -160 -10 Q -150 -40 -110 -48 L -70 -100 L 70 -100 L 110 -48 Q 150 -40 160 -10 L 170 90 Z" fill={K.hot} />
    <path d="M -60 -90 L 60 -90 L 92 -50 L -92 -50 Z" fill={C.glass} opacity={0.85} />
    <circle cx={-118} cy={-8} r={18} fill={K.flow} /><circle cx={118} cy={-8} r={18} fill={K.flow} />
    <g style={glow(plateHi, K.flow, 16)}>
      <rect x={-100} y={22} width={200} height={50} rx={6} fill={K.white} stroke={plateHi > 0.05 ? K.flow : C.dark} strokeWidth={5} />
      <text x={0} y={60} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={36} fill={C.dark}>1234 XYZ</text>
    </g>
    <text x={-220} y={140} fontFamily="MontserratSerie" fontWeight={800} fontSize={22} fill={C.dark}>FOTO · PRUEBA</text>
  </g>
);

/** Destello blanco radial. */
export const Flash: React.FC<{ x: number; y: number; p: number; r?: number }> = ({ x, y, p, r = 260 }) => p <= 0.01 ? null : (
  <g opacity={p}>
    <circle cx={x} cy={y} r={r * (0.5 + 0.5 * p)} fill={K.white} opacity={0.25} />
    <circle cx={x} cy={y} r={r * 0.35} fill={K.white} opacity={0.6} />
    {Array.from({ length: 8 }).map((_, k) => {
      const a = (k / 8) * 2 * Math.PI;
      return <path key={k} d={`M ${x + 60 * Math.cos(a)} ${y + 60 * Math.sin(a)} L ${x + r * Math.cos(a)} ${y + r * Math.sin(a)}`} stroke={K.white} strokeWidth={8} strokeLinecap="round" />;
    })}
  </g>
);

/** Radar antiguo (años 40) sobre un trípode: caja con dos bocinas y un reloj con aguja. */
export const OldRadar: React.FC<{ x: number; y: number; t: number; s?: number; needle?: number; o?: number }> = ({ x, y, t, s = 1, needle = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M 0 120 L -90 380 M 0 120 L 90 380 M 0 120 L 0 380" stroke={C.case3} strokeWidth={12} strokeLinecap="round" />
    <rect x={-130} y={-20} width={240} height={150} rx={14} fill="#5B6B57" stroke={C.case3} strokeWidth={6} />
    {[-1, 1].map((k) => <path key={k} d={`M 110 ${35 + k * 38} L 200 ${35 + k * 38 - 40} V ${35 + k * 38 + 40} Z`} fill={C.metal} stroke={C.case3} strokeWidth={4} />)}
    <circle cx={-40} cy={55} r={50} fill={K.white} stroke={C.dark} strokeWidth={5} />
    <path d="M -80 55 A 40 40 0 0 1 0 55" fill="none" stroke={C.dark} strokeWidth={3} />
    <g transform={`translate(-40 55) rotate(${-80 + 120 * needle + 6 * Math.sin(t * 5)})`}><rect x={-3} y={-42} width={6} height={42} fill={K.warn} /></g>
    <circle cx={-40} cy={55} r={7} fill={C.dark} />
  </g>
);

/** Boca de túnel de frente con farolas que pasan, y pórtico de cámaras encima. */
export const Tunnel: React.FC<{ t: number; camHi?: number; o?: number }> = ({ t, camHi = 0, o = 1 }) => (
  <g opacity={o}>
    <path d="M 100 1110 V 760 Q 100 480 540 480 Q 980 480 980 760 V 1110 Z" fill={C.case2} stroke={C.case3} strokeWidth={6} />
    <path d="M 200 1110 V 790 Q 200 580 540 580 Q 880 580 880 790 V 1110 Z" fill="#030a16" />
    {/* farolas del interior que se acercan */}
    {Array.from({ length: 5 }).map((_, k) => {
      const p = mod(t * 0.45 + k / 5, 1), z = 0.15 + 0.85 * p;
      return [-1, 1].map((sd) => <rect key={`${k}${sd}`} x={540 + sd * 290 * z - 14 * z} y={720 - 40 * z} width={28 * z} height={10 * z} rx={4} fill={K.flow} opacity={0.25 + 0.6 * p} />);
    })}
    <path d="M 420 1110 L 520 640 L 560 640 L 660 1110 Z" fill={C.road} />
    {Array.from({ length: 4 }).map((_, k) => { const p = mod(t * 0.6 + k / 4, 1); return <rect key={k} x={540 - 4 - 6 * p} y={660 + 430 * p * p} width={8 + 12 * p} height={14 + 50 * p} fill={C.case3} opacity={0.7} />; })}
    {/* cámaras sobre la boca */}
    {[400, 680].map((cx) => (
      <g key={cx} style={glow(camHi, K.flow, 16)}>
        <rect x={cx - 40} y={500} width={80} height={56} rx={10} fill={C.dark} stroke={camHi > 0.05 ? K.flow : C.metal} strokeWidth={5} />
        <circle cx={cx} cy={528} r={14} fill={C.case1} stroke={camHi > 0.05 ? K.flow : C.metal} strokeWidth={4} />
      </g>
    ))}
  </g>
);

/** Icono de cámara de fotos. */
export const CamIcon: React.FC<{ x: number; y: number; hi?: number }> = ({ x, y, hi = 0 }) => (
  <g transform={`translate(${x} ${y})`} style={glow(hi, K.flow, 16)}>
    <rect x={-80} y={-50} width={160} height={110} rx={16} fill={C.case2} stroke={hi > 0.05 ? K.flow : C.case3} strokeWidth={5} />
    <rect x={-40} y={-68} width={60} height={24} rx={6} fill={C.case2} stroke={C.case3} strokeWidth={4} />
    <circle cx={0} cy={6} r={36} fill={C.dark} stroke={C.metal} strokeWidth={5} />
    <circle cx={50} cy={-28} r={9} fill={hi > 0.5 ? K.white : C.case3} />
  </g>
);

/** Icono de cronómetro. */
export const Stopwatch: React.FC<{ x: number; y: number; t: number; hi?: number }> = ({ x, y, t, hi = 0 }) => (
  <g transform={`translate(${x} ${y})`} style={glow(hi, K.flow, 16)}>
    <rect x={-14} y={-92} width={28} height={22} rx={5} fill={C.case3} />
    <circle r={70} fill={C.dark} stroke={hi > 0.05 ? K.flow : C.case3} strokeWidth={8} />
    <g transform={`rotate(${hi > 0.05 ? t * 160 : 0})`}><rect x={-4} y={-56} width={8} height={56} rx={3} fill={K.flow} /></g>
    <circle r={8} fill={K.flow} />
  </g>
);
