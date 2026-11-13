// Dibujos SVG del episodio «Cómo funciona el ventilador sin aspas». Coordenadas absolutas de 1080×1920.
// Colores de código: cian = aire, amarillo = lo importante (chorro, rendija), naranja = motor/energía, blanco = texto y sonido, rojo = peligro.
// Aro genérico: sin marcas ni formas reconocibles de ningún fabricante.
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

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

/** Rotor (impulsor) visto de frente: aspas curvas alrededor de un buje, dentro de su carcasa. */
export const Impeller: React.FC<{ x: number; y: number; r: number; a: number; blades?: number; o?: number; glow?: number }> = ({ x, y, r, a, blades = 9, o = 1, glow = 0 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <circle r={r} fill={C.inner} stroke={C.case3} strokeWidth={Math.max(3, r * 0.05)} />
    <g transform={`rotate(${a})`} style={glow > 0.05 ? { filter: `drop-shadow(0 0 ${10 * glow}px ${K.flow})` } : undefined}>
      {Array.from({ length: blades }).map((_, i) => (
        <path key={i} transform={`rotate(${(360 / blades) * i})`}
          d={`M0,${-r * 0.3} C${r * 0.28},${-r * 0.45} ${r * 0.42},${-r * 0.7} ${r * 0.34},${-r * 0.92} L${r * 0.14},${-r * 0.9} C${r * 0.2},${-r * 0.7} ${r * 0.1},${-r * 0.48} ${-r * 0.06},${-r * 0.3} Z`}
          fill={C.case3} stroke={C.ink} strokeWidth={Math.max(2, r * 0.02)} />
      ))}
      <circle r={r * 0.32} fill={C.case2} stroke={C.ink} strokeWidth={Math.max(2, r * 0.025)} />
      <circle r={r * 0.1} fill={C.case3} />
    </g>
  </g>
);

/**
 * Ventilador sin aspas de frente. (cx, cy) = centro del aro; R = radio medio del aro. Pie debajo (local y 250-470).
 * open: la carcasa del pie se aparta y se ve dentro; spin: el rotor gira; intake: aire que entra por la rejilla;
 * up: aire que sube por el cuello; fill: el aro hueco por dentro con aire dando la vuelta; out: aire que sale hacia ti;
 * slit: resalta la rendija; hi: "base" | "ring"; cloth: trapo dando la vuelta (0-1 = recorrido); chambers: cámaras del pie.
 */
export const Fan: React.FC<{ cx?: number; cy?: number; s?: number; t: number; open?: number; spin?: number; intake?: number; up?: number; fill?: number; out?: number; slit?: number;
  hi?: string; cloth?: number; id?: string }> =
  ({ cx = 540, cy = 620, s = 1, t, open = 0, spin = 0, intake = 0, up = 0, fill = 0, out = 0, slit = 0, hi = "", cloth = -1, id = "f" }) => {
    const R = 210, th = 54;
    const hiG = (k: string) => (hi === k ? { filter: `drop-shadow(0 0 16px ${K.flow})` } : undefined);
    const ped = "M-130,232 L130,232 L146,500 Q147,520 128,520 L-128,520 Q-147,520 -146,500 Z";
    const a = t * 720 * spin;
    return (
      <g transform={`translate(${cx},${cy}) scale(${s})`}>
        {/* aire que sale hacia ti: anillos que se abren y se desvanecen */}
        {out > 0.01 && [0, 1, 2].map((k) => {
          const ph = (t * 0.6 + k / 3) % 1;
          return <circle key={k} r={R - 20 + ph * 120} fill="none" stroke={K.cold} strokeWidth={10 - 6 * ph} opacity={out * (1 - ph) * 0.8} />;
        })}
        {/* aro */}
        <g style={hiG("ring")}>
          <circle r={R} fill="none" stroke={C.ink} strokeWidth={th + 10} />
          <circle r={R} fill="none" stroke={C.case2} strokeWidth={th} />
          <circle r={R + 14} fill="none" stroke={K.white} strokeOpacity={0.18} strokeWidth={8} />
          {fill > 0.01 && (
            <g opacity={fill}>
              <circle r={R + 2} fill="none" stroke={C.inner} strokeWidth={th - 18} />
              <circle r={R + 2} fill="none" stroke={K.cold} strokeWidth={9} strokeDasharray="26 22" strokeDashoffset={-t * 220} />
              <circle r={R + 2} fill="none" stroke={K.cold} strokeWidth={9} strokeDasharray="26 22" strokeDashoffset={t * 220} opacity={0.5} />
            </g>
          )}
          {/* rendija: una línea finísima en el borde interior */}
          <circle r={R - th / 2 + 7} fill="none" stroke={slit > 0.05 ? K.flow : C.ink} strokeWidth={slit > 0.05 ? 4 + 3 * slit : 3}
            style={slit > 0.05 ? { filter: `drop-shadow(0 0 ${10 * slit}px ${K.flow})` } : undefined} />
        </g>
        {/* trapo que limpia el aro */}
        {cloth >= 0 && (() => {
          const ang = -90 + 360 * cloth; const rx = R * Math.cos((ang * Math.PI) / 180), ry = R * Math.sin((ang * Math.PI) / 180);
          return <g transform={`translate(${rx},${ry}) rotate(${ang + 90})`}><rect x={-46} y={-40} width={92} height={80} rx={14} fill={K.cold} stroke={C.ink} strokeWidth={4} />
            <path d="M-30,-14 L30,-14 M-30,10 L30,10" stroke={C.ink} strokeWidth={4} opacity={0.4} /></g>;
        })()}
        {/* pie */}
        <g style={hiG("base")}>
          <path d={ped} fill={C.inner} stroke={C.case1} strokeWidth={6} />
          {/* cuello por donde sube el aire */}
          <rect x={-34} y={206} width={68} height={60} fill={C.inner} />
          <Flow d="M0,252 L0,200" t={t} o={up} w={10} speed={140} />
          <Impeller x={0} y={355} r={100} a={a} o={1} glow={hi === "base" ? 1 : 0} />
          <rect x={-60} y={468} width={120} height={36} rx={8} fill={C.metal} stroke={C.ink} strokeWidth={3} style={spin > 0.05 ? { filter: `drop-shadow(0 0 ${8 * spin}px ${K.hot})` } : undefined} />
          <rect x={-50} y={478} width={100} height={16} rx={4} fill={spin > 0.05 ? K.hot : C.case1} opacity={0.4 + 0.6 * spin} />
          {/* carcasa que se aparta */}
          {open < 0.995 && (
            <g transform={`translate(${-330 * open},${-30 * open}) rotate(${-10 * open})`} opacity={1 - 0.4 * open}>
              <path d={ped} fill={C.case1} stroke={C.ink} strokeWidth={5} />
              <path d="M-104,260 L-116,490" stroke={K.white} strokeOpacity={0.2} strokeWidth={14} strokeLinecap="round" />
              {Array.from({ length: 24 }).map((_, i) => <circle key={i} cx={-80 + (i % 8) * 23} cy={420 + Math.floor(i / 8) * 26} r={6} fill={C.ink} />)}
            </g>
          )}
        </g>
        {/* aire que entra por la rejilla */}
        {intake > 0.01 && (
          <g>
            <Flow d="M-290,350 L-175,350" t={t} o={intake} w={9} />
            <Flow d="M290,350 L175,350" t={t} o={intake} w={9} />
            <Head x={-165} y={350} a={0} o={intake} />
            <Head x={165} y={350} a={180} o={intake} />
          </g>
        )}
      </g>
    );
  };

// ---------- Perfil del aro en corte (tipo ala) ----------
const yt = (u: number, T: number, c: number) => 5 * T * c * (0.2969 * Math.sqrt(u) - 0.126 * u - 0.3516 * u * u + 0.2843 * u ** 3 - 0.1036 * u ** 4);
const yc = (u: number, m: number, c: number, p = 0.4) => m * c * (u < p ? (2 * p * u - u * u) / (p * p) : (1 - 2 * p + 2 * p * u - u * u) / ((1 - p) * (1 - p)));
/** Puntos de las dos caras. inner = cara curva interior (abajo si dir=1, arriba si dir=-1). */
export const foil = (x0: number, y0: number, c: number, T = 0.24, m = 0.06, dir = 1) => {
  const us = Array.from({ length: 41 }).map((_, i) => (1 - Math.cos((Math.PI * i) / 40)) / 2);
  const outer = us.map((u) => [x0 + u * c, y0 + dir * (yc(u, m, c) - yt(u, T, c))] as const);
  const inner = us.map((u) => [x0 + u * c, y0 + dir * (yc(u, m, c) + yt(u, T, c))] as const);
  const at = (u: number, off = 0) => [x0 + u * c, y0 + dir * (yc(u, m, c) + yt(u, T, c) + off)] as const;
  const d = "M" + outer.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" L") + " L" + [...inner].reverse().map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" L") + " Z";
  return { d, at, yt: (u: number) => yt(u, T, c), yc: (u: number) => yc(u, m, c) };
};

