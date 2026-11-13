// Episodio 139 · Cómo funciona una lámpara de lava.
// Cada beat es una <Scene> con su dibujo (LampaLava.tsx), un <Chip> y 1-3 <Label>. Cambios atados a palabras con Wd(beat, "palabra").
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Svg, Lamp, Beaker, Column, Clock, Calendar, Recipe, Cross } from "./LampaLava";

export const COMP_ID = "LampaLava";
export const HOOK = "No es lava, es cera"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { B, Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const S = (i: number) => scene(i)[0];
  const E = (i: number) => scene(i)[1];
  /** Etiqueta que entra en la palabra w del beat i y dura hasta el final de la escena (o hasta `until`). */
  const at = (i: number, w: string, until?: number) => span(t, Wd(i, w), until ?? E(i));
  /** Elemento que entra después: atenuado (0,3) desde el inicio de la escena y pleno al decir w. */
  const late = (i: number, w: string) => 0.3 + 0.7 * ramp(t, Wd(i, w), Wd(i, w) + 0.4);
  const r = (i: number, w: string, d = 0.5) => ramp(t, Wd(i, w), Wd(i, w) + d);
  const chip = (i: number) => span(t, S(i) + 0.1, E(i));
  void B;

  // beat 1: la tapa se levanta al decir «dentro»
  const open1 = r(1, "dentro", 0.8);
  // beat 5: la gota se calienta, se dilata y sube
  const temp5 = r(5, "calienta", 0.8);
  const size5 = 1 + 0.25 * r(5, "dilata", 0.7);
  const y5 = ramp(t, Wd(5, "menos") - 0.2, Wd(5, "sube") + 0.8);
  // beat 6: arriba se enfría, se contrae y baja
  const temp6 = 1 - r(6, "enfría", 0.9);
  const size6 = 1.25 - 0.25 * r(6, "contrae", 0.7);
  const y6 = 1 - ramp(t, Wd(6, "contrae") - 0.1, Wd(6, "bajar") + 0.8);
  // beat 9: el reloj avanza y la cera empieza a moverse
  const clock9 = ramp(t, Wd(9, "hora") - 0.8, Wd(9, "más") + 0.4);
  const flow9 = 0.45 * ramp(t, Wd(9, "derretirse") - 0.3, E(9));
  // beat 12: la agita y se enturbia
  const shake12 = span(t, Wd(12, "agites"), Wd(12, "ni") - 0.1, 0.15);
  const cloud12 = r(12, "enturbia", 0.8);

  return (
    <AbsoluteFill>
      <Bg />

      {/* 1 · gancho: la lámpara grande; al decir «dentro» se levanta la tapa y se ve que dentro hay cera */}
      <Scene {...sc(1)}>
        <Svg><Lamp t={t} s={1.12} cy={740} open={open1} hl={open1 > 0.5 ? "wax" : null} /></Svg>
        <Chip text="POR DENTRO" o={span(t, 1.9, E(1))} />
        <Label x={200} y={560} text="¿lava?" color={K.hot} size={50} box o={span(t, 1.9, E(1))} />
      </Scene>

      {/* 2 · entrega: cera + líquido + bombilla */}
      <Scene {...sc(2)}>
        <Svg><Lamp t={t} cut={late(2, "bombilla")} hl={t < Wd(2, "líquido") ? "wax" : t < Wd(2, "bombilla") ? "liquid" : "bulb"} /></Svg>
        <Chip text="EL SECRETO" o={chip(2)} />
        <Label x={835} y={620} text="cera" color={K.hot} size={46} box o={at(2, "cera")} />
        <Label x={835} y={790} text="líquido" color={K.cold} size={46} box o={at(2, "líquido")} />
        <Label x={200} y={1050} text="bombilla" color={K.flow} size={44} box o={at(2, "bombilla")} />
      </Scene>

      {/* 3 · idea clave: fría se hunde, caliente flota */}
      <Scene {...sc(3)}>
        <Svg>
          <Beaker t={t} x={290} y={760} temp={0} rise={0} o={late(3, "fría")} />
          <Beaker t={t} x={790} y={760} temp={r(3, "caliente", 0.8)} rise={ramp(t, Wd(3, "caliente"), Wd(3, "menos") + 0.6)} o={late(3, "caliente")} />
        </Svg>
        <Chip text="LA IDEA CLAVE" o={chip(3)} />
        <Label x={290} y={470} text="fría" color={K.cold} size={46} box o={at(3, "fría")} />
        <Label x={790} y={470} text="caliente" color={K.hot} size={46} box o={at(3, "caliente")} />
        <Label x={290} y={1070} text="más densa" color={K.cold} size={38} box o={at(3, "densa")} />
        <Label x={790} y={1070} text="menos densa" color={K.hot} size={38} box o={at(3, "menos")} />
      </Scene>

      {/* 4 · la bombilla da luz y, sobre todo, calor */}
      <Scene {...sc(4)}>
        <Svg><Lamp t={t} cut={1} hl="bulb" heat={0.3 + 0.7 * r(4, "luz", 0.6)} flow={0.6} /></Svg>
        <Chip text="1 · LA BOMBILLA" color={K.flow} o={chip(4)} />
        <Label x={210} y={640} text="luz" color={K.flow} size={50} box o={at(4, "luz")} />
        <Label x={860} y={640} text="¡calor!" color={K.hot} size={50} box o={at(4, "calor")} />
        <Label x={540} y={1120} text="filamento o halógena" size={40} box o={at(4, "filamento")} />
      </Scene>

      {/* 5 · la gota se calienta, se dilata y sube */}
      <Scene {...sc(5)}>
        <Svg><Column t={t} y={y5} size={size5} temp={temp5} expand={span(t, Wd(5, "dilata"), Wd(5, "sube"))} up={r(5, "menos", 0.4)} /></Svg>
        <Chip text="2 · SE CALIENTA" color={K.hot} o={chip(5)} />
        <Label x={540} y={1125} text="se dilata" color={K.hot} size={46} box o={at(5, "dilata", Wd(5, "menos") - 0.05)} />
        <Label x={540} y={1125} text="menos densa: ¡sube!" color={K.hot} size={46} box o={at(5, "menos")} />
      </Scene>

      {/* 6 · arriba se enfría, se contrae y baja */}
      <Scene {...sc(6)}>
        <Svg><Column t={t} y={y6} size={size6} temp={temp6} shrink={span(t, Wd(6, "contrae"), Wd(6, "bajar") + 0.6)} down={r(6, "contrae", 0.4)} /></Svg>
        <Chip text="3 · SE ENFRÍA" color={K.cold} o={chip(6)} />
        <Label x={540} y={1125} text="se enfría" color={K.cold} size={46} box o={at(6, "enfría", Wd(6, "contrae") - 0.05)} />
        <Label x={540} y={1125} text="se contrae: ¡baja!" color={K.cold} size={46} box o={at(6, "contrae")} />
      </Scene>

      {/* 7 · el ciclo: convección */}
      <Scene {...sc(7)}>
        <Svg><Lamp t={t} arrows={late(7, "ciclo")} speed={1.4} /></Svg>
        <Chip text="EL CICLO" o={chip(7)} />
        <Label x={220} y={980} text="calor" color={K.hot} size={44} box o={late(7, "abajo")} />
        <Label x={220} y={520} text="frío" color={K.cold} size={44} box o={late(7, "abajo")} />
        <Label x={540} y={1125} text="¡convección!" color={K.flow} size={52} box o={at(7, "convección")} />
      </Scene>

      {/* 8 · el muelle del fondo coge calor y junta la cera (zoom a la parte de abajo) */}
      <Scene {...sc(8)}>
        <Svg><Lamp t={t} s={1.7} cy={446} cut={1} hl="coil" merge={r(8, "ayuda", 1.2)} flow={0.8} /></Svg>
        <Chip text="4 · EL MUELLE" color={K.flow} o={chip(8)} />
        <Label x={540} y={1120} text="muelle de metal" color={K.flow} size={46} box o={at(8, "muelle")} />
        <Label x={540} y={500} text="coge calor" color={K.hot} size={44} box o={at(8, "coge", Wd(8, "ayuda") - 0.05)} />
        <Label x={540} y={500} text="junta la cera" color={K.hot} size={44} box o={at(8, "ayuda")} />
      </Scene>

      {/* 9 · tarda en arrancar: una hora o más */}
      <Scene {...sc(9)}>
        <Svg>
          <Lamp t={t} cx={330} s={0.9} cut={0.5} flow={flow9} />
          <Clock x={800} y={630} p={clock9} r={110} o={late(9, "tarda")} />
        </Svg>
        <Chip text="PACIENCIA" o={chip(9)} />
        <Label x={800} y={820} text="una hora o más" color={K.flow} size={40} box o={at(9, "hora")} />
        <Label x={540} y={1125} text="la cera se derrite" color={K.hot} size={42} box o={at(9, "derretirse")} />
      </Scene>

      {/* 10 · curiosidad: 1963, un inventor británico */}
      <Scene {...sc(10)}>
        <Svg>
          <Lamp t={t} cx={290} s={0.8} cy={790} />
          <Calendar x={760} y={600} year="1963" o={late(10, "1963")} p={r(10, "1963", 0.5)} />
        </Svg>
        <Chip text="CURIOSIDAD" o={chip(10)} />
        <Label x={760} y={800} text="británico" color={K.cold} size={42} box o={at(10, "británico")} />
        <Label x={540} y={1110} text="Edward Craven Walker" size={44} box o={at(10, "edward")} />
      </Scene>

      {/* 11 · otra: el líquido no es agua sola */}
      <Scene {...sc(11)}>
        <Svg><Recipe t={t} water={r(11, "agua", 0.4)} secret={r(11, "aditivos", 0.4)} lock={r(11, "secretos", 0.4)} /></Svg>
        <Chip text="OTRA CURIOSIDAD" o={chip(11)} />
        <Label x={540} y={460} text="no es agua sola" color={K.cold} size={44} box o={at(11, "sola", Wd(11, "pese") - 0.05)} />
        <Label x={540} y={460} text="pesa casi como la cera" color={K.hot} size={42} box o={at(11, "pese")} />
        <Label x={290} y={1030} text="agua" color={K.cold} size={42} box o={at(11, "agua")} />
        <Label x={720} y={1030} text="aditivos secretos" color={K.flow} size={38} box o={at(11, "aditivos")} />
      </Scene>

      {/* 12 · truco: no agitarla en caliente (se enturbia) y no más de seis horas seguidas */}
      <Scene {...sc(12)}>
        <Svg>
          <Lamp t={t} cx={380} s={0.9} shake={shake12} cloudy={cloud12} />
          <Cross x={380} y={720} o={span(t, Wd(12, "agites"), Wd(12, "ni"))} s={1.2} />
          <Clock x={810} y={620} p={0.5 * ramp(t, Wd(12, "seis") - 0.3, Wd(12, "horas") + 0.3)} r={90} color={K.flow} o={late(12, "seis")} />
        </Svg>
        <Chip text="TRUCO" o={chip(12)} />
        <Label x={790} y={800} text="¡se enturbia!" color={K.warn} size={40} box o={at(12, "enturbia", Wd(12, "ni") - 0.05)} />
        <Label x={810} y={790} text="6 h máximo" color={K.flow} size={40} box o={at(12, "seis")} />
        <Label x={540} y={1125} text="en caliente, no la agites" color={K.warn} size={42} box o={at(12, "agites", Wd(12, "encendida") - 0.05)} />
        <Label x={540} y={1125} text="no todo el día" color={K.flow} size={42} box o={at(12, "encendida")} />
      </Scene>

      {/* 13 · cierre */}
      <Scene {...sc(13)}>
        <Svg><Lamp t={t} arrows={0.6} speed={1.4} /></Svg>
        <Chip text="EN RESUMEN" o={chip(13)} />
        <Label x={215} y={980} text="calor abajo" color={K.hot} size={38} box o={late(13, "calor")} />
        <Label x={850} y={520} text="frío arriba" color={K.cold} size={38} box o={late(13, "frío")} />
        <Label x={540} y={1125} text="sube y baja sin parar" color={K.flow} size={44} box o={late(13, "sube")} />
      </Scene>

      <Stamp x={540} y={640} text="¡ES CERA!" color={K.flow} p={ramp(t, Wd(1, "gota"), Wd(1, "gota") + 0.3) * (t < scene(1)[1] ? 1 : 0)} />
      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
