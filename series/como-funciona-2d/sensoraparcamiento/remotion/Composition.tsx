// Episodio 166 · Cómo funcionan los sensores de aparcamiento (el pitido que acelera).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { C, Waves, SensorFace, SensorInside, BumperBand, SensorCut, Wall, PingPong, Stopwatch, CarTop, CarSide, Bat, Moth, Speaker, Thermo, Eye, Pole, T, arcD, glow } from "./Sensor";

export const COMP_ID = "SensorAparcamiento";
export const HOOK = "Gritan como un murciélago"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

/** Atenuado al principio (0,3) y pleno desde w. */
const dim = (t: number, w: number) => 0.3 + 0.7 * ramp(t, w, w + 0.3);
const fin = (t: number, w: number, d = 0.3) => ramp(t, w, w + d);
const lin = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / Math.max(0.001, b - a)));
const frac = (x: number) => ((x % 1) + 1) % 1;

/** Sensor del gancho partido en dos mitades que se separan (open 0→1) y enseñan el disco. */
const OpenSensor: React.FC<{ x: number; y: number; r: number; open: number; t: number; vib?: number }> = ({ x, y, r, open, t, vib = 0 }) => {
  const d = open * r * 0.8;
  return (
    <g>
      <defs>
        <clipPath id="sTop"><rect x={x - r * 1.3} y={y - r * 1.3} width={r * 2.6} height={r * 1.3} /></clipPath>
        <clipPath id="sBot"><rect x={x - r * 1.3} y={y} width={r * 2.6} height={r * 1.3} /></clipPath>
      </defs>
      <SensorInside x={x} y={y} r={r} t={t} vib={vib} />
      <g clipPath="url(#sTop)" transform={`translate(0 ${-d})`} opacity={1 - 0.15 * open}><SensorFace x={x} y={y} r={r * 1.08} /></g>
      <g clipPath="url(#sBot)" transform={`translate(0 ${d})`} opacity={1 - 0.15 * open}><SensorFace x={x} y={y} r={r * 1.08} /></g>
    </g>
  );
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
  const b1sec = Wd(1, "secreto"), b1gri = Wd(1, "gritan"), b1mur = Wd(1, "murcielago");
  const b1open = ramp(t, b1sec - 0.1, b1sec + 0.6);
  // ---------- beat 2 ----------
  const b2lan = Wd(2, "lanza"), b2ult = Wd(2, "ultrasonido"), b2oye = Wd(2, "oyes"), b2esc = Wd(2, "escucha"), b2eco = Wd(2, "eco");
  // ---------- beat 3 ----------
  const b3med = Wd(3, "medir"), b3ant = Wd(3, "antes"), b3cer = Wd(3, "cerca");
  const wx3 = 880 - 360 * ramp(t, b3ant - 0.2, b3ant + 0.5);
  // ---------- beat 4 ----------
  const b4dis = Wd(4, "disco"), b4pie = Wd(4, "piezoelectrico"), b4ele = Wd(4, "electricidad"), b4vib = Wd(4, "vibra"), b4cua = Wd(4, "cuarenta");
  // ---------- beat 5 ----------
  const b5cal = Wd(5, "calla"), b5oid = Wd(5, "oido"), b5eco = Wd(5, "eco"), b5sac = Wd(5, "sacude"), b5sen = Wd(5, "senal");
  // ---------- beat 6 ----------
  const b6tre = Wd(6, "trescientos"), b6sei = Wd(6, "seis"), b6un = Wd(6, "un"), b6met = b6un + 0.2;
  // ---------- beat 7 ----------
  const b7var = Wd(7, "varios"), b7com = Wd(7, "comparando"), b7cen = Wd(7, "centralita"), b7lad = Wd(7, "lado");
  // ---------- beat 8 ----------
  const b8pit = Wd(8, "pitidos"), b8cer = Wd(8, "cerca"), b8seg = Wd(8, "seguidos"), b8tre = Wd(8, "treinta"), b8con = Wd(8, "continuo");
  // distancia (m) del coche a la pared y pitidos con fase integrada
  const dist8 = (tt: number) => 1.5 - 1.28 * Math.sin((Math.PI / 2) * lin(tt, A(8) + 0.3, b8con));
  const beepInt = (d: number) => 0.13 + 0.6 * Math.max(0, d - 0.3) / 1.2;
  let ph8 = 0;
  for (let k = A(8); k < Math.min(t, Z(8)); k += 1 / 30) ph8 += (1 / 30) / beepInt(dist8(k));
  const d8 = dist8(t);
  const cont8 = d8 <= 0.3;
  const beepOn = t < A(8) + 0.3 ? 0 : cont8 ? 1 : frac(ph8) < 0.45 ? 1 : 0;
  const zone8 = d8 > 0.6 ? K.flow : d8 > 0.3 ? K.hot : K.warn;
  // ---------- beat 9 ----------
  const b9bar = Wd(9, "barro"), b9hie = Wd(9, "hielo"), b9nie = Wd(9, "nieve"), b9cie = Wd(9, "ciegan"), b9pos = Wd(9, "poste"), b9esc = Wd(9, "escaparse"), b9mir = Wd(9, "mirar");
  // ---------- beat 10 ----------
  const b10mur = Wd(10, "murcielagos"), b10mis = Wd(10, "mismo"), b10lan = Wd(10, "lanzarse"), b10ins = Wd(10, "insecto"), b10ace = Wd(10, "aceleran");
  const q10 = lin(t, b10lan, Z(10) - 0.2);
  const batX = 250 + 380 * Math.sin((Math.PI / 2) * q10);
  const rate10 = 0.9 + 4 * q10 * q10; // ondas por segundo
  // ---------- beat 11 ----------
  const b11fri = Wd(11, "frio"), b11len = Wd(11, "lento"), b11ses = Wd(11, "sesenta"), b11gra = Wd(11, "grado");
  const race = (v: number) => { const P = 2.2; const u = frac((t - A(11) - 0.3) / P); return 330 + Math.min(1, (u / 0.85) * (v / 349)) * 600; };
  // ---------- beat 12 ----------
  const b12gri = Wd(12, "grito"), b12eco = Wd(12, "eco"), b12cro = Wd(12, "cronometro"), b12coc = Wd(12, "coche"), b12par = Wd(12, "pared");

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el parachoques en primer plano; al decir «secreto» el sensor se parte y enseña el disco; «gritan»: ondas; «murciélago»: aparece uno */}
      <Scene {...sc(1)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <BumperBand y={820} h={440} />
          <SensorFace x={175} y={820} r={80} />
          <SensorFace x={905} y={820} r={80} />
          <Waves x={540} y={820} dir={0} spread={180} phase={t * 1.3} n={4} r0={190} r1={520} color={K.cold} w={10} o={fin(t, b1gri)} />
          <OpenSensor x={540} y={820} r={160} open={b1open} t={t} vib={fin(t, b1gri)} />
          <Bat x={540} y={430} s={0.8} flap={Math.sin(t * 9)} o={fin(t, b1mur)} />
        </svg>
        {chip(1, "POR DENTRO")}
        <Label x={540} y={1110} text="¡grita en ultrasonido!" size={48} color={K.cold} box o={fin(t, b1gri)} />
      </Scene>

      {/* 2 · lanza un grito que no oyes y escucha el eco: sensor en corte + pared */}
      <Scene {...sc(2)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Wall x={860} y0={540} y1={1000} hi={t > b2eco ? 0.6 : 0} />
          <SensorCut x={300} y={770} s={0.7} hi={0.4} />
          <PingPong sx={410} wx={860} y={770} u={frac((t - b2lan) / 1.4)} o={t < b2lan ? 0 : 1} />
        </svg>
        {chip(2, "EL SECRETO")}
        <Label x={540} y={470} text="ULTRASONIDO" size={56} color={K.cold} box o={dim(t, b2ult)} />
        <Label x={540} y={1100} text="tú no lo oyes" size={46} color={K.white} box o={span(t, b2oye, b2eco - 0.05)} />
        <Label x={540} y={1100} text="y escucha su ECO" size={46} color={K.flow} box o={span(t, b2eco + 0.3, Infinity)} />
      </Scene>

      {/* 3 · la idea clave: cuanto antes vuelve el eco, más cerca está */}
      <Scene {...sc(3)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Wall x={wx3} y0={560} y1={900} />
          <SensorCut x={180} y={730} s={0.5} hi={0.4} />
          <PingPong sx={258} wx={wx3} y={730} u={frac((t - A(3)) / (0.35 + (wx3 - 258) / 700))} />
          <Stopwatch x={540} y={1020} r={95} frac={frac((t - A(3)) / (0.35 + (wx3 - 258) / 700))} hi={fin(t, b3med)} o={dim(t, b3med)} />
        </svg>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={540} y={470} text="lejos: el eco tarda más" size={44} color={K.white} box o={span(t, A(3) + 0.2, b3ant - 0.1)} />
        <Label x={540} y={470} text="cerca: ¡vuelve antes!" size={46} color={K.flow} box o={span(t, b3ant + 0.2, Infinity)} />
      </Scene>

      {/* 4 · primero: disco piezoeléctrico que vibra con electricidad */}
      <Scene {...sc(4)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Waves x={760} y={760} dir={0} spread={30} phase={t * 2.2} n={4} r0={40} r1={260} color={K.cold} o={fin(t, b4vib)} />
          <SensorCut x={570} y={760} s={1.25} hi={dim(t, b4pie)} wire={fin(t, b4ele)} bend={t > b4vib ? Math.sin(t * 26) : 0} />
        </svg>
        {chip(4, "PRIMERO · EL DISCO")}
        <Label x={540} y={470} text="disco piezoeléctrico" size={48} color={K.flow} box o={dim(t, b4dis)} />
        <Label x={540} y={1090} text="40.000 - 50.000 veces/s" size={46} color={K.cold} box o={fin(t, b4cua)} />
      </Scene>

      {/* 5 · segundo: se calla y escucha; el eco sacude el disco y sale una señal eléctrica */}
      <Scene {...sc(5)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Waves x={1180} y={760} dir={180} spread={22} phase={t * 1.6} n={4} r0={60} r1={420} color={K.flow} o={fin(t, b5eco)} />
          <SensorCut x={570} y={760} s={1.25} hi={0.6} wire={fin(t, b5sen)} bend={t > b5sac ? 0.6 * Math.sin(t * 22) : 0} />
          {t > b5sen && [0, 1, 2].map((k) => {
            const u = frac((t - b5sen) * 0.9 + k / 3);
            const x = 160 + 200 * (1 - u);
            return <circle key={k} cx={x} cy={660 + 30 * Math.sin(u * 3)} r={14} fill={K.flow} opacity={1 - u} style={glow(1, K.flow, 10)} />;
          })}
        </svg>
        {chip(5, "SEGUNDO · AHORA ESCUCHA")}
        <Label x={540} y={470} text="modo oído" size={52} color={K.white} box o={dim(t, b5oid)} />
        <Label x={540} y={1090} text="→ señal eléctrica" size={46} color={K.flow} box o={fin(t, b5sen)} />
      </Scene>

      {/* 6 · tercero: velocidad del sonido + tiempo del eco = distancia */}
      <Scene {...sc(6)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Wall x={860} y0={560} y1={940} hi={fin(t, b6met)} />
          <SensorCut x={170} y={740} s={0.45} hi={0.4} />
          <PingPong sx={240} wx={860} y={740} u={frac((t - A(6)) / 1.5)} />
          <g opacity={dim(t, b6un)}>
            <path d="M 240 990 H 860" stroke={K.white} strokeWidth={6} />
            <path d="M 240 965 V 1015 M 860 965 V 1015" stroke={K.white} strokeWidth={6} />
          </g>
        </svg>
        {chip(6, "TERCERO · EL CRONÓMETRO")}
        <Label x={540} y={470} text="sonido: 340 m/s" size={48} color={K.cold} box o={dim(t, b6tre)} />
        <Label x={540} y={570} text="eco en 6 milésimas" size={44} color={K.flow} box o={fin(t, b6sei)} />
        <Label x={550} y={1065} text="= 1 metro" size={48} color={K.white} o={fin(t, b6met)} />
      </Scene>

      {/* 7 · cuarto: varios sensores; comparando ecos sabe por qué lado está */}
      <Scene {...sc(7)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {/* bolardo arriba a la izquierda (vista desde arriba) */}
          <circle cx={330} cy={520} r={46} fill={C.case3} stroke={fin(t, b7lad) > 0.5 ? K.warn : C.case2} strokeWidth={8} style={glow(fin(t, b7lad), K.warn, 14)} />
          <circle cx={330} cy={520} r={20} fill={C.case2} />
          {[416, 499, 581, 664].map((sx, i) => (
            <Waves key={i} x={sx} y={786} dir={-90} spread={40} phase={t * 1.4 + i * 0.25} n={3} r0={20} r1={300} color={K.cold} w={6} o={dim(t, b7var) * (i < 2 || t < b7com ? 1 : 0.35)} />
          ))}
          {[416, 499].map((sx, i) => (
            <path key={i} d={`M ${sx} 786 L 330 520`} stroke={K.flow} strokeWidth={6} strokeDasharray="14 10" opacity={fin(t, b7com)} />
          ))}
          <CarTop x={540} y={780} s={0.75} hiS={[fin(t, b7com), fin(t, b7com), 0, 0]} />
          {/* centralita dentro del coche */}
          <g opacity={dim(t, b7cen)} style={glow(fin(t, b7cen), K.flow, 12)}>
            <rect x={450} y={960} width={180} height={90} rx={14} fill={C.dark} stroke={fin(t, b7cen) > 0.5 ? K.flow : C.case3} strokeWidth={5} />
            {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={470 + i * 32} y={1050} width={10} height={16} fill={C.case3} />)}
          </g>
          <T x={540} y={1016} text="CENTRALITA" size={28} color={K.flow} o={dim(t, b7cen)} />
        </svg>
        {chip(7, "CUARTO · ¿POR QUÉ LADO?")}
        <Label x={720} y={530} text="¡por la izquierda!" size={44} color={K.flow} box o={fin(t, b7lad)} />
      </Scene>

      {/* 8 · los pitidos: cuanto más cerca, más seguidos; a 30 cm, continuo */}
      <Scene {...sc(8)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <path d="M 60 888 H 980" stroke={C.case1} strokeWidth={8} />
          <Wall x={880} y0={560} y1={884} w={80} />
          <CarSide x={880 - 8 - d8 * 300} y={820} s={0.6} sensorHi={beepOn} wheel={-d8 * 300} />
          <Speaker x={440} y={540} s={1} on={beepOn} color={zone8} />
          <T x={780} y={565} text={`${d8.toFixed(1).replace(".", ",")} m`} size={60} color={zone8} />
        </svg>
        {chip(8, "LOS PITIDOS")}
        <Label x={540} y={1060} text="más cerca = más seguidos" size={44} color={K.hot} box o={span(t, b8cer, b8con - 0.1)} />
        <Label x={540} y={1060} text="¡PITIDO CONTINUO!" size={52} color={K.warn} box o={span(t, b8con + 0.2, Infinity)} />
      </Scene>

      {/* 9 · ojo: barro, hielo o nieve lo ciegan; un poste fino se escapa; no sustituye mirar */}
      <Scene {...sc(9)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <SensorFace x={290} y={620} r={120} />
          <g opacity={fin(t, b9bar)}>
            <ellipse cx={250} cy={590} rx={80} ry={56} fill={C.mud} />
            <ellipse cx={330} cy={660} rx={66} ry={46} fill={C.mud} />
            <circle cx={200} cy={680} r={22} fill={C.mud} />
          </g>
          <g opacity={fin(t, b9hie) * 0.75}>
            <path d="M 200 520 L 380 540 L 400 720 L 190 700 Z" fill={C.ice} />
          </g>
          <g opacity={fin(t, b9nie)}>
            {[[220, 560], [300, 540], [360, 610], [240, 650], [330, 700], [270, 720]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={16} fill="#ffffff" />)}
          </g>
          <Waves x={560} y={640} dir={0} spread={26} phase={t * 1.5} n={3} r0={20} r1={420} color={K.cold} w={7} o={dim(t, b9pos)} />
          <Pole x={760} y0={470} y1={820} hi={fin(t, b9esc)} />
          <Eye x={540} y={985} s={0.6} o={dim(t, b9mir)} look={Math.sin(t * 2)} />
        </svg>
        {chip(9, "OJO", K.warn)}
        <Stamp x={290} y={790} text="¡CIEGO!" p={ramp(t, b9cie, b9cie + 0.3)} size={50} />
        <Label x={790} y={430} text="poste fino" size={40} color={K.warn} box o={fin(t, b9pos)} />
        <Label x={540} y={1105} text="no sustituye mirar" size={46} color={K.white} box o={fin(t, b9mir)} />
      </Scene>

      {/* 10 · curiosidad: los murciélagos hacen lo mismo y aceleran los gritos al cazar */}
      <Scene {...sc(10)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Waves x={batX + 60} y={660} dir={0} spread={28} phase={t * rate10} n={3} r0={30} r1={220} color={K.cold} w={8} />
          <Bat x={batX} y={660} s={0.8} flap={Math.sin(t * 10)} />
          <Moth x={830} y={640 + 20 * Math.sin(t * 5)} flap={Math.sin(t * 14)} s={1.3} o={dim(t, b10ins)} />
          {/* gritos cada vez más seguidos */}
          <g opacity={dim(t, b10ace)}>
            {Array.from({ length: 22 }).map((_, k) => {
              const x = 120 + 800 * Math.pow(k / 21, 0.55);
              return <rect key={k} x={x - 5} y={990} width={10} height={60} rx={4} fill={K.cold} opacity={x < 120 + 820 * Math.max(0.05, fin(t, b10ace, 1.0)) ? 1 : 0.2} />;
            })}
          </g>
        </svg>
        {chip(10, "CURIOSIDAD")}
        <Label x={540} y={470} text="ecolocalización" size={52} color={K.cold} box o={dim(t, b10mis)} />
        <Label x={540} y={1110} text="¡gritos más seguidos!" size={44} color={K.white} box o={fin(t, b10ace)} />
      </Scene>

      {/* 11 · otra: con frío el sonido va más lento (0,6 m/s menos por grado) */}
      <Scene {...sc(11)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Thermo x={170} y={940} h={400} lvl={0.75 - 0.55 * ramp(t, b11fri, b11fri + 0.8)} color={t > b11fri + 0.4 ? K.cold : K.hot} />
          {[{ y: 620, v: 349, col: K.hot }, { y: 820, v: 331, col: K.cold }].map(({ y, v, col }, i) => (
            <g key={i} opacity={i === 1 ? dim(t, b11fri) : 1}>
              <path d={`M 330 ${y} H 940`} stroke={C.case1} strokeWidth={6} strokeDasharray="12 12" />
              <path d={arcD(race(v) - 40, y, 40, -40, 40)} stroke={col} strokeWidth={10} strokeLinecap="round" fill="none" />
              <path d={arcD(race(v) - 64, y, 40, -40, 40)} stroke={col} strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.5} />
            </g>
          ))}
        </svg>
        {chip(11, "OTRA · EL FRÍO")}
        <Label x={640} y={545} text="30 °C · 349 m/s" size={40} color={K.hot} o={1} />
        <Label x={640} y={745} text="0 °C · 331 m/s" size={40} color={K.cold} o={dim(t, b11fri)} />
        <Label x={560} y={1070} text="-60 cm/s por cada grado" size={44} color={K.white} box o={fin(t, b11ses)} />
      </Scene>

      {/* 12 · cierre: grito, eco y cronómetro */}
      <Scene {...sc(12)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <g opacity={dim(t, b12gri)}><SensorFace x={190} y={620} r={40} /><Waves x={200} y={620} dir={0} spread={35} phase={t * 1.5} n={3} r0={50} r1={150} color={K.cold} /></g>
          <g opacity={dim(t, b12eco)}><Waves x={620} y={620} dir={180} spread={35} phase={t * 1.5} n={3} r0={20} r1={130} color={K.flow} /><rect x={620} y={540} width={24} height={160} fill={C.wall} /></g>
          <Stopwatch x={850} y={630} r={80} frac={frac(t * 0.8)} hi={fin(t, b12cro)} o={dim(t, b12cro)} />
          <T x={210} y={790} text="GRITO" size={40} color={K.cold} o={dim(t, b12gri)} />
          <T x={560} y={790} text="ECO" size={40} color={K.flow} o={dim(t, b12eco)} />
          <T x={850} y={790} text="CRONÓMETRO" size={34} color={K.white} o={dim(t, b12cro)} />
          <path d="M 80 1110 H 960" stroke={C.case1} strokeWidth={6} />
          <Wall x={860} y0={930} y1={1106} w={60} hi={fin(t, b12par)} />
          <CarSide x={860 - 30 - 260 * (1 - ramp(t, b12coc - 0.5, b12par + 0.4))} y={1060} s={0.4} sensorHi={fin(t, b12par)} wheel={t * -200 * (t < b12par + 0.4 ? 1 : 0)} />
        </svg>
        {chip(12, "RESUMEN")}
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
