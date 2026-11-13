// Episodio 138 · Cómo funciona el ventilador sin aspas (2D, plantilla de la serie). Aro genérico, sin marcas.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en SinAspas.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Fan, Section, Plane, BladeFan, BaseClose, SideView, Hand, PatentDoc, Shop, Flow, Head } from "./SinAspas";

export const COMP_ID = "SinAspas";
export const HOOK = "Sí que tiene aspas"; // = meta.portada (≤5 palabras, la última va en amarillo)
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

  // beat 13: resumen, se resalta cada parte al nombrarla
  const resW = ["turbina", "rendija", "arrastrado"];
  const curR = resW.reduce((acc, w, k) => (t >= Wd(13, w) ? k : acc), -1);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el ventilador GRANDE desde el fotograma 0; en «esconde» la carcasa del pie se aparta y aparece el rotor */}
      <Scene {...sc(1)}>
        <SVG>
          <Fan id="f1" t={t} open={R(1, "esconde", 0.6)} spin={0.2 + 0.8 * R(1, "esconde")} out={0.6} hi={t > Wd(1, "pie") ? "base" : ""} />
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={540} y={620} text="¿SIN ASPAS?" size={52} color={K.white} o={span(t, 1.8, Wd(1, "equivocados"))} />
        <Stamp x={540} y={620} text="¡FALSO!" size={70} p={ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.3)} />
        <Label x={230} y={960} text="¡AQUÍ!" size={50} color={K.flow} box o={L(1, "pie")} />
      </Scene>

      {/* 2 · la promesa: dentro del pie gira un rotor lleno de aspas, como una turbina */}
      <Scene {...sc(2)}>
        <SVG><BaseClose t={t} spin={0.3 + 0.7 * R(2, "gira")} rotorHi={span(t, Wd(2, "rotor"), Wd(2, "turbina"))} /></SVG>
        {chip(2, "EL SECRETO")}
        <Label x={540} y={730} text="ASPAS" size={46} color={K.flow} box o={span(t, Wd(2, "aspas"), Wd(2, "turbina"))} />
        <Label x={540} y={730} text="TURBINA PEQUEÑA" size={44} color={K.flow} box o={L(2, "turbina")} />
      </Scene>

      {/* 3 · la idea clave: no sopla con aspas, sino con un chorro finísimo que arrastra aire */}
      <Scene {...sc(3)}>
        <SVG>
          <BladeFan x={270} y={640} r={150} a={t * 500} cross={R(3, "aspas")} o={0.9} />
          <g opacity={dimTo(3, "chorro")}>
            <Section t={t} x0={560} y0={620} c={380} jet={R(3, "chorro")} xEnd={1000} />
            {[700, 760].map((y) => <Flow key={y} d={`M560,${y} L960,${y + 10}`} t={t} o={R(3, "arrastra")} w={8} />)}
          </g>
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={270} y={1000} text="ASPAS" size={44} color={K.warn} box o={L(3, "aspas")} />
        <Label x={760} y={470} text="CHORRO FINÍSIMO" size={38} color={K.flow} box o={L(3, "chorro")} />
        <Label x={760} y={820} text="+ ARRASTRE" size={40} color={K.cold} box o={L(3, "arrastra")} />
      </Scene>

      {/* 4 · primero: el motor gira el rotor, que aspira aire por la rejilla */}
      <Scene {...sc(4)}>
        <SVG>
          <Fan id="f4" t={t} open={1} spin={0.15 + 0.85 * R(4, "gira")} intake={R(4, "aspira")} hi={t > Wd(4, "base") && t < Wd(4, "motor") ? "base" : ""} />
        </SVG>
        {chip(4, "1 · LA BASE", K.hot)}
        <Label x={220} y={1100} text="MOTOR" size={40} color={K.hot} box o={L(4, "motor")} />
        <Label x={860} y={880} text="ROTOR" size={40} color={K.white} box o={L(4, "rotor")} />
        <Label x={220} y={880} text="REJILLA" size={40} color={K.cold} box o={L(4, "rejilla")} />
      </Scene>

      {/* 5 · segundo: el aire sube y llena el aro hueco */}
      <Scene {...sc(5)}>
        <SVG>
          <Fan id="f5" t={t} open={1} spin={1} intake={0.6} up={R(5, "sube")} fill={0.3 + 0.7 * R(5, "llena")} hi={t > Wd(5, "aro") && t < Wd(5, "sube") ? "ring" : ""} />
        </SVG>
        {chip(5, "2 · EL ARO")}
        <Label x={840} y={900} text="SUBE" size={42} color={K.cold} box o={L(5, "sube")} />
        <Label x={540} y={620} text="HUECO" size={56} color={K.cold} box o={L(5, "hueco")} />
      </Scene>

      {/* 6 · tercero: el aire escapa por una ranura de un milímetro */}
      <Scene {...sc(6)}>
        <SVG>
          <Section t={t} x0={170} y0={620} c={720} slit={R(6, "ranura")} jet={R(6, "escapa")} attach={0} cavity={1} xEnd={900} />
          {(() => { const o = R(6, "ranura"); return o > 0.01 && <g opacity={o}><path d="M220,840 L262,778" stroke={K.flow} strokeWidth={6} strokeLinecap="round" /><circle cx={282} cy={745} r={46} fill="none" stroke={K.flow} strokeWidth={5} /></g>; })()}
        </SVG>
        {chip(6, "3 · LA RENDIJA")}
        <Label x={350} y={470} text="ARO EN CORTE" size={38} color={K.white} box o={span(t, S(6), Wd(6, "escapa"))} />
        <Label x={220} y={890} text="≈ 1 mm" size={48} color={K.flow} box o={L(6, "milimetro")} />
        <Label x={680} y={470} text="¡A TODA VELOCIDAD!" size={42} color={K.flow} box o={L(6, "velocidad")} />
      </Scene>

      {/* 7 · el chorro se pega a la curva (perfil de ala): efecto Coandă */}
      <Scene {...sc(7)}>
        <SVG>
          <Section t={t} x0={170} y0={620} c={720} slit={0.4} jet={1} attach={R(7, "pega", 0.6)} xEnd={960} wing={span(t, Wd(7, "perfil"), Wd(7, "efecto"))} />
          <Plane x={790} y={1040} s={0.9} o={span(t, Wd(7, "ala"), Wd(7, "efecto"))} />
        </SVG>
        {chip(7, "3 · SE PEGA A LA CURVA")}
        <Label x={360} y={470} text="SE PEGA" size={44} color={K.flow} box o={L(7, "pega", Wd(7, "perfil"))} />
        <Label x={420} y={1040} text="PERFIL DE ALA" size={42} color={K.white} box o={span(t, Wd(7, "perfil"), Wd(7, "efecto"))} />
        <Label x={540} y={1040} text="EFECTO COANDA" size={52} color={K.flow} box o={L(7, "efecto")} />
      </Scene>

      {/* 8 · cuarto: el chorro arrastra el aire de alrededor; sale ~15 veces más del que entra */}
      <Scene {...sc(8)}>
        <SVG>
          <SideView t={t} jet={1} behind={R(8, "tira")} sides={R(8, "alrededor")} outFlow={R(8, "sale", 0.8)} intake={R(8, "entra")} />
        </SVG>
        {chip(8, "4 · EL ARRASTRE")}
        <Label x={680} y={990} text="ARRASTRA AIRE" size={40} color={K.cold} box o={L(8, "tira")} />
        <Label x={740} y={1090} text="SALE ≈ 15×" size={50} color={K.flow} box o={L(8, "quince")} />
        <Label x={150} y={1110} text="ENTRA 1" size={36} color={K.white} box o={L(8, "entra")} />
      </Scene>

      {/* 9 · sin aspas a la vista: los dedos, a salvo; se limpia con un trapo */}
      <Scene {...sc(9)}>
        <SVG>
          <Fan id="f9" cy={640} s={0.82} t={t} out={0.7} cloth={t > Wd(9, "limpia") ? ramp(t, Wd(9, "limpia"), E(9) - 0.2) : -1} />
          <Hand x={570 + 330 * (1 - ramp(t, Wd(9, "meter"), Wd(9, "dedos") + 0.3))} y={640} o={span(t, Wd(9, "meter") - 0.3, Wd(9, "limpia"))} />
        </SVG>
        {chip(9, "VENTAJAS")}
        <Label x={540} y={1110} text="DEDOS A SALVO" size={44} color={K.cold} box o={L(9, "dedos", Wd(9, "limpia"))} />
        <Label x={540} y={1110} text="UNA PASADA DE TRAPO" size={42} color={K.white} box o={L(9, "limpia")} />
      </Scene>

      {/* 10 · curiosidad: el efecto lleva el nombre de Henri Coandă, que lo patentó en 1936 */}
      <Scene {...sc(10)}>
        <SVG><PatentDoc x={540} y={740} s={0.85} t={t} p={R(10, "efecto", 0.8)} /></SVG>
        {chip(10, "CURIOSIDAD")}
        <Label x={540} y={1080} text="HENRI COANDA" size={48} color={K.flow} box o={L(10, "henri")} />
        <Label x={540} y={440} text="INVENTOR RUMANO" size={40} color={K.white} box o={L(10, "rumano")} />
        <Stamp x={850} y={700} text="1936" size={76} rot={-8} p={ramp(t, Wd(10, "1936"), Wd(10, "1936") + 0.35)} />
      </Scene>

      {/* 11 · otra: los primeros pitaban; cámaras en el pie se tragan el pitido */}
      <Scene {...sc(11)}>
        <SVG><BaseClose t={t} spin={1} waves={0.4 + 0.6 * R(11, "pitaban")} chambers={R(11, "camaras")} quiet={R(11, "tragan", 0.8)} /></SVG>
        {chip(11, "OTRA")}
        <Label x={180} y={470} text="¡PIIIII!" size={50} color={K.warn} box o={L(11, "pitaban", Wd(11, "tragan"))} />
        <Label x={540} y={1120} text="CÁMARAS ANTIPITIDO" size={42} color={K.flow} box o={L(11, "camaras")} />
      </Scene>

      {/* 12 · y otra: patente japonesa de 1981; a las tiendas en 2009 */}
      <Scene {...sc(12)}>
        <SVG>
          <PatentDoc x={290} y={700} t={t} p={1} s={0.62} jp o={dimTo(12, "patente")} />
          <Shop x={790} y={680} s={0.85} o={dimTo(12, "tiendas")} />
          {(() => { const p = R(12, "pero", 1.2); return <g><path d={`M440,700 L${440 + 160 * p},700`} stroke={K.flow} strokeWidth={10} strokeLinecap="round" opacity={0.3 + 0.7 * dimTo(12, "pero")} />{p > 0.9 && <Head x={604} y={700} a={0} color={K.flow} />}</g>; })()}
        </SVG>
        {chip(12, "Y OTRA")}
        <Label x={290} y={450} text="JAPÓN" size={42} color={K.white} box o={L(12, "japonesa")} />
        <Stamp x={290} y={1000} text="1981" size={70} rot={-8} p={ramp(t, Wd(12, "1981"), Wd(12, "1981") + 0.35)} />
        <Label x={790} y={450} text="EN TIENDAS" size={42} color={K.white} box o={L(12, "tiendas")} />
        <Stamp x={760} y={1000} text="2009" size={70} rot={6} color={K.flow} p={ramp(t, Wd(12, "2009"), Wd(12, "2009") + 0.35)} />
      </Scene>

      {/* 13 · cierre: resumen */}
      <Scene {...sc(13)}>
        <SVG>
          <Fan id="f13" t={t} open={1} spin={1} up={1} fill={1} intake={1} out={curR >= 2 ? 1 : 0.4} slit={curR === 1 ? 1 : 0.2} hi={curR === 0 ? "base" : ""} />
        </SVG>
        {chip(13, "RESUMEN")}
        <Label x={220} y={1100} text="TURBINA" size={40} color={curR === 0 ? K.flow : K.white} box o={dimTo(13, "turbina")} />
        <Label x={850} y={470} text="RENDIJA" size={40} color={curR === 1 ? K.flow : K.white} box o={dimTo(13, "rendija")} />
        <Label x={540} y={620} text="ARRASTRE" size={44} color={curR === 2 ? K.cold : K.white} box o={dimTo(13, "arrastrado")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
