// Dibujos SVG del episodio «Cómo funciona el secamanos». Coordenadas absolutas de 1080×1920.
// Colores de código: naranja = calor/motor, cian = aire/agua, amarillo = lo importante (sensor, ranura), blanco = vapor, rojo = descartado.
// Aparatos genéricos: sin marcas ni formas reconocibles de ningún fabricante.
import React from "react";
import { K, FONT, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F", inner: "#0B1A30", metal: "#6B7C93", paper: "#E8EEF5", skin: "#C9D6E6" };

/** Línea de flujo animada (trazo discontinuo que avanza). */
export const Flow: React.FC<{ d: string; t: number; color?: string; w?: number; o?: number; speed?: number; dash?: string }> = ({ d, t, color = K.cold, w = 10, o = 1, speed = 160, dash = "22 18" }) => o <= 0.01 ? null : (
  <g opacity={o}>
    <path d={d} fill="none" stroke={color} strokeOpacity={0.22} strokeWidth={w + 8} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} strokeDashoffset={-t * speed} />
  </g>
);

/** Punta de flecha en (x, y) apuntando en el ángulo a (grados). */
export const Head: React.FC<{ x: number; y: number; a: number; color?: string; s?: number; o?: number }> = ({ x, y, a, color = K.cold, s = 1, o = 1 }) => o <= 0.01 ? null : (
  <path d="M-22,-20 L4,0 L-22,20" transform={`translate(${x},${y}) rotate(${a}) scale(${s})`} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" opacity={o} />
);

/** Rodete (ventilador) visto de frente. */
export const Impeller: React.FC<{ x: number; y: number; r: number; a: number; blades?: number; color?: string; blur?: number }> = ({ x, y, r, a, blades = 7, color = C.case3, blur = 0 }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={r} fill={C.inner} stroke={C.case3} strokeWidth={Math.max(3, r * 0.06)} />
    {blur > 0.05 && <circle r={r * 0.85} fill={color} opacity={0.25 * blur} />}
    <g transform={`rotate(${a})`} opacity={1 - 0.55 * blur}>
      {Array.from({ length: blades }).map((_, i) => (
        <path key={i} transform={`rotate(${(360 / blades) * i})`}
          d={`M0,${-r * 0.28} C${r * 0.3},${-r * 0.42} ${r * 0.42},${-r * 0.68} ${r * 0.32},${-r * 0.9} L${r * 0.1},${-r * 0.88} C${r * 0.18},${-r * 0.66} ${r * 0.08},${-r * 0.45} ${-r * 0.08},${-r * 0.28} Z`}
          fill={color} stroke={C.ink} strokeWidth={Math.max(2, r * 0.025)} />
      ))}
    </g>
    <circle r={r * 0.3} fill={C.case2} stroke={C.ink} strokeWidth={Math.max(2, r * 0.03)} />
    <circle r={r * 0.1} fill={C.case3} />
  </g>
);

/** Resistencia en zigzag (se pone naranja al calentar). */
const Coil: React.FC<{ x0: number; x1: number; y: number; heat: number; amp?: number }> = ({ x0, x1, y, heat, amp = 30 }) => {
  const n = 9; const pts = Array.from({ length: n + 1 }).map((_, i) => `${x0 + ((x1 - x0) * i) / n},${y + (i % 2 ? amp : -amp)}`).join(" L");
  const col = heat > 0.05 ? K.hot : C.metal;
  return (
    <g>
      {heat > 0.05 && <path d={`M${pts}`} fill="none" stroke={K.hot} strokeOpacity={0.35 * heat} strokeWidth={26} strokeLinejoin="round" />}
      <path d={`M${pts}`} fill="none" stroke={col} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" style={heat > 0.05 ? { filter: `drop-shadow(0 0 ${14 * heat}px ${K.hot})` } : undefined} />
    </g>
  );
};

