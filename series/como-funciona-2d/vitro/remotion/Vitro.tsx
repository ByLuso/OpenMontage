// Dibujos SVG planos del episodio «Cómo funciona una vitrocerámica radiante» (n.º 143).
// Colores de código: naranja = calor, cian = frío/aire, amarillo = lo importante/corriente, blanco = texto, rojo = error.
import React from "react";
import { K, FONT } from "./kit2d/Kit";

export const C = { shell: "#2B4A72", shell2: "#3E6AA0", light: "#9FB3CC", dark: "#132A4A", ink: "#06101F", glass: "#0B111C", insul: "#D6DCE6", metal: "#C9D6E6" };
const W = 1080, H = 1920;
export const Svg: React.FC<{ children: React.ReactNode; o?: number }> = ({ children, o = 1 }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>{children}</svg>
);
const cl = (x: number) => Math.max(0, Math.min(1, x));
const mix = (a: string, b: string, k: number) => {
  const p = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = p(a), B = p(b), q = cl(k);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * q).toString(16).padStart(2, "0")).join("");
};
/** Color de la cinta según el calor: apagada (marrón oscuro) → roja → naranja vivo. */
const ribbon = (h: number) => (h < 0.5 ? mix("#4A3A34", "#D8321C", h * 2) : mix("#D8321C", "#FF7A1A", (h - 0.5) * 2));

