// Episodio 137 · Cómo sabe el semáforo que hay un coche esperando (espira magnética).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming, clamp01 } from "./kit2d/Kit";
import { TrafficLight, Lane, LoopTop, Field, CarTop, CarSide, RoadSection, Box, Scope, Brain, Camera, Radar, Clock, BikeTop, PedButton, Finger, C, Light } from "./Semaforo";

export const COMP_ID = "Semaforo";
export const HOOK = "Te detecta un cable"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

/** Atenuado al principio (0,3) y pleno desde la palabra w. */
const dim = (t: number, w: number) => 0.3 + 0.7 * ramp(t, w, w + 0.3);
/** Avance lineal 0→1 entre a y b. */
const lin = (t: number, a: number, b: number) => clamp01((t - a) / Math.max(0.001, b - a));
/** Pulsaciones periódicas desde t0: k = nº hechas, p = 1 al pulsar y cae en 0,15 s. */
const pulses = (t: number, t0: number, every: number, max = 99) => {
  if (t < t0) return { k: 0, p: 0 };
  const u = (t - t0) / every;
  const k = Math.min(max, Math.floor(u) + 1);
  const f = u - Math.floor(u);
  return { k, p: Math.floor(u) + 1 > max ? 0 : f < 0.5 ? 1 - f / 0.5 : 0 };
};

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(scene(i)[0], i === 1 ? 1.8 : 0), scene(i)[1])} />;
  const A = (i: number) => scene(i)[0];
  const Z = (i: number) => scene(i)[1];

  // ---------- beat 1 ----------
  const b1open = ramp(t, Wd(1, "secreto"), Wd(1, "secreto") + 0.6);
  const b1car = ramp(t, Wd(1, "asfalto") - 0.4, Wd(1, "cable"));
  const b1nota = ramp(t, Wd(1, "nota"), Wd(1, "nota") + 0.3);
  // ---------- beat 3 ----------
  const b3car = ramp(t, A(3) + 0.2, Wd(3, "metal"));
  const b3alt = ramp(t, Wd(3, "altera"), Wd(3, "altera") + 0.4);
  // ---------- beat 5 ----------
  const b5car = ramp(t, A(5) + 0.2, Wd(5, "encima") + 0.2);
  const b5ind = ramp(t, Wd(5, "inductancia"), Wd(5, "inductancia") + 0.6);
  // ---------- beat 6 ----------
  const b6a = Wd(6, "avisa"), b6c = Wd(6, "controlador"), b6v = Wd(6, "verde");
  const b6light: Light = t < b6v ? "r" : "g";
  // ---------- beat 8 ----------
  const b8u = lin(t, Wd(8, "velocidad") - 0.2, Z(8) - 0.2);
  const b8y = 1220 - 900 * b8u;
  const b8lights = [1040, 840, 640, 440];
  // ---------- beat 9 ----------
  const b9bike = ramp(t, Wd(9, "bici") - 0.3, Wd(9, "moto") + 0.2);
  // ---------- beat 10 ----------
  const b10mv = ramp(t, Wd(10, "encima") - 0.4, Wd(10, "encima") + 0.4);
  const b10x = 540 - 170 * b10mv;
  const b10in = ramp(t, A(10) + 0.1, Wd(10, "detente"));
  // ---------- beat 11 ----------
  const b11 = pulses(t, Wd(11, "pulsarlo"), 0.2, 10);
  const b11first = Wd(11, "botón") + 0.2;
  const b11press = t < Wd(11, "pulsarlo") ? Math.max(0, 1 - Math.abs(t - b11first - 0.15) / 0.15) : b11.p;
  // ---------- beat 12 ----------
  const b12car = ramp(t, A(12) + 0.1, Wd(12, "nota"));
  const b12v = Wd(12, "verde");

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: semáforo grande y el asfalto; al decir «secreto» el corte se abre y se ve el cable */}
      <Scene {...sc(1)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <TrafficLight x={770} y={560} s={1.3} on="r" pole={148} t={t} />
          <RoadSection x0={40} x1={1040} y={1000} slots={[250, 530]} open={b1open} glow={b1open} t={t} />
          <g opacity={b1car}>
            <CarSide cx={-200 + 590 * b1car} base={994} s={0.95} spin={b1car * 540} />
          </g>
          {b1nota > 0.01 && <circle cx={390} cy={900} r={60 + 140 * ((t * 1.2) % 1)} fill="none" stroke={K.cold} strokeWidth={6} opacity={b1nota * (1 - ((t * 1.2) % 1))} />}
        </svg>
        {chip(1, "EL SECRETO DEL SEMÁFORO")}
        <Label x={390} y={1100} text="un cable bajo el asfalto" size={40} color={K.flow} o={ramp(t, Wd(1, "cable"), Wd(1, "cable") + 0.3)} />
        <Label x={300} y={560} text="¡te ha notado!" size={48} color={K.cold} box o={b1nota} />
      </Scene>

      {/* 2 · la espira: bucle de cable en un corte rectangular */}
      <Scene {...sc(2)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Lane x0={200} x1={680} y0={400} y1={1150} stop={470} />
          <LoopTop cx={440} cy={790} w={300} h={360} t={t} lead={110} glow={ramp(t, Wd(2, "bucle"), Wd(2, "bucle") + 0.4)} />
          {t > Wd(2, "cortes") && <rect x={290} y={610} width={300} height={360} fill="none" stroke={K.white} strokeWidth={4}
            opacity={0.8 * Math.max(0, Math.sin((t - Wd(2, "cortes")) * 6))} />}
          {/* lupa: corte transversal del surco con las vueltas de cable */}
          <g opacity={dim(t, Wd(2, "metido"))}>
            <line x1={590} y1={700} x2={760} y2={640} stroke={K.white} strokeWidth={4} strokeDasharray="10 8" />
            <circle cx={850} cy={620} r={130} fill={C.dark} stroke={K.white} strokeWidth={6} />
            <rect x={730} y={560} width={240} height={140} fill="#141c29" />
            <rect x={730} y={545} width={95} height={40} fill={C.asph2} /><rect x={875} y={545} width={95} height={40} fill={C.asph2} />
            <rect x={825} y={545} width={50} height={120} fill={C.groove} />
            {[0, 1, 2].map((k) => <circle key={k} cx={850} cy={590 + k * 24} r={10} fill={K.flow} />)}
          </g>
        </svg>
        {chip(2, "LA ESPIRA MAGNÉTICA")}
        <Label x={850} y={450} text="2-3 vueltas" size={38} color={K.flow} o={dim(t, Wd(2, "cable"))} />
        <Label x={440} y={1060} text="cortes en el asfalto" size={44} box o={ramp(t, Wd(2, "cortes"), Wd(2, "cortes") + 0.3)} />
      </Scene>

      {/* 3 · idea clave: el metal del coche altera el cable */}
      <Scene {...sc(3)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <defs><clipPath id="lane3"><rect x={200} y={400} width={480} height={750} /></clipPath></defs>
          <Lane x0={200} x1={680} y0={400} y1={1150} stop={470} />
          <LoopTop cx={440} cy={790} w={300} h={360} t={t} glow={1} color={b3alt > 0.5 ? K.cold : K.flow} />
          <Field cx={440} cy={790} w={300} h={360} t={t} o={b3alt} k={0.6} />
          <g clipPath="url(#lane3)"><CarTop cx={440} cy={1400 - 610 * b3car} s={0.95} /></g>
          <TrafficLight x={860} y={640} s={0.7} on="r" pole={260} t={t} />
          {t > Wd(3, "semáforo") && <circle cx={860} cy={640} r={120 + 80 * ((t * 1.3) % 1)} fill="none" stroke={K.cold} strokeWidth={6} opacity={1 - ((t * 1.3) % 1)} />}
        </svg>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={440} y={540} text="metal" size={44} color={K.hot} box o={ramp(t, Wd(3, "metal"), Wd(3, "metal") + 0.3)} />
        <Label x={440} y={1080} text="el metal altera el cable" size={42} color={K.cold} box o={ramp(t, Wd(3, "altera"), Wd(3, "altera") + 0.3)} />
        <Label x={860} y={410} text="¡estás ahí!" size={44} color={K.cold} o={ramp(t, Wd(3, "sabe"), Wd(3, "sabe") + 0.3)} />
      </Scene>

      {/* 4 · corriente alterna y campo magnético */}
      <Scene {...sc(4)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Lane x0={160} x1={640} y0={400} y1={1150} />
          <LoopTop cx={400} cy={780} w={300} h={360} t={t} lead={270} glow={dim(t, Wd(4, "cable"))}
            current={ramp(t, Wd(4, "corriente"), Wd(4, "corriente") + 0.3)} />
          <Field cx={400} cy={780} w={300} h={360} t={t} o={ramp(t, Wd(4, "campo"), Wd(4, "campo") + 0.4)} />
          <g opacity={dim(t, Wd(4, "detector"))}>
            <Box x={820} y={780} w={220} h={170} title="DETECTOR" led={Math.sin(t * 8) > 0 ? 1 : 0.2} />
          </g>
          <Scope x={820} y={560} w={200} h={110} t={t} freq={3} o={dim(t, Wd(4, "alterna"))} />
        </svg>
        {chip(4, "PRIMERO · LA CORRIENTE")}
        <Label x={400} y={1070} text="corriente alterna: va y viene" size={40} color={K.flow} box o={span(t, Wd(4, "alterna"), Wd(4, "campo"))} />
        <Label x={400} y={1070} text="campo magnético" size={46} color={K.cold} box o={ramp(t, Wd(4, "campo") + 0.3, Wd(4, "campo") + 0.6)} />
      </Scene>

      {/* 5 · el coche encima baja la inductancia y la frecuencia cambia */}
      <Scene {...sc(5)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <defs><clipPath id="lane5"><rect x={160} y={400} width={480} height={750} /></clipPath></defs>
          <Lane x0={160} x1={640} y0={400} y1={1150} />
          <LoopTop cx={400} cy={780} w={300} h={360} t={t} lead={290} glow={1} current={1} color={b5ind > 0.5 ? K.cold : K.flow} />
          <Field cx={400} cy={780} w={300} h={360} t={t} k={1 - 0.6 * b5ind} />
          <g clipPath="url(#lane5)"><CarTop cx={400} cy={1400 - 620 * b5car} s={0.95} /></g>
          <Scope x={810} y={640} w={210} h={130} t={t * (1 + 0.6 * ramp(t, Wd(5, "frecuencia"), Wd(5, "frecuencia") + 0.6))}
            freq={3 + 2 * ramp(t, Wd(5, "frecuencia"), Wd(5, "frecuencia") + 0.6)} color={t > Wd(5, "frecuencia") ? K.cold : K.flow} />
        </svg>
        {chip(5, "SEGUNDO · EL CAMBIO")}
        <Label x={810} y={470} text="inductancia ↓" size={42} color={K.cold} o={dim(t, Wd(5, "inductancia"))} />
        <Label x={810} y={830} text="la frecuencia cambia" size={32} color={K.flow} box o={ramp(t, Wd(5, "frecuencia"), Wd(5, "frecuencia") + 0.3)} />
      </Scene>

      {/* 6 · detector → controlador → semáforo */}
      <Scene {...sc(6)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Box x={220} y={560} w={220} h={170} title="DETECTOR" led={t > b6a ? 1 : 0.2} />
          <path d="M 330 560 Q 450 560 480 650" fill="none" stroke={K.white} strokeWidth={6} strokeDasharray="14 12" opacity={0.6} />
          <path d="M 620 700 Q 700 660 760 640" fill="none" stroke={K.white} strokeWidth={6} strokeDasharray="14 12" opacity={0.6} />
          {t > b6a && t < b6c + 0.6 && (() => { const u = lin(t, b6a, b6c); return <circle cx={330 + 150 * u} cy={560 + 90 * u * u} r={16} fill={K.flow} style={{ filter: `drop-shadow(0 0 10px ${K.flow})` }} />; })()}
          {t > b6v - 1.4 && t < b6v + 0.2 && (() => { const u = lin(t, b6v - 1.4, b6v - 1.0); return <circle cx={620 + 140 * u} cy={700 - 60 * u} r={16} fill={C.go} />; })()}
          <Brain x={540} y={720} s={0.95} t={t} glow={ramp(t, b6c, b6c + 0.3) * (1 - 0.6 * ramp(t, b6v + 0.5, b6v + 1))} />
          <TrafficLight x={850} y={620} s={0.75} on={b6light} pole={240} t={t} />
        </svg>
        {chip(6, "TERCERO · EL CONTROLADOR")}
        <Label x={540} y={860} text="controlador" size={42} color={K.flow} o={dim(t, b6c)} />
        <Label x={540} y={1060} text="decide cuándo darte el verde" size={42} box o={ramp(t, Wd(6, "decide"), Wd(6, "decide") + 0.3)} />
      </Scene>

      {/* 7 · otros sistemas: cámaras, radar, tiempos fijos */}
      <Scene {...sc(7)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Camera x={200} y={620} s={0.85} t={t} o={dim(t, Wd(7, "cámaras"))} rec={Math.sin(t * 6) > 0 ? 1 : 0} />
          <Radar x={540} y={620} s={0.9} t={t} o={dim(t, Wd(7, "radar"))} />
          <Clock x={860} y={620} s={0.9} t={t} o={dim(t, Wd(7, "tiempos"))} />
          <g opacity={0.9}><LoopTop cx={540} cy={1000} w={200} h={110} t={t} glow={0.7} /></g>
        </svg>
        {chip(7, "CUARTO · OTROS SISTEMAS")}
        <Label x={200} y={780} text="cámaras" size={40} color={K.cold} o={dim(t, Wd(7, "cámaras"))} />
        <Label x={540} y={780} text="radar" size={40} color={K.cold} o={dim(t, Wd(7, "radar"))} />
        <Label x={860} y={780} text="tiempo fijo" size={40} color={K.flow} o={dim(t, Wd(7, "tiempos"))} />
        <Stamp x={540} y={1000} text="NO SIEMPRE" p={ramp(t, Wd(7, "espira"), Wd(7, "espira") + 0.3)} />
      </Scene>

      {/* 8 · onda verde */}
      <Scene {...sc(8)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <defs><clipPath id="lane8"><rect x={440} y={380} width={300} height={770} /></clipPath></defs>
          <Lane x0={440} x1={740} y0={380} y1={1150} />
          {b8lights.map((y) => <rect key={y} x={440} y={y + 60} width={300} height={14} fill={K.white} opacity={0.5} />)}
          <g clipPath="url(#lane8)"><CarTop cx={590} cy={b8y} s={0.6} /></g>
          {b8lights.map((y) => {
            const on: Light = t > Wd(8, "velocidad") - 0.2 && b8y < y + 380 ? "g" : t > Wd(8, "onda") && y === 1040 ? "g" : "r";
            return <TrafficLight key={y} x={830} y={y} s={0.36} on={on} t={t} />;
          })}
        </svg>
        {chip(8, "CUARTO · ONDA VERDE")}
        <Label x={240} y={600} text="onda verde" size={46} color={C.go} box o={dim(t, Wd(8, "onda"))} />
        <Label x={240} y={780} text="velocidad" size={38} o={ramp(t, Wd(8, "velocidad"), Wd(8, "velocidad") + 0.3)} />
        <Label x={240} y={830} text="prevista" size={38} o={ramp(t, Wd(8, "velocidad"), Wd(8, "velocidad") + 0.3)} />
        <Label x={240} y={1040} text="verde tras verde" size={36} color={C.go} o={ramp(t, Wd(8, "encadenas"), Wd(8, "encadenas") + 0.3)} />
      </Scene>

      {/* 9 · curiosidad: la bici lleva poco metal */}
      <Scene {...sc(9)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <defs><clipPath id="lane9"><rect x={300} y={400} width={480} height={540} /></clipPath></defs>
          <Lane x0={300} x1={780} y0={400} y1={940} />
          <LoopTop cx={540} cy={680} w={300} h={300} t={t} glow={1} />
          <Field cx={540} cy={680} w={300} h={300} t={t} k={0.25} o={0.5} />
          <g clipPath="url(#lane9)"><BikeTop cx={540} cy={1100 - 420 * b9bike} s={0.9} /></g>
          {/* medidor de señal con umbral */}
          <rect x={180} y={1030} width={720} height={44} rx={22} fill={C.dark} stroke={C.case2} strokeWidth={4} />
          <rect x={184} y={1034} width={712 * 0.9 * ramp(t, Wd(9, "coche"), Wd(9, "coche") + 0.4)} height={36} rx={18} fill={K.hot} opacity={0.35} />
          <rect x={184} y={1034} width={712 * 0.22 * b9bike} height={36} rx={18} fill={K.warn} />
          <line x1={180 + 720 * 0.55} y1={1012} x2={180 + 720 * 0.55} y2={1092} stroke={K.white} strokeWidth={6} />
        </svg>
        {chip(9, "CURIOSIDAD", K.cold)}
        <Label x={576} y={990} text="umbral" size={30} o={1} />
        <Label x={260} y={990} text="bici" size={32} color={K.warn} o={dim(t, Wd(9, "bici"))} />
        <Label x={820} y={990} text="coche" size={32} color={K.hot} o={dim(t, Wd(9, "coche"))} />
        <Label x={540} y={450} text="mucho menos metal" size={44} color={K.warn} box o={ramp(t, Wd(9, "metal"), Wd(9, "metal") + 0.3)} />
        <Stamp x={800} y={600} text="¿NO TE VE?" size={46} p={ramp(t, Wd(9, "detecta"), Wd(9, "detecta") + 0.3) * (1 - ramp(t, Wd(9, "metal") - 0.3, Wd(9, "metal")))} />
      </Scene>

      {/* 10 · truco: ruedas encima del corte */}
      <Scene {...sc(10)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <defs><clipPath id="lane10"><rect x={300} y={400} width={480} height={750} /></clipPath></defs>
          <Lane x0={300} x1={780} y0={400} y1={1150} stop={500} crossing />
          <LoopTop cx={540} cy={800} w={340} h={360} t={t} glow={0.5 + 0.5 * b10mv} color={b10mv > 0.9 ? K.cold : K.flow} />
          {b10mv > 0.9 && <Field cx={540} cy={800} w={340} h={360} t={t} k={0.6} o={ramp(t, Wd(10, "encima") + 0.4, Wd(10, "encima") + 0.8)} />}
          <g clipPath="url(#lane10)"><BikeTop cx={b10x} cy={1250 - 450 * b10in} s={0.95} /></g>
          {b10mv > 0.95 && <path d="M 230 790 L 260 830 L 320 750" fill="none" stroke={C.go} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round"
            opacity={ramp(t, Wd(10, "encima") + 0.4, Wd(10, "encima") + 0.7)} />}
        </svg>
        {chip(10, "TRUCO PARA BICIS", K.cold)}
        <Label x={540} y={1080} text="ruedas sobre el corte" size={44} color={K.cold} box o={ramp(t, Wd(10, "ruedas"), Wd(10, "ruedas") + 0.3)} />
        <Label x={540} y={545} text="antes de la línea" size={34} box o={ramp(t, Wd(10, "línea"), Wd(10, "línea") + 0.3)} />
      </Scene>

      {/* 11 · otra: el pulsador de peatones */}
      <Scene {...sc(11)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <PedButton x={380} y={680} s={0.95} press={b11press} lit={t > Wd(11, "petición") ? 1 : 0} text="ESPERE" t={t} />
          <Finger x={472 - 26 * b11press} y={790} s={0.9} o={dim(t, Wd(11, "botón"))} />
          <TrafficLight x={840} y={1000} s={0.32} on="r" t={t} />
        </svg>
        {chip(11, "OTRA · EL BOTÓN", K.cold)}
        <Label x={790} y={470} text="petición apuntada" size={36} color={K.flow} o={ramp(t, Wd(11, "petición"), Wd(11, "petición") + 0.3)} />
        <Label x={800} y={640} text={`× ${b11.k}`} size={80} color={K.white} o={b11.k > 0 ? 1 : 0} />
        <Stamp x={540} y={1100} text="NO LO ADELANTA" size={50} p={ramp(t, Wd(11, "adelanta"), Wd(11, "adelanta") + 0.3)} />
      </Scene>

      {/* 12 · resumen */}
      <Scene {...sc(12)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <TrafficLight x={770} y={560} s={1.3} on={t > b12v ? "g" : "r"} pole={148} t={t} />
          <RoadSection x0={40} x1={1040} y={1000} slots={[250, 530]} open={0.4} glow={ramp(t, Wd(12, "cable"), Wd(12, "cable") + 0.3)} t={t} />
          <CarSide cx={-200 + 590 * b12car} base={994} s={0.95} spin={b12car * 540} />
          {t > Wd(12, "pide") && <path d={`M 390 850 Q 560 620 700 560`} fill="none" stroke={K.cold} strokeWidth={6} strokeDasharray="14 12" strokeDashoffset={-t * 60}
            opacity={ramp(t, Wd(12, "pide"), Wd(12, "pide") + 0.3)} />}
        </svg>
        {chip(12, "RESUMEN")}
        <Label x={390} y={1100} text="cable + metal = te ve" size={40} color={K.flow} o={dim(t, Wd(12, "metal"))} />
        <Stamp x={300} y={560} text="¡VERDE!" color={C.go} p={ramp(t, b12v, b12v + 0.3)} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
