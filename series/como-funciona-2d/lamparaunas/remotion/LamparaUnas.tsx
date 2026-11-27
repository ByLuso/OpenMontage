// Dibujos SVG planos del episodio «Cómo endurece la lámpara de uñas el esmalte semipermanente» (n.º 171).
// Colores de código: amarillo = lo importante (fotoiniciador, radicales, enlaces nuevos), violeta = la luz de la lámpara,
// cian = aire/oxígeno, blanco = vapor y texto, rojo = error. Grises azulados para carcasas. Rosa = el esmalte (el objeto).
import React from "react";
import { K } from "./kit2d/Kit";

export const C = { shell: "#2B4A72", shell2: "#3E6AA0", light: "#9FB3CC", dark: "#132A4A", deep: "#0B1E38", ink: "#06101F",
  uv: "#A77BFF", uv2: "#6C3BFF", gel: "#FF5C8A", gel2: "#FF9BB6", skin: "#E9B48F", skin2: "#C98E6A", blue: "#4F8BFF" };
const W = 1080, H = 1920;
export const Svg: React.FC<{ children: React.ReactNode; o?: number }> = ({ children, o = 1 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>{children}</svg>
);
const rnd = (k: number) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const cl = (x: number) => Math.max(0, Math.min(1, x));

// ---------------------------------------------------------------------------------------------
/** Rayos de luz violeta que bajan desde (x, y0) en abanico hasta y1. */
export const Rays: React.FC<{ t: number; o: number; x: number; y0: number; y1: number; w?: number; n?: number; color?: string }> =
  ({ t, o, x, y0, y1, w = 220, n = 7, color = C.uv }) => {
    if (o <= 0.01) return null;
    return (
      <g opacity={o}>
        <path d={`M ${x - 40} ${y0} L ${x + 40} ${y0} L ${x + w} ${y1} L ${x - w} ${y1} Z`} fill={color} opacity={0.16 + 0.05 * Math.sin(t * 6)} />
        {Array.from({ length: n }).map((_, k) => {
          const f = n === 1 ? 0.5 : k / (n - 1);
          const xb = x - w + 2 * w * f, xa = x - 40 + 80 * f;
          const u = (t * 1.4 + rnd(k)) % 1;
          const ya = y0 + (y1 - y0) * u, yb = Math.min(y1, ya + 70);
          const xa2 = xa + (xb - xa) * u, xb2 = xa + (xb - xa) * Math.min(1, u + 70 / (y1 - y0));
          return <line key={k} x1={xa2} y1={ya} x2={xb2} y2={yb} stroke={color} strokeWidth={6} strokeLinecap="round" opacity={0.9 * (1 - u * 0.5)} />;
        })}
      </g>
    );
  };

/** Lámpara de uñas de túnel vista de frente, con la mano dentro. lift: la carcasa se levanta (0..1). on: luz encendida. cure: uñas curadas (brillo). */
export const Lamp: React.FC<{ t: number; on?: number; lift?: number; cure?: number; x?: number; y?: number; s?: number; hand?: boolean; puff?: number }> =
  ({ t, on = 1, lift = 0, cure = 0, x = 540, y = 820, s = 1, hand = true, puff = 0 }) => {
    const dy = -280 * lift;
    const fingers = [{ dx: -165, h: 150 }, { dx: -55, h: 185 }, { dx: 55, h: 195 }, { dx: 165, h: 160 }];
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {/* sombra */}
        <ellipse cx={0} cy={235} rx={360} ry={26} fill={C.ink} opacity={0.5} />
        {/* interior del túnel */}
        <path d="M -300 200 L -300 -10 Q -300 -190 0 -190 Q 300 -190 300 -10 L 300 200 Z" fill={C.deep} opacity={1 - 0.6 * lift} />
        {/* resplandor violeta dentro */}
        {on > 0.01 && <ellipse cx={0} cy={60} rx={260} ry={170} fill={C.uv} opacity={on * (0.18 + 0.04 * Math.sin(t * 7))} />}
        {/* mano: dorso abajo y cuatro dedos con las uñas pintadas */}
        {hand && (
          <g>
            <rect x={-250} y={150} width={500} height={160} rx={70} fill={C.skin} />
            {fingers.map((f, i) => (
              <g key={i}>
                <rect x={f.dx - 42} y={170 - f.h} width={84} height={f.h + 40} rx={42} fill={C.skin} stroke={C.skin2} strokeWidth={4} />
                <rect x={f.dx - 30} y={180 - f.h} width={60} height={72} rx={28} fill={C.gel} />
                <rect x={f.dx - 18} y={190 - f.h} width={14} height={40} rx={7} fill={K.white} opacity={0.25 + 0.6 * cure} />
                {cure > 0.01 && <rect x={f.dx - 36} y={174 - f.h} width={72} height={84} rx={32} fill="none" stroke={K.flow} strokeWidth={5} opacity={cure * (0.6 + 0.3 * Math.sin(t * 5 + i))} />}
              </g>
            ))}
          </g>
        )}
        {/* soplido de aire (el mito: «seca») */}
        {puff > 0.01 && [0, 1, 2].map((k) => {
          const u = (t * 0.9 + k / 3) % 1;
          return <path key={k} d={`M ${-330 + 60 * u} ${-40 + 70 * k} q 50 -24 100 0 t 100 0`} fill="none" stroke={K.cold} strokeWidth={8} strokeLinecap="round" opacity={puff * (1 - u)} transform={`translate(${-60 + 260 * u} 0)`} />;
        })}
        {/* carcasa que se levanta */}
        <g transform={`translate(0 ${dy})`}>
          {on > 0.01 && <Rays t={t} o={on * (0.4 + 0.6 * lift)} x={0} y0={-150} y1={150 - dy} w={250} n={8} />}
          <path d="M -360 200 L -360 -10 Q -360 -250 0 -250 Q 360 -250 360 -10 L 360 200 L 300 200 L 300 -10 Q 300 -190 0 -190 Q -300 -190 -300 -10 L -300 200 Z"
            fill={C.shell2} stroke={C.light} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -330 -10 Q -330 -222 0 -222" fill="none" stroke={K.white} strokeWidth={8} opacity={0.25} strokeLinecap="round" />
          {/* fila de LED en el techo */}
          {Array.from({ length: 9 }).map((_, k) => {
            const a = Math.PI * (0.15 + 0.7 * (k / 8));
            const lx = -270 * Math.cos(a), ly = -10 - 170 * Math.sin(a);
            return <g key={k}>
              {on > 0.01 && <circle cx={lx} cy={ly} r={22} fill={C.uv} opacity={on * 0.45} />}
              <circle cx={lx} cy={ly} r={11} fill={on > 0.5 ? "#E6D9FF" : C.light} stroke={C.ink} strokeWidth={3} />
            </g>;
          })}
          {/* pantalla y botón */}
          <rect x={-70} y={-238} width={140} height={34} rx={10} fill={C.ink} />
          <text x={0} y={-212} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={24} fill={on > 0.5 ? C.uv : C.light}>{on > 0.5 ? `${Math.max(0, 60 - Math.floor((t * 6) % 61))} s` : "--"}</text>
        </g>
        {/* base */}
        <rect x={-380} y={196} width={760} height={46} rx={20} fill={C.shell} stroke={C.light} strokeWidth={5} />
      </g>
    );
  };

