// Dibujos SVG del episodio «Cómo funciona un detector de humo». Coordenadas absolutas de 1080×1920.
// Colores de código: amarillo = la luz del LED (lo importante), blanco/gris = humo y vapor, cian = el sensor en reposo,
// naranja = fuego/energía, rojo = alarma/peligro. Grises azulados para carcasas. Sin marcas: detector genérico.
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F", dark: "#040A14", shell: "#DCE5EF", shell2: "#B9C8D9",
  brass: "#E0B84A", ceramic: "#C9D6E6", smoke: "#C3CDD9", skin: "#C98E74" };

export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Geometría interna de la cámara (coordenadas locales, radio 300). */
export const CH = { R: 300, ledX: -185, beamY: -40, beamEnd: 195, pd: [45, 150] as [number, number] };

/** Paredes del laberinto: aletas inclinadas alrededor del borde. */
const Vanes: React.FC<{ hi?: number; n?: number }> = ({ hi = 0, n = 16 }) => (
  <g>
    {Array.from({ length: n }).map((_, k) => (
      <g key={k} transform={`rotate(${(k * 360) / n})`}>
        <path d="M222,-6 L286,-44 M256,-26 L262,16" fill="none" stroke={hi > 0.01 ? K.flow : C.case2} strokeOpacity={hi > 0.01 ? 0.55 + 0.45 * hi : 1}
          strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ))}
  </g>
);

/** Partículas de humo que entran por el borde y derivan hacia el centro. Devuelve también las que están dentro del haz. */
const particles = (t: number, n = 34) => Array.from({ length: n }).map((_, i) => {
  const p = (t * 0.16 + rnd(i + 50)) % 1;
  const th = Math.PI * (0.95 + 1.1 * rnd(i)); // entran sobre todo por arriba e izquierda
  const sx = 280 * Math.cos(th), sy = 280 * Math.sin(th);
  const ex = rnd(i + 7) * 340 - 170, ey = CH.beamY + (rnd(i + 9) - 0.5) * 170;
  const k = p * p * (3 - 2 * p);
  const x = sx + (ex - sx) * k + 14 * Math.sin(t * 2 + i), y = sy + (ey - sy) * k + 10 * Math.cos(t * 1.7 + i);
  const inBeam = Math.abs(y - CH.beamY) < 28 && x > CH.ledX + 30 && x < CH.beamEnd;
  return { x, y, o: Math.sin(Math.PI * p), r: 7 + 6 * rnd(i + 3), inBeam };
});

/**
 * Cámara óptica vista desde abajo, centro (x, y), radio 300·s.
 * led: LED encendido. beam: longitud del haz (0-1). smoke: humo dentro (0-1). scatter: luz rebotada hacia el sensor (0-1).
 * hit: el fotodiodo recibe luz (0-1). hi: resalta "led" | "pd" | "walls". angle: arco de 90° entre haz y sensor.
 * outside: rayos de luz de fuera que chocan con las paredes (0-1). wisp: hilo de humo que entra por el zigzag (0-1).
 */