/** Chorro: sale de la rendija (u0) y, según `attach`, se pega a la cara interior o sale recto. Devuelve un path. */
export const jetPath = (f: ReturnType<typeof foil>, u0: number, attach: number, xEnd: number, dir = 1, off = 12) => {
  const pts: [number, number][] = [];
  const [sx, sy] = f.at(u0, off);
  for (let i = 0; i <= 30; i++) {
    const u = u0 + ((1 - u0) * i) / 30;
    const [ax, ay] = f.at(u, off);
    const dy = sy + dir * (ax - sx) * 0.25; // recto, sin pegarse
    pts.push([ax, ay * attach + dy * (1 - attach)]);
  }
  const [lx, ly] = pts[pts.length - 1];
  pts.push([xEnd, ly + dir * ((1 - attach) * (xEnd - lx) * 0.25 + attach * 6)]);
  return "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
};

/** Corte grande de un trozo del aro: cavidad hueca con aire, rendija y chorro (de izquierda = detrás a derecha = hacia ti). */
export const Section: React.FC<{ t: number; x0?: number; y0?: number; c?: number; cavity?: number; slit?: number; jet?: number; attach?: number; wing?: number; o?: number; dir?: number; xEnd?: number }> =
  ({ t, x0 = 230, y0 = 640, c = 640, cavity = 1, slit = 0, jet = 0, attach = 1, wing = 0, o = 1, dir = 1, xEnd = 1010 }) => {
    const f = foil(x0, y0, c, 0.24, 0.06, dir);
    const uc = 0.3, [cx, cy0] = [x0 + uc * c, y0 + dir * f.yc(uc)];
    const u0 = 0.13;
    const [sx, sy] = f.at(u0, 0);
    return (
      <g opacity={o}>
        <path d={f.d} fill={C.case2} stroke={wing > 0.05 ? K.flow : C.ink} strokeWidth={wing > 0.05 ? 6 + 4 * wing : 6} strokeLinejoin="round"
          style={wing > 0.05 ? { filter: `drop-shadow(0 0 ${14 * wing}px ${K.flow})` } : undefined} />
        {/* hueco interior */}
        <ellipse cx={cx} cy={cy0} rx={c * 0.17} ry={f.yt(uc) * 0.62} fill={C.inner} stroke={C.ink} strokeWidth={3} />
        {cavity > 0.01 && (
          <ellipse cx={cx} cy={cy0} rx={c * 0.13} ry={f.yt(uc) * 0.4} fill="none" stroke={K.cold} strokeWidth={Math.max(5, c * 0.012)} strokeDasharray={`${c * 0.04} ${c * 0.03}`} strokeDashoffset={-t * 160} opacity={cavity} />
        )}
        {/* conducto hasta la rendija */}
        <path d={`M${cx - c * 0.1},${cy0 + dir * f.yt(uc) * 0.45} L${sx + 4},${sy - dir * 4}`} stroke={C.inner} strokeWidth={Math.max(6, c * 0.02)} strokeLinecap="round" />
        <circle cx={sx} cy={sy} r={Math.max(5, c * 0.012) + 4 * slit} fill={slit > 0.05 ? K.flow : C.ink} style={slit > 0.05 ? { filter: `drop-shadow(0 0 ${12 * slit}px ${K.flow})` } : undefined} />
        {jet > 0.01 && <Flow d={jetPath(f, u0, attach, xEnd, dir, Math.max(8, c * 0.02))} t={t} color={K.flow} w={Math.max(5, c * 0.014)} o={jet} speed={420} dash={`${c * 0.035} ${c * 0.02}`} />}
      </g>
    );
  };

