// Dibujos SVG del episodio «Cómo funciona un reloj de cuarzo (el de pila)». Coordenadas absolutas de 1080×1920.
// Colores de código: amarillo = lo importante/corriente/pulsos, naranja = energía/calor, cian = cuarzo/frío/ondas,
// blanco = texto, rojo = error. Grises azulados para carcasas. Sin marcas: reloj, pila y chip genéricos.
import React from "react";
import { K, clamp01, smooth } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F", inner: "#0B1A30", plate: "#16304F",
  dial: "#E8EEF6", copper: "#D9823B", copper2: "#A85E22", silver: "#C9D6E6", silver2: "#8FA3BC", quartz: "#BFE9F7", gold: "#E0B84A", wood: "#6B4A2E" };

/** Ángulo (grados) de la aguja de segundos que salta una vez por segundo (salto rápido de 0,08 s). */
export const tickAngle = (t: number, phase = 0) => { const u = t + phase; const k = Math.floor(u); return 6 * (k + smooth((u - k) / 0.08)); };
/** Destello de cada pulso (1 → 0 en 0,3 s tras cada segundo entero). */
export const pulseAt = (t: number) => { const f = t - Math.floor(t); return f < 0.3 ? 1 - f / 0.3 : 0; };
export const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Onda senoidal entre x0 y x1 (amplitud a, fase ph, número de onda k). */
export const wave = (x0: number, x1: number, y: number, a: number, ph: number, k = 0.035) =>
  Array.from({ length: 121 }).map((_, i) => { const x = x0 + ((x1 - x0) * i) / 120; return `${i ? "L" : "M"}${x.toFixed(1)},${(y + a * Math.sin(x * k + ph)).toFixed(1)}`; }).join(" ");

/** Línea de flujo animada (trazo discontinuo que avanza). */
export const Flow: React.FC<{ d: string; t: number; color?: string; w?: number; o?: number; speed?: number }> = ({ d, t, color = K.flow, w = 10, o = 1, speed = 160 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    <path d={d} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={w + 8} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="22 18" strokeDashoffset={-t * speed} />
  </g>
);

/** Rueda dentada. */
export const Gear: React.FC<{ x: number; y: number; r: number; n?: number; rot?: number; color?: string; o?: number }> = ({ x, y, r, n = 12, rot = 0, color = C.gold, o = 1 }) => {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a0 = (Math.PI * i) / n, a1 = (Math.PI * (i + 1)) / n, rr = i % 2 ? r * 0.82 : r;
    pts.push(`${(rr * Math.cos(a0)).toFixed(1)},${(rr * Math.sin(a0)).toFixed(1)} ${(rr * Math.cos(a1)).toFixed(1)},${(rr * Math.sin(a1)).toFixed(1)}`);
  }
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}>
      <polygon points={pts.join(" ")} fill={color} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      <circle r={r * 0.45} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
      <circle r={r * 0.14} fill={C.ink} />
    </g>
  );
};

/** Diapasón de cuarzo (local: base abajo en y 120..220, puntas arriba en y −220). `bend` y `vib` separan las puntas. */
export const Fork: React.FC<{ x: number; y: number; s?: number; bend?: number; vib?: number; glow?: number; can?: number; charges?: number; o?: number }> =
  ({ x, y, s = 1, bend = 0, vib = 0, glow = 0, can = 0, charges = 0, o = 1 }) => {
    const d = bend + vib;
    const prong = (sx: number) => {
      const dx = sx * d;
      return `M${sx * 62},120 L${sx * 16},120 L${sx * 16 + dx},-220 Q${sx * 39 + dx},-246 ${sx * 62 + dx},-220 Z`;
    };
    return (
      <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
        {can > 0.01 && <rect x={-120} y={-290} width={240} height={540} rx={110} fill="rgba(201,214,230,0.08)" stroke={C.silver} strokeWidth={6} strokeDasharray="18 12" opacity={can} />}
        {glow > 0.01 && <ellipse cx={0} cy={-40} rx={150} ry={250} fill={K.cold} opacity={0.16 * glow} />}
        <path d={prong(-1)} fill={C.quartz} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d={prong(1)} fill={C.quartz} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <rect x={-62} y={110} width={124} height={110} rx={16} fill={C.quartz} stroke={C.ink} strokeWidth={6} />
        {/* electrodos dorados */}
        <path d={`M-40,200 L-40,120 L${-39 - d * 0.75},-150`} fill="none" stroke={C.gold} strokeWidth={8} strokeLinecap="round" />
        <path d={`M40,200 L40,120 L${39 + d * 0.75},-150`} fill="none" stroke={C.gold} strokeWidth={8} strokeLinecap="round" />
        {/* brillo */}
        <path d={`M-52,90 L${-50 - d * 0.1},-180`} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
        {charges > 0.01 && (
          <g opacity={charges} fontFamily="MontserratSerie" fontWeight={900} fontSize={44} textAnchor="middle">
            <text x={-110 - d} y={-80} fill={K.flow}>+</text><text x={-110 - d} y={10} fill={K.flow}>+</text>
            <text x={110 + d} y={-80} fill={K.cold}>−</text><text x={110 + d} y={10} fill={K.cold}>−</text>
          </g>
        )}
      </g>
    );
  };

