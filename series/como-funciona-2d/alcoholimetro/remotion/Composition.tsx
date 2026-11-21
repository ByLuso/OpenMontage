// Episodio 155 · Cómo sabe el alcoholímetro lo que has bebido soplando. 2D, plantilla de la serie.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en Alcoholimetro.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Device, FuelCell, Mol, Flow, Bolt, Head, Lungs, Drop, Cloud, Timer, CrystalTube, C, rnd } from "./Alcoholimetro";

export const COMP_ID = "Alcoholimetro";
export const HOOK = "Tu alcohol da corriente"; // = meta.portada (≤5 palabras, la última va en amarillo)
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

  // beat 1: la tapa se abre en «secreto»; la pila se enciende en «convierte»→«electricidad»
  const op1 = R(1, "secreto", 0.7);
  const gl1 = ramp(t, Wd(1, "convierte"), Wd(1, "electricidad") + 0.3);
  // beat 2: el alcohol llega a la pila en «oxida»
  const rate2 = 0.15 + 0.6 * R(2, "oxida", 0.8);
  // beat 3: sangre → aliento → aparato
  const f3a = R(3, "pasa"); const f3b = R(3, "midiendo");
  // beat 4: alveolo; en «cede» las moléculas saltan de la sangre al aire
  const jump4 = ramp(t, Wd(4, "cede") - 0.2, E(4) - 0.3);
  // beat 6: curva del soplido
  const pr6 = ramp(t, Wd(6, "soplido"), Wd(6, "lleva") + 0.2);
  // beat 7: más alcohol, más corriente
  const rate7 = 0.25 + 0.75 * ramp(t, Wd(7, "cuanto"), Wd(7, "corriente") + 0.3);
  // beat 8: el alcohol se traga la luz
  const abs8 = ramp(t, Wd(8, "traga") - 0.2, Wd(8, "menos") + 0.3);
  // beat 9: espera
  const wait9 = ramp(t, Wd(9, "espera"), Wd(9, "porque"));
  const high9 = R(9, "mas", 0.3);
  // beat 10: globo e indicador que cambia de color
  const bal10 = ramp(t, Wd(10, "soplabas"), Wd(10, "globo") + 0.5);
  const col10 = ramp(t, Wd(10, "cambiaba"), Wd(10, "color") + 0.5);
  // beat 11: avance del verde
  const g11 = ramp(t, Wd(11, "verdes") - 0.3, E(11) - 0.3);
  // beat 12: resumen
  const resW = ["sangre", "aliento", "corriente"];
  const curR = resW.reduce((acc, w, k) => (t >= Wd(12, w) ? k : acc), -1);

  // curva del soplido (beat 6): alcohol en el aire a lo largo del soplido
  const gx0 = 170, gx1 = 900, gy0 = 1010, gy1 = 560;
  const fcurve = (u: number) => 1 - Math.exp(-3.2 * Math.max(0, u - 0.08)) * (u < 0.08 ? 1 : 1);
  const pts6 = Array.from({ length: 61 }).map((_, i) => i / 60).filter((u) => u <= pr6 + 1e-6);
  const path6 = pts6.map((u, i) => `${i ? "L" : "M"}${(gx0 + (gx1 - gx0) * u).toFixed(1)},${(gy0 - (gy0 - gy1) * 0.92 * Math.max(0, fcurve(u))).toFixed(1)}`).join(" ");
  const head6 = pts6.length ? pts6[pts6.length - 1] : 0;

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el alcoholímetro GRANDE desde el fotograma 0; en «secreto» se abre la tapa; en «electricidad» la pila da corriente */}
      <Scene {...sc(1)}>
        <SVG>
          <Device id="d1" x={540 - 160 * op1} y={805} s={1.05} t={t} open={op1} shellDx={330} reading="- - -" glow={gl1} blow={0.6 * (1 - op1)} />
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={380} y={1120} text="¡ELECTRICIDAD!" size={46} color={K.flow} box o={L(1, "electricidad")} />
      </Scene>

      {/* 2 · la promesa: pila de combustible; el alcohol se oxida sobre platino y suelta corriente */}
      <Scene {...sc(2)}>
        <SVG>
          <FuelCell x={540} y={720} s={1.2} t={t} rate={rate2} mols={dimTo(2, "alcohol")} />
        </SVG>
        {chip(2, "EL SECRETO")}
        <Label x={540} y={636} text="PLATINO" size={38} color={C.ink} o={L(2, "platino")} />
        <Label x={540} y={1120} text="PILA DE COMBUSTIBLE" size={44} color={K.white} box o={L(2, "pila", Wd(2, "corriente") - 0.05)} />
        <Label x={540} y={1120} text="¡CORRIENTE!" size={48} color={K.flow} box o={span(t, Wd(2, "corriente") + 0.25, E(2))} />
      </Scene>

      {/* 3 · la idea clave: sangre → aliento → el aparato calcula */}
      <Scene {...sc(3)}>
        <SVG>
          <Drop x={190} y={690} s={1.2} o={dimTo(3, "sangre")} />
          <Flow d="M280,690 L380,690" t={t} color={C.etoh} o={f3a} w={9} />
          <Cloud x={530} y={690} s={1.1} t={t} o={dimTo(3, "aliento")} />
          {Array.from({ length: 4 }).map((_, k) => <Mol key={k} x={470 + 40 * k} y={680 + 18 * Math.sin(t * 2 + k)} s={0.8} o={f3a} />)}
          <Flow d="M680,690 L760,690" t={t} color={K.cold} o={f3b} w={9} />
          <Device id="d3" x={860} y={780} s={0.52} t={t} reading={t > Wd(3, "calcula") ? "g/l" : "···"} glow={0} blow={f3b} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={190} y={1000} text="SANGRE" size={42} color={C.blood} box o={L(3, "sangre")} />
        <Label x={530} y={1000} text="ALIENTO" size={42} color={K.cold} box o={L(3, "aliento")} />
        <Label x={760} y={1080} text="SE CALCULA" size={40} color={K.flow} box o={L(3, "calcula")} />
      </Scene>

      {/* 4 · primero: en los pulmones la sangre roza el aire y le cede alcohol (ley de Henry) */}
      <Scene {...sc(4)}>
        <SVG>
          <Lungs x={190} y={700} s={0.6} t={t} air={0.7} />
          <circle cx={240} cy={740} r={34} fill="none" stroke={K.flow} strokeWidth={6} opacity={R(4, "sangre")} />
          <path d="M268,720 L430,560 M268,760 L430,900" stroke={K.flow} strokeWidth={4} strokeDasharray="10 10" opacity={0.6 * R(4, "sangre")} />
          {/* saco de aire */}
          <circle cx={680} cy={660} r={210} fill="rgba(53,196,240,0.14)" stroke={K.cold} strokeWidth={8} />
          {/* capilar con sangre */}
          <path d="M440,900 C560,850 790,850 895,900" fill="none" stroke={C.blood} strokeWidth={70} strokeLinecap="round" opacity={dimTo(4, "sangre")} />
          {Array.from({ length: 7 }).map((_, k) => {
            const base = (t * 0.12 + k / 7) % 1; const bx = 470 + 430 * base; const by = 900 - 70 * Math.sin(Math.PI * base) * 0.75;
            const j = clamp(jump4 * 1.4 - (k % 3) * 0.2);
            const up = k % 2 === 0 ? j : 0;
            return <Mol key={k} x={bx} y={by - up * (200 + 60 * rnd(k))} s={0.85} rot={30 * Math.sin(t * 3 + k)} o={dimTo(4, "sangre")} />;
          })}
          {Array.from({ length: 3 }).map((_, k) => <circle key={k} cx={560 + 120 * k} cy={540 + 20 * Math.sin(t * 2 + k)} r={10} fill={K.cold} opacity={0.6} />)}
        </SVG>
        {chip(4, "1 · LOS PULMONES", C.blood)}
        <Label x={680} y={500} text="AIRE" size={40} color={K.cold} box o={L(4, "aire")} />
        <Label x={680} y={1020} text="SANGRE" size={40} color={C.blood} box o={L(4, "roza")} />
        <Label x={260} y={1110} text="LEY DE HENRY" size={40} color={K.flow} box o={L(4, "henry")} />
      </Scene>

      {/* 5 · en España: el alcohol de 1 litro de sangre = el de 2.000 litros de aliento */}
      <Scene {...sc(5)}>
        <SVG>
          {/* vaso con 1 litro de sangre */}
          <g opacity={dimTo(5, "litro")}>
            <path d="M150,560 L170,900 C172,930 190,940 220,940 L300,940 C330,940 348,930 350,900 L370,560" fill="rgba(201,214,230,0.12)" stroke={C.pt} strokeWidth={7} />
            <path d="M162,700 L170,900 C172,930 190,940 220,940 L300,940 C330,940 348,930 350,900 L358,700 Z" fill={C.blood} />
            {Array.from({ length: 6 }).map((_, k) => <Mol key={k} x={200 + 60 * (k % 3) + 6 * Math.sin(t * 2 + k)} y={760 + 70 * Math.floor(k / 3)} s={0.8} />)}
          </g>
          <text x={440} y={780} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={110} fill={K.white} opacity={R(5, "dos")}>=</text>
          {/* caja enorme de aliento */}
          <g opacity={dimTo(5, "aliento")}>
            <rect x={520} y={480} width={400} height={460} rx={30} fill="rgba(53,196,240,0.14)" stroke={K.cold} strokeWidth={7} strokeDasharray="20 14" strokeDashoffset={-t * 30} />
            {Array.from({ length: 6 }).map((_, k) => <Mol key={k} x={570 + 300 * rnd(k + 3) + 14 * Math.sin(t + k)} y={530 + 360 * rnd(k + 9) + 14 * Math.cos(t * 1.3 + k)} s={0.8} />)}
          </g>
        </SVG>
        {chip(5, "EN ESPAÑA")}
        <Label x={240} y={1020} text="1 L DE SANGRE" size={40} color={C.blood} box o={L(5, "litro")} />
        <Label x={690} y={1020} text="2.000 L DE ALIENTO" size={40} color={K.cold} box o={L(5, "dos")} />
        <Label x={540} y={1110} text="MISMO ALCOHOL" size={42} color={K.flow} box o={L(5, "aliento")} />
      </Scene>

      {/* 6 · segundo: el soplido largo; el aire del final es el que más alcohol lleva */}
      <Scene {...sc(6)}>
        <SVG>
          <line x1={gx0} y1={gy0} x2={gx1 + 20} y2={gy0} stroke={C.case3} strokeWidth={6} />
          <line x1={gx0} y1={gy0} x2={gx0} y2={gy1 - 40} stroke={C.case3} strokeWidth={6} />
          <path d={`M${gx1 + 20},${gy0} l-20,-12 l0,24 Z M${gx0},${gy1 - 40} l-12,20 l24,0 Z`} fill={C.case3} />
          <text x={gx0 + 20} y={gy1 - 50} fontFamily="MontserratSerie" fontWeight={800} fontSize={30} fill={C.case3}>ALCOHOL EN EL AIRE</text>
          <text x={gx1} y={gy0 + 50} textAnchor="end" fontFamily="MontserratSerie" fontWeight={800} fontSize={30} fill={C.case3}>TIEMPO SOPLANDO</text>
          <rect x={gx0 + 4} y={gy1 - 10} width={(gx1 - gx0) * 0.3} height={gy0 - gy1 + 6} fill="rgba(159,179,204,0.10)" opacity={R(6, "boca")} />
          <rect x={gx0 + (gx1 - gx0) * 0.72} y={gy1 - 10} width={(gx1 - gx0) * 0.28} height={gy0 - gy1 + 6} fill="rgba(255,210,63,0.14)" opacity={R(6, "final")} />
          <path d={path6} fill="none" stroke={K.cold} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          {pr6 > 0.01 && <circle cx={gx0 + (gx1 - gx0) * head6} cy={gy0 - (gy0 - gy1) * 0.92 * Math.max(0, fcurve(head6))} r={16} fill={K.flow} style={{ filter: `drop-shadow(0 0 10px ${K.flow})` }} />}
        </SVG>
        {chip(6, "2 · EL SOPLIDO LARGO", K.cold)}
        <Label x={300} y={1110} text="BOCA: POCO" size={40} color={C.case3} box o={L(6, "boca")} />
        <Label x={760} y={1110} text="FINAL: MÁS" size={40} color={K.flow} box o={L(6, "final")} />
      </Scene>

      {/* 7 · tercero: la pila; más alcohol, más corriente */}
      <Scene {...sc(7)}>
        <SVG>
          <FuelCell x={540} y={720} s={1.2} t={t} rate={rate7} />
        </SVG>
        {chip(7, "3 · LA PILA", K.flow)}
        <Label x={540} y={636} text="PLATINO" size={38} color={C.ink} o={L(7, "platino")} />
        <Label x={540} y={1120} text="ELECTRONES" size={44} color={K.flow} box o={L(7, "electrones", Wd(7, "cuanto"))} />
        <Label x={540} y={1120} text="MÁS ALCOHOL = MÁS CORRIENTE" size={40} color={K.flow} box o={span(t, Wd(7, "cuanto") + 0.25, E(7))} />
      </Scene>

      {/* 8 · cuarto: luz infrarroja; el alcohol se la traga; menos luz, más alcohol */}
      <Scene {...sc(8)}>
        <SVG>
          <defs>
            <linearGradient id="ir8" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor={K.hot} stopOpacity={1} />
              <stop offset="1" stopColor={K.hot} stopOpacity={1 - 0.8 * abs8} />
            </linearGradient>
          </defs>
          <rect x={190} y={600} width={680} height={170} rx={30} fill={C.glass} stroke={C.pt} strokeWidth={7} />
          <circle cx={150} cy={685} r={46} fill={K.hot} opacity={dimTo(8, "luz")} style={{ filter: `drop-shadow(0 0 20px ${K.hot})` }} />
          <rect x={890} y={630} width={60} height={110} rx={10} fill={C.case2} stroke={C.ink} strokeWidth={5} />
          {[0, 1, 2].map((k) => (
            <path key={k} d={Array.from({ length: 61 }).map((_, i) => { const x = 200 + 680 * i / 60; return `${i ? "L" : "M"}${x.toFixed(1)},${(645 + k * 40 + 10 * Math.sin(x * 0.06 - t * 10 + k)).toFixed(1)}`; }).join(" ")}
              fill="none" stroke="url(#ir8)" strokeWidth={7} strokeLinecap="round" opacity={R(8, "luz")} />
          ))}
          {Array.from({ length: 7 }).map((_, k) => <Mol key={k} x={260 + 90 * k + 10 * Math.sin(t * 2 + k)} y={640 + 90 * rnd(k + 4) + 8 * Math.cos(t * 3 + k)} s={0.85} o={dimTo(8, "alcohol")} />)}
          {/* medidor de luz que llega */}
          <rect x={240} y={995} width={600} height={50} rx={25} fill={C.ink} stroke={C.case3} strokeWidth={5} />
          <rect x={246} y={1001} width={588 * (1 - 0.7 * abs8)} height={38} rx={19} fill={K.hot} opacity={R(8, "luz")} />
          <text x={540} y={980} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={800} fontSize={30} fill={C.case3} opacity={R(8, "luz")}>LUZ QUE LLEGA</text>
        </SVG>
        {chip(8, "4 · LUZ INFRARROJA", K.hot)}
        <Label x={540} y={520} text="LUZ INFRARROJA" size={42} color={K.hot} box o={L(8, "infrarroja")} />
        <Label x={540} y={1115} text="MENOS LUZ = MÁS ALCOHOL" size={42} color={K.flow} box o={L(8, "menos")} />
      </Scene>

      {/* 9 · curiosidad: tras beber se espera un rato; el alcohol de la boca da de más */}
      <Scene {...sc(9)}>
        <SVG>
          <Head x={300} y={760} s={1.3} />
          {Array.from({ length: 4 }).map((_, k) => <Mol key={k} x={430 + 18 * k} y={815 + 12 * Math.sin(t * 3 + k)} s={0.7} o={dimTo(9, "beber") * (0.6 + 0.4 * Math.sin(t * 4 + k))} />)}
          <Flow d="M470,812 C600,780 720,560 800,520" t={t} color={K.cold} o={0.4 + 0.6 * R(9, "boca")} w={8} />
          <Device id="d9" x={800} y={770} s={0.58} t={t} reading={high9 > 0.5 ? "ALTO" : "···"} readColor={high9 > 0.5 ? K.warn : K.flow} />
          <Timer x={300} y={460} r={60} p={wait9} o={dimTo(9, "espera")} />
        </SVG>
        {chip(9, "CURIOSIDAD")}
        <Label x={520} y={460} text="SE ESPERA" size={40} color={K.cold} box o={L(9, "espera")} />
        <Label x={300} y={1010} text="ALCOHOL EN LA BOCA" size={36} color={C.etoh} box o={L(9, "boca")} />
        <Stamp x={690} y={1070} text="¡DA DE MÁS!" size={44} p={R(9, "mas", 0.35)} />
      </Scene>

      {/* 10 · otra: el primero, patentado en 1936; soplabas en un globo y un líquido cambiaba de color */}
      <Scene {...sc(10)}>
        <SVG>
          <rect x={300} y={720} width={480} height={300} rx={24} fill={C.case1} stroke={C.ink} strokeWidth={7} />
          <rect x={330} y={750} width={180} height={90} rx={10} fill={C.ink} />
          {[0, 1, 2].map((k) => <circle key={k} cx={360 + 60 * k} cy={900} r={18} fill={C.case3} />)}
          {/* globo */}
          <path d="M400,720 L400,690" stroke={C.pt} strokeWidth={10} />
          <ellipse cx={400} cy={600 - 40 * bal10} rx={40 + 70 * bal10} ry={50 + 80 * bal10} fill="rgba(53,196,240,0.35)" stroke={K.cold} strokeWidth={6} opacity={dimTo(10, "globo")} />
          {/* matraz con líquido */}
          <path d="M640,560 L640,640 L570,760 C560,790 580,810 610,810 L730,810 C760,810 780,790 770,760 L700,640 L700,560 Z" fill="rgba(201,214,230,0.15)" stroke={C.pt} strokeWidth={6} />
          <path d="M600,710 L740,710 L770,760 C780,790 760,810 730,810 L610,810 C580,810 560,790 570,760 Z" fill={C.purple} opacity={1 - 0.75 * col10} />
          <path d="M600,710 L740,710 L770,760 C780,790 760,810 730,810 L610,810 C580,810 560,790 570,760 Z" fill="#E6C9F5" opacity={0.75 * col10} />
          {bal10 > 0.3 && Array.from({ length: 3 }).map((_, k) => { const p = (t + k / 3) % 1; return <circle key={k} cx={670 + 30 * Math.sin(k * 2)} cy={800 - 80 * p} r={8} fill={K.white} opacity={0.6 * Math.sin(Math.PI * p)} />; })}
        </SVG>
        {chip(10, "OTRA CURIOSIDAD")}
        <Stamp x={790} y={480} text="1936" color={K.flow} size={62} rot={6} p={R(10, "1936", 0.35)} />
        <Label x={540} y={1110} text="«DRUNKOMETER»" size={46} color={K.white} box o={L(10, "drunk")} />
        <Label x={850} y={640} text="CAMBIA" size={36} color={C.etoh} box o={L(10, "cambiaba")} />
      </Scene>

      {/* 11 · los tubos antiguos: cristales naranjas que se vuelven verdes */}
      <Scene {...sc(11)}>
        <SVG>
          <Flow d="M60,720 L110,720" t={t} color={K.cold} w={8} />
          <CrystalTube x={470} y={720} w={560} p={g11} t={t} />
        </SVG>
        {chip(11, "LOS TUBOS DE ANTES")}
        <Label x={470} y={540} text="CRISTALES NARANJAS" size={40} color={C.orange} box o={L(11, "cristales")} />
        <Label x={470} y={1000} text="VERDE = ALCOHOL" size={42} color={C.green} box o={L(11, "verdes")} />
      </Scene>

      {/* 12 · cierre: sangre → aliento → corriente; si bebes, no conduzcas */}
      <Scene {...sc(12)}>
        <SVG>
          <Drop x={200} y={660} s={1} o={curR >= 0 ? 1 : 0.35} />
          <Flow d="M290,660 L400,660" t={t} color={C.etoh} o={curR >= 1 ? 1 : 0.25} w={9} />
          <Cloud x={540} y={660} s={1} t={t} o={curR >= 1 ? 1 : 0.35} />
          <Flow d="M680,660 L790,660" t={t} color={K.flow} o={curR >= 2 ? 1 : 0.25} w={9} />
          <Bolt x={870} y={660} s={1.2} o={curR >= 2 ? 1 : 0.35} />
        </SVG>
        {chip(12, "RESUMEN")}
        <Label x={200} y={820} text="SANGRE" size={40} color={curR === 0 ? K.flow : K.white} box o={dimTo(12, "sangre")} />
        <Label x={540} y={820} text="ALIENTO" size={40} color={curR === 1 ? K.flow : K.white} box o={dimTo(12, "aliento")} />
        <Label x={850} y={820} text="CORRIENTE" size={40} color={curR === 2 ? K.flow : K.white} box o={dimTo(12, "corriente")} />
        <Label x={540} y={1060} text="SI BEBES, NO CONDUZCAS" size={48} color={K.white} box o={L(12, "bebes")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};

const clamp = (x: number) => Math.max(0, Math.min(1, x));
