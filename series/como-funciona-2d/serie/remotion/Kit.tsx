// Capa 2D de la serie: subtítulos palabra a palabra, etiqueta principal, línea de tiempo,
// etiquetas ancladas a puntos 3D, medidor, intro y cierre. Zonas seguras de la biblia visual.
import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig, Easing, staticFile, delayRender, continueRender } from "remotion";

// Montserrat en local (public/fonts): el render no depende de la red.
export const FONT = "MontserratSerie";
if (typeof document !== "undefined" && !(window as any).__fontSerie) {
  (window as any).__fontSerie = true;
  const h = delayRender("Montserrat");
  Promise.all(["800", "900"].map((w) =>
    new FontFace(FONT, `url(${staticFile(`fonts/Montserrat-${w}.woff2`)}) format("woff2")`, { weight: w }).load().then((f) => document.fonts.add(f))))
    .then(() => continueRender(h)).catch(() => continueRender(h));
}
export const K = { hot: "#FF7A1A", cold: "#35C4F0", flow: "#FFD23F", white: "#FFFFFF", warn: "#E53935", ink: "#06101F" };

export type Word = { beat: number; w: string; s: number; e: number };
export type Timing = { words: Word[]; voiceEnd: number; duration: number; beats: { s: number; e: number }[] };

/** Rango visible [t0, t1] con duración mínima, para que las entradas y salidas nunca se crucen. */
const win = (t0: number, t1: number, min = 1.2) => [t0, Math.max(t1, t0 + min)] as const;

const stroke = "0 0 2px #06101F, 0 0 2px #06101F, 0 4px 0 #06101F, 0 6px 18px rgba(0,0,0,0.65)";

/** Subtítulos: grupos de 3-4 palabras, palabra actual en amarillo. Banda y 1190-1420. */
export const Captions: React.FC<{ words: Word[]; t: number }> = ({ words, t }) => {
  // agrupar en trozos de hasta 4 palabras sin cruzar beats ni puntos
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const endSentence = /[.:;!?]$/.test(w.w);
    if (cur.length >= 4 || !next || next.beat !== w.beat || endSentence || (cur.length >= 3 && /,$/.test(w.w))) {
      chunks.push(cur); cur = [];
    }
  });
  const chunk = chunks.find((c, i) => t >= c[0].s - 0.05 && t < (chunks[i + 1]?.[0].s ?? c[c.length - 1].e + 0.4) - 0.05);
  if (!chunk || t > chunk[chunk.length - 1].e + 0.6) return null;
  const pop = interpolate(t - chunk[0].s, [0, 0.12], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 60, width: 900, top: 1190, height: 230, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 74, lineHeight: 1.08, textAlign: "center", color: K.white, textShadow: stroke, transform: `scale(${pop})` }}>
        {chunk.map((w, i) => {
          const nx = chunk[i + 1]?.s ?? w.e + 0.3; const active = t >= w.s - 0.04 && t < Math.min(nx - 0.04, w.e + 0.3);
          return <span key={i} style={{ color: active ? K.flow : K.white }}>{w.w}{i < chunk.length - 1 ? " " : ""}</span>;
        })}
      </div>
    </div>
  );
};