/** Chip negro con patas. */
export const ChipIC: React.FC<{ x: number; y: number; w?: number; h?: number; glow?: number; o?: number }> = ({ x, y, w = 110, h = 80, glow = 0, o = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    {Array.from({ length: 5 }).map((_, i) => (
      <React.Fragment key={i}>
        <rect x={-w / 2 + 10 + i * ((w - 30) / 4)} y={-h / 2 - 14} width={10} height={16} fill={C.silver} />
        <rect x={-w / 2 + 10 + i * ((w - 30) / 4)} y={h / 2 - 2} width={10} height={16} fill={C.silver} />
      </React.Fragment>
    ))}
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="#111A26" stroke={glow > 0.01 ? K.flow : C.ink} strokeWidth={glow > 0.01 ? 5 : 4}
      style={glow > 0.01 ? { filter: `drop-shadow(0 0 ${14 * glow}px ${K.flow})` } : undefined} />
    <circle cx={-w / 2 + 14} cy={-h / 2 + 14} r={5} fill="#33435c" />
  </g>
);

/** Pila de botón. */
export const Coin: React.FC<{ x: number; y: number; r?: number; glow?: number }> = ({ x, y, r = 100, glow = 0 }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={r} fill={C.silver} stroke={C.ink} strokeWidth={5} style={glow > 0.01 ? { filter: `drop-shadow(0 0 ${16 * glow}px ${K.flow})` } : undefined} />
    <circle r={r * 0.8} fill="none" stroke={C.silver2} strokeWidth={5} />
    <path d={`M${-r * 0.55},${-r * 0.35} A${r * 0.7},${r * 0.7} 0 0 1 ${r * 0.2},${-r * 0.62}`} fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
    <text x={0} y={r * 0.22} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={r * 0.62} fill={C.silver2}>+</text>
  </g>
);

/** Cápsula metálica del cristal (vista desde arriba). */
export const CrystalCan: React.FC<{ x: number; y: number; rot?: number; glow?: number; vib?: number }> = ({ x, y, rot = 0, glow = 0, vib = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    {glow > 0.01 && <rect x={-104} y={-50} width={208} height={100} rx={50} fill={K.cold} opacity={0.45 * glow} />}
    <rect x={-80} y={-26} width={150} height={52} rx={26} fill={C.silver} stroke={glow > 0.01 ? K.cold : C.ink} strokeWidth={glow > 0.01 ? 7 : 5}
      style={glow > 0.01 ? { filter: `drop-shadow(0 0 ${22 * glow}px ${K.cold})` } : undefined} />
    <rect x={70} y={-10} width={30} height={6} fill={C.gold} /><rect x={70} y={4} width={30} height={6} fill={C.gold} />
    {glow > 0.01 && (
      <g opacity={glow}>
        <path d={`M-62,${-8 + vib} L50,${-8 + vib}`} stroke={K.cold} strokeWidth={8} strokeLinecap="round" />
        <path d={`M-62,${8 - vib} L50,${8 - vib}`} stroke={K.cold} strokeWidth={8} strokeLinecap="round" />
      </g>
    )}
  </g>
);

/** Esfera del reloj (local, radio 270). */
const Dial: React.FC<{ t: number; sec?: number; secColor?: string; ghost?: number }> = ({ t, sec, secColor = K.warn, ghost = 0 }) => {
  const a = sec ?? tickAngle(t);
  return (
    <g>
      <circle r={262} fill={C.dial} stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 60 }).map((_, i) => {
        const big = i % 5 === 0, an = (i * 6 * Math.PI) / 180, r0 = big ? 210 : 232;
        return <line key={i} x1={r0 * Math.sin(an)} y1={-r0 * Math.cos(an)} x2={248 * Math.sin(an)} y2={-248 * Math.cos(an)} stroke={C.ink} strokeWidth={big ? 10 : 4} strokeLinecap="round" />;
      })}
      {/* hora y minuto fijos (10:10) */}
      <line x1={0} y1={0} x2={-120 * Math.sin(Math.PI / 3)} y2={-120 * Math.cos(Math.PI / 3)} stroke={C.ink} strokeWidth={20} strokeLinecap="round" transform="rotate(5)" />
      <line x1={0} y1={0} x2={0} y2={-190} stroke={C.ink} strokeWidth={14} strokeLinecap="round" transform="rotate(60)" />
      {ghost > 0.01 && <line x1={0} y1={40} x2={0} y2={-225} stroke={secColor} strokeWidth={6} strokeLinecap="round" transform={`rotate(${a - 6})`} opacity={0.3 * ghost} />}
      <line x1={0} y1={40} x2={0} y2={-225} stroke={secColor} strokeWidth={6} strokeLinecap="round" transform={`rotate(${a})`} />
      <circle r={16} fill={secColor} stroke={C.ink} strokeWidth={4} />
    </g>
  );
};

