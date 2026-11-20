// Dibujos SVG del episodio «cómo detecta la máquina del súper un billete falso». Todos son <g> para meter en un <svg 1080×1920>.
// El billete es GENÉRICO y caricaturesco (no reproduce el diseño real): solo sirve para señalar dónde está cada elemento de seguridad.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = {
  case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#06101F", go: "#2EE59D",
  paper: "#B9D3C2", paperHi: "#E4EFE6", print: "#4F8574", uv: "#9B6BFF", uvDark: "#1C1540",
  emerald: "#14B37D", deepBlue: "#1D3C9E", fR: "#FF4D6D", fB: "#4DA3FF", fG: "#4DFF88",
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** Mezcla dos colores #rrggbb (k 0→1). */
export const mix = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b), q = Math.max(0, Math.min(1, k));
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * q).toString(16).padStart(2, "0")).join("");
};
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Posiciones locales (x, y, ancho, alto) de las dos zonas con tinta magnética del billete de ancho W y alto H. */
export const magZones = (W: number, H: number) => [
  { x: W * 0.17, y: -H * 0.05, w: W * 0.13, h: H * 0.42 },
  { x: W / 2 - 205, y: -H / 2 + 34, w: 104, h: 62 },
];

type NoteP = {
  id: string; x: number; y: number; W?: number; H?: number; rot?: number; sx?: number; t?: number;
  val?: string; tint?: string; ink?: string;
  uv?: number; fib?: [number, number, number]; uvInk?: number; ir?: number; back?: number; mag?: number; holo?: number; emerald?: number; relief?: number;
};
/** Billete genérico centrado en (x, y). uv: luz ultravioleta (el papel se queda oscuro; fibras y tintas brillan); fib: brillo de fibras rojas/azules/verdes;
 *  ir: infrarrojo (solo se ven la parte derecha del motivo, la banda y el número); back: a contraluz (marca de agua e hilo); mag: zonas magnéticas;
 *  holo 0→1: la banda holográfica cambia de imagen; emerald 0→1: número verde → azul; relief: rayas en relieve de los bordes. */
