// Episodio 136 · Cómo funciona un patinete eléctrico: el motor va dentro de la rueda.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Scooter, HubMotor, MotorCore, CellPack, Controller, Wire, Battery, Speedo, Thermo, Snow, Flake, Tyre, HouseFrame, Plug, Cross, Chain, Belt, SpinArrow, C } from "./Patinete";

export const COMP_ID = "Patinete";
export const HOOK = "El motor, en la rueda"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

/** Atenuado al principio (0,3) y pleno desde w. */
const dim = (t: number, w: number) => 0.3 + 0.7 * ramp(t, w, w + 0.3);
const fin = (t: number, w: number, d = 0.3) => ramp(t, w, w + d);

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(scene(i)[0], i === 1 ? 1.8 : 0), scene(i)[1])} />;
  const A = (i: number) => scene(i)[0];
  const spin = t * 90; // giro de las ruedas (grados)
  const phase = Math.floor(t * 4) % 3; // fase activa del motor (bobinas que se encienden por turnos)

  // ---------- beat 1 ----------
  const b1motor = Wd(1, "motor");
  const b1open = ramp(t, b1motor - 0.1, b1motor + 0.5);
  const b1lens = ramp(t, b1motor + 0.1, b1motor + 0.5);
  // ---------- beat 2 ----------
  const b2cad = Wd(2, "cadenas"), b2cor = Wd(2, "correas"), b2motor = Wd(2, "motor"), b2im = Wd(2, "imanes");
  // ---------- beat 3 ----------
  const b3bat = Wd(3, "bateria"), b3cer = Wd(3, "cerebro"), b3pul = Wd(3, "pulsos"), b3gira = Wd(3, "gira");
  // ---------- beat 4 ----------
  const b4pies = Wd(4, "pies"), b4pilas = Wd(4, "pilas"), b4serie = Wd(4, "serie"), b4par = Wd(4, "paralelo");
  // ---------- beat 5 ----------
  const b5ace = Wd(5, "aprietas"), b5ctrl = Wd(5, "controlador"), b5mas = Wd(5, "mas");
  const b5press = t < b5mas ? ramp(t, b5ace, b5ace + 0.4) : 0.55 + 0.45 * Math.sin((t - b5mas) * 3.2);
  // ---------- beat 6 ----------
  const b6seg = Wd(6, "seguida"), b6pul = Wd(6, "pulsos"), b6bob = Wd(6, "bobinas"), b6una = Wd(6, "una");
  // ---------- beat 7 ----------
  const b7fab = Wd(7, "fabrica"), b7vein = Wd(7, "veinticinco"), b7dgt = Wd(7, "dgt");
  const b7v = t < b7vein ? 25 * ramp(t, A(7) + 0.2, b7vein) : 25 + 1.2 * Math.abs(Math.sin((t - b7vein) * 5)) * Math.exp(-(t - b7vein) * 0.6);
  // ---------- beat 8 ----------
  const b8bob = Wd(8, "bobinas"), b8eje = Wd(8, "eje"), b8im = Wd(8, "imanes"), b8gir = Wd(8, "giran");
  // ---------- beat 9 ----------
  const b9fre = Wd(9, "frenar"), b9din = Wd(9, "dinamo"), b9rec = Wd(9, "recarga");
  const tau9 = Math.max(0, t - b9fre);
  const b9rot = t < b9fre ? spin : b9fre * 90 + 90 * Math.min(tau9, 1.6) - 28 * Math.min(tau9, 1.6) ** 2;
  // ---------- beat 10 ----------
  const b10frio = Wd(10, "frio"), b10dura = Wd(10, "dura"), b10quim = Wd(10, "quimica"), b10cal = Wd(10, "calentarse"), b10rec = Wd(10, "recupera");
  const b10cold = ramp(t, b10frio, b10frio + 0.5) * (1 - ramp(t, b10cal, b10cal + 0.8));
  // ---------- beat 11 ----------
  const b11hel = Wd(11, "helado"), b11casa = Wd(11, "casa"), b11carg = Wd(11, "cargarlo"), b11cero = Wd(11, "cero");
  const b11warm = ramp(t, b11casa, b11carg);
  // ---------- beat 12 ----------
  const b12aire = Wd(12, "aire"), b12pres = Wd(12, "presion"), b12baj = Wd(12, "bajas"), b12gas = Wd(12, "gastan");
  // ---------- beat 13 ----------
  const b13pil = Wd(13, "pilas"), b13cer = Wd(13, "cerebro"), b13rue = Wd(13, "rueda");

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el patinete grande; al decir «motor» la tapa del buje trasero salta y una lupa enseña el motor */}
      <Scene {...sc(1)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Scooter cx={540} cy={860} s={1.05} t={t} spin={spin} hubOpen={b1open} motorHi={b1lens} lit={t > b1motor ? phase : -1} />
          {b1lens > 0.01 && (
            <g opacity={b1lens}>
              <path d="M 248 885 L 330 720" stroke={K.flow} strokeWidth={6} strokeDasharray="14 10" />
              <circle cx={330} cy={560} r={168} fill={C.dark} stroke={K.flow} strokeWidth={8} style={{ filter: `drop-shadow(0 0 16px ${K.flow})` }} />
              <g transform={`translate(330 560) scale(${0.6 + 0.4 * b1lens})`}><MotorCore R={150} rot={spin} lit={phase} magHi={1} /></g>
            </g>
          )}
        </svg>
        {chip(1, "POR DENTRO")}
        <Label x={540} y={1110} text="el motor, ¡dentro de la rueda!" size={46} color={K.flow} box o={fin(t, b1motor + 0.3)} />
      </Scene>

      {/* 2 · la rueda ES el motor: sin cadenas ni correas */}
      <Scene {...sc(2)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <HubMotor cx={540} cy={740} R={290} rot={spin} lit={phase} magHi={ramp(t, b2im, b2im + 0.3)} />
          <SpinArrow x={540} y={740} r={330} a0={-150} a1={-100} o={dim(t, b2motor)} />
          <SpinArrow x={540} y={740} r={330} a0={30} a1={80} o={dim(t, b2motor)} />
          <Chain x={220} y={1095} w={250} o={dim(t, b2cad)} />
          <Cross x={210} y={1095} s={0.9} o={fin(t, b2cad + 0.2)} />
          <Belt x={860} y={1095} o={dim(t, b2cor)} />
          <Cross x={860} y={1095} s={0.9} o={fin(t, b2cor + 0.2)} />
        </svg>
        {chip(2, "LA RUEDA ES EL MOTOR")}
        <Label x={840} y={440} text="imanes" size={44} color={K.flow} box o={fin(t, b2im)} />
        <Label x={540} y={1100} text="motor de buje" size={40} color={K.white} box o={dim(t, b2motor)} />
      </Scene>

      {/* 3 · idea clave: batería → cerebro → pulsos → rueda */}
      <Scene {...sc(3)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Wire d="M 410 520 H 540 V 700" t={t} on={fin(t, b3bat + 0.2)} />
          <Wire d="M 540 860 V 960 H 640" t={t} on={fin(t, b3pul)} pulsed speed={220} />
          <Battery x={260} y={520} w={290} h={130} level={0.8} hi={fin(t, b3bat)} o={dim(t, b3bat)} />
          <Controller x={540} y={780} w={230} h={150} t={t} hi={fin(t, b3cer)} o={dim(t, b3cer)} />
          <HubMotor cx={790} cy={960} R={150} rot={t > b3gira ? spin * 1.4 : 0} lit={t > b3pul ? phase : -1} o={dim(t, b3gira)} />
        </svg>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={260} y={645} text="batería" size={40} color={K.flow} o={dim(t, b3bat)} />
        <Label x={270} y={780} text="cerebro" size={40} color={K.flow} box o={fin(t, b3cer)} />
        <Label x={410} y={1040} text="a pulsos" size={40} color={K.flow} o={fin(t, b3pul)} />
        <Label x={790} y={760} text="la rueda gira" size={40} color={K.white} box o={fin(t, b3gira)} />
      </Scene>

      {/* 4 · primero: las pilas en la plataforma */}
      <Scene {...sc(4)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Scooter cx={540} cy={530} s={0.4} t={t} spin={spin} deckOpen={fin(t, b4pies, 0.5)} batHi={fin(t, b4pies)} />
          <path d="M 540 600 V 660" stroke={K.flow} strokeWidth={8} strokeDasharray="12 10" opacity={dim(t, b4pies)} />
          <CellPack x={540} y={830} cols={10} rows={3} r={34} gap={10} t={t} lit={0.15 + 0.85 * ramp(t, b4pilas - 0.2, b4pilas + 0.8)}
            serie={ramp(t, b4serie, b4serie + 0.6)} paralelo={ramp(t, b4par, b4par + 0.5)} />
        </svg>
        {chip(4, "PRIMERO · LA BATERÍA")}
        <Label x={540} y={640} text="decenas de pilas de litio" size={38} color={K.white} box o={fin(t, b4pilas)} />
        <Label x={540} y={1035} text="en serie: más voltaje" size={40} color={K.flow} o={fin(t, b4serie)} />
        <Label x={540} y={1105} text="en paralelo: más autonomía" size={40} color={K.cold} o={fin(t, b4par)} />
      </Scene>

      {/* 5 · segundo: acelerador → controlador → más o menos corriente */}
      <Scene {...sc(5)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {/* manillar en primer plano */}
          <path d="M 140 560 H 760" stroke={C.case3} strokeWidth={34} strokeLinecap="round" />
          <rect x={560} y={530} width={230} height={62} rx={28} fill={C.grip} />
          <path d="M 520 560 V 700" stroke={C.case3} strokeWidth={46} strokeLinecap="round" />
          <g transform={`rotate(${28 * b5press} 545 560)`}>
            <rect x={505} y={560} width={40} height={110} rx={16} fill={b5press > 0.05 ? K.flow : C.case2} style={{ filter: `drop-shadow(0 0 ${14 * b5press}px ${K.flow})` }} />
          </g>
          <Wire d="M 540 690 V 800" t={t} on={fin(t, b5ace + 0.2)} color={K.cold} w={8} pulsed speed={120} />
          <Battery x={200} y={880} w={190} h={96} level={0.8} o={dim(t, b5ctrl)} />
          <Wire d="M 300 880 H 420" t={t} on={fin(t, b5ctrl)} w={10} />
          <Controller x={540} y={880} w={220} h={150} t={t} hi={fin(t, b5ctrl)} o={dim(t, b5ctrl)} />
          <Wire d="M 650 880 H 740" t={t} on={fin(t, b5ctrl + 0.2)} w={6 + 18 * b5press} speed={100 + 200 * b5press} />
          <HubMotor cx={840} cy={880} R={100} rot={spin * (0.5 + b5press)} lit={t > b5ctrl ? phase : -1} />
        </svg>
        {chip(5, "SEGUNDO · EL ACELERADOR")}
        <Label x={300} y={460} text="acelerador" size={44} color={K.flow} box o={dim(t, b5ace)} />
        <Label x={540} y={1015} text="controlador" size={40} color={K.white} o={dim(t, b5ctrl)} />
        <Label x={540} y={1100} text="más o menos corriente" size={42} color={K.flow} box o={fin(t, b5mas)} />
      </Scene>

      {/* 6 · la reparte a pulsos entre las bobinas */}
      <Scene {...sc(6)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Controller x={540} y={470} w={260} h={130} t={t} hi={1} />
          {[-60, 0, 60].map((dx, i) => (
            <Wire key={i} d={`M ${540 + dx} 535 V ${620 + Math.abs(dx) * 0.2} L ${540 + dx * 0.3} 700`} t={t + i * 0.2} on={fin(t, b6pul) * (phase === i ? 1 : 0.25)} pulsed w={9} speed={200} color={K.flow} />
          ))}
          <HubMotor cx={540} cy={880} R={240} rot={spin} tyre={false} lit={t > b6bob ? phase : -1} coilHi={fin(t, b6bob)} />
        </svg>
        {chip(6, "SEGUNDO · A PULSOS")}
        <Label x={210} y={470} text="no seguida…" size={40} color={K.white} o={span(t, b6seg, b6pul + 0.1)} />
        <Label x={210} y={470} text="¡a pulsos!" size={44} color={K.flow} box o={fin(t, b6pul + 0.15)} />
        <Label x={540} y={1110} text="bobinas: una detrás de otra" size={40} color={K.flow} box o={fin(t, b6una)} />
      </Scene>

      {/* 7 · limitado de fábrica a 25 km/h */}
      <Scene {...sc(7)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Speedo x={540} y={760} r={290} v={b7v} lockHi={fin(t, b7vein)} />
        </svg>
        {chip(7, "SEGUNDO · EL LÍMITE")}
        <Label x={540} y={430} text="límite de fábrica" size={42} color={K.white} box o={dim(t, b7fab)} />
        <Stamp x={540} y={1105} text="25 km/h · máx. DGT" color={K.warn} size={52} p={fin(t, b7dgt)} rot={-4} />
      </Scene>

      {/* 8 · tercero: bobinas quietas, imanes que giran con la rueda */}
      <Scene {...sc(8)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <HubMotor cx={540} cy={750} R={290} rot={t > b8gir ? spin * 1.2 : spin * 0.4} lit={phase} coilHi={fin(t, b8bob)} axleHi={fin(t, b8eje)} magHi={fin(t, b8im)} />
          <SpinArrow x={540} y={750} r={318} a0={-160} a1={-110} o={fin(t, b8gir)} />
          <SpinArrow x={540} y={750} r={318} a0={20} a1={70} o={fin(t, b8gir)} />
        </svg>
        {chip(8, "TERCERO · EL MOTOR")}
        <Label x={540} y={420} text="imanes: giran con la rueda" size={40} color={K.flow} box o={fin(t, b8im)} />
        <Label x={540} y={1100} text="bobinas: quietas, en el eje" size={40} color={K.cold} box o={dim(t, b8bob)} />
      </Scene>

      {/* 9 · cuarto: al frenar, el motor hace de dinamo */}
      <Scene {...sc(9)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <HubMotor cx={320} cy={800} R={210} rot={b9rot} lit={t > b9din ? phase : -1} litCol={K.cold} />
          <Wire d="M 530 800 H 640 V 640 H 660" t={t} on={fin(t, b9din)} color={K.cold} rev={false} w={12} />
          <Battery x={810} y={640} w={240} h={120} level={0.55 + 0.08 * ramp(t, b9rec, b9rec + 1.2)} hi={fin(t, b9rec)} />
          <path d="M 810 490 v -50 M 785 465 h 50" stroke={K.cold} strokeWidth={10} strokeLinecap="round" opacity={fin(t, b9rec)} />
        </svg>
        {chip(9, "CUARTO · EL FRENO")}
        <Label x={320} y={480} text="frenas" size={44} color={K.warn} box o={dim(t, b9fre)} />
        <Label x={320} y={1080} text="el motor hace de dinamo" size={40} color={K.cold} box o={fin(t, b9din)} />
        <Label x={820} y={790} text="recarga un poco" size={38} color={K.cold} o={fin(t, b9rec)} />
      </Scene>

      {/* 10 · curiosidad: con frío dura menos y se recupera al calentarse */}
      <Scene {...sc(10)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Snow t={t} o={b10cold * 0.9} />
          <Thermo x={180} y={640} h={300} level={0.6 - 0.45 * b10cold} color={b10cold > 0.5 ? K.cold : K.hot} />
          <Battery x={620} y={700} w={500} h={220} level={0.8 - 0.35 * b10cold} color={b10cold > 0.5 ? K.cold : K.flow} />
          {/* iones que se mueven (lentos con frío) */}
          {Array.from({ length: 6 }).map((_, i) => {
            const sp = 1 - 0.8 * b10cold;
            const ph = (((t * 0.9 * sp + i / 6) % 1) + 1) % 1;
            return <circle key={i} cx={400 + ph * 440} cy={640 + (i % 3) * 60} r={12} fill={K.white} opacity={0.8} />;
          })}
        </svg>
        {chip(10, "CURIOSIDAD · EL FRÍO", K.cold)}
        <Label x={540} y={950} text="con frío, menos autonomía" size={40} color={K.cold} box o={fin(t, b10dura)} />
        <Label x={540} y={1025} text="química más lenta" size={38} color={K.white} o={fin(t, b10quim)} />
        <Label x={540} y={1100} text="al calentarse, se recupera" size={40} color={K.hot} box o={fin(t, b10rec)} />
      </Scene>

      {/* 11 · truco: si llega helado, que se temple antes de cargarlo */}
      <Scene {...sc(11)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <HouseFrame x={110} y={600} w={860} h={430} o={dim(t, b11casa)} warm={b11warm} />
          <Scooter cx={400} cy={900} s={0.55} t={t} spin={0} frost={(1 - b11warm) * fin(t, b11hel)} />
          <Thermo x={820} y={760} h={190} level={0.15 + 0.45 * b11warm} color={b11warm > 0.5 ? K.hot : K.cold} />
          <Plug x={705} y={900} s={0.7} on={fin(t, b11carg) * (t < b11cero ? 1 : 0.4)} o={dim(t, b11carg)} />
          <Cross x={705} y={900} s={1.1} o={fin(t, b11cero)} />
          <Flake x={760} y={660} r={26} o={fin(t, b11cero)} />
        </svg>
        {chip(11, "TRUCO · SI LLEGA HELADO", K.cold)}
        <Label x={300} y={1080} text="primero, que se temple" size={38} color={K.hot} o={fin(t, b11casa)} />
        <Label x={540} y={430} text="cargar bajo cero la daña" size={42} color={K.warn} box o={fin(t, b11cero)} />
      </Scene>

      {/* 12 · truco: la presión de las ruedas */}
      <Scene {...sc(12)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Tyre x={290} y={800} r={160} t={t} spin={spin} psi={0.8} col={K.cold} o={dim(t, b12pres)} />
          <Tyre x={730} y={800} r={160} t={t} spin={spin * 0.6} psi={0.25} col={K.warn} squash={ramp(t, b12baj, b12baj + 0.5)} o={dim(t, b12baj)} />
          {/* aire: soplido junto a la válvula */}
          {[0, 1, 2].map((i) => { const p = ((t * 1.2 + i / 3) % 1); return <circle key={i} cx={450 + 50 * p} cy={560 - 40 * p} r={8 + 10 * p} fill="none" stroke={K.cold} strokeWidth={4} opacity={(1 - p) * fin(t, b12aire)} />; })}
        </svg>
        {chip(12, "TRUCO · LA PRESIÓN", K.cold)}
        <Label x={290} y={1010} text="bien inflada" size={38} color={K.cold} o={dim(t, b12pres)} />
        <Label x={730} y={1010} text="baja" size={42} color={K.warn} o={fin(t, b12baj)} />
        <Label x={540} y={1100} text="más rozamiento = más batería" size={40} color={K.flow} box o={fin(t, b12gas)} />
      </Scene>

      {/* 13 · resumen */}
      <Scene {...sc(13)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Scooter cx={540} cy={820} s={0.95} t={t} spin={spin} deckOpen={1} hubOpen={1} batHi={fin(t, b13pil)} ctrlHi={fin(t, b13cer)} motorHi={fin(t, b13rue)} lit={t > b13rue ? phase : -1} />
        </svg>
        {chip(13, "RESUMEN")}
        <Label x={360} y={680} text="pilas" size={44} color={K.flow} box o={dim(t, b13pil)} />
        <Label x={720} y={1000} text="cerebro" size={44} color={K.flow} box o={dim(t, b13cer)} />
        <Label x={250} y={1080} text="rueda = motor" size={44} color={K.flow} box o={dim(t, b13rue)} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