/** Avión esquemático (para «perfil de ala»). */
export const Plane: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-110,0 Q-110,-14 -90,-14 L80,-14 Q110,-10 120,0 Q110,10 80,14 L-90,14 Q-110,14 -110,0 Z" fill={C.case3} stroke={C.ink} strokeWidth={4} />
    <path d="M-10,-12 L-50,-80 L-20,-80 L40,-12 Z M-10,12 L-50,80 L-20,80 L40,12 Z M-90,-12 L-110,-46 L-92,-46 L-66,-12 Z" fill={C.case2} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

/** Ventilador clásico de aspas con rejilla (icono), para comparar. */
export const BladeFan: React.FC<{ x: number; y: number; r: number; a: number; cross?: number; o?: number }> = ({ x, y, r, a, cross = 0, o = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-10} y={r} width={20} height={r * 0.7} fill={C.case1} />
    <rect x={-r * 0.55} y={r * 1.65} width={r * 1.1} height={22} rx={10} fill={C.case1} />
    <g transform={`rotate(${a})`}>
      {[0, 120, 240].map((k) => <ellipse key={k} transform={`rotate(${k}) translate(0,${-r * 0.48})`} rx={r * 0.26} ry={r * 0.44} fill={C.case3} stroke={C.ink} strokeWidth={3} />)}
    </g>
    <circle r={r * 0.14} fill={C.case2} stroke={C.ink} strokeWidth={3} />
    <circle r={r} fill="none" stroke={C.case3} strokeWidth={6} />
    {[0, 30, 60, 90, 120, 150].map((k) => <line key={k} x1={0} y1={-r} x2={0} y2={r} transform={`rotate(${k})`} stroke={C.case3} strokeWidth={2} opacity={0.5} />)}
    {cross > 0.01 && (
      <g opacity={cross}>
        <path d={`M${-r * 0.8},${-r * 0.8} L${r * 0.8},${r * 0.8} M${r * 0.8},${-r * 0.8} L${-r * 0.8},${r * 0.8}`} stroke={K.warn} strokeWidth={22} strokeLinecap="round" />
      </g>
    )}
  </g>
);

