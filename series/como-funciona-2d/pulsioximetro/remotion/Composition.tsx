// Episodio 151 · Cómo sabe la pinza del dedo cuánto oxígeno llevas en la sangre (pulsioxímetro) (ESPECIAL HOSPITAL).
// Cada beat es una <Scene> con su dibujo y 1-3 etiquetas. Cambios atados a palabras con Wd(beat, "palabra").
// Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok). Sin consejos médicos ni valores: «eso lo decide tu médico».
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { C, Oximeter, Cell, Ray, Wave, Section, Stack, Table, Person, Snow, Motion, Spectrum, pulse } from "./Pulsioximetro";

export const COMP_ID = "Pulsioximetro";
export const HOOK = "Te mira la sangre"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);

/** Yema con uña pintada (icono). */
const NailIcon: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <path d="M -50 70 L -50 -10 C -50 -70 50 -70 50 -10 L 50 70 Z" fill={C.sil} stroke={C.silEdge} strokeWidth={5} />
    <path d="M -30 -4 C -30 -44 30 -44 30 -4 L 30 26 C 10 32 -10 32 -30 26 Z" fill="#1A1A2E" stroke="#7B3FE4" strokeWidth={4} />
  </g>
);

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const S = (i: number) => scene(i)[0];
  const E = (i: number) => scene(i)[1];
  const chip = (i: number) => span(t, S(i), E(i));
  const dim = (x: number) => 0.3 + 0.7 * x; // atenuado antes de entrar
  const sp = (i: number, w: string, end?: number) => span(t, Wd(i, w), end ?? E(i));
  /** etiqueta que luego es sustituida por otra en el mismo sitio: atenuada antes de entrar y DESAPARECE del todo al salir. */
  const lab = (a: number, b: number) => (t < a ? 0.3 : span(t, a, b, 0.25));
  /** la que entra después en el mismo sitio: invisible hasta que la primera ha salido. */
  const lab2 = (a: number, b: number) => span(t, a + 0.3, b);
  const on = (i: number, w: string, d = 0.4) => ramp(t, Wd(i, w), Wd(i, w) + d);

  // ---- tiempos clave
  const b1open = ramp(t, Wd(1, "truco"), Wd(1, "truco") + 0.7);
  const b1leds = on(1, "mira", 0.5);
  const b5sin = on(5, "Sin", 0.4);
  const b8tab = on(8, "tabla", 0.5);
  const b10noise = on(10, "estorbaba", 0.4);
  const b10key = on(10, "clave", 0.5);
  const b11move = on(11, "moverte", 0.3);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: la pinza GRANDE en el dedo desde el fotograma 0; con «truco» se abre y con «mira» se encienden las dos luces */}
      <Scene {...sc(1)}>
        <SVG><g transform={`translate(540 790) scale(${1 + 0.012 * Math.sin(t * 2)}) translate(-540 -790)`}>
          <Oximeter x={325} y={790} s={1.3} t={t} open={b1open} leds={b1leds} beams={b1leds * (1 - b1open * 0.6)} sensor={b1leds} heart={b1leds} />
        </g></SVG>
      </Scene>

      {/* 2 · la promesa: dos luces, roja e infrarroja, atraviesan el dedo hasta un sensor */}
      <Scene {...sc(2)}>
        <Chip text="Dos luces y un sensor" o={chip(2)} />
        <SVG><Oximeter x={358} y={770} s={1.1} t={t} leds={dim(on(2, "luces"))} beams={on(2, "atraviesan", 0.6)} sensor={on(2, "sensor")} hi={0} /></SVG>
        <Label x={310} y={470} text="luz roja" color={C.red} size={46} o={dim(sp(2, "roja"))} />
        <Label x={720} y={470} text="infrarroja (invisible)" color={C.ir} size={36} o={dim(sp(2, "infrarroja"))} />
        <Label x={540} y={1110} text="sensor de luz" color={K.flow} size={46} box o={dim(sp(2, "sensor"))} />
      </Scene>

      {/* 3 · idea clave: la sangre con y sin oxígeno no se traga la misma luz */}
      <Scene {...sc(3)}>
        <Chip text="La idea clave" o={chip(3)} />
        <SVG>
          <Ray x={310} y0={530} yCut={770} y1={1020} pass={0.3 + 0.7 * on(3, "traga", 0.6)} t={t} o={dim(on(3, "con"))} />
          <Ray x={770} y0={530} yCut={770} y1={1020} pass={0.3 - 0.3 * on(3, "traga", 0.6)} t={t} o={dim(on(3, "sin"))} />
          <Cell x={310} y={770} r={130} oxy={1} t={t} o={dim(on(3, "con"))} />
          <Cell x={770} y={770} r={130} oxy={0} t={t} o={dim(on(3, "sin"))} />
        </SVG>
        <Label x={310} y={470} text="con oxígeno" color={K.cold} size={44} o={dim(sp(3, "con"))} />
        <Label x={770} y={470} text="sin oxígeno" color="#FF8A80" size={44} o={dim(sp(3, "sin"))} />
        <Label x={540} y={1110} text="no se tragan la misma luz" color={K.flow} size={44} box o={dim(sp(3, "traga"))} />
      </Scene>

      {/* 4 · primero: las dos luces, roja de 660 nm e infrarroja de 940 nm */}
      <Scene {...sc(4)}>
        <Chip text="1 · Las dos luces" o={chip(4)} />
        <SVG><Spectrum x0={90} x1={990} y={780} red={on(4, "roja")} ir={on(4, "infrarroja")} t={t} /></SVG>
        <Label x={480} y={620} text="660 nm" color={C.red} size={48} o={dim(sp(4, "seiscientos"))} />
        <Label x={840} y={620} text="940 nm" color={C.ir} size={48} o={dim(sp(4, "novecientos"))} />
        <Label x={300} y={460} text="la que ves" color={K.white} size={40} o={dim(sp(4, "roja"))} />
        <Label x={540} y={1110} text="la infrarroja no se ve" color={C.ir} size={46} box o={dim(sp(4, "infrarroja"))} />
      </Scene>

      {/* 5 · segundo: con oxígeno pasa la roja y frena la infrarroja; sin oxígeno, al revés */}
      <Scene {...sc(5)}>
        <Chip text="2 · Cada sangre, su luz" o={chip(5)} />
        <SVG>
          <Ray x={270} y0={530} yCut={790} y1={1030} pass={0.15 + 0.85 * on(5, "pasar", 0.6)} t={t} o={dim(on(5, "roja"))} />
          <Ray x={350} y0={530} yCut={790} y1={1030} ir pass={0.15 * (1 - on(5, "frena", 0.4))} t={t} o={dim(on(5, "infrarroja"))} />
          <Ray x={730} y0={530} yCut={790} y1={1030} pass={0.15 * (1 - b5sin)} t={t} o={dim(b5sin)} />
          <Ray x={810} y0={530} yCut={790} y1={1030} ir pass={0.15 + 0.85 * on(5, "revés", 0.6)} t={t} o={dim(b5sin)} />
          <Cell x={310} y={790} r={115} oxy={1} t={t} />
          <Cell x={770} y={790} r={115} oxy={0} t={t} o={dim(b5sin)} />
        </SVG>
        <Label x={310} y={470} text="con O₂" color={K.cold} size={46} o={dim(sp(5, "con"))} />
        <Label x={770} y={470} text="sin O₂" color="#FF8A80" size={46} o={dim(sp(5, "Sin"))} />
        <Label x={540} y={1110} text="pasa la roja, frena la otra" color={K.white} size={42} box o={lab(Wd(5, "pasar"), Wd(5, "Sin"))} />
        <Label x={540} y={1110} text="sin oxígeno: al revés" color="#FF8A80" size={44} box o={lab2(Wd(5, "Sin"), E(5))} />
      </Scene>

      {/* 6 · tercero: con cada latido llega más sangre arterial y la luz que cruza baja */}
      <Scene {...sc(6)}>
        <Chip text="3 · El latido" o={chip(6)} />
        <SVG>
          <Oximeter x={383} y={660} s={0.95} t={t} leds={1} beams={1} sensor={1} artery={dim(on(6, "pulso"))} dimR={0.25} dimI={0.25} />
          <Wave x0={120} x1={900} y={1030} amp={110} t={t} color={K.flow} o={dim(on(6, "baja"))} />
        </SVG>
        <Label x={540} y={1110} text="más sangre → menos luz" color={K.flow} size={44} box o={dim(sp(6, "baja"))} />
      </Scene>

      {/* 7 · piel, hueso y venas no laten: solo cuenta lo que late, la sangre arterial */}
      <Scene {...sc(7)}>
        <Chip text="Solo cuenta lo que late" o={chip(7)} />
        <SVG>
          <Section x={330} y={750} s={1.0} t={t} still={on(7, "solo", 0.6)} hiArt={on(7, "arterias", 0.4)} />
          <Stack x={800} y={980} h={380} t={t} hi={on(7, "solo", 0.4)} />
        </SVG>
        <Label x={330} y={470} text="corte del dedo" color={K.white} size={40} o={dim(sp(7, "Piel"))} />
        <Label x={800} y={1030} text="fijo" color={C.case3} size={40} o={dim(sp(7, "laten"))} />
        <Label x={540} y={1110} text="piel, hueso, venas: fijos" color={C.case3} size={44} box o={lab(Wd(7, "Piel"), Wd(7, "solo"))} />
        <Label x={540} y={1110} text="lo que late: tus arterias" color={K.flow} size={44} box o={lab2(Wd(7, "solo"), E(7))} />
      </Scene>

      {/* 8 · cuarto: compara cuánto late la roja y la infrarroja; una tabla lo pasa a porcentaje */}
      <Scene {...sc(8)}>
        <Chip text="4 · El cálculo" o={chip(8)} />
        <SVG>
          <Wave x0={110} x1={560} y={650} amp={60} t={t} color={C.red} o={dim(on(8, "roja"))} />
          <Wave x0={110} x1={560} y={870} amp={110} t={t} color={C.ir} dash o={dim(on(8, "infrarroja"))} />
          <path d="M 590 760 L 650 760" stroke={K.white} strokeWidth={8} strokeLinecap="round" opacity={dim(b8tab)} />
          <path d="M 640 740 L 664 760 L 640 780" fill="none" stroke={K.white} strokeWidth={8} strokeLinecap="round" opacity={dim(b8tab)} />
          <Table x={800} y={720} t={t} hiRow={b8tab} o={dim(b8tab)} />
        </SVG>
        <Label x={250} y={510} text="roja" color={C.red} size={42} o={dim(sp(8, "roja"))} />
        <Label x={300} y={700} text="infrarroja" color={C.ir} size={40} o={dim(sp(8, "infrarroja"))} />
        <Label x={540} y={1110} text="tabla → porcentaje" color={K.flow} size={46} box o={dim(sp(8, "tabla"))} />
      </Scene>

      {/* 9 · también el pulso; qué significan los números lo decide tu médico */}
      <Scene {...sc(9)}>
        <Chip text="También el pulso" o={chip(9)} />
        <SVG>
          <Oximeter x={358} y={780} s={1.1} t={t} leds={1} beams={1} sensor={1} heart={dim(on(9, "pulso"))} q={t >= Wd(9, "Qué")} />
          {[0, 1].map((k) => { const p = pulse(t - k * 0.08); return <circle key={k} cx={358 + 250 * 1.1} cy={780 - 150 * 1.1} r={50 + 40 * p + 30 * k} fill="none" stroke={C.red} strokeWidth={4} opacity={on(9, "pulso") * (1 - p) * 0.6} />; })}
        </SVG>
        <Label x={633} y={450} text="pulso" color={C.red} size={46} o={dim(sp(9, "pulso"))} />
        <Label x={540} y={1110} text="eso lo decide tu médico" color={K.flow} size={46} box o={dim(sp(9, "decide"))} />
      </Scene>

      {/* 10 · curiosidad: un ingeniero japonés lo ideó en los setenta; el latido le estorbaba y lo convirtió en la clave */}
      <Scene {...sc(10)}>
        <Chip text="Curiosidad" o={chip(10)} />
        <SVG>
          <Person x={210} y={830} s={0.95} o={dim(on(10, "ingeniero"))} />
          <rect x={390} y={560} width={560} height={320} rx={22} fill={C.dark} stroke={b10key > 0.01 ? K.flow : C.case3} strokeWidth={5} />
          <Wave x0={420} x1={920} y={790} amp={120} t={t} noise={1 - b10key} color={b10key > 0.5 ? K.flow : b10noise > 0.5 ? C.red : K.white} w={7} o={dim(on(10, "ideó"))} />
        </SVG>
        <Label x={540} y={470} text="Japón · años setenta" color={K.white} size={44} o={dim(sp(10, "japonés"))} />
        <Label x={540} y={1110} text="el latido estorbaba…" color={C.red} size={44} box o={lab(Wd(10, "latido"), Wd(10, "convirtió"))} />
        <Label x={540} y={1110} text="¡y fue la clave!" color={K.flow} size={48} box o={lab2(Wd(10, "convirtió"), E(10))} />
      </Scene>

      {/* 11 · otra: el esmalte, las manos frías o moverte pueden falsear la lectura */}
      <Scene {...sc(11)}>
        <Chip text="Otra curiosidad" o={chip(11)} />
        <SVG>
          <NailIcon x={230} y={500} o={dim(on(11, "esmalte"))} />
          <Snow x={540} y={500} r={56} rot={t * 20} o={dim(on(11, "frías"))} />
          <Motion x={860} y={500} o={dim(on(11, "moverte"))} />
          <g transform={`translate(${14 * b11move * Math.sin(t * 16)} 0)`}>
            <Oximeter x={400} y={860} s={0.85} t={t} leds={1} beams={1} sensor={1} heart={0.4} q={t >= Wd(11, "falsear")} dimR={0.3 + 0.4 * on(11, "falsear")} />
          </g>
        </SVG>
        <Label x={230} y={620} text="esmalte" color={K.white} size={36} o={dim(sp(11, "esmalte"))} />
        <Label x={540} y={620} text="frío" color={K.cold} size={36} o={dim(sp(11, "frías"))} />
        <Label x={850} y={620} text="moverte" color={K.white} size={36} o={dim(sp(11, "moverte"))} />
        <Label x={540} y={1110} text="pueden falsear la lectura" color={K.warn} size={44} box o={dim(sp(11, "falsear"))} />
      </Scene>

      {/* 12 · y otra: en 2021 la agencia sanitaria de EE. UU. avisó de que puede ser menos preciso en pieles oscuras */}
      <Scene {...sc(12)}>
        <Chip text="Y otra" o={chip(12)} />
        <SVG>
          <Oximeter x={425} y={640} s={0.7} t={t} leds={1} beams={1} sensor={1} tone="#C99672" edge="#E2B48E" nail="#E8C3A6" dimR={0.3} />
          <Oximeter x={425} y={930} s={0.7} t={t} leds={1} beams={1} sensor={1} tone="#5C3A22" edge="#8A5E3E" nail="#8C6448" dimR={0.3 + 0.45 * on(12, "menos", 0.6)} q={t >= Wd(12, "menos")} hi={on(12, "pieles")} />
        </SVG>
        <Label x={540} y={430} text="2021 · aviso oficial" color={K.white} size={42} o={dim(sp(12, "2021"))} />
        <Label x={540} y={1110} text="menos preciso en pieles oscuras" color={K.flow} size={40} box o={dim(sp(12, "menos"))} />
      </Scene>

      {/* 13 · cierre */}
      <Scene {...sc(13)}>
        <Chip text="En resumen" o={chip(13)} />
        <SVG>
          <Oximeter x={375} y={700} s={1.0} t={t} leds={dim(on(13, "Dos"))} beams={dim(on(13, "luces"))} sensor={1} heart={dim(on(13, "latido"))} artery={on(13, "latido")} />
          <Wave x0={140} x1={900} y={1030} amp={90} t={t} color={K.flow} o={dim(on(13, "latido"))} />
        </SVG>
        <Label x={540} y={1110} text="dos luces + latido + tabla" color={K.flow} size={44} box o={dim(sp(13, "tabla"))} />
      </Scene>

      <Stamp x={540} y={1090} size={52} text="¡SIN PINCHAZO!" color={K.cold} p={ramp(t, Wd(1, "pincharte"), Wd(1, "pincharte") + 0.3) * (t < scene(1)[1] ? 1 : 0)} />
      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
