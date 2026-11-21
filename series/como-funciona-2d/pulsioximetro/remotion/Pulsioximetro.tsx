// Dibujos SVG planos del episodio «Cómo funciona un pulsioxímetro» (ESPECIAL HOSPITAL). Sin marcas. Dedo = silueta neutra.
// Código de color: rojo #E53935 = luz roja y sangre esquemática, naranja (discontinuo) = luz infrarroja (invisible),
// cian = oxígeno, amarillo = lo importante (la señal que late, el sensor), grises azulados = carcasa.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = {
  case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#0B1A30", sil: "#2A4E7A", silEdge: "#5A86BE",
  red: "#E53935", ir: "#FF7A1A", deoxy: "#7E2333", deoxyEdge: "#4A1420", bone: "#EFE6CF", boneEdge: "#B8A782",
  vein: "#5B2A55", screen: "#081A2E", nail: "#3D6596",
};

/** Forma del pulso arterial (0-1): subida rápida, bajada lenta con muesca. ~72 latidos/min (solo animación). */
export const pulse = (t: number) => {
  const ph = ((t * 1.2) % 1 + 1) % 1;
  if (ph < 0.14) return Math.sin((ph / 0.14) * Math.PI / 2);
  const d = ph - 0.14;
  return Math.max(0, Math.exp(-d * 4.2) + 0.12 * Math.exp(-Math.pow((d - 0.22) / 0.06, 2)) - 0.03 * d);
};

/** Dedo de perfil mirando a la derecha. Centro local (0,0); base en x = -460, yema en x ≈ 300. tone: color de la silueta. */
export const Finger: React.FC<{ tone?: string; edge?: string; nail?: string; o?: number; swell?: number }> = ({ tone = C.sil, edge = C.silEdge, nail = C.nail, o = 1, swell = 0 }) => {
  const h = 82 + 4 * swell;
  return (
    <g opacity={o}>
      <path d={`M -470 ${-h - 8} L 210 ${-h} C 290 ${-h} 318 -40 318 0 C 318 40 290 ${h} 210 ${h} L -470 ${h + 8} Z`} fill={tone} stroke={edge} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M 150 ${-h + 2} C 200 ${-h - 6} 270 ${-h + 4} 296 -40 L 280 -36 C 256 ${-h + 18} 200 ${-h + 10} 154 ${-h + 14} Z`} fill={nail} stroke={edge} strokeWidth={3} />
      {[-130, -300].map((x) => <path key={x} d={`M ${x} ${-h + 6} q 10 ${h} 0 ${2 * h - 12}`} fill="none" stroke={edge} strokeWidth={3} opacity={0.45} />)}
    </g>
  );
};

/** Pinza del pulsioxímetro alrededor de la yema. open 0-1 levanta la mandíbula de arriba. leds: brillo de los LED. glow: sensor activo. */
export const Clip: React.FC<{ open?: number; leds?: number; sensor?: number; screen?: React.ReactNode; hi?: number; t?: number }> = ({ open = 0, leds = 0, sensor = 0, screen, hi = 0, t = 0 }) => {
  const ang = -28 * open;
  const st = hi > 0.01 ? K.flow : C.case3;
  return (
    <g>
      {/* mandíbula de abajo con el sensor */}
      <rect x={10} y={66} width={340} height={120} rx={46} fill={C.case1} stroke={st} strokeWidth={5} />
      <rect x={150} y={70} width={90} height={22} rx={6} fill={C.dark} stroke={sensor > 0.01 ? K.flow : C.case3} strokeWidth={4} />
      {sensor > 0.01 && <rect x={156} y={74} width={78} height={14} rx={4} fill={K.flow} opacity={sensor * (0.6 + 0.4 * Math.sin(t * 9))} />}
      {/* muelle / bisagra */}
      <rect x={-30} y={-80} width={60} height={160} rx={22} fill={C.case2} stroke={C.case3} strokeWidth={4} />
      {/* mandíbula de arriba con los dos LED y la pantalla */}
      <g transform={`rotate(${ang} 10 -70)`}>
        <rect x={10} y={-206} width={350} height={136} rx={50} fill={C.case2} stroke={st} strokeWidth={5} />
        <rect x={60} y={-188} width={240} height={80} rx={16} fill={C.screen} stroke={C.case3} strokeWidth={3} />
        {screen}
        <rect x={150} y={-90} width={90} height={22} rx={6} fill={C.dark} />
        <circle cx={172} cy={-80} r={11} fill={C.red} opacity={0.35 + 0.65 * leds} style={leds > 0.05 ? { filter: `drop-shadow(0 0 ${14 * leds}px ${C.red})` } : undefined} />
        <circle cx={218} cy={-80} r={11} fill={C.ir} opacity={0.35 + 0.65 * leds} style={leds > 0.05 ? { filter: `drop-shadow(0 0 ${14 * leds}px ${C.ir})` } : undefined} />
      </g>
    </g>
  );
};

/** Pantalla genérica sin cifras: «SpO₂ · %» y corazón que late (en coordenadas de la mandíbula de arriba). */
export const Screen: React.FC<{ t: number; heart?: number; q?: boolean }> = ({ t, heart = 1, q = false }) => (
  <g fontFamily="MontserratSerie" fontWeight={900}>
    <text x={84} y={-136} fontSize={34} fill={K.cold}>{q ? "¿?" : "--"}<tspan fontSize={24}>%</tspan></text>
    <path d="M 0 -6 C -14 -22 -34 -6 0 18 C 34 -6 14 -22 0 -6 Z" transform={`translate(250 -150) scale(${0.9 + 0.35 * pulse(t) * heart})`} fill={C.red} opacity={0.5 + 0.5 * heart} />
  </g>
);

/** Rayos de luz verticales del LED al sensor, atravesando el dedo. red / ir: intensidad 0-1. dim: atenuación al llegar abajo (0-1). */
export const Beams: React.FC<{ red?: number; ir?: number; dimR?: number; dimI?: number; t: number }> = ({ red = 1, ir = 1, dimR = 0.3, dimI = 0.3, t }) => {
  const id = `bm${Math.round(dimR * 100)}${Math.round(dimI * 100)}`;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}r`} x1={0} y1={0} x2={0} y2={1}><stop offset="0" stopColor={C.red} stopOpacity={0.95} /><stop offset="1" stopColor={C.red} stopOpacity={0.95 * (1 - dimR)} /></linearGradient>
        <linearGradient id={`${id}i`} x1={0} y1={0} x2={0} y2={1}><stop offset="0" stopColor={C.ir} stopOpacity={0.95} /><stop offset="1" stopColor={C.ir} stopOpacity={0.95 * (1 - dimI)} /></linearGradient>
      </defs>
      {red > 0.01 && <rect x={164} y={-70} width={16} height={140} rx={6} fill={`url(#${id}r)`} opacity={red} style={{ filter: `drop-shadow(0 0 10px ${C.red})` }} />}
      {ir > 0.01 && Array.from({ length: 6 }).map((_, i) => {
        const y = -70 + ((i * 26 + t * 90) % 140);
        return <rect key={i} x={210} y={y} width={16} height={16} rx={4} fill={C.ir} opacity={ir * (1 - dimI * ((y + 70) / 140))} />;
      })}
    </g>
  );
};

