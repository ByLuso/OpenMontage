// Dibujos SVG del episodio «puerta automática». Todos son <g> para meter dentro de un <svg 1080×1920>.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#06101F", metal: "#C9D3E0", rubber: "#151d2a", body: "#9FB3CC" };

const glow = (v: number, col: string, px = 16) => (v > 0.05 ? { filter: `drop-shadow(0 0 ${px * v}px ${col})` } : {});
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Silueta neutra de frente o de perfil, con los pies en (x, y). walk: balanceo de piernas (0-1). arms: brazos arriba agitándose (0-1). */
export const Person: React.FC<{ x: number; y: number; s?: number; t: number; walk?: number; arms?: number; col?: string; o?: number; hi?: number }> =
  ({ x, y, s = 1, t, walk = 0, arms = 0, col = C.body, o = 1, hi = 0 }) => {
    const sw = walk * 22 * Math.sin(t * 7);
    const armA = (side: number) => side * (-(12 + 150 * arms) + arms * 24 * Math.sin(t * 11 + side)) - (1 - arms) * sw * 0.8;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} style={glow(hi, K.flow, 18)}>
        {[-1, 1].map((side) => (
          <g key={`l${side}`} transform={`translate(${side * 16} -125) rotate(${side * sw})`}>
            <rect x={-13} y={0} width={26} height={125} rx={13} fill={col} />
          </g>
        ))}
        <rect x={-38} y={-240} width={76} height={132} rx={30} fill={col} />
        {[-1, 1].map((side) => (
          <g key={`a${side}`} transform={`translate(${side * 36} -228) rotate(${armA(side)})`}>
            <rect x={-11} y={0} width={22} height={105} rx={11} fill={col} />
          </g>
        ))}
        <circle cx={0} cy={-275} r={32} fill={col} />
      </g>
    );
  };