export const Note: React.FC<NoteP> = ({ id, x, y, W = 660, H = 350, rot = 0, sx = 1, t = 0, val = "50", tint = C.paper, ink = C.print,
  uv = 0, fib, uvInk, ir = 0, back = 0, mag = 0, holo = 0, emerald = 0, relief = 0 }) => {
  const f = fib ?? [uv, uv, uv];
  const ui = uvInk ?? uv;
  const L = -W / 2, T = -H / 2;
  const wmW = W * 0.2, thX = L + W * 0.27, stX = W / 2 - 86, stW = 56;
  const arches = [-W * 0.07, W * 0.07, W * 0.22];
  const arch = (cx: number, k: number, stroke: string, sw: number, o: number) => {
    const aw = W * 0.105, ah = H * 0.42, y0 = H * 0.2;
    return (
      <g key={k} opacity={o}>
        <path d={`M ${cx - aw / 2} ${y0} L ${cx - aw / 2} ${y0 - ah * 0.6} A ${aw / 2} ${aw / 2} 0 0 1 ${cx + aw / 2} ${y0 - ah * 0.6} L ${cx + aw / 2} ${y0}`}
          fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <path d={`M ${cx - aw / 4} ${y0} L ${cx - aw / 4} ${y0 - ah * 0.5} A ${aw / 4} ${aw / 4} 0 0 1 ${cx + aw / 4} ${y0 - ah * 0.5} L ${cx + aw / 4} ${y0}`}
          fill="none" stroke={stroke} strokeWidth={sw * 0.6} />
        <line x1={cx - aw / 2 - 8} y1={y0 + 4} x2={cx + aw / 2 + 8} y2={y0 + 4} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </g>
    );
  };
  const holoShift = (t * 0.25 + holo) % 1;
  const emCol = mix(C.emerald, C.deepBlue, emerald);
  const fibres = Array.from({ length: 46 }).map((_, i) => ({
    x: L + 24 + rnd(i) * (W - 48), y: T + 22 + rnd(i + 99) * (H - 44), a: rnd(i + 7) * 180, c: i % 3,
  }));
  const fc = [C.fR, C.fB, C.fG];
  const mz = magZones(W, H);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sx} 1)`}>
      <defs>
        <linearGradient id={`${id}-holo`} x1="0" y1="0" x2="0" y2="1" gradientTransform={`translate(0 ${holoShift - 0.5})`} spreadMethod="repeat">
          <stop offset="0" stopColor="#E6EEF7" /><stop offset="0.2" stopColor="#9FE7FF" /><stop offset="0.4" stopColor="#FFB3F0" />
          <stop offset="0.6" stopColor="#FFF3A6" /><stop offset="0.8" stopColor="#B3FFD1" /><stop offset="1" stopColor="#E6EEF7" />
        </linearGradient>
        <clipPath id={`${id}-clip`}><rect x={L} y={T} width={W} height={H} rx={18} /></clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        {/* papel */}
        <rect x={L} y={T} width={W} height={H} fill={tint} />
        <rect x={L + 14} y={T + 14} width={W - 28} height={H - 28} rx={10} fill="none" stroke={ink} strokeWidth={4} opacity={0.45} />
        {/* guilloché suave */}
        {[0, 1, 2, 3, 4].map((k) => (
          <ellipse key={k} cx={W * 0.07} cy={0} rx={W * 0.18 + k * 26} ry={H * 0.22 + k * 16} fill="none" stroke={ink} strokeWidth={2} opacity={0.16} />
        ))}
        {/* zona sin imprimir de la marca de agua */}
        <rect x={L + 18} y={T + 18} width={wmW} height={H - 100} rx={10} fill={C.paperHi} opacity={0.8} />
        {/* motivo principal: tres arcos */}
        {arches.map((cx, k) => arch(cx, k, ink, 7, 1))}
        {/* círculo de puntos */}
        {Array.from({ length: 10 }).map((_, k) => {
          const a = (k / 10) * Math.PI * 2;
          return <circle key={k} cx={-W * 0.13 + 30 * Math.cos(a)} cy={T + 62 + 30 * Math.sin(a)} r={5} fill={ink} opacity={0.6} />;
        })}
        {/* valor grande */}
        <text x={W / 2 - 154} y={T + 86} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={H * 0.2} fill={ink}>{val}</text>
        {/* hilo de seguridad (apenas se ve si no es a contraluz) */}
        <rect x={thX - 3} y={T} width={6} height={H} fill={ink} opacity={0.22} />
        {/* banda holográfica */}
        <rect x={stX} y={T} width={stW} height={H} fill={`url(#${id}-holo)`} />
        <g opacity={1 - holo}>
          <text x={stX + stW / 2} y={-H * 0.12} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={40} fill="#6C7C90">€</text>
          <text x={stX + stW / 2} y={H * 0.2} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={24} fill="#6C7C90">{val}</text>
        </g>
        <g opacity={holo}>
          <path d={`M ${stX + 12} ${-H * 0.02} L ${stX + 12} ${-H * 0.18} A 16 16 0 0 1 ${stX + stW - 12} ${-H * 0.18} L ${stX + stW - 12} ${-H * 0.02}`} fill="none" stroke="#6C7C90" strokeWidth={6} />
          <circle cx={stX + stW / 2} cy={H * 0.18} r={14} fill="none" stroke="#6C7C90" strokeWidth={5} />
        </g>
        {/* número esmeralda */}
        <text x={L + 30} y={H / 2 - 28} fontFamily="MontserratSerie" fontWeight={900} fontSize={H * 0.17} fill={emCol}>{val}</text>
        {/* relieve en los bordes */}
        {relief > 0.01 && [L + 6, W / 2 - 14].map((ex, s) => [0, 1, 2, 3].map((k) => (
          <line key={`${s}${k}`} x1={ex} y1={-H * 0.2 + k * 28} x2={ex + 8} y2={-H * 0.2 + k * 28 + 14} stroke={K.flow} strokeWidth={5} strokeLinecap="round" opacity={relief}
            style={{ filter: `drop-shadow(0 0 6px ${K.flow})` }} />
        )))}

        {/* ---- a contraluz ---- */}
        {back > 0.01 && (
          <g opacity={back}>
            <rect x={L} y={T} width={W} height={H} fill="#FFF6D8" opacity={0.28} />
            {/* marca de agua: retrato tenue y valor */}
            <ellipse cx={L + 18 + wmW / 2} cy={T + 92} rx={34} ry={44} fill="#FFFFFF" opacity={0.75} />
            <path d={`M ${L + 18 + wmW / 2 - 58} ${T + 200} Q ${L + 18 + wmW / 2} ${T + 120} ${L + 18 + wmW / 2 + 58} ${T + 200} Z`} fill="#FFFFFF" opacity={0.6} />
            <text x={L + 18 + wmW / 2} y={T + H - 112} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={44} fill="#FFFFFF" opacity={0.75}>{val}</text>
            {/* hilo oscuro */}
            <rect x={thX - 5} y={T} width={10} height={H} fill="#1B2A38" />
          </g>
        )}

        {/* ---- ultravioleta: el papel NO brilla (se queda oscuro) ---- */}
        {uv > 0.01 && <rect x={L} y={T} width={W} height={H} fill={C.uvDark} opacity={0.86 * uv} />}
        {/* fibras (brillan solo con UV) */}
        {fibres.map((p, i) => {
          const k = f[p.c];
          const col = k > 0.01 ? fc[p.c] : ink;
          return <line key={i} x1={p.x - 9 * Math.cos(p.a)} y1={p.y - 9 * Math.sin(p.a)} x2={p.x + 9 * Math.cos(p.a)} y2={p.y + 9 * Math.sin(p.a)}
            stroke={col} strokeWidth={k > 0.01 ? 4 : 2} strokeLinecap="round" opacity={k > 0.01 ? k : 0.12}
            style={k > 0.3 ? { filter: `drop-shadow(0 0 5px ${col})` } : {}} />;
        })}
        {/* tintas UV: círculo de puntos amarillo y arco central verde */}
        {ui > 0.01 && (
          <g opacity={ui} style={{ filter: `drop-shadow(0 0 10px ${K.flow})` }}>
            {Array.from({ length: 10 }).map((_, k) => {
              const a = (k / 10) * Math.PI * 2;
              return <circle key={k} cx={-W * 0.13 + 30 * Math.cos(a)} cy={T + 62 + 30 * Math.sin(a)} r={6} fill={K.flow} />;
            })}
            {arch(arches[1], 9, C.fG, 8, 1)}
            <rect x={W * 0.02} y={H / 2 - 54} width={W * 0.26} height={16} rx={8} fill={K.hot} />
          </g>
        )}

        {/* ---- infrarrojo: solo quedan algunas partes ---- */}
        {ir > 0.01 && (
          <g>
            <rect x={L} y={T} width={W} height={H} fill="#2A1A14" opacity={0.9 * ir} />
            <g opacity={ir} style={{ filter: `drop-shadow(0 0 8px ${K.hot})` }}>
              {arch(arches[2], 8, K.hot, 8, 1)}
              <rect x={stX} y={T} width={stW} height={H} fill={K.hot} opacity={0.75} />
              <text x={L + 30} y={H / 2 - 28} fontFamily="MontserratSerie" fontWeight={900} fontSize={H * 0.17} fill={K.hot}>{val}</text>
            </g>
          </g>
        )}

        {/* ---- zonas magnéticas ---- */}
        {mag > 0.01 && mz.map((z, i) => (
          <rect key={i} x={z.x - z.w / 2} y={z.y - z.h / 2} width={z.w} height={z.h} rx={10} fill={K.flow} fillOpacity={0.3 * mag}
            stroke={K.flow} strokeWidth={5} strokeDasharray="12 8" opacity={mag} style={{ filter: `drop-shadow(0 0 ${8 + 4 * Math.sin(t * 6)}px ${K.flow})` }} />
        ))}
      </g>
      <rect x={L} y={T} width={W} height={H} rx={18} fill="none" stroke={uv > 0.5 || ir > 0.5 ? "#4A3F7A" : ink} strokeWidth={5} />
    </g>
  );
};