/** Reloj de pulsera analógico. `open` levanta la esfera (arriba a la derecha) y deja ver la máquina. */
export const Watch: React.FC<{ x: number; y: number; s?: number; t: number; open?: number; glow?: number; straps?: boolean; sec?: number; hi?: string; ghost?: number; o?: number }> =
  ({ x, y, s = 1, t, open = 0, glow = 0, straps = true, sec, hi = "", ghost = 0, o = 1 }) => {
    const k = smooth(open);
    const rotorK = Math.floor(t);
    const rotorRot = 180 * (rotorK + smooth((t - rotorK) / 0.12));
    const vib = glow * 4 * Math.sin(t * 40);
    return (
      <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
        {straps && (
          <>
            <path d="M-130,-250 L-115,-410 L115,-410 L130,-250 Z" fill={C.case1} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            <path d="M-130,250 L-115,410 L115,410 L130,250 Z" fill={C.case1} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            {[-370, -330, 330, 370].map((yy) => <line key={yy} x1={-100} y1={yy} x2={100} y2={yy} stroke={C.case2} strokeWidth={5} />)}
          </>
        )}
        <rect x={278} y={-30} width={38} height={60} rx={10} fill={C.case3} stroke={C.ink} strokeWidth={5} />
        <circle r={292} fill={C.case2} stroke={C.ink} strokeWidth={7} />
        <circle r={272} fill={C.case3} opacity={0.35} />
        {/* máquina (se ve al abrir) */}
        {k > 0.01 && (
          <g opacity={k}>
            <circle r={262} fill={C.plate} stroke={C.ink} strokeWidth={5} />
            <circle r={262} fill="none" stroke={C.case1} strokeWidth={14} opacity={0.6} />
            <Coin x={-100} y={-95} r={105} glow={hi === "bat" ? 1 : 0} />
            <CrystalCan x={125} y={-130} rot={-35} glow={glow} vib={vib} />
            <ChipIC x={120} y={15} glow={hi === "chip" ? 1 : 0} />
            <Gear x={-20} y={45} r={48} n={14} rot={rotorRot / 10} />
            <Gear x={50} y={110} r={30} n={10} rot={-rotorRot / 4} color={C.silver} />
            {/* motor: bobina + estator + rotor */}
            <rect x={-215} y={95} width={190} height={62} rx={12} fill={C.copper} stroke={hi === "coil" ? K.flow : C.ink} strokeWidth={5} />
            {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={-200 + i * 20} y1={98} x2={-200 + i * 20} y2={154} stroke={C.copper2} strokeWidth={5} />)}
            <path d="M-25,126 L60,126 L60,170 M-25,140 L-25,210 L95,210" fill="none" stroke={C.case3} strokeWidth={18} strokeLinejoin="round" />
            <g transform={`translate(120,180) rotate(${rotorRot})`}>
              <circle r={30} fill={K.hot} stroke={C.ink} strokeWidth={4} />
              <path d="M0,-30 A30,30 0 0 1 0,30 Z" fill={K.cold} />
            </g>
            <circle r={9} fill={C.ink} />
          </g>
        )}
        {/* esfera: se levanta y se va arriba a la derecha */}
        <g transform={`translate(${280 * k},${-300 * k}) scale(${1 - 0.6 * k}) rotate(${12 * k})`} opacity={1 - 0.15 * k}>
          <Dial t={t} sec={sec} ghost={ghost} />
        </g>
      </g>
    );
  };

