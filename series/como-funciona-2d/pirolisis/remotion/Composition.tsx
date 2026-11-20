// Episodio 148 · Cómo se limpia solo un horno pirolítico.
// Cada beat es una <Scene> con su dibujo (Pirolisis.tsx), un <Chip> y 1-3 <Label>. Cambios atados a palabras con Wd(beat, "palabra").
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, Gauge, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Svg, Oven, Thermo, Section, Grease, Clock, Bolt, Window, Cross } from "./Pirolisis";

export const COMP_ID = "Pirolisis";
export const HOOK = "Se limpia quemando la mugre"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const S = (i: number) => scene(i)[0];
  const E = (i: number) => scene(i)[1];
  /** Etiqueta que entra en la palabra w del beat i y dura hasta el final de la escena (o hasta `until`). */
  const at = (i: number, w: string, until?: number) => span(t, Wd(i, w), until ?? E(i));
  /** Elemento que entra después: atenuado (0,3) desde el inicio de la escena y pleno al decir w. */
  const late = (i: number, w: string) => 0.3 + 0.7 * ramp(t, Wd(i, w), Wd(i, w) + 0.4);
  const r = (i: number, w: string, d = 0.5) => ramp(t, Wd(i, w), Wd(i, w) + d);
  const chip = (i: number) => span(t, S(i) + 0.1, E(i));

  // beat 1: al decir «quema» la puerta se abate y el interior se pone al rojo; en «mugre» la grasa empieza a volverse ceniza
  const open1 = r(1, "quema", 0.7);
  // beat 2: el medidor sube hasta 500 y luego pasa el trapo
  const temp2 = 500 * ramp(t, S(2) + 0.2, Wd(2, "quinientos") + 0.5);
  // beat 4: el calor baja y el candado se abre al final
  const cool4 = ramp(t, Wd(4, "baja"), Wd(4, "calor") + 0.5);
  // beat 5: el reloj marca de una a tres horas
  const hours5 = ramp(t, Wd(5, "una") - 0.1, Wd(5, "una") + 0.5) + 2 * ramp(t, Wd(5, "tres") - 0.1, Wd(5, "tres") + 0.8);

  return (
    <AbsoluteFill>
      <Bg />

      {/* 1 · gancho: el horno grande y sucio; al decir «quema» se abre la puerta y el interior arde de calor */}
      <Scene {...sc(1)}>
        <Svg><Oven t={t} open={open1} glow={0.15 + 0.85 * open1} ash={r(1, "mugre", 1.2)} display="PIRO" /></Svg>
        <Chip text="POR DENTRO" o={span(t, 1.9, E(1))} />
        <Label x={540} y={1125} text="¡quema la mugre!" color={K.hot} size={50} box o={at(1, "quema")} />
      </Scene>

      {/* 2 · entrega: sube a unos 500 °C, la grasa queda en ceniza y sale con un trapo húmedo */}
      <Scene {...sc(2)}>
        <Svg><Oven t={t} s={0.85} cy={845} open={1} glow={temp2 / 500} ash={r(2, "ceniza", 0.8)} wipe={ramp(t, Wd(2, "trapo"), E(2) - 0.2)} display={`${Math.round(temp2)}°`} /></Svg>
        <Chip text="EL TRUCO" o={chip(2)} />
        <Gauge value={temp2} max={500} unit="°C" color={K.hot} x={540} y={500} t={t} t0={S(2) + 0.1} t1={E(2)} />
        <Label x={540} y={1125} text="grasa → ceniza" color={K.flow} size={46} box o={at(2, "ceniza", Wd(2, "quitas") - 0.05)} />
        <Label x={540} y={1125} text="trapo húmedo y listo" color={K.cold} size={46} box o={at(2, "quitas")} />
      </Scene>

      {/* 3 · idea clave: la cadena de grasa se rompe con el calor; los trozos se van como humo y gases, queda ceniza */}
      <Scene {...sc(3)}>
        <Svg><Grease t={t} brk={ramp(t, Wd(3, "rompe"), Wd(3, "rompe") + 1.4)} heat={late(3, "calor")} ash={r(3, "ceniza", 0.6)} /></Svg>
        <Chip text="LA IDEA CLAVE" o={chip(3)} />
        <Label x={540} y={470} text="PIRÓLISIS" color={K.hot} size={64} box o={at(3, "pirólisis")} />
        <Label x={540} y={590} text="humo y gases" color={K.white} size={40} box o={at(3, "humo")} />
        <Label x={540} y={1110} text="solo queda ceniza" color={K.flow} size={46} box o={at(3, "ceniza")} />
      </Scene>

      {/* 4 · la puerta se bloquea sola y no se abre hasta que baja el calor */}
      <Scene {...sc(4)}>
        <Svg>
          <Oven t={t} cx={500} s={0.88} cy={800} glow={1 - 0.8 * cool4} ash={0.6} lockO={late(4, "bloquea")} lock={r(4, "bloquea", 0.4) * (1 - ramp(t, Wd(4, "calor") + 0.4, Wd(4, "calor") + 0.8))} display={cool4 > 0.5 ? "ok" : "500°"} />
          <Thermo x={900} y={980} h={330} level={1 - 0.75 * cool4} o={late(4, "baja")} />
        </Svg>
        <Chip text="1 · PUERTA BLOQUEADA" o={chip(4)} />
        <Label x={540} y={470} text="se bloquea sola" color={K.flow} size={44} box o={at(4, "bloquea")} />
        <Label x={540} y={1125} text="se abre al bajar el calor" color={K.cold} size={42} box o={at(4, "baja")} />
      </Scene>

      {/* 5 · el programa dura de una a tres horas */}
      <Scene {...sc(5)}>
        <Svg><Clock t={t} hours={hours5} /></Svg>
        <Chip text="2 · TIEMPO" o={chip(5)} />
        <Label x={540} y={470} text="de 1 a 3 horas" color={K.hot} size={48} box o={at(5, "una")} />
        <Label x={540} y={1110} text="según lo sucio que esté" size={42} box o={at(5, "sucio")} />
      </Scene>

      {/* 6 · aislante extra y puerta con varios cristales: fuera no quema */}
      <Scene {...sc(6)}>
        <Svg><Section t={t} heat={1} ins={r(6, "aislante", 0.4)} glass={r(6, "cristales", 0.4)} cool={late(6, "queme")} /></Svg>
        <Chip text="3 · QUE NO QUEME FUERA" o={chip(6)} />
        <Label x={540} y={470} text="fuera, frío" color={K.cold} size={44} box o={at(6, "queme")} />
        <Label x={680} y={1115} text="aislante" color={K.flow} size={42} box o={at(6, "aislante")} />
        <Label x={290} y={1115} text="varios cristales" color={K.cold} size={42} box o={at(6, "cristales")} />
      </Scene>

      {/* 7 · el humo pasa por un catalizador que lo depura antes de salir */}
      <Scene {...sc(7)}>
        <Svg><Section t={t} heat={0.8} smoke={late(7, "humo")} cat={r(7, "catalizador", 0.4)} clean={r(7, "depura", 0.6)} /></Svg>
        <Chip text="4 · LOS HUMOS" o={chip(7)} />
        <Label x={760} y={480} text="catalizador" color={K.flow} size={42} box o={at(7, "catalizador")} />
        <Label x={280} y={480} text="sale depurado" color={K.white} size={42} box o={at(7, "depura")} />
        <Label x={560} y={1115} text="humo" color="#B8BEC8" size={44} box o={at(7, "humo")} />
      </Scene>

      {/* 8 · catalíticos: paneles porosos que se comen la grasa mientras cocinas */}
      <Scene {...sc(8)}>
        <Svg><Oven t={t} open={1} glow={0.4} panels={late(8, "paneles")} food={1} eat={ramp(t, Wd(8, "comen"), E(8) - 0.3)} /></Svg>
        <Chip text="OTRO SISTEMA: CATALÍTICO" o={chip(8)} />
        <Label x={540} y={470} text="paneles porosos" color={K.flow} size={44} box o={at(8, "paneles")} />
        <Label x={540} y={1125} text="se comen la grasa al cocinar" color={K.hot} size={40} box o={at(8, "comen")} />
      </Scene>

      {/* 9 · hidrólisis: agua abajo y vapor que ablanda la grasa */}
      <Scene {...sc(9)}>
        <Svg><Oven t={t} open={1} glow={0.12} water={late(9, "agua")} steamy={late(9, "vapor") - 0.3} soften={r(9, "ablanda", 1.5)} /></Svg>
        <Chip text="OTRO SISTEMA: AGUA" color={K.cold} o={chip(9)} />
        <Label x={540} y={470} text="hidrólisis" color={K.cold} size={46} box o={at(9, "hidrólisis")} />
        <Label x={540} y={1125} text="agua + vapor" color={K.cold} size={46} box o={at(9, "agua", Wd(9, "media") - 0.05)} />
        <Label x={540} y={1125} text="media hora" color={K.flow} size={46} box o={at(9, "media")} />
      </Scene>

      {/* 10 · curiosidad: el consumo */}
      <Scene {...sc(10)}>
        <Svg><Bolt t={t} x={540} y={780} s={1} p={late(10, "gasta")} /></Svg>
        <Chip text="CURIOSIDAD" o={chip(10)} />
        <Label x={540} y={470} text="cada limpieza" size={44} box o={at(10, "limpieza")} />
        <Label x={540} y={1110} text="3 a 5 kWh" color={K.flow} size={70} box o={at(10, "tres")} />
        <Stamp x={540} y={600} text="¡MUCHA LUZ!" color={K.flow} p={ramp(t, Wd(10, "mucha"), Wd(10, "mucha") + 0.3)} />
      </Scene>

      {/* 11 · truco: fuera bandejas no aptas y restos grandes */}
      <Scene {...sc(11)}>
        <Svg>
          <Oven t={t} open={1} glow={0.1} dirt={0.6} tray={r(11, "aptas", 0.8)} trayX={-60 * r(11, "aptas", 0.8)} chunk={late(11, "restos")} smoke={r(11, "humo", 0.5)} />
          <Cross x={540} y={820} p={span(t, Wd(11, "bandejas"), Wd(11, "restos"), 0.25)} />
        </Svg>
        <Chip text="TRUCO" o={chip(11)} />
        <Label x={540} y={470} text="fuera lo que no sea apto" color={K.warn} size={42} box o={at(11, "bandejas")} />
        <Label x={540} y={1125} text="restos grandes = humo" size={44} box o={at(11, "restos")} />
      </Scene>

      {/* 12 · otra: humo y olor normales; ventila */}
      <Scene {...sc(12)}>
        <Svg>
          <Window t={t} x={70} y={640} open={r(12, "ventana", 0.6)} o={late(12, "ventana")} />
          <Oven t={t} cx={640} s={0.78} cy={830} glow={0.9} ash={0.4} smoke={0.4 + 0.6 * r(12, "humo", 0.5)} lockO={1} lock={1} />
        </Svg>
        <Chip text="OTRA" o={chip(12)} />
        <Label x={540} y={470} text="humo y olor: normal" size={44} box o={at(12, "normal")} />
        <Label x={540} y={1125} text="ventana o campana" color={K.cold} size={44} box o={at(12, "abre")} />
      </Scene>

      {/* 13 · cierre */}
      <Scene {...sc(13)}>
        <Svg><Oven t={t} s={0.9} cy={800} glow={1} ash={r(13, "ceniza", 0.8)} lockO={late(13, "puerta")} lock={r(13, "bloqueada", 0.4)} display="500°" /></Svg>
        <Chip text="EN RESUMEN" o={chip(13)} />
        <Label x={540} y={470} text="mucho calor" color={K.hot} size={46} box o={late(13, "mucho")} />
        <Label x={540} y={1125} text="puerta bloqueada" color={K.flow} size={46} box o={at(13, "puerta", Wd(13, "mugre") - 0.05)} />
        <Label x={540} y={1125} text="mugre → ceniza" color={K.white} size={50} box o={at(13, "mugre")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