/**
 * Secamanos de pared de frente. (cx, cy) = centro de la caja (560×380 a escala 1).
 * kind: "warm" (ventilador + resistencia + boquilla) | "jet" (motor rapidísimo + ranura a lo ancho).
 * open: la tapa se levanta y se ve dentro; spin: gira el ventilador/motor; heat: resistencia al rojo; flow: aire que sale;
 * intake: aire que entra por arriba; slit: resalta la ranura; motorHi: resalta el motor; sensor: piloto del sensor encendido; noCoil: tacha una resistencia.
 */
export const Dryer: React.FC<{ kind: "warm" | "jet"; cx?: number; cy?: number; s?: number; t: number; open?: number; spin?: number; heat?: number; flow?: number;
  intake?: number; slit?: number; motorHi?: number; sensor?: number; flowLen?: number; o?: number }> =
  ({ kind, cx = 540, cy = 700, s = 1, t, open = 0, spin = 0, heat = 0, flow = 0, intake = 0, slit = 0, motorHi = 0, sensor = 0, flowLen = 300, o = 1 }) => {
    const W = 280, H = 190;
    const jet = kind === "jet";
    const a = t * (jet ? 2200 : 700) * spin;
    return (
      <g transform={`translate(${cx},${cy}) scale(${s})`} opacity={o}>
        {/* aire que sale por abajo */}
        {flow > 0.01 && (jet ? (
          <g opacity={flow}>
            <rect x={-240} y={H} width={480} height={flowLen} fill={K.cold} opacity={0.12} />
            {Array.from({ length: 9 }).map((_, i) => {
              const x = -220 + i * 55;
              return <path key={i} d={`M${x},${H + 6} L${x + (x > 0 ? 14 : -14)},${H + flowLen}`} stroke={K.cold} strokeWidth={7} strokeLinecap="round" strokeDasharray="34 22" strokeDashoffset={-t * 900} />;
            })}
          </g>
        ) : (
          <g opacity={flow}>
            {[-40, 0, 40].map((x, i) => (
              <path key={i} d={`M${x},${H + 60} q 22,${flowLen / 6} 0,${flowLen / 3} t 0,${flowLen / 3} t 0,${flowLen / 3}`} fill="none" stroke={K.hot} strokeOpacity={0.75} strokeWidth={9}
                strokeLinecap="round" strokeDasharray="20 18" strokeDashoffset={-t * 120} />
            ))}
          </g>
        ))}
        {/* caja: fondo de dentro */}
        <rect x={-W} y={-H} width={2 * W} height={2 * H} rx={60} fill={C.inner} stroke={C.ink} strokeWidth={8} />
        {/* interior */}
        <g opacity={clamp01(open * 1.5)}>
          {jet ? (
            <g>
              {/* conducto: del motor a la cámara de la ranura */}
              <path d={`M-60,40 L-60,90 L-250,120 L-250,160 L250,160 L250,120 L60,90 L60,40 Z`} fill={C.case1} stroke={C.case3} strokeWidth={4} />
              {flow > 0.01 && [-1, 1].map((k) => <Flow key={k} d={`M${k * 20},60 L${k * 150},125 L${k * 230},140`} t={t} o={flow} w={7} speed={500} />)}
              <rect x={-110} y={-150} width={220} height={190} rx={30} fill={C.case1} stroke={motorHi > 0.05 ? K.hot : C.case3} strokeWidth={6}
                style={motorHi > 0.05 ? { filter: `drop-shadow(0 0 ${16 * motorHi}px ${K.hot})` } : undefined} />
              <Impeller x={0} y={-55} r={80} a={a} color={motorHi > 0.05 ? K.hot : C.case3} blur={clamp01(spin * 1.2 - 0.2)} />
              {intake > 0.01 && [-170, 170].map((x) => <Flow key={x} d={`M${x},-150 L${x},-40 L${x > 0 ? 110 : -110},-40`} t={t} o={intake} w={7} speed={260} />)}
            </g>
          ) : (
            <g>
              <Impeller x={-150} y={-20} r={95} a={a} />
              <rect x={-30} y={-80} width={250} height={120} rx={20} fill={C.case1} stroke={C.case3} strokeWidth={4} />
              <Coil x0={-10} x1={200} y={-20} heat={heat} />
              <path d={`M-70,60 L70,60 L70,${H} L-70,${H} Z`} fill={C.case1} />
              {flow > 0.01 && <Flow d={`M-60,-20 L-10,-20 L200,-20 L200,60 L0,60 L0,${H + 40}`} t={t} o={flow} w={8} color={heat > 0.2 ? K.hot : K.cold} speed={200} />}
            </g>
          )}
        </g>
        {/* tapa: se levanta y se desvanece */}
        {open < 0.99 && (
          <g transform={`translate(0,${-open * 180})`} opacity={1 - open}>
            <rect x={-W} y={-H} width={2 * W} height={2 * H} rx={60} fill={C.case2} stroke={C.ink} strokeWidth={8} />
            <rect x={-W + 26} y={-H + 22} width={2 * W - 52} height={30} rx={15} fill={K.white} opacity={0.14} />
            {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={-120 + i * 50} y={-120} width={22} height={90} rx={11} fill={C.case1} />)}
          </g>
        )}
        {/* boca de salida */}
        {jet ? (
          <g>
            <rect x={-250} y={H - 22} width={500} height={30} rx={14} fill={C.case1} stroke={C.ink} strokeWidth={5} />
            <line x1={-235} y1={H - 7} x2={235} y2={H - 7} stroke={slit > 0.05 ? K.flow : C.ink} strokeWidth={slit > 0.05 ? 6 + 3 * slit : 5} strokeLinecap="round"
              style={slit > 0.05 ? { filter: `drop-shadow(0 0 ${14 * slit}px ${K.flow})` } : undefined} />
          </g>
        ) : (
          <g>
            <rect x={-80} y={H - 30} width={160} height={90} rx={22} fill={C.case1} stroke={C.ink} strokeWidth={6} />
            <rect x={-56} y={H + 30} width={112} height={16} rx={8} fill={C.inner} />
          </g>
        )}
        {/* sensor */}
        <g transform={`translate(${jet ? 0 : 170},${H - (jet ? 44 : 2)})`}>
          <rect x={-26} y={-12} width={52} height={22} rx={10} fill={C.ink} />
          <circle cx={-10} cy={-1} r={6} fill={sensor > 0.05 ? K.flow : C.metal} style={sensor > 0.05 ? { filter: `drop-shadow(0 0 8px ${K.flow})` } : undefined} />
          <circle cx={10} cy={-1} r={6} fill={C.metal} />
        </g>
      </g>
    );
  };