/** Pinza + dedo listos para colocar en (x, y) con escala s. La yema queda en x ≈ x + 180 s. */
export const Oximeter: React.FC<{ x: number; y: number; s?: number; t: number; open?: number; leds?: number; beams?: number; sensor?: number; heart?: number; q?: boolean; tone?: string; edge?: string; nail?: string; dimR?: number; dimI?: number; hi?: number; artery?: number }> =
  ({ x, y, s = 1, t, open = 0, leds = 0, beams = 0, sensor = 0, heart = 0, q = false, tone, edge, nail, dimR = 0.3, dimI = 0.3, hi = 0, artery = 0 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Finger tone={tone} edge={edge} nail={nail} swell={artery * pulse(t)} />
      {artery > 0.01 && <path d="M -460 30 L 250 22" stroke={C.red} strokeWidth={10 + 8 * pulse(t)} strokeLinecap="round" opacity={0.75 * artery} />}
      {beams > 0.01 && <g opacity={beams}><Beams t={t} dimR={dimR + 0.15 * pulse(t) * artery} dimI={dimI + 0.15 * pulse(t) * artery} /></g>}
      <Clip open={open} leds={leds} sensor={sensor} t={t} hi={hi} screen={<Screen t={t} heart={heart} q={q} />} />
    </g>
  );

/** Glóbulo rojo esquemático. oxy 1 = con oxígeno (rojo vivo + bolitas cian de O₂), 0 = sin oxígeno (granate). */
export const Cell: React.FC<{ x: number; y: number; r?: number; oxy: number; t: number; o?: number }> = ({ x, y, r = 110, oxy, t, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={r} ry={r * 0.82} fill={oxy > 0.5 ? C.red : C.deoxy} stroke={oxy > 0.5 ? "#FF8A80" : C.deoxyEdge} strokeWidth={6} />
    <ellipse cx={0} cy={0} rx={r * 0.48} ry={r * 0.36} fill={oxy > 0.5 ? "#C62828" : "#5E1826"} />
    {oxy > 0.5 && [0, 1, 2, 3].map((i) => {
      const a = i * Math.PI / 2 + t * 0.8;
      return (
        <g key={i} transform={`translate(${Math.cos(a) * r * 0.72} ${Math.sin(a) * r * 0.6})`}>
          <circle cx={-9} cy={0} r={12} fill={K.cold} /><circle cx={9} cy={0} r={12} fill={K.cold} />
        </g>
      );
    })}
  </g>
);

/** Rayo de luz vertical de y0 a y1 en x. pass 0-1: cuánto sigue después de yCut (0 = se lo traga). ir: discontinuo naranja. */
export const Ray: React.FC<{ x: number; y0: number; yCut: number; y1: number; ir?: boolean; pass: number; o?: number; t: number }> = ({ x, y0, yCut, y1, ir = false, pass, o = 1, t }) => {
  const col = ir ? C.ir : C.red;
  const seg = (a: number, b: number, op: number) => ir
    ? Array.from({ length: Math.max(1, Math.floor((b - a) / 30)) }).map((_, i) => { const yy = a + ((i * 30 + t * 80) % (b - a)); return <rect key={`${a}${i}`} x={x - 9} y={yy} width={18} height={16} rx={4} fill={col} opacity={op} />; })
    : <rect x={x - 9} y={a} width={18} height={b - a} rx={6} fill={col} opacity={op} style={{ filter: `drop-shadow(0 0 10px ${col})` }} />;
  return (
    <g opacity={o}>
      {seg(y0, yCut, 0.95)}
      {pass > 0.02 && seg(yCut, yCut + (y1 - yCut) * pass, 0.95 * pass)}
      {pass < 0.5 && <circle cx={x} cy={yCut} r={16 * (1 - pass)} fill={col} opacity={0.5} />}
    </g>
  );
};

/** Onda del pulso que avanza de izquierda a derecha entre x0 y x1, centrada en y (amplitud amp). */
export const Wave: React.FC<{ x0: number; x1: number; y: number; amp: number; t: number; color?: string; w?: number; o?: number; noise?: number; dash?: boolean; base?: number }> =
  ({ x0, x1, y, amp, t, color = K.flow, w = 8, o = 1, noise = 0, dash = false, base = 0 }) => {
    const n = 90;
    const pts = Array.from({ length: n + 1 }).map((_, i) => {
      const x = x0 + (x1 - x0) * (i / n);
      const tt = t - (x1 - x) / 260;
      const v = pulse(tt) + noise * 0.25 * Math.sin(tt * 37);
      return `${x.toFixed(1)},${(y - amp * v + base * (i / n)).toFixed(1)}`;
    });
    return <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" opacity={o} strokeDasharray={dash ? "18 12" : undefined} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />;
  };

/** Corte transversal del dedo: piel, hueso, venas (fijas) y arterias (laten). still: atenúa lo que no late. hiArt: resalta arterias. */
export const Section: React.FC<{ x: number; y: number; s?: number; t: number; still?: number; hiArt?: number }> = ({ x, y, s = 1, t, still = 0, hiArt = 0 }) => {
  const p = pulse(t);
  const fo = 1 - 0.55 * still;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={0} r={200} fill={C.sil} stroke={C.silEdge} strokeWidth={8} opacity={fo} />
      <ellipse cx={0} cy={-10} rx={78} ry={66} fill={C.bone} stroke={C.boneEdge} strokeWidth={5} opacity={fo} />
      {[[-120, 90], [120, 90], [0, 150]].map(([cx, cy], i) => <ellipse key={i} cx={cx} cy={cy} rx={22} ry={16} fill={C.vein} stroke="#3A1838" strokeWidth={3} opacity={fo} />)}
      {[[-130, -40], [130, -40]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={20 + 9 * p} fill={C.red} stroke={hiArt > 0.01 ? K.flow : "#FF8A80"} strokeWidth={4 + 3 * hiArt}
          style={{ filter: `drop-shadow(0 0 ${6 + 12 * hiArt * p}px ${hiArt > 0.01 ? K.flow : C.red})` }} />
      ))}
    </g>
  );
};

