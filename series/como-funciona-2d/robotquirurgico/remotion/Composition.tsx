// Episodio 157 · Cómo funciona un robot quirúrgico (cirugía robótica) (ESPECIAL HOSPITAL). Sin marcas.
// Cada beat es una <Scene> con su dibujo y 1-3 etiquetas. Cambios atados a palabras con Wd(beat, "palabra").
// Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok). Sin consejos ni resultados médicos.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { C, Theatre, Robot, Console, Table, Grip, Wrist, Cavity, StereoCam, View, Trace, Ruler, Doc, FactoryArm, Head, Atlantic, Signal } from "./RobotQuirurgico";

export const COMP_ID = "RobotQuirurgico";
export const HOOK = "El robot no opera solo"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
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
  const b1open = ramp(t, Wd(1, "solo"), Wd(1, "solo") + 0.6);
  const hand = Math.sin(t * 1.6); // gesto del cirujano (se copia en los brazos)
  const b5merge = on(5, "relieve", 0.7);
  const b5zoom = on(5, "aumentadas", 0.6);
  const b7bend = on(7, "doblan", 0.4);
  const b7roll = on(7, "giran", 0.4);
  const b8filt = on(8, "filtra", 0.6);
  const b9go = ramp(t, Wd(9, "mueve"), Wd(9, "centímetros") + 0.4);
  const b9tip = ramp(t, Wd(9, "pinza"), Wd(9, "uno") + 0.3);
  const b11needle = on(11, "ayudó", 0.8);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el robot GRANDE sobre la mesa desde el fotograma 0; con «equivocados» se abre la columna y se ve el cable que viene de fuera */}
      <Scene {...sc(1)}>
        <SVG>
          <g transform={`translate(310 1060) scale(${1.15 + 0.01 * Math.sin(t * 2)})`}><Theatre t={t} open={b1open} cable={b1open} /></g>
          <Signal x0={260} y0={1036} x1={40} y1={1036} t={t} o={b1open} />
        </SVG>
      </Scene>

      {/* 2 · la promesa: un cirujano en una consola a unos pasos mueve el robot */}
      <Scene {...sc(2)}>
        <Chip text="Quien opera: el cirujano" o={chip(2)} />
        <SVG>
          <g transform="translate(340 1060) scale(0.9)"><Console t={t} hi={on(2, "consola")} surgeon={dim(on(2, "cirujano"))} hands={on(2, "consola")} eyes={on(2, "consola")} /></g>
          <g transform="translate(545 1060) scale(0.75)"><Theatre t={t} move={dim(on(2, "pasos"))} /></g>
          <Signal x0={420} y0={640} x1={560} y1={720} t={t} curve={-120} o={on(2, "pasos")} />
        </SVG>
        <Label x={250} y={540} text="consola" color={K.flow} size={44} o={dim(sp(2, "consola"))} />
        <Label x={760} y={540} text="robot" color={K.cold} size={44} o={dim(sp(2, "pasos"))} />
        <Label x={540} y={1110} text="a unos pasos de la mesa" color={K.flow} size={44} box o={dim(sp(2, "pasos"))} />
      </Scene>

      {/* 3 · idea clave: unas manos a distancia que copian cada gesto */}
      <Scene {...sc(3)}>
        <Chip text="La idea clave" o={chip(3)} />
        <SVG>
          <g transform={`translate(${290 + 40 * hand} ${800 - 30 * hand}) scale(1.15)`}><Grip grip={0.5 + 0.5 * Math.sin(t * 3)} o={dim(on(3, "manos"))} /></g>
          <path d="M 470 800 L 560 800" stroke={K.white} strokeWidth={8} strokeLinecap="round" opacity={dim(on(3, "copian"))} />
          <path d="M 548 780 L 572 800 L 548 820" fill="none" stroke={K.white} strokeWidth={8} strokeLinecap="round" opacity={dim(on(3, "copian"))} />
          <g transform={`translate(${780 + 14 * hand * on(3, "copian")} ${800 - 10 * hand * on(3, "copian")}) rotate(-30)`}>
            <Wrist len={200} grip={0.5 + 0.5 * Math.sin(t * 3) * on(3, "copian")} bend={-10} o={dim(on(3, "copian"))} hi={on(3, "copian")} />
          </g>
        </SVG>
        <Label x={290} y={540} text="el gesto" color={K.flow} size={44} o={dim(sp(3, "manos"))} />
        <Label x={800} y={540} text="la copia" color={K.cold} size={44} o={dim(sp(3, "copian"))} />
        <Label x={540} y={1110} text="manos a distancia" color={K.flow} size={46} box o={dim(sp(3, "distancia"))} />
      </Scene>

      {/* 4 · primero: cámara doble dentro del cuerpo, una imagen para cada ojo */}
      <Scene {...sc(4)}>
        <Chip text="1 · Los ojos" o={chip(4)} />
        <SVG>
          <g transform="translate(540 650)"><Cavity w={760} h={250} o={dim(on(4, "dentro"))} /></g>
          <g transform={`translate(540 560)`}><StereoCam len={180} cones={on(4, "doble", 0.5) * (0.7 + 0.3 * Math.sin(t * 4))} hi={on(4, "cámara")} /></g>
          <View t={t} x={290} y={960} w={360} h={190} dx={-22} o={dim(on(4, "cada"))} />
          <View t={t} x={750} y={960} w={360} h={190} dx={22} o={dim(on(4, "cada"))} />
        </SVG>
        <Label x={760} y={470} text="cámara doble" color={K.cold} size={42} o={dim(sp(4, "cámara"))} />
        <Label x={290} y={1110} text="ojo izquierdo" color={K.white} size={38} o={dim(sp(4, "cada"))} />
        <Label x={750} y={1110} text="ojo derecho" color={K.white} size={38} o={dim(sp(4, "cada"))} />
      </Scene>

      {/* 5 · juntas: relieve en tres dimensiones y aumentadas */}
      <Scene {...sc(5)}>
        <Chip text="Visión en relieve" o={chip(5)} />
        <SVG>
          <g transform={`translate(540 780) scale(${1 + 0.18 * b5zoom}) translate(-540 -780)`}>
            <View t={t} x={540 - 90 * (1 - b5merge)} y={780} w={640} h={380} dx={-24 * (1 - b5merge)} o={1 - 0.5 * (1 - b5merge)} depth={b5merge} border={b5merge > 0.95 ? K.flow : K.cold} />
            {b5merge < 0.99 && <View t={t} x={540 + 90 * (1 - b5merge)} y={780} w={640} h={380} dx={24 * (1 - b5merge)} o={0.5 * (1 - b5merge)} />}
          </g>
        </SVG>
        <Label x={540} y={470} text="tres dimensiones" color={K.flow} size={46} o={dim(sp(5, "relieve"))} />
        <Label x={540} y={1110} text="imagen aumentada" color={K.cold} size={46} box o={dim(sp(5, "aumentadas"))} />
      </Scene>

      {/* 6 · segundo: el cirujano mueve unos mandos y los brazos repiten cada movimiento */}
      <Scene {...sc(6)}>
        <Chip text="2 · Las manos" o={chip(6)} />
        <SVG>
          <g transform={`translate(${250 + 36 * hand} ${820 - 26 * hand})`}><Grip grip={0.5 + 0.5 * Math.sin(t * 3)} o={dim(on(6, "mandos"))} hi={on(6, "mandos")} /></g>
          <g transform="translate(560 1060) scale(0.62)"><Theatre t={t} move={0.2 + 1.2 * on(6, "repiten")} hi={on(6, "brazos")} /></g>
          <Signal x0={330} y0={700} x1={640} y1={700} t={t} curve={-80} o={on(6, "brazos")} />
        </SVG>
        <Label x={250} y={560} text="mandos" color={K.flow} size={44} o={dim(sp(6, "mandos"))} />
        <Label x={760} y={600} text="brazos" color={K.cold} size={44} o={dim(sp(6, "brazos"))} />
        <Label x={540} y={1110} text="repiten cada movimiento" color={K.flow} size={44} box o={dim(sp(6, "repiten"))} />
      </Scene>

      {/* 7 · cortes pequeños, pinzas con muñeca que se doblan y giran */}
      <Scene {...sc(7)}>
        <Chip text="Pinzas con muñeca" o={chip(7)} />
        <SVG>
          <g transform="translate(540 760) scale(1.15)"><Table ports={on(7, "cortes")} /></g>
          {[-40, 30, 100].map((x, i) => { const px = 540 + 1.15 * x; const py = 760 - 1.15 * 296; return <line key={i} x1={px + (i - 1) * 50} y1={410} x2={px} y2={py - 4 + 30 * on(7, "entran")} stroke={C.steel} strokeWidth={10} strokeLinecap="round" opacity={dim(on(7, "pinzas"))} />; })}
          <g transform="translate(560 950)">
            <Wrist len={380} bend={-40 * b7bend * (0.5 + 0.5 * Math.sin(t * 2.4))} roll={t * 80 * b7roll} grip={0.5 + 0.5 * Math.sin(t * 3)} o={dim(on(7, "muñeca"))} hi={on(7, "muñeca")} />
          </g>
          <circle cx={560} cy={950} r={46} fill="none" stroke={K.flow} strokeWidth={4} strokeDasharray="8 8" opacity={on(7, "muñeca")} />
        </SVG>
        <Label x={540} y={1110} text="cortes pequeños" color={K.white} size={44} box o={lab(Wd(7, "cortes"), Wd(7, "muñeca"))} />
        <Label x={540} y={1110} text="la muñeca se dobla y gira" color={K.flow} size={44} box o={lab2(Wd(7, "muñeca"), E(7))} />
      </Scene>

      {/* 8 · tercero: el temblor se filtra antes de mover la pinza */}
      <Scene {...sc(8)}>
        <Chip text="3 · Sin temblor" o={chip(8)} />
        <SVG>
          <Trace x0={120} x1={960} y={580} t={t} noise={1} color={C.red} amp={50} o={dim(on(8, "tiembla"))} />
          <rect x={360} y={710} width={360} height={110} rx={22} fill={C.dark} stroke={b8filt > 0.01 ? K.flow : C.case3} strokeWidth={6} />
          <path d="M 540 640 L 540 700 M 540 830 L 540 890" stroke={K.white} strokeWidth={8} strokeLinecap="round" opacity={dim(b8filt)} />
          <Trace x0={120} x1={960} y={970} t={t} noise={1 - b8filt} color={K.flow} amp={50} o={dim(b8filt)} />
        </SVG>
        <Label x={540} y={470} text="la mano tiembla un poco" color="#FF8A80" size={42} o={dim(sp(8, "tiembla"))} />
        <Label x={540} y={765} text="filtro" color={K.flow} size={48} o={dim(sp(8, "ordenador"))} />
        <Label x={540} y={1110} text="la pinza, sin temblor" color={K.flow} size={44} box o={dim(sp(8, "filtra"))} />
      </Scene>

      {/* 9 · cuarto: la escala, la mano tres centímetros y la pinza uno */}
      <Scene {...sc(9)}>
        <Chip text="4 · La escala" o={chip(9)} />
        <SVG>
          <Ruler x={180} y={640} cm={4} u={180} t={t} len={3 * b9go} color={K.flow} o={dim(on(9, "mano"))} />
          <Ruler x={180} y={940} cm={4} u={180} t={t} len={1 * b9tip} color={K.cold} o={dim(on(9, "pinza"))} />
        </SVG>
        <Label x={540} y={520} text="mano: 3 cm" color={K.flow} size={48} o={dim(sp(9, "tres"))} />
        <Label x={540} y={820} text="pinza: 1 cm" color={K.cold} size={48} o={dim(sp(9, "pinza"))} />
        <Label x={540} y={1110} text="tres a uno" color={K.white} size={46} box o={dim(sp(9, "moverse"))} />
      </Scene>

      {/* 10 · curiosidad: para la agencia sanitaria de EE. UU. no es un robot: sin una persona no opera */}
      <Scene {...sc(10)}>
        <Chip text="Curiosidad" o={chip(10)} />
        <SVG>
          <Doc x={270} y={740} s={0.85} o={dim(on(10, "agencia"))} />
          <g transform="translate(730 1000) scale(0.42)"><Robot t={t} move={0.15} /></g>
          <g transform="translate(570 1000) scale(0.55)" opacity={dim(on(10, "persona"))}><Console t={t} hands={on(10, "persona")} eyes={on(10, "persona")} hi={on(10, "persona")} /></g>
        </SVG>
        <Label x={540} y={470} text="agencia sanitaria (EE. UU.)" color={K.white} size={40} o={dim(sp(10, "agencia"))} />
        <Label x={540} y={1110} text="sin una persona, no opera" color={K.flow} size={44} box o={dim(sp(10, "persona"))} />
      </Scene>

      {/* 11 · otra: en 1985 un brazo de fábrica guio una aguja en una biopsia del cerebro */}
      <Scene {...sc(11)}>
        <Chip text="Otra curiosidad" o={chip(11)} />
        <SVG>
          <g transform="translate(220 1020)"><FactoryArm t={t} o={dim(on(11, "brazo"))} hi={on(11, "fábricas")} /></g>
          <g transform="translate(790 820) scale(0.95)"><Head o={dim(on(11, "biopsia"))} target={on(11, "cerebro")} /></g>
          <line x1={520} y1={760} x2={520 + (808 - 520) * b11needle} y2={760 + (763 - 760) * b11needle} stroke={C.steel} strokeWidth={6} strokeLinecap="round" opacity={dim(on(11, "ayudó"))} />
        </SVG>
        <Label x={540} y={470} text="1985" color={K.flow} size={60} o={dim(sp(11, "1985"))} />
        <Label x={300} y={600} text="brazo de fábrica" color={K.hot} size={40} o={dim(sp(11, "fábricas"))} />
        <Label x={540} y={1110} text="biopsia guiada del cerebro" color={K.white} size={42} box o={dim(sp(11, "biopsia"))} />
      </Scene>

      {/* 12 · y otra: 2001, de Nueva York a Estrasburgo (Operación Lindbergh) */}
      <Scene {...sc(12)}>
        <Chip text="Y otra" o={chip(12)} />
        <SVG><Atlantic t={t} arc={on(12, "operaron", 0.6)} /></SVG>
        <Label x={540} y={430} text="2001 · «Operación Lindbergh»" color={K.white} size={40} o={dim(sp(12, "2001"))} />
        <Label x={240} y={820} text="Nueva York" color={K.flow} size={38} o={dim(sp(12, "Nueva"))} />
        <Label x={820} y={600} text="Estrasburgo" color={K.flow} size={38} o={dim(sp(12, "Estrasburgo"))} />
        <Label x={540} y={1110} text="cruzando el Atlántico" color={K.cold} size={44} box o={dim(sp(12, "operaron"))} />
      </Scene>

      {/* 13 · cierre */}
      <Scene {...sc(13)}>
        <Chip text="En resumen" o={chip(13)} />
        <SVG>
          <g transform="translate(340 1060) scale(0.9)"><Console t={t} hi={on(13, "siempre")} hands={1} eyes={1} /></g>
          <g transform="translate(545 1060) scale(0.75)"><Theatre t={t} /></g>
          <Signal x0={420} y0={640} x1={560} y1={720} t={t} curve={-120} />
        </SVG>
        <Label x={220} y={470} text="3D" color={K.cold} size={40} o={dim(sp(13, "Visión"))} />
        <Label x={540} y={470} text="copia" color={K.white} size={40} o={dim(sp(13, "manos"))} />
        <Label x={850} y={470} text="sin temblor" color={K.flow} size={40} o={dim(sp(13, "temblor"))} />
        <Label x={540} y={1110} text="un cirujano al mando" color={K.flow} size={46} box o={dim(sp(13, "siempre"))} />
      </Scene>

      <Stamp x={540} y={1110} text="¡FALSO!" p={ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.3) * (t < scene(1)[1] ? 1 : 0)} />
      <Stamp x={540} y={560} size={46} text="¿ROBOT? NO" p={ramp(t, Wd(10, "robot"), Wd(10, "robot") + 0.3) * (t < scene(10)[1] ? 1 : 0) * (t > scene(10)[0] ? 1 : 0)} />
      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
