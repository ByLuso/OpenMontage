// Instalaciones Orcave · "Válvulas del patinillo" — versión nocturna (vertical 9:16, ~76 s).
// Estética: noche, luz cálida de lámparas, oclusión ambiental y bloom; rótulos sobrios con letra pequeña monoespaciada.
import React, { useMemo } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { SceneNight } from "./SceneNight";
import { CameraKey, project, shot } from "./kit3d/CameraRig";
import { SANS, MONO } from "./Fonts";
import { usePreloadAssets } from "./AssetGLB";
import { Building, Shaft, FH, RISER, THERMO, STUCK, VALVE_Y, SOFA } from "./Models";

type Word = { beat: number; w: string; s: number; e: number };
type Timing = { words: Word[]; voiceEnd: number; duration: number; beats: { s: number; e: number }[] };
export type Props = { timing: Timing; dpr?: number; cover?: boolean; logo?: boolean };
const ACC = "#FF4D73", W = "#FFFFFF";
const ASSETS = ["exterior_aircon_unit.glb", "modern_coffee_table_02.glb", "mid_century_lounge_chair.glb", "modern_wooden_cabinet.glb", "desk_lamp_arm_01.glb",
  "potted_plant_02.glb", "side_table_01.glb", "modern_ceiling_lamp_01.glb", "metal_toolbox.glb", "pipe_wrench.glb"];
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.45, 0, 0.25, 1);
const ramp = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: ease });
const vis = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => interpolate(t, [a - fi, a, b, b + fo], [0, 1, 1, 0], cl);
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");
const shadow = "0 2px 4px rgba(0,0,0,0.55), 0 6px 24px rgba(0,0,0,0.55)";

// ---------------------------------------------------------------- rótulos
const Captions: React.FC<{ words: Word[]; t: number }> = ({ words, t }) => {
  const chunks: Word[][] = []; let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w); const next = words[i + 1];
    if (cur.length >= 4 || !next || next.beat !== w.beat || /[.:;!?…]$/.test(w.w) || (cur.length >= 3 && /,$/.test(w.w))) { chunks.push(cur); cur = []; }
  });
  const chunk = chunks.find((c, i) => t >= c[0].s - 0.05 && t < (chunks[i + 1]?.[0].s ?? c[c.length - 1].e + 0.4) - 0.05);
  if (!chunk || t > chunk[chunk.length - 1].e + 0.6) return null;
  const pop = interpolate(t - chunk[0].s, [0, 0.12], [0.94, 1], cl);
  return (
    <div style={{ position: "absolute", left: 70, width: 940, top: 1300, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, lineHeight: 1.1, letterSpacing: -0.5, textAlign: "center", color: W, textShadow: shadow, transform: `scale(${pop})` }}>
        {chunk.map((w, i) => <span key={i} style={{ color: t >= w.s - 0.04 && t < w.e + 0.08 ? ACC : W }}>{w.w}{i < chunk.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
};

/** Letra pequeña técnica, monoespaciada, encima de los subtítulos. */
const Fine: React.FC<{ text: string; t: number; a: number; b: number }> = ({ text, t, a, b }) => {
  const o = vis(t, a, b, 0.3, 0.3);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 1210, left: 90, width: 900, textAlign: "center", opacity: o * 0.75, fontFamily: MONO, fontWeight: 500, fontSize: 21,
      letterSpacing: 2.2, lineHeight: 1.5, color: "#DCE2EA", textTransform: "uppercase", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>{text}</div>
  );
};

/** Titular arriba (con palabra destacada opcional) y subtítulo monoespaciado. */
const Head: React.FC<{ text: string; hl?: string; sub?: string; t: number; a: number; b: number; y?: number }> = ({ text, hl, sub, t, a, b, y = 330 }) => {
  const o = vis(t, a, b, 0.25, 0.25);
  if (o <= 0) return null;
  const dy = interpolate(t - a, [0, 0.35], [18, 0], { ...cl, easing: ease });
  const parts = hl ? text.split(hl) : [text];
  return (
    <div style={{ position: "absolute", top: y + dy, left: 60, width: 960, opacity: o, textAlign: "center" }}>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 74, lineHeight: 1.04, letterSpacing: -1.5, color: W, textShadow: shadow }}>
        {parts[0]}{hl && <span style={{ color: ACC }}>{hl}</span>}{parts[1]}
      </div>
      {sub && <div style={{ marginTop: 18, fontFamily: MONO, fontWeight: 500, fontSize: 24, letterSpacing: 2.5, color: "#C9D2DE", textTransform: "uppercase", textShadow: shadow }}>{sub}</div>}
    </div>
  );
};

