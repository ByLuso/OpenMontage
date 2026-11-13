// Dibujos SVG planos del episodio «Cómo funciona un concentrador de oxígeno». Sin marcas. Personas como siluetas neutras.
// Código de color: cian = aire / oxígeno, gris azulado = nitrógeno, amarillo = lo importante, naranja = energía / fuego, rojo = peligro.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = {
  case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#0B1A30", sil: "#1C3557", silEdge: "#4A73A8",
  n2: "#9FB3CC", o2: K.cold, pellet: "#D8CBA8", pelletEdge: "#A8987A", dust: "#8C7B62",
};

/** Molécula de dos átomos (N₂ gris o O₂ cian) centrada en (x, y). */
export const Mol: React.FC<{ x: number; y: number; kind: "n2" | "o2"; r?: number; o?: number; rot?: number }> = ({ x, y, kind, r = 12, o = 1, rot = 0 }) => {
  if (o <= 0.01) return null;
  const col = kind === "n2" ? C.n2 : C.o2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
      <circle cx={-r * 0.72} cy={0} r={r} fill={col} stroke={C.dark} strokeWidth={2} />
      <circle cx={r * 0.72} cy={0} r={r} fill={col} stroke={C.dark} strokeWidth={2} />
    </g>
  );
};

/** Pseudoaleatorio determinista. */
export const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Nube de aire: n moléculas en el rectángulo, ~78 % N₂ y ~21 % O₂, que tiemblan. nOut: 0-1, el nitrógeno se va (sube y se desvanece). */
export const AirBox: React.FC<{ x0: number; y0: number; w: number; h: number; t: number; n?: number; nOut?: number; o2Hi?: number }> = ({ x0, y0, w, h, t, n = 40, nOut = 0, o2Hi = 0 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const kind = i % 5 === 2 ? "o2" : "n2"; // 1 de cada 5 = 20 % (aprox. 21 %)
      const x = x0 + 30 + rnd(i) * (w - 60) + 10 * Math.sin(t * 2 + i);
      const y = y0 + 30 + rnd(i + 50) * (h - 60) + 10 * Math.cos(t * 1.7 + i * 1.3);
      const leave = kind === "n2" ? nOut : 0;
      return <Mol key={i} x={x + leave * (rnd(i + 9) - 0.5) * 300} y={y - leave * 260} kind={kind} r={kind === "o2" ? 13 + 3 * o2Hi : 12} o={1 - leave} rot={(i * 47 + t * 40) % 360} />;
    })}
  </g>
);

/** Columna (tamiz) de zeolita: cilindro con bolitas. mode: "filter" (entra aire abajo, sube O₂, se queda N₂), "purge" (el N₂ sale por abajo), "idle". */
export const Column: React.FC<{ x: number; y: number; w?: number; h?: number; t: number; mode?: "filter" | "purge" | "idle"; hi?: number; o?: number; flowO?: number }> =
  ({ x, y, w = 150, h = 520, t, mode = "idle", hi = 0, o = 1, flowO = 1 }) => {
    const cols = Math.max(2, Math.floor((w - 20) / 30));
    const rows = Math.floor((h - 60) / 30);
    const id = `col${Math.round(x)}${Math.round(y)}`;
    return (
      <g opacity={o}>
        <clipPath id={id}><rect x={x - w / 2} y={y} width={w} height={h} rx={w / 2.6} /></clipPath>
        <rect x={x - w / 2} y={y} width={w} height={h} rx={w / 2.6} fill={C.dark} stroke={hi > 0.01 ? K.flow : C.case3} strokeWidth={6 + 4 * hi} />
        <g clipPath={`url(#${id})`}>
          {Array.from({ length: rows * cols }).map((_, k) => {
            const r = Math.floor(k / cols), c = k % cols;
            return <circle key={k} cx={x - ((cols - 1) * 30) / 2 + c * 30 + (r % 2 ? 7 : -7)} cy={y + 40 + r * 30} r={11} fill={C.pellet} stroke={C.pelletEdge} strokeWidth={2} opacity={0.75} />;
          })}
          {mode === "filter" && flowO > 0.01 && (
            <g opacity={flowO}>
              {/* O₂ que sube y sale por arriba */}
              {[0, 1, 2, 3, 4].map((i) => { const u = (t * 0.45 + i / 5) % 1; return <Mol key={i} x={x + (i % 2 ? 22 : -22) * Math.sin(u * 9 + i)} y={y + h - 10 - (h + 20) * u} kind="o2" r={11} rot={u * 300} />; })}
              {/* N₂ atrapado: se queda pegado a distintas alturas */}
              {[0, 1, 2, 3, 4, 5, 6].map((i) => { const u = Math.min(1, ((t * 0.45 + i / 7) % 1) * 2.2); const stop = 0.25 + 0.6 * rnd(i + 3); const k = Math.min(u, stop); return <Mol key={"n" + i} x={x - w / 2 + 28 + rnd(i) * (w - 56)} y={y + h - 10 - h * k} kind="n2" r={11} o={0.9} rot={i * 40} />; })}
            </g>
          )}
          {mode === "purge" && flowO > 0.01 && (
            <g opacity={flowO}>
              {[0, 1, 2, 3, 4, 5].map((i) => { const u = (t * 0.6 + i / 6) % 1; return <Mol key={i} x={x - w / 2 + 28 + rnd(i + 20) * (w - 56)} y={y + 60 + (h - 30) * u} kind="n2" r={11} o={Math.sin(Math.PI * u)} rot={u * 200 + i * 30} />; })}
            </g>
          )}
        </g>
      </g>
    );
  };

