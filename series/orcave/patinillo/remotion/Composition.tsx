// Instalaciones Orcave · "Válvulas del patinillo al encender la aerotermia" (vertical 9:16, ~77 s).
import React, { useMemo } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Scene3D } from "./kit3d/Scene3D";
import { CameraKey, project, shot } from "./kit3d/CameraRig";
import { Timing, Word, FONT } from "./kit2d/Kit";
import { usePreloadAssets } from "./AssetGLB";
import { Building, Shaft, FH, RISER, THERMO, STUCK, VALVE_Y, RED } from "./Models";

export type Props = { timing: Timing; dpr?: number; cover?: boolean };
const RED2 = "#FF4D73", W = "#FFFFFF";
const ASSETS = ["exterior_aircon_unit.glb", "modern_arm_chair_01.glb", "modern_coffee_table_01.glb", "potted_plant_01.glb", "metal_toolbox.glb", "pipe_wrench.glb"];
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.45, 0, 0.25, 1);
const ramp = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: ease });
const vis = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => interpolate(t, [a - fi, a, b, b + fo], [0, 1, 1, 0], cl);
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");
const stroke = "0 0 2px #06101F, 0 0 2px #06101F, 0 4px 0 #06101F, 0 6px 18px rgba(0,0,0,0.65)";

