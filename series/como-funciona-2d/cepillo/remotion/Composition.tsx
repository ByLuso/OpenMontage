// Episodio 131 · Cómo funciona un cepillo de dientes eléctrico (2D, plantilla de la serie).
// Reglas: cada beat es una <Scene> con su dibujo (SVG en Cepillo.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Brush, CoilIcon, BatIcon, Gear, Charger, RoundHead, SonicHead, Mouth, QuadBar, OldBrush, Pressure, HeadSide, Calendar, C } from "./Cepillo";

export const COMP_ID = "Cepillo";
export const HOOK = "Se carga sin contactos"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);

/** Primer plano de la base y la parte baja del mango (recortado a la zona segura). */
const Close: React.FC<Omit<React.ComponentProps<typeof Brush>, "cx" | "y" | "s">> = (p) => (
  <g>
    <defs><clipPath id={`close${p.id}`}><rect x={0} y={380} width={1080} height={770} /></clipPath></defs>
    <g clipPath={`url(#close${p.id})`}><Brush coverDx={-800} {...p} cx={540} y={-278} s={1.6} /></g>
  </g>
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
  const flip = Math.sin(t * Math.PI * 1.6) >= 0 ? 1 : -1;

  // beat 8: contador de movimientos por minuto
  const cnt = Math.round(31000 * ramp(t, Wd(8, "treinta"), Wd(8, "minuto")) / 100) * 100;
  // beat 9: barra de dos minutos (simulada) y zona activa
  const qp = ramp(t, Wd(9, "cuenta"), E(9) - 0.3);
  const q = Math.min(3, Math.floor(qp * 4));
  // beat 13: resumen
  const resumenHi = ["coil", "bat", "motor"];
  const resumenW = ["bobinas", "pila", "motor"];
  const curR = resumenW.reduce((acc, w, k) => (t >= Wd(13, w) ? k : acc), -1);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el cepillo GRANDE desde el fotograma 0; la tapa se levanta en «esperas» y aparece el campo en «contactos» */}
      <Scene {...sc(1)}>
        <SVG>
          <Brush id="b1" cx={540} y={380} s={0.86} t={t} open={0.99 * R(1, "esperas", 0.6)} field={R(1, "contactos")} current={R(1, "contactos")}
            charge={0.3 + 0.5 * ramp(t, Wd(1, "contactos"), E(1))} />
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={790} y={610} text="¡SIN CONTACTOS!" size={40} color={K.flow} box o={L(1, "contactos")} />
      </Scene>

      {/* 2 · la promesa: ningún metal asoma; la energía pasa con un campo magnético */}
      <Scene {...sc(2)}>
        <SVG>
          <Close id="c2" t={t} open={0.99 * R(2, "pasan", 0.6)} baseOpen={R(2, "pasan", 0.6)} field={R(2, "magnetico")} current={R(2, "magnetico")} charge={0.5} />
        </SVG>
        {chip(2, "EL SECRETO")}
        <Stamp x={540} y={470} text="NI UN METAL" size={52} p={ramp(t, Wd(2, "metal"), Wd(2, "metal") + 0.35) * (1 - ramp(t, Wd(2, "campo") - 0.3, Wd(2, "campo")))} />
        <Label x={540} y={470} text="CAMPO MAGNÉTICO" size={44} color={K.flow} box o={L(2, "campo")} />
      </Scene>

      {/* 3 · la idea clave: campo que carga, batería que guarda, motor que mueve */}
      <Scene {...sc(3)}>
        <SVG>
          <CoilIcon x={210} y={700} t={t} o={dimTo(3, "campo")} />
          <BatIcon x={540} y={700} lvl={0.2 + 0.7 * ramp(t, Wd(3, "carga"), Wd(3, "guarda") + 0.5)} o={dimTo(3, "bateria")} />
          <g opacity={dimTo(3, "motor")}><Gear x={870} y={700} r={78} a={t * 140 * R(3, "mueve")} teeth={11} /></g>
          {[375, 705].map((x, k) => (
            <path key={x} d={`M${x - 30},700 L${x + 30},700 M${x + 10},680 L${x + 30},700 L${x + 10},720`} fill="none" stroke={K.white} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={k ? dimTo(3, "motor") : dimTo(3, "bateria")} />
          ))}
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={210} y={860} text="CARGA" size={42} color={K.flow} box o={L(3, "carga")} />
        <Label x={540} y={860} text="GUARDA" size={42} color={K.flow} box o={L(3, "guarda")} />
        <Label x={870} y={860} text="MUEVE" size={42} color={K.flow} box o={L(3, "mueve")} />
      </Scene>

      {/* 4 · primero: la bobina de la base crea un campo que cambia de sentido */}
      <Scene {...sc(4)}>
        <SVG>
          <Close id="c4" t={t} open={1} baseOpen={1} field={0.35 + 0.65 * R(4, "crea")} current={R(4, "crea")} charge={0.55} flip={t > Wd(4, "cambia") ? flip : 1} hi={t > Wd(4, "bobina") && t < Wd(4, "crea") + 0.4 ? "base" : ""} />
          {(() => { const o = R(4, "cambia"); const d = flip; return o > 0.01 && (
            <path d={`M540,${938 + 60 * d} L540,${938 - 60 * d} M${510},${938 - 30 * d} L540,${938 - 64 * d} L${570},${938 - 30 * d}`} fill="none" stroke={K.white} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={o} />); })()}
        </SVG>
        {chip(4, "1 · LA BASE", K.hot)}
        <Label x={250} y={880} text="BOBINA" size={42} color={K.hot} box o={L(4, "bobina")} />
        <Label x={540} y={440} text="VA Y VIENE" size={44} color={K.flow} box o={L(4, "cambia")} />
      </Scene>

      {/* 5 · el campo atraviesa el plástico: mango sellado, se puede mojar */}
      <Scene {...sc(5)}>
        <SVG>
          <Brush id="b5" cx={540} y={380} s={0.86} t={t} field={1} current={0.6} charge={0.6} drops={R(5, "mojar")} />
        </SVG>
        {chip(5, "1 · A PRUEBA DE AGUA", K.cold)}
        <Label x={810} y={980} text="PLÁSTICO" size={40} color={K.white} box o={L(5, "plastico", Wd(5, "sellado"))} />
        <Stamp x={800} y={620} text="SELLADO" color={K.flow} size={52} rot={6} p={ramp(t, Wd(5, "sellado"), Wd(5, "sellado") + 0.35)} />
        <Label x={270} y={560} text="¡AL AGUA!" size={46} color={K.cold} box o={L(5, "mojar")} />
      </Scene>

      {/* 6 · segundo: bobina → circuito que endereza → pila */}
      <Scene {...sc(6)}>
        <SVG>
          <Charger t={t} ac={0.3 + 0.7 * R(6, "bobina")} dc={R(6, "endereza")} lvl={0.15 + 0.8 * ramp(t, Wd(6, "guarda"), E(6))} />
        </SVG>
        {chip(6, "2 · LA BATERÍA")}
        <Label x={150} y={520} text="BOBINA" size={40} color={K.hot} box o={L(6, "bobina")} />
        <Label x={515} y={560} text="CIRCUITO" size={40} color={K.white} box o={L(6, "circuito")} />
        <Label x={515} y={840} text="LA ENDEREZA" size={38} color={K.flow} box o={L(6, "endereza")} />
        <Label x={850} y={540} text="PILA" size={44} color={K.flow} box o={L(6, "pila")} />
      </Scene>

      {/* 7 · tercero: cabezal redondo que gira a un lado y al otro con engranajes */}
      <Scene {...sc(7)}>
        <SVG><RoundHead t={t} on={R(7, "giran")} gears={R(7, "engranajes")} /></SVG>
        {chip(7, "3 · EL MOTOR")}
        <Label x={190} y={760} text="REDONDO" size={40} color={K.white} box o={L(7, "redondo")} />
        <Label x={800} y={990} text="ENGRANAJES" size={38} color={K.flow} box o={L(7, "engranajes")} />
      </Scene>

      {/* 8 · los sónicos: electroimán e imanes, hasta 31 000 movimientos por minuto */}
      <Scene {...sc(8)}>
        <SVG><SonicHead t={t} on={R(8, "sacude")} mag={0.35 + 0.65 * R(8, "electroiman")} /></SVG>
        {chip(8, "3 · LOS SÓNICOS")}
        <Stamp x={260} y={560} text="SIN ENGRANAJES" size={36} p={ramp(t, Wd(8, "sin"), Wd(8, "sin") + 0.35) * (1 - ramp(t, Wd(8, "electroiman") - 0.2, Wd(8, "electroiman") + 0.1))} />
        <Label x={210} y={990} text="ELECTROIMÁN" size={36} color={K.white} box o={L(8, "electroiman")} />
        <Label x={210} y={1100} text="IMANES" size={36} color={K.white} box o={L(8, "imanes")} />
        <Label x={810} y={560} text={`${cnt.toLocaleString("es-ES").replace(/\s/g, ".")}/min`} size={50} color={K.flow} box o={L(8, "treinta")} />
      </Scene>

      {/* 9 · cuarto: temporizador de dos minutos, aviso cada 30 s */}
      <Scene {...sc(9)}>
        <SVG>
          <Mouth cx={540} cy={680} q={t > Wd(9, "cuenta") ? q : -1} done={t > Wd(9, "cuenta") ? q : 0} t={t} />
          <QuadBar x={190} y={1030} w={700} p={qp} />
        </SVG>
        {chip(9, "4 · EL TEMPORIZADOR")}
        <Label x={540} y={1100} text="2 MINUTOS" size={44} color={K.white} o={L(9, "dos")} />
        <Label x={540} y={975} text="AVISO CADA 30 s" size={40} color={K.flow} box o={L(9, "treinta")} />
      </Scene>

      {/* 10 · curiosidad: 1954, con cable a la pared */}
      <Scene {...sc(10)}>
        <SVG><OldBrush t={t} plug={R(10, "enchufado", 0.5)} /></SVG>
        {chip(10, "CURIOSIDAD")}
        <Stamp x={740} y={1060} text="1954" size={80} rot={-8} p={ramp(t, Wd(10, "1954"), Wd(10, "1954") + 0.35)} />
        <Label x={640} y={470} text="CON CABLE" size={42} color={K.white} box o={L(10, "cable")} />
      </Scene>

      {/* 11 · truco: no aprietes; el sensor de presión avisa */}
      <Scene {...sc(11)}>
        <SVG><Pressure t={t} press={ramp(t, Wd(11, "apretar"), Wd(11, "fuerte") + 0.4) * (1 - ramp(t, Wd(11, "avisa"), Wd(11, "avisa") + 0.5))} alarm={R(11, "sensor")} /></SVG>
        {chip(11, "TRUCO")}
        <Stamp x={600} y={450} text="¡NO APRIETES!" size={46} p={span(t, Wd(11, "aprietes"), E(11))} />
        <Label x={285} y={990} text="¡DAÑA!" size={44} color={K.warn} box o={L(11, "dana", Wd(11, "sensor"))} />
        <Label x={700} y={1000} text="SENSOR DE PRESIÓN" size={38} color={K.warn} box o={L(11, "sensor")} />
      </Scene>

      {/* 12 · otra: cambia el cabezal cada tres meses */}
      <Scene {...sc(12)}>
        <SVG>
          <HeadSide x={250} y={470} worn={0} />
          <HeadSide x={750} y={470} worn={R(12, "abren", 0.6)} o={dimTo(12, "antes")} />
          <Calendar x={540} y={500} p={R(12, "tres")} />
        </SVG>
        {chip(12, "OTRA")}
        <Label x={540} y={520} text="3 MESES" size={44} color={C.ink} o={R(12, "tres")} />
        <Label x={300} y={1010} text="NUEVO" size={42} color={K.cold} box o={L(12, "cabezal")} />
        <Label x={790} y={1010} text="ABIERTO" size={42} color={K.warn} box o={L(12, "abren")} />
      </Scene>

      {/* 13 · cierre: resumen */}
      <Scene {...sc(13)}>
        <SVG>
          <Brush id="b13" cx={540} y={440} s={0.8} t={t} open={1} field={1} current={1} charge={0.9} motor={1} vib={t > Wd(13, "motor") ? 1 : 0} hi={curR >= 0 ? resumenHi[curR] : ""} />
        </SVG>
        {chip(13, "RESUMEN")}
        <Label x={230} y={1030} text="BOBINAS" size={40} color={curR === 0 ? K.flow : K.white} box o={dimTo(13, "bobinas")} />
        <Label x={830} y={850} text="PILA" size={40} color={curR === 1 ? K.flow : K.white} box o={dimTo(13, "pila")} />
        <Label x={250} y={700} text="MOTOR" size={40} color={curR === 2 ? K.flow : K.white} box o={dimTo(13, "motor")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
