// Episodio 147 · Cómo detecta la máquina del súper un billete falso (UV, infrarrojo, tinta magnética, medidas y «toca, mira y gira»).
// El billete es genérico (no reproduce el diseño real). Nada de pistas de falsificación: solo cómo se detecta.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Note, Lamp, Sheet, MagHead, Wave, Rollers, Dim, Machine, Glow, Finger, SoundArcs, Check, Badge, magZones, mix, C } from "./Billetes";

export const COMP_ID = "Billetes";
export const HOOK = "Este billete esconde secretos"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

/** Atenuado al principio (0,3) y pleno desde la palabra w. */
const dim = (t: number, w: number) => 0.3 + 0.7 * ramp(t, w, w + 0.3);
const on = (t: number, w: number, d = 0.3) => ramp(t, w, w + d);

const NW = 660, NH = 350;

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
  const b1open = ramp(t, Wd(1, "secretos"), Wd(1, "secretos") + 0.6);
  const b1uv = on(t, Wd(1, "brillan"), 0.4);
  const b1mag = on(t, Wd(1, "imanes"));
  const gap = 70 * b1open;
  // ---------- beat 7 ----------
  const b7p = ramp(t, A(7) + 0.2, Z(7) - 0.3);
  const b7x = 700 - 320 * b7p;
  const mz = magZones(520, 280);
  const b7pass = mz.map((z) => A(7) + 0.2 + ((700 - (540 - z.x)) / 320) * (Z(7) - 0.5 - A(7)));
  const b7peaks = b7pass.map((tp, i) => ({ x: 0.62 - 0.24 * i, a: ramp(t, tp - 0.35, tp) * (i === 0 ? 1 : 0.75) }));
  // ---------- beat 8 ----------
  const b8sz = Wd(8, "tamaño"), b8gr = Wd(8, "grosor"), b8ok = Wd(8, "comprueba");
  // ---------- beat 9 ----------
  const b9 = [Wd(9, "toca"), Wd(9, "mira"), Wd(9, "gira")];
  const b9act = (k: number) => t >= b9[k] && (k === 2 ? t < Wd(9, "como") + 0.6 : t < b9[k + 1]);
  // ---------- beat 10 ----------
  const b10back = on(t, Wd(10, "contraluz"), 0.5);
  const b10turn = ramp(t, Wd(10, "girarlo"), Wd(10, "girarlo") + 0.5);
  const b10holo = ramp(t, Wd(10, "holograma"), Wd(10, "imagen") + 0.3);
  // ---------- beat 11 ----------
  const b11k = ramp(t, Wd(11, "vuelve"), Wd(11, "oscuro") + 0.4);
  const b11tilt = ramp(t, Wd(11, "girarlo"), Wd(11, "girarlo") + 0.4);
  const em = mix(C.emerald, C.deepBlue, b11k);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el billete grande; «secretos» → se abre por la mitad; «brillan» → luz UV; «imanes» → zonas magnéticas */}
      <Scene {...sc(1)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <defs>
            <clipPath id="b1l"><path d={`M 0 0 L 560 0 L 520 600 L 560 760 L 515 900 L 545 1920 L 0 1920 Z`} /></clipPath>
            <clipPath id="b1r"><path d={`M 560 0 L 1080 0 L 1080 1920 L 545 1920 L 515 900 L 560 760 L 520 600 Z`} /></clipPath>
          </defs>
          {/* núcleo que brilla al abrirse */}
          <rect x={540 - gap} y={760 - NH / 2 + 10} width={gap * 2} height={NH - 20} fill={C.uv} opacity={0.5 * b1open} style={{ filter: `drop-shadow(0 0 24px ${C.uv})` }} />
          {[0, 1].map((s) => (
            <g key={s} transform={`translate(${(s === 0 ? -1 : 1) * gap} 0)`}>
              <g clipPath={`url(#${s === 0 ? "b1l" : "b1r"})`}>
                <Note id={`n1${s}`} x={540} y={760} t={t} uv={b1uv} mag={b1mag} rot={-3 + 1.5 * Math.sin(t * 1.3)} />
              </g>
            </g>
          ))}
          <MagHead x={540} y={500} s={0.9} t={t} o={b1mag} field={b1mag} />
        </svg>
        {chip(1, "LOS SECRETOS DEL BILLETE")}
        <Label x={540} y={1020} text="luz ultravioleta" size={44} color={C.uv} box o={span(t, Wd(1, "brillan"), Wd(1, "imanes"))} />
        <Label x={540} y={1020} text="tinta magnética" size={44} color={K.flow} box o={on(t, Wd(1, "imanes") + 0.05)} />
      </Scene>

      {/* 2 · dentro de la máquina: UV, IR y sensores magnéticos */}
      <Scene {...sc(2)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Machine id="m2" x={540} y={690} t={t} uv={on(t, Wd(2, "ultravioleta"))} ir={on(t, Wd(2, "infrarrojas"))} mag={on(t, Wd(2, "magnéticos"))} />
        </svg>
        {chip(2, "DENTRO DE LA MÁQUINA")}
        <Label x={290} y={1010} text="UV" size={44} color={C.uv} box o={dim(t, Wd(2, "ultravioleta"))} />
        <Label x={455} y={1010} text="IR" size={44} color={K.hot} box o={dim(t, Wd(2, "infrarrojas"))} />
        <Label x={640} y={1010} text="imán" size={44} color={K.flow} box o={dim(t, Wd(2, "magnéticos"))} />
        <Label x={540} y={1100} text="buscan tintas escondidas" size={40} o={on(t, Wd(2, "buscan"))} />
      </Scene>

      {/* 3 · idea clave: respuesta esperada a cada luz y a cada sensor */}
      <Scene {...sc(3)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Note id="n3" x={540} y={650} W={540} H={286} t={t} rot={2 * Math.sin(t * 1.2)} />
          <Badge x={270} y={930} color={C.uv} kind="uv" t={t} o={dim(t, Wd(3, "luz"))} />
          <Badge x={540} y={930} color={K.hot} kind="ir" t={t} o={dim(t, Wd(3, "luz") + 0.35)} />
          <Badge x={810} y={930} color={K.flow} kind="mag" t={t} o={dim(t, Wd(3, "sensor"))} />
          <Check x={330} y={985} s={0.8} o={on(t, Wd(3, "luz") + 0.2)} />
          <Check x={600} y={985} s={0.8} o={on(t, Wd(3, "luz") + 0.55)} />
          <Check x={870} y={985} s={0.8} o={on(t, Wd(3, "sensor") + 0.2)} />
        </svg>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={540} y={430} text="respuesta esperada" size={42} color={K.flow} box o={dim(t, Wd(3, "respuesta"))} />
        <Label x={540} y={1090} text="cada luz · cada sensor" size={38} o={dim(t, Wd(3, "cada"))} />
      </Scene>

      {/* 4 · primero: con UV el papel de algodón no brilla; el papel normal (con blanqueantes) sí */}
      <Scene {...sc(4)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Lamp id="l4" x={540} y={450} w={640} beam={560} spread={1.25} on={dim(t, Wd(4, "ultravioleta"))} t={t} />
          <Note id="n4" x={300} y={770} W={380} H={210} rot={-5} t={t} uv={on(t, Wd(4, "ultravioleta"))} fib={[0.25, 0.25, 0.25]} uvInk={0.25} />
          <Sheet x={780} y={770} w={240} h={320} glow={on(t, Wd(4, "normal"), 0.4)} uv={on(t, Wd(4, "ultravioleta"))} />
        </svg>
        {chip(4, "PRIMERO · ULTRAVIOLETA")}
        <Label x={300} y={985} text="algodón" size={40} color={K.white} o={dim(t, Wd(4, "algodón"))} />
        <Label x={300} y={1045} text="no brilla" size={40} color={C.uv} box o={on(t, Wd(4, "brilla"))} />
        <Label x={780} y={985} text="papel normal" size={40} o={dim(t, Wd(4, "normal"))} />
        <Label x={780} y={1045} text="¡brilla!" size={40} color={K.cold} box o={on(t, Wd(4, "sí"))} />
        <Label x={780} y={570} text="blanqueantes" size={32} color={K.cold} o={on(t, Wd(4, "blanqueantes"))} />
      </Scene>

      {/* 5 · fibras y tintas que se encienden en rojo, azul y verde */}
      <Scene {...sc(5)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Lamp id="l5" x={540} y={450} w={600} beam={480} spread={1.2} on={1} t={t} />
          <Note id="n5" x={540} y={740} t={t} uv={1} rot={-2 + Math.sin(t * 1.1)}
            fib={[dim(t, Wd(5, "rojo")) * (0.35 + 0.65 * on(t, Wd(5, "rojo"))), 0.3 + 0.7 * on(t, Wd(5, "azul")), 0.3 + 0.7 * on(t, Wd(5, "verde"))]}
            uvInk={0.2 + 0.8 * on(t, Wd(5, "tintas"))} />
        </svg>
        {chip(5, "BAJO LUZ ULTRAVIOLETA")}
        <Label x={320} y={1000} text="fibras" size={44} color={C.fR} box o={dim(t, Wd(5, "fibras"))} />
        <Label x={720} y={1000} text="tintas" size={44} color={K.flow} box o={dim(t, Wd(5, "tintas"))} />
        <Label x={540} y={1090} text="rojo · azul · verde" size={40} o={on(t, Wd(5, "rojo"))} />
      </Scene>

      {/* 6 · segundo: infrarrojo, solo aparecen partes concretas */}
      <Scene {...sc(6)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Lamp id="l6" x={540} y={450} w={600} beam={480} spread={1.2} color={K.hot} dashed on={dim(t, Wd(6, "infrarrojo"))} t={t} />
          <Note id="n6" x={540} y={740} t={t} ir={on(t, Wd(6, "aparecen"), 0.5)} rot={2 * Math.sin(t * 1.1)} />
        </svg>
        {chip(6, "SEGUNDO · INFRARROJO")}
        <Label x={540} y={1010} text="luz que tú no ves" size={42} color={K.hot} box o={span(t, Wd(6, "luz"), Wd(6, "aparecen"))} />
        <Label x={540} y={1010} text="solo partes concretas" size={42} color={K.hot} box o={on(t, Wd(6, "aparecen") + 0.05)} />
      </Scene>

      {/* 7 · tercero: tinta magnética y su huella en el sensor */}
      <Scene {...sc(7)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <MagHead x={540} y={540} s={1} t={t} o={1} field={dim(t, Wd(7, "imanes"))} />
          <Note id="n7" x={b7x} y={770} W={520} H={280} t={t} mag={dim(t, Wd(7, "magnética"))} />
          <Wave x={540} y={1020} w={740} h={130} t={t} o={dim(t, Wd(7, "sensor"))}
            peaks={b7peaks} />
        </svg>
        {chip(7, "TERCERO · IMANES")}
        <Label x={540} y={430} text="tinta magnética" size={42} color={K.flow} box o={dim(t, Wd(7, "magnética"))} />
        <Label x={540} y={1120} text="su huella" size={38} color={K.flow} o={on(t, Wd(7, "huella"))} />
      </Scene>

      {/* 8 · cuarto: tamaño y grosor */}
      <Scene {...sc(8)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Note id="n8" x={540} y={590} W={580} H={300} t={t} />
          <Dim x1={250} y1={770} x2={830} y2={770} o={on(t, b8sz, 0.5)} />
          <Dim x1={210} y1={440} x2={210} y2={740} o={on(t, b8sz + 0.2, 0.5)} />
          <Rollers x={540} y={1030} r={52} t={t} o={dim(t, b8gr)} glow={on(t, b8gr)} />
        </svg>
        {chip(8, "CUARTO · TAMAÑO Y GROSOR")}
        <Label x={540} y={815} text="tamaño" size={38} color={K.cold} o={on(t, b8sz)} />
        <Label x={840} y={1030} text="grosor" size={38} color={K.cold} box o={on(t, b8gr)} />
        <Stamp x={540} y={590} text="MEDIDAS OK" color={C.go} size={52} p={on(t, b8ok)} />
      </Scene>

      {/* 9 · truco: toca, mira y gira; suena y tiene relieve */}
      <Scene {...sc(9)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Note id="n9" x={540} y={740} W={600} H={320} t={t} relief={on(t, Wd(9, "relieve"))} rot={on(t, Wd(9, "suena")) * 3 * Math.sin(t * 14) * (t < Wd(9, "relieve") ? 1 : 0)} />
          <Finger x={850 - 10 * Math.sin(t * 3)} y={700 + 20 * Math.sin(t * 3)} s={0.8} rot={40} o={dim(t, Wd(9, "toca")) * (1 - 0.5 * on(t, Wd(9, "suena")) * (t < Wd(9, "relieve") ? 1 : 0))} />
          <SoundArcs x={200} y={640} dir={-1} t={t} o={span(t, Wd(9, "suena"), Wd(9, "relieve") + 0.4)} />
          <SoundArcs x={880} y={620} dir={1} t={t} o={span(t, Wd(9, "suena"), Wd(9, "relieve") + 0.4)} />
        </svg>
        {chip(9, "TRUCO · SIN MÁQUINA", K.cold)}
        {["TOCA", "MIRA", "GIRA"].map((w, k) => (
          <Label key={w} x={260 + 280 * k} y={450} text={w} size={50} color={b9act(k) ? K.flow : K.white} box o={dim(t, b9[k]) * (b9act(k) || t > Wd(9, "como") + 0.6 ? 1 : 0.6)} />
        ))}
        <Label x={540} y={1000} text="método del BCE" size={36} color={K.cold} o={span(t, Wd(9, "Banco"), Wd(9, "suena"))} />
        <Label x={330} y={1000} text="suena" size={40} o={on(t, Wd(9, "suena") + 0.1)} />
        <Label x={760} y={1000} text="relieve" size={40} color={K.flow} box o={on(t, Wd(9, "relieve"))} />
      </Scene>

      {/* 10 · a contraluz: marca de agua e hilo; al girar, el holograma cambia */}
      <Scene {...sc(10)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Glow id="g10" x={540} y={720} r={460} o={b10back * (1 - 0.6 * b10turn)} />
          <Note id="n10" x={540} y={720} t={t} back={b10back * (1 - 0.8 * b10turn)} holo={b10holo} sx={1 - 0.22 * b10turn * (0.5 + 0.5 * Math.sin(t * 3))} rot={-6 * b10turn} />
        </svg>
        {chip(10, "MIRA Y GIRA", K.cold)}
        <Label x={290} y={985} text="marca de agua" size={36} color={K.flow} box o={span(t, Wd(10, "marca"), Wd(10, "girarlo") + 0.2)} />
        <Label x={480} y={1060} text="hilo oscuro" size={36} color={K.flow} box o={span(t, Wd(10, "hilo"), Wd(10, "girarlo") + 0.2)} />
        <Label x={760} y={1020} text="holograma" size={40} color={K.cold} box o={on(t, Wd(10, "holograma"))} />
      </Scene>

      {/* 11 · curiosidad: el número verde esmeralda se vuelve azul oscuro */}
      <Scene {...sc(11)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <defs>
            <clipPath id="em11"><text x={540} y={860} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={400}>50</text></clipPath>
            <linearGradient id="em11b" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity={0} /><stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.75} /><stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <g transform={`translate(540 720) skewY(${-8 * b11tilt * Math.sin(t * 2.4)}) scale(1 ${1 - 0.1 * b11tilt * Math.abs(Math.sin(t * 2.4))}) translate(-540 -720)`}>
            <rect x={200} y={470} width={680} height={460} rx={30} fill={C.paper} opacity={dim(t, Wd(11, "billetes"))} />
            <text x={540} y={860} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={400} fill={em}
              style={{ filter: `drop-shadow(0 0 ${10 + 10 * b11k}px ${em})` }}>50</text>
            <g clipPath="url(#em11)">
              <rect x={200} y={480 + ((t * 0.7) % 1) * 420 - 110} width={680} height={110} fill="url(#em11b)" opacity={dim(t, Wd(11, "girarlo"))} />
            </g>
          </g>
        </svg>
        {chip(11, "CURIOSIDAD", K.cold)}
        <Label x={540} y={1010} text="verde esmeralda" size={44} color={C.emerald} box o={span(t, Wd(11, "verde"), Wd(11, "azul"))} />
        <Label x={540} y={1010} text="→ azul oscuro" size={44} color="#6F8CFF" box o={on(t, Wd(11, "azul") + 0.05)} />
      </Scene>

      {/* 12 · otra: el de 500 dejó de emitirse en 2019 pero sigue siendo legal */}
      <Scene {...sc(12)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Note id="n12" x={540} y={720} t={t} val="500" tint="#C3B6DC" ink="#5E4F86" rot={-3 + Math.sin(t * 1.2)} />
          <Check x={850} y={1010} s={0.8} o={on(t, Wd(12, "legal"))} />
        </svg>
        {chip(12, "OTRA · EL DE 500", K.cold)}
        <Stamp x={540} y={560} text="2019" color={K.flow} size={64} p={on(t, Wd(12, "2019"))} />
        <Label x={540} y={1010} text="ya no se emite" size={44} color={K.warn} box o={span(t, Wd(12, "dejó"), Wd(12, "pero"))} />
        <Label x={540} y={1010} text="sigue siendo legal" size={44} color={C.go} box o={on(t, Wd(12, "pero") + 0.05)} />
      </Scene>

      {/* 13 · resumen: luces, imanes y medidas */}
      <Scene {...sc(13)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Machine id="m13" x={540} y={690} t={t} uv={dim(t, Wd(13, "luces"))} ir={dim(t, Wd(13, "luces"))} mag={dim(t, Wd(13, "imanes"))} thick={on(t, Wd(13, "medidas"))} led={on(t, Wd(13, "medidas") + 0.3)} />
        </svg>
        {chip(13, "RESUMEN")}
        <Label x={280} y={1030} text="luces" size={44} color={C.uv} box o={dim(t, Wd(13, "luces"))} />
        <Label x={540} y={1030} text="imanes" size={44} color={K.flow} box o={dim(t, Wd(13, "imanes"))} />
        <Label x={800} y={1030} text="medidas" size={44} color={K.cold} box o={dim(t, Wd(13, "medidas"))} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