const Captions: React.FC<{ words: Word[]; t: number }> = ({ words, t }) => {
  const chunks: Word[][] = []; let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w); const next = words[i + 1];
    if (cur.length >= 4 || !next || next.beat !== w.beat || /[.:;!?…]$/.test(w.w) || (cur.length >= 3 && /,$/.test(w.w))) { chunks.push(cur); cur = []; }
  });
  const chunk = chunks.find((c, i) => t >= c[0].s - 0.05 && t < (chunks[i + 1]?.[0].s ?? c[c.length - 1].e + 0.4) - 0.05);
  if (!chunk || t > chunk[chunk.length - 1].e + 0.6) return null;
  const pop = interpolate(t - chunk[0].s, [0, 0.12], [0.9, 1], cl);
  return (
    <div style={{ position: "absolute", left: 60, width: 960, top: 1260, height: 230, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 72, lineHeight: 1.08, textAlign: "center", color: W, textShadow: stroke, transform: `scale(${pop})` }}>
        {chunk.map((w, i) => <span key={i} style={{ color: t >= w.s - 0.04 && t < w.e + 0.08 ? RED2 : W }}>{w.w}{i < chunk.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
};

const Tag: React.FC<{ text: string; t: number; a: number; b: number; y?: number; big?: boolean; sub?: string; color?: string }> = ({ text, t, a, b, y = 250, big = false, sub, color = RED }) => {
  const o = vis(t, a, b, 0.2, 0.2);
  if (o <= 0) return null;
  const s = interpolate(t - a, [0, 0.15, 0.3], [0.85, 1.05, 1], cl);
  return (
    <div style={{ position: "absolute", top: y, left: 0, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", opacity: o, transform: `scale(${s})` }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: big ? 92 : 50, color: W, background: big ? "transparent" : color, padding: big ? 0 : "12px 30px", borderRadius: 18,
        textShadow: big ? stroke : "none", boxShadow: big ? "none" : "0 10px 30px rgba(0,0,0,0.35)", textAlign: "center", maxWidth: 980 }}>{text}</div>
      {sub && <div style={{ marginTop: 16, fontFamily: FONT, fontWeight: 800, fontSize: 44, color: W, textShadow: stroke, textAlign: "center", maxWidth: 960 }}>{sub}</div>}
    </div>
  );
};

const Callout: React.FC<{ text: string; at: { x: number; y: number; behind: boolean }; dx: number; dy: number; t: number; a: number; b: number; color?: string }> = ({ text, at, dx, dy, t, a, b, color = W }) => {
  const o = vis(t, a, b, 0.2, 0.2);
  if (o <= 0 || at.behind) return null;
  const lx = Math.max(150, Math.min(930, at.x + dx)), ly = at.y + dy;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <line x1={at.x} y1={at.y} x2={lx} y2={ly} stroke={color} strokeWidth={4} />
        <circle cx={at.x} cy={at.y} r={10} fill={color} stroke="#06101F" strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", left: lx - 300, top: ly - 34, width: 600, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 42, color: "#06101F", background: color, padding: "6px 18px", borderRadius: 12 }}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};

// marca fija en la esquina superior izquierda durante todo el vídeo
const LogoBug: React.FC<{ o: number }> = ({ o }) => (
  <div style={{ position: "absolute", top: 70, left: 44, opacity: o, background: "rgba(255,255,255,0.94)", borderRadius: 22, padding: "14px 20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }}>
    <Img src={staticFile("logo_orcave_hd.png")} style={{ width: 300, height: "auto", display: "block" }} />
  </div>
);

const LogoCard: React.FC<{ o: number; scale?: number; top?: number }> = ({ o, scale = 1, top = 640 }) => (
  <div style={{ position: "absolute", top, left: 90, width: 900, opacity: o, transform: `scale(${scale})`, background: "#FFFFFF", borderRadius: 40, padding: "36px 40px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.45)", display: "flex", justifyContent: "center" }}>
    <Img src={staticFile("logo_orcave_hd.png")} style={{ width: 780, height: "auto" }} />
  </div>
);

const MONTHS = ["JUN", "JUL", "AGO", "SEP", "OCT", "NOV"];

export const Patinillo: React.FC<Props> = ({ timing, dpr = 1, cover = false }) => {
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
    on: Wd(1, "enciende"), calm: Wd(1, "tranquilo"), hp: bs(2), rise: bs(3), shaft: bs(4), warm: bs(5), months: bs(6), stuck: Wd(6, "pegadas"),
    flat: bs(7), thermo: Wd(7, "termostato"), noWater: Wd(7, "pero"), tech: bs(8), techGo: Wd(8, "tecnicos"), locate: Wd(8, "localiza"), unstick: Wd(8, "despega"), opens: Wd(8, "vuelve"),
    back: bs(9), advice: bs(10), end: bs(11), logo: Wd(11, "instalaciones"),
  };

  const cam: CameraKey[] = useMemo(() => {
    const k = (sec: number, target: number[], d: number, az: number, el: number, fov = 30, breathe = 1): CameraKey => ({ ...shot(F(sec), target, d, az, el, fov), breathe });
    const BLD = [0.2, 6.2, 0];
    const flat = (i: number) => [0.4, i * FH + 1.2, -0.2];
    const first = k(0, BLD, 31, 30, 12, 30, 0);
    return [
      first, k(T.on, BLD, 29, 18, 10), k(T.calm - 0.3, flat(1), 15, 8, 8), k(T.hp - 0.05, flat(1), 13, -10, 8),
      // aerotermia en cubierta
      k(T.hp, [-0.55, 3 * FH + 1.3, -1.3], 8.0, 25, 7), k(Wd(2, "aire") - 0.2, [-0.55, 3 * FH + 1.3, -1.2], 7.0, -20, 6), k(Wd(2, "calienta") - 0.1, [-0.8, 3 * FH + 1.1, -1.4], 8.0, 10, 12),
      k(T.rise - 0.05, [-1.5, 3 * FH, -1.5], 9, -30, 14),
      // subida por los montantes
      k(T.rise, [-2.4, 6.5, -1.6], 19, -55, 8), k(Wd(3, "sube") - 0.2, [-2.4, 5.0, -1.6], 17, -40, 6), k(T.shaft - 0.05, [-2.6, 3.8, -1.6], 13, -30, 6),
      // patinillo de cerca
      k(T.shaft, [0, 0.9, 0], 3.6, 18, 6), k(Wd(4, "valvulas") - 0.2, [0.05, 0.85, 0], 2.8, -15, 6), k(Wd(4, "circuitos") - 0.2, [0.2, 0.85, 0], 2.6, 15, 4), k(T.warm - 0.05, [0.1, 0.9, 0], 3.0, 0, 6),
      // vivienda cálida (planta alta)
      k(T.warm, flat(2), 12, 25, 18), k(Wd(5, "calor") - 0.2, flat(2), 10, -10, 14), k(T.months - 0.05, flat(2), 11, 10, 14),
      // meses sin uso → válvula pegada
      k(T.months, [0.05, 0.75, 0], 2.8, -10, 6), k(T.stuck - 0.3, [STUCK[0], STUCK[1] + 0.05, 0], 1.6, 15, 6), k(T.flat - 0.05, [STUCK[0], STUCK[1] + 0.05, 0], 1.9, -10, 4),
      // vivienda fría (planta 1): termostato y suelo frío
      k(T.flat, [-0.9, FH + 1.3, -1.2], 6.5, 20, 6), k(T.thermo - 0.1, [-1.1, FH + 1.47, -1.98], 2.2, 8, 4), k(T.noWater - 0.4, [-1.1, FH + 1.5, -1.98], 1.9, -6, 4), k(T.noWater, flat(1), 11, -15, 18), k(T.tech - 0.05, flat(1), 10.5, 0, 16),
      // el técnico despega la válvula
      k(T.tech, [0, 0.8, 0], 3.6, -20, 6), k(T.techGo, [0.2, 0.5, 0.2], 3.3, 25, 14), k(T.locate, [STUCK[0], STUCK[1], 0], 2.0, 10, 8), k(T.unstick - 0.2, [STUCK[0], STUCK[1], 0], 1.5, -15, 6), k(T.back - 0.05, [STUCK[0], STUCK[1], 0], 1.8, 10, 6),
      // vuelve el calor
      k(T.back, flat(1), 11, 20, 18), k(T.advice - 0.05, flat(1), 12, -10, 14),
      // consejo y cierre
      k(T.advice, BLD, 29, -20, 10), k(T.end, BLD, 30, 20, 10), { ...shot(durationInFrames - 1, BLD, 31, 30, 12, 30), breathe: 1 },
    ];
  }, [timing, durationInFrames]);
  const pr = (p: number[]) => project(cam, frame, p);

  const shaftWorld = (t >= T.shaft && t < T.warm) || (t >= T.months && t < T.flat) || (t >= T.tech && t < T.back);
  const warmOthers = ramp(t, T.on + 0.3, T.on + 2.2);
  const fixedFloor = ramp(t, T.back, T.back + 1.2);
  const bs_ = {
    floors: [
      { heat: warmOthers, cold: 1 - warmOthers, flow: warmOthers },
      { heat: fixedFloor, cold: 1 - fixedFloor, flow: fixedFloor },
      { heat: warmOthers, cold: 1 - warmOthers, flow: warmOthers },
    ],
    roofRun: ramp(t, T.on, T.on + 0.6), riserFlow: ramp(t, T.on, T.on + 0.8), snow: 1, xray: 0.45,
    thermo: vis(t, T.thermo, T.tech, 0.2, 0.3), frame,
  };
  const ss = { flowA: 1, flowB: 1, stuck: ramp(t, T.stuck - 0.2, T.stuck + 0.3), fixed: ramp(t, T.opens - 0.4, T.opens + 0.3), dust: ramp(t, T.months + 0.3, T.stuck), tool: ramp(t, T.techGo, T.techGo + 0.8), turn: ramp(t, T.unstick, T.unstick + 1.0), frame };

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
    <Scene3D frame={frame} camKeys={cam} dpr={dpr} floorY={-0.34}>
      {shaftWorld ? <Shaft s={ss} /> : <Building s={bs_} />}
    </Scene3D>
  ) : null;

  if (cover) {
    return (
      <AbsoluteFill style={{ background: "#070F1E" }}>
        {scene}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,15,30,0.92) 0%, rgba(7,15,30,0) 32%, rgba(7,15,30,0) 64%, rgba(7,15,30,0.92) 100%)" }} />
        <div style={{ position: "absolute", top: 150, left: 50, width: 980, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 96, lineHeight: 1.02, color: W, textShadow: stroke }}>
          ¿Suelo radiante <span style={{ color: "#7FD3FF" }}>frío</span> al encender la calefacción?
        </div>
        <LogoCard o={1} scale={0.62} top={1460} />
      </AbsoluteFill>
    );
  }

  const flash = Math.max(0, ...[T.hp, T.rise, T.shaft, T.warm, T.months, T.flat, T.tech, T.back, T.advice].map((c) => 1 - Math.abs(t - c) / 0.12));
  const monthsO = vis(t, T.months, T.stuck - 0.2, 0.2, 0.25);
  const mi = Math.min(MONTHS.length - 1, Math.floor(interpolate(t, [T.months, T.stuck - 0.4], [0, MONTHS.length - 0.01], cl)));
  const endO = ramp(t, T.logo - 0.3, T.logo + 0.3);
  const vy = VALVE_Y[1];

  return (
    <AbsoluteFill style={{ background: "#070F1E" }}>
      {scene}
      {flash > 0 && <AbsoluteFill style={{ background: `rgba(255,255,255,${flash * 0.5})` }} />}

      <Tag text="¿SUELO FRÍO AL ENCENDER?" t={t} a={0.25} b={T.calm - 0.15} />
      <Tag text="TIENE SOLUCIÓN" t={t} a={T.calm} b={T.hp - 0.1} color="#1E9E5A" />
      <Tag text="AEROTERMIA" sub="energía del aire exterior" t={t} a={T.hp + 0.1} b={T.rise - 0.1} />
      <Tag text="30–40 °C" big sub="sube a cada planta" t={t} a={T.rise + 0.2} b={T.shaft - 0.1} />
      <Tag text="EL PATINILLO" sub="las válvulas de cada vivienda" t={t} a={T.shaft + 0.1} b={T.warm - 0.1} />
      <Callout text="llave de corte" at={pr([-0.18, vy + 0.08, 0.02])} dx={-60} dy={250} t={t} a={Wd(4, "valvulas")} b={T.warm - 0.1} color="#FFD27A" />
      <Callout text="válvula de zona" at={pr([STUCK[0], vy + 0.14, 0.02])} dx={80} dy={330} t={t} a={Wd(4, "abren") - 0.1} b={T.warm - 0.1} color={W} />
      <Callout text="contador" at={pr([0.38, vy + 0.08, 0.04])} dx={60} dy={-260} t={t} a={Wd(4, "circuitos") - 0.2} b={T.warm - 0.1} color="#5FE6C8" />
      <Tag text="CALOR EN TODAS LAS ESTANCIAS" t={t} a={T.warm + 0.1} b={T.months - 0.1} />
      {monthsO > 0 && (
        <div style={{ position: "absolute", top: 230, left: 0, width: 1080, opacity: monthsO, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT }}>
          <div style={{ fontWeight: 900, fontSize: 50, color: W, background: "#3A4556", padding: "12px 28px", borderRadius: 18 }}>MESES SIN USO</div>
          <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
            {MONTHS.map((m_, i) => <div key={m_} style={{ fontWeight: 900, fontSize: 36, padding: "8px 12px", borderRadius: 10, color: i <= mi ? "#06101F" : "rgba(255,255,255,0.4)", background: i <= mi ? "#FFD27A" : "rgba(255,255,255,0.08)" }}>{m_}</div>)}
          </div>
        </div>
      )}
      <Tag text="VÁLVULA PEGADA" t={t} a={T.stuck} b={T.flat - 0.1} />
      <Tag text="EL TERMOSTATO PIDE CALOR…" t={t} a={T.thermo} b={T.noWater - 0.1} color="#B8741A" />
      <Tag text="…PERO EL AGUA NO LLEGA" t={t} a={T.noWater} b={T.tech - 0.1} color="#2E7FB8" />
      <Tag text="NO ES UNA AVERÍA GRAVE" t={t} a={T.tech + 0.1} b={T.techGo - 0.1} color="#1E9E5A" />
      <Tag text="TÉCNICO DE ORCAVE" sub="localiza y despega la válvula" t={t} a={T.techGo} b={T.back - 0.1} />
      <Tag text="EL CALOR VUELVE" t={t} a={T.back + 0.1} b={T.advice - 0.1} color="#1E9E5A" />
      <Tag text="¿ALGUNA VIVIENDA NO CALIENTA?" sub="avisa a tu empresa de mantenimiento" t={t} a={T.advice + 0.1} b={T.end - 0.1} />

      {t >= T.end - 0.3 && (
        <AbsoluteFill style={{ opacity: ramp(t, T.end - 0.2, T.end + 0.4) }}>
          <AbsoluteFill style={{ background: `rgba(7,15,30,${0.55 * endO})` }} />
          <Tag text="MANTENIMIENTO DE AEROTERMIA" t={t} a={T.end} b={999} />
          <LogoCard o={endO} scale={0.9 + 0.1 * endO} top={640} />
          <div style={{ position: "absolute", top: 1090, left: 0, width: 1080, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 70, color: W, textShadow: stroke, opacity: ramp(t, Wd(11, "confort") - 0.2, Wd(11, "confort") + 0.2) }}>
            Tu confort, <span style={{ color: RED2 }}>bajo tus pies</span>
          </div>
        </AbsoluteFill>
      )}

      <LogoBug o={ramp(t, 0.2, 0.6) * (1 - endO)} />
      <Captions words={words} t={t} />
    </AbsoluteFill>
  );
};
