// Episodio 164 · Cómo funciona un purificador de aire (filtro HEPA).
// Cada beat es una <Scene> con su dibujo y 1-3 etiquetas. Cambios atados a palabras con Wd(beat, "palabra").
// Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { C, Purifier, GapView, Room, PreMesh, HepaFold, Trap, EscapeChart, Result, Carbon, Rooms, Lab, FilterCard, Curtain } from "./Purificador";

export const COMP_ID = "Purificador";
export const HOOK = "Más pequeño que sus huecos"; // = meta.portada (≤5 palabras, la última va en amarillo)
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
  /** avance en bucle de la partícula protagonista: viaja `go` s, se queda `stay` s y vuelve a empezar (desde t0). */
  const loop = (t0: number, go = 1.6, stay = 0.9) => { const k = t - t0; if (k < 0) return 0; const m = k % (go + stay); return Math.min(1, m / go); };

  // ---- tiempos clave
  const b1sieve = on(1, "colador", 0.4);
  const b1open = ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.7);
  const b13open = ramp(t, S(13) + 0.1, S(13) + 0.8);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el purificador GRANDE desde el fotograma 0; con «colador» aparecen los agujeros que todos imaginan; con «equivocados» se abre la tapa */}
      <Scene {...sc(1)}>
        <SVG><g transform={`translate(540 770) scale(${1 + 0.01 * Math.sin(t * 2)}) translate(-540 -770)`}>
          <Purifier x={540} y={770} s={1.04} t={t} sieve={b1sieve} open={b1open} hiHepa={b1open} />
        </g></SVG>
        <Label x={540} y={1110} text="dentro: filtros que cazan" color={K.flow} size={44} box o={span(t, Wd(1, "equivocados") + 0.6, E(1))} />
      </Scene>

      {/* 2 · la promesa: atrapa partículas más pequeñas que sus huecos; no las frena por tamaño, se le pegan */}
      <Scene {...sc(2)}>
        <Chip text="No es un colador" o={chip(2)} />
        <SVG><GapView x={540} y={760} r={300} t={t} catchP={dim(on(2, "pegan", 1.2))} gapHi={dim(sp(2, "huecos", Wd(2, "frena")))} /></SVG>
        <Label x={540} y={420} text="hueco > partícula" color={K.flow} size={46} o={dim(sp(2, "huecos"))} />
        <Label x={540} y={1110} text="se quedan pegadas" color={K.white} size={46} box o={dim(sp(2, "pegan"))} />
      </Scene>

      {/* 3 · idea clave: un ventilador aspira el aire del cuarto y lo empuja por filtros */}
      <Scene {...sc(3)}>
        <Chip text="La idea clave" o={chip(3)} />
        <SVG><Room x={540} y={740} t={t} hiIn={on(3, "aspira")} hiOut={on(3, "empuja")} /></SVG>
        <Label x={540} y={1110} text="aspira aire sucio" color={C.part} size={44} box o={lab(Wd(3, "aspira"), Wd(3, "empuja"))} />
        <Label x={540} y={1110} text="lo devuelve filtrado" color={K.cold} size={44} box o={span(t, Wd(3, "empuja") + 0.3, E(3))} />
      </Scene>

      {/* 4 · primero: el prefiltro, una malla que frena pelos, pelusas y polvo gordo */}
      <Scene {...sc(4)}>
        <Chip text="1 · Prefiltro" o={chip(4)} />
        <SVG><PreMesh x={560} y={740} t={t} hair={dim(on(4, "pelos"))} lint={dim(on(4, "pelusas"))} dust={dim(on(4, "polvo"))} fine={dim(on(4, "malla"))} /></SVG>
        <Label x={250} y={450} text="pelos" color={C.hair} size={40} o={dim(sp(4, "pelos"))} />
        <Label x={250} y={700} text="pelusas" color={C.fiber} size={40} o={dim(sp(4, "pelusas"))} />
        <Label x={250} y={1110} text="polvo gordo" color={C.part} size={40} o={dim(sp(4, "polvo"))} />
      </Scene>

      {/* 5 · segundo: el HEPA, una maraña de fibras finísimas plegada en acordeón */}
      <Scene {...sc(5)}>
        <Chip text="2 · Filtro HEPA" o={chip(5)} />
        <SVG><HepaFold x={540} yZoom={660} yPleat={1010} t={t} fold={ramp(t, Wd(5, "plegada"), Wd(5, "acordeón") + 0.4)} tangleHi={on(5, "maraña")} zoomO={dim(on(5, "maraña"))} /></SVG>
        <Label x={540} y={405} text="fibras de vidrio o plástico" color={K.flow} size={40} o={dim(sp(5, "fibras"))} />
        <Label x={540} y={1110} text="plegado = más filtro" color={K.white} size={42} box o={dim(sp(5, "plegada"))} />
      </Scene>

      {/* 6 · tercero: tres trampas (choque, roce, zigzag) */}
      <Scene {...sc(6)}>
        <Chip text="3 · Tres trampas" o={chip(6)} />
        <SVG>
          <Trap x={600} y={500} t={t} mode="impact" p={loop(Wd(6, "grandes"))} o={dim(on(6, "grandes"))} hi={sp(6, "grandes", Wd(6, "medianas"))} />
          <Trap x={600} y={750} t={t} mode="intercept" p={loop(Wd(6, "medianas"), 1.8)} o={dim(on(6, "medianas"))} hi={sp(6, "medianas", Wd(6, "diminutas"))} />
          <Trap x={600} y={1000} t={t} mode="diffuse" p={loop(Wd(6, "diminutas"), 2.2)} o={dim(on(6, "diminutas"))} hi={sp(6, "diminutas")} />
        </SVG>
        <Label x={160} y={500} text="choque" color={K.white} size={38} o={dim(sp(6, "grandes"))} />
        <Label x={160} y={750} text="roce" color={K.white} size={38} o={dim(sp(6, "medianas"))} />
        <Label x={160} y={1000} text="zigzag" color={K.white} size={38} o={dim(sp(6, "diminutas"))} />
      </Scene>

      {/* 7 · ojo: las más difíciles no son las diminutas; rondan las tres décimas de micra o menos */}
      <Scene {...sc(7)}>
        <Chip text="La más escurridiza" o={chip(7)} />
        <SVG><EscapeChart x0={140} x1={930} y0={500} y1={960} draw={dim(ramp(t, S(7) + 0.2, Wd(7, "diminutas") + 0.4))} peak={dim(on(7, "rondan"))} /></SVG>
        <Label x={250} y={465} text="se escapan más" color={K.warn} size={36} o={dim(span(t, S(7) + 0.3, E(7)))} />
        <Label x={700} y={455} text="≈ 0,3 µm o menos" color={K.flow} size={44} box o={dim(sp(7, "rondan"))} />
      </Scene>

      {/* 8 · resultado: un H13 retiene al menos el 99,95 % (medido con las más escurridizas) */}
      <Scene {...sc(8)}>
        <Chip text="Resultado" o={chip(8)} />
        <SVG><Result x={640} y={760} t={t} p={ramp(t, Wd(8, "retiene"), Wd(8, "noventa") + 1)} /></SVG>
        <Label x={540} y={430} text="H13: al menos 99,95 %" color={K.flow} size={56} o={dim(sp(8, "noventa"))} />
        <Label x={330} y={1080} text="de 10.000 entran" color={C.part} size={36} box o={dim(sp(8, "retiene"))} />
        <Label x={770} y={1080} text="pasan ≤ 5" color={K.warn} size={36} box o={dim(sp(8, "noventa"))} />
      </Scene>

      {/* 9 · cuarto: carbón activo, poros donde se pegan moléculas de gases; ayuda con olores */}
      <Scene {...sc(9)}>
        <Chip text="4 · Carbón activo" o={chip(9)} />
        <SVG><Carbon x={540} y={760} t={t} stick={dim(on(9, "pegan", 1.5))} pores={dim(on(9, "poros"))} /></SVG>
        <Label x={540} y={430} text="poros diminutos" color={K.white} size={44} o={dim(sp(9, "poros"))} />
        <Label x={540} y={1110} text="se pegan los gases" color={C.odor} size={44} box o={lab(Wd(9, "pegan"), Wd(9, "ayuda"))} />
        <Label x={540} y={1110} text="ayuda con olores" color={K.flow} size={46} box o={span(t, Wd(9, "ayuda") + 0.3, E(9))} />
      </Scene>

      {/* 10 · la cifra que manda: CADR, aire limpio por hora; cuarto grande → más */}
      <Scene {...sc(10)}>
        <Chip text="La cifra: CADR" o={chip(10)} />
        <SVG><Rooms t={t} t0={Wd(10, "tasa")} boost={on(10, "necesitas", 0.8)} y={760} /></SVG>
        <Label x={540} y={430} text="m³ de aire limpio / hora" color={K.cold} size={44} o={dim(sp(10, "tasa"))} />
        <Label x={720} y={1030} text="cuarto grande" color={C.case3} size={34} o={dim(sp(10, "grande"))} />
        <Label x={720} y={1100} text="más CADR" color={K.flow} size={42} box o={dim(sp(10, "necesitas"))} />
      </Scene>

      {/* 11 · curiosidad: en los años 40, el Proyecto Manhattan ya usaba estos filtros contra partículas radiactivas */}
      <Scene {...sc(11)}>
        <Chip text="Curiosidad" o={chip(11)} />
        <SVG><Lab x={560} y={760} t={t} filt={dim(on(11, "frenar"))} /></SVG>
        <Label x={300} y={480} text="años 40" color={K.flow} size={64} o={dim(sp(11, "años"))} />
        <Label x={420} y={1110} text="partículas radiactivas" color={K.flow} size={42} box o={dim(sp(11, "radiactivas"))} />
      </Scene>

      {/* 12 · truco: cambia el filtro cuando diga el fabricante y no tapes entrada ni salida */}
      <Scene {...sc(12)}>
        <Chip text="Truco" o={chip(12)} />
        <SVG>
          <FilterCard x={210} y={690} s={0.62} dirty={1} o={dim(on(12, "cambia"))} />
          <FilterCard x={400} y={690} s={0.62} dirty={0} o={dim(on(12, "fabricante"))} />
          <path d="M 270 690 l 60 0 m -18 -16 l 18 16 l -18 16" fill="none" stroke={K.flow} strokeWidth={7} strokeLinecap="round" opacity={dim(on(12, "fabricante"))} />
          <Purifier x={760} y={700} s={0.5} t={t} blocked={on(12, "tapes")} />
          <Curtain x={760} y={700} h={400} o={0.3 * dim(on(12, "tapes"))} />
          {/* aspa roja sobre la cortina */}
          <g stroke={K.warn} strokeWidth={14} strokeLinecap="round" opacity={on(12, "tapes")}>
            <line x1={640} y1={540} x2={880} y2={860} /><line x1={880} y1={540} x2={640} y2={860} />
          </g>
        </SVG>
        <Label x={305} y={1010} text="cambia el filtro" color={K.white} size={38} box o={dim(sp(12, "cambia"))} />
        <Label x={760} y={420} text="¡no lo tapes!" color={K.warn} size={42} box o={dim(sp(12, "tapes"))} />
        <Label x={540} y={1110} text="deja libre entrada y salida" color={K.cold} size={40} box o={dim(sp(12, "entrada"))} />
      </Scene>

      {/* 13 · cierre */}
      <Scene {...sc(13)}>
        <SVG><Purifier x={540} y={760} s={0.92} t={t} open={b13open} hiFan={on(13, "ventilador")} hiHepa={on(13, "maraña")} hiCarbon={on(13, "carbón")} /></SVG>
        <Chip text="En resumen" o={chip(13)} />
        <Label x={215} y={571} text="ventilador" color={K.flow} size={38} box o={dim(sp(13, "ventilador"))} />
        <Label x={830} y={820} text="caza" color={K.flow} size={40} box o={dim(sp(13, "caza"))} />
        <Label x={540} y={1110} text="aire más limpio" color={K.cold} size={44} box o={dim(sp(13, "aire"))} />
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
