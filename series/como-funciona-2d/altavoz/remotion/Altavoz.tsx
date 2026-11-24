// Dibujos SVG del episodio «Cómo funciona un altavoz». Coordenadas absolutas de 1080×1920.
// Colores de código: amarillo = corriente, naranja = fuerza/empuje, cian = aire y ondas de sonido, blanco = texto,
// rojo solo para error. Grises azulados para el imán, el chasis y la caja. Sin marcas: altavoz genérico.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F", magnet: "#4F6684", magnet2: "#6F87A8",
  paper: "#D9C7A0", paper2: "#B49E72", copper: "#C8803A", rubber: "#17263B", spider: "#C9B27A", skin: "#C98E74", skin2: "#A66C55" };

export type Part = "" | "iman" | "bobina" | "cono" | "borde" | "arana" | "todo";

const glow = (c: string, r = 12) => ({ filter: `drop-shadow(0 0 ${r}px ${c})` });

/** Altavoz en corte, de lado: imán a la izquierda, cono abriéndose a la derecha. (x, y) = centro del eje en el hueco del imán.
 *  dx = desplazamiento de bobina+cono (px locales, ±30). cur = corriente en la bobina (-1..1, signo = sentido). hi = pieza resaltada. */
export const Speaker: React.FC<{ x: number; y: number; s?: number; dx?: number; cur?: number; hi?: Part; dimOthers?: boolean; poles?: number; coilPoles?: number }> =
  ({ x, y, s = 1, dx = 0, cur = 0, hi = "", dimOthers = false, poles = 0, coilPoles = 0 }) => {
    const op = (p: Part) => (!dimOthers || !hi || hi === p || hi === "todo" ? 1 : 0.35);
    const hl = (p: Part) => hi === p || hi === "todo";
    const ca = Math.abs(cur);
    // puntos del cono
    const cx0 = -60 + dx, cx1 = 190 + dx, h0 = 40, h1 = 300;
    // chasis (cesta)
    const rimX = 235;
    return (
      <g transform={`translate(${x},${y}) scale(${s})`}>
        {/* cesta / chasis */}
        <g opacity={0.9 * op("todo")}>
          {[-1, 1].map((k) => (
            <g key={k}>
              <path d={`M-150,${k * 150} L${rimX},${k * 322}`} stroke={C.case3} strokeWidth={14} strokeLinecap="round" opacity={0.55} />
              <rect x={rimX - 6} y={k > 0 ? 300 : -350} width={22} height={50} rx={6} fill={C.case2} stroke={C.ink} strokeWidth={4} />
            </g>
          ))}
        </g>
        {/* imán: placa trasera, anillo, placa delantera y polo central */}
        <g opacity={op("iman")} style={hl("iman") ? glow(K.flow, 14) : undefined}>
          <rect x={-300} y={-160} width={44} height={320} rx={8} fill={C.case2} stroke={C.ink} strokeWidth={5} />
          <rect x={-258} y={-150} width={96} height={100} rx={6} fill={C.magnet} stroke={hl("iman") ? K.flow : C.ink} strokeWidth={5} />
          <rect x={-258} y={50} width={96} height={100} rx={6} fill={C.magnet} stroke={hl("iman") ? K.flow : C.ink} strokeWidth={5} />
          <rect x={-164} y={-150} width={30} height={106} rx={4} fill={C.case2} stroke={C.ink} strokeWidth={4} />
          <rect x={-164} y={44} width={30} height={106} rx={4} fill={C.case2} stroke={C.ink} strokeWidth={4} />
          <rect x={-258} y={-28} width={130} height={56} rx={6} fill={C.magnet2} stroke={hl("iman") ? K.flow : C.ink} strokeWidth={5} />
          {poles > 0.01 && (
            <g opacity={poles} fontFamily="MontserratSerie" fontWeight={900} fontSize={40} textAnchor="middle">
              <text x={-210} y={-86} fill={K.white}>S</text>
              <text x={-210} y={126} fill={K.white}>S</text>
              <text x={-238} y={14} fill={K.white}>N</text>
            </g>
          )}
        </g>
        {/* araña (suspensión interior, tela ondulada) */}
        <g opacity={op("arana")}>
          {[-1, 1].map((k) => {
            const pts = Array.from({ length: 9 }).map((_, i) => { const yy = 44 + (i * (132 - 44)) / 8; const xx = -112 + dx * (1 - i / 8) + (i % 2 ? 12 : -12); return `${i ? "L" : "M"}${xx},${k * yy}`; }).join(" ");
            return <path key={k} d={pts} fill="none" stroke={hl("arana") ? K.flow : C.spider} strokeWidth={hl("arana") ? 9 : 7} strokeLinejoin="round" style={hl("arana") ? glow(K.flow) : undefined} />;
          })}
        </g>
        {/* cono de papel (corte: dos paredes + relleno suave) */}
        <g opacity={op("cono")} style={hl("cono") ? glow(K.flow, 10) : undefined}>
          <path d={`M${cx0},${-h0} L${cx1},${-h1} L${cx1},${h1} L${cx0},${h0} Z`} fill={C.paper} opacity={0.22} />
          <path d={`M${cx0},${-h0} L${cx1},${-h1}`} stroke={hl("cono") ? K.flow : C.paper} strokeWidth={14} strokeLinecap="round" />
          <path d={`M${cx0},${h0} L${cx1},${h1}`} stroke={hl("cono") ? K.flow : C.paper} strokeWidth={14} strokeLinecap="round" />
          {/* tapa central */}
          <path d={`M${cx0},${-h0} C${cx0 + 52},${-h0} ${cx0 + 52},${h0} ${cx0},${h0}`} fill={C.paper2} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* borde blando (suspensión exterior) */}
        <g opacity={op("borde")}>
          {[-1, 1].map((k) => (
            <path key={k} d={`M${cx1},${k * h1} Q${(cx1 + rimX) / 2 + 6},${k * (h1 + 48)} ${rimX},${k * 322}`} fill="none" stroke={hl("borde") ? K.flow : "#5C6F8A"} strokeWidth={14} strokeLinecap="round"
              style={hl("borde") ? glow(K.flow) : undefined} />
          ))}
        </g>
        {/* bobina: tubo + espiras en el hueco */}
        <g opacity={op("bobina")}>
          {[-1, 1].map((k) => <rect key={k} x={-178 + dx} y={k > 0 ? 32 : -40} width={122} height={8} rx={3} fill={C.case3} />)}
          {[-1, 1].map((k) => (
            <g key={k}>
              {[0, 1, 2, 3].map((i) => (
                <circle key={i} cx={-171 + dx + i * 12} cy={k * 36} r={6.5} fill={ca > 0.05 ? K.flow : C.copper} stroke={C.ink} strokeWidth={2}
                  style={ca > 0.05 ? glow(K.flow, 6 + 10 * ca) : hl("bobina") ? glow(K.flow, 10) : undefined} />
              ))}
            </g>
          ))}
          {coilPoles > 0.01 && (
            <g opacity={coilPoles} fontFamily="MontserratSerie" fontWeight={900} fontSize={30} textAnchor="middle">
              <rect x={-196 + dx} y={-24} width={88} height={48} rx={10} fill={K.ink} opacity={0.85} />
              <text x={-176 + dx} y={11} fill={cur >= 0 ? K.hot : K.cold}>{cur >= 0 ? "N" : "S"}</text>
              <text x={-128 + dx} y={11} fill={cur >= 0 ? K.cold : K.hot}>{cur >= 0 ? "S" : "N"}</text>
            </g>
          )}
        </g>
      </g>
    );
  };

