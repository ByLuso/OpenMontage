// Episodio 142 · Cómo sabe la puerta automática del súper que vas a entrar.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Door, Person, PersonTop, Arcs, WaveStrip, SideDoor, Ambulance, DopplerRings, DoorTop, Arrow, Cross, RadarGun, Wire } from "./PuertaAuto";

export const COMP_ID = "PuertaAuto";
export const HOOK = "Te vigila un radar"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

/** Atenuado al principio (0,3) y pleno desde w. */
const dim = (t: number, w: number) => 0.3 + 0.7 * ramp(t, w, w + 0.3);
const fin = (t: number, w: number, d = 0.3) => ramp(t, w, w + d);
/** Vaivén continuo 0-1 (abre y cierra) desde w. */
const cycle = (t: number, w: number, per = 4) => (t < w ? 0 : 0.5 - 0.5 * Math.cos(((t - w) / per) * 2 * Math.PI));

// Puerta de frente: centro x 540, techo de la caja en y TOP, escala S → suelo en TOP + 830·S.
const TOP = 440, S = 0.85;
const sx = (x: number) => 540 + S * x, sy = (y: number) => TOP + S * y;

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(scene(i)[0], i === 1 ? 1.8 : 0), scene(i)[1])} />;
  const A = (i: number) => scene(i)[0];
  const until = (w: number) => 1 - ramp(t, w - 0.3, w);

  // ---------- beat 1 ----------
  const b1sec = Wd(1, "secreto"), b1rad = Wd(1, "radar"), b1pol = Wd(1, "como");
  // ---------- beat 2 ----------
  const b2caja = Wd(2, "caja"), b2rad = Wd(2, "radar"), b2ond = Wd(2, "ondas"), b2eco = Wd(2, "eco");
  // ---------- beat 3 ----------
  const b3mue = Wd(3, "mueves"), b3eco = Wd(3, "eco"), b3fre = Wd(3, "frecuencia"), b3abre = Wd(3, "abre");
  const b3walk = ramp(t, b3mue - 0.2, b3mue + 0.2);
  const b3px = 230 + 70 * Math.max(0, t - b3mue);
  // ---------- beat 4 ----------
  const b4dop = Wd(4, "doppler"), b4amb = Wd(4, "ambulancia"), b4agu = Wd(4, "aguda");
  const b4x0 = 170, b4v = 65;
  const b4x = b4x0 + b4v * Math.max(0, t - A(4));
  // ---------- beat 5 ----------
  const b5rad = Wd(5, "radar"), b5cer = Wd(5, "cerebro"), b5enc = Wd(5, "enciende"), b5mot = Wd(5, "motor"), b5caja = Wd(5, "caja");
  // ---------- beat 6 ----------
  const b6mue = Wd(6, "mueve"), b6cor = Wd(6, "correa"), b6hoj = Wd(6, "hojas"), b6rue = Wd(6, "ruedecitas"), b6car = Wd(6, "carril");
  const b6open = cycle(t, b6mue, 3.6);
  const b6dir = Math.sin(((t - b6mue) / 3.6) * 2 * Math.PI); // >0 abriendo, <0 cerrando
  // ---------- beat 7 ----------
  const b7sen = Wd(7, "sensor"), b7cor = Wd(7, "cortina"), b7inf = Wd(7, "infrarrojos"), b7umb = Wd(7, "umbral"), b7cie = Wd(7, "cierran");
  const b7open = 1 - 0.45 * ramp(t, b7cie, b7cie + 0.8);
  // ---------- beat 8 ----------
  const b8par = Wd(8, "parado"), b8ve = Wd(8, "ve"), b8pue = Wd(8, "puerta");
  const b8close = ramp(t, b8par, b8par + 0.7) * (1 - ramp(t, b8ve, b8ve + 0.6));
  const b8open = 1 - 0.4 * b8close;
  // ---------- beat 9 ----------
  const b9acer = Wd(9, "despacio"), b9lado = Wd(9, "lado"), b9eco = Wd(9, "eco"), b9abr = Wd(9, "abrirse");
  const b9ay = 1090 - 16 * Math.max(0, t - A(9));
  const b9bx = 120 + 190 * Math.max(0, t - b9lado + 0.3);
  // ---------- beat 10 ----------
  const b10abre = Wd(10, "abre"), b10bra = Wd(10, "brazos"), b10mov = Wd(10, "movimiento"), b10per = Wd(10, "personas");
  const b10arms = ramp(t, b10bra - 0.1, b10bra + 0.3);
  // ---------- beat 11 ----------
  const b11an = Wd(11, "1954"), b11rad = Wd(11, "radar"), b11pis = Wd(11, "pisar"), b11alf = Wd(11, "alfombra");
  const b11walk = 1 - ramp(t, b11pis + 0.2, b11pis + 0.5);
  const b11px = 150 + 250 * ramp(t, A(11) + 0.3, b11pis + 0.3);
  const b11step = ramp(t, b11pis + 0.2, b11pis + 0.4);
  // ---------- beat 12 ----------
  const b12rad = Wd(12, "radar"), b12cor = Wd(12, "correa"), b12inf = Wd(12, "infrarrojos");

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: la puerta grande; al decir «secreto» la tapa de la caja se levanta y el radar empieza a lanzar ondas */}
      <Scene {...sc(1)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Door cx={540} top={TOP} s={S} t={t} open={0} cover={ramp(t, b1sec, b1sec + 0.6)} sensorHi={fin(t, b1rad - 0.2)} waves={fin(t, b1sec + 0.2, 0.5)} />
          <RadarGun x={250} y={930} s={1.1} o={fin(t, b1pol)} />
          <Arcs x={370} y={910} dir={0} t={t} spread={40} len={240} color={K.cold} o={fin(t, b1pol)} />
        </svg>
        {chip(1, "POR DENTRO")}
        <Label x={540} y={680} text="¡un radar!" size={50} color={K.cold} box o={fin(t, b1rad)} />
        <Label x={540} y={1080} text="como los de la policía" size={42} color={K.white} box o={fin(t, b1pol)} />
      </Scene>

      {/* 2 · en la caja hay un radar de microondas: ondas que salen y eco que vuelve */}
      <Scene {...sc(2)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Door cx={540} top={TOP} s={S} t={t} open={0} sensorHi={fin(t, b2rad)} waves={dim(t, b2ond)} />
          <rect x={sx(-470)} y={sy(0)} width={940 * S} height={150 * S} rx={10} fill="none" stroke={K.flow} strokeWidth={6} opacity={span(t, b2caja, b2rad + 0.6)} />
          <Arcs x={540} y={sy(820)} dir={-90} t={t + 0.3} spread={70} len={420} color={K.flow} o={fin(t, b2eco)} />
        </svg>
        {chip(2, "EL SECRETO: UN RADAR")}
        <Label x={540} y={660} text="radar de microondas" size={44} color={K.cold} box o={fin(t, b2rad)} />
        <Label x={300} y={850} text="ondas invisibles" size={40} color={K.cold} o={fin(t, b2ond)} />
        <Label x={780} y={980} text="el eco vuelve" size={40} color={K.flow} box o={fin(t, b2eco)} />
      </Scene>

      {/* 3 · idea clave: si te mueves hacia la puerta, el eco vuelve con otra frecuencia */}
      <Scene {...sc(3)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <WaveStrip x0={90} x1={520} y={490} lam={90} t={t} color={K.cold} />
          <WaveStrip x0={90} x1={520} y={620} lam={90 - 38 * b3walk} t={t} color={K.flow} o={dim(t, b3eco)} />
          <SideDoor x={850} floor={1110} open={fin(t, b3abre, 0.6)} sensorHi={1} />
          <Arcs x={770} y={460} dir={142} t={t} spread={34} len={330} color={K.cold} />
          <Person x={Math.min(b3px, 600)} y={1110} s={1.15} t={t} walk={b3walk * (b3px < 600 ? 1 : 0)} />
          <Arcs x={Math.min(b3px, 600) + 30} y={790} dir={-35} t={t} spread={30} len={200} n={3 + Math.round(3 * b3walk)} speed={0.9 + 0.9 * b3walk} color={K.flow} o={dim(t, b3eco)} />
          <Arrow x0={Math.min(b3px, 600) - 40} y0={1150} x1={Math.min(b3px, 600) + 90} y1={1150} o={b3walk * 0.9} color={K.white} w={8} />
        </svg>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={305} y={420} text="la onda que sale" size={38} color={K.cold} o={1} />
        <Label x={305} y={700} text="el eco: otra frecuencia" size={38} color={K.flow} box o={fin(t, b3fre)} />
        <Label x={850} y={1060} text="¡se abre!" size={42} color={K.white} box o={fin(t, b3abre)} />
      </Scene>

      {/* 4 · efecto Doppler: la sirena se oye más aguda cuando se acerca */}
      <Scene {...sc(4)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <DopplerRings t={t} a={A(4) - 2} x0={b4x0 - 2 * b4v} y={770} v={b4v} c={260} color={K.cold} />
          <Ambulance x={b4x} y={760} t={t} s={0.85} />
          <Person x={870} y={1110} s={0.85} t={t} hi={fin(t, b4agu)} />
          <path d="M 120 1110 H 1000" stroke="#9FB3CC" strokeWidth={6} />
        </svg>
        {chip(4, "EL EFECTO DOPPLER", K.cold)}
        <Label x={540} y={440} text="efecto Doppler" size={48} color={K.cold} box o={dim(t, b4dop)} />
        <Label x={480} y={1060} text="delante, ondas juntas: más aguda" size={38} color={K.flow} box o={fin(t, b4agu)} />
      </Scene>

      {/* 5 · primero: radar → cerebro → motor */}
      <Scene {...sc(5)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Door cx={540} top={TOP} s={S} t={t} open={fin(t, b5caja - 0.2, 1.2)} cover={1} sensorHi={fin(t, b5rad)} ctrlHi={fin(t, b5cer)} motorHi={fin(t, b5mot)} waves={1} />
          <Wire d={`M ${sx(60)} ${sy(170)} H ${sx(417)} V ${sy(140)}`} t={t} on={fin(t, b5cer)} w={8} />
          <Wire d={`M ${sx(417)} ${sy(4)} V ${TOP - 26} H ${sx(-416)} V ${sy(4)}`} t={t} on={fin(t, b5enc)} color={K.hot} w={8} />
        </svg>
        {chip(5, "PRIMERO · EL CEREBRO")}
        <Label x={540} y={680} text="radar" size={42} color={K.cold} box o={dim(t, b5rad)} />
        <Label x={sx(417) - 30} y={680} text="cerebro" size={42} color={K.flow} box o={dim(t, b5cer)} />
        <Label x={sx(-416) + 40} y={680} text="motor" size={42} color={K.hot} box o={dim(t, b5mot)} />
      </Scene>

      {/* 6 · segundo: motor → correa dentada → carros con ruedecitas por el carril */}
      <Scene {...sc(6)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Door cx={540} top={TOP} s={S} t={t} open={b6open} cover={1} motorHi={fin(t, b6mue)} beltHi={fin(t, b6cor)} wheelHi={fin(t, b6rue)} sensor={false} />
          <Arrow x0={400} y0={900} x1={260} y1={900} o={fin(t, b6hoj) * Math.max(0, b6dir)} />
          <Arrow x0={680} y0={900} x1={820} y1={900} o={fin(t, b6hoj) * Math.max(0, b6dir)} />
          <Arrow x0={260} y0={900} x1={400} y1={900} o={fin(t, b6hoj) * Math.max(0, -b6dir)} color={K.cold} />
          <Arrow x0={820} y0={900} x1={680} y1={900} o={fin(t, b6hoj) * Math.max(0, -b6dir)} color={K.cold} />
        </svg>
        {chip(6, "SEGUNDO · MOTOR Y CORREA")}
        <Label x={540} y={640} text="correa dentada" size={42} color={K.flow} box o={dim(t, b6cor)} />
        <Label x={540} y={720} text="hojas colgadas de ruedecitas" size={38} color={K.cold} o={fin(t, b6rue)} />
        <Label x={540} y={790} text="que ruedan por un carril" size={38} color={K.cold} o={fin(t, b6car)} />
      </Scene>

      {/* 7 · tercero: cortina de infrarrojos sobre el umbral */}
      <Scene {...sc(7)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Door cx={540} top={TOP} s={S} t={t} open={b7open} ir={dim(t, b7cor)} sensorHi={0} />
          <rect x={sx(-300)} y={sy(816)} width={600 * S} height={26 * S} rx={6} fill="none" stroke={K.flow} strokeWidth={5} opacity={fin(t, b7umb)} />
        </svg>
        {chip(7, "TERCERO · EL UMBRAL", K.hot)}
        <Label x={540} y={650} text="otro sensor" size={40} color={K.white} box o={span(t, b7sen, b7inf)} />
        <Label x={540} y={760} text="cortina de infrarrojos" size={44} color={K.hot} box o={fin(t, b7inf)} />
        <Label x={540} y={1060} text="el umbral" size={42} color={K.flow} box o={fin(t, b7umb)} />
      </Scene>

      {/* 8 · cuarto: si estás parado debajo, te ve y no se cierra */}
      <Scene {...sc(8)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Door cx={540} top={TOP} s={S} t={t} open={b8open} ir={1} irHit={t > b8par ? [-66, 66] : undefined} sensorHi={0} />
          <Person x={540} y={sy(830)} s={1.15} t={t} hi={fin(t, b8ve) * 0.6} />
          <Arrow x0={150} y0={900} x1={300} y1={900} color={K.warn} o={b8close} />
          <Arrow x0={930} y0={900} x1={780} y1={900} color={K.warn} o={b8close} />
        </svg>
        {chip(8, "CUARTO · LA SEGURIDAD", K.hot)}
        <Label x={540} y={650} text="parado, sin moverte" size={40} color={K.white} box o={dim(t, b8par)} />
        <Label x={540} y={1060} text="te ve igual" size={42} color={K.flow} box o={span(t, b8ve, b8pue + 0.1)} />
        <Stamp x={540} y={1060} text="NO SE CIERRA" color={K.cold} size={50} p={fin(t, b8pue + 0.2)} rot={-4} />
      </Scene>

      {/* 9 · curiosidad: muy despacio o de lado, el eco casi no cambia (vista desde arriba) */}
      <Scene {...sc(9)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <DoorTop y={470} open={0} fan={1} t={t} />
          <PersonTop x={540} y={b9ay} s={1.1} o={dim(t, b9acer)} />
          <Arrow x0={540} y0={b9ay - 50} x1={540} y1={b9ay - 90} color={K.white} w={7} o={dim(t, b9acer) * 0.8} />
          <PersonTop x={Math.min(b9bx, 960)} y={760} s={1.1} rot={90} o={fin(t, b9lado - 0.3)} />
          <Arrow x0={Math.min(b9bx, 960) + 50} y0={760} x1={Math.min(b9bx, 960) + 110} y1={760} color={K.white} w={7} o={fin(t, b9lado - 0.3) * (b9bx < 830 ? 0.8 : 0)} />
          <Cross x={540} y={470} s={0.8} o={fin(t, b9abr)} />
        </svg>
        {chip(9, "CURIOSIDAD · NO TE VE", K.warn)}
        <Label x={540} y={1110} text="muy despacio" size={40} color={K.white} box o={dim(t, b9acer)} />
        <Label x={230} y={680} text="de lado" size={40} color={K.white} box o={fin(t, b9lado)} />
        <Label x={540} y={560} text="el eco casi no cambia" size={40} color={K.flow} box o={fin(t, b9eco)} />
      </Scene>

      {/* 10 · truco: mueve los brazos hacia ella */}
      <Scene {...sc(10)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Door cx={540} top={TOP} s={S} t={t} open={fin(t, b10mov, 0.8)} waves={1} sensorHi={fin(t, b10bra)} />
          <Person x={540} y={sy(830)} s={1.0} t={t} arms={b10arms} />
          <Arcs x={540} y={800} dir={-90} t={t} spread={60} len={150} n={3} speed={1.4} color={K.flow} o={b10arms} />
        </svg>
        {chip(10, "TRUCO · SI NO SE ABRE")}
        <Label x={540} y={680} text="¡mueve los brazos!" size={44} color={K.flow} box o={fin(t, b10bra)} />
        <Label x={540} y={1060} text="busca movimiento, no personas" size={38} color={K.white} box o={fin(t, b10mov)} />
      </Scene>

      {/* 11 · otra: la primera, de 1954, se abría al pisar una alfombra */}
      <Scene {...sc(11)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Door cx={540} top={TOP} s={S} t={t} open={fin(t, b11pis + 0.3, 0.8)} sensor={false} mat={1} matHi={b11step} />
          <Person x={b11px} y={sy(850)} s={1.05} t={t} walk={b11walk} />
        </svg>
        {chip(11, "OTRA · LA PRIMERA")}
        <Stamp x={720} y={720} text="1954" color={K.flow} size={64} p={fin(t, b11an)} rot={-6} />
        <Label x={720} y={850} text="sin radar" size={42} color={K.white} box o={fin(t, b11rad)} />
        <Label x={720} y={960} text="pisas y se abre" size={42} color={K.flow} box o={fin(t, b11alf)} />
      </Scene>

      {/* 12 · resumen */}
      <Scene {...sc(12)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Door cx={540} top={TOP} s={S} t={t} open={cycle(t, A(12) + 0.3, 4)} cover={1} sensorHi={fin(t, b12rad)} waves={dim(t, b12rad)}
            beltHi={fin(t, b12cor)} motorHi={fin(t, b12cor)} ir={dim(t, b12inf)} />
        </svg>
        {chip(12, "RESUMEN")}
        <Label x={540} y={660} text="radar: te ve" size={44} color={K.cold} box o={dim(t, b12rad)} />
        <Label x={540} y={800} text="correa: abre" size={44} color={K.flow} box o={dim(t, b12cor)} />
        <Label x={540} y={940} text="infrarrojos: te cuidan" size={44} color={K.hot} box o={dim(t, b12inf)} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
