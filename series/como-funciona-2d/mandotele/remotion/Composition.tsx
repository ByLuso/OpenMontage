// Episodio 152 · Cómo funciona el mando a distancia de la tele (infrarrojos). 2D, plantilla de la serie.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en Mando.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Remote, TV, Bursts, Beam, Eye, KeyCut, Chip8, Sun, Bulb, NoiseLine, Phone, RayGun, UltraRemote, Waves, Dog, Bubble, Arrow, LedGlow, BITS, C } from "./Mando";

export const COMP_ID = "MandoTele";
export const HOOK = "Habla con luz invisible"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);
/** Parpadeo en clave: 1 si el bit actual del código está encendido (8 bits/s en pantalla; en la realidad es mucho más rápido). */
const blinkAt = (t: number, rate = 8) => BITS[Math.floor(t * rate) % BITS.length] || (Math.floor(t * rate) % 3 === 0 ? 1 : 0);

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

  // 1 · la tapa se levanta en «esperas»; el led parpadea desde «luz»
  const op1 = 0.99 * R(1, "esperas", 0.7);
  const led1 = R(1, "luz", 0.2) * (0.25 + 0.75 * blink);
  // 2 · rayo tenue (invisible) desde «led»; la tele lo recibe en «tele»
  const tv2 = R(2, "tele", 0.3);
  // 4 · la tecla baja en «baja» y cierra el circuito en «cierra»
  const press4 = 0.15 * R(4, "pulsar", 0.4) + 0.85 * R(4, "baja", 0.35);
  const cur4 = R(4, "cierra", 0.3);
  // 8 · receptor
  const obey = R(8, "obedece", 0.3);
  // 10 · destello en el visor: aparece al pulsar, desaparece en «no» (cámara con filtro) y vuelve con la delantera
  const flash10 = (span(t, Wd(10, "pulsa") + 0.2, Wd(10, "destello"), 0.15) + R(10, "delantera", 0.3)) * (0.3 + 0.7 * blink);
  // 11 · el sol apaga la tele
  const off11 = R(11, "apagarte", 0.25);
  // 12 · golpes del martillito: en «clic» y cada 1,3 s
  const tc = t - Wd(12, "clic");
  const hit12 = tc < -0.05 ? 0 : Math.max(0, 1 - ((tc + 0.05) % 1.3) / 0.25);
  // 13 · resumen
  const resW = ["botón", "código", "luz", "tele"];
  const curR = resW.reduce((acc, w, k) => (t >= Wd(13, w) ? k : acc), -1);
  const resU = (k: number) => (k < 3 ? Wd(13, resW[k + 1]) : E(13));

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el mando GRANDE desde el fotograma 0; en «esperas» se levanta la tapa; en «luz» parpadea el led */}
      <Scene {...sc(1)}>
        <SVG>
          <Remote id="r1" x={520} y={760} s={1.0} t={t} open={op1} led={led1} hi={t > Wd(1, "luz") ? "led" : ""} />
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={540} y={1040} text="LUZ INVISIBLE" size={46} color={K.hot} box o={L(1, "invisible")} />
      </Scene>

      {/* 2 · la promesa: un led infrarrojo que tus ojos no ven y la tele sí */}
      <Scene {...sc(2)}>
        <SVG>
          <Remote id="r2" x={260} y={700} s={0.6} t={t} led={R(2, "led") * (0.3 + 0.7 * blink)} hi={t > Wd(2, "led") ? "led" : ""} />
          <TV x={790} y={680} s={0.95} t={t} ch="5" recv={tv2 * (0.4 + 0.6 * blink)} chFlash={tv2} />
          <Beam a={[505, 700]} b={[790, 787]} t={t} o={R(2, "destellos") * (0.18 + 0.82 * tv2)} />
          <Eye x={300} y={1000} s={0.8} o={dimTo(2, "ojos")} cross={R(2, "ven", 0.3)} />
        </SVG>
        {chip(2, "EL SECRETO")}
        <Label x={270} y={560} text="LED INFRARROJO" size={36} color={K.hot} box o={L(2, "led")} />
        <Label x={300} y={1105} text="TUS OJOS: NADA" size={38} color={K.white} box o={L(2, "ven")} />
        <Label x={790} y={1000} text="LA TELE: SÍ" size={40} color={K.flow} box o={L(2, "tele")} />
      </Scene>

      {/* 3 · la idea clave: botón = código; la luz lo deletrea */}
      <Scene {...sc(3)}>
        <SVG>
          <g opacity={dimTo(3, "botón")}>
            <circle cx={230} cy={640} r={115} fill={C.case1} stroke={C.ink} strokeWidth={6} />
            <circle cx={230} cy={640 + 6 * R(3, "botón", 0.2) * (1 - R(3, "código", 0.3))} r={88} fill={K.warn} stroke={C.ink} strokeWidth={6} />
            <path d="M230,590 L230,640 M200,606 A50,50 0 1 0 260,606" fill="none" stroke={K.white} strokeWidth={10} strokeLinecap="round" />
          </g>
          <Arrow x0={370} y0={640} x1={450} y1={640} o={dimTo(3, "código")} />
          <g opacity={dimTo(3, "código")}>
            <rect x={470} y={570} width={460} height={140} rx={20} fill="rgba(6,16,31,0.85)" stroke={K.flow} strokeWidth={5} />
            <text x={700} y={662} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={64} fill={K.flow}>{BITS.slice(0, 8).join("")}</text>
          </g>
          <LedGlow x={110} y={930} o={dimTo(3, "deletrea") * (0.25 + 0.75 * blink)} r={34} />
          <Bursts x0={170} x1={930} y={960} h={70} scroll={t * 110} o={dimTo(3, "deletrea")} showBits={R(3, "deletrea")} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={230} y={810} text="BOTÓN" size={42} color={K.flow} box o={L(3, "botón")} />
        <Label x={700} y={780} text="CÓDIGO" size={42} color={K.flow} box o={L(3, "código")} />
        <Label x={540} y={1090} text="LA LUZ LO DELETREA" size={40} color={K.hot} box o={L(3, "deletrea")} />
      </Scene>

      {/* 4 · primero: la goma con carbono baja y cierra el circuito */}
      <Scene {...sc(4)}>
        <SVG>
          <KeyCut x={540} y={800} press={press4} current={cur4} t={t} />
        </SVG>
        {chip(4, "PRIMERO: EL BOTÓN")}
        <Label x={200} y={560} text="GOMA" size={42} color={K.white} box o={L(4, "goma")} />
        <Label x={830} y={700} text="CARBONO" size={42} color={K.white} box o={L(4, "carbono")} />
        <Label x={540} y={1080} text="¡CIRCUITO CERRADO!" size={44} color={K.flow} box o={L(4, "cierra")} />
      </Scene>

      {/* 5 · segundo: el chip lo traduce a unos y ceros (aparato + orden) */}
      <Scene {...sc(5)}>
        <SVG>
          <circle cx={150} cy={700} r={56} fill={K.warn} stroke={C.ink} strokeWidth={6} opacity={dimTo(5, "chip")} />
          <Arrow x0={220} y0={700} x1={400} y1={700} color={K.flow} o={dimTo(5, "traduce")} />
          <Chip8 x={540} y={700} t={t} hot={R(5, "chip")} />
          <Arrow x0={540} y0={830} x1={540} y1={900} color={K.flow} o={dimTo(5, "unos")} />
          <g opacity={dimTo(5, "unos")}>
            {BITS.map((b, k) => {
              const ap = k < 8;
              const on = ap ? R(5, "aparato", 0.3) : R(5, "orden", 0.3);
              return <text key={k} x={182 + k * 46 + (ap ? 0 : 24)} y={990} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={56}
                fill={on > 0.5 ? (ap ? K.cold : K.flow) : K.white}>{b}</text>;
            })}
          </g>
        </SVG>
        {chip(5, "SEGUNDO: EL CHIP")}
        <Label x={540} y={530} text="CHIP" size={40} color={K.flow} box o={L(5, "chip")} />
        <Label x={343} y={1070} text="¿QUÉ APARATO?" size={36} color={K.cold} box o={L(5, "aparato")} />
        <Label x={735} y={1070} text="¿QUÉ ORDEN?" size={36} color={K.flow} box o={L(5, "orden")} />
      </Scene>

      {/* 6 · tercero: ráfagas; cada ráfaga parpadea ~38.000 veces por segundo */}
      <Scene {...sc(6)}>
        <SVG>
          <Remote id="r6" x={240} y={540} s={0.5} t={t} led={dimTo(6, "led") * (0.3 + 0.7 * blink)} hi="led" />
          <Bursts x0={120} x1={920} y={800} h={110} scroll={t * 150} o={dimTo(6, "ráfagas")} />
          {/* lupa: una ráfaga por dentro */}
          <g opacity={dimTo(6, "parpadean")}>
            <path d="M120,820 L140,930 M920,820 L900,930" stroke={C.case3} strokeWidth={3} strokeDasharray="8 8" />
            <rect x={140} y={930} width={760} height={110} rx={16} fill="rgba(6,16,31,0.85)" stroke={K.hot} strokeWidth={4} />
            <path fill="none" stroke={K.hot} strokeWidth={6} strokeLinejoin="round"
              d={Array.from({ length: 30 }).map((_, k) => { const x = 160 + k * 24 - ((t * 60) % 24); return `M${x},1020 L${x},950 L${x + 12},950 L${x + 12},1020 L${x + 24},1020`; }).join(" ")} />
          </g>
        </SVG>
        {chip(6, "TERCERO: RÁFAGAS")}
        <Label x={700} y={540} text="RÁFAGAS" size={42} color={K.hot} box o={L(6, "ráfagas")} />
        <Label x={540} y={1100} text="≈ 38.000 VECES POR SEGUNDO" size={38} color={K.flow} box o={L(6, "treinta")} />
      </Scene>

      {/* 7 · por qué: el sol y las bombillas también dan infrarrojo; el ritmo separa tu mando del ruido */}
      <Scene {...sc(7)}>
        <SVG>
          <Sun x={200} y={560} r={56} t={t} o={dimTo(7, "sol")} />
          <Bulb x={200} y={810} s={0.85} t={t} o={dimTo(7, "bombillas")} />
          <Remote id="r7" x={210} y={1040} s={0.36} t={t} led={0.3 + 0.7 * blink} />
          <NoiseLine x0={400} x1={920} y={600} t={t} o={dimTo(7, "infrarrojo") * (1 - 0.6 * R(7, "separa"))} />
          <NoiseLine x0={400} x1={920} y={850} t={t + 3} a={20} o={dimTo(7, "infrarrojo") * (1 - 0.6 * R(7, "separa"))} />
          <Bursts x0={400} x1={920} y={1070} h={60} scroll={t * 150} o={dimTo(7, "ritmo")} />
          <rect x={385} y={995} width={550} height={95} rx={14} fill="none" stroke={K.flow} strokeWidth={5} opacity={R(7, "separa")} />
        </SVG>
        {chip(7, "¿POR QUÉ TAN RÁPIDO?")}
        <Label x={660} y={480} text="RUIDO INFRARROJO" size={38} color={C.noise} box o={L(7, "infrarrojo")} />
        <Label x={660} y={725} text="ESTE RITMO = TU MANDO" size={38} color={K.flow} box o={L(7, "separa")} />
      </Scene>

      {/* 8 · cuarto: el receptor de la tele solo escucha ese ritmo, descifra y obedece */}
      <Scene {...sc(8)}>
        <SVG>
          <TV x={600} y={600} s={1.1} t={t} ch={obey > 0.5 ? "8" : "7"} recv={dimTo(8, "receptor") * (0.4 + 0.6 * blink)} chFlash={obey} />
          <NoiseLine x0={120} x1={430} y={960} t={t} a={18} o={dimTo(8, "escucha")} color={C.noise} />
          <Bursts x0={120} x1={430} y={1030} h={45} scroll={t * 150} o={dimTo(8, "escucha")} />
          <rect x={440} y={900} width={200} height={140} rx={18} fill={C.inner} stroke={K.hot} strokeWidth={5} opacity={dimTo(8, "escucha")} />
          <path d="M470,970 Q505,925 540,970 T610,970" fill="none" stroke={K.hot} strokeWidth={7} opacity={dimTo(8, "escucha")} />
          <path d="M440,925 L410,925" stroke={K.warn} strokeWidth={10} strokeLinecap="round" opacity={R(8, "escucha")} />
          <Bursts x0={650} x1={920} y={1000} h={45} scroll={t * 150} o={R(8, "descifra")} showBits={R(8, "descifra")} />
          <Arrow x0={600} y0={890} x1={600} y1={760} color={K.flow} o={R(8, "obedece")} />
        </SVG>
        {chip(8, "CUARTO: LA TELE")}
        <Label x={210} y={740} text="RECEPTOR" size={40} color={K.hot} box o={L(8, "receptor")} />
        <Label x={540} y={1105} text="SOLO ESE RITMO" size={40} color={K.flow} box o={L(8, "escucha")} />
        <Label x={600} y={415} text="¡OBEDECE!" size={44} color={K.flow} box o={L(8, "obedece")} />
      </Scene>

      {/* 9 · cada fabricante, su idioma: tu mando casi nunca sirve con otra marca */}
      <Scene {...sc(9)}>
        <SVG>
          <Remote id="r9" x={230} y={790} s={0.42} rot={-90} t={t} led={0.3 + 0.7 * blink} />
          <Bubble x={230} y={480} w={280} color={K.flow} bits={BITS.slice(0, 8)} o={dimTo(9, "idioma")} tail={0} />
          <TV x={780} y={590} s={0.62} t={t} ch="1" recv={0.4 + 0.6 * blink} />
          <TV x={780} y={950} s={0.62} t={t} on={0.5} />
          <Beam a={[230, 620]} b={[780, 660]} t={t} o={0.9} color={K.hot} w={8} />
          <Beam a={[230, 620]} b={[780, 1020]} t={t} o={0.9 - 0.5 * R(9, "marca")} color={K.hot} w={8} />
          <path d="M700,890 L860,1010 M860,890 L700,1010" stroke={K.warn} strokeWidth={18} strokeLinecap="round" opacity={R(9, "marca", 0.3)} />
        </SVG>
        {chip(9, "CADA UNO, SU IDIOMA")}
        <Label x={780} y={440} text="SU TELE: SÍ" size={36} color={K.flow} box o={L(9, "idioma")} />
        <Label x={735} y={1105} text="OTRA MARCA: NO" size={38} color={K.warn} box o={L(9, "marca")} />
      </Scene>

      {/* 10 · truco: la cámara del móvil ve el destello; si no, prueba la delantera */}
      <Scene {...sc(10)}>
        <SVG>
          <Remote id="r10" x={230} y={720} s={0.42} t={t} led={0} />
          <Beam a={[395, 720]} b={[560, 720]} t={t} o={0.3 * R(10, "apúntalo")} />
          <Phone x={700} y={720} s={0.95} t={t} flash={flash10} frontHi={R(10, "delantera")} />
        </SVG>
        {chip(10, "TRUCO")}
        <Label x={270} y={540} text="¿FUNCIONA?" size={42} color={K.flow} box o={L(10, "funciona")} />
        <Label x={540} y={1090} text="¡LO VE LA CÁMARA!" size={40} color={K.white} box o={span(t, Wd(10, "pulsa") + 0.2, Wd(10, "destello"))} />
        <Label x={540} y={1090} text="PRUEBA LA DELANTERA" size={40} color={K.flow} box o={L(10, "delantera")} />
      </Scene>

      {/* 11 · curiosidad: 1955, luz normal… y el sol apagaba la tele */}
      <Scene {...sc(11)}>
        <SVG>
          <Sun x={880} y={450} r={46} t={t} o={dimTo(11, "sol")} />
          <Beam a={[860, 500]} b={[789, 563]} t={t} o={R(11, "sol")} color={K.flow} w={7} />
          <RayGun x={220} y={780} s={0.9} />
          <Beam a={[372, 742]} b={[624, 563]} t={t} o={span(t, Wd(11, "luz"), Wd(11, "sol"))} color={K.flow} />
          <TV x={720} y={640} s={0.85} t={t} ch="3" on={1 - off11} cells={dimTo(11, "luz")} />
        </SVG>
        {chip(11, "CURIOSIDAD")}
        <Label x={230} y={560} text="1955" size={56} color={K.flow} box o={L(11, "1955")} />
        <Label x={230} y={990} text="LUZ NORMAL" size={40} color={K.white} box o={L(11, "luz")} />
        <Label x={680} y={1075} text="¡EL SOL LA APAGA!" size={40} color={K.warn} box o={L(11, "apagarte")} />
      </Scene>

      {/* 12 · otra: 1956, ultrasonidos; clic al pulsar; algunos perros los oían */}
      <Scene {...sc(12)}>
        <SVG>
          <UltraRemote x={280} y={760} t={t} hit={hit12} />
          <Waves x={420} y={720} t={t} o={dimTo(12, "ultrasonidos")} dir={10} n={4} r0={30} step={60} />
          <Dog x={800} y={760} s={0.95} t={t} ears={R(12, "perros", 0.3)} />
        </SVG>
        {chip(12, "OTRA: 1956")}
        <Label x={560} y={500} text="ULTRASONIDOS" size={42} color={K.cold} box o={L(12, "ultrasonidos")} />
        <Label x={280} y={1000} text="¡CLIC!" size={48} color={K.white} box o={L(12, "clic")} />
        <Label x={720} y={1090} text="¡LO OYE!" size={42} color={K.flow} box o={L(12, "perros")} />
      </Scene>

      {/* 13 · cierre: resumen */}
      <Scene {...sc(13)}>
        <SVG>
          <g opacity={curR >= 0 ? 1 : 0.35}>
            <circle cx={260} cy={600} r={90} fill={K.warn} stroke={curR === 0 ? K.flow : C.ink} strokeWidth={8} />
          </g>
          <Arrow x0={380} y0={600} x1={560} y1={600} o={curR >= 1 ? 1 : 0.3} color={K.flow} />
          <g opacity={curR >= 1 ? 1 : 0.35}>
            <rect x={590} y={540} width={340} height={120} rx={20} fill="rgba(6,16,31,0.85)" stroke={curR === 1 ? K.flow : C.case3} strokeWidth={6} />
            <text x={760} y={622} textAnchor="middle" fontFamily="monospace" fontWeight={900} fontSize={56} fill={K.flow}>{BITS.slice(0, 6).join("")}</text>
          </g>
          <Arrow x0={760} y0={680} x1={420} y1={820} o={curR >= 2 ? 1 : 0.3} color={K.flow} />
          <g opacity={curR >= 2 ? 1 : 0.35}>
            <Remote id="r13" x={300} y={900} s={0.4} t={t} led={curR >= 2 ? 0.3 + 0.7 * blink : 0} />
          </g>
          <Beam a={[455, 900]} b={[650, 900]} t={t} o={curR >= 2 ? 0.8 : 0.15} />
          <TV x={790} y={870} s={0.6} t={t} ch={curR >= 3 ? "8" : "7"} recv={curR >= 3 ? 0.4 + 0.6 * blink : 0} o={curR >= 3 ? 1 : 0.35} chFlash={curR >= 3 ? 1 : 0} />
        </SVG>
        {chip(13, "RESUMEN")}
        {resW.map((w, k) => (
          <Label key={w} x={540} y={1100} text={["BOTÓN", "CÓDIGO", "LUZ QUE PARPADEA", "TELE QUE ESCUCHA"][k]} size={44} color={K.flow} box
            o={span(t, Wd(13, w), resU(k))} />
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