/** Caja del altavoz partida por la mitad (beat 1): open 0 = cerrada, 1 = mitades separadas. */
export const Box: React.FC<{ x: number; y: number; w: number; h: number; open: number }> = ({ x, y, w, h, open }) => {
  if (open >= 0.999) return null;
  const d = open * 520;
  const half = (k: number) => {
    const yy = k < 0 ? y - h / 2 : y;
    // corte en zigzag en el centro
    const zz = Array.from({ length: 9 }).map((_, i) => `${x - w / 2 + (w * i) / 8},${y + (i % 2 ? 14 : -14)}`);
    const pathTop = `M${x - w / 2},${y - h / 2 + 40} Q${x - w / 2},${y - h / 2} ${x - w / 2 + 40},${y - h / 2} L${x + w / 2 - 40},${y - h / 2} Q${x + w / 2},${y - h / 2} ${x + w / 2},${y - h / 2 + 40} L${zz.slice().reverse().join(" L")} Z`;
    const pathBot = `M${zz.join(" L")} L${x + w / 2},${y + h / 2 - 40} Q${x + w / 2},${y + h / 2} ${x + w / 2 - 40},${y + h / 2} L${x - w / 2 + 40},${y + h / 2} Q${x - w / 2},${y + h / 2} ${x - w / 2},${y + h / 2 - 40} Z`;
    void yy;
    return (
      <g key={k} transform={`translate(0,${k * d})`} opacity={1 - open * 0.9}>
        <path d={k < 0 ? pathTop : pathBot} fill={C.case1} stroke={C.case3} strokeWidth={6} strokeLinejoin="round" />
        {k < 0 && <circle cx={x} cy={y - h / 2 + 150} r={110} fill={C.ink} stroke={C.case2} strokeWidth={10} />}
        {k < 0 && <circle cx={x} cy={y - h / 2 + 150} r={40} fill={C.case2} />}
        {k > 0 && <circle cx={x} cy={y + h / 2 - 110} r={60} fill={C.ink} stroke={C.case2} strokeWidth={8} />}
      </g>
    );
  };
  return <g>{half(-1)}{half(1)}</g>;
};