/** Etiqueta principal (y ≈ 320). */
export const MainLabel: React.FC<{ text: string; color?: string; t: number; t0: number; t1: number }> = ({ text, color = K.flow, t, t0: a0, t1: a1 }) => {
  const [t0, t1] = win(a0, a1);
  const a = interpolate(t, [t0, t0 + 0.25, t1 - 0.2, t1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (a <= 0) return null;
  const y = interpolate(a, [0, 1], [20, 0]);
  return (
    <div style={{ position: "absolute", top: 290, left: 60, width: 900, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${y}px)` }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 50, color, padding: "10px 26px", borderRadius: 16,
        background: "rgba(6,16,31,0.82)", border: `3px solid ${color}`, boxShadow: `0 0 28px ${color}55` }}>{text}</div>
    </div>
  );
};

/** Línea de tiempo (y ≈ 200-250). */
export const Timeline: React.FC<{ marks: string[]; active: number; t: number; t0: number; t1: number }> = ({ marks, active, t, t0: a0, t1: a1 }) => {
  const [t0, t1] = win(a0, a1);
  const a = interpolate(t, [t0, t0 + 0.3, t1 - 0.3, t1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (a <= 0) return null;
  const x0 = 110, x1 = 910;
  const xs = marks.map((_, i) => x0 + (x1 - x0) * (i / (marks.length - 1)));
  return (
    <div style={{ position: "absolute", top: 196, left: 0, width: 1080, height: 70, opacity: a }}>
      <div style={{ position: "absolute", left: x0, width: x1 - x0, top: 44, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.18)" }} />
      <div style={{ position: "absolute", left: x0, width: xs[active] - x0, top: 44, height: 5, borderRadius: 3, background: K.hot, boxShadow: `0 0 12px ${K.hot}` }} />
      {marks.map((m, i) => (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: xs[i] - 10, top: 37, width: 20, height: 20, borderRadius: 10, background: i <= active ? K.hot : "#33435c", border: "3px solid #06101F" }} />
          <div style={{ position: "absolute", left: xs[i] - 90, width: 180, top: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900,
            fontSize: i === active ? 34 : 26, color: i === active ? K.white : "rgba(255,255,255,0.55)", textShadow: stroke }}>{m}</div>
        </React.Fragment>
      ))}
    </div>
  );
};

/** Etiqueta flotante anclada a un punto (ya proyectado a píxeles) con línea guía. */
export const Callout: React.FC<{ text: string; anchor: { x: number; y: number }; offset: [number, number]; color?: string; t: number; t0: number; t1: number; size?: number }> =
  ({ text, anchor, offset, color = K.white, t, t0: a0, t1: a1, size = 42 }) => {
    const [t0, t1] = win(a0, a1);
    const a = interpolate(t, [t0, t0 + 0.3, t1 - 0.25, t1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (a <= 0) return null;
    // el texto nunca se sale de x 60-940: se estima su ancho y se empuja hacia dentro
    const tw = text.length * size * 0.62 + 28;
    const align = offset[0] < 0 ? 1 : offset[0] > 0 ? 0 : 0.5;
    const lx = Math.max(60 + tw * align, Math.min(940 - tw * (1 - align), anchor.x + offset[0]));
    const ly = Math.max(380, Math.min(1130, anchor.y + offset[1]));
    const grow = Easing.out(Easing.cubic)(Math.min(1, a * 1.4));
    const ex = anchor.x + (lx - anchor.x) * grow, ey = anchor.y + (ly - anchor.y) * grow;
    return (
      <>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: a }}>
          <line x1={anchor.x} y1={anchor.y} x2={ex} y2={ey} stroke={color} strokeWidth={4} strokeLinecap="round" />
          <circle cx={anchor.x} cy={anchor.y} r={9} fill={color} stroke="#06101F" strokeWidth={3} />
        </svg>
        <div style={{ position: "absolute", left: lx, top: ly, transform: `translate(${offset[0] < 0 ? "-100%" : offset[0] > 0 ? "0" : "-50%"}, -50%)`, opacity: a,
          fontFamily: FONT, fontWeight: 900, fontSize: size, color, whiteSpace: "nowrap", padding: "4px 14px", borderRadius: 12,
          background: "rgba(6,16,31,0.78)", textShadow: "0 2px 0 #06101F" }}>{text}</div>
      </>
    );
  };

/** Medidor circular con cifra grande. */
export const Gauge: React.FC<{ value: number; max: number; unit: string; color: string; x: number; y: number; label?: string; t: number; t0: number; t1: number; decimals?: number }> =
  ({ value, max, unit, color, x, y, label, t, t0: a0, t1: a1, decimals = 0 }) => {
    const [t0, t1] = win(a0, a1);
    const a = interpolate(t, [t0, t0 + 0.3, t1 - 0.25, t1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (a <= 0) return null;
    const r = 92, c = 2 * Math.PI * r, frac = Math.min(1, value / max);
    return (
      <div style={{ position: "absolute", left: x - 120, top: y - 120, width: 240, height: 240, opacity: a, transform: `scale(${0.8 + 0.2 * a})` }}>
        <svg width={240} height={240}>
          <circle cx={120} cy={120} r={r + 16} fill="rgba(6,16,31,0.85)" />
          <circle cx={120} cy={120} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={16} />
          <circle cx={120} cy={120} r={r} fill="none" stroke={color} strokeWidth={16} strokeLinecap="round"
            strokeDasharray={`${c * frac * 0.8} ${c}`} transform="rotate(126 120 120)" style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900 }}>
          <div style={{ fontSize: 58, color: K.white, textShadow: `0 0 18px ${color}` }}>{value.toFixed(decimals)}<span style={{ fontSize: 30 }}>{unit}</span></div>
          {label && <div style={{ fontSize: 24, color, marginTop: -4 }}>{label}</div>}
        </div>
      </div>
    );
  };

/** Intro 0,9 s: tira amarilla "CÓMO FUNCIONA · NN" en y ≈ 270. */
export const Intro: React.FC<{ n: number; frame: number }> = ({ n, frame }) => {
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t > 1.0) return null;
  const x = interpolate(t, [0, 0.18, 0.72, 0.9], [-1100, 0, 0, 1100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  return (
    <div style={{ position: "absolute", top: 236, left: 0, width: 1080, display: "flex", justifyContent: "center", transform: `translateX(${x}px)` }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 34px", borderRadius: 10, letterSpacing: 1 }}>
        CÓMO FUNCIONA · {String(n).padStart(2, "0")}
      </div>
    </div>
  );
};

/** Cierre: «Sígueme» + subtítulo (CTA de la serie). Sin `next`. */
export const Outro: React.FC<{ question: string; sub?: string; next?: string; frame: number; start: number }> = ({ question, sub = "Cuéntamelo en comentarios", next, frame, start }) => {
  const { fps } = useVideoConfig();
  if (frame < start) return null;
  const s = spring({ frame: frame - start, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ background: `rgba(5,12,26,${0.6 * s})` }}>
      <div style={{ position: "absolute", top: 600, left: 60, width: 900, textAlign: "center", transform: `scale(${0.85 + 0.15 * s})`, opacity: s }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: K.white, textShadow: stroke }}>{question}</div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 48, color: K.flow, marginTop: 26, textShadow: stroke }}>{sub}</div>
      </div>
      {next && (
        <div style={{ position: "absolute", top: 1030, left: 0, width: 1080, display: "flex", justifyContent: "center", opacity: s }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 36, color: K.ink, background: K.flow, padding: "8px 26px", borderRadius: 10 }}>
            CÓMO FUNCIONA · PRÓXIMO: {next.toUpperCase()}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ======================= Kit 2D de la serie (reconstruido el 31-10) =======================
export const BG = { top: "#0E2240", bottom: "#081428" };
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const k = clamp01(x); return k * k * (3 - 2 * k); };
/** 0→1 entre a y b (segundos), suavizado. */
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / Math.max(0.001, b - a));
/** Aparece en `a` (fundido `d`) y desaparece en `b`. */
export const span = (t: number, a: number, b: number, d = 0.3) => Math.min(ramp(t, a, a + d), b === Infinity ? 1 : 1 - ramp(t, b - d, b));
const normW = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");
/** Ayudantes de tiempo atados a la voz. Beats 1-based. */
export const useTiming = (timing: Timing) => {
  const B = timing.beats;
  const bs = (i: number) => B[i - 1].s;
  const be = (i: number) => B[i - 1].e;
  /** Inicio (s) de la primera palabra del beat i que empieza por w (sin tildes). Si no existe, inicio del beat. */
  const Wd = (i: number, w: string) => { const x = timing.words.find((k) => k.beat === i - 1 && normW(k.w).startsWith(normW(w))); return x ? x.s : B[i - 1].s; };
  /** Escena del beat i: desde su inicio hasta el inicio del siguiente (o el cierre). */
  const scene = (i: number) => [i === 1 ? 0 : bs(i) - 0.15, i < B.length ? bs(i + 1) - 0.15 : timing.voiceEnd + 0.3] as const;
  return { B, bs, be, Wd, scene, outroStart: timing.voiceEnd + 0.3 };
};

/** Fondo azul noche con viñeta suave. */
export const Bg: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 40%, ${BG.top} 0%, ${BG.bottom} 70%)` }} />
);

/** Escena con fundido de entrada/salida (0,25 s). */
export const Scene: React.FC<{ t: number; a: number; b: number; children: React.ReactNode }> = ({ t, a, b, children }) => {
  const o = Math.min(a <= 0 ? 1 : ramp(t, a, a + 0.25), 1 - ramp(t, b - 0.05, b + 0.2));
  if (o <= 0.001) return null;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** Chip de sección arriba (y ≈ 330). */
export const Chip: React.FC<{ text: string; color?: string; o: number }> = ({ text, color = K.flow, o }) => o <= 0.01 ? null : (
  <div style={{ position: "absolute", top: 300, left: 60, width: 960, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color, padding: "8px 24px", borderRadius: 14, background: "rgba(6,16,31,0.85)", border: `3px solid ${color}55` }}>{text}</div>
  </div>
);

/** Etiqueta libre centrada en (x, y). Zona segura x 60-1020, y 400-1150. */
export const Label: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; o: number; box?: boolean }> = ({ x, y, text, size = 40, color = K.white, o, box = false }) => o <= 0.01 ? null : (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", opacity: o, whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 900, fontSize: size, color,
    textShadow: "0 2px 0 #06101F, 0 0 10px rgba(0,0,0,0.6)", ...(box ? { padding: "4px 14px", borderRadius: 10, background: "rgba(6,16,31,0.8)" } : {}) }}>{text}</div>
);