export const Chamber: React.FC<{ x: number; y: number; s?: number; t: number; led?: number; beam?: number; smoke?: number; scatter?: number; hit?: number;
  hi?: string; angle?: number; outside?: number; wisp?: number; o?: number }> =
  ({ x, y, s = 1, t, led = 1, beam = 1, smoke = 0, scatter = 0, hit = 0, hi = "", angle = 0, outside = 0, wisp = 0, o = 1 }) => {
    const ps = smoke > 0.01 ? particles(t) : [];
    const bx1 = CH.ledX + 30 + (CH.beamEnd - CH.ledX - 30) * clamp01(beam);
    const [px, py] = CH.pd;
    const pulse = 0.5 + 0.5 * Math.sin(t * 7);
    return (
      <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
        <circle r={318} fill={C.case1} />
        <circle r={300} fill={C.dark} stroke={C.case3} strokeWidth={6} />
        <Vanes hi={hi === "walls" ? 1 : 0} />
        {/* trampa de luz al otro lado del haz */}
        <path d={`M${CH.beamEnd - 5},${CH.beamY - 46} L${CH.beamEnd + 25},${CH.beamY} L${CH.beamEnd - 5},${CH.beamY + 46}`} fill="none" stroke={C.case1} strokeWidth={10} strokeLinejoin="round" />
        {/* humo */}
        {ps.map((q, i) => (
          <circle key={i} cx={q.x} cy={q.y} r={q.r} fill={q.inBeam && beam > 0.9 ? "#FFF2B0" : C.smoke} opacity={smoke * q.o * (q.inBeam && beam > 0.9 ? 1 : 0.7)}
            style={q.inBeam && beam > 0.9 ? { filter: `drop-shadow(0 0 8px ${K.flow})` } : undefined} />
        ))}
        {/* haz del LED */}
        {led > 0.01 && beam > 0.01 && (
          <g opacity={led}>
            <path d={`M${CH.ledX + 30},${CH.beamY} L${bx1},${CH.beamY}`} stroke={K.flow} strokeOpacity={0.22} strokeWidth={34} strokeLinecap="round" />
            <path d={`M${CH.ledX + 30},${CH.beamY} L${bx1},${CH.beamY}`} stroke={K.flow} strokeWidth={10} strokeLinecap="round" strokeDasharray="22 14" strokeDashoffset={-t * 140} />
          </g>
        )}
        {/* luz rebotada hacia el fotodiodo */}
        {scatter > 0.01 && ps.filter((q) => q.inBeam).map((q, i) => (
          <g key={i} opacity={scatter * q.o}>
            <path d={`M${q.x},${q.y} L${px},${py - 18}`} stroke={K.flow} strokeWidth={5} strokeLinecap="round" strokeDasharray="10 8" strokeDashoffset={-t * 120} />
            <path d={`M${q.x},${q.y} l${-22},${-26} M${q.x},${q.y} l${26},${-20}`} stroke={K.flow} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
          </g>
        ))}
        {/* tabique que tapa el fotodiodo del haz directo */}
        <path d={`M${px - 62},${py - 52} L${px - 30},${py - 52}`} stroke={C.case2} strokeWidth={12} strokeLinecap="round" />
        {/* LED */}
        <g transform={`translate(${CH.ledX},${CH.beamY})`}>
          {hi === "led" && <circle r={64} fill="none" stroke={K.flow} strokeWidth={6} opacity={0.5 + 0.5 * pulse} />}
          <rect x={-34} y={-24} width={40} height={48} rx={6} fill={C.case3} stroke={C.ink} strokeWidth={4} />
          <path d="M6,-24 L18,-24 A24,24 0 0 1 18,24 L6,24 Z" fill={led > 0.5 ? K.flow : "#6b6a4a"} stroke={C.ink} strokeWidth={4}
            style={led > 0.5 ? { filter: `drop-shadow(0 0 12px ${K.flow})` } : undefined} />
        </g>
        {/* fotodiodo (mira hacia arriba, en ángulo recto con el haz) */}
        <g transform={`translate(${px},${py})`}>
          {hi === "pd" && <circle r={62} fill="none" stroke={K.cold} strokeWidth={6} opacity={0.5 + 0.5 * pulse} />}
          <rect x={-26} y={-10} width={52} height={46} rx={6} fill={C.case3} stroke={C.ink} strokeWidth={4} />
          <rect x={-20} y={-24} width={40} height={18} rx={4} fill={hit > 0.05 ? K.flow : K.cold} stroke={C.ink} strokeWidth={4}
            opacity={0.6 + 0.4 * Math.max(hit, hi === "pd" ? 1 : 0)} style={hit > 0.05 ? { filter: `drop-shadow(0 0 ${6 + 16 * hit}px ${K.flow})` } : undefined} />
        </g>
        {/* arco de 90° */}
        {angle > 0.01 && (
          <g opacity={angle}>
            <path d={`M${px},${CH.beamY + 2} L${px},${py - 30}`} stroke={K.cold} strokeWidth={5} strokeDasharray="10 9" />
            <path d={`M${px + 60},${CH.beamY} A60,60 0 0 1 ${px},${CH.beamY + 60}`} fill="none" stroke={K.cold} strokeWidth={6} />
          </g>
        )}
        {/* luz de fuera que choca con las paredes */}
        {outside > 0.01 && [-50, -20, 10].map((a, k) => {
          const r = (Math.PI * a) / 180, ux = Math.cos(r), uy = Math.sin(r);
          const prog = clamp01(outside * 1.4 - k * 0.15);
          const x0 = 520 * ux, y0 = 520 * uy, x1 = 300 * ux, y1 = 300 * uy;
          return (
            <g key={k} opacity={prog}>
              <path d={`M${x0},${y0} L${x0 + (x1 - x0) * prog},${y0 + (y1 - y0) * prog}`} stroke={K.flow} strokeWidth={10} strokeLinecap="round" />
              {prog > 0.95 && <path d={`M${x1 + 20},${y1 - 20} l-30,30 M${x1 - 10},${y1 - 20} l30,30`} transform={`translate(${12 * ux},${12 * uy})`} stroke={K.warn} strokeWidth={9} strokeLinecap="round" />}
            </g>
          );
        })}
        {/* hilo de humo que se cuela por el zigzag */}
        {wisp > 0.01 && (
          <g opacity={wisp}>
            <path d="M-330,-330 C-300,-250 -250,-290 -230,-215 C-215,-160 -170,-170 -120,-120 C-80,-80 -60,-60 -20,-40" fill="none" stroke={C.smoke} strokeWidth={16}
              strokeLinecap="round" strokeDasharray="26 16" strokeDashoffset={-t * 90} opacity={0.85} />
          </g>
        )}
      </g>
    );
  };