/** Gota de agua (centro de la parte redonda en 0,0). */
const Drop: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => s <= 0.03 || o <= 0.02 ? null : (
  <path transform={`translate(${x},${y}) scale(${s})`} d="M0,-26 C8,-12 14,-4 14,4 A14,14 0 1 1 -14,4 C-14,-4 -8,-12 0,-26 Z" fill={K.cold} stroke={C.ink} strokeWidth={3} opacity={o} />
);

const DROPS: [number, number][] = [[-48, -110], [-6, -140], [34, -70], [-24, 10], [44, 50], [-58, 64], [8, -36], [62, -126]];

/**
 * Mano abierta con los dedos hacia arriba. wet: tamaño de las gotas (1 = mojada, 0 = seca); vapor: volutas que suben;
 * blow: gotas arrancadas que salen volando (bucle continuo mientras queden); scan: posición 0-1 de la «cuchilla» que baja.
 */
export const Hand: React.FC<{ x: number; y: number; s?: number; t: number; wet?: number; vapor?: number; blow?: number; scan?: number; o?: number; flip?: boolean }> =
  ({ x, y, s = 1, t, wet = 1, vapor = 0, blow = 0, scan = -1, o = 1, flip = false }) => (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} opacity={o}>
      {/* dedos y palma */}
      {[[-74, -150], [-36, -176], [2, -170], [40, -144]].map(([fx, fy], i) => <rect key={i} x={fx} y={fy} width={36} height={170} rx={18} fill={C.skin} stroke={C.ink} strokeWidth={5} />)}
      <rect x={-120} y={-30} width={40} height={120} rx={20} fill={C.skin} stroke={C.ink} strokeWidth={5} transform="rotate(-32 -100 30)" />
      <rect x={-80} y={-40} width={160} height={170} rx={50} fill={C.skin} stroke={C.ink} strokeWidth={5} />
      <rect x={-78} y={-34} width={156} height={40} rx={20} fill={C.skin} />
      <rect x={-46} y={120} width={92} height={90} rx={20} fill={C.skin} stroke={C.ink} strokeWidth={5} />
      {/* gotas en la piel */}
      {DROPS.map(([dx, dy], i) => {
        const gone = scan >= 0 ? clamp01((scan * 360 - 180 - dy) / 40) : 0;
        return <Drop key={i} x={dx} y={dy} s={wet * (0.8 + 0.25 * ((i * 37) % 3) / 2) * (1 - gone)} />;
      })}
      {/* gotas que salen volando */}
      {blow > 0.01 && DROPS.map(([dx, dy], i) => {
        const ph = (t * 1.4 + i / DROPS.length) % 1;
        const side = dx >= 0 ? 1 : -1;
        return <Drop key={`b${i}`} x={dx + side * (60 + 260 * ph)} y={dy + 60 + 180 * ph * ph} s={0.7 * (1 - 0.4 * ph)} o={blow * (1 - ph)} />;
      })}
      {/* vapor que sube */}
      {vapor > 0.01 && [-50, -10, 30, 60].map((vx, k) => {
        const ph = (t * 0.45 + k / 4) % 1;
        const yy = -120 - 220 * ph;
        return <path key={k} d={`M${vx},${yy} q 18,-24 0,-48 t 0,-48`} fill="none" stroke={K.white} strokeWidth={8} strokeLinecap="round" opacity={vapor * (1 - ph) * 0.8} />;
      })}
      {/* cuchilla de aire que baja por la mano */}
      {scan >= 0 && scan <= 1 && (
        <g>
          <rect x={-150} y={-190 + 360 * scan - 6} width={300} height={12} rx={6} fill={K.cold} opacity={0.9} style={{ filter: `drop-shadow(0 0 10px ${K.cold})` }} />
        </g>
      )}
    </g>
  );