/** Persona vista desde arriba (planta). */
export const PersonTop: React.FC<{ x: number; y: number; s?: number; rot?: number; col?: string; o?: number }> = ({ x, y, s = 1, rot = 0, col = C.body, o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={46} ry={22} fill={col} />
    <circle cx={0} cy={0} r={19} fill={C.case2} stroke={col} strokeWidth={4} />
  </g>
);

type DoorProps = {
  cx: number; top: number; s?: number; t: number; open: number;
  cover?: number; sensor?: boolean; sensorHi?: number; waves?: number;
  ir?: number; irHit?: [number, number]; motorHi?: number; beltHi?: number; wheelHi?: number; ctrlHi?: number; mat?: number; matHi?: number; o?: number;
};

/** Puerta corredera de frente. Coordenadas locales: x −460…460, y 0 (techo de la caja) … 830 (suelo).
 *  open 0-1 desliza las hojas; cover 0-1 levanta la tapa de la caja y deja ver motor, correa, carros y carril. */
export const Door: React.FC<DoorProps> = ({ cx, top, s = 1, t, open, cover = 0, sensor = true, sensorHi = 0, waves = 0, ir = 0, irHit, motorHi = 0, beltHi = 0, wheelHi = 0, ctrlHi = 0, mat = 0, matHi = 0, o = 1 }) => {
  const trav = 165 * open;
  const beltOff = trav;
  const P = 340, py = 95, pr = 24;
  const pulleyRot = (beltOff / pr) * (180 / Math.PI);
  const clampL = -60 - trav, clampR = 60 + trav;
  const leafL = [-300 - trav, -trav], leafR = [trav, 300 + trav];
  const beltCol = beltHi > 0.05 ? K.flow : "#33415a";
  const irXs = Array.from({ length: 11 }).map((_, i) => -260 + i * 52);
  return (
    <g transform={`translate(${cx} ${top}) scale(${s})`} opacity={o}>
      {/* paneles fijos laterales */}
      <rect x={-460} y={150} width={160} height={680} fill={K.cold} fillOpacity={0.07} stroke={C.case2} strokeWidth={6} />
      <rect x={300} y={150} width={160} height={680} fill={K.cold} fillOpacity={0.07} stroke={C.case2} strokeWidth={6} />
      {/* alfombra (puerta de 1954) */}
      {mat > 0.01 && (
        <g opacity={mat} style={glow(matHi, K.flow, 22)}>
          <path d="M -250 832 L 250 832 L 300 880 L -300 880 Z" fill={matHi > 0.05 ? "#6b5a1c" : C.case1} stroke={matHi > 0.05 ? K.flow : C.case3} strokeWidth={5} />
          {[-180, -90, 0, 90, 180].map((dx) => <path key={dx} d={`M ${dx} 840 L ${dx * 1.18} 872`} stroke={C.case3} strokeWidth={3} opacity={0.5} />)}
        </g>
      )}
      {/* suelo y umbral */}
      <path d="M -520 830 H 520" stroke={C.case3} strokeWidth={6} />
      <rect x={-300} y={822} width={600} height={14} rx={4} fill={C.case2} />
      {/* cortina de infrarrojos */}
      {ir > 0.01 && irXs.map((x, i) => {
        const hit = irHit && x > irHit[0] && x < irHit[1];
        const col = hit ? K.flow : K.hot;
        return (
          <g key={i} opacity={ir}>
            <path d={`M ${x} 162 V 822`} stroke={col} strokeWidth={hit ? 6 : 4} strokeDasharray="10 16" strokeDashoffset={-t * 90} opacity={hit ? 1 : 0.75} style={hit ? glow(1, K.flow, 10) : {}} />
            <circle cx={x} cy={822} r={hit ? 9 : 6} fill={col} />
          </g>
        );
      })}
      {/* hojas */}
      {[leafL, leafR].map(([a, b], i) => (
        <g key={i}>
          <rect x={a} y={150} width={b - a} height={672} fill={K.cold} fillOpacity={0.18} stroke={C.case3} strokeWidth={8} />
          <path d={`M ${a + 40} 230 L ${a + 110} 300 M ${a + 40} 290 L ${a + 70} 320`} stroke={K.white} strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" />
          <rect x={i === 0 ? b - 22 : a + 10} y={440} width={12} height={150} rx={6} fill={C.case3} opacity={0.7} />
        </g>
      ))}
      {/* marcos */}
      <rect x={-470} y={150} width={20} height={680} fill={C.case2} />
      <rect x={450} y={150} width={20} height={680} fill={C.case2} />
      {/* caja: interior */}
      <rect x={-470} y={0} width={940} height={150} rx={10} fill={C.dark} stroke={C.case2} strokeWidth={6} />
      <rect x={-445} y={33} width={890} height={10} rx={4} fill={wheelHi > 0.05 ? K.cold : C.metal} style={glow(wheelHi, K.cold, 10)} />
      {/* correa dentada entre dos poleas */}
      <g style={glow(beltHi, K.flow, 12)}>
        <rect x={-P - pr} y={py - pr - 4} width={2 * P + 2 * pr} height={2 * pr + 8} rx={pr + 4} fill="none" stroke={beltCol} strokeWidth={9} />
        {Array.from({ length: 30 }).map((_, i) => {
          const xt = -P + mod(i * 23 + beltOff, 690);
          const xb = P - mod(i * 23 + beltOff, 690);
          return (
            <g key={i}>
              {xt < P && <rect x={xt - 3} y={py - pr - 2} width={6} height={7} fill={beltCol} />}
              {xb > -P && <rect x={xb - 3} y={py + pr - 5} width={6} height={7} fill={beltCol} />}
            </g>
          );
        })}
      </g>
      {[-P, P].map((x, i) => (
        <g key={i} transform={`translate(${x} ${py}) rotate(${pulleyRot})`}>
          <circle r={pr} fill={C.case2} stroke={C.metal} strokeWidth={4} />
          <path d={`M ${-pr + 5} 0 H ${pr - 5} M 0 ${-pr + 5} V ${pr - 5}`} stroke={C.metal} strokeWidth={4} />
        </g>
      ))}
      {/* motor (a la izquierda) y cerebro (a la derecha) */}
      <g style={glow(motorHi, K.hot, 18)}>
        <rect x={-462} y={52} width={92} height={86} rx={14} fill={motorHi > 0.05 ? "#8a4a1c" : C.case2} stroke={motorHi > 0.05 ? K.hot : C.case3} strokeWidth={5} />
        {[0, 1, 2, 3].map((k) => <path key={k} d={`M ${-450 + k * 20} 62 V 128`} stroke={C.dark} strokeWidth={5} opacity={0.5} />)}
        <path d={`M -370 95 H ${-P}`} stroke={C.metal} strokeWidth={8} />
      </g>
      <g style={glow(ctrlHi, K.flow, 18)}>
        <rect x={372} y={52} width={90} height={86} rx={10} fill={C.dark} stroke={ctrlHi > 0.05 ? K.flow : C.case3} strokeWidth={5} />
        {[0, 1, 2].map((k) => <rect key={k} x={388 + k * 22} y={78} width={12} height={34} rx={3} fill={K.flow} opacity={ctrlHi > 0.05 ? 0.4 + 0.6 * (Math.sin(t * 9 + k * 1.9) > 0 ? 1 : 0) : 0.25} />)}
      </g>
      {/* carros con ruedecitas sobre el carril, colgando las hojas */}
      {[leafL, leafR].map(([a, b], i) => (
        <g key={i} style={glow(wheelHi, K.cold, 10)}>
          <rect x={a + 20} y={46} width={b - a - 40} height={14} rx={6} fill={C.case3} />
          {[a + 45, b - 45].map((wx, k) => (
            <g key={k}>
              <path d={`M ${wx} 40 V 150`} stroke={C.case3} strokeWidth={8} />
              <circle cx={wx} cy={28} r={13} fill={wheelHi > 0.05 ? K.cold : C.metal} stroke={C.dark} strokeWidth={4} />
            </g>
          ))}
        </g>
      ))}
      {/* pinzas: la hoja izquierda va al ramal de abajo y la derecha al de arriba → se mueven en sentidos opuestos */}
      <rect x={clampL - 12} y={py + pr - 14} width={24} height={26} rx={4} fill={K.flow} opacity={0.4 + 0.6 * beltHi} />
      <path d={`M ${clampL} ${py + pr + 10} V 150`} stroke={C.case3} strokeWidth={6} />
      <rect x={clampR - 12} y={py - pr - 12} width={24} height={26} rx={4} fill={K.flow} opacity={0.4 + 0.6 * beltHi} />
      <path d={`M ${clampR} ${py - pr + 12} V 150`} stroke={C.case3} strokeWidth={6} />
      {/* tapa de la caja (se levanta) */}
      {cover < 0.999 && (
        <g transform={`translate(0 ${-200 * cover})`} opacity={1 - cover}>
          <rect x={-470} y={0} width={940} height={150} rx={10} fill={C.case1} stroke={C.case3} strokeWidth={6} />
          <rect x={-420} y={52} width={840} height={46} rx={8} fill={C.case2} opacity={0.5} />
        </g>
      )}
      {/* emisor de la cortina */}
      {ir > 0.01 && <rect x={-280} y={150} width={560} height={12} rx={5} fill={K.hot} opacity={ir} />}
      {/* radar */}
      {sensor && (
        <g style={glow(sensorHi, K.cold, 22)}>
          <rect x={-55} y={150} width={110} height={34} rx={8} fill={C.case2} stroke={sensorHi > 0.05 ? K.cold : C.case3} strokeWidth={5} />
          <path d="M -30 184 A 30 22 0 0 0 30 184 Z" fill={sensorHi > 0.05 ? K.cold : C.case3} />
        </g>
      )}
      {sensor && waves > 0.01 && [0, 1, 2, 3].map((k) => {
        const p = mod(t * 0.9 + k / 4, 1);
        const r = 40 + p * 560;
        const a0 = (25 * Math.PI) / 180, a1 = (155 * Math.PI) / 180;
        return <path key={k} d={`M ${r * Math.cos(a0)} ${200 + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${r * Math.cos(a1)} ${200 + r * Math.sin(a1)}`}
          fill="none" stroke={K.cold} strokeWidth={8} strokeLinecap="round" opacity={waves * (1 - p) * 0.9} />;
      })}
    </g>
  );
};

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

/** Puerta vista de perfil: caja arriba con el radar mirando hacia la izquierda; vidrio que se vuelve transparente al abrir. */
export const SideDoor: React.FC<{ x: number; floor: number; open: number; sensorHi?: number; o?: number }> = ({ x, floor, open, sensorHi = 0, o = 1 }) => (
  <g opacity={o}>
    <rect x={x - 70} y={floor - 760} width={140} height={110} rx={10} fill={C.case1} stroke={C.case3} strokeWidth={6} />
    <g transform={`translate(${x - 70} ${floor - 668}) rotate(35)`} style={glow(sensorHi, K.cold, 20)}>
      <rect x={-50} y={-14} width={56} height={34} rx={7} fill={C.case2} stroke={sensorHi > 0.05 ? K.cold : C.case3} strokeWidth={4} />
      <path d="M -50 -8 A 14 14 0 0 0 -50 14 Z" fill={sensorHi > 0.05 ? K.cold : C.case3} />
    </g>
    <rect x={x - 12} y={floor - 650} width={24} height={650} fill={K.cold} fillOpacity={0.25 * (1 - 0.8 * open)} stroke={C.case3} strokeWidth={5} strokeOpacity={1 - 0.75 * open} strokeDasharray={open > 0.3 ? "18 14" : undefined} />
    <path d={`M 60 ${floor} H 1020`} stroke={C.case3} strokeWidth={6} />
  </g>
);

/** Ambulancia de perfil (sin rótulos), mirando a la derecha, con el centro de la sirena en (x, y). */
export const Ambulance: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => {
  const blink = Math.sin(t * 14) > 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-150} y={20} width={230} height={140} rx={14} fill={K.white} />
      <path d="M 80 60 H 130 L 170 110 V 160 H 80 Z" fill={K.white} />
      <path d="M 92 72 H 126 L 156 110 H 92 Z" fill={C.case2} />
      <rect x={-150} y={110} width={320} height={16} fill={K.warn} />
      <path d="M -60 50 h 24 v 24 h 24 v 24 h -24 v 24 h -24 v -24 h -24 v -24 h 24 Z" fill={K.warn} />
      <rect x={-20} y={0} width={50} height={20} rx={6} fill={blink ? K.cold : "#1f5f7a"} style={blink ? glow(1, K.cold, 18) : {}} />
      {[-95, 120].map((wx) => <g key={wx}><circle cx={wx} cy={165} r={30} fill={C.rubber} /><circle cx={wx} cy={165} r={12} fill={C.case3} /></g>)}
    </g>
  );
};

