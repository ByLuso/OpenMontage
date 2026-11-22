// Episodio 160 · Cómo llega internet por la fibra óptica de tu casa. 2D, plantilla de la serie.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en Fibra.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { DropCable, Pulses, HairStrand, FiberZoom, CrossSection, HairDot, Central, BitStrip, Spectrum, Eye, House, Splitter, NoPlug, Router, ElecWave,
  FiberEnd, Warn, WaterJet, Ocean, Arrow, BITS, C } from "./Fibra";

export const COMP_ID = "FibraOptica";
export const HOOK = "Internet viaja en luz"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);
/** Parpadeo del láser en clave (8 bits/s en pantalla; en la realidad, miles de millones por segundo). */
const blinkAt = (t: number, rate = 8) => BITS[Math.floor(t * rate) % BITS.length];

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
  const blink = blinkAt(t);

  // 1 · la funda se abre en «dentro»
  const op1 = R(1, "dentro", 0.7);
  // 12 · resumen
  const resW = ["láser", "cristal", "router", "internet"];
  const curR = resW.reduce((acc, w, k) => (t >= Wd(12, w) ? k : acc), -1);
  const resU = (k: number) => (k < 3 ? Wd(12, resW[k + 1]) : E(12));
  const on = (k: number) => (curR >= k ? 1 : 0.35);

  // 7 · salidas del divisor hacia las casas
  const houseY = [480, 610, 740, 870, 1000];

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el cable de fibra GRANDE desde el fotograma 0; en «dentro» la funda se parte y aparece el hilo con luz */}
      <Scene {...sc(1)}>
        <SVG>
          <g transform={`translate(0,${4 * Math.sin(t * 2)})`}>
            <DropCable x0={150} x1={930} y={800} t={t} open={op1} />
          </g>
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={540} y={1070} text="¡LUZ!" size={56} color={K.hot} box o={span(t, Wd(1, "dentro"), E(1), 0.2)} />
      </Scene>

      {/* 2 · la promesa: un hilo de cristal del grosor de un pelo; internet viaja hecho luz */}
      <Scene {...sc(2)}>
        <SVG>
          <g opacity={dimTo(2, "hilo")}>
            <rect x={90} y={640} width={900} height={30} rx={15} fill={C.glass2} opacity={0.6} stroke={C.glass} strokeWidth={4} />
            <rect x={90} y={649} width={900} height={12} rx={6} fill={C.glass} opacity={0.9} />
          </g>
          <Pulses x0={100} x1={980} y={655} t={t} r={10} gap={85} o={R(2, "luz", 0.3)} />
          <HairStrand x0={90} x1={990} y={880} t={t} w={24} o={dimTo(2, "pelo")} />
        </SVG>
        {chip(2, "EL SECRETO")}
        <Label x={540} y={560} text="HILO DE CRISTAL" size={42} color={K.cold} box o={L(2, "cristal")} />
        <Label x={540} y={970} text="UN PELO" size={40} color={K.white} box o={L(2, "pelo")} />
        <Label x={540} y={1090} text="INTERNET = LUZ" size={48} color={K.hot} box o={L(2, "luz")} />
      </Scene>

      {/* 3 · la idea clave: la luz va atrapada, rebotando como en un pasillo de espejos */}
      <Scene {...sc(3)}>
        <SVG>
          <FiberZoom x0={70} x1={1010} y={780} t={t} ray={dimTo(3, "atrapada")} mirror={R(3, "espejos", 0.3)} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={540} y={560} text="LUZ ATRAPADA" size={46} color={K.hot} box o={L(3, "atrapada")} />
        <Label x={540} y={1010} text="PASILLO DE ESPEJOS" size={44} color={K.flow} box o={L(3, "espejos")} />
      </Scene>

      {/* 4 · primero: núcleo de 9 micras (mucho más fino que un pelo) envuelto en otro vidrio que hace de espejo */}
      <Scene {...sc(4)}>
        <SVG>
          <CrossSection x={360} y={760} k={2.6} t={t} core={dimTo(4, "centro")} clad={R(4, "vidrio", 0.4)} hiCore={R(4, "centro")} />
          <circle cx={360} cy={760} r={16} fill="none" stroke={K.flow} strokeWidth={5} opacity={R(4, "espejo", 0.3)} style={{ filter: `drop-shadow(0 0 10px ${K.flow})` }} />
          <HairDot x={800} y={760} k={2.6} o={dimTo(4, "pelo")} />
          <Arrow x0={360} y0={615} x1={360} y1={735} color={K.hot} o={R(4, "centro")} w={6} />
        </SVG>
        {chip(4, "PRIMERO: EL CRISTAL")}
        <Label x={360} y={560} text="NÚCLEO: 9 MICRAS" size={38} color={K.hot} box o={L(4, "centro")} />
        <Label x={800} y={630} text="PELO ≈ 70 MICRAS" size={34} color={K.white} box o={L(4, "pelo", Wd(4, "espejo"))} />
        <Label x={360} y={970} text="OTRO VIDRIO" size={38} color={K.cold} box o={L(4, "vidrio")} />
        <Label x={540} y={1095} text="REFLEXIÓN TOTAL INTERNA" size={40} color={K.flow} box o={L(4, "espejo")} />
      </Scene>

      {/* 5 · segundo: en la central, un láser parpadea: luz fuerte = 1, floja = 0 */}
      <Scene {...sc(5)}>
        <SVG>
          <g opacity={dimTo(5, "central")}><Central x={220} y={620} s={0.8} t={t} laser={blink} /></g>
          <rect x={382} y={721} width={620} height={18} rx={9} fill={C.glass2} stroke={C.glass} strokeWidth={3} opacity={0.8} />
          <Pulses x0={390} x1={995} y={730} t={t} r={10} gap={75} speed={300} o={dimTo(5, "láser")} />
          <BitStrip x0={110} x1={980} y={940} t={t} o={dimTo(5, "parpadea")} showBits={R(5, "fuerte")} />
        </SVG>
        {chip(5, "SEGUNDO: EL LÁSER")}
        <Label x={220} y={420} text="LA CENTRAL" size={36} color={K.white} box o={L(5, "central")} />
        <Label x={690} y={560} text="MILES DE MILLONES / SEG" size={34} color={K.flow} box o={L(5, "millones")} />
        <Label x={540} y={1110} text="FUERTE = 1 · FLOJA = 0" size={40} color={K.flow} box o={L(5, "fuerte")} />
      </Scene>

      {/* 6 · luz infrarroja (1310/1490 nm): no la ves, y el cristal apenas la debilita */}
      <Scene {...sc(6)}>
        <SVG>
          <Spectrum x0={90} x1={990} y={620} t={t} o={0.6 + 0.4 * R(6, "infrarroja")} mark={R(6, "nanómetros")} />
          <Eye x={260} y={930} s={0.7} o={dimTo(6, "ves")} cross={R(6, "ves", 0.3)} />
          <rect x={470} y={921} width={510} height={18} rx={9} fill={C.glass2} stroke={C.glass} strokeWidth={3} opacity={dimTo(6, "cristal")} />
          <Pulses x0={480} x1={970} y={930} t={t} r={10} gap={70} o={dimTo(6, "cristal")} />
        </SVG>
        {chip(6, "LUZ QUE NO VES")}
        <Label x={680} y={510} text="INFRARROJO" size={42} color={K.hot} box o={L(6, "infrarroja")} />
        <Label x={260} y={1060} text="NO LA VES" size={40} color={K.white} box o={L(6, "ves")} />
        <Label x={725} y={1060} text="APENAS SE DEBILITA" size={36} color={K.cold} box o={L(6, "debilita")} />
      </Scene>

      {/* 7 · tercero: un divisor sin enchufe reparte una fibra entre muchas casas (a menudo 64) */}
      <Scene {...sc(7)}>
        <SVG>
          <rect x={60} y={731} width={240} height={18} rx={9} fill={C.glass2} stroke={C.glass} strokeWidth={3} />
          <Pulses x0={70} x1={300} y={740} t={t} r={10} gap={70} />
          {houseY.map((hy, k) => {
            const sy = 660 + k * 40;
            return <g key={k} opacity={dimTo(7, "reparte")}>
              <path d={`M460,${sy} C600,${sy} 600,${hy + 20} 740,${hy + 20}`} fill="none" stroke={C.glass} strokeWidth={6} />
              <path d={`M460,${sy} C600,${sy} 600,${hy + 20} 740,${hy + 20}`} fill="none" stroke={K.hot} strokeWidth={6} strokeDasharray="14 40"
                strokeDashoffset={-t * 160} opacity={R(7, "reparte")} />
            </g>;
          })}
          <Splitter x={380} y={740} o={dimTo(7, "divisor")} />
          {houseY.map((hy, k) => <House key={k} x={800} y={hy} s={0.8} lit={R(7, "casas") > 0.5 && (k + Math.floor(t * 2)) % 4 !== 0 ? 1 : 0} o={dimTo(7, "casas")} />)}
          <NoPlug x={200} y={960} s={0.9} o={dimTo(7, "enchufe")} />
        </SVG>
        {chip(7, "TERCERO: EL DIVISOR")}
        <Label x={380} y={560} text="DIVISOR" size={40} color={K.cold} box o={L(7, "divisor")} />
        <Label x={200} y={1055} text="SIN ENCHUFE" size={36} color={K.warn} box o={L(7, "enchufe")} />
        <Label x={650} y={1110} text="A MENUDO, 64 CASAS" size={40} color={K.flow} box o={L(7, "sesenta")} />
      </Scene>

      {/* 8 · cuarto: el router de fibra convierte los destellos en señal eléctrica, y de ahí al wifi */}
      <Scene {...sc(8)}>
        <SVG>
          <rect x={60} y={811} width={300} height={18} rx={9} fill={C.glass2} stroke={C.glass} strokeWidth={3} />
          <Pulses x0={70} x1={355} y={820} t={t} r={10} gap={70} o={dimTo(8, "destellos")} />
          <Router x={580} y={820} s={1.05} t={t} on={R(8, "router")} wifi={R(8, "wifi")} o={dimTo(8, "router")} />
          <ElecWave x0={790} x1={1010} y={820} t={t} o={R(8, "eléctrica")} />
        </SVG>
        {chip(8, "CUARTO: TU ROUTER")}
        <Label x={210} y={730} text="LUZ" size={40} color={K.hot} box o={L(8, "destellos")} />
        <Label x={880} y={730} text="ELECTRICIDAD" size={34} color={K.flow} box o={L(8, "eléctrica")} />
        <Label x={580} y={1030} text="ROUTER DE FIBRA" size={42} color={K.white} box o={L(8, "router")} />
      </Scene>

      {/* 9 · truco: nunca mires de frente un extremo de fibra encendido */}
      <Scene {...sc(9)}>
        <SVG>
          <FiberEnd x={460} y={760} s={1} t={t} beam={R(9, "invisible")} />
          <Eye x={850} y={760} s={0.7} danger={R(9, "dañarte", 0.4)} cross={0} />
          <Warn x={850} y={560} s={0.8} o={R(9, "dañarte", 0.3)} />
        </SVG>
        {chip(9, "TRUCO: ¡OJO!", K.warn)}
        <Label x={420} y={630} text="LUZ INVISIBLE" size={38} color={K.hot} box o={L(9, "invisible")} />
        <Label x={540} y={1050} text="¡NUNCA DE FRENTE!" size={46} color={K.warn} box o={span(t, Wd(9, "nunca"), Wd(9, "dañarte"))} />
        <Label x={540} y={1050} text="PUEDE DAÑAR TUS OJOS" size={44} color={K.warn} box o={span(t, Wd(9, "dañarte") + 0.3, E(9))} />
      </Scene>

      {/* 10 · curiosidad: 1842, la luz atrapada en un chorro de agua curvo */}
      <Scene {...sc(10)}>
        <SVG>
          <g transform="translate(330,600) scale(0.85)">
            <WaterJet x={0} y={0} t={t} light={R(10, "atrapó", 0.5)} />
          </g>
        </SVG>
        {chip(10, "CURIOSIDAD")}
        <Label x={800} y={470} text="1842" size={56} color={K.flow} box o={L(10, "1842")} />
        <Label x={780} y={640} text="LUZ ATRAPADA" size={38} color={K.flow} box o={L(10, "atrapó")} />
        <Label x={420} y={1110} text="CHORRO DE AGUA" size={40} color={K.cold} box o={L(10, "chorro")} />
      </Scene>

      {/* 11 · otra: casi todo internet entre continentes va por fibras en el fondo del mar */}
      <Scene {...sc(11)}>
        <SVG>
          <Ocean y={580} t={t} light={dimTo(11, "fibras")} />
        </SVG>
        {chip(11, "OTRA")}
        <Label x={540} y={470} text="ENTRE CONTINENTES" size={42} color={K.white} box o={L(11, "continentes")} />
        <Label x={540} y={1080} text="EN EL FONDO DEL MAR" size={42} color={K.cold} box o={L(11, "fondo")} />
      </Scene>

      {/* 12 · cierre: láser → cristal espejo → router */}
      <Scene {...sc(12)}>
        <SVG>
          <g opacity={on(0)}><Central x={180} y={640} s={0.6} t={t} laser={curR >= 0 ? blink : 0} /></g>
          <g opacity={on(1)}><FiberZoom x0={310} x1={740} y={723} t={t} clad={110} core={58} ray={1} mirror={curR === 1 ? 1 : 0} /></g>
          <g opacity={on(2)}><Router x={845} y={723} s={0.45} t={t} on={curR >= 2 ? 1 : 0} wifi={curR >= 3 ? 1 : 0} /></g>
          <g opacity={on(3)}>
            {[0, 1, 2].map((k) => <House key={k} x={300 + k * 240} y={930} s={0.8} lit={curR >= 3 && (k + Math.floor(t * 2)) % 3 !== 0 ? 1 : 0} />)}
          </g>
        </SVG>
        {chip(12, "RESUMEN")}
        {resW.map((w, k) => (
          <Label key={w} x={540} y={1100} text={["LÁSER", "CRISTAL ESPEJO", "ROUTER", "¡INTERNET!"][k]} size={44} color={K.flow} box
            o={span(t, Wd(12, w), resU(k))} />
        ))}
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
