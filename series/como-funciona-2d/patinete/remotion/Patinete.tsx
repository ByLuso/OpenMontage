// Dibujos SVG del episodio «patinete eléctrico». Todos son <g> para meter dentro de un <svg 1080×1920>.
import React from "react";
import { K, FONT } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#06101F", tyre: "#151d2a", grip: "#1b2433", metal: "#C9D3E0", copper: "#b8763f", iron: "#5d6d84", cell: "#3E6AA0" };

const glow = (v: number, col: string, px = 16) => (v > 0.05 ? { filter: `drop-shadow(0 0 ${px * v}px ${col})` } : {});

/** Interior de un motor de buje sin escobillas, centrado en (0,0) y de radio R.
 *  rot: giro (grados) de la parte exterior (neumático + carcasa + imanes). El estátor (bobinas) y el eje NO giran.
 *  lit: índice de fase activa (0, 1 o 2) o -1; coilHi resalta todas las bobinas; magHi resalta los imanes. */
export const MotorCore: React.FC<{ R: number; rot: number; lit?: number; litCol?: string; coilHi?: number; magHi?: number; tyre?: boolean; axleHi?: number }> =
  ({ R, rot, lit = -1, litCol = K.flow, coilHi = 0, magHi = 0, tyre = true, axleHi = 0 }) => {
    const nMag = 20, nT = 18;
    return (
      <g>
        <g transform={`rotate(${rot})`}>
          {tyre && (
            <>
              <circle r={R * 0.91} fill="none" stroke={C.tyre} strokeWidth={R * 0.18} />
              {Array.from({ length: 24 }).map((_, i) => (
                <rect key={i} x={-R * 0.02} y={-R * 0.99} width={R * 0.04} height={R * 0.07} fill="#26324a" transform={`rotate(${i * 15})`} />
              ))}
            </>
          )}
          <circle r={R * 0.81} fill={C.case1} stroke={C.case3} strokeWidth={Math.max(3, R * 0.02)} />
          {Array.from({ length: nMag }).map((_, i) => {
            const w = ((2 * Math.PI * R * 0.7) / nMag) * 0.78;
            return (
              <rect key={i} x={-w / 2} y={-R * 0.76} width={w} height={R * 0.1} rx={R * 0.015} fill={i % 2 ? K.cold : K.hot}
                transform={`rotate(${(i * 360) / nMag})`} opacity={0.75 + 0.25 * magHi} />
            );
          })}
          {magHi > 0.05 && <circle r={R * 0.71} fill="none" stroke={K.flow} strokeWidth={R * 0.012} opacity={0.6 * magHi} style={glow(magHi, K.flow, 14)} />}
        </g>
        <circle r={R * 0.655} fill={C.dark} />
        {/* estátor: dientes con bobinas (quieto) */}
        <circle r={R * 0.27} fill={C.iron} />
        {Array.from({ length: nT }).map((_, i) => {
          const on = lit >= 0 && i % 3 === lit;
          const col = on ? litCol : coilHi > 0.5 ? "#d8964f" : C.copper;
          return (
            <g key={i} transform={`rotate(${(i * 360) / nT})`}>
              <rect x={-R * 0.035} y={-R * 0.62} width={R * 0.07} height={R * 0.38} fill={C.iron} />
              <rect x={-R * 0.075} y={-R * 0.635} width={R * 0.15} height={R * 0.05} rx={R * 0.01} fill={C.iron} />
              <rect x={-R * 0.06} y={-R * 0.56} width={R * 0.12} height={R * 0.25} rx={R * 0.02} fill={col} style={on ? glow(1, litCol, 10) : {}} />
            </g>
          );
        })}
        {coilHi > 0.05 && <circle r={R * 0.6} fill="none" stroke={K.cold} strokeWidth={R * 0.012} strokeDasharray={`${R * 0.05} ${R * 0.04}`} opacity={coilHi} />}
        {/* eje fijo con sus caras planas */}
        <g style={glow(axleHi, K.cold, 14)}>
          <circle r={R * 0.12} fill={C.metal} stroke={axleHi > 0.05 ? K.cold : C.case1} strokeWidth={Math.max(2, R * 0.015)} />
          <rect x={-R * 0.06} y={-R * 0.06} width={R * 0.12} height={R * 0.12} fill={C.case1} />
        </g>
      </g>
    );
  };