// ---------------------------------------------------------------------------------------------
/** Posiciones deterministas de moléculas dentro de un rectángulo. */
const field = (x0: number, y0: number, w: number, h: number, cols: number, rows: number, seed = 0) => {
  const pts: { x: number; y: number; k: number; c: number; r: number }[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = seed + r * cols + c;
    pts.push({ x: x0 + (c + 0.5 + (rnd(k) - 0.5) * 0.6) * (w / cols), y: y0 + (r + 0.5 + (rnd(k + 50) - 0.5) * 0.6) * (h / rows), k, c, r });
  }
  return pts;
};

/** Campo de moléculas: sueltas (se mueven) con cure 0; enlazadas en red con cure 1. pi: fotoiniciadores (estrellas amarillas) visibles. */
export const Molecules: React.FC<{ t: number; x0: number; y0: number; w: number; h: number; cols?: number; rows?: number; cure: number; pi?: number;
  radicals?: number; r?: number; seed?: number; topFree?: number; o2?: number; o?: number }> =
  ({ t, x0, y0, w, h, cols = 9, rows = 5, cure, pi = 0, radicals = 0, r = 13, seed = 0, topFree = 0, o2 = 0, o = 1 }) => {
    const pts = field(x0, y0, w, h, cols, rows, seed);
    const pos = (p: typeof pts[0]) => {
      const free = p.r === 0 ? Math.max(1 - cure, topFree) : 1 - cure;
      const a = 3 + 9 * free;
      return { x: p.x + a * Math.sin(t * (2.2 + rnd(p.k) * 2) + p.k), y: p.y + a * Math.cos(t * (1.8 + rnd(p.k + 3) * 2) + p.k * 1.7) };
    };
    const P = pts.map(pos);
    const links: React.ReactNode[] = [];
    pts.forEach((p, i) => {
      const nb = [p.c < cols - 1 ? i + 1 : -1, p.r < rows - 1 ? i + cols : -1, p.c < cols - 1 && p.r < rows - 1 && rnd(p.k + 7) > 0.55 ? i + cols + 1 : -1];
      nb.forEach((j, q) => {
        if (j < 0) return;
        // capa de arriba sin curar (inhibida por el oxígeno): sus enlaces no se forman
        if (topFree > 0.01 && p.r === 0) return;
        const thr = 0.05 + 0.9 * rnd(p.k * 3 + q * 11 + 1);
        const v = cl((cure - thr) / 0.08);
        if (v <= 0) return;
        const fresh = cl(1 - (cure - thr) / 0.25);
        const a = P[i], b = P[j];
        const ex = a.x + (b.x - a.x) * v, ey = a.y + (b.y - a.y) * v;
        links.push(<line key={`${i}-${q}`} x1={a.x} y1={a.y} x2={ex} y2={ey} stroke={fresh > 0.3 ? K.flow : C.light} strokeWidth={7} strokeLinecap="round" opacity={0.95} />);
      });
    });
    return (
      <g opacity={o}>
        {links}
        {pts.map((p, i) => {
          const isPi = rnd(p.k + 21) > 0.86;
          const { x, y } = P[i];
          if (isPi && pi > 0.01) {
            const rad = radicals > 0.01;
            return <g key={i}>
              {rad && <circle cx={x} cy={y} r={r * 2.4} fill={K.flow} opacity={radicals * (0.25 + 0.15 * Math.sin(t * 9 + i))} />}
              <Star x={x} y={y} r={r * 1.35} color={K.flow} o={pi} />
            </g>;
          }
          return <circle key={i} cx={x} cy={y} r={r} fill={cure > 0.6 ? "#DCE6F2" : C.light} stroke={C.ink} strokeWidth={3} />;
        })}
        {o2 > 0.01 && pts.filter((p) => p.r === 0 && p.c % 2 === 0).map((p, i) => {
          const x = p.x + 18 * Math.sin(t * 1.5 + i), y = y0 - 34 + 8 * Math.cos(t * 2 + i);
          return <O2 key={`o${i}`} x={x} y={y} o={o2} />;
        })}
      </g>
    );
  };

