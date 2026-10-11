// "Tus ojos ven el mundo al revés" · ojo seccionado (principal) + flecha exterior y retina de cerca (secundarios).
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { BodyScene } from "./BodyScene";
import { CameraKey, project, shot } from "./kit3d/CameraRig";
import { ramp } from "./kit3d/anim";
import { Captions, MainLabel, Callout, Timing, K } from "./kit2d/Kit";
import { BigNumber, CoverTitle, CutFlash, voice, win } from "./Common";
import { Eye, Retina, CORNEA, LENS, RETINA_PT, NERVE, OBJ, IMG, RX } from "./Eye";

export type Props = { timing: Timing; dpr?: number; cover?: boolean };
const C = [0, 0, 0];

export const Ojo: React.FC<Props> = ({ timing, dpr = 1, cover = false }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const F = (s: number) => Math.round(s * fps);
  const { bs, Wd } = voice(timing);
  const tRet = bs(5) - 0.15, tBack = Wd(5, "nervio") - 0.25;
  const retWorld = t >= tRet && t < tBack;
  const WIDE = [-1.15, 0, 0];

  const cam: CameraKey[] = useMemo(() => {
    const k = (sec: number, target: number[], d: number, az: number, el: number, fov = 30, breathe = 1): CameraKey => ({ ...shot(F(sec), target, d * 2.1, az, el, fov), breathe });
    const first = k(0, C, 7.5, -62, 4, 30, 0);
    return [
      first,
      k(1.0, C, 6.2, -70, 6),
      k(bs(2), C, 6.0, -35, 14),
      k(Wd(2, "esto") - 0.2, C, 6.4, -10, 8),
      k(bs(3), C, 6.0, 0, 6),
      k(Wd(3, "luz") - 0.1, WIDE, 11, -14, 5),
      k(Wd(3, "cornea") - 0.1, [-1.0, 0.1, 0], 5.0, -18, 6),
      k(Wd(3, "cristalino") - 0.2, LENS, 4.2, 15, 8),
      k(Wd(3, "camara") - 0.3, WIDE, 10.5, 10, 6),
      k(bs(4), [-0.6, 0, 0], 5.8, -10, 4),
      k(Wd(4, "imagen") - 0.2, [-0.4, 0, 0], 5.2, 12, 8),
      k(Wd(4, "fondo") - 0.2, [0.5, 0, 0], 5.0, -8, 6),
      k(Wd(4, "retina") - 0.2, [0.7, 0, 0], 3.8, 20, 6),
      k(Wd(4, "proyecta") - 0.2, [0.85, 0, 0], 3.4, -25, 4),
      k(tRet - 0.05, [0.95, 0, 0], 2.6, -30, 4),
      // retina de cerca
      k(tRet, [0, 0.2, 0], 14, 10, 16),
      k(Wd(5, "celulas") - 0.2, [-0.6, -0.2, 0], 10, -15, 12),
      k(Wd(5, "seis") - 0.3, [-0.9, 0.5, 0.3], 7.5, 20, 8),
      k(Wd(5, "colores") - 0.3, [-0.9, 0.4, 0.3], 7, -15, 6),
      k(Wd(5, "convierten") - 0.2, [0.4, 0.4, 0], 9, 15, 10),
      k(Wd(5, "senales") - 0.2, RX.gang, 8, -10, 6),
      k(tBack - 0.05, RX.fibers, 6.5, 20, 4),
      // ojo: nervio y remate
      k(tBack, [1.2, -0.1, 0], 6.5, 15, 6),
      k(bs(6), WIDE, 11, -8, 5),
      k(Wd(6, "ves") - 0.1, WIDE, 10.5, 10, 6),
      k(Wd(6, "aunque") - 0.2, [0.7, 0, 0], 4.2, -15, 6),
      k(timing.voiceEnd - 0.3, [0.85, 0, 0], 3.4, 15, 4),
      { ...first, f: durationInFrames - 1 },
    ];
  }, [timing]);

  const open = ramp(frame, F(Wd(2, "esto") - 0.1), F(Wd(2, "esto") + 1.0)) * (t < timing.voiceEnd + 0.1 ? 1 : 0)
    * (1 - ramp(frame, F(timing.voiceEnd), F(timing.voiceEnd + 0.6)));
  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 5), []);
  clip.constant = 2.0 - open * 1.98;
  const es = {
    open,
    rays: Math.max(win(t, Wd(3, "luz"), tRet, 0.3, 0.1), win(t, bs(6), timing.voiceEnd, 0.3, 0.4)),
    cross: Math.max(win(t, Wd(3, "enfoca") - 0.1, Wd(3, "camara"), 0.3, 0.3), win(t, Wd(4, "invierte") - 0.1, Wd(4, "fondo"), 0.2, 0.4)),
    proj: Math.max(win(t, Wd(4, "proyecta") - 0.1, tRet, 0.3, 0.1), win(t, bs(6), timing.voiceEnd, 0.3, 0.4)),
    signal: win(t, tBack, Wd(6, "interpreta") + 0.6, 0.1, 0.4),
    parts: Math.max(win(t, Wd(3, "luz") - 0.3, tRet, 0.3, 0.1), win(t, bs(6) - 0.2, timing.voiceEnd, 0.3, 0.4)),
    frame,
  };
  const rs = {
    photons: win(t, tRet, Wd(5, "convierten") + 0.3, 0.2, 0.4),
    lit: win(t, Wd(5, "sensibles") - 0.2, tBack, 0.3, 0.1),
    color: win(t, Wd(5, "colores") - 0.2, Wd(5, "convierten"), 0.2, 0.4),
    signal: win(t, Wd(5, "convierten"), tBack, 0.3, 0.1),
    frame,
  };
  const pr = (p: number[]) => project(cam, frame, p);
  const zoomIn = interpolate(t, [0, 1.0], [1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#02080B" }}>
      <AbsoluteFill style={{ transform: `scale(${zoomIn})` }}>
        <BodyScene frame={frame} camKeys={cam} dpr={dpr}>
          {retWorld ? <Retina s={rs} /> : <Eye s={es} clip={clip} />}
        </BodyScene>
      </AbsoluteFill>
      {cover ? <CoverTitle before="Tus ojos ven el mundo" hl="al revés" after="" bottom="y tú ni lo notas" hlColor={K.flow} /> : (
        <>
          <MainLabel text="Al revés" color={K.flow} t={t} t0={Wd(1, "reves") - 0.1} t1={bs(2) + 0.6} />
          <Callout text="córnea" anchor={pr(CORNEA)} offset={[-60, -230]} color={K.cold} t={t} t0={Wd(3, "cornea")} t1={Wd(3, "cristalino") - 0.1} size={42} />
          <Callout text="cristalino" anchor={pr([LENS[0], LENS[1] + 0.3, 0.1])} offset={[40, -240]} color={K.white} t={t} t0={Wd(3, "cristalino")} t1={Wd(3, "camara") - 0.2} size={42} />
          <MainLabel text="Como una cámara" color={K.white} t={t} t0={Wd(3, "camara") - 0.1} t1={bs(4) - 0.1} />
          <MainLabel text="Invierte la imagen" color={K.flow} t={t} t0={Wd(4, "invierte")} t1={Wd(4, "retina") - 0.2} />
          <Callout text="retina" anchor={pr(RETINA_PT)} offset={[-80, -230]} color="#FF6B8A" t={t} t0={Wd(4, "retina")} t1={Wd(4, "boca") - 0.1} size={44} />
          <MainLabel text="Boca abajo" color={K.flow} t={t} t0={Wd(4, "boca")} t1={tRet} />
          <BigNumber t={t} t0={Wd(5, "seis") - 0.15} t1={Wd(5, "colores") + 0.4} value={6000000} label="conos para ver los colores" top={290} />
          <Callout text="conos" anchor={pr(RX.cone)} offset={[60, 260]} color={K.flow} t={t} t0={Wd(5, "conos")} t1={Wd(5, "convierten") - 0.1} size={42} />
          <MainLabel text="Señales eléctricas" color={K.cold} t={t} t0={Wd(5, "senales")} t1={tBack} />
          <Callout text="nervio óptico" anchor={pr(NERVE)} offset={[-120, 230]} color="#E9CD92" t={t} t0={tBack + 0.1} t1={bs(6) - 0.1} size={42} />
          <MainLabel text="Tu cerebro lo interpreta" color={K.cold} t={t} t0={Wd(6, "interpreta") - 0.1} t1={Wd(6, "aunque") - 0.2} />
          <MainLabel text="Sigue al revés" color={K.flow} t={t} t0={Wd(6, "siga") - 0.1} t1={timing.voiceEnd + 0.6} />
          <Captions words={timing.words} t={t} />
        </>
      )}
      <CutFlash t={t} cuts={[tRet, tBack]} />
    </AbsoluteFill>
  );
};