/** Lámpara (tubo) con haz hacia abajo. */
export const Lamp: React.FC<{ id: string; x: number; y: number; w?: number; beam?: number; spread?: number; color?: string; on: number; t: number; dashed?: boolean }> =
  ({ id, x, y, w = 420, beam = 520, spread = 1.5, color = C.uv, on, t, dashed = false }) => (
    <g>
      <defs>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.55} /><stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {on > 0.01 && (dashed
        ? <path d={`M ${x - w / 2 + 20} ${y + 30} L ${x - (w / 2) * spread} ${y + beam} M ${x + w / 2 - 20} ${y + 30} L ${x + (w / 2) * spread} ${y + beam}`}
            stroke={color} strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={-t * 40} opacity={0.7 * on} fill="none" />
        : <path d={`M ${x - w / 2 + 20} ${y + 30} L ${x + w / 2 - 20} ${y + 30} L ${x + (w / 2) * spread} ${y + beam} L ${x - (w / 2) * spread} ${y + beam} Z`}
            fill={`url(#${id}-b)`} opacity={on * (0.85 + 0.15 * Math.sin(t * 7))} />)}
      <rect x={x - w / 2} y={y - 36} width={w} height={60} rx={20} fill={C.case1} stroke={C.case3} strokeWidth={5} />
      <rect x={x - w / 2 + 22} y={y + 6} width={w - 44} height={20} rx={10} fill={on > 0.05 ? color : "#3a3550"}
        style={on > 0.05 ? { filter: `drop-shadow(0 0 ${10 + 10 * on}px ${color})` } : {}} />
    </g>
  );