/** Primer plano del pie abierto: rotor grande, motor, cuello hacia el aro; cámaras laterales y ondas de pitido opcionales. */
export const BaseClose: React.FC<{ t: number; spin?: number; up?: number; motorHi?: number; rotorHi?: number; waves?: number; chambers?: number; quiet?: number }> =
  ({ t, spin = 1, up = 0, motorHi = 0, rotorHi = 0, waves = 0, chambers = 0, quiet = 0 }) => {
    const ped = "M290,500 L790,500 L812,1050 Q813,1080 783,1080 L297,1080 Q267,1080 268,1050 Z";
    return (
      <g>
        {/* cuello y aro (arriba, cortado) */}
        <rect x={470} y={410} width={140} height={100} fill={C.inner} stroke={C.case1} strokeWidth={6} />
        <Flow d="M540,520 L540,415" t={t} o={up} w={14} />
        <Head x={540} y={420} a={-90} o={up} />
        <path d={ped} fill={C.inner} stroke={C.case1} strokeWidth={8} />
        {/* cámaras laterales */}
        {[[300, 560], [780, 560]].map(([x], k) => (
          <g key={k} opacity={0.3 + 0.7 * chambers} style={chambers > 0.3 ? { filter: `drop-shadow(0 0 ${14 * chambers}px ${K.flow})` } : undefined}>
            <rect x={k ? 700 : 300} y={560} width={80} height={330} rx={26} fill={C.case1} stroke={chambers > 0.3 ? K.flow : C.case2} strokeWidth={5} />
            <rect x={(k ? 700 : 300) + 28} y={548} width={24} height={30} rx={6} fill={C.inner} />
          </g>
        ))}
        <Impeller x={540} y={730} r={185} a={t * 600 * spin} glow={rotorHi} />
        <g style={motorHi > 0.05 ? { filter: `drop-shadow(0 0 ${14 * motorHi}px ${K.hot})` } : undefined}>
          <rect x={410} y={950} width={260} height={110} rx={20} fill={C.metal} stroke={C.ink} strokeWidth={5} />
          <rect x={430} y={970} width={220} height={70} rx={10} fill={K.hot} opacity={0.25 + 0.6 * motorHi} />
          {[0, 1, 2, 3].map((k) => <rect key={k} x={445 + k * 52} y={978} width={30} height={54} rx={6} fill={C.case1} opacity={0.6} />)}
          <rect x={530} y={912} width={20} height={40} fill={C.case3} />
        </g>
        {/* pitido: arcos blancos que salen del pie */}
        {waves > 0.01 && [0, 1, 2].map((k) => {
          const ph = (t * 1.6 + k / 3) % 1; const amp = waves * (1 - 0.85 * quiet);
          return (
            <g key={k} opacity={amp * (1 - ph)}>
              <path d={`M${830 + ph * 120},${640 - 60 - ph * 50} Q${880 + ph * 150},${730} ${830 + ph * 120},${820 + 60 + ph * 50}`} fill="none" stroke={K.white} strokeWidth={9} strokeLinecap="round" />
              <path d={`M${250 - ph * 120},${640 - 60 - ph * 50} Q${200 - ph * 150},${730} ${250 - ph * 120},${820 + 60 + ph * 50}`} fill="none" stroke={K.white} strokeWidth={9} strokeLinecap="round" />
            </g>
          );
        })}
      </g>
    );
  };