// ---------- espiral doble de cinta ondulada (vista desde arriba) ----------
const spiralPath = (cx: number, cy: number, R: number, arm: number) => {
  const turns = 3.2, n = 520, r0 = R * 0.12;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const u = i / n, th = arm * Math.PI + u * turns * 2 * Math.PI;
    const r = r0 + (R - r0) * u + 0.022 * R * Math.sin(th * 26);
    d += `${i ? "L" : "M"} ${(cx + r * Math.cos(th)).toFixed(1)} ${(cy + r * Math.sin(th)).toFixed(1)} `;
  }
  return d;
};
export const Spiral: React.FC<{ cx: number; cy: number; R: number; heat: number; t: number; dish?: boolean }> = ({ cx, cy, R, heat, t, dish = true }) => {
  const g = heat * (0.85 + 0.15 * Math.sin(t * 6));
  const w = Math.max(5, R * 0.035);
  return (
    <g>
      {dish && <>
        <circle cx={cx} cy={cy} r={R * 1.13} fill={C.shell2} stroke={C.light} strokeWidth={4} />
        <circle cx={cx} cy={cy} r={R * 1.06} fill={C.insul} />
        <circle cx={cx} cy={cy} r={R * 1.06} fill={K.hot} opacity={0.22 * g} />
      </>}
      {[0, 1].map((a) => <path key={`g${a}`} d={spiralPath(cx, cy, R, a)} stroke={K.hot} strokeWidth={w * 3.2} fill="none" opacity={0.35 * g} strokeLinecap="round" />)}
      {[0, 1].map((a) => <path key={a} d={spiralPath(cx, cy, R, a)} stroke={ribbon(g)} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
      {g > 0.6 && [0, 1].map((a) => <path key={`c${a}`} d={spiralPath(cx, cy, R, a)} stroke="#FFD9A8" strokeWidth={w * 0.3} fill="none" opacity={(g - 0.6) * 2} />)}
    </g>
  );
};

// ---------- placa vista desde arriba ----------
// cristal negro x 150-930, y 500-1080. Zona grande (400, 760), zonas pequeñas a la derecha. Display abajo.
export const Z = [{ x: 400, y: 760, r: 185 }, { x: 735, y: 650, r: 115 }, { x: 735, y: 900, r: 100 }];
export const Hob: React.FC<{
  t: number; heat?: number[]; open?: number; display?: string; dispColor?: string; residual?: number; x0?: number; y0?: number; w?: number; h?: number; zones?: { x: number; y: number; r: number }[];
}> = ({ t, heat = [0, 0, 0], open = 0, display = "", dispColor = K.hot, residual = 0, x0 = 150, y0 = 500, w = 780, h = 580, zones = Z }) => {
  // la tapa de cristal se abre como una bisagra en el borde de arriba
  const sy = 1 - 0.8 * open;
  return (
    <g>
      <ellipse cx={x0 + w / 2} cy={y0 + h + 26} rx={w * 0.52} ry={18} fill="#000" opacity={0.35} />
      {/* bandeja interior: aislante y espirales */}
      <rect x={x0} y={y0} width={w} height={h} rx={26} fill={C.shell} stroke={C.light} strokeWidth={5} />
      {zones.map((z, i) => <Spiral key={i} cx={z.x} cy={z.y} R={z.r * 0.86} heat={heat[i] ?? 0} t={t + i} />)}
      {/* el cristal: oscuro y casi opaco; deja ver el rojo de la cinta */}
      <g transform={`translate(0 ${y0}) scale(1 ${sy}) translate(0 ${-y0})`}>
        <rect x={x0} y={y0} width={w} height={h} rx={26} fill={C.glass} opacity={0.86 - 0.1 * open} stroke={open > 0.02 ? C.light : "#2A3A55"} strokeWidth={open > 0.02 ? 6 : 4} />
        {zones.map((z, i) => <g key={i} opacity={1 - 0.6 * open}>
          <circle cx={z.x} cy={z.y} r={z.r} fill="none" stroke="#5E6E88" strokeWidth={4} />
          <circle cx={z.x} cy={z.y} r={z.r * 0.95} fill={K.hot} opacity={0.18 * cl(residual)} />
          <circle cx={z.x} cy={z.y} r={z.r * 0.9} fill="#FF3A1A" opacity={0.22 * cl(heat[i] ?? 0) * (0.85 + 0.15 * Math.sin(t * 6 + i))} style={{ mixBlendMode: "screen" }} />
        </g>)}
        {/* brillo del cristal */}
        <path d={`M ${x0 + 40} ${y0 + 30} L ${x0 + 200} ${y0 + 30} L ${x0 + 90} ${y0 + h - 40} L ${x0 + 40} ${y0 + h - 40} Z`} fill="#FFFFFF" opacity={0.05} />
        {/* mandos táctiles */}
        <g opacity={1 - open}>
          {[0, 1, 2].map((k) => <circle key={k} cx={x0 + 120 + k * 70} cy={y0 + h - 45} r={16} fill="none" stroke="#5E6E88" strokeWidth={3} />)}
          <rect x={x0 + w - 230} y={y0 + h - 75} width={170} height={60} rx={10} fill="#05080E" stroke="#2A3A55" strokeWidth={3} />
          {display && <text x={x0 + w - 145} y={y0 + h - 30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={dispColor}
            style={{ filter: `drop-shadow(0 0 8px ${dispColor})` }}>{display}</text>}
        </g>
      </g>
    </g>
  );
};

// ---------- olla vista desde arriba (para el truco de no arrastrar) ----------
export const PotTop: React.FC<{ x: number; y: number; r: number; lift?: number }> = ({ x, y, r, lift = 0 }) => (
  <g transform={`translate(${x} ${y - 30 * lift}) scale(${1 + 0.06 * lift})`}>
    <ellipse cx={0} cy={30 + 30 * lift} rx={r} ry={r * 0.95} fill="#000" opacity={0.35 - 0.15 * lift} />
    <rect x={r - 10} y={-16} width={r * 0.9} height={32} rx={14} fill={C.shell} stroke={C.light} strokeWidth={4} />
    <circle cx={0} cy={0} r={r} fill={C.metal} stroke={C.light} strokeWidth={6} />
    <circle cx={0} cy={0} r={r * 0.82} fill="#AFC0D6" />
    <circle cx={-r * 0.3} cy={-r * 0.3} r={r * 0.25} fill="#FFFFFF" opacity={0.25} />
  </g>
);

// ---------- corte de lado ----------
// cristal y 770-800 (x 110-970). Olla x 330-750 sobre el cristal. Debajo: cuenco aislante con la cinta de canto (o bobina en inducción).
const RIB = Array.from({ length: 12 }).map((_, i) => 300 + i * 44);
export const Section: React.FC<{
  t: number; heat?: number; ir?: number; contact?: number; warp?: number; induction?: number; field?: number; potHeat?: number; glassHeat?: number;
  boil?: number; lid?: number; magnet?: number; down?: number; hl?: "ribbon" | "glass" | "pot" | null; cy?: number;
}> = ({ t, heat = 0, ir = 0, contact = 0, warp = 0, induction = 0, field = 0, potHeat = 0, glassHeat = 0, boil = 0, lid = 0, magnet = 0, down = 0, hl = null, cy = 0 }) => {
  const g = heat * (0.85 + 0.15 * Math.sin(t * 6));
  const base = (x: number) => 768 - warp * 30 * Math.sin(Math.PI * cl((x - 330) / 420));
  const baseD = `M 330 768 Q 540 ${768 - warp * 60} 750 768`;
  const rad = 1 - induction;
  return (
    <g transform={`translate(0 ${cy})`}>
      {/* carcasa bajo el cristal */}
      <rect x={120} y={800} width={840} height={235} rx={18} fill={C.dark} stroke={C.shell2} strokeWidth={5} />
      {/* radiante: cuenco aislante + cinta de canto */}
      {rad > 0.01 && <g opacity={rad}>
        <path d="M 250 815 L 250 990 Q 250 1005 265 1005 L 815 1005 Q 830 1005 830 990 L 830 815 L 800 815 L 800 975 L 280 975 L 280 815 Z" fill={C.insul} />
        <rect x={280} y={905} width={520} height={70} fill={C.insul} />
        <rect x={280} y={905} width={520} height={70} fill={K.hot} opacity={0.18 * g} />
        {RIB.map((x, i) => <g key={i}>
          <rect x={x - 12} y={858} width={24} height={52} rx={6} fill={K.hot} opacity={0.4 * g} />
          <rect x={x - 5} y={866} width={10} height={44} rx={3} fill={ribbon(g)} stroke={hl === "ribbon" ? K.flow : "none"} strokeWidth={3} />
        </g>)}
        {/* aire caliente brillando bajo el cristal */}
        <rect x={282} y={805} width={516} height={50} fill={K.hot} opacity={0.12 * g} />
      </g>}
      {/* inducción: bobina de cobre (corriente = amarillo) y barras de ferrita */}
      {induction > 0.01 && <g opacity={induction}>
        {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={300 + i * 86} y={930} width={50} height={22} rx={5} fill={C.light} opacity={0.7} />)}
        {Array.from({ length: 13 }).map((_, i) => i === 6 ? null : <circle key={i} cx={300 + i * 40} cy={880} r={15} fill={K.flow} stroke={C.ink} strokeWidth={3}
          opacity={0.75 + 0.25 * Math.sin(t * 8 + i)} />)}
        {/* líneas de campo que cruzan el cristal y entran en la base de la olla */}
        {field > 0.01 && [0, 1, 2].map((k) => [420, 660].map((x0) => (
          <ellipse key={`${k}-${x0}`} cx={x0} cy={830} rx={70 + k * 34} ry={62 + k * 26} fill="none" stroke={K.white} strokeWidth={4} strokeDasharray="14 12"
            strokeDashoffset={(x0 < 540 ? 1 : -1) * t * 60} opacity={field * (0.75 - k * 0.15)} />
        )))}
      </g>}
      {/* rayos infrarrojos: ondas que suben desde la cinta, cruzan el cristal y llegan a la olla */}
      {ir > 0.01 && [340, 420, 500, 580, 660, 740].map((x, i) => {
        const u = (t * 0.9 + i * 0.17) % 1;
        const y1 = 860, y2 = base(x) + 4;
        const pts = Array.from({ length: 16 }).map((_, j) => { const y = y1 - (y1 - y2) * (j / 15); return `${x + 8 * Math.sin(j * 1.3 - t * 10)} ${y}`; }).join(" L ");
        return <g key={i} opacity={ir}>
          <path d={`M ${pts}`} stroke={K.hot} strokeWidth={5} fill="none" opacity={0.55} />
          <circle cx={x + 8 * Math.sin(u * 15)} cy={y1 - (y1 - y2) * u} r={8} fill={K.flow} opacity={Math.min(1, (1 - u) * 4)} />
        </g>;
      })}
      {/* el cristal */}
      <rect x={110} y={770} width={860} height={30} rx={8} fill={C.glass} stroke={hl === "glass" ? K.flow : C.shell2} strokeWidth={hl === "glass" ? 5 : 4} />
      <rect x={330} y={772} width={420} height={26} fill={K.hot} opacity={0.75 * cl(Math.max(contact * (0.85 + 0.15 * Math.sin(t * 4)), glassHeat))} />
      {/* contacto: flechitas del cristal a la olla (solo donde toca) */}
      {contact > 0.01 && [370, 450, 630, 710].map((x, i) => {
        const touch = cl(1 - (768 - base(x)) / 12);
        const u = (t * 1.2 + i * 0.25) % 1;
        return <path key={i} d={`M ${x - 10} ${768 - 22 * u} L ${x} ${758 - 22 * u} L ${x + 10} ${768 - 22 * u}`} stroke={K.flow} strokeWidth={5} fill="none" opacity={contact * touch * (1 - u)} />;
      })}
      {/* del fondo de la olla hacia el cristal (inducción) */}
      {down > 0.01 && [380, 470, 610, 700].map((x, i) => {
        const u = (t * 1.1 + i * 0.25) % 1;
        return <path key={i} d={`M ${x - 10} ${775 + 18 * u} L ${x} ${785 + 18 * u} L ${x + 10} ${775 + 18 * u}`} stroke={K.hot} strokeWidth={5} fill="none" opacity={down * (1 - u)} />;
      })}
      {/* la olla */}
      <g>
        <path d={`M 330 535 L 330 768 ${baseD.replace("M 330 768", "")} L 750 535 Z`} fill={C.metal} stroke={hl === "pot" ? K.flow : C.light} strokeWidth={6} />
        <clipPath id="potclip"><path d={`M 336 540 L 336 762 Q 540 ${762 - warp * 60} 744 762 L 744 540 Z`} /></clipPath>
        <g clipPath="url(#potclip)">
          <rect x={330} y={600} width={420} height={180} fill={mix("#35C4F0", "#FF9A4A", cl(boil * 0.6))} opacity={0.85} />
          {boil > 0.01 && Array.from({ length: 9 }).map((_, k) => {
            const u = (t * 0.8 + k / 9) % 1;
            return <circle key={k} cx={360 + ((k * 47) % 360) + 6 * Math.sin(t * 5 + k)} cy={760 - 160 * u} r={6 + 6 * u} fill={K.white} opacity={boil * 0.8 * (1 - u)} />;
          })}
        </g>
        {/* base de la olla: se calienta (inducción) */}
        <path d={`M 333 758 Q 540 ${758 - warp * 60} 747 758 L 747 768 Q 540 ${768 - warp * 60} 333 768 Z`} fill={K.hot} opacity={cl(potHeat) * (0.75 + 0.25 * Math.sin(t * 7))} />
        {/* asas */}
        <rect x={262} y={560} width={70} height={26} rx={12} fill={C.shell2} stroke={C.light} strokeWidth={4} />
        <rect x={748} y={560} width={70} height={26} rx={12} fill={C.shell2} stroke={C.light} strokeWidth={4} />
        <rect x={322} y={528} width={436} height={16} rx={8} fill={C.light} />
        {/* tapa */}
        {lid > 0.01 && <g opacity={lid} transform={`translate(0 ${-40 * (1 - lid)})`}>
          <path d="M 318 528 Q 540 440 762 528 Z" fill={C.shell2} stroke={C.light} strokeWidth={5} />
          <rect x={515} y={452} width={50} height={22} rx={8} fill={C.light} />
        </g>}
        {/* vapor */}
        {boil > 0.3 && Array.from({ length: 5 }).map((_, k) => {
          const u = (t * 0.5 + k / 5) % 1;
          return <circle key={k} cx={400 + k * 70 + 20 * Math.sin(t + k)} cy={(lid > 0.5 ? 470 : 520) - 120 * u} r={12 + 18 * u} fill={K.white} opacity={(boil - 0.3) * 0.7 * (1 - u)} />;
        })}
      </g>
      {/* imán pegado a la base de la olla */}
      {magnet > 0.01 && <g transform={`translate(${880 - 112 * magnet} 690) rotate(90)`} opacity={cl(magnet * 2)}>
        <path d="M -42 0 L -42 -40 A 42 42 0 0 1 42 -40 L 42 0 L 20 0 L 20 -40 A 20 20 0 0 0 -20 -40 L -20 0 Z" fill={K.warn} stroke={C.ink} strokeWidth={4} />
        <rect x={-42} y={0} width={22} height={18} fill={C.metal} stroke={C.ink} strokeWidth={3} />
        <rect x={20} y={0} width={22} height={18} fill={C.metal} stroke={C.ink} strokeWidth={3} />
      </g>}
    </g>
  );
};

// ---------- vidrio normal frente a vitrocerámica (beat 2) ----------
export const Expand: React.FC<{ t: number; heat: number; shock: number }> = ({ t, heat, shock }) => {
  const flame = (x: number) => [-50, 0, 50].map((dx, i) => (
    <path key={i} d={`M ${x + dx} 1000 C ${x + dx - 16} 975, ${x + dx + 16} ${962 + 4 * Math.sin(t * 6 + i)}, ${x + dx} 935`} stroke={K.hot} strokeWidth={9} fill="none" strokeLinecap="round" opacity={heat} />
  ));
  const s = 1 + 0.1 * heat; // el vidrio normal crece (exagerado)
  return (
    <g transform="translate(540 800) scale(1.2) translate(-540 -800)">
      {/* vidrio normal */}
      <g transform={`translate(300 800) scale(${s} ${1 + 0.04 * heat}) translate(-300 -800)`}>
        <rect x={170} y={740} width={260} height={120} rx={10} fill="#7FC8E8" opacity={0.55} stroke={K.white} strokeWidth={5} />
        <rect x={170} y={740} width={260} height={120} rx={10} fill={K.hot} opacity={0.35 * heat} />
      </g>
      {/* flechas de que crece */}
      {[-1, 1].map((d) => <path key={d} d={`M ${300 + d * (150 + 14 * heat)} 800 l ${d * 34 * heat} 0 m ${-d * 14} -14 l ${d * 14} 14 l ${-d * 14} 14`} stroke={K.hot} strokeWidth={6} fill="none" opacity={heat} strokeLinecap="round" />)}
      {/* grieta con el cambio brusco */}
      <path d="M 300 735 L 285 770 L 312 795 L 290 830 L 305 865" stroke={K.warn} strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray="200" strokeDashoffset={200 * (1 - shock)} opacity={shock > 0.01 ? 1 : 0} />
      {/* gotas de agua fría */}
      {shock > 0.01 && [250, 330, 380, 720, 800, 850].map((x, k) => {
        const u = cl(shock * 1.6 - (k % 3) * 0.15);
        return <circle key={k} cx={x} cy={640 + 90 * u} r={10} fill={K.cold} opacity={u < 1 ? 1 : 0.0} />;
      })}
      {/* vitrocerámica: no cambia */}
      <rect x={650} y={740} width={260} height={120} rx={10} fill={C.glass} stroke={K.flow} strokeWidth={5} />
      <rect x={650} y={740} width={260} height={120} rx={10} fill={K.hot} opacity={0.3 * heat} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <polygon key={k} points={hex(680 + (k % 4) * 66, 772 + Math.floor(k / 4) * 56, 12)} fill="#3E6AA0" opacity={0.7} />)}
      {flame(300)}{flame(780)}
      {/* medidas */}
      <line x1={650} y1={900} x2={910} y2={900} stroke={K.flow} strokeWidth={4} />
      <line x1={650} y1={888} x2={650} y2={912} stroke={K.flow} strokeWidth={4} /><line x1={910} y1={888} x2={910} y2={912} stroke={K.flow} strokeWidth={4} />
    </g>
  );
};
const hex = (x: number, y: number, r: number) => [0, 1, 2, 3, 4, 5].map((k) => `${x + r * Math.cos(Math.PI / 3 * k + Math.PI / 6)},${y + r * Math.sin(Math.PI / 3 * k + Math.PI / 6)}`).join(" ");