/** Folio normal: con blanqueantes brilla azulado bajo UV. */
export const Sheet: React.FC<{ x: number; y: number; w?: number; h?: number; glow: number; uv?: number }> = ({ x, y, w = 260, h = 340, glow, uv = 1 }) => {
  const base = mix("#F2F5FA", C.uvDark, uv * (1 - glow) * 0.85);
  const fill = mix(base, "#CFEAFF", glow);
  return (
    <g style={glow > 0.05 ? { filter: `drop-shadow(0 0 ${20 + 30 * glow}px #7FC8FF)` } : {}}>
      <path d={`M ${x - w / 2} ${y - h / 2} L ${x + w / 2 - 50} ${y - h / 2} L ${x + w / 2} ${y - h / 2 + 50} L ${x + w / 2} ${y + h / 2} L ${x - w / 2} ${y + h / 2} Z`} fill={fill} />
      <path d={`M ${x + w / 2 - 50} ${y - h / 2} L ${x + w / 2 - 50} ${y - h / 2 + 50} L ${x + w / 2} ${y - h / 2 + 50}`} fill={mix(fill, "#9FB3CC", 0.4)} />
      {[0, 1, 2, 3, 4, 5].map((k) => <line key={k} x1={x - w / 2 + 30} y1={y - h / 2 + 90 + k * 38} x2={x + w / 2 - 30 - (k % 2) * 50} y2={y - h / 2 + 90 + k * 38}
        stroke={mix(fill, "#6C7C90", 0.35)} strokeWidth={8} strokeLinecap="round" />)}
    </g>
  );
};