/** Carcasa del detector vista desde abajo (de frente), centro (x, y), radio 300·s. press: botón pulsado. alarm: destello rojo. */
export const Face: React.FC<{ x: number; y: number; s?: number; t: number; rot?: number; press?: number; alarm?: number; o?: number; dim?: boolean }> =
  ({ x, y, s = 1, t, rot = 0, press = 0, alarm = 0, o = 1, dim = false }) => (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
      <circle r={312} fill={C.ink} opacity={0.35} transform="translate(0,14)" />
      <circle r={300} fill={C.shell} stroke={C.ink} strokeWidth={6} />
      <circle r={262} fill={C.shell2} />
      {Array.from({ length: 24 }).map((_, k) => (
        <g key={k} transform={`rotate(${k * 15})`}><rect x={180} y={-9} width={66} height={18} rx={9} fill={C.case1} /></g>
      ))}
      <circle r={160} fill={C.shell} stroke={C.case3} strokeWidth={5} />
      <circle r={78} fill={C.case3} />
      <circle r={68 - 6 * press} fill={C.case2} stroke={C.ink} strokeWidth={4} />
      <text y={12} textAnchor="middle" fontSize={34} fontWeight={900} fill={C.shell} fontFamily="sans-serif">TEST</text>
      <circle cx={0} cy={-118} r={13} fill={alarm > 0.05 || Math.sin(t * 3) > 0.92 ? K.warn : "#5a2a2a"} stroke={C.ink} strokeWidth={3}
        style={alarm > 0.05 ? { filter: `drop-shadow(0 0 12px ${K.warn})` } : undefined} />
      {alarm > 0.01 && <circle r={300} fill="none" stroke={K.warn} strokeWidth={14} opacity={alarm * (0.5 + 0.5 * Math.sin(t * 14))} />}
      {dim && <circle r={300} fill={C.ink} opacity={0.4} />}
    </g>
  );

/** Detector de lado, colgado del techo (cúpula). */
export const Side: React.FC<{ x: number; y: number; s?: number; t: number; alarm?: number }> = ({ x, y, s = 1, t, alarm = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-120} y={0} width={240} height={14} rx={4} fill={C.shell2} stroke={C.ink} strokeWidth={4} />
    <path d="M-110,14 L110,14 C105,70 60,88 0,88 C-60,88 -105,70 -110,14 Z" fill={C.shell} stroke={C.ink} strokeWidth={5} />
    {[-70, -35, 0, 35, 70].map((k) => <rect key={k} x={k - 8} y={34} width={16} height={26} rx={6} fill={C.case1} />)}
    <circle cx={0} cy={74} r={9} fill={alarm > 0.05 ? K.warn : "#5a2a2a"} />
    {alarm > 0.01 && [0, 1, 2].map((k) => {
      const p = (t * 2 + k / 3) % 1;
      return <path key={k} d={`M${-60 - p * 120},${60 + p * 60} A${90 + p * 140},${90 + p * 140} 0 0 0 ${60 + p * 120},${60 + p * 60}`} fill="none" stroke={K.warn} strokeWidth={8}
        strokeLinecap="round" opacity={alarm * Math.sin(Math.PI * p)} />;
    })}
  </g>
);

