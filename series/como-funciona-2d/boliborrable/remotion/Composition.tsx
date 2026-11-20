// Episodio 146 · Cómo funciona el bolígrafo borrable (la tinta que desaparece con calor).
// Cada beat es una <Scene> con su dibujo (Boli.tsx), un <Chip> y 1-3 <Label>. Cambios atados a palabras con Wd(beat, "palabra").
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Svg, Pen, Paper, Rubber, Capsule, Thermo, Magnifier, Freezer, Dryer, Cheque, Car, INK } from "./Boli";

export const COMP_ID = "BoliBorrable";
export const HOOK = "La tinta sigue ahí"; // = meta.portada
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

  // beat 1: el cuerpo del boli se parte y deja ver el cartucho al decir «equivocados»
  const open1 = r(1, "equivocados", 0.8);
  // beat 2: la goma roza el segundo renglón; la tinta se vuelve invisible pero queda el contorno
  const rub2 = ramp(t, Wd(2, "goma"), Wd(2, "goma") + 0.3) * (1 - ramp(t, Wd(2, "invisible") + 0.4, Wd(2, "invisible") + 0.8));
  const gone2 = ramp(t, Wd(2, "calienta"), Wd(2, "invisible") + 0.2);
  // beat 6: el termómetro sube al rozar; el regulador se lleva al revelador
  const heat6 = ramp(t, Wd(6, "rozar"), Wd(6, "sesenta") + 0.3);
  // beat 8: el frío baja de −10 °C y se vuelven a juntar
  const cold8 = ramp(t, Wd(8, "enfrías"), Wd(8, "cero") + 0.3);
  const back8 = r(8, "juntar", 0.9);
  // beat 9: la puerta se abre y lo escrito vuelve
  const door9 = r(9, "rato", 0.6);
  const back9 = ramp(t, Wd(9, "vuelve"), Wd(9, "escrito") + 0.6);
  // beat 10: el secador sopla y todo desaparece
  const dry10 = r(10, "secador", 0.4);
  const gone10 = ramp(t, Wd(10, "secador") + 0.2, Wd(10, "secador") + 1.2);
  // beat 11: el coche al sol se calienta y los apuntes se borran
  const heat11 = ramp(t, S(11) + 0.3, Wd(11, "salpicadero") + 0.6);
  const gone11 = ramp(t, Wd(11, "sesenta"), Wd(11, "borran") + 0.4);

  return (
    <AbsoluteFill>
      <Bg />

      {/* 1 · gancho: el boli grande; al decir «equivocados» el cuerpo se parte y se ve la tinta por dentro */}
      <Scene {...sc(1)}>
        <Svg><Pen cx={540} cy={820} len={860} angle={-28} open={open1} t={t} glow={0.4 + 0.3 * Math.sin(t * 3)} /></Svg>
        <Chip text="POR DENTRO" o={span(t, 1.9, E(1))} />
        <Label x={540} y={1125} text="¿la goma la quita?" size={48} box o={at(1, "goma")} />
      </Scene>

      {/* 2 · entrega: la goma calienta el renglón; la tinta se vuelve invisible pero sigue ahí (contorno punteado) */}
      <Scene {...sc(2)}>
        <Svg>
          <Paper x={170} y={500} w={740} h={540} vis={[1, 1 - gone2, 1, 1]} ghost={gone2} heat={rub2} t={t} />
          <Rubber x={560} y={700} t={t} rub={rub2} o={late(2, "goma")} />
        </Svg>
        <Chip text="SIGUE AHÍ" o={chip(2)} />
        <Label x={540} y={1125} text="la goma solo calienta" color={K.hot} size={44} box o={at(2, "goma", Wd(2, "invisible") - 0.05)} />
        <Label x={540} y={1125} text="invisible, pero ahí" color={K.flow} size={46} box o={at(2, "invisible")} />
      </Scene>

      {/* 3 · idea clave: tinta termocrómica en cápsulas más finas que un pelo */}
      <Scene {...sc(3)}>
        <Svg><Magnifier cx={520} cy={770} r={290} t={t} caps={late(3, "cápsulas")} hair={r(3, "pelo", 0.5)} warm={r(3, "cambia", 0.6) * (1 - r(3, "cápsulas", 0.6) * 0.6)} /></Svg>
        <Chip text="LA IDEA CLAVE" o={chip(3)} />
        <Label x={540} y={430} text="cambia con la temperatura" color={K.hot} size={42} box o={at(3, "cambia")} />
        <Label x={540} y={1125} text="cápsulas más finas que un pelo" color={K.flow} size={40} box o={at(3, "cápsulas")} />
      </Scene>

      {/* 4 · paso 1: tres cosas dentro de cada cápsula */}
      <Scene {...sc(4)}>
        <Svg><Capsule cx={540} cy={790} r={280} t={t} pair={0} color={0.5 * r(4, "colorante", 0.4)} dye={late(4, "colorante")} dev={late(4, "revelador")} reg={late(4, "regulador")} /></Svg>
        <Chip text="1 · LA CÁPSULA" o={chip(4)} />
        <Label x={250} y={440} text="colorante" color="#8FB0FF" size={42} box o={at(4, "colorante")} />
        <Label x={830} y={440} text="revelador" color={K.flow} size={42} box o={at(4, "revelador")} />
        <Label x={540} y={1125} text="regulador de temperatura" color={K.hot} size={42} box o={at(4, "regulador")} />
      </Scene>

      {/* 5 · paso 2: a temperatura normal, colorante y revelador van pegados y dan el color */}
      <Scene {...sc(5)}>
        <Svg><Capsule cx={540} cy={790} r={280} t={t} pair={r(5, "pegados", 0.6)} color={r(5, "pegados", 0.4) * 0.5 + 0.5 * r(5, "color", 0.4)} /></Svg>
        <Chip text="2 · EL COLOR" o={chip(5)} />
        <Label x={540} y={440} text="a temperatura ambiente: pegados" size={38} box o={at(5, "temperatura")} />
        <Label x={540} y={1125} text="juntos = color" color="#8FB0FF" size={48} box o={at(5, "juntos")} />
      </Scene>

      {/* 6 · paso 3: al rozar, más de 60 °C; el regulador los separa */}
      <Scene {...sc(6)}>
        <Svg>
          <Capsule cx={620} cy={790} r={250} t={t} heat={heat6} sep={r(6, "separa", 0.8)} />
          <Thermo x={170} y={980} val={20 + 45 * heat6} o={late(6, "rozar")} />
        </Svg>
        <Chip text="3 · LA GOMA ROZA" color={K.hot} o={chip(6)} />
        <Label x={540} y={440} text="más de 60 °C" color={K.hot} size={46} box o={at(6, "sesenta")} />
        <Label x={620} y={1125} text="el regulador los separa" color={K.flow} size={40} box o={at(6, "regulador")} />
      </Scene>

      {/* 7 · paso 4: separados no dan color; la tinta es transparente pero sigue en el papel */}
      <Scene {...sc(7)}>
        <Svg>
          <Capsule cx={540} cy={640} r={165} t={t} sep={1} heat={0.3} color={0} />
          <Paper x={190} y={840} w={700} h={230} vis={[1 - r(7, "transparente", 0.6), 1 - r(7, "transparente", 0.6)]} ghost={r(7, "sigue", 0.4)} t={t} />
        </Svg>
        <Chip text="4 · TRANSPARENTE" o={chip(7)} />
        <Label x={540} y={430} text="separados: sin color" size={42} box o={at(7, "separados")} />
        <Label x={540} y={1125} text="¡pero sigue en el papel!" color={K.flow} size={44} box o={at(7, "sigue")} />
      </Scene>

      {/* 8 · con frío (bajo −10 °C) se vuelven a juntar y reaparece */}
      <Scene {...sc(8)}>
        <Svg>
          <Capsule cx={620} cy={790} r={250} t={t} cold={cold8} sep={1 - back8} />
          <Thermo x={170} y={980} val={20 - 32 * cold8} o={late(8, "enfrías")} />
        </Svg>
        <Chip text="¿Y CON FRÍO?" color={K.cold} o={chip(8)} />
        <Label x={540} y={440} text="bajo −10 °C" color={K.cold} size={48} box o={at(8, "diez")} />
        <Label x={620} y={1125} text="¡reaparece!" color="#8FB0FF" size={50} box o={at(8, "reaparece")} />
      </Scene>

      {/* 9 · curiosidad: el congelador hace volver lo borrado */}
      <Scene {...sc(9)}>
        <Svg>
          <Freezer x={230} y={470} w={620} h={620} t={t} door={door9}>
            <Paper x={290} y={530} w={500} h={500} vis={[back9, back9, back9]} ghost={1 - back9} frost={door9} t={t} />
          </Freezer>
        </Svg>
        <Chip text="CURIOSIDAD" o={chip(9)} />
        <Label x={540} y={1125} text="vuelve lo borrado" color="#8FB0FF" size={48} box o={at(9, "vuelve")} />
      </Scene>

      {/* 10 · truco: nada de cheques ni papeles oficiales; un secador lo borra */}
      <Scene {...sc(10)}>
        <Svg>
          <Cheque x={110} y={650} w={860} h={380} vis={1 - gone10} heat={dry10} t={t} />
          <g transform="rotate(-22 760 520)"><Dryer x={760} y={520} t={t} on={dry10} o={late(10, "secador")} /></g>
        </Svg>
        <Chip text="TRUCO" o={chip(10)} />
        <Label x={540} y={1125} text="ni cheques ni papeles oficiales" color={K.warn} size={40} box o={at(10, "cheques", Wd(10, "secador") - 0.05)} />
        <Label x={540} y={1125} text="un secador lo borra" color={K.hot} size={46} box o={at(10, "secador")} />
      </Scene>

      {/* 11 · otra: el coche al sol; el salpicadero pasa de 60 °C y los apuntes se borran */}
      <Scene {...sc(11)}>
        <Svg>
          <Car x={540} y={860} t={t} sun={1} heat={heat11} notes={1 - gone11} />
          <line x1={415} y1={790} x2={330} y2={660} stroke={C_LINE} strokeWidth={4} strokeDasharray="8 8" opacity={late(11, "apuntes")} />
          <g opacity={late(11, "apuntes")}><Paper x={110} y={420} w={420} h={240} vis={[1 - gone11, 1 - gone11]} heat={heat11} t={t} /></g>
        </Svg>
        <Chip text="OTRA" o={chip(11)} />
        <Label x={540} y={1125} text="salpicadero: +60 °C" color={K.hot} size={46} box o={at(11, "salpicadero", Wd(11, "borran") - 0.05)} />
        <Label x={540} y={1125} text="¡apuntes en blanco!" color={K.warn} size={46} box o={at(11, "borran")} />
      </Scene>

      {/* 12 · cierre */}
      <Scene {...sc(12)}>
        <Svg>
          <Paper x={200} y={740} w={680} h={340} vis={[1, 0, 1]} ghost={1} t={t} />
          <Pen cx={560} cy={560} len={620} angle={-14} t={t} glow={0.5 + 0.4 * Math.sin(t * 4)} />
        </Svg>
        <Chip text="EN RESUMEN" o={chip(12)} />
        <Label x={540} y={430} text="no borra: calienta" color={K.hot} size={46} box o={late(12, "calienta")} />
        <Label x={540} y={1125} text="tinta invisible" color="#8FB0FF" size={48} box o={late(12, "invisible")} />
      </Scene>

      <Stamp x={540} y={560} text="¡FALSO!" p={ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.3) * (t < scene(1)[1] ? 1 : 0)} />
      <Stamp x={540} y={840} text="¡NO!" p={ramp(t, Wd(10, "uses"), Wd(10, "uses") + 0.3) * (1 - ramp(t, Wd(10, "secador") - 0.3, Wd(10, "secador"))) * (t >= S(10) && t < E(10) ? 1 : 0)} size={90} />
      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
const C_LINE = "#9FB3CC";
void INK;