/** Compresor: cilindro con pistón que sube y baja y volante que gira. Centro en (x, y). */
export const Compressor: React.FC<{ x: number; y: number; s?: number; t: number; on?: number; hi?: number }> = ({ x, y, s = 1, t, on = 1, hi = 0 }) => {
  const a = t * 9 * on;
  const py = -40 + 26 * Math.sin(a);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-90} y={-150} width={180} height={190} rx={18} fill={C.case1} stroke={hi > 0.01 ? K.flow : C.case3} strokeWidth={6} />
      <rect x={-70} y={-130} width={140} height={150} rx={8} fill={C.dark} />
      {/* aire comprimido encima del pistón */}
      <rect x={-66} y={-126} width={132} height={Math.max(4, py + 96)} fill={K.cold} opacity={0.15 + 0.25 * (1 - (py + 66) / 52)} />
      <rect x={-66} y={py - 30} width={132} height={40} rx={6} fill={C.case3} />
      <line x1={0} y1={py + 10} x2={60 * Math.cos(a) * 0.6} y2={90 + 30 * Math.sin(a)} stroke={C.case3} strokeWidth={14} strokeLinecap="round" />
      <circle cx={0} cy={90} r={60} fill={C.case2} stroke={C.case3} strokeWidth={6} />
      <line x1={0} y1={90} x2={50 * Math.cos(a)} y2={90 + 50 * Math.sin(a)} stroke={K.hot} strokeWidth={10} strokeLinecap="round" />
      <circle cx={0} cy={90} r={10} fill={K.hot} />
    </g>
  );
};

/** Filtro de entrada: rejilla. El polvo se queda fuera. Centro (x, y). */
export const Filter: React.FC<{ x: number; y: number; w?: number; h?: number; t: number; hi?: number }> = ({ x, y, w = 70, h = 360, t, hi = 0 }) => (
  <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={14} fill={C.case1} stroke={hi > 0.01 ? K.flow : C.case3} strokeWidth={6} />
    {Array.from({ length: Math.floor(h / 24) }).map((_, i) => <line key={i} x1={x - w / 2 + 8} y1={y - h / 2 + 14 + i * 24} x2={x + w / 2 - 8} y2={y - h / 2 + 14 + i * 24} stroke={C.case3} strokeWidth={4} opacity={0.6} />)}
    {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={x + w / 2 + 10 + 6 * Math.sin(t * 3 + i)} cy={y - h / 2 + 40 + i * (h - 80) / 5} r={8} fill={C.dust} />)}
  </g>
);

/** Bombona (cilindro de gas) esquemática; ghost = discontinua, transparente. */
export const Tank: React.FC<{ x: number; y: number; s?: number; o?: number; ghost?: boolean; cross?: number }> = ({ x, y, s = 1, o = 1, ghost = false, cross = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-70} y={-200} width={140} height={400} rx={60} fill={ghost ? "rgba(6,16,31,0.55)" : C.case2} stroke={ghost ? K.white : C.case3} strokeWidth={ghost ? 9 : 6} strokeDasharray={ghost ? "22 12" : "none"} opacity={1} />
    {ghost && <text x={0} y={30} textAnchor="middle" fontSize={110} fontWeight={900} fill={K.white} fontFamily="MontserratSerie" opacity={cross > 0.01 ? 0 : 0.9}>?</text>}
    <rect x={-25} y={-250} width={50} height={52} rx={8} fill={ghost ? "none" : C.case3} stroke={K.white} strokeWidth={ghost ? 5 : 0} strokeDasharray={ghost ? "10 8" : "none"} />
    {!ghost && <rect x={-70} y={-120} width={140} height={40} fill={K.white} opacity={0.85} />}
    {cross > 0.01 && (
      <g stroke={K.warn} strokeWidth={22} strokeLinecap="round" opacity={cross}>
        <line x1={-110} y1={-160} x2={-110 + 220 * cross} y2={-160 + 320 * cross} />
        <line x1={110} y1={-160} x2={110 - 220 * cross} y2={-160 + 320 * cross} />
      </g>
    )}
  </g>
);