/** Ondas de presión que salen a la derecha desde x0: franjas de aire comprimido (cian). freq en ondas/s visibles, amp 0..1. */
export const AirWaves: React.FC<{ x0: number; x1: number; y: number; h: number; t: number; o: number; speed?: number; gap?: number; amp?: number }> =
  ({ x0, x1, y, h, t, o, speed = 220, gap = 110, amp = 1 }) => o <= 0.01 ? null : (
    <g opacity={o}>
      {Array.from({ length: Math.ceil((x1 - x0) / gap) + 1 }).map((_, k) => {
        const xx = x0 + ((t * speed + k * gap) % (x1 - x0 + gap));
        if (xx > x1) return null;
        const f = 1 - (xx - x0) / (x1 - x0);
        const hh = h * (0.6 + 0.4 * (1 - f));
        return <path key={k} d={`M${xx},${y - hh / 2} Q${xx + 40},${y} ${xx},${y + hh / 2}`} fill="none" stroke={K.cold} strokeWidth={8 + 8 * amp} strokeLinecap="round" opacity={(0.25 + 0.75 * f) * (0.4 + 0.6 * amp)} />;
      })}
    </g>
  );

/** Moléculas de aire (puntos) comprimiéndose en franjas que avanzan. */
export const AirDots: React.FC<{ x0: number; x1: number; y0: number; y1: number; t: number; o: number; k?: number; w?: number; amp?: number }> =
  ({ x0, x1, y0, y1, t, o, k = 0.045, w = 9, amp = 1 }) => o <= 0.01 ? null : (
    <g opacity={o}>
      {Array.from({ length: 16 }).map((_, i) => Array.from({ length: 9 }).map((_, j) => {
        const bx = x0 + ((x1 - x0) * (i + (j % 2) * 0.5)) / 16;
        const xx = bx + amp * 22 * Math.sin(bx * k - t * w);
        const yy = y0 + ((y1 - y0) * j) / 8;
        return <circle key={`${i}-${j}`} cx={xx} cy={yy} r={7} fill={K.cold} opacity={0.55 + 0.45 * Math.cos(bx * k - t * w)} />;
      }))}
    </g>
  );

/** Onda senoidal (trazo) entre x0 y x1. */
export const sine = (x0: number, x1: number, y: number, a: number, ph: number, k = 0.035) =>
  Array.from({ length: 81 }).map((_, i) => { const x = x0 + ((x1 - x0) * i) / 80; return `${i ? "L" : "M"}${x.toFixed(1)},${(y + a * Math.sin((x - x0) * k + ph)).toFixed(1)}`; }).join(" ");

