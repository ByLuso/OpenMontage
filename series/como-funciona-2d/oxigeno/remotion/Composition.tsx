// Episodio 135 · Cómo funciona un concentrador de oxígeno (ESPECIAL HOSPITAL).
// Cada beat es una <Scene> con su dibujo y 1-3 etiquetas. Cambios atados a palabras con Wd(beat, "palabra").
// Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { C, Mol, AirBox, Column, Compressor, Filter, Tank, Flowmeter, Concentrator, Profile, Portable, Person, Lattice, Flame, NoSmoke, Hiss, rnd } from "./Oxigeno";

export const COMP_ID = "Oxigeno";
export const HOOK = "Oxígeno sin bombona"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);

/** Punto sobre una polilínea en u ∈ [0, 1] (por longitud). */
const along = (pts: [number, number][], u: number): [number, number] => {
  const L: number[] = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const d = u * L[L.length - 1];
  let i = 1; while (i < pts.length - 1 && L[i] < d) i++;
  const f = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
  return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
};

/** Moléculas que viajan por una polilínea. mix: true = aire (1 de cada 5 es O₂); false = solo O₂. */
const Flow: React.FC<{ pts: [number, number][]; t: number; n?: number; speed?: number; mix?: boolean; o?: number; r?: number; pipe?: boolean }> =
  ({ pts, t, n = 8, speed = 0.25, mix = true, o = 1, r = 12, pipe = false }) => (
    <g opacity={o}>
      {pipe && <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={C.case2} strokeWidth={r * 3.4} strokeLinejoin="round" strokeLinecap="round" opacity={0.55} />}
      {Array.from({ length: n }).map((_, i) => {
        const u = (t * speed + i / n) % 1; const [x, y] = along(pts, u);
        const kind = mix ? (i % 5 === 2 ? "o2" : "n2") : "o2";
        return <Mol key={i} x={x + (pipe ? 0 : 14 * Math.sin(i * 2.1 + t * 3))} y={y + (pipe ? 0 : 14 * Math.cos(i * 1.3 + t * 2))} kind={kind} r={r} o={Math.min(1, Math.sin(Math.PI * u) * 3)} rot={u * 360 + i * 40} />;
      })}
    </g>
  );

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const S = (i: number) => scene(i)[0];
  const E = (i: number) => scene(i)[1];
  const chip = (i: number) => span(t, S(i), E(i));
  const dim = (x: number) => 0.3 + 0.7 * x; // atenuado antes de entrar
  const sp = (i: number, w: string, end?: number) => span(t, Wd(i, w), end ?? E(i));
  const on = (i: number, w: string, d = 0.4) => ramp(t, Wd(i, w), Wd(i, w) + d);
  const phaseAt = (per: number) => Math.floor(t / per) % 2; // qué columna filtra

  // ---- tiempos clave
  const b1ghost = on(1, "bombona", 0.5);
  const b1open = ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.7);
  const b2tank = on(2, "guarda");
  const b2air = on(2, "saca");
  const b3out = ramp(t, Wd(3, "quítaselo"), Wd(3, "quítaselo") + 1.0);
  const b5push = on(5, "empuja");
  const b6trap = on(6, "atrapa");
  const b8lpm = ramp(t, Wd(8, "litros"), Wd(8, "minuto") + 0.4);
  const b9puffT = (t - Wd(9, "soplo")) % 2.2;
  const b9puff = t > Wd(9, "soplo") && b9puffT < 0.8 ? b9puffT / 0.8 : 0;
  const b10per = 1.8; const b10p = ((t % b10per) / 0.7);
  const b12boost = on(12, "aviva", 0.6);
  const b13hi = t < Wd(13, "compresor") ? "filter" : t < Wd(13, "zeolita") ? "comp" : t < Wd(13, "dos") ? "cols" : t < Wd(13, "oxígeno") ? "valve" : "out";

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el concentrador GRANDE desde el fotograma 0; con «bombona» aparece la bombona que «todos creen»; con «equivocados» se abre: dentro no hay bombona */}
      <Scene {...sc(1)}>
        <SVG><g transform={`translate(540 720) scale(${1 + 0.01 * Math.sin(t * 2)}) translate(-540 -720)`}>
          <Concentrator x={540} y={720} s={1.12} t={t} open={b1open} ghost={b1ghost} phase={phaseAt(2)} on={b1open > 0.5 ? 1 : 0} hi={b1open > 0.9 ? "cols" : "none"} />
        </g></SVG>
        <Label x={540} y={1125} text="dentro: aire y zeolita" color={K.flow} size={44} box o={span(t, Wd(1, "equivocados") + 0.6, E(1))} />
      </Scene>

      {/* 2 · la promesa: no guarda oxígeno, lo saca del aire de la habitación */}
      <Scene {...sc(2)}>
        <Chip text="Un concentrador de oxígeno" o={chip(2)} />
        <SVG>
          <Flow pts={[[1010, 1080], [820, 960], [660, 760], [560, 620]]} t={t} n={12} speed={0.3} o={dim(b2air)} />
          <Concentrator x={330} y={760} s={0.75} t={t} lpm={2} />
          <Tank x={820} y={650} s={0.42} o={dim(b2tank)} cross={b2tank} />
        </SVG>
        <Label x={820} y={490} text="no guarda oxígeno" color={K.white} size={38} o={dim(sp(2, "guarda"))} />
        <Label x={540} y={1125} text="lo saca del aire" color={K.cold} size={46} box o={dim(sp(2, "saca"))} />
      </Scene>

      {/* 3 · idea clave: el aire es sobre todo nitrógeno; quítalo y queda casi todo oxígeno */}
      <Scene {...sc(3)}>
        <Chip text="La idea clave" o={chip(3)} />
        <SVG>
          <rect x={90} y={420} width={900} height={540} rx={40} fill="none" stroke={C.case2} strokeWidth={5} strokeDasharray="18 12" />
          <AirBox x0={90} y0={420} w={900} h={540} t={t} n={45} nOut={b3out} o2Hi={on(3, "queda")} />
        </SVG>
        <Label x={290} y={1015} text="78 % nitrógeno" color={C.n2} size={42} o={dim(span(t, S(3) + 0.2, Wd(3, "quítaselo") + 0.6))} />
        <Label x={790} y={1015} text="21 % oxígeno" color={K.cold} size={42} o={dim(span(t, S(3) + 0.2, E(3)))} />
        <Label x={540} y={1120} text="casi todo oxígeno" color={K.flow} size={46} box o={dim(sp(3, "queda"))} />
      </Scene>

      {/* 4 · primero: el aire de la habitación entra por un filtro */}
      <Scene {...sc(4)}>
        <Chip text="1 · El filtro" o={chip(4)} />
        <SVG>
          <Flow pts={[[1030, 640], [560, 700], [80, 760]]} t={t} n={14} speed={0.22} />
          {[0, 1, 2, 3, 4].map((i) => { const u = (t * 0.5 + i / 5) % 1; return <circle key={i} cx={1030 - 420 * Math.min(1, u * 1.3)} cy={520 + i * 90 + 8 * Math.sin(t * 3 + i)} r={11} fill={C.dust} opacity={u < 0.85 ? 1 : (1 - u) * 6} />; })}
          <Filter x={540} y={720} w={100} h={500} t={t} hi={on(4, "filtro")} />
        </SVG>
        <Label x={800} y={1015} text="aire de la habitación" color={K.white} size={38} o={span(t, S(4) + 0.2, Wd(4, "veintiuno"))} />
        <Label x={800} y={1015} text="21 % oxígeno" color={K.cold} size={44} box o={dim(span(t, Wd(4, "veintiuno") + 0.3, E(4)))} />
        <Label x={540} y={420} text="FILTRO" color={K.flow} size={50} o={dim(sp(4, "filtro"))} />
      </Scene>

      {/* 5 · segundo: el compresor aprieta el aire y lo empuja a una columna de zeolita */}
      <Scene {...sc(5)}>
        <Chip text="2 · El compresor" o={chip(5)} />
        <SVG>
          <Flow pts={[[420, 640], [590, 640], [590, 1080], [780, 1080], [780, 1040]]} t={t} n={10} speed={0.25 + 0.25 * b5push} pipe o={dim(b5push)} r={11} />
          <Compressor x={290} y={760} s={1.35} t={t} hi={on(5, "aprieta")} />
          <Column x={780} y={440} w={180} h={600} t={t} mode={b5push > 0.3 ? "filter" : "idle"} hi={on(5, "zeolita")} />
        </SVG>
        <Label x={290} y={470} text="aprieta el aire" color={K.hot} size={42} o={dim(sp(5, "aprieta"))} />
        <Label x={720} y={1125} text="columna de zeolita" color={K.flow} size={42} box o={dim(sp(5, "columna"))} />
      </Scene>

      {/* 6 · tercero: a presión, la zeolita atrapa el N₂ y deja pasar el O₂ hacia las gafas nasales */}
      <Scene {...sc(6)}>
        <Chip text="3 · La zeolita" o={chip(6)} />
        <SVG>
          <Flow pts={[[300, 430], [300, 400], [560, 400], [600, 520], [660, 860], [790, 905]]} t={t} n={6} speed={0.3} mix={false} pipe o={dim(on(6, "deja"))} r={10} />
          <Column x={300} y={430} w={230} h={620} t={t} mode="filter" flowO={dim(b6trap)} hi={b6trap} />
          <Profile x={760} y={640} s={0.8} t={t} o={dim(on(6, "gafas"))} />
        </SVG>
        <Label x={300} y={1115} text="atrapa el nitrógeno" color={C.n2} size={40} box o={dim(sp(6, "atrapa"))} />
        <Label x={760} y={455} text="pasa el oxígeno" color={K.cold} size={40} o={dim(sp(6, "deja"))} />
        <Label x={760} y={1115} text="gafas nasales" color={K.cold} size={38} box o={dim(sp(6, "gafas"))} />
      </Scene>

      {/* 7 · cuarto: dos columnas que se turnan; la que descansa suelta el N₂ a la habitación */}
      <Scene {...sc(7)}>
        <Chip text="4 · Dos columnas" o={chip(7)} />
        <SVG>
          {[0, 1].map((k) => {
            const x = k === 0 ? 330 : 750; const filt = phaseAt(2.2) === k;
            return <g key={k}>
              <Column x={x} y={460} w={200} h={500} t={t} mode={filt ? "filter" : "purge"} hi={filt ? 1 : 0} />
              {!filt && <Hiss x={x + 90} y={990} p={((t % 2.2) / 0.9)} s={1} />}
              {!filt && [0, 1, 2].map((i) => { const u = ((t % 2.2) / 1.6 + i * 0.2) % 1; return <Mol key={i} x={x + 60 + 140 * u * (k === 0 ? -1 : 1) * 0.0 + 120 * u} y={1000 + 30 * Math.sin(u * 6 + i)} kind="n2" r={11} o={Math.sin(Math.PI * u)} rot={u * 300} />; })}
            </g>;
          })}
          <rect x={250} y={990} width={580} height={36} rx={14} fill={C.case2} stroke={C.case3} strokeWidth={5} />
          <circle cx={330 + 420 * phaseAt(2.2)} cy={1008} r={14} fill={K.flow} />
        </SVG>
        <Label x={330} y={420} text={phaseAt(2.2) === 0 ? "filtra" : "suelta nitrógeno"} color={phaseAt(2.2) === 0 ? K.flow : C.n2} size={38} o={dim(sp(7, "filtra"))} />
        <Label x={750} y={420} text={phaseAt(2.2) === 1 ? "filtra" : "suelta nitrógeno"} color={phaseAt(2.2) === 1 ? K.flow : C.n2} size={38} o={dim(sp(7, "filtra"))} />
        <Label x={540} y={1110} text="se turnan" color={K.flow} size={44} box o={dim(sp(7, "turnan"))} />
      </Scene>

      {/* 8 · resultado: oxígeno al noventa y pico por ciento; los litros por minuto los decide el médico */}
      <Scene {...sc(8)}>
        <Chip text="Resultado" o={chip(8)} />
        <SVG>
          <Flowmeter x={270} y={720} h={520} lpm={2 * b8lpm} t={t} />
          {[0, 1, 2, 3, 4, 5].map((i) => <Mol key={i} x={700 + 150 * Math.cos(i * 1.05 + t * 0.6)} y={720 + 120 * Math.sin(i * 1.05 + t * 0.6)} kind={i === 4 ? "n2" : "o2"} r={20} rot={t * 40 + i * 60} o={dim(on(8, "oxígeno"))} />)}
          <Person x={820} y={890} s={0.32} o={dim(on(8, "decide"))} />
          <rect x={700} y={930} width={70} height={90} rx={8} fill={K.white} opacity={dim(on(8, "decide"))} />
          {[0, 1, 2].map((i) => <line key={i} x1={712} y1={952 + i * 22} x2={758} y2={952 + i * 22} stroke={C.case2} strokeWidth={6} opacity={dim(on(8, "decide"))} />)}
        </SVG>
        <Label x={700} y={500} text="90 y pico %" color={K.cold} size={72} o={dim(sp(8, "noventa"))} />
        <Label x={270} y={1035} text="litros/minuto" color={K.flow} size={38} o={dim(sp(8, "litros"))} />
        <Label x={640} y={1125} text="lo decide el médico" color={K.white} size={42} box o={dim(sp(8, "decide"))} />
      </Scene>

      {/* 9 · portátiles con batería; algunos solo dan un soplo al inspirar */}
      <Scene {...sc(9)}>
        <Chip text="Los portátiles" o={chip(9)} />
        <SVG>
          <Person x={330} y={540} s={0.85} />
          <path d={`M 290 560 C 250 600 260 700 330 760 C 420 840 560 820 640 810`} fill="none" stroke={K.cold} strokeWidth={8} opacity={0.85} />
          {b9puff > 0.01 && [0, 1, 2].map((i) => <circle key={i} cx={300 - i * 26 * b9puff} cy={565 + (i - 1) * 16 * b9puff} r={10 - 2 * i} fill={K.cold} opacity={1 - b9puff * 0.7} />)}
          <Portable x={720} y={800} s={0.95} t={t} charge={0.25 + 0.75 * ((t * 0.3) % 1)} o={dim(on(9, "portátiles"))} />
        </SVG>
        <Label x={760} y={560} text="con batería" color={K.flow} size={42} o={dim(sp(9, "batería"))} />
        <Label x={540} y={1120} text="un soplo al inspirar" color={K.cold} size={44} box o={dim(sp(9, "soplo"))} />
      </Scene>

      {/* 10 · curiosidad: el «pssst» rítmico = la válvula cambia de columna y suelta el N₂ */}
      <Scene {...sc(10)}>
        <Chip text="Curiosidad" o={chip(10)} />
        <SVG>
          <Concentrator x={540} y={730} s={0.95} t={t} open={1} phase={phaseAt(b10per)} hi={t > Wd(10, "válvula") ? "valve" : "cols"} />
          <Hiss x={790} y={850} p={b10p} s={1.3} />
          {[0, 1, 2].map((i) => { const u = ((t % b10per) / 1.2 + i * 0.15); return u < 1 ? <Mol key={i} x={790 + 170 * u} y={850 + 40 * Math.sin(u * 7 + i)} kind="n2" r={11} o={Math.sin(Math.PI * u)} rot={u * 300} /> : null; })}
        </SVG>
        <Label x={900} y={500} text="«pssst»" color={K.white} size={54} o={dim(Math.max(0.15, Math.sin(Math.PI * Math.min(1, b10p))) * span(t, S(10), E(10)))} />
        <Label x={175} y={860} text="válvula" color={K.flow} size={40} box o={dim(sp(10, "válvula"))} />
      </Scene>

      {/* 11 · otra: la zeolita, un mineral lleno de poros diminutos, como una esponja para gases */}
      <Scene {...sc(11)}>
        <Chip text="Otra curiosidad" o={chip(11)} />
        <SVG><Lattice x={500} y={720} s={0.95} t={t} trap={dim(on(11, "poros"))} /></SVG>
        <Label x={540} y={1075} text="poros diminutos" color={K.flow} size={44} box o={dim(span(t, Wd(11, "poros"), Wd(11, "esponja")))} />
        <Label x={540} y={1075} text="una esponja para gases" color={K.cold} size={44} box o={span(t, Wd(11, "esponja") + 0.3, E(11))} />
      </Scene>

      {/* 12 · ojo: el oxígeno no arde pero aviva el fuego; nada de fumar ni llamas cerca */}
      <Scene {...sc(12)}>
        <Chip text="Ojo con el fuego" color={K.hot} o={chip(12)} />
        <SVG>
          <Flow pts={[[60, 1000], [200, 960], [320, 880]]} t={t} n={5} speed={0.35} mix={false} o={dim(b12boost)} />
          <Flame x={330} y={920} s={0.85} t={t} boost={b12boost} />
          <NoSmoke x={770} y={690} s={1.15} o={dim(on(12, "fumar"))} />
        </SVG>
        <Label x={330} y={1010} text="no arde…" color={K.white} size={42} o={span(t, Wd(12, "arde"), Wd(12, "aviva") + 0.05, 0.2)} />
        <Label x={330} y={1010} text="pero aviva el fuego" color={K.hot} size={42} box o={span(t, Wd(12, "aviva") + 0.3, E(12))} />
        <Label x={560} y={1120} text="nada de fumar ni llamas" color={K.warn} size={42} box o={dim(sp(12, "fumar"))} />
      </Scene>

      {/* 13 · cierre */}
      <Scene {...sc(13)}>
        <Chip text="En resumen" o={chip(13)} />
        <SVG>
          <Flow pts={[[1030, 520], [930, 540], [880, 560]]} t={t} n={4} speed={0.4} o={b13hi === "filter" ? 1 : 0.3} />
          <Concentrator x={540} y={720} s={0.85} t={t} open={1} phase={phaseAt(2)} hi={b13hi as any} />
        </SVG>
        <Label x={930} y={460} text="AIRE" color={K.cold} size={46} o={dim(sp(13, "aire"))} />
        <Label x={180} y={600} text="ZEOLITA" color={K.flow} size={40} o={dim(sp(13, "zeolita"))} />
        <Label x={540} y={1110} text="OXÍGENO SIN BOMBONA" color={K.flow} size={46} box o={dim(sp(13, "oxígeno"))} />
      </Scene>

      <Stamp x={540} y={560} text="¡FALSO!" p={ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.3) * (t < scene(1)[1] ? 1 : 0)} />
      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
void rnd;