/** Plaquita piezoeléctrica (disco de latón con cerámica) que vibra y lanza ondas de sonido. */
export const Piezo: React.FC<{ x: number; y: number; s?: number; t: number; on?: number }> = ({ x, y, s = 1, t, on = 0 }) => {
  const v = 1 + 0.035 * on * Math.sin(t * 70);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {on > 0.01 && [0, 1, 2, 3].map((k) => {
        const p = (t * 1.6 + k / 4) % 1, r = 200 + p * 170;
        return (
          <g key={k} opacity={on * Math.sin(Math.PI * p)}>
            <path d={`M${r * Math.cos(-0.6)},${r * Math.sin(-0.6)} A${r},${r} 0 0 1 ${r * Math.cos(0.6)},${r * Math.sin(0.6)}`} fill="none" stroke={K.flow} strokeWidth={10} strokeLinecap="round" />
            <path d={`M${-r * Math.cos(-0.6)},${r * Math.sin(-0.6)} A${r},${r} 0 0 0 ${-r * Math.cos(0.6)},${r * Math.sin(0.6)}`} fill="none" stroke={K.flow} strokeWidth={10} strokeLinecap="round" />
          </g>
        );
      })}
      <g transform={`scale(${v})`}>
        <circle r={180} fill={C.brass} stroke={C.ink} strokeWidth={6} />
        <circle r={122} fill={C.ceramic} stroke={C.ink} strokeWidth={5} />
        <circle r={96} fill="#E9EEF5" />
        <path d="M0,-30 L0,30 M-30,0 L30,0" stroke={C.case1} strokeWidth={6} opacity={0.4} />
      </g>
      <path d="M150,110 C220,160 240,220 300,240" fill="none" stroke={K.warn} strokeWidth={8} strokeLinecap="round" />
      <path d="M40,40 C140,170 180,250 290,262" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
    </g>
  );
};

/** Pila (vista lateral) con nivel de carga. */
export const Battery: React.FC<{ x: number; y: number; s?: number; lvl: number; t: number; blink?: number }> = ({ x, y, s = 1, lvl, t, blink = 0 }) => {
  const low = lvl < 0.25;
  const b = blink > 0.01 ? 0.45 + 0.55 * (Math.sin(t * 8) > 0 ? 1 : 0.2) : 1;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-210} y={-80} width={400} height={160} rx={26} fill={C.case1} stroke={C.ink} strokeWidth={6} />
      <rect x={190} y={-34} width={30} height={68} rx={8} fill={C.case3} stroke={C.ink} strokeWidth={5} />
      <rect x={-190} y={-60} width={360 * clamp01(lvl)} height={120} rx={16} fill={low ? K.warn : K.flow} opacity={b} />
      <text x={-150} y={20} textAnchor="middle" fontSize={64} fontWeight={900} fill={C.shell} fontFamily="sans-serif">−</text>
      <text x={150} y={22} textAnchor="middle" fontSize={64} fontWeight={900} fill={C.shell} fontFamily="sans-serif">+</text>
    </g>
  );
};

/** Bocadillo «¡PI!» que salta (pitido corto). */
export const Chirp: React.FC<{ x: number; y: number; p: number; color?: string; text?: string }> = ({ x, y, p, color = K.white, text = "¡PI!" }) => p <= 0.01 ? null : (
  <g transform={`translate(${x},${y}) scale(${0.7 + 0.3 * p})`} opacity={p}>
    <path d="M-90,-50 L90,-50 Q110,-50 110,-30 L110,30 Q110,50 90,50 L10,50 L-20,84 L-24,50 L-90,50 Q-110,50 -110,30 L-110,-30 Q-110,-50 -90,-50 Z" fill="rgba(6,16,31,0.9)" stroke={color} strokeWidth={6} />
    <text y={20} textAnchor="middle" fontSize={58} fontWeight={900} fill={color} fontFamily="sans-serif">{text}</text>
  </g>
);

/** Cámara iónica (de lado): dos placas, la cápsula de americio y los iones que hacen corriente. */
export const IonChamber: React.FC<{ x: number; y: number; s?: number; t: number; ions?: number; glow?: number }> = ({ x, y, s = 1, t, ions = 1, glow = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-300} y={-220} width={600} height={440} rx={40} fill={C.dark} stroke={C.case3} strokeWidth={6} />
    <rect x={-240} y={-170} width={480} height={26} rx={8} fill={C.case3} stroke={C.ink} strokeWidth={4} />
    <rect x={-240} y={144} width={480} height={26} rx={8} fill={C.case3} stroke={C.ink} strokeWidth={4} />
    <text x={270} y={-150} textAnchor="middle" fontSize={44} fontWeight={900} fill={K.cold} fontFamily="sans-serif">+</text>
    <text x={270} y={172} textAnchor="middle" fontSize={44} fontWeight={900} fill={K.cold} fontFamily="sans-serif">−</text>
    {/* cápsula */}
    <rect x={-46} y={110} width={92} height={34} rx={10} fill={C.brass} stroke={C.ink} strokeWidth={4} style={glow > 0.05 ? { filter: `drop-shadow(0 0 ${8 + 14 * glow}px ${K.flow})` } : undefined} />
    {/* iones */}
    {ions > 0.01 && Array.from({ length: 14 }).map((_, i) => {
      const p = (t * 0.5 + rnd(i + 20)) % 1;
      const pos = i % 2 === 0;
      const xx = -200 + 400 * rnd(i + 31);
      const yy = pos ? 120 - p * 250 : -120 + p * 250;
      return <text key={i} x={xx} y={yy} textAnchor="middle" fontSize={60} fontWeight={900} fill={pos ? K.hot : K.cold} opacity={ions * Math.sin(Math.PI * p)} fontFamily="sans-serif">{pos ? "+" : "−"}</text>;
    })}
  </g>
);