/** Caudalímetro: tubo transparente con escala 0-5 y bolita flotando. Centro (x, y), alto h. */
export const Flowmeter: React.FC<{ x: number; y: number; h?: number; lpm: number; t: number; s?: number; marks?: boolean }> = ({ x, y, h = 300, lpm, t, s = 1, marks = true }) => {
  const by = h / 2 - 30 - (lpm / 5) * (h - 60) + 3 * Math.sin(t * 7);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-40} y={-h / 2} width={80} height={h} rx={40} fill={C.dark} stroke={C.case3} strokeWidth={6} />
      {marks && [0, 1, 2, 3, 4, 5].map((k) => { const yy = h / 2 - 30 - (k / 5) * (h - 60); return <g key={k}><line x1={-40} y1={yy} x2={-18} y2={yy} stroke={C.case3} strokeWidth={4} /><text x={-56} y={yy + 10} textAnchor="end" fontSize={28} fontWeight={800} fill={C.case3} fontFamily="MontserratSerie">{k}</text></g>; })}
      <circle cx={0} cy={by} r={24} fill={K.flow} style={{ filter: `drop-shadow(0 0 8px ${K.flow})` }} />
    </g>
  );
};

/** Concentrador de sobremesa con ruedas, centrado en (x, y). open 0-1: la tapa frontal se separa y deja ver las dos columnas, el compresor y el filtro.
 *  phase: columna que filtra (0 = izquierda, 1 = derecha). hi: pieza resaltada. */
export const Concentrator: React.FC<{ x: number; y: number; s?: number; t: number; open?: number; phase?: number; hi?: "filter" | "comp" | "cols" | "valve" | "out" | "none"; on?: number; ghost?: number; lpm?: number }> =
  ({ x, y, s = 1, t, open = 0, phase = 0, hi = "none", on = 1, ghost = 0, lpm = 2 }) => {
    const H = (k: string) => (hi === k ? 1 : 0);
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {/* ruedas */}
        {[-170, 170].map((dx) => <circle key={dx} cx={dx} cy={360} r={30} fill={C.dark} stroke={C.case3} strokeWidth={6} />)}
        {/* carcasa e interior */}
        <rect x={-240} y={-350} width={480} height={700} rx={50} fill={C.case1} stroke={C.case2} strokeWidth={10} />
        <rect x={-215} y={-325} width={430} height={650} rx={34} fill={C.dark} />
        {/* rejilla lateral de entrada */}
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={232} y={-250 + i * 26} width={22} height={12} rx={6} fill={C.case3} />)}
        {/* interior */}
        <Filter x={175} y={-170} w={44} h={210} t={t} hi={H("filter")} />
        <Column x={-110} y={-300} w={110} h={400} t={t} mode={on > 0.5 ? (phase < 0.5 ? "filter" : "purge") : "idle"} hi={H("cols") * (phase < 0.5 ? 1 : 0.3)} />
        <Column x={40} y={-300} w={110} h={400} t={t} mode={on > 0.5 ? (phase < 0.5 ? "purge" : "filter") : "idle"} hi={H("cols") * (phase < 0.5 ? 0.3 : 1)} />
        {/* válvula */}
        <rect x={-170} y={115} width={270} height={36} rx={14} fill={C.case2} stroke={hi === "valve" ? K.flow : C.case3} strokeWidth={6} />
        <circle cx={-110 + 150 * phase} cy={133} r={12} fill={K.flow} />
        {/* compresor */}
        <Compressor x={-40} y={240} s={0.55} t={t} on={on} hi={H("comp")} />
        <path d="M 175 -60 L 175 240 L 20 240" fill="none" stroke={C.case3} strokeWidth={10} opacity={0.6} />
        {/* salida de oxígeno */}
        <path d="M -110 -300 L -110 -315 L 120 -315 L 120 -300" fill="none" stroke={K.cold} strokeWidth={8} opacity={0.8} />
        {/* tapa frontal: se separa en dos mitades */}
        {open < 0.999 && (
          <g opacity={1 - open * 0.85}>
            <g transform={`translate(${-open * 300} 0)`}>
              <path d="M -215 -325 L 0 -325 L 0 325 L -215 325 Q -215 -325 -215 -325 Z" fill={C.case2} stroke={C.case3} strokeWidth={4} />
            </g>
            <g transform={`translate(${open * 300} 0)`}>
              <path d="M 0 -325 L 215 -325 L 215 325 L 0 325 Z" fill={C.case2} stroke={C.case3} strokeWidth={4} />
            </g>
            <g transform={`translate(${-open * 300} 0)`}>
              {/* caudalímetro y mando en la mitad izquierda */}
              <Flowmeter x={-110} y={-140} h={260} lpm={lpm} t={t} s={0.9} marks={false} />
              <circle cx={-110} cy={60} r={34} fill={C.case1} stroke={C.case3} strokeWidth={5} />
              <line x1={-110} y1={60} x2={-110 + 22 * Math.cos(-1.2)} y2={60 + 22 * Math.sin(-1.2)} stroke={K.white} strokeWidth={6} strokeLinecap="round" />
            </g>
            <g transform={`translate(${open * 300} 0)`}>
              {/* interruptor, piloto y salida */}
              <rect x={60} y={-250} width={100} height={60} rx={12} fill={C.case1} stroke={C.case3} strokeWidth={4} />
              <circle cx={110} cy={-150} r={14} fill={on > 0.5 ? "#3DDC6B" : C.dark} />
              <circle cx={110} cy={20} r={26} fill={C.dark} stroke={hi === "out" ? K.flow : C.case3} strokeWidth={6} />
              {[0, 1, 2, 3].map((i) => <rect key={i} x={50} y={150 + i * 34} width={120} height={14} rx={7} fill={C.case1} />)}
            </g>
          </g>
        )}
        {/* bombona fantasma (lo que «todos creen»), como en rayos X; se tacha al abrir */}
        {ghost > 0.01 && <Tank x={-30} y={-20} s={0.95} ghost o={ghost} cross={ramp01(open * 1.6 - 0.2)} />}
      </g>
    );
  };
