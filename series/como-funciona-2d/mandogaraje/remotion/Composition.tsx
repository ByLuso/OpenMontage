// Episodio 129 · Cómo funciona el mando del garaje (código rodante).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Remote, Waves, Door, Motor, KeyIcon, Recorder, Dip, Battery, NumberLine, Tag, C } from "./Mando";

export const COMP_ID = "MandoGaraje";
export const HOOK = "Cada pulsación, otra contraseña"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

/** Pulsaciones periódicas desde t0: k = nº de pulsaciones hechas, p = 1 justo al pulsar y cae en 0,2 s. */
const pulses = (t: number, t0: number, every: number, max = 99) => {
  if (t < t0) return { k: 0, p: 0 };
  const u = (t - t0) / every;
  const k = Math.min(max, Math.floor(u) + 1);
  const f = u - Math.floor(u);
  return { k, p: Math.floor(u) + 1 > max ? 0 : f < 0.22 ? 1 - f / 0.22 : 0 };
};
/** Código hexadecimal pseudoaleatorio para el número n (solo decorativo). */
const code = (n: number) => {
  let x = (Math.imul(n + 7, 2654435761) + 12345) >>> 0;
  x ^= x >>> 13; x = Math.imul(x, 0x5bd1e995) >>> 0; x ^= x >>> 15;
  const h = (x >>> 0).toString(16).toUpperCase().padStart(8, "0");
  return `${h.slice(0, 4)} ${h.slice(4)}`;
};
/** Atenuado al principio (0,3) y pleno desde la palabra w. */
const dim = (t: number, w: number) => 0.3 + 0.7 * ramp(t, w, w + 0.3);

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
  const b1 = pulses(t, Wd(1, "pulsas"), 0.75);
  // ---------- beat 2 ----------
  const b2 = pulses(t, A(2) + 0.3, 1.1, 3);
  const b2door = ramp(t, A(2) + 0.6, A(2) + 1.3) * (1 - ramp(t, Wd(2, "alguien") - 0.2, Wd(2, "alguien") + 0.5));
  const b2rec = ramp(t, Wd(2, "grabe"), Wd(2, "grabe") + 0.3);
  const b2rep = Wd(2, "repita");
  // ---------- beat 5 ----------
  const dip8 = [1, 0, 1, 1, 0, 0, 1, 0];
  const dip12 = [...dip8, 0, 1, 1, 0];
  const show12 = t >= Wd(5, "doce");
  const dipStates = show12 ? dip12 : dip8;
  // ---------- beat 6 ----------
  const b6 = pulses(t, A(6) + 0.3, 1.0, 2);
  const b6rec = ramp(t, Wd(6, "grabar"), Wd(6, "grabar") + 0.3);
  const b6rep = Wd(6, "repetir");
  // ---------- beat 7 ----------
  const b7 = pulses(t, A(7) + 0.5, 0.95);
  // ---------- beat 8 ----------
  const fast = t > Wd(8, "azar");
  const b8 = pulses(t, A(8) + 0.4, fast ? 0.2 : 1.1);
  const b8n = 45 + (fast ? Math.floor((t - Wd(8, "azar")) / 0.18) + 4 : b8.k);
  // ---------- beat 9 ----------
  const s9 = t < Wd(9, "descifra") ? "· · ·" : t < Wd(9, "comprueba") ? "43" : t < Wd(9, "nuevo") ? "42 → 43" : "43 OK";
  const b9door = ramp(t, Wd(9, "abre"), Wd(9, "abre") + 1.0);
  // ---------- beat 10/11 ----------
  const win10 = t >= Wd(10, "acepta");
  const hit10 = t >= Wd(10, "lejos");
  const n11 = Math.round(46 + 900 * ramp(t, Wd(11, "muchísimas"), Wd(11, "ventana")));
  const pair11 = Wd(11, "emparejarlo");
  // ---------- beat 12 ----------
  const lvl = 1 - 0.85 * ramp(t, Wd(12, "pila"), Wd(12, "baja") + 0.4);
  const near = ramp(t, Wd(12, "cerca") - 0.3, Wd(12, "cerca") + 0.5);
  const rx12 = 230 + 190 * near;
  const b12 = pulses(t, A(12) + 0.3, 0.9);
  // ---------- beat 13 ----------
  const b13 = pulses(t, A(13) + 0.3, 0.8);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el mando grande; al decir «secreto» la carcasa se abre */}
      <Scene {...sc(1)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <g transform={`translate(0 ${8 * Math.sin(t * 2)})`}>
            <Remote cx={540} cy={760} s={1.55} open={b1open} press={b1.p} led={b1.p} t={t} />
          </g>
          <Tag x={540} y={470} text={code(b1.k + 1)} color={K.flow} size={58} o={b1open * (b1.k > 0 ? 1 : 0.35)} w={420} />
        </svg>
        {chip(1, "EL SECRETO DEL MANDO")}
        <Label x={540} y={1090} text="¡distinta cada vez!" size={46} color={K.flow} box o={ramp(t, Wd(1, "envía"), Wd(1, "envía") + 0.3)} />
      </Scene>

      {/* 2 · código rodante: la grabación no sirve */}
      <Scene {...sc(2)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Door x={600} y={520} w={320} h={360} open={b2door} />
          <Remote cx={230} cy={760} s={0.75} press={b2.p} led={b2.p} t={t} />
          <Waves x={330} y={640} t={t} reach={240} o={b2.k > 0 && b2.k <= 3 && t < Wd(2, "alguien") + 0.6 ? 1 : 0} />
          <Tag x={470} y={500} text={code(b2.k + 20)} color={K.flow} size={38} o={dim(t, A(2) + 0.3) * (1 - ramp(t, b2rep - 0.3, b2rep))} w={300} />
          <Recorder cx={560} cy={1040} s={0.8} rec={b2rec} t={t} />
          <Waves x={620} y={985} t={t} reach={170} color={K.warn} ang={-60} o={ramp(t, b2rep, b2rep + 0.2)} />
        </svg>
        {chip(2, "CÓDIGO RODANTE")}
        <Label x={300} y={1040} text="copia" size={38} color={K.warn} o={span(t, Wd(2, "grabe"), b2rep)} />
        <Stamp x={760} y={700} text="NO SIRVE" p={ramp(t, b2rep + 0.3, b2rep + 0.6)} />
      </Scene>

      {/* 3 · idea clave: el mismo secreto a los dos lados, y no viaja */}
      <Scene {...sc(3)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Remote cx={230} cy={700} s={0.7} press={t > Wd(3, "envía") && t < Wd(3, "envía") + 0.25 ? 1 : 0} led={t > Wd(3, "envía") ? 1 : 0} t={t} />
          <Motor cx={760} cy={700} s={0.85} t={t} screen={t > Wd(3, "envía") + 0.6 ? "OK" : ""} />
          <KeyIcon x={230} y={1000} s={0.9} o={dim(t, Wd(3, "comparten"))} />
          <KeyIcon x={760} y={1000} s={0.9} o={dim(t, Wd(3, "comparten"))} />
          <Waves x={330} y={600} t={t} reach={260} color={K.white} o={ramp(t, Wd(3, "envía"), Wd(3, "envía") + 0.3)} />
          <Tag x={500} y={500} text={code(77)} size={34} o={ramp(t, Wd(3, "envía"), Wd(3, "envía") + 0.3)} w={260} />
        </svg>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={495} y={1100} text="misma clave secreta" size={42} color={K.flow} o={ramp(t, Wd(3, "secreto"), Wd(3, "secreto") + 0.3)} />
        <Label x={540} y={840} text="la clave NO viaja" size={44} color={K.warn} box o={ramp(t, Wd(3, "envía") + 0.3, Wd(3, "envía") + 0.6)} />
      </Scene>

      {/* 4 · radio */}
      <Scene {...sc(4)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Remote cx={300} cy={760} s={1.0} press={pulses(t, Wd(4, "pulsar"), 1.2).p} led={pulses(t, Wd(4, "pulsar"), 1.2).p} t={t} />
          <Waves x={500} y={720} t={t} reach={380} o={dim(t, Wd(4, "emite"))} />
        </svg>
        {chip(4, "PRIMERO · RADIO")}
        <Label x={740} y={480} text="433 MHz" size={80} color={K.flow} box o={dim(t, Wd(4, "cuatrocientos"))} />
        <Label x={740} y={960} text="o 868 MHz" size={56} color={K.cold} box o={dim(t, Wd(4, "megahercios"))} />
        <Label x={540} y={1100} text="bandas libres en Europa" size={40} o={ramp(t, Wd(4, "megahercios") + 0.3, Wd(4, "megahercios") + 0.6)} />
      </Scene>

      {/* 5 · código fijo con interruptores */}
      <Scene {...sc(5)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Dip cx={540} cy={700} w={720} states={dipStates} hi={span(t, Wd(5, "mismo"), Wd(5, "elegido"))} />
          <Tag x={540} y={960} text={dipStates.join("")} color={K.white} size={50} o={dim(t, Wd(5, "código"))} w={show12 ? 560 : 420} />
        </svg>
        {chip(5, "SEGUNDO · CÓDIGO FIJO")}
        <Label x={540} y={480} text="siempre el mismo código" size={46} color={K.flow} o={ramp(t, Wd(5, "siempre"), Wd(5, "siempre") + 0.3)} />
        <Label x={540} y={1090} text="8 interruptores = 256 combinaciones" size={38} o={span(t, Wd(5, "ocho") + 0.2, Wd(5, "doce"))} />
        <Label x={540} y={1090} text="12 interruptores = 4096 combinaciones" size={38} color={K.cold} o={span(t, Wd(5, "doce") + 0.35, Infinity)} />
      </Scene>

      {/* 6 · se podía grabar y repetir */}
      <Scene {...sc(6)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Door x={600} y={520} w={320} h={360} open={ramp(t, b6rep + 0.4, b6rep + 1.3)} />
          <g opacity={1 - 0.7 * ramp(t, b6rep - 0.3, b6rep)}>
            <Remote cx={230} cy={760} s={0.75} old press={b6.p} led={b6.p} t={t} />
          </g>
          <Waves x={330} y={640} t={t} reach={240} color={K.white} o={b6.k > 0 && t < b6rep - 0.3 ? 1 : 0} />
          <Tag x={470} y={500} text="10110010" size={40} o={dim(t, A(6) + 0.3)} w={300} />
          <Recorder cx={560} cy={1040} s={0.8} rec={b6rec} t={t} />
          <Waves x={620} y={985} t={t} reach={170} color={K.warn} ang={-60} o={ramp(t, b6rep, b6rep + 0.2)} />
        </svg>
        {chip(6, "SEGUNDO · CÓDIGO FIJO")}
        <Label x={300} y={1040} text="grabado" size={38} color={K.warn} o={ramp(t, Wd(6, "grabar"), Wd(6, "grabar") + 0.3)} />
        <Stamp x={770} y={700} text="¡COPIADO!" p={ramp(t, Wd(6, "copiaba"), Wd(6, "copiaba") + 0.3)} />
      </Scene>

      {/* 7 · el contador */}
      <Scene {...sc(7)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Remote cx={240} cy={760} s={0.8} press={b7.p} led={b7.p} t={t} />
          <g transform={`translate(690 720) scale(${1 + 0.08 * b7.p})`}>
            <Tag x={0} y={0} text={String(41 + b7.k).padStart(4, "0")} color={K.flow} size={120} w={480} />
          </g>
        </svg>
        {chip(7, "TERCERO · EL CONTADOR")}
        <Label x={690} y={530} text="contador" size={44} o={dim(t, Wd(7, "contador"))} />
        <Label x={540} y={1060} text="+1 en cada pulsación" size={48} color={K.flow} box o={ramp(t, Wd(7, "sube"), Wd(7, "sube") + 0.3)} />
      </Scene>

      {/* 8 · cifrado */}
      <Scene {...sc(8)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Tag x={250} y={560} text={String(b8n).padStart(4, "0")} color={K.flow} size={60} w={240} />
          <KeyIcon x={250} y={790} s={0.9} o={dim(t, Wd(8, "clave"))} />
          <path d="M 380 560 Q 450 600 470 660 M 360 790 Q 450 760 470 720" fill="none" stroke={K.white} strokeWidth={8} strokeLinecap="round" opacity={0.7} />
          <rect x={480} y={570} width={300} height={240} rx={30} fill={C.case1} stroke={K.flow} strokeWidth={6} />
          <g transform={`translate(630 690) rotate(${t * 140})`}>
            {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={-14} y={-82} width={28} height={30} rx={6} fill={K.flow} transform={`rotate(${i * 45})`} />)}
            <circle r={58} fill={K.flow} /><circle r={22} fill={C.case1} />
          </g>
          <path d="M 630 820 V 880" stroke={K.white} strokeWidth={8} strokeLinecap="round" opacity={0.7} />
          <Tag x={630} y={960} text={code(b8n)} color={K.cold} size={54} w={420} o={dim(t, Wd(8, "sale"))} />
        </svg>
        {chip(8, "TERCERO · EL CIFRADO")}
        <Label x={250} y={460} text="contador" size={38} o={1} />
        <Label x={250} y={890} text="clave" size={38} color={K.flow} o={dim(t, Wd(8, "clave"))} />
        <Label x={630} y={1070} text="código cifrado" size={42} color={K.cold} o={ramp(t, Wd(8, "cifrado"), Wd(8, "cifrado") + 0.3)} />
      </Scene>

      {/* 9 · el motor comprueba */}
      <Scene {...sc(9)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Door x={290} y={760} w={500} h={330} open={b9door} />
          <Motor cx={540} cy={600} s={1.0} t={t} screen={s9} screenColor={t >= Wd(9, "nuevo") ? K.cold : K.flow} glow={ramp(t, Wd(9, "nuevo"), Wd(9, "nuevo") + 0.3)} />
        </svg>
        {chip(9, "CUARTO · EL MOTOR COMPRUEBA")}
        <Label x={200} y={520} text="guardado: 42" size={36} o={dim(t, Wd(9, "comprueba"))} box />
        <Label x={880} y={520} text="llega: 43" size={36} color={K.flow} o={dim(t, Wd(9, "descifra"))} box />
      </Scene>

      {/* 10 · ventana de códigos */}
      <Scene {...sc(10)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <NumberLine a={40} b={51} x0={100} x1={940} y={720}
            col={(n) => n <= 42 ? K.warn : n <= 50 && win10 ? (hit10 && n === 46 ? K.cold : hit10 && n < 46 ? "#7f8ea3" : K.flow) : C.case3} />
          {win10 && <path d={`M ${100 + 3 * 70} 650 V 630 H ${100 + 11 * 70} V 650`} fill="none" stroke={K.flow} strokeWidth={6} />}
          <path d={`M ${100 + 2.5 * 70} 600 V 650`} stroke={K.white} strokeWidth={6} markerEnd="" />
          {hit10 && <g transform={`translate(${100 + 6.5 * 70} ${830 - 30 * (1 - ramp(t, Wd(10, "lejos"), Wd(10, "lejos") + 0.3))})`}>
            <path d="M 0 -60 L -22 -24 H 22 Z" fill={K.cold} />
          </g>}
        </svg>
        {chip(10, "CUARTO · LA VENTANA")}
        <Label x={275} y={570} text="guardado" size={36} o={1} />
        <Label x={590} y={570} text="ventana" size={40} color={K.flow} o={ramp(t, Wd(10, "acepta"), Wd(10, "acepta") + 0.3)} />
        <Label x={240} y={810} text="ya usados" size={36} color={K.warn} o={dim(t, Wd(10, "acepta"))} />
        <Label x={555} y={1000} text="llega el 46: ¡vale!" size={42} color={K.cold} box o={ramp(t, Wd(10, "lejos") + 0.2, Wd(10, "lejos") + 0.5)} />
      </Scene>

      {/* 11 · curiosidad: te sales de la ventana → emparejar */}
      <Scene {...sc(11)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <NumberLine a={40} b={51} x0={100} x1={940} y={640}
            col={(n) => n <= 42 ? K.warn : n <= 50 ? K.flow : C.case3} />
          <path d={`M ${100 + 3 * 70} 570 V 550 H ${100 + 11 * 70} V 570`} fill="none" stroke={K.flow} strokeWidth={6} />
          <Remote cx={300} cy={1010} s={0.4} press={pulses(t, Wd(11, "pulsas"), 0.25).p * (t < Wd(11, "ventana") ? 1 : 0)} led={0} t={t} />
          <Motor cx={760} cy={1030} s={0.55} t={t} screen={t > pair11 + 0.5 ? "OK" : ""} screenColor={K.cold} />
          <line x1={420} y1={1010} x2={660} y2={1010} stroke={K.cold} strokeWidth={8} strokeDasharray="18 14" strokeDashoffset={-t * 80}
            opacity={ramp(t, Wd(11, "hay"), Wd(11, "hay") + 0.3)} />
        </svg>
        {chip(11, "CURIOSIDAD", K.cold)}
        <Label x={540} y={470} text={`el mando va por el ${n11}`} size={44} color={n11 > 50 ? K.warn : K.white} box o={dim(t, Wd(11, "muchísimas"))} />
        <Label x={540} y={780} text="fuera de la ventana" size={44} color={K.warn} o={span(t, Wd(11, "pasa"), Wd(11, "hay"))} />
        <Label x={540} y={780} text="toca emparejar de nuevo" size={44} color={K.cold} o={ramp(t, Wd(11, "hay") + 0.25, Wd(11, "hay") + 0.55)} />
      </Scene>

      {/* 12 · la pila baja */}
      <Scene {...sc(12)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Door x={620} y={560} w={300} h={340} open={ramp(t, Wd(12, "cerca") + 0.5, Wd(12, "cerca") + 1.3)} />
          <Remote cx={rx12} cy={780} s={0.7} press={b12.p} led={b12.p * lvl} t={t} />
          <Waves x={rx12 + 140} y={690} t={t} reach={(380 - 260 * (1 - lvl)) * (1 - near) + 180 * near} />
          <Battery x={250} y={490} level={lvl} s={0.9} />
        </svg>
        {chip(12, "OTRA · LA PILA", K.cold)}
        <Label x={540} y={1090} text="pila baja = menos alcance" size={44} color={K.hot} box o={ramp(t, Wd(12, "débil"), Wd(12, "débil") + 0.3)} />
      </Scene>

      {/* 13 · resumen: una llave nueva por pulsación */}
      <Scene {...sc(13)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Remote cx={540} cy={790} s={0.95} press={b13.p} led={b13.p} t={t} />
          {[1, 2, 3, 4, 5, 6].map((k) => {
            const t0 = A(13) + 0.3 + (k - 1) * 0.8;
            if (t0 > Wd(13, "sirve") - 1.6) return null;
            const u = ramp(t, t0, t0 + 0.6);
            if (t < t0) return null;
            const side = k % 2 ? -1 : 1;
            const used = ramp(t, t0 + 0.7, t0 + 1.0);
            return <KeyIcon key={k} x={540 + side * (60 + 220 * u)} y={520 - 40 * u} s={0.7} rot={side * 12}
              color={used > 0.5 ? K.warn : K.flow} o={u * (1 - ramp(t, t0 + 1.2, t0 + 1.6))} />;
          })}
        </svg>
        {chip(13, "RESUMEN")}
        <Label x={540} y={1100} text="1 pulsación = 1 llave" size={48} color={K.flow} box o={dim(t, Wd(13, "pulsación"))} />
        <Stamp x={540} y={470} text="UN SOLO USO" color={K.flow} p={ramp(t, Wd(13, "sirve"), Wd(13, "sirve") + 0.3)} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
