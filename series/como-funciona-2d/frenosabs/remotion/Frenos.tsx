// Dibujos SVG del episodio «frenos ABS». Todos son <g> para meter dentro de un <svg 1080×1920>. Sin marcas.
import React from "react";
import { K, FONT } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#06101F", tyre: "#151d2a", road: "#1a2638", metal: "#C9D3E0", disc: "#8C9BB0", iron: "#5d6d84" };

const glow = (v: number, col: string, px = 16) => (v > 0.05 ? { filter: `drop-shadow(0 0 ${px * v}px ${col})` } : {});

/** Interior del freno de una rueda, centrado en (0,0), radio R.
 *  rot: giro (grados) del disco y de la corona dentada. press 0→1: la pinza aprieta (naranja). sensorHi: el sensor lee (amarillo). */
export const BrakeCore: React.FC<{ R: number; rot: number; press?: number; sensorHi?: number; ringHi?: number; locked?: number }> =
  ({ R, rot, press = 0, sensorHi = 0, ringHi = 0, locked = 0 }) => {
    const nT = 28;
    return (
      <g>
        <g transform={`rotate(${rot})`}>
          {/* disco */}
          <circle r={R * 0.8} fill={C.disc} stroke={locked > 0.5 ? K.warn : C.case3} strokeWidth={R * 0.02} />
          <circle r={R * 0.8} fill="none" stroke="#a9b6c8" strokeWidth={R * 0.012} strokeDasharray={`${R * 0.2} ${R * 0.06}`} opacity={0.6} />
          {Array.from({ length: 18 }).map((_, i) => (
            <circle key={i} cx={0} cy={-R * 0.62} r={R * 0.025} fill={C.iron} transform={`rotate(${i * 20 + (i % 2) * 6})`} />
          ))}
          <circle r={R * 0.46} fill={C.case1} />
          {/* corona dentada (rueda fónica) */}
          <circle r={R * 0.38} fill={C.iron} stroke={ringHi > 0.05 ? K.flow : C.case3} strokeWidth={R * 0.01} style={glow(ringHi, K.flow, 12)} />
          {Array.from({ length: nT }).map((_, i) => (
            <rect key={i} x={-R * 0.025} y={-R * 0.445} width={R * 0.05} height={R * 0.075} fill={ringHi > 0.05 ? "#e8d27a" : C.metal} transform={`rotate(${(i * 360) / nT})`} />
          ))}
          {/* buje con tornillos */}
          <circle r={R * 0.26} fill={C.case2} stroke={C.case3} strokeWidth={R * 0.012} />
          {Array.from({ length: 5 }).map((_, i) => (
            <circle key={i} cx={0} cy={-R * 0.16} r={R * 0.035} fill={C.metal} transform={`rotate(${i * 72})`} />
          ))}
          <circle r={R * 0.07} fill={C.dark} />
        </g>
        {/* pinza (fija), arriba a la derecha */}
        <g transform="rotate(40)" style={glow(press, K.hot, 18)}>
          <rect x={-R * 0.2} y={-R * 0.96} width={R * 0.4} height={R * 0.42} rx={R * 0.07} fill={press > 0.05 ? K.hot : C.case2} opacity={0.4 + 0.6 * Math.max(press, 0.6)} />
          <rect x={-R * 0.14} y={-R * 0.9} width={R * 0.28} height={R * 0.08} rx={R * 0.02} fill={C.dark} opacity={0.5} />
        </g>
        {/* sensor magnético (fijo), justo encima de la corona */}
        <g style={glow(sensorHi, K.flow, 14)}>
          <path d={`M ${-R * 0.03} ${-R * 0.5} L ${-R * 0.03} ${-R * 1.02}`} stroke={C.dark} strokeWidth={R * 0.035} />
          <rect x={-R * 0.07} y={-R * 0.6} width={R * 0.14} height={R * 0.13} rx={R * 0.025} fill={sensorHi > 0.05 ? K.flow : C.case3} />
        </g>
      </g>
    );
  };