/** Trébol de radiactividad pequeño. */
export const Trefoil: React.FC<{ x: number; y: number; r?: number; o: number }> = ({ x, y, r = 50, o }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <circle r={r} fill={K.flow} stroke={C.ink} strokeWidth={5} />
    {[0, 120, 240].map((a) => (
      <path key={a} transform={`rotate(${a - 90})`} d={`M${r * 0.22},${-r * 0.09} L${r * 0.82},${-r * 0.48} A${r * 0.95},${r * 0.95} 0 0 1 ${r * 0.82},${r * 0.48} L${r * 0.22},${r * 0.09} Z`} fill={C.ink} />
    ))}
    <circle r={r * 0.16} fill={C.ink} />
  </g>
);

/** Ducha con vapor. */
export const Shower: React.FC<{ x: number; y: number; t: number; steam: number }> = ({ x, y, t, steam }) => (
  <g transform={`translate(${x},${y})`}>
    <path d="M-120,-220 L-120,-170 L-30,-170" fill="none" stroke={C.case3} strokeWidth={14} strokeLinecap="round" />
    <path d="M-60,-178 L20,-178 L40,-150 L-80,-150 Z" fill={C.case3} stroke={C.ink} strokeWidth={4} />
    {Array.from({ length: 10 }).map((_, i) => {
      const p = (t * 1.8 + rnd(i)) % 1;
      return <line key={i} x1={-70 + 10 * i} y1={-140 + p * 220} x2={-74 + 10 * i} y2={-120 + p * 220} stroke={K.cold} strokeWidth={5} strokeLinecap="round" opacity={0.8 * (1 - p)} />;
    })}
    <Steam x={-20} y={60} t={t} o={steam} />
  </g>
);

/** Nubes de vapor/humo que suben. */
export const Steam: React.FC<{ x: number; y: number; t: number; o: number; color?: string; h?: number }> = ({ x, y, t, o, color = K.white, h = 300 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y})`}>
    {Array.from({ length: 7 }).map((_, i) => {
      const p = (t * 0.35 + i / 7) % 1;
      return <circle key={i} cx={30 * Math.sin(t * 1.3 + i * 2) + (i % 2 ? 20 : -20)} cy={-p * h} r={26 + 34 * p} fill={color} opacity={o * 0.45 * Math.sin(Math.PI * p)} />;
    })}
  </g>
);

/** Sartén en un fuego. */
export const Pan: React.FC<{ x: number; y: number; t: number; fumes: number }> = ({ x, y, t, fumes }) => (
  <g transform={`translate(${x},${y})`}>
    {[-40, 0, 40].map((k, i) => <path key={i} d={`M${k},40 q-14,-22 0,-44 q14,22 0,44 Z`} fill={K.hot} opacity={0.75 + 0.25 * Math.sin(t * 11 + i)} />)}
    <path d="M-110,-14 L110,-14 L92,22 L-92,22 Z" fill={C.case2} stroke={C.ink} strokeWidth={5} />
    <rect x={106} y={-16} width={130} height={18} rx={9} fill={C.case1} stroke={C.ink} strokeWidth={4} />
    <Steam x={0} y={-30} t={t + 1.7} o={fumes} color={C.smoke} h={260} />
  </g>
);

/** Dedo (desde abajo) para pulsar el botón. */
export const Finger: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-45} y={0} width={90} height={300} rx={45} fill={C.skin} stroke={C.ink} strokeWidth={5} />
    <ellipse cx={0} cy={30} rx={26} ry={20} fill="#E3B19A" />
  </g>
);
