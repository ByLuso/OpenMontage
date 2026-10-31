// Episodio 128 · Cómo funciona una cafetera de cápsulas (2D, plantilla de la serie).
// Reglas: cada beat es una <Scene> con su dibujo (SVG en Capsula.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, Gauge, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Machine, CapsuleX, Blades, Tank, Pump, Thermo, Thermometer, Cup, Drips, Flow, Patent, C } from "./Capsula";

export const COMP_ID = "Capsulas";
export const HOOK = "La abre el agua"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { B, Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const S = (i: number) => scene(i)[0];
  const E = (i: number) => scene(i)[1];
  /** Etiqueta desde la palabra w del beat i hasta el final de la escena (o hasta `until`). */
  const L = (i: number, w: string, until?: number) => span(t, Wd(i, w), until ?? E(i));
  /** Atenuado (0,35) hasta la palabra y luego entero: para lo que «entra después». */
  const dimTo = (i: number, w: string) => 0.35 + 0.65 * ramp(t, Wd(i, w), Wd(i, w) + 0.35);
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(S(i), i === 1 ? 1.8 : 0), E(i))} />;

  // beat 2 y 8: la tapa se rasga
  const b2w = ramp(t, S(2), Wd(2, "aprieta"));
  const b2bulge = ramp(t, Wd(2, "aprieta"), Wd(2, "rasga"));
  const b2tear = ramp(t, Wd(2, "rasga"), Wd(2, "rasga") + 0.3);
  const b8w = ramp(t, S(8), Wd(8, "cruzar") + 0.6);
  const b8bulge = ramp(t, Wd(8, "aplasta"), Wd(8, "rasga"));
  const b8tear = ramp(t, Wd(8, "rasga"), Wd(8, "rasga") + 0.3);
  const resumen = ["BOMBA", "CALOR", "PINCHAZO", "PRESIÓN"];
  const resumenW = ["bomba", "calor", "pinchazo", "presion"];
  const resumenHi = ["pump", "thermo", "head", "cup"];
  const resumenX = [170, 390, 640, 875];
  const curR = resumenW.reduce((acc, w, k) => (t >= Wd(13, w) ? k : acc), -1);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: la cafetera GRANDE desde el fotograma 0; la carcasa se abre en «dentro» y la cápsula se rasga en «abre» */}
      <Scene {...sc(1)}>
        <SVG>
          <Machine t={t} open={ramp(t, Wd(1, "dentro"), Wd(1, "dentro") + 0.5)} flow={ramp(t, Wd(1, "esperas"), Wd(1, "esperas") + 0.4)}
            heat={ramp(t, Wd(1, "esperas"), Wd(1, "abre"))} brew={ramp(t, Wd(1, "esperas"), Wd(1, "abre") + 0.1)}
            cupFill={0.15 + 0.5 * ramp(t, Wd(1, "abre"), E(1))} crema={ramp(t, Wd(1, "abre"), E(1))} />
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={540} y={415} text="¡LA ABRE EL AGUA!" size={46} color={K.cold} box o={L(1, "abre")} />
      </Scene>

      {/* 2 · la promesa: la tapa se rasga contra la placa con pirámides */}
      <Scene {...sc(2)}>
        <SVG>
          <CapsuleX cx={540} top={470} h={380} wTop={200} wBot={440} t={t} water={b2w} bulge={b2bulge} tear={b2tear} holes={b2tear} />
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M${440 + k * 100},${560 + ((t * 120 + k * 40) % 120)} l0,70 m-18,-22 l18,22 l18,-22`} fill="none" stroke={K.flow} strokeWidth={8} strokeLinecap="round" opacity={b2bulge} />
          ))}
        </SVG>
        {chip(2, "EL SECRETO")}
        <Stamp x={540} y={430} text="NADA LA CORTA" size={50} p={ramp(t, Wd(2, "nada"), Wd(2, "nada") + 0.35) * (1 - ramp(t, Wd(2, "placa") - 0.3, Wd(2, "placa")))} />
        <Label x={540} y={1095} text="PLACA CON PIRÁMIDES" size={42} color={K.flow} box o={L(2, "placa")} />
      </Scene>

      {/* 3 · la idea clave: agua caliente + presión + café, en menos de medio minuto */}
      <Scene {...sc(3)}>
        <SVG>
          <Flow d="M540,420 L540,505" t={t} color={ramp(t, Wd(3, "caliente"), Wd(3, "caliente") + 0.4) > 0.5 ? K.hot : K.cold} w={16} />
          <CapsuleX cx={540} top={510} h={260} wTop={140} wBot={300} t={t} water={0.3 + 0.7 * ramp(t, Wd(3, "atravesando"), Wd(3, "presion"))} bulge={ramp(t, Wd(3, "presion"), Wd(3, "presion") + 0.4)} tear={ramp(t, Wd(3, "menos"), Wd(3, "menos") + 0.3)} holes={ramp(t, Wd(3, "menos"), Wd(3, "menos") + 0.3)} />
          <Cup cx={540} y={940} w={190} fill={0.1 + 0.6 * ramp(t, Wd(3, "menos"), E(3))} crema={ramp(t, Wd(3, "medio"), E(3))} t={t} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={790} y={460} text="AGUA CALIENTE" size={38} color={K.hot} box o={L(3, "caliente")} />
        <Label x={850} y={650} text="PRESIÓN" size={40} color={K.flow} box o={L(3, "presion")} />
        <Gauge value={Math.min(30, 30 * ramp(t, Wd(3, "menos"), E(3)))} max={30} unit="s" color={K.flow} x={210} y={640} label="< 30 s" t={t} t0={S(3)} t1={E(3) + 0.3} />
      </Scene>

      {/* 4 · primero: depósito y bomba vibratoria */}
      <Scene {...sc(4)}>
        <SVG>
          <Tank x={130} y={480} w={260} h={520} t={t} level={0.8 - 0.1 * ramp(t, Wd(4, "empuja"), E(4))} />
          <Flow d="M260,1000 L260,1060 L540,1060 L540,940" t={t} o={0.3 + 0.7 * ramp(t, Wd(4, "chupa"), Wd(4, "chupa") + 0.4)} w={16} />
          <Pump x={560} y={780} w={280} h={160} t={t} on={ramp(t, Wd(4, "bomba"), Wd(4, "bomba") + 0.3)} glow={L(4, "vibratoria")} />
          <Flow d="M862,860 L900,860 L900,520 L790,520" t={t} o={0.3 + 0.7 * ramp(t, Wd(4, "empuja"), Wd(4, "empuja") + 0.3)} w={16} speed={320} />
          <path d="M800,490 L750,520 L800,550 Z" fill={K.cold} opacity={0.3 + 0.7 * ramp(t, Wd(4, "empuja"), Wd(4, "empuja") + 0.3)} />
        </SVG>
        {chip(4, "1 · LA BOMBA")}
        <Label x={260} y={430} text="DEPÓSITO" size={40} color={K.cold} box o={L(4, "deposito")} />
        <Label x={700} y={700} text="BOMBA VIBRATORIA" size={40} color={K.flow} box o={L(4, "vibratoria")} />
        <Label x={620} y={430} text="AL CALENTADOR" size={34} color={K.cold} box o={L(4, "empuja")} />
        <Label x={680} y={1100} text="¡A PRESIÓN!" size={44} color={K.white} box o={L(4, "empuja")} />
      </Scene>

      {/* 5 · 19 bar de la bomba frente a unos 9 en la cápsula */}
      <Scene {...sc(5)}>
        <SVG>
          <Pump x={190} y={880} w={220} h={120} t={t} on={1} />
          <CapsuleX cx={780} top={830} h={170} wTop={90} wBot={200} t={t} water={1} bulge={0.6} cut={true} />
          <path d={`M450,940 L640,940`} stroke={K.white} strokeOpacity={0.5} strokeWidth={8} strokeDasharray="14 14" strokeDashoffset={-t * 80} />
        </SVG>
        {chip(5, "¿CUÁNTA PRESIÓN?")}
        <Gauge value={19 * ramp(t, Wd(5, "presume"), Wd(5, "bares"))} max={20} unit=" bar" color={K.hot} x={300} y={600} label="BOMBA" t={t} t0={S(5)} t1={E(5) + 0.3} />
        <Gauge value={9 * ramp(t, Wd(5, "capsula"), Wd(5, "nueve") + 0.2)} max={20} unit=" bar" color={K.flow} x={780} y={600} label="CÁPSULA" t={t} t0={S(5)} t1={E(5) + 0.3} />
        <Label x={300} y={1090} text="LO QUE PROMETE" size={36} o={L(5, "presume")} />
        <Label x={760} y={1090} text="≈ LO REAL" size={40} color={K.flow} o={L(5, "pero")} />
      </Scene>

      {/* 6 · segundo: calentador rápido */}
      <Scene {...sc(6)}>
        <SVG>
          <Thermo x={240} y={490} w={380} h={500} t={t} heat={ramp(t, Wd(6, "calentador"), Wd(6, "noventa"))} />
          <Thermometer x={830} y={520} h={360} v={0.15 + 0.75 * ramp(t, Wd(6, "vuelo"), Wd(6, "grados"))} />
        </SVG>
        {chip(6, "2 · EL CALENTADOR", K.hot)}
        <Label x={430} y={1095} text="BLOQUE CON CANALES" size={40} color={K.white} box o={L(6, "bloque")} />
        <Label x={830} y={455} text="≈ 90 °C" size={50} color={K.hot} box o={L(6, "noventa")} />
      </Scene>

      {/* 7 · tercero: las puntas pinchan el lado estrecho */}
      <Scene {...sc(7)}>
        <SVG>
          <CapsuleX cx={540} top={560} h={320} wTop={180} wBot={380} t={t} water={ramp(t, Wd(7, "pinchan") + 0.3, E(7))} />
          <Blades cx={540} y={560} w={150} p={ramp(t, Wd(7, "bajar"), Wd(7, "pinchan"))} />
          {(() => { const f = span(t, Wd(7, "pinchan"), Wd(7, "pinchan") + 0.6, 0.15); return f > 0.01 && [-1, 0, 1].map((k) => (
            <circle key={k} cx={540 + k * 57} cy={588} r={18 + 30 * f} fill="none" stroke={K.flow} strokeWidth={6} opacity={f} />)); })()}
        </SVG>
        {chip(7, "3 · LAS CUCHILLAS")}
        <Label x={220} y={500} text="PUNTAS" size={42} color={K.white} box o={L(7, "puntas")} />
        <Label x={540} y={1095} text="LADO ESTRECHO" size={42} color={K.flow} box o={L(7, "estrecho")} />
      </Scene>

      {/* 8 · cuarto: la tapa se rasga contra las pirámides */}
      <Scene {...sc(8)}>
        <SVG>
          <Blades cx={540} y={470} w={110} p={1} />
          <CapsuleX cx={540} top={470} h={380} wTop={200} wBot={440} t={t} water={b8w} bulge={b8bulge} tear={b8tear} holes={b8tear} />
        </SVG>
        {chip(8, "4 · LA TAPA")}
        <Label x={175} y={800} text="LÁMINA" size={40} color={C.alu} box o={L(8, "lamina")} />
        <Label x={540} y={1095} text="PIRÁMIDES" size={44} color={K.flow} box o={L(8, "piramides")} />
        <Stamp x={840} y={660} text="¡RAS!" color={K.flow} size={54} rot={8} p={span(t, Wd(8, "rasga"), E(8))} />
      </Scene>

      {/* 9 · la crema */}
      <Scene {...sc(9)}>
        <SVG>
          <Drips x={540} y0={420} y1={650} t={t} o={1 - ramp(t, Wd(9, "crema") - 0.3, Wd(9, "crema") + 0.3)} n={8} r={10} spread={30} />
          <Cup cx={540} y={640} w={440} fill={0.35 + 0.5 * ramp(t, S(9), Wd(9, "gas"))} crema={ramp(t, Wd(9, "burbujas"), Wd(9, "aceite") + 0.4)} bubbles={ramp(t, Wd(9, "burbujas"), Wd(9, "burbujas") + 0.5)} t={t} steam={0.8} />
        </SVG>
        {chip(9, "LA CREMA", C.crema)}
        <Label x={250} y={500} text="GAS DEL TOSTADO" size={36} color={K.white} box o={L(9, "gas")} />
        <Label x={830} y={500} text="+ ACEITE" size={38} color={C.crema} box o={L(9, "aceite")} />
        <Label x={540} y={1095} text="= CREMA" size={56} color={K.flow} box o={L(9, "crema")} />
      </Scene>

      {/* 10 · curiosidad: patente de 1976 */}
      <Scene {...sc(10)}>
        <SVG><Patent x={240} y={440} w={600} h={600} t={t} /></SVG>
        {chip(10, "CURIOSIDAD")}
        <Label x={540} y={720} text="PATENTE" size={52} color={C.ink} o={1} />
        <Stamp x={700} y={960} text="1976" size={80} rot={-10} p={ramp(t, Wd(10, "1976"), Wd(10, "1976") + 0.35)} />
        <Label x={540} y={1100} text="HACE 50 AÑOS" size={44} color={K.flow} box o={L(10, "medio")} />
      </Scene>

      {/* 11 · truco: pasar agua sola para calentar conductos y taza */}
      <Scene {...sc(11)}>
        <SVG>
          <Machine t={t} open={1} capsule={false} s={0.85} flow={ramp(t, Wd(11, "pasa"), Wd(11, "pasa") + 0.4)} heat={ramp(t, Wd(11, "calienta"), Wd(11, "calienta") + 0.5)}
            steam={ramp(t, Wd(11, "taza"), Wd(11, "taza") + 0.5)} hi={t > Wd(11, "taza") ? "cup" : ""} />
        </SVG>
        {chip(11, "TRUCO")}
        <Label x={300} y={440} text="SIN CÁPSULA" size={40} color={K.cold} box o={L(11, "sola")} />
        <Label x={540} y={1100} text="TAZA CALIENTE" size={44} color={K.hot} box o={L(11, "taza")} />
      </Scene>

      {/* 12 · otra: la cal tapona el calentador */}
      <Scene {...sc(12)}>
        <SVG>
          <Thermo x={240} y={490} w={380} h={500} t={t} heat={1 - 0.5 * ramp(t, Wd(12, "frio") - 0.4, Wd(12, "frio"))} cal={ramp(t, Wd(12, "cal"), Wd(12, "tapona") + 0.4)} flow={1 - 0.7 * ramp(t, Wd(12, "tapona"), Wd(12, "calentador"))} />
          <Thermometer x={830} y={520} h={360} v={0.9 - 0.45 * ramp(t, Wd(12, "frio") - 0.4, Wd(12, "frio") + 0.3)} color={t > Wd(12, "frio") ? K.cold : K.hot} />
        </SVG>
        {chip(12, "OTRA")}
        <Label x={430} y={440} text="CAL" size={46} color={C.cal} box o={L(12, "cal")} />
        <Stamp x={430} y={1090} text="DESCALCIFICA" color={K.flow} size={50} rot={-4} p={ramp(t, Wd(12, "descalcificala"), Wd(12, "descalcificala") + 0.35)} />
        <Label x={830} y={1010} text="MÁS FRÍO" size={40} color={K.cold} box o={L(12, "frio")} />
      </Scene>

      {/* 13 · cierre: resumen en 4 palabras */}
      <Scene {...sc(13)}>
        <SVG>
          <Machine t={t} open={1} s={0.9} flow={1} heat={1} brew={1} cupFill={0.3 + 0.5 * ramp(t, S(13), E(13))} crema={1} hi={curR >= 0 ? resumenHi[curR] : ""} />
        </SVG>
        {chip(13, "RESUMEN")}
        {resumen.map((r, k) => (
          <Label key={r} x={resumenX[k]} y={430} text={r} size={34} color={k === curR ? K.flow : K.white} box o={dimTo(13, resumenW[k])} />
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