/** Rueda de coche vista de frente: neumático + llanta. open 0→1 parte la llanta en dos mitades que se separan y enseñan el freno. */
export const Wheel: React.FC<{ cx: number; cy: number; R: number; rot: number; open?: number; id: string; press?: number; sensorHi?: number; ringHi?: number; locked?: number; o?: number }> =
  ({ cx, cy, R, rot, open = 0, id, press = 0, sensorHi = 0, ringHi = 0, locked = 0, o = 1 }) => {
    const shell = (
      <g transform={`rotate(${rot})`}>
        <circle r={R * 0.88} fill="none" stroke={C.tyre} strokeWidth={R * 0.24} />
        {Array.from({ length: 32 }).map((_, i) => (
          <rect key={i} x={-R * 0.025} y={-R * 1.0} width={R * 0.05} height={R * 0.08} fill="#26324a" transform={`rotate(${i * 11.25})`} />
        ))}
        <circle r={R * 0.76} fill={C.case3} />
        <circle r={R * 0.7} fill={C.case1} />
        {Array.from({ length: 5 }).map((_, i) => (
          <path key={i} d={`M ${-R * 0.09} ${-R * 0.18} L ${-R * 0.16} ${-R * 0.68} L ${R * 0.16} ${-R * 0.68} L ${R * 0.09} ${-R * 0.18} Z`} fill={C.case3} transform={`rotate(${i * 72})`} />
        ))}
        <circle r={R * 0.2} fill={C.case2} stroke={C.metal} strokeWidth={R * 0.02} />
        <circle r={R * 0.07} fill={C.dark} />
      </g>
    );
    const d = open * R * 0.62;
    return (
      <g transform={`translate(${cx} ${cy})`} opacity={o}>
        <defs>
          <clipPath id={`${id}L`}><rect x={-R * 1.1} y={-R * 1.1} width={R * 1.1} height={R * 2.2} /></clipPath>
          <clipPath id={`${id}R`}><rect x={0} y={-R * 1.1} width={R * 1.1} height={R * 2.2} /></clipPath>
        </defs>
        {open > 0.01 && <g transform={`scale(${0.72 + 0.1 * open})`}><BrakeCore R={R} rot={rot} press={press} sensorHi={sensorHi} ringHi={ringHi} locked={locked} /></g>}
        <g transform={`translate(${-d} 0)`} opacity={1 - 0.65 * open}><g clipPath={`url(#${id}L)`}>{shell}</g></g>
        <g transform={`translate(${d} 0)`} opacity={1 - 0.65 * open}><g clipPath={`url(#${id}R)`}>{shell}</g></g>
        {locked > 0.05 && <circle r={R * 1.02} fill="none" stroke={K.warn} strokeWidth={R * 0.03} opacity={locked} style={glow(locked, K.warn)} />}
      </g>
    );
  };