/** Sello que cae con rebote (p. ej. «¡FALSO!»). */
export const Stamp: React.FC<{ x: number; y: number; text: string; color?: string; size?: number; p: number; rot?: number }> = ({ x, y, text, color = K.warn, size = 56, p, rot = -8 }) => p <= 0.01 ? null : (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${1.6 - 0.6 * smooth(p)})`, opacity: clamp01(p * 2), fontFamily: FONT, fontWeight: 900, fontSize: size,
    color, border: `6px solid ${color}`, borderRadius: 14, padding: "2px 18px", background: "rgba(6,16,31,0.7)" }}>{text}</div>
);

/** Gancho: título grande en el centro desde el fotograma 0 (hace de portada) y sale hacia arriba a los ~1,8 s. */
export const HookTitle: React.FC<{ t: number; text: string; end?: number }> = ({ t, text, end = 1.8 }) => {
  const o = 1 - ramp(t, end - 0.35, end);
  if (o <= 0.001) return null;
  const words = text.split(" ");
  const last = words.pop();
  return (
    <AbsoluteFill style={{ background: `rgba(6,16,31,${0.35 * o})` }}>
      <div style={{ position: "absolute", top: 700, left: 50, width: 980, textAlign: "center", opacity: o, transform: `translateY(${-(1 - o) * 60}px) scale(${1 + 0.04 * Math.sin(t * 3)})` }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 118, lineHeight: 1.0, color: K.white, textTransform: "uppercase", textShadow: stroke }}>
          {words.join(" ")} <span style={{ color: K.flow }}>{last}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Marca de agua @destripando.cosas, centrada y translúcida; en el cierre baja bajo el CTA. */
export const Watermark: React.FC<{ t: number; outro: number; start?: number }> = ({ t, outro, start = 2 }) => {
  if (t < start) return null;
  const at = t >= outro;
  const o = at ? 0.95 * ramp(t, outro + 0.25, outro + 0.6) : 0.13 * Math.min(ramp(t, start, start + 0.6), 1 - ramp(t, outro - 0.3, outro));
  if (o <= 0.002) return null;
  return (
    <div style={{ position: "absolute", left: 540, top: at ? 1010 : 900, transform: "translate(-50%,-50%)", opacity: o, fontFamily: FONT, fontWeight: 900, fontSize: at ? 44 : 58, color: K.white, whiteSpace: "nowrap" }}>
      @destripando.cosas
    </div>
  );
};

/** Superposición de depuración: zonas seguras. */
export const SafeZones: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 60, top: 260, width: 960, height: 1160, border: "3px dashed rgba(0,255,120,0.6)" }} />
    <div style={{ position: "absolute", left: 0, top: 1420, width: 1080, height: 500, background: "rgba(255,0,0,0.12)" }} />
    <div style={{ position: "absolute", left: 940, top: 900, width: 140, height: 520, background: "rgba(255,0,0,0.12)" }} />
  </AbsoluteFill>
);