/** Motor paso a paso (local: rotor en 0,0 r 80; bobina abajo en y 260..340). `pulse` ilumina la bobina, `rot` gira el rotor. */
export const Motor: React.FC<{ x: number; y: number; s?: number; pulse: number; rot: number; pol: number; o?: number }> = ({ x, y, s = 1, pulse, rot, pol, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-100,-10 L-250,-10 L-250,300 L250,300 L250,-10 L100,-10" fill="none" stroke={C.case3} strokeWidth={56} strokeLinejoin="round" />
    <path d="M-100,-10 L-250,-10 L-250,300 L250,300 L250,-10 L100,-10" fill="none" stroke={K.flow} strokeWidth={10} strokeLinejoin="round" strokeDasharray="20 16" opacity={0.85 * pulse} />
    <rect x={-190} y={250} width={380} height={100} rx={18} fill={C.copper} stroke={pulse > 0.05 ? K.flow : C.ink} strokeWidth={6}
      style={pulse > 0.05 ? { filter: `drop-shadow(0 0 ${22 * pulse}px ${K.flow})` } : undefined} />
    {Array.from({ length: 17 }).map((_, i) => <line key={i} x1={-175 + i * 22} y1={254} x2={-175 + i * 22} y2={346} stroke={C.copper2} strokeWidth={6} />)}
    {/* polos */}
    <g fontFamily="MontserratSerie" fontWeight={900} fontSize={40} textAnchor="middle" opacity={0.3 + 0.7 * pulse}>
      <text x={-150} y={-50} fill={pol > 0 ? K.hot : K.cold}>{pol > 0 ? "N" : "S"}</text>
      <text x={150} y={-50} fill={pol > 0 ? K.cold : K.hot}>{pol > 0 ? "S" : "N"}</text>
    </g>
    <g transform={`rotate(${rot})`}>
      <circle r={80} fill={K.hot} stroke={C.ink} strokeWidth={6} />
      <path d="M0,-80 A80,80 0 0 1 0,80 Z" fill={K.cold} stroke={C.ink} strokeWidth={6} />
      <text x={-40} y={14} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={38} fill={C.ink}>N</text>
      <text x={40} y={14} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={38} fill={C.ink}>S</text>
    </g>
    <circle r={12} fill={C.ink} />
  </g>
);

/** Pila de 1,5 V de lado (para el beat del voltaje). */
export const Battery: React.FC<{ x: number; y: number; glow?: number }> = ({ x, y, glow = 0 }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-50} y={-90} width={100} height={180} rx={14} fill={C.case2} stroke={glow > 0.05 ? K.flow : C.ink} strokeWidth={6} />
    <rect x={-20} y={-108} width={40} height={20} rx={4} fill={C.silver} stroke={C.ink} strokeWidth={4} />
    <text x={0} y={-30} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={50} fill={K.flow}>+</text>
    <text x={0} y={60} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={50} fill={C.ink}>−</text>
  </g>
);

/** Rayito de energía. */
export const Bolt: React.FC<{ x: number; y: number; s?: number; o: number; color?: string }> = ({ x, y, s = 1, o, color = K.flow }) => o <= 0.01 ? null : (
  <path transform={`translate(${x},${y}) scale(${s})`} d="M10,-50 L-22,6 L0,6 L-10,50 L24,-8 L2,-8 Z" fill={color} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" opacity={o}
    style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
);

