// Episodio 177 · Cómo funciona una linterna de manivela. 2D, plantilla de la serie.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Rotor, Coil, Led, Gen, Gear, Torch, Bar, Wave, Bat, Wheel, Cross, C } from "./Dinamo";

export const COMP_ID = "LinternaDinamo";
export const HOOK = "Dentro hay un generador"; // = meta.portada (≤5 palabras, la última va en amarillo)
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

  const crank = t * 220;      // la manivela da vueltas todo el vídeo
  const spin = t * 900;       // el imán gira mucho más rápido

  // beat 1: en «generador» la carcasa se vuelve transparente y se ve el imán
  const op1 = R(1, "generador", 0.8);
  // beat 3: el imán de barra va y viene por la bobina
  const mx = 540 + 190 * Math.sin(t * 2.2);
  const vel = Math.abs(Math.cos(t * 2.2));
  // beat 6: onda alterna -> rectificada
  const rect6 = R(6, "convierte", 0.6);
  // beat 8: barras de minutos
  const bar8 = R(8, "minuto", 1.2);
  // beat 9: la rueda gira hasta que «paras»
  const stop9 = R(9, "paras", 0.5);
  const wheelAng = (t - S(9)) * 300 * (1 - stop9);
  const lamp9 = 1 - ramp(t, Wd(9, "apaga") - 0.2, Wd(9, "apaga") + 0.2);
  // beat 10: la batería se gasta
  const soc10 = 1 - 0.75 * R(10, "gasta", 3);
  const resW = ["manivela", "iman", "bobina", "luz"];
  const cur11 = resW.reduce((acc, w, k) => (t >= Wd(11, w) ? k : acc), -1);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: la linterna GRANDE; en «generador» se ve el imán dentro */}
      <Scene {...sc(1)}>
        <SVG><Torch x={400} y={860} s={1.2} t={t} crank={crank} beam={0.7 * op1 + 0.15} open={op1} /></SVG>
        {chip(1, "POR DENTRO")}
        <Label x={420} y={640} text="¡UN GENERADOR!" size={44} color={K.flow} box o={L(1, "generador")} />
      </Scene>

      {/* 2 · la promesa: imán que gira entre bobinas de cobre */}
      <Scene {...sc(2)}>
        <SVG><Gen x={540} y={690} s={1.35} t={t} spin={spin} cur={R(2, "genera", 0.7)} hi={t > Wd(2, "iman") ? "rotor" : ""} /></SVG>
        {chip(2, "EL GENERADOR")}
        <Label x={540} y={475} text="IMÁN QUE GIRA" size={42} color={K.cold} box o={L(2, "iman")} />
        <Label x={540} y={1125} text="BOBINAS DE COBRE" size={40} color={K.hot} box o={L(2, "bobinas")} />
      </Scene>

      {/* 3 · la idea clave: imán en movimiento + cable = corriente (Faraday 1831) */}
      <Scene {...sc(3)}>
        <SVG>
          <Bar x={mx} y={800} />
          <Coil x={540} y={800} w={230} h={270} glow={vel * R(3, "crea", 0.4)} />
          <Bar x={mx} y={800} />
          <path d="M425,700 V600 H500 M655,700 V600 H580" fill="none" stroke={C.case3} strokeWidth={8} strokeLinejoin="round" />
          <Led x={540} y={590} s={0.8} on={vel * R(3, "crea", 0.4)} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={540} y={470} text="IMÁN EN MOVIMIENTO" size={40} color={K.cold} box o={L(3, "movimiento")} />
        <Label x={540} y={985} text="= CORRIENTE" size={44} color={K.flow} box o={L(3, "crea")} />
        <Stamp x={620} y={1095} text="FARADAY · 1831" size={38} color={K.flow} rot={-5} p={R(3, "faraday", 0.35)} />
      </Scene>

      {/* 4 · primero: la manivela da vueltas despacio y los engranajes hacen girar el imán más rápido */}
      <Scene {...sc(4)}>
        <SVG>
          <Gear x={260} y={780} r={150} n={18} ang={crank} />
          <Gear x={470} y={780} r={60} n={8} ang={-crank * 2.5 + 11} color={C.case3} />
          <path d="M470,780 H690" stroke={C.case3} strokeWidth={14} strokeLinecap="round" />
          <Rotor x={760} y={780} r={70} ang={spin * 0.6} />
          <path d={`M260,780 L${260 + 110 * Math.cos((crank * Math.PI) / 180)},${780 + 110 * Math.sin((crank * Math.PI) / 180)}`} stroke={K.flow} strokeWidth={14} strokeLinecap="round" />
          <circle cx={260 + 110 * Math.cos((crank * Math.PI) / 180)} cy={780 + 110 * Math.sin((crank * Math.PI) / 180)} r={22} fill={K.flow} stroke={C.dark} strokeWidth={5} />
        </SVG>
        {chip(4, "1 · LA MANIVELA", K.flow)}
        <Label x={260} y={600} text="DESPACIO" size={40} color={K.white} box o={L(4, "despacio")} />
        <Label x={540} y={1000} text="ENGRANAJES" size={42} color={K.cold} box o={L(4, "engranajes")} />
        <Label x={760} y={600} text="MUY RÁPIDO" size={40} color={K.warn} box o={L(4, "muchisimo")} />
      </Scene>

      {/* 5 · segundo: inducción; el imán pasa junto a las bobinas y empuja los electrones */}
      <Scene {...sc(5)}>
        <SVG><Gen x={540} y={690} s={1.35} t={t} spin={spin} cur={R(5, "empuja", 0.6)} /></SVG>
        {chip(5, "2 · LA INDUCCIÓN", K.hot)}
        <Label x={540} y={475} text="EL IMÁN PASA JUNTO A LA BOBINA" size={36} color={K.cold} box o={L(5, "vuelta")} />
        <Label x={540} y={1125} text="ELECTRONES EN MOVIMIENTO" size={38} color={K.flow} box o={L(5, "electrones")} />
      </Scene>

      {/* 6 · tercero: el rectificador deja la corriente en una sola dirección */}
      <Scene {...sc(6)}>
        <SVG>
          <Wave x1={70} x2={360} y={760} amp={60} t={t} kind="ac" cycles={2} o={dimTo(6, "sube")} />
          <g opacity={dimTo(6, "rectificador")}>
            <rect x={400} y={680} width={160} height={160} rx={20} fill={C.case1} stroke={rect6 > 0.2 ? K.flow : C.case3} strokeWidth={7} />
            <path d="M440,760 H470 M470,725 V795 L510,760 Z M510,725 V795 M510,760 H530" fill="none" stroke={K.white} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <Wave x1={610} x2={900} y={800} amp={60} t={t} kind="rect" cycles={2} o={rect6} />
        </SVG>
        {chip(6, "3 · EL RECTIFICADOR", K.cold)}
        <Label x={215} y={900} text="SUBE Y BAJA" size={36} color={K.hot} box o={L(6, "sube")} />
        <Label x={480} y={620} text="RECTIFICADOR" size={38} color={K.white} box o={L(6, "rectificador")} />
        <Label x={755} y={900} text="UNA DIRECCIÓN" size={36} color={K.flow} box o={L(6, "direccion")} />
      </Scene>

      {/* 7 · cuarto: se guarda en una batería y alimenta un LED */}
      <Scene {...sc(7)}>
        <SVG>
          <Gen x={190} y={700} s={0.5} t={t} spin={spin} cur={1} lamp={false} />
          <path d="M290,700 H420" stroke={K.flow} strokeWidth={8} strokeDasharray="10 14" strokeDashoffset={-t * 70} />
          <Bat x={520} y={700} s={0.9} soc={0.2 + 0.7 * R(7, "guarda", 2.5)} o={dimTo(7, "bateria")} />
          <path d="M620,700 H750" stroke={K.flow} strokeWidth={8} strokeDasharray="10 14" strokeDashoffset={-t * 70} opacity={dimTo(7, "alimenta")} />
          <Led x={840} y={700} s={1} on={R(7, "alimenta", 0.4)} o={dimTo(7, "led")} />
        </SVG>
        {chip(7, "4 · EL ALMACÉN", K.flow)}
        <Label x={520} y={830} text="BATERÍA" size={40} color={K.white} box o={L(7, "bateria")} />
        <Label x={840} y={830} text="LED" size={40} color={K.flow} box o={L(7, "led")} />
      </Scene>

      {/* 8 · curiosidad: un minuto de manivela, de unos minutos a casi una hora */}
      <Scene {...sc(8)}>
        <SVG>
          <g transform="translate(140,620)">
            <rect x={0} y={0} width={640} height={60} rx={14} fill="rgba(6,16,31,0.85)" stroke={C.case3} strokeWidth={4} />
            <rect x={0} y={0} width={80 * bar8} height={60} rx={14} fill={K.flow} />
            <rect x={0} y={150} width={640} height={60} rx={14} fill="rgba(6,16,31,0.85)" stroke={C.case3} strokeWidth={4} />
            <rect x={0} y={150} width={640 * bar8} height={60} rx={14} fill={K.flow} opacity={ramp(t, Wd(8, "casi"), Wd(8, "casi") + 0.5)} />
          </g>
          <g transform="translate(900,700)"><circle r={46} fill="none" stroke={K.white} strokeWidth={8} /><path d="M0,-30 V0 L22,14" stroke={K.white} strokeWidth={8} strokeLinecap="round" fill="none" /></g>
        </SVG>
        {chip(8, "CURIOSIDAD")}
        <Label x={540} y={490} text="1 MINUTO DE MANIVELA" size={40} color={K.white} box o={L(8, "minuto")} />
        <Label x={420} y={745} text="UN MODELO: UNOS MINUTOS" size={32} color={K.flow} box o={L(8, "pocos")} />
        <Label x={420} y={895} text="OTRO: CASI UNA HORA" size={32} color={K.flow} box o={L(8, "casi")} />
        <Label x={540} y={1060} text="DEPENDE DEL MODELO" size={42} color={K.white} box o={L(8, "modelo")} />
      </Scene>

      {/* 9 · otra: la dinamo de bici es igual; si paras, se apaga */}
      <Scene {...sc(9)}>
        <SVG>
          <Wheel x={360} y={800} r={190} ang={wheelAng} />
          <rect x={330} y={578} width={80} height={60} rx={12} fill={C.case2} stroke={C.dark} strokeWidth={4} />
          <circle cx={370} cy={612} r={20} fill={C.case3} stroke={C.dark} strokeWidth={4} />
          <path d="M410,600 C540,520 640,560 740,640" fill="none" stroke={C.case3} strokeWidth={8} />
          <path d="M770,640 L940,540 L940,740 Z" fill={K.flow} opacity={0.25 * lamp9} />
          <Led x={770} y={640} s={0.8} on={lamp9} />
        </SVG>
        {chip(9, "OTRA")}
        <Label x={370} y={1060} text="LA RUEDA HACE DE MANIVELA" size={34} color={K.white} box o={L(9, "rueda")} />
        <Label x={760} y={820} text="SI PARAS, SE APAGA" size={34} color={K.warn} box o={L(9, "paras")} />
      </Scene>

      {/* 10 · otra: la batería se gasta, 300-500 cargas */}
      <Scene {...sc(10)}>
        <SVG><Bat x={540} y={720} s={1.8} soc={soc10} /></SVG>
        {chip(10, "OTRA")}
        <Label x={540} y={520} text="SE GASTA CON LAS CARGAS" size={40} color={K.white} box o={L(10, "gasta")} />
        <Label x={540} y={930} text="300-500 CARGAS" size={46} color={K.flow} box o={L(10, "trescientas")} />
        <Label x={540} y={1040} text="LUEGO, CAMBIARLA" size={40} color={K.warn} box o={L(10, "cambiarla")} />
      </Scene>

      {/* 11 · cierre: manivela → imán → bobina → luz */}
      <Scene {...sc(11)}>
        <SVG>
          <g opacity={dimTo(11, "manivela")}><Gear x={150} y={720} r={80} n={14} ang={crank} /></g>
          <g opacity={dimTo(11, "iman")}><Rotor x={400} y={720} r={58} ang={spin} /></g>
          <g opacity={dimTo(11, "bobina")}><Coil x={650} y={720} w={80} h={150} glow={cur11 >= 2 ? 1 : 0} /></g>
          <g opacity={dimTo(11, "luz")}><Led x={890} y={720} s={0.9} on={cur11 >= 3 ? 1 : 0} /></g>
        </SVG>
        {chip(11, "RESUMEN")}
        <Label x={150} y={860} text="MANIVELA" size={30} color={cur11 === 0 ? K.flow : K.white} box o={dimTo(11, "manivela")} />
        <Label x={400} y={860} text="IMÁN" size={34} color={cur11 === 1 ? K.flow : K.white} box o={dimTo(11, "iman")} />
        <Label x={650} y={860} text="BOBINA" size={34} color={cur11 === 2 ? K.flow : K.white} box o={dimTo(11, "bobina")} />
        <Label x={890} y={860} text="LUZ" size={34} color={cur11 === 3 ? K.flow : K.white} box o={dimTo(11, "luz")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
