// "Tus pulmones no se mueven solos para respirar" · modelo principal (pulmones + diafragma) y secundario (alvéolos).
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BodyScene } from "./BodyScene";
import { CameraKey, project, shot } from "./kit3d/CameraRig";
import { Captions, MainLabel, Callout, Timing, K, FONT } from "./kit2d/Kit";
import { BigNumber, CoverTitle, CutFlash, voice, win } from "./Common";
import { Lungs, Alveoli, LungsState } from "./Lungs";

export type Props = { timing: Timing; dpr?: number; cover?: boolean };
const C = [0, 0.2, 0];

export const Pulmones: React.FC<Props> = ({ timing, dpr = 1, cover = false }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const F = (s: number) => Math.round(s * fps);
  const { bs, be, Wd } = voice(timing);
  const tAlv = Wd(5, "final") - 0.15, tBack = Wd(5, "asi") - 0.1;
  const alvWorld = t >= tAlv && t < tBack;

  const cam: CameraKey[] = useMemo(() => {
    const k = (sec: number, target: number[], d: number, az: number, el: number, fov = 30, breathe = 1): CameraKey => ({ ...shot(F(sec), target, d, az, el, fov), breathe });
    const first = k(0, C, 34, 0, 5, 30, 0);
    return [
      first,
      k(1.0, C, 15, -10, 6),
      k(bs(2), C, 13.5, 14, 8),
      k(4.4, C, 13.5, -22, 10),
      k(bs(3) - 0.1, [0, -1.5, 0], 9, 10, 24),
      k(Wd(3, "musculo"), [0, -1.65, 0.2], 6.5, -16, 9),
      k(Wd(3, "baja"), [0, -1.3, 0], 9.5, 0, 4),
      k(Wd(3, "como") - 0.1, [0, -0.5, 0], 12.5, 15, 6),
      k(bs(4), C, 12.5, 0, 4),
      k(Wd(4, "aire"), [0, 0.9, 0], 8, -12, 6),
      k(Wd(4, "traquea") - 0.2, [0, 1.6, 0], 4.8, 10, 10),
      k(Wd(4, "bronquios") - 0.3, [0.6, 0.4, 0], 5.4, 25, 4),
      k(Wd(4, "ramas") - 0.2, [-0.6, 0.3, 0], 5.8, -25, 4),
      k(tAlv - 0.05, [-0.6, 0.0, 0], 4.5, -30, 4),
      // alvéolos
      k(tAlv, [0, 0.4, 0], 10, 10, 16),
      k(Wd(5, "alveolos") - 0.2, [0, 0.1, 0], 8, -20, 10),
      k(Wd(5, "oxigeno") - 0.2, [0.3, -0.2, 0.3], 6, 25, 6),
      k(Wd(5, "dioxido") - 0.2, [-0.3, -0.1, 0.3], 6, -25, 12),
      k(tBack - 0.05, [-0.3, -0.1, 0.3], 5.6, -30, 12),
      // pulmones: cifra y remate
      k(tBack, C, 15, 12, 8),
      k(bs(6), [0, -1.0, 0], 11, -12, 10),
      k(Wd(6, "tiran"), [0, -0.7, 0], 12, 8, 6),
      k(timing.voiceEnd - 0.4, C, 15, 0, 6),
      { ...first, f: durationInFrames - 1 },
    ];
  }, [timing]);

  // respiración: ciclos suaves de 3,2 s; inspiración grande en el gancho y lenta en "se contrae, baja"
  const base = 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / 3.2);
  const hook = interpolate(t, [0.1, 0.9, 1.9, 2.8], [0, 1, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slow = interpolate(t, [Wd(3, "contrae") - 0.2, Wd(3, "sitio") + 0.2, Wd(3, "jeringa"), bs(4) + 0.4], [0, 1, 1, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wHook = win(t, 0.1, 2.6, 0.1, 0.5), wSlow = win(t, Wd(3, "contrae") - 0.2, bs(4) + 0.3, 0.4, 0.5);
  const breath = Math.max(hook * wHook, slow * wSlow, base * (1 - Math.max(wHook, wSlow)));
  const bNext = (() => { const t2 = t + 0.05; const b2 = 0.5 - 0.5 * Math.cos((2 * Math.PI * t2) / 3.2); return b2 - base; })();
  const inhaling = (t > Wd(4, "aire") - 0.4 && t < be(4)) ? 1 : bNext >= 0 ? 1 : -1;
  const s: LungsState = {
    breath,
    xray: win(t, bs(4) + 0.2, tAlv + 0.3, 0.5, 0.1),
    air: Math.max(win(t, Wd(4, "aire") - 0.3, tAlv, 0.3, 0.1), win(t, 0.2, 1.8, 0.1, 0.3) * 0.7),
    airDir: inhaling,
    frame,
    o2glow: win(t, 0.3, 1.2, 0.1, 0.6),
  };
  const pr = (p: number[]) => project(cam, frame, p);
  const zoomIn = interpolate(t, [0, 1.0], [1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#02080B" }}>
      <AbsoluteFill style={{ transform: `scale(${zoomIn})` }}>
        <BodyScene frame={frame} camKeys={cam} dpr={dpr}>
          {alvWorld ? <Alveoli frame={frame} exchange={win(t, Wd(5, "oxigeno") - 0.4, tBack, 0.4, 0.1)} /> : <Lungs s={s} />}
        </BodyScene>
      </AbsoluteFill>
      {cover ? <CoverTitle before="Tus pulmones" hl="no se mueven" after="solos" bottom="para respirar" /> : (
        <>
          <MainLabel text="Diafragma" color="#FF7AB0" t={t} t0={Wd(3, "diafragma")} t1={Wd(3, "como") - 0.2} />
          <Callout text="se contrae y baja" anchor={pr([0.9, -1.6, 0.6])} offset={[-40, 200]} color={K.flow} t={t} t0={Wd(3, "contrae")} t1={Wd(3, "como") - 0.2} size={40} />
          <Syringe t={t} t0={Wd(3, "como") - 0.1} t1={bs(4) + 0.2} />
          <Callout text="tráquea" anchor={pr([0, 1.7, 0.15])} offset={[160, -150]} color={K.white} t={t} t0={Wd(4, "traquea")} t1={Wd(4, "bronquios") - 0.3} size={42} />
          <MainLabel text="Bronquios" color={K.cold} t={t} t0={Wd(4, "bronquios")} t1={tAlv} />
          <MainLabel text="Alvéolos" color="#FF7AB0" t={t} t0={Wd(5, "alveolos")} t1={Wd(5, "oxigeno") - 0.1} />
          <Callout text="oxígeno → sangre" anchor={pr([0.5, -0.6, 0.9])} offset={[-60, 230]} color={K.cold} t={t} t0={Wd(5, "oxigeno")} t1={tBack} size={40} />
          <Callout text="CO₂ → fuera" anchor={pr([-0.6, 0.2, 0.9])} offset={[60, -230]} color={K.flow} t={t} t0={Wd(5, "dioxido")} t1={tBack} size={40} />
          <BigNumber t={t} t0={Wd(5, "veinte") - 0.15} t1={bs(6) + 0.6} value={20000} label="respiraciones al día" />
          <MainLabel text="Es tu diafragma" color="#FF7AB0" t={t} t0={Wd(6, "diafragma") - 0.3} t1={timing.voiceEnd + 0.6} />
          <Captions words={timing.words} t={t} />
        </>
      )}
      <CutFlash t={t} cuts={[tAlv, tBack]} />
    </AbsoluteFill>
  );
};

/** Analogía 2D: jeringa cuyo émbolo se estira y el aire entra. */
const Syringe: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const a = win(t, t0, t1, 0.2, 0.3);
  if (a <= 0) return null;
  const pull = interpolate(t, [t0 + 0.2, t0 + 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 240, top: 300, width: 600, opacity: a }}>
      <svg width={600} height={220} viewBox="0 0 600 220">
        <rect x={60} y={70} width={380} height={80} rx={14} fill="rgba(143,230,255,0.12)" stroke="#8FE6FF" strokeWidth={6} />
        <rect x={20} y={95} width={40} height={30} rx={6} fill="#8FE6FF" />
        <rect x={80 + pull * 200} y={78} width={22} height={64} rx={6} fill="#FF7AB0" />
        <rect x={102 + pull * 200} y={102} width={250} height={16} rx={6} fill="#FF7AB0" />
        <rect x={352 + pull * 200} y={80} width={20} height={60} rx={6} fill="#FF7AB0" />
        {[0, 1, 2].map((i) => {
          const u = ((t * 1.6 + i / 3) % 1) * pull;
          return <circle key={i} cx={20 + u * 70} cy={110} r={9} fill="#8FE6FF" opacity={pull} />;
        })}
      </svg>
      <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 40, color: K.white, textShadow: "0 3px 0 #06101F" }}>como una jeringa</div>
    </div>
  );
};