/** Vista de lado del aro (dos cortes) con el aire arrastrado de detrás y de los lados. */
export const SideView: React.FC<{ t: number; jet?: number; behind?: number; sides?: number; outFlow?: number; intake?: number }> = ({ t, jet = 1, behind = 0, sides = 0, outFlow = 0, intake = 0 }) => {
  const x0 = 250, c = 300;
  const big = clamp01(outFlow);
  return (
    <g>
      {/* aire de detrás que atraviesa el aro */}
      {[620, 700, 780].map((y, k) => <Flow key={y} d={`M80,${y} L${560 + k * 0},${y}`} t={t} o={behind} w={9} speed={150} />)}
      {/* aire de los lados (arriba y abajo) que se une */}
      <Flow d="M330,410 Q560,420 640,600" t={t} o={sides} w={9} speed={150} />
      <Flow d="M330,990 Q560,980 640,800" t={t} o={sides} w={9} speed={150} />
      {/* chorro total hacia ti */}
      {big > 0.01 && (
        <g opacity={big}>
          <path d={`M600,${700 - 120 - 60 * big} L${780 + 60 * big},${700 - 140 - 60 * big} L${780 + 60 * big},${700 - 200 - 60 * big} L940,700 L${780 + 60 * big},${700 + 200 + 60 * big} L${780 + 60 * big},${700 + 140 + 60 * big} L600,${700 + 120 + 60 * big} Z`}
            fill={K.cold} opacity={0.22} />
          {[600, 650, 700, 750, 800].map((y) => <Flow key={y} d={`M600,${700 + (y - 700) * (1 + 0.4 * big)} L880,${700 + (y - 700) * (1 + 0.6 * big)}`} t={t} w={7} speed={200} />)}
        </g>
      )}
      {/* pie de lado */}
      <path d="M300,930 L500,930 L515,1120 Q515,1140 495,1140 L305,1140 Q285,1140 285,1120 Z" fill={C.case1} stroke={C.ink} strokeWidth={5} />
      {Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={330 + (i % 6) * 28} cy={1020 + Math.floor(i / 6) * 28} r={6} fill={C.ink} />)}
      <Flow d="M120,1040 L270,1040" t={t} o={intake} w={8} />
      <Head x={278} y={1040} a={0} o={intake} s={0.8} />
      {/* los dos cortes del aro */}
      <Section t={t} x0={x0} y0={520} c={c} cavity={1} jet={jet} xEnd={620} />
      <Section t={t} x0={x0} y0={880} c={c} cavity={1} jet={jet} dir={-1} xEnd={620} />
    </g>
  );
};

