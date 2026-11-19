// Dibujos SVG del episodio «Cómo funcionan los auriculares inalámbricos». Coordenadas absolutas de 1080×1920.
// Colores de código: naranja = luz infrarroja/energía, cian = ondas de radio y sonido «bueno», amarillo = lo importante/corriente,
// blanco = texto, rojo = ruido/error. Grises azulados para carcasas. Sin marcas: auriculares, estuche y móvil genéricos.
import React from "react";
import { K, clamp01 } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F", inner: "#0B1A30", tip: "#C9D6E6", board: "#1E5A46",
  gold: "#E0B84A", skin: "#C98E74", skin2: "#A66C55", dirt: "#8A6A3A" };

export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Línea de flujo animada (trazo discontinuo que avanza). */
export const Flow: React.FC<{ d: string; t: number; color?: string; w?: number; o?: number; speed?: number }> = ({ d, t, color = K.flow, w = 10, o = 1, speed = 160 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    <path d={d} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={w + 8} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="22 18" strokeDashoffset={-t * speed} />
  </g>
);

/** Ondas de radio (arcos que salen de un punto hacia `dir` grados). */
export const RadioWaves: React.FC<{ x: number; y: number; t: number; o: number; dir?: number; color?: string; n?: number; r0?: number; step?: number }> =
  ({ x, y, t, o, dir = 0, color = K.cold, n = 3, r0 = 30, step = 34 }) => o <= 0.01 ? null : (
    <g transform={`translate(${x},${y}) rotate(${dir})`} opacity={o}>
      {Array.from({ length: n }).map((_, k) => {
        const p = (t * 1.4 + k / n) % 1;
        const r = r0 + p * step * n;
        return <path key={k} d={`M${r * Math.cos(-0.7)},${r * Math.sin(-0.7)} A${r},${r} 0 0 1 ${r * Math.cos(0.7)},${r * Math.sin(0.7)}`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" opacity={Math.sin(Math.PI * p)} />;
      })}
    </g>
  );

/** Notas musicales que salen flotando. */
export const Notes: React.FC<{ x: number; y: number; t: number; o: number; dx?: number }> = ({ x, y, t, o, dx = -1 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    {[0, 1, 2].map((k) => {
      const p = (t * 0.7 + k / 3) % 1;
      const xx = x + dx * (20 + p * 170) + 14 * Math.sin(t * 3 + k), yy = y - 40 - p * 120 + k * 30;
      return (
        <g key={k} transform={`translate(${xx},${yy}) scale(${0.9 + 0.2 * k})`} opacity={Math.sin(Math.PI * p)}>
          <ellipse cx={0} cy={0} rx={15} ry={11} fill={K.cold} transform="rotate(-20)" />
          <rect x={10} y={-56} width={6} height={56} fill={K.cold} />
          <path d="M16,-56 q22,8 18,30" fill="none" stroke={K.cold} strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    })}
  </g>
);

/** Icono de pausa / play dentro de un círculo. */
export const PauseIcon: React.FC<{ x: number; y: number; o: number; r?: number; play?: boolean; color?: string }> = ({ x, y, o, r = 60, play = false, color = K.flow }) => o <= 0.01 ? null : (
  <g transform={`translate(${x},${y}) scale(${0.7 + 0.3 * o})`} opacity={o}>
    <circle r={r} fill="rgba(6,16,31,0.85)" stroke={color} strokeWidth={7} />
    {play ? <path d={`M${-r * 0.28},${-r * 0.4} L${r * 0.45},0 L${-r * 0.28},${r * 0.4} Z`} fill={color} />
      : <g fill={color}><rect x={-r * 0.36} y={-r * 0.42} width={r * 0.24} height={r * 0.84} rx={4} /><rect x={r * 0.12} y={-r * 0.42} width={r * 0.24} height={r * 0.84} rx={4} /></g>}
  </g>
);

/** Rayo infrarrojo: del emisor a un punto y (si `back`) de vuelta al detector. */
export const IRBeam: React.FC<{ e: [number, number]; p: [number, number]; d?: [number, number]; t: number; o: number; back?: number }> = ({ e, p, d, t, o, back = 0 }) => o <= 0.01 ? null : (
  <g opacity={o}>
    <path d={`M${e[0]},${e[1]} L${p[0]},${p[1]}`} stroke={K.hot} strokeOpacity={0.25} strokeWidth={22} strokeLinecap="round" />
    <path d={`M${e[0]},${e[1]} L${p[0]},${p[1]}`} stroke={K.hot} strokeWidth={8} strokeLinecap="round" strokeDasharray="16 12" strokeDashoffset={-t * 120} />
    {d && back > 0.01 && (
      <g opacity={back}>
        <path d={`M${p[0]},${p[1]} L${d[0]},${d[1]}`} stroke={K.hot} strokeOpacity={0.25} strokeWidth={22} strokeLinecap="round" />
        <path d={`M${p[0]},${p[1]} L${d[0]},${d[1]}`} stroke={K.hot} strokeWidth={8} strokeLinecap="round" strokeDasharray="16 12" strokeDashoffset={-t * 120} />
        <circle cx={p[0]} cy={p[1]} r={12} fill={K.hot} opacity={0.8} />
      </g>
    )}
  </g>
);

/**
 * Auricular de botón con varilla, visto de lado. Centro del botón en (0,0); la almohadilla apunta a la izquierda; la varilla baja hasta y≈400.
 * open: la carcasa se levanta y se ve el interior. ir: el sensor brilla. hi: resalta "sensor" | "acc" | "bat" | "mic" | "chip" | "spk" | "contacts".
 * lvl: carga de la batería. sound: ondas de sonido por la almohadilla. tap: sacudida (0-1) del acelerómetro.
 */
export const Earbud: React.FC<{ x: number; y: number; s?: number; rot?: number; t: number; open?: number; ir?: number; hi?: string; lvl?: number;
  sound?: number; tap?: number; flipX?: boolean; dirt?: number; glowContacts?: number; id?: string; shellDx?: number; shellDy?: number; o?: number }> =
  ({ x, y, s = 1, rot = 0, t, open = 0, ir = 0, hi = "", lvl = 0.6, sound = 0, tap = 0, flipX = false, dirt = 0, glowContacts = 0, id = "e", shellDx = 170, shellDy = -190, o = 1 }) => {
    const body = "M-112,-92 C-50,-150 92,-148 140,-82 C176,-30 166,58 112,98 C62,130 -58,124 -106,86 C-138,58 -142,-58 -112,-92 Z";
    const stem = "M34,92 C60,82 96,82 112,96 L118,370 Q119,402 88,402 L58,402 Q28,402 28,370 Z";
    const hiG = (k: string) => (hi === k ? { filter: `drop-shadow(0 0 14px ${K.flow})` } : undefined);
    const shake = tap * 6 * Math.sin(t * 2 * Math.PI * 14);
    return (
      <g transform={`translate(${x},${y}) scale(${flipX ? -s : s},${s}) rotate(${rot})`} opacity={o}>
        {/* ondas de sonido por la almohadilla */}
        {sound > 0.01 && [0, 1, 2].map((k) => {
          const p = (t * 1.6 + k / 3) % 1; const r = 30 + p * 90;
          return <path key={k} d={`M${-230 - r * 0.5},${-r} Q${-230 - r * 1.1},0 ${-230 - r * 0.5},${r}`} fill="none" stroke={K.cold} strokeWidth={8} strokeLinecap="round" opacity={sound * Math.sin(Math.PI * p)} />;
        })}
        {/* almohadilla de silicona */}
        <rect x={-150} y={-34} width={44} height={68} rx={12} fill={C.case3} stroke={C.ink} strokeWidth={4} />
        <path d="M-140,-62 C-188,-70 -226,-42 -230,0 C-226,42 -188,70 -140,62 C-128,40 -128,-40 -140,-62 Z" fill={C.tip} stroke={C.ink} strokeWidth={5} />
        <path d="M-196,-40 C-214,-20 -214,20 -196,40" fill="none" stroke={K.white} strokeOpacity={0.5} strokeWidth={7} strokeLinecap="round" />
        {/* interior */}
        <path d={body} fill={C.inner} stroke={C.case1} strokeWidth={6} />
        <path d={stem} fill={C.inner} stroke={C.case1} strokeWidth={6} />
        {/* altavoz */}
        <g style={hiG("spk")}>
          <circle cx={-52} cy={-6} r={58} fill={C.case3} stroke={C.ink} strokeWidth={4} />
          <circle cx={-52} cy={-6} r={40} fill={C.case2} stroke={C.ink} strokeWidth={3} />
          <circle cx={-52} cy={-6} r={14 + 2 * sound * Math.sin(t * 40)} fill={C.case1} />
        </g>
        {/* batería de botón */}
        <g style={hiG("bat")}>
          <defs><clipPath id={`bat${id}`}><circle cx={72} cy={-22} r={44} /></clipPath></defs>
          <circle cx={72} cy={-22} r={50} fill={K.ink} stroke={K.white} strokeWidth={5} />
          <g clipPath={`url(#bat${id})`}><rect x={20} y={-66 + 88 * (1 - clamp01(lvl))} width={110} height={100} fill={K.flow} /></g>
          <path d="M78,-50 L60,-18 L74,-18 L64,8 L88,-28 L74,-28 Z" fill={K.ink} opacity={0.55} />
        </g>
        {/* placa con el chip de radio */}
        <g style={hiG("chip")}>
          <rect x={40} y={112} width={68} height={86} rx={8} fill={C.board} stroke={C.ink} strokeWidth={3} />
          <rect x={56} y={132} width={36} height={36} rx={4} fill={K.ink} stroke={K.flow} strokeWidth={3} />
        </g>
        {/* antena por la varilla */}
        <path d="M100,200 L104,340" stroke={K.flow} strokeWidth={5} strokeLinecap="round" opacity={0.85} />
        {/* acelerómetro: chip con masa en muelles */}
        <g style={hiG("acc")} transform={`translate(${60 + shake},250)`}>
          <rect x={-22} y={-22} width={44} height={44} rx={5} fill={K.ink} stroke={C.case3} strokeWidth={3} />
          <path d="M-18,0 L-12,-5 L-8,5 L-4,0 M4,0 L8,-5 L12,5 L18,0" fill="none" stroke={C.case3} strokeWidth={2} />
          <rect x={-5 + shake * 0.8} y={-6} width={10} height={12} fill={K.flow} />
        </g>
        {/* micrófonos */}
        <g style={hiG("mic")}>
          <circle cx={73} cy={350} r={12} fill={K.ink} stroke={K.white} strokeWidth={4} />
          <circle cx={132} cy={-78} r={11} fill={K.ink} stroke={K.white} strokeWidth={4} />
        </g>
        {/* sensor de proximidad: emisor (naranja) y detector (oscuro) mirando a la oreja */}
        <g style={hiG("sensor")} transform="translate(-92,78) rotate(32)">
          <ellipse cx={0} cy={0} rx={30} ry={17} fill={K.ink} stroke={C.case3} strokeWidth={3} />
          <circle cx={-12} cy={0} r={7} fill={K.hot} opacity={0.4 + 0.6 * ir} style={ir > 0.05 ? { filter: `drop-shadow(0 0 ${10 * ir}px ${K.hot})` } : undefined} />
          <circle cx={12} cy={0} r={7} fill="#33435c" stroke={ir > 0.05 ? K.hot : C.case3} strokeWidth={2} />
        </g>
        {/* carcasa: se levanta hacia arriba a la derecha */}
        {open < 0.995 && (
          <g transform={`translate(${shellDx * open},${shellDy * open}) rotate(${12 * open})`} opacity={1 - 0.3 * open}>
            <path d={stem} fill={C.case2} stroke={C.ink} strokeWidth={5} />
            <path d={body} fill={C.case2} stroke={C.ink} strokeWidth={5} />
            <path d="M-80,-100 C-20,-130 70,-128 112,-84" fill="none" stroke={K.white} strokeOpacity={0.28} strokeWidth={14} strokeLinecap="round" />
            <path d="M50,120 L56,360" stroke={K.white} strokeOpacity={0.22} strokeWidth={12} strokeLinecap="round" />
            <circle cx={132} cy={-78} r={9} fill={C.case1} />
            <circle cx={73} cy={385} r={6} fill={C.case1} />
            <g transform="translate(-92,78) rotate(32)">
              <ellipse cx={0} cy={0} rx={30} ry={17} fill={K.ink} />
              <circle cx={-12} cy={0} r={6} fill={K.hot} opacity={0.25 + 0.75 * ir} style={ir > 0.05 ? { filter: `drop-shadow(0 0 ${10 * ir}px ${K.hot})` } : undefined} />
            </g>
          </g>
        )}
        {/* contactos de carga en la punta de la varilla */}
        <g style={hiG("contacts")}>
          {[52, 94].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={392} r={11} fill={C.gold} stroke={C.ink} strokeWidth={3} style={glowContacts > 0.05 ? { filter: `drop-shadow(0 0 ${12 * glowContacts}px ${K.flow})` } : undefined} />
              {dirt > 0.01 && <circle cx={cx + 2} cy={391} r={9} fill={C.dirt} opacity={dirt} />}
            </g>
          ))}
        </g>
      </g>
    );
  };

/** Oreja de perfil (silueta neutra). Centro aproximado del conducto en (x, y). */
export const Ear: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {/* cabeza recortada a la izquierda */}
    <path d="M-420,-380 C-200,-420 -120,-300 -110,-190 L-110,330 C-150,420 -300,440 -420,420 Z" fill={C.skin2} opacity={0.55} />
    <path d="M-120,-250 C-40,-330 120,-320 170,-200 C210,-100 190,10 140,80 C110,125 120,180 80,250 C40,320 -60,330 -100,260 C-130,200 -130,-170 -120,-250 Z" fill={C.skin} stroke={C.ink} strokeWidth={5} />
    <path d="M-60,-200 C0,-260 110,-240 130,-150 C150,-70 120,0 80,40" fill="none" stroke={C.skin2} strokeWidth={22} strokeLinecap="round" />
    <path d="M-70,-40 C-40,-100 50,-100 60,-20 C70,50 10,90 -40,70 C-70,55 -85,0 -70,-40 Z" fill={C.skin2} />
    <ellipse cx={-30} cy={0} rx={30} ry={36} fill="#5B3426" />
  </g>
);

/** Móvil genérico. */
export const Phone: React.FC<{ x: number; y: number; s?: number; rot?: number; o?: number; children?: React.ReactNode }> = ({ x, y, s = 1, rot = 0, o = 1, children }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <rect x={-70} y={-130} width={140} height={260} rx={24} fill={C.case1} stroke={C.ink} strokeWidth={5} />
    <rect x={-58} y={-112} width={116} height={222} rx={14} fill="#123158" />
    <rect x={-20} y={-124} width={40} height={7} rx={3} fill={C.ink} />
    {children}
  </g>
);

/** Estuche de carga abierto con su batería interna y los dos auriculares encajados. */
export const Case: React.FC<{ x: number; y: number; s?: number; t: number; lid?: number; lvl?: number; budLvl?: number; flow?: number; hi?: string; contacts?: number; buds?: boolean; dirt?: number }> =
  ({ x, y, s = 1, t, lid = 1, lvl = 0.8, budLvl = 0.4, flow = 0, hi = "", contacts = 0, buds = true, dirt = 0 }) => {
    const hiG = (k: string) => (hi === k ? { filter: `drop-shadow(0 0 16px ${K.flow})` } : undefined);
    return (
      <g transform={`translate(${x},${y}) scale(${s})`}>
        {/* tapa con bisagra en (−200,−10) */}
        <g transform={`rotate(${-105 * lid} -200 -10)`}>
          <path d="M-200,-10 L200,-10 L200,-60 Q200,-150 100,-150 L-100,-150 Q-200,-150 -200,-60 Z" fill={C.case2} stroke={C.ink} strokeWidth={6} />
          <path d="M-150,-120 Q-40,-140 120,-128" fill="none" stroke={K.white} strokeOpacity={0.25} strokeWidth={12} strokeLinecap="round" />
        </g>
        {/* cuerpo */}
        <path d="M-200,0 L200,0 L200,150 Q200,250 100,250 L-100,250 Q-200,250 -200,150 Z" fill={C.inner} stroke={C.case1} strokeWidth={6} />
        {/* huecos y auriculares (de varilla hacia abajo) */}
        {[-90, 90].map((bx, k) => (
          <g key={k}>
            <rect x={bx - 32} y={-6} width={64} height={150} rx={30} fill="#08111F" stroke={C.case1} strokeWidth={4} />
            {/* contactos del estuche al fondo del hueco */}
            {[-14, 14].map((cx) => (
              <g key={cx} style={hiG("contacts")}>
                <circle cx={bx + cx} cy={130} r={9} fill={C.gold} stroke={C.ink} strokeWidth={3} style={contacts > 0.05 ? { filter: `drop-shadow(0 0 ${12 * contacts}px ${K.flow})` } : undefined} />
                {dirt > 0.01 && <circle cx={bx + cx + 1} cy={129} r={8} fill={C.dirt} opacity={dirt} />}
              </g>
            ))}
            {buds && (
              <g>
                <rect x={bx - 24} y={-30} width={48} height={150} rx={22} fill={C.case3} stroke={C.ink} strokeWidth={4} />
                <ellipse cx={bx} cy={-46} rx={56} ry={40} fill={C.case3} stroke={C.ink} strokeWidth={4} />
                {/* nivel de la batería del auricular */}
                <rect x={bx - 12} y={-8} width={24} height={104} rx={8} fill={K.ink} stroke={K.white} strokeWidth={3} />
                <rect x={bx - 8} y={-4 + 96 * (1 - clamp01(budLvl))} width={16} height={96 * clamp01(budLvl)} rx={5} fill={K.flow} />
              </g>
            )}
          </g>
        ))}
        {/* batería grande del estuche */}
        <g style={hiG("bat")}>
          <rect x={-150} y={160} width={300} height={70} rx={16} fill={K.ink} stroke={K.white} strokeWidth={5} />
          <rect x={150} y={180} width={12} height={30} rx={4} fill={C.case3} />
          <rect x={-142} y={168} width={284 * clamp01(lvl)} height={54} rx={10} fill={K.flow} />
        </g>
        {/* corriente de la batería del estuche a los contactos */}
        {flow > 0.01 && [-90, 90].map((bx) => <Flow key={bx} d={`M${bx * 0.6},160 L${bx},150 L${bx},138`} t={t} w={6} o={flow} />)}
        {/* luz del estuche */}
        <circle cx={0} cy={40} r={9} fill={flow > 0.2 ? K.flow : "#33435c"} style={flow > 0.2 ? { filter: `drop-shadow(0 0 8px ${K.flow})` } : undefined} />
      </g>
    );
  };

/** Silueta neutra de frente (cabeza + hombros) con un auricular en cada oreja. */
export const Person: React.FC<{ x: number; y: number; s?: number; lostL?: number; t: number }> = ({ x, y, s = 1, lostL = 0, t }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-300,520 C-300,330 -200,260 0,260 C200,260 300,330 300,520 Z" fill={C.case1} />
    <rect x={-60} y={170} width={120} height={110} fill={C.skin2} />
    <ellipse cx={0} cy={0} rx={170} ry={205} fill={C.skin} />
    <ellipse cx={-172} cy={20} rx={30} ry={52} fill={C.skin2} />
    <ellipse cx={172} cy={20} rx={30} ry={52} fill={C.skin2} />
    {/* auriculares */}
    <g>
      <ellipse cx={-186} cy={14} rx={30} ry={26} fill={lostL > 0.5 ? K.warn : C.case3} stroke={C.ink} strokeWidth={4} />
      <rect x={-200} y={24} width={20} height={70} rx={9} fill={lostL > 0.5 ? K.warn : C.case3} stroke={C.ink} strokeWidth={4} />
    </g>
    <g>
      <ellipse cx={186} cy={14} rx={30} ry={26} fill={C.case3} stroke={C.ink} strokeWidth={4} />
      <rect x={180} y={24} width={20} height={70} rx={9} fill={C.case3} stroke={C.ink} strokeWidth={4} />
    </g>
  </g>
);

/** Bastoncillo de algodón. */
export const Swab: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <rect x={-8} y={0} width={16} height={340} rx={7} fill="#E8EEF5" stroke={C.ink} strokeWidth={4} />
    <ellipse cx={0} cy={-6} rx={30} ry={46} fill={K.white} stroke={C.ink} strokeWidth={4} />
    <path d="M-16,-30 q16,-12 32,0 M-18,-8 q18,-12 36,0 M-16,14 q16,-12 32,0" fill="none" stroke="#C9D6E6" strokeWidth={4} />
  </g>
);

/** Microondas (icono). */
export const Microwave: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-80} y={-55} width={160} height={110} rx={12} fill={C.case3} stroke={C.ink} strokeWidth={5} />
    <rect x={-66} y={-42} width={100} height={84} rx={8} fill={C.inner} />
    <circle cx={57} cy={-26} r={8} fill={C.case1} /><circle cx={57} cy={0} r={8} fill={C.case1} />
    <rect x={48} y={20} width={18} height={20} rx={3} fill={C.case1} />
  </g>
);

/** Router wifi (icono). */
export const Router: React.FC<{ x: number; y: number; o: number; t: number }> = ({ x, y, o, t }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-80} y={0} width={160} height={50} rx={12} fill={C.case3} stroke={C.ink} strokeWidth={5} />
    <rect x={-55} y={-50} width={10} height={52} rx={4} fill={C.case3} stroke={C.ink} strokeWidth={3} />
    <rect x={45} y={-50} width={10} height={52} rx={4} fill={C.case3} stroke={C.ink} strokeWidth={3} />
    {[-40, -15, 10, 35].map((cx, i) => <circle key={cx} cx={cx} cy={25} r={6} fill={Math.sin(t * 6 + i) > 0 ? K.flow : C.case1} />)}
  </g>
);
