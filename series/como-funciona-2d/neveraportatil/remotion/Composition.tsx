// Episodio 134 · Cómo enfría una nevera portátil de coche sin gas ni compresor (efecto Peltier).
// Cada beat es una <Scene> con su dibujo (NeveraPortatil.tsx), un <Chip> y 1-3 <Label>. Cambios atados a palabras con Wd(beat, "palabra").
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { C, Cooler, Fan, PeltierTile, Heatsink, Stack, STACK, Thermo, PocketWatch, Icon, HomeFridge, Can } from "./NeveraPortatil";

export const COMP_ID = "NeveraPortatil";
export const HOOK = "Nevera sin gas ni compresor"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const lin = (t: number, a: number, b: number) => clamp((t - a) / Math.max(0.001, b - a));

/** Tachón rojo sobre una etiqueta. */
const Strike: React.FC<{ x: number; y: number; w: number; p: number }> = ({ x, y, w, p }) => p <= 0.01 ? null : (
  <line x1={x - w / 2 - 10} y1={y} x2={x - w / 2 - 10 + (w + 20) * p} y2={y} stroke={K.warn} strokeWidth={12} strokeLinecap="round" />
);

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const S = (i: number) => scene(i)[0];
  const E = (i: number) => scene(i)[1];
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, S(i), E(i))} />;

  // ---- 1 · gancho: la tapa se levanta al decir «esperas»
  const wEsp = Wd(1, "esperas");
  const open1 = ramp(t, wEsp - 0.1, wEsp + 0.6);
  const gas1 = ramp(t, Wd(1, "gas"), Wd(1, "gas") + 0.3);
  const comp1 = ramp(t, Wd(1, "compresor"), Wd(1, "compresor") + 0.3);

  // ---- 2 · la placa
  const mov2 = Wd(2, "móviles"), ven2 = Wd(2, "ventilador");
  const fanOn2 = ramp(t, ven2 - 0.1, ven2 + 0.3);

  // ---- 3 · idea clave: mueve calor
  const w3 = Wd(3, "mueve");
  const heat3 = ramp(t, w3, w3 + 0.5);

  // ---- 4 · dentro: N y P entre cerámicas
  const build4 = lin(t, Wd(4, "cientos") - 0.2, Wd(4, "tipo") + 0.2);
  const np4 = ramp(t, Wd(4, "tipo"), Wd(4, "tipo") + 0.4);
  const cer4 = Wd(4, "cerámicas");

  // ---- 5 · electrones cargan calor
  const cur5 = ramp(t, Wd(5, "corriente") - 0.1, Wd(5, "corriente") + 0.3);
  const heat5 = ramp(t, Wd(5, "electrones"), Wd(5, "calor") + 0.2);
  const temp5 = ramp(t, Wd(5, "dentro"), Wd(5, "calienta") + 0.3);

  // ---- 6 · disipador y ventilador
  const sink6 = ramp(t, Wd(6, "disipador") - 0.1, Wd(6, "disipador") + 0.4);
  const fan6 = ramp(t, Wd(6, "ventilador") - 0.1, Wd(6, "ventilador") + 0.3);
  const out6 = ramp(t, Wd(6, "rejilla") - 0.3, Wd(6, "rejilla") + 0.3);

  // ---- 7 · al revés: modo calor
  const wInv = Wd(7, "inviertes");
  const flip7 = t >= wInv + 0.2 ? -1 : 1;
  const tempIn = 1 - ramp(t, wInv, wInv + 0.2) + ramp(t, wInv + 0.2, wInv + 0.8);

  // ---- 8 · veinte grados menos que fuera
  const fuera8 = 22 + 13 * ramp(t, Wd(8, "fija"), Wd(8, "veinte"));
  const dentro8 = fuera8 - 20 * ramp(t, S(8) + 0.2, S(8) + 1.0);
  const br8 = ramp(t, Wd(8, "veinte"), Wd(8, "veinte") + 0.4);

  // ---- 9 · gasta más que una de compresor
  const bar9 = ramp(t, Wd(9, "gasta"), Wd(9, "gasta") + 0.8);
  const comp9 = ramp(t, Wd(9, "compresor"), Wd(9, "compresor") + 0.6);
  const fr9 = ramp(t, Wd(9, "frigorífico"), Wd(9, "frigorífico") + 0.4);

  // ---- 10 · Jean Peltier, 1834
  const year10 = ramp(t, Wd(10, "1834"), Wd(10, "1834") + 0.4);

  // ---- 11 · truco: ya frías
  const wFr = Wd(11, "frías"), wHor = Wd(11, "horas");
  const drop11 = ramp(t, wFr - 0.3, wFr + 0.6);
  const hrs11 = ramp(t, Wd(11, "enfriar"), wHor + 0.2);

  // ---- 12 · otra: no tapes la rejilla
  const cov12 = ramp(t, Wd(12, "tapes"), Wd(12, "rejilla") + 0.3);
  const hot12 = ramp(t, Wd(12, "calor"), Wd(12, "sale") + 0.4);
  const ap12 = Wd(12, "apenas");

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: la nevera grande; al decir «esperas» la tapa se levanta y se ve la placa */}
      <Scene {...sc(1)}>
        <Svg>
          <Cooler cx={540} cy={900} w={580} t={t} open={open1} fan={1} id="hook" lift={0.3} />
        </Svg>
        <Chip text="Nevera de coche" o={span(t, 1.8, E(1))} />
        <Label x={330} y={1050} text="GAS" size={56} color={K.white} box o={gas1} />
        <Label x={700} y={1050} text="COMPRESOR" size={56} color={K.white} box o={comp1} />
        <Svg>
          <Strike x={330} y={1050} w={170} p={ramp(t, Wd(1, "gas") + 0.1, Wd(1, "gas") + 0.4)} />
          <Strike x={700} y={1050} w={360} p={ramp(t, Wd(1, "compresor") + 0.2, Wd(1, "compresor") + 0.6)} />
        </Svg>
      </Scene>

      {/* 2 · la placa: sin piezas móviles; solo gira el ventilador */}
      <Scene {...sc(2)}>
        {chip(2, "Lo que enfría")}
        <Svg>
          <PeltierTile x={460} y={720} s={400} t={t} glow={1 - fanOn2} />
          {/* grosor: vista de canto */}
          <g opacity={ramp(t, Wd(2, "cuatro"), Wd(2, "cuatro") + 0.3)}>
            <rect x={260} y={980} width={400} height={22} rx={4} fill={C.ceramic} />
            <line x1={690} y1={970} x2={690} y2={1012} stroke={K.flow} strokeWidth={5} />
            <line x1={680} y1={970} x2={700} y2={970} stroke={K.flow} strokeWidth={5} />
            <line x1={680} y1={1012} x2={700} y2={1012} stroke={K.flow} strokeWidth={5} />
          </g>
          <g opacity={0.35 + 0.65 * fanOn2}><Fan x={820} y={560} r={110} t={t} speed={0.2 + fanOn2} glow={fanOn2} /></g>
        </Svg>
        <Label x={780} y={992} text="≈ 4 mm" size={44} color={K.flow} o={span(t, Wd(2, "milímetros"), E(2))} />
        <Label x={460} y={460} text="SIN PIEZAS MÓVILES" color={K.flow} box o={span(t, mov2, ven2 - 0.05)} />
        <Label x={760} y={735} text="SOLO GIRA ÉL" size={38} color={K.flow} box o={span(t, ven2 + 0.3, E(2))} />
      </Scene>

      {/* 3 · idea clave: no fabrica frío, mueve calor de una cara a la otra */}
      <Scene {...sc(3)}>
        {chip(3, "La idea clave")}
        <Svg>
          <rect x={120} y={890} width={840} height={230} rx={20} fill={K.cold} opacity={0.12} />
          <Stack t={t} slab={1} heat={heat3} temp={heat3} leads={false} />
          {[0, 1, 2].map((k) => {
            const ph = (t * 0.8 + k / 3) % 1;
            return <path key={k} d={`M ${300 + k * 240},${560 - ph * 70} q 20,-25 0,-50`} fill="none" stroke={K.hot} strokeWidth={8} strokeLinecap="round" opacity={heat3 * (1 - ph)} />;
          })}
        </Svg>
        <Label x={150} y={540} text="FUERA" size={36} color={K.hot} o={span(t, w3, E(3))} />
        <Label x={540} y={1010} text="DENTRO DE LA NEVERA" color={K.cold} o={span(t, w3 + 0.2, E(3))} />
        <Label x={540} y={440} text="NO FABRICA FRÍO" size={50} color={K.white} o={0.3 + 0.7 * span(t, Wd(3, "fabrica"), E(3))} />
        <Label x={540} y={745} text="MUEVE CALOR" size={56} color={K.flow} box o={span(t, w3 + 0.3, E(3))} />
      </Scene>

      {/* 4 · primero: bloquecitos N y P entre dos cerámicas */}
      <Scene {...sc(4)}>
        {chip(4, "1 · Por dentro")}
        <Svg><Stack t={t} build={0.08 + 0.92 * build4} labelsNP={np4} slab={0} /></Svg>
        <Label x={540} y={470} text="CIENTOS DE BLOQUECITOS" size={44} color={K.white} o={span(t, Wd(4, "cientos"), cer4 - 0.05)} />
        <Label x={540} y={470} text="2 PLACAS CERÁMICAS" size={44} color={K.white} o={span(t, cer4 + 0.3, E(4))} />
        <Label x={540} y={1100} text="SEMICONDUCTOR N Y P" color={K.flow} box o={span(t, Wd(4, "tipo"), E(4))} />
        <Svg>
          <g opacity={span(t, cer4, E(4))}>
            <rect x={STACK.x0 - 26} y={STACK.yTop - 6} width={STACK.x1 - STACK.x0 + 52} height={STACK.plate + 12} rx={10} fill="none" stroke={K.flow} strokeWidth={5} />
            <rect x={STACK.x0 - 26} y={STACK.yBot - STACK.plate - 6} width={STACK.x1 - STACK.x0 + 52} height={STACK.plate + 12} rx={10} fill="none" stroke={K.flow} strokeWidth={5} />
          </g>
        </Svg>
      </Scene>

      {/* 5 · segundo: los electrones cargan calor de dentro a fuera */}
      <Scene {...sc(5)}>
        {chip(5, "2 · Pasa la corriente")}
        <Svg>
          <Stack t={t} current={0.3 + 0.7 * cur5} heat={heat5} temp={temp5} labelsNP={0.5} />
          <rect x={460} y={1030} width={160} height={80} rx={12} fill={C.dark} stroke={K.flow} strokeWidth={4} opacity={0.4 + 0.6 * cur5} />
        </Svg>
        <Label x={540} y={1070} text="12 V" size={40} color={K.flow} o={0.4 + 0.6 * cur5} />
        <Label x={540} y={530} text="FUERA: SE CALIENTA" color={K.hot} o={span(t, Wd(5, "fuera"), E(5))} />
        <Label x={540} y={530} text="LOS ELECTRONES CARGAN CALOR" size={36} color={K.flow} o={span(t, Wd(5, "electrones"), Wd(5, "fuera") - 0.05)} />
        <Label x={540} y={965} text="DENTRO: SE ENFRÍA" size={36} color={K.cold} box o={span(t, Wd(5, "dentro"), E(5))} />
      </Scene>

      {/* 6 · tercero: disipador y ventilador echan el calor por la rejilla */}
      <Scene {...sc(6)}>
        {chip(6, "3 · Echar el calor")}
        <Svg>
          {/* placa en el centro, caliente arriba y fría abajo */}
          <rect x={300} y={800} width={480} height={30} rx={6} fill={K.hot} />
          <rect x={300} y={830} width={480} height={30} rx={6} fill={K.cold} />
          <g opacity={0.3 + 0.7 * sink6}><Heatsink x={540} y={610} w={480} h={190} color={C.light} /></g>
          <Heatsink x={540} y={860} w={420} h={130} color={K.cold} down />
          <g opacity={0.3 + 0.7 * fan6}><Fan x={540} y={480} r={95} t={t} speed={0.2 + fan6} /></g>
          {/* aire caliente que sale */}
          {Array.from({ length: 8 }, (_, k) => {
            const ph = (t * 0.9 + k / 8) % 1; const side = k % 2 ? 1 : -1;
            return <path key={k} d={`M ${540 + side * 120},${560 - 40 * ph} q ${side * 50},-30 ${side * (90 + 170 * ph)},${-20 - 40 * ph}`} fill="none" stroke={K.hot} strokeWidth={9} strokeLinecap="round" opacity={(0.25 + 0.75 * out6) * fan6 * (1 - ph)} />;
          })}
          {Array.from({ length: 9 }, (_, k) => {
            const ph = (t * 0.8 + k / 9) % 1;
            return <circle key={k} cx={380 + (k % 5) * 80} cy={800 - ph * 170} r={9} fill={K.hot} opacity={0.8 * (1 - ph) * (0.3 + 0.7 * sink6)} />;
          })}
        </Svg>
        <Label x={880} y={700} text="DISIPADOR" size={36} color={K.white} box o={span(t, Wd(6, "disipador"), E(6))} />
        <Label x={250} y={480} text="VENTILADOR" size={38} color={K.flow} box o={span(t, Wd(6, "ventilador"), E(6))} />
        <Label x={540} y={1060} text="EL CALOR SALE FUERA" color={K.hot} o={span(t, Wd(6, "rejilla") - 0.2, E(6))} />
      </Scene>

      {/* 7 · cuarto: invertir la corriente → modo calor */}
      <Scene {...sc(7)}>
        {chip(7, "4 · Al revés")}
        <Svg>
          <Stack t={t} current={1} heat={1} temp={tempIn} dir={flip7} labelsNP={0.5} />
          <g transform={`translate(540,1070) scale(${flip7 < 0 ? -1 : 1},1)`}>
            <rect x={-80} y={-40} width={160} height={80} rx={12} fill={C.dark} stroke={K.flow} strokeWidth={4} />
            <path d="M -40,0 L 40,0 M 22,-18 L 40,0 L 22,18" fill="none" stroke={K.flow} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </Svg>
        <Stamp x={540} y={740} text="¡AL REVÉS!" color={K.flow} p={ramp(t, Wd(7, "revés"), Wd(7, "revés") + 0.3)} />
        <Label x={540} y={980} text="MODO CALOR" size={46} color={K.hot} box o={span(t, Wd(7, "modo"), E(7))} />
      </Scene>

      {/* 8 · ojo: unos veinte grados menos que fuera, no una temperatura fija */}
      <Scene {...sc(8)}>
        {chip(8, "Ojo", K.cold)}
        <Svg>
          <Cooler cx={540} cy={820} w={330} t={t} inside={1} id="o8" />
          <Thermo x={160} y={960} h={420} value={fuera8} min={-5} max={40} color={K.hot} />
          <Thermo x={860} y={960} h={420} value={dentro8} min={-5} max={40} color={K.cold} />
          <g opacity={br8}>
            <path d={`M 250,${960 - 400 * (fuera8 + 5) / 45} L 760,${960 - 400 * (fuera8 + 5) / 45}`} stroke={K.hot} strokeWidth={4} strokeDasharray="12 10" />
            <path d={`M 320,${960 - 400 * (dentro8 + 5) / 45} L 820,${960 - 400 * (dentro8 + 5) / 45}`} stroke={K.cold} strokeWidth={4} strokeDasharray="12 10" />
          </g>
        </Svg>
        <Label x={160} y={500} text={`${Math.round(fuera8)} °C`} size={46} color={K.hot} o={1} />
        <Label x={860} y={500} text={`${Math.round(dentro8)} °C`} size={46} color={K.cold} o={1} />
        <Label x={160} y={1062} text="FUERA" size={36} color={K.white} o={span(t, S(8), E(8))} />
        <Label x={860} y={1062} text="DENTRO" size={36} color={K.white} o={span(t, S(8), E(8))} />
        <Label x={540} y={1135} text="≈ 20 °C MENOS QUE FUERA" size={40} color={K.flow} box o={span(t, Wd(8, "veinte"), E(8))} />
        <Label x={540} y={430} text="NO ES UNA TEMPERATURA FIJA" size={38} color={K.white} o={span(t, Wd(8, "fija") - 0.3, E(8))} />
      </Scene>

      {/* 9 · gasta más que una de compresor */}
      <Scene {...sc(9)}>
        {chip(9, "Su punto débil", K.cold)}
        <Svg>
          <text x={540} y={450} textAnchor="middle" fontFamily="MontserratSerie, sans-serif" fontWeight={900} fontSize={36} fill={C.light}>ENERGÍA PARA EL MISMO FRÍO</text>
          <rect x={120} y={570} width={840 * 0.95} height={80} rx={14} fill={C.deep} />
          <rect x={120} y={570} width={840 * 0.95 * bar9} height={80} rx={14} fill={K.hot} />
          <rect x={120} y={740} width={840 * 0.95} height={80} rx={14} fill={C.deep} />
          <rect x={120} y={740} width={840 * 0.48 * comp9} height={80} rx={14} fill={K.cold} />
          <HomeFridge x={540} y={1130} h={250} o={0.3 + 0.7 * fr9} />
        </Svg>
        <Label x={250} y={535} text="PLACA PELTIER" size={36} color={K.hot} o={0.4 + 0.6 * bar9} />
        <Label x={225} y={705} text="COMPRESOR" size={36} color={K.cold} o={0.4 + 0.6 * comp9} />
        <Label x={790} y={960} text="TU FRIGORÍFICO:" size={34} color={K.white} o={span(t, Wd(9, "frigorífico"), E(9))} />
        <Label x={790} y={1010} text="COMPRESOR" size={40} color={K.cold} o={span(t, Wd(9, "lleva"), E(9))} />
      </Scene>

      {/* 10 · curiosidad: lo descubrió un relojero francés en 1834 */}
      <Scene {...sc(10)}>
        {chip(10, "Curiosidad", K.cold)}
        <Svg>
          <PocketWatch x={540} y={760} r={230} t={t} />
        </Svg>
        <Label x={540} y={470} text="UN RELOJERO FRANCÉS" color={K.white} o={span(t, Wd(10, "relojero"), E(10))} />
        <Label x={540} y={1080} text="JEAN PELTIER" size={48} color={K.flow} box o={span(t, Wd(10, "jean"), E(10))} />
        <Stamp x={800} y={1000} text="1834" color={K.flow} size={64} p={year10} rot={-6} />
      </Scene>

      {/* 11 · truco: mételas ya frías */}
      <Scene {...sc(11)}>
        {chip(11, "Truco", K.cold)}
        <Svg>
          <HomeFridge x={160} y={1150} h={330} o={0.5 + 0.5 * ramp(t, Wd(11, "casa"), Wd(11, "casa") + 0.3)} />
          <Cooler cx={610} cy={900} w={480} t={t} open={0.75} cans={false} id="o11" />
          {[0, 1, 2].map((k) => {
            const p = ramp(t, wFr - 0.4 + k * 0.25, wFr + 0.5 + k * 0.25);
            const x = 170 + (490 + k * 110 - 170) * p, y = 1010 + (1085 - 1010) * p - 90 * Math.sin(Math.PI * p);
            return <Can key={k} x={x} y={y} h={110} color={K.cold} o={0.35 + 0.65 * drop11} />;
          })}
        </Svg>
        <Label x={500} y={430} text="YA FRÍAS DE CASA" color={K.cold} box o={span(t, wFr, Wd(11, "enfriar") - 0.05)} />
        <Label x={480} y={430} text="DESDE CERO: HORAS" color={K.hot} box o={span(t, Wd(11, "enfriar") + 0.3, E(11))} />
        <Svg>
          <g opacity={hrs11} transform="translate(900,470)">
            <circle r={60} fill={C.deep} stroke={K.hot} strokeWidth={6} />
            <line x1={0} y1={0} x2={0} y2={-40} stroke={K.hot} strokeWidth={7} strokeLinecap="round" transform={`rotate(${t * 240})`} />
            <line x1={0} y1={0} x2={28} y2={0} stroke={K.hot} strokeWidth={7} strokeLinecap="round" transform={`rotate(${t * 20})`} />
          </g>
        </Svg>
      </Scene>

      {/* 12 · otra: no tapes la rejilla */}
      <Scene {...sc(12)}>
        {chip(12, "Otra", K.cold)}
        <Svg>
          <Cooler cx={540} cy={880} w={640} t={t} fan={1} covered={cov12} hot={hot12} id="o12" />
          <Thermo x={880} y={1080} h={230} value={4 + 16 * hot12} min={0} max={30} color={hot12 > 0.5 ? K.hot : K.cold} o={ramp(t, Wd(12, "calor") - 0.2, Wd(12, "calor") + 0.2)} />
        </Svg>
        <Label x={540} y={430} text="NO TAPES LA REJILLA" color={K.flow} box o={span(t, Wd(12, "tapes"), ap12 - 0.05)} />
        <Stamp x={540} y={430} text="¡APENAS ENFRÍA!" size={44} p={ramp(t, ap12, ap12 + 0.3)} />
      </Scene>

      {/* 13 · cierre */}
      <Scene {...sc(13)}>
        {chip(13, "En resumen")}
        <Svg>
          <Cooler cx={540} cy={780} w={420} t={t} open={0.6} id="end" />
          <Icon kind="corriente" x={250} y={1060} t={t} on={ramp(t, Wd(13, "corriente"), Wd(13, "corriente") + 0.3)} />
          <Icon kind="placa" x={540} y={1060} t={t} on={ramp(t, Wd(13, "placa"), Wd(13, "placa") + 0.3)} />
          <Icon kind="calor" x={830} y={1060} t={t} on={ramp(t, Wd(13, "calor"), Wd(13, "calor") + 0.3)} />
        </Svg>
        <Label x={540} y={430} text="SIN GAS NI COMPRESOR" color={K.flow} box o={span(t, S(13), Infinity)} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
