// Episodio 156 · Cómo funciona un reloj de cuarzo (el de pila). 2D, plantilla de la serie.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en Reloj.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, FONT, ramp, span, smooth, useTiming } from "./kit2d/Kit";
import { Watch, Fork, ChipIC, Motor, Gear, Battery, Bolt, Ear, Thermo, Lab, Flow, C, wave, fmt, pulseAt, tickAngle } from "./Reloj";

export const COMP_ID = "RelojCuarzo";
export const HOOK = "Dentro vibra un cristal"; // = meta.portada (≤5 palabras, la última va en amarillo)
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

  // vibración visible del diapasón (en pantalla ~6 vaivenes/s; en la realidad 32.768)
  const vibK = (amp: number) => amp * Math.sin(t * 2 * Math.PI * 6);

  // beat 1: se abre en «dentro»; el cristal se enciende en «cristal»
  const op1 = R(1, "dentro", 0.7);
  // beat 2: contador de vibraciones
  const n2 = 32768 * smooth((t - Wd(2, "treinta")) / Math.max(0.3, Wd(2, "segundo") - Wd(2, "treinta")));
  // beat 4: voltaje → se dobla; se dobla → genera voltaje
  const v4a = span(t, Wd(4, "voltaje"), Wd(4, "doblarse") - 0.05, 0.25);
  const v4b = R(4, "doblarse", 0.3);
  const bend4 = 34 * Math.max(R(4, "dobla", 0.35) * (1 - R(4, "doblarse", 0.2)), v4b * (0.5 + 0.5 * Math.sin(t * 7)));
  // beat 5: empujoncito en cada vaivén (vaivén visual de 1,5 Hz para que se vea)
  const ph5 = t * 2 * Math.PI * 1.5;
  const kick5 = R(5, "empujoncito") * Math.max(0, Math.cos(ph5)) ** 8;
  // beat 6: cadena de 15 divisores; el pulso avanza de «divide» a «segundo»
  const p6 = clampN(15 * (t - Wd(6, "divide")) / Math.max(0.5, Wd(6, "segundo") - Wd(6, "divide")), 0, 15);
  const k6 = Math.floor(p6);
  // beat 8 / 9: pulsos de un segundo
  const pol8 = Math.floor(t) % 2 === 0 ? 1 : -1;
  const rot8 = 180 * (Math.floor(t) + smooth((t - Math.floor(t)) / 0.12));
  // beat 10: temperatura que sube y baja
  const temp10 = Math.sin((t - Wd(10, "temperatura")) * 3) * R(10, "temperatura", 0.3);
  // beat 13: resumen
  const resW = ["cristal", "chip", "motor"];
  const curR = resW.reduce((acc, w, k) => (t >= Wd(13, w) ? k : acc), -1);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el reloj GRANDE desde el fotograma 0; en «dentro» se levanta la esfera; en «cristal» se enciende la cápsula */}
      <Scene {...sc(1)}>
        <SVG>
          <Watch x={540} y={760} s={1} t={t} open={op1} glow={R(1, "cristal")} />
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={270} y={500} text="PILA" size={42} color={K.white} box o={span(t, Wd(1, "dentro") + 0.6, Wd(1, "cristal"))} />
        <Label x={540} y={1110} text="¡UN CRISTAL!" size={46} color={K.cold} box o={L(1, "cristal")} />
      </Scene>

      {/* 2 · la promesa: cuarzo con forma de diapasón que vibra 32.768 veces por segundo */}
      <Scene {...sc(2)}>
        <SVG>
          <Fork x={540} y={800} s={1.05} vib={vibK(10 * R(2, "vibra"))} glow={R(2, "vibra")} can={1 - R(2, "cuarzo", 0.6) * 0.6} />
          {R(2, "vibra") > 0.01 && [0, 1].map((k) => {
            const p = (t * 1.6 + k / 2) % 1;
            return (
              <g key={k} opacity={R(2, "vibra") * Math.sin(Math.PI * p)}>
                <path d={`M${400 - p * 90},${470} q-30,90 0,180`} fill="none" stroke={K.cold} strokeWidth={8} strokeLinecap="round" />
                <path d={`M${680 + p * 90},${470} q30,90 0,180`} fill="none" stroke={K.cold} strokeWidth={8} strokeLinecap="round" />
              </g>
            );
          })}
        </SVG>
        {chip(2, "EL CRISTAL", K.cold)}
        <Label x={210} y={760} text="CUARZO" size={42} color={K.cold} box o={L(2, "cuarzo")} />
        <Label x={850} y={760} text="DIAPASÓN" size={40} color={K.white} box o={L(2, "diapason")} />
        <Label x={540} y={1110} text={`${fmt(n2)} VECES/s`} size={56} color={K.flow} box o={L(2, "treinta")} />
      </Scene>

      {/* 3 · la idea clave: cristal = ritmo, chip = cuenta, motor = aguja */}
      <Scene {...sc(3)}>
        <SVG>
          <g opacity={dimTo(3, "cristal")}><Fork x={200} y={700} s={0.5} vib={vibK(6)} glow={R(3, "ritmo")} /></g>
          <g opacity={dimTo(3, "chip")}><ChipIC x={540} y={700} w={190} h={140} glow={R(3, "cuenta") * pulseAt(t * 3)} /></g>
          <g opacity={dimTo(3, "motor")}><Watch x={870} y={700} s={0.4} t={t} straps={false} /></g>
          <Flow d="M290,700 L420,700" t={t} color={K.cold} o={R(3, "chip")} w={8} />
          <Flow d="M660,700 L740,700" t={t} color={K.flow} o={R(3, "motor")} w={8} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={200} y={940} text="RITMO" size={42} color={K.flow} box o={L(3, "ritmo")} />
        <Label x={540} y={940} text="CUENTA" size={42} color={K.flow} box o={L(3, "cuenta")} />
        <Label x={850} y={940} text="AGUJA" size={42} color={K.flow} box o={L(3, "aguja")} />
      </Scene>

      {/* 4 · primero: piezoeléctrico. Voltaje → se dobla; al doblarse → voltaje */}
      <Scene {...sc(4)}>
        <SVG>
          <Fork x={540} y={800} s={1} bend={bend4} charges={v4b} />
          <g opacity={0.35 + 0.65 * v4a}>
            <Battery x={170} y={820} glow={v4a} />
            <Flow d="M220,820 L420,820 L480,950" t={t} color={K.flow} o={v4a} w={8} />
          </g>
          <Bolt x={170} y={640} o={v4a} />
          <g opacity={0.35 + 0.65 * v4b}>
            <Flow d="M600,950 L660,820 L860,820" t={t} color={K.flow} o={v4b} w={8} />
            <circle cx={880} cy={700} r={60} fill={v4b > 0.1 ? K.flow : "#33435c"} stroke={C.ink} strokeWidth={6} opacity={0.4 + 0.6 * v4b * (0.7 + 0.3 * Math.sin(t * 7))}
              style={v4b > 0.1 ? { filter: `drop-shadow(0 0 ${24 * v4b}px ${K.flow})` } : undefined} />
            <rect x={860} y={760} width={40} height={40} rx={6} fill={C.case3} stroke={C.ink} strokeWidth={4} />
            <line x1={880} y1={800} x2={880} y2={820} stroke={C.case3} strokeWidth={8} />
          </g>
        </SVG>
        {chip(4, "1 · PIEZOELÉCTRICO", K.hot)}
        <Label x={300} y={480} text="VOLTAJE → SE DOBLA" size={38} color={K.flow} box o={span(t, Wd(4, "voltaje"), Wd(4, "doblarse") - 0.05, 0.25)} />
        <Label x={680} y={1110} text="SE DOBLA → VOLTAJE" size={38} color={K.flow} box o={L(4, "doblarse")} />
      </Scene>

      {/* 5 · el circuito escucha la vibración y le da un empujoncito en cada vaivén: nunca se para */}
      <Scene {...sc(5)}>
        <SVG>
          <Fork x={540} y={660} s={0.7} vib={14 * Math.sin(ph5)} glow={kick5} />
          <path d="M500,820 L500,900 L330,900 L330,1050 L440,1050 M640,1050 L750,1050 L750,900 L580,900 L580,820" fill="none" stroke={C.case3} strokeWidth={10} strokeLinejoin="round" opacity={dimTo(5, "circuito")} />
          <Flow d="M500,820 L500,900 L330,900 L330,1050 L440,1050 M640,1050 L750,1050 L750,900 L580,900 L580,820" t={t} color={K.flow} o={R(5, "circuito") * 0.9} w={8} />
          <g opacity={dimTo(5, "circuito")}><ChipIC x={540} y={1050} w={200} h={110} glow={kick5} /></g>
          <Bolt x={430} y={540} s={1.1} o={kick5} />
          <Bolt x={650} y={540} s={1.1} o={kick5} />
          <path d={wave(120, 360, 520, 36 * (0.4 + 0.6 * R(5, "nunca")), -t * 8, 0.06)} fill="none" stroke={K.cold} strokeWidth={8} strokeLinecap="round" opacity={dimTo(5, "nunca")} />
        </SVG>
        {chip(5, "1 · NUNCA SE PARA", K.hot)}
        <Label x={790} y={540} text="EMPUJONCITO" size={38} color={K.flow} box o={L(5, "empujoncito")} />
        <Label x={240} y={640} text="SIEMPRE VIBRA" size={34} color={K.cold} box o={L(5, "nunca")} />
      </Scene>

      {/* 6 · segundo: el chip divide entre dos quince veces → 1 pulso por segundo */}
      <Scene {...sc(6)}>
        <SVG>
          <rect x={95} y={500} width={890} height={480} rx={30} fill="#111A26" stroke={C.case3} strokeWidth={6} opacity={0.9} />
          {Array.from({ length: 15 }).map((_, i) => {
            const r = Math.floor(i / 5), c = r % 2 === 0 ? i % 5 : 4 - (i % 5);
            const cx = 200 + c * 170, cy = 590 + r * 150;
            const done = p6 >= i + 1, cur = k6 === i && p6 < 15;
            return (
              <g key={i}>
                <rect x={cx - 66} y={cy - 46} width={132} height={92} rx={14} fill={done ? "#3A3210" : "#1C2A3E"} stroke={cur ? K.flow : done ? K.flow : C.case2} strokeWidth={cur ? 7 : 4}
                  style={cur ? { filter: `drop-shadow(0 0 14px ${K.flow})` } : undefined} />
                <text x={cx} y={cy + 16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={done || cur ? K.flow : C.case3}>÷2</text>
              </g>
            );
          })}
          {/* LED que parpadea una vez por segundo al final */}
          <circle cx={540} cy={1060} r={34} fill={p6 >= 15 ? K.flow : "#33435c"} stroke={C.ink} strokeWidth={5} opacity={p6 >= 15 ? 0.35 + 0.65 * pulseAt(t) : 1}
            style={p6 >= 15 ? { filter: `drop-shadow(0 0 ${20 * pulseAt(t)}px ${K.flow})` } : undefined} />
        </SVG>
        {chip(6, "2 · EL CHIP", K.cold)}
        <Label x={540} y={440} text={`${fmt(32768 / 2 ** Math.min(15, k6))} POR SEGUNDO`} size={46} color={K.flow} box o={L(6, "divide", Wd(6, "saca") + 0.1)} />
        <Label x={540} y={440} text="1 PULSO POR SEGUNDO" size={46} color={K.flow} box o={span(t, Wd(6, "saca") + 0.4, E(6))} />
      </Scene>

      {/* 7 · por eso ese número: dos elevado a quince, y tan agudo que no lo oyes */}
      <Scene {...sc(7)}>
        <div style={{ position: "absolute", top: 470, left: 60, width: 960, textAlign: "center", opacity: R(7, "dos"), fontFamily: FONT, fontWeight: 900, color: K.white,
          textShadow: "0 3px 0 #06101F" }}>
          <span style={{ fontSize: 130, color: K.flow }}>2</span>
          <span style={{ fontSize: 66, color: K.flow, verticalAlign: 62 }}>15</span>
          <span style={{ fontSize: 100 }}> = 32.768</span>
        </div>
        <SVG>
          {/* barra de lo que oye el oído humano (hasta ~20.000 Hz) */}
          <g opacity={dimTo(7, "agudo")}>
            <rect x={120} y={840} width={800} height={40} rx={20} fill="rgba(255,255,255,0.12)" />
            <rect x={120} y={840} width={800 * (20000 / 40000)} height={40} rx={20} fill={K.cold} opacity={0.85} />
            <Ear x={320} y={735} s={0.5} />
            <line x1={120 + 800 * (32768 / 40000)} y1={800} x2={120 + 800 * (32768 / 40000)} y2={920} stroke={K.flow} strokeWidth={10} strokeLinecap="round" />
            <circle cx={120 + 800 * (32768 / 40000)} cy={860} r={22} fill={K.flow} stroke={C.ink} strokeWidth={5} />
          </g>
          {R(7, "oyes") > 0.01 && (
            <g opacity={R(7, "oyes", 0.25)}>
            <path d={wave(600, 880, 730, 22, -t * 14, 0.09)} fill="none" stroke={K.flow} strokeWidth={8} strokeLinecap="round" />
            <path d="M480,700 l60,70 M540,700 l-60,70" stroke={K.warn} strokeWidth={14} strokeLinecap="round" />
            </g>
          )}
        </SVG>
        {chip(7, "2 · ¿POR QUÉ ESE NÚMERO?", K.cold)}
        <Label x={320} y={970} text="LO QUE OYES" size={36} color={K.cold} o={L(7, "agudo")} />
        <Label x={775} y={970} text="EL CRISTAL" size={36} color={K.flow} o={L(7, "agudo")} />
        <Label x={540} y={1110} text="NO LO OYES" size={46} color={K.flow} box o={L(7, "oyes")} />
      </Scene>

      {/* 8 · tercero: el motor. Cada pulso convierte la bobina en imán y hace girar el rotor (otro imán) */}
      <Scene {...sc(8)}>
        <SVG>
          <Motor x={540} y={600} s={1.25} pulse={pulseAt(t) * dimTo(8, "pulso")} rot={rot8} pol={pol8} />
          <Flow d="M120,1000 L240,1000" t={t} color={K.flow} o={pulseAt(t) * R(8, "pulso")} w={8} />
        </SVG>
        {chip(8, "3 · EL MOTOR")}
        <Label x={540} y={1100} text="BOBINA = IMÁN" size={42} color={K.flow} box o={L(8, "bobina")} />
        <Label x={540} y={450} text="OTRO IMÁN QUE GIRA" size={40} color={K.white} box o={L(8, "girar")} />
      </Scene>

      {/* 9 · cuarto: los engranajes mueven la aguja un tic; por eso salta y no se desliza */}
      <Scene {...sc(9)}>
        <SVG>
          <g opacity={dimTo(9, "engranajes")}>
            <Gear x={210} y={1010} r={70} n={14} rot={rot8 / 7} />
            <Gear x={325} y={930} r={48} n={10} rot={-rot8 / 5} color={C.silver} />
          </g>
          <Watch x={600} y={720} s={0.95} t={t} straps={false} ghost={R(9, "salta")} />
          {/* rastro de saltos: marcas de cada tic */}
          {R(9, "salta") > 0.01 && Array.from({ length: 5 }).map((_, k) => {
            const a = ((tickAngle(t) - 6 * (k + 1)) * Math.PI) / 180;
            return <circle key={k} cx={600 + 243 * Math.sin(a)} cy={720 - 243 * Math.cos(a)} r={9} fill={K.flow} opacity={R(9, "salta") * (1 - k * 0.18)} />;
          })}
        </SVG>
        {chip(9, "4 · LOS ENGRANAJES")}
        <Label x={250} y={1110} text="ENGRANAJES" size={38} color={C.gold} box o={L(9, "engranajes")} />
        <Stamp x={600} y={720} text="¡TIC!" color={K.flow} size={64} rot={-6} p={span(t, Wd(9, "tic"), Wd(9, "salta"), 0.15)} />
        <Label x={700} y={1110} text="SALTA, NO SE DESLIZA" size={36} color={K.flow} box o={L(9, "salta")} />
      </Scene>

      {/* 10 · la precisión: unos ±15 s al mes; la temperatura cambia el ritmo */}
      <Scene {...sc(10)}>
        <SVG>
          <Watch x={360} y={740} s={0.8} t={t} straps={false} sec={tickAngle(t) + 4 * temp10} />
          <Thermo x={830} y={700} lvl={0.5 + 0.35 * temp10} temp={temp10} o={dimTo(10, "temperatura")} />
        </SVG>
        {chip(10, "PRECISIÓN")}
        <Label x={540} y={460} text="± 15 s AL MES" size={58} color={K.flow} box o={L(10, "quince")} />
        <Label x={830} y={1040} text={temp10 >= 0 ? "CALOR" : "FRÍO"} size={38} color={temp10 >= 0 ? K.hot : K.cold} box o={L(10, "temperatura")} />
      </Scene>

      {/* 11 · curiosidad: el primer reloj de cuarzo, 1927, en un laboratorio de teléfonos */}
      <Scene {...sc(11)}>
        <SVG>
          <Lab x={420} y={760} t={t} on={dimTo(11, "construyo")} phone={dimTo(11, "telefonos")} />
        </SVG>
        {chip(11, "CURIOSIDAD")}
        <Stamp x={800} y={520} text="1927" color={K.flow} size={78} rot={6} p={R(11, "1927", 0.35)} />
        <Label x={540} y={1110} text="LABORATORIO DE TELÉFONOS" size={38} color={K.white} box o={L(11, "laboratorio")} />
      </Scene>

      {/* 12 · otra: el primer reloj de pulsera de cuarzo a la venta, 1969, vibraba cuatro veces más despacio */}
      <Scene {...sc(12)}>
        <SVG>
          <Watch x={250} y={740} s={0.62} t={t} />
          <g opacity={dimTo(12, "vibraba")}>
            <path d={wave(500, 920, 640, 40, -t * 6, 0.025)} fill="none" stroke={K.hot} strokeWidth={9} strokeLinecap="round" />
            <path d={wave(500, 920, 900, 40, -t * 6, 0.1)} fill="none" stroke={K.cold} strokeWidth={7} strokeLinecap="round" opacity={0.9} />
          </g>
        </SVG>
        {chip(12, "OTRA CURIOSIDAD")}
        <Stamp x={250} y={1080} text="1969" color={K.flow} size={70} rot={-6} p={R(12, "1969", 0.35)} />
        <Label x={710} y={560} text="1969: 8.192 /s" size={38} color={K.hot} box o={L(12, "vibraba")} />
        <Label x={710} y={820} text="HOY: 32.768 /s" size={38} color={K.cold} box o={L(12, "vibraba")} />
        <Label x={710} y={1040} text="×4 MÁS DESPACIO" size={38} color={K.flow} box o={L(12, "despacio")} />
      </Scene>

      {/* 13 · cierre: resumen */}
      <Scene {...sc(13)}>
        <SVG>
          <g opacity={dimTo(13, "cristal")}><Fork x={200} y={630} s={0.6} vib={vibK(6)} glow={curR === 0 ? 1 : 0} /></g>
          <g opacity={dimTo(13, "chip")}><ChipIC x={540} y={630} w={210} h={150} glow={curR === 1 ? pulseAt(t * 2) : 0} /></g>
          <g opacity={dimTo(13, "motor")}><Motor x={870} y={580} s={0.46} pulse={curR === 2 ? pulseAt(t) : 0} rot={rot8} pol={pol8} /></g>
          <Watch x={540} y={1010} s={0.48} t={t} straps={false} />
        </SVG>
        {chip(13, "RESUMEN")}
        <Label x={200} y={820} text="VIBRA" size={40} color={curR === 0 ? K.flow : K.white} box o={dimTo(13, "cristal")} />
        <Label x={540} y={820} text="DIVIDE" size={40} color={curR === 1 ? K.flow : K.white} box o={dimTo(13, "chip")} />
        <Label x={870} y={820} text="SALTA" size={40} color={curR === 2 ? K.flow : K.white} box o={dimTo(13, "motor")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};

const clampN = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
