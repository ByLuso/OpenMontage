// Episodio 161 · Cómo funciona la raqueta eléctrica matamosquitos. 2D, plantilla de la serie.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en Raqueta.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
// Seguridad: nunca se ve a una persona o un animal recibiendo la descarga; «no tocar» = señales de prohibido.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, Gauge, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Racket, Head, Cell, Wave, Transformer, Ladder, BigCap, Box, Mosquito, Layers, Section, Bolt, Finger, NoSign, Person, Paw, Rings, Storm, C } from "./Raqueta";

export const COMP_ID = "Matamosquitos";
export const HOOK = "Dos pilas, miles de voltios"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);
const T: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; o?: number }> = ({ x, y, text, size = 34, color = K.white, o = 1 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={size} fill={color} opacity={o}>{text}</text>
);

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const S = (i: number) => scene(i)[0];
  const E = (i: number) => scene(i)[1];
  /** Etiqueta desde la palabra w del beat i hasta el final de la escena (o hasta `until`). */
  const L = (i: number, w: string, until?: number) => span(t, Wd(i, w), until ?? E(i));
  /** Atenuado (0,35) hasta la palabra y luego entero: para lo que «entra después». */
  const dimTo = (i: number, w: string) => 0.35 + 0.65 * ramp(t, Wd(i, w), Wd(i, w) + 0.35);
  const R = (i: number, w: string, d = 0.4) => ramp(t, Wd(i, w), Wd(i, w) + d);
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(S(i), i === 1 ? 1.8 : 0), E(i))} />;

  // beat 3: escalones de tensión
  const st3 = [R(3, "subir"), R(3, "saltos"), ramp(t, Wd(3, "saltos") + 0.4, Wd(3, "saltos") + 0.8)];
  // beat 8: el mosquito entra volando y se posa entre la capa de fuera y la del medio
  const in8 = ramp(t, S(8), Wd(8, "toca"));
  const zap8 = R(8, "chispa", 0.15);
  const mx8 = 140 + (540 - 140) * in8, my8 = 610 + 60 * Math.sin(in8 * Math.PI * 3) * (1 - in8);
  // beat 9: de las gráficas a la advertencia
  const warn9 = R(9, "pero", 0.5);
  // beat 11: tensión que sube hasta que salta la chispa
  const v11 = 3000 * ramp(t, Wd(11, "hacen"), Wd(11, "voltios"));
  const sp11 = t > Wd(11, "voltios") ? 0.6 + 0.4 * Math.sin(t * 40) : 0;
  // beat 13: resumen
  const resW = ["pilas", "miles", "capas"];
  const cur = resW.reduce((acc, w, k) => (t >= Wd(13, w) ? k : acc), -1);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: la raqueta GRANDE desde el fotograma 0; en «pilas» se abre el mango; en «miles» se enciende la rejilla */}
      <Scene {...sc(1)}>
        <SVG>
          <Racket x={540} y={590} s={0.88} t={t} open={R(1, "pilas", 0.6)} cells={R(1, "pilas", 0.6)} grid={R(1, "miles", 0.3)} spark={R(1, "miles", 0.3)} led={R(1, "miles", 0.3)} press={R(1, "miles", 0.2)} />
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={240} y={1080} text="2 PILAS" size={44} color={K.flow} box o={L(1, "pilas")} />
        <Label x={540} y={590} text="¡MILES DE VOLTIOS!" size={50} color={K.flow} box o={L(1, "miles")} />
      </Scene>

      {/* 2 · la promesa: dos pilas de 1,5 V en el mango; miles de voltios en la rejilla */}
      <Scene {...sc(2)}>
        <SVG>
          <Cell x={200} y={720} s={0.85} glow={R(2, "pilas")} />
          <Cell x={350} y={720} s={0.85} glow={R(2, "pilas")} />
          <g opacity={dimTo(2, "rejilla")}>
            <path d="M440,720 L560,720" stroke={K.flow} strokeWidth={10} strokeLinecap="round" strokeDasharray="18 12" strokeDashoffset={-t * 90} />
            <path d="M580,720 l-30,-22 l0,44 Z" fill={K.flow} />
            <Head x={790} y={720} rx={190} ry={210} t={t} grid={R(2, "rejilla")} spark={R(2, "miles")} />
          </g>
        </SVG>
        {chip(2, "EN EL MANGO")}
        <Label x={275} y={1000} text="1,5 V + 1,5 V" size={42} color={K.white} box o={L(2, "voltio")} />
        <Label x={790} y={1000} text="MILES DE V" size={42} color={K.flow} box o={L(2, "miles")} />
      </Scene>

      {/* 3 · la idea clave: subir en dos saltos, guardar y soltar de golpe */}
      <Scene {...sc(3)}>
        <SVG>
          {[0, 1, 2].map((k) => {
            const h = [120, 260, 420][k], x = 110 + k * 190, base = 960;
            return (
              <g key={k} opacity={0.35 + 0.65 * st3[k]}>
                <rect x={x} y={base - h * (0.3 + 0.7 * st3[k])} width={170} height={h * (0.3 + 0.7 * st3[k])} rx={14} fill={k === 0 ? C.case2 : K.flow} opacity={k === 0 ? 1 : 0.55 + 0.45 * st3[k]} />
                <T x={x + 85} y={base - h * (0.3 + 0.7 * st3[k]) - 22} text={["3 V", "CIENTOS", "MILES"][k]} size={34} />
              </g>
            );
          })}
          <BigCap x={850} y={620} s={0.8} t={t} fill={R(3, "guardarla", 0.6)} o={dimTo(3, "guardarla")} />
          <Bolt x1={850} y1={730} x2={850} y2={930} t={t} o={span(t, Wd(3, "golpe"), E(3), 0.1)} />
          <Mosquito x={860} y={985} s={0.8} t={t} o={dimTo(3, "golpe")} zap={R(3, "golpe")} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={300} y={445} text="SUBIR EN 2 SALTOS" size={42} color={K.flow} box o={L(3, "saltos")} />
        <Label x={850} y={445} text="GUARDAR" size={40} color={K.white} box o={L(3, "guardarla")} />
        <Label x={410} y={1080} text="¡Y SOLTAR DE GOLPE!" size={42} color={K.white} box o={L(3, "soltarla")} />
      </Scene>

      {/* 4 · primero: oscilador + transformador → cientos de voltios en alterna */}
      <Scene {...sc(4)}>
        <SVG>
          <Cell x={140} y={720} s={0.55} glow={0.5} />
          <Wave x={190} y={720} w={110} amp={0} ac={0} t={t} sw={8} />
          <Box x={430} y={720} w={250} h={120} text="OSCILADOR" o={dimTo(4, "oscilador")} hi={t > Wd(4, "oscilador") && t < Wd(4, "transformador") ? 1 : 0} />
          <g opacity={dimTo(4, "oscilador")}><Wave x={560} y={720} w={90} amp={26} ac={1} t={t} color={K.hot} cycles={2} sw={7} /></g>
          <g opacity={dimTo(4, "transformador")}><Transformer x={800} y={720} s={0.62} t={t} on={R(4, "transformador")} /></g>
          <g opacity={dimTo(4, "cientos")}>
            <Wave x={160} y={960} w={760} amp={80} ac={R(4, "cientos", 0.6)} t={t} cycles={4} sw={9} />
          </g>
        </SVG>
        {chip(4, "1 · EL OSCILADOR", K.hot)}
        <Label x={140} y={480} text="3 V" size={44} color={K.white} box o={L(4, "tres")} />
        <Label x={790} y={480} text="TRANSFORMADOR" size={40} color={K.flow} box o={L(4, "transformador")} />
        <Label x={540} y={1105} text="CIENTOS DE V · ALTERNA" size={42} color={K.flow} box o={L(4, "cientos")} />
      </Scene>

      {/* 5 · segundo: escalera de diodos y condensadores → miles de voltios; un condensador la guarda */}
      <Scene {...sc(5)}>
        <SVG>
          <g opacity={dimTo(5, "escalera")}><Ladder x={90} y={720} t={t} p={ramp(t, Wd(5, "escalera"), Wd(5, "miles") + 0.3)} n={4} dx={170} h={250} /></g>
          <path d="M770,720 L830,720" stroke={K.flow} strokeWidth={8} opacity={R(5, "guarda")} />
          <BigCap x={880} y={740} s={0.68} t={t} fill={R(5, "guarda", 0.7)} o={dimTo(5, "guarda")} />
        </SVG>
        {chip(5, "2 · EL MULTIPLICADOR")}
        <Label x={450} y={1090} text="DIODOS + CONDENSADORES" size={40} color={K.white} box o={L(5, "diodos", Wd(5, "miles"))} />
        <Label x={450} y={1090} text="¡MILES DE VOLTIOS!" size={44} color={K.flow} box o={span(t, Wd(5, "miles") + 0.05, E(5))} />
        <Label x={790} y={470} text="CONDENSADOR" size={38} color={K.flow} box o={L(5, "guarda")} />
      </Scene>

      {/* 6 · la lucecita: mientras aprietas el botón, el LED avisa de que la rejilla está cargada */}
      <Scene {...sc(6)}>
        <SVG>
          <Racket x={540} y={200} s={1.25} t={t} grid={ramp(t, Wd(6, "boton"), Wd(6, "cargada") + 0.3)} led={R(6, "lucecita", 0.3)} press={R(6, "aprietas", 0.2)} />
          <Finger x={540 + 36 + 34 * (1 - R(6, "aprietas", 0.3))} y={732} s={0.42} rot={-90} o={dimTo(6, "aprietas")} />
        </SVG>
        {chip(6, "LA LUCECITA", C.green)}
        <Label x={290} y={722} text="BOTÓN" size={40} color={K.white} box o={L(6, "boton")} />
        <Label x={290} y={800} text="LED" size={40} color={C.green} box o={L(6, "lucecita")} />
        <Label x={540} y={470} text="¡REJILLA CARGADA!" size={44} color={K.flow} box o={L(6, "cargada")} />
      </Scene>

      {/* 7 · tercero: tres capas; la del medio a un polo y las de fuera al otro */}
      <Scene {...sc(7)}>
        <SVG>
          <Layers x={540} y={720} t={t} sep={0.15 + 0.85 * R(7, "tres", 0.7)} hi={t > Wd(7, "fuera") ? "out" : t > Wd(7, "medio") ? "mid" : ""} />
        </SVG>
        {chip(7, "3 · LA REJILLA", K.cold)}
        <Label x={540} y={720} text="LA DEL MEDIO: UN POLO" size={40} color={K.flow} box o={L(7, "medio")} />
        <Label x={540} y={1100} text="3 CAPAS" size={44} color={K.white} box o={L(7, "tres", Wd(7, "fuera"))} />
        <Label x={540} y={1100} text="LAS DE FUERA: EL OTRO" size={40} color={K.cold} box o={span(t, Wd(7, "fuera") + 0.05, E(7))} />
      </Scene>

      {/* 8 · cuarto: el mosquito toca la del medio y una de fuera → circuito cerrado → ¡chispa! */}
      <Scene {...sc(8)}>
        <SVG>
          <Section x={540} y={720} t={t} gap={170} glowMid={R(8, "cierra")} />
          <Bolt x1={540} y1={570} x2={605} y2={700} t={t} o={span(t, Wd(8, "chispa"), E(8), 0.08)} w={9} />
          {zap8 > 0.01 && <circle cx={570} cy={635} r={120 + 30 * Math.sin(t * 30)} fill="#FFF7CC" opacity={0.35 * zap8 * (0.6 + 0.4 * Math.sin(t * 25))} style={{ filter: `blur(18px)` }} />}
          <Mosquito x={mx8} y={my8 + 40 * zap8} s={1.15} t={t} rot={-6 + 14 * zap8} zap={zap8} />
        </SVG>
        {chip(8, "4 · ¡ZAS!", K.warn)}
        <Label x={540} y={445} text="TOCA DOS CAPAS" size={42} color={K.white} box o={L(8, "toca", Wd(8, "cierra"))} />
        <Label x={540} y={1090} text="CIRCUITO CERRADO" size={42} color={K.flow} box o={L(8, "cierra")} />
        <Stamp x={540} y={450} text="¡CHISPA!" color={K.flow} size={64} p={R(8, "chispa", 0.35)} />
      </Scene>

      {/* 9 · la corriente es pequeñísima y dura un instante… pero el calambrazo de la rejilla se nota */}
      <Scene {...sc(9)}>
        <SVG>
          <g opacity={1 - warn9}>
            <rect x={150} y={540} width={140} height={400} rx={16} fill={K.flow} opacity={0.85} />
            <T x={220} y={990} text="TENSIÓN" size={32} />
            <rect x={380} y={922} width={140} height={18} rx={6} fill={K.cold} opacity={dimTo(9, "corriente")} style={{ filter: `drop-shadow(0 0 8px ${K.cold})` }} />
            <T x={450} y={990} text="CORRIENTE" size={32} o={dimTo(9, "corriente")} />
            <g opacity={dimTo(9, "instante")}>
              <line x1={560} y1={900} x2={920} y2={900} stroke={C.case3} strokeWidth={6} />
              <path d={`M560,900 L700,900 L708,${900 - 300 * R(9, "instante", 0.3)} L716,900 L920,900`} fill="none" stroke={K.flow} strokeWidth={8} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${K.flow})` }} />
              <T x={740} y={950} text="TIEMPO" size={28} color={C.case3} />
            </g>
          </g>
          <g opacity={warn9}>
            <Head x={540} y={720} rx={250} ry={270} t={t} grid={1} />
            <Bolt x1={420} y1={560} x2={540} y2={700} t={t} color={K.warn} o={R(9, "calambrazo", 0.2) * (0.6 + 0.4 * Math.sin(t * 30))} />
            <Bolt x1={660} y1={600} x2={560} y2={760} t={t + 0.5} color={K.warn} o={R(9, "calambrazo", 0.2) * (0.6 + 0.4 * Math.sin(t * 27))} />
          </g>
        </SVG>
        {chip(9, "OJO", K.warn)}
        <Label x={540} y={445} text="CORRIENTE PEQUEÑÍSIMA" size={42} color={K.cold} box o={L(9, "pequenisima", Wd(9, "pero"))} />
        <Label x={820} y={540} text="UN INSTANTE" size={40} color={K.flow} box o={L(9, "instante", Wd(9, "pero"))} />
        <Label x={540} y={445} text="SI TOCAS LA REJILLA…" size={42} color={K.white} box o={span(t, Wd(9, "tocas"), E(9))} />
        <Stamp x={540} y={1080} text="¡CALAMBRAZO!" color={K.warn} size={60} p={R(9, "calambrazo", 0.35)} />
      </Scene>

      {/* 10 · nunca toques la rejilla ni la acerques a personas o animales: solo para insectos */}
      <Scene {...sc(10)}>
        <SVG>
          <g opacity={dimTo(10, "toques")}>
            <Head x={210} y={760} rx={120} ry={130} t={t} grid={1} />
            <Finger x={210} y={690} s={0.42} rot={180} />
            <NoSign x={210} y={700} r={150} o={R(10, "toques")} />
          </g>
          <g opacity={dimTo(10, "personas")}>
            <Person x={540} y={720} s={1.2} />
            <NoSign x={540} y={700} r={150} o={R(10, "personas")} />
          </g>
          <g opacity={dimTo(10, "animales")}>
            <Paw x={860} y={710} s={1.25} />
            <NoSign x={860} y={700} r={130} o={R(10, "animales")} />
          </g>
          <g opacity={dimTo(10, "insectos")}>
            <Mosquito x={470} y={975} s={0.7} t={t} />
            <path d="M600,975 l30,30 l60,-70" fill="none" stroke={C.green} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </SVG>
        {chip(10, "NUNCA", K.warn)}
        <Label x={540} y={460} text="NO TOQUES LA REJILLA" size={42} color={K.warn} box o={L(10, "nunca")} />
        <Label x={540} y={1100} text="SOLO PARA INSECTOS" size={42} color={K.white} box o={L(10, "solo")} />
      </Scene>

      {/* 11 · curiosidad: el aire aguanta unos 3.000 V por milímetro antes de dejar saltar la chispa */}
      <Scene {...sc(11)}>
        <SVG>
          <rect x={120} y={700} width={330} height={40} rx={20} fill={C.case3} />
          <circle cx={460} cy={720} r={30} fill={C.case3} />
          <rect x={630} y={700} width={330} height={40} rx={20} fill={C.case3} />
          <circle cx={620} cy={720} r={30} fill={C.case3} />
          {Array.from({ length: 9 }).map((_, k) => (
            <circle key={k} cx={500 + 80 * ((k * 0.37 + t * 0.15 + (k % 3) * 0.2) % 1)} cy={650 + (k * 17) % 140 + 8 * Math.sin(t * 2 + k)} r={7} fill={K.cold} opacity={0.6} />
          ))}
          <Bolt x1={488} y1={720} x2={592} y2={720} t={t} o={sp11} w={9} n={5} jag={18} />
          <g opacity={dimTo(11, "milimetro")}>
            <line x1={460} y1={800} x2={620} y2={800} stroke={K.white} strokeWidth={5} />
            <path d="M460,800 l18,-12 l0,24 Z M620,800 l-18,-12 l0,24 Z" fill={K.white} />
          </g>
        </SVG>
        {chip(11, "CURIOSIDAD")}
        <Label x={540} y={560} text="AIRE" size={40} color={K.cold} box o={L(11, "aire", Wd(11, "milimetro"))} />
        <Label x={540} y={860} text="1 MILÍMETRO" size={40} color={K.white} box o={L(11, "milimetro")} />
        <Gauge value={v11} max={3000} unit="V" color={K.flow} x={540} y={1020} t={t} t0={Wd(11, "hacen")} t1={E(11)} />
      </Scene>

      {/* 12 · otra: el chasquido es un trueno en miniatura; el aire se calienta y se expande de golpe */}
      <Scene {...sc(12)}>
        <SVG>
          <circle cx={540} cy={720} r={150} fill={K.hot} opacity={0.5 * R(12, "calienta", 0.3) * (0.7 + 0.3 * Math.sin(t * 20))} style={{ filter: "blur(30px)" }} />
          <Rings x={540} y={720} t={t} o={0.25 + 0.75 * R(12, "expande", 0.3)} R={330} />
          <rect x={515} y={480} width={50} height={90} rx={14} fill={C.case3} />
          <rect x={515} y={870} width={50} height={90} rx={14} fill={C.case3} />
          <Bolt x1={540} y1={575} x2={540} y2={865} t={t} o={0.7 + 0.3 * Math.sin(t * 33)} w={10} n={7} jag={26} />
          <Storm x={850} y={560} s={0.6} t={t} o={dimTo(12, "trueno")} />
        </SVG>
        {chip(12, "OTRA")}
        <Label x={540} y={1100} text="UN TRUENO EN MINIATURA" size={40} color={K.white} box o={L(12, "trueno", Wd(12, "calienta"))} />
        <Label x={540} y={1100} text="AIRE CALIENTE" size={42} color={K.hot} box o={span(t, Wd(12, "calienta") + 0.05, Wd(12, "expande"))} />
        <Label x={540} y={1100} text="¡SE EXPANDE DE GOLPE!" size={42} color={K.cold} box o={span(t, Wd(12, "expande") + 0.05, E(12))} />
      </Scene>

      {/* 13 · cierre: resumen */}
      <Scene {...sc(13)}>
        <SVG>
          <g opacity={dimTo(13, "pilas")}>
            <Cell x={170} y={600} s={0.55} glow={cur === 0 ? 1 : 0} />
            <Cell x={270} y={600} s={0.55} glow={cur === 0 ? 1 : 0} />
          </g>
          <g opacity={dimTo(13, "miles")}>
            <Bolt x1={520} y1={470} x2={560} y2={730} t={t} o={cur === 1 ? 1 : 0.5} w={10} n={5} jag={30} />
          </g>
          <g opacity={dimTo(13, "capas")}>
            {[0, 1, 2].map((k) => (
              <rect key={k} x={760} y={510 + k * 70} width={200} height={26} rx={10} fill={k === 1 ? K.flow : K.cold}
                opacity={cur === 2 ? 1 : 0.6} transform={`skewX(-20)`} style={{ transformOrigin: "860px 600px" }} />
            ))}
          </g>
        </SVG>
        {chip(13, "RESUMEN")}
        <Label x={220} y={820} text="2 PILAS" size={38} color={cur === 0 ? K.flow : K.white} box o={dimTo(13, "pilas")} />
        <Label x={540} y={820} text="MILES DE V" size={38} color={cur === 1 ? K.flow : K.white} box o={dimTo(13, "miles")} />
        <Label x={850} y={820} text="3 CAPAS" size={38} color={cur === 2 ? K.flow : K.white} box o={dimTo(13, "capas")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