/** Frentes de onda Doppler de una fuente que se mueve en x a velocidad v (px/s) desde x0 en el instante a; c = velocidad de la onda. */
export const DopplerRings: React.FC<{ t: number; a: number; x0: number; y: number; v: number; c: number; every?: number; maxR?: number; color?: string; o?: number }> =
  ({ t, a, x0, y, v, c, every = 0.28, maxR = 520, color = K.cold, o = 1 }) => {
    if (o <= 0.01) return null;
    const out: React.ReactNode[] = [];
    const k0 = Math.floor((t - maxR / c - a) / every);
    for (let k = Math.max(0, k0); a + k * every <= t; k++) {
      const te = a + k * every;
      const r = c * (t - te);
      if (r > maxR) continue;
      out.push(<circle key={k} cx={x0 + v * (te - a)} cy={y} r={r} fill="none" stroke={color} strokeWidth={7} opacity={o * (1 - r / maxR) * 0.9} />);
    }
    return <g>{out}</g>;
  };

/** Puerta vista desde arriba (planta): pared horizontal en y, hueco central, hojas que se separan y abanico del radar. */
export const DoorTop: React.FC<{ y: number; open: number; fan?: number; t: number; fanCol?: string }> = ({ y, open, fan = 0, t, fanCol = K.cold }) => {
  const tr = 150 * open;
  const r = 430, a0 = (35 * Math.PI) / 180, a1 = (145 * Math.PI) / 180;
  return (
    <g>
      {fan > 0.01 && (
        <g opacity={fan}>
          <path d={`M 540 ${y + 20} L ${540 + r * Math.cos(a0)} ${y + 20 + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${540 + r * Math.cos(a1)} ${y + 20 + r * Math.sin(a1)} Z`} fill={fanCol} fillOpacity={0.12} stroke={fanCol} strokeOpacity={0.5} strokeWidth={4} />
          {[0, 1, 2].map((k) => { const p = mod(t * 0.8 + k / 3, 1); const rr = 40 + p * (r - 40);
            return <path key={k} d={`M ${540 + rr * Math.cos(a0)} ${y + 20 + rr * Math.sin(a0)} A ${rr} ${rr} 0 0 1 ${540 + rr * Math.cos(a1)} ${y + 20 + rr * Math.sin(a1)}`} fill="none" stroke={fanCol} strokeWidth={6} opacity={(1 - p) * 0.8} />; })}
        </g>
      )}
      <rect x={80} y={y - 14} width={300} height={28} fill={C.case2} />
      <rect x={700} y={y - 14} width={300} height={28} fill={C.case2} />
      <rect x={390 - tr} y={y - 8} width={150} height={16} rx={6} fill={K.cold} opacity={0.8} />
      <rect x={540 + tr} y={y - 8} width={150} height={16} rx={6} fill={K.cold} opacity={0.8} />
      <circle cx={540} cy={y + 20} r={14} fill={K.cold} />
    </g>
  );
};

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

