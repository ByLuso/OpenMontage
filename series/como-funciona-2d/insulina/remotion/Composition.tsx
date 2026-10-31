// Episodio 125 · Cómo funciona una bomba de insulina (ESPECIAL HOSPITAL).
// Cada beat es una <Scene> con su dibujo y 1-3 etiquetas. Cambios atados a palabras con Wd(beat, "palabra").
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { C, Pump, Person, Pancreas, Skin, Syringe, Plate, Clipboard, Sensor, Backpack, Drop, Gear } from "./Insulina";

export const COMP_ID = "Insulina";
export const HOOK = "Imita al páncreas"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { B, Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const S = (i: number) => scene(i)[0];
  const E = (i: number) => scene(i)[1];
  const chip = (i: number) => span(t, S(i), E(i));
  const dim = (x: number) => 0.3 + 0.7 * x; // atenuado antes de entrar

  // ---- tiempos clave
  const b1open = ramp(t, Wd(1, "órgano"), Wd(1, "órgano") + 0.6);
  const b2off = ramp(t, Wd(2, "apenas"), Wd(2, "apenas") + 0.4);
  const b2pump = ramp(t, Wd(2, "bomba"), Wd(2, "bomba") + 0.4);
  const b4syr = ramp(t, Wd(4, "jeringa"), Wd(4, "jeringa") + 0.4);
  const b5push = ramp(t, Wd(5, "empuja"), E(5));
  const b6cal = ramp(t, Wd(6, "cambia"), Wd(6, "cambia") + 0.4);
  const b7basal = ramp(t, Wd(7, "basal"), Wd(7, "bolo"));
  const b7bolo = ramp(t, Wd(7, "bolo"), Wd(7, "comidas") + 0.6);
  const b8tick = Math.max(0, t - Wd(8, "mide"));
  const b9loop = ramp(t, Wd(9, "programa"), Wd(9, "programa") + 0.4);
  const b10med = ramp(t, Wd(10, "ajustes"), Wd(10, "ajustes") + 0.4);
  const b11zoom = ramp(t, Wd(11, "medio"), Wd(11, "medio") + 0.5);
  const b12hoy = ramp(t, Wd(12, "mochila") - 0.2, Wd(12, "mochila") + 0.3);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: la bomba grande desde el fotograma 0; al decir «órgano» se levanta la tapa */}
      <Scene {...sc(1)}>
        <SVG><g transform={`translate(540 790) scale(${1.15 + 0.01 * Math.sin(t * 2)}) translate(-540 -790)`}>
          <Pump t={t} open={b1open} push={0.15} flow={b1open} />
        </g></SVG>
        <Label x={540} y={1110} text="gota a gota" color={K.cold} size={52} o={span(t, Wd(1, "gota"), E(1))} />
      </Scene>

      {/* 2 · el páncreas → la bomba */}
      <Scene {...sc(2)}>
        <Chip text="El órgano: el páncreas" o={chip(2)} />
        <SVG>
          <Person x={540} y={500} s={1} />
          <Pancreas x={540} y={880} s={1.05} on={1 - b2off * (1 - b2pump)} t={t} />
          <g opacity={dim(b2pump)}>
            <rect x={240} y={1040} width={150} height={92} rx={22} fill={C.case2} stroke={C.case3} strokeWidth={5} />
            <rect x={258} y={1056} width={70} height={44} rx={8} fill={C.dark} />
            <path d="M390 1080 C 450 1080 470 980 520 930" fill="none" stroke={C.case3} strokeWidth={8} strokeDasharray={b2pump > 0.5 ? "none" : "8 10"} />
            {b2pump > 0.05 && [0, 0.5].map((k, i) => { const u = (t * 0.8 + k) % 1; return <circle key={i} cx={390 + 130 * u} cy={1080 - 150 * u * u} r={7} fill={K.white} opacity={b2pump} />; })}
          </g>
        </SVG>
        <Label x={540} y={760} text="fabrica insulina" color={K.flow} size={46} box o={span(t, Wd(2, "páncreas"), Wd(2, "apenas") + 0.2)} />
        <Label x={540} y={760} text="apenas la fabrica" color={K.warn} size={46} box o={span(t, Wd(2, "apenas") + 0.3, Wd(2, "bomba"))} />
        <Label x={660} y={1060} text="la bomba la da" color={K.cold} size={44} box o={span(t, Wd(2, "bomba") + 0.2, E(2))} />
      </Scene>

      {/* 3 · idea clave: imitar al páncreas, poquito a poco */}
      <Scene {...sc(3)}>
        <Chip text="La idea clave" o={chip(3)} />
        <SVG>
          <Pancreas x={300} y={640} s={0.9} on={1} t={t} />
          <text x={540} y={666} textAnchor="middle" fontSize={90} fontWeight={900} fill={K.white} fontFamily="MontserratSerie">≈</text>
          <g transform="translate(780 640) scale(0.42) translate(-540 -790)"><Pump t={t} open={1} flow={1} /></g>
          {/* goteo continuo */}
          <rect x={530} y={800} width={20} height={60} rx={6} fill={C.case3} />
          {[0, 0.33, 0.66].map((k, i) => { const u = (t * 0.9 + k) % 1; return <Drop key={i} x={540} y={880 + 200 * u} s={1.4} o={1 - u} />; })}
          <rect x={360} y={1100} width={360} height={14} rx={7} fill={K.cold} opacity={0.6} />
        </SVG>
        <Label x={540} y={480} text="imitar al páncreas" color={K.flow} size={52} o={span(t, Wd(3, "imitar"), E(3))} />
        <Label x={760} y={980} text="poquito a poco" color={K.cold} size={44} box o={dim(span(t, Wd(3, "poquito"), E(3)))} />
      </Scene>

      {/* 4 · primero: el depósito */}
      <Scene {...sc(4)}>
        <Chip text="1 · El depósito" o={chip(4)} />
        <SVG>
          <Syringe x={540} y={470} w={420} o={0.25 + 0.75 * b4syr} />
          <Pump t={t} open={1} push={0.12} hi="dep" flow={0.3} spin={0.2} />
        </SVG>
        <Label x={620} y={1050} text="DEPÓSITO DE INSULINA" color={K.cold} size={46} o={span(t, Wd(4, "depósito"), E(4))} />
        <Label x={540} y={560} text="sin aguja" color={K.white} size={38} o={span(t, Wd(4, "jeringa") + 0.2, E(4))} />
      </Scene>

      {/* 5 · segundo: el motor, el tornillo y el émbolo */}
      <Scene {...sc(5)}>
        <Chip text="2 · El motor" o={chip(5)} />
        <SVG><Pump t={t} open={1} push={0.12 + 0.4 * b5push} hi={t < Wd(5, "tornillo") ? "motor" : t < Wd(5, "émbolo") ? "tornillo" : "embolo"} flow={0.4 + 0.6 * b5push} spin={1.4} /></SVG>
        <Label x={317} y={540} text="MOTOR" color={K.flow} size={44} o={span(t, Wd(5, "motor"), E(5))} />
        <Label x={560} y={1050} text="tornillo muy fino" color={K.white} size={42} o={dim(span(t, Wd(5, "tornillo"), E(5)))} />
        <Label x={720} y={540} text="ÉMBOLO →" color={K.cold} size={44} o={dim(span(t, Wd(5, "émbolo"), E(5)))} />
      </Scene>

      {/* 6 · tercero: la cánula bajo la piel */}
      <Scene {...sc(6)}>
        <Chip text="3 · La cánula" o={chip(6)} />
        <SVG>
          <Skin y0={720} h={420} />
          <path d="M120 520 C 260 520 360 560 430 640" fill="none" stroke={C.case3} strokeWidth={16} strokeLinecap="round" />
          <rect x={360} y={640} width={240} height={80} rx={30} fill={K.white} opacity={0.9} />
          <path d="M480 720 L 560 900" stroke={K.white} strokeWidth={14} strokeLinecap="round" />
          {[0, 1, 2, 3, 4].map((i) => { const u = (t * 0.7 + i / 5) % 1; const a = i * 1.25; return <circle key={i} cx={560 + Math.cos(a) * 110 * u} cy={900 + Math.sin(a) * 60 * u} r={9} fill={K.cold} opacity={1 - u} />; })}
          {[0, 0.5].map((k, i) => { const u = (t * 0.6 + k) % 1; return <circle key={i} cx={120 + 300 * u} cy={520 + 100 * u * u} r={7} fill={K.white} />; })}
          {/* calendario */}
          <g transform="translate(800 520)" opacity={0.3 + 0.7 * b6cal}>
            <rect x={-80} y={-70} width={160} height={150} rx={16} fill={C.case2} stroke={C.case3} strokeWidth={5} />
            <rect x={-80} y={-70} width={160} height={40} rx={14} fill={K.flow} />
            <text x={0} y={52} textAnchor="middle" fontSize={56} fontWeight={900} fill={K.white} fontFamily="MontserratSerie">2-3</text>
          </g>
        </SVG>
        <Label x={300} y={800} text="piel" color={C.dark} size={34} o={span(t, Wd(6, "piel") - 0.3, E(6))} />
        <Label x={760} y={990} text="tubito flexible" color={K.white} size={42} box o={span(t, Wd(6, "tubito"), E(6))} />
        <Label x={800} y={655} text="días" color={K.white} size={38} o={dim(span(t, Wd(6, "cambia"), E(6)))} />
      </Scene>

      {/* 7 · basal y bolo */}
      <Scene {...sc(7)}>
        <Chip text="Dos tipos de dosis" o={chip(7)} />
        <SVG>
          <line x1={120} y1={1040} x2={960} y2={1040} stroke={C.case3} strokeWidth={5} />
          <line x1={120} y1={520} x2={120} y2={1040} stroke={C.case3} strokeWidth={5} />
          {/* basal: banda baja continua que se dibuja */}
          <rect x={124} y={960} width={832 * Math.max(0.02, b7basal)} height={78} fill={K.cold} opacity={0.75} />
          {/* bolos en las comidas */}
          {[0.3, 0.55, 0.82].map((f, i) => {
            const h = 360 * ramp(b7bolo, i * 0.25, i * 0.25 + 0.3);
            const x = 124 + 832 * f;
            return (
              <g key={i}>
                <rect x={x - 26} y={960 - h} width={52} height={h} rx={8} fill={K.flow} opacity={0.9} />
                <Plate x={x} y={540} s={0.42} o={0.3 + 0.7 * ramp(b7bolo, i * 0.25, i * 0.25 + 0.2)} />
              </g>
            );
          })}
        </SVG>
        <Label x={540} y={1095} text="BASAL: todo el día, de fondo" color={K.cold} size={40} o={dim(span(t, Wd(7, "basal"), E(7)))} />
        <Label x={790} y={640} text="BOLO" color={K.flow} size={46} o={dim(span(t, Wd(7, "bolo"), E(7)))} />
      </Scene>

      {/* 8 · cuarto: el sensor */}
      <Scene {...sc(8)}>
        <Chip text="4 · El sensor" o={chip(8)} />
        <SVG>
          <Skin y0={720} h={260} />
          <Sensor x={330} y={720} s={1.1} t={t} />
          {[0, 1, 2].map((i) => { const u = (t * 0.8 + i / 3) % 1; return <path key={i} d={`M ${430 + 200 * u} ${640 - 40} a 60 60 0 0 1 0 80`} fill="none" stroke={K.cold} strokeWidth={6} opacity={1 - u} />; })}
          <g transform="translate(780 640) scale(0.36) translate(-540 -790)"><Pump t={t} open={0} flow={0} /></g>
          {/* lecturas cada pocos minutos */}
          {Array.from({ length: 8 }).map((_, i) => {
            const on = b8tick > i * 0.35;
            const x = 180 + i * 100, y = 1115 - 20 * Math.sin(i * 0.9);
            return <circle key={i} cx={x} cy={y} r={on ? 14 : 8} fill={on ? K.flow : C.case3} opacity={on ? 1 : 0.4} />;
          })}
        </SVG>
        <Label x={330} y={540} text="SENSOR" color={K.cold} size={46} o={span(t, Wd(8, "sensor"), E(8))} />
        <Label x={540} y={1030} text="glucosa cada pocos minutos" color={K.white} size={38} box o={dim(span(t, Wd(8, "glucosa"), E(8)))} />
      </Scene>

      {/* 9 · asa cerrada híbrida */}
      <Scene {...sc(9)}>
        <Chip text="Asa cerrada híbrida" o={chip(9)} />
        <SVG>
          {(() => {
            const P = [[540, 560], [820, 960], [260, 960]];
            const k = (Math.max(0, t - S(9)) * 0.5) % 1; const seg = Math.floor(k * 3); const u = (k * 3) % 1;
            const a = P[seg], b = P[(seg + 1) % 3];
            return (
              <g>
                <polygon points={P.map((p) => p.join(",")).join(" ")} fill="none" stroke={C.case3} strokeWidth={6} strokeDasharray="14 12" strokeDashoffset={-t * 40} />
                <circle cx={a[0] + (b[0] - a[0]) * u} cy={a[1] + (b[1] - a[1]) * u} r={14} fill={K.flow} opacity={b9loop} />
                <Sensor x={540} y={590} s={0.75} t={t} />
                <g transform="translate(820 960)" opacity={dim(b9loop)}>
                  <rect x={-90} y={-70} width={180} height={140} rx={18} fill={C.case1} stroke={K.flow} strokeWidth={5} />
                  {[-50, -10, 30].map((y) => <rect key={y} x={-60} y={y - 6} width={120} height={12} rx={6} fill={K.flow} opacity={0.5 + 0.5 * Math.sin(t * 5 + y)} />)}
                </g>
                <g transform="translate(260 960) scale(0.3) translate(-540 -790)"><Pump t={t} open={0} flow={0} /></g>
                {/* ajuste de la basal en el centro */}
                <rect x={440} y={790 - 60 * (0.5 + 0.4 * Math.sin(t * 1.6))} width={200} height={60 * (0.5 + 0.4 * Math.sin(t * 1.6))} fill={K.cold} opacity={0.75 * dim(b9loop)} />
                <line x1={430} y1={790} x2={650} y2={790} stroke={C.case3} strokeWidth={4} />
              </g>
            );
          })()}
        </SVG>
        <Label x={540} y={470} text="sensor" color={K.cold} size={40} o={span(t, S(9), E(9))} />
        <Label x={820} y={1080} text="programa" color={K.flow} size={40} o={dim(span(t, Wd(9, "programa"), E(9)))} />
        <Label x={540} y={840} text="ajusta la basal" color={K.white} size={40} o={dim(span(t, Wd(9, "ajusta"), E(9)))} />
        <Label x={260} y={1080} text="bomba" color={K.cold} size={40} o={dim(span(t, Wd(9, "datos"), E(9)))} />
      </Scene>

      {/* 10 · no lo hace todo */}
      <Scene {...sc(10)}>
        <Chip text="Ojo: no lo hace todo" color={K.hot} o={chip(10)} />
        <SVG>
          <Plate x={320} y={720} s={1.3} />
          <g transform={`translate(320 900) scale(${1 + 0.06 * Math.sin(t * 6)})`}>
            <rect x={-120} y={-40} width={240} height={80} rx={40} fill={K.flow} />
            <text x={0} y={16} textAnchor="middle" fontSize={40} fontWeight={900} fill={K.ink} fontFamily="MontserratSerie">AVISAR</text>
          </g>
          <Clipboard x={760} y={760} s={1.2} o={0.3 + 0.7 * b10med} p={b10med} />
          <Person x={690} y={1000} s={0.17} o={0.3 + 0.7 * b10med} />
          <Person x={830} y={1000} s={0.17} o={0.3 + 0.7 * b10med} />
        </SVG>
        <Label x={320} y={560} text="las comidas" color={K.white} size={42} o={span(t, Wd(10, "comidas"), E(10))} />
        <Label x={760} y={560} text="tu equipo médico" color={K.cold} size={42} o={dim(span(t, Wd(10, "equipo"), E(10)))} />
      </Scene>

      {/* 11 · curiosidad: medio microlitro */}
      <Scene {...sc(11)}>
        <Chip text="Curiosidad" o={chip(11)} />
        <SVG>
          <rect x={160} y={560} width={300} height={70} rx={14} fill={C.case3} />
          <rect x={440} y={578} width={120} height={34} rx={8} fill={C.case3} />
          <Drop x={572} y={612} s={0.35} />
          {/* lupa */}
          <g opacity={0.3 + 0.7 * b11zoom}>
            <line x1={600} y1={630} x2={660} y2={720} stroke={K.white} strokeWidth={4} strokeDasharray="8 8" />
            <circle cx={720} cy={860} r={190} fill={C.dark} stroke={K.white} strokeWidth={14} />
            <Drop x={720} y={880} s={2.2 + 0.3 * b11zoom + 0.08 * Math.sin(t * 4)} />
            <line x1={850} y1={1000} x2={930} y2={1080} stroke={K.white} strokeWidth={26} strokeLinecap="round" />
          </g>
          <Gear x={300} y={830} r={70} a={t * 160} color={C.case2} />
        </SVG>
        <Label x={300} y={1000} text="cada empujón" color={K.white} size={40} o={span(t, Wd(11, "empujón"), E(11))} />
        <Label x={720} y={590} text="0,5 µL" color={K.flow} size={64} o={dim(span(t, Wd(11, "medio"), E(11)))} />
      </Scene>

      {/* 12 · otra: el prototipo mochila de los años sesenta */}
      <Scene {...sc(12)}>
        <Chip text="Otra curiosidad" o={chip(12)} />
        <SVG>
          <Backpack x={380} y={560} s={0.95} t={t} />
          <g opacity={0.3 + 0.7 * b12hoy}>
            <Person x={790} y={640} s={0.6} />
            <rect x={840} y={900} width={70} height={46} rx={10} fill={C.case2} stroke={C.case3} strokeWidth={4} />
          </g>
        </SVG>
        <Label x={340} y={470} text="AÑOS 60" color={K.flow} size={50} o={span(t, Wd(12, "años"), E(12))} />
        <Label x={790} y={520} text="HOY" color={K.cold} size={50} o={dim(span(t, Wd(12, "mochila") - 0.2, E(12)))} />
      </Scene>

      {/* 13 · cierre */}
      <Scene {...sc(13)}>
        <Chip text="En resumen" o={chip(13)} />
        <SVG><Pump t={t} open={1} push={0.2 + 0.2 * ramp(t, S(13), E(13))} hi="none" flow={1} spin={1} /></SVG>
        <Label x={620} y={560} text="DEPÓSITO" color={K.cold} size={40} o={dim(span(t, Wd(13, "depósito"), E(13)))} />
        <Label x={310} y={1040} text="MOTOR" color={K.flow} size={40} o={dim(span(t, Wd(13, "motor"), E(13)))} />
        <Label x={820} y={420} text="CÁNULA" color={K.white} size={40} o={dim(span(t, Wd(13, "cánula"), E(13)))} />
        <Label x={680} y={1040} text="SENSOR" color={K.cold} size={40} o={dim(span(t, Wd(13, "sensor"), E(13)))} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