/** Flecha gruesa (fuerza) de (x1,y1) a (x2,y2). */
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color?: string; o: number; w?: number }> = ({ x1, y1, x2, y2, color = K.hot, o, w = 14 }) => {
  if (o <= 0.01) return null;
  const a = Math.atan2(y2 - y1, x2 - x1), hl = w * 2.4;
  const bx = x2 - hl * Math.cos(a), by = y2 - hl * Math.sin(a);
  return (
    <g opacity={o} style={glow(color, 8)}>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${x2},${y2} L${bx + hl * 0.7 * Math.sin(a)},${by - hl * 0.7 * Math.cos(a)} L${bx - hl * 0.7 * Math.sin(a)},${by + hl * 0.7 * Math.cos(a)} Z`} fill={color} />
    </g>
  );
};

/** Altavoz de frente (woofer / tweeter): r = radio exterior; pulse = desplazamiento 0..1. */
export const FrontDriver: React.FC<{ x: number; y: number; r: number; pulse: number; o?: number; hi?: boolean }> = ({ x, y, r, pulse, o = 1, hi = false }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill={C.case1} stroke={hi ? K.flow : C.case3} strokeWidth={8} style={hi ? glow(K.flow, 10) : undefined} />
    {[0, 1, 2, 3].map((k) => <circle key={k} cx={x + r * 0.9 * Math.cos(k * Math.PI / 2 + 0.78)} cy={y + r * 0.9 * Math.sin(k * Math.PI / 2 + 0.78)} r={Math.max(4, r * 0.035)} fill={C.case3} />)}
    <circle cx={x} cy={y} r={r * 0.8} fill={C.rubber} />
    <circle cx={x} cy={y} r={r * (0.7 + 0.03 * pulse)} fill={C.paper} />
    {[0.55, 0.42].map((f, k) => <circle key={k} cx={x} cy={y} r={r * f * (1 + 0.04 * pulse)} fill="none" stroke={C.paper2} strokeWidth={Math.max(2, r * 0.02)} opacity={0.6} />)}
    <circle cx={x} cy={y} r={r * (0.25 + 0.02 * pulse)} fill={C.paper2} stroke={C.ink} strokeWidth={3} />
  </g>
);

/** Cable con cargas (puntos amarillos) que van y vienen: de (x0,y) a (x1,y). ph = desplazamiento (-1..1). */
export const Wire: React.FC<{ x0: number; x1: number; y: number; ph: number; o?: number; dots?: boolean }> = ({ x0, x1, y, ph, o = 1, dots = true }) => (
  <g opacity={o}>
    <line x1={x0} y1={y} x2={x1} y2={y} stroke={C.case1} strokeWidth={34} strokeLinecap="round" />
    <line x1={x0} y1={y} x2={x1} y2={y} stroke={C.copper} strokeWidth={14} strokeLinecap="round" opacity={0.7} />
    {dots && Array.from({ length: Math.floor((x1 - x0) / 60) }).map((_, i) => {
      const xx = x0 + 30 + i * 60 + ph * 24;
      return <circle key={i} cx={xx} cy={y} r={10} fill={K.flow} style={glow(K.flow, 8)} />;
    })}
  </g>
);

/** Nota musical. */
export const Note: React.FC<{ x: number; y: number; s?: number; o?: number; color?: string }> = ({ x, y, s = 1, o = 1, color = K.cold }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={24} ry={17} fill={color} transform="rotate(-20)" />
    <rect x={16} y={-90} width={9} height={90} fill={color} />
    <path d="M25,-90 q34,12 28,48" fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" />
  </g>
);

/** Oreja simple (perfil). */
export const Ear: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-10,-150 C110,-160 150,-40 100,40 C70,90 60,110 40,150 C20,190 -50,180 -55,130 C-58,100 -20,90 -30,60 C-60,20 -110,-120 -10,-150 Z" fill={C.skin} stroke={C.ink} strokeWidth={6} />
    <path d="M0,-100 C70,-105 90,-30 55,25 C40,50 20,60 10,40" fill="none" stroke={C.skin2} strokeWidth={10} strokeLinecap="round" />
    <circle cx={12} cy={20} r={16} fill={C.skin2} />
  </g>
);
