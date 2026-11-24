// Episodio 168 · Cómo funciona un altavoz (cómo un imán hace música). 2D, plantilla de la serie.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en Altavoz.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming, Callout } from "./kit2d/Kit";
import { Speaker, Box, AirWaves, AirDots, Arrow, FrontDriver, Wire, Note, Ear, sine, C, Part } from "./Altavoz";

export const COMP_ID = "Altavoz";
export const HOOK = "Un imán empujando papel"; // = meta.portada (≤5 palabras, la última va en amarillo)
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
  const after = (i: number, w: string) => t >= Wd(i, w);
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(S(i), i === 1 ? 1.8 : 0), E(i))} />;
  /** Pieza resaltada según la última palabra dicha de la lista. */
  const hiBy = (i: number, list: [string, Part][]): Part => list.reduce<Part>((acc, [w, p]) => (after(i, w) ? p : acc), "");
  /** Punto absoluto de una coordenada local del altavoz. */
  const P = (X: number, Y: number, s: number, lx: number, ly: number) => ({ x: X + s * lx, y: Y + s * ly });

  // 1 · la caja se parte en «esperas»; el cono vibra al aparecer la música
  const op1 = ramp(t, Wd(1, "esperas"), Wd(1, "esperas") + 0.8);
  const dx1 = 10 * Math.sin(t * 16) * ramp(t, Wd(1, "papel") - 0.3, Wd(1, "papel") + 0.3);
  const hi1 = hiBy(1, [["iman", "iman"], ["papel", "cono"]]);
  // 2 · cono de papel, imán, bobina pegada que empuja
  const push2 = R(2, "empuja");
  const dx2 = 16 * Math.sin(t * 9) * push2;
  const hi2 = hiBy(2, [["cono", "cono"], ["iman", "iman"], ["bobina", "bobina"]]);
  // 4 · la corriente va y viene
  const ph4 = Math.sin(t * 5) * R(4, "va", 0.5);
  // 5 · electroimán que el imán fijo empuja y atrae (lento para que se vea el cambio de polo)
  // antes de «empuja» la bobina oscila; en «empuja» va hacia delante y en «atrae» hacia atrás (atado a la voz)
  const dir5 = 1 - 2 * ramp(t, Wd(5, "atrae"), Wd(5, "atrae") + 0.3);
  const osc5 = Math.sin((t - Wd(5, "corriente")) * 2.6) * R(5, "corriente", 0.5);
  const pk5 = R(5, "empuja", 0.3);
  const cur5 = osc5 * (1 - pk5) + 0.9 * dir5 * pk5;
  const dx5 = 20 * dir5 * pk5;
  // 6 · el cono empuja el aire
  const dx6 = 22 * Math.sin(t * 8);
  // 7 · más corriente = más recorrido; rápido = agudos, lento = graves
  const amp7 = 0.35 + 0.65 * R(7, "lejos", 0.6);
  const fast7 = after(7, "rapido") && !after(7, "lento");
  const slow7 = after(7, "lento");
  const w7 = fast7 ? 30 : slow7 ? 4.5 : 9;
  const k7 = fast7 ? 0.09 : slow7 ? 0.014 : 0.035;
  const dx7 = (8 + 22 * amp7) * Math.sin(t * w7) * (fast7 ? 0.5 : 1);
  // 9 · la suspensión lo devuelve al centro (oscilación amortiguada desde «devuelven»)
  const t9 = Wd(9, "devuelven");
  const dx9 = t < t9 ? 26 * Math.sin((t - S(9)) * 3.2) : 26 * Math.sin((t9 - S(9)) * 3.2) * Math.exp(-3 * (t - t9)) * Math.cos(10 * (t - t9));
  const hi9 = hiBy(9, [["borde", "borde"], ["arana", "arana"], ["devuelven", "todo"]]);
  // 11 · al revés: tu voz mueve el cono y sale corriente
  const voice11 = R(11, "voz", 0.5);
  const dx11 = 12 * Math.sin(t * 10) * voice11;
  // 12 · barrido de frecuencias
  const sweep = 0.5 + 0.5 * Math.sin(t * 0.9);
  const k12 = 0.012 + 0.11 * sweep * sweep;
  // 13 · resumen
  const hi13 = hiBy(13, [["iman", "iman"], ["papel", "cono"], ["musica", "todo"]]);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: altavoz GRANDE desde el fotograma 0, metido en su caja; en «esperas» la caja se parte y se ve el corte */}
      <Scene {...sc(1)}>
        <SVG>
          <Speaker x={570} y={740} s={1.1} dx={dx1} hi={hi1} />
          <AirWaves x0={850} x1={1010} y={740} h={360} t={t} o={0.8 * ramp(t, Wd(1, "papel"), Wd(1, "papel") + 0.4)} speed={160} gap={60} />
          <Box x={555} y={740} w={800} h={860} open={op1} />
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={300} y={1010} text="IMÁN" size={46} color={K.flow} box o={L(1, "iman")} />
        <Label x={705} y={740} text="PAPEL" size={46} color={K.flow} box o={L(1, "papel")} />
      </Scene>

      {/* 2 · la promesa: el cono es de papel; detrás, un imán empuja una bobina pegada a él */}
      <Scene {...sc(2)}>
        <SVG>
          <Speaker x={570} y={720} s={1.1} dx={dx2} hi={hi2} cur={0.8 * push2 * Math.sin(t * 9)} />
          {[-1, 1].map((k) => (
            <Arrow key={k} x1={430} y1={720 + k * 120} x2={430 + 110 * Math.sign(Math.sin(t * 9) || 1)} y2={720 + k * 120} o={push2 * 0.95} />
          ))}
        </SVG>
        {chip(2, "IMÁN + PAPEL")}
        <Label x={700} y={1108} text="CONO DE PAPEL" size={42} color={K.flow} box o={L(2, "papel")} />
        <Label x={290} y={1010} text="IMÁN" size={44} color={K.white} box o={L(2, "iman")} />
        <Callout text="BOBINA" anchor={P(570, 720, 1.1, -150 + dx2 / 1.1, -36)} offset={[-90, -230]} color={K.flow} t={t} t0={Wd(2, "bobina")} t1={E(2)} />
      </Scene>

      {/* 3 · la idea clave: corriente → bobina → cono → aire */}
      <Scene {...sc(3)}>
        <SVG>
          <g opacity={dimTo(3, "corriente")}>
            <Wire x0={70} x1={240} y={720} ph={Math.sin(t * 6) * R(3, "corriente")} />
          </g>
          <Speaker x={430} y={720} s={0.62} dx={14 * Math.sin(t * 9) * R(3, "cono")} cur={R(3, "bobina") * Math.sin(t * 9)} hi={hiBy(3, [["bobina", "bobina"], ["cono", "cono"]])} dimOthers />
          <AirWaves x0={600} x1={1000} y={720} h={380} t={t} o={dimTo(3, "aire")} gap={90} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={170} y={1000} text="CORRIENTE" size={40} color={K.flow} box o={L(3, "corriente")} />
        <Label x={500} y={1000} text="CONO" size={42} color={K.flow} box o={L(3, "cono")} />
        <Label x={820} y={1000} text="AIRE" size={42} color={K.cold} box o={L(3, "aire")} />
      </Scene>

      {/* 4 · primero: la señal es una corriente que va y viene */}
      <Scene {...sc(4)}>
        <SVG>
          <circle cx={170} cy={720} r={95} fill={C.case1} stroke={C.case3} strokeWidth={8} />
          <Note x={155} y={755} s={0.9} color={K.flow} />
          <Wire x0={270} x1={720} y={720} ph={ph4} />
          <path d={sine(280, 720, 560, 60, -t * 5, 0.03)} fill="none" stroke={K.flow} strokeWidth={8} strokeLinecap="round" opacity={dimTo(4, "corriente")} style={{ filter: `drop-shadow(0 0 8px ${K.flow})` }} />
          <Speaker x={880} y={720} s={0.45} dx={10 * ph4} cur={ph4} />
          <Arrow x1={495 - 70 * Math.sign(ph4 || 1)} y1={830} x2={495 + 70 * Math.sign(ph4 || 1)} y2={830} color={K.flow} o={R(4, "va")} w={12} />
        </SVG>
        {chip(4, "1 · LA SEÑAL")}
        <Label x={495} y={455} text="MÚSICA = CORRIENTE" size={44} color={K.flow} box o={L(4, "corriente")} />
        <Label x={495} y={980} text="VA Y VIENE" size={46} color={K.white} box o={L(4, "viene")} />
      </Scene>

      {/* 5 · segundo: la bobina se vuelve electroimán; el imán fijo la empuja y la atrae (lupa sobre el hueco del imán) */}
      <Scene {...sc(5)}>
        <SVG>
          <defs><clipPath id="lupa5"><circle cx={540} cy={700} r={340} /></clipPath></defs>
          <circle cx={540} cy={700} r={350} fill="#0A1A30" stroke={C.case3} strokeWidth={10} />
          <g clipPath="url(#lupa5)">
            <Speaker x={800} y={700} s={2.0} dx={dx5} cur={cur5} poles={R(5, "iman")} coilPoles={R(5, "electroiman")} hi={after(5, "iman") ? "iman" : ""} />
            {[-1, 1].map((k) => (
              <Arrow key={k} x1={540 + dx5 * 2} y1={700 + k * 150} x2={540 + dx5 * 2 + 120 * Math.sign(dir5 || 1)} y2={700 + k * 150} o={R(5, "empuja") * Math.min(1, Math.abs(dir5) * 2)} />
            ))}
          </g>
        </SVG>
        {chip(5, "2 · LA BOBINA")}
        <Label x={540} y={1110} text="ELECTROIMÁN" size={46} color={K.flow} box o={L(5, "electroiman", Wd(5, "empuja") - 0.05)} />
        <Label x={540} y={1110} text={dir5 >= 0 ? "LO EMPUJA →" : "← LO ATRAE"} size={46} color={K.hot} box o={L(5, "empuja")} />
      </Scene>

      {/* 6 · tercero: el cono empuja el aire y crea ondas de presión */}
      <Scene {...sc(6)}>
        <SVG>
          <Speaker x={330} y={720} s={0.8} dx={dx6} hi={after(6, "cono") && !after(6, "aire") ? "cono" : ""} />
          <AirDots x0={560} x1={1000} y0={540} y1={880} t={t} o={dimTo(6, "aire")} amp={R(6, "aire", 0.5)} />
        </SVG>
        {chip(6, "3 · EL CONO", K.cold)}
        <Label x={720} y={450} text="EMPUJA EL AIRE" size={42} color={K.cold} box o={L(6, "aire", Wd(6, "sonido") - 0.05)} />
        <Label x={720} y={450} text="= SONIDO" size={52} color={K.flow} box o={L(6, "sonido")} />
        <Label x={720} y={1000} text="ONDAS DE PRESIÓN" size={40} color={K.white} box o={L(6, "ondas")} />
      </Scene>

      {/* 7 · más corriente, más volumen; rápido = agudos, lento = graves */}
      <Scene {...sc(7)}>
        <SVG>
          <Speaker x={300} y={720} s={0.72} dx={dx7} cur={0.3 + 0.7 * amp7} />
          <path d={sine(520, 1000, 720, 40 + 120 * amp7, -t * w7, k7)} fill="none" stroke={K.cold} strokeWidth={10} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${K.cold})` }} />
        </SVG>
        {chip(7, "3 · VOLUMEN Y TONO", K.cold)}
        <Label x={720} y={460} text="MÁS VOLUMEN" size={46} color={K.flow} box o={L(7, "volumen", Wd(7, "rapido") - 0.05)} />
        <Label x={720} y={460} text="RÁPIDO = AGUDOS" size={46} color={K.cold} box o={L(7, "rapido", Wd(7, "lento") - 0.05)} />
        <Label x={720} y={460} text="LENTO = GRAVES" size={46} color={K.hot} box o={L(7, "lento")} />
      </Scene>

      {/* 8 · por eso hay grandes para graves (woofers) y pequeños para agudos (tweeters) */}
      <Scene {...sc(8)}>
        <SVG>
          <FrontDriver x={340} y={740} r={220} pulse={Math.sin(t * 5)} o={dimTo(8, "grandes")} hi={after(8, "woofers") && !after(8, "pequenos")} />
          <FrontDriver x={790} y={530} r={95} pulse={Math.sin(t * 34)} o={dimTo(8, "pequenos")} hi={after(8, "tweeters")} />
        </SVG>
        {chip(8, "GRAVES Y AGUDOS")}
        <Label x={340} y={1040} text="WOOFER · GRAVES" size={40} color={K.hot} box o={L(8, "woofers")} />
        <Label x={770} y={700} text="TWEETER · AGUDOS" size={38} color={K.cold} box o={L(8, "pequenos")} />
      </Scene>

      {/* 9 · cuarto: borde blando + araña lo devuelven al centro */}
      <Scene {...sc(9)}>
        <SVG>
          <Speaker x={570} y={720} s={1.1} dx={dx9} hi={hi9} dimOthers={hi9 !== "todo"} />
        </SVG>
        {chip(9, "4 · LA SUSPENSIÓN")}
        <Callout text="BORDE BLANDO" anchor={P(570, 720, 1.1, 214, 342)} offset={[-150, 12]} color={K.flow} t={t} t0={Wd(9, "borde")} t1={E(9)} size={40} />
        <Callout text="ARAÑA" anchor={P(570, 720, 1.1, -112, -100)} offset={[-130, -200]} color={K.flow} t={t} t0={Wd(9, "arana")} t1={E(9)} size={40} />
        <Label x={705} y={720} text="AL CENTRO" size={40} color={K.white} box o={L(9, "devuelven")} />
      </Scene>

      {/* 10 · curiosidad: lo presentaron en 1925 y casi todos los de hoy siguen su idea */}
      <Scene {...sc(10)}>
        <SVG>
          <g opacity={0.55 + 0.45 * dimTo(10, "1925")}>
            <rect x={110} y={500} width={420} height={500} rx={24} fill="#3A3226" stroke="#8A7A5A" strokeWidth={6} />
            <Speaker x={320} y={750} s={0.6} dx={6 * Math.sin(t * 7)} />
          </g>
          <g opacity={dimTo(10, "hoy")}>
            <rect x={590} y={500} width={380} height={500} rx={24} fill={C.case1} stroke={C.case3} strokeWidth={6} />
            <FrontDriver x={780} y={820} r={140} pulse={Math.sin(t * 7)} />
            <FrontDriver x={780} y={590} r={55} pulse={Math.sin(t * 30)} />
          </g>
        </SVG>
        {chip(10, "CURIOSIDAD")}
        <Stamp x={320} y={440} text="1925" color={K.flow} size={64} p={R(10, "1925", 0.35)} />
        <Label x={320} y={1070} text="2 INGENIEROS" size={40} color={K.white} box o={L(10, "ingenieros")} />
        <Label x={780} y={1070} text="HOY" size={44} color={K.flow} box o={L(10, "hoy")} />
      </Scene>

      {/* 11 · otra: al revés es un micrófono */}
      <Scene {...sc(11)}>
        <SVG>
          <Speaker x={380} y={740} s={0.72} dx={dx11} cur={voice11 * Math.sin(t * 10)} />
          {/* persona (silueta neutra) que habla hacia el altavoz */}
          <g opacity={dimTo(11, "hablale")}>
            <circle cx={880} cy={680} r={70} fill={C.case2} />
            <path d="M790,900 Q800,770 880,770 Q960,770 970,900 Z" fill={C.case2} />
          </g>
          <g transform="translate(1600,0) scale(-1,1)">
            <AirWaves x0={790} x1={1020} y={690} h={260} t={t} o={R(11, "hablale")} gap={70} speed={160} />
          </g>
          <Wire x0={120} x1={180} y={740} ph={0} dots={false} />
          <path d="M120,740 L120,1010 L560,1010" fill="none" stroke={C.case1} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
          {Array.from({ length: 9 }).map((_, i) => {
            const p = ((i / 9 + t * 0.5) % 1); const len = 270 + 440;
            const d = p * len; const xx = d < 270 ? 120 : 120 + (d - 270); const yy = d < 270 ? 740 + d : 1010;
            return <circle key={i} cx={xx} cy={yy} r={10} fill={K.flow} opacity={R(11, "corriente")} style={{ filter: `drop-shadow(0 0 8px ${K.flow})` }} />;
          })}
        </SVG>
        {chip(11, "OTRA: AL REVÉS")}
        <Label x={800} y={420} text="TU VOZ" size={44} color={K.cold} box o={L(11, "voz", Wd(11, "microfono") - 0.05)} />
        <Label x={360} y={1090} text="CORRIENTE" size={40} color={K.flow} box o={L(11, "corriente")} />
        <Label x={620} y={420} text="¡ES UN MICRÓFONO!" size={46} color={K.flow} box o={L(11, "microfono")} />
      </Scene>

      {/* 12 · otra: el oído oye de ~20 a 20.000 vibraciones por segundo */}
      <Scene {...sc(12)}>
        <SVG>
          <Ear x={190} y={600} s={0.95} />
          <path d={sine(330, 980, 600, 70, -t * 6, k12)} fill="none" stroke={K.cold} strokeWidth={8} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${K.cold})` }} />
          <rect x={100} y={960} width={830} height={44} rx={22} fill="rgba(255,255,255,0.12)" />
          <rect x={200} y={960} width={630} height={44} rx={22} fill={K.cold} opacity={R(12, "veinte", 0.6)} style={{ filter: `drop-shadow(0 0 10px ${K.cold})` }} />
          <circle cx={200 + 630 * Math.min(1, Math.max(0, (Math.log(12 + 25000 * sweep * sweep) - Math.log(20)) / (Math.log(20000) - Math.log(20))))} cy={982} r={22} fill={K.flow} stroke={C.ink} strokeWidth={4} />
          <rect x={100} y={960} width={100} height={44} rx={22} fill={C.case3} opacity={0.6 * R(12, "resto")} />
          <rect x={830} y={960} width={100} height={44} rx={22} fill={C.case3} opacity={0.6 * R(12, "resto")} />
        </SVG>
        {chip(12, "OTRA: TU OÍDO", K.cold)}
        <Label x={200} y={1070} text="20 Hz" size={40} color={K.white} box o={L(12, "veinte")} />
        <Label x={780} y={1070} text="20.000 Hz" size={40} color={K.white} box o={L(12, "mil")} />
        <Label x={540} y={790} text="FUERA: NO LO OYES" size={40} color={C.case3} box o={L(12, "resto")} />
      </Scene>

      {/* 13 · resumen: corriente, imán, papel → música */}
      <Scene {...sc(13)}>
        <SVG>
          <Wire x0={80} x1={330} y={700} ph={Math.sin(t * 6)} o={dimTo(13, "corriente")} />
          <Speaker x={600} y={700} s={0.9} dx={14 * Math.sin(t * 9) * R(13, "papel")} cur={Math.sin(t * 6)} hi={hi13} />
          {[0, 1, 2].map((k) => {
            const p = (t * 0.6 + k / 3) % 1;
            return <Note key={k} x={830 + 110 * p} y={560 - 200 * p + k * 120} s={0.8} o={R(13, "musica") * Math.sin(Math.PI * p)} />;
          })}
        </SVG>
        {chip(13, "RESUMEN")}
        <Label x={200} y={1080} text="CORRIENTE" size={40} color={K.flow} box o={L(13, "corriente")} />
        <Label x={500} y={1080} text="IMÁN" size={40} color={K.flow} box o={L(13, "iman")} />
        <Label x={760} y={1080} text="PAPEL" size={40} color={K.flow} box o={L(13, "papel")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
