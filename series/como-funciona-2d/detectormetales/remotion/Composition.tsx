// Episodio 141 · Cómo funciona el arco detector de metales del aeropuerto (inducción de pulsos y corrientes de Foucault).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Arch, archZoneY, FieldPulse, Rings, Person, KeyIcon, CoilBig, MetalDisc, Eddy, Scope, Slider, Glasses, RingIcon, KeyBunch, Bottle, Cup, BodyScanner, XRay, Belt, Bra, HipFigure, Wand, BellDevice, Bullet, C } from "./DetectorMetales";

export const COMP_ID = "DetectorMetales";
export const HOOK = "Este arco escucha ecos"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

/** Atenuado al principio (0,3) y pleno desde la palabra w. */
const dim = (t: number, w: number) => 0.3 + 0.7 * ramp(t, w, w + 0.3);
const on = (t: number, w: number, d = 0.3) => ramp(t, w, w + d);

// geometría del arco grande (beats 1, 3, 7 y 13)
const AR = { cx: 540, top: 380, w: 660, h: 770 };
const AIN = { l: AR.cx - AR.w / 2 + 120, r: AR.cx + AR.w / 2 - 120, y0: AR.top + 120, y1: AR.top + AR.h - 80 };
const BASE = AR.top + AR.h - 34;

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(scene(i)[0], i === 1 ? 1.8 : 0), scene(i)[1])} />;
  const A = (i: number) => scene(i)[0];

  // ---------- beat 1 ----------
  const b1open = ramp(t, Wd(1, "secreto"), Wd(1, "secreto") + 0.6);
  const b1metal = ramp(t, Wd(1, "metal"), Wd(1, "metal") + 0.3);
  const b1eco = on(t, Wd(1, "eco"));
  // ---------- beat 3 ----------
  const b3pulse = on(t, Wd(3, "pulso"));
  const b3eco = on(t, Wd(3, "eco"));
  // ---------- beat 6 ----------
  const b6rec = on(t, Wd(6, "recibe"), 0.6);
  const b6al = Wd(6, "alarma");
  // ---------- beat 7 ----------
  const b7z = Wd(7, "zonas"), b7alt = Wd(7, "altura");
  const b7y = archZoneY(AR.top, AR.h, 6, 2);
  // ---------- beat 8 ----------
  const b8v = 0.25 + 0.4 * ramp(t, Wd(8, "ajusta"), Wd(8, "sensibilidad") + 0.5);
  const b8g = Wd(8, "grande");
  // ---------- beat 11 ----------
  const b11w = ramp(t, Wd(11, "revisa") - 0.2, Wd(11, "manera") + 0.3);
  // ---------- beat 13 ----------
  const b13p = Wd(13, "pulsos"), b13e = Wd(13, "eco");

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el arco grande; al decir «secreto» las tapas se abren y se ven las bobinas; «eco» → anillos */}
      <Scene {...sc(1)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Arch {...AR} t={t} open={b1open} coil={b1open} />
          <FieldPulse x={AIN.l} y0={AIN.y0} y1={AIN.y1} dir={1} t={t} o={0.35 + 0.65 * b1open} />
          <FieldPulse x={AIN.r} y0={AIN.y0} y1={AIN.y1} dir={-1} t={t + 0.4} o={0.35 + 0.65 * b1open} />
          <g opacity={0.3 + 0.7 * b1metal}><KeyIcon x={540} y={800} s={1.5} glow={b1eco} /></g>
          <Rings x={540} y={800} t={t} o={b1eco} r1={190} />
        </svg>
        {chip(1, "EL SECRETO DEL ARCO")}
        <Label x={540} y={1000} text="no lo ve…" size={44} o={span(t, Wd(1, "ve"), Wd(1, "escucha"))} />
        <Label x={540} y={1000} text="¡escucha su eco!" size={40} color={K.hot} box o={on(t, Wd(1, "eco"))} />
      </Scene>

      {/* 2 · bobinas en los laterales que lanzan pulsos */}
      <Scene {...sc(2)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Arch cx={540} top={420} w={700} h={700} t={t} open={1} coil={dim(t, Wd(2, "bobinas")) * (0.6 + 0.4 * (Math.sin(t * 18) > 0 ? 1 : 0) * on(t, Wd(2, "pulsos")))} />
          <FieldPulse x={310} y0={560} y1={1020} dir={1} t={t} rate={2.2} o={on(t, Wd(2, "pulsos"))} reach={200} />
          <FieldPulse x={770} y0={560} y1={1020} dir={-1} t={t + 0.2} rate={2.2} o={on(t, Wd(2, "pulsos"))} reach={200} />
        </svg>
        {chip(2, "DENTRO DEL ARCO")}
        <Label x={540} y={590} text="bobinas" size={46} color={K.flow} box o={dim(t, Wd(2, "bobinas"))} />
        <Label x={540} y={760} text="pulsos magnéticos" size={36} color={K.cold} box o={on(t, Wd(2, "pulsos"))} />
        <Label x={540} y={1060} text="cientos por segundo" size={36} box o={on(t, Wd(2, "cientos"))} />
      </Scene>

      {/* 3 · idea clave: el pulso sale, el metal responde con un eco */}
      <Scene {...sc(3)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Arch {...AR} t={t} open={1} coil={1} />
          <Person x={540} base={BASE} o={dim(t, Wd(3, "llevas"))} />
          <FieldPulse x={AIN.l} y0={AIN.y0} y1={AIN.y1} dir={1} t={t} o={b3pulse} />
          <KeyIcon x={590} y={890} s={0.9} glow={b3eco} />
          <Rings x={590} y={890} t={t} o={b3eco} r1={220} />
        </svg>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={720} y={1000} text="metal" size={42} color={K.flow} box o={on(t, Wd(3, "metal"))} />
        <Label x={540} y={540} text="eco magnético" size={44} color={K.hot} box o={b3eco} />
      </Scene>

      {/* 4 · primero: golpe de corriente → campo magnético */}
      <Scene {...sc(4)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <CoilBig cx={330} cy={800} w={240} h={420} t={t} glow={dim(t, Wd(4, "bobina"))} current={on(t, Wd(4, "golpe")) * (Math.sin(t * 9) > 0 ? 1 : 0.15)} />
          <FieldPulse x={480} y0={620} y1={980} dir={1} t={t} rate={1.6} reach={260} o={on(t, Wd(4, "campo"))} />
          <Scope x={780} y={560} w={330} h={190} t={t} o={dim(t, Wd(4, "golpe"))} />
        </svg>
        {chip(4, "PRIMERO · EL PULSO")}
        <Label x={780} y={700} text="pulso cortísimo" size={38} color={K.flow} o={on(t, Wd(4, "cortísimo"))} />
        <Label x={540} y={1090} text="campo magnético" size={46} color={K.cold} box o={on(t, Wd(4, "campo"))} />
      </Scene>

      {/* 5 · segundo: al cortarse el pulso nacen corrientes de Foucault en el metal */}
      <Scene {...sc(5)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <FieldPulse x={150} y0={560} y1={1020} dir={1} t={t} rate={1.4} reach={200} o={0.8 * (1 - on(t, Wd(5, "cortarse"), 0.5))} />
          <MetalDisc cx={600} cy={790} r={230} glow={0.4 * on(t, Wd(5, "remolino"))} />
          <Eddy cx={600} cy={790} r={210} t={t} o={dim(t, Wd(5, "nacen")) * (t > Wd(5, "nacen") - 0.2 ? 1 : 0.3)} />
        </svg>
        {chip(5, "SEGUNDO · LOS REMOLINOS")}
        <Label x={600} y={470} text="se corta el pulso" size={40} color={K.cold} box o={span(t, Wd(5, "cortarse"), Wd(5, "Foucault"))} />
        <Label x={600} y={470} text="corrientes de Foucault" size={42} color={K.flow} box o={on(t, Wd(5, "Foucault") + 0.3)} />
        <Label x={600} y={1090} text="tu metal" size={42} o={dim(t, Wd(5, "metal"))} />
      </Scene>

      {/* 6 · tercero: el eco vuelve a la bobina; la señal tarda más en apagarse → alarma */}
      <Scene {...sc(6)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <CoilBig cx={220} cy={640} w={150} h={280} t={t} turns={3} glow={0.5 + 0.5 * b6rec} />
          <MetalDisc cx={720} cy={640} r={130} glow={0.6} />
          <Eddy cx={720} cy={640} r={120} t={t} />
          <Rings x={720} y={640} t={t} o={dim(t, Wd(6, "propio"))} r0={140} r1={420} rate={1.1} />
          <Scope x={540} y={980} w={720} h={230} t={t} mode="decay" metal={b6rec} thr={b6rec} o={dim(t, Wd(6, "recibe"))} />
          <circle cx={860} cy={420} r={34} fill={t > b6al ? K.warn : "#3a1c24"} style={t > b6al ? { filter: `drop-shadow(0 0 ${16 + 10 * Math.sin(t * 20)}px ${K.warn})` } : {}} />
        </svg>
        {chip(6, "TERCERO · EL ECO")}
        <Label x={470} y={480} text="el eco" size={44} color={K.hot} o={dim(t, Wd(6, "eco"))} />
        <Label x={680} y={830} text="tarda más en apagarse" size={32} color={K.hot} box o={b6rec} />
        <Stamp x={540} y={560} text="¡PIII!" p={on(t, b6al)} />
      </Scene>

      {/* 7 · cuarto: zonas; las luces marcan la altura del metal */}
      <Scene {...sc(7)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Arch {...AR} t={t} zones={6} lit={t > b7alt ? 2 : -1} alarm={t > b7alt ? 1 : 0} />
          {Array.from({ length: 6 }).map((_, k) => {
            const y = archZoneY(AR.top, AR.h, 6, k);
            return <rect key={k} x={AIN.l + 6} y={y - 52} width={AIN.r - AIN.l - 12} height={104} fill={k === 2 && t > b7alt ? K.warn : K.cold}
              opacity={(k === 2 && t > b7alt ? 0.25 : 0.08 + 0.06 * (k % 2)) * on(t, b7z)} />;
          })}
          <Person x={540} base={BASE} o={0.9} />
          <KeyIcon x={600} y={b7y} s={0.8} glow={t > b7alt ? 1 : 0} />
          {t > b7alt && <line x1={AIN.l} y1={b7y} x2={AIN.r} y2={b7y} stroke={K.warn} strokeWidth={5} strokeDasharray="14 10" opacity={on(t, b7alt)} />}
        </svg>
        {chip(7, "CUARTO · LAS ZONAS")}
        <Label x={540} y={560} text="zonas" size={44} color={K.cold} box o={span(t, b7z, b7alt + 0.1)} />
        <Label x={540} y={560} text="¡a esta altura!" size={44} color={K.warn} box o={on(t, b7alt + 0.3)} />
      </Scene>

      {/* 8 · sensibilidad: gafas y alianza no pitan; las llaves sí */}
      <Scene {...sc(8)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Slider x={540} y={520} w={560} v={b8v} />
          <Glasses x={220} y={840} s={0.95} o={dim(t, Wd(8, "gafas"))} />
          <RingIcon x={540} y={840} s={1.1} o={dim(t, Wd(8, "alianza"))} />
          <KeyBunch x={850} y={820} s={1.1} o={dim(t, b8g)} glow={on(t, b8g)} />
          {[220, 540].map((x) => (
            <path key={x} d={`M ${x - 34} 960 L ${x - 6} 990 L ${x + 40} 930`} fill="none" stroke={C.go} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round"
              opacity={on(t, Wd(8, "pitan"))} />
          ))}
          {t > b8g && <circle cx={850} cy={980} r={30} fill={K.warn} style={{ filter: `drop-shadow(0 0 ${14 + 8 * Math.sin(t * 20)}px ${K.warn})` }} />}
        </svg>
        {chip(8, "LA SENSIBILIDAD")}
        <Label x={540} y={420} text="sensibilidad" size={40} color={K.flow} o={dim(t, Wd(8, "sensibilidad"))} />
        <Label x={220} y={720} text="gafas" size={36} o={dim(t, Wd(8, "gafas"))} />
        <Label x={540} y={720} text="alianza" size={36} o={dim(t, Wd(8, "alianza"))} />
        <Label x={850} y={690} text="más grande" size={36} color={K.warn} o={dim(t, b8g)} />
        <Label x={380} y={1080} text="no pitan" size={42} color={C.go} box o={on(t, Wd(8, "pitan"))} />
      </Scene>

      {/* 9 · no ve plástico ni cerámica; eso lo miran el escáner corporal y los rayos X */}
      <Scene {...sc(9)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <FieldPulse x={110} y0={440} y1={800} dir={1} t={t} rate={1.4} reach={420} />
          <Bottle x={400} y={620} s={0.9} o={dim(t, Wd(9, "plástico"))} />
          <Cup x={700} y={640} s={0.9} o={dim(t, Wd(9, "cerámica"))} />
          <BodyScanner x={300} y={960} s={0.62} t={t} o={dim(t, Wd(9, "escáner"))} />
          <XRay x={760} y={990} s={0.75} t={t} o={dim(t, Wd(9, "rayos"))} />
        </svg>
        {chip(9, "LO QUE NO VE")}
        <Label x={400} y={790} text="plástico" size={36} o={dim(t, Wd(9, "plástico"))} />
        <Label x={700} y={790} text="cerámica" size={36} o={dim(t, Wd(9, "cerámica"))} />
        <Stamp x={560} y={500} text="SIN ECO" size={48} p={on(t, Wd(9, "conducen"))} />
        <Label x={300} y={1110} text="escáner corporal" size={32} color={K.cold} o={dim(t, Wd(9, "escáner"))} />
        <Label x={760} y={1110} text="rayos X" size={32} color={K.cold} o={dim(t, Wd(9, "rayos"))} />
      </Scene>

      {/* 10 · curiosidad: hebilla y aro del sujetador */}
      <Scene {...sc(10)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Belt x={290} y={680} s={1.05} o={dim(t, Wd(10, "hebilla"))} glow={on(t, Wd(10, "hebilla"))} />
          <Bra x={790} y={680} s={1.05} o={dim(t, Wd(10, "aro"))} glow={on(t, Wd(10, "aro"))} />
          {t > Wd(10, "pitar") && <circle cx={540} cy={940} r={38} fill={K.warn} style={{ filter: `drop-shadow(0 0 ${16 + 10 * Math.sin(t * 20)}px ${K.warn})` }} />}
        </svg>
        {chip(10, "CURIOSIDAD", K.cold)}
        <Label x={290} y={830} text="hebilla" size={40} color={K.flow} o={dim(t, Wd(10, "hebilla"))} />
        <Label x={790} y={830} text="aro" size={40} color={K.flow} o={dim(t, Wd(10, "aro"))} />
        <Label x={540} y={1080} text="metal escondido" size={44} color={K.flow} box o={on(t, Wd(10, "escondido"))} />
        <Stamp x={540} y={500} text="¡PIII!" size={52} p={on(t, Wd(10, "pitar"))} />
      </Scene>

      {/* 11 · otra: prótesis de cadera → revisión aparte (dibujo: detector de mano) (sin consejos médicos) */}
      <Scene {...sc(11)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <HipFigure x={420} base={1120} s={1.15} glow={on(t, Wd(11, "prótesis"))} />
          <Wand x={760 - 180 * b11w} y={880 - 30 * b11w} s={1.0} rot={-30 + 10 * Math.sin(t * 3)} o={dim(t, Wd(11, "personal"))} led={b11w > 0.95 && Math.sin(t * 16) > 0 ? 1 : 0} />
        </svg>
        {chip(11, "OTRA · LAS PRÓTESIS", K.cold)}
        <Label x={420} y={440} text="prótesis de cadera" size={42} color={K.flow} box o={on(t, Wd(11, "prótesis"))} />
        <Label x={770} y={620} text="revisión aparte" size={34} color={K.cold} o={dim(t, Wd(11, "revisa"))} />
      </Scene>

      {/* 12 · otra: 1881, la balanza de inducción de Graham Bell */}
      <Scene {...sc(12)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <BellDevice x={480} y={800} s={1.25} t={t} glow={dim(t, Wd(12, "detector"))} />
          <Bullet x={820} y={1000} s={1.1} o={dim(t, Wd(12, "bala"))} />
          <Rings x={820} y={1000} t={t} o={0.5 * on(t, Wd(12, "buscar"))} color={K.cold} r0={40} r1={140} />
        </svg>
        {chip(12, "OTRA · 1881", K.cold)}
        <Stamp x={300} y={480} text="1881" color={K.flow} size={60} p={on(t, Wd(12, "1881"))} />
        <Label x={680} y={480} text="Graham Bell" size={44} box o={dim(t, Wd(12, "Bell"))} />
        <Label x={820} y={1110} text="la bala" size={36} o={dim(t, Wd(12, "bala"))} />
        <Stamp x={400} y={1060} text="NO LA ENCONTRÓ" size={44} p={on(t, Wd(12, "encontró"))} />
      </Scene>

      {/* 13 · resumen: pulsos → eco */}
      <Scene {...sc(13)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Arch {...AR} t={t} open={0.6} coil={1} alarm={t > b13e ? 1 : 0} />
          <Person x={540} base={BASE} o={0.9} />
          <FieldPulse x={AIN.l} y0={AIN.y0} y1={AIN.y1} dir={1} t={t} o={dim(t, b13p)} />
          <FieldPulse x={AIN.r} y0={AIN.y0} y1={AIN.y1} dir={-1} t={t + 0.4} o={dim(t, b13p)} />
          <KeyIcon x={590} y={890} s={0.9} glow={on(t, b13e)} />
          <Rings x={590} y={890} t={t} o={on(t, b13e)} r1={220} />
        </svg>
        {chip(13, "RESUMEN")}
        <Label x={540} y={560} text="pulso → eco" size={44} color={K.flow} box o={dim(t, b13p)} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
