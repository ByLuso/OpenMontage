// Episodio 173 · Cómo pita el arco de la tienda si te llevas algo sin pagar (las etiquetas antirrobo). 2D, plantilla de la serie.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en Antirrobo.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
// Solo funcionamiento general y desactivación legítima en caja: nada sobre cómo anular las etiquetas.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming, clamp01 } from "./kit2d/Kit";
import { AMTag, RFTag, Strip, Gate, Bag, Person, Counter, Shirt, Shop, Bell, Ear, Scope, Notes, Waves, C } from "./Antirrobo";

export const COMP_ID = "Antirrobo";
export const HOOK = "Una tira que canta"; // = meta.portada (≤5 palabras, la última va en amarillo)
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
  const lin = (a: number, b: number) => clamp01((t - a) / Math.max(0.001, b - a));
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(S(i), i === 1 ? 1.8 : 0), E(i))} />;
  /** Pulsos del arco: encendido/apagado (en pantalla ~1,5 por segundo; en la realidad son muchísimo más rápidos). */
  const burst = (t0: number) => ((t - t0) % 0.7 + 0.7) % 0.7 < 0.32 ? 1 : 0;

  // 1 · la tapa se levanta en «secreto»; la tira vibra y «canta» en «canta»
  const op1 = 0.99 * R(1, "secreto", 0.7);
  // 3 · la persona con la bolsa cruza el arco
  const walk3 = 150 + 380 * lin(S(3), Wd(3, "escucha"));
  // 6 · la gráfica se dibuja: pulso hasta «calla», eco desde «escucha»
  const p6 = 0.38 * lin(S(6), Wd(6, "calla")) + 0.62 * lin(Wd(6, "escucha"), Wd(6, "campana"));
  // 7 · la etiqueta se desliza sobre el desactivador
  const slide7 = R(7, "desactivador", 0.8);
  const dead7 = R(7, "desmagnetiza", 0.5);
  // 9 · el pulso fuerte daña el condensador
  const burnt9 = R(9, "daña", 0.3);
  // 11 · persona que entra con una bolsa de otra tienda
  const walk11 = 120 + 330 * lin(S(11), Wd(11, "pita"));
  const alarm11 = t > Wd(11, "pita") ? 0.5 + 0.5 * Math.abs(Math.sin(t * 8)) : 0;
  // 13 · resumen
  const resW = ["tira", "arco", "caja"];
  const curR = resW.reduce((acc, w, k) => (t >= Wd(13, w) ? k : acc), -1);
  const on13 = (k: number) => (curR >= k ? 1 : 0.3);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: la etiqueta GRANDE desde el fotograma 0; en «secreto» se levanta la tapa; en «canta» la tira vibra */}
      <Scene {...sc(1)}>
        <SVG>
          <AMTag x={540} y={880} s={1.15} t={t} open={op1} lift={-230} vib={R(1, "tira") * 0.8} hiMag={0} />
          <Notes x={540} y={700} t={t} o={R(1, "metal")} n={3} spread={420} />
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={540} y={1100} text="UNA TIRA DE METAL" size={46} color={K.flow} box o={L(1, "tira")} />
      </Scene>

      {/* 2 · la promesa: la tira vibra 58 000 veces por segundo, demasiado agudo para el oído */}
      <Scene {...sc(2)}>
        <SVG>
          <Strip x={540} y={640} w={860} h={60} t={t} amp={1} freq={11} />
          <Ear x={540} y={940} s={0.9} o={dimTo(2, "demasiado")} cross={R(2, "agudo", 0.3)} />
        </SVG>
        {chip(2, "LA TIRA VIBRA")}
        <Label x={540} y={500} text="58 000 VECES POR SEGUNDO" size={44} color={K.flow} box o={L(2, "cincuenta")} />
        <Label x={540} y={1100} text="NO LO OYES" size={46} color={K.warn} box o={L(2, "agudo")} />
      </Scene>

      {/* 3 · la idea clave: el arco no ve la bolsa; escucha si algo le contesta */}
      <Scene {...sc(3)}>
        <SVG>
          <rect x={60} y={1010} width={960} height={14} rx={7} fill={C.floor} />
          <Gate x={210} y={1010} h={560} tx={0.8} />
          <Gate x={870} y={1010} h={560} tx={0.3} />
          <Waves x={250} y={760} dir={0} t={t} o={0.85} color={K.cold} n={4} step={70} r0={30} half={30} w={8} />
          <Person x={walk3} y={1010} s={0.95} t={t} />
          <Bag x={walk3 + 90} y={830} s={0.6} tagHi={R(3, "contesta") * (0.5 + 0.5 * Math.abs(Math.sin(t * 6)))} />
          <Waves x={walk3 + 90} y={830} dir={0} t={t} o={0.9 * R(3, "contesta")} color={K.flow} dash="20 14" n={3} step={50} r0={70} half={26} w={7} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={540} y={430} text="NO VE TU BOLSA" size={44} color={K.white} box o={span(t, Wd(3, "ve"), Wd(3, "escucha"))} />
        <Label x={540} y={430} text="ESCUCHA SI LE CONTESTAN" size={42} color={K.flow} box o={L(3, "escucha")} />
      </Scene>

      {/* 4 · primero: el arco lanza pulsos cortos de campo magnético a 58 kHz */}
      <Scene {...sc(4)}>
        <SVG>
          <rect x={60} y={1050} width={960} height={14} rx={7} fill={C.floor} />
          <Gate x={250} y={1050} h={640} tx={burst(S(4)) * R(4, "lanza")} />
          <Waves x={300} y={740} dir={0} t={t} o={dimTo(4, "pulsos") * (0.15 + 0.85 * burst(S(4)) * R(4, "lanza"))} color={K.cold} n={5} step={80} r0={30} half={34} w={9} />
        </SVG>
        {chip(4, "PRIMERO: PULSOS")}
        <Label x={720} y={520} text="PULSOS CORTOS" size={42} color={K.cold} box o={L(4, "pulsos")} />
        <Label x={660} y={1100} text="58 kHz" size={64} color={K.cold} box o={L(4, "cincuenta")} />
      </Scene>

      {/* 5 · segundo: la tira solo vibra así si tiene al lado un imán que la afina */}
      <Scene {...sc(5)}>
        <SVG>
          <AMTag x={540} y={760} s={1.25} t={t} open={1} vib={R(5, "imán", 0.4)} hiMag={R(5, "imán") * (0.6 + 0.4 * Math.sin(t * 5))} />
          <Notes x={540} y={560} t={t} o={R(5, "que")} n={3} spread={420} />
        </SVG>
        {chip(5, "SEGUNDO: EL IMÁN")}
        <Label x={540} y={1000} text="IMÁN" size={50} color={K.flow} box o={L(5, "imán")} />
        <Label x={540} y={1100} text="LA DEJA AFINADA" size={44} color={K.white} box o={L(5, "que")} />
      </Scene>

      {/* 6 · tercero: el arco calla y escucha; la tira sigue sonando como una campana → pita */}
      <Scene {...sc(6)}>
        <SVG>
          <Scope x={110} y={440} w={860} h={300} p={p6} ring={1} />
          <Bell x={300} y={920} s={0.9} t={t} swing={R(6, "campana")} o={dimTo(6, "campana")} />
          <Gate x={780} y={1080} h={240} s={1} alarm={t > Wd(6, "pita") ? 0.5 + 0.5 * Math.abs(Math.sin(t * 8)) : 0} o={dimTo(6, "pita")} />
        </SVG>
        {chip(6, "TERCERO: ESCUCHA")}
        <Label x={300} y={790} text="EL ARCO CALLA" size={36} color={K.cold} box o={L(6, "calla")} />
        <Label x={700} y={790} text="LA TIRA SIGUE" size={36} color={K.flow} box o={L(6, "sigue")} />
        <Label x={540} y={1110} text="¡PIIII!" size={56} color={K.warn} box o={L(6, "pita")} />
      </Scene>

      {/* 7 · cuarto: en caja, el desactivador desmagnetiza el imán y la tira se desafina */}
      <Scene {...sc(7)}>
        <SVG>
          <Counter x={540} y={1000} t={t} pulse={span(t, Wd(7, "desmagnetiza") - 0.1, Wd(7, "desmagnetiza") + 0.9, 0.15)} />
          <Waves x={540} y={1010} dir={-90} t={t} o={span(t, Wd(7, "desmagnetiza") - 0.1, Wd(7, "desmagnetiza") + 0.9, 0.15)} color={K.hot} n={3} step={50} r0={40} half={50} w={7} />
          <AMTag x={540 - 180 * (1 - slide7)} y={880} s={0.85} t={t} open={1} hiMag={span(t, Wd(7, "imán"), Wd(7, "imán") + 0.8)} dead={dead7} vib={0} />
        </SVG>
        {chip(7, "CUARTO: EN CAJA")}
        <Label x={540} y={560} text="DESACTIVADOR" size={46} color={K.hot} box o={L(7, "desactivador", Wd(7, "tira"))} />
        <Label x={540} y={560} text="TIRA DESAFINADA: SILENCIO" size={40} color={K.white} box o={L(7, "tira")} />
      </Scene>

      {/* 8 · el otro sistema: pegatina plana con espiral (bobina) y condensador que resuenan a 8,2 MHz */}
      <Scene {...sc(8)}>
        <SVG>
          <RFTag x={540} y={760} s={1.05} hiCoil={R(8, "espiral")} hiCap={span(t, Wd(8, "condensador"), Wd(8, "resuenan"))} ring={R(8, "resuenan") * (0.5 + 0.5 * Math.abs(Math.sin(t * 5)))} />
        </SVG>
        {chip(8, "EL OTRO SISTEMA")}
        <Label x={540} y={470} text="ESPIRAL + CONDENSADOR" size={42} color={K.flow} box o={L(8, "espiral")} />
        <Label x={540} y={1100} text="8,2 MHz" size={64} color={K.flow} box o={L(8, "ocho")} />
      </Scene>

      {/* 9 · el arco nota la resonancia; al pagar, un pulso fuerte daña el condensador */}
      <Scene {...sc(9)}>
        <SVG>
          <Counter x={540} y={960} t={t} pulse={span(t, Wd(9, "pulso"), Wd(9, "daña") + 0.6, 0.15)} o={dimTo(9, "pagar")} />
          <g opacity={1 - 0.75 * R(9, "pagar")}>
            <Gate x={150} y={950} h={480} s={0.85} tx={0.8} />
            <Waves x={185} y={720} dir={0} t={t} o={0.8} color={K.cold} n={3} step={50} r0={20} half={30} w={7} />
          </g>
          <RFTag x={540} y={720} s={0.75} ring={(1 - R(9, "daña", 0.2)) * (0.5 + 0.5 * Math.abs(Math.sin(t * 5)))} burnt={burnt9} />
          <Waves x={540} y={720} dir={-90} t={t} o={0.8 * (1 - R(9, "daña", 0.2))} color={K.flow} dash="20 14" n={3} step={50} r0={180} half={40} w={7} />
        </SVG>
        {chip(9, "RESUENA… HASTA LA CAJA")}
        <Label x={540} y={430} text="EL ARCO LA NOTA" size={42} color={K.flow} box o={span(t, Wd(9, "nota"), Wd(9, "daña"))} />
        <Label x={540} y={430} text="YA NO RESUENA" size={44} color={K.warn} box o={L(9, "daña")} />
      </Scene>

      {/* 10 · las pinzas duras de la ropa: en caja te las quitan (solo por fuera) */}
      <Scene {...sc(10)}>
        <SVG>
          <Shirt x={540} y={780} s={1.15} pull={R(10, "caja", 0.8)} tagHi={R(10, "pinzas") * (0.55 + 0.45 * Math.abs(Math.sin(t * 4)))} />
        </SVG>
        {chip(10, "LAS PINZAS DE ROPA")}
        <Label x={540} y={1100} text="SE QUITAN EN CAJA" size={44} color={K.flow} box o={L(10, "caja")} />
      </Scene>

      {/* 11 · curiosidad: pita al entrar por una etiqueta que no desactivaron en otra tienda */}
      <Scene {...sc(11)}>
        <SVG>
          <rect x={60} y={1040} width={960} height={14} rx={7} fill={C.floor} />
          <Gate x={600} y={1040} h={560} alarm={alarm11} />
          <Gate x={900} y={1040} h={560} alarm={alarm11} />
          <Person x={walk11} y={1040} s={0.95} t={t} />
          <Bag x={walk11 + 90} y={860} s={0.6} color="#E7C9A0" tagHi={R(11, "etiqueta")} />
        </SVG>
        {chip(11, "CURIOSIDAD")}
        <Label x={540} y={430} text="¡PITA AL ENTRAR!" size={44} color={K.warn} box o={L(11, "pita", Wd(11, "etiqueta"))} />
        <Label x={540} y={430} text="ETIQUETA DE OTRA TIENDA" size={42} color={K.flow} box o={L(11, "etiqueta")} />
      </Scene>

      {/* 12 · otra: estos arcos nacieron en los años sesenta y ya entonces hacían saltar una alarma */}
      <Scene {...sc(12)}>
        <SVG>
          <Shop x={540} y={1060} w={860} h={520} old o={0.55 + 0.45 * R(12, "sesenta")} />
          <Gate x={470} y={1060} h={300} s={0.9} tx={0.6 + 0.4 * Math.abs(Math.sin(t * 4))} alarm={t > Wd(12, "alarma") ? 0.5 + 0.5 * Math.abs(Math.sin(t * 8)) : 0} />
          <Gate x={610} y={1060} h={300} s={0.9} tx={0.6 + 0.4 * Math.abs(Math.sin(t * 4))} alarm={t > Wd(12, "alarma") ? 0.5 + 0.5 * Math.abs(Math.sin(t * 8)) : 0} />
          <Waves x={510} y={900} dir={0} t={t} o={0.7} color={K.cold} n={3} step={20} r0={10} half={30} w={5} />
        </SVG>
        {chip(12, "OTRA")}
        <Label x={540} y={430} text="AÑOS 60" size={72} color={K.flow} box o={L(12, "sesenta")} />
        <Label x={540} y={1110} text="¡Y YA PITABAN!" size={46} color={K.warn} box o={L(12, "alarma")} />
      </Scene>

      {/* 13 · cierre: tira que canta, arco que escucha, caja que la calla */}
      <Scene {...sc(13)}>
        <SVG>
          <g opacity={on13(0)}>
            <AMTag x={540} y={520} s={0.75} t={t} open={1} vib={curR === 0 ? 1 : 0.3} />
            <Notes x={540} y={420} t={t} o={curR === 0 ? 1 : 0} n={3} spread={260} />
          </g>
          <g opacity={on13(1)}>
            <Gate x={260} y={940} h={330} s={0.9} tx={curR === 1 ? 1 : 0} />
            <Waves x={300} y={790} dir={0} t={t} o={curR === 1 ? 0.9 : 0.3} color={K.cold} n={3} step={50} r0={20} half={30} w={7} />
          </g>
          <g opacity={on13(2)}>
            <Counter x={720} y={830} t={t} w={420} pulse={curR === 2 ? 1 : 0} />
          </g>
        </SVG>
        {chip(13, "RESUMEN")}
        <Label x={540} y={690} text="CANTA" size={40} color={K.flow} box o={span(t, Wd(13, "canta"), E(13))} />
        <Label x={280} y={1110} text="ESCUCHA" size={40} color={K.cold} box o={span(t, Wd(13, "escucha"), E(13))} />
        <Label x={720} y={1110} text="CALLA" size={40} color={K.hot} box o={span(t, Wd(13, "calla"), E(13))} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