/** Cabezal magnético (imán en U con bobina) mirando hacia abajo, con líneas de campo. */
export const MagHead: React.FC<{ x: number; y: number; s?: number; t: number; o?: number; field?: number }> = ({ x, y, s = 1, t, o = 1, field = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -70 -60 L -70 40 L -36 40 L -36 -26 L 36 -26 L 36 40 L 70 40 L 70 -60 Z" fill={C.case3} stroke={C.dark} strokeWidth={4} />
    <rect x={-74} y={22} width={44} height={22} fill={K.warn} opacity={0.9} />
    <rect x={30} y={22} width={44} height={22} fill={K.cold} opacity={0.9} />
    {[0, 1, 2, 3].map((k) => <rect key={k} x={-80 + k * 0} y={-50 + k * 18} width={160} height={10} rx={5} fill={K.flow} opacity={0.85} />)}
    {field > 0.01 && [0, 1, 2].map((i) => {
      const p = (t * 1.1 + i / 3) % 1;
      const r = 30 + p * 60;
      return <path key={i} d={`M -53 48 Q 0 ${48 + r * 1.4} 53 48`} fill="none" stroke={K.flow} strokeWidth={5} strokeDasharray="10 8" opacity={field * (1 - p)} />;
    })}
  </g>
);

/** Señal de un sensor: línea con picos. peaks = lista de {x (0-1), a (0-1)}. */
export const Wave: React.FC<{ x: number; y: number; w: number; h: number; peaks: { x: number; a: number }[]; o?: number; color?: string; t: number }> =
  ({ x, y, w, h, peaks, o = 1, color = K.flow, t }) => {
    const n = 120;
    const pts = Array.from({ length: n + 1 }).map((_, i) => {
      const u = i / n;
      let v = 0.04 * Math.sin(u * 60 + t * 9);
      peaks.forEach((p) => { v += p.a * Math.exp(-((u - p.x) ** 2) / 0.0012) * (Math.sin((u - p.x) * 160) > -0.2 ? 1 : -0.6); });
      return `${x - w / 2 + u * w},${y - v * h * 0.45}`;
    }).join(" ");
    return (
      <g opacity={o}>
        <rect x={x - w / 2 - 20} y={y - h / 2 - 10} width={w + 40} height={h + 20} rx={16} fill="rgba(6,16,31,0.85)" stroke={C.case2} strokeWidth={4} />
        <line x1={x - w / 2} y1={y} x2={x + w / 2} y2={y} stroke="rgba(255,255,255,0.15)" strokeWidth={3} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </g>
    );
  };

/** Par de rodillos que miden el grosor; la hoja pasa por en medio. */
export const Rollers: React.FC<{ x: number; y: number; r?: number; t: number; o?: number; gap?: number; glow?: number }> = ({ x, y, r = 56, t, o = 1, gap = 12, glow = 0 }) => (
  <g opacity={o}>
    <rect x={x - 200} y={y - gap / 2} width={400} height={gap} rx={4} fill={C.paper} />
    {[-1, 1].map((s) => (
      <g key={s} transform={`translate(${x} ${y + s * (r + gap / 2)}) rotate(${s * t * 160})`}>
        <circle r={r} fill={C.case2} stroke={glow > 0.05 ? K.flow : C.case3} strokeWidth={6} style={glow > 0.05 ? { filter: `drop-shadow(0 0 ${10 * glow}px ${K.flow})` } : {}} />
        {[0, 60, 120].map((a) => <line key={a} x1={-r + 12} y1={0} x2={r - 12} y2={0} transform={`rotate(${a})`} stroke={C.case1} strokeWidth={6} />)}
        <circle r={12} fill={C.case3} />
      </g>
    ))}
  </g>
);

/** Flecha de cota con extremos. */
export const Dim: React.FC<{ x1: number; y1: number; x2: number; y2: number; o: number; color?: string }> = ({ x1, y1, x2, y2, o, color = K.cold }) => {
  if (o <= 0.01) return null;
  const a = Math.atan2(y2 - y1, x2 - x1), k = 20;
  const p = Math.min(1, o * 1.2);
  const ex = x1 + (x2 - x1) * p, ey = y1 + (y2 - y1) * p;
  return (
    <g opacity={o} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x1} y1={y1} x2={ex} y2={ey} />
      <path d={`M ${x1 + Math.cos(a + 0.5) * k} ${y1 + Math.sin(a + 0.5) * k} L ${x1} ${y1} L ${x1 + Math.cos(a - 0.5) * k} ${y1 + Math.sin(a - 0.5) * k}`} />
      {p >= 1 && <path d={`M ${x2 - Math.cos(a + 0.5) * k} ${y2 - Math.sin(a + 0.5) * k} L ${x2} ${y2} L ${x2 - Math.cos(a - 0.5) * k} ${y2 - Math.sin(a - 0.5) * k}`} />}
    </g>
  );
};

