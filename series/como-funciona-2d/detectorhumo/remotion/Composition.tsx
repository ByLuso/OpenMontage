// Episodio 153 · Cómo funciona un detector de humo (óptico). 2D, plantilla de la serie.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en Detector.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, Gauge, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Chamber, Face, Side, Piezo, Battery, Chirp, IonChamber, Trefoil, Shower, Pan, Finger, C } from "./Detector";

export const COMP_ID = "DetectorHumo";
export const HOOK = "Dentro hay un laberinto"; // = meta.portada (≤5 palabras, la última va en amarillo)
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

  // beat 1: en «laberinto» la tapa se levanta y se va arriba a la derecha
  const op1 = R(1, "laberinto", 0.7);
  // beat 7: nivel de luz en el sensor y umbral
  const lvl7 = 0.12 + 0.8 * ramp(t, Wd(7, "mide"), Wd(7, "alarma"));
  const TH = 0.6;
  const over7 = lvl7 > TH;
  const barTop = 500, barBot = 1060, barH = barBot - barTop;
  // beat 9: pitido corto periódico (en pantalla cada 1,5 s)
  const chirpP = (() => { const a = Wd(9, "pitido"); if (t < a) return 0; const k = (t - a) % 1.5; return k < 0.45 ? Math.sin((Math.PI * k) / 0.45) : 0; })();
  // beat 11: el dedo sube y pulsa el botón de prueba
  const fIn = span(t, Wd(11, "pulsa") - 0.2, Wd(11, "diez"), 0.35);
  const press11 = span(t, Wd(11, "prueba"), Wd(11, "mes") + 0.6, 0.15);
  // beat 12: el detector se aleja del vapor y de la cocina
  const mv12 = ramp(t, Wd(12, "alejalo"), Wd(12, "metros") + 0.4);
  const dx12 = 420 + 380 * mv12;
  // beat 13: resumen
  const resW = ["laberinto", "luz", "sirena"];
  const cur = resW.reduce((acc, w, k) => (t >= Wd(13, w) ? k : acc), -1);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el detector GRANDE desde el fotograma 0; en «laberinto» se levanta la tapa y aparece la cámara */}
      <Scene {...sc(1)}>
        <SVG>
          <Chamber x={540} y={850} s={0.95} t={t} led={op1} beam={op1} hi={op1 > 0.5 ? "walls" : ""} />
          <Face x={540 + 310 * op1} y={800 - 360 * op1} s={1 - 0.65 * op1} rot={-14 * op1} t={t} />
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={260} y={460} text="¡UN LABERINTO!" size={42} color={K.flow} box o={L(1, "laberinto")} />
      </Scene>

      {/* 2 · la promesa: cámara oscura en zigzag; el humo se cuela, la luz de fuera choca */}
      <Scene {...sc(2)}>
        <SVG>
          <Chamber x={540} y={790} s={0.9} t={t} led={0} beam={0} hi={t > Wd(2, "zigzag") ? "walls" : ""} wisp={R(2, "humo")} smoke={0.8 * R(2, "humo", 0.8)} outside={ramp(t, Wd(2, "pero"), Wd(2, "luz") + 0.4)} />
        </SVG>
        {chip(2, "EL LABERINTO")}
        <Label x={540} y={445} text="CÁMARA OSCURA" size={42} color={K.white} box o={L(2, "oscura")} />
        <Label x={300} y={1120} text="HUMO: SÍ" size={42} color={C.smoke} box o={L(2, "humo")} />
        <Label x={760} y={1120} text="LUZ: NO" size={42} color={K.warn} box o={L(2, "pero")} />
      </Scene>

      {/* 3 · la idea clave: una luz que apunta a otro lado y el humo la desvía al sensor */}
      <Scene {...sc(3)}>
        <SVG>
          <Chamber x={540} y={770} s={0.85} t={t} led={dimTo(3, "luz")} beam={ramp(t, Wd(3, "luz"), Wd(3, "otro") + 0.4)} smoke={R(3, "humo")} scatter={R(3, "desvia")} hit={R(3, "desvia")}
            hi={t > Wd(3, "sensor") ? "pd" : ""} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={540} y={445} text="LUZ HACIA OTRO LADO" size={42} color={K.flow} box o={L(3, "otro")} />
        <Label x={540} y={1110} text="EL HUMO LA DESVÍA" size={42} color={K.white} box o={L(3, "desvia")} />
      </Scene>

      {/* 4 · primero: el LED lanza un haz que cruza la cámara a oscuras */}
      <Scene {...sc(4)}>
        <SVG>
          <Chamber x={540} y={780} s={0.95} t={t} led={dimTo(4, "led")} beam={ramp(t, Wd(4, "haz"), Wd(4, "cruza") + 0.6)} hi={t > Wd(4, "led") ? "led" : ""} />
        </SVG>
        {chip(4, "1 · LA LUZ", K.flow)}
        <Label x={300} y={445} text="LED" size={46} color={K.flow} box o={L(4, "led")} />
        <Label x={540} y={1115} text="UN HAZ DE LUZ" size={42} color={K.flow} box o={L(4, "haz")} />
      </Scene>

      {/* 5 · el fotodiodo está en ángulo: el haz pasa de largo y no lo ve */}
      <Scene {...sc(5)}>
        <SVG>
          <Chamber x={540} y={780} s={0.95} t={t} hi={t > Wd(5, "fotodiodo") ? "pd" : ""} angle={R(5, "angulo")} />
        </SVG>
        {chip(5, "1 · EL SENSOR", K.cold)}
        <Label x={540} y={445} text="EN ÁNGULO" size={42} color={K.cold} box o={L(5, "angulo")} />
        <Label x={540} y={1115} text="FOTODIODO" size={42} color={K.cold} box o={L(5, "fotodiodo", Wd(5, "pasa") - 0.05)} />
        <Label x={540} y={1115} text="NO LE LLEGA LUZ" size={42} color={K.white} box o={span(t, Wd(5, "pasa") + 0.3, E(5))} />
      </Scene>

      {/* 6 · segundo: entra el humo; la luz choca con las partículas y parte rebota al fotodiodo */}
      <Scene {...sc(6)}>
        <SVG>
          <Chamber x={540} y={780} s={0.95} t={t} smoke={R(6, "entra", 0.8)} scatter={R(6, "rebota")} hit={R(6, "rebota")} />
        </SVG>
        {chip(6, "2 · EL HUMO", C.smoke)}
        <Label x={540} y={445} text="PARTÍCULAS DE HUMO" size={42} color={K.white} box o={L(6, "particulas")} />
        <Label x={540} y={1115} text="¡LUZ AL SENSOR!" size={44} color={K.flow} box o={L(6, "rebota")} />
      </Scene>

      {/* 7 · tercero: un circuito mide la luz; si pasa del umbral, alarma */}
      <Scene {...sc(7)}>
        <SVG>
          <Chamber x={300} y={760} s={0.5} t={t} smoke={1} scatter={1} hit={lvl7} />
          <g opacity={dimTo(7, "circuito")}>
            <rect x={720} y={barTop} width={130} height={barH} rx={20} fill="rgba(6,16,31,0.85)" stroke={C.case3} strokeWidth={6} />
            <rect x={734} y={barBot - 14 - (barH - 28) * lvl7} width={102} height={(barH - 28) * lvl7} rx={12} fill={over7 ? K.warn : K.flow}
              style={{ filter: `drop-shadow(0 0 10px ${over7 ? K.warn : K.flow})` }} />
            <line x1={690} x2={880} y1={barBot - 14 - (barH - 28) * TH} y2={barBot - 14 - (barH - 28) * TH} stroke={K.warn} strokeWidth={7} strokeDasharray="18 10" />
          </g>
          <path d={`M${300 + 0.5 * 45},${760 + 0.5 * 175} C450,960 600,900 715,820`} fill="none" stroke={K.flow} strokeWidth={6} strokeDasharray="12 10" strokeDashoffset={-t * 80} opacity={dimTo(7, "mide")} />
        </SVG>
        {chip(7, "3 · EL UMBRAL", K.warn)}
        <Label x={590} y={barBot - 14 - (barH - 28) * TH - 44} text="UMBRAL" size={38} color={K.warn} box o={L(7, "umbral")} />
        <Label x={300} y={445} text="MIDE LA LUZ" size={40} color={K.flow} box o={L(7, "mide")} />
        <Stamp x={360} y={1090} text="¡ALARMA!" size={60} p={R(7, "alarma", 0.35)} />
      </Scene>

      {/* 8 · cuarto: la sirena piezoeléctrica, al menos 85 dB a 3 m */}
      <Scene {...sc(8)}>
        <SVG>
          <Piezo x={380} y={720} s={0.85} t={t} on={R(8, "vibra", 0.3)} />
          <g opacity={R(8, "tres")}>
            <path d="M120,1060 L900,1060" stroke={K.white} strokeWidth={6} />
            <path d="M120,1060 l26,-16 l0,32 Z M900,1060 l-26,-16 l0,32 Z" fill={K.white} />
          </g>
        </SVG>
        {chip(8, "4 · LA SIRENA", K.warn)}
        <Label x={380} y={445} text="PIEZOELÉCTRICA" size={40} color={C.brass} box o={L(8, "plaquita")} />
        <Gauge value={85 * ramp(t, Wd(8, "ochenta"), Wd(8, "decibelios") + 0.3)} max={120} unit="dB" color={K.flow} x={800} y={560} label="MÍNIMO" t={t} t0={Wd(8, "ochenta")} t1={E(8)} />
        <Label x={510} y={1112} text="A 3 METROS" size={42} color={K.white} box o={L(8, "tres")} />
      </Scene>

      {/* 9 · el pitido corto que se repite: pila baja */}
      <Scene {...sc(9)}>
        <SVG>
          <Face x={380} y={630} s={0.5} t={t} />
          <Chirp x={720} y={500} p={chirpP} />
          <g opacity={dimTo(9, "pila")}><Battery x={540} y={970} s={0.75} lvl={0.12} t={t} blink={R(9, "pila")} /></g>
        </SVG>
        {chip(9, "OJO AL PITIDO")}
        <Label x={760} y={700} text="NO ES HUMO" size={40} color={K.white} box o={L(9, "humo")} />
        <Label x={540} y={1120} text="PILA BAJA" size={44} color={K.warn} box o={L(9, "pila")} />
      </Scene>

      {/* 10 · curiosidad: el detector iónico con una pizca de americio-241 */}
      <Scene {...sc(10)}>
        <SVG>
          <IonChamber x={540} y={760} s={0.8} t={t} ions={dimTo(10, "ionico")} glow={R(10, "americio")} />
          <Trefoil x={860} y={520} r={52} o={R(10, "pizca")} />
        </SVG>
        {chip(10, "CURIOSIDAD")}
        <Label x={540} y={445} text="OTRO TIPO: IÓNICO" size={42} color={K.white} box o={L(10, "ionico")} />
        <Label x={540} y={1000} text="AMERICIO-241" size={40} color={K.flow} box o={L(10, "americio", Wd(10, "inofensiva"))} />
        <Label x={540} y={1110} text="INOFENSIVO SI NO LO ROMPES" size={38} color={K.cold} box o={L(10, "inofensiva")} />
      </Scene>

      {/* 11 · truco: botón de prueba cada mes; a los 10 años, detector nuevo */}
      <Scene {...sc(11)}>
        <SVG>
          <Face x={540} y={700} s={0.75} t={t} press={press11} alarm={press11} />
          <Finger x={540} y={700 + 40 + 380 * (1 - fIn) - 10 * press11} o={fIn} />
        </SVG>
        {chip(11, "TRUCO")}
        <Label x={220} y={445} text="CADA MES" size={42} color={K.flow} box o={L(11, "mes", Wd(11, "diez"))} />
        <Stamp x={800} y={470} text="10 AÑOS" color={K.flow} size={58} rot={6} p={R(11, "diez", 0.35)} />
        <Label x={540} y={1110} text="CÁMBIALO ENTERO" size={42} color={K.white} box o={L(11, "cambia")} />
      </Scene>

      {/* 12 · otra: vapor de la ducha o cocinar pueden dispararlo; aléjalo de baño y cocina */}
      <Scene {...sc(12)}>
        <SVG>
          <rect x={60} y={452} width={960} height={18} rx={6} fill={C.case1} />
          <Shower x={250} y={830} t={t} steam={dimTo(12, "vapor")} />
          <Pan x={560} y={1040} t={t} fumes={dimTo(12, "cocinar")} />
          <Side x={dx12} y={470} s={1} t={t} alarm={span(t, Wd(12, "dispararlo"), Wd(12, "alejalo") + 0.3, 0.2)} />
          <g opacity={R(12, "alejalo")}>
            <path d="M450,620 L790,620" stroke={K.flow} strokeWidth={8} strokeLinecap="round" />
            <path d="M800,620 l-30,-20 l0,40 Z" fill={K.flow} />
          </g>
        </SVG>
        {chip(12, "OTRA")}
        <Label x={620} y={700} text="UNOS METROS" size={40} color={K.flow} box o={L(12, "metros")} />
        <Label x={250} y={1115} text="VAPOR" size={40} color={K.white} box o={L(12, "vapor")} />
        <Label x={790} y={1115} text="COCINA" size={40} color={K.hot} box o={L(12, "cocinar")} />
      </Scene>

      {/* 13 · cierre: resumen */}
      <Scene {...sc(13)}>
        <SVG>
          <Chamber x={220} y={700} s={0.4} t={t} led={0} beam={0} hi={cur === 0 ? "walls" : ""} o={dimTo(13, "laberinto")} />
          <Chamber x={540} y={700} s={0.4} t={t} smoke={1} scatter={1} hit={1} o={dimTo(13, "luz")} />
          <g opacity={dimTo(13, "sirena")}><Piezo x={850} y={700} s={0.36} t={t} on={cur === 2 ? 1 : 0.3} /></g>
        </SVG>
        {chip(13, "RESUMEN")}
        <Label x={220} y={960} text="LABERINTO" size={38} color={cur === 0 ? K.flow : K.white} box o={dimTo(13, "laberinto")} />
        <Label x={540} y={960} text="LUZ" size={38} color={cur === 1 ? K.flow : K.white} box o={dimTo(13, "luz")} />
        <Label x={850} y={960} text="SIRENA" size={38} color={cur === 2 ? K.flow : K.white} box o={dimTo(13, "sirena")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