/** Coche visto desde arriba, centrado en (x, y), mirando hacia `ang` (grados; 0 = arriba). steer: giro de las ruedas delanteras. */
export const TopCar: React.FC<{ x: number; y: number; ang?: number; s?: number; steer?: number; body?: string; wheelCol?: string; brake?: number; o?: number }> =
  ({ x, y, ang = 0, s = 1, steer = 0, body = C.case2, wheelCol = C.tyre, brake = 0, o = 1 }) => (
    <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${s})`} opacity={o}>
      {[[-62, -62], [62, -62], [-62, 66], [62, 66]].map(([wx, wy], i) => (
        <rect key={i} x={-13} y={-28} width={26} height={56} rx={8} fill={wheelCol} stroke={wheelCol === C.tyre ? "#2c3a52" : wheelCol} strokeWidth={3}
          transform={`translate(${wx} ${wy}) rotate(${i < 2 ? steer : 0})`} />
      ))}
      <rect x={-60} y={-118} width={120} height={236} rx={42} fill={body} stroke={C.case3} strokeWidth={4} />
      <path d="M -46 -58 Q 0 -78 46 -58 L 40 -20 L -40 -20 Z" fill={C.dark} opacity={0.85} />
      <path d="M -40 50 L 40 50 L 44 76 Q 0 90 -44 76 Z" fill={C.dark} opacity={0.85} />
      <rect x={-40} y={-14} width={80} height={58} rx={10} fill={C.case1} />
      <rect x={-50} y={-116} width={22} height={10} rx={4} fill={K.flow} opacity={0.9} />
      <rect x={28} y={-116} width={22} height={10} rx={4} fill={K.flow} opacity={0.9} />
      <rect x={-50} y={106} width={24} height={10} rx={4} fill={K.warn} opacity={0.4 + 0.6 * brake} style={glow(brake, K.warn, 12)} />
      <rect x={26} y={106} width={24} height={10} rx={4} fill={K.warn} opacity={0.4 + 0.6 * brake} style={glow(brake, K.warn, 12)} />
    </g>
  );

/** Cono de obstáculo visto desde arriba. */
export const Cone: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-42} y={-42} width={84} height={84} rx={10} fill="#3a2a1a" />
    <circle r={34} fill={K.hot} />
    <circle r={22} fill={K.white} />
    <circle r={12} fill={K.hot} />
  </g>
);

/** Centralita: caja con patillas y un chip. */
export const ECU: React.FC<{ x: number; y: number; w: number; h: number; t: number; hi?: number; o?: number }> = ({ x, y, w, h, t, hi = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o} style={glow(hi, K.flow, 18)}>
    {Array.from({ length: 7 }).map((_, i) => (
      <React.Fragment key={i}>
        <rect x={-w / 2 + 20 + (i * (w - 40)) / 6 - 5} y={-h / 2 - 16} width={10} height={18} fill={C.metal} />
        <rect x={-w / 2 + 20 + (i * (w - 40)) / 6 - 5} y={h / 2 - 2} width={10} height={18} fill={C.metal} />
      </React.Fragment>
    ))}
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill={C.case1} stroke={hi > 0.05 ? K.flow : C.case3} strokeWidth={5} />
    <rect x={-w * 0.28} y={-h * 0.3} width={w * 0.56} height={h * 0.6} rx={8} fill={C.dark} />
    {Array.from({ length: 4 }).map((_, i) => {
      const on = (Math.floor(t * 6) + i) % 4 === 0;
      return <circle key={i} cx={-w * 0.18 + i * w * 0.12} cy={0} r={7} fill={on && hi > 0.05 ? K.flow : C.iron} />;
    })}
  </g>
);

/** Tubo con líquido animado (trazo discontinuo que corre). */
export const Pipe: React.FC<{ d: string; t: number; level: number; color?: string; w?: number; speed?: number; o?: number }> = ({ d, t, level, color = K.hot, w = 16, speed = 120, o = 1 }) => (
  <g opacity={o}>
    <path d={d} stroke={C.case1} strokeWidth={w + 10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.25 + 0.75 * level} style={glow(level, color, 10)} />
    {level > 0.05 && <path d={d} stroke={K.white} strokeWidth={w * 0.3} fill="none" strokeDasharray="14 34" strokeDashoffset={-t * speed} opacity={0.5 * level} />}
  </g>
);

/** Cable de señal (amarillo) con pulsos. */
export const Signal: React.FC<{ d: string; t: number; on: number; color?: string; w?: number }> = ({ d, t, on, color = K.flow, w = 6 }) => (
  <g>
    <path d={d} stroke={C.case1} strokeWidth={w + 4} fill="none" strokeLinecap="round" />
    {on > 0.02 && <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeDasharray="10 22" strokeDashoffset={-t * 160} opacity={on} />}
  </g>
);

/** Válvula: círculo con compuerta; open 0→1 gira la compuerta. */
export const Valve: React.FC<{ x: number; y: number; r?: number; open: number; col?: string }> = ({ x, y, r = 34, open, col = K.flow }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={C.dark} stroke={open > 0.05 ? col : C.case3} strokeWidth={6} style={glow(open, col, 12)} />
    <rect x={-r * 0.85} y={-6} width={r * 1.7} height={12} rx={5} fill={open > 0.05 ? col : C.case3} transform={`rotate(${90 - 90 * open})`} />
  </g>
);

/** Pedal de freno de perfil con la suela de un zapato pisando. jit = vibración (px). */
export const Pedal: React.FC<{ x: number; y: number; press: number; jit?: number; o?: number }> = ({ x, y, press, jit = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <circle cx={60} cy={-330} r={26} fill={C.case3} />
    <g transform={`rotate(${-8 + 14 * press} 60 -330) translate(${jit} ${jit * 0.4})`}>
      <path d="M 60 -330 Q 40 -120 -10 20" stroke={C.case3} strokeWidth={30} fill="none" strokeLinecap="round" />
      <rect x={-90} y={0} width={170} height={56} rx={16} fill={C.case2} stroke={C.metal} strokeWidth={5} transform="rotate(-18 -10 28)" />
      {/* pierna y zapato (silueta neutra), con la punta sobre el pedal */}
      <g transform="rotate(-18 -10 28)">
        <path d="M -290 -100 L -380 -360 L -240 -400 L -165 -96 Z" fill="#33435c" stroke={C.case3} strokeWidth={4} />
        <path d="M -330 -6 Q -345 -110 -250 -122 L -130 -104 Q -10 -86 70 -26 L 70 -6 Z" fill="#4c6080" stroke={C.case3} strokeWidth={5} />
        <rect x={-335} y={-8} width={410} height={18} rx={8} fill={C.dark} />
      </g>
    </g>
  </g>
);

/** Avión de pasajeros genérico de perfil, (x, y) = centro del fuselaje. gear 0→1 baja el tren. */
export const Plane: React.FC<{ x: number; y: number; s?: number; t: number; gearHi?: number; o?: number }> = ({ x, y, s = 1, t, gearHi = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    {/* tren de aterrizaje */}
    {[-150, 90].map((gx, i) => (
      <g key={i}>
        <path d={`M ${gx} 30 V 92`} stroke={C.case3} strokeWidth={12} />
        <g transform={`translate(${gx} 104) rotate(${t * 240})`} style={glow(gearHi, K.flow, 14)}>
          <circle r={30} fill={C.tyre} stroke={gearHi > 0.05 ? K.flow : "#2c3a52"} strokeWidth={6} />
          <rect x={-4} y={-24} width={8} height={18} fill={C.case3} />
        </g>
      </g>
    ))}
    <path d="M -380 0 Q -380 -48 -300 -52 L 300 -52 Q 390 -46 410 -10 Q 400 30 330 40 L -320 40 Q -380 40 -380 0 Z" fill={C.metal} stroke={C.case3} strokeWidth={4} />
    <path d="M -320 -52 L -380 -190 L -300 -190 L -220 -52 Z" fill={C.case2} />
    <path d="M -40 10 L -170 120 L -90 120 L 100 10 Z" fill={C.case2} />
    {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={-250 + i * 36} y={-26} width={18} height={20} rx={6} fill={C.case1} />)}
    <path d="M 330 -34 Q 372 -32 388 -12 L 340 -12 Z" fill={C.case1} />
  </g>
);

/** Coche genérico de perfil (mirando a la derecha), (x, y) = centro de la carrocería. */
export const SideCar: React.FC<{ x: number; y: number; s?: number; rot: number; o?: number; badge?: number }> = ({ x, y, s = 1, rot, o = 1, badge = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={118} rx={340} ry={14} fill="#000" opacity={0.3} />
    <path d="M -330 70 L -330 0 Q -320 -30 -260 -40 L -150 -50 Q -90 -130 20 -132 Q 130 -132 200 -56 L 300 -40 Q 340 -30 340 10 L 340 70 Z" fill={C.case2} stroke={C.case3} strokeWidth={5} />
    <path d="M -120 -52 Q -70 -112 10 -114 L 10 -52 Z" fill={C.dark} opacity={0.85} />
    <path d="M 30 -114 Q 120 -112 172 -52 L 30 -52 Z" fill={C.dark} opacity={0.85} />
    <rect x={300} y={-26} width={36} height={18} rx={6} fill={K.flow} />
    <rect x={-332} y={-20} width={16} height={22} rx={4} fill={K.warn} />
    {[-195, 205].map((wx, i) => (
      <g key={i} transform={`translate(${wx} 70) rotate(${rot})`}>
        <circle r={58} fill={C.tyre} />
        <circle r={36} fill={C.case3} />
        {Array.from({ length: 5 }).map((_, k) => <rect key={k} x={-5} y={-34} width={10} height={26} fill={C.case1} transform={`rotate(${k * 72})`} />)}
        <circle r={10} fill={C.dark} />
      </g>
    ))}
    {badge > 0.01 && (
      <g transform="translate(0 -10)" opacity={badge} style={glow(badge, K.flow, 16)}>
        <circle r={44} fill={C.dark} stroke={K.flow} strokeWidth={6} />
        <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={K.flow}>ABS</text>
      </g>
    )}
  </g>
);

/** Estrella de cinco puntas. */
export const Star: React.FC<{ x: number; y: number; r: number; fill?: string; o?: number }> = ({ x, y, r, fill = K.flow, o = 1 }) => {
  const pts = Array.from({ length: 10 }).map((_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.42 : r;
    return `${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`;
  });
  return <polygon points={pts.join(" ")} fill={fill} opacity={o} />;
};

/** Flecha curva (arco) con punta. */
export const ArcArrow: React.FC<{ x: number; y: number; r: number; a0: number; a1: number; color?: string; w?: number; o: number }> = ({ x, y, r, a0, a1, color = K.cold, w = 12, o }) => {
  if (o <= 0.01) return null;
  const p = (a: number) => [x + r * Math.cos((a * Math.PI) / 180), y + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  const dir = a1 > a0 ? 1 : -1;
  const tg = ((a1 + 90 * dir) * Math.PI) / 180;
  const hx = x1 + 34 * Math.cos(tg), hy = y1 + 34 * Math.sin(tg);
  const nx = Math.cos((a1 * Math.PI) / 180), ny = Math.sin((a1 * Math.PI) / 180);
  return (
    <g opacity={o} style={glow(1, color, 10)}>
      <path d={`M ${x0} ${y0} A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x1} ${y1}`} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" />
      <polygon points={`${hx},${hy} ${x1 + 22 * nx},${y1 + 22 * ny} ${x1 - 22 * nx},${y1 - 22 * ny}`} fill={color} />
    </g>
  );
};
