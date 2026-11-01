// Episodio 133 · Cómo abre el coche la llave sin llave (keyless): el coche llama, la llave contesta.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { SmartKey, Waves, CarSide, CarTop, Hand, Bubble, Padlock, CoinCell, StartButton, House, Relay, Pouch, Toggle, Cross, Zzz, Tag, C } from "./Llave";

export const COMP_ID = "LlaveCoche";
export const HOOK = "La llave que contesta"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

/** Código hexadecimal pseudoaleatorio para el número n (solo decorativo). */
const code = (n: number, len = 4) => {
  let x = (Math.imul(n + 11, 2654435761) + 9973) >>> 0;
  x ^= x >>> 13; x = Math.imul(x, 0x5bd1e995) >>> 0; x ^= x >>> 15;
  const h = (x >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, len);
  return `${h.slice(0, 2)} ${h.slice(2)}`;
};
/** Atenuado al principio (0,3) y pleno desde w. */
const dim = (t: number, w: number) => 0.3 + 0.7 * ramp(t, w, w + 0.3);
const fadeIn = (t: number, w: number, d = 0.3) => ramp(t, w, w + d);

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(scene(i)[0], i === 1 ? 1.8 : 0), scene(i)[1])} />;
  const A = (i: number) => scene(i)[0];
  const bob = (k = 1) => 8 * k * Math.sin(t * 2);

  // ---------- beat 1 ----------
  const b1open = ramp(t, Wd(1, "secreto"), Wd(1, "secreto") + 0.6);
  const b1call = Wd(1, "llama"), b1ans = Wd(1, "contesta");
  // ---------- beat 2 ----------
  const b2hand = ramp(t, Wd(2, "manilla") - 0.4, Wd(2, "manilla"));
  const b2q = Wd(2, "pregunta"), b2r = Wd(2, "responde"), b2open = Wd(2, "sola");
  // ---------- beat 3 ----------
  const b3q = Wd(3, "pregunta"), b3only = Wd(3, "solo"), b3ans = Wd(3, "contestar");
  // ---------- beat 4 ----------
  const b4wave = Wd(4, "lanza"), b4reach = Wd(4, "llega");
  // ---------- beat 5 ----------
  const b5hear = Wd(5, "oye"), b5wake = Wd(5, "despierta"), b5calc = Wd(5, "calcula"), b5key = Wd(5, "clave");
  const b5code = t < b5calc ? "·· ··" : t < b5key + 0.4 ? code(Math.floor((t - b5calc) / 0.12) + 300) : "OK";
  // ---------- beat 6 ----------
  const b6radio = Wd(6, "radio"), b6ok = Wd(6, "correcta"), b6open = Wd(6, "abren");
  // ---------- beat 7 ----------
  const b7in = ramp(t, Wd(7, "comprueban"), Wd(7, "llave"));
  const b7zone = Wd(7, "comprueban"), b7no = Wd(7, "si");
  const b7kx = 860 + (540 - 860) * b7in, b7ky = 500 + (780 - 500) * b7in;
  // ---------- beat 8 ----------
  const b8sleep = Wd(8, "duerme");
  // ---------- beat 9 ----------
  const b9near = ramp(t, Wd(9, "acerca"), Wd(9, "arranque") + 0.3);
  const b9chip = Wd(9, "chip"), b9go = Wd(9, "resto");
  const b9kx = 230 + (360 - 230) * b9near, b9ky = 960 + (770 - 960) * b9near;
  // ---------- beat 10 ----------
  const b10blade = ramp(t, Wd(10, "escondida") - 0.2, Wd(10, "metal") + 0.2);
  // ---------- beat 11 ----------
  const b11relay = Wd(11, "alargan"), b11car = Wd(11, "cree");
  // ---------- beat 12 ----------
  const b12cover = ramp(t, Wd(12, "guardala"), Wd(12, "funda") + 0.3);
  const b12block = Wd(12, "bloquee"), b12off = Wd(12, "desactiva");
  // ---------- beat 13 ----------
  const b13q = Wd(13, "pregunta"), b13a = Wd(13, "contesta"), b13n = Wd(13, "pulsar");

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: la llave grande; al decir «secreto» la tapa se desliza y deja ver la placa */}
      <Scene {...sc(1)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <g transform={`translate(0 ${bob()})`}>
            <SmartKey cx={540} cy={790} s={1.35} open={b1open} t={t} coilGlow={span(t, b1call, b1ans + 0.4)} chipGlow={ramp(t, b1call + 0.3, b1call + 0.6)}
              antGlow={ramp(t, b1ans, b1ans + 0.3)} led={t > b1ans ? 1 : 0} />
          </g>
          <Waves x={705} y={420} t={t} reach={300} color={K.cold} ang={90} spread={45} speed={0.6} o={span(t, b1call, b1ans + 0.2)} />
          <Waves x={705} y={500} t={t} reach={240} color={K.flow} ang={-90} spread={40} speed={1.6} o={ramp(t, b1ans, b1ans + 0.2)} />
        </svg>
        {chip(1, "EL SECRETO DE LA LLAVE")}
        <Label x={540} y={1120} text="el coche la llama…" size={46} color={K.cold} box o={span(t, b1call, b1ans - 0.05, 0.25)} />
        <Label x={540} y={1120} text="…y ella contesta" size={46} color={K.flow} box o={ramp(t, b1ans + 0.25, b1ans + 0.5)} />
      </Scene>

      {/* 2 · tocas la manilla: pregunta y respuesta sin sacar la llave */}
      <Scene {...sc(2)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <CarSide cx={540} cy={740} s={1.05} t={t} handleHi={ramp(t, Wd(2, "manilla"), Wd(2, "manilla") + 0.3)} blink={ramp(t, b2open, b2open + 0.1) * (t < b2open + 1.2 ? 1 : 0)} />
          {/* bolsillo con la llave */}
          <rect x={120} y={900} width={170} height={190} rx={26} fill={C.case1} stroke={C.case3} strokeWidth={5} />
          <SmartKey cx={205} cy={930} s={0.32} t={t} led={t > b2r ? 1 : 0} />
          <rect x={120} y={960} width={170} height={130} rx={26} fill={C.case1} stroke={C.case3} strokeWidth={5} />
          <Hand x={510 + 320 * (1 - b2hand)} y={584} s={0.85} o={dim(t, Wd(2, "manilla") - 0.4)} />
          <Waves x={470} y={640} t={t} reach={300} color={K.cold} ang={135} spread={35} speed={0.6} o={span(t, b2q, b2r + 0.3)} />
          <Bubble x={250} y={500} text="?" color={K.cold} size={64} o={ramp(t, b2q, b2q + 0.25) * (1 - ramp(t, b2open + 0.4, b2open + 0.7))} />
          <Waves x={260} y={900} t={t} reach={240} color={K.flow} ang={-55} spread={35} speed={1.6} o={span(t, b2r, b2open + 0.6)} />
          <Bubble x={420} y={810} text="OK" color={K.flow} size={52} tail="left" o={ramp(t, b2r + 0.2, b2r + 0.45)} />
          <Padlock x={850} y={470} s={0.7} open={ramp(t, b2open, b2open + 0.4)} o={dim(t, A(2) + 0.2)} />
        </svg>
        {chip(2, "SIN PULSAR NADA")}
        <Label x={205} y={1125} text="en tu bolsillo" size={36} o={dim(t, A(2) + 0.3)} />
      </Scene>

      {/* 3 · idea clave: una pregunta que solo tu llave sabe contestar */}
      <Scene {...sc(3)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <CarSide cx={300} cy={760} s={0.55} t={t} blink={ramp(t, b3ans + 0.3, b3ans + 0.4)} />
          <g transform={`translate(0 ${bob(0.6)})`}><SmartKey cx={800} cy={700} s={0.45} t={t} led={t > b3ans ? 1 : 0} /></g>
          <Bubble x={300} y={520} text={t < b3q ? "?" : `? ${code(Math.floor((t - b3q) / 1.4) + 40)}`} color={K.cold} size={46} o={dim(t, b3q)} w={300} />
          <Waves x={480} y={620} t={t} reach={200} color={K.cold} ang={0} spread={30} speed={0.6} o={ramp(t, b3q, b3q + 0.3)} />
          <Bubble x={800} y={500} text="OK" color={K.flow} size={52} o={ramp(t, b3ans, b3ans + 0.3)} />
          <SmartKey cx={800} cy={1000} s={0.32} t={t} o={0.35 + 0.35 * ramp(t, b3only, b3only + 0.3)} />
          <Cross x={800} y={1000} s={0.9} o={ramp(t, b3only + 0.3, b3only + 0.6)} />
        </svg>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={300} y={1000} text="cualquier otra llave:" size={36} o={dim(t, b3only)} />
        <Label x={300} y={1055} text="no sabe" size={40} color={K.warn} o={ramp(t, b3only + 0.3, b3only + 0.6)} />
      </Scene>

      {/* 4 · primero: señal de baja frecuencia, corta */}
      <Scene {...sc(4)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <CarSide cx={540} cy={760} s={0.95} t={t} antennas={dim(t, b4wave)} handleHi={ramp(t, Wd(4, "manilla"), Wd(4, "manilla") + 0.3)} />
          <path d="M 181 618 A 330 330 0 0 0 841 618" fill={K.cold} opacity={0.08 * ramp(t, b4reach, b4reach + 0.4)} />
          <path d="M 181 618 A 330 330 0 0 0 841 618" fill="none" stroke={K.cold} strokeWidth={5} strokeDasharray="16 12" opacity={0.25 + 0.75 * ramp(t, b4reach, b4reach + 0.4)} />
          <Waves x={511} y={618} t={t} reach={300} color={K.cold} ang={90} spread={80} speed={0.5} n={4} o={dim(t, b4wave)} />
          <SmartKey cx={330} cy={860} s={0.26} t={t} led={t > b4wave + 0.5 ? 1 : 0} />
          <SmartKey cx={850} cy={1030} s={0.26} t={t} o={0.55} />
          <Cross x={850} y={1030} s={0.6} o={ramp(t, b4reach + 0.4, b4reach + 0.7)} />
        </svg>
        {chip(4, "PRIMERO · EL COCHE LLAMA")}
        <Label x={540} y={430} text="baja frecuencia · ≈125 kHz" size={44} color={K.cold} box o={dim(t, Wd(4, "debil"))} />
        <Label x={540} y={1110} text="alcance: uno o dos metros" size={42} color={K.cold} o={ramp(t, Wd(4, "metros"), Wd(4, "metros") + 0.3)} />
      </Scene>

      {/* 5 · segundo: la llave oye, despierta y calcula */}
      <Scene {...sc(5)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <g transform={`translate(0 ${bob(0.5)})`}>
            <SmartKey cx={393} cy={740} s={1.2} open={1} t={t} coilGlow={ramp(t, b5hear, b5hear + 0.3)} chipGlow={ramp(t, b5wake, b5wake + 0.3)} />
          </g>
          <Waves x={960} y={420} t={t} reach={200} color={K.cold} ang={150} spread={30} speed={0.6} o={dim(t, A(5) + 0.2) * (1 - ramp(t, b5key + 0.4, b5key + 0.7))} />
          <Zzz x={600} y={560} t={t} o={1 - ramp(t, b5wake, b5wake + 0.3)} />
          <Tag x={540} y={1080} text={b5code} color={t > b5key + 0.4 ? K.flow : K.white} size={54} w={340} o={dim(t, b5calc)} />
        </svg>
        {chip(5, "SEGUNDO · LA LLAVE DESPIERTA")}
        <Label x={830} y={820} text="antena: oye" size={36} color={K.cold} box o={dim(t, b5hear)} />
        <Label x={830} y={640} text="chip: despierta" size={36} color={K.flow} box o={ramp(t, b5wake, b5wake + 0.3)} />
        <Label x={540} y={990} text="clave secreta" size={38} color={K.flow} o={ramp(t, b5key, b5key + 0.3)} />
      </Scene>

      {/* 6 · contesta por radio de más alcance → abre */}
      <Scene {...sc(6)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <CarSide cx={610} cy={730} s={0.85} t={t} blink={ramp(t, b6open, b6open + 0.1) * (t < b6open + 1.3 ? 1 : 0)} />
          <g transform={`translate(0 ${bob(0.5)})`}><SmartKey cx={180} cy={980} s={0.36} t={t} led={1} antGlow={1} /></g>
          <Waves x={250} y={900} t={t} reach={420} color={K.flow} ang={-45} spread={30} speed={1.6} o={dim(t, A(6) + 0.2)} />
          <Padlock x={640} y={640} s={0.65} open={ramp(t, b6open, b6open + 0.4)} color={t > b6ok ? K.flow : C.case3} />
        </svg>
        {chip(6, "SEGUNDO · LA RESPUESTA")}
        <Label x={560} y={420} text="radio UHF · 433 MHz" size={44} color={K.flow} box o={dim(t, b6radio)} />
        <Label x={540} y={1110} text="llega mucho más lejos" size={40} o={ramp(t, Wd(6, "alcance"), Wd(6, "alcance") + 0.3)} />
        <Stamp x={700} y={960} text="¡ABIERTO!" color={K.flow} p={ramp(t, b6open, b6open + 0.3)} />
      </Scene>

      {/* 7 · tercero: antenas interiores, ¿está dentro? */}
      <Scene {...sc(7)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <CarTop cx={540} cy={730} s={0.95} t={t} zone={dim(t, b7zone)} antennas={dim(t, Wd(7, "antenas"))} start={t > Wd(7, "va") ? 1 : 0} />
          <SmartKey cx={b7kx} cy={b7ky} s={0.24} t={t} led={b7in > 0.99 ? 1 : 0} />
          <SmartKey cx={860} cy={990} s={0.22} t={t} o={0.5 * ramp(t, b7no, b7no + 0.3)} />
          <Cross x={860} y={990} s={0.55} o={ramp(t, b7no + 0.2, b7no + 0.5)} />
        </svg>
        {chip(7, "TERCERO · ¿ESTÁ DENTRO?")}
        <Label x={190} y={560} text="antenas" size={40} color={K.cold} o={dim(t, Wd(7, "antenas"))} />
        <Label x={190} y={760} text="dentro: OK" size={40} color={K.cold} box o={ramp(t, Wd(7, "va"), Wd(7, "va") + 0.3)} />
        <Label x={540} y={1120} text="fuera: no arranca" size={42} color={K.warn} box o={ramp(t, Wd(7, "arranca"), Wd(7, "arranca") + 0.3)} />
      </Scene>

      {/* 8 · cuarto: pila de botón; la llave casi siempre duerme */}
      <Scene {...sc(8)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <g transform={`translate(0 ${bob(0.6)})`}><CoinCell x={360} y={700} r={170} /></g>
          <SmartKey cx={790} cy={680} s={0.42} t={t} led={Math.sin(t * 1.6) > 0.96 ? 1 : 0} />
          <Zzz x={850} y={560} t={t} o={dim(t, b8sleep)} />
          {/* línea de tiempo: dormida casi siempre, despierta a ratitos */}
          <rect x={120} y={975} width={800} height={50} rx={14} fill={C.case1} opacity={0.4 + 0.6 * ramp(t, b8sleep, b8sleep + 0.3)} />
          {Array.from({ length: 9 }).map((_, i) => (
            <rect key={i} x={150 + i * 88} y={975} width={10} height={50} fill={K.flow} opacity={0.3 + 0.7 * ramp(t, b8sleep, b8sleep + 0.3)} />
          ))}
          <rect x={120 + ((t * 120) % 800)} y={960} width={6} height={80} fill={K.white} opacity={0.6} />
        </svg>
        {chip(8, "CUARTO · LA PILA")}
        <Label x={360} y={460} text="pila de botón" size={46} color={K.flow} box o={dim(t, Wd(8, "pila"))} />
        <Label x={790} y={880} text="dura años" size={42} color={K.cold} o={ramp(t, Wd(8, "años"), Wd(8, "años") + 0.3)} />
        <Label x={520} y={1090} text="casi siempre dormida" size={40} color={K.white} o={ramp(t, b8sleep, b8sleep + 0.3)} />
      </Scene>

      {/* 9 · truco: pila agotada → acerca la llave al botón */}
      <Scene {...sc(9)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <CoinCell x={200} y={520} r={70} level={0.1} />
          <Cross x={200} y={520} s={0.9} o={ramp(t, Wd(9, "agotada"), Wd(9, "agotada") + 0.3)} />
          <StartButton x={680} y={760} s={1.05} lit={ramp(t, b9go, b9go + 0.2)} />
          <Waves x={680} y={770} t={t} reach={170} color={K.cold} ang={180} spread={45} speed={0.7} o={ramp(t, Wd(9, "arranque"), Wd(9, "arranque") + 0.4)} />
          <SmartKey cx={b9kx} cy={b9ky} s={0.5} rot={-12 * b9near} t={t} cellLevel={0.1} chipGlow={ramp(t, b9chip, b9chip + 0.3)} />
        </svg>
        {chip(9, "TRUCO · PILA AGOTADA", K.cold)}
        <Label x={200} y={640} text="pila agotada" size={36} color={K.warn} o={dim(t, Wd(9, "pila"))} />
        <Label x={360} y={1000} text="chip sin pila" size={40} color={K.flow} box o={ramp(t, b9chip, b9chip + 0.3)} />
        <Label x={720} y={1110} text="¡arranca!" size={46} color={K.flow} box o={ramp(t, b9go + 0.1, b9go + 0.4)} />
      </Scene>

      {/* 10 · la llave de metal escondida */}
      <Scene {...sc(10)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <SmartKey cx={320} cy={560} s={0.9} t={t} blade={b10blade} />
          {/* puerta: ventanilla, manilla y bombín */}
          <path d="M 600 450 H 930 V 1000 H 600 Z" fill={K.hot} stroke={C.dark} strokeWidth={6} />
          <path d="M 620 470 H 910 V 640 H 620 Z" fill={C.dark} opacity={0.75} />
          <rect x={700} y={720} width={130} height={30} rx={15} fill={C.case1} stroke={ramp(t, Wd(10, "abrir"), Wd(10, "abrir") + 0.3) > 0.5 ? K.flow : C.dark} strokeWidth={5} />
          <g transform="translate(660 735)" style={{ filter: `drop-shadow(0 0 ${12 * ramp(t, Wd(10, "metal"), Wd(10, "metal") + 0.3)}px ${K.flow})` }}>
            <circle r={26} fill={C.metal} stroke={C.dark} strokeWidth={4} />
            <rect x={-4} y={-14} width={8} height={28} rx={3} fill={C.dark} />
          </g>
          <path d={`M 360 ${900} Q 520 900 630 760`} fill="none" stroke={K.flow} strokeWidth={6} strokeDasharray="14 12" strokeDashoffset={-t * 60}
            opacity={ramp(t, Wd(10, "metal") + 0.2, Wd(10, "metal") + 0.5)} />
        </svg>
        {chip(10, "TRUCO · LA LLAVE DE METAL", K.cold)}
        <Label x={540} y={1110} text="llave de metal escondida" size={44} color={K.flow} box o={dim(t, Wd(10, "escondida"))} />
      </Scene>

      {/* 11 · curiosidad: robo por relé (explicado en general) */}
      <Scene {...sc(11)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <House x={70} y={560} w={330} h={300} />
          <SmartKey cx={150} cy={790} s={0.27} t={t} led={t > b11relay + 0.6 ? 1 : 0} />
          <Relay x={500} y={720} s={0.7} t={t} on={ramp(t, b11relay, b11relay + 0.3)} />
          <Relay x={460} y={1020} s={0.7} t={t} on={ramp(t, b11relay, b11relay + 0.3)} />
          <path d="M 500 770 Q 560 880 470 975" fill="none" stroke={K.warn} strokeWidth={7} strokeDasharray="16 12" strokeDashoffset={-t * 90}
            opacity={0.3 + 0.7 * ramp(t, b11relay, b11relay + 0.3)} />
          <Waves x={450} y={730} t={t} reach={230} color={K.warn} ang={180} spread={30} speed={0.8} o={ramp(t, b11relay + 0.3, b11relay + 0.6)} />
          <CarSide cx={730} cy={1030} s={0.44} t={t} blink={ramp(t, b11car + 0.4, b11car + 0.5)} />
          <SmartKey cx={760} cy={830} s={0.2} t={t} o={0.6 * ramp(t, b11car, b11car + 0.4)} />
          <Bubble x={860} y={780} text="?" color={K.warn} size={40} o={ramp(t, b11car, b11car + 0.3)} />
        </svg>
        {chip(11, "CURIOSIDAD · ROBO POR RELÉ", K.cold)}
        <Label x={760} y={540} text="ataque de relé" size={44} color={K.warn} box o={dim(t, Wd(11, "ladrones"))} />
        <Label x={235} y={940} text="la llave, en casa" size={34} o={dim(t, A(11) + 0.3)} />
        <Label x={520} y={1120} text="el coche cree que está cerca" size={40} color={K.warn} o={ramp(t, b11car + 0.2, b11car + 0.5)} />
      </Scene>

      {/* 12 · truco: funda que bloquea / desactivar keyless */}
      <Scene {...sc(12)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <SmartKey cx={280} cy={730} s={0.55} t={t} />
          <Pouch x={280} y={730} w={240} h={360} cover={b12cover} />
          <Waves x={780} y={660} t={t} reach={270} color={K.warn} ang={180} spread={28} speed={0.7} o={dim(t, A(12) + 0.2) * (1 - ramp(t, b12off, b12off + 0.3))} />
          <Cross x={470} y={660} s={0.9} o={ramp(t, b12block, b12block + 0.3) * (1 - ramp(t, b12off, b12off + 0.3))} />
          <Toggle x={740} y={960} label="KEYLESS" on={1 - ramp(t, b12off, b12off + 0.3)} o={dim(t, b12off - 0.2)} />
        </svg>
        {chip(12, "TRUCO · PROTÉGELA", K.cold)}
        <Label x={540} y={440} text="funda que bloquea la señal" size={42} color={K.cold} box o={dim(t, Wd(12, "funda"))} />
        <Label x={600} y={1110} text="si tu coche lo permite" size={38} o={ramp(t, Wd(12, "permite"), Wd(12, "permite") + 0.3)} />
      </Scene>

      {/* 13 · resumen */}
      <Scene {...sc(13)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <CarSide cx={320} cy={800} s={0.55} t={t} blink={ramp(t, b13n, b13n + 0.1)} />
          <g transform={`translate(0 ${bob(0.6)})`}><SmartKey cx={820} cy={760} s={0.45} t={t} led={t > b13a ? 1 : 0} /></g>
          <Bubble x={320} y={540} text="?" color={K.cold} size={64} o={dim(t, b13q)} />
          <Waves x={500} y={660} t={t} reach={200} color={K.cold} ang={0} spread={30} speed={0.6} o={ramp(t, b13q, b13q + 0.3) * (1 - ramp(t, b13a, b13a + 0.3))} />
          <Bubble x={820} y={520} text="OK" color={K.flow} size={56} o={dim(t, b13a)} />
          <Waves x={720} y={720} t={t} reach={200} color={K.flow} ang={180} spread={30} speed={1.6} o={ramp(t, b13a, b13a + 0.3)} />
        </svg>
        {chip(13, "RESUMEN")}
        <Stamp x={540} y={1060} text="SIN PULSAR NADA" color={K.flow} p={ramp(t, b13n, b13n + 0.3)} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
