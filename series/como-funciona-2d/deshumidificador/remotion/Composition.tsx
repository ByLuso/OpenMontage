// Episodio 127 · Cómo saca agua del aire un deshumidificador.
// Cada beat es una <Scene> con su dibujo (Deshumidificador.tsx), un <Chip> y 1-3 <Label>. Cambios atados a palabras con Wd(beat, "palabra").
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Svg, Unit, U, ColdGlass, Wheel, Captured, Water, Drops, Window, HumBar, NoDrink, Lettuce, C } from "./Deshumidificador";

export const COMP_ID = "Deshumidificador";
export const HOOK = "Dentro lleva una nevera"; // = meta.portada
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
  const chip = (i: number) => span(t, S(i) + 0.1, E(i));

  // beat 1: la tapa se abre al decir «dentro»
  const open1 = ramp(t, Wd(1, "dentro"), Wd(1, "dentro") + 0.8);
  // depósito: va llenándose a lo largo del vídeo
  const lvl = 0.25 + 0.5 * ramp(t, S(2), E(7));

  return (
    <AbsoluteFill>
      <Bg />

      {/* 1 · gancho: el aparato cerrado, grande; al decir «dentro» se abre y aparece el circuito de frío */}
      <Scene {...sc(1)}>
        <Svg><g transform={`translate(540 785) scale(${1 + 0.05 * open1}) translate(-540 -785)`}>
          <Unit t={t} open={open1} drops={ramp(t, Wd(1, "llora"), Wd(1, "llora") + 0.3)} frost={open1} level={0.25} />
        </g></Svg>
        <Chip text="POR DENTRO" o={span(t, 1.9, E(1))} />
        <Label x={540} y={405} text="¡una nevera!" color={K.cold} size={52} box o={at(1, "nevera")} />
      </Scene>

      {/* 2 · entrega: circuito de frío + serpentín que gotea */}
      <Scene {...sc(2)}>
        <Svg><Unit t={t} hl="evap" loop={late(2, "circuito") * 0.9} drops={1} frost={1} level={lvl} /></Svg>
        <Chip text="LO QUE ESCONDE" o={chip(2)} />
        <Label x={540} y={405} text="circuito de frío" color={K.cold} box o={at(2, "circuito")} />
        <Label x={640} y={1040} text="¡gotea!" color={K.cold} size={46} box o={at(2, "gotear")} />
      </Scene>

      {/* 3 · idea clave: vaso frío que «suda» */}
      <Scene {...sc(3)}>
        <Svg><ColdGlass t={t} cond={late(3, "enfrías")} /></Svg>
        <Chip text="LA IDEA CLAVE" o={chip(3)} />
        <Label x={540} y={440} text="vapor invisible" size={46} box o={at(3, "vapor")} />
        <Label x={540} y={1110} text="frío = agua" color={K.cold} size={54} box o={at(3, "enfrías")} />
      </Scene>

      {/* 4 · ventilador */}
      <Scene {...sc(4)}>
        <Svg><Unit t={t} hl="fan" air={late(4, "aspira")} level={lvl} /></Svg>
        <Chip text="1 · EL VENTILADOR" o={chip(4)} />
        <Label x={540} y={405} text="aire húmedo" box o={at(4, "húmedo")} />
      </Scene>

      {/* 5 · evaporador: punto de rocío y gotas */}
      <Scene {...sc(5)}>
        <Svg><Unit t={t} hl="evap" air={0.8} frost={late(5, "helado")} drops={late(5, "rocío")} level={lvl} /></Svg>
        <Chip text="2 · EL SERPENTÍN FRÍO" color={K.cold} o={chip(5)} />
        <Label x={440} y={405} text="evaporador" color={K.cold} box o={at(5, "evaporador", Wd(5, "punto") - 0.05)} />
        <Label x={440} y={405} text="punto de rocío" color={K.flow} box o={at(5, "punto")} />
        <Label x={640} y={1080} text="depósito" color={K.cold} size={42} box o={at(5, "depósito")} />
      </Scene>

      {/* 6 · condensador: el aire sale seco y templado */}
      <Scene {...sc(6)}>
        <Svg><Unit t={t} hl="cond" air={1} drops={0.6} level={lvl} /></Svg>
        <Chip text="3 · EL SERPENTÍN CALIENTE" color={K.hot} o={chip(6)} />
        <Label x={540} y={405} text="condensador" color={K.hot} box o={at(6, "condensador", Wd(6, "sale") - 0.05)} />
        <Label x={540} y={405} text="sale seco y templado" color={K.hot} box o={at(6, "sale")} />
      </Scene>

      {/* 7 · compresor: gas apretado (naranja) y suelto (cian) */}
      <Scene {...sc(7)}>
        <Svg><Unit t={t} hl="comp" loop={late(7, "aprieta")} level={lvl} drops={0.5} /></Svg>
        <Chip text="4 · EL COMPRESOR" o={chip(7)} />
        <Label x={320} y={405} text="aprieta → calor" color={K.hot} size={42} box o={at(7, "calienta")} />
        <Label x={760} y={405} text="suelta → frío" color={K.cold} size={42} box o={at(7, "soltarlo")} />
      </Scene>

      {/* 8 · desecante: rueda de zeolita */}
      <Scene {...sc(8)}>
        <Svg>
          <Captured t={t} o={late(8, "chupa")} />
          <Wheel t={t} heat={late(8, "rueda")} />
        </Svg>
        <Chip text="¿CASA FRÍA? DESECANTE" o={chip(8)} />
        <Label x={540} y={430} text="rueda de zeolita" color={K.flow} box o={at(8, "rueda")} />
        <Label x={540} y={1100} text="sin compresor" size={46} box o={at(8, "compresor")} />
      </Scene>

      {/* 9 · curiosidad: unos diez litros al día */}
      <Scene {...sc(9)}>
        <Svg>
          <Drops t={t} x={540} y0={470} y1={640} o={1} n={6} spread={60} rate={1.2} />
          <rect x={330} y={600} width={420} height={470} rx={30} fill="#0B1E38" stroke={C.light} strokeWidth={8} />
          <Water x0={338} x1={742} y0={610} y1={1062} level={0.1 + 0.8 * ramp(t, S(9), E(9))} t={t} />
        </Svg>
        <Chip text="CURIOSIDAD" o={chip(9)} />
        <Label x={540} y={835} text={`${Math.round(10 * ramp(t, Wd(9, "diez"), Wd(9, "día") + 0.4))} litros/día`} size={78} box o={late(9, "diez")} />
        <Label x={540} y={1110} text="habitación húmeda" color={K.cold} size={40} box o={at(9, "habitación")} />
      </Scene>

      {/* 10 · otra: no es potable */}
      <Scene {...sc(10)}>
        <Svg>
          <NoDrink t={t} x={360} cross={ramp(t, Wd(10, "bebe"), Wd(10, "bebe") + 0.3)} />
          <Lettuce x={730} t={t} cross={ramp(t, Wd(10, "huerto"), Wd(10, "huerto") + 0.3)} />
        </Svg>
        <Chip text="OTRA CURIOSIDAD" o={chip(10)} />
        <Stamp x={540} y={460} text="NO POTABLE" p={ramp(t, Wd(10, "potable"), Wd(10, "potable") + 0.3)} />
        <Label x={540} y={1090} text="suciedad + bacterias" color={K.warn} size={44} box o={at(10, "suciedad")} />
      </Scene>

      {/* 11 · truco: ventanas cerradas y humedad 40-60 % */}
      <Scene {...sc(11)}>
        <Svg>
          <Window t={t} close={ramp(t, Wd(11, "cierra"), Wd(11, "cierra") + 0.7)} />
          <HumBar value={75 - 25 * ramp(t, Wd(11, "deja"), Wd(11, "sesenta"))} band={ramp(t, Wd(11, "cuarenta"), Wd(11, "cuarenta") + 0.3)} />
        </Svg>
        <Chip text="TRUCO" o={chip(11)} />
        <Label x={540} y={405} text="cierra puertas y ventanas" size={44} box o={at(11, "cierra")} />
        <Label x={540} y={1100} text="40 - 60 %" color={K.flow} size={52} box o={late(11, "cuarenta") * span(t, S(11), E(11))} />
      </Scene>

      {/* 12 · cierre */}
      <Scene {...sc(12)}>
        <Svg><Unit t={t} air={1} drops={1} frost={0.6} level={0.8} /></Svg>
        <Chip text="EN RESUMEN" o={chip(12)} />
        <Label x={250} y={405} text="1 enfría" color={K.cold} size={44} box o={late(12, "enfría")} />
        <Label x={540} y={405} text="2 exprime" color={K.flow} size={44} box o={late(12, "exprime")} />
        <Label x={830} y={405} text="3 seco" color={K.hot} size={44} box o={late(12, "seco")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