// ---------- microestructura con lupa (beat 3) ----------
const XT = Array.from({ length: 26 }).map((_, i) => {
  const a = i * 2.399, rr = 255 * Math.sqrt((i + 0.5) / 26);
  return { x: 540 + rr * Math.cos(a), y: 790 + rr * Math.sin(a), r: 26 + (i * 7) % 12, rot: (i * 37) % 60 };
});
export const Micro: React.FC<{ t: number; heat: number; shrink: number; grow: number; balance: number }> = ({ t, heat, shrink, grow, balance }) => (
  <g>
    <defs><clipPath id="lens"><circle cx={540} cy={790} r={290} /></clipPath></defs>
    <circle cx={540} cy={790} r={306} fill="none" stroke={C.light} strokeWidth={18} />
    <rect x={745} y={1000} width={150} height={48} rx={22} fill={C.shell2} stroke={C.light} strokeWidth={5} transform="rotate(45 820 1024)" />
    <g clipPath="url(#lens)">
      <rect x={240} y={490} width={600} height={600} fill="#24456E" />
      <rect x={240} y={490} width={600} height={600} fill={K.hot} opacity={0.22 * heat} />
      {XT.map((c, i) => {
        const s = 1 - 0.22 * shrink * (0.9 + 0.1 * Math.sin(t * 3 + i));
        return <g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.rot}) scale(${s})`}>
          <polygon points={hex(0, 0, c.r)} fill="#AFC6E2" stroke={C.ink} strokeWidth={3} />
          <polygon points={hex(0, 0, c.r * 0.5)} fill="#FFFFFF" opacity={0.25} />
        </g>;
      })}
      {/* el vidrio entre los cristales empuja hacia fuera (naranja) */}
      {grow > 0.01 && XT.filter((_, i) => i % 3 === 1).map((c, i) => {
        const a = Math.atan2(c.y - 790, c.x - 540) + 0.5;
        const L = 26 * grow, x = c.x + 44 * Math.cos(a), y = c.y + 44 * Math.sin(a);
        return <path key={i} d={`M ${x} ${y} l ${L * Math.cos(a)} ${L * Math.sin(a)}`} stroke={K.hot} strokeWidth={7} strokeLinecap="round" opacity={grow} />;
      })}
      {/* los cristales encogen (cian, hacia dentro) */}
      {shrink > 0.01 && XT.filter((_, i) => i % 3 === 0).map((c, i) => [0, 2.1, 4.2].map((a0, j) => {
        const a = a0 + c.rot / 50, R = c.r + 16;
        return <path key={`${i}-${j}`} d={`M ${c.x + R * Math.cos(a)} ${c.y + R * Math.sin(a)} L ${c.x + (R - 12) * Math.cos(a)} ${c.y + (R - 12) * Math.sin(a)}`} stroke={K.cold} strokeWidth={6} strokeLinecap="round" opacity={shrink} />;
      }))}
    </g>
    {/* balanza: el tamaño total no cambia */}
    {balance > 0.01 && <g opacity={balance}>
      <circle cx={540} cy={790} r={290} fill="none" stroke={K.flow} strokeWidth={6} strokeDasharray="18 12" strokeDashoffset={t * 30} />
    </g>}
  </g>
);

// ---------- consumo: barras (beat 10) ----------
export const Bars: React.FC<{ t: number; p: number; range: number }> = ({ t, p, range }) => {
  const y0 = 1030, Hh = 460;
  const hv = Hh * p, hi = Hh * 0.8 * p, lo = Hh * 0.6;
  return (
    <g>
      <line x1={170} y1={y0} x2={910} y2={y0} stroke={C.light} strokeWidth={5} />
      <rect x={250} y={y0 - hv} width={190} height={hv} rx={12} fill={K.hot} />
      <rect x={250} y={y0 - hv} width={190} height={hv} rx={12} fill="#FFFFFF" opacity={0.08 + 0.05 * Math.sin(t * 4)} />
      <rect x={640} y={y0 - hi} width={190} height={hi} rx={12} fill={K.cold} opacity={0.35} />
      <rect x={640} y={y0 - Math.min(hi, lo)} width={190} height={Math.min(hi, lo)} rx={12} fill={K.cold} />
      {/* franja del ahorro: de -20 % a -40 % */}
      <g opacity={range}>
        <line x1={620} y1={y0 - Hh} x2={850} y2={y0 - Hh} stroke={K.white} strokeWidth={4} strokeDasharray="12 10" />
        <rect x={640} y={y0 - Hh} width={190} height={Hh * 0.4} rx={12} fill="none" stroke={K.flow} strokeWidth={6} strokeDasharray="16 10" strokeDashoffset={t * 30} />
      </g>
      {/* rayos de electricidad */}
      {[345, 735].map((x, i) => <path key={i} d={`M ${x + 10} ${y0 + 20} l -22 40 l 20 0 l -16 36 l 36 -48 l -20 0 l 16 -28 Z`} fill={K.flow} opacity={0.9} />)}
    </g>
  );
};

// ---------- reloj (truco de apagar antes) ----------
export const Clock: React.FC<{ x: number; y: number; t: number; o: number; back: number }> = ({ x, y, t, o, back }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={62} fill={C.dark} stroke={K.flow} strokeWidth={7} />
    <line x1={x} y1={y} x2={x} y2={y - 42} stroke={K.white} strokeWidth={7} strokeLinecap="round" transform={`rotate(${-90 * back} ${x} ${y})`} />
    <line x1={x} y1={y} x2={x + 28} y2={y} stroke={K.white} strokeWidth={7} strokeLinecap="round" />
    <path d={`M ${x - 80} ${y - 50} A 95 95 0 0 0 ${x - 95} ${y + 10}`} stroke={K.flow} strokeWidth={6} fill="none" opacity={back} />
  </g>
);

// ---------- rasqueta ----------
export const Scraper: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) => (
  <g opacity={o} transform={`translate(${x} ${y}) rotate(-30)`}>
    <rect x={-70} y={-12} width={140} height={22} rx={3} fill={C.metal} stroke={C.ink} strokeWidth={3} />
    <rect x={-60} y={-60} width={120} height={50} rx={10} fill={C.shell2} stroke={C.light} strokeWidth={4} />
    <rect x={-18} y={-190} width={36} height={135} rx={16} fill={C.shell2} stroke={C.light} strokeWidth={4} />
  </g>
);

// ---------- onda de encendido / apagado (beat 7) ----------
export const OnOff: React.FC<{ t: number; o: number; period: number; duty: number; x0?: number; x1?: number; y?: number }> = ({ t, o, period, duty, x0 = 200, x1 = 880, y = 1040 }) => {
  const n = 90;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const tt = t - (x1 - x) / 260;
    const on = ((tt % period) + period) % period < period * duty;
    d += `${i ? "L" : "M"} ${x.toFixed(1)} ${on ? y - 40 : y + 10} `;
  }
  return (
    <g opacity={o}>
      <rect x={x0 - 30} y={y - 70} width={x1 - x0 + 60} height={110} rx={16} fill="rgba(6,16,31,0.75)" />
      <path d={d} stroke={K.flow} strokeWidth={6} fill="none" strokeLinejoin="round" />
      <circle cx={x1} cy={((t % period) + period) % period < period * duty ? y - 40 : y + 10} r={11} fill={K.hot} />
    </g>
  );
};