/** Aspa roja. */
export const Cross: React.FC<{ x: number; y: number; s?: number; o?: number; color?: string }> = ({ x, y, s = 1, o = 1, color = K.warn }) => o <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} stroke={color} strokeWidth={16} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
    <path d="M -40 -40 L 40 40 M 40 -40 L -40 40" />
  </g>
);

/** Radar de tráfico de mano (pistola), mirando a la derecha. */
export const RadarGun: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-90} y={-40} width={150} height={70} rx={14} fill={C.case2} stroke={C.case3} strokeWidth={5} />
    <path d="M 60 -40 L 100 -55 V 45 L 60 30 Z" fill={C.case3} />
    <rect x={-60} y={-28} width={60} height={30} rx={5} fill={C.dark} />
    <path d="M -50 30 L -70 110 H -30 L -10 30 Z" fill={C.case1} stroke={C.case3} strokeWidth={4} />
  </g>
);

/** Cerebro electrónico (placa con luces). */
export const Brain: React.FC<{ x: number; y: number; w?: number; h?: number; hi?: number; t: number; o?: number }> = ({ x, y, w = 220, h = 140, hi = 0, t, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill={C.dark} stroke={hi > 0.05 ? K.flow : C.case3} strokeWidth={6} style={glow(hi, K.flow, 20)} />
    <rect x={-w * 0.22} y={-h * 0.28} width={w * 0.44} height={h * 0.56} rx={8} fill={C.case1} stroke={K.flow} strokeOpacity={0.4 + 0.6 * hi} strokeWidth={4} />
    {Array.from({ length: 4 }).map((_, i) => (
      <rect key={i} x={-w * 0.16 + i * w * 0.09} y={-h * 0.14} width={w * 0.05} height={h * 0.28} rx={3} fill={K.flow}
        opacity={hi > 0.05 ? 0.35 + 0.65 * (Math.sin(t * 9 + i * 1.7) > 0 ? 1 : 0) : 0.25} />
    ))}
  </g>
);

/** Cable con impulsos que avanzan. */
export const Wire: React.FC<{ d: string; t: number; on?: number; color?: string; w?: number }> = ({ d, t, on = 1, color = K.flow, w = 10 }) => (
  <g>
    <path d={d} fill="none" stroke={C.case1} strokeWidth={w + 8} strokeLinecap="round" strokeLinejoin="round" />
    {on > 0.01 && <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="26 22" strokeDashoffset={-t * 160} opacity={on} style={glow(on, color, 10)} />}
  </g>
);