export const Star: React.FC<{ x: number; y: number; r: number; color?: string; o?: number; rot?: number }> = ({ x, y, r, color = K.flow, o = 1, rot = 0 }) => {
  const d = Array.from({ length: 10 }).map((_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5 + rot;
    const rr = i % 2 === 0 ? r : r * 0.45;
    return `${i === 0 ? "M" : "L"} ${x + rr * Math.cos(a)} ${y + rr * Math.sin(a)}`;
  }).join(" ") + " Z";
  return <path d={d} fill={color} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" opacity={o} />;
};

/** Molécula de oxígeno (O₂): dos bolas cian. */
export const O2: React.FC<{ x: number; y: number; o?: number; s?: number }> = ({ x, y, o = 1, s = 1 }) => (
  <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={-11} cy={0} r={13} fill={K.cold} stroke={C.ink} strokeWidth={3} />
    <circle cx={11} cy={0} r={13} fill={K.cold} stroke={C.ink} strokeWidth={3} />
  </g>
);

// ---------------------------------------------------------------------------------------------
/** Punta de dedo grande con la uña y la capa de gel (vista de perfil, de lado). */
export const Finger: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode; gel?: string; glow?: number }> = ({ x, y, s = 1, children, gel = C.gel, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -700 60 L 180 60 Q 310 60 310 170 Q 310 280 180 280 L -700 280 Z" fill={C.skin} stroke={C.skin2} strokeWidth={6} />
    <path d="M -260 60 L 200 60 Q 260 60 262 100 L -260 100 Z" fill="#F4D7C6" stroke={C.skin2} strokeWidth={4} />
    {glow > 0.01 && <rect x={-280} y={-150} width={560} height={220} rx={30} fill={K.flow} opacity={0.08 * glow} />}
    <path d="M -266 62 L -266 -96 Q -266 -140 -222 -140 L 220 -140 Q 264 -140 264 -96 L 264 62 Z" fill={gel} opacity={0.3} stroke={C.gel2} strokeWidth={5} />
    {children}
  </g>
);

/** Frasco de gel con pincel. Dentro: moléculas sueltas y fotoiniciadores. */
export const Bottle: React.FC<{ t: number; x: number; y: number; pi: number; zoom?: number }> = ({ t, x, y, pi, zoom = 0 }) => (
  <g>
    <g transform={`translate(${x} ${y})`}>
      <rect x={-46} y={-330} width={92} height={150} rx={16} fill={C.ink} stroke={C.light} strokeWidth={5} />
      <rect x={-80} y={-190} width={160} height={36} rx={10} fill={C.shell} stroke={C.light} strokeWidth={5} />
      <path d="M -150 -150 L 150 -150 Q 190 -150 190 -110 L 190 170 Q 190 210 150 210 L -150 210 Q -190 210 -190 170 L -190 -110 Q -190 -150 -150 -150 Z" fill={C.gel} stroke={C.light} strokeWidth={6} opacity={0.92} />
      <rect x={-160} y={-120} width={28} height={250} rx={14} fill={K.white} opacity={0.25} />
      <rect x={-120} y={-40} width={240} height={120} rx={18} fill="#F2E6EA" opacity={0.85} />
      <text x={0} y={20} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={40} fill={C.ink}>GEL</text>
      <text x={0} y={60} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={800} fontSize={24} fill={C.ink}>semipermanente</text>
    </g>
    {/* lupa con el interior */}
    {zoom > 0.01 && (
      <g opacity={zoom}>
        <line x1={x + 130} y1={y + 40} x2={x + 250} y2={y + 30} stroke={C.light} strokeWidth={6} strokeDasharray="10 10" />
        <circle cx={x + 410} cy={y + 20} r={190} fill={C.deep} stroke={K.white} strokeWidth={8} />
        <clipPath id="lupaB"><circle cx={x + 410} cy={y + 20} r={182} /></clipPath>
        <g clipPath="url(#lupaB)">
          <rect x={x + 220} y={y - 170} width={380} height={380} fill={C.gel} opacity={0.22} />
          <Molecules t={t} x0={x + 230} y0={y - 160} w={360} h={360} cols={5} rows={5} cure={0} pi={pi} r={17} seed={40} />
        </g>
      </g>
    )}
  </g>
);

/** Espectro de luz con banda resaltada (ultravioleta cercano y violeta). */
export const Spectrum: React.FC<{ x: number; y: number; w: number; band: number; o?: number }> = ({ x, y, w, band, o = 1 }) => {
  const nm = (v: number) => x + ((v - 300) / 250) * w;
  return (
    <g opacity={o}>
      <defs>
        <linearGradient id="spec" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#1A1033" />
          <stop offset="0.3" stopColor="#3B1E7A" />
          <stop offset="0.42" stopColor={C.uv2} />
          <stop offset="0.6" stopColor={C.blue} />
          <stop offset="0.85" stopColor="#3FC7E0" />
          <stop offset="1" stopColor="#4CD07A" />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={w} height={60} rx={14} fill="url(#spec)" stroke={C.light} strokeWidth={4} />
      {band > 0.01 && <rect x={nm(365)} y={y - 16} width={(nm(405) - nm(365))} height={92} rx={10} fill="none" stroke={K.flow} strokeWidth={6} opacity={band} />}
      {[300, 400, 500].map((v) => (
        <g key={v}>
          <line x1={nm(v)} y1={y + 64} x2={nm(v)} y2={y + 84} stroke={C.light} strokeWidth={4} />
          <text x={nm(v)} y={y + 118} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={800} fontSize={28} fill={C.light}>{v} nm</text>
        </g>
      ))}
      <text x={nm(330)} y={y - 30} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={28} fill={C.uv}>ultravioleta</text>
      <text x={nm(480)} y={y - 30} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={28} fill={C.light}>luz visible</text>
    </g>
  );
};

/** Fotoiniciador que absorbe luz y se parte en dos radicales. split 0..1 */
export const Splitter: React.FC<{ t: number; x: number; y: number; split: number; hit: number }> = ({ t, x, y, split, hit }) => {
  const d = 120 * split;
  return (
    <g>
      {hit > 0.01 && <path d={`M ${x - 230} ${y - 190} L ${x - 40} ${y - 30}`} stroke={C.uv} strokeWidth={14} strokeLinecap="round" strokeDasharray="30 18" strokeDashoffset={-t * 120} opacity={hit * (1 - split * 0.6)} />}
      {split < 0.98 && <line x1={x - 50 - d} y1={y} x2={x + 50 + d} y2={y} stroke={C.light} strokeWidth={12} strokeDasharray={split > 0.05 ? "14 14" : undefined} opacity={1 - split} />}
      {[-1, 1].map((sg) => (
        <g key={sg}>
          {split > 0.3 && <circle cx={x + sg * (60 + d)} cy={y} r={60 + 8 * Math.sin(t * 10 + sg)} fill={K.flow} opacity={0.25 * split} />}
          <Star x={x + sg * (60 + d)} y={y} r={44} color={K.flow} rot={t * sg * 2 * split} />
          {split > 0.5 && <circle cx={x + sg * (60 + d) + sg * 30} cy={y - 34} r={9} fill={K.white} stroke={C.ink} strokeWidth={3} />}
        </g>
      ))}
    </g>
  );
};

/** Mini lámpara (LED o de tubo) con cronómetro. */
export const MiniLamp: React.FC<{ t: number; x: number; y: number; kind: "led" | "tubo"; on: number; prog: number; label: string }> = ({ t, x, y, kind, on, prog, label }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -170 120 L -170 0 Q -170 -120 0 -120 Q 170 -120 170 0 L 170 120 L 130 120 L 130 0 Q 130 -84 0 -84 Q -130 -84 -130 0 L -130 120 Z" fill={C.shell2} stroke={C.light} strokeWidth={5} />
    <path d="M -130 120 L -130 0 Q -130 -84 0 -84 Q 130 -84 130 0 L 130 120 Z" fill={C.deep} />
    {on > 0.01 && <ellipse cx={0} cy={50} rx={120} ry={80} fill={C.uv} opacity={on * (kind === "led" ? 0.35 : 0.2) * (0.9 + 0.1 * Math.sin(t * 8))} />}
    {kind === "led"
      ? Array.from({ length: 7 }).map((_, k) => { const a = Math.PI * (0.15 + 0.7 * (k / 6)); return <circle key={k} cx={-110 * Math.cos(a)} cy={-74 * Math.sin(a) + 4} r={8} fill={on > 0.5 ? "#E6D9FF" : C.light} stroke={C.ink} strokeWidth={2} />; })
      : [-60, 0, 60].map((dx) => <rect key={dx} x={dx - 12} y={-70} width={24} height={150} rx={12} fill={on > 0.5 ? "#D8C8FF" : C.light} opacity={0.9} stroke={C.ink} strokeWidth={3} />)}
    {/* nail inside */}
    <rect x={-30} y={50} width={60} height={70} rx={26} fill={C.skin} />
    <rect x={-22} y={54} width={44} height={40} rx={18} fill={C.gel} />
    <rect x={-190} y={120} width={380} height={30} rx={12} fill={C.shell} stroke={C.light} strokeWidth={4} />
    {/* barra de progreso */}
    <rect x={-150} y={185} width={300} height={26} rx={13} fill={C.ink} stroke={C.light} strokeWidth={3} />
    <rect x={-147} y={188} width={294 * cl(prog)} height={20} rx={10} fill={prog >= 1 ? K.flow : C.uv} />
    <text x={0} y={-150} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={40} fill={K.white}>{label}</text>
  </g>
);

/** Calendario con días que se van tachando. */
export const Calendar: React.FC<{ x: number; y: number; days: number; o?: number }> = ({ x, y, days, o = 1 }) => (
  <g opacity={o} transform={`translate(${x} ${y})`}>
    <rect x={-190} y={-150} width={380} height={330} rx={24} fill={K.white} stroke={C.light} strokeWidth={5} />
    <rect x={-190} y={-150} width={380} height={70} rx={24} fill={K.warn} />
    <rect x={-190} y={-100} width={380} height={20} fill={K.warn} />
    {[-110, 110].map((dx) => <rect key={dx} x={dx - 10} y={-174} width={20} height={50} rx={10} fill={C.shell} />)}
    {Array.from({ length: 21 }).map((_, i) => {
      const cx = -150 + (i % 7) * 50, cy = -40 + Math.floor(i / 7) * 70;
      const done = i < days;
      return <g key={i}>
        <rect x={cx - 18} y={cy - 18} width={36} height={36} rx={8} fill={done ? K.flow : "#DCE3EC"} />
        {done && <path d={`M ${cx - 9} ${cy} l 7 8 l 12 -16`} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
      </g>;
    })}
  </g>
);

/** Diente con empaste blanco y lámpara azul del dentista. */
export const Tooth: React.FC<{ t: number; x: number; y: number; light: number; fill: number }> = ({ t, x, y, light, fill }) => (
  <g transform={`translate(${x} ${y})`}>
    {/* lámpara del dentista (bolígrafo de luz) */}
    <g transform="translate(150 -170) rotate(35)">
      <rect x={-26} y={-110} width={52} height={120} rx={22} fill={C.shell2} stroke={C.light} strokeWidth={5} />
      <rect x={-14} y={6} width={28} height={70} rx={10} fill={C.light} />
    </g>
    {light > 0.01 && <path d="M 92 -118 L 124 -98 L 46 -50 L -46 -50 Z" fill={C.blue} opacity={light * (0.45 + 0.1 * Math.sin(t * 8))} />}
    <path d="M -110 -40 Q -120 -110 -60 -110 Q -20 -110 0 -90 Q 20 -110 60 -110 Q 120 -110 110 -40 Q 104 30 80 80 Q 60 190 30 190 Q 10 190 6 100 Q 0 70 -6 100 Q -10 190 -30 190 Q -60 190 -80 80 Q -104 30 -110 -40 Z"
      fill="#F4F7FB" stroke={C.light} strokeWidth={6} />
    <path d="M -46 -96 Q 0 -60 46 -96 Q 30 -40 0 -36 Q -30 -40 -46 -96 Z" fill={fill > 0.5 ? "#FFFFFF" : "#FFF4D6"} stroke={fill > 0.5 ? K.flow : "#C9B98F"} strokeWidth={5} />
  </g>
);

/** Impresora 3D de resina (cubeta con luz violeta y pieza que sube). */
export const Printer: React.FC<{ t: number; x: number; y: number; prog: number; on: number }> = ({ t, x, y, prog, on }) => {
  const layers = Math.floor(2 + 10 * cl(prog));
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-150} y={-230} width={300} height={420} rx={20} fill="none" stroke={C.light} strokeWidth={5} opacity={0.6} />
      <rect x={-12} y={-230} width={24} height={320} fill={C.shell} />
      <rect x={-110} y={-140 + 10 * (12 - layers)} width={220} height={20} rx={6} fill={C.shell2} stroke={C.light} strokeWidth={3} />
      {/* pieza que cuelga, capa a capa */}
      {Array.from({ length: layers }).map((_, k) => {
        const yy = -120 + 10 * (12 - layers) + k * 12;
        const wv = 60 + 30 * Math.sin(k * 0.6);
        return <rect key={k} x={-wv / 2} y={yy} width={wv} height={12} fill={k === layers - 1 ? K.flow : "#C6D3E4"} stroke={C.ink} strokeWidth={1.5} />;
      })}
      <rect x={-130} y={40} width={260} height={70} rx={8} fill={C.uv2} opacity={0.35} stroke={C.light} strokeWidth={4} />
      {on > 0.01 && <rect x={-60} y={100} width={120} height={14} fill={C.uv} opacity={on * (0.7 + 0.3 * Math.sin(t * 12))} />}
      {on > 0.01 && <path d="M -60 110 L -40 30 L 40 30 L 60 110 Z" fill={C.uv} opacity={on * 0.3} />}
      <rect x={-170} y={110} width={340} height={80} rx={14} fill={C.shell} stroke={C.light} strokeWidth={5} />
    </g>
  );
};