/** Barra apilada: lo que no late (gris, fijo) + lo que late (rojo/amarillo, sube y baja). */
export const Stack: React.FC<{ x: number; y: number; h?: number; t: number; hi?: number }> = ({ x, y, h = 420, t, hi = 0 }) => {
  const p = pulse(t);
  const ac = 40 + 40 * p;
  return (
    <g>
      <rect x={x - 70} y={y - h} width={140} height={h} rx={14} fill={C.case1} stroke={C.case3} strokeWidth={4} />
      <rect x={x - 70} y={y - h - ac} width={140} height={ac + 10} rx={14} fill={hi > 0.01 ? K.flow : C.red} opacity={0.9} style={{ filter: `drop-shadow(0 0 ${10 * hi}px ${K.flow})` }} />
    </g>
  );
};

/** Tabla de calibración esquemática: cociente → porcentaje (sin cifras de valores). */
export const Table: React.FC<{ x: number; y: number; t: number; hiRow?: number; o?: number }> = ({ x, y, t, hiRow = 0, o = 1 }) => {
  const row = Math.floor((t * 1.5) % 5);
  return (
    <g transform={`translate(${x} ${y})`} opacity={o}>
      <rect x={-130} y={-150} width={260} height={300} rx={18} fill={C.dark} stroke={C.case3} strokeWidth={4} />
      <line x1={0} y1={-130} x2={0} y2={130} stroke={C.case1} strokeWidth={4} />
      {Array.from({ length: 5 }).map((_, i) => (
        <g key={i}>
          <rect x={-114} y={-128 + i * 52} width={228} height={40} rx={8} fill={hiRow > 0.01 && i === row ? K.flow : C.case1} opacity={hiRow > 0.01 && i === row ? 0.85 : 0.7} />
          <rect x={-96} y={-114 + i * 52} width={70} height={12} rx={6} fill={C.case3} opacity={0.7} />
          <rect x={26} y={-114 + i * 52} width={56} height={12} rx={6} fill={C.case3} opacity={0.7} />
        </g>
      ))}
    </g>
  );
};