const ramp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Gafas nasales: tubo cian desde (x0, y0) hasta la nariz de una silueta neutra de perfil centrada en (x, y). */
export const Profile: React.FC<{ x: number; y: number; s?: number; o?: number; t: number; puff?: number }> = ({ x, y, s = 1, o = 1, t, puff = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    {/* cabeza de perfil mirando a la izquierda */}
    <path d="M 40 -150 C 130 -150 160 -80 150 0 C 145 50 120 80 110 110 L 110 170 L -20 170 L -20 120 C -40 110 -60 95 -60 70 L -60 40 L -85 30 L -60 0 C -70 -90 -30 -150 40 -150 Z" fill={C.sil} stroke={C.silEdge} strokeWidth={6} />
    <path d="M -130 170 Q -60 140 0 160 L 200 160 Q 260 180 270 260 L 270 330 L -160 330 L -160 260 Q -160 190 -130 170 Z" fill={C.sil} stroke={C.silEdge} strokeWidth={6} />
    {/* gafas nasales: tubo por encima de la oreja hasta la nariz */}
    <path d="M -72 22 C -40 30 40 30 80 0 C 110 -20 120 20 100 60 C 80 110 60 180 40 330" fill="none" stroke={K.cold} strokeWidth={9} strokeLinecap="round" opacity={0.9} />
    {puff > 0.01 && [0, 1, 2].map((i) => <circle key={i} cx={-90 - i * 18 * puff} cy={22 + (i - 1) * 12 * puff} r={7 - i} fill={K.cold} opacity={puff * (1 - i * 0.25)} />)}
    {void t}
  </g>
);

/** Concentrador portátil (bolso con asa) con batería. charge 0-1. */
export const Portable: React.FC<{ x: number; y: number; s?: number; t: number; charge?: number; o?: number }> = ({ x, y, s = 1, t, charge = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -120 -110 C -120 -260 120 -260 120 -110" fill="none" stroke={C.case3} strokeWidth={16} strokeLinecap="round" />
    <rect x={-150} y={-120} width={300} height={260} rx={40} fill={C.case1} stroke={C.case2} strokeWidth={8} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-120} y={-80 + i * 26} width={110} height={12} rx={6} fill={C.case2} />)}
    {/* batería */}
    <rect x={20} y={-80} width={100} height={170} rx={14} fill={C.dark} stroke={K.flow} strokeWidth={5} />
    <rect x={50} y={-96} width={40} height={18} rx={5} fill={K.flow} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={32} y={60 - i * 38} width={76} height={28} rx={5} fill={K.flow} opacity={charge * 4 > i ? 0.95 : 0.12} />)}
    <circle cx={-65} cy={70} r={20} fill={C.dark} stroke={C.case3} strokeWidth={5} />
    {void t}
  </g>
);

