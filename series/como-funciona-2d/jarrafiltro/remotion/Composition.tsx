// Episodio 149 · Cómo funciona una jarra con filtro de agua.
// Cada beat es una <Scene> con su dibujo (JarraFiltro.tsx), un <Chip> y 1-3 <Label>. Cambios atados a palabras con Wd(beat, "palabra").
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Svg, Jug, Grain, Resin, Court, Tap, Glass, Calendar, Cartridge, Fridge } from "./JarraFiltro";

export const COMP_ID = "JarraFiltro";
export const HOOK = "Esconde una pista de tenis"; // = meta.portada
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
  const r = (i: number, w: string, d = 0.8) => ramp(t, Wd(i, w), Wd(i, w) + d);

  // beat 1: la tapa se levanta en «secreto» y el cartucho se abre en «carbón»
  const open1 = r(1, "secreto");
  const cut1 = r(1, "carbón");
  // agua: el depósito de arriba se vacía y la jarra se llena a lo largo del vídeo
  const low = 0.2 + 0.55 * ramp(t, S(4), E(7));
  const up = 0.9 - 0.6 * ramp(t, S(4), E(7));
  // beat 2: contador de metros cuadrados
  const m2 = Math.round(1000 * ramp(t, Wd(2, "gramo"), Wd(2, "cuadrados") + 0.3) / 10) * 10;

  return (
    <AbsoluteFill>
      <Bg />

      {/* 1 · gancho: la jarra grande; se levanta la tapa y se abre el cartucho */}
      <Scene {...sc(1)}>
        <Svg><g transform={`translate(560 790) scale(${1.05 + 0.05 * cut1}) translate(-560 -790)`}>
          <Jug t={t} open={open1} cut={cut1} up={0.9} low={0.2} flow={0.6} hl={cut1 > 0.5 ? "cart" : undefined} />
        </g></Svg>
        <Chip text="POR DENTRO" o={span(t, 1.9, E(1))} />
        <Label x={540} y={1110} text="carbón activado" color={K.flow} size={44} box o={at(1, "carbón", Wd(1, "tenis") - 0.05)} />
        <Label x={540} y={1110} text="¡más que una pista de tenis!" size={46} box o={at(1, "tenis")} />
      </Scene>

      {/* 2 · entrega: grano con poros + pistas de tenis */}
      <Scene {...sc(2)}>
        <Svg>
          <Grain cx={300} cy={760} r={200} t={t} catchP={0} n={16} label="1 g" />
          {[0, 1, 2, 3].map((k) => (
            <Court key={k} x={610 + (k % 2) * 150} y={500 + Math.floor(k / 2) * 310} w={126}
              o={0.25 + 0.75 * ramp(t, Wd(2, "gramo") + k * 0.35, Wd(2, "gramo") + k * 0.35 + 0.4)} />
          ))}
        </Svg>
        <Chip text="LO QUE ESCONDE" o={chip(2)} />
        <Label x={540} y={405} text="poros diminutos" color={K.white} box o={at(2, "poros", Wd(2, "gramo") - 0.05)} />
        <Label x={540} y={405} text="≈ 4 pistas de tenis" color={K.flow} box o={at(2, "gramo")} />
        <Label x={540} y={1110} text={`1 gramo ≈ ${m2.toLocaleString("es-ES")} m²`} size={54} box o={late(2, "gramo")} />
      </Scene>

      {/* 3 · idea clave: se pegan (carbón) o se cambian (resina) */}
      <Scene {...sc(3)}>
        <Svg>
          <Grain cx={290} cy={740} r={175} t={t} catchP={ramp(t, Wd(3, "pegadas") - 0.3, Wd(3, "pegadas") + 1.2)} n={12} />
          <Resin cx={790} cy={740} r={130} t={t} swap={ramp(t, Wd(3, "cambian") - 0.2, Wd(3, "cambian") + 1.2)} />
        </Svg>
        <Chip text="LA IDEA CLAVE" o={chip(3)} />
        <Label x={540} y={405} text="no solo se cuela" size={46} box o={at(3, "cuela")} />
        <Label x={290} y={1030} text="se pegan" color={K.flow} size={46} box o={late(3, "pegadas")} />
        <Label x={790} y={1030} text="se cambian" color={K.flow} size={46} box o={late(3, "cambian")} />
      </Scene>

      {/* 4 · el agua entra arriba y cruza el cartucho */}
      <Scene {...sc(4)}>
        <Svg><Jug t={t} up={up} low={low} flow={late(4, "cruza")} hl={t > Wd(4, "cruza") ? "cart" : "top"} /></Svg>
        <Chip text="1 · ARRIBA, AGUA DEL GRIFO" color={K.cold} o={chip(4)} />
        <Label x={540} y={405} text="agua del grifo" color={K.cold} box o={at(4, "grifo", Wd(4, "cruza") - 0.05)} />
        <Label x={540} y={405} text="cruza el cartucho" color={K.flow} box o={at(4, "cruza")} />
      </Scene>

      {/* 5 · carbón activado: cloro y mal sabor se pegan a los poros */}
      <Scene {...sc(5)}>
        <Svg><Grain cx={540} cy={770} r={300} t={t} catchP={ramp(t, Wd(5, "cloro"), Wd(5, "pegados") + 0.8)} n={16} /></Svg>
        <Chip text="2 · EL CARBÓN ACTIVADO" o={chip(5)} />
        <Label x={540} y={405} text="cloro" color={K.flow} size={50} box o={at(5, "cloro")} />
        <Label x={540} y={1120} text="mal sabor y olor" size={46} box o={at(5, "sabor")} />
      </Scene>

      {/* 6 · resina: la cal entra, otros iones salen */}
      <Scene {...sc(6)}>
        <Svg><Resin cx={540} cy={780} r={180} t={t} swap={ramp(t, Wd(6, "atrapan"), Wd(6, "cambio") + 0.5)} /></Svg>
        <Chip text="3 · LA RESINA" o={chip(6)} />
        <Label x={540} y={405} text="calcio + magnesio = cal" size={44} box o={at(6, "calcio")} />
        <Label x={540} y={1120} text="sueltan otros iones" color={K.flow} size={46} box o={at(6, "sueltan")} />
      </Scene>

      {/* 7 · sale mejor agua, pero no estéril */}
      <Scene {...sc(7)}>
        <Svg><Jug t={t} up={up} low={low} flow={0.7} hl="low" sparkle={late(7, "sabor")} /></Svg>
        <Chip text="4 · LO QUE SALE" o={chip(7)} />
        <Label x={540} y={405} text="menos cal · mejor sabor" color={K.cold} size={46} box o={at(7, "menos")} />
        <Stamp x={540} y={1060} text="NO ESTERILIZA" p={r(7, "esteriliza", 0.3)} />
      </Scene>

      {/* 8 · curiosidad: el agua del grifo ya es apta */}
      <Scene {...sc(8)}>
        <Svg>
          <Tap t={t} x={420} y={540} />
          <Glass t={t} x={470} y={830} w={250} h={290} level={0.25 + 0.5 * ramp(t, S(8), E(8))} sparkle={late(8, "sabor") - 0.3} />
        </Svg>
        <Chip text="CURIOSIDAD" o={chip(8)} />
        <Stamp x={770} y={700} text="APTA" color={K.cold} size={64} p={r(8, "apta", 0.3)} />
        <Label x={540} y={405} text="según Sanidad" size={44} box o={at(8, "sanidad")} />
        <Label x={540} y={1120} text="la jarra: por sabor" color={K.flow} size={46} box o={at(8, "jarra")} />
      </Scene>

      {/* 9 · truco: cambiar el cartucho */}
      <Scene {...sc(9)}>
        <Svg>
          <Calendar x={320} y={720} t={t} months={1 + ramp(t, Wd(9, "uno"), Wd(9, "meses") + 0.3)} />
          <Cartridge x={750} y={760} t={t} old={ramp(t, Wd(9, "viejo"), Wd(9, "bacterias") + 0.8)} />
        </Svg>
        <Chip text="TRUCO" o={chip(9)} />
        <Label x={540} y={405} text="cámbialo cuando toque" size={46} box o={at(9, "cambia")} />
        <Label x={320} y={1060} text="cada 1-2 meses" color={K.flow} size={42} box o={late(9, "uno")} />
        <Label x={750} y={1060} text="bacterias" color={K.warn} size={42} box o={at(9, "bacterias")} />
      </Scene>

      {/* 10 · otra: a la nevera y en el día */}
      <Scene {...sc(10)}>
        <Svg>
          <Fridge t={t} open={0.35 + 0.65 * r(10, "nevera")}>
            <g transform="translate(540 790) scale(0.42) translate(-560 -800)"><Jug t={t} up={0.2} low={0.75} /></g>
          </Fridge>
        </Svg>
        <Chip text="OTRA" o={chip(10)} />
        <Label x={540} y={405} text="a la nevera" color={K.cold} size={48} box o={at(10, "nevera", Wd(10, "pierde") - 0.05)} />
        <Label x={540} y={405} text="ya no lleva cloro" size={46} box o={at(10, "pierde")} />
        <Label x={540} y={1120} text="bébela en el día" color={K.flow} size={46} box o={at(10, "bebela")} />
      </Scene>

      {/* 11 · cierre */}
      <Scene {...sc(11)}>
        <Svg><Jug t={t} cut={1} up={0.3} low={0.8} flow={0.6} /></Svg>
        <Chip text="EN RESUMEN" o={chip(11)} />
        <Label x={290} y={405} text="carbón → sabor" color={K.flow} size={40} box o={late(11, "carbón")} />
        <Label x={790} y={405} text="resina → cal" color={K.white} size={40} box o={late(11, "resina")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
