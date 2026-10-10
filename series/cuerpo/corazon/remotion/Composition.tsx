// "Tu corazón no necesita a tu cerebro para latir" · 9:16, ~40 s. Modelo principal (corazón) + secundario (válvula).
// La puesta en escena está anclada a las palabras de la voz (Wd). El audio se mezcla aparte con ffmpeg.
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { BodyScene } from "./BodyScene";
import { CameraKey, project, shot } from "./kit3d/CameraRig";
import { ramp } from "./kit3d/anim";
import { Captions, MainLabel, Callout, Timing, K, FONT } from "./kit2d/Kit";
import { Heart, HeartState, SA_NODE, AV_NODE, VESSELS } from "./Heart";
import { Valve } from "./Valve";

export type Props = { timing: Timing; dpr?: number; debug?: boolean; cover?: boolean };

const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");
const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) =>
  interpolate(t, [a - fi, a, b, b + fo], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const HC = [0.1, 0.55, 0]; // centro del corazón con sus vasos

/** Fase del ciclo cardiaco integrando la frecuencia (72 lpm; en el beat 4, cámara lenta a 25 lpm). */
export function beatPhaseAt(t: number, slowA: number, slowB: number) {
  const dt = 1 / 60;
  let ph = 0.1;
  for (let x = 0; x < t; x += dt) {
    const slow = interpolate(x, [slowA - 0.6, slowA, slowB, slowB + 0.6], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ph += dt * (1.2 * (1 - slow) + 0.42 * slow);
  }
  return ph % 1;
}

export const Corazon: React.FC<Props> = ({ timing, dpr = 1, debug = false, cover = false }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const F = (s: number) => Math.round(s * fps);
  const B = timing.beats;
  const bs = (i: number) => B[i - 1].s, be = (i: number) => B[i - 1].e;
  const Wd = (i: number, w: string) => {
    const x = timing.words.find((k) => k.beat === i - 1 && norm(k.w).startsWith(norm(w)));
    return x ? x.s : B[i - 1].s;
  };
  const tValve = bs(5) - 0.15, tBack = Wd(5, "asi") - 0.1;
  const valveWorld = t >= tValve && t < tBack;

  // ---------- cámara: un cambio cada 2-3 s ----------
  const cam: CameraKey[] = useMemo(() => {
    const k = (sec: number, target: number[], d: number, az: number, el: number, fov = 30, breathe = 1): CameraKey =>
      ({ ...shot(F(sec), target, d, az, el, fov), breathe });
    const first = k(0, HC, 30, 0, 5, 30, 0);
    const SA = SA_NODE;
    return [
      first,
      k(0.9, HC, 10.5, -10, 6),
      k(2.3, HC, 9.0, 12, 6),
      k(bs(2), HC, 9.4, -24, 12),
      k(4.7, HC, 9.4, 24, 6),
      k(bs(3) + 0.1, SA, 6.6, -16, 10),
      k(9.6, SA, 4.4, 6, 8),
      k(11.3, SA, 3.8, -10, 6),
      k(Wd(3, "chispa") - 0.3, [-0.25, 0.6, 0], 4.8, 0, 6),
      k(bs(4), [0.0, 0.35, 0], 6.8, 0, 5),
      k(Wd(4, "auriculas") + 0.2, [-0.15, 0.95, 0], 3.8, -12, 10),
      k(Wd(4, "ventriculos") + 0.2, [0.1, -0.3, 0], 4.2, 12, 2),
      k(Wd(4, "pulmones") - 0.2, [0.35, 1.45, 0], 6.2, 18, 8),
      k(tValve - 0.05, [0.35, 1.45, 0], 5.6, 26, 8),
      // válvula
      k(tValve, [0, 0.1, 0], 7.6, 10, 40),
      k(Wd(5, "valvulas") + 0.4, [0, 0.2, 0], 6.2, -20, 30),
      k(Wd(5, "sentido") + 0.1, [0, 0.1, 0], 5.6, 25, 18),
      k(tBack - 0.05, [0, 0.1, 0], 5.0, 35, 15),
      // corazón cerrado: la cifra
      k(tBack, HC, 10.5, -16, 8),
      k(be(5), HC, 9.6, 14, 8),
      // nervios cortados
      k(bs(6), [-0.3, 1.5, 0], 8.0, -10, 12),
      k(Wd(6, "corazon") - 0.2, HC, 9.6, 6, 8),
      k(timing.voiceEnd - 0.6, HC, 12, 0, 6),
      { ...first, f: durationInFrames - 1 },
    ];
  }, [timing]);

  // ---------- estado del corazón ----------
  const beatPhase = beatPhaseAt(t, bs(4), be(4));
  const open = ramp(frame, F(1.2), F(2.2)) * (t < tValve + 0.2 ? 1 : 0);
  const flash = Math.max(...[0.12, 0.95, 1.78, Wd(3, "chispa")].map((x) => (t >= x ? Math.exp(-(t - x) * 5) : 0))) * (cover ? 0 : 1);
  const hs: HeartState = {
    beatPhase,
    open,
    electric: open,
    flash,
    blood: win(t, bs(4) + 0.4, be(4) + 0.3, 0.5, 0.3),
    nerves: win(t, bs(6) + 0.15, timing.voiceEnd - 0.4, 0.3, 0.8),
    nerveCut: ramp(frame, F(Wd(6, "corten")), F(Wd(6, "corten") + 0.7)),
  };
  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 5), []);
  clip.constant = 1.3 - open * 1.2;
  const vClip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 0), []);

  // válvula: ciclo de 1,6 s (abre al empujar la sangre, cierra de golpe)
  const vp = ((t - tValve) / 1.6) % 1;
  const vOpen = vp < 0.4 ? Math.sin((vp / 0.4) * Math.PI / 2) : vp < 0.5 ? 1 - (vp - 0.4) / 0.1 : 0;

  const pr = (p: number[]) => project(cam, frame, p);
  const zoomIn = interpolate(t, [0, 0.9], [1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cutFlash = Math.max(0, 1 - Math.abs(t - tValve) / 0.14) + Math.max(0, 1 - Math.abs(t - tBack) / 0.14);

  return (
    <AbsoluteFill style={{ backgroundColor: "#02080B" }}>
      <AbsoluteFill style={{ transform: `scale(${zoomIn})` }}>
        <BodyScene frame={frame} camKeys={cam} dpr={dpr}>
          {valveWorld ? <Valve open={vOpen} flow={vOpen} frame={frame} clip={vClip} /> : <Heart s={hs} clip={clip} frame={frame} />}
        </BodyScene>
      </AbsoluteFill>
      {/* destello cian del impulso eléctrico */}
      {flash > 0.02 && <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, rgba(95,230,255,${flash * 0.22}) 0%, rgba(0,0,0,0) 60%)` }} />}

      {cover ? <CoverTitle /> : (
        <>
          <MainLabel text="Nódulo sinusal" color={K.cold} t={t} t0={Wd(3, "nodulo")} t1={Wd(3, "chispa") - 0.3} />
          <Callout text="marcapasos natural" anchor={pr(SA_NODE)} offset={[60, 230]} color={K.cold} t={t} t0={Wd(3, "marcapasos")} t1={be(3)} size={40} />
          <MainLabel text="La señal eléctrica" color={K.cold} t={t} t0={bs(4)} t1={Wd(4, "auriculas") - 0.1} />
          <Callout text="aurículas" anchor={pr([-0.68, 0.95, 0.1])} offset={[-80, -220]} color={K.white} t={t} t0={Wd(4, "auriculas")} t1={Wd(4, "ventriculos") + 1.0} size={42} />
          <Callout text="ventrículos" anchor={pr([0.25, -0.35, 0.1])} offset={[60, 230]} color={K.white} t={t} t0={Wd(4, "ventriculos")} t1={Wd(4, "pulmones")} size={42} />
          <Callout text="a los pulmones" anchor={pr(VESSELS.PULM_L[2])} offset={[-40, -220]} color="#8FA6FF" t={t} t0={Wd(4, "pulmones")} t1={tValve} size={40} />
          <Callout text="a todo el cuerpo" anchor={pr(VESSELS.AORTA[2])} offset={[-100, -160]} color="#FF6B78" t={t} t0={Wd(4, "cuerpo")} t1={tValve} size={40} />
          <MainLabel text="Válvulas" color="#FF7AB0" t={t} t0={tValve + 0.2} t1={Wd(5, "sentido") - 0.2} />
          <MainLabel text="Un solo sentido" color={K.white} t={t} t0={Wd(5, "sentido") - 0.1} t1={Wd(5, "sonido")} />
          <MainLabel text="El sonido del latido" color={K.flow} t={t} t0={Wd(5, "sonido")} t1={tBack} />
          <BigNumber t={t} t0={Wd(5, "cien") - 0.15} t1={bs(6) + 0.1} />
          <Callout text="nervios" anchor={pr([-1.0, 2.4, 0.1])} offset={[40, 260]} color={K.flow} t={t} t0={bs(6) + 0.2} t1={Wd(6, "corten") + 1.0} size={42} />
          <MainLabel text="Sigue latiendo" color={K.hot} t={t} t0={Wd(6, "sigue")} t1={timing.voiceEnd + 0.4} />
          <Captions words={timing.words} t={t} />
        </>
      )}
      {cutFlash > 0 && <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, rgba(255,235,240,${cutFlash * 0.9}) 0%, rgba(255,90,140,${cutFlash * 0.55}) 45%, rgba(0,0,0,0) 80%)` }} />}
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};