/** Máquina detectora vista en corte: el billete pasa por rodillos bajo la lámpara UV, el emisor infrarrojo, el cabezal magnético y los rodillos de grosor. */
export const Machine: React.FC<{ id: string; x: number; y: number; w?: number; h?: number; t: number; uv?: number; ir?: number; mag?: number; thick?: number; led?: number; feed?: number }> =
  ({ id, x, y, w = 820, h = 500, t, uv = 0, ir = 0, mag = 0, thick = 0, led = 0, feed = 1 }) => {
    const L = x - w / 2, T = y - h / 2, py = y + 70;
    const sx = [x - 250, x - 85, x + 80, x + 245];
    const nx = L + 30 + (((t * 0.32) % 1) * (w + 220)) - 220;
    return (
      <g>
        <defs><clipPath id={`${id}-win`}><rect x={L + 30} y={T + 90} width={w - 60} height={h - 120} rx={20} /></clipPath></defs>
        <rect x={L} y={T} width={w} height={h} rx={34} fill={C.case1} stroke={C.case3} strokeWidth={6} />
        <rect x={L + 30} y={T + 90} width={w - 60} height={h - 120} rx={20} fill={C.dark} stroke={C.case2} strokeWidth={4} />
        {/* panel con la luz de resultado */}
        <rect x={L + 40} y={T + 24} width={300} height={44} rx={22} fill={C.dark} />
        <circle cx={L + 70} cy={T + 46} r={16} fill={led > 0.01 ? C.go : led < -0.01 ? K.warn : "#24364f"}
          style={Math.abs(led) > 0.01 ? { filter: `drop-shadow(0 0 ${12 + 6 * Math.sin(t * 10)}px ${led > 0 ? C.go : K.warn})` } : {}} />
        {[0, 1, 2, 3].map((k) => <rect key={k} x={L + 110 + k * 52} y={T + 36} width={36} height={20} rx={6}
          fill={[uv, ir, mag, thick][k] > 0.3 ? [C.uv, K.hot, K.flow, K.cold][k] : "#24364f"} />)}
        <rect x={x + w / 2 - 190} y={T + 30} width={150} height={32} rx={10} fill={C.case2} />
        <g clipPath={`url(#${id}-win)`}>
          {/* recorrido del billete */}
          <line x1={L + 30} y1={py} x2={x + w / 2 - 30} y2={py} stroke="rgba(255,255,255,0.12)" strokeWidth={4} strokeDasharray="10 10" />
          {feed > 0.01 && <rect x={nx} y={py - 7} width={220} height={14} rx={4} fill={C.paper} />}
          {/* rodillos de arrastre */}
          {[L + 70, x + w / 2 - 70].map((rx, i) => [-1, 1].map((s) => (
            <g key={`${i}${s}`} transform={`translate(${rx} ${py + s * 30}) rotate(${t * 200 * s})`}>
              <circle r={22} fill={C.case2} stroke={C.case3} strokeWidth={4} /><line x1={-16} y1={0} x2={16} y2={0} stroke={C.case1} strokeWidth={5} />
            </g>
          )))}
          {/* UV */}
          <path d={`M ${sx[0] - 40} ${py - 110} L ${sx[0] + 40} ${py - 110} L ${sx[0] + 70} ${py} L ${sx[0] - 70} ${py} Z`} fill={C.uv} opacity={0.35 * uv} />
          <rect x={sx[0] - 60} y={py - 150} width={120} height={40} rx={14} fill={uv > 0.05 ? C.uv : "#3a3550"} stroke={C.case3} strokeWidth={4}
            style={uv > 0.05 ? { filter: `drop-shadow(0 0 ${14 * uv}px ${C.uv})` } : {}} />
          {/* IR: emisor arriba y receptor abajo */}
          <line x1={sx[1]} y1={py - 110} x2={sx[1]} y2={py + 90} stroke={K.hot} strokeWidth={8} strokeDasharray="12 10" strokeDashoffset={-t * 60} opacity={0.8 * ir} />
          <path d={`M ${sx[1] - 30} ${py - 120} A 30 30 0 0 1 ${sx[1] + 30} ${py - 120} Z`} fill={ir > 0.05 ? K.hot : "#4a3226"} stroke={C.case3} strokeWidth={4} transform={`rotate(180 ${sx[1]} ${py - 120})`} />
          <rect x={sx[1] - 26} y={py + 90} width={52} height={22} rx={6} fill={C.case2} stroke={C.case3} strokeWidth={3} />
          {/* magnético */}
          <MagHead x={sx[2]} y={py - 80} s={0.6} t={t} o={0.6 + 0.4 * mag} field={mag} />
          {/* grosor */}
          {[-1, 1].map((s) => (
            <g key={s} transform={`translate(${sx[3]} ${py + s * 38}) rotate(${t * 220 * s})`}>
              <circle r={30} fill={C.case2} stroke={thick > 0.05 ? K.cold : C.case3} strokeWidth={5} style={thick > 0.05 ? { filter: `drop-shadow(0 0 ${10 * thick}px ${K.cold})` } : {}} />
              <line x1={-22} y1={0} x2={22} y2={0} stroke={C.case1} strokeWidth={6} />
            </g>
          ))}
        </g>
      </g>
    );
  };