/** Silueta neutra de pie (cabeza + cuerpo). Centro de la cabeza en (x, y). */
export const Person: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={0} r={70} fill={C.sil} stroke={C.silEdge} strokeWidth={6} />
    <path d="M-55 95 Q 0 78 55 95 L 135 140 Q 170 160 170 215 L 170 560 L -170 560 L -170 215 Q -170 160 -135 140 Z" fill={C.sil} stroke={C.silEdge} strokeWidth={6} />
  </g>
);

/** Retícula de zeolita ampliada: jaulas hexagonales con poros; el N₂ se queda dentro, el O₂ pasa de largo. */
export const Lattice: React.FC<{ x: number; y: number; s?: number; t: number; trap?: number }> = ({ x, y, s = 1, t, trap = 1 }) => {
  const cells: [number, number][] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) cells.push([c * 200 + (r % 2) * 100 - 300, r * 172 - 172]);
  const hex = (r: number) => Array.from({ length: 6 }).map((_, k) => { const a = Math.PI / 6 + (k * Math.PI) / 3; return `${r * Math.cos(a)},${r * Math.sin(a)}`; }).join(" ");
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {cells.map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          <polygon points={hex(100)} fill={C.pellet} opacity={0.18} stroke={C.pellet} strokeWidth={14} strokeLinejoin="round" />
          <polygon points={hex(58)} fill={C.dark} stroke={C.pelletEdge} strokeWidth={4} />
          <Mol x={6 * Math.sin(t * 3 + i)} y={6 * Math.cos(t * 2.5 + i)} kind="n2" r={14} o={trap * (i % 3 === 1 ? 0 : 1)} rot={t * 30 + i * 50} />
        </g>
      ))}
      {[0, 1, 2].map((i) => { const u = (t * 0.35 + i / 3) % 1; return <Mol key={"o" + i} x={-420 + 840 * u} y={-86 + (i - 1) * 172} kind="o2" r={14} o={Math.sin(Math.PI * u)} rot={u * 360} />; })}
    </g>
  );
};

/** Llama esquemática; boost 0-1 la hace crecer y avivarse. */
export const Flame: React.FC<{ x: number; y: number; s?: number; t: number; boost?: number }> = ({ x, y, s = 1, t, boost = 0 }) => {
  const k = 1 + 0.6 * boost; const w = 1 + 0.05 * Math.sin(t * 13) + 0.04 * Math.sin(t * 21);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`scale(${w} ${k * (1 + 0.06 * Math.sin(t * 9))})`}>
        <path d="M 0 0 C -90 0 -110 -80 -70 -150 C -50 -190 -20 -220 0 -300 C 30 -230 110 -170 90 -80 C 80 -30 50 0 0 0 Z" fill={K.hot} style={{ filter: `drop-shadow(0 0 ${14 + 20 * boost}px ${K.hot})` }} />
        <path d="M 0 0 C -45 0 -55 -50 -30 -90 C -15 -115 0 -140 0 -170 C 20 -130 55 -100 45 -50 C 40 -20 25 0 0 0 Z" fill={K.flow} />
      </g>
      <rect x={-70} y={0} width={140} height={34} rx={12} fill={C.case2} />
    </g>
  );
};

/** Señal de prohibido fumar. */
export const NoSmoke: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={0} r={110} fill={K.white} />
    <rect x={-70} y={-12} width={110} height={26} fill={C.case1} />
    <rect x={40} y={-12} width={28} height={26} fill={K.hot} />
    <path d="M 50 -30 C 40 -60 70 -70 60 -100" fill="none" stroke={C.case3} strokeWidth={6} />
    <circle cx={0} cy={0} r={100} fill="none" stroke={K.warn} strokeWidth={22} />
    <line x1={-70} y1={-70} x2={70} y2={70} stroke={K.warn} strokeWidth={22} />
  </g>
);

/** Ondas de «pssst» (escape de aire) en (x, y). p: 0-1 dentro del soplido. */
export const Hiss: React.FC<{ x: number; y: number; p: number; dir?: 1 | -1; s?: number }> = ({ x, y, p, dir = 1, s = 1 }) => p <= 0.01 || p >= 0.99 ? null : (
  <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`} opacity={Math.sin(Math.PI * p)}>
    {[0, 1, 2].map((i) => <path key={i} d={`M ${20 + i * 30 + 60 * p} ${-30 - i * 10} q 20 ${30 + i * 10} 0 ${60 + i * 20}`} fill="none" stroke={K.white} strokeWidth={6} strokeLinecap="round" />)}
  </g>
);
