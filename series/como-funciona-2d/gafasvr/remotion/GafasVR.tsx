// Dibujos SVG del episodio «Cómo funcionan las gafas de realidad virtual». Coordenadas absolutas de 1080×1920.
// Colores de código: cian = luz/visión/aire, amarillo = lo importante, naranja = energía/movimiento, rojo = error/mareo.
// Grises azulados para carcasas. Sin marcas: gafas, cámaras y sensores genéricos.
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F", inner: "#0B1A30", sky: "#123A66", ground: "#1E5A46",
  skin: "#C98E74", skin2: "#A66C55", brain: "#F2A7C3", brain2: "#C9728F", hole: "#0B1B34" };

/** Línea de flujo animada (trazo discontinuo que avanza). */
export const Flow: React.FC<{ d: string; t: number; color?: string; w?: number; o?: number; speed?: number }> = ({ d, t, color = K.flow, w = 10, o = 1, speed = 160 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    <path d={d} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={w + 8} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="22 18" strokeDashoffset={-t * speed} />
  </g>
);

/** Cubo isométrico (el «objeto» que ven los ojos). */
export const Cube: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M0,-60 L52,-30 L0,0 L-52,-30 Z" fill={K.flow} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M-52,-30 L0,0 L0,60 L-52,30 Z" fill={K.hot} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M52,-30 L0,0 L0,60 L52,30 Z" fill="#C85A10" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

/** Paisaje mini (lo que se ve en cada mitad de la pantalla). Centrado en (0,0), tamaño w×h. dx = desplazamiento del primer plano. pan = giro de la vista. */
export const MiniScene: React.FC<{ id: string; w: number; h: number; dx?: number; t: number; pan?: number }> = ({ id, w, h, dx = 0, t, pan = 0 }) => {
  const g = h * 0.22;
  const m = (k: number) => -w / 2 + ((k * w * 0.5 - pan * 0.6) % (w * 1.5) + w * 1.5) % (w * 1.5) - w * 0.25;
  return (
    <g>
      <defs><clipPath id={id}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={Math.min(24, w * 0.06)} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={C.sky} />
        <circle cx={w * 0.28 + dx * 0.1 - pan * 0.3} cy={-h * 0.24} r={h * 0.1} fill={K.white} opacity={0.85} />
        {[0, 1, 2].map((k) => { const mx = m(k) + dx * 0.25; return (
          <path key={k} d={`M${mx - w * 0.3},${g} L${mx},${-h * 0.12} L${mx + w * 0.3},${g} Z`} fill={k % 2 ? "#2A5E8E" : "#21507C"} />); })}
        <rect x={-w / 2} y={g} width={w} height={h} fill={C.ground} />
        <g transform={`translate(${dx - pan},${g - h * 0.02 + 3 * Math.sin(t * 2)})`}><Cube x={0} y={-h * 0.1} s={h / 300} /></g>
      </g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={Math.min(24, w * 0.06)} fill="none" stroke={C.ink} strokeWidth={5} />
    </g>
  );
};

/** Pantalla partida en dos: dos imágenes casi iguales, con el primer plano desplazado (±d). */
export const SplitScreen: React.FC<{ id: string; x: number; y: number; w: number; h: number; t: number; d?: number; div?: number; guides?: number; pan?: number }> =
  ({ id, x, y, w, h, t, d = 14, div = 0, guides = 0, pan = 0 }) => {
    const hw = w / 2 - 4;
    return (
      <g transform={`translate(${x},${y})`}>
        <rect x={-w / 2 - 14} y={-h / 2 - 14} width={w + 28} height={h + 28} rx={22} fill={C.ink} />
        <g transform={`translate(${-w / 4 - 2},0)`}><MiniScene id={`${id}L`} w={hw} h={h} dx={d} t={t} pan={pan} /></g>
        <g transform={`translate(${w / 4 + 2},0)`}><MiniScene id={`${id}R`} w={hw} h={h} dx={-d} t={t} pan={pan} /></g>
        {div > 0.01 && <rect x={-5} y={-h / 2 - 10} width={10} height={h + 20} rx={5} fill={K.flow} opacity={div} style={{ filter: `drop-shadow(0 0 10px ${K.flow})` }} />}
        {guides > 0.01 && [-1, 1].map((k) => (
          <line key={k} x1={k * (w / 4 + 2) + (k < 0 ? d : -d) - pan} y1={-h / 2 + 6} x2={k * (w / 4 + 2) + (k < 0 ? d : -d) - pan} y2={h / 2 - 6}
            stroke={K.flow} strokeWidth={4} strokeDasharray="12 10" opacity={guides} />
        ))}
        {guides > 0.01 && [-1, 1].map((k) => (
          <line key={`c${k}`} x1={k * (w / 4 + 2)} y1={-h / 2 + 6} x2={k * (w / 4 + 2)} y2={h / 2 - 6} stroke={K.white} strokeWidth={3} strokeDasharray="6 10" opacity={guides * 0.6} />
        ))}
      </g>
    );
  };

/** Gafas de realidad virtual vistas de frente. open: la tapa frontal se levanta y deja ver la pantalla partida. */
export const Headset: React.FC<{ id: string; x: number; y: number; s?: number; t: number; open?: number; lenses?: number; cams?: number; camGlow?: number; strap?: boolean; d?: number; div?: number; o?: number }> =
  ({ id, x, y, s = 1, t, open = 0, lenses = 0, cams = 1, camGlow = 0, strap = true, d = 14, div = 0, o = 1 }) => (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      {strap && <path d="M-300,-60 C-420,-70 -430,70 -300,60 M300,-60 C420,-70 430,70 300,60" fill="none" stroke="#1A2E4A" strokeWidth={34} strokeLinecap="round" />}
      <rect x={-320} y={-150} width={640} height={300} rx={110} fill={C.case1} stroke={C.ink} strokeWidth={6} />
      <rect x={-292} y={-126} width={584} height={252} rx={92} fill={C.inner} />
      <SplitScreen id={`${id}s`} x={0} y={-8} w={520} h={196} t={t} d={d} div={div} />
      {lenses > 0.01 && [-1, 1].map((k) => (
        <g key={k} opacity={lenses}>
          <circle cx={k * 132} cy={-6} r={92} fill="rgba(180,225,255,0.13)" stroke={C.case3} strokeWidth={7} />
          <path d={`M${k * 132 - 58},${-44} A70,70 0 0 1 ${k * 132 - 10},${-74}`} fill="none" stroke={K.white} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
        </g>
      ))}
      <path d="M-78,152 Q0,40 78,152 Z" fill={C.hole} stroke={C.ink} strokeWidth={6} />
      {/* tapa frontal (con cámaras) */}
      {(
        <g transform={`translate(0,${-open * 240}) rotate(${-9 * open}) scale(${1 - 0.38 * open})`} opacity={1 - 0.15 * open}>
          <rect x={-320} y={-150} width={640} height={300} rx={110} fill={C.case2} stroke={C.ink} strokeWidth={6} />
          <path d="M-250,-110 Q0,-140 250,-110" fill="none" stroke={K.white} strokeWidth={8} strokeLinecap="round" opacity={0.25} />
          {cams > 0.01 && [[-238, -82], [238, -82], [-238, 82], [238, 82]].map(([cx, cy], k) => (
            <g key={k} opacity={cams}>
              <circle cx={cx} cy={cy} r={24} fill={C.ink} stroke={C.case3} strokeWidth={5} />
              <circle cx={cx} cy={cy} r={10} fill={camGlow > 0.01 ? K.cold : "#33435c"} opacity={camGlow > 0.01 ? 0.5 + 0.5 * camGlow : 1}
                style={camGlow > 0.01 ? { filter: `drop-shadow(0 0 ${12 * camGlow}px ${K.cold})` } : undefined} />
            </g>
          ))}
        </g>
      )}
    </g>
  );

/** Ojo visto de frente (look = desplazamiento de la pupila en px). */
export const Eye: React.FC<{ x: number; y: number; r?: number; look?: [number, number]; o?: number; blink?: number }> = ({ x, y, r = 60, look = [0, 0], o = 1, blink = 0 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <ellipse rx={r * 1.35} ry={r * (1 - 0.9 * blink)} fill={K.white} stroke={C.ink} strokeWidth={5} />
    {blink < 0.7 && <>
      <circle cx={look[0]} cy={look[1]} r={r * 0.55} fill={K.cold} stroke={C.ink} strokeWidth={4} />
      <circle cx={look[0]} cy={look[1]} r={r * 0.26} fill={C.ink} />
      <circle cx={look[0] + r * 0.16} cy={look[1] - r * 0.18} r={r * 0.1} fill={K.white} />
    </>}
  </g>
);

/** Cerebro esquemático. wob = temblor (lío). glow = brillo amarillo. */
export const Brain: React.FC<{ x: number; y: number; s?: number; t: number; wob?: number; glow?: number; o?: number }> = ({ x, y, s = 1, t, wob = 0, glow = 0, o = 1 }) => (
  <g transform={`translate(${x + wob * 10 * Math.sin(t * 40)},${y}) rotate(${wob * 6 * Math.sin(t * 23)}) scale(${s})`} opacity={o}>
    <path d="M-120,10 C-150,-60 -90,-120 -30,-105 C0,-140 70,-130 90,-90 C150,-85 160,0 125,30 C130,80 70,105 30,90 C0,115 -60,110 -80,80 C-130,85 -150,40 -120,10 Z"
      fill={C.brain} stroke={C.ink} strokeWidth={6} style={glow > 0.01 ? { filter: `drop-shadow(0 0 ${22 * glow}px ${K.flow})` } : undefined} />
    <path d="M0,-100 C-15,-50 15,-20 -5,30 C-15,60 10,80 5,95 M-90,-40 C-60,-50 -50,-20 -70,10 M60,-80 C40,-50 80,-30 60,0 M40,30 C70,20 90,50 100,40 M-110,40 C-80,30 -60,60 -40,50"
      fill="none" stroke={C.brain2} strokeWidth={7} strokeLinecap="round" />
  </g>
);

/** Cabeza de perfil (mirando a la derecha) con las gafas puestas. */
export const HeadSide: React.FC<{ x: number; y: number; s?: number; rot?: number; o?: number }> = ({ x, y, s = 1, rot = 0, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={-60} y={110} width={110} height={150} rx={30} fill={C.skin2} />
    <g transform={`rotate(${rot} 0 80)`}>
      <path d="M-130,-10 C-140,-140 40,-190 120,-90 C150,-50 150,-10 160,20 L190,60 L160,70 C165,120 140,150 90,150 C40,165 -10,150 -40,130 C-110,110 -125,60 -130,-10 Z" fill={C.skin} stroke={C.ink} strokeWidth={6} />
      <path d="M-130,-30 C-140,-150 40,-200 125,-95 C60,-130 -40,-120 -90,-40 Z" fill="#3A2A22" />
      <ellipse cx={-30} cy={30} rx={26} ry={36} fill={C.skin2} stroke={C.ink} strokeWidth={4} />
      <path d="M-40,-30 C-60,-30 -70,60 -40,70" fill="none" stroke="#1A2E4A" strokeWidth={26} strokeLinecap="round" />
      <path d="M-40,-30 L80,-35 M-40,70 L80,60" stroke="#1A2E4A" strokeWidth={22} strokeLinecap="round" />
      <rect x={70} y={-60} width={140} height={130} rx={36} fill={C.case2} stroke={C.ink} strokeWidth={6} />
      <circle cx={190} cy={-30} r={11} fill={C.ink} stroke={C.case3} strokeWidth={3} />
    </g>
  </g>
);

/** Cabeza vista desde arriba (la nariz apunta a «yaw» grados; 0 = arriba). */
export const HeadTop: React.FC<{ x: number; y: number; s?: number; yaw?: number; o?: number }> = ({ x, y, s = 1, yaw = 0, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${yaw})`} opacity={o}>
    <ellipse cx={-92} cy={10} rx={18} ry={30} fill={C.skin2} stroke={C.ink} strokeWidth={4} />
    <ellipse cx={92} cy={10} rx={18} ry={30} fill={C.skin2} stroke={C.ink} strokeWidth={4} />
    <ellipse cx={0} cy={10} rx={90} ry={100} fill="#3A2A22" stroke={C.ink} strokeWidth={6} />
    <path d="M-95,-10 C-100,70 100,70 95,-10" fill="none" stroke="#1A2E4A" strokeWidth={20} />
    <rect x={-80} y={-125} width={160} height={70} rx={24} fill={C.case2} stroke={C.ink} strokeWidth={6} />
    <path d="M0,-150 l-14,22 l28,0 Z" fill={K.flow} />
  </g>
);

/** Oído interno esquemático: tres canales semicirculares + caracol. mov = líquido que se agita. */
export const InnerEar: React.FC<{ x: number; y: number; s?: number; t: number; mov?: number; o?: number }> = ({ x, y, s = 1, t, mov = 0, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-20,0 C-30,-120 60,-130 50,-30" fill="none" stroke="#E8C9B6" strokeWidth={22} strokeLinecap="round" />
    <path d="M-20,0 C-140,-30 -120,-120 -40,-70" fill="none" stroke="#E8C9B6" strokeWidth={22} strokeLinecap="round" />
    <path d="M10,10 C80,60 140,0 90,-40" fill="none" stroke="#E8C9B6" strokeWidth={22} strokeLinecap="round" />
    <ellipse cx={0} cy={10} rx={46} ry={34} fill="#E8C9B6" />
    <path d="M30,40 C80,40 110,90 80,130 C50,165 -10,140 0,100 C10,70 50,80 45,105" fill="none" stroke="#E8C9B6" strokeWidth={24} strokeLinecap="round" />
    {/* líquido de los canales */}
    <path d="M-20,0 C-30,-120 60,-130 50,-30" fill="none" stroke={K.cold} strokeWidth={8} strokeLinecap="round" strokeDasharray="14 22" strokeDashoffset={-t * 120 * mov} />
    <path d="M-20,0 C-140,-30 -120,-120 -40,-70" fill="none" stroke={K.cold} strokeWidth={8} strokeLinecap="round" strokeDasharray="14 22" strokeDashoffset={-t * 120 * mov} />
  </g>
);

/** Mano abierta con esqueleto de puntos (seguimiento por cámara). */
export const Hand: React.FC<{ x: number; y: number; s?: number; t: number; dots?: number; o?: number }> = ({ x, y, s = 1, t, dots = 0, o = 1 }) => {
  const fingers = [[-62, -40, -14, 120], [-24, -56, -4, 150], [16, -56, 4, 160], [54, -48, 12, 140]];
  const bend = 6 * Math.sin(t * 3);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      <rect x={-50} y={90} width={100} height={110} rx={30} fill={C.skin2} />
      {fingers.map(([fx, fy, rot, len], k) => (
        <rect key={k} x={fx - 18} y={fy - len} width={36} height={len + 20} rx={18} fill={C.skin} stroke={C.ink} strokeWidth={5} transform={`rotate(${rot + (k === 1 ? bend : 0)} ${fx} ${fy})`} />
      ))}
      <rect x={-90} y={-30} width={46} height={110} rx={22} fill={C.skin} stroke={C.ink} strokeWidth={5} transform="rotate(-48 -60 60)" />
      <rect x={-80} y={-60} width={160} height={170} rx={50} fill={C.skin} stroke={C.ink} strokeWidth={5} />
      {dots > 0.01 && (
        <g opacity={dots}>
          {fingers.map(([fx, fy, rot, len], k) => {
            const a = ((rot + (k === 1 ? bend : 0)) * Math.PI) / 180;
            const pts = [0, 0.45, 0.9].map((f) => [fx + Math.sin(a) * len * f, fy - Math.cos(a) * len * f]);
            return (
              <g key={k}>
                <path d={`M0,70 L${pts[0][0]},${pts[0][1]} L${pts[1][0]},${pts[1][1]} L${pts[2][0]},${pts[2][1]}`} fill="none" stroke={K.cold} strokeWidth={5} />
                {pts.map(([px, py], j) => <circle key={j} cx={px} cy={py} r={9} fill={K.flow} stroke={C.ink} strokeWidth={3} />)}
              </g>
            );
          })}
          <path d="M0,70 L-75,10 L-105,-30" fill="none" stroke={K.cold} strokeWidth={5} />
          <circle cx={-75} cy={10} r={9} fill={K.flow} stroke={C.ink} strokeWidth={3} />
          <circle cx={-105} cy={-30} r={9} fill={K.flow} stroke={C.ink} strokeWidth={3} />
          <circle cx={0} cy={70} r={11} fill={K.flow} stroke={C.ink} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

/** Giroscopio: tres anillos que giran. */
export const Gyro: React.FC<{ x: number; y: number; r?: number; t: number; o?: number; color?: string }> = ({ x, y, r = 80, t, o = 1, color = K.hot }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <ellipse rx={r} ry={r * Math.abs(Math.cos(t * 2))} fill="none" stroke={color} strokeWidth={8} />
    <ellipse rx={r * Math.abs(Math.cos(t * 1.4 + 1))} ry={r} fill="none" stroke={K.flow} strokeWidth={8} />
    <ellipse rx={r} ry={r * 0.35} fill="none" stroke={K.cold} strokeWidth={8} transform={`rotate(${t * 60})`} />
    <circle r={16} fill={K.white} />
  </g>
);

/** Acelerómetro esquemático: caja con una bolita colgada de un muelle (la gravedad tira hacia abajo). */
export const Accel: React.FC<{ x: number; y: number; s?: number; t: number; o?: number; pull?: number }> = ({ x, y, s = 1, t, o = 1, pull = 0 }) => {
  const by = 20 + 26 * pull + 5 * Math.sin(t * 5);
  const coils = Array.from({ length: 7 }).map((_, i) => `L${i % 2 ? 14 : -14},${-60 + ((by + 60 - 30) * (i + 1)) / 8}`).join(" ");
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      <rect x={-70} y={-80} width={140} height={170} rx={20} fill={C.ink} stroke={C.case3} strokeWidth={6} />
      <path d={`M0,-60 ${coils} L0,${by - 30}`} fill="none" stroke={C.case3} strokeWidth={5} />
      <circle cx={0} cy={by} r={28} fill={K.hot} stroke={C.ink} strokeWidth={4} />
    </g>
  );
};
export { clamp01 };
