// Episodio 165 · Cómo hace niebla fría un humidificador ultrasónico.
// Cada beat es una <Scene> con su dibujo (Humidificador.tsx), un <Chip> y 1-3 <Label>. Cambios atados a palabras con Wd(beat, "palabra").
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Svg, Humid, Flame, Surface, Mist, Piezo, FreqCompare, Ear, Furniture, Nebulizer, Bottle, HumBar, Sponge } from "./Humidificador";

export const COMP_ID = "Humidificador";
export const HOOK = "Rompe el agua a gritos"; // = meta.portada
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
  const on = (i: number, w: string, d = 0.3) => ramp(t, Wd(i, w), Wd(i, w) + d);
  const chip = (i: number) => span(t, S(i) + 0.1, E(i));

  // beat 1: la carcasa se abre al decir «rompe»
  const open1 = on(1, "rompe", 0.8);
  // beat 8: el agua baja hasta que el sensor apaga el disco
  const off8 = on(8, "apaga", 0.25);
  const lvl8 = 0.8 - 0.68 * ramp(t, S(8) + 0.3, Wd(8, "apaga"));

  return (
    <AbsoluteFill>
      <Bg />

      {/* 1 · gancho: el aparato cerrado, grande; ¿hierve? → ¡FALSO! → al decir «rompe» se abre y se ve el disco con sus ondas */}
      <Scene {...sc(1)}>
        <Svg><g transform={`translate(540 795) scale(${1 + 0.04 * open1}) translate(-540 -795)`}>
          <Humid t={t} open={open1} on={1} mist={0.35 + 0.65 * open1} waves={on(1, "gritos", 0.4)} hl={open1 > 0.5 ? "disc" : null} />
        </g>
          <Flame x={540} y={640} o={span(t, Wd(1, "hierve"), Wd(1, "rompe") + 0.3)} cross={on(1, "equivocados", 0.4)} />
        </Svg>
        <Chip text="POR DENTRO" o={span(t, 1.9, E(1))} />
        <Stamp x={540} y={1110} text="¡FALSO!" p={on(1, "equivocados") * (1 - ramp(t, Wd(1, "rompe") + 0.2, Wd(1, "rompe") + 0.5))} />
        <Label x={300} y={405} text="¡ultrasonido!" color={K.flow} size={48} box o={at(1, "gritos")} />
      </Scene>

      {/* 2 · entrega: disco en el fondo, ondas y gotitas frías */}
      <Scene {...sc(2)}>
        <Svg><Humid t={t} hl="disc" waves={late(2, "ultrasonido")} mist={late(2, "gotitas")} /></Svg>
        <Chip text="LO QUE ESCONDE" o={chip(2)} />
        <Label x={290} y={405} text="ultrasonido" color={K.flow} box o={at(2, "ultrasonido")} />
        <Label x={800} y={405} text="agua fría" color={K.cold} box o={at(2, "fría")} />
        <Label x={540} y={1100} text="disco vibrador" size={40} box o={at(2, "disco")} />
      </Scene>

      {/* 3 · idea clave: sin calor, el agua sacudida se deshace en niebla */}
      <Scene {...sc(3)}>
        <Svg>
          <Surface t={t} amp={late(3, "sacude")} drops={late(3, "niebla")} y={820} waves={late(3, "sacude")} />
          <Mist t={t} o={late(3, "niebla")} x={540} y0={790} y1={470} n={40} spread={150} widen={0.6} speed={0.35} />
          <Flame x={190} y={470} s={0.7} o={1} cross={on(3, "hierve", 0.4)} />
        </Svg>
        <Chip text="LA IDEA CLAVE" o={chip(3)} />
        <Label x={420} y={470} text="sin hervir" color={K.hot} size={44} box o={at(3, "hierve")} />
        <Label x={540} y={1040} text="agua sacudida = niebla" color={K.white} size={46} box o={at(3, "niebla")} />
      </Scene>

      {/* 4 · el disco piezoeléctrico: corriente → se estira y se encoge */}
      <Scene {...sc(4)}>
        <Svg><Piezo t={t} on={late(4, "corriente")} /></Svg>
        <Chip text="1 · EL DISCO" o={chip(4)} />
        <Label x={540} y={520} text="piezoeléctrico" color={K.flow} size={48} box o={at(4, "piezoeléctrico", Wd(4, "altavoz") - 0.05)} />
        <Label x={540} y={520} text="como un altavoz diminuto" color={K.flow} size={44} box o={at(4, "altavoz")} />
        <Label x={540} y={1110} text="corriente" color={K.flow} size={40} box o={at(4, "corriente")} />
      </Scene>

      {/* 5 · frecuencia: la onda que oyes frente a la del disco */}
      <Scene {...sc(5)}>
        <Svg>
          <FreqCompare t={t} ear={late(5, "oyes")} disc={late(5, "millón")} />
          <Ear x={885} y={915} s={0.65} o={1} cross={on(5, "oyes", 0.4)} />
        </Svg>
        <Chip text="ULTRASONIDO" o={chip(5)} />
        <Label x={450} y={505} text="lo que oyes: ≈ 20 000 /s" color={K.cold} size={40} box o={late(5, "agudo")} />
        <Label x={450} y={1060} text="el disco: ≈ 1 700 000 /s" color={K.flow} size={40} box o={late(5, "millón")} />
      </Scene>

      {/* 6 · olas diminutas en la superficie: de sus crestas saltan gotitas */}
      <Scene {...sc(6)}>
        <Svg><Surface t={t} amp={1} waves={1} drops={late(6, "crestas")} y={820} mag={on(6, "micras", 0.4)} /></Svg>
        <Chip text="2 · LA SUPERFICIE" color={K.cold} o={chip(6)} />
        <Label x={300} y={470} text="olas diminutas" color={K.cold} size={44} box o={at(6, "olas")} />
        <Label x={540} y={1040} text="gotitas de pocas micras" color={K.white} size={44} box o={at(6, "gotitas")} />
      </Scene>

      {/* 7 · el ventilador saca la niebla; el aire la evapora */}
      <Scene {...sc(7)}>
        <Svg><Humid t={t} hl="fan" air={late(7, "ventilador")} mist={1} /></Svg>
        <Chip text="3 · EL VENTILADOR" o={chip(7)} />
        <Label x={345} y={520} text="ventilador" color={K.cold} size={40} box o={at(7, "ventilador")} />
        <Label x={800} y={405} text="se evapora" color={K.white} size={42} box o={at(7, "evapora")} />
        <Label x={280} y={405} text="+ humedad" color={K.cold} size={42} box o={at(7, "sube")} />
      </Scene>

      {/* 8 · sensor de nivel: el agua baja y el disco se apaga */}
      <Scene {...sc(8)}>
        <Svg><Humid t={t} hl="float" level={lvl8} on={1 - off8} fan={1 - off8} mist={1} waves={0.8} tankLevel={0.05} led={off8 > 0.5 ? "off" : "on"} /></Svg>
        <Chip text="4 · EL SENSOR" o={chip(8)} />
        <Label x={760} y={405} text="sensor de nivel" color={K.flow} size={40} box o={at(8, "sensor")} />
        <Stamp x={420} y={760} text="APAGADO" p={on(8, "apaga")} />
        <Label x={540} y={1110} text="sin agua, no se quema" color={K.warn} size={40} box o={at(8, "sin")} />
      </Scene>

      {/* 9 · curiosidad: polvo blanco con agua dura */}
      <Scene {...sc(9)}>
        <Svg>
          <rect x={200} y={800} width={130} height={140} rx={30} fill="#3E6AA0" stroke="#9FB3CC" strokeWidth={5} />
          <Mist t={t} o={1} x={265} y0={790} y1={480} n={22} spread={20} widen={2} speed={0.3} />
          <Furniture t={t} dust={ramp(t, Wd(9, "polvo"), E(9) - 0.3)} mag={late(9, "minerales")} />
        </Svg>
        <Chip text="CURIOSIDAD" o={chip(9)} />
        <Label x={540} y={405} text="agua dura" color={K.cold} size={44} box o={at(9, "dura")} />
        <Label x={775} y={610} text="minerales" color={K.white} size={40} box o={at(9, "minerales")} />
        <Label x={540} y={1060} text="polvo blanco" color={K.white} size={48} box o={at(9, "polvo")} />
      </Scene>

      {/* 10 · otra: la misma técnica en nebulizadores */}
      <Scene {...sc(10)}>
        <Svg><Nebulizer t={t} o={1} on={late(10, "nebulizadores")} /></Svg>
        <Chip text="OTRA CURIOSIDAD" o={chip(10)} />
        <Label x={540} y={430} text="la misma técnica" color={K.flow} size={44} box o={at(10, "técnica", Wd(10, "nebulizadores") - 0.05)} />
        <Label x={540} y={430} text="nebulizador" color={K.flow} size={44} box o={at(10, "nebulizadores")} />
        <Label x={300} y={600} text="niebla fina" color={K.white} size={40} box o={at(10, "niebla")} />
      </Scene>

      {/* 11 · truco: agua destilada, limpieza y humedad 30-50 % */}
      <Scene {...sc(11)}>
        <Svg>
          <Bottle t={t} x={330} y={680} pour={on(11, "destilada", 0.6)} />
          <Sponge t={t} x={330} y={930} o={late(11, "límpialo")} />
          <HumBar value={65 - 25 * ramp(t, Wd(11, "humedad"), Wd(11, "cincuenta"))} band={on(11, "treinta")} />
        </Svg>
        <Chip text="TRUCO" o={chip(11)} />
        <Label x={330} y={440} text="agua destilada" color={K.cold} size={42} box o={at(11, "destilada")} />
        <Label x={330} y={1060} text="límpialo a menudo" size={40} box o={at(11, "límpialo")} />
        <Label x={760} y={1110} text="30 - 50 %" color={K.flow} size={52} box o={late(11, "treinta") * span(t, S(11), E(11))} />
      </Scene>

      {/* 12 · cierre */}
      <Scene {...sc(12)}>
        <Svg><Humid t={t} waves={1} mist={1} air={0.6} /></Svg>
        <Chip text="EN RESUMEN" o={chip(12)} />
        <Label x={220} y={405} text="1 vibra" color={K.flow} size={44} box o={late(12, "vibra")} />
        <Label x={540} y={1100} text="2 no lo oyes" color={K.white} size={44} box o={late(12, "oigas")} />
        <Label x={850} y={405} text="3 niebla" color={K.cold} size={44} box o={late(12, "niebla")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
