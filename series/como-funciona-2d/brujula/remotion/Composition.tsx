// Episodio 174 · Cómo funciona una brújula (y la del móvil, sin aguja). 2D, plantilla de la serie.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en Brujula.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming, Callout } from "./kit2d/Kit";
import { Compass, Needle, Earth, FieldLines, fieldAt, Arctic, polar, pathPoint, POLE_PATH, Star, MagPole, Iberia, ibProj, MiniDecl, Phone, Arrow, OldBook, C } from "./Brujula";

export const COMP_ID = "Brujula";
export const HOOK = "No señala el Polo"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);
const deg = (x0: number, y0: number, x1: number, y1: number) => (Math.atan2(x1 - x0, y0 - y1) * 180) / Math.PI;

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
  const after = (i: number, w: string) => t >= Wd(i, w);
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(S(i), i === 1 ? 1.8 : 0), E(i))} />;

  // 1 · gancho: la aguja apunta al Polo… y en «equivocados» se levanta la tapa y gira hacia otro sitio que se mueve
  const c1 = { x: 540, y: 860 };
  const star1 = { x: 290, y: 450 };
  const mv1 = R(1, "mueve", 0.6);
  const dot1 = { x: 800 + 40 * Math.sin((t - Wd(1, "mueve")) * 1.6) * mv1, y: 450 + 14 * Math.sin((t - Wd(1, "mueve")) * 2.3) * mv1 };
  const sw1 = R(1, "equivocados", 0.8);
  const h1 = deg(c1.x, c1.y, star1.x, star1.y) * (1 - sw1) + deg(c1.x, c1.y, dot1.x, dot1.y) * sw1 + 3 * Math.sin(t * 5) * (1 - sw1);
  const lid1 = R(1, "equivocados", 0.7);

  // 2 · mapa del Ártico de cerca: Polo (estrella) y polo magnético (punto amarillo) que se desplaza; la aguja lo sigue
  const A2 = { cx: 540, cy: 760, R: 340, mc: 10 };
  const pj2 = polar(A2.cx, A2.cy, A2.R / A2.mc);
  const p2 = 0.86 + 0.14 * ramp(t, S(2), E(2));
  const dot2 = pathPoint(pj2, p2);
  const cmp2 = { x: 540, y: 1010 };
  const h2 = deg(cmp2.x, cmp2.y, dot2.x, dot2.y);
  const trail2 = POLE_PATH.map(pj2);

  // 3 · la Tierra como imán gigante; una brujulita sobre una línea del campo se alinea
  const E3 = { x: 540, y: 760, R: 210 };
  const f3 = fieldAt(1.85, 55);
  const h3 = 130 * (1 - R(3, "alinea", 0.9)) + f3.heading * R(3, "alinea", 0.9) + 8 * Math.sin(t * 6) * (1 - R(3, "alinea", 0.9));

  // 5 · la aguja gira libre sobre su eje y se para (oscilación amortiguada)
  const u5 = Math.max(0, t - S(5));
  const h5 = 70 * Math.exp(-0.45 * u5) * Math.cos(3.2 * u5);
  // 6 · tiembla con nada… hasta que el líquido la frena
  const tl6 = Wd(6, "liquido");
  const jit6 = 22 * Math.sin(t * 13) + 14 * Math.sin(t * 7.3 + 1);
  const h6 = t < tl6 ? jit6 : (22 * Math.sin(tl6 * 13) + 14 * Math.sin(tl6 * 7.3 + 1)) * Math.exp(-2.2 * (t - tl6)) * Math.cos(2.5 * (t - tl6));
  const liq6 = R(6, "liquido", 0.8);

  // 7 · el polo se mueve de Canadá hacia Siberia
  const A7 = { cx: 540, cy: 760, R: 360, mc: 21 };
  const pj7 = polar(A7.cx, A7.cy, A7.R / A7.mc);
  const p7 = 0.03 + 0.97 * ramp(t, Wd(7, "mueve"), Wd(7, "siberia") + 0.6);
  const dot7 = pathPoint(pj7, p7);
  const trail7 = Array.from({ length: 41 }).map((_, k) => pathPoint(pj7, (p7 * k) / 40));

  // 8 · declinación: primero el ángulo (exagerado), luego la península
  const tP8 = Wd(8, "peninsula");
  const oA8 = 1 - ramp(t, tP8 - 0.35, tP8);
  const oB8 = ramp(t, tP8 - 0.1, tP8 + 0.4);
  const dec8 = 18 * R(8, "desvia", 0.8);
  const ib = ibProj(540, 720, 42);
  const cities8: [number, number, number][] = [[-8.4, 43.3, -0.8], [-3.7, 40.4, 0.7], [2.2, 41.4, 2.1], [-6.0, 37.4, -0.4]];

  // 9 · el móvil: un chip mide el campo en tres direcciones
  const ph9 = { x: 400, y: 760 };
  const chip9 = { x: ph9.x, y: ph9.y + 190 };
  const ax9 = R(9, "tres", 0.6);

  // 10 · truco: hacer un ocho
  const o10 = R(10, "ocho", 0.5);
  const u10 = (t - Wd(10, "ocho")) * 1.6 * o10;
  const ph10 = { x: 540 + 290 * Math.sin(u10), y: 760 + 150 * Math.sin(2 * u10) };
  const rot10 = 25 * Math.cos(u10) * o10;
  const eight = Array.from({ length: 81 }).map((_, k) => { const u = (k / 80) * Math.PI * 2; return `${k ? "L" : "M"}${540 + 290 * Math.sin(u)},${760 + 150 * Math.sin(2 * u)}`; }).join(" ");

  // 12 · el campo se da la vuelta
  const fl12 = R(12, "vuelta", 1.2);

  // 13 · resumen
  const A13 = { cx: 860, cy: 720, R: 140, mc: 21 };
  const pj13 = polar(A13.cx, A13.cy, A13.R / A13.mc);
  const dot13 = pathPoint(pj13, (t * 0.25) % 1);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: brújula GRANDE desde el fotograma 0; en «equivocados» se levanta la tapa y la aguja gira hacia otro sitio */}
      <Scene {...sc(1)}>
        <SVG>
          <Star x={star1.x} y={star1.y} r={30} o={dimTo(1, "polo")} />
          <MagPole x={dot1.x} y={dot1.y} t={t} o={dimTo(1, "sitio")} />
          <line x1={c1.x} y1={c1.y} x2={dot1.x} y2={dot1.y} stroke={K.flow} strokeWidth={5} strokeDasharray="14 12" opacity={0.7 * R(1, "sitio")} />
          <Compass x={c1.x} y={c1.y} r={280} heading={h1} lid={lid1} hiNeedle={after(1, "sitio")} />
        </SVG>
        {chip(1, "¿AL NORTE?")}
        <Label x={290} y={530} text="POLO NORTE" size={38} color={K.white} box o={L(1, "polo")} />
        <Label x={800} y={530} text="OTRO SITIO" size={38} color={K.flow} box o={L(1, "sitio")} />
      </Scene>

      {/* 2 · la promesa: sigue el campo hacia el polo norte magnético, otro punto del Ártico que se mueve */}
      <Scene {...sc(2)}>
        <SVG>
          <Arctic cx={A2.cx} cy={A2.cy} R={A2.R} maxColat={A2.mc} id="ar2">
            <path d={trail2.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ")} fill="none" stroke={K.flow} strokeWidth={5} strokeDasharray="4 12" strokeLinecap="round" opacity={0.5 * R(2, "mueve")} />
          </Arctic>
          <Star x={A2.cx} y={A2.cy} r={30} />
          <line x1={cmp2.x} y1={cmp2.y} x2={A2.cx} y2={A2.cy + 34} stroke={K.white} strokeWidth={4} strokeDasharray="10 12" opacity={0.6} />
          <line x1={cmp2.x} y1={cmp2.y} x2={dot2.x} y2={dot2.y} stroke={K.flow} strokeWidth={5} strokeDasharray="14 12" opacity={0.85 * dimTo(2, "polo")} />
          <MagPole x={dot2.x} y={dot2.y} t={t} o={dimTo(2, "polo")} />
          <Compass x={cmp2.x} y={cmp2.y} r={80} heading={h2} />
        </SVG>
        {chip(2, "EL POLO MAGNÉTICO")}
        <Label x={540} y={830} text="POLO NORTE" size={36} color={K.white} box o={span(t, S(2), E(2))} />
        <Label x={700} y={575} text="POLO MAGNÉTICO" size={40} color={K.flow} box o={L(2, "polo")} />
      </Scene>

      {/* 3 · la idea clave: la Tierra es como un imán gigante y la aguja se alinea con su campo */}
      <Scene {...sc(3)}>
        <SVG>
          <FieldLines x={E3.x} y={E3.y} R={E3.R} Ls={[1.4, 1.85]} t={t} o={dimTo(3, "iman")} />
          <Earth x={E3.x} y={E3.y} R={E3.R} t={t} magnet={0.35 + 0.5 * R(3, "iman")} />
          <Compass x={E3.x + f3.x * E3.R} y={E3.y - f3.y * E3.R} r={62} heading={h3} o={dimTo(3, "aguja")} hiNeedle={after(3, "alinea")} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={540} y={440} text="IMÁN GIGANTE" size={46} color={K.flow} box o={L(3, "iman")} />
        <Label x={540} y={1070} text="LA AGUJA SE ALINEA" size={44} color={K.white} box o={L(3, "alinea")} />
      </Scene>

      {/* 4 · primero: en el núcleo, hierro líquido en movimiento fabrica el campo (geodinamo) */}
      <Scene {...sc(4)}>
        <SVG>
          <FieldLines x={540} y={750} R={270} Ls={[1.3, 1.62]} t={t} o={dimTo(4, "campo")} />
          <Earth x={540} y={750} R={270} t={t} cut={ramp(t, S(4) + 0.1, Wd(4, "nucleo") + 0.3)} swirl={0.4 + 0.6 * R(4, "movimiento")} hiCore={after(4, "hierro")} />
        </SVG>
        {chip(4, "1 · EL IMÁN GIGANTE", K.hot)}
        <Callout text="NÚCLEO" anchor={{ x: 540 + 105, y: 750 - 90 }} offset={[210, -220]} color={K.hot} t={t} t0={Wd(4, "nucleo")} t1={E(4)} />
        <Label x={540} y={1090} text="HIERRO LÍQUIDO EN MOVIMIENTO" size={38} color={K.hot} box o={L(4, "hierro")} />
        <Label x={300} y={440} text="CAMPO MAGNÉTICO" size={40} color={K.cold} box o={L(4, "campo")} />
      </Scene>

      {/* 5 · segundo: la aguja, un imán muy ligero que gira sobre un eje */}
      <Scene {...sc(5)}>
        <SVG>
          <Compass x={540} y={760} r={280} heading={h5} hiNeedle={after(5, "iman") && !after(5, "eje")} pivot={after(5, "eje")} />
        </SVG>
        {chip(5, "2 · LA AGUJA")}
        <Label x={540} y={1100} text="IMÁN MUY LIGERO" size={46} color={K.flow} box o={L(5, "iman")} />
        <Callout text="EJE" anchor={{ x: 540, y: 760 }} offset={[260, -330]} color={K.flow} t={t} t0={Wd(5, "eje")} t1={E(5)} />
      </Scene>

      {/* 6 · tiembla con nada… y el líquido la frena */}
      <Scene {...sc(6)}>
        <SVG>
          <Compass x={540} y={760} r={270} heading={h6} liquid={liq6} t={t} />
        </SVG>
        {chip(6, "2 · SIN TEMBLAR", K.cold)}
        <Label x={540} y={440} text="TIEMBLA CON NADA" size={42} color={K.white} box o={L(6, "tiembla")} />
        <Label x={540} y={1100} text="LÍQUIDO = FRENO" size={46} color={K.cold} box o={L(6, "liquido")} />
      </Scene>

      {/* 7 · tercero: el polo se mueve ~35 km al año, de Canadá hacia Siberia */}
      <Scene {...sc(7)}>
        <SVG>
          <Arctic cx={A7.cx} cy={A7.cy} R={A7.R} maxColat={A7.mc} id="ar7">
            <path d={POLE_PATH.map(pj7).map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ")} fill="none" stroke={K.flow} strokeWidth={4} strokeDasharray="4 12" opacity={0.35} />
            <path d={trail7.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ")} fill="none" stroke={K.flow} strokeWidth={8} strokeLinecap="round" opacity={0.9} />
          </Arctic>
          <Star x={A7.cx} y={A7.cy} r={22} />
          <MagPole x={dot7.x} y={dot7.y} t={t} r={16} />
        </SVG>
        {chip(7, "3 · EL POLO SE MUEVE")}
        <Label x={260} y={610} text="CANADÁ" size={38} color={K.white} box o={L(7, "canada")} />
        <Label x={810} y={520} text="SIBERIA" size={38} color={K.white} box o={L(7, "siberia")} />
        <Label x={540} y={1065} text="≈ 35 KM AL AÑO" size={44} color={K.flow} box o={L(7, "treinta")} />
      </Scene>

      {/* 8 · cuarto: la declinación; en la península hoy, menos de tres grados */}
      <Scene {...sc(8)}>
        <SVG>
          <g opacity={oA8}>
            <line x1={540} y1={1000} x2={540} y2={470} stroke={K.white} strokeWidth={6} strokeDasharray="16 14" />
            <Star x={540} y={450} r={26} />
            <Compass x={540} y={720} r={250} heading={dec8} />
            <path d={`M540,${720 - 230} A230,230 0 0 1 ${540 + 230 * Math.sin((dec8 * Math.PI) / 180)},${720 - 230 * Math.cos((dec8 * Math.PI) / 180)}`} fill="none" stroke={K.hot} strokeWidth={10} strokeLinecap="round" opacity={R(8, "declinacion")} />
          </g>
          <g opacity={oB8}>
            <Iberia cx={540} cy={720} s={42} />
            {cities8.map(([lo, la, d], i) => { const p = ib(lo, la); return <MiniDecl key={i} x={p.x} y={p.y} dec={d * 2} o={ramp(t, tP8 + 0.15 * i, tP8 + 0.15 * i + 0.4)} />; })}
          </g>
        </SVG>
        {chip(8, "4 · LA DECLINACIÓN", K.hot)}
        <Label x={290} y={540} text="NORTE GEOGRÁFICO" size={36} color={K.white} box o={L(8, "geografico", tP8 - 0.3)} />
        <Label x={540} y={1070} text="DECLINACIÓN" size={46} color={K.hot} box o={L(8, "declinacion", tP8 - 0.3)} />
        <Label x={540} y={1070} text="PENÍNSULA: MENOS DE 3°" size={44} color={K.flow} box o={L(8, "tres")} />
      </Scene>

      {/* 9 · ¿y el móvil? un chip, el magnetómetro, mide el campo en tres direcciones */}
      <Scene {...sc(9)}>
        <SVG>
          {[0, 1, 2, 3].map((k) => <line key={k} x1={60} y1={1180 - k * 230 + ((t * 60) % 230)} x2={1020} y2={600 - k * 230 + ((t * 60) % 230)} stroke={K.cold} strokeWidth={4} strokeDasharray="16 16" opacity={0.25} />)}
          <Phone x={ph9.x} y={ph9.y} hiChip={after(9, "magnetometro")}>
            <Compass x={0} y={-90} r={110} heading={4 * Math.sin(t * 1.3)} />
          </Phone>
          <Arrow x1={chip9.x} y1={chip9.y} x2={chip9.x + 210 * ax9 + 1} y2={chip9.y} color={K.flow} o={ax9} />
          <Arrow x1={chip9.x} y1={chip9.y} x2={chip9.x} y2={chip9.y - 190 * ax9 - 1} color={K.cold} o={ramp(t, Wd(9, "tres") + 0.2, Wd(9, "tres") + 0.6)} />
          <Arrow x1={chip9.x} y1={chip9.y} x2={chip9.x - 130 * ax9 - 1} y2={chip9.y + 120 * ax9} color={K.hot} o={ramp(t, Wd(9, "tres") + 0.4, Wd(9, "tres") + 0.8)} />
        </SVG>
        {chip(9, "¿Y EL MÓVIL?", K.cold)}
        <Label x={780} y={520} text="SIN AGUJA" size={44} color={K.white} box o={L(9, "aguja")} />
        <Callout text="MAGNETÓMETRO" anchor={chip9} offset={[230, -150]} color={K.flow} t={t} t0={Wd(9, "magnetometro")} t1={E(9)} size={40} />
        <Label x={752} y={1090} text="3 DIRECCIONES" size={42} color={K.flow} box o={L(9, "tres")} />
      </Scene>

      {/* 10 · truco: hacer un ocho para que aprenda a restar sus propios imanes */}
      <Scene {...sc(10)}>
        <SVG>
          <path d={eight} fill="none" stroke={K.flow} strokeWidth={8} strokeDasharray="18 16" strokeLinecap="round" opacity={dimTo(10, "ocho")} />
          <Phone x={ph10.x} y={ph10.y} s={0.42} rot={rot10} hiMag={after(10, "propios")}>
            <Compass x={0} y={-90} r={110} heading={0} />
          </Phone>
        </SVG>
        {chip(10, "TRUCO")}
        <Label x={540} y={450} text="HAZ UN OCHO" size={48} color={K.flow} box o={L(10, "ocho")} />
        <Label x={540} y={1080} text="RESTA SUS PROPIOS IMANES" size={40} color={K.hot} box o={L(10, "restar")} />
      </Scene>

      {/* 11 · curiosidad: la brújula de aguja ya sale en un libro chino de hacia 1088 */}
      <Scene {...sc(11)}>
        <SVG>
          <OldBook x={540} y={900} w={760} h={340} o={dimTo(11, "libro")} />
          <line x1={420} y1={400} x2={420} y2={612} stroke={C.silk} strokeWidth={3} />
          <g transform={`translate(420,620)`}>
            <Needle L={130} heading={90 + 10 * Math.sin(t * 1.4)} w={14} hi />
          </g>
        </SVG>
        {chip(11, "CURIOSIDAD")}
        <Stamp x={780} y={500} text="1088" color={K.flow} size={64} p={R(11, "libro", 0.35)} />
        <Label x={780} y={600} text="DINASTÍA SONG" size={36} color={K.white} box o={L(11, "chino")} />
        <Label x={540} y={1110} text="LIBRO CHINO" size={42} color={K.flow} box o={L(11, "libro")} />
      </Scene>

      {/* 12 · otra: el campo se ha dado la vuelta muchas veces; la última, hace ~780.000 años */}
      <Scene {...sc(12)}>
        <SVG>
          <FieldLines x={470} y={720} R={200} Ls={[1.4, 1.8]} t={t} flip={fl12} />
          <Earth x={470} y={720} R={200} t={t} />
          <Compass x={540} y={1050} r={72} heading={180 * fl12} hiNeedle={after(12, "vuelta")} />
        </SVG>
        {chip(12, "OTRA: SE DA LA VUELTA", K.cold)}
        <Label x={540} y={430} text="CAMPO AL REVÉS" size={44} color={K.cold} box o={L(12, "vuelta", Wd(12, "ultima") - 0.05)} />
        <Label x={540} y={430} text="ÚLTIMA: HACE ~780.000 AÑOS" size={40} color={K.flow} box o={L(12, "ultima")} />
      </Scene>

      {/* 13 · resumen: hierro que gira, aguja que obedece, norte que se escapa */}
      <Scene {...sc(13)}>
        <SVG>
          <Earth x={220} y={720} R={140} t={t} cut={1} hiCore={after(13, "hierro")} />
          <Compass x={540} y={720} r={140} heading={after(13, "aguja") ? 20 * Math.sin((t - Wd(13, "aguja")) * 2) * Math.exp(-1.5 * (t - Wd(13, "aguja"))) : 0} hiNeedle={after(13, "aguja")} />
          <Arctic cx={A13.cx} cy={A13.cy} R={A13.R} maxColat={A13.mc} id="ar13" o={dimTo(13, "norte")} />
          <Star x={A13.cx} y={A13.cy} r={14} o={dimTo(13, "norte")} />
          <MagPole x={dot13.x} y={dot13.y} t={t} r={12} o={dimTo(13, "norte")} />
        </SVG>
        {chip(13, "RESUMEN")}
        <Label x={220} y={930} text="HIERRO" size={42} color={K.hot} box o={L(13, "hierro")} />
        <Label x={540} y={930} text="AGUJA" size={42} color={K.flow} box o={L(13, "aguja")} />
        <Label x={860} y={930} text="NORTE" size={42} color={K.flow} box o={L(13, "norte")} />
      </Scene>

      <Stamp x={560} y={455} text="¡FALSO!" p={ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.3) * (t < scene(1)[1] ? 1 : 0)} />
      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