/** Mano esquemática con el dedo índice estirado (silueta neutra). Punta del dedo en (x, y), apuntando a la izquierda. */
export const Hand: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <path d="M0,-16 Q-10,0 0,16 L150,22 Q170,24 180,40 L190,90 Q200,130 260,130 L420,130 L420,-40 L300,-40 Q240,-40 200,-30 L150,-20 Z" fill={C.skin} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M190,40 Q240,46 290,40 M200,80 Q250,86 300,80" fill="none" stroke={C.ink} strokeWidth={4} opacity={0.35} />
  </g>
);

/** Documento de patente con un esquema: chorro que se curva siguiendo una pared. */
export const PatentDoc: React.FC<{ x: number; y: number; t: number; p: number; s?: number; o?: number; jp?: boolean }> = ({ x, y, t, p, s = 1, o = 1, jp = false }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={-200} y={-270} width={400} height={540} rx={14} fill={C.paper} stroke={C.ink} strokeWidth={6} />
    <path d="M140,-270 L200,-210 L140,-210 Z" fill={C.case3} />
    {[-220, -190, -160].map((yy, k) => <rect key={yy} x={-160} y={yy} width={k ? 220 : 280} height={14} rx={7} fill={C.case3} />)}
    {jp ? (
      <g>
        <circle cx={0} cy={40} r={110} fill="none" stroke={C.case1} strokeWidth={26} />
        <rect x={-34} y={150} width={68} height={70} fill={C.case1} />
      </g>
    ) : (
      <g>
        <rect x={-150} y={-20} width={90} height={40} fill={C.case1} />
        <path d="M-60,22 Q60,30 70,150" fill="none" stroke={C.case1} strokeWidth={14} strokeLinecap="round" />
        <path d={`M-60,0 Q${-60 + 140 * 1},${10} ${40},${-10 + 150 * p}`} fill="none" stroke={K.cold} strokeWidth={10} strokeLinecap="round" strokeDasharray="18 12" strokeDashoffset={-t * 120} />
      </g>
    )}
    {[200, 228].map((yy) => <rect key={yy} x={-160} y={yy} width={320} height={10} rx={5} fill={C.case3} opacity={0.7} />)}
  </g>
);

/** Tienda (escaparate con toldo) para «llegar a las tiendas». */
export const Shop: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={-170} y={-120} width={340} height={300} fill={C.case1} stroke={C.ink} strokeWidth={6} />
    {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M${-190 + i * 63.3},-120 L${-190 + (i + 1) * 63.3},-120 L${-190 + (i + 1) * 63.3},-60 Q${-190 + (i + 0.5) * 63.3},-30 ${-190 + i * 63.3},-60 Z`} fill={i % 2 ? K.white : K.hot} stroke={C.ink} strokeWidth={4} />)}
    <rect x={-140} y={-20} width={170} height={150} fill={C.inner} stroke={C.case3} strokeWidth={5} />
    <circle cx={-55} cy={40} r={42} fill="none" stroke={C.case3} strokeWidth={12} />
    <rect x={-63} y={82} width={16} height={34} fill={C.case3} />
    <rect x={60} y={-10} width={80} height={190} fill={C.case2} stroke={C.ink} strokeWidth={4} />
  </g>
);