/** Reloj de cuenta: arco que se llena (p 0-1) con texto dentro. */
export const Timer: React.FC<{ x: number; y: number; r?: number; p: number; text: string; color?: string; o?: number }> = ({ x, y, r = 110, p, text, color = K.flow, o = 1 }) => {
  if (o <= 0.01) return null;
  const ang = 2 * Math.PI * clamp01(p) - Math.PI / 2;
  const large = p > 0.5 ? 1 : 0;
  const ex = r * Math.cos(ang), ey = r * Math.sin(ang);
  return (
    <g transform={`translate(${x},${y})`} opacity={o}>
      <circle r={r + 14} fill={C.inner} stroke={C.case3} strokeWidth={6} />
      <rect x={-18} y={-r - 40} width={36} height={22} rx={6} fill={C.case3} />
      {p > 0.995 ? <circle r={r} fill="none" stroke={color} strokeWidth={16} /> :
        p > 0.005 && <path d={`M0,${-r} A${r},${r} 0 ${large} 1 ${ex},${ey}`} fill="none" stroke={color} strokeWidth={16} strokeLinecap="round" />}
      <line x1={0} y1={0} x2={(r - 26) * Math.cos(ang)} y2={(r - 26) * Math.sin(ang)} stroke={K.white} strokeWidth={7} strokeLinecap="round" />
      <circle r={10} fill={K.white} />
      <text y={r + 70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={color} stroke={C.ink} strokeWidth={6} paintOrder="stroke">{text}</text>
    </g>
  );
};

/** Secador de pelo (icono). */
export const HairDryer: React.FC<{ x: number; y: number; s?: number; o?: number; t: number }> = ({ x, y, s = 1, o = 1, t }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={-10} y={10} width={56} height={130} rx={22} fill={C.case2} stroke={C.ink} strokeWidth={5} transform="rotate(-12 18 10)" />
    <rect x={-90} y={-46} width={170} height={92} rx={46} fill={C.case3} stroke={C.ink} strokeWidth={5} />
    <rect x={70} y={-30} width={70} height={60} rx={10} fill={C.case2} stroke={C.ink} strokeWidth={5} />
    <circle cx={-44} cy={0} r={26} fill={C.inner} stroke={C.ink} strokeWidth={4} />
    {[-18, 0, 18].map((dy, i) => <path key={i} d={`M150,${dy} q 20,-10 40,0 t 40,0`} fill="none" stroke={K.hot} strokeWidth={6} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 6 + i)} />)}
  </g>
);