/** Dedo con algodón y papel film (quitar con acetona). */
export const Wrap: React.FC<{ t: number; x: number; y: number; soak: number }> = ({ t, x, y, soak }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-80} y={-60} width={160} height={380} rx={80} fill={C.skin} stroke={C.skin2} strokeWidth={5} />
    <rect x={-58} y={-40} width={116} height={130} rx={50} fill={C.gel} opacity={1 - 0.6 * soak} />
    <ellipse cx={0} cy={20} rx={92} ry={100} fill={K.white} opacity={0.45} />
    {Array.from({ length: 9 }).map((_, k) => <circle key={k} cx={-55 + 110 * rnd(k)} cy={-50 + 130 * rnd(k + 4)} r={14 + 8 * rnd(k + 8)} fill={K.white} opacity={0.55} />)}
    <path d="M -110 -110 Q 0 -150 110 -110 L 120 140 Q 0 170 -120 140 Z" fill={K.cold} opacity={0.18} stroke={K.cold} strokeWidth={4} />
    {soak > 0.01 && Array.from({ length: 5 }).map((_, k) => {
      const u = (t * 0.5 + k / 5) % 1;
      return <circle key={`b${k}`} cx={-50 + 25 * k} cy={100 - 160 * u} r={6} fill={K.cold} opacity={soak * (1 - u)} />;
    })}
  </g>
);

