// "Tu estómago debería digerirse a sí mismo" · 40 s, 9:16. Modelo principal (estómago) + secundario (sección de pared).
// El audio se mezcla aparte con ffmpeg (serie/tools/mezcla.py); este componente es solo imagen.
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { BodyScene } from "./BodyScene";
import { CameraKey, project, shot } from "./kit3d/CameraRig";
import { ramp, lerp } from "./kit3d/anim";
import { Captions, MainLabel, Callout, Timing, K, FONT } from "./kit2d/Kit";
import { Stomach, StomachState, surfacePoint, centerPoint } from "./Stomach";
import { WallSection, WallState, PITS } from "./WallSection";

export type Props = { timing: Timing; dpr?: number; debug?: boolean; cover?: boolean };

const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");
const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) =>
  interpolate(t, [a - fi, a, b, b + fo], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// cortes de mundo (órgano ↔ sección de pared)
const CUTS = { toWall1: 7.85, toOrgan1: 25.3, toWall2: 33.2, toOrgan2: 36.6 };
const T = [0.25, 0.95, 0]; // centro del estómago
const T2 = [0.3, 1.25, 0]; // centro con el esófago (planos medios)

export const Estomago: React.FC<Props> = ({ timing, dpr = 1, debug = false, cover = false }) => {
  const realFrame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const realT = realFrame / fps;
  // Reloj visual: la puesta en escena se diseñó sobre la v1 del guion; se re-mapea por tramos
  // (inicio de cada bloque) a los tiempos de la voz actual para que los planos sigan a la narración.
  const OLD = [0, 2.58, 8.0, 16.89, 25.81, 33.8, 39.8, 40];
  const NEW = [...timing.beats.map((b) => b.s), Math.min(39.6, timing.voiceEnd + 0.25), 40];
  const toOld = (x: number) => {
    for (let i = 0; i < NEW.length - 1; i++) if (x <= NEW[i + 1]) return OLD[i] + (x - NEW[i]) / (NEW[i + 1] - NEW[i]) * (OLD[i + 1] - OLD[i]);
    return x;
  };
  const t = toOld(realT);
  const frame = t * fps;
  const F = (s: number) => Math.round(s * fps);
  const Wd = (i: number, w: string) => {
    const x = timing.words.find((k) => k.beat === i - 1 && norm(k.w).startsWith(norm(w)));
    return toOld(x ? x.s : timing.beats[i - 1].s);
  };
  const wall = (t >= CUTS.toWall1 && t < CUTS.toOrgan1) || (t >= CUTS.toWall2 && t < CUTS.toOrgan2);

  // ---------- cámara: un cambio cada 2-3 s ----------
  const cam: CameraKey[] = useMemo(() => {
    const k = (sec: number, target: number[], d: number, az: number, el: number, fov = 30, breathe = 1): CameraKey =>
      ({ ...shot(F(sec), target, d, az, el, fov), breathe });
    const P = PITS[5];
    const first = k(0, T, 26, 0, 4, 30, 0);
    return [
      first,
      k(1.05, T2, 13.5, 8, 6),
      k(2.3, T2, 12.5, 16, 6),
      k(4.4, T2, 12.5, -24, 10),
      k(6.0, [-0.35, 0.7, 0.1], 7.2, -10, 16),
      k(CUTS.toWall1 - 0.05, [-0.55, 0.35, 0.0], 1.7, -2, 10),
      // sección de pared
      k(CUTS.toWall1, [0, -0.1, 0], 9.8, 28, 30),
      k(10.4, [0, -0.25, 0.5], 6.0, 14, 24),
      k(10.6, [P[0], -0.3, P[1]], 2.6, 30, 32),
      k(12.9, [P[0], -0.2, P[1]], 2.3, 44, 26),
      k(13.0, [0, 1.0, 0], 3.4, -22, 12),
      k(14.1, [0, 0.9, 0], 3.0, -10, 12),
      k(14.2, [0.3, 0, 0.2], 2.4, 0, 48),
      k(15.4, [0.3, 0, 0.2], 2.2, 10, 50),
      k(16.6, [0, 0.2, 0], 7.0, 10, 40),
      k(19.0, [0, 0.1, 0], 6.2, -16, 30),
      k(21.5, [0, 0.6, 0], 6.6, 22, 18),
      k(21.6, [0.5, 0.3, 0.4], 2.8, 36, 9),
      k(24.0, [0.5, 0.3, 0.4], 2.5, 26, 8),
      k(CUTS.toOrgan1 - 0.05, [0, 0.3, 0], 1.2, 10, 60),
      // órgano: oleadas
      k(CUTS.toOrgan1, T2, 13.5, 10, 8),
      k(27.7, T2, 12.5, -14, 8),
      k(27.8, [0.6, 0.4, 0], 8.6, 30, 10),
      k(30.2, [0.6, 0.4, 0], 7.8, 16, 8),
      k(30.3, [1.0, 0.15, 0], 4.4, 22, 6),
      k(CUTS.toWall2 - 0.05, [1.0, 0.15, 0], 2.6, 30, 6),
      // renovación de células
      k(CUTS.toWall2, [0, 0, 0], 3.8, 10, 42),
      k(35.0, [0, 0, 0], 3.4, 0, 40),
      k(35.1, [0.4, 0, 0.3], 2.6, -16, 30),
      k(CUTS.toOrgan2 - 0.05, [0.4, 0, 0.3], 2.2, -24, 28),
      // vuelta al primer encuadre (bucle)
      k(CUTS.toOrgan2, T2, 9.0, 12, 10),
      { ...first, f: F(39.0) },
      { ...first, f: durationInFrames },
    ];
  }, [timing]);

  // ---------- estado del estómago ----------
  const beat = (x: number) => Math.exp(-Math.pow(x / 0.09, 2));
  const pulse = beat(t - 0.05) + 0.7 * beat(t - 0.33) + beat(t - 0.95) + 0.7 * beat(t - 1.23);
  const open = ramp(frame, F(1.1), F(2.0)) * (1 - ramp(frame, F(37.2), F(38.6)));
  const st: StomachState = {
    phase: frame / 75,
    amp: lerp(0.035, 0.17, win(t, CUTS.toOrgan1, CUTS.toWall2, 0.6, 0.3)),
    breath: 1 + 0.05 * pulse,
    acid: open,
    open,
    chyme: win(t, CUTS.toOrgan1 + 0.3, CUTS.toWall2, 0.4, 0.2),
  };
  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 5), []);
  clip.constant = lerp(1.2, 0.05, open);

  // ---------- estado de la sección ----------
  const ws: WallState = {
    acid: win(t, CUTS.toWall1 + 0.3, 16.5, 0.4, 0.6),
    protein: CUTS.toWall1 <= t && t < 16 ? 1 - ramp(frame, F(12.6), F(14.6)) : 0,
    hurt: win(t, 14.2, 15.8, 0.15, 0.6),
    mucus: t >= CUTS.toWall2 ? 1 : ramp(frame, F(16.9), F(18.4)),
    rain: win(t, 19.0, 24.3, 0.3, 0.4),
    renew: ramp(frame, F(33.9), F(36.3)),
  };

  // ---------- flashes de transición ("a través del tejido") ----------
  const flash = Math.max(...Object.values(CUTS).map((c) => Math.max(0, 1 - Math.abs(t - c) / 0.14)));
  const zoomIn = interpolate(t, [0, 1.05], [1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const pr = (p: number[]) => project(cam, frame, p);
  const waves = Math.floor(Math.max(0, t - Wd(5, "tres")) * 1.2);

  return (
    <AbsoluteFill style={{ backgroundColor: "#02080B" }}>
      <AbsoluteFill style={{ transform: `scale(${zoomIn})` }}>
        <BodyScene frame={frame} camKeys={cam} dpr={dpr}>
          {wall ? <WallSection s={ws} frame={frame} /> : <Stomach s={st} clip={clip} frame={frame} />}
        </BodyScene>
      </AbsoluteFill>

      {cover && <CoverTitle />}
      {!cover && <>
      {/* ---------- capa 2D ---------- */}
      <MainLabel text="Ácido + pepsina" color={K.flow} t={t} t0={8.0} t1={15.0} />
      <Callout text="ácido clorhídrico" anchor={pr([PITS[5][0], 0.4, PITS[5][1]])} offset={[-60, 260]} color={K.flow} t={t} t0={Wd(3, "acido")} t1={12.9} size={40} />
      <Callout text="pepsina" anchor={pr([0.75, 1.15, 0.0])} offset={[120, -160]} color={K.white} t={t} t0={Wd(3, "pepsina")} t1={14.1} size={40} />
      <MainLabel text="Moco protector" color={K.cold} t={t} t0={16.9} t1={24.0} />
      <Callout text="moco + bicarbonato" anchor={pr([-0.8, 0.3, 0.6])} offset={[-40, 200]} color={K.cold} t={t} t0={Wd(4, "moco")} t1={21.4} size={40} />
      <MainLabel text="Un chubasquero" color={K.white} t={t} t0={Wd(4, "chubasquero")} t1={24.0} />
      <Callout text="se neutraliza" anchor={pr([0.5, 0.35, 0.4])} offset={[-140, 190]} color={K.cold} t={t} t0={Wd(4, "neutraliza")} t1={24.0} size={40} />
      <MainLabel text="Músculos" color={K.hot} t={t} t0={25.8} t1={32.4} />
      <BigNumber t={t} t0={Wd(5, "tres") - 0.15} t1={32.3} waves={waves} />
      <Callout text="papilla" anchor={pr(centerPoint(0.74).toArray())} offset={[-160, -180]} color={K.flow} t={t} t0={Wd(5, "papilla")} t1={32.35} size={40} />
      <MainLabel text="Células nuevas" color="#FF7AB0" t={t} t0={Wd(6, "celulas")} t1={36.5} />
      <Captions words={timing.words} t={realT} />
      </>}

      {flash > 0 && <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, rgba(255,235,240,${flash * 0.95}) 0%, rgba(255,90,140,${flash * 0.6}) 45%, rgba(0,0,0,0) 80%)` }} />}
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};

/** Cifra clave grande y animada: "3 oleadas por minuto", con un pulso en cada oleada. */
const BigNumber: React.FC<{ t: number; t0: number; t1: number; waves: number }> = ({ t, t0, t1, waves }) => {
  const a = win(t, t0, t1, 0.15, 0.3);
  if (a <= 0) return null;
  const pop = interpolate(t - t0, [0, 0.12, 0.3], [0.4, 1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const beatScale = 1 + 0.06 * Math.max(0, Math.cos(((t - t0) * 1.2) * Math.PI * 2)) * (waves > 0 ? 1 : 0);
  return (
    <div style={{ position: "absolute", top: 380, left: 60, width: 900, display: "flex", flexDirection: "column", alignItems: "center", opacity: a, transform: `scale(${pop * beatScale})` }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 230, lineHeight: 0.9, color: K.flow, textShadow: "0 0 40px rgba(255,200,61,0.7), 0 8px 0 #06101F" }}>3</div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 50, color: K.white, textShadow: "0 4px 0 #06101F" }}>oleadas por minuto</div>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 26, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>(animación acelerada)</div>
    </div>
  );
};

/** Portada (primer fotograma = miniatura de TikTok): título grande arriba, órgano abierto en el centro. */
const CoverTitle: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,8,11,0.85) 0%, rgba(2,8,11,0) 32%, rgba(2,8,11,0) 62%, rgba(2,8,11,0.8) 100%)" }} />
    <div style={{ position: "absolute", top: 190, left: 60, width: 900, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 104, lineHeight: 1.0,
      color: K.white, textShadow: "0 6px 0 #06101F, 0 0 30px rgba(0,0,0,0.8)" }}>
      Tu estómago <span style={{ color: K.flow }}>debería digerirse</span> a sí mismo
    </div>
    <div style={{ position: "absolute", top: 1250, left: 60, width: 900, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 56,
      color: "#FF7AB0", textShadow: "0 4px 0 #06101F" }}>…y no lo hace</div>
  </>
);

const SafeZones: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 150, background: "rgba(255,0,0,0.25)" }} />
    <div style={{ position: "absolute", left: 0, top: 1440, width: 1080, height: 480, background: "rgba(255,0,0,0.25)" }} />
    <div style={{ position: "absolute", left: 960, top: 0, width: 120, height: 1920, background: "rgba(255,0,0,0.25)" }} />
    <div style={{ position: "absolute", left: 60, top: 1190, width: 900, height: 230, border: "3px dashed #ff0" }} />
  </AbsoluteFill>
);
