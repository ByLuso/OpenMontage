// Episodio 130 · Cómo funciona el visor de venas (ESPECIAL HOSPITAL).
// Cada beat es una <Scene> con su dibujo y 1-3 etiquetas. Cambios atados a palabras con Wd(beat, "palabra").
// Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { C, Arm, Head, Cone, SkinCut, Photon, Spectrum, Camera, Screen, Person, Baby, BackLitHand } from "./Venas";

export const COMP_ID = "Venas";
export const HOOK = "Dibuja tus venas"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);

/** Visor completo: cabezal + cono + brazo. */
const Viewer: React.FC<{ t: number; open?: number; nir?: number; map?: number; proj?: number; dashed?: boolean; hi?: "cam" | "proj" | "led" | "none"; veins?: number; cam?: number }> =
  ({ t, open = 1, nir = 1, map = 0, proj = 0, dashed = true, hi = "none", veins = 0.12, cam = 0 }) => (
    <>
      <Cone x={540} y0={690} y1={910} w0={140} w1={760} o={nir * open} t={t} kind="nir" dashed={dashed} />
      <Cone x={635} y0={690} y1={910} w0={50} w1={700} o={proj * open} t={t} kind="map" />
      <Arm t={t} veins={veins} map={map} cam={cam} />
      <Head x={540} y={600} t={t} open={open} glow={nir} hi={hi} />
    </>
  );

