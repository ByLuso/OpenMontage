// Episodio 172 · Cómo funciona el secamanos (2D, plantilla de la serie). Aparatos genéricos, sin marcas.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en Secamanos.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, FONT, ramp, span, useTiming } from "./kit2d/Kit";
import { C, Dryer, Hand, Timer, HairDryer, SensorClose, PatentDoc, Pedal, Study, Coin, Cross, Flow } from "./Secamanos";

export const COMP_ID = "Secamanos";
export const HOOK = "Te seca a soplidos"; // = meta.portada (≤5 palabras, la última va en amarillo)
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
  /** Etiqueta desde la palabra w del beat i hasta el final de la escena (o hasta `until`). */
  const L = (i: number, w: string, until?: number) => span(t, Wd(i, w), until ?? E(i));
  /** Atenuado (0,35) hasta la palabra y luego entero: para lo que «entra después». */
  const dimTo = (i: number, w: string) => 0.35 + 0.65 * ramp(t, Wd(i, w), Wd(i, w) + 0.35);
  const R = (i: number, w: string, d = 0.4) => ramp(t, Wd(i, w), Wd(i, w) + d);
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(S(i), i === 1 ? 1.8 : 0), E(i))} />;

  // beat 10: gráfica potencia × tiempo (área = energía gastada). Origen (200, 1050).
  const ox = 200, oy = 1050, pxS = 16, pxW = 0.208;
  const hP = R(10, "potencia", 0.6), wT = R(10, "dura", 0.9);
  // beat 13: resumen, se resalta cada parte al nombrarla
  const resW = ["sensor", "calor", "aire"];
  const curR = resW.reduce((acc, w, k) => (t >= Wd(13, w) ? k : acc), -1);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el secamanos GRANDE desde el fotograma 0; en «moderno» se levanta la tapa y aparece el motor; en «arranca» sopla y salen las gotas */}
      <Scene {...sc(1)}>
        <SVG>
          <Dryer kind="jet" cy={620} s={1.1} t={t} open={R(1, "moderno", 0.6)} spin={0.15 + 0.85 * R(1, "moderno")} flow={R(1, "arranca")} flowLen={110} sensor={1} />
          <Hand x={540} y={1010} s={0.8} t={t} wet={1 - 0.7 * R(1, "arranca", 1.2)} blow={R(1, "arranca")} />
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={540} y={620} text="¿SECA CON CALOR?" size={50} box o={span(t, 1.8, Wd(1, "equivocados"))} />
        <div style={{ opacity: 1 - ramp(t, Wd(1, "moderno") - 0.1, Wd(1, "moderno") + 0.2) }}>
          <Stamp x={540} y={620} text="¡NO SIEMPRE!" size={64} p={ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.3)} />
        </div>
        <Label x={540} y={1110} text="¡A SOPLIDOS!" size={50} color={K.cold} box o={L(1, "soplidos")} />
      </Scene>

      {/* 2 · la promesa: no manda una resistencia, sino un motor rapidísimo que dispara aire por una ranura */}
      <Scene {...sc(2)}>
        <SVG>
          <Dryer kind="jet" cy={630} s={1.15} t={t} open={1} spin={0.3 + 0.7 * R(2, "motor")} motorHi={span(t, Wd(2, "motor"), Wd(2, "ranura"))} flow={R(2, "dispara")} flowLen={120} slit={R(2, "ranura")} sensor={1} />
          <Cross x={760} y={1010} s={0.5} p={span(t, Wd(2, "resistencia") + 0.3, Wd(2, "sino"), 0.25)} />
        </SVG>
        {chip(2, "EL SECRETO")}
        <Label x={540} y={1010} text="¿RESISTENCIA?" size={46} color={K.warn} box o={span(t, Wd(2, "resistencia"), Wd(2, "sino"))} />
        <Label x={540} y={1010} text="MOTOR RAPIDÍSIMO" size={46} color={K.hot} box o={span(t, Wd(2, "motor"), Wd(2, "ranura"))} />
        <Label x={540} y={1010} text="RANURA" size={50} color={K.flow} box o={L(2, "ranura")} />
      </Scene>

      {/* 3 · la idea clave: evaporar con calor o arrancar de un soplido */}
      <Scene {...sc(3)}>
        <SVG>
          <g opacity={dimTo(3, "evaporar")}>
            <Dryer kind="warm" cx={290} cy={540} s={0.62} t={t} open={1} spin={1} heat={1} flow={1} flowLen={150} />
            <Hand x={290} y={900} s={0.6} t={t} wet={0.8} vapor={R(3, "evaporar")} />
          </g>
          <g opacity={dimTo(3, "arrancarla")}>
            <Dryer kind="jet" cx={770} cy={540} s={0.62} t={t} open={1} spin={1} flow={1} flowLen={170} />
            <Hand x={770} y={900} s={0.6} t={t} wet={0.6} blow={R(3, "arrancarla")} />
          </g>
          <line x1={530} y1={440} x2={530} y2={1100} stroke={C.case3} strokeWidth={4} strokeDasharray="14 14" opacity={0.5} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={290} y={1110} text="EVAPORAR" size={44} color={K.hot} box o={L(3, "evaporar")} />
        <Label x={770} y={1110} text="ARRANCAR" size={44} color={K.cold} box o={L(3, "arrancarla")} />
      </Scene>

      {/* 4 · primero: el sensor de infrarrojos (emisor → mano → receptor) enciende el aparato */}
      <Scene {...sc(4)}>
        <SVG>
          <SensorClose t={t} beam={R(4, "lanza", 0.6)} bounce={ramp(t, Wd(4, "reflejan"), Wd(4, "reflejan") + 0.6)} on={R(4, "enciende")} handY={800} />
          <Hand x={540} y={960} s={0.9} t={t} wet={0.7} o={dimTo(4, "manos")} />
        </SVG>
        {chip(4, "1 · EL SENSOR")}
        <Label x={250} y={660} text="EMISOR" size={40} color={K.flow} box o={L(4, "emisor")} />
        <Label x={830} y={660} text="RECEPTOR" size={40} color={K.flow} box o={L(4, "reflejan")} />
        <Label x={540} y={1110} text="¡SE ENCIENDE!" size={46} color={K.cold} box o={L(4, "enciende")} />
      </Scene>

      {/* 5 · segundo: el de calor = ventilador + resistencia, como un secador de pelo */}
      <Scene {...sc(5)}>
        <SVG>
          <Dryer kind="warm" cy={680} s={1.1} t={t} open={1} spin={0.2 + 0.8 * R(5, "ventilador")} flow={R(5, "empuja")} heat={0.3 * R(5, "resistencia") + 0.7 * R(5, "calienta")} flowLen={160} />
          <HairDryer x={720} y={1060} s={0.75} t={t} o={dimTo(5, "secador")} />
        </SVG>
        {chip(5, "2 · EL DE CALOR", K.hot)}
        <Label x={370} y={445} text="VENTILADOR" size={40} color={K.white} box o={L(5, "ventilador")} />
        <Label x={720} y={445} text="RESISTENCIA" size={40} color={K.hot} box o={L(5, "resistencia")} />
        <Label x={270} y={1060} text="COMO UN SECADOR" size={38} color={K.white} box o={L(5, "secador")} />
      </Scene>

      {/* 6 · el aire templado evapora el agua poco a poco: unos 40 s */}
      <Scene {...sc(6)}>
        <SVG>
          {[-90, 0, 90].map((dx, i) => <Flow key={i} d={`M${470 + dx},420 q 24,40 0,80 t 0,80`} t={t} color={K.hot} w={8} o={0.8} speed={90} />)}
          <Hand x={500} y={850} s={1.35} t={t} wet={1 - 0.8 * ramp(t, Wd(6, "evapora"), E(6))} vapor={0.4 + 0.6 * R(6, "evapora")} />
          <Timer x={860} y={520} r={80} p={ramp(t, Wd(6, "tardas"), E(6) - 0.3)} text={t >= Wd(6, "cuarenta") ? "≈ 40 s" : ""} color={K.hot} o={dimTo(6, "tardas")} />
        </SVG>
        {chip(6, "2 · SE EVAPORA", K.hot)}
        <Label x={200} y={480} text="VAPOR" size={42} color={K.white} box o={L(6, "evapora")} />
        <Label x={190} y={1060} text="POCO A POCO" size={38} color={K.white} box o={L(6, "poco")} />
      </Scene>

      {/* 7 · tercero: el de cuchilla, motor de decenas de miles de rpm que aspira aire */}
      <Scene {...sc(7)}>
        <SVG>
          <Dryer kind="jet" cy={700} s={1.25} t={t} open={1} spin={0.3 + 0.7 * R(7, "motor")} motorHi={R(7, "motor")} intake={R(7, "aspira")} flow={R(7, "aspira")} flowLen={60} />
        </SVG>
        {chip(7, "3 · EL DE CUCHILLA", K.cold)}
        <Label x={540} y={400} text="ASPIRA AIRE" size={42} color={K.cold} box o={L(7, "aspira")} />
        <Label x={540} y={1040} text="DECENAS DE MILES" size={50} color={K.hot} box o={L(7, "decenas")} />
        <Label x={540} y={1110} text="DE VUELTAS POR MINUTO" size={36} color={K.white} box o={L(7, "vueltas")} />
      </Scene>

      {/* 8 · cuarto: la rendija finísima acelera el aire a más de 300 km/h */}
      <Scene {...sc(8)}>
        <SVG>
          <path d="M100,500 L520,500 L720,688 L720,712 L520,900 L100,900 Z" fill={C.inner} stroke={C.case3} strokeWidth={8} strokeLinejoin="round" />
          <path d="M60,470 L540,470 L760,676 L760,724 L540,930 L60,930" fill="none" stroke={C.case2} strokeWidth={22} strokeLinejoin="round" opacity={0.8} />
          {[600, 700, 800].map((y, i) => <Flow key={i} d={`M140,${y} L480,${y + (700 - y) * 0.3} L700,700`} t={t} w={9} speed={140} o={0.9} />)}
          {(() => { const j = R(8, "sale", 0.5); return j > 0.01 && (
            <g opacity={j}>
              <path d={`M720,700 L${720 + 290 * j},700`} stroke={K.flow} strokeOpacity={0.3} strokeWidth={30} strokeLinecap="round" />
              <path d={`M720,700 L${720 + 290 * j},700`} stroke={K.flow} strokeWidth={12} strokeLinecap="round" strokeDasharray="40 20" strokeDashoffset={-t * 900} />
            </g>); })()}
          {(() => { const o = R(8, "rendija"); return o > 0.01 && <circle cx={724} cy={700} r={46} fill="none" stroke={K.flow} strokeWidth={6} opacity={o} />; })()}
        </SVG>
        {chip(8, "4 · LA RANURA")}
        <Label x={320} y={700} text="AIRE A PRESIÓN" size={36} color={K.cold} box o={span(t, S(8), E(8))} />
        <Label x={760} y={580} text="RENDIJA FINÍSIMA" size={40} color={K.flow} box o={L(8, "rendija")} />
        <Label x={540} y={1050} text="MÁS DE 300 km/h" size={66} color={K.flow} box o={L(8, "trescientos")} />
      </Scene>

      {/* 9 · la lámina de aire raspa el agua como una rasqueta: unos 10 s */}
      <Scene {...sc(9)}>
        <SVG>
          {(() => { const sc9 = ramp(t, Wd(9, "raspa"), Wd(9, "diez") + 0.3); const active = t > Wd(9, "raspa") && t < Wd(9, "listo");
            return <Hand x={540} y={820} s={1.3} t={t} wet={1} scan={t >= Wd(9, "listo") ? 1.01 : t > Wd(9, "raspa") ? sc9 : -1} blow={active ? 1 : 0} />; })()}
          <Timer x={870} y={500} r={70} p={ramp(t, Wd(9, "raspa"), Wd(9, "listo"))} text={t >= Wd(9, "diez") ? "≈ 10 s" : ""} color={K.cold} o={dimTo(9, "diez")} />
        </SVG>
        {chip(9, "4 · RASPA EL AGUA")}
        <Label x={230} y={470} text="LÁMINA DE AIRE" size={38} color={K.cold} box o={L(9, "lamina")} />
        <Label x={210} y={1000} text="¡LISTO!" size={54} color={K.flow} box o={L(9, "listo")} />
      </Scene>

      {/* 10 · potencia × tiempo: el de cuchilla gasta mucho menos */}
      <Scene {...sc(10)}>
        <SVG>
          <rect x={ox} y={oy - 520 * hP} width={Math.max(60, 640 * wT)} height={520 * hP} fill={K.hot} opacity={0.75} stroke={C.ink} strokeWidth={4} />
          <rect x={ox} y={oy - 1000 * pxW * hP} width={Math.max(60, 12 * pxS * wT)} height={1000 * pxW * hP} fill={K.cold} stroke={C.ink} strokeWidth={4}
            style={t > Wd(10, "menos") ? { filter: `drop-shadow(0 0 ${14 * R(10, "menos")}px ${K.cold})` } : undefined} />
          <line x1={ox} y1={oy} x2={960} y2={oy} stroke={K.white} strokeWidth={6} />
          <line x1={ox} y1={oy} x2={ox} y2={430} stroke={K.white} strokeWidth={6} />
          <text x={ox + 30} y={oy - 520 * hP + 60} fontFamily={FONT} fontWeight={900} fontSize={44} fill={C.ink} opacity={hP * ramp(t, Wd(10, "dura") + 0.4, Wd(10, "dura") + 0.8)}>CALOR</text>
          <text x={ox + 12} y={oy - 1000 * pxW * hP - 18} fontFamily={FONT} fontWeight={900} fontSize={38} fill={K.cold} stroke={C.ink} strokeWidth={6} paintOrder="stroke" opacity={hP}>CUCHILLA</text>
        </SVG>
        {chip(10, "EL CONSUMO")}
        <Label x={330} y={440} text="POTENCIA" size={40} color={K.white} box o={L(10, "potencia")} />
        <Label x={620} y={1110} text="TIEMPO →" size={40} color={K.white} box o={L(10, "dura")} />
        <Label x={720} y={470} text="¡MUCHO MENOS!" size={44} color={K.cold} box o={L(10, "menos")} />
      </Scene>

      {/* 11 · curiosidad: patentado en 1922 en EE. UU.; se encendía con un pedal */}
      <Scene {...sc(11)}>
        <SVG>
          <PatentDoc x={330} y={690} s={0.85} />
          <Pedal x={790} y={780} s={1.1} p={t > Wd(11, "pedal") ? 0.5 + 0.5 * Math.sin((t - Wd(11, "pedal")) * 6 - Math.PI / 2) : 0} o={dimTo(11, "pedal")} />
        </SVG>
        {chip(11, "CURIOSIDAD")}
        <Stamp x={330} y={1060} text="1922" size={76} rot={-8} p={ramp(t, Wd(11, "1922"), Wd(11, "1922") + 0.35)} />
        <Label x={790} y={470} text="EE. UU." size={46} color={K.white} box o={L(11, "estados")} />
        <Label x={790} y={1000} text="CON PEDAL" size={42} color={K.flow} box o={L(11, "pedal")} />
      </Scene>

      {/* 12 · otra: ¿cuál es más higiénico? Los estudios discrepan y muchos los paga la industria */}
      <Scene {...sc(12)}>
        <SVG>
          <Study x={300} y={740} ok={true} v={R(12, "discrepan")} o={dimTo(12, "estudios")} />
          <Study x={780} y={740} ok={false} v={R(12, "discrepan")} o={dimTo(12, "estudios")} />
          <Coin x={300} y={985} t={t} o={R(12, "pagan")} />
          <Coin x={780} y={985} t={t + 1} o={R(12, "pagan")} />
        </SVG>
        {chip(12, "OTRA")}
        <Label x={540} y={440} text="¿MÁS HIGIÉNICO?" size={48} color={K.white} box o={L(12, "higienico")} />
        <Label x={300} y={1095} text="SECAMANOS" size={40} color={K.flow} box o={L(12, "fabricantes")} />
        <Label x={780} y={1095} text="PAPEL" size={40} color={K.flow} box o={L(12, "papel")} />
      </Scene>

      {/* 13 · cierre: resumen */}
      <Scene {...sc(13)}>
        <SVG>
          <Dryer kind="warm" cx={290} cy={640} s={0.62} t={t} open={1} spin={1} heat={curR === 1 ? 1 : 0.4} flow={1} flowLen={200} sensor={curR === 0 ? 1 : 0} />
          <Dryer kind="jet" cx={770} cy={640} s={0.62} t={t} open={1} spin={1} flow={1} flowLen={200} slit={curR === 2 ? 1 : 0} sensor={curR === 0 ? 1 : 0} />
        </SVG>
        {chip(13, "RESUMEN")}
        <Label x={540} y={440} text="SENSOR" size={44} color={curR === 0 ? K.flow : K.white} box o={dimTo(13, "sensor")} />
        <Label x={290} y={1010} text="CALOR" size={46} color={curR === 1 ? K.hot : K.white} box o={dimTo(13, "calor")} />
        <Label x={770} y={1010} text="AIRE QUE RASPA" size={40} color={curR === 2 ? K.cold : K.white} box o={dimTo(13, "aire")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
