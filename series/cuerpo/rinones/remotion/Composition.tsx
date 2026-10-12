// "Llevas unos dos millones de filtros en la espalda" · riñones (principal) + nefrona (secundario).
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { BodyScene } from "./BodyScene";
import { CameraKey, project, shot } from "./kit3d/CameraRig";
import { ramp } from "./kit3d/anim";
import { Captions, MainLabel, Callout, Timing, K } from "./kit2d/Kit";
import { BigNumber, CoverTitle, CutFlash, voice, win } from "./Common";
import { usePreloadModel } from "./Model";
import { Kidneys, Nephron, K_POS, BLADDER, RENAL_ART_L, TUBULE, PERITUB } from "./Kidneys";

export type Props = { timing: Timing; dpr?: number; cover?: boolean };
const C = [0, -1.1, 0];

export const Rinones: React.FC<Props> = ({ timing, dpr = 1, cover = false }) => {
  const loaded = usePreloadModel("rinones.glb");
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const F = (s: number) => Math.round(s * fps);
  const { bs, Wd } = voice(timing);
  const tNeph = bs(4) - 0.15, tBack = Wd(5, "orina") - 0.25;
  const nephWorld = t >= tNeph && t < tBack;
  const KL = K_POS.L;

  const cam: CameraKey[] = useMemo(() => {
    const k = (sec: number, target: number[], d: number, az: number, el: number, fov = 30, breathe = 1): CameraKey => ({ ...shot(F(sec), target, d, az, el, fov), breathe });
    const first = k(0, C, 40, 0, 5, 30, 0);
    return [
      first,
      k(1.0, [0, 0.1, 0], 12.5, -8, 6),
      k(bs(2), [0, 0.1, 0], 11.5, 16, 8),
      k(4.6, [0, -1.6, 0], 20, -18, 10),
      k(bs(3), KL, 6.4, 12, 6),
      k(Wd(3, "millon") - 0.2, KL, 5.4, -10, 8),
      k(Wd(3, "reciben") - 0.2, [0.6, 0.4, 0], 5.4, 20, 10),
      k(tNeph - 0.05, [0.8, 0.3, 0], 3.6, 26, 10),
      // nefrona
      k(tNeph, [0.6, -0.4, 0], 7.5, 15, 14),
      k(Wd(4, "glomerulo") - 0.2, [0, 0, 0], 5.2, -15, 10),
      k(Wd(4, "deja") - 0.2, [0.1, 0, 0], 4.4, 25, 5),
      k(Wd(4, "retiene") - 0.2, [0, 0, 0], 4.6, -30, 20),
      k(bs(5), [1.6, -0.9, 0], 6.4, 0, 6),
      k(Wd(5, "devuelve") - 0.3, [2.0, -1.6, 0], 4.8, 30, 6),
      k(Wd(5, "sobra") - 0.2, [2.9, -1.9, 0], 4.8, -15, 4),
      k(tBack - 0.05, [3.2, -2.4, 0], 4.0, -20, 4),
      // riñones: orina hacia la vejiga y remate
      k(tBack, [0, -2.0, 0], 16, 10, 8),
      k(Wd(5, "vejiga") - 0.1, [0, -3.3, 0.2], 8.5, -10, 10),
      k(bs(6), C, 20, 8, 6),
      k(timing.voiceEnd - 0.4, C, 22, 0, 6),
      { ...first, f: durationInFrames - 1 },
    ];
  }, [timing]);

  const open = ramp(frame, F(Wd(3, "riñones") - 0.1), F(Wd(3, "riñones") + 1.1)) * (t < tNeph + 0.2 ? 1 : 0);
  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 5), []);
  clip.constant = 1.0 - open * 0.98;
  const ks = {
    open,
    blood: Math.max(win(t, bs(2), tNeph, 0.3, 0.1), win(t, bs(6), timing.voiceEnd, 0.3, 0.5) * 0.6),
    urine: win(t, tBack, timing.voiceEnd, 0.1, 0.5),
    sparkle: Math.max(win(t, 0.4, 2.6, 0.3, 0.3), win(t, Wd(6, "dos") - 0.2, timing.voiceEnd, 0.3, 0.5)),
    frame,
  };
  const ns = {
    filter: win(t, Wd(4, "deja") - 0.3, bs(5), 0.4, 0.3),
    retain: win(t, Wd(4, "retiene") - 0.4, bs(5) + 0.3, 0.3, 0.4),
    reabsorb: win(t, bs(5) - 0.1, tBack, 0.4, 0.1),
    frame,
  };
  const pr = (p: number[]) => project(cam, frame, p);
  const zoomIn = interpolate(t, [0, 1.0], [1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#02080B" }}>
      <AbsoluteFill style={{ transform: `scale(${zoomIn})` }}>
        {loaded && <BodyScene frame={frame} camKeys={cam} dpr={dpr}>
          {nephWorld ? <Nephron s={ns} /> : <Kidneys s={ks} clip={clip} />}
        </BodyScene>}
      </AbsoluteFill>
      {cover ? <CoverTitle before="Llevas" hl="2 millones de filtros" after="en la espalda" bottom="tus riñones" hlColor={K.flow} /> : (
        <>
          <MainLabel text="Riñones" color="#FF7AB0" t={t} t0={Wd(3, "riñones")} t1={Wd(3, "millon") - 0.25} />
          <BigNumber t={t} t0={Wd(3, "millon") - 0.15} t1={Wd(3, "reciben") - 0.2} value={1000000} label="nefronas en cada riñón" top={290} />
          <Callout text="arteria renal" anchor={pr(RENAL_ART_L[1])} offset={[-60, -220]} color="#FF6B78" t={t} t0={Wd(3, "arteria")} t1={tNeph} size={42} />
          <MainLabel text="Glomérulo" color="#FF6B78" t={t} t0={Wd(4, "glomerulo")} t1={Wd(4, "colador") - 0.1} />
          <MainLabel text="Como un colador" color={K.white} t={t} t0={Wd(4, "colador")} t1={bs(5) - 0.1} />
          <Callout text="agua, sales y desechos" anchor={pr([0.55, 0.35, 0.2])} offset={[-40, 230]} color={K.cold} t={t} t0={Wd(4, "deja")} t1={Wd(4, "retiene") - 0.2} size={38} />
          <Callout text="células y proteínas: no" anchor={pr([-0.35, 0.1, 0.2])} offset={[40, 240]} color="#FF6B78" t={t} t0={Wd(4, "retiene")} t1={bs(5) - 0.1} size={38} />
          <MainLabel text="Túbulo" color={K.flow} t={t} t0={Wd(5, "tubito")} t1={Wd(5, "devuelve") - 0.1} />
          <Callout text="vuelve a la sangre" anchor={pr(PERITUB[5])} offset={[-80, -220]} color={K.cold} t={t} t0={Wd(5, "devuelve")} t1={Wd(5, "sobra") - 0.1} size={40} />
          <Callout text="orina" anchor={pr(TUBULE[11])} offset={[-120, -200]} color={K.flow} t={t} t0={Wd(5, "sobra")} t1={tBack} size={42} />
          <Callout text="vejiga" anchor={pr(BLADDER)} offset={[160, 120]} color={K.flow} t={t} t0={Wd(5, "vejiga")} t1={bs(6) + 0.5} size={42} />
          <MainLabel text="2 millones de filtros" color={K.flow} t={t} t0={Wd(6, "dos") - 0.1} t1={timing.voiceEnd + 0.6} />
          <Captions words={timing.words} t={t} />
        </>
      )}
      <CutFlash t={t} cuts={[tNeph, tBack]} />
    </AbsoluteFill>
  );
};