/** Frasco de acetona. */
export const Acetone: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => (
  <g opacity={o} transform={`translate(${x} ${y})`}>
    <rect x={-34} y={-200} width={68} height={70} rx={12} fill={C.shell} stroke={C.light} strokeWidth={4} />
    <path d="M -100 -130 L 100 -130 L 110 150 Q 110 180 80 180 L -80 180 Q -110 180 -110 150 Z" fill={K.cold} opacity={0.35} stroke={C.light} strokeWidth={5} />
    <rect x={-80} y={-20} width={160} height={70} rx={12} fill={K.white} />
    <text x={0} y={26} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={28} fill={C.ink}>ACETONA</text>
  </g>
);

/** Gotas de vapor que suben (el disolvente que se evapora). */
export const Vapor: React.FC<{ t: number; o: number; x: number; y0: number; y1: number; w?: number; n?: number }> = ({ t, o, x, y0, y1, w = 200, n = 14 }) => {
  if (o <= 0.01) return null;
  return (
    <g>
      {Array.from({ length: n }).map((_, k) => {
        const u = (t * 0.45 + k / n) % 1;
        const xx = x + (rnd(k) - 0.5) * 2 * w + 14 * Math.sin(t * 2 + k);
        return <path key={k} d={`M ${xx} ${y0 + (y1 - y0) * u} q 12 -18 0 -36 q -12 -18 0 -36`} fill="none" stroke={K.white} strokeWidth={6} strokeLinecap="round" opacity={o * Math.min(1, u * 5) * (1 - u) * 0.8} />;
      })}
    </g>
  );
};