/** Motor de buje grande en (cx, cy). */
export const HubMotor: React.FC<{ cx: number; cy: number; R: number; rot: number; lit?: number; litCol?: string; coilHi?: number; magHi?: number; tyre?: boolean; axleHi?: number; o?: number }> =
  ({ cx, cy, o = 1, ...p }) => (
    <g transform={`translate(${cx} ${cy})`} opacity={o}>
      <MotorCore {...p} />
    </g>
  );

/** Patinete eléctrico de perfil (mirando a la derecha). (cx, cy) = centro de la plataforma.
 *  Motor en la rueda trasera (izquierda). hubOpen 0→1 retira la tapa del buje; deckOpen 0→1 levanta la tapa de la plataforma (pilas + controlador). */
export const Scooter: React.FC<{ cx: number; cy: number; s?: number; t: number; spin?: number; hubOpen?: number; deckOpen?: number; batHi?: number; ctrlHi?: number; motorHi?: number; lit?: number; throttle?: number; frost?: number; o?: number }> =
  ({ cx, cy, s = 1, t, spin = 0, hubOpen = 0, deckOpen = 0, batHi = 0, ctrlHi = 0, motorHi = 0, lit = -1, throttle = 0, frost = 0, o = 1 }) => {
    const rw = { x: -300, y: 40 }, fw = { x: 300, y: 40 }, Rw = 88;
    return (
      <g transform={`translate(${cx} ${cy}) scale(${s})`} opacity={o}>
        <ellipse cx={0} cy={rw.y + Rw + 6} rx={420} ry={16} fill="#000" opacity={0.28} />
        {/* columna, horquilla y manillar */}
        <path d={`M ${fw.x} ${fw.y} L 236 -420`} stroke={C.case3} strokeWidth={24} strokeLinecap="round" />
        <path d="M 250 -6 L 282 -60" stroke={C.case2} strokeWidth={30} strokeLinecap="round" />
        <path d="M 150 -425 H 330" stroke={C.case3} strokeWidth={18} strokeLinecap="round" />
        <rect x={140} y={-440} width={60} height={30} rx={13} fill={C.grip} />
        <rect x={272} y={-440} width={64} height={30} rx={13} fill={C.grip} />
        {/* acelerador de gatillo (derecha) */}
        <g transform={`rotate(${18 * throttle} 268 -425)`}>
          <rect x={254} y={-425} width={18} height={44} rx={8} fill={throttle > 0.05 ? K.flow : C.case2} style={glow(throttle, K.flow, 12)} />
        </g>
        <rect x={206} y={-462} width={62} height={30} rx={8} fill={C.dark} stroke={C.case3} strokeWidth={4} />
        <rect x={214} y={-454} width={30} height={14} rx={3} fill={K.cold} opacity={0.8} />
        {/* guardabarros trasero */}
        <path d={`M ${rw.x - 96} ${rw.y - 10} A 100 100 0 0 1 ${rw.x + 60} ${rw.y - 84}`} fill="none" stroke={C.case2} strokeWidth={14} strokeLinecap="round" />
        {/* plataforma: hueco con pilas y controlador */}
        <rect x={-280} y={-22} width={545} height={46} rx={20} fill={C.case1} stroke={C.case3} strokeWidth={4} />
        <g opacity={0.25 + 0.75 * deckOpen}>
          <rect x={-262} y={-16} width={372} height={34} rx={8} fill={C.dark} />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x={-258 + i * 30.5} y={-13} width={26} height={28} rx={6} fill={batHi > 0.05 ? K.flow : C.cell} opacity={0.6 + 0.4 * batHi} style={glow(batHi, K.flow, 10)} />
          ))}
          <rect x={130} y={-16} width={110} height={34} rx={6} fill={C.dark} stroke={ctrlHi > 0.05 ? K.flow : C.case3} strokeWidth={4} style={glow(ctrlHi, K.flow, 14)} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={146 + i * 22} y={-6} width={12} height={14} fill={ctrlHi > 0.05 ? K.flow : C.case3} opacity={0.8} />)}
        </g>
        {/* tapa de la plataforma (se levanta) */}
        <g transform={`translate(0 ${-78 * deckOpen}) rotate(${-3 * deckOpen} -10 -30)`}>
          <rect x={-284} y={-38} width={553} height={22} rx={10} fill={C.grip} stroke={C.case3} strokeWidth={4} />
          {frost > 0.02 && <rect x={-284} y={-46} width={553} height={12} rx={6} fill="#dff4ff" opacity={0.85 * frost} />}
        </g>
        {/* rueda delantera */}
        <g transform={`translate(${fw.x} ${fw.y})`}>
          <circle r={Rw * 0.92} fill="none" stroke={C.tyre} strokeWidth={Rw * 0.18} />
          <circle r={Rw * 0.78} fill={C.case1} stroke={C.case3} strokeWidth={4} />
          <g transform={`rotate(${spin})`}>{[0, 60, 120].map((a) => <rect key={a} x={-5} y={-Rw * 0.74} width={10} height={Rw * 1.48} fill={C.case2} transform={`rotate(${a})`} />)}</g>
          <circle r={14} fill={C.metal} />
        </g>
        {/* rueda trasera = motor de buje */}
        <g transform={`translate(${rw.x} ${rw.y})`} style={glow(motorHi, K.flow, 18)}>
          <MotorCore R={Rw} rot={spin} lit={lit} magHi={motorHi} />
          {/* tapa del buje: se va hacia arriba a la izquierda */}
          <g transform={`translate(${-40 * hubOpen} ${-120 * hubOpen}) rotate(${-40 * hubOpen})`} opacity={1 - hubOpen}>
            <circle r={Rw * 0.8} fill={C.case3} stroke={C.case1} strokeWidth={5} />
            <circle r={Rw * 0.62} fill="none" stroke={C.case2} strokeWidth={4} />
            {Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={Rw * 0.5 * Math.cos(i * Math.PI / 3 + spin / 57.3)} cy={Rw * 0.5 * Math.sin(i * Math.PI / 3 + spin / 57.3)} r={5} fill={C.case1} />)}
            <circle r={Rw * 0.16} fill={C.metal} stroke={C.case1} strokeWidth={4} />
          </g>
        </g>
        {frost > 0.02 && (
          <g opacity={frost}>
            {[[-200, -60], [40, -70], [200, -470], [-60, -55], [300, -200]].map(([x, y], i) => <Flake key={i} x={x} y={y} r={18} />)}
          </g>
        )}
      </g>
    );
  };