/** Ojo del sensor en primer plano: emisor y receptor. */
export const SensorClose: React.FC<{ t: number; beam: number; bounce: number; on: number; handY: number }> = ({ t, beam, bounce, on, handY }) => {
  const ex = 430, rx = 650, y0 = 560;
  return (
    <g>
      {/* parte baja del aparato */}
      <rect x={140} y={380} width={800} height={180} rx={50} fill={C.case2} stroke={C.ink} strokeWidth={8} />
      <rect x={300} y={500} width={480} height={90} rx={36} fill={C.ink} />
      {/* emisor */}
      <circle cx={ex} cy={545} r={30} fill={beam > 0.05 ? K.flow : C.metal} style={beam > 0.05 ? { filter: `drop-shadow(0 0 16px ${K.flow})` } : undefined} />
      <circle cx={rx} cy={545} r={30} fill={bounce > 0.6 ? K.flow : C.metal} stroke={C.case3} strokeWidth={4} />
      {/* rayo de ida y de vuelta */}
      {beam > 0.01 && (() => { const L = (handY - y0) * clamp01(beam * 1.2); return <path d={`M${ex},${y0 + 20} L${ex + 0.5 * (rx - ex) * L / (handY - y0)},${y0 + 20 + L}`} stroke={K.flow} strokeWidth={8} strokeDasharray="18 12" strokeDashoffset={-t * 200} opacity={0.95} />; })()}
      {bounce > 0.01 && (() => { const mx = (ex + rx) / 2; const k = clamp01(bounce); return <path d={`M${mx},${handY} L${mx + (rx - mx) * k},${handY - (handY - y0 - 20) * k}`} stroke={K.flow} strokeWidth={8} strokeDasharray="18 12" strokeDashoffset={-t * 200} opacity={0.95} />; })()}
      {/* encendido: ondas de aire */}
      {on > 0.01 && [0, 1, 2].map((k) => { const ph = (t * 1.2 + k / 3) % 1; return <path key={k} d={`M220,${600 + ph * 60} L860,${600 + ph * 60}`} stroke={K.cold} strokeWidth={6} opacity={on * (1 - ph) * 0.6} strokeDasharray="40 30" />; })}
    </g>
  );
};

/** Documento de patente con un dibujo del secamanos de 1922 y su pedal. */
export const PatentDoc: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={-230} y={-300} width={460} height={600} rx={18} fill={C.paper} stroke={C.ink} strokeWidth={6} />
    <text x={0} y={-235} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={C.ink}>PATENTE</text>
    {[-195, -170].map((yy) => <rect key={yy} x={-170} y={yy} width={340} height={10} rx={5} fill={C.case3} />)}
    {/* dibujo de la máquina: caja con boquilla, cable y pedal en el suelo */}
    <g stroke={C.case1} strokeWidth={6} fill="none" strokeLinecap="round">
      <rect x={-120} y={-120} width={200} height={130} rx={20} />
      <path d="M-40,10 L-40,60 L0,60 L0,10" />
      <path d="M80,-60 Q170,-60 170,60 L170,200" strokeDasharray="12 10" />
      <rect x={110} y={200} width={110} height={34} rx={8} />
      <line x1={-200} y1={250} x2={200} y2={250} />
    </g>
    {[130, 160].map((yy) => <rect key={yy} x={-190} y={yy} width={240} height={10} rx={5} fill={C.case3} />)}
  </g>
);

