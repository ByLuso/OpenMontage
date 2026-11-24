// Episodio 167 · Cómo funciona un aerogenerador (el molino de viento que da luz). 2D, plantilla de la serie.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en Aerogenerador.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, Gauge, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Turbine, Nacelle, Bus, Dim, DimH, Airfoil, Wind, Arrow, Sign, GearPair, Generator, Bulb, Wire, Anemometer, Vane, TopView, Pie, spinAngle } from "./Aerogenerador";

export const COMP_ID = "Aerogenerador";
export const HOOK = "El molino por dentro"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);
/** Giro del rotor en pantalla (rad/s): lento, como en la realidad (~15 vueltas/min = 1,6 rad/s). */
const W = 1.6;

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
  const rot = t * W;

  // 4 · el rotor arranca en «girar»
  const g4 = Wd(4, "girar");
  const rot4 = t < g4 ? 0 : spinAngle(t - g4, W * 1.3);
  // 6 · cuentavueltas del eje rápido
  const rpm6 = 1500 * ramp(t, Wd(6, "mil"), Wd(6, "mil") + 1.2);
  // 8 · la góndola se orienta al viento
  const yaw8 = 38 * (1 - ramp(t, Wd(8, "gira"), Wd(8, "frente") + 0.3));
  // 9 · la pala se pone de canto en «frenar» y el rotor se para en «paran»
  const pitch9 = ramp(t, Wd(9, "frenar"), Wd(9, "frenar") + 0.9);
  const rot9 = spinAngle(t, W * 1.3, Wd(9, "paran"), 0.5);
  // 12 · resumen
  const resW = ["alas", "multiplicadora", "generador", "luz"];
  const curR = resW.reduce((acc, w, k) => (t >= Wd(12, w) ? k : acc), -1);
  const resU = (k: number) => (k < 3 ? Wd(12, resW[k + 1]) : E(12));
  const on = (k: number) => (curR >= k ? 1 : 0.35);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: la góndola GRANDE desde el fotograma 0; en «dentro» la tapa se levanta y se ve la maquinaria */}
      <Scene {...sc(1)}>
        <SVG>
          <g transform={`translate(0,${4 * Math.sin(t * 2)})`}>
            <Nacelle x={600} y={800} w={560} h={230} t={t} rot={rot} open={R(1, "dentro", 0.7)} bladeL={300} tower={1180} gen={0.4 * R(1, "esperas", 0.5)} />
          </g>
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={660} y={1090} text="LA GÓNDOLA" size={48} color={K.flow} box o={span(t, Wd(1, "dentro") + 0.3, E(1), 0.25)} />
      </Scene>

      {/* 2 · la promesa: a ~100 m hay una caseta (góndola) tan larga como un autobús, y dentro el generador */}
      <Scene {...sc(2)}>
        <SVG>
          <Turbine x={250} baseY={1140} hubY={600} L={150} rot={rot} />
          <Dim x={100} y0={600} y1={1140} o={R(2, "cien")} />
          <g opacity={dimTo(2, "caseta")}>
            <Nacelle x={735} y={600} w={400} h={150} t={t} rot={rot} open={R(2, "generador", 0.5)} lift={0} gen={R(2, "generador", 0.5)} bladeL={0} sensors={0} />
          </g>
          <DimH y={720} x0={535} x1={935} o={R(2, "larga")} />
          <Bus x={720} y={930} len={370} o={dimTo(2, "autobús")} />
          <DimH y={960} x0={535} x1={905} o={R(2, "autobús")} />
        </SVG>
        {chip(2, "LA CASETA DE ARRIBA")}
        <Label x={250} y={1060} text="≈ 100 M" size={44} color={K.flow} box o={L(2, "cien")} />
        <Label x={735} y={450} text="GÓNDOLA ≈ 13 M" size={40} color={K.white} box o={L(2, "caseta")} />
        <Label x={720} y={1040} text="AUTOBÚS ≈ 12 M" size={40} color={K.flow} box o={L(2, "autobús")} />
      </Scene>

      {/* 3 · la idea clave: el viento no solo empuja; cada pala tiene forma de ala de avión */}
      <Scene {...sc(3)}>
        <SVG>
          <Wind x0={70} x1={1010} ys={[560, 640, 880, 960]} t={t} o={0.7} />
          <Airfoil x={560} y={760} c={700} a={-4} plate={1 - R(3, "ala", 0.7)} hi={R(3, "ala", 0.5) * (1 - R(3, "avión", 0.6) * 0.4)} />
          <Arrow x0={120} y0={760} x1={300} y1={760} color={K.cold} o={0.9 * (1 - 0.6 * R(3, "forma"))} w={16} />
          {/* avioncito para la comparación */}
          <g opacity={R(3, "avión", 0.4)} transform="translate(540,1000) scale(1.2)">
            <path d="M-90,0 L80,0 Q100,0 100,8 Q100,16 80,16 L-90,16 L-110,-14 L-96,-14 L-80,0 Z" fill={C2.white} stroke={K.ink} strokeWidth={4} />
            <path d="M-10,8 L30,8 L-20,55 L-40,55 Z" fill={C2.grey} stroke={K.ink} strokeWidth={4} />
          </g>
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={540} y={470} text="NO SOLO EMPUJA" size={46} color={K.cold} box o={L(3, "empuja", Wd(3, "forma"))} />
        <Label x={540} y={470} text="FORMA DE ALA" size={50} color={K.flow} box o={L(3, "forma")} />
      </Scene>

      {/* 4 · primero: menos presión en un lado de la pala → sustentación → gira */}
      <Scene {...sc(4)}>
        <SVG>
          <Wind x0={70} x1={1010} ys={[520, 580, 640, 790, 850]} t={t} bend={{ cx: 560, cy: 700, c: 620 }} fastTop={R(4, "presión")} o={0.8} />
          <Airfoil x={560} y={700} c={620} a={-6} />
          {[0, 1, 2].map((k) => <Sign key={k} x={430 + k * 130} y={600} color={K.cold} o={R(4, "menos", 0.3)} />)}
          {[0, 1].map((k) => <Sign key={k} x={490 + k * 140} y={790} plus color={K.hot} o={0.5 * R(4, "diferencia", 0.3)} />)}
          <Arrow x0={560} y0={690} x1={560} y1={520} color={K.flow} o={R(4, "diferencia", 0.4)} w={14} />
          <Turbine x={540} baseY={1150} hubY={1000} L={110} rot={rot4} o={dimTo(4, "girar")} />
        </SVG>
        {chip(4, "PRIMERO: EL ALA")}
        <Label x={540} y={430} text="MENOS PRESIÓN" size={44} color={K.cold} box o={L(4, "menos", Wd(4, "diferencia"))} />
        <Label x={540} y={430} text="SUSTENTACIÓN" size={46} color={K.flow} box o={L(4, "diferencia")} />
        <Label x={800} y={1000} text="¡GIRA!" size={48} color={K.hot} box o={L(4, "girar")} />
      </Scene>

      {/* 5 · segundo: las palas giran despacio (< 20 vueltas/min) y la multiplicadora multiplica el giro */}
      <Scene {...sc(5)}>
        <SVG>
          <Turbine x={190} baseY={1150} hubY={560} L={120} rot={rot} o={dimTo(5, "palas")} />
          <g opacity={dimTo(5, "multiplicadora")}>
            <GearPair x={540} y={790} R={190} r={64} a={t * 0.9} hiBig={0} hiSmall={R(5, "giro", 0.4)} />
          </g>
        </SVG>
        {chip(5, "SEGUNDO: LA MULTIPLICADORA")}
        <Label x={540} y={1080} text="< 20 VUELTAS / MIN" size={40} color={K.white} box o={L(5, "veinte", Wd(5, "multiplicadora"))} />
        <Label x={540} y={1080} text="MULTIPLICADORA" size={46} color={K.flow} box o={L(5, "multiplicadora")} />
        <Label x={800} y={600} text="¡MÁS RÁPIDO!" size={38} color={K.hot} box o={L(5, "giro")} />
      </Scene>

      {/* 6 · el eje rápido a ~1.500 vueltas; otros modelos, sin multiplicadora: el rotor mueve el generador directamente */}
      <Scene {...sc(6)}>
        <SVG>
          <g opacity={1 - 0.6 * R(6, "otros")}>
            <rect x={420} y={588} width={560} height={44} rx={10} fill="#7F93AD" stroke={K.ink} strokeWidth={4} />
            {Array.from({ length: 7 }).map((_, k) => (
              <rect key={k} x={420 + ((t * (80 + 900 * ramp(t, Wd(6, "mil"), Wd(6, "mil") + 1.2)) + k * 80) % 550)} y={588} width={12} height={44} fill={K.hot} />
            ))}
          </g>
          <g opacity={dimTo(6, "otros")}>
            <Nacelle x={640} y={950} w={460} h={190} t={t} rot={rot} open={1} lift={0} bladeL={150} direct gen={R(6, "generador", 0.4)} sensors={0} />
          </g>
        </SVG>
        <Gauge value={rpm6} max={1800} unit="" color={K.hot} x={250} y={610} label="VUELTAS" t={t} t0={S(6) + 0.1} t1={E(6)} />
        {chip(6, "EL EJE RÁPIDO")}
        <Label x={700} y={500} text="≈ 1.500 VUELTAS/MIN" size={38} color={K.hot} box o={L(6, "mil")} />
        <Label x={600} y={770} text="OTROS: SIN MULTIPLICADORA" size={38} color={K.cold} box o={L(6, "otros")} />
        <Label x={600} y={1110} text="ROTOR → GENERADOR" size={42} color={K.flow} box o={L(6, "rotor")} />
      </Scene>

      {/* 7 · tercero: imanes que giran frente a bobinas de cobre → electricidad */}
      <Scene {...sc(7)}>
        <SVG>
          <Wire pts={[[790, 740], [870, 740], [870, 900]]} t={t} o={dimTo(7, "electricidad")} flow={R(7, "electricidad")} />
          <Generator x={530} y={740} R={260} a={t * 1.4} t={t} mag={dimTo(7, "imanes")} coil={dimTo(7, "bobinas")} current={R(7, "electricidad", 0.4)} />
          <Bulb x={870} y={980} s={0.75} on={R(7, "electricidad", 0.4)} o={dimTo(7, "electricidad")} />
        </SVG>
        {chip(7, "TERCERO: EL GENERADOR")}
        <Label x={530} y={740} text="IMANES" size={40} color={K.white} box o={L(7, "imanes", Wd(7, "bobinas"))} />
        <Label x={530} y={430} text="BOBINAS DE COBRE" size={42} color={K.hot} box o={L(7, "bobinas")} />
        <Label x={470} y={1100} text="¡ELECTRICIDAD!" size={48} color={K.flow} box o={L(7, "electricidad")} />
      </Scene>

      {/* 8 · cuarto: anemómetro y veleta; la góndola gira para mirar al viento de frente */}
      <Scene {...sc(8)}>
        <SVG>
          <Anemometer x={290} y={470} s={1.3} t={t} o={dimTo(8, "anemómetro")} w={4 + 4 * R(8, "anemómetro")} />
          <Vane x={790} y={470} s={1.3} a={yaw8 * 0.6 + 4 * Math.sin(t * 1.5)} o={dimTo(8, "veleta")} />
          <Wind x0={70} x1={330} ys={[760, 840, 920, 1000, 1080]} t={t} o={0.85} />
          <TopView x={600} y={920} yaw={yaw8} t={t} rotorL={160} />
        </SVG>
        {chip(8, "CUARTO: MIRAR AL VIENTO")}
        <Label x={290} y={660} text="ANEMÓMETRO" size={38} color={K.white} box o={L(8, "anemómetro")} />
        <Label x={790} y={660} text="VELETA" size={38} color={K.white} box o={L(8, "veleta")} />
        <Label x={680} y={1110} text="DE CARA AL VIENTO" size={42} color={K.flow} box o={L(8, "gira")} />
      </Scene>

      {/* 9 · las palas giran sobre sí mismas (se ponen de canto) y con ~90 km/h se paran */}
      <Scene {...sc(9)}>
        <SVG>
          <Wind x0={70} x1={1010} ys={[560, 620, 820, 880]} t={t} speed={260 + 380 * R(9, "vientos")} w={6 + 4 * R(9, "vientos")} />
          <Airfoil x={560} y={720} c={440} a={-80 + 78 * pitch9} hi={R(9, "frenar", 0.4) * (1 - R(9, "paran"))} />
          <path d="M440,560 A170,170 0 0 1 680,560" fill="none" stroke={K.flow} strokeWidth={8} strokeLinecap="round" opacity={span(t, Wd(9, "giran"), Wd(9, "frenar") + 1)} />
          <path d="M680,560 l-30,-6 l16,26 Z" fill={K.flow} opacity={span(t, Wd(9, "giran"), Wd(9, "frenar") + 1)} />
          <Turbine x={830} baseY={1150} hubY={990} L={95} rot={rot9} o={0.95} />
        </SVG>
        {chip(9, "FRENO DE VIENTO")}
        <Label x={540} y={430} text="LA PALA GIRA SOBRE SÍ" size={40} color={K.flow} box o={L(9, "giran", Wd(9, "vientos"))} />
        <Label x={540} y={430} text="VIENTO ≈ 90 KM/H" size={44} color={K.cold} box o={L(9, "noventa")} />
        <Stamp x={420} y={1040} text="¡STOP!" p={ramp(t, Wd(9, "paran"), Wd(9, "paran") + 0.3)} />
      </Scene>

      {/* 10 · curiosidad: palas de más de 50 m; la punta, a más de 200 km/h */}
      <Scene {...sc(10)}>
        <SVG>
          <Turbine x={540} baseY={1160} hubY={720} L={320} rot={rot * 1.2} trail={R(10, "punta")} />
        </SVG>
        {chip(10, "CURIOSIDAD")}
        <Label x={540} y={1060} text="CADA PALA: + 50 M" size={44} color={K.white} box o={L(10, "pala", Wd(10, "punta"))} />
        <Label x={540} y={1060} text="PUNTA: + 200 KM/H" size={46} color={K.hot} box o={L(10, "punta")} />
      </Scene>

      {/* 11 · otra: en 2025, más de una quinta parte de la electricidad de España salió del viento (21,6 %) */}
      <Scene {...sc(11)}>
        <SVG>
          <Pie x={540} y={760} r={250} frac={0.216} hi={R(11, "viento")} o={0.6 + 0.4 * R(11, "quinta")} />
          <Turbine x={622} baseY={680} hubY={575} L={48} rot={rot} o={R(11, "viento")} />
        </SVG>
        {chip(11, "OTRA: ESPAÑA")}
        <Label x={540} y={440} text="2025" size={56} color={K.flow} box o={L(11, "2025")} />
        <Label x={540} y={1100} text="21,6 % DEL VIENTO" size={48} color={K.cold} box o={L(11, "viento")} />
      </Scene>

      {/* 12 · cierre: alas → multiplicadora → generador → luz */}
      <Scene {...sc(12)}>
        <SVG>
          <g opacity={on(0)}><Airfoil x={200} y={640} c={230} a={-6} hi={curR === 0 ? 1 : 0} /></g>
          <g opacity={on(1)} transform="translate(470,640) scale(0.42) translate(-470,-640)"><GearPair x={420} y={640} R={190} r={64} a={t * 0.9} hiSmall={curR === 1 ? 1 : 0} /></g>
          <g opacity={on(2)}><Generator x={830} y={640} R={100} a={t * 1.4} t={t} current={curR >= 2 ? 1 : 0} /></g>
          <Bulb x={540} y={930} s={1.1} on={curR >= 3 ? 1 : 0} o={on(3)} />
        </SVG>
        {chip(12, "RESUMEN")}
        {resW.map((w, k) => (
          <Label key={w} x={540} y={1100} text={["ALAS QUE GIRAN", "MULTIPLICADORA", "GENERADOR", "¡LUZ!"][k]} size={44} color={K.flow} box
            o={span(t, Wd(12, w), resU(k))} />
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
const C2 = { white: "#E9EEF5", grey: "#9FB3CC" };
