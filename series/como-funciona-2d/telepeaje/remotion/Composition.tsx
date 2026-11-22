// Episodio 158 · Cómo te cobra el peaje sin pararte (telepeaje, el aparatito del parabrisas). 2D, plantilla de la serie.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en Telepeaje.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming, clamp01 } from "./kit2d/Kit";
import { Tag, Waves, Antenna, Gantry, Car, Barrier, Light, Camera, Plate, Account, Coin, Arrow, Mirror, Windshield, Mountains, Road, NUM, BITS, C } from "./Telepeaje";

export const COMP_ID = "Telepeaje";
export const HOOK = "Responde como un espejo"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);
/** Parpadeo del eco modulado (8 bits/s en pantalla; en la realidad es muchísimo más rápido). */
const blinkAt = (t: number, rate = 8) => BITS[Math.floor(t * rate) % BITS.length];

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
  const lin = (a: number, b: number) => clamp01((t - a) / Math.max(0.001, b - a));
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(S(i), i === 1 ? 1.8 : 0), E(i))} />;
  const blink = blinkAt(t);
  const echo = 0.35 + 0.65 * blink;

  // 1 · la tapa se levanta en «secreto»; la antena se resalta en «contesta»
  const op1 = 0.99 * R(1, "secreto", 0.7);
  // 4 · el coche se acerca al pórtico
  const car4 = 120 + 300 * lin(S(4), E(4));
  // 7 · el coche frena un poco al llegar y sigue cuando sube la barrera
  const up7 = R(7, "levanta", 0.6);
  const car7 = 140 + 210 * lin(S(7), Wd(7, "levanta")) + 620 * ramp(t, Wd(7, "levanta") + 0.2, E(7) + 0.8);
  // 8 · el coche sin aparato pasa despacio; la cámara dispara en «cámaras» y repite
  const car8 = 160 + 260 * lin(S(8), E(8));
  const tf8 = t - Wd(8, "cámaras");
  const flash8 = tf8 < 0 ? 0 : Math.max(0, 1 - (tf8 % 1.1) / 0.3);
  // 9 · el coche recorre tres peajes de países distintos
  const car9 = 60 + 960 * lin(S(9), E(9));
  // 10 · el aparato se muda junto al retrovisor
  const mv10 = R(10, "retrovisor", 0.7);
  // 11 · coche antiguo bajo el pórtico
  const car11 = 200 + 520 * lin(S(11), E(11));
  // 12 · coches que pasan sin frenar bajo el arco (bucle)
  const loopX = (off: number, sp: number) => -260 + (((t - S(12)) * sp + off) % 1600);
  // 13 · resumen
  const resW = ["microondas", "eco", "cuenta", "barrera", "pagas"];
  const curR = resW.reduce((acc, w, k) => (t >= Wd(13, w) ? k : acc), -1);
  const resU = (k: number) => (k < resW.length - 1 ? Wd(13, resW[k + 1]) : E(13));
  const on13 = (k: number) => (curR >= k ? 1 : 0.3);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el aparatito GRANDE desde el fotograma 0; en «secreto» se levanta la tapa */}
      <Scene {...sc(1)}>
        <SVG>
          <Tag x={540} y={860} s={1.0} t={t} open={op1} lift={-300} hi={t > Wd(1, "contesta") ? "antena" : ""} />
          <Waves x={365} y={840} dir={-120} t={t} o={0.8 * R(1, "contesta")} color={K.flow} dash="22 14" n={3} r0={90} step={60} half={22} />
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={540} y={1085} text="SIN EMISORA PROPIA" size={46} color={K.flow} box o={L(1, "emisora")} />
      </Scene>

      {/* 2 · la promesa: el peaje lanza microondas y el aparato se las devuelve como un espejo que parpadea */}
      <Scene {...sc(2)}>
        <SVG>
          <rect x={60} y={430} width={340} height={40} rx={8} fill={C.metal} stroke={C.ink} strokeWidth={4} />
          <Antenna x={230} y={510} o={1} hot={R(2, "microondas")} />
          <Waves x={230} y={540} dir={38} t={t} o={dimTo(2, "microondas")} color={K.cold} n={5} step={80} r0={60} />
          <Tag x={720} y={900} s={0.5} t={t} />
          <Waves x={640} y={840} dir={218} t={t + 0.3} o={R(2, "devuelve") * echo} color={K.flow} dash="24 16" n={4} step={70} r0={40} speed={-110} />
          <Mirror x={850} y={560} s={0.75} flash={R(2, "espejo") * blink} o={dimTo(2, "espejo")} />
        </SVG>
        {chip(2, "EL SECRETO")}
        <Label x={230} y={650} text="MICROONDAS" size={38} color={K.cold} box o={L(2, "microondas")} />
        <Label x={800} y={740} text="COMO UN ESPEJO" size={36} color={K.flow} box o={L(2, "espejo")} />
        <Label x={540} y={1100} text="TE DEVUELVE EL ECO" size={42} color={K.flow} box o={L(2, "devuelve")} />
      </Scene>

      {/* 3 · la idea clave: el aparato solo dice un número; con él saben a quién cobrar */}
      <Scene {...sc(3)}>
        <SVG>
          <Tag x={220} y={650} s={0.42} t={t} />
          <g opacity={dimTo(3, "número")}>
            <rect x={400} y={580} width={540} height={140} rx={26} fill="rgba(6,16,31,0.85)" stroke={K.flow} strokeWidth={5} />
            <path d="M400,630 L350,650 L400,670 Z" fill={K.flow} />
            <text x={670} y={675} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={66} fill={K.flow}>{NUM}</text>
          </g>
          <Arrow x0={670} y0={740} x1={600} y1={860} color={K.flow} o={dimTo(3, "saben")} />
          <Account x={540} y={940} num={NUM.replace(/ /g, "")} hi={R(3, "cobrar")} o={dimTo(3, "saben")} w={600} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={670} y={520} text="SOLO UN NÚMERO" size={40} color={K.flow} box o={L(3, "número")} />
        <Label x={540} y={1090} text="¿A QUIÉN COBRAR?" size={42} color={K.white} box o={L(3, "cobrar")} />
      </Scene>

      {/* 4 · primero: la antena sobre el carril dispara microondas de 5,8 GHz */}
      <Scene {...sc(4)}>
        <SVG>
          <Road y={980} t={t} speed={0} />
          <Gantry x0={110} x1={970} y={470} h={510} />
          <Antenna x={540} y={540} s={0.9} hot={R(4, "dispara")} o={dimTo(4, "antena")} />
          <Waves x={540} y={575} dir={90} t={t} o={dimTo(4, "dispara") * (0.4 + 0.6 * R(4, "dispara"))} color={K.cold} n={5} step={70} r0={40} half={34} />
          <Car x={car4} y={915} s={0.8} t={t} tagGlow={R(4, "dispara") * 0.6} />
        </SVG>
        {chip(4, "PRIMERO: LA ANTENA")}
        <Label x={770} y={560} text="ANTENA" size={40} color={K.white} box o={L(4, "antena")} />
        <Label x={540} y={1100} text="5,8 GHz" size={60} color={K.cold} box o={L(4, "cinco")} />
      </Scene>

      {/* 5 · segundo: el aparato se despierta y modula el eco para deletrear su número */}
      <Scene {...sc(5)}>
        <SVG>
          <Waves x={90} y={420} dir={42} t={t} o={0.9} color={K.cold} n={5} step={80} r0={40} />
          <Tag x={600} y={800} s={0.85} t={t} open={1} wake={R(5, "despierta")} hi={t > Wd(5, "devolver") ? "antena" : ""} />
          <Waves x={440} y={770} dir={225} t={t} o={R(5, "devolver") * echo} color={K.flow} dash="24 16" n={3} step={70} r0={60} speed={-110} />
          <g opacity={dimTo(5, "modula")}>
            {BITS.slice(0, 8).map((b, k) => (
              <rect key={k} x={250 + k * 76} y={b ? 990 : 1020} width={60} height={b ? 70 : 40} rx={8}
                fill={b ? K.flow : "rgba(255,210,63,0.25)"} opacity={Math.floor(t * 8) % 8 === k ? 1 : 0.7} />
            ))}
          </g>
        </SVG>
        {chip(5, "SEGUNDO: EL ECO")}
        <Label x={800} y={560} text="¡SE DESPIERTA!" size={40} color={K.hot} box o={L(5, "despierta", Wd(5, "número"))} />
        <Label x={720} y={560} text="TU NÚMERO" size={42} color={K.flow} box o={L(5, "número")} />
      </Scene>

      {/* 6 · tercero: el sistema busca el número, encuentra tu cuenta y te carga el peaje */}
      <Scene {...sc(6)}>
        <SVG>
          <g>
            <rect x={300} y={430} width={480} height={110} rx={22} fill="rgba(6,16,31,0.85)" stroke={K.flow} strokeWidth={5} />
            <text x={540} y={505} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={60} fill={K.flow}>{NUM}</text>
          </g>
          <Arrow x0={540} y0={555} x1={540} y1={625} color={K.flow} o={dimTo(6, "busca")} />
          {["3 1 8 8 0 4", NUM, "9 0 5 1 2 7"].map((n, k) => {
            const me = k === 1;
            const scan = !me ? 0 : R(6, "cuenta");
            return <Account key={k} x={540} y={690 + k * 120} num={n.replace(/ /g, "")} hi={me ? scan : 0} paid={me ? R(6, "carga") : 0}
              o={me ? 1 : dimTo(6, "busca") * (1 - 0.5 * R(6, "cuenta"))} w={600} />;
          })}
          {/* lupa que recorre la lista */}
          <g opacity={span(t, Wd(6, "busca"), Wd(6, "cuenta") + 0.3)} transform={`translate(${880},${690 + 120 * Math.min(1, lin(Wd(6, "busca"), Wd(6, "cuenta")) * 1.2)})`}>
            <circle r={36} fill="none" stroke={K.white} strokeWidth={9} />
            <line x1={26} y1={26} x2={58} y2={58} stroke={K.white} strokeWidth={12} strokeLinecap="round" />
          </g>
          <Coin x={760} y={810 - 160 * (1 - R(6, "carga", 0.5))} r={34} o={span(t, Wd(6, "carga") - 0.2, Wd(6, "carga") + 0.5, 0.15)} />
        </SVG>
        {chip(6, "TERCERO: TU CUENTA")}
        <Label x={540} y={1080} text="ESTA ES TU CUENTA" size={42} color={K.flow} box o={span(t, Wd(6, "cuenta"), Wd(6, "carga"))} />
        <Label x={540} y={1080} text="PEAJE COBRADO" size={44} color={K.white} box o={L(6, "carga")} />
      </Scene>

      {/* 7 · cuarto: el aparato pita, el semáforo se pone verde y la barrera se levanta */}
      <Scene {...sc(7)}>
        <SVG>
          <Road y={985} t={t} speed={0} />
          <Light x={170} y={640} s={0.9} green={R(7, "verde", 0.15)} />
          <rect x={160} y={720} width={20} height={265} fill={C.metal} />
          <Barrier x={600} y={900} up={up7} len={360} />
          <Car x={car7} y={920} s={0.8} t={t} tagGlow={R(7, "pita") * (0.4 + 0.6 * blink)} />
          <Tag x={810} y={520} s={0.35} t={t} beep={span(t, Wd(7, "pita"), Wd(7, "levanta") + 0.6)} />
        </SVG>
        {chip(7, "CUARTO: LA BARRERA")}
        <Label x={810} y={640} text="¡PIP!" size={46} color={K.white} box o={span(t, Wd(7, "pita"), E(7))} />
        <Label x={540} y={1100} text="¡VÍA LIBRE!" size={46} color={C.ok} box o={L(7, "levanta")} />
      </Scene>

      {/* 8 · ¿y sin aparato? las cámaras leen la matrícula */}
      <Scene {...sc(8)}>
        <SVG>
          <Road y={985} t={t} speed={0} />
          <Gantry x0={100} x1={900} y={460} h={525} />
          <Camera x={760} y={540} s={0.9} dir={-1} flash={flash8} o={dimTo(8, "cámaras")} />
          <Car x={car8} y={920} s={0.8} t={t} tag={false} />
          <Tag x={250} y={600} s={0.32} t={t} cross={R(8, "llevas", 0.3)} />
          <Plate x={540} y={760} s={0.85} hi={R(8, "matrícula")} o={span(t, Wd(8, "matrícula"), E(8))} />
        </SVG>
        {chip(8, "¿Y SIN APARATO?")}
        <Label x={540} y={1100} text="LEEN TU MATRÍCULA" size={42} color={K.flow} box o={L(8, "matrícula")} />
      </Scene>

      {/* 9 · en Europa casi todos usan la misma frecuencia: un aparato, varios países */}
      <Scene {...sc(9)}>
        <SVG>
          <Road y={960} t={t} speed={0} />
          {[220, 540, 840].map((gx, k) => {
            const passed = car9 + 180 > gx;
            const cols = [["#C62828", "#FFD23F", "#C62828"], ["#1E7B3C", "#1E7B3C", "#C62828"], ["#1E3F9E", "#FFFFFF", "#C62828"]][k];
            return (
              <g key={k}>
                <rect x={gx - 110} y={640} width={20} height={320} fill={C.metal} />
                <rect x={gx + 90} y={640} width={20} height={320} fill={C.metal} />
                <rect x={gx - 125} y={620} width={250} height={36} rx={8} fill={C.metal} stroke={C.ink} strokeWidth={4} />
                <Antenna x={gx} y={690} s={0.55} />
                <Waves x={gx} y={712} dir={90} t={t + k * 0.2} o={dimTo(9, "frecuencia") * 0.9} color={K.cold} n={3} step={50} r0={20} half={30} w={7} />
                {/* banderita genérica de tres franjas */}
                {cols.map((c, j) => <rect key={j} x={gx - 45 + j * 30} y={548} width={30} height={50} fill={c} stroke={C.ink} strokeWidth={2} />)}
                <g opacity={passed ? 1 : 0} transform={`translate(${gx},${500})`}>
                  <circle r={26} fill={C.ok} />
                  <path d="M-12,0 L-3,10 L13,-10" stroke={K.ink} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>
            );
          })}
          <Car x={car9} y={895} s={0.6} t={t} tagGlow={0.4 + 0.6 * blink} />
        </SVG>
        {chip(9, "EN EUROPA")}
        <Label x={540} y={430} text="LA MISMA FRECUENCIA" size={40} color={K.cold} box o={L(9, "frecuencia")} />
        <Label x={540} y={1100} text="UN APARATO, VARIOS PAÍSES" size={40} color={K.flow} box o={L(9, "países")} />
      </Scene>

      {/* 10 · truco: junto al retrovisor; la capa metálica del parabrisas tapa la señal, menos ahí */}
      <Scene {...sc(10)}>
        <SVG>
          <Windshield x={540} y={720} coat={dimTo(10, "capa")} />
          {/* ondas que rebotan en la capa */}
          <Waves x={300} y={430} dir={90} t={t} o={0.8 * R(10, "capa")} color={K.cold} n={3} step={40} r0={10} half={30} w={7} />
          <path d="M250,780 L350,880 M350,780 L250,880" stroke={K.warn} strokeWidth={16} strokeLinecap="round" opacity={R(10, "tapa", 0.3)} />
          {/* ondas que pasan por la mirilla */}
          <Waves x={540} y={360} dir={90} t={t} o={R(10, "menos")} color={K.cold} n={4} step={60} r0={10} half={16} w={7} />
          <Tag x={290 + 250 * mv10} y={820 - 120 * mv10} s={0.2} t={t} beep={R(10, "menos")} />
        </SVG>
        {chip(10, "TRUCO")}
        <Label x={540} y={440} text="JUNTO AL RETROVISOR" size={38} color={K.flow} box o={L(10, "retrovisor", Wd(10, "menos"))} />
        <Label x={540} y={440} text="¡AQUÍ SÍ PASA!" size={40} color={C.ok} box o={L(10, "menos")} />
        <Label x={300} y={1010} text="CAPA METÁLICA" size={38} color={K.warn} box o={L(10, "capa")} />
      </Scene>

      {/* 11 · curiosidad: Noruega fue pionera en los años 80 */}
      <Scene {...sc(11)}>
        <SVG>
          <Mountains y={900} o={dimTo(11, "noruega")} />
          <Road y={995} t={t} speed={0} />
          <Gantry x0={620} x1={900} y={690} h={305} />
          <Antenna x={760} y={750} s={0.6} />
          <Waves x={760} y={772} dir={90} t={t} o={dimTo(11, "etiquetas")} color={K.cold} n={3} step={50} r0={20} half={30} w={7} />
          <Car x={car11} y={930} s={0.75} t={t} boxy color={K.cold} tagGlow={R(11, "etiquetas") * (0.4 + 0.6 * blink)} />
        </SVG>
        {chip(11, "CURIOSIDAD")}
        <Label x={540} y={460} text="NORUEGA" size={48} color={K.white} box o={L(11, "noruega")} />
        <Label x={300} y={600} text="AÑOS 80" size={56} color={K.flow} box o={L(11, "ochenta")} />
      </Scene>

      {/* 12 · otra: peajes sin casetas (Noruega, Chile): arcos con antenas y cámaras */}
      <Scene {...sc(12)}>
        <SVG>
          <Road y={985} t={t} speed={0} />
          <Gantry x0={90} x1={930} y={520} h={465} />
          <Antenna x={330} y={590} s={0.7} hot={R(12, "arcos")} />
          <Camera x={680} y={590} s={0.75} dir={-1} flash={R(12, "cámaras") * (Math.floor(t * 2) % 2)} />
          <Waves x={330} y={618} dir={90} t={t} o={dimTo(12, "arcos")} color={K.cold} n={3} step={60} r0={20} half={30} w={7} />
          <Car x={loopX(0, 520)} y={920} s={0.75} t={t} spin={2} />
          <Car x={loopX(800, 520)} y={920} s={0.75} t={t} spin={2} color={K.cold} />
        </SVG>
        {chip(12, "OTRA: SIN CASETAS")}
        <Label x={540} y={760} text="NORUEGA · CHILE" size={42} color={K.white} box o={span(t, Wd(12, "noruega"), Wd(12, "arcos"))} />
        <Label x={540} y={760} text="ANTENAS + CÁMARAS" size={42} color={K.cold} box o={L(12, "arcos")} />
        <Label x={540} y={1100} text="SIN CASETAS" size={46} color={K.flow} box o={L(12, "casetas")} />
      </Scene>

      {/* 13 · cierre: resumen */}
      <Scene {...sc(13)}>
        <SVG>
          <g opacity={on13(0)}>
            <Antenna x={290} y={520} s={0.8} />
            <Waves x={290} y={550} dir={90} t={t} color={K.cold} n={3} step={45} r0={20} half={30} w={7} o={curR >= 0 ? 1 : 0.4} />
          </g>
          <g opacity={on13(1)}>
            <Tag x={790} y={500} s={0.35} t={t} />
            <text x={790} y={640} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={44} fill={K.flow}>{NUM}</text>
          </g>
          <g opacity={on13(2)}>
            <Account x={300} y={880} num={NUM.replace(/ /g, "")} hi={curR === 2 ? 1 : 0} paid={curR >= 2 ? 1 : 0} w={440} />
          </g>
          <g opacity={on13(3)}>
            <Barrier x={640} y={960} up={R(13, "barrera", 0.5)} len={240} />
          </g>
        </SVG>
        {chip(13, "RESUMEN")}
        {["MICROONDAS", "ECO CON TU NÚMERO", "TU CUENTA", "BARRERA ARRIBA", "¡SIN PARARTE!"].map((txt, k) => (
          <Label key={k} x={540} y={1090} text={txt} size={44} color={k === 4 ? C.ok : K.flow} box o={span(t, Wd(13, resW[k]), resU(k))} />
        ))}
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