/** Pedal de pie (se hunde con p 0-1) con un zapato encima. */
export const Pedal: React.FC<{ x: number; y: number; p: number; s?: number; o?: number }> = ({ x, y, p, s = 1, o = 1 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={-110} y={30} width={220} height={60} rx={14} fill={C.case1} stroke={C.ink} strokeWidth={5} />
    <g transform={`rotate(${-14 + 12 * p} -90 30)`}>
      <rect x={-100} y={-4} width={200} height={30} rx={10} fill={C.case3} stroke={C.ink} strokeWidth={5} />
      <g transform={`translate(0,${-70 * (1 - p)})`}><path d="M-90,-6 L-90,-80 Q-90,-104 -66,-104 L-24,-104 Q0,-104 6,-80 L20,-50 Q86,-46 100,-22 L100,-6 Z" fill={C.case2} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" /><rect x={-92} y={-14} width={194} height={14} rx={6} fill={C.ink} /></g>
    </g>
  </g>
);

/** Estudio (papel con gráfica) con un veredicto: ✓ (cian) o ✗ (rojo). */
export const Study: React.FC<{ x: number; y: number; ok: boolean; v: number; o?: number }> = ({ x, y, ok, v, o = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-150} y={-190} width={300} height={380} rx={16} fill={C.paper} stroke={C.ink} strokeWidth={6} />
    <text x={-40} y={-130} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>ESTUDIO</text>
    {[-90, -66].map((yy) => <rect key={yy} x={-110} y={yy} width={220} height={9} rx={4} fill={C.case3} />)}
    {[[-90, 70], [-40, 120], [10, 50], [60, 100]].map(([bx, bh], i) => <rect key={i} x={bx} y={140 - bh} width={36} height={bh} fill={i % 2 ? C.case2 : C.case3} />)}
    {v > 0.01 && (
      <g transform={`translate(140,-195) scale(${0.6 + 0.4 * v})`} opacity={v}>
        <circle r={56} fill={ok ? K.cold : K.warn} stroke={C.ink} strokeWidth={6} />
        {ok ? <path d="M-24,2 L-6,22 L28,-20" fill="none" stroke={C.ink} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M-20,-20 L20,20 M20,-20 L-20,20" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />}
      </g>
    )}
  </g>
);

/** Moneda (quién paga el estudio). */
export const Coin: React.FC<{ x: number; y: number; o?: number; t: number }> = ({ x, y, o = 1, t }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y + 8 * Math.sin(t * 3)})`} opacity={o}>
    <circle r={46} fill={K.flow} stroke={C.ink} strokeWidth={6} />
    <text y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={C.ink}>€</text>
  </g>
);

/** Aspa roja de «descartado». */
export const Cross: React.FC<{ x: number; y: number; s?: number; p: number }> = ({ x, y, s = 1, p }) => p <= 0.01 ? null : (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={p}>
    <path d={`M-60,-60 L${-60 + 120 * clamp01(p * 2)},${-60 + 120 * clamp01(p * 2)}`} stroke={K.warn} strokeWidth={18} strokeLinecap="round" />
    {p > 0.5 && <path d={`M60,-60 L${60 - 120 * clamp01(p * 2 - 1)},${-60 + 120 * clamp01(p * 2 - 1)}`} stroke={K.warn} strokeWidth={18} strokeLinecap="round" />}
  </g>
);
