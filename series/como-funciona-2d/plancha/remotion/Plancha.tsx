// Dibujos SVG planos del episodio «Cómo funciona una plancha de vapor» (n.º 132).
// Colores de código: naranja = calor, cian = agua, amarillo = lo importante/corriente, blanco = vapor, rojo = error.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = { shell: "#2B4A72", shell2: "#3E6AA0", light: "#9FB3CC", dark: "#132A4A", ink: "#06101F", metal: "#C9D6E6" };
const W = 1080, H = 1920;
export const Svg: React.FC<{ children: React.ReactNode; o?: number }> = ({ children, o = 1 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>{children}</svg>
);
const cl = (x: number) => Math.max(0, Math.min(1, x));

/** Gota (forma de lágrima) centrada en (x, y). */
const drop = (x: number, y: number, s = 1) =>
  `M ${x} ${y - 18 * s} C ${x + 11 * s} ${y - 2 * s}, ${x + 11 * s} ${y + 10 * s}, ${x} ${y + 10 * s} C ${x - 11 * s} ${y + 10 * s}, ${x - 11 * s} ${y - 2 * s}, ${x} ${y - 18 * s} Z`;

// ---------- la plancha de perfil (punta a la izquierda) ----------
// suela y 945-995, de x 180 (punta) a 880 (talón). Asa arriba (y ≈ 575). Depósito delante, termostato detrás.
export const P = { holes: [330, 395, 460, 525, 590], valve: { x: 450, y: 912 }, chamber: { x0: 300, x1: 640, y0: 950, y1: 968 }, dial: { x: 705, y: 705 } };

export const Iron: React.FC<{
  t: number; open?: number; cut?: number; heat?: number; hl?: "res" | "thermo" | "steam" | "dial" | null;
  drip?: number; steam?: number; spit?: number; bend?: number; dial?: number; level?: number; s?: number; cx?: number; cy?: number;
}> = ({ t, open = 0, cut = 0, heat = 0.6, hl = null, drip = 0, steam = 0, spit = 0, bend = 0, dial = 40, level = 0.7, s = 1, cx = 540, cy = 780 }) => {
  const dim = (k: string) => (hl && hl !== k ? 0.35 : 1);
  const lift = open * 175;
  const shellO = 1 - 0.72 * Math.max(cut, open);
  const glow = heat * (0.75 + 0.25 * Math.sin(t * 5));
  const tankTop = 905 - 88 * cl(level);
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s}) translate(-540 -780)`}>
      {/* sombra */}
      <ellipse cx={530} cy={1012} rx={370} ry={16} fill="#000" opacity={0.3} />
      {/* suela con resistencia */}
      <g opacity={dim("res") === 1 || hl === "steam" ? 1 : 0.6}>
        <path d="M 180 995 L 880 995 L 880 945 L 300 945 Q 220 950 180 995 Z" fill={C.metal} stroke={C.light} strokeWidth={5} />
        <path d="M 180 995 L 880 995 L 880 945 L 300 945 Q 220 950 180 995 Z" fill={K.hot} opacity={0.38 * glow} />
        {P.holes.map((x) => <ellipse key={x} cx={x} cy={995} rx={11} ry={5} fill={C.ink} />)}
        {(cut > 0.05 || open > 0.05) && (
          <g opacity={Math.max(cut, open)}>
            <path d="M 245 980 L 865 980" stroke={K.hot} strokeWidth={34} opacity={0.3 * glow * (hl === "res" ? 1.6 : 1)} strokeLinecap="round" />
            <path d="M 245 980 L 865 980" stroke={heat > 0.2 ? K.hot : "#8A5A3A"} strokeWidth={12} strokeLinecap="round" />
            {/* cámara de vapor */}
            <g opacity={dim("steam")}>
              <rect x={P.chamber.x0} y={P.chamber.y0} width={P.chamber.x1 - P.chamber.x0} height={P.chamber.y1 - P.chamber.y0} rx={6} fill={C.dark} stroke={hl === "steam" ? K.hot : C.light} strokeWidth={3} />
              <rect x={P.chamber.x0} y={P.chamber.y0} width={P.chamber.x1 - P.chamber.x0} height={P.chamber.y1 - P.chamber.y0} rx={6} fill={K.hot} opacity={0.35 * glow} />
            </g>
          </g>
        )}
      </g>
      {/* interior: válvula, goteo, termostato */}
      {(cut > 0.05 || open > 0.05) && (
        <g opacity={Math.max(cut, open)}>
          <g opacity={dim("steam")}>
            <rect x={P.valve.x - 9} y={892} width={18} height={22} rx={4} fill={C.light} />
            {drip > 0.01 && [0, 1, 2].map((k) => {
              const u = (t * 1.6 + k / 3) % 1;
              return <path key={k} d={drop(P.valve.x, 918 + 34 * u * u, 0.55)} fill={K.cold} opacity={drip * Math.min(1, (1 - u) * 4)} />;
            })}
          </g>
          {/* lámina bimetálica: naranja (dilata más) abajo, gris arriba; se curva hacia arriba al calentarse */}
          <g opacity={dim("thermo")}>
            <rect x={842} y={850} width={24} height={46} rx={4} fill={C.light} />
            <path d={`M 850 868 Q 790 ${868 - 6 * bend} 722 ${868 - 26 * bend}`} stroke={C.light} strokeWidth={8} fill="none" strokeLinecap="round" />
            <path d={`M 850 876 Q 790 ${876 - 6 * bend} 722 ${876 - 26 * bend}`} stroke={K.hot} strokeWidth={8} fill="none" strokeLinecap="round" />
            <circle cx={722} cy={890} r={7} fill={K.flow} />
            {hl === "thermo" && <rect x={705} y={835} width={170} height={75} rx={14} fill="none" stroke={K.flow} strokeWidth={4} strokeDasharray="10 8" />}
          </g>
        </g>
      )}
      {/* vapor por los agujeros */}
      {steam > 0.01 && Array.from({ length: 15 }).map((_, k) => {
        const u = (t * 0.9 + k / 15) % 1;
        const x = P.holes[k % 5] + 18 * Math.sin(t * 2 + k) * u;
        return <circle key={k} cx={x} cy={1004 + 72 * u} r={9 + 20 * u} fill={K.white} opacity={steam * 0.92 * (1 - u) * Math.min(1, u * 6)} />;
      })}
      {/* gotas que escupe si está poco caliente */}
      {spit > 0.01 && P.holes.map((x, k) => {
        const u = (t * 1.1 + k * 0.37) % 1;
        return <path key={k} d={drop(x, 1010 + 70 * u * u, 0.8)} fill={K.cold} opacity={spit * Math.min(1, (1 - u) * 4)} />;
      })}
      {/* carcasa (se levanta con open, se vuelve translúcida con cut) */}
      <g transform={`translate(0 ${-lift})`}>
        <path d="M 212 945 C 300 850, 420 792, 560 772 L 880 762 L 880 945 Z" fill={C.shell} fillOpacity={shellO} stroke={C.light} strokeWidth={7} />
        {/* depósito transparente */}
        <g opacity={dim("steam")}>
          <path d="M 292 905 C 340 862, 420 832, 520 820 L 610 817 L 610 905 Z" fill="#0B1E38" fillOpacity={0.55 * shellO + 0.3} stroke={hl === "steam" ? K.cold : C.light} strokeWidth={4} />
          <clipPath id="tankclip"><path d="M 292 905 C 340 862, 420 832, 520 820 L 610 817 L 610 905 Z" /></clipPath>
          <g clipPath="url(#tankclip)">
            <path d={`M 280 910 L 280 ${tankTop} ${Array.from({ length: 18 }).map((_, i) => `L ${280 + i * 20} ${tankTop + 4 * Math.sin(i / 1.5 + t * 4)}`).join(" ")} L 620 ${tankTop} L 620 910 Z`} fill={K.cold} opacity={0.75} />
          </g>
        </g>
        {/* asa */}
        <path d="M 470 795 C 470 640, 540 578, 640 578 L 800 578 C 852 578, 872 612, 866 765" fill="none" stroke={C.light} strokeWidth={60} strokeLinecap="round" />
        <path d="M 470 795 C 470 640, 540 578, 640 578 L 800 578 C 852 578, 872 612, 866 765" fill="none" stroke={C.shell2} strokeWidth={46} strokeLinecap="round" />
        <rect x={548} y={556} width={60} height={22} rx={10} fill={hl === "steam" ? K.flow : C.light} />
        {/* rueda de temperatura */}
        <g opacity={dim("dial")}>
          <circle cx={P.dial.x} cy={P.dial.y} r={44} fill={C.dark} stroke={hl === "dial" ? K.flow : C.light} strokeWidth={6} />
          <line x1={P.dial.x} y1={P.dial.y} x2={P.dial.x + 34 * Math.sin((dial * Math.PI) / 180)} y2={P.dial.y - 34 * Math.cos((dial * Math.PI) / 180)} stroke={K.flow} strokeWidth={8} strokeLinecap="round" />
        </g>
        {/* cable */}
        <path d="M 880 900 C 935 905, 930 960, 912 1000" fill="none" stroke={C.light} strokeWidth={14} strokeLinecap="round" />
      </g>
    </g>
  );
};

// ---------- fibras de algodón: cadenas de celulosa y enlaces de hidrógeno ----------
const CH = [620, 705, 790, 875, 960];
const wave = (x: number, amp: number) => amp * (55 * Math.sin((x - 140) / 105 + 0.6) + 22 * Math.sin(x / 41));
/** amp: arruga (1) → lisa (0). bonds: enlaces visibles. wet: agua entre cadenas. heat: brillo naranja. slide: cadenas que resbalan. press: suela que baja. */
export const Fibers: React.FC<{ t: number; amp: number; bonds: number; wet?: number; heat?: number; slide?: number; press?: number; evap?: number }> =
  ({ t, amp, bonds, wet = 0, heat = 0, slide = 0, press = 0, evap = 0 }) => {
    const xs = Array.from({ length: 41 }).map((_, i) => 130 + i * 20.5);
    return (
      <g>
        {/* calor de fondo */}
        
        {/* enlaces de hidrógeno entre cadenas vecinas */}
        {CH.slice(0, -1).map((y, i) => Array.from({ length: 11 }).map((_, j) => {
          const x = 180 + j * 72 + (i % 2) * 36;
          const flick = bonds < 0.95 ? 0.6 + 0.4 * Math.sin(t * 9 + i * 3 + j * 1.7) : 1;
          const ya = y + wave(x, amp) + 16, yb = CH[i + 1] + wave(x, amp) - 16;
          return <line key={`${i}-${j}`} x1={x} y1={ya} x2={x} y2={yb} stroke={K.flow} strokeWidth={5} strokeDasharray="7 7" opacity={bonds * flick} />;
        }))}
        {/* agua metida entre las cadenas */}
        {(wet > 0.01 || evap > 0.01) && CH.slice(0, -1).map((y, i) => Array.from({ length: 6 }).map((_, j) => {
          const x = 210 + j * 130 + (i % 2) * 60 + 14 * Math.sin(t * 3 + i + j);
          const yy = (y + CH[i + 1]) / 2 + wave(x, amp) - evap * 260 * (0.6 + 0.4 * ((i + j) % 3) / 2);
          return <g key={`${i}-${j}`} opacity={Math.max(wet, 0) * (1 - evap)}>
            <circle cx={x} cy={yy} r={13} fill={K.cold} />
            <circle cx={x - 13} cy={yy - 9} r={6} fill={K.white} />
            <circle cx={x + 13} cy={yy - 9} r={6} fill={K.white} />
          </g>;
        }))}
        {/* cadenas de celulosa: línea + anillos de glucosa */}
        {CH.map((y, i) => {
          const d = "M " + xs.map((x) => `${x} ${y + wave(x, amp)}`).join(" L ");
          const off = slide * 26 * Math.sin(t * 2.6 + i * 1.9);
          return <g key={i}>
            {heat > 0.01 && <path d={d} stroke={K.hot} strokeWidth={26} fill="none" opacity={0.4 * heat * (0.85 + 0.15 * Math.sin(t * 5 + i))} strokeLinecap="round" />}
            <path d={d} stroke={C.light} strokeWidth={8} fill="none" strokeLinecap="round" />
            {Array.from({ length: 12 }).map((_, j) => {
              const x = 160 + j * 70 + off;
              if (x < 135 || x > 945) return null;
              const yy = y + wave(x, amp);
              return <polygon key={j} points={[0, 1, 2, 3, 4, 5].map((k) => `${x + 17 * Math.cos(Math.PI / 3 * k)},${yy + 17 * Math.sin(Math.PI / 3 * k)}`).join(" ")} fill="#E8EEF6" stroke={C.ink} strokeWidth={3} />;
            })}
          </g>;
        })}
        {/* suela que aprieta desde arriba */}
        {press > 0.01 && (
          <g transform={`translate(0 ${-180 * (1 - press)})`} opacity={Math.min(1, press * 3)}>
            <rect x={120} y={470} width={840} height={70} rx={18} fill={C.metal} stroke={C.light} strokeWidth={5} />
            <rect x={120} y={526} width={840} height={14} rx={7} fill={K.hot} opacity={0.7} />
            <path d="M 540 440 L 540 380" stroke={K.flow} strokeWidth={0} />
          </g>
        )}
      </g>
    );
  };

// ---------- camiseta ----------
export const Shirt: React.FC<{ t: number; flat: number; color?: string; x?: number; y?: number; s?: number; flip?: number; inside?: number }> =
  ({ t, flat, color = "#E8EEF6", x = 540, y = 800, s = 1, flip = 1, inside = 0 }) => (
    <g transform={`translate(${x} ${y}) scale(${s * flip} ${s}) translate(-540 -800)`}>
      <path d="M 400 560 L 300 600 L 205 705 L 290 775 L 350 735 L 350 1040 L 730 1040 L 730 735 L 790 775 L 875 705 L 780 600 L 680 560 C 650 615, 430 615, 400 560 Z"
        fill={color} stroke={C.light} strokeWidth={6} strokeLinejoin="round" />
      {/* costuras por dentro */}
      {inside > 0.01 && <g opacity={inside} stroke={K.white} strokeWidth={4} strokeDasharray="10 9" fill="none">
        <path d="M 356 740 L 356 1030" /><path d="M 724 740 L 724 1030" /><path d="M 360 1020 L 720 1020" /><path d="M 420 580 C 450 625, 630 625, 660 580" />
        <rect x={515} y={612} width={50} height={30} fill={K.white} fillOpacity={0.6} stroke="none" />
      </g>}
      {/* arrugas */}
      {flat < 0.99 && <g opacity={1 - flat} stroke={color === "#E8EEF6" ? "#8FA3BF" : "#55657F"} strokeWidth={7} fill="none" strokeLinecap="round">
        <path d={`M 400 760 C 450 ${730 + 8 * Math.sin(t * 2)}, 500 800, 560 770`} />
        <path d="M 520 860 C 580 830, 620 900, 690 860" />
        <path d="M 380 930 C 430 900, 470 960, 540 930" />
        <path d="M 560 990 C 600 965, 640 1010, 700 985" />
        <path d="M 300 650 C 330 640, 340 680, 370 670" />
      </g>}
    </g>
  );

// ---------- iconos del beat 2 ----------
export const HeatIcon: React.FC<{ x: number; y: number; t: number; o: number }> = ({ x, y, t, o }) => (
  <g opacity={o}>
    {[-30, 0, 30].map((dx, i) => (
      <path key={i} d={`M ${x + dx} ${y + 45} C ${x + dx - 18} ${y + 20}, ${x + dx + 18} ${y + 5 + 4 * Math.sin(t * 5 + i)}, ${x + dx} ${y - 20} C ${x + dx - 16} ${y - 35}, ${x + dx + 10} ${y - 45}, ${x + dx} ${y - 55}`}
        stroke={K.hot} strokeWidth={10} fill="none" strokeLinecap="round" />
    ))}
  </g>
);
export const DropIcon: React.FC<{ x: number; y: number; t: number; o: number }> = ({ x, y, t, o }) => (
  <g opacity={o} transform={`translate(0 ${4 * Math.sin(t * 3)})`}><path d={drop(x, y + 8, 3.2)} fill={K.cold} stroke={C.ink} strokeWidth={4} /></g>
);
export const WeightIcon: React.FC<{ x: number; y: number; o: number; p?: number }> = ({ x, y, o, p = 0 }) => (
  <g opacity={o} transform={`translate(0 ${10 * Math.sin(p * Math.PI)})`}>
    <path d={`M ${x - 20} ${y - 50} A 22 22 0 1 1 ${x + 20} ${y - 50}`} stroke={C.light} strokeWidth={10} fill="none" />
    <path d={`M ${x - 40} ${y - 42} L ${x + 40} ${y - 42} L ${x + 60} ${y + 45} L ${x - 60} ${y + 45} Z`} fill={K.flow} stroke={C.ink} strokeWidth={4} />
  </g>
);
export const Plus: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) => (
  <g opacity={o} stroke={K.white} strokeWidth={9} strokeLinecap="round"><line x1={x - 18} y1={y} x2={x + 18} y2={y} /><line x1={x} y1={y - 18} x2={x} y2={y + 18} /></g>
);

// ---------- termostato en grande (beat 8) ----------
/** bend: 0 recta y tocando el contacto (pasa corriente) → 1 doblada hacia arriba (corta). */
export const Thermo: React.FC<{ t: number; bend: number; spark: number }> = ({ t, bend, spark }) => {
  const on = bend < 0.35;
  const tipY = 700 - 150 * bend;
  // circuito: contacto (300, 735) → abajo → resistencia → sube al anclaje (800, 700)
  const loop: [number, number][] = [[300, 745], [300, 960], [820, 960], [820, 720]];
  const L = [215, 520, 240];
  const tot = L.reduce((a, b) => a + b, 0);
  const at = (u: number): [number, number] => {
    let d = u * tot;
    for (let i = 0; i < 3; i++) { if (d <= L[i]) { const k = d / L[i]; return [loop[i][0] + (loop[i + 1][0] - loop[i][0]) * k, loop[i][1] + (loop[i + 1][1] - loop[i][1]) * k]; } d -= L[i]; }
    return loop[3];
  };
  let zig = "M 360 960";
  for (let i = 0; i < 12; i++) zig += ` L ${380 + i * 35} ${i % 2 ? 930 : 990}`;
  zig += " L 780 960";
  return (
    <g>
      {/* cables */}
      <path d="M 300 745 L 300 960 L 360 960" stroke={C.light} strokeWidth={10} fill="none" strokeLinejoin="round" />
      <path d="M 780 960 L 820 960 L 820 730" stroke={C.light} strokeWidth={10} fill="none" strokeLinejoin="round" />
      {/* resistencia que se calienta cuando hay corriente */}
      <path d={zig} stroke={on ? K.hot : "#8A5A3A"} strokeWidth={12} fill="none" strokeLinejoin="round" />
      {on && <path d={zig} stroke={K.hot} strokeWidth={34} fill="none" opacity={0.25 + 0.1 * Math.sin(t * 6)} strokeLinejoin="round" />}
      {/* corriente */}
      {on && Array.from({ length: 16 }).map((_, k) => { const [x, y] = at((t * 0.25 + k / 16) % 1); return <circle key={k} cx={x} cy={y} r={9} fill={K.flow} stroke={C.ink} strokeWidth={2} />; })}
      {/* anclaje */}
      <rect x={790} y={640} width={70} height={110} rx={10} fill={C.shell2} stroke={C.light} strokeWidth={5} />
      {/* lámina de dos metales */}
      <path d={`M 800 682 Q 560 ${682 - 40 * bend} 305 ${tipY - 18}`} stroke={C.light} strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d={`M 800 704 Q 560 ${704 - 40 * bend} 305 ${tipY + 4}`} stroke={K.hot} strokeWidth={22} fill="none" strokeLinecap="round" />
      {/* contacto */}
      <circle cx={300} cy={tipY + 20} r={13} fill={C.metal} stroke={C.ink} strokeWidth={3} />
      <circle cx={300} cy={745} r={15} fill={C.metal} stroke={C.ink} strokeWidth={3} />
      {spark > 0.01 && <g opacity={spark}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1={300 + 26 * Math.cos(a * Math.PI / 180)} y1={735 + 26 * Math.sin(a * Math.PI / 180)} x2={300 + 60 * Math.cos(a * Math.PI / 180)} y2={735 + 60 * Math.sin(a * Math.PI / 180)} stroke={K.flow} strokeWidth={7} strokeLinecap="round" />)}
      </g>}
    </g>
  );
};

// ---------- rueda de temperaturas en grande (beat 9) ----------
export const Dial: React.FC<{ angle: number; hi: number }> = ({ angle, hi }) => {
  const x = 540, y = 780, r = 230;
  const marks = [{ a: -70, n: 1 }, { a: 0, n: 2 }, { a: 70, n: 3 }];
  return (
    <g>
      <circle cx={x} cy={y} r={r + 40} fill={C.shell} stroke={C.light} strokeWidth={8} />
      <circle cx={x} cy={y} r={r - 30} fill={C.dark} stroke={C.light} strokeWidth={6} />
      {/* arco de frío a calor */}
      {marks.map((m, i) => (
        <g key={i}>
          {Array.from({ length: m.n }).map((_, k) => {
            const a = ((m.a + (k - (m.n - 1) / 2) * 9) * Math.PI) / 180;
            const on = (i === 0 && hi < 0.5) || (i === 2 && hi >= 0.5);
            return <circle key={k} cx={x + (r + 8) * Math.sin(a)} cy={y - (r + 8) * Math.cos(a)} r={14} fill={on ? K.flow : K.white} opacity={on ? 1 : 0.55} />;
          })}
        </g>
      ))}
      <g transform={`rotate(${angle} ${x} ${y})`}>
        <rect x={x - 34} y={y - r + 20} width={68} height={2 * r - 40} rx={34} fill={C.shell2} stroke={C.light} strokeWidth={5} />
        <path d={`M ${x} ${y - r + 32} L ${x - 18} ${y - r + 72} L ${x + 18} ${y - r + 72} Z`} fill={K.flow} />
      </g>
      <circle cx={x} cy={y} r={30} fill={C.light} />
    </g>
  );
};

// ---------- agua: grifo, botella y jarra (beat 12) ----------
export const WaterMix: React.FC<{ t: number; tap: number; cal: number; dist: number }> = ({ t, tap, cal, dist }) => {
  const j = { x0: 380, x1: 720, y0: 700, y1: 1050 };
  const hTap = 0.5 * tap, hDist = 0.5 * dist;
  const yTap = j.y1 - (j.y1 - j.y0) * hTap, yDist = yTap - (j.y1 - j.y0) * hDist;
  const pouringTap = tap > 0.02 && tap < 0.98, pouringDist = dist > 0.02 && dist < 0.98;
  return (
    <g>
      {/* grifo */}
      <path d="M 120 520 L 470 520 L 470 575" stroke={C.light} strokeWidth={34} fill="none" strokeLinejoin="round" />
      <rect x={260} y={478} width={44} height={30} rx={8} fill={C.shell2} stroke={C.light} strokeWidth={4} />
      {pouringTap && <rect x={461} y={592} width={18} height={yTap - 592} fill={K.cold} opacity={0.85} />}
      {/* botella de destilada */}
      <g transform={`rotate(${-55 * Math.min(1, dist * 4) * (dist < 0.98 ? 1 : 0.4)} 820 640)`}>
        <rect x={770} y={560} width={100} height={200} rx={24} fill="#DDEAF7" opacity={0.85} stroke={C.light} strokeWidth={5} />
        <rect x={800} y={520} width={40} height={44} rx={8} fill={C.light} />
      </g>
      {pouringDist && <rect x={692} y={585} width={16} height={yDist - 585} fill="#DDEAF7" opacity={0.9} />}
      {/* jarra */}
      <rect x={j.x0} y={j.y0} width={j.x1 - j.x0} height={j.y1 - j.y0} rx={26} fill="#0B1E38" stroke={C.light} strokeWidth={7} />
      {tap > 0.01 && <rect x={j.x0 + 6} y={yTap} width={j.x1 - j.x0 - 12} height={j.y1 - yTap - 6} rx={18} fill={K.cold} opacity={0.85} />}
      {dist > 0.01 && <rect x={j.x0 + 6} y={yDist} width={j.x1 - j.x0 - 12} height={yTap - yDist} fill="#DDEAF7" opacity={0.85} />}
      {/* cal: motas blancas en el agua del grifo */}
      {cal > 0.01 && Array.from({ length: 16 }).map((_, k) => {
        const x = j.x0 + 30 + ((k * 67) % (j.x1 - j.x0 - 60));
        const y = Math.max(yTap + 14, j.y1 - 20 - ((k * 41 + t * 30) % Math.max(10, j.y1 - yTap - 30)));
        return <rect key={k} x={x - 6} y={y - 6} width={12} height={12} rx={2} fill={K.white} opacity={cal * (1 - 0.5 * dist)} transform={`rotate(${k * 23} ${x} ${y})`} />;
      })}
      {dist > 0.6 && <line x1={j.x0 + 12} x2={j.x1 - 12} y1={yTap} y2={yTap} stroke={K.flow} strokeWidth={5} strokeDasharray="14 10" opacity={(dist - 0.6) / 0.4} />}
    </g>
  );
};

/** Brillos (destellos) con aspa roja encima. */
export const Shine: React.FC<{ x: number; y: number; t: number; o: number; cross: number }> = ({ x, y, t, o, cross }) => o <= 0.01 ? null : (
  <g opacity={o}>
    {[[0, 0, 1], [-60, 40, 0.6], [55, 50, 0.7]].map(([dx, dy, s], i) => {
      const k = s * (0.8 + 0.2 * Math.sin(t * 6 + i));
      return <path key={i} transform={`translate(${x + dx} ${y + dy}) scale(${k})`} d="M 0 -40 L 9 -9 L 40 0 L 9 9 L 0 40 L -9 9 L -40 0 L -9 -9 Z" fill={K.white} />;
    })}
    {cross > 0.01 && <g opacity={Math.min(1, cross * 2)} transform={`translate(${x} ${y + 20}) scale(${1.3 - 0.3 * cross})`}>
      <line x1={-90} y1={-90} x2={90} y2={90} stroke={K.warn} strokeWidth={22} strokeLinecap="round" />
      <line x1={90} y1={-90} x2={-90} y2={90} stroke={K.warn} strokeWidth={22} strokeLinecap="round" />
    </g>}
  </g>
);