/** Cifra clave: contador hasta 100.000 latidos al día. */
const BigNumber: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const a = win(t, t0, t1, 0.15, 0.3);
  if (a <= 0) return null;
  const k = Math.min(1, Math.max(0, (t - t0) / 0.7));
  const val = Math.round((1 - Math.pow(1 - k, 3)) * 100000);
  const pop = interpolate(t - t0, [0, 0.12, 0.3], [0.5, 1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 300, left: 60, width: 900, display: "flex", flexDirection: "column", alignItems: "center", opacity: a, transform: `scale(${pop})` }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 170, lineHeight: 0.95, color: K.flow, textShadow: "0 0 40px rgba(255,200,61,0.7), 0 8px 0 #06101F" }}>
        {val.toLocaleString("es-ES").replace(/,/g, ".")}
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 54, color: K.white, textShadow: "0 4px 0 #06101F" }}>latidos al día</div>
    </div>
  );
};

/** Portada (primer fotograma = miniatura): título grande y corazón abierto con su sistema eléctrico. */
const CoverTitle: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,8,11,0.85) 0%, rgba(2,8,11,0) 32%, rgba(2,8,11,0) 62%, rgba(2,8,11,0.8) 100%)" }} />
    <div style={{ position: "absolute", top: 180, left: 60, width: 900, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 100, lineHeight: 1.0,
      color: K.white, textShadow: "0 6px 0 #06101F, 0 0 30px rgba(0,0,0,0.8)" }}>
      Tu corazón <span style={{ color: K.cold }}>no necesita</span> a tu cerebro
    </div>
    <div style={{ position: "absolute", top: 1250, left: 60, width: 900, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 60,
      color: "#FF7AB0", textShadow: "0 4px 0 #06101F" }}>para latir</div>
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
