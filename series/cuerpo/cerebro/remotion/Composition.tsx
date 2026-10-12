// "Cada pensamiento que tienes es una chispa eléctrica" · cerebro (principal) + neurona y sinapsis (secundario).
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BodyScene } from "./BodyScene";
import { CameraKey, project, shot } from "./kit3d/CameraRig";
import { Captions, MainLabel, Callout, Timing, K } from "./kit2d/Kit";
import { BigNumber, CoverTitle, CutFlash, voice, win } from "./Common";
import { Brain, Neurons, SOMA_A, AXON, SYN, SOMA_B } from "./Brain";
import { usePreloadModel } from "./Model";

export type Props = { timing: Timing; dpr?: number; cover?: boolean };
const C = [0, 0, 0];

export const Cerebro: React.FC<Props> = ({ timing, dpr = 1, cover = false }) => {
  const loaded = usePreloadModel("cerebro.glb");
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const F = (s: number) => Math.round(s * fps);
  const { bs, Wd } = voice(timing);
  const tN = Wd(3, "unas") - 0.15, tBack = bs(6) - 0.15;
  const neuronWorld = t >= tN && t < tBack;

  const cam: CameraKey[] = useMemo(() => {
    const k = (sec: number, target: number[], d: number, az: number, el: number, fov = 30, breathe = 1): CameraKey => ({ ...shot(F(sec), target, d, az, el, fov), breathe });
    const first = k(0, C, 28, -55, 12, 30, 0);
    return [
      first,
      k(1.0, C, 10, -65, 14),
      k(bs(2), C, 8.5, -105, 18),
      k(4.8, C, 8.5, -40, 28),
      k(bs(3), C, 7.6, -75, 10),
      k(Wd(3, "millones") - 0.1, C, 7.0, -90, 12),
      // neuronas
      k(tN, [0.3, -0.2, 0], 11.5, 0, 6),
      k(Wd(3, "ramas") - 0.2, [-2.0, 0.5, 0], 5.4, -20, 10),
      k(bs(4), [-1.6, 0.4, 0], 5.4, 15, 6),
      k(Wd(4, "recorre") - 0.2, [-0.3, 0.1, 0], 6.2, 0, 8),
      k(Wd(4, "axon") - 0.1, [0.6, -0.2, 0], 3.8, 20, 6),
      k(Wd(4, "como") - 0.2, [0.9, -0.3, 0], 5.4, -15, 10),
      k(bs(5), [2.0, -0.45, 0], 3.2, 10, 8),
      k(Wd(5, "suelta") - 0.2, SYN, 1.9, 25, 5),
      k(Wd(5, "neurotransmisores") - 0.2, SYN, 1.7, -20, 8),
      k(Wd(5, "sinapsis") - 0.3, SYN, 2.3, 5, 15),
      k(Wd(5, "encienden") - 0.2, [2.8, -0.9, 0], 4.8, 15, 6),
      k(tBack - 0.05, [3.2, -1.3, 0], 4.2, 20, 6),
      // cerebro: remate
      k(tBack, C, 9, -60, 12),
      k(Wd(6, "literalmente") - 0.2, C, 8, -88, 15),
      k(timing.voiceEnd - 0.4, C, 12, -60, 10),
      { ...first, f: durationInFrames - 1 },
    ];
  }, [timing]);

  const bsState = {
    xray: win(t, bs(3) - 0.1, tN, 0.5, 0.1),
    sparks: Math.max(win(t, 0.3, bs(3), 0.2, 0.3), win(t, tBack, durationInFrames / fps, 0.2, 0.2)),
    flash: Math.max(...[Wd(1, "chispa"), Wd(6, "chispa")].map((x) => (t >= x ? Math.exp(-(t - x) * 4) : 0))),
    frame,
  };
  const sig = interpolate(t, [Wd(4, "recorre") - 0.1, Wd(4, "como") + 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ns = {
    signal: t < bs(5) ? sig : -1,
    release: win(t, Wd(5, "suelta") - 0.1, Wd(5, "encienden") + 0.6, 0.3, 0.4),
    nextOn: win(t, Wd(5, "encienden"), tBack, 0.25, 0.1),
    showNet: win(t, tN, bs(4) + 0.5, 0.2, 0.6),
    frame,
  };
  const pr = (p: number[]) => project(cam, frame, p);
  const zoomIn = interpolate(t, [0, 1.0], [1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#02080B" }}>
      <AbsoluteFill style={{ transform: `scale(${zoomIn})` }}>
        {loaded && <BodyScene frame={frame} camKeys={cam} dpr={dpr}>
          {neuronWorld ? <Neurons s={ns} /> : <Brain s={bsState} />}
        </BodyScene>}
      </AbsoluteFill>
      {bsState.flash > 0.02 && !neuronWorld && <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, rgba(95,230,255,${bsState.flash * 0.25}) 0%, rgba(0,0,0,0) 60%)` }} />}
      {cover ? <CoverTitle before="Cada pensamiento es una" hl="chispa eléctrica" after="" bottom="dentro de tu cerebro" /> : (
        <>
          <BigNumber t={t} t0={Wd(3, "ochenta") - 0.15} t1={tN - 0.1} value={86000} label="millones de neuronas" top={290} />
          <MainLabel text="Neuronas" color="#FF7AB0" t={t} t0={Wd(3, "unas")} t1={bs(4) - 0.1} />
          <Callout text="ramas: dendritas" anchor={pr([SOMA_A[0] - 0.6, SOMA_A[1] + 0.5, 0])} offset={[60, -200]} color={K.white} t={t} t0={Wd(3, "ramas")} t1={bs(4) + 0.4} size={40} />
          <Callout text="señal eléctrica" anchor={pr(AXON[2])} offset={[-40, -230]} color={K.cold} t={t} t0={Wd(4, "señal")} t1={Wd(4, "axon") - 0.1} size={40} />
          <MainLabel text="Axón" color={K.cold} t={t} t0={Wd(4, "axon")} t1={Wd(4, "como") - 0.1} />
          <MainLabel text="Como un cable de la luz" color={K.white} t={t} t0={Wd(4, "como")} t1={bs(5) - 0.1} />
          <Callout text="neurotransmisores" anchor={pr([SYN[0] + 0.05, SYN[1] + 0.05, 0])} offset={[-40, -240]} color={K.flow} t={t} t0={Wd(5, "neurotransmisores")} t1={Wd(5, "sinapsis") - 0.1} size={40} />
          <MainLabel text="Sinapsis" color={K.flow} t={t} t0={Wd(5, "sinapsis")} t1={Wd(5, "encienden") - 0.1} />
          <Callout text="neurona siguiente" anchor={pr(SOMA_B)} offset={[-60, 230]} color={K.cold} t={t} t0={Wd(5, "encienden")} t1={tBack} size={40} />
          <MainLabel text="Una chispa" color={K.cold} t={t} t0={Wd(6, "chispa") - 0.1} t1={timing.voiceEnd + 0.6} />
          <Captions words={timing.words} t={t} />
        </>
      )}
      <CutFlash t={t} cuts={[tN, tBack]} />
    </AbsoluteFill>
  );
};
