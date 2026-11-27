// Episodio 170 · Cómo sabe el cajero automático cuántos billetes darte (y que no van pegados).
// Tarjeta (chip + PIN + autorización por la red), cajetines, ruedas de goma, sensor de grosor/luz, rechazo, apilado y boca; retirada si no lo coges.
// Cajero, tarjeta y banco genéricos: sin marcas. Nada de seguridad del cajero: solo el recorrido del billete.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Atm, Card, Keypad, Bank, Net, Cassette, Wheel, Edge, Note, Sensor, ThickBar, RejectBin, Gate, Stacker, Belt, Check, Cross, Timer, Person, OldAtm, C } from "./Cajero";

export const COMP_ID = "Cajero";
export const HOOK = "El cajero mide cada billete"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

/** Atenuado al principio (0,3) y pleno desde la palabra w. */
const dim = (t: number, w: number) => 0.3 + 0.7 * ramp(t, w, w + 0.3);
const on = (t: number, w: number, d = 0.3) => ramp(t, w, w + d);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(scene(i)[0], i === 1 ? 1.8 : 0), scene(i)[1])} />;
  const A = (i: number) => scene(i)[0];
  const Z = (i: number) => scene(i)[1];

  // ---------- 1 ----------
  const b1open = ramp(t, Wd(1, "secreto"), Wd(1, "secreto") + 0.6);
  const b1mide = on(t, Wd(1, "mide"));
  const b1p = (t * 0.45) % 1; // billete cruzando el sensor del interior
  // ---------- 2 ----------
  const b2dbl = t >= Wd(2, "dos") - 0.5;
  const b2p = ramp(t, b2dbl ? Wd(2, "dos") - 0.5 : A(2) + 0.2, b2dbl ? Z(2) - 0.2 : Wd(2, "dos") - 0.55);
  const b2x = lerp(150, 930, b2p);
  const b2under = Math.abs(b2x - 540) < 120;
  const b2val = b2under ? (b2dbl ? 2 : 1) : 0;
  // ---------- 3 ----------
  const b3notes = [0, 1, 2, 3, 4].map((k) => {
    const st = A(3) + 0.3 + k * ((Z(3) - A(3) - 1.2) / 5);
    const p = ramp(t, st, st + 1.4);
    const bad = k === 3;
    return { k, p, bad };
  });
  // ---------- 4 ----------
  const b4chip = Wd(4, "chip"), b4pin = Wd(4, "tecleas"), b4net = Wd(4, "pregunta");
  const b4n = Math.min(4, Math.max(0, Math.floor((t - b4pin) / 0.22) + 1));
  // ---------- 5 ----------
  const b5ok = Wd(5, "visto");
  // ---------- 7 ----------
  const b7cyc = 1.1;
  const b7ph = ((t - A(7)) / b7cyc) % 1;
  const b7cnt = Math.max(0, Math.floor((t - A(7)) / b7cyc));
  // ---------- 8 ----------
  const b8luz = Wd(8, "luz"), b8cuenta = Wd(8, "cuenta");
  const b8ph = ((t - A(8)) / 1.2) % 1;
  const b8n = Math.max(0, Math.floor((t - A(8) - 0.6) / 1.2) + 1);
  // ---------- 9 ----------
  const b9g = Wd(9, "compuerta"), b9des = Wd(9, "desvía");
  const b9p = ramp(t, A(9) + 0.2, b9g);
  const b9gate = ramp(t, b9g, b9g + 0.35);
  const b9fall = ramp(t, b9des, b9des + 0.8);
  // ---------- 10 ----------
  const b10ap = Wd(10, "apila"), b10co = Wd(10, "correas"), b10ra = Wd(10, "ranura");
  const b10stack = Math.min(5, Math.max(0, Math.floor((t - A(10)) / 0.45)));
  const b10move = ramp(t, b10co, b10ra + 0.4);
  // ---------- 11 ----------
  const b11tar = Wd(11, "tardas"), b11tra = Wd(11, "tragar");
  const b11timer = ramp(t, b11tar, b11tra);
  const b11back = ramp(t, b11tra, b11tra + 0.6);
  // ---------- 12 ----------
  const b12lon = Wd(12, "Londres"), b12mad = Wd(12, "Madrid");
  // ---------- 13 ----------
  const b13six = Wd(13, "seis"), b13four = Wd(13, "cuatro"), b13mujer = Wd(13, "mujer");

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el cajero GRANDE; «secreto» → el frontal se parte y se ve el sensor midiendo un billete */}
      <Scene {...sc(1)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Atm x={540} y={740} s={0.95} t={t} open={b1open} screenText={b1open < 0.05 ? "HOLA" : ""}>
            <Cassette x={0} y={250} w={300} h={160} val="20" level={0.6} />
            <Wheel x={0} y={140} r={42} ang={t * 260} />
            <Edge x={0} y={lerp(80, -260, b1p)} w={200} th={12} rot={90} />
            <Sensor x={0} y={-90} t={t} beam={b1mide} gapY={90} />
            <g transform="translate(0 -300)"><ThickBar x={0} y={0} w={300} val={Math.abs(lerp(80, -260, b1p) + 90) < 100 ? 1 : 0.1} o={dim(t, Wd(1, "mide"))} /></g>
          </Atm>
        </svg>
        {chip(1, "EL SECRETO DEL CAJERO")}
        <Label x={540} y={1128} text="mide el grosor" size={46} color={K.flow} box o={on(t, Wd(1, "grosor"))} />
      </Scene>

      {/* 2 · dentro: el sensor nota si va solo o van dos pegados */}
      <Scene {...sc(2)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={90} y={700} width={900} height={20} rx={10} fill={C.case1} />
          <Edge x={b2x} y={b2dbl ? 676 : 684} w={280} th={b2dbl ? 30 : 15} color={b2dbl ? "#D7C7A8" : C.paper} />
          {b2dbl && <line x1={b2x - 140} y1={676} x2={b2x + 140} y2={676} stroke={C.dark} strokeWidth={2} />}
          <Sensor x={540} y={680} t={t} beam={1} warn={b2under && b2dbl ? 1 : 0} gapY={150} />
          <ThickBar x={540} y={920} w={460} val={b2val} />
          <Check x={540} y={1020} o={b2under && !b2dbl ? 1 : 0} />
          <Cross x={540} y={1020} o={b2under && b2dbl ? 1 : 0} />
        </svg>
        {chip(2, "DENTRO DEL CAJERO")}
        <Label x={540} y={440} text="sensor" size={42} color={K.flow} box o={dim(t, Wd(2, "sensor"))} />
        <Label x={250} y={1100} text="va solo" size={42} color={K.cold} box o={dim(t, Wd(2, "solo"))} />
        <Label x={750} y={1100} text="dos pegados" size={42} color={K.warn} box o={dim(t, Wd(2, "pegados"))} />
      </Scene>

      {/* 3 · idea clave: billete a billete; el dudoso se queda dentro */}
      <Scene {...sc(3)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={430} y={540} width={220} height={400} rx={24} fill="none" stroke={K.flow} strokeWidth={6} strokeDasharray="18 14" opacity={0.8} />
          <RejectBin x={540} y={1000} w={240} h={110} fill={b3notes[3].p > 0.6 ? 1 : 0} glow={on(t, Wd(3, "dudoso"))} o={dim(t, Wd(3, "dudoso"))} />
          {b3notes.map(({ k, p, bad }) => {
            if (p <= 0 || p >= 1) return null;
            const x = bad && p > 0.5 ? 540 : lerp(150, 930, p);
            const y = bad && p > 0.5 ? lerp(740, 990, (p - 0.5) * 2) : 740;
            return <Note key={k} x={x} y={y} w={200} h={100} val="20" warn={bad && p > 0.45 ? 1 : 0} rot={bad && p > 0.5 ? 70 * (p - 0.5) : 0} />;
          })}
          {b3notes.map(({ k, p, bad }) => <React.Fragment key={k}>{!bad && <Check x={540} y={600} s={0.7} o={p > 0.45 && p < 0.65 ? 1 : 0} />}{bad && <Cross x={540} y={600} s={0.7} o={p > 0.45 && p < 0.7 ? 1 : 0} />}</React.Fragment>)}
        </svg>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={540} y={450} text="billete a billete" size={44} color={K.flow} box o={dim(t, Wd(3, "revisa"))} />
        <Label x={820} y={880} text="a ti" size={40} color={C.go} o={dim(t, Wd(3, "revisa"))} />
        <Label x={540} y={1118} text="se queda dentro" size={40} color={K.warn} box o={dim(t, Wd(3, "dudoso"))} />
      </Scene>

      {/* 4 · primero: la tarjeta. Chip, PIN y pregunta a tu banco por la red */}
      <Scene {...sc(4)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Card x={540} y={560} s={1.15} rot={-4 + 2 * Math.sin(t * 1.5)} chip={on(t, b4chip)} />
          <Keypad x={260} y={900} s={0.62} n={t >= b4pin ? b4n : 0} press={t >= b4pin && b4n < 4 ? [0, 4, 8, 10][b4n] : -1} o={dim(t, b4pin)} />
          <Net x1={380} y1={880} x2={690} y2={880} t={t} o={dim(t, b4net)} go={on(t, b4net)} />
          <Bank x={810} y={880} s={0.7} o={dim(t, Wd(4, "banco"))} />
        </svg>
        {chip(4, "PRIMERO · LA TARJETA")}
        <Label x={300} y={700} text="chip" size={40} color={K.flow} box o={dim(t, b4chip)} />
        <Label x={260} y={1110} text="tu PIN" size={40} color={K.flow} box o={dim(t, b4pin)} />
        <Label x={810} y={1030} text="tu banco" size={40} color={K.cold} box o={dim(t, Wd(4, "banco"))} />
        <Label x={540} y={810} text="por la red" size={34} color={K.cold} o={on(t, Wd(4, "red"))} />
      </Scene>

      {/* 5 · espera la respuesta: visto bueno */}
      <Scene {...sc(5)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Atm x={330} y={760} s={0.62} t={t} spin={1 - on(t, b5ok)} screenText={t >= b5ok ? "OK" : ""} screenColor={C.go} />
          <Net x1={540} y1={700} x2={700} y2={700} t={t} o={1} go={1 - on(t, b5ok)} back={on(t, b5ok)} />
          <Bank x={830} y={720} s={0.62} glow={on(t, b5ok)} />
          <Check x={830} y={940} s={1.2} o={on(t, b5ok)} />
        </svg>
        {chip(5, "ESPERANDO RESPUESTA")}
        <Label x={540} y={460} text="esperando…" size={42} color={K.cold} box o={span(t, A(5) + 0.1, b5ok)} />
        <Label x={540} y={460} text="visto bueno" size={46} color={C.go} box o={on(t, b5ok + 0.05)} />
      </Scene>

      {/* 6 · segundo: cajetines, cada uno de un valor */}
      <Scene {...sc(6)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={110} y={520} width={860} height={560} rx={30} fill="#0A1A30" stroke={C.case2} strokeWidth={8} />
          <Cassette x={290} y={830} w={230} h={330} val="10" tint="#E8B4A0" level={0.85} hi={on(t, Wd(6, "cada")) * (Math.sin(t * 4) > 0.3 ? 1 : 0.3)} o={dim(t, Wd(6, "cajas"))} />
          <Cassette x={540} y={830} w={230} h={330} val="20" tint="#9FC8E8" level={0.75} hi={on(t, Wd(6, "cada")) * (Math.sin(t * 4 - 2) > 0.3 ? 1 : 0.3)} o={dim(t, Wd(6, "cajas"))} />
          <Cassette x={790} y={830} w={230} h={330} val="50" tint="#F0C987" level={0.65} hi={on(t, Wd(6, "cada")) * (Math.sin(t * 4 - 4) > 0.3 ? 1 : 0.3)} o={dim(t, Wd(6, "cajas"))} />
        </svg>
        {chip(6, "SEGUNDO · LOS CAJETINES")}
        <Label x={540} y={450} text="un valor por caja" size={44} color={K.flow} box o={dim(t, Wd(6, "valor"))} />
      </Scene>

      {/* 7 · ruedas de goma sacan los billetes de uno en uno */}
      <Scene {...sc(7)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Cassette x={420} y={870} w={460} h={340} val="20" tint="#9FC8E8" level={0.9} />
          <Wheel x={420} y={640} r={78} ang={t * 220} glow={on(t, Wd(7, "ruedas"))} />
          <Wheel x={720} y={620} r={46} ang={-t * 300} o={dim(t, Wd(7, "arrastran"))} />
          {t >= A(7) && <Edge x={lerp(420, 980, b7ph)} y={lerp(700, 640, Math.min(1, b7ph * 2))} w={380} th={12} color="#9FC8E8" o={b7ph < 0.92 ? 1 : 0} />}
        </svg>
        {chip(7, "RUEDAS DE GOMA")}
        <Label x={420} y={460} text="rozan el montón" size={40} color={K.flow} box o={dim(t, Wd(7, "rozan"))} />
        <Label x={600} y={1110} text={`de uno en uno · ${b7cnt}`} size={40} color={K.cold} box o={dim(t, Wd(7, "uno"))} />
      </Scene>

      {/* 8 · tercero: el sensor mide grosor o luz y cuenta */}
      <Scene {...sc(8)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Wheel x={540} y={583} r={52} ang={t * 260} />
          <Wheel x={540} y={717} r={52} ang={-t * 260} />
          <Edge x={lerp(120, 960, b8ph)} y={650} w={300} th={14} />
          <Sensor x={540} y={650} t={t} beam={on(t, b8luz)} gapY={0} o={0} />
          {/* haz de luz a la derecha de los rodillos */}
          <g opacity={dim(t, b8luz)}>
            <rect x={740} y={520} width={100} height={46} rx={10} fill={C.case2} stroke={C.case3} strokeWidth={4} />
            <rect x={740} y={734} width={100} height={46} rx={10} fill={C.case2} stroke={C.case3} strokeWidth={4} />
            <rect x={772} y={566} width={36} height={168} fill={K.flow} opacity={on(t, b8luz) * (0.35 + 0.15 * Math.sin(t * 10))} style={{ filter: `drop-shadow(0 0 14px ${K.flow})` }} />
          </g>
          <ThickBar x={540} y={900} w={460} val={Math.abs(lerp(120, 960, b8ph) - 540) < 170 ? 1 : 0.1} o={dim(t, Wd(8, "grosor"))} />
        </svg>
        {chip(8, "TERCERO · EL SENSOR")}
        <Label x={300} y={470} text="grosor" size={42} color={K.cold} box o={dim(t, Wd(8, "grosor"))} />
        <Label x={790} y={470} text="luz" size={42} color={K.flow} box o={dim(t, b8luz)} />
        <Label x={540} y={1060} text={`cuenta: ${t >= b8cuenta ? b8n : "…"}`} size={50} color={K.flow} box o={dim(t, b8cuenta)} />
      </Scene>

      {/* 9 · dos pegados abultan el doble: la compuerta los desvía al rechazo */}
      <Scene {...sc(9)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={560} y={636} width={420} height={16} rx={8} fill={C.case1} />
          <Sensor x={300} y={620} t={t} beam={1} warn={b9p > 0.3 ? 1 : 0} gapY={110} />
          <Gate x={520} y={636} ang={50 * b9gate} warn={b9gate} />
          <RejectBin x={620} y={1010} w={260} h={160} fill={b9fall > 0.9 ? 0.5 : 0.2} glow={on(t, Wd(9, "rechazo"))} o={dim(t, Wd(9, "cajetín"))} />
          {b9fall < 1 && (
            <g transform={b9fall > 0 ? `translate(${lerp(540, 620, b9fall)} ${lerp(620, 960, b9fall)}) rotate(${60 * b9fall})` : `translate(${lerp(110, 470, b9p)} 620)`}>
              <rect x={-130} y={-17} width={260} height={16} rx={3} fill={C.paper} stroke={C.dark} strokeWidth={2} />
              <rect x={-126} y={-1} width={260} height={16} rx={3} fill="#D7C7A8" stroke={C.dark} strokeWidth={2} />
            </g>
          )}
          <ThickBar x={300} y={830} w={360} val={b9p > 0.3 ? 2 : 0.1} />
        </svg>
        {chip(9, "DOS PEGADOS", K.warn)}
        <Label x={300} y={990} text="¡el doble!" size={44} color={K.warn} box o={dim(t, Wd(9, "doble"))} />
        <Label x={780} y={560} text="compuerta" size={38} color={K.white} o={dim(t, b9g)} />
        <Label x={620} y={1125} text="cajetín de rechazo" size={38} color={K.warn} box o={dim(t, Wd(9, "cajetín"))} />
      </Scene>

      {/* 10 · cuarto: rueda apiladora y correas hasta la ranura */}
      <Scene {...sc(10)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Stacker x={280} y={640} r={130} ang={t * 140} o={dim(t, b10ap)} />
          <Belt x1={300} y1={900} x2={760} y2={560} t={t} o={dim(t, b10co)} speed={t > b10co ? 1 : 0.2} />
          <rect x={800} y={420} width={60} height={240} rx={14} fill={C.case1} stroke={C.case3} strokeWidth={5} />
          <rect x={812} y={480} width={36} height={120} rx={8} fill={C.dark} />
          <g transform={`translate(${lerp(300, 790, b10move)} ${lerp(860, 520, b10move)}) rotate(${-36 * Math.min(1, b10move * 4) * (b10move < 0.97 ? 1 : 0)})`}>
            {Array.from({ length: b10stack }).map((_, k) => (
              <rect key={k} x={-120} y={-14 - k * 11} width={240} height={10} rx={2} fill={k % 2 ? C.paperHi : C.paper} stroke={C.dark} strokeWidth={1.5} />
            ))}
          </g>
        </svg>
        {chip(10, "CUARTO · LA BOCA")}
        <Label x={280} y={450} text="apila" size={42} color={K.flow} box o={dim(t, b10ap)} />
        <Label x={740} y={800} text="correas" size={42} color={K.cold} box o={dim(t, b10co)} />
        <Label x={830} y={720} text="ranura" size={38} color={K.flow} box o={dim(t, b10ra)} />
      </Scene>

      {/* 11 · si tardas en cogerlo, se lo vuelve a tragar */}
      <Scene {...sc(11)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Atm x={540} y={720} s={0.9} t={t} cash={1 - b11back} screenText={t >= b11tra ? "RETIRADO" : "COJA SU DINERO"} screenColor={t >= b11tra ? K.warn : K.cold} />
          <Timer x={210} y={520} r={60} p={b11timer} o={dim(t, b11tar)} />
        </svg>
        {chip(11, "SI NO LO COGES")}
        <Label x={540} y={1110} text="¡se lo traga!" size={46} color={K.warn} box o={on(t, b11tra)} />
      </Scene>

      {/* 12 · curiosidad: Londres 1967, Madrid 1969 */}
      <Scene {...sc(12)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <OldAtm x={540} y={700} s={0.95} t={t} drawer={on(t, Wd(12, "estrenó"), 0.6)} />
        </svg>
        {chip(12, "CURIOSIDAD", K.cold)}
        <Stamp x={330} y={990} text="LONDRES 1967" color={K.flow} size={44} p={on(t, b12lon)} rot={-6} />
        <Stamp x={690} y={1080} text="MADRID 1969" color={K.cold} size={44} p={on(t, b12mad)} rot={5} />
        <Label x={540} y={450} text="el primer cajero" size={42} color={K.white} box o={dim(t, Wd(12, "primer"))} />
      </Scene>

      {/* 13 · otra: PIN de seis cifras → cuatro */}
      <Scene {...sc(13)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {Array.from({ length: 6 }).map((_, k) => {
            const cut = k >= 4 ? on(t, b13four) : 0;
            const x = 165 + k * 150;
            return (
              <g key={k} opacity={dim(t, b13six) * (1 - 0.55 * cut)}>
                <rect x={x - 60} y={560} width={120} height={150} rx={18} fill="rgba(6,16,31,0.85)" stroke={k < 4 && t >= b13four ? K.flow : C.case3} strokeWidth={6} />
                <text x={x} y={670} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={90} fill={K.white}>*</text>
                <Cross x={x} y={635} s={0.9} o={cut} />
              </g>
            );
          })}
          <Person x={540} y={990} s={0.75} o={dim(t, b13mujer)} />
          <g opacity={on(t, b13mujer)}>
            <circle cx={700} cy={860} r={14} fill={K.white} /><circle cx={740} cy={820} r={20} fill={K.white} />
            <ellipse cx={830} cy={760} rx={95} ry={60} fill={K.white} />
            <text x={830} y={785} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={66} fill={C.dark}>{t >= b13four ? "4" : "?"}</text>
          </g>
        </svg>
        {chip(13, "OTRA · EL PIN", K.cold)}
        <Label x={540} y={460} text={t >= b13four ? "cuatro cifras" : "seis cifras"} size={46} color={t >= b13four ? K.flow : K.white} box o={dim(t, b13six)} />
      </Scene>

      {/* 14 · resumen: pregunta a tu banco y mide cada billete */}
      <Scene {...sc(14)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Atm x={540} y={700} s={0.8} t={t} open={on(t, Wd(14, "mide"), 0.5)} screenText="OK" screenColor={C.go}>
            <Wheel x={0} y={140} r={42} ang={t * 260} />
            <Edge x={0} y={lerp(80, -260, (t * 0.45) % 1)} w={200} th={12} rot={90} />
            <Sensor x={0} y={-90} t={t} beam={1} gapY={90} />
          </Atm>
          <Check x={210} y={500} s={0.9} o={on(t, Wd(14, "banco"))} />
          <Check x={870} y={500} s={0.9} o={on(t, Wd(14, "billete"))} />
        </svg>
        {chip(14, "RESUMEN")}
        <Label x={540} y={1058} text="pregunta a tu banco" size={38} color={K.cold} box o={dim(t, Wd(14, "pregunta"))} />
        <Label x={540} y={1122} text="mide cada billete" size={38} color={K.flow} box o={dim(t, Wd(14, "mide"))} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