/** Silueta neutra (cabeza + hombros). */
export const Person: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={-120} r={62} fill={C.sil} stroke={C.silEdge} strokeWidth={5} />
    <path d="M -120 60 C -120 -30 -70 -50 0 -50 C 70 -50 120 -30 120 60 Z" fill={C.sil} stroke={C.silEdge} strokeWidth={5} />
  </g>
);

/** Copo de nieve (frío). */
export const Snow: React.FC<{ x: number; y: number; r?: number; o?: number; rot?: number }> = ({ x, y, r = 46, o = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o} stroke={K.cold} strokeWidth={8} strokeLinecap="round">
    {[0, 60, 120].map((a) => <g key={a} transform={`rotate(${a})`}><line x1={0} y1={-r} x2={0} y2={r} /><path d={`M -12 ${-r + 14} L 0 ${-r + 26} L 12 ${-r + 14} M -12 ${r - 14} L 0 ${r - 26} L 12 ${r - 14}`} fill="none" /></g>)}
  </g>
);

/** Rayitas de movimiento. */
export const Motion: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => (
  <g opacity={o} stroke={K.white} strokeWidth={7} strokeLinecap="round">
    {[-30, 0, 30].map((d, i) => <line key={i} x1={x - 40 - 12 * i} y1={y + d} x2={x + 10 - 12 * i} y2={y + d} />)}
  </g>
);

/** Espectro: eje de longitudes de onda con zona visible (arcoíris) y zona infrarroja invisible. */
export const Spectrum: React.FC<{ x0: number; x1: number; y: number; red: number; ir: number; t: number }> = ({ x0, x1, y, red, ir, t }) => {
  const nm = (v: number) => x0 + (x1 - x0) * ((v - 400) / 600); // 400-1000 nm
  return (
    <g>
      <defs>
        <linearGradient id="spec" x1={0} y1={0} x2={1} y2={0}>
          {["#7B3FE4", "#3D6BFF", "#35C4F0", "#4CD964", "#FFD23F", "#FF7A1A", "#E53935"].map((c, i) => <stop key={i} offset={i / 6} stopColor={c} />)}
        </linearGradient>
      </defs>
      <rect x={x0} y={y - 40} width={nm(700) - x0} height={80} rx={12} fill="url(#spec)" />
      <rect x={nm(700)} y={y - 40} width={x1 - nm(700)} height={80} rx={12} fill={C.case1} stroke={C.case2} strokeWidth={3} strokeDasharray="14 10" />
      <line x1={nm(660)} y1={y - 90} x2={nm(660)} y2={y + 90} stroke={C.red} strokeWidth={10} opacity={0.3 + 0.7 * red} style={{ filter: `drop-shadow(0 0 ${12 * red}px ${C.red})` }} />
      <line x1={nm(940)} y1={y - 90} x2={nm(940)} y2={y + 90} stroke={C.ir} strokeWidth={10} strokeDasharray="16 10" strokeDashoffset={-t * 40} opacity={0.3 + 0.7 * ir} style={{ filter: `drop-shadow(0 0 ${12 * ir}px ${C.ir})` }} />
    </g>
  );
};