/** Oreja de perfil sencilla. */
export const Ear: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-40,-110 C40,-150 110,-90 100,-10 C92,50 40,60 30,110 C22,150 -40,150 -50,100" fill="#C98E74" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    <path d="M-10,-70 C40,-90 70,-40 55,0 C45,30 15,30 10,60" fill="none" stroke="#A66C55" strokeWidth={9} strokeLinecap="round" />
  </g>
);

/** Termómetro (nivel 0..1, color por temperatura: −1 frío, +1 calor). */
export const Thermo: React.FC<{ x: number; y: number; lvl: number; temp: number; o?: number }> = ({ x, y, lvl, temp, o = 1 }) => {
  const col = temp >= 0 ? K.hot : K.cold;
  const h = 300 * clamp01(lvl);
  return (
    <g transform={`translate(${x},${y})`} opacity={o}>
      <rect x={-34} y={-200} width={68} height={360} rx={34} fill="rgba(255,255,255,0.12)" stroke={C.case3} strokeWidth={6} />
      <circle cx={0} cy={190} r={60} fill={col} stroke={C.case3} strokeWidth={6} />
      <rect x={-16} y={150 - h} width={32} height={h + 40} rx={16} fill={col} />
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={34} y1={-160 + i * 70} x2={60} y2={-160 + i * 70} stroke={C.case3} strokeWidth={5} />)}
    </g>
  );
};

/** Laboratorio de 1927: armario de aparatos con válvulas y diales + teléfono antiguo de sobremesa. */
export const Lab: React.FC<{ x: number; y: number; t: number; on: number; phone?: number }> = ({ x, y, t, on, phone = 1 }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-230} y={-320} width={460} height={640} rx={14} fill={C.wood} stroke={C.ink} strokeWidth={7} />
    {[0, 1, 2].map((r) => (
      <g key={r}>
        <rect x={-200} y={-290 + r * 205} width={400} height={180} rx={10} fill="#2A2420" stroke={C.ink} strokeWidth={5} />
        {[0, 1, 2].map((c) => {
          const cx = -130 + c * 130, cy = -200 + r * 205;
          return r === 1 ? (
            <g key={c}>
              <ellipse cx={cx} cy={cy - 10} rx={30} ry={50} fill={K.hot} opacity={0.25 + 0.6 * on * (0.7 + 0.3 * Math.sin(t * 5 + c))} style={{ filter: `drop-shadow(0 0 ${12 * on}px ${K.hot})` }} />
              <ellipse cx={cx} cy={cy - 10} rx={30} ry={50} fill="none" stroke={C.silver} strokeWidth={4} />
              <rect x={cx - 22} y={cy + 38} width={44} height={22} fill={C.silver2} />
            </g>
          ) : (
            <g key={c}>
              <circle cx={cx} cy={cy} r={50} fill={C.dial} stroke={C.ink} strokeWidth={5} />
              <line x1={cx} y1={cy} x2={cx + 38 * Math.sin(t * (r ? 1.3 : 0.8) + c)} y2={cy - 38 * Math.abs(Math.cos(t * (r ? 1.3 : 0.8) + c))} stroke={K.warn} strokeWidth={5} strokeLinecap="round" />
            </g>
          );
        })}
      </g>
    ))}
    <g opacity={phone} transform="translate(380,170)">
      <rect x={-60} y={130} width={120} height={24} rx={10} fill="#1B1B1B" stroke={C.ink} strokeWidth={4} />
      <rect x={-14} y={-60} width={28} height={192} fill="#1B1B1B" stroke={C.ink} strokeWidth={4} />
      <path d="M-34,-110 L34,-110 L22,-60 L-22,-60 Z" fill="#1B1B1B" stroke={C.ink} strokeWidth={4} />
      <path d="M20,0 C70,-10 90,30 80,60" fill="none" stroke="#1B1B1B" strokeWidth={8} />
      <rect x={60} y={50} width={40} height={60} rx={10} fill="#1B1B1B" stroke={C.ink} strokeWidth={4} />
    </g>
  </g>
);