/** Copo de nieve. */
export const Flake: React.FC<{ x: number; y: number; r?: number; o?: number; rot?: number }> = ({ x, y, r = 20, o = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o} stroke="#dff4ff" strokeWidth={Math.max(3, r * 0.18)} strokeLinecap="round">
    {[0, 60, 120].map((a) => <path key={a} d={`M 0 ${-r} V ${r} M ${-r * 0.35} ${-r * 0.7} L 0 ${-r * 0.4} L ${r * 0.35} ${-r * 0.7} M ${-r * 0.35} ${r * 0.7} L 0 ${r * 0.4} L ${r * 0.35} ${r * 0.7}`} transform={`rotate(${a})`} fill="none" />)}
  </g>
);

/** Nieve cayendo por toda la zona útil. */
export const Snow: React.FC<{ t: number; o: number; n?: number }> = ({ t, o, n = 16 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    {Array.from({ length: n }).map((_, i) => {
      const x = 90 + ((i * 397) % 900);
      const y = 400 + (((t * (40 + (i % 4) * 12) + i * 137) % 760));
      return <Flake key={i} x={x + 14 * Math.sin(t + i)} y={y} r={10 + (i % 3) * 5} rot={t * 30 + i * 20} o={0.75} />;
    })}
  </g>
);

/** Pack de pilas visto desde arriba: cols × rows. serie resalta las filas (pilas encadenadas); paralelo resalta los puentes verticales. */
export const CellPack: React.FC<{ x: number; y: number; cols: number; rows: number; r: number; gap?: number; lit?: number; serie?: number; paralelo?: number; t: number }> =
  ({ x, y, cols, rows, r, gap = 8, lit = 1, serie = 0, paralelo = 0, t }) => {
    const d = 2 * r + gap, W = cols * d, H = rows * d, x0 = x - W / 2 + d / 2, y0 = y - H / 2 + d / 2;
    const nLit = Math.round(lit * cols * rows);
    return (
      <g>
        <rect x={x - W / 2 - 26} y={y - H / 2 - 26} width={W + 52} height={H + 52} rx={30} fill={C.case1} stroke={C.case3} strokeWidth={6} />
        {Array.from({ length: rows }).map((_, j) => Array.from({ length: cols }).map((_, i) => {
          const k = j * cols + i, on = k < nLit;
          const cx = x0 + i * d, cy = y0 + j * d;
          return (
            <g key={k} opacity={on ? 1 : 0.3}>
              <circle cx={cx} cy={cy} r={r} fill={C.cell} stroke={C.dark} strokeWidth={4} />
              <circle cx={cx} cy={cy} r={r * 0.55} fill={(i + j) % 2 ? C.metal : "#7d8ea6"} />
              <text x={cx} y={cy + r * 0.2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.6} fill={C.case1}>{i % 2 ? "−" : "+"}</text>
            </g>
          );
        }))}
        {/* serie: tira amarilla que recorre cada fila */}
        {serie > 0.01 && Array.from({ length: rows }).map((_, j) => (
          <path key={`s${j}`} d={`M ${x0} ${y0 + j * d} H ${x0 + (cols - 1) * d * serie}`} stroke={K.flow} strokeWidth={r * 0.32} strokeLinecap="round" opacity={0.9}
            strokeDasharray={`${r * 0.9} ${r * 0.5}`} strokeDashoffset={-t * 60} style={glow(1, K.flow, 8)} />
        ))}
        {/* paralelo: puentes cian que unen las filas */}
        {paralelo > 0.01 && [0, cols - 1].map((i) => (
          <path key={`p${i}`} d={`M ${x0 + i * d} ${y0 - r * 0.2} V ${y0 + (rows - 1) * d * paralelo + r * 0.2}`} stroke={K.cold} strokeWidth={r * 0.42} strokeLinecap="round" style={glow(1, K.cold, 10)} />
        ))}
      </g>
    );
  };

/** Controlador (caja negra con chip). */
export const Controller: React.FC<{ x: number; y: number; w?: number; h?: number; hi?: number; t: number; o?: number }> = ({ x, y, w = 240, h = 150, hi = 0, t, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill={C.dark} stroke={hi > 0.05 ? K.flow : C.case3} strokeWidth={6} style={glow(hi, K.flow, 20)} />
    {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={-w / 2 + 6} y={-h / 2 + 18 + i * ((h - 36) / 4)} width={14} height={8} fill={C.case3} opacity={0.6} />)}
    <rect x={-w * 0.22} y={-h * 0.28} width={w * 0.44} height={h * 0.56} rx={8} fill={C.case1} stroke={K.flow} strokeOpacity={0.4 + 0.6 * hi} strokeWidth={4} />
    {Array.from({ length: 4 }).map((_, i) => (
      <rect key={i} x={-w * 0.16 + i * w * 0.09} y={-h * 0.14} width={w * 0.05} height={h * 0.28} rx={3} fill={K.flow}
        opacity={hi > 0.05 ? 0.35 + 0.65 * (Math.sin(t * 9 + i * 1.7) > 0 ? 1 : 0) : 0.25} />
    ))}
  </g>
);

/** Cable con corriente: steady = flujo continuo; pulsed = paquetes separados. */
export const Wire: React.FC<{ d: string; t: number; on?: number; color?: string; w?: number; pulsed?: boolean; speed?: number; rev?: boolean }> =
  ({ d, t, on = 1, color = K.flow, w = 12, pulsed = false, speed = 160, rev = false }) => (
    <g>
      <path d={d} fill="none" stroke={C.case1} strokeWidth={w + 8} strokeLinecap="round" strokeLinejoin="round" />
      {on > 0.01 && (
        <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={on}
          strokeDasharray={pulsed ? `${w * 1.6} ${w * 4.5}` : `${w * 3.5} ${w * 1.4}`} strokeDashoffset={(rev ? 1 : -1) * t * speed} style={glow(on, color, 8)} />
      )}
    </g>
  );

/** Batería en horizontal con nivel (0-1). */
export const Battery: React.FC<{ x: number; y: number; w?: number; h?: number; level: number; color?: string; hi?: number; o?: number }> = ({ x, y, w = 300, h = 140, level, color, hi = 0, o = 1 }) => {
  const col = color ?? (level < 0.25 ? K.warn : K.flow);
  return (
    <g transform={`translate(${x} ${y})`} opacity={o} style={glow(hi, K.flow, 16)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={20} fill={C.dark} stroke={C.case3} strokeWidth={7} />
      <rect x={w / 2} y={-h * 0.2} width={w * 0.06} height={h * 0.4} rx={5} fill={C.case3} />
      <rect x={-w / 2 + 12} y={-h / 2 + 12} width={Math.max(0, (w - 24) * level)} height={h - 24} rx={10} fill={col} />
    </g>
  );
};

/** Velocímetro: valor 0-40 km/h; zona roja por encima de 25. */
export const Speedo: React.FC<{ x: number; y: number; r: number; v: number; o?: number; lockHi?: number }> = ({ x, y, r, v, o = 1, lockHi = 0 }) => {
  const A0 = 210, A1 = -30, max = 40;
  const ang = (val: number) => ((A0 + (A1 - A0) * (val / max)) * Math.PI) / 180;
  const pt = (val: number, rr: number) => [rr * Math.cos(ang(val)), -rr * Math.sin(ang(val))];
  const arc = (a: number, b: number, rr: number) => { const [x1, y1] = pt(a, rr), [x2, y2] = pt(b, rr); return `M ${x1} ${y1} A ${rr} ${rr} 0 ${(b - a) / max * 240 > 180 ? 1 : 0} 1 ${x2} ${y2}`; };
  const [nx, ny] = pt(v, r * 0.78);
  return (
    <g transform={`translate(${x} ${y})`} opacity={o}>
      <circle r={r} fill={C.dark} stroke={C.case3} strokeWidth={8} />
      <path d={arc(0, 25, r * 0.86)} fill="none" stroke={K.cold} strokeWidth={r * 0.08} />
      <path d={arc(25, 40, r * 0.86)} fill="none" stroke={K.warn} strokeWidth={r * 0.08} opacity={0.5 + 0.5 * lockHi} style={glow(lockHi, K.warn, 14)} />
      {[0, 5, 10, 15, 20, 25, 30, 35, 40].map((k) => { const [a, b] = pt(k, r * 0.74), [c, d] = pt(k, r * 0.66); return <path key={k} d={`M ${a} ${b} L ${c} ${d}`} stroke={K.white} strokeWidth={6} />; })}
      {[0, 10, 20, 30, 40].map((k) => { const [a, b] = pt(k, r * 0.53); return <text key={k} x={a} y={b + 14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.12} fill={C.case3}>{k}</text>; })}
      <path d={`M 0 0 L ${nx} ${ny}`} stroke={K.flow} strokeWidth={12} strokeLinecap="round" style={glow(1, K.flow, 10)} />
      <circle r={r * 0.08} fill={K.flow} />
      <text x={0} y={r * 0.5} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.3} fill={K.white}>{Math.round(v)}</text>
      <text x={0} y={r * 0.68} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.11} fill={C.case3}>km/h</text>
    </g>
  );
};