/** Cifra grande con su leyenda monoespaciada. */
const Big: React.FC<{ value: string; sub: string; t: number; a: number; b: number; y?: number }> = ({ value, sub, t, a, b, y = 300 }) => {
  const o = vis(t, a, b, 0.25, 0.25);
  if (o <= 0) return null;
  const s = interpolate(t - a, [0, 0.2, 0.4], [0.9, 1.03, 1], cl);
  return (
    <div style={{ position: "absolute", top: y, left: 0, width: 1080, opacity: o, textAlign: "center", transform: `scale(${s})` }}>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 168, lineHeight: 1, letterSpacing: -4, color: W, textShadow: shadow }}>{value}</div>
      <div style={{ marginTop: 10, fontFamily: MONO, fontWeight: 500, fontSize: 24, letterSpacing: 2.5, color: "#C9D2DE", textTransform: "uppercase", textShadow: shadow }}>{sub}</div>
    </div>
  );
};

/** Etiqueta con línea guía hacia un punto 3D proyectado. */
const Label: React.FC<{ title: string; sub?: string; at: { x: number; y: number; behind: boolean }; dx: number; dy: number; t: number; a: number; b: number; accent?: string }> =
  ({ title, sub, at, dx, dy, t, a, b, accent }) => {
    const o = vis(t, a, b, 0.2, 0.2);
    if (o <= 0 || at.behind) return null;
    const lx = Math.max(200, Math.min(880, at.x + dx)), ly = Math.max(300, Math.min(1100, at.y + dy));
    const grow = interpolate(t - a, [0, 0.3], [0, 1], { ...cl, easing: ease });
    const ex = at.x + (lx - at.x) * grow, ey = at.y + (ly - at.y) * grow;
    return (
      <AbsoluteFill style={{ opacity: o }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <line x1={at.x} y1={at.y} x2={ex} y2={ey} stroke="rgba(255,255,255,0.85)" strokeWidth={2.5} />
          <circle cx={at.x} cy={at.y} r={9} fill="none" stroke={W} strokeWidth={3} />
          <circle cx={at.x} cy={at.y} r={3.5} fill={W} />
        </svg>
        <div style={{ position: "absolute", left: lx - 300, top: ly - (dy < 0 ? 92 : 0), width: 600, display: "flex", justifyContent: "center", opacity: grow }}>
          <div style={{ background: "rgba(24,27,33,0.82)", border: "1.5px solid rgba(255,255,255,0.14)", borderRadius: 16, padding: sub ? "12px 22px 12px" : "10px 22px", textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, color: accent ?? W, letterSpacing: -0.3 }}>{title}</div>
            {sub && <div style={{ marginTop: 4, fontFamily: MONO, fontWeight: 500, fontSize: 19, letterSpacing: 1.6, color: "#BAC4D0", textTransform: "uppercase" }}>{sub}</div>}
          </div>
        </div>
      </AbsoluteFill>
    );
  };

// marca: tarjeta blanca; el logotipo va dentro si está en public/ (si no, se superpone en el montaje)
export const BUG = { x: 44, y: 70, w: 300, pad: [14, 20] };
const LogoBug: React.FC<{ o: number; logo: boolean }> = ({ o, logo }) => (
  <div style={{ position: "absolute", top: BUG.y, left: BUG.x, width: BUG.w + 2 * BUG.pad[1], height: Math.round(BUG.w * 0.239) + 2 * BUG.pad[0], opacity: o,
    background: "rgba(255,255,255,0.95)", borderRadius: 22, boxShadow: "0 10px 30px rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    {logo && <Img src={staticFile("logo_orcave_hd.png")} style={{ width: BUG.w, height: "auto", display: "block" }} />}
  </div>
);
export const CARD = { x: 140, y: 690, w: 800, h: 260, logoW: 680 };
const LogoCard: React.FC<{ o: number; logo: boolean; y?: number }> = ({ o, logo, y = CARD.y }) => (
  <div style={{ position: "absolute", top: y, left: CARD.x, width: CARD.w, height: CARD.h, opacity: o, background: "#FFFFFF", borderRadius: 36,
    boxShadow: "0 30px 80px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    {logo && <Img src={staticFile("logo_orcave_hd.png")} style={{ width: CARD.logoW, height: "auto" }} />}
  </div>
);

const MONTHS = ["JUN", "JUL", "AGO", "SEP", "OCT", "NOV"];

export const Noche: React.FC<Props> = ({ timing, dpr = 1, cover = false, logo = false }) => {
  const loaded = usePreloadAssets(ASSETS);
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const F = (s: number) => Math.round(s * fps);
  const B = timing.beats, bs = (i: number) => B[i - 1].s;
  const Wd = (bi: number, w: string, nth = 0) => {
    const xs = timing.words.filter((k) => k.beat === bi - 1 && norm(k.w).startsWith(norm(w)));
    if (!xs[nth]) throw new Error(`palabra ${bi} ${w}`);
    return xs[nth].s;
  };
  const T = {
    on: Wd(1, "enciende"), some: Wd(1, "algunas"), calm: Wd(1, "tranquilo"), hp: bs(2), air: Wd(2, "aire"), heats: Wd(2, "calienta"), rise: bs(3), up: Wd(3, "sube"),
    shaft: bs(4), valves: Wd(4, "valvulas"), open: Wd(4, "abren"), circ: Wd(4, "circuitos"), warm: bs(5), heat5: Wd(5, "calor"),
    months: bs(6), stuck: Wd(6, "pegadas"), flat: bs(7), noWater: Wd(7, "pero"), cold7: Wd(7, "suelo"),
    tech: bs(8), techGo: Wd(8, "tecnicos"), locate: Wd(8, "localiza"), unstick: Wd(8, "despega"), opens: Wd(8, "vuelve"),
    back: bs(9), recover: Wd(9, "recupera"), advice: bs(10), end: bs(11), logo: Wd(11, "instalaciones"), comfort: Wd(11, "confort"),
  };

  const flat = (i: number, dy = 1.0) => [0.3, i * FH + dy, -0.6];
  const SOFAP = (i: number) => [SOFA[0] - 0.45, i * FH + 0.95, SOFA[2] + 0.15];
  const BLD = [0.2, 5.6, 0];
  const cam: CameraKey[] = useMemo(() => {
    const k = (sec: number, target: number[], d: number, az: number, el: number, fov = 30, breathe = 1): CameraKey => ({ ...shot(F(sec), target, d, az, el, fov), breathe });
    return [
      // gancho: la persona con frío en su salón → todo el edificio de noche
      k(0, [SOFAP(1)[0], SOFAP(1)[1] + 0.3, SOFAP(1)[2]], 4.8, 24, 6, 30, 0.6), k(T.some - 0.2, [SOFAP(1)[0], SOFAP(1)[1] + 0.25, SOFAP(1)[2]], 4.2, 10, 5), k(T.calm - 1.2, BLD, 27, 22, 9), k(T.hp - 0.1, BLD, 25, -8, 8),
      // aerotermia en cubierta
      k(T.hp, [0, 3 * FH + 0.5, -1.55], 6.8, 26, 16), k(T.air, [-0.1, 3 * FH + 0.5, -1.55], 5.6, 8, 13), k(T.heats - 0.1, [-0.6, 3 * FH + 0.45, -1.55], 6.6, -18, 15),
      // montantes del patinillo
      k(T.rise - 0.05, [-2.3, 6.6, -1.2], 15, -32, 10), k(T.up, [-2.3, 5.4, -1.2], 14, -38, 6), k(T.shaft - 0.08, [-2.3, 4.0, -1.2], 12.5, -30, 4),
      // armario del patinillo
      k(T.shaft, [0, 0.95, 0], 3.6, 22, 8), k(T.valves - 0.2, [0.05, 0.85, 0], 2.7, -12, 6), k(T.circ - 0.2, [0.2, 0.85, 0], 2.5, 14, 4), k(T.warm - 0.05, [0.1, 0.9, 0], 2.9, 0, 6),
      // vivienda caliente en rayos X
      k(T.warm, flat(2, 1.1), 14.5, 25, 28), k(T.heat5 - 0.2, flat(2, 1.1), 13, 6, 26), k(T.months - 0.05, flat(2, 1.1), 13.5, -8, 24),
      // meses sin uso → válvula pegada
      k(T.months, [0.05, 0.75, 0], 2.8, -10, 6), k(T.stuck - 0.3, [STUCK[0], STUCK[1] + 0.05, 0], 1.6, 15, 6), k(T.flat - 0.05, [STUCK[0], STUCK[1] + 0.05, 0], 1.9, -10, 4),
      // vivienda fría: termostato → persona con frío
      k(T.flat, [THERMO(1)[0], THERMO(1)[1] + 0.05, THERMO(1)[2]], 1.4, 10, 2), k(T.noWater - 0.3, [THERMO(1)[0], THERMO(1)[1] + 0.05, THERMO(1)[2]], 1.2, -4, 2),
      k(T.noWater + 0.4, SOFAP(1), 3.6, 22, 10), k(T.tech - 0.05, SOFAP(1), 3.1, 5, 8),
      // el técnico despega la válvula
      k(T.tech, [0.3, 0.6, 0.3], 4.6, -28, 12), k(T.locate - 0.1, [0.3, 0.55, 0.3], 3.5, -18, 10), k(T.unstick - 0.4, [STUCK[0] + 0.05, STUCK[1] - 0.08, 0.05], 1.9, -24, 8),
      k(T.back - 0.05, [STUCK[0], STUCK[1] - 0.02, 0], 1.7, -12, 6),
      // vuelve el calor
      k(T.back, [SOFAP(1)[0] + 0.1, SOFAP(1)[1] + 0.25, SOFAP(1)[2]], 5.0, -14, 10), k(T.recover + 0.4, [SOFAP(1)[0] + 0.15, SOFAP(1)[1] + 0.25, SOFAP(1)[2]], 4.6, 0, 9), k(T.advice - 0.05, flat(1, 1.0), 7.5, 0, 16),
      // consejo y cierre
      k(T.advice, BLD, 26, -18, 9), k(T.end, BLD, 27, 15, 9), { ...shot(durationInFrames - 1, BLD, 29, 25, 10, 30), breathe: 1 },
    ];
  }, [timing, durationInFrames]);
  const pr = (p: number[]) => project(cam, frame, p);

  const shaftWorld = (t >= T.shaft && t < T.warm) || (t >= T.months && t < T.flat) || (t >= T.tech && t < T.back);
  const warmOthers = ramp(t, T.on + 0.3, T.on + 2.5);
  const fixedFloor = ramp(t, T.back, T.back + 1.6);
  const bst = {
    floors: [
      { heat: warmOthers, cold: 1 - warmOthers, flow: warmOthers, xray: 0, lights: 1, person: "none" as const },
      { heat: fixedFloor, cold: 1 - fixedFloor, flow: fixedFloor, xray: 0, lights: 1, person: "sofa-cold" as const, cold2: 1 - ramp(t, T.back + 0.4, T.recover) },
      { heat: warmOthers, cold: 1 - warmOthers, flow: warmOthers, xray: vis(t, T.warm + 0.3, T.months - 0.3, 0.6, 0.3), lights: 1, person: "chair" as const },
    ],
    roofRun: ramp(t, T.on, T.on + 0.6), riserFlow: ramp(t, T.on, T.on + 0.8), snow: 1, thermo: vis(t, T.flat, T.tech, 0.2, 0.3), frame,
  };
  const ss = {
    flowA: 1, flowB: 1, stuck: ramp(t, T.stuck - 0.2, T.stuck + 0.3), fixed: ramp(t, T.opens - 0.4, T.opens + 0.3), dust: ramp(t, T.months + 0.3, T.stuck),
    tool: ramp(t, T.techGo, T.techGo + 0.8), turn: ramp(t, T.unstick, T.unstick + 1.0), tech: ramp(t, T.tech, T.tech + 0.6), reach: ramp(t, T.locate - 0.3, T.unstick - 0.2), frame,
  };

  const words = useMemo(() => {
    const src = timing.words, out: Word[] = [];
    const rep: [string[], string][] = [[["treinta", "y", "cuarenta", "grados,"], "30 y 40 °C,"]];
    for (let i = 0; i < src.length; i++) {
      const r = rep.find(([seq]) => seq.every((s, j) => src[i + j]?.w.toLowerCase() === s));
      if (r) { out.push({ ...src[i], w: r[1], e: src[i + r[0].length - 1].e }); i += r[0].length - 1; continue; }
      out.push(src[i]);
    }
    return out.filter((w) => w.beat !== 10);
  }, [timing]);

  const scene = loaded ? (
    <SceneNight frame={frame} camKeys={cam} dpr={dpr} env={shaftWorld ? 0.18 : 0.1} exposure={shaftWorld ? 1.05 : 1.0}>
      {shaftWorld ? <Shaft s={ss} /> : <Building s={bst} />}
    </SceneNight>
  ) : null;

  if (cover) {
    return (
      <AbsoluteFill style={{ background: "#07090D" }}>
        {scene}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,7,10,0.88) 0%, rgba(5,7,10,0) 34%, rgba(5,7,10,0) 66%, rgba(5,7,10,0.9) 100%)" }} />
        <div style={{ position: "absolute", top: 170, left: 50, width: 980, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 100, lineHeight: 1.0, letterSpacing: -2.5, color: W, textShadow: shadow }}>
          ¿Suelo radiante <span style={{ color: "#8FD3FF" }}>frío</span> al encender la calefacción?
        </div>
        <LogoCard o={1} logo={logo} y={1500} />
      </AbsoluteFill>
    );
  }

  const monthsO = vis(t, T.months, T.stuck - 0.2, 0.2, 0.25);
  const mi = Math.min(MONTHS.length - 1, Math.floor(interpolate(t, [T.months, T.stuck - 0.4], [0, MONTHS.length - 0.01], cl)));
  const endO = ramp(t, T.logo - 0.3, T.logo + 0.3);
  const vy = VALVE_Y[1];
  const top = 3 * FH;
  const fade = interpolate(frame, [0, 6], [1, 0], cl);

  return (
    <AbsoluteFill style={{ background: "#07090D" }}>
      {scene}

      <Head text="¿Suelo radiante frío?" hl="frío" sub="al encender la calefacción" t={t} a={0.3} b={T.calm - 0.5} />
      <Head text="Tiene solución" t={t} a={T.calm} b={T.hp - 0.15} />
      <Fine text="Aerotermia + suelo radiante · arranque de la temporada de calefacción" t={t} a={0.6} b={T.hp - 0.2} />

      <Label title="Aerotermia" sub="bomba de calor aire-agua" at={pr([-1.1, top + 0.95, -1.55])} dx={-60} dy={-300} t={t} a={T.hp + 0.4} b={T.rise - 0.15} />
      <Fine text="Capta la energía del aire exterior, incluso con temperaturas bajo cero" t={t} a={T.air} b={T.rise - 0.2} />

      <Big value="30–40 °C" sub="temperatura de impulsión del agua" t={t} a={T.rise + 0.15} b={T.shaft - 0.15} />
      <Label title="Patinillo" sub="montantes de ida y retorno" at={pr([RISER.hot[0], 5.0, RISER.hot[2]])} dx={330} dy={120} t={t} a={T.up} b={T.shaft - 0.15} />
      <Fine text="Un radiador clásico trabaja a 60–80 °C; el suelo radiante, mucho más bajo" t={t} a={T.rise + 0.4} b={T.shaft - 0.2} />

      <Label title="Llave de corte" at={pr([-0.18, vy + 0.08, 0.02])} dx={-120} dy={-240} t={t} a={T.valves} b={T.warm - 0.1} />
      <Label title="Válvula de zona" sub="abre y cierra el paso" at={pr([STUCK[0], vy + 0.14, 0.02])} dx={150} dy={-420} t={t} a={T.open - 0.1} b={T.warm - 0.1} />
      <Label title="Contador" sub="energía consumida" at={pr([0.38, vy + 0.08, 0.04])} dx={20} dy={230} t={t} a={T.circ - 0.2} b={T.warm - 0.1} />
      <Fine text="Cada vivienda: llave de corte · válvula de zona · contador de energía" t={t} a={T.shaft + 0.3} b={T.warm - 0.2} />

      <Label title="Suelo radiante" sub="tubos bajo la tarima" at={pr([1.2, 2 * FH + 0.2, 0.9])} dx={-120} dy={-330} t={t} a={T.warm + 0.6} b={T.months - 0.2} accent="#FFB45E" />
      <Fine text="El calor sube desde todo el suelo, sin radiadores a la vista" t={t} a={T.heat5 - 0.4} b={T.months - 0.2} />

      {monthsO > 0 && (
        <div style={{ position: "absolute", top: 300, left: 0, width: 1080, opacity: monthsO, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 70, color: W, letterSpacing: -1.5, textShadow: shadow }}>Meses sin uso</div>
          <div style={{ marginTop: 22, display: "flex", gap: 10 }}>
            {MONTHS.map((m_, i) => <div key={m_} style={{ fontFamily: MONO, fontWeight: 500, fontSize: 30, letterSpacing: 2, padding: "8px 14px", borderRadius: 10,
              color: i <= mi ? "#0B0D10" : "rgba(255,255,255,0.45)", background: i <= mi ? "#E9E3D6" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>{m_}</div>)}
          </div>
        </div>
      )}
      <Label title="Válvula pegada" sub="agarrotada por falta de uso" at={pr([STUCK[0], STUCK[1] + 0.12, 0.03])} dx={0} dy={-380} t={t} a={T.stuck} b={T.flat - 0.1} accent={ACC} />
      <Fine text="Tras el verano, la válvula lleva meses sin moverse" t={t} a={T.months + 0.3} b={T.flat - 0.2} />

      <Label title="Termostato" sub="pide calor: 21 °C" at={pr([THERMO(1)[0], THERMO(1)[1] + 0.08, THERMO(1)[2] + 0.02])} dx={0} dy={-330} t={t} a={T.flat + 0.2} b={T.noWater - 0.1} />
      <Head text="…pero el agua no llega" hl="no llega" t={t} a={T.noWater} b={T.tech - 0.15} />
      <Fine text="El termostato manda abrir la válvula de zona… pero está agarrotada" t={t} a={T.flat + 0.4} b={T.tech - 0.2} />

      <Label title="Técnico de Orcave" sub="localiza y despega la válvula" at={pr([0.72, 0.62, 0.55])} dx={-80} dy={-470} t={t} a={T.techGo} b={T.unstick - 0.5} accent={ACC} />
      <Head text="No es una avería grave" t={t} a={T.tech + 0.1} b={T.techGo - 0.15} />
      <Label title="Vuelve a abrir" sub="el agua caliente pasa" at={pr([STUCK[0], STUCK[1] + 0.14, 0.03])} dx={0} dy={-360} t={t} a={T.opens} b={T.back - 0.1} accent="#5BE38D" />
      <Fine text="Basta con desbloquear la válvula y comprobar que abre" t={t} a={T.tech + 0.3} b={T.back - 0.2} />

      <Head text="El calor vuelve" hl="vuelve" t={t} a={T.back + 0.2} b={T.advice - 0.15} />
      <Head text="¿Alguna vivienda no calienta?" sub="avisa a tu empresa de mantenimiento" t={t} a={T.advice + 0.1} b={T.end - 0.15} />

      {t >= T.end - 0.3 && (
        <AbsoluteFill style={{ opacity: ramp(t, T.end - 0.2, T.end + 0.4) }}>
          <AbsoluteFill style={{ background: `rgba(5,7,10,${0.62 * endO})` }} />
          <div style={{ position: "absolute", top: 560, left: 0, width: 1080, textAlign: "center", fontFamily: MONO, fontWeight: 500, fontSize: 26, letterSpacing: 3, color: "#C9D2DE", opacity: endO }}>
            MANTENIMIENTO DE AEROTERMIA Y SUELO RADIANTE
          </div>
          <LogoCard o={endO} logo={logo} />
          <div style={{ position: "absolute", top: 1010, left: 0, width: 1080, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 76, letterSpacing: -1.5, color: W, textShadow: shadow,
            opacity: ramp(t, T.comfort - 0.2, T.comfort + 0.2) }}>
            Tu confort, <span style={{ color: ACC }}>bajo tus pies</span>
          </div>
        </AbsoluteFill>
      )}

      <LogoBug o={ramp(t, 0.2, 0.6) * (1 - endO)} logo={logo} />
      <Captions words={words} t={t} />
      {fade > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${fade})` }} />}
    </AbsoluteFill>
  );
};
