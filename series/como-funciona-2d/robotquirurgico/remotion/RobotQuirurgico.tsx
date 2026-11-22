// Dibujos SVG planos del episodio «Cómo funciona un robot quirúrgico» (ESPECIAL HOSPITAL). Sin marcas.
// Personas = siluetas neutras. Tejido esquemático en rosa apagado (sin sangre real).
// Código de color: amarillo = la señal del cirujano / lo importante, cian = cámara y visión, naranja = energía/movimiento,
// rojo #E53935 = error/temblor, grises azulados = carcasas.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = {
  case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#0B1A30", sil: "#2A4E7A", silEdge: "#5A86BE",
  steel: "#C9D6E6", tissue: "#7A3346", tissue2: "#A44E63", sheet: "#2F7F8C", sheetEdge: "#5FB3BF", red: "#E53935",
};

/** Señal que viaja por un cable: puntos que avanzan de (x0,y0) a (x1,y1). */
export const Signal: React.FC<{ x0: number; y0: number; x1: number; y1: number; t: number; o?: number; color?: string; n?: number; curve?: number }> =
  ({ x0, y0, x1, y1, t, o = 1, color = K.flow, n = 5, curve = 0 }) => {
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + curve;
    const P = (u: number) => ({ x: (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * mx + u * u * x1, y: (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * my + u * u * y1 });
    return (
      <g opacity={o}>
        <path d={`M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`} fill="none" stroke={color} strokeWidth={5} strokeDasharray="4 16" strokeLinecap="round" opacity={0.6} />
        {Array.from({ length: n }).map((_, k) => { const u = ((t * 0.6 + k / n) % 1); const p = P(u); return <circle key={k} cx={p.x} cy={p.y} r={9} fill={color} opacity={Math.sin(u * Math.PI)} />; })}
      </g>
    );
  };

/** Mesa de operaciones con paciente tumbado (silueta neutra bajo una sábana). Origen: centro del suelo. Ancho ~420. */
export const Table: React.FC<{ ports?: number; o?: number }> = ({ ports = 0, o = 1 }) => (
  <g opacity={o}>
    <rect x={-30} y={-200} width={60} height={200} fill={C.case1} stroke={C.case3} strokeWidth={4} />
    <rect x={-110} y={-14} width={220} height={14} rx={6} fill={C.case1} stroke={C.case3} strokeWidth={4} />
    <rect x={-220} y={-232} width={440} height={34} rx={10} fill={C.case2} stroke={C.case3} strokeWidth={4} />
    {/* paciente: cabeza a la izquierda, sábana encima */}
    <circle cx={-180} cy={-262} r={30} fill={C.sil} stroke={C.silEdge} strokeWidth={4} />
    <path d="M -150 -232 C -150 -290 -60 -300 20 -296 C 120 -292 190 -282 206 -232 Z" fill={C.sheet} stroke={C.sheetEdge} strokeWidth={4} />
    {ports > 0 && [-40, 30, 100].map((x, i) => <circle key={i} cx={x} cy={-296 + Math.abs(x - 20) * 0.03} r={7} fill={K.flow} opacity={ports} />)}
  </g>
);

/** Carro del robot junto a la mesa: columna, brazo superior y tres brazos que bajan al paciente.
 * Origen: suelo, en el centro de la base. La mesa va a la derecha (x ≈ 300). open: la tapa de la columna se separa y deja ver el cable. */
export const Robot: React.FC<{ t: number; open?: number; move?: number; hi?: number; cable?: number }> = ({ t, open = 0, move = 1, hi = 0, cable = 0 }) => {
  const st = hi > 0.01 ? K.flow : C.case3;
  const arms = [140, 300, 460];
  return (
    <g>
      {/* base con ruedas */}
      <rect x={-120} y={-56} width={240} height={44} rx={14} fill={C.case1} stroke={st} strokeWidth={5} />
      {[-84, 84].map((x) => <circle key={x} cx={x} cy={-10} r={12} fill={C.dark} stroke={C.case3} strokeWidth={4} />)}
      {/* columna (interior con el cable amarillo) */}
      <rect x={-42} y={-560} width={84} height={506} rx={12} fill={C.dark} stroke={C.case3} strokeWidth={4} />
      <path d="M 0 -540 C 14 -420 -14 -300 0 -180 C 10 -110 -6 -70 -60 -40" fill="none" stroke={K.flow} strokeWidth={10} strokeLinecap="round" opacity={0.25 + 0.75 * cable} />
      <g transform={`translate(${-95 * open} ${-20 * open}) rotate(${-8 * open} -42 -60)`}>
        <rect x={-42} y={-560} width={84} height={506} rx={12} fill={C.case2} stroke={st} strokeWidth={5} />
        <rect x={-22} y={-500} width={44} height={70} rx={8} fill={C.dark} stroke={C.case3} strokeWidth={3} />
        <circle cx={0} cy={-465} r={10} fill={K.cold} opacity={0.6 + 0.4 * Math.sin(t * 4)} />
      </g>
      {/* brazo superior */}
      <rect x={-60} y={-610} width={560} height={56} rx={22} fill={C.case2} stroke={st} strokeWidth={5} />
      {arms.map((bx, i) => {
        const a = move * 10 * Math.sin(t * 1.6 + i * 1.9);
        const ex = bx + 60, ey = -470;
        return (
          <g key={i}>
            <g transform={`rotate(${a} ${bx} -582)`}>
              <path d={`M ${bx} -582 L ${ex} ${ey} L ${bx} -350`} fill="none" stroke={C.case1} strokeWidth={40} strokeLinejoin="round" strokeLinecap="round" />
              <path d={`M ${bx} -582 L ${ex} ${ey} L ${bx} -350`} fill="none" stroke={C.case2} strokeWidth={28} strokeLinejoin="round" strokeLinecap="round" />
              <circle cx={ex} cy={ey} r={16} fill={C.dark} stroke={st} strokeWidth={4} />
              <rect x={bx - 9} y={-352} width={18} height={66} fill={C.steel} />
            </g>
            <circle cx={bx} cy={-582} r={20} fill={C.dark} stroke={st} strokeWidth={4} />
          </g>
        );
      })}
    </g>
  );
};

/** Robot + mesa juntos. Origen: suelo, base del robot. Ancho total ~ -120..520. */
export const Theatre: React.FC<{ t: number; open?: number; move?: number; hi?: number; cable?: number; ports?: number }> = (p) => (
  <g>
    <g transform="translate(300 0)"><Table ports={p.ports} /></g>
    <Robot {...p} />
  </g>
);

/** Consola del cirujano con la silueta sentada mirando al visor. Origen: suelo, centro de la consola. Cirujano a la izquierda. */
export const Console: React.FC<{ t: number; hi?: number; surgeon?: number; hands?: number; eyes?: number }> = ({ t, hi = 0, surgeon = 1, hands = 0, eyes = 0 }) => {
  const st = hi > 0.01 ? K.flow : C.case3;
  const hm = 6 * Math.sin(t * 2.2);
  return (
    <g>
      {/* cuerpo de la consola */}
      <path d="M -60 0 L -60 -300 L -10 -380 L 90 -380 L 90 0 Z" fill={C.case1} stroke={st} strokeWidth={5} strokeLinejoin="round" />
      {/* visor */}
      <path d="M -10 -380 L -110 -400 L -110 -470 L 40 -500 L 90 -480 L 90 -380 Z" fill={C.case2} stroke={st} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-108} y={-460} width={24} height={46} rx={6} fill={C.dark} stroke={K.cold} strokeWidth={3} opacity={0.4 + 0.6 * eyes} />
      {/* reposabrazos y mandos */}
      <rect x={-150} y={-300} width={110} height={18} rx={8} fill={C.case2} stroke={C.case3} strokeWidth={3} />
      <circle cx={-128 + hm} cy={-318} r={12} fill="none" stroke={K.flow} strokeWidth={5} opacity={0.35 + 0.65 * hands} />
      {/* pedales */}
      <rect x={-110} y={-22} width={60} height={14} rx={4} fill={C.case3} />
      {/* cirujano: silueta neutra sentada */}
      <g opacity={surgeon}>
        <rect x={-300} y={-240} width={110} height={20} rx={8} fill={C.case1} stroke={C.case3} strokeWidth={3} />
        <rect x={-252} y={-220} width={14} height={220} fill={C.case1} />
        <circle cx={-150} cy={-440} r={34} fill={C.sil} stroke={C.silEdge} strokeWidth={4} />
        <path d="M -190 -405 C -230 -380 -250 -300 -250 -232 L -170 -232 C -165 -300 -150 -350 -140 -395 Z" fill={C.sil} stroke={C.silEdge} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M -190 -370 L -150 -322 L ${-130 + hm} -318`} fill="none" stroke={C.silEdge} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M -250 -236 L -130 -232 L -110 -24" fill="none" stroke={C.silEdge} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
};

/** Mano (silueta) sujetando el mando de la consola: pinza con dos anillos. Centro (0,0). grip 0-1 cierra los dedos. */
export const Grip: React.FC<{ grip?: number; o?: number; hi?: number }> = ({ grip = 0, o = 1, hi = 0 }) => {
  const g = 26 - 16 * grip;
  return (
    <g opacity={o}>
      <rect x={-14} y={0} width={28} height={190} rx={10} fill={C.case2} stroke={hi > 0.01 ? K.flow : C.case3} strokeWidth={4} />
      <path d={`M 0 0 L ${-g - 20} -90`} stroke={C.steel} strokeWidth={12} strokeLinecap="round" />
      <path d={`M 0 0 L ${g + 20} -90`} stroke={C.steel} strokeWidth={12} strokeLinecap="round" />
      <circle cx={-g - 24} cy={-104} r={22} fill="none" stroke={K.flow} strokeWidth={7} />
      <circle cx={g + 24} cy={-104} r={22} fill="none" stroke={K.flow} strokeWidth={7} />
      {/* mano: palma + pulgar e índice metidos en los anillos */}
      <path d={`M ${-g - 24} -96 C -60 -40 -50 0 -30 20`} fill="none" stroke={C.silEdge} strokeWidth={26} strokeLinecap="round" />
      <path d={`M ${g + 24} -96 C 60 -40 50 0 30 20`} fill="none" stroke={C.silEdge} strokeWidth={26} strokeLinecap="round" />
      <ellipse cx={0} cy={60} rx={62} ry={72} fill={C.sil} stroke={C.silEdge} strokeWidth={5} />
    </g>
  );
};

/** Punta de instrumento con muñeca. Eje horizontal que llega desde la izquierda hasta (0,0).
 * bend: grados de flexión de la muñeca; roll: giro (se ve en las marcas); grip 0-1 abre las mordazas. */
export const Wrist: React.FC<{ bend?: number; roll?: number; grip?: number; len?: number; o?: number; hi?: number }> = ({ bend = 0, roll = 0, grip = 0.5, len = 420, o = 1, hi = 0 }) => {
  const st = hi > 0.01 ? K.flow : C.case3;
  const ja = 6 + 22 * grip;
  return (
    <g opacity={o}>
      <rect x={-len} y={-18} width={len} height={36} rx={10} fill={C.steel} stroke={C.case3} strokeWidth={3} />
      {[0, 1, 2, 3, 4, 5].map((k) => { const x = -len + 30 + ((k * 70 + roll * 1.2) % (len - 60)); return <rect key={k} x={x} y={-18} width={10} height={36} fill={C.case2} opacity={0.7} />; })}
      <g transform={`rotate(${bend})`}>
        <circle cx={0} cy={0} r={24} fill={C.case2} stroke={st} strokeWidth={5} />
        <rect x={14} y={-14} width={50} height={28} rx={8} fill={C.steel} stroke={C.case3} strokeWidth={3} />
        <circle cx={66} cy={0} r={14} fill={C.case2} stroke={st} strokeWidth={4} />
        <g transform={`rotate(${-ja} 66 0)`}><path d="M 66 -6 L 170 -2 L 170 6 L 66 8 Z" fill={C.steel} stroke={st} strokeWidth={4} strokeLinejoin="round" /></g>
        <g transform={`rotate(${ja} 66 0)`}><path d="M 66 -8 L 170 -6 L 170 2 L 66 6 Z" fill={C.steel} stroke={st} strokeWidth={4} strokeLinejoin="round" /></g>
      </g>
    </g>
  );
};

/** Corte esquemático del interior del cuerpo: una cavidad rosada con «órganos» redondeados. Centro (0,0), ancho w, alto h. */
export const Cavity: React.FC<{ w: number; h: number; o?: number }> = ({ w, h, o = 1 }) => (
  <g opacity={o}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={60} fill={C.tissue} stroke={C.tissue2} strokeWidth={6} />
    <ellipse cx={-w * 0.2} cy={h * 0.18} rx={w * 0.22} ry={h * 0.2} fill={C.tissue2} opacity={0.8} />
    <ellipse cx={w * 0.22} cy={h * 0.22} rx={w * 0.18} ry={h * 0.16} fill={C.tissue2} opacity={0.65} />
    <path d={`M ${-w * 0.42} ${-h * 0.05} C ${-w * 0.2} ${-h * 0.2} ${w * 0.1} ${-h * 0.0} ${w * 0.42} ${-h * 0.12}`} fill="none" stroke={C.red} strokeWidth={6} strokeLinecap="round" opacity={0.75} />
  </g>
);

/** Cámara doble (endoscopio) que baja desde arriba hasta (0,0) con dos lentes y sus conos de visión. */
export const StereoCam: React.FC<{ len?: number; cones?: number; hi?: number }> = ({ len = 300, cones = 0, hi = 0 }) => (
  <g>
    {cones > 0.01 && <>
      <path d="M -16 6 L -150 230 L 40 230 Z" fill={K.cold} opacity={0.18 * cones} />
      <path d="M 16 6 L -40 230 L 150 230 Z" fill={K.cold} opacity={0.18 * cones} />
    </>}
    <rect x={-34} y={-len} width={68} height={len} rx={14} fill={C.steel} stroke={hi > 0.01 ? K.flow : C.case3} strokeWidth={4} />
    <circle cx={-15} cy={-8} r={11} fill={C.dark} stroke={K.cold} strokeWidth={4} />
    <circle cx={15} cy={-8} r={11} fill={C.dark} stroke={K.cold} strokeWidth={4} />
  </g>
);

/** Miniatura de lo que ve un ojo: rectángulo con la escena (órganos + pinza). dx desplaza el contenido (paralaje). */
export const View: React.FC<{ t?: number; x: number; y: number; w: number; h: number; dx?: number; o?: number; border?: string; depth?: number }> = ({ t = 0, x, y, w, h, dx = 0, o = 1, border = K.cold, depth = 0 }) => {
  const id = `v${Math.round(x)}${Math.round(y)}${Math.round(w)}`;
  return (
    <g opacity={o}>
      <defs><clipPath id={id}><rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={18} /></clipPath></defs>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={18} fill={C.tissue} />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={x - w * 0.18 + dx * 0.5} cy={y + h * 0.2} rx={w * 0.3} ry={h * 0.28} fill={C.tissue2} />
        <ellipse cx={x + w * 0.25 + dx * 0.3} cy={y + h * 0.3} rx={w * 0.22} ry={h * 0.22} fill={C.tissue2} opacity={0.7} />
        {depth > 0.01 && <ellipse cx={x - w * 0.18} cy={y + h * 0.2 + 12} rx={w * 0.3} ry={h * 0.1} fill="#000" opacity={0.25 * depth} />}
        <g transform={`translate(${x + w * 0.05 + dx} ${y - h * 0.08}) scale(${w / 900})`}><Wrist bend={-20 + 8 * Math.sin(t * 1.7)} grip={0.5 + 0.4 * Math.sin(t * 3)} len={520} /></g>
      </g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={18} fill="none" stroke={border} strokeWidth={5} />
    </g>
  );
};

/** Onda del movimiento de la mano: con temblor (noise) o lisa. */
export const Trace: React.FC<{ x0: number; x1: number; y: number; t: number; noise?: number; color?: string; o?: number; amp?: number }> = ({ x0, x1, y, t, noise = 0, color = K.flow, o = 1, amp = 60 }) => {
  const pts: string[] = [];
  for (let k = 0; k <= 120; k++) {
    const u = k / 120, x = x0 + (x1 - x0) * u;
    const v = amp * Math.sin(u * Math.PI * 2 + t * 1.2) + noise * (14 * Math.sin(u * 190 + t * 31) + 9 * Math.sin(u * 333 - t * 23));
    pts.push(`${k ? "L" : "M"} ${x.toFixed(1)} ${(y + v).toFixed(1)}`);
  }
  return <path d={pts.join(" ")} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={o} />;
};

/** Regla con marcas cada «cm» (px por cm = u) y una flecha de recorrido de longitud len (en cm). */
export const Ruler: React.FC<{ t?: number; x: number; y: number; cm: number; u: number; len: number; color: string; o?: number }> = ({ t = 0, x, y, cm, u, len, color, o = 1 }) => (
  <g opacity={o}>
    <rect x={x - 10} y={y} width={cm * u + 20} height={44} rx={8} fill={C.dark} stroke={C.case3} strokeWidth={3} />
    {Array.from({ length: cm + 1 }).map((_, k) => <rect key={k} x={x + k * u - 2} y={y} width={4} height={26} fill={C.case3} />)}
    <rect x={x} y={y - 26} width={Math.max(0.1, len * u)} height={14} rx={7} fill={color} />
    <circle cx={x + len * u} cy={y - 19} r={14} fill={color} />
    <circle cx={x + len * u} cy={y - 19} r={20 + 14 * ((t * 1.2) % 1)} fill="none" stroke={color} strokeWidth={4} opacity={1 - ((t * 1.2) % 1)} />
  </g>
);

/** Documento oficial genérico (sin logotipos). */
export const Doc: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -150 -200 L 100 -200 L 150 -150 L 150 200 L -150 200 Z" fill="#EAF1F8" stroke={C.case3} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 100 -200 L 100 -150 L 150 -150" fill="#C9D6E6" stroke={C.case3} strokeWidth={4} />
    <circle cx={-95} cy={-140} r={28} fill={C.case2} />
    {[-140, -100, -40, 0, 40, 80, 120].map((yy, i) => <rect key={i} x={i < 2 ? -50 : -110} y={yy - 6} width={i < 2 ? 150 : 220 - (i % 3) * 40} height={12} rx={6} fill={C.case3} />)}
  </g>
);

/** Brazo industrial de los años ochenta (silueta), base en (0,0); termina en una guía de aguja hacia la derecha-abajo. */
export const FactoryArm: React.FC<{ t: number; o?: number; hi?: number }> = ({ t, o = 1, hi = 0 }) => {
  const a = 3 * Math.sin(t * 1.3);
  const st = hi > 0.01 ? K.flow : C.case3;
  return (
    <g opacity={o}>
      <rect x={-90} y={-50} width={180} height={50} rx={10} fill={C.case1} stroke={st} strokeWidth={5} />
      <rect x={-40} y={-200} width={80} height={160} rx={14} fill={K.hot} stroke={st} strokeWidth={5} />
      <g transform={`rotate(${a} 0 -200)`}>
        <path d="M 0 -200 L 130 -330 L 270 -250" fill="none" stroke="#B8540F" strokeWidth={56} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 0 -200 L 130 -330 L 270 -250" fill="none" stroke={K.hot} strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={0} cy={-200} r={22} fill={C.dark} stroke={st} strokeWidth={4} />
        <circle cx={130} cy={-330} r={22} fill={C.dark} stroke={st} strokeWidth={4} />
        <rect x={262} y={-270} width={70} height={40} rx={8} fill={C.case2} stroke={st} strokeWidth={4} transform="rotate(30 270 -250)" />
      </g>
    </g>
  );
};

/** Cabeza de perfil (silueta neutra) mirando a la izquierda, centro (0,0) r~150. */
export const Head: React.FC<{ o?: number; target?: number }> = ({ o = 1, target = 0 }) => (
  <g opacity={o}>
    <path d="M 120 140 C 160 60 170 -40 120 -110 C 70 -180 -40 -190 -100 -130 C -150 -80 -150 -10 -160 20 L -190 60 L -158 74 C -160 110 -140 130 -100 130 L -80 190 L 100 190 Z" fill={C.sil} stroke={C.silEdge} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={10} cy={-60} rx={95} ry={70} fill="none" stroke={C.silEdge} strokeWidth={4} strokeDasharray="10 10" opacity={0.7} />
    <circle cx={30} cy={-60} r={16} fill={K.flow} opacity={0.3 + 0.7 * target} />
  </g>
);

/** Mapa esquemático del Atlántico: América a la izquierda, Europa a la derecha, arco entre dos puntos. */
export const Atlantic: React.FC<{ t: number; arc?: number; o?: number }> = ({ t, arc = 0, o = 1 }) => {
  const A = { x: 230, y: 760 }, B = { x: 860, y: 660 };
  return (
    <g opacity={o}>
      <rect x={60} y={480} width={960} height={520} rx={40} fill="#0C2A4E" stroke={C.case1} strokeWidth={4} />
      <path d="M 60 520 L 200 500 C 260 560 300 640 290 700 C 280 760 220 800 250 860 C 270 920 220 960 160 1000 L 60 1000 Z" fill={C.case1} stroke={C.case2} strokeWidth={4} />
      <path d="M 1020 500 L 880 500 C 830 540 800 600 830 640 C 860 680 820 720 840 780 C 860 860 900 920 960 1000 L 1020 1000 Z" fill={C.case1} stroke={C.case2} strokeWidth={4} />
      {[0, 1, 2].map((k) => <path key={k} d={`M ${380 + k * 120} ${880 + k * 18} q 30 -14 60 0 t 60 0`} fill="none" stroke={K.cold} strokeWidth={4} opacity={0.35} />)}
      <Signal x0={A.x} y0={A.y} x1={B.x} y1={B.y} t={t} curve={-260} o={arc} />
      <circle cx={A.x} cy={A.y} r={16} fill={K.flow} stroke={K.ink} strokeWidth={4} />
      <circle cx={B.x} cy={B.y} r={16} fill={K.flow} stroke={K.ink} strokeWidth={4} opacity={0.4 + 0.6 * arc} />
    </g>
  );
};
