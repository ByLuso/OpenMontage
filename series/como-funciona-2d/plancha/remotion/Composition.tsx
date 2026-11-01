// Episodio 132 · Cómo funciona una plancha de vapor.
// Cada beat es una <Scene> con su dibujo (Plancha.tsx), un <Chip> y 1-3 <Label>. Cambios atados a palabras con Wd(beat, "palabra").
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Svg, Iron, Fibers, Shirt, HeatIcon, DropIcon, WeightIcon, Plus, Thermo, Dial, WaterMix, Shine } from "./Plancha";

export const COMP_ID = "Plancha";
export const HOOK = "El secreto es el agua"; // = meta.portada
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

  // beat 1: la carcasa se levanta al decir «equivocados»
  const open1 = r(1, "equivocados", 0.8);
  // beat 8: la lámina se dobla al calentarse y vuelve al enfriarse
  const bend8 = ramp(t, Wd(8, "calentarse"), Wd(8, "corta") + 0.2) * (1 - ramp(t, Wd(8, "enfriarse"), Wd(8, "conectar") + 0.15));
  const spark8 = Math.max(span(t, Wd(8, "conectar") + 0.1, Wd(8, "conectar") + 0.7, 0.1), span(t, Wd(8, "clic"), Wd(8, "clic") + 0.6, 0.1));
  // beat 9: la rueda pasa de un punto a tres
  const ang9 = -110 + 40 * r(9, "rueda", 0.8) + 140 * ramp(t, Wd(9, "tres") - 0.2, Wd(9, "tres") + 0.5);
  // beat 13: la camiseta oscura se da la vuelta
  const flip13 = r(13, "revés", 0.8);

  return (
    <AbsoluteFill>
      <Bg />

      {/* 1 · gancho: la plancha grande; al decir «equivocados» se levanta la carcasa y se ve la resistencia y la cámara de vapor */}
      <Scene {...sc(1)}>
        <Svg><Iron t={t} open={open1} heat={0.5 + 0.5 * open1} steam={0.5} drip={open1} level={0.7} /></Svg>
        <Chip text="POR DENTRO" o={span(t, 1.9, E(1))} />
        <Label x={540} y={1115} text="¿solo calor?" color={K.hot} size={50} box o={at(1, "calor")} />
      </Scene>

      {/* 2 · entrega: calor + agua + peso, y la camiseta se alisa */}
      <Scene {...sc(2)}>
        <Svg>
          <HeatIcon x={250} y={500} t={t} o={late(2, "calor")} />
          <Plus x={395} y={500} o={late(2, "agua")} />
          <DropIcon x={540} y={500} t={t} o={late(2, "agua")} />
          <Plus x={685} y={500} o={late(2, "peso")} />
          <WeightIcon x={830} y={500} o={late(2, "peso")} p={r(2, "peso", 0.6)} />
          <Shirt t={t} flat={ramp(t, Wd(2, "peso"), Wd(2, "vez") + 0.6)} y={880} s={0.72} />
        </Svg>
        <Chip text="EL SECRETO" o={chip(2)} />
        <Label x={250} y={615} text="no basta" color={K.warn} size={38} box o={at(2, "basta", Wd(2, "hacen") - 0.05)} />
        <Label x={250} y={615} text="calor" color={K.hot} size={38} box o={at(2, "hacen")} />
        <Label x={540} y={615} text="agua" color={K.cold} size={38} box o={at(2, "agua")} />
        <Label x={830} y={615} text="peso" color={K.flow} size={38} box o={at(2, "peso")} />
      </Scene>

      {/* 3 · idea clave: cadenas de celulosa arrugadas, pegadas por enlaces de hidrógeno */}
      <Scene {...sc(3)}>
        <Svg><Fibers t={t} amp={1} bonds={late(3, "enlaces")} /></Svg>
        <Chip text="LA IDEA CLAVE" o={chip(3)} />
        <Label x={540} y={465} text="cadenas de celulosa" size={44} box o={at(3, "celulosa")} />
        <Label x={540} y={1110} text="enlaces de hidrógeno" color={K.flow} size={46} box o={at(3, "enlaces")} />
      </Scene>

      {/* 4 · calor y agua aflojan los enlaces y las cadenas resbalan */}
      <Scene {...sc(4)}>
        <Svg><Fibers t={t} amp={1} bonds={1 - 0.85 * r(4, "aflojan", 0.6)} heat={late(4, "calor")} wet={r(4, "agua", 0.6)} slide={r(4, "resbalan", 0.5)} /></Svg>
        <Chip text="1 · CALOR + AGUA" color={K.hot} o={chip(4)} />
        <Label x={540} y={465} text="calor + agua" color={K.hot} size={44} box o={at(4, "calor")} />
        <Label x={540} y={1110} text="enlaces sueltos" color={K.flow} size={46} box o={at(4, "aflojan")} />
      </Scene>

      {/* 5 · el peso aplasta las cadenas y las pone en fila */}
      <Scene {...sc(5)}>
        <Svg><Fibers t={t} amp={1 - ramp(t, Wd(5, "aplasta"), Wd(5, "fila") + 0.3)} bonds={0.15} heat={1} wet={1} slide={1 - r(5, "fila", 0.4)} press={ramp(t, Wd(5, "peso"), Wd(5, "aplasta") + 0.3)} /></Svg>
        <Chip text="2 · EL PESO" color={K.flow} o={chip(5)} />
        <Label x={540} y={1110} text="¡en fila, planas!" color={K.flow} size={48} box o={at(5, "fila")} />
      </Scene>

      {/* 6 · al enfriarse y secarse, los enlaces vuelven a pegarse en liso */}
      <Scene {...sc(6)}>
        <Svg><Fibers t={t} amp={0} bonds={0.15 + 0.85 * r(6, "pegar", 0.6)} heat={1 - r(6, "enfriarse", 0.8)} wet={1} evap={r(6, "secarse", 1)} press={1 - ramp(t, S(6), S(6) + 0.8)} /></Svg>
        <Chip text="3 · FRÍO Y SECO" color={K.cold} o={chip(6)} />
        <Label x={540} y={465} text="se enfría y se seca" color={K.cold} size={44} box o={at(6, "enfriarse")} />
        <Label x={540} y={1110} text="¡fijada en liso!" color={K.flow} size={50} box o={at(6, "liso")} />
      </Scene>

      {/* 7 · dentro: resistencia en la suela y termostato de dos metales */}
      <Scene {...sc(7)}>
        <Svg><Iron t={t} cut={1} heat={late(7, "resistencia")} hl={t < Wd(7, "lámina") ? "res" : "thermo"} steam={0.25} /></Svg>
        <Chip text="4 · POR DENTRO" o={chip(7)} />
        <Label x={540} y={1110} text="resistencia" color={K.hot} size={46} box o={at(7, "resistencia")} />
        <Label x={760} y={470} text="termostato" color={K.flow} size={44} box o={at(7, "lámina")} />
      </Scene>

      {/* 8 · la lámina se dobla, corta la corriente y vuelve: clic */}
      <Scene {...sc(8)}>
        <Svg><Thermo t={t} bend={bend8} spark={spark8} /></Svg>
        <Chip text="EL TERMOSTATO" color={K.flow} o={chip(8)} />
        <Label x={560} y={470} text="dos metales" size={40} box o={span(t, S(8) + 0.2, E(8))} />
        <Label x={300} y={600} text="¡clic!" color={K.flow} size={64} box o={at(8, "clic")} />
        <Label x={540} y={1110} text="caliente: se dobla y corta" color={K.hot} size={42} box o={at(8, "dobla", Wd(8, "enfriarse") - 0.05)} />
        <Label x={540} y={1110} text="frío: vuelve a conectar" color={K.cold} size={42} box o={at(8, "conectar")} />
      </Scene>

      {/* 9 · la rueda de temperaturas: un punto sintéticos, tres algodón */}
      <Scene {...sc(9)}>
        <Svg><Dial angle={ang9} hi={ramp(t, Wd(9, "tres") - 0.2, Wd(9, "tres") + 0.3)} /></Svg>
        <Chip text="LA RUEDA" o={chip(9)} />
        <Label x={290} y={1110} text="• sintéticos" color={K.cold} size={42} box o={late(9, "sintéticos")} />
        <Label x={790} y={1110} text="••• algodón" color={K.hot} size={42} box o={late(9, "algodón")} />
      </Scene>

      {/* 10 · el vapor: el depósito gotea en la cámara caliente y sale por los agujeros */}
      <Scene {...sc(10)}>
        <Svg><Iron t={t} cut={1} heat={1} hl="steam" drip={late(10, "gotea")} steam={late(10, "sale") - 0.3} level={0.75 - 0.2 * ramp(t, S(10), E(10))} /></Svg>
        <Chip text="EL VAPOR" o={chip(10)} />
        <Label x={360} y={470} text="depósito" color={K.cold} size={44} box o={at(10, "depósito")} />
        <Label x={760} y={470} text="cámara caliente" color={K.hot} size={44} box o={at(10, "cámara")} />
        <Label x={540} y={1125} text="¡vapor por los agujeros!" size={42} box o={at(10, "sale")} />
      </Scene>

      {/* 11 · curiosidad: con poca temperatura escupe gotas */}
      <Scene {...sc(11)}>
        <Svg><Iron t={t} cut={1} heat={0.08} dial={-60} drip={1} spit={r(11, "escupe", 0.4)} level={0.5} /></Svg>
        <Chip text="CURIOSIDAD" o={chip(11)} />
        <Label x={540} y={470} text="poca temperatura" color={K.cold} size={46} box o={at(11, "temperatura")} />
        <Label x={540} y={1125} text="¡escupe gotas!" color={K.cold} size={46} box o={at(11, "escupe")} />
      </Scene>

      {/* 12 · truco: agua del grifo; con mucha cal, mitad y mitad */}
      <Scene {...sc(12)}>
        <Svg><WaterMix t={t} tap={0.15 + 0.85 * ramp(t, Wd(12, "grifo"), Wd(12, "cal") + 0.2)} cal={r(12, "cal", 0.4)} dist={ramp(t, Wd(12, "destilada") - 0.3, Wd(12, "destilada") + 1.2)} /></Svg>
        <Chip text="TRUCO" o={chip(12)} />
        <Label x={300} y={420} text="agua del grifo" color={K.cold} size={40} box o={at(12, "grifo")} />
        <Label x={815} y={420} text="destilada" size={40} box o={at(12, "destilada")} />
        <Label x={540} y={1110} text="¿mucha cal?" size={46} box o={at(12, "cal", Wd(12, "mitad") - 0.05)} />
        <Label x={540} y={1110} text="50 % + 50 %" color={K.flow} size={50} box o={at(12, "mitad")} />
      </Scene>

      {/* 13 · otro truco: la ropa oscura, del revés */}
      <Scene {...sc(13)}>
        <Svg>
          <Shirt t={t} flat={0.6} color="#24304A" y={810} s={0.95} flip={Math.cos(Math.PI * flip13)} inside={ramp(t, Wd(13, "revés") + 0.4, Wd(13, "revés") + 0.8)} />
          <Iron t={t} s={0.4} cx={540 + 130 * Math.sin(t * 1.4)} cy={735} heat={1} steam={0.6} />
          <Shine x={700} y={700} t={t} o={late(13, "brillos")} cross={r(13, "brillos", 0.4) * ramp(t, Wd(13, "brillos") + 0.3, Wd(13, "brillos") + 0.6)} />
        </Svg>
        <Chip text="OTRO TRUCO" o={chip(13)} />
        <Label x={540} y={470} text="sin brillos" color={K.warn} size={44} box o={at(13, "brillos")} />
        <Label x={540} y={1110} text="ropa oscura: del revés" size={44} box o={at(13, "revés")} />
      </Scene>

      {/* 14 · cierre */}
      <Scene {...sc(14)}>
        <Svg><Iron t={t} s={0.85} cy={790} heat={1} steam={1} /></Svg>
        <Chip text="EN RESUMEN" o={chip(14)} />
        <Label x={250} y={460} text="calor" color={K.hot} size={46} box o={late(14, "calor")} />
        <Label x={540} y={460} text="agua" color={K.cold} size={46} box o={late(14, "agua")} />
        <Label x={830} y={460} text="peso" color={K.flow} size={46} box o={late(14, "peso")} />
        <Label x={540} y={1125} text="frío = liso" color={K.flow} size={50} box o={late(14, "frío")} />
      </Scene>

      <Stamp x={540} y={560} text="¡FALSO!" p={ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.3) * (t < scene(1)[1] ? 1 : 0)} />
      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
