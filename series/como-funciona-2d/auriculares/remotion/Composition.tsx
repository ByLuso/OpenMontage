// Episodio 144 · Cómo saben los auriculares inalámbricos que te los has quitado (y cómo se conectan sin cable). 2D, plantilla de la serie.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en Auriculares.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Earbud, Ear, Phone, Case, Person, Swab, Microwave, Router, RadioWaves, Notes, PauseIcon, IRBeam, Flow, C, rnd } from "./Auriculares";

export const COMP_ID = "Auriculares";
export const HOOK = "Saben si los llevas"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);

/** Onda senoidal entre x0 y x1 (amplitud a, fase ph). */
const wave = (x0: number, x1: number, y: number, a: number, ph: number, k = 0.035) =>
  Array.from({ length: 61 }).map((_, i) => { const x = x0 + ((x1 - x0) * i) / 60; return `${i ? "L" : "M"}${x.toFixed(1)},${(y + a * Math.sin(x * k + ph)).toFixed(1)}`; }).join(" ");

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

  // beat 1: la carcasa se abre en «secreto»; el auricular se aparta a la izquierda y la carcasa a la derecha
  const op1 = 0.99 * R(1, "secreto", 0.7);
  // beat 2: entra en la oreja en «luz»→«rebota», sale en «no»
  const in2 = ramp(t, Wd(2, "luz"), Wd(2, "rebota")) * (1 - ramp(t, Wd(2, "no") - 0.1, Wd(2, "no") + 0.35));
  const bx2 = 700 - 233 * in2;
  // beat 5: dos toques
  const tapAt = [Wd(5, "dos"), Wd(5, "golpecitos")];
  const tapK = Math.max(...tapAt.map((a) => (t >= a && t < a + 0.35 ? 1 - (t - a) / 0.35 : 0)));
  const fingerIn = Math.max(...tapAt.map((a) => Math.max(0, 1 - Math.abs(t - a) / 0.18)));
  // beat 7: canal activo que salta (12 saltos/s en pantalla; en la realidad 1600)
  const hopK = Math.floor(t * 12);
  const avoid = t > Wd(7, "esquiva");
  let ch = Math.floor(rnd(hopK + 3) * 79);
  if (avoid && ch >= 20 && ch <= 41) ch = (ch + 26) % 79;
  // beat 8: fase «reenvía» (unos) y «los dos lo reciben» (otros)
  const relay = span(t, Wd(8, "unos"), Wd(8, "otros"), 0.25);
  const both = R(8, "otros", 0.3);
  // beat 10: el estuche pasa energía a los auriculares
  const ch10 = ramp(t, Wd(10, "contactos"), E(10) - 0.2);
  // beat 12: limpieza
  const clean = ramp(t, Wd(12, "limpia"), Wd(12, "estuche"));
  const cleanCase = ramp(t, Wd(12, "estuche"), Wd(12, "seco") + 0.3);
  const swabX = 540 + 70 * Math.sin(t * 9) * span(t, Wd(12, "limpia"), Wd(12, "estuche"), 0.15);
  // beat 13: resumen
  const resW = ["sensor", "radio", "estuche"];
  const curR = resW.reduce((acc, w, k) => (t >= Wd(13, w) ? k : acc), -1);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el auricular GRANDE desde el fotograma 0; en «secreto» se abre la carcasa; en «oreja» brilla el sensor */}
      <Scene {...sc(1)}>
        <SVG>
          <Earbud id="e1" x={540 - 210 * op1} y={610} s={1.15} t={t} open={op1} shellDx={380} shellDy={-30} ir={R(1, "oreja")} hi={t > Wd(1, "oreja") ? "sensor" : ""} lvl={0.7} />
          <IRBeam e={[540 - 210 * op1 - 120, 712]} p={[150, 960]} t={t} o={0.9 * R(1, "oreja")} />
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={200} y={1110} text="¡TE NOTA!" size={42} color={K.hot} box o={L(1, "oreja")} />
      </Scene>

      {/* 2 · la promesa: luz infrarroja que rebota en la piel → suena; sin piel → pausa */}
      <Scene {...sc(2)}>
        <SVG>
          <Ear x={300} y={760} s={1.1} />
          <Earbud id="e2" x={bx2} y={760} s={0.95} t={t} ir={R(2, "ojito")} sound={R(2, "suenan") * in2} />
          {in2 > 0.9 ? (
            <IRBeam e={[bx2 - 98, 778]} p={[bx2 - 150, 860]} d={[bx2 - 76, 792]} t={t} o={R(2, "infrarroja")} back={R(2, "rebota")} />
          ) : (
            <IRBeam e={[bx2 - 98, 778]} p={[bx2 - 330, 1080]} t={t} o={R(2, "infrarroja") * 0.8} />
          )}
          <Notes x={330} y={640} t={t} o={span(t, Wd(2, "suenan"), Wd(2, "no"))} />
          <PauseIcon x={895} y={470} r={50} o={span(t, Wd(2, "suenan"), Wd(2, "no"))} play />
          <PauseIcon x={895} y={470} r={50} o={R(2, "pausan", 0.3)} />
        </SVG>
        {chip(2, "EL SECRETO")}
        <Label x={620} y={470} text="LUZ INFRARROJA" size={36} color={K.hot} box o={L(2, "infrarroja", Wd(2, "rebota"))} />
        <Label x={620} y={470} text="REBOTA EN TU PIEL" size={36} color={K.hot} box o={L(2, "piel", Wd(2, "no") - 0.1)} />
        <Label x={620} y={470} text="SIN PIEL = PAUSA" size={36} color={K.flow} box o={L(2, "pausan")} />
      </Scene>

      {/* 3 · la idea clave: sensor que te nota, radio que salta, estuche que recarga */}
      <Scene {...sc(3)}>
        <SVG>
          <g opacity={dimTo(3, "sensor")}>
            <Earbud id="e3" x={230} y={640} s={0.55} t={t} ir={R(3, "nota")} />
            <IRBeam e={[176, 683]} p={[110, 800]} t={t} o={R(3, "nota")} />
          </g>
          <g opacity={dimTo(3, "radio")}>
            {Array.from({ length: 7 }).map((_, i) => <rect key={i} x={448 + i * 28} y={560} width={16} height={200} rx={6} fill="rgba(255,255,255,0.12)" />)}
            {(() => { const k = Math.floor(rnd(Math.floor(t * 5) + 9) * 7); return <rect x={448 + k * 28} y={560} width={16} height={200} rx={6} fill={K.cold} style={{ filter: `drop-shadow(0 0 10px ${K.cold})` }} opacity={R(3, "salta")} />; })()}
            <RadioWaves x={540} y={830} t={t} o={R(3, "radio")} dir={-90} n={3} r0={20} step={22} />
          </g>
          <g opacity={dimTo(3, "estuche")}>
            <Case x={850} y={680} s={0.5} t={t} lid={0.8} flow={R(3, "recarga")} budLvl={0.3 + 0.6 * ramp(t, Wd(3, "recarga"), E(3))} />
          </g>
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={210} y={960} text="TE NOTA" size={42} color={K.flow} box o={L(3, "nota")} />
        <Label x={540} y={960} text="SALTA" size={42} color={K.flow} box o={L(3, "salta")} />
        <Label x={850} y={960} text="RECARGA" size={42} color={K.flow} box o={L(3, "recarga")} />
      </Scene>

      {/* 4 · primero: el sensor; con luz (emisor + detector) o capacitivo (como una pantalla táctil) */}
      <Scene {...sc(4)}>
        <SVG>
          <rect x={80} y={440} width={920} height={110} rx={30} fill={C.skin} stroke={C.ink} strokeWidth={5} />
          <path d="M120,470 q40,-14 80,0 M400,500 q40,-14 80,0 M700,470 q40,-14 80,0" fill="none" stroke={C.skin2} strokeWidth={6} strokeLinecap="round" />
          {/* izquierda: luz */}
          <g opacity={dimTo(4, "luz")}>
            <rect x={190} y={780} width={200} height={90} rx={14} fill={K.ink} stroke={C.case3} strokeWidth={5} />
            <circle cx={240} cy={800} r={20} fill={K.hot} style={{ filter: `drop-shadow(0 0 12px ${K.hot})` }} />
            <circle cx={340} cy={800} r={20} fill="#33435c" stroke={K.hot} strokeWidth={4} />
            <IRBeam e={[240, 790]} p={[290, 560]} d={[340, 790]} t={t} o={R(4, "luz")} back={R(4, "luz", 0.7)} />
          </g>
          {/* derecha: capacitivo */}
          <g opacity={dimTo(4, "piel")}>
            <rect x={690} y={800} width={200} height={40} rx={10} fill={C.gold} stroke={C.ink} strokeWidth={4} />
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M${720 + k * 10},800 C${720 + k * 10},${700 - k * 40} ${860 - k * 10},${700 - k * 40} ${860 - k * 10},800`} fill="none" stroke={K.flow} strokeWidth={6}
                strokeDasharray="14 12" strokeDashoffset={-t * 60} opacity={R(4, "piel") * (0.95 - k * 0.2)} />
            ))}
            <path d="M720,560 L720,640 M790,560 L790,600 M860,560 L860,640" stroke={K.flow} strokeWidth={6} strokeDasharray="10 10" strokeDashoffset={-t * 60} opacity={R(4, "piel") * 0.8} />
          </g>
        </SVG>
        {chip(4, "1 · EL SENSOR", K.hot)}
        <Label x={540} y={400} text="TU PIEL" size={36} color={K.white} o={L(4, "sensor")} />
        <Label x={290} y={960} text="CON LUZ" size={42} color={K.hot} box o={L(4, "luz")} />
        <Label x={790} y={960} text="TÁCTIL" size={42} color={K.flow} box o={L(4, "pantalla")} />
      </Scene>

      {/* 5 · el acelerómetro nota tus toques: dos golpecitos, pausa */}
      <Scene {...sc(5)}>
        <SVG>
          <Earbud id="e5" x={420} y={620} s={1.1} t={t} open={1} tap={tapK} hi={t > Wd(5, "acelerometro") ? "acc" : ""} />
          {/* dedo que toca */}
          <g transform={`translate(${640 + 90 * (1 - fingerIn)},${560})`} opacity={span(t, Wd(5, "toques") - 0.3, E(5))}>
            <rect x={0} y={-45} width={260} height={90} rx={45} fill={C.skin} stroke={C.ink} strokeWidth={5} />
            <ellipse cx={34} cy={-8} rx={22} ry={18} fill="#E3B19A" />
          </g>
          {tapAt.map((a, k) => { const p = (t - a) / 0.45; return p > 0 && p < 1 && (
            <circle key={k} cx={600} cy={560} r={20 + 70 * p} fill="none" stroke={K.flow} strokeWidth={7} opacity={1 - p} />); })}
          {/* móvil que gira (el mismo tipo de sensor) */}
          <Phone x={820} y={560} s={0.62} rot={90 * ramp(t, Wd(5, "gira"), Wd(5, "gira") + 0.6)} o={span(t, Wd(5, "como"), Wd(5, "toques"))} />
          <PauseIcon x={800} y={820} o={R(5, "pausa", 0.3)} />
        </SVG>
        {chip(5, "1 · LOS TOQUES", K.hot)}
        <Label x={300} y={1080} text="ACELERÓMETRO" size={40} color={K.flow} box o={L(5, "acelerometro")} />
        <Label x={800} y={700} text="2 TOQUES" size={40} color={K.white} box o={L(5, "dos")} />
      </Scene>

      {/* 6 · segundo: la radio en 2,4 GHz, la banda del wifi y del microondas */}
      <Scene {...sc(6)}>
        <SVG>
          <Phone x={230} y={600} s={1} />
          <Earbud id="e6" x={800} y={540} s={0.62} t={t} />
          <RadioWaves x={310} y={600} t={t} o={0.4 + 0.6 * R(6, "radio")} dir={0} n={4} r0={30} step={70} />
          <Router x={300} y={990} o={dimTo(6, "wifi")} t={t} />
          <Microwave x={780} y={990} o={dimTo(6, "microondas")} />
          <RadioWaves x={300} y={930} t={t} o={R(6, "wifi") * 0.7} dir={-90} n={2} r0={20} step={24} color={K.warn} />
          <RadioWaves x={780} y={925} t={t} o={R(6, "microondas") * 0.7} dir={-90} n={2} r0={20} step={24} color={K.warn} />
        </SVG>
        {chip(6, "2 · LA RADIO", K.cold)}
        <Label x={540} y={790} text="2,4 GHz" size={64} color={K.cold} box o={L(6, "dos")} />
        <Label x={300} y={1105} text="WIFI" size={38} color={K.white} box o={L(6, "wifi")} />
        <Label x={780} y={1105} text="MICROONDAS" size={38} color={K.white} box o={L(6, "microondas")} />
      </Scene>

      {/* 7 · salta de canal 1600 veces por segundo y esquiva las interferencias */}
      <Scene {...sc(7)}>
        <SVG>
          <rect x={110 + 20 * 10.4 - 6} y={540} width={22 * 10.4 + 6} height={300} rx={14} fill={K.warn} opacity={0.18 + 0.12 * ramp(t, Wd(7, "interferencias"), Wd(7, "interferencias") + 0.3)} />
          {Array.from({ length: 79 }).map((_, i) => (
            <rect key={i} x={110 + i * 10.4} y={560} width={6} height={260} rx={3} fill={i === ch ? K.cold : (i >= 20 && i <= 41 ? "rgba(229,57,53,0.5)" : "rgba(255,255,255,0.16)")}
              style={i === ch ? { filter: `drop-shadow(0 0 10px ${K.cold})` } : undefined} />
          ))}
          <path d={`M${113 + ch * 10.4},${850} l-14,24 l28,0 Z`} fill={K.cold} />
        </SVG>
        {chip(7, "2 · SALTOS", K.cold)}
        <Label x={540} y={460} text={`${Math.round(1600 * ramp(t, Wd(7, "mil"), Wd(7, "segundo") + 0.2)).toLocaleString("es-ES").replace(/\s/g, ".")} SALTOS/s`} size={54} color={K.cold} box o={L(7, "mil")} />
        <Label x={370} y={700} text="WIFI" size={36} color={K.warn} box o={L(7, "esquiva")} />
        <Label x={540} y={990} text="ESQUIVA INTERFERENCIAS" size={40} color={K.flow} box o={L(7, "esquiva")} />
      </Scene>

      {/* 8 · el otro lado: el principal reenvía, o los dos reciben */}
      <Scene {...sc(8)}>
        <SVG>
          <Phone x={540} y={560} s={0.8} />
          <Earbud id="e8l" x={250} y={940} s={0.48} t={t} flipX />
          <Earbud id="e8r" x={830} y={940} s={0.48} t={t} />
          <Flow d="M600,640 L800,880" t={t} color={K.cold} o={Math.max(relay, both)} />
          <Flow d="M770,1010 L310,1010" t={t} color={K.flow} o={relay} />
          <Flow d="M480,640 L280,880" t={t} color={K.cold} o={both} />
        </SVG>
        {chip(8, "2 · LOS DOS LADOS", K.cold)}
        <Label x={820} y={790} text="PRINCIPAL" size={38} color={K.white} box o={span(t, Wd(8, "principal"), Wd(8, "otros"), 0.25)} />
        <Label x={540} y={1090} text="REENVÍA" size={42} color={K.flow} box o={span(t, Wd(8, "reenvia"), Wd(8, "otros"), 0.25)} />
        <Label x={540} y={1090} text="LOS DOS RECIBEN" size={42} color={K.cold} box o={span(t, Wd(8, "otros") + 0.3, E(8))} />
      </Scene>

      {/* 9 · tercero: los micrófonos oyen el ruido y el altavoz lanza la onda contraria */}
      <Scene {...sc(9)}>
        <SVG>
          <Earbud id="e9" x={250} y={640} s={0.8} t={t} open={1} hi={t > Wd(9, "microfonos") && t < Wd(9, "altavoz") ? "mic" : t >= Wd(9, "altavoz") ? "spk" : ""} />
          <path d={wave(450, 940, 540, 50, -t * 6)} fill="none" stroke={K.warn} strokeWidth={9} strokeLinecap="round" opacity={dimTo(9, "ruido")} />
          <path d={wave(450, 940, 740, 50, -t * 6 + Math.PI)} fill="none" stroke={K.cold} strokeWidth={9} strokeLinecap="round" opacity={dimTo(9, "contraria")} />
          <path d={wave(450, 940, 930, 50 * (1 - 0.9 * R(9, "contraria", 0.8)), -t * 6)} fill="none" stroke={K.flow} strokeWidth={9} strokeLinecap="round" opacity={dimTo(9, "contraria")} />
          <text x={690} y={850} textAnchor="middle" fontSize={60} fontWeight={900} fill={K.white} opacity={dimTo(9, "contraria")}>+</text>
        </SVG>
        {chip(9, "3 · LOS MICRÓFONOS")}
        <Label x={690} y={450} text="RUIDO" size={40} color={K.warn} box o={L(9, "ruido")} />
        <Label x={690} y={650} text="ONDA CONTRARIA" size={38} color={K.cold} box o={L(9, "contraria")} />
        <Label x={690} y={1040} text="SE RESTAN" size={40} color={K.flow} box o={R(9, "contraria", 0.8)} />
      </Scene>

      {/* 10 · cuarto: el estuche es otra batería, unas diez veces mayor, que los recarga por contactos */}
      <Scene {...sc(10)}>
        <SVG>
          <Case x={540} y={780} s={1.25} t={t} lid={0.95} lvl={0.95 - 0.25 * ch10} budLvl={0.15 + 0.8 * ch10} flow={R(10, "contactos")} contacts={R(10, "contactos")} hi={t > Wd(10, "bateria") && t < Wd(10, "contactos") ? "bat" : ""} />
        </SVG>
        {chip(10, "4 · EL ESTUCHE")}
        <Stamp x={800} y={520} text="×10" color={K.flow} size={72} rot={6} p={ramp(t, Wd(10, "diez"), Wd(10, "diez") + 0.35) * (1 - ramp(t, Wd(10, "contactos") - 0.2, Wd(10, "contactos")))} />
        <Label x={800} y={520} text="VARIAS RECARGAS" size={40} color={K.flow} box o={L(10, "varias")} />
        <Label x={300} y={1130} text="BATERÍA" size={38} color={K.white} box o={L(10, "bateria", Wd(10, "contactos"))} />
        <Label x={760} y={1130} text="CONTACTOS" size={38} color={K.flow} box o={L(10, "contactos")} />
      </Scene>

      {/* 11 · curiosidad: tu cuerpo se traga parte de la señal; a veces se corta uno solo */}
      <Scene {...sc(11)}>
        <SVG>
          <Person x={500} y={600} s={0.9} t={t} lostL={R(11, "corta", 0.2)} />
          <Phone x={830} y={1000} s={0.6} />
          <Flow d="M800,930 L680,640" t={t} color={K.cold} />
          <path d="M790,940 C640,780 470,700 345,640" fill="none" stroke={K.cold} strokeWidth={10} strokeLinecap="round" strokeDasharray="22 18" strokeDashoffset={-t * 160}
            opacity={1 - 0.75 * R(11, "traga", 0.8)} />
          {R(11, "corta") > 0.01 && <path d="M300,560 l70,70 M370,560 l-70,70" stroke={K.warn} strokeWidth={14} strokeLinecap="round" opacity={R(11, "corta", 0.2)} />}
        </SVG>
        {chip(11, "CURIOSIDAD")}
        <Label x={540} y={1100} text="TU CUERPO FRENA LA SEÑAL" size={38} color={K.white} box o={L(11, "cuerpo")} />
        <Label x={250} y={480} text="¡SE CORTA!" size={40} color={K.warn} box o={L(11, "corta")} />
      </Scene>

      {/* 12 · truco: limpia los puntitos metálicos (y los del estuche) con un bastoncillo seco */}
      <Scene {...sc(12)}>
        <SVG>
          <defs><clipPath id="close12"><rect x={0} y={420} width={1080} height={730} /></clipPath></defs>
          <g clipPath="url(#close12)">
            <Earbud id="e12" x={540 - 73 * 2.2} y={800 - 392 * 2.2} s={2.2} t={t} dirt={1 - clean} glowContacts={clean > 0.95 ? 1 : 0} hi={t > Wd(12, "puntitos") && t < Wd(12, "estuche") ? "contacts" : ""} />
          </g>
          <g clipPath="url(#close12)" opacity={span(t, Wd(12, "limpia") - 0.3, Wd(12, "estuche") + 0.2)}><Swab x={swabX} y={890} /></g>
          <g opacity={dimTo(12, "estuche")}>
            <Case x={250} y={990} s={0.5} t={t} lid={0.9} buds={false} dirt={1 - cleanCase} contacts={cleanCase > 0.95 ? 1 : 0} />
          </g>
          <g clipPath="url(#close12)" opacity={span(t, Wd(12, "estuche"), E(12))}><Swab x={205 + 22 * Math.sin(t * 9)} y={1060} rot={-10} /></g>
        </SVG>
        {chip(12, "TRUCO")}
        <Stamp x={270} y={560} text="¿NO CARGA?" size={46} p={span(t, Wd(12, "si"), Wd(12, "puntitos"))} />
        <Label x={800} y={720} text="CONTACTOS" size={42} color={C.gold} box o={L(12, "puntitos")} />
        <Label x={760} y={1090} text="BASTONCILLO SECO" size={36} color={K.white} box o={L(12, "bastoncillo")} />
      </Scene>

      {/* 13 · cierre: resumen */}
      <Scene {...sc(13)}>
        <SVG>
          <Earbud id="e13" x={330} y={600} s={0.95} t={t} open={1} ir={1} sound={0.6} hi={curR === 0 ? "sensor" : curR === 1 ? "chip" : ""} />
          <RadioWaves x={500} y={520} t={t} o={curR >= 1 ? 1 : 0.35} dir={-30} n={3} />
          <Case x={790} y={860} s={0.62} t={t} lid={0.9} flow={curR >= 2 ? 1 : 0.2} budLvl={0.8} />
        </SVG>
        {chip(13, "RESUMEN")}
        <Label x={175} y={880} text="SENSOR" size={40} color={curR === 0 ? K.flow : K.white} box o={dimTo(13, "sensor")} />
        <Label x={700} y={430} text="RADIO" size={40} color={curR === 1 ? K.flow : K.white} box o={dimTo(13, "radio")} />
        <Label x={790} y={1120} text="ESTUCHE" size={40} color={curR === 2 ? K.flow : K.white} box o={dimTo(13, "estuche")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
