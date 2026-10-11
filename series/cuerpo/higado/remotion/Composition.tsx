// "Tu hígado es capaz de volver a crecer" · hígado (principal) + lobulillo hepático (secundario).
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BodyScene } from "./BodyScene";
import { CameraKey, project, shot } from "./kit3d/CameraRig";
import { ramp } from "./kit3d/anim";
import { Captions, MainLabel, Callout, Timing, K } from "./kit2d/Kit";
import { BigNumber, CoverTitle, CutFlash, voice, win } from "./Common";
import { Liver, Lobule, PORTAL, GALL, CUT_X, TRIAD, CELL_PT } from "./Liver";

export type Props = { timing: Timing; dpr?: number; cover?: boolean };
const C = [0, 0, 0];

export const Higado: React.FC<Props> = ({ timing, dpr = 1, cover = false }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const F = (s: number) => Math.round(s * fps);
  const { bs, Wd } = voice(timing);
  const tLob = bs(4) - 0.15, tBack = Wd(5, "y") - 0.2;
  const lobWorld = t >= tLob && t < tBack;

  const cam: CameraKey[] = useMemo(() => {
    const k = (sec: number, target: number[], d: number, az: number, el: number, fov = 30, breathe = 1): CameraKey => ({ ...shot(F(sec), target, d, az, el, fov), breathe });
    const first = k(0, [0.2, -0.2, 0], 19, 0, 6, 30, 0);
    return [
      first,
      k(1.2, [0.2, -0.2, 0], 17, -12, 8),
      k(bs(2), [0, -0.2, 0], 19, 18, 12),
      k(Wd(2, "fabrica") - 0.3, [-0.4, 0, 0], 15, -25, 6),
      k(bs(3), [0, -0.9, 0], 16, 10, -4),
      k(Wd(3, "vena") - 0.2, [0, -1.1, 0.2], 12, -15, 2),
      k(Wd(3, "cargada") - 0.1, [-0.1, -0.8, 0.2], 10.5, 15, 4),
      k(tLob - 0.05, [-0.1, -0.5, 0.2], 6, 0, 4),
      // lobulillo
      k(tLob, C, 27, 0, 35),
      k(Wd(4, "hepatocitos") - 0.2, [0, -0.3, 0], 19, 15, 40),
      k(Wd(4, "azucar") - 0.3, CELL_PT, 12.5, -15, 45),
      k(Wd(4, "fabrican") - 0.2, [0.3, -0.5, 0], 15, 20, 40),
      k(Wd(4, "neutralizan") - 0.2, [-0.4, 0.3, 0], 14, -10, 50),
      k((Wd(4, "filtro") - 0.3) - 0.2, C, 24, 5, 30),
      k(bs(5), TRIAD, 13.5, -20, 40),
      k(Wd(5, "grasas") - 0.2, C, 21, 15, 35),
      k(tBack - 0.05, C, 19, 25, 40),
      // hígado: donación y regeneración
      k(tBack, [0, -0.2, 0], 19, 0, 6),
      k(Wd(5, "multiplican") - 0.3, [CUT_X, 0, 0], 10, 20, 8),
      k(Wd(5, "donante") - 0.2, [0, -0.2, 0], 19, -12, 6),
      k(bs(6), [-0.2, 0, 0], 16, 15, 8),
      k(Wd(6, "recupera") - 0.1, [0, -0.1, 0], 17, -10, 6),
      k(Wd(6, "porque") - 0.1, [0, -0.2, 0], 19, 8, 8),
      k(timing.voiceEnd - 0.3, [0, -0.2, 0], 22, 0, 6),
      { ...first, f: durationInFrames - 1 },
    ];
  }, [timing]);

  const hook = 1 - ramp(frame, F(Wd(1, "volver") - 0.3), F(Wd(1, "crecer") + 0.5));
  const donate = ramp(frame, F(Wd(5, "quitan") - 0.1), F(Wd(5, "parte") + 0.3)) * (1 - ramp(frame, F(Wd(6, "recupera") - 0.1), F(Wd(6, "tamaño") + 0.2)));
  const ls = {
    cut: Math.max(hook, donate),
    ghost: Math.max(hook, donate),
    portal: win(t, bs(3) - 0.1, tLob, 0.4, 0.1),
    regrow: Math.max(win(t, Wd(1, "volver") - 0.3, Wd(1, "crecer") + 0.6, 0.2, 0.3), win(t, Wd(5, "celulas"), Wd(5, "donante"), 0.2, 0.3), win(t, Wd(6, "recupera") - 0.1, Wd(6, "tamaño") + 0.4, 0.2, 0.3)),
    glow: Math.max(win(t, Wd(2, "fabrica") - 0.2, bs(3), 0.3, 0.4), win(t, Wd(6, "volver") - 0.2, timing.voiceEnd, 0.2, 0.4)),
    frame,
  };
  const lo = {
    blood: win(t, tLob, tBack, 0.2, 0.1),
    sugar: win(t, Wd(4, "guardan") - 0.2, Wd(4, "fabrican"), 0.3, 0.3),
    protein: win(t, Wd(4, "fabrican") - 0.1, Wd(4, "neutralizan"), 0.3, 0.3),
    toxin: win(t, Wd(4, "neutralizan") - 0.1, (Wd(4, "filtro") - 0.3), 0.3, 0.3),
    bile: win(t, Wd(5, "bilis") - 0.2, tBack, 0.3, 0.1),
    frame,
  };
  const pr = (p: number[]) => project(cam, frame, p);
  const zoomIn = interpolate(t, [0, 1.0], [1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#02080B" }}>
      <AbsoluteFill style={{ transform: `scale(${zoomIn})` }}>
        <BodyScene frame={frame} camKeys={cam} dpr={dpr}>
          {lobWorld ? <Lobule s={lo} /> : <Liver s={ls} />}
        </BodyScene>
      </AbsoluteFill>
      {cover ? <CoverTitle before="Tu hígado puede" hl="volver a crecer" after="" bottom="y no es un mito" hlColor={K.cold} /> : (
        <>
          <MainLabel text="Hígado" color="#FF7AB0" t={t} t0={Wd(1, "higado")} t1={bs(2) + 0.4} />
          <MainLabel text="Una fábrica entera" color={K.flow} t={t} t0={Wd(2, "fabrica") - 0.1} t1={bs(3) - 0.1} />
          <Callout text="vena porta" anchor={pr(PORTAL[1])} offset={[160, 120]} color="#B89AFF" t={t} t0={Wd(3, "vena")} t1={Wd(3, "cargada") - 0.1} size={42} />
          <MainLabel text="Lo que has comido" color={K.flow} t={t} t0={Wd(3, "cargada")} t1={tLob} />
          <Callout text="vesícula" anchor={pr(GALL)} offset={[-120, 200]} color="#9FD07A" t={t} t0={Wd(3, "intestino")} t1={Wd(3, "vena") - 0.1} size={40} />
          <MainLabel text="Hepatocitos" color="#FF8A6A" t={t} t0={Wd(4, "hepatocitos")} t1={Wd(4, "guardan") - 0.05} />
          <MainLabel text="Reserva de azúcar" color={K.flow} t={t} t0={Wd(4, "guardan")} t1={Wd(4, "fabrican") - 0.1} />
          <MainLabel text="Fabrica proteínas" color={K.cold} t={t} t0={Wd(4, "fabrican")} t1={Wd(4, "neutralizan") - 0.1} />
          <MainLabel text="Neutraliza tóxicos" color="#9CFF6A" t={t} t0={Wd(4, "neutralizan")} t1={(Wd(4, "filtro") - 0.3) - 0.1} />
          <MainLabel text="Filtro + almacén" color={K.white} t={t} t0={(Wd(4, "filtro") - 0.3)} t1={bs(5) - 0.1} />
          <Callout text="tríada portal" anchor={pr(TRIAD)} offset={[-80, 240]} color="#B89AFF" t={t} t0={bs(5)} t1={Wd(5, "bilis") - 0.1} size={40} />
          <MainLabel text="Bilis" color="#B8FF3A" t={t} t0={Wd(5, "bilis")} t1={tBack} />
          <MainLabel text="Sus células se multiplican" color={K.flow} t={t} t0={Wd(5, "celulas")} t1={Wd(5, "donante") - 0.15} />
          <BigNumber t={t} t0={Wd(5, "sesenta") - 0.15} t1={Wd(6, "semanas")} value={60} suffix="%" label="se puede donar" top={290} />
          <MainLabel text="En pocas semanas" color={K.cold} t={t} t0={Wd(6, "pocas")} t1={Wd(6, "porque") - 0.1} />
          <MainLabel text="Vuelve a crecer" color={K.cold} t={t} t0={Wd(6, "volver") - 0.1} t1={timing.voiceEnd + 0.6} />
          <Captions words={timing.words} t={t} />
        </>
      )}
      <CutFlash t={t} cuts={[tLob, tBack]} />
    </AbsoluteFill>
  );
};
