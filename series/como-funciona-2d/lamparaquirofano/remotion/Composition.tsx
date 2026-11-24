// Episodio 163 · Cómo funciona la lámpara del quirófano (la luz que no hace sombras) (ESPECIAL HOSPITAL). Sin marcas.
// Cada beat es una <Scene> con su dibujo y 1-3 etiquetas. Cambios atados a palabras con Wd(beat, "palabra").
// Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok). Sin consejos médicos.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { C, Dome, DomeBelow, Beams, Table, Hand, Head, Bulb, PointLight, Spectrum, Swatches, Sun, OldRoom, OldLamp, ledXs } from "./LamparaQuirofano";

export const COMP_ID = "LamparaQuirofano";
export const HOOK = "La luz casi sin sombra"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);

// Cúpula de lado estándar (beats 3, 5, 12): cara inferior en (540, 560), mesa en (540, 960).
const DX = 540, DY = 560, DW = 560, DN = 13, TY = 912;
const XS = ledXs(DW, DN);

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
  const sway = Math.sin(t * 1.4);

  // ---- tiempos clave
  const b1open = on(1, "conoce", 0.6);
  const b1hand = on(1, "mano", 0.6);
  const b5head = on(5, "cabeza", 0.5);
  const b5hand = on(5, "mano", 0.5);
  const b6min = on(6, "cuarenta", 0.6);
  const b6max = on(6, "ciento", 0.9);
  const b6off = on(6, "oficina", 0.4);
  const b8day = on(8, "día", 0.7);
  const b9move = on(9, "mueva", 0.5);

  // obstáculos (círculos) para cortar rayos
  const hand1 = { x: 560 + 340 * (1 - b1hand), y: 760, r: 52 };
  const head5 = { x: 400 - 300 * (1 - b5head), y: 730, r: 50 };
  const hand5 = { x: 640 + 300 * (1 - b5hand), y: 790, r: 44 };
  const hand12 = { x: 590 + 18 * sway, y: 780, r: 46 };

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: la cúpula GRANDE desde el fotograma 0; con «conoce» la carcasa se levanta y se ven los led; con «mano» entra una mano y casi no hay sombra */}
      <Scene {...sc(1)}>
        <SVG>
          <g transform="translate(540 960) scale(0.85)"><Table /></g>
          <Beams x0={540} y0={548} xs={ledXs(660, 15)} tx={540} ty={TY + 2} t={t} o={0.25 + 0.75 * b1open} obst={b1hand > 0.01 ? [hand1] : []} />
          <g transform={`translate(540 560) scale(${1 + 0.01 * Math.sin(t * 2)})`}><Dome w={660} n={15} t={t} open={b1open} glow={0.4 + 0.6 * b1open} arm={160} /></g>
          <g transform={`translate(${hand1.x} ${hand1.y})`}><Hand o={b1hand} s={0.9} glove /></g>
        </SVG>
      </Scene>

      {/* 2 · la promesa: bombilla = sombra negra; lámpara del quirófano = mancha suave */}
      <Scene {...sc(2)}>
        <SVG>
          <line x1={80} y1={960} x2={500} y2={960} stroke={C.case3} strokeWidth={5} />
          <line x1={580} y1={960} x2={1000} y2={960} stroke={C.case3} strokeWidth={5} />
          <PointLight x={280} y={540} floorY={958} t={t} obst={{ x: 290, y: 760, r: 48 }} o={dim(on(2, "bombilla"))} />
          <g transform="translate(280 540)"><Bulb t={t} o={dim(on(2, "bombilla"))} /></g>
          <g transform="translate(290 760)"><Hand s={0.75} o={dim(on(2, "mano"))} glove /></g>
          <Beams x0={790} y0={548} xs={ledXs(380, 9)} tx={790} ty={958} t={t} obst={[{ x: 800, y: 760, r: 40 }]} o={dim(on(2, "quirófano"))} />
          <g transform="translate(790 560)"><Dome w={380} n={9} t={t} arm={120} glow={on(2, "quirófano")} /></g>
          <g transform="translate(800 760)"><Hand s={0.75} o={dim(on(2, "quirófano"))} glove /></g>
        </SVG>
        <Chip text="Una bombilla vs. el quirófano" o={chip(2)} />
        <Label x={280} y={1030} text="sombra negra" color="#FF8A80" size={42} o={dim(sp(2, "negra"))} />
        <Label x={770} y={1030} text="mancha suave" color={K.flow} size={42} o={dim(sp(2, "apenas"))} />
      </Scene>

      {/* 3 · idea clave: muchas luces pequeñas al mismo punto desde ángulos distintos */}
      <Scene {...sc(3)}>
        <SVG>
          <g transform="translate(540 960) scale(0.85)"><Table /></g>
          <Beams x0={DX} y0={DY - 12} xs={XS} tx={DX} ty={TY} t={t} o={dim(on(3, "apuntan"))} />
          <g transform={`translate(${DX} ${DY})`}><Dome w={DW} n={DN} t={t} arm={110} glow={dim(on(3, "luces"))} /></g>
          <circle cx={DX} cy={TY} r={20 + 6 * Math.sin(t * 5)} fill="none" stroke={K.flow} strokeWidth={5} opacity={on(3, "punto")} />
        </SVG>
        <Chip text="La idea clave" o={chip(3)} />
        <Label x={540} y={720} text="ángulos distintos" color={K.flow} size={42} box o={dim(sp(3, "ángulos"))} />
        <Label x={540} y={1110} text="muchas luces, un mismo punto" color={K.white} size={44} box o={dim(sp(3, "luces"))} />
      </Scene>

      {/* 4 · primero: la cúpula vista desde abajo, llena de led que se encienden y apuntan al centro */}
      <Scene {...sc(4)}>
        <SVG>
          <g transform="translate(540 730)"><DomeBelow r={290} t={t} lit={0.05 + ramp(t, Wd(4, "llena"), Wd(4, "led") + 0.6)} aim={on(4, "apuntan", 0.6)} /></g>
        </SVG>
        <Chip text="1 · La cúpula" o={chip(4)} />
        <Label x={540} y={1110} text="llena de led" color={K.flow} size={46} box o={lab(Wd(4, "llena"), Wd(4, "apuntan"))} />
        <Label x={540} y={1110} text="todos a la misma zona" color={K.flow} size={46} box o={lab2(Wd(4, "apuntan"), E(4))} />
      </Scene>

      {/* 5 · una cabeza o una mano tapa algunos rayos; los demás siguen: la sombra casi desaparece */}
      <Scene {...sc(5)}>
        <SVG>
          <g transform="translate(540 960) scale(0.85)"><Table /></g>
          <Beams x0={DX} y0={DY - 12} xs={XS} tx={DX} ty={TY} t={t} obst={[...(b5head > 0.01 ? [head5] : []), ...(b5hand > 0.01 ? [hand5] : [])]} />
          <g transform={`translate(${DX} ${DY})`}><Dome w={DW} n={DN} t={t} arm={110} /></g>
          <g transform={`translate(${head5.x} ${head5.y})`}><Head s={0.85} o={b5head} /></g>
          <g transform={`translate(${hand5.x} ${hand5.y})`}><Hand s={0.8} o={b5hand} glove /></g>
        </SVG>
        <Chip text="Si algo tapa la luz…" o={chip(5)} />
        <Label x={850} y={640} text="tapados" color={K.hot} size={40} o={dim(sp(5, "tapa"))} />
        <Label x={540} y={1110} text="los demás siguen" color={K.flow} size={46} box o={lab(Wd(5, "siguen"), Wd(5, "sombra"))} />
        <Label x={540} y={1110} text="sombra casi nula" color={K.flow} size={46} box o={lab2(Wd(5, "sombra"), E(5))} />
      </Scene>

      {/* 6 · segundo: la potencia en lux (barras) */}
      <Scene {...sc(6)}>
        <SVG>
          <line x1={110} y1={1000} x2={930} y2={1000} stroke={C.case3} strokeWidth={5} />
          {[
            { x: 230, v: 500, p: b6off, c: K.cold },
            { x: 520, v: 40000, p: b6min, c: K.flow },
            { x: 810, v: 160000, p: b6max, c: K.flow },
          ].map((b) => {
            const hh = Math.max(6, (b.v / 160000) * 480) * (0.08 + 0.92 * b.p);
            const full = Math.max(6, (b.v / 160000) * 480);
            return (
              <g key={b.x}>
                <rect x={b.x - 80} y={1000 - full} width={160} height={full} rx={10} fill="none" stroke={b.c} strokeWidth={4} strokeDasharray="10 10" opacity={0.35} />
                <rect x={b.x - 80} y={1000 - hh} width={160} height={hh} rx={10} fill={b.c} opacity={0.35 + 0.65 * b.p} />
              </g>
            );
          })}
        </SVG>
        <Chip text="2 · La potencia" o={chip(6)} />
        <Label x={520} y={830} text="40.000 lux" color={K.flow} size={42} o={dim(sp(6, "cuarenta"))} />
        <Label x={790} y={440} text="160.000 lux" color={K.flow} size={46} o={dim(sp(6, "ciento"))} />
        <Label x={250} y={1050} text="oficina: 500" color={K.cold} size={38} o={dim(sp(6, "oficina"))} />
      </Scene>

      {/* 7 · tercero: luz fría, casi sin infrarrojo (espectro) */}
      <Scene {...sc(7)}>
        <SVG>
          <Spectrum x0={120} x1={960} y={900} h={330} t={t} old={0.35 + 0.65 * (1 - on(7, "fría", 0.5) * 0.6)} led={dim(on(7, "fría"))} ir={on(7, "infrarrojo")} />
        </SVG>
        <Chip text="3 · Luz fría" o={chip(7)} />
        <Label x={300} y={470} text="bombilla antigua" color={K.hot} size={40} o={dim(sp(7, "luz"))} />
        <Label x={760} y={470} text="led" color={K.cold} size={46} o={dim(sp(7, "fría"))} />
        <Label x={540} y={1050} text="infrarrojo = calor que reseca" color={K.hot} size={40} box o={dim(sp(7, "infrarrojo"))} />
      </Scene>

      {/* 8 · cuarto: el color, luz parecida a la del día que distingue bien los rojos */}
      <Scene {...sc(8)}>
        <SVG>
          <g transform="translate(130 480)"><Swatches washed={1} o={dim(on(8, "falsea"))} /></g>
          <g transform="translate(670 480)"><Swatches washed={1 - b8day} hi={on(8, "rojos")} /></g>
          <g transform="translate(810 400)"><Sun t={t} r={24} o={dim(b8day)} /></g>
        </SVG>
        <Chip text="4 · El color" o={chip(8)} />
        <Label x={270} y={820} text="luz que falsea" color="#FF8A80" size={38} o={dim(sp(8, "falsea"))} />
        <Label x={790} y={820} text="como de día" color={K.flow} size={38} o={dim(sp(8, "día"))} />
        <Label x={540} y={1060} text="reproducción cromática ≥ 85" color={K.white} size={40} box o={dim(sp(8, "rojos"))} />
      </Scene>

      {/* 9 · asas estériles: el propio cirujano la mueve */}
      <Scene {...sc(9)}>
        <SVG>
          <g transform={`translate(540 640) rotate(${10 * sway * b9move})`}>
            <Dome w={620} n={13} t={t} arm={140} handle={on(9, "asas")} />
            <g transform="translate(48 50)"><Hand s={0.75} o={dim(on(9, "cirujano"))} glove /></g>
          </g>
        </SVG>
        <Chip text="Y para moverla…" o={chip(9)} />
        <Label x={300} y={800} text="asa estéril" color={K.flow} size={44} o={dim(sp(9, "asas"))} />
        <Label x={540} y={1110} text="la mueve el cirujano" color={K.white} size={44} box o={dim(sp(9, "cirujano"))} />
      </Scene>

      {/* 10 · curiosidad: antes, ventanales y claraboyas */}
      <Scene {...sc(10)}>
        <SVG>
          <OldRoom t={t} win={on(10, "ventanas")} sky={on(10, "claraboyas")} sun={on(10, "sol")} />
          <g transform="translate(560 880) scale(0.7)"><Table /></g>
          <g transform="translate(880 330)"><Sun t={t} r={30} o={dim(on(10, "sol"))} /></g>
        </SVG>
        <Chip text="Curiosidad" o={chip(10)} />
        <Label x={260} y={470} text="ventanales" color={K.cold} size={40} o={dim(sp(10, "ventanas"))} />
        <Label x={790} y={490} text="claraboya" color={K.cold} size={40} o={dim(sp(10, "claraboyas"))} />
        <Label x={540} y={1110} text="la luz del sol" color={K.flow} size={44} box o={dim(sp(10, "sol"))} />
      </Scene>

      {/* 11 · otra: 1919, la lámpara de espejos y el nombre griego */}
      <Scene {...sc(11)}>
        <SVG>
          <g transform="translate(540 600)"><OldLamp t={t} rays={dim(on(11, "puso"))} tx={0} ty={330} /></g>
          <line x1={300} y1={940} x2={780} y2={940} stroke={C.case3} strokeWidth={5} />
        </SVG>
        <Chip text="Otra curiosidad" o={chip(11)} />
        <Label x={540} y={440} text="1919 · Argel" color={K.flow} size={52} o={dim(sp(11, "1919"))} />
        <Label x={540} y={1010} text="skiá (sombra) + lytikós (deshacer)" color={K.white} size={34} o={dim(sp(11, "griego"))} />
        <Label x={540} y={1100} text="la que deshace la sombra" color={K.flow} size={46} box o={dim(sp(11, "deshace"))} />
      </Scene>

      {/* 12 · cierre */}
      <Scene {...sc(12)}>
        <SVG>
          <g transform="translate(540 960) scale(0.85)"><Table /></g>
          <Beams x0={DX} y0={DY - 12} xs={XS} tx={DX} ty={TY} t={t} obst={[hand12]} />
          <g transform={`translate(${DX} ${DY})`}><Dome w={DW} n={DN} t={t} arm={110} /></g>
          <g transform={`translate(${hand12.x} ${hand12.y})`}><Hand s={0.85} glove /></g>
        </SVG>
        <Chip text="En resumen" o={chip(12)} />
        <Label x={540} y={1035} text="muchas luces · muchos ángulos" color={K.white} size={34} box o={dim(sp(12, "ángulos"))} />
        <Label x={540} y={1110} text="casi sin sombra" color={K.flow} size={48} box o={dim(sp(12, "sombra"))} />
      </Scene>

      <Stamp x={540} y={1110} size={48} text="CASI SIN SOMBRA" color={K.flow} p={ramp(t, Wd(1, "sombra"), Wd(1, "sombra") + 0.3) * (t < scene(1)[1] ? 1 : 0)} />
      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