/** Bombilla / foco para mirar a contraluz. */
export const Glow: React.FC<{ id: string; x: number; y: number; r: number; o: number }> = ({ id, x, y, r, o }) => o <= 0.01 ? null : (
  <g opacity={o}>
    <defs><radialGradient id={`${id}-g`}><stop offset="0" stopColor="#FFF4C2" stopOpacity={0.95} /><stop offset="0.45" stopColor={K.flow} stopOpacity={0.35} /><stop offset="1" stopColor={K.flow} stopOpacity={0} /></radialGradient></defs>
    <circle cx={x} cy={y} r={r} fill={`url(#${id}-g)`} />
  </g>
);

/** Dedo (silueta neutra) que apunta hacia abajo-izquierda. */
export const Finger: React.FC<{ x: number; y: number; s?: number; rot?: number; o?: number }> = ({ x, y, s = 1, rot = -30, o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <rect x={-26} y={-10} width={52} height={170} rx={26} fill={C.case3} stroke={C.dark} strokeWidth={4} />
    <rect x={-14} y={0} width={28} height={36} rx={12} fill="#DCE6F2" />
    <rect x={-60} y={110} width={120} height={140} rx={40} fill={C.case3} stroke={C.dark} strokeWidth={4} />
  </g>
);

/** Ondas de sonido (arcos). */
export const SoundArcs: React.FC<{ x: number; y: number; dir?: 1 | -1; t: number; o: number }> = ({ x, y, dir = 1, t, o }) => o <= 0.01 ? null : (
  <g opacity={o}>
    {[0, 1, 2].map((i) => {
      const p = (t * 1.6 + i / 3) % 1, r = 20 + p * 70;
      return <path key={i} d={`M ${x} ${y - r} A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x} ${y + r}`} fill="none" stroke={K.white} strokeWidth={6} strokeLinecap="round" opacity={1 - p} />;
    })}
  </g>
);

/** Marca de verificación verde. */
export const Check: React.FC<{ x: number; y: number; s?: number; o: number }> = ({ x, y, s = 1, o }) => o <= 0.01 ? null : (
  <path d={`M ${x - 34 * s} ${y} L ${x - 8 * s} ${y + 28 * s} L ${x + 40 * s} ${y - 30 * s}`} fill="none" stroke={C.go} strokeWidth={12 * s} strokeLinecap="round" strokeLinejoin="round"
    opacity={o} style={{ filter: `drop-shadow(0 0 8px ${C.go})` }} />
);

/** Icono circular (para UV / IR / imán). */
export const Badge: React.FC<{ x: number; y: number; r?: number; color: string; kind: "uv" | "ir" | "mag"; t: number; o: number }> = ({ x, y, r = 72, color, kind, t, o }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill="rgba(6,16,31,0.85)" stroke={color} strokeWidth={6} style={{ filter: `drop-shadow(0 0 ${8 + 4 * Math.sin(t * 4)}px ${color})` }} />
    {kind === "uv" && [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
      const a = (k / 8) * Math.PI * 2;
      return <line key={k} x1={x + 22 * Math.cos(a)} y1={y + 22 * Math.sin(a)} x2={x + 42 * Math.cos(a)} y2={y + 42 * Math.sin(a)} stroke={color} strokeWidth={7} strokeLinecap="round" />;
    })}
    {kind === "uv" && <circle cx={x} cy={y} r={14} fill={color} />}
    {kind === "ir" && [0, 1, 2].map((k) => <path key={k} d={`M ${x - 40} ${y - 18 + k * 18} q 10 -14 20 0 t 20 0 t 20 0 t 20 0`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />)}
    {kind === "mag" && <path d={`M ${x - 32} ${y - 30} L ${x - 32} ${y + 6} A 32 32 0 0 0 ${x + 32} ${y + 6} L ${x + 32} ${y - 30} L ${x + 14} ${y - 30} L ${x + 14} ${y + 6} A 14 14 0 0 1 ${x - 14} ${y + 6} L ${x - 14} ${y - 30} Z`}
      fill={color} />}
  </g>
);
