// PLANTILLA de episodio 2D. Copia esta carpeta, cambia COMP_ID, HOOK y el contenido de cada beat.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en <Objeto>.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";

export const COMP_ID = "Plantilla";
export const HOOK = "Ni una gota de tinta"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { B, Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  return (
    <AbsoluteFill>
      <Bg />
      {/* beat 1: el objeto GRANDE en el centro desde el fotograma 0 (se ve detrás del título del gancho) */}
      <Scene {...sc(1)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <circle cx={540} cy={820} r={260 + 10 * Math.sin(t * 2)} fill={K.cold} opacity={0.9} />
        </svg>
      </Scene>
      {B.slice(1).map((_, k) => (
        <Scene key={k} {...sc(k + 2)}>
          <Chip text={`Beat ${k + 2}`} o={span(t, scene(k + 2)[0], scene(k + 2)[1])} />
          <Label x={540} y={800} text="(dibujo del beat)" o={1} size={48} />
        </Scene>
      ))}
      <Stamp x={540} y={560} text="¡FALSO!" p={ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.3) * (t < scene(1)[1] ? 1 : 0)} />
      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