// Rutas de fotones en el corte de piel (beat 5): entran por arriba, se desvían; unos vuelven, otros mueren en la vena.
const P_BACK: [number, number][][] = [
  [[250, 560], [270, 700], [230, 790], [300, 760], [330, 640], [320, 540]],
  [[420, 560], [400, 690], [470, 780], [500, 700], [470, 620], [480, 540]],
  [[860, 560], [840, 680], [900, 760], [880, 660], [900, 540]],
];
const P_DIE: [number, number][][] = [
  [[620, 560], [640, 700], [660, 820]],
  [[700, 560], [690, 690], [680, 810]],
];

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
  void B;

  // ---- tiempos clave
  const b1open = ramp(t, Wd(1, "truco"), Wd(1, "truco") + 0.6);
  const b1map = ramp(t, Wd(1, "dibuja"), Wd(1, "piel") + 0.6);
  const b2nir = ramp(t, Wd(2, "ilumina"), Wd(2, "ilumina") + 0.5);
  const b2map = ramp(t, Wd(2, "marca"), E(2) - 0.2);
  const b3abs = ramp(t, Wd(3, "traga"), Wd(3, "traga") + 0.5);
  const b4mark = ramp(t, Wd(4, "ochocientos"), Wd(4, "ochocientos") + 0.4);
  const b5abs = ramp(t, Wd(5, "absorbe"), Wd(5, "absorbe") + 0.4);
  const b6shot = ramp(t, Wd(6, "foto"), Wd(6, "foto") + 0.5);
  const b7map = ramp(t, Wd(7, "dibuja"), Wd(7, "real"));
  const b7scr = ramp(t, Wd(7, "pantalla"), Wd(7, "pantalla") + 0.4);
  const b8baby = ramp(t, Wd(8, "bebés"), Wd(8, "bebés") + 0.4);
  const b8old = ramp(t, Wd(8, "mayores"), Wd(8, "mayores") + 0.4);
  const b8vis = ramp(t, Wd(8, "simple"), Wd(8, "simple") + 0.4);
  const b9pro = ramp(t, Wd(9, "quien"), Wd(9, "quien") + 0.4);
  const b10blue = ramp(t, Wd(10, "azul"), Wd(10, "milímetro") + 0.4);
  const b11glow = ramp(t, Wd(11, "luz"), Wd(11, "luz") + 0.6);
  const b12 = (w: string) => ramp(t, Wd(12, w), Wd(12, w) + 0.4);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el visor grande desde el fotograma 0; con «truco» se abren las tapas y con «dibuja» aparece el mapa */}
      <Scene {...sc(1)}>
        <SVG><g transform={`translate(540 800) scale(${1.08 + 0.01 * Math.sin(t * 2)}) translate(-540 -800)`}>
          <Viewer t={t} open={0.0001 + b1open} nir={b1open} proj={b1map} map={b1map} dashed={false} />
        </g></SVG>
        <Label x={540} y={1130} text="tus venas, sobre la piel" color={K.flow} size={46} box o={span(t, Wd(1, "venas"), E(1))} />
      </Scene>

      {/* 2 · la promesa: luz que no ves + marca dónde están */}
      <Scene {...sc(2)}>
        <Chip text="Un visor de venas" o={chip(2)} />
        <SVG><Viewer t={t} nir={dim(b2nir)} proj={b2map} map={b2map} /></SVG>
        <Label x={300} y={800} text="luz que no ves" color={K.hot} size={42} box o={dim(span(t, Wd(2, "luz"), E(2)))} />
        <Label x={540} y={1130} text="dónde están" color={K.flow} size={44} box o={dim(span(t, Wd(2, "marca"), E(2)))} />
      </Scene>

      {/* 3 · idea clave: la sangre se traga la luz; lo de alrededor la devuelve */}
      <Scene {...sc(3)}>
        <Chip text="La idea clave" o={chip(3)} />
        <SVG>
          <SkinCut y0={700} h={380} veins={[{ x: 700, y: 880, r: 80 }]} />
          {/* rayo sobre tejido: baja y vuelve */}
          {[0, 0.5].map((k, i) => { const u = (t * 0.8 + k) % 1; const down = u < 0.5; const yy = down ? 520 + 520 * u : 1040 - 520 * u; return <circle key={i} cx={300 + (down ? 0 : 60)} cy={yy} r={14} fill={K.hot} opacity={0.9} />; })}
          <path d="M 300 520 L 300 780 L 360 780 L 360 520" fill="none" stroke={K.hot} strokeWidth={6} strokeDasharray="14 10" opacity={0.6} />
          <polygon points="360,500 340,535 380,535" fill={K.hot} />
          {/* rayo sobre la vena: baja y se apaga */}
          {[0, 0.5].map((k, i) => { const u = (t * 0.8 + k) % 1; return <circle key={"v" + i} cx={700} cy={520 + 300 * u} r={14} fill={K.hot} opacity={(1 - u) * (1 - 0.6 * b3abs) + 0.2} />; })}
          <line x1={700} y1={520} x2={700} y2={800} stroke={K.hot} strokeWidth={6} strokeDasharray="14 10" opacity={0.6} />
          <circle cx={700} cy={880} r={80 + 10 * b3abs * Math.sin(t * 6)} fill="none" stroke={K.flow} strokeWidth={6} opacity={b3abs} />
        </SVG>
        <Label x={330} y={460} text="vuelve" color={K.hot} size={40} o={span(t, S(3) + 0.3, E(3))} />
        <Label x={700} y={1040} text="la sangre se la traga" color={K.flow} size={42} box o={dim(span(t, Wd(3, "traga"), E(3)))} />
      </Scene>

      {/* 4 · primero: la luz infrarroja cercana, ~850 nm */}
      <Scene {...sc(4)}>
        <Chip text="1 · La luz" o={chip(4)} />
        <SVG>
          <Spectrum x0={110} x1={970} y={720} mark={dim(b4mark)} t={t} nirO={dim(ramp(t, Wd(4, "infrarroja"), Wd(4, "infrarroja") + 0.4))} />
          <Head x={330} y={1060} s={0.42} t={t} hi="led" />
        </SVG>
        <Label x={340} y={640} text="lo que ves" color={K.white} size={40} o={span(t, S(4) + 0.2, E(4))} />
        <Label x={780} y={570} text="≈ 850 nm" color={K.hot} size={60} o={dim(span(t, Wd(4, "ochocientos"), E(4)))} />
        <Label x={760} y={665} text="infrarroja" color={K.hot} size={38} o={dim(span(t, Wd(4, "infrarroja"), E(4)))} />
      </Scene>

      {/* 5 · segundo: se cuela bajo la piel y la hemoglobina la absorbe */}
      <Scene {...sc(5)}>
        <Chip text="2 · La sangre" o={chip(5)} />
        <SVG>
          <SkinCut y0={560} h={460} veins={[{ x: 660, y: 830, r: 85 }]} />
          {P_BACK.map((p, i) => <Photon key={i} path={p} u={(t * 0.45 + i * 0.31) % 1} />)}
          {P_DIE.map((p, i) => <Photon key={"d" + i} path={p} u={(t * 0.45 + i * 0.5) % 1} die />)}
          {/* flechas que vuelven: muchas sobre el tejido, pocas sobre la vena */}
          {[300, 480, 880].map((x, i) => <polygon key={i} points={`${x},${470 - 8 * Math.sin(t * 4 + i)} ${x - 20},${505} ${x + 20},${505}`} fill={K.hot} />)}
          <polygon points="660,470 640,505 680,505" fill={K.hot} opacity={0.25 + 0.75 * (1 - b5abs)} />
        </SVG>
        <Label x={360} y={940} text="bajo la piel" color={K.white} size={38} o={span(t, Wd(5, "cuela"), E(5))} />
        <Label x={660} y={1080} text="HEMOGLOBINA" color={K.warn} size={44} box o={dim(span(t, Wd(5, "hemoglobina"), E(5)))} />
        <Label x={660} y={420} text="vuelve menos luz" color={K.flow} size={40} box o={dim(span(t, Wd(5, "vuelve"), E(5)))} />
      </Scene>

      {/* 6 · tercero: la cámara infrarroja hace la foto → líneas oscuras */}
      <Scene {...sc(6)}>
        <Chip text="3 · La cámara" o={chip(6)} />
        <SVG>
          <Camera x={300} y={560} s={0.95} flash={b6shot < 1 ? b6shot : 0} />
          <Screen x={720} y={590} w={400} h={300} t={t} o={dim(b6shot)} />
          <Arm t={t} cam={b6shot} veins={0.12} />
        </SVG>
        <Label x={300} y={720} text="ve el infrarrojo" color={K.hot} size={38} o={span(t, Wd(6, "cámara"), E(6))} />
        <Label x={720} y={790} text="líneas oscuras" color={K.white} size={40} box o={dim(span(t, Wd(6, "líneas"), E(6)))} />
      </Scene>

      {/* 7 · cuarto: el proyector dibuja el mapa en tiempo real; otros, en pantalla */}
      <Scene {...sc(7)}>
        <Chip text="4 · El proyector" o={chip(7)} />
        <SVG>
          <Viewer t={t} nir={1} proj={dim(b7map)} map={b7map} hi={t < Wd(7, "otros") ? "proj" : "none"} />
          <g opacity={b7scr}><Screen x={250} y={500} w={300} h={210} t={t} dark={false} /></g>
        </SVG>
        <Label x={760} y={480} text="proyector" color={K.flow} size={40} o={span(t, Wd(7, "proyector"), Wd(7, "otros"))} />
        <Label x={540} y={1130} text="en tiempo real" color={K.flow} size={44} box o={dim(span(t, Wd(7, "tiempo"), E(7)))} />
        <Label x={250} y={650} text="o en pantalla" color={K.white} size={38} box o={span(t, Wd(7, "pantalla"), E(7))} />
      </Scene>

      {/* 8 · para qué: venas difíciles */}
      <Scene {...sc(8)}>
        <Chip text="¿Para qué sirve?" o={chip(8)} />
        <SVG>
          <Baby x={270} y={560} s={0.9} o={dim(b8baby)} />
          <Person x={700} y={520} s={0.62} o={dim(b8old)} cane />
          <g opacity={dim(b8vis)} transform="translate(0 30)">
            <rect x={160} y={900} width={760} height={150} rx={75} fill={C.skin} stroke={C.skinEdge} strokeWidth={5} />
            <path d="M 200 980 C 400 960 600 1000 880 970" fill="none" stroke={C.vein} strokeWidth={14} strokeLinecap="round" opacity={0.08} />
            <text x={540} y={1000} textAnchor="middle" fontSize={90} fontWeight={900} fill={C.dark} fontFamily="MontserratSerie" opacity={0.6 + 0.3 * Math.sin(t * 4)}>?</text>
          </g>
        </SVG>
        <Label x={270} y={820} text="bebés" color={K.cold} size={42} o={dim(span(t, Wd(8, "bebés"), E(8)))} />
        <Label x={680} y={830} text="personas mayores" color={K.cold} size={40} o={dim(span(t, Wd(8, "mayores"), E(8)))} />
        <Label x={540} y={1130} text="no se ven a simple vista" color={K.white} size={40} box o={dim(span(t, Wd(8, "simple"), E(8)))} />
      </Scene>

      {/* 9 · ojo: solo venas cercanas; decide el personal sanitario */}
      <Scene {...sc(9)}>
        <Chip text="Ojo: no lo hace todo" color={K.hot} o={chip(9)} />
        <SVG>
          <SkinCut y0={480} h={420} veins={[{ x: 300, y: 610, r: 50 }, { x: 560, y: 820, r: 60, o: 0.35 }]} />
          <circle cx={300} cy={610} r={66 + 4 * Math.sin(t * 5)} fill="none" stroke={K.flow} strokeWidth={6} />
          <text x={560} y={845} textAnchor="middle" fontSize={70} fontWeight={900} fill={K.white} fontFamily="MontserratSerie" opacity={0.7}>?</text>
          {/* zona que alcanza el visor */}
          <rect x={70} y={490} width={940} height={190} rx={18} fill="none" stroke={K.hot} strokeWidth={4} strokeDasharray="14 10" strokeDashoffset={-t * 30} opacity={0.7} />
          <Person x={830} y={940} s={0.28} o={dim(b9pro)} />
        </SVG>
        <Label x={300} y={430} text="cerca de la piel" color={K.flow} size={42} o={span(t, Wd(9, "cercanas"), E(9))} />
        <Label x={400} y={1060} text="decide el personal sanitario" color={K.cold} size={38} box o={dim(span(t, Wd(9, "quien"), E(9)))} />
      </Scene>

      {/* 10 · curiosidad: con luz normal la piel la frena; la azul apenas entra un milímetro */}
      <Scene {...sc(10)}>
        <Chip text="Curiosidad" o={chip(10)} />
        <SVG>
          <SkinCut y0={640} h={420} veins={[{ x: 760, y: 900, r: 70 }]} />
          {/* luz normal: rayos que se paran y se desparraman nada más entrar */}
          {[0, 1, 2, 3, 4].map((i) => {
            const u = (t * 0.8 + i / 5) % 1; const x = 200 + i * 80; const col = i % 2 ? "#2F6BFF" : K.white;
            const yy = 470 + 200 * Math.min(1, u * 1.5);
            return <g key={i}>
              <line x1={x} y1={470} x2={x} y2={670} stroke={col} strokeWidth={6} opacity={0.18} />
              <line x1={x} y1={Math.max(470, yy - 70)} x2={x} y2={yy} stroke={col} strokeWidth={12} strokeLinecap="round" opacity={u < 0.67 ? 0.9 : 0} />
              {u >= 0.67 && [-1, 0, 1].map((j) => { const k = (u - 0.67) * 3; return <circle key={j} cx={x + j * 40 * k} cy={672 - (j === 0 ? 30 : 12) * k} r={9} fill={col} opacity={1 - k} />; })}
            </g>;
          })}
          {/* zoom: 1 mm */}
          <g opacity={dim(b10blue)}>
            <rect x={160} y={640} width={400} height={40} fill={"#2F6BFF"} opacity={0.35 + 0.15 * Math.sin(t * 4)} />
            <line x1={130} y1={640} x2={130} y2={680} stroke={K.flow} strokeWidth={8} />
            <line x1={110} y1={640} x2={150} y2={640} stroke={K.flow} strokeWidth={6} />
            <line x1={110} y1={680} x2={150} y2={680} stroke={K.flow} strokeWidth={6} />
          </g>
        </SVG>
        <Label x={540} y={420} text="luz normal" color={K.white} size={40} o={span(t, Wd(10, "luz"), E(10))} />
        <Label x={360} y={860} text="azul: ≈ 1 mm" color={K.cold} size={48} box o={dim(span(t, Wd(10, "azul"), E(10)))} />
        <Label x={760} y={1110} text="la vena, sin luz" color={K.white} size={36} o={dim(span(t, Wd(10, "frena"), E(10)))} />
      </Scene>

      {/* 11 · otra: luz bajo la manita, a contraluz */}
      <Scene {...sc(11)}>
        <Chip text="Otra curiosidad" o={chip(11)} />
        <SVG><BackLitHand x={540} y={760} s={1.15} glow={dim(b11glow)} t={t} /></SVG>
        <Label x={540} y={470} text="truco más antiguo" color={K.flow} size={42} o={span(t, Wd(11, "truco"), Wd(11, "contraluz"))} />
        <Label x={540} y={470} text="a contraluz" color={K.flow} size={52} o={span(t, Wd(11, "contraluz"), E(11))} />
        <Label x={540} y={1120} text="luz debajo" color={K.white} size={38} box o={dim(span(t, Wd(11, "luz"), E(11)))} />
      </Scene>

      {/* 12 · cierre */}
      <Scene {...sc(12)}>
        <Chip text="En resumen" o={chip(12)} />
        <SVG><Viewer t={t} nir={1} proj={1} map={1} dashed={false} hi={t < Wd(12, "sangre") ? "led" : t < Wd(12, "cámara") ? "none" : t < Wd(12, "proyector") ? "cam" : "proj"} /></SVG>
        <Label x={260} y={470} text="LUZ INVISIBLE" color={K.hot} size={38} o={dim(span(t, Wd(12, "luz"), E(12)))} />
        <Label x={540} y={1130} text="SANGRE QUE LA ABSORBE" color={K.warn} size={38} box o={dim(span(t, Wd(12, "sangre"), E(12)))} />
        <Label x={300} y={800} text="CÁMARA + PROYECTOR" color={K.flow} size={36} box o={dim(span(t, Wd(12, "cámara"), E(12)))} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