/** Termómetro: level 0-1 y color. */
export const Thermo: React.FC<{ x: number; y: number; h?: number; level: number; color: string; o?: number }> = ({ x, y, h = 300, level, color, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <rect x={-26} y={-h / 2} width={52} height={h} rx={26} fill={C.dark} stroke={C.case3} strokeWidth={6} />
    <circle cx={0} cy={h / 2 + 20} r={46} fill={C.dark} stroke={C.case3} strokeWidth={6} />
    <circle cx={0} cy={h / 2 + 20} r={34} fill={color} style={glow(1, color, 10)} />
    <rect x={-12} y={h / 2 - (h - 20) * level} width={24} height={(h - 20) * level + 20} rx={10} fill={color} />
    {[0.2, 0.4, 0.6, 0.8].map((k) => <rect key={k} x={26} y={h / 2 - h * k} width={18} height={5} fill={C.case3} />)}
  </g>
);

/** Rueda de aire de perfil con su manómetro. squash 0-1 aplasta la parte de abajo (rueda baja). */
export const Tyre: React.FC<{ x: number; y: number; r: number; squash?: number; t: number; spin?: number; psi: number; col: string; o?: number }> = ({ x, y, r, squash = 0, t, spin = 0, psi, col, o = 1 }) => {
  const fw = r * (0.15 + 0.45 * squash);
  const ga = (-210 + 240 * psi) * Math.PI / 180;
  return (
    <g opacity={o}>
      <g transform={`translate(${x} ${y})`}>
        <ellipse cx={0} cy={r + 6} rx={r * (0.9 + 0.35 * squash)} ry={14} fill="#000" opacity={0.3} />
        {squash < 0.05 ? <circle r={r} fill={C.tyre} stroke="#26324a" strokeWidth={6} />
          : <path d={`M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0 C ${r * (1 + 0.12 * squash)} ${r * 0.6}, ${fw + r * 0.3} ${r}, ${fw} ${r} L ${-fw} ${r} C ${-fw - r * 0.3} ${r}, ${-r * (1 + 0.12 * squash)} ${r * 0.6}, ${-r} 0 Z`} fill={C.tyre} stroke="#26324a" strokeWidth={6} />}
        <circle r={r * 0.6} fill={C.case1} stroke={C.case3} strokeWidth={5} />
        <g transform={`rotate(${spin})`}>{[0, 45, 90, 135].map((a) => <rect key={a} x={-5} y={-r * 0.56} width={10} height={r * 1.12} fill={C.case2} transform={`rotate(${a})`} />)}</g>
        <circle r={r * 0.14} fill={C.metal} />
        {/* válvula + manómetro */}
        <path d={`M ${r * 0.5} ${-r * 0.3} L ${r * 0.9} ${-r * 0.95}`} stroke={C.case3} strokeWidth={8} />
        <g transform={`translate(${r * 0.95} ${-r * 1.08})`}>
          <circle r={58} fill={C.dark} stroke={col} strokeWidth={7} style={glow(0.6, col, 10)} />
          <path d={`M 0 0 L ${42 * Math.cos(ga)} ${42 * Math.sin(ga)}`} stroke={col} strokeWidth={8} strokeLinecap="round" />
          <circle r={8} fill={col} />
        </g>
      </g>
    </g>
  );
};

/** Casa (marco con tejado). */
export const HouseFrame: React.FC<{ x: number; y: number; w: number; h: number; o?: number; warm?: number }> = ({ x, y, w, h, o = 1, warm = 0 }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={w} height={h} rx={10} fill={K.hot} opacity={0.06 + 0.1 * warm} />
    <path d={`M ${x - 30} ${y + 4} L ${x + w / 2} ${y - 140} L ${x + w + 30} ${y + 4}`} fill="none" stroke={C.case3} strokeWidth={12} strokeLinejoin="round" />
    <path d={`M ${x} ${y} V ${y + h} H ${x + w} V ${y}`} fill="none" stroke={C.case3} strokeWidth={10} />
  </g>
);

/** Enchufe del cargador. */
export const Plug: React.FC<{ x: number; y: number; s?: number; on?: number; o?: number }> = ({ x, y, s = 1, on = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-60} y={-50} width={120} height={100} rx={22} fill={C.case2} stroke={on > 0.05 ? K.flow : C.case3} strokeWidth={6} style={glow(on, K.flow, 14)} />
    <rect x={-30} y={-90} width={14} height={44} rx={4} fill={C.metal} />
    <rect x={16} y={-90} width={14} height={44} rx={4} fill={C.metal} />
    <path d="M 0 50 V 120" stroke={C.case3} strokeWidth={14} strokeLinecap="round" />
    <path d="M -12 -18 L 6 -18 L -6 8 L 14 8" fill="none" stroke={on > 0.05 ? K.flow : C.case3} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

/** Aspa roja. */
export const Cross: React.FC<{ x: number; y: number; s?: number; o?: number; color?: string }> = ({ x, y, s = 1, o = 1, color = K.warn }) => o <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} stroke={color} strokeWidth={16} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
    <path d="M -40 -40 L 40 40 M 40 -40 L -40 40" />
  </g>
);

