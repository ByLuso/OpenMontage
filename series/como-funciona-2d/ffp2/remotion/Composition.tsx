// Episodio 140 · Cómo filtra una mascarilla FFP2 partículas más pequeñas que sus huecos (ESPECIAL HOSPITAL).
// Cada beat es una <Scene> con su dibujo y 1-3 etiquetas. Cambios atados a palabras con Wd(beat, "palabra").
// Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { C, Part, Mask, Head, FiberZoom, FiberMesh, MppsChart, Hundred, Tap, Bubbles, rnd } from "./Ffp2";

export const COMP_ID = "Ffp2";
export const HOOK = "No es un colador"; // = meta.portada (≤5 palabras, la última va en amarillo)
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
  const on = (i: number, w: string, d = 0.4) => ramp(t, Wd(i, w), Wd(i, w) + d);
  /** avance en bucle de la partícula protagonista: viaja durante `go` s, se queda pegada `stay` s y vuelve a empezar (desde la palabra w). */
  const loop = (i: number, w: string, go = 1.8, stay = 1.0) => { const k = t - Wd(i, w); if (k < 0) return 0; const m = k % (go + stay); return Math.min(1, m / go); };

  // ---- tiempos clave
  const b1sieve = on(1, "colador", 0.4);
  const b1open = ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.7);
  const b3open = ramp(t, S(3) + 0.1, S(3) + 0.8);
  const b8p = ramp(t, Wd(8, "filtre"), Wd(8, "noventa") + 0.8);
  const b9gap = ramp(t, Wd(9, "holgada"), Wd(9, "holgada") + 0.5);
  const b10draw = ramp(t, S(10) + 0.2, Wd(10, "pequeña") + 0.3);
  const b11wash = ramp(t, Wd(11, "agua"), Wd(11, "quita") + 0.8);
  const breathe = (t % 3) / 3; // 0-0,5 inspira, 0,5-1 espira
  const b13hi = t < Wd(13, "fibras") ? 0 : 1;

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: la mascarilla GRANDE desde el fotograma 0; con «colador» aparecen los «agujeros» que todos imaginan; con «equivocados» se abre en capas */}
      <Scene {...sc(1)}>
        <SVG><g transform={`translate(540 760) scale(${1 + 0.012 * Math.sin(t * 2)}) translate(-540 -760)`}>
          <Mask x={540} y={760} s={1.05} t={t} sieve={b1sieve} open={b1open} meltHi={b1open} />
        </g></SVG>
        <Label x={540} y={1110} text="dentro: una maraña de fibras" color={K.flow} size={44} box o={span(t, Wd(1, "equivocados") + 0.6, E(1))} />
      </Scene>

      {/* 2 · la promesa: sus huecos son más grandes que muchas partículas; no las cuela, las caza */}
      <Scene {...sc(2)}>
        <Chip text="No es un colador" o={chip(2)} />
        <SVG>
          <FiberMesh x={540} y={770} r={300} t={t} catchP={dim(on(2, "caza"))} gapHi={sp(2, "huecos", Wd(2, "No"))} />
        </SVG>
        <Label x={540} y={430} text="hueco > partícula" color={K.flow} size={44} o={dim(sp(2, "huecos"))} />
        <Label x={540} y={1120} text="no las cuela: las caza" color={K.white} size={46} box o={dim(sp(2, "cuela"))} />
      </Scene>

      {/* 3 · idea clave: en medio, plástico fundido y soplado: una maraña de fibras finísimas */}
      <Scene {...sc(3)}>
        <Chip text="La idea clave" o={chip(3)} />
        <SVG>
          <Mask x={540} y={720} s={0.95} t={t} open={0.4 + 0.6 * b3open} meltHi={on(3, "plástico")} charge={0} />
        </SVG>
        <Label x={250} y={1000} text="capa exterior" color={C.case3} size={34} o={dim(span(t, S(3) + 0.4, E(3)))} />
        <Label x={800} y={455} text="capa interior" color={C.case3} size={34} o={dim(span(t, S(3) + 0.4, E(3)))} />
        <Label x={540} y={1110} text="plástico fundido y soplado" color={K.flow} size={44} box o={lab(Wd(3, "plástico"), Wd(3, "maraña"))} />
        <Label x={540} y={1110} text="fibras finísimas" color={K.flow} size={46} box o={span(t, Wd(3, "maraña") + 0.3, E(3))} />
      </Scene>

      {/* 4 · primero: impacto. Las grandes no giran con el aire y se estampan */}
      <Scene {...sc(4)}>
        <Chip text="1 · Impacto" o={chip(4)} />
        <SVG><FiberZoom x={540} y={730} t={t} mode="impact" p={loop(4, "grandes", 1.6, 1.0)} hi={on(4, "estampan")} /></SVG>
        <Label x={250} y={460} text="aire" color={K.cold} size={40} o={dim(span(t, S(4) + 0.2, E(4)))} />
        <Label x={540} y={1110} text="la grande sigue recto" color={K.white} size={42} box o={lab(Wd(4, "grandes"), Wd(4, "estampan"))} />
        <Label x={540} y={1110} text="¡y se estampa!" color={K.flow} size={46} box o={span(t, Wd(4, "estampan") + 0.3, E(4))} />
      </Scene>

      {/* 5 · segundo: intercepción. Siguen al aire pero rozan la fibra y se pegan */}
      <Scene {...sc(5)}>
        <Chip text="2 · Intercepción" o={chip(5)} />
        <SVG><FiberZoom x={540} y={730} t={t} mode="intercept" p={loop(5, "siguen", 2.0, 1.0)} hi={on(5, "pegan")} /></SVG>
        <Label x={540} y={1110} text="sigue al aire…" color={K.cold} size={42} box o={lab(Wd(5, "siguen"), Wd(5, "cerca"))} />
        <Label x={540} y={1110} text="la roza y se pega" color={K.flow} size={46} box o={span(t, Wd(5, "cerca") + 0.3, E(5))} />
      </Scene>

      {/* 6 · tercero: difusión. Las diminutas van en zigzag (movimiento browniano) y tocan una fibra */}
      <Scene {...sc(6)}>
        <Chip text="3 · Difusión" o={chip(6)} />
        <SVG><FiberZoom x={540} y={730} t={t} mode="diffuse" p={loop(6, "diminutas", 2.6, 1.0)} hi={on(6, "tocan")} /></SVG>
        <Label x={540} y={1110} text="zigzag" color={K.white} size={46} box o={lab(Wd(6, "zigzag"), Wd(6, "tocan"))} />
        <Label x={540} y={1110} text="toca la fibra" color={K.flow} size={46} box o={span(t, Wd(6, "tocan") + 0.3, E(6))} />
      </Scene>

      {/* 7 · cuarto: electricidad estática. Fibras cargadas que atraen partículas como un globo frotado */}
      <Scene {...sc(7)}>
        <Chip text="4 · Electricidad estática" o={chip(7)} />
        <SVG><FiberZoom x={540} y={730} t={t} mode="electro" p={loop(7, "atraen", 1.8, 1.0)} charge={dim(on(7, "cargadas"))} hi={on(7, "atraen")} /></SVG>
        <Label x={540} y={1110} text="fibras cargadas" color={K.flow} size={44} box o={lab(Wd(7, "cargadas"), Wd(7, "globo"))} />
        <Label x={540} y={1110} text="como un globo frotado" color={K.flow} size={44} box o={span(t, Wd(7, "globo") + 0.3, E(7))} />
      </Scene>

      {/* 8 · resultado: la norma exige filtrar al menos el 94 % */}
      <Scene {...sc(8)}>
        <Chip text="Resultado" o={chip(8)} />
        <SVG><Hundred xBar={560} y={760} p={b8p} t={t} /></SVG>
        <Label x={540} y={430} text="al menos 94 %" color={K.flow} size={64} o={dim(sp(8, "noventa"))} />
        <Label x={300} y={1110} text="se quedan" color={C.part} size={40} box o={dim(sp(8, "filtre"))} />
        <Label x={800} y={1110} text="6 % o menos" color={K.warn} size={40} box o={dim(sp(8, "noventa"))} />
      </Scene>

      {/* 9 · pero si queda holgada, el aire se cuela por los bordes sin pasar por el filtro */}
      <Scene {...sc(9)}>
        <Chip text="El ajuste" o={chip(9)} />
        <SVG>
          <Head x={420} y={640} s={1.12} gap={b9gap} hi={on(9, "filtro")} />
          {/* aire que entra a través del filtro (cian) */}
          {[0, 1, 2, 3].map((i) => { const u = (t * 0.5 + i / 4) % 1; return <circle key={i} cx={990 - 520 * u} cy={700 + 26 * (i - 1.5)} r={9} fill={K.cold} opacity={Math.sin(Math.PI * u) * (1 - 0.6 * b9gap)} />; })}
          {/* fugas por los bordes (rojo) cuando queda holgada */}
          {b9gap > 0.01 && [0, 1].map((k) => [0, 1, 2].map((i) => {
            const u = (t * 0.6 + i / 3) % 1; const yy = k === 0 ? 615 : 820; const dir = k === 0 ? 1 : -1;
            return <Part key={`${k}${i}`} x={900 - 470 * u} y={yy + dir * 50 * Math.sin(Math.PI * u) * 0} r={11} col={K.warn} o={b9gap * Math.sin(Math.PI * u)} />;
          }))}
          {b9gap > 0.01 && (
            <g stroke={K.warn} strokeWidth={8} fill="none" strokeLinecap="round" opacity={b9gap}>
              <path d="M 640 590 C 560 590 510 610 450 640" /><path d="M 450 640 l 26 -4 M 450 640 l 14 -22" />
              <path d="M 640 850 C 560 850 520 830 470 800" /><path d="M 470 800 l 26 6 M 470 800 l 8 24" />
            </g>
          )}
        </SVG>
        <Label x={780} y={470} text="holgada" color={K.warn} size={44} o={dim(sp(9, "holgada"))} />
        <Label x={540} y={1110} text="se cuela por los bordes" color={K.warn} size={44} box o={dim(sp(9, "cuela"))} />
      </Scene>

      {/* 10 · curiosidad: la más difícil de atrapar no es la más pequeña: ≈0,3 micras */}
      <Scene {...sc(10)}>
        <Chip text="Curiosidad" o={chip(10)} />
        <SVG><MppsChart x0={140} x1={940} y0={470} y1={980} draw={dim(b10draw)} peak={dim(on(10, "ronda"))} /></SVG>
        <Label x={250} y={1030} text="diminutas" color={C.case3} size={34} o={dim(span(t, S(10) + 0.3, E(10)))} />
        <Label x={830} y={1030} text="grandes" color={C.case3} size={34} o={dim(span(t, S(10) + 0.3, E(10)))} />
        <Label x={300} y={460} text="se escapan más" color={K.warn} size={36} o={dim(span(t, S(10) + 0.3, E(10)))} />
        <Label x={720} y={560} text="≈ 0,3 micras" color={K.flow} size={50} box o={dim(sp(10, "ronda"))} />
        <Label x={540} y={1110} text="la más difícil" color={K.white} size={44} box o={dim(span(t, Wd(10, "difícil"), E(10)))} />
      </Scene>

      {/* 11 · otra: lavarla la estropea; el agua con jabón le quita la carga eléctrica */}
      <Scene {...sc(11)}>
        <Chip text="Otra curiosidad" o={chip(11)} />
        <SVG>
          <Tap x={540} y={590} t={t} flow={dim(on(11, "lavarla"))} />
          <Mask x={540} y={850} s={0.7} t={t} charge={1 - b11wash} />
          <Bubbles x={540} y={950} w={420} t={t} o={dim(on(11, "jabón"))} />
        </SVG>
        <Label x={540} y={1050} text="pierde la carga" color={K.flow} size={44} box o={dim(span(t, Wd(11, "quita"), E(11)))} />
        <Label x={540} y={1125} text="y filtra peor" color={K.warn} size={40} o={dim(span(t, Wd(11, "filtra"), E(11)))} />
      </Scene>

      {/* 12 · ojo: con válvula el aire que entra se filtra, pero el que sueltas sale sin filtrar */}
      <Scene {...sc(12)}>
        <Chip text="Ojo con la válvula" color={K.warn} o={chip(12)} />
        <SVG>
          <Head x={250} y={640} s={0.82} valve />
          <Head x={820} y={640} s={0.82} flip mask={false} />
          {/* inspira: aire que entra por el filtro (cian) */}
          {breathe < 0.5 && [0, 1, 2].map((i) => { const u = (breathe * 2 + i / 3) % 1; return <circle key={i} cx={560 - 180 * u} cy={660 + 30 * (i - 1)} r={9} fill={K.cold} opacity={Math.sin(Math.PI * u) * dim(on(12, "entra"))} />; })}
          {/* espira: sale por la válvula sin filtrar (rojo) hacia la otra persona */}
          {breathe >= 0.5 && [0, 1, 2, 3].map((i) => { const u = ((breathe - 0.5) * 2 + i / 4) % 1; return <Part key={i} x={380 + 300 * u} y={715 + 20 * Math.sin(u * 8 + i)} r={10} col={K.warn} o={Math.sin(Math.PI * u) * dim(on(12, "sueltas"))} />; })}
        </SVG>
        <Label x={420} y={480} text="entra filtrado" color={K.cold} size={40} o={dim(sp(12, "entra"))} />
        <Label x={540} y={1110} text="sale sin filtrar" color={K.warn} size={46} box o={dim(sp(12, "sueltas"))} />
      </Scene>

      {/* 13 · cierre */}
      <Scene {...sc(13)}>
        <Chip text="En resumen" o={chip(13)} />
        <SVG>
          <Mask x={540} y={730} s={0.8} t={t} open={0.6 * b13hi} charge={b13hi} meltHi={b13hi} />
        </SVG>
        <Label x={540} y={450} text="fibras cargadas" color={K.flow} size={44} o={dim(sp(13, "fibras"))} />
        <Label x={300} y={1020} text="4 trampas" color={K.white} size={42} box o={dim(sp(13, "cuatro"))} />
        <Label x={720} y={1110} text="buen ajuste" color={K.cold} size={42} box o={dim(sp(13, "ajuste"))} />
      </Scene>

      <Stamp x={540} y={520} text="¡FALSO!" p={ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.3) * (t < scene(1)[1] ? 1 : 0)} />
      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
void rnd; void C;
