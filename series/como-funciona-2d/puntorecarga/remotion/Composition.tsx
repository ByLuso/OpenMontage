// Episodio 176 · Cómo carga un coche eléctrico en el punto de recarga. 2D, plantilla de la serie.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Car, Wall, Pole, Wave, Cable, Pulses, Duty, Taper, Bat, Bubble, Conv, C } from "./Cargador";

export const COMP_ID = "PuntoRecarga";
export const HOOK = "Hablan antes de cargar"; // = meta.portada (≤5 palabras, la última va en amarillo)
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

  // escena base coche + poste (beats 1, 2, 10)
  const CARX = 330, CARY = 880, PX = 830, PY = 900;
  const portX = CARX + 0.85 * 252, portY = CARY - 0.85 * 10;
  const base = (talk: number, soc = 0.4, pow = 0, kind: "ac" | "dc" = "dc") => (
    <SVG>
      <Cable x1={portX} y1={portY} x2={PX - 74} y2={PY - 120} />
      {pow > 0.01 && <Wave x1={portX + 14} x2={PX - 84} y={portY - 12} amp={13} t={t} kind={kind} o={pow} />}
      <Car x={CARX} y={CARY} s={0.85} t={t} soc={soc} />
      <Pole x={PX} y={PY} s={0.62} t={t} on={talk} />
    </SVG>
  );

  // beat 8: el nivel sube rápido y luego se frena
  const u8 = ramp(t, S(8) + 0.2, E(8) - 0.2);
  const soc8 = u8 < 0.6 ? 0.1 + 0.7 * (u8 / 0.6) : 0.8 + 0.2 * ((u8 - 0.6) / 0.4);
  // beat 9: ancho del pulso
  const duty9 = 0.15 + 0.35 * ramp(t, Wd(9, "ancho"), Wd(9, "cuanto") + 0.5);
  const resW = ["lento", "rapido", "hablan"];
  const cur11 = resW.reduce((acc, w, k) => (t >= Wd(11, w) ? k : acc), -1);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el coche y el poste hablan antes de dar corriente */}
      <Scene {...sc(1)}>
        {base(R(1, "habla"))}
        <SVG>
          <Pulses xa={740} xb={470} y={700} t={t} o={R(1, "habla", 0.5)} />
        </SVG>
        {chip(1, "EL SECRETO")}
        <Label x={540} y={560} text="¡SE HABLAN!" size={46} color={K.cold} box o={L(1, "habla")} />
      </Scene>

      {/* 2 · la promesa: señal piloto, pulso, respuesta y entonces pasa la corriente */}
      <Scene {...sc(2)}>
        {base(1, 0.4, R(2, "pasa", 0.5), "ac")}
        <SVG>
          <Pulses xa={740} xb={470} y={700} t={t} o={span(t, Wd(2, "pulsos"), Wd(2, "responde"), 0.15)} />
          <Pulses xa={470} xb={740} y={700} t={t} color={K.flow} o={span(t, Wd(2, "responde"), Wd(2, "entonces"), 0.15)} />
          <Bubble x={830} y={455} w={250} text="PULSOS" o={L(2, "pulsos")} />
          <Bubble x={330} y={650} w={250} text="¡LISTO!" color={K.flow} o={L(2, "listo")} />
        </SVG>
        {chip(2, "LA SEÑAL PILOTO")}
        <Label x={540} y={1100} text="SOLO ENTONCES PASA CORRIENTE" size={36} color={K.white} box o={L(2, "entonces")} />
      </Scene>

      {/* 3 · la idea clave: la red da alterna, la batería necesita continua */}
      <Scene {...sc(3)}>
        <SVG>
          <Wave x1={70} x2={350} y={730} amp={50} t={t} kind="ac" o={dimTo(3, "red")} />
          <Conv x={480} y={730} w={180} h={150} glow={R(3, "alguien", 0.4)} t={t} />
          <Wave x1={590} x2={740} y={730} t={t} kind="dc" o={dimTo(3, "continua")} />
          <Bat x={850} y={730} s={0.7} soc={0.55} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={210} y={860} text="ALTERNA" size={40} color={K.hot} box o={L(3, "alterna")} />
        <Label x={480} y={860} text="CONVERTIR" size={40} color={K.white} box o={L(3, "convertirla")} />
        <Label x={830} y={860} text="CONTINUA" size={40} color={K.flow} box o={L(3, "continua")} />
      </Scene>

      {/* 4 · primero: el lento de pared; convierte el cargador del coche */}
      <Scene {...sc(4)}>
        <SVG>
          <Cable x1={360 + 0.85 * 252} y1={851} x2={790} y2={800} />
          <Wave x1={590} x2={780} y={832} amp={14} t={t} kind="ac" o={dimTo(4, "alterna")} />
          <Car x={360} y={860} s={0.85} t={t} soc={0.5} ob={R(4, "convierte", 0.4)} bat={R(4, "continua", 0.4)} />
          <Wall x={850} y={900} t={t} on={1} />
        </SVG>
        {chip(4, "1 · CARGA LENTA", K.hot)}
        <Label x={690} y={740} text="ALTERNA" size={40} color={K.hot} box o={L(4, "alterna")} />
        <Label x={360} y={660} text="CARGADOR DEL COCHE" size={38} color={K.flow} box o={L(4, "cargador")} />
        <Label x={540} y={1100} text="LO CONVIERTE EL COCHE" size={40} color={K.white} box o={L(4, "convierte")} />
      </Scene>

      {/* 5 · segundo: el rápido; convierte el poste y entrega continua directa a la batería */}
      <Scene {...sc(5)}>
        <SVG>
          <Cable x1={360 + 0.85 * 252} y1={851} x2={756} y2={790} />
          <Wave x1={590} x2={750} y={832} t={t} kind="dc" o={R(5, "entrega", 0.4)} />
          <Car x={360} y={860} s={0.85} t={t} soc={0.5} obDim={0.3} bat={R(5, "directa", 0.4)} />
          <Pole x={840} y={920} s={0.7} t={t} glow={R(5, "convierte", 0.4)} on={1} />
        </SVG>
        {chip(5, "2 · CARGA RÁPIDA", K.flow)}
        <Label x={700} y={470} text="LO CONVIERTE EL POSTE" size={38} color={K.flow} box o={L(5, "convierte")} />
        <Label x={540} y={1100} text="CONTINUA, DIRECTA A LA BATERÍA" size={36} color={K.white} box o={L(5, "directa")} />
      </Scene>

      {/* 6 · tercero: potencia; convertidor pequeño del coche frente al enorme del poste */}
      <Scene {...sc(6)}>
        <SVG>
          <Conv x={270} y={800} w={170} h={120} glow={0} t={t} dim={dimTo(6, "convertidor")} />
          <g opacity={dimTo(6, "poste")}><Conv x={740} y={770} w={380} h={500} glow={R(6, "enorme", 0.5)} t={t} /></g>
        </SVG>
        {chip(6, "3 · LA POTENCIA")}
        <Label x={270} y={680} text="COCHE: PEQUEÑO" size={36} color={K.white} box o={L(6, "pequeno")} />
        <Label x={270} y={930} text="LIMITA" size={40} color={K.warn} box o={L(6, "limita")} />
        <Label x={740} y={470} text="POSTE: ENORME" size={38} color={K.flow} box o={L(6, "enorme")} />
        <Label x={740} y={1060} text="MUCHA MÁS POTENCIA" size={38} color={K.flow} box o={L(6, "mucha")} />
      </Scene>

      {/* 7 · cuarto: el último 20 %, menos corriente cerca de llenarse */}
      <Scene {...sc(7)}>
        <SVG>
          <Taper x={150} y={540} w={700} h={430} p={0.04 + 0.96 * ramp(t, S(7) + 0.4, E(7) - 0.5)} />
        </SVG>
        {chip(7, "4 · EL FINAL", K.warn)}
        <Label x={330} y={480} text="POTENCIA ↑" size={38} color={K.white} box o={L(7, "ultimo")} />
        <Label x={696} y={1030} text="80 %" size={40} color={K.white} box o={L(7, "veinte")} />
        <Label x={800} y={1085} text="CARGA →" size={36} color={K.white} box o={L(7, "ultimo")} />
        <Label x={480} y={800} text="MENOS CORRIENTE" size={38} color={K.warn} box o={L(7, "menos")} />
      </Scene>

      {/* 8 · curiosidad: los postes rápidos se anuncian hasta el 80 % */}
      <Scene {...sc(8)}>
        <SVG>
          <Bat x={540} y={620} s={1.5} soc={soc8} />
          <g transform="translate(140,860)">
            <rect x={0} y={-16} width={800} height={32} rx={16} fill="rgba(6,16,31,0.85)" stroke={C.case3} strokeWidth={4} />
            <rect x={80} y={-16} width={560 * ramp(t, Wd(8, "rapidos"), Wd(8, "ochenta") + 0.5)} height={32} rx={16} fill={K.flow} />
            <rect x={640} y={-16} width={160 * ramp(t, Wd(8, "resto"), Wd(8, "resto") + 0.6)} height={32} rx={16} fill={C.case2} />
            <text x={80} y={-34} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={32} fill={K.white}>10</text>
            <text x={640} y={-34} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={32} fill={K.white}>80</text>
            <text x={800} y={-34} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={32} fill={K.white}>100</text>
          </g>
        </SVG>
        {chip(8, "CURIOSIDAD")}
        <Label x={360} y={960} text="RÁPIDO" size={42} color={K.flow} box o={L(8, "rapidos")} />
        <Label x={800} y={960} text="LENTO" size={42} color={K.cold} box o={L(8, "resto")} />
      </Scene>

      {/* 9 · otra: el ancho del pulso le dice al coche cuánta corriente puede tomar */}
      <Scene {...sc(9)}>
        <SVG>
          <Duty x={140} y={560} w={800} h={150} duty={duty9} t={t} />
          <g transform="translate(140,900)">
            <rect x={0} y={-22} width={800} height={44} rx={22} fill="rgba(6,16,31,0.85)" stroke={C.case3} strokeWidth={4} />
            <rect x={0} y={-22} width={800 * (duty9 / 0.5) * 0.9} height={44} rx={22} fill={K.flow} />
          </g>
        </SVG>
        {chip(9, "OTRA")}
        <Label x={540} y={470} text="ANCHO DEL PULSO" size={42} color={K.cold} box o={L(9, "ancho")} />
        <Label x={540} y={1010} text="CORRIENTE MÁXIMA" size={40} color={K.flow} box o={L(9, "corriente")} />
      </Scene>

      {/* 10 · otra: en el rápido viajan más datos por el cable de control */}
      <Scene {...sc(10)}>
        {base(1, 0.55, 1, "dc")}
        <SVG>
          <Pulses xa={740} xb={470} y={700} t={t} color={K.flow} o={R(10, "datos", 0.5)} />
          <Pulses xa={470} xb={740} y={760} t={t} color={K.cold} o={R(10, "datos", 0.5)} />
        </SVG>
        {chip(10, "OTRA")}
        <Label x={540} y={600} text="MÁS DATOS" size={42} color={K.flow} box o={L(10, "datos")} />
        <Label x={540} y={1100} text="AJUSTAR LA CARGA A LA BATERÍA" size={34} color={K.white} box o={L(10, "ajustar")} />
      </Scene>

      {/* 11 · cierre */}
      <Scene {...sc(11)}>
        <SVG>
          <g opacity={dimTo(11, "lento")}><Car x={190} y={880} s={0.4} t={t} soc={0.5} ob={cur11 === 0 ? 1 : 0} /></g>
          <g opacity={dimTo(11, "rapido")}><Pole x={540} y={900} s={0.4} t={t} glow={cur11 === 1 ? 1 : 0} /></g>
          <Bubble x={840} y={700} w={190} text="¿LISTO?" o={dimTo(11, "hablan")} />
          <Bubble x={840} y={830} w={190} text="¡LISTO!" color={K.flow} o={dimTo(11, "hablan")} />
        </SVG>
        {chip(11, "RESUMEN")}
        <Label x={180} y={1000} text="LENTO: COCHE" size={32} color={cur11 === 0 ? K.flow : K.white} box o={dimTo(11, "lento")} />
        <Label x={520} y={1000} text="RÁPIDO: POSTE" size={32} color={cur11 === 1 ? K.flow : K.white} box o={dimTo(11, "rapido")} />
        <Label x={840} y={1000} text="HABLAN" size={36} color={cur11 === 2 ? K.flow : K.white} box o={dimTo(11, "hablan")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