/** Cadena (eslabones) y correa: lo que NO lleva. */
export const Chain: React.FC<{ x: number; y: number; w?: number; o?: number }> = ({ x, y, w = 260, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    {Array.from({ length: Math.floor(w / 46) }).map((_, i) => (
      <rect key={i} x={-w / 2 + i * 46} y={i % 2 ? -14 : -20} width={56} height={i % 2 ? 28 : 40} rx={16} fill="none" stroke={C.case3} strokeWidth={8} />
    ))}
  </g>
);
export const Belt: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o} fill="none" stroke={C.case3} strokeWidth={10}>
    <circle cx={-80} cy={0} r={34} /><circle cx={80} cy={0} r={22} />
    <path d="M -80 -44 L 80 -32 M -80 44 L 80 32" strokeWidth={12} />
  </g>
);

/** Flecha curva de giro alrededor de (x, y). */
export const SpinArrow: React.FC<{ x: number; y: number; r: number; a0: number; a1: number; color?: string; o?: number; w?: number }> = ({ x, y, r, a0, a1, color = K.flow, o = 1, w = 10 }) => {
  if (o <= 0.01) return null;
  const p = (a: number) => [x + r * Math.cos((a * Math.PI) / 180), y + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  const tang = ((a1 + 90) * Math.PI) / 180;
  const hx = x1 + 22 * Math.cos(tang), hy = y1 + 22 * Math.sin(tang);
  const nx = Math.cos((a1 * Math.PI) / 180), ny = Math.sin((a1 * Math.PI) / 180);
  return (
    <g opacity={o} style={glow(1, color, 8)}>
      <path d={`M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M ${hx} ${hy} L ${x1 + 18 * nx} ${y1 + 18 * ny} L ${x1 - 18 * nx} ${y1 - 18 * ny} Z`} fill={color} />
    </g>
  );
};
