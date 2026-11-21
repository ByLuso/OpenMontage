// Episodio 154 · Cómo te pilla un radar de velocidad (fijo y de tramo).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { RadarBox, Car, CarTop, Arcs, WaveStrip, BeatStrip, RoadSide, SpeedLines, Arrow, LidarGun, GantryTop, RoadTop, Panel, Photo, Flash, OldRadar, Tunnel, CamIcon, Stopwatch, C } from "./RadarVelocidad";

export const COMP_ID = "RadarVelocidad";
export const HOOK = "Te mide un eco"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

/** Atenuado al principio (0,3) y pleno desde w. */
const dim = (t: number, w: number) => 0.3 + 0.7 * ramp(t, w, w + 0.3);
const fin = (t: number, w: number, d = 0.3) => ramp(t, w, w + d);
const lerpPts = (t: number, pts: [number, number][]) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [a, va] = pts[i - 1], [b, vb] = pts[i]; return va + ((vb - va) * (t - a)) / Math.max(0.001, b - a); }
  return pts[pts.length - 1][1];
};

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(scene(i)[0], i === 1 ? 1.8 : 0), scene(i)[1])} />;
  const A = (i: number) => scene(i)[0];
  const since = (w: number) => Math.max(0, t - w);

  // ---------- beat 1 ----------
  const b1cam = Wd(1, "cámara"), b1equ = Wd(1, "equivocados"), b1eco = Wd(1, "eco");
  const b1open = 0.8 * ramp(t, b1equ, b1equ + 0.6);
  // ---------- beat 2 ----------
  const b2lan = Wd(2, "lanza"), b2mic = Wd(2, "microondas"), b2reb = Wd(2, "rebotan"), b2eco = Wd(2, "eco");
  const b2x = 880 - 22 * since(A(2));
  // ---------- beat 3 ----------
  const b3ace = Wd(3, "acercas"), b3apr = Wd(3, "apretado"), b3rap = Wd(3, "rápido"), b3aprieta = Wd(3, "aprieta");
  const b3v = 0.45 * ramp(t, b3ace - 0.2, b3ace + 0.4) + 0.55 * ramp(t, b3rap, b3aprieta + 0.4);
  // ---------- beat 4 ----------
  const b4com = Wd(4, "compara"), b4vue = Wd(4, "vuelve"), b4dif = Wd(4, "diferencia"), b4vel = Wd(4, "velocidad");
  const b4kmh = Math.round(90 * ramp(t, b4dif, b4vel + 0.3));
  // ---------- beat 5 ----------
  const b5las = Wd(5, "láser"), b5cie = Wd(5, "cientos"), b5pul = Wd(5, "pulsos"), b5dis = Wd(5, "distancia");
  const b5x = 900 - 34 * since(A(5));
  const b5front = b5x - 185;
  // ---------- beat 6 ----------
  const b6lim = Wd(6, "límite"), b6dis = Wd(6, "dispara"), b6mat = Wd(6, "matrícula"), b6pru = Wd(6, "prueba");
  const b6x = Math.max(380, 1060 - 190 * since(A(6)));
  const b6flash = ramp(t, b6dis, b6dis + 0.08) * (1 - ramp(t, b6dis + 0.15, b6dis + 0.6));
  // ---------- beat 7 ----------
  const b7tra = Wd(7, "tramo"), b7eco = Wd(7, "eco"), b7lee = Wd(7, "lee"), b7ent = Wd(7, "entrar"), b7sal = Wd(7, "salir");
  const b7y = lerpPts(t, [[A(7), 1130], [b7ent, 1030], [b7sal, 520], [b7sal + 1.2, 380]]);
  const b7moving = t > A(7) && t < b7sal + 1.2 ? 1 : 0;
  // ---------- beat 8 ----------
  const b8div = Wd(8, "divide"), b8dist = Wd(8, "distancia"), b8tie = Wd(8, "tiempo"), b8med = Wd(8, "media"), b8inf = Wd(8, "infrarroja");
  const b8night = ramp(t, b8inf - 0.1, b8inf + 0.5);
  // ---------- beat 9 ----------
  const b9pol = Wd(9, "policía"), b9con = Wd(9, "connecticut"), b9rad = Wd(9, "radares"), b9an = Wd(9, "1947");
  const b9x = Math.max(720, 900 - 60 * since(A(9)));
  // ---------- beat 10 ----------
  const b10pri = Wd(10, "primer"), b10tra = Wd(10, "tramo"), b10an = Wd(10, "2010"), b10gua = Wd(10, "guadarrama");
  // ---------- beat 11 ----------
  const b11eco = Wd(11, "eco"), b11fot = Wd(11, "foto"), b11tra = Wd(11, "tramo");

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: la caja del radar grande; parece que mide la cámara, pero al decir «equivocados» la tapa se abre y aparece la antena que lanza ondas */}
      <Scene {...sc(1)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <RadarBox x={540} y={460} s={1.25} t={t} open={b1open} pole={132} lensHi={span(t, b1cam, b1equ + 0.2)} antHi={fin(t, b1equ + 0.3)} />
          <Arcs x={540} y={560} dir={-90} t={t} spread={110} len={130} n={3} color={K.cold} o={fin(t, b1eco - 0.4)} />
        </svg>
        {chip(1, "POR DENTRO")}
        <Label x={540} y={1080} text="¿te mide la cámara?" size={48} color={K.white} box o={span(t, b1cam, b1eco - 0.5)} />
        <Stamp x={515} y={860} text="¡FALSO!" p={span(t, b1equ, b1eco + 0.2, 0.25)} />
        <Label x={540} y={1080} text="¡te mide un eco!" size={52} color={K.cold} box o={fin(t, b1eco - 0.3)} />
      </Scene>

      {/* 2 · microondas que salen del radar, rebotan en el coche y vuelven como eco */}
      <Scene {...sc(2)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <RoadSide y={1100} t={t} v={22} />
          <RadarBox x={190} y={540} s={0.5} t={t} open={0.8} pole={700} antHi={fin(t, b2lan)} />
          <Arcs x={250} y={600} dir={38} t={t} spread={34} len={520} n={5} color={K.cold} o={dim(t, b2mic)} />
          <Car x={b2x} y={1100} s={1} spin={-t * 2} />
          <Arcs x={b2x - 190} y={980} dir={226} t={t + 0.2} spread={30} len={460} n={4} color={K.flow} o={fin(t, b2reb)} />
        </svg>
        {chip(2, "EL ECO INVISIBLE")}
        <Label x={640} y={500} text="microondas invisibles" size={42} color={K.cold} box o={dim(t, b2mic)} />
        <Label x={290} y={1040} text="rebotan y vuelven" size={40} color={K.flow} box o={span(t, b2reb, b2eco)} />
        <Label x={290} y={1040} text="¡el eco!" size={44} color={K.flow} box o={fin(t, b2eco + 0.3)} />
      </Scene>

      {/* 3 · idea clave: si te acercas, el eco vuelve más apretado; cuanto más rápido, más */}
      <Scene {...sc(3)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <WaveStrip x0={100} x1={980} y={520} lam={120} t={t} color={K.cold} />
          <WaveStrip x0={100} x1={980} y={700} lam={120 - 62 * b3v} t={t} speed={-160} color={K.flow} o={dim(t, b3ace)} />
          <RoadSide y={1100} t={t} v={60 + 700 * b3v} />
          <Car x={640} y={1100} s={0.95} spin={-t * (2 + 14 * b3v)} />
          <SpeedLines x={790} y={1080} t={t} o={ramp(t, b3ace, b3ace + 0.4) * (0.4 + 0.6 * b3v)} />
        </svg>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={540} y={440} text="la onda que sale" size={40} color={K.cold} o={1} />
        <Label x={540} y={790} text="el eco: más apretado" size={42} color={K.flow} box o={fin(t, b3apr)} />
        <Label x={540} y={870} text="más rápido = más apretado" size={40} color={K.white} box o={fin(t, b3rap)} />
      </Scene>

      {/* 4 · primero: compara la onda que sale con la que vuelve; la diferencia (Doppler) da la velocidad */}
      <Scene {...sc(4)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={90} y={460} width={900} height={290} rx={20} fill={C.dark} stroke={C.case3} strokeWidth={5} />
          <WaveStrip x0={120} x1={960} y={550} lam={100} t={t} color={K.cold} />
          <WaveStrip x0={120} x1={960} y={665} lam={86} t={t} color={K.flow} o={dim(t, b4vue)} />
          <BeatStrip x0={120} x1={960} y={890} t={t} o={dim(t, b4dif)} />
          <Panel x={540} y={1060} w={380} h={120} o={dim(t, b4dif)} border={b4dif <= t ? K.flow : C.case3}
            lines={[{ text: `${b4kmh} km/h`, color: K.flow, size: 64 }]} />
        </svg>
        {chip(4, "PRIMERO · EL EFECTO DOPPLER", K.cold)}
        <Label x={290} y={415} text="la que sale" size={38} color={K.cold} o={dim(t, b4com)} />
        <Label x={790} y={415} text="la que vuelve" size={38} color={K.flow} o={dim(t, b4vue)} />
        <Label x={540} y={800} text="la diferencia = efecto Doppler" size={40} color={K.white} box o={fin(t, b4dif)} />
      </Scene>

      {/* 5 · segundo: láser; pulsos de luz que van y vuelven; la distancia se acorta */}
      <Scene {...sc(5)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <RoadSide y={1000} t={t} v={34} />
          <LidarGun x={190} y={860} s={1.1} hi={fin(t, b5las)} />
          {Array.from({ length: 8 }).map((_, k) => {
            const p = ((t * 1.3 + k / 8) % 1 + 1) % 1, L = b5front - 310;
            const x = p < 0.5 ? 310 + L * 2 * p : b5front - L * (2 * p - 1);
            return <circle key={k} cx={x} cy={855} r={p < 0.5 ? 11 : 8} fill={p < 0.5 ? K.hot : K.flow} opacity={fin(t, b5pul - 0.3) * (p < 0.5 ? 1 : 0.7)} />;
          })}
          <Car x={b5x} y={1000} s={0.95} spin={-t * 3} />
          <g opacity={dim(t, b5dis)}>
            <path d={`M 310 1060 H ${b5front}`} stroke={K.white} strokeWidth={5} />
            <path d={`M 310 1040 V 1080 M ${b5front} 1040 V 1080`} stroke={K.white} strokeWidth={5} />
            <text x={(310 + b5front) / 2} y={1120} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={40} fill={K.white}>{`${Math.round((b5front - 310) / 4)} m`}</text>
          </g>
        </svg>
        {chip(5, "SEGUNDO · EL LÁSER", K.hot)}
        <Label x={540} y={500} text="cientos de pulsos de luz" size={42} color={K.hot} box o={dim(t, b5cie)} />
        <Label x={540} y={620} text="miden cuánto tardan en volver" size={38} color={K.flow} o={fin(t, b5pul + 0.4)} />
        <Label x={540} y={720} text="la distancia se acorta" size={40} color={K.white} box o={fin(t, b5dis)} />
      </Scene>

      {/* 6 · tercero: si pasas del límite, la cámara dispara y saca la matrícula */}
      <Scene {...sc(6)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <RoadSide y={1100} t={t} v={190} />
          <RadarBox x={200} y={480} s={0.55} t={t} open={0.3} pole={707} lensHi={fin(t, b6lim)} antHi={1} flash={b6flash} />
          <Car x={b6x} y={1100} s={0.95} spin={-t * 8} />
          <SpeedLines x={b6x + 150} y={1080} t={t} o={t < b6dis + 1 ? 0.8 : 0.4} />
          <Flash x={189} y={656} p={b6flash} />
          <Photo x={690} y={640} p={ramp(t, b6dis + 0.2, b6dis + 0.6)} plateHi={fin(t, b6mat)} />
        </svg>
        {chip(6, "TERCERO · LA FOTO")}
        <Label x={640} y={580} text="pasas del límite" size={44} color={K.warn} box o={span(t, b6lim, b6dis + 0.2, 0.2)} />
        <Label x={690} y={835} text="tu matrícula" size={42} color={K.flow} box o={fin(t, b6mat)} />
        <Label x={690} y={420} text="la prueba" size={42} color={K.white} box o={fin(t, b6pru)} />
      </Scene>

      {/* 7 · cuarto: el radar de tramo (vista desde arriba): cámara a la entrada y a la salida */}
      <Scene {...sc(7)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <RoadTop y0={420} y1={1140} t={t} v={0} />
          <GantryTop y={520} read={span(t, b7sal - 0.1, b7sal + 0.9)} dir={1} />
          <GantryTop y={1030} read={span(t, b7ent - 0.1, b7ent + 0.9)} dir={1} />
          <CarTop x={540} y={b7y} s={0.9} o={b7moving * (1 - ramp(t, b7sal + 0.6, b7sal + 1.1))} />
        </svg>
        {chip(7, "CUARTO · EL RADAR DE TRAMO", K.cold)}
        <Label x={870} y={780} text="sin eco" size={42} color={K.warn} box o={dim(t, b7eco)} />
        <Label x={200} y={1030} text="10:00:00" size={40} color={K.flow} box o={dim(t, b7ent)} />
        <Label x={200} y={520} text="10:06:00" size={40} color={K.flow} box o={dim(t, b7sal)} />
      </Scene>

      {/* 8 · distancia ÷ tiempo = velocidad media; de noche, luz infrarroja */}
      <Scene {...sc(8)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <RoadTop y0={420} y1={1140} t={t} v={0} dark={b8night} />
          <GantryTop y={520} read={b8night * (0.75 + 0.25 * Math.sin(t * 5))} col={K.hot} />
          <GantryTop y={1030} read={b8night * (0.75 + 0.25 * Math.sin(t * 5 + 1))} col={K.hot} />
          <Arrow x0={810} y0={980} x1={810} y1={575} color={K.cold} w={8} o={dim(t, b8dist)} />
          <Panel x={540} y={760} w={480} h={150} o={dim(t, b8div)} border={t > b8med ? K.flow : C.case3}
            lines={[{ text: "10 km ÷ 6 min", size: 46 }, { text: t > b8med ? "= 100 km/h" : "= ?", color: K.flow, size: 46 }]} />
        </svg>
        {chip(8, "DISTANCIA ÷ TIEMPO", K.flow)}
        <Label x={900} y={775} text="10 km" size={40} color={K.cold} box o={dim(t, b8dist)} />
        <Label x={200} y={775} text="6 min" size={40} color={K.flow} box o={dim(t, b8tie)} />
        <Label x={540} y={440} text={t < b8inf ? "velocidad media" : "infrarrojos: lee de noche"} size={42} color={t < b8inf ? K.flow : K.hot} box
          o={t < b8inf ? span(t, b8med, b8inf + 0.05, 0.25) : fin(t, b8inf + 0.3)} />
      </Scene>

      {/* 9 · curiosidad: Connecticut, 1947 */}
      <Scene {...sc(9)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <RoadSide y={1100} t={t} v={b9x > 720 ? 60 : 0} />
          <OldRadar x={300} y={660} s={1} t={t} needle={fin(t, b9rad, 1.2)} />
          <Arcs x={500} y={700} dir={10} t={t} spread={30} len={260} n={3} color={K.cold} o={dim(t, b9rad)} />
          <Car x={b9x} y={1100} s={0.8} old col="#8C6A4A" spin={-t * (b9x > 720 ? 3 : 0)} />
        </svg>
        {chip(9, "CURIOSIDAD · EL PRIMERO", K.flow)}
        <Label x={540} y={450} text="policía de Connecticut (EE. UU.)" size={40} color={K.white} box o={dim(t, b9pol)} />
        <Stamp x={760} y={600} text="1947" color={K.flow} size={70} p={fin(t, b9an)} rot={-6} />
      </Scene>

      {/* 10 · otra: el primer radar de tramo de España, 2010, túnel de Guadarrama */}
      <Scene {...sc(10)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Tunnel t={t} camHi={fin(t, b10tra)} />
        </svg>
        {chip(10, "OTRA · EL PRIMER TRAMO")}
        <Label x={540} y={430} text="primer radar de tramo de España" size={40} color={K.white} box o={dim(t, b10pri)} />
        <Stamp x={540} y={800} text="2010" color={K.flow} size={72} p={fin(t, b10an)} rot={-5} />
        <Label x={540} y={1060} text="túnel de Guadarrama" size={44} color={K.cold} box o={fin(t, b10gua)} />
      </Scene>

      {/* 11 · resumen */}
      <Scene {...sc(11)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <g opacity={dim(t, b11eco)}>
            <circle cx={250} cy={560} r={14} fill={K.cold} />
            <Arcs x={250} y={560} dir={0} t={t} spread={70} len={110} n={3} color={K.cold} />
          </g>
          <g opacity={dim(t, b11fot)}><CamIcon x={250} y={790} hi={fin(t, b11fot)} /></g>
          <g opacity={dim(t, b11tra)}><Stopwatch x={250} y={1020} t={t} hi={fin(t, b11tra)} /></g>
        </svg>
        {chip(11, "RESUMEN")}
        <Label x={640} y={560} text="eco: mide" size={50} color={K.cold} box o={dim(t, b11eco)} />
        <Label x={640} y={790} text="foto: identifica" size={50} color={K.flow} box o={dim(t, b11fot)} />
        <Label x={640} y={1020} text="tramo: cronometra" size={50} color={K.hot} box o={dim(t, b11tra)} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
