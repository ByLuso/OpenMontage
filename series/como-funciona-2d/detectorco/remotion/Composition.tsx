// Episodio 175 · Cómo funciona el detector de monóxido de carbono. 2D, plantilla de la serie.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Face, Cell, Meter, AlarmCurve, Linear, MiniChamber, Cross, Nose, Finger, Plan, Det, Mol, C } from "./Sensor";

export const COMP_ID = "DetectorCO";
export const HOOK = "Una pila que huele"; // = meta.portada (≤5 palabras, la última va en amarillo)
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
  const L = (i: number, w: string, until?: number) => span(t, Wd(i, w), until ?? E(i));
  const dimTo = (i: number, w: string) => 0.35 + 0.65 * ramp(t, Wd(i, w), Wd(i, w) + 0.35);
  const R = (i: number, w: string, d = 0.4) => ramp(t, Wd(i, w), Wd(i, w) + d);
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(S(i), i === 1 ? 1.8 : 0), E(i))} />;
  const CX = 400, CY = 800, CS = 0.8;

  // beat 1: en «minipila» el aparato se hace pequeño y aparece la celda
  const op1 = R(1, "minipila", 0.7);
  // beat 12: resumen
  const resW = ["gas", "corriente", "alarma"];
  const cur12 = resW.reduce((acc, w, k) => (t >= Wd(12, w) ? k : acc), -1);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho */}
      <Scene {...sc(1)}>
        <SVG>
          <Cell x={CX} y={CY} s={CS} t={t} gas={op1} react={op1} cur={op1 * 0.7} o={op1} />
          <Face x={540 + 300 * op1} y={820 - 330 * op1} s={1.05 - 0.7 * op1} rot={-12 * op1} t={t} o={1} />
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={400} y={460} text="¡UNA CELDA QUÍMICA!" size={42} color={K.flow} box o={L(1, "minipila")} />
      </Scene>

      {/* 2 · la promesa: celda con dos electrodos que genera electricidad */}
      <Scene {...sc(2)}>
        <SVG>
          <Cell x={CX} y={CY} s={CS} t={t} gas={R(2, "entra")} react={R(2, "genera")} cur={R(2, "genera", 0.8)} hi={t > Wd(2, "electrodos") ? "work" : ""} />
        </SVG>
        {chip(2, "LA CELDA")}
        <Label x={400} y={460} text="DOS ELECTRODOS" size={42} color={K.flow} box o={L(2, "electrodos")} />
        <Label x={400} y={1115} text="ENTRA MONÓXIDO" size={40} color={K.white} box o={L(2, "entra")} />
        <Label x={840} y={1000} text="ELECTRICIDAD" size={38} color={K.flow} box o={L(2, "genera")} />
      </Scene>

      {/* 3 · la idea clave: no se huele, pero la reacción genera una corriente que se mide */}
      <Scene {...sc(3)}>
        <SVG>
          <Mol x={300} y={820} s={5} rot={-8} />
          <Nose x={300} y={560} s={1.6} />
          <Cross x={300} y={580} r={70} p={R(3, "huele", 0.3)} />
          <path d="M440,820 H600" stroke={K.flow} strokeWidth={9} strokeLinecap="round" strokeDasharray="14 12" strokeDashoffset={-t * 60} opacity={dimTo(3, "reaccionar")} />
          <path d="M600,820 l-26,-18 v36 z" fill={K.flow} opacity={dimTo(3, "reaccionar")} />
          <Meter x={780} y={820} r={150} v={0.12 + 0.75 * R(3, "mide", 0.9)} o={dimTo(3, "corriente")} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={300} y={1060} text="NO SE HUELE" size={42} color={K.white} box o={L(3, "huele")} />
        <Label x={780} y={1060} text="SÍ SE MIDE" size={42} color={K.flow} box o={L(3, "mide")} />
      </Scene>

      {/* 4 · primero: el aire llega por la barrera porosa al electrodo de trabajo */}
      <Scene {...sc(4)}>
        <SVG>
          <Cell x={CX} y={CY} s={CS} t={t} gas={dimTo(4, "aire")} react={0} cur={0} hi={t > Wd(4, "electrodo") ? "work" : t > Wd(4, "barrera") ? "barrier" : ""} />
        </SVG>
        {chip(4, "1 · LA ENTRADA", K.cold)}
        <Label x={400} y={460} text="BARRERA POROSA" size={42} color={K.flow} box o={L(4, "barrera", Wd(4, "electrodo") - 0.05)} />
        <Label x={400} y={460} text="ELECTRODO DE TRABAJO" size={40} color={K.flow} box o={span(t, Wd(4, "electrodo") + 0.3, E(4))} />
        <Label x={400} y={1115} text="AIRE DE LA HABITACIÓN" size={38} color={K.white} box o={L(4, "aire")} />
      </Scene>

      {/* 5 · segundo: el CO se oxida y suelta electrones; en el otro se consume oxígeno */}
      <Scene {...sc(5)}>
        <SVG>
          <Cell x={CX} y={CY} s={CS} t={t} gas={1} react={R(5, "oxida")} cur={R(5, "electrones", 0.6)} hi="work" />
        </SVG>
        {chip(5, "2 · LA REACCIÓN", K.hot)}
        <Label x={400} y={460} text="EL CO SE OXIDA" size={42} color={K.flow} box o={L(5, "oxida")} />
        <Label x={840} y={1000} text="ELECTRONES" size={38} color={K.flow} box o={L(5, "electrones")} />
        <Label x={400} y={1115} text="OTRO LADO: SE CONSUME OXÍGENO" size={36} color={K.cold} box o={L(5, "otro")} />
      </Scene>

      {/* 6 · tercero: más monóxido, más corriente */}
      <Scene {...sc(6)}>
        <SVG>
          <Linear x={200} y={520} w={640} h={470} p={0.05 + 0.9 * R(6, "cuanto", 3.4)} />
          <Meter x={760} y={620} r={80} v={0.05 + 0.9 * R(6, "cuanto", 3.4)} />
        </SVG>
        {chip(6, "3 · LA CORRIENTE", K.flow)}
        <Label x={520} y={1065} text="MÁS GAS →" size={40} color={K.white} box o={L(6, "monoxido")} />
        <Label x={330} y={470} text="MÁS CORRIENTE ↑" size={40} color={K.flow} box o={L(6, "circula")} />
      </Scene>

      {/* 7 · cuarto: la alarma según gas y tiempo */}
      <Scene {...sc(7)}>
        <SVG>
          <AlarmCurve x={180} y={520} w={660} h={470} p1={R(7, "mucho", 0.8)} p2={ramp(t, Wd(7, "poco"), Wd(7, "poco") + 3.2)} />
        </SVG>
        {chip(7, "4 · LA ALARMA", K.warn)}
        <Label x={300} y={470} text="GAS ↑" size={38} color={K.white} box o={L(7, "gas")} />
        <Label x={700} y={1065} text="TIEMPO →" size={38} color={K.white} box o={L(7, "tiempo")} />
        <Stamp x={640} y={600} text="¡ENSEGUIDA!" size={46} p={R(7, "enseguida", 0.3)} />
        <Label x={580} y={800} text="POCO GAS: TARDA" size={38} color={K.white} box o={L(7, "poco")} />
      </Scene>

      {/* 8 · no sustituye al detector de humo */}
      <Scene {...sc(8)}>
        <SVG>
          <MiniChamber x={270} y={760} s={0.72} t={t} />
          <Cell x={770} y={760} s={0.42} t={t} gas={1} react={1} cur={0.6} meter={false} />
        </SVG>
        {chip(8, "NO ES LO MISMO")}
        <Label x={270} y={460} text="HUMO = LUZ" size={42} color={K.flow} box o={L(8, "humo")} />
        <Label x={770} y={460} text="CO = QUÍMICA" size={42} color={K.cold} box o={L(8, "quimica")} />
        <Label x={540} y={1115} text="PELIGROS DISTINTOS" size={42} color={K.white} box o={L(8, "peligro")} />
      </Scene>

      {/* 9 · curiosidad: el botón de prueba no comprueba el sensor */}
      <Scene {...sc(9)}>
        <SVG>
          <Face x={330} y={780} s={0.62} t={t} press={span(t, Wd(9, "prueba"), Wd(9, "solo"), 0.2)} alarm={span(t, Wd(9, "prueba"), Wd(9, "solo"), 0.2)} />
          <Finger x={330} y={780 + 40 + 330 * (1 - span(t, Wd(9, "prueba") - 0.3, Wd(9, "solo"), 0.4))} o={span(t, Wd(9, "prueba") - 0.3, Wd(9, "solo"), 0.4)} />
        </SVG>
        {chip(9, "CURIOSIDAD")}
        <Label x={760} y={600} text="SENSOR ✗" size={40} color={K.warn} box o={L(9, "sensor")} />
        <Label x={760} y={700} text="PILA ✓" size={40} color={K.cold} box o={L(9, "pila")} />
        <Label x={760} y={800} text="ELECTRÓNICA ✓" size={38} color={K.cold} box o={L(9, "electronica")} />
        <Label x={760} y={900} text="ZUMBADOR ✓" size={38} color={K.cold} box o={L(9, "zumbador")} />
      </Scene>

      {/* 10 · otra: el sensor se gasta, de dos a cinco años */}
      <Scene {...sc(10)}>
        <SVG>
          <Cell x={540} y={730} s={0.72} t={t} gas={0.6} react={0.4} cur={0.3} meter={false} aging={R(10, "gasta", 1.5)} />
          <g transform="translate(140,1040)">
            <rect x={0} y={-12} width={800} height={24} rx={12} fill="rgba(6,16,31,0.85)" stroke={C.case3} strokeWidth={4} />
            <rect x={160} y={-12} width={640 * ramp(t, Wd(10, "dos"), Wd(10, "cinco") + 0.4)} height={24} rx={12} fill={K.flow} />
            {[1, 2, 3, 4, 5].map((k) => <text key={k} x={(k - 1) * 200} y={-30} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={30} fill={K.white}>{k}</text>)}
          </g>
        </SVG>
        {chip(10, "OTRA")}
        <Label x={540} y={440} text="DE 2 A 5 AÑOS" size={42} color={K.flow} box o={L(10, "dos")} />
        <Label x={540} y={1115} text="LO MARCA EL FABRICANTE" size={38} color={K.white} box o={L(10, "fabricante")} />
      </Scene>

      {/* 11 · truco: junto a los dormitorios; no en la cocina ni sobre un aparato que queme */}
      <Scene {...sc(11)}>
        <SVG>
          <Plan x={120} y={500} t={t} />
          <g opacity={dimTo(11, "dormitorios")}><Det x={250} y={560} r={30} /></g>
          <Cross x={550} y={640} r={32} p={R(11, "cocina", 0.3)} />
          <g opacity={R(11, "cocina", 0.3)}><Det x={550} y={640} r={30} color={C.case3} /></g>
          <Cross x={875} y={500} r={28} p={R(11, "aparato", 0.3)} />
          <g opacity={R(11, "aparato", 0.3)}><Det x={875} y={500} r={26} color={C.case3} /></g>
        </SVG>
        {chip(11, "TRUCO")}
        <Label x={300} y={1065} text="DORMITORIOS ✓" size={38} color={K.cold} box o={L(11, "dormitorios")} />
        <Label x={730} y={1065} text="COCINA ✗" size={38} color={K.warn} box o={L(11, "cocina")} />
      </Scene>

      {/* 12 · cierre: gas → corriente → alarma */}
      <Scene {...sc(12)}>
        <SVG>
          <g opacity={dimTo(12, "gas")}><Mol x={200} y={760} s={3} /></g>
          <path d="M300,760 H380" stroke={K.flow} strokeWidth={8} strokeDasharray="12 10" strokeDashoffset={-t * 60} opacity={dimTo(12, "corriente")} />
          <Meter x={540} y={760} r={110} v={0.2 + 0.7 * R(12, "corriente", 0.8)} o={dimTo(12, "corriente")} />
          <path d="M660,760 H740" stroke={K.flow} strokeWidth={8} strokeDasharray="12 10" strokeDashoffset={-t * 60} opacity={dimTo(12, "alarma")} />
          <g opacity={dimTo(12, "alarma")}><Face x={880} y={760} s={0.36} t={t} alarm={R(12, "alarma", 0.3)} /></g>
        </SVG>
        {chip(12, "RESUMEN")}
        <Label x={200} y={940} text="GAS" size={40} color={cur12 === 0 ? K.flow : K.white} box o={dimTo(12, "gas")} />
        <Label x={540} y={940} text="CORRIENTE" size={40} color={cur12 === 1 ? K.flow : K.white} box o={dimTo(12, "corriente")} />
        <Label x={880} y={940} text="ALARMA" size={40} color={cur12 === 2 ? K.flow : K.white} box o={dimTo(12, "alarma")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
