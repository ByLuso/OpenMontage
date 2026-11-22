// Episodio 162 · Cómo sabe la máquina expendedora qué moneda le has metido (y si es falsa).
// Rampa → tamaño (diámetro y grosor) → metal (bobinas y corrientes de Foucault) → compuerta → tubos de cambio. Máquina y monedas genéricas.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Coin, CoinSide, Coil, Eddy, Magnet, Signal, Mech, Vending, Tubes, Heron, Edge, Layers, Check, Cross, Dim, C } from "./Expendedora";

export const COMP_ID = "Expendedora";
export const HOOK = "Tu moneda pasa entre imanes"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

/** Atenuado al principio (0,3) y pleno desde la palabra w. */
const dim = (t: number, w: number) => 0.3 + 0.7 * ramp(t, w, w + 0.3);
const on = (t: number, w: number, d = 0.3) => ramp(t, w, w + d);
/** Bucle 0→1 cada `per` segundos. */
const loop = (t: number, per: number, off = 0) => (((t + off) % per) + per) % per / per;

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(scene(i)[0], i === 1 ? 1.8 : 0), scene(i)[1])} />;
  const A = (i: number) => scene(i)[0];
  const Z = (i: number) => scene(i)[1];
  const svg = (children: React.ReactNode) => <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>;

  // ---------- beat 1 ----------
  const b1open = ramp(t, Wd(1, "secreto"), Wd(1, "secreto") + 0.7);
  const b1mag = on(t, Wd(1, "imanes"));
  // ---------- beat 2 ----------
  const b2coin = 0.02 + 0.98 * ramp(t, Wd(2, "rueda"), Z(2) - 0.4);
  // ---------- beat 4 ----------
  const b4sens = on(t, Wd(4, "sensores"));
  // ---------- beat 6 ----------
  const b6swap = on(t, Wd(6, "algunas"), 0.4);
  const b6q = ramp(t, Wd(6, "algunas"), Z(6) - 0.2);
  const b6x = 170 + 430 * (1 - Math.pow(1 - b6q, 2.6));
  const b6v = Math.pow(1 - b6q, 1.6) * on(t, Wd(6, "imán"));
  // ---------- beat 7 ----------
  const b7stick = on(t, Wd(7, "pegan"), 0.25);
  // ---------- beat 8 ----------
  const b8split = on(t, Wd(8, "juntan"), 0.4) * (1 - on(t, Wd(8, "dentro"), 0.4));
  // ---------- beat 9 ----------
  const b9no = Wd(9, "no");
  const b9first = t < b9no - 0.1;
  const b9coin = b9first ? 0.6 + 1.4 * ramp(t, Wd(9, "huella"), Wd(9, "entrar") + 0.2) : 0.6 + 1.4 * ramp(t, b9no, Wd(9, "devolución") + 0.3);
  // ---------- beat 10 ----------
  const b10fill = ramp(t, Wd(10, "rellenan"), Wd(10, "sobra"));
  const b10ch = ramp(t, Wd(10, "cambio"), Wd(10, "cambio") + 0.9);
  const b10sob = ramp(t, Wd(10, "sobra"), Wd(10, "hucha") + 0.3);
  // ---------- beat 11 ----------
  const b11drop = ramp(t, Wd(11, "monedas") - 0.3, Wd(11, "monedas") + 0.4);
  const b11tilt = ramp(t, Wd(11, "monedas") + 0.3, Wd(11, "agua"));
  // ---------- beat 12 ----------
  const b12edge = on(t, Wd(12, "canto"), 0.5);
  const b12pais = t >= Wd(12, "distinta");
  const legends = ["2 ★ ★  ", "GOD ★ ZIJ ★ MET ★ ONS ★  ", "SLOVENIJA •  "];
  const b12leg = b12pais ? legends[1 + (Math.floor((t - Wd(12, "distinta")) / 0.9) % 2)] : legends[0];

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: la máquina grande; «secreto» → se abre por la mitad y aparece el mecanismo; «imanes» → bobinas encendidas */}
      <Scene {...sc(1)}>
        {svg(<>
          <circle cx={540} cy={700} r={300 * b1open} fill={K.flow} opacity={0.12 * b1open} />
          <Vending x={540} y={700} t={t} open={b1open} />
          <g opacity={b1open}>
            <Mech x={540} y={700} s={0.78} t={t} coin={0.05 + 0.95 * loop(t, 2.6)} coils={b1mag} field={b1mag} eddy={b1mag * 0.8} kind="e1" />
          </g>
        </>)}
        {chip(1, "EL SECRETO DE LA MÁQUINA")}
        <Label x={540} y={1100} text="imanes" size={46} color={K.flow} box o={on(t, Wd(1, "imanes"))} />
      </Scene>

      {/* 2 · dentro: la moneda rueda por la rampa entre bobinas */}
      <Scene {...sc(2)}>
        {svg(<Mech x={540} y={740} s={0.9} t={t} coin={b2coin} coils={on(t, Wd(2, "bobinas"))} field={on(t, Wd(2, "imanes"))} eddy={on(t, Wd(2, "metal")) * 0.9} kind="e2" />)}
        {chip(2, "POR DENTRO")}
        <Label x={330} y={470} text="rampa" size={40} color={K.white} box o={dim(t, Wd(2, "rampa"))} />
        <Label x={760} y={520} text="bobinas" size={40} color={K.flow} box o={dim(t, Wd(2, "bobinas"))} />
        <Label x={540} y={1125} text="imanes eléctricos" size={44} color={K.flow} box o={on(t, Wd(2, "imanes"))} />
      </Scene>

      {/* 3 · idea clave: la huella de tu moneda contra las guardadas */}
      <Scene {...sc(3)}>
        {svg(<>
          <Coin x={540} y={500} r={95} kind="e1" rot={8 * Math.sin(t * 2)} />
          <Signal x={540} y={700} w={600} h={130} t={t} amp={1} f={2.2} o={dim(t, Wd(3, "huella"))} />
          {[{ x: 250, a: 0.5, f: 1.4 }, { x: 540, a: 1, f: 2.2 }, { x: 830, a: 0.8, f: 3.2 }].map((s, k) => (
            <Signal key={k} x={s.x} y={930} w={220} h={100} t={t} amp={s.a} f={s.f} color={k === 1 && t > Wd(3, "guardadas") ? C.go : K.cold} sw={4} o={dim(t, Wd(3, "compara") + 0.2 * k)} />
          ))}
          <Check x={540} y={1050} s={0.7} o={on(t, Wd(3, "guardadas") + 0.2)} />
        </>)}
        {chip(3, "LA IDEA CLAVE")}
        <Label x={540} y={815} text="su huella" size={40} color={K.flow} o={dim(t, Wd(3, "huella"))} />
        <Label x={250} y={1050} text="guardadas" size={36} color={K.cold} o={dim(t, Wd(3, "guardadas"))} />
      </Scene>

      {/* 4 · primero: tamaño (diámetro y grosor) */}
      <Scene {...sc(4)}>
        {svg(<>
          <rect x={150} y={470} width={70} height={36} rx={8} fill={C.case2} stroke={C.dark} strokeWidth={3} opacity={0.4 + 0.6 * b4sens} />
          <rect x={150} y={800} width={70} height={36} rx={8} fill={C.case2} stroke={C.dark} strokeWidth={3} opacity={0.4 + 0.6 * b4sens} />
          <line x1={185 + 400 * loop(t, 2.4) * 0} y1={506} x2={185} y2={800} stroke={K.cold} strokeWidth={5} strokeDasharray="10 8" opacity={b4sens} />
          <Coin x={380} y={655} r={150} kind="e2" rot={-t * 50} />
          <Dim x1={230} y1={850} x2={530} y2={850} o={on(t, Wd(4, "diámetro"), 0.4)} />
          <CoinSide x={790} y={655} w={52} h={300} color={C.silver} />
          <Dim x1={730} y1={460} x2={850} y2={460} o={on(t, Wd(4, "grosor"), 0.4)} />
        </>)}
        {chip(4, "PRIMERO · EL TAMAÑO")}
        <Label x={380} y={990} text="diámetro" size={42} color={K.cold} box o={dim(t, Wd(4, "diámetro"))} />
        <Label x={790} y={990} text="grosor" size={42} color={K.cold} box o={dim(t, Wd(4, "grosor"))} />
        <Label x={540} y={1100} text="sensores" size={38} color={K.white} o={on(t, Wd(4, "sensores"))} />
      </Scene>

      {/* 5 · segundo: el metal; campo magnético y corrientes de Foucault */}
      <Scene {...sc(5)}>
        {svg(<>
          <Coin x={540} y={650} r={150} kind="e2" rot={6 * Math.sin(t * 1.5)} />
          <Eddy x={540} y={650} r={145} t={t} o={on(t, Wd(5, "corrientes"), 0.4)} />
          <Coil x={540} y={650} r={175} t={t} on={dim(t, Wd(5, "bobinas"))} field={on(t, Wd(5, "campo"), 0.4)} />
        </>)}
        {chip(5, "SEGUNDO · EL METAL")}
        <Label x={540} y={1000} text="campo magnético" size={44} color={C.field} box o={span(t, Wd(5, "campo"), Wd(5, "corrientes"))} />
        <Label x={540} y={1000} text="corrientes de Foucault" size={44} color={K.flow} box o={on(t, Wd(5, "corrientes") + 0.05)} />
      </Scene>

      {/* 6 · cada aleación, su señal; en algunas máquinas un imán fijo la frena */}
      <Scene {...sc(6)}>
        {svg(<>
          <g opacity={1 - b6swap}>
            {([["cu", 0.5, 1.4], ["gold", 0.8, 2.4], ["e1", 1, 3.4]] as const).map(([k, a, f], i) => (
              <g key={k}>
                <Coin x={180} y={460 + 150 * i} r={55} kind={k} val=" " />
                <Signal x={620} y={460 + 150 * i} w={520} h={95} t={t} amp={a} f={f} color={[C.cuHi, C.goldHi, K.flow][i]} o={dim(t, Wd(6, "señal") + 0.25 * i)} sw={5} />
              </g>
            ))}
          </g>
          <g opacity={b6swap}>
            <Magnet x={600} y={850} s={1.1} pull={on(t, Wd(6, "imán"))} t={t} />
            {[0, 1, 2].map((k) => <line key={k} x1={b6x - 80 - 40 * k} y1={530 + 30 * (k - 1)} x2={b6x - 80 - 40 * k - 160 * b6v} y2={530 + 30 * (k - 1)} stroke={K.white} strokeWidth={6} strokeLinecap="round" opacity={0.6 * b6v} />)}
            <Coin x={b6x} y={540} r={70} kind="gold" val=" " rot={b6x * 0.8} />
          </g>
        </>)}
        {chip(6, "CADA METAL, SU SEÑAL")}
        <Label x={540} y={1000} text="cada aleación, una señal" size={40} color={K.flow} box o={dim(t, Wd(6, "aleación")) * (1 - b6swap)} />
        <Label x={540} y={430} text="en algunas máquinas" size={38} color={K.white} o={on(t, Wd(6, "algunas") + 0.15)} />
        <Label x={540} y={1070} text="un imán la frena" size={44} color={C.field} box o={on(t, Wd(6, "imán"))} />
      </Scene>

      {/* 7 · los céntimos de 1, 2 y 5: acero forrado de cobre, se pegan al imán */}
      <Scene {...sc(7)}>
        {svg(<>
          <Magnet x={330} y={1010} s={0.95} pull={0.6 + 0.4 * b7stick} t={t} />
          <Coin x={330} y={600 + 120 * b7stick + 4 * Math.sin(t * 3) * (1 - b7stick)} r={150} kind="cu" val="5" />
          <Layers x={770} y={600} w={280} layers={[{ h: 26, color: C.cu }, { h: 110, color: C.steel }, { h: 26, color: C.cu }]} hl={on(t, Wd(7, "cobre"))} hlIdx={0} />
        </>)}
        {chip(7, "1, 2 Y 5 CÉNTIMOS")}
        <Label x={770} y={600} text="acero" size={40} color={K.white} box o={dim(t, Wd(7, "acero"))} />
        <Label x={770} y={735} text="cobre" size={40} color={C.cuHi} box o={dim(t, Wd(7, "cobre"))} />
        <Label x={770} y={980} text="¡se pega!" size={46} color={K.flow} box o={on(t, Wd(7, "pegan"))} />
      </Scene>

      {/* 8 · 1 y 2 €: dos metales y una capa de níquel dentro */}
      <Scene {...sc(8)}>
        {svg(<>
          <g transform={`rotate(${5 * Math.sin(t * 1.6)} 540 560)`}>
            <circle cx={540} cy={560} r={175} fill={C.gold} stroke={C.dark} strokeWidth={6} />
            <circle cx={540} cy={560} r={160} fill="none" stroke={C.goldHi} strokeWidth={5} opacity={0.8} />
            <circle cx={540} cy={560} r={175} fill="#0B1C33" opacity={0} />
            <g transform={`translate(${200 * b8split} 0)`}>
              <circle cx={540} cy={560} r={120} fill={C.silver} stroke={C.dark} strokeWidth={6} />
              <text x={540} y={605} textAnchor="middle" fontFamily="MontserratSerie" fontWeight={900} fontSize={130} fill={C.dark} opacity={0.5}>1</text>
            </g>
          </g>
          <g opacity={dim(t, Wd(8, "dentro"))}>
            <rect x={210} y={850} width={110} height={110} rx={10} fill={C.gold} stroke={C.dark} strokeWidth={4} />
            <rect x={760} y={850} width={110} height={110} rx={10} fill={C.gold} stroke={C.dark} strokeWidth={4} />
            <Layers x={540} y={905} w={440} layers={[{ h: 36, color: C.silver }, { h: 38, color: C.nickel }, { h: 36, color: C.silver }]} hl={on(t, Wd(8, "capa"))} hlIdx={1} />
          </g>
        </>)}
        {chip(8, "1 Y 2 EUROS")}
        <Label x={540} y={790} text="dos metales" size={42} color={C.goldHi} box o={dim(t, Wd(8, "metales"))} />
        <Label x={540} y={1050} text="capa de níquel" size={44} color={K.flow} box o={on(t, Wd(8, "capa"))} />
      </Scene>

      {/* 9 · tercero: la compuerta decide; dentro o devolución */}
      <Scene {...sc(9)}>
        {svg(<>
          <Mech x={540} y={740} s={0.9} t={t} coin={b9coin} accept={b9first} kind={b9first ? "e2" : "gold"} val={b9first ? undefined : "?"} coils={1} gate={b9first ? on(t, Wd(9, "coincide")) : 0} gateRed={b9first ? 0 : 1}
            hucha={on(t, Wd(9, "entrar"))} ret={on(t, Wd(9, "devolución"))} />
          <Check x={420} y={930} s={0.8} o={span(t, Wd(9, "entrar"), b9no + 0.2) + on(t, Wd(9, "devolución")) * 0.0} />
          <Cross x={660} y={930} s={0.8} o={on(t, Wd(9, "devolución"))} />
        </>)}
        {chip(9, "TERCERO · LA COMPUERTA")}
        <Label x={330} y={1125} text="¡dentro!" size={42} color={C.go} box o={dim(t, Wd(9, "entrar"))} />
        <Label x={740} y={1125} text="devolución" size={42} color={K.warn} box o={dim(t, Wd(9, "devolución"))} />
      </Scene>

      {/* 10 · cuarto: el cambio sale de los tubos; lo que sobra, a la hucha */}
      <Scene {...sc(10)}>
        {svg(<>
          {[0, 1, 2, 3].map((i) => {
            const ph = loop(t, 1.1, i * 0.27);
            const cx = 540 + (i - 1.5) * 130;
            return <rect key={i} x={cx - 42} y={430 + ph * 120} width={84} height={16} rx={6} fill={[C.cu, C.gold, C.gold, C.silver][i]} stroke={C.dark} strokeWidth={2} opacity={on(t, Wd(10, "rellenan")) * (1 - ph) * (t < Wd(10, "sobra") + 0.3 ? 1 : 0.3)} />;
          })}
          <Tubes x={540} y={900} t={t} kinds={["cu", "gold", "e1", "e2"]} fill={[0.35 + 0.35 * b10fill, 0.4 + 0.3 * b10fill, 0.5 + 0.5 * b10fill, 0.45 + 0.55 * b10fill]} />
          {/* tu cambio: sale por abajo del primer tubo */}
          <Coin x={345 - 160 * b10ch} y={915 + 40 * Math.sin(b10ch * Math.PI)} r={34} kind="cu" val=" " o={on(t, Wd(10, "cambio"), 0.15)} />
          {/* lo que sobra: cae a la hucha */}
          <rect x={765} y={960} width={170} height={80} rx={14} fill={C.case2} stroke={b10sob > 0.8 ? C.go : C.dark} strokeWidth={5} opacity={dim(t, Wd(10, "sobra"))} />
          <Coin x={850} y={430 + 560 * b10sob} r={30} kind="e2" val=" " o={on(t, Wd(10, "sobra"), 0.15) * (1 - ramp(t, Wd(10, "hucha") + 0.3, Wd(10, "hucha") + 0.5))} />
        </>)}
        {chip(10, "CUARTO · EL CAMBIO")}
        <Label x={190} y={1000} text="tu cambio" size={36} color={K.flow} box o={dim(t, Wd(10, "cambio"))} />
        <Label x={850} y={1090} text="hucha" size={36} color={C.go} box o={dim(t, Wd(10, "hucha"))} />
        <Label x={540} y={1100} text="tubos" size={40} color={K.white} o={dim(t, Wd(10, "tubos"))} />
      </Scene>

      {/* 11 · curiosidad: la máquina de agua bendita de Herón de Alejandría */}
      <Scene {...sc(11)}>
        {svg(<Heron x={500} y={760} t={t} tilt={b11tilt} flow={on(t, Wd(11, "agua"))} coinY={-330 + 205 * b11drop} showCoin={dim(t, Wd(11, "monedas"))} />)}
        {chip(11, "CURIOSIDAD", K.cold)}
        <Label x={540} y={410} text="hace unos 2000 años" size={38} color={K.white} box o={span(t, Wd(11, "hace"), Wd(11, "Herón") + 0.4)} />
        <Label x={540} y={410} text="Herón de Alejandría" size={40} color={K.flow} box o={on(t, Wd(11, "Herón") + 0.45)} />
        <Label x={540} y={1120} text="agua bendita" size={46} color={K.cold} box o={dim(t, Wd(11, "agua"))} />
      </Scene>

      {/* 12 · otra: el canto de la de 2 € cambia según el país */}
      <Scene {...sc(12)}>
        {svg(<>
          <Coin x={540} y={560} r={170} kind="e2" rot={6 * Math.sin(t * 1.4)} />
          <Edge x={540} y={820} w={780} h={140} t={t} text={b12leg} o={dim(t, Wd(12, "canto"))} />
          <path d="M 540 735 L 540 745" stroke={K.flow} strokeWidth={6} strokeDasharray="10 8" opacity={b12edge} />
        </>)}
        {chip(12, "OTRA · EL CANTO", K.cold)}
        <Label x={540} y={1040} text="leyenda en el canto" size={42} color={K.flow} box o={span(t, Wd(12, "leyenda"), Wd(12, "distinta"))} />
        <Label x={540} y={1040} text="distinta según el país" size={42} color={K.flow} box o={on(t, Wd(12, "distinta") + 0.05)} />
      </Scene>

      {/* 13 · resumen: tamaño y metal */}
      <Scene {...sc(13)}>
        {svg(<>
          <Mech x={540} y={720} s={0.85} t={t} coin={0.1 + 1.9 * ramp(t, A(13) + 0.1, Z(13) - 0.6)} kind="e1" coils={dim(t, Wd(13, "metal"))} field={on(t, Wd(13, "metal"))} eyes={dim(t, Wd(13, "tamaño"))} gate={on(t, Wd(13, "metal"))} hucha={on(t, Z(13) - 0.6)} />
          <Check x={540} y={1060} s={0.8} o={on(t, Z(13) - 0.6)} />
        </>)}
        {chip(13, "RESUMEN")}
        <Label x={280} y={1110} text="tamaño" size={44} color={K.cold} box o={dim(t, Wd(13, "tamaño"))} />
        <Label x={800} y={1110} text="metal" size={44} color={K.flow} box o={dim(t, Wd(13, "metal"))} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
