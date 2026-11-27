// Episodio 171 · Cómo endurece la lámpara de uñas el esmalte semipermanente (en realidad no lo seca).
// Cada beat es una <Scene> con su dibujo (LamparaUnas.tsx), un <Chip> y 1-3 <Label>. Cambios atados a palabras con Wd(beat, "palabra").
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Svg, C, Lamp, Rays, Molecules, Finger, Bottle, Spectrum, Splitter, MiniLamp, Calendar, Tooth, Printer, Wrap, Acetone, Vapor } from "./LamparaUnas";

export const COMP_ID = "LamparaUnas";
export const HOOK = "Lo convierte en plástico"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

/** Uña vista de frente (tarjeta) con el gel dentro. */
const NailCard: React.FC<{ x: number; y: number; w?: number; h?: number; children?: React.ReactNode; dark?: number; id: string }> = ({ x, y, w = 300, h = 360, children, dark = 0, id }) => (
  <g>
    <rect x={x - w / 2 - 34} y={y - h / 2 - 30} width={w + 68} height={h + 200} rx={(w + 68) / 2} fill={C.skin} stroke={C.skin2} strokeWidth={6} />
    <clipPath id={id}><rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={w / 2.4} /></clipPath>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={w / 2.4} fill={C.gel} />
    <g clipPath={`url(#${id})`}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={C.deep} opacity={0.55} />
      {children}
      {dark > 0.01 && <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={C.ink} opacity={0.35 * dark} />}
    </g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={w / 2.4} fill="none" stroke={C.gel2} strokeWidth={6} />
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
  /** Etiqueta que entra en la palabra w del beat i y dura hasta el final de la escena (o hasta `until`). */
  const at = (i: number, w: string, until?: number) => span(t, Wd(i, w), until ?? E(i));
  /** Elemento que entra después: atenuado (0,3) desde el inicio de la escena y pleno al decir w. */
  const late = (i: number, w: string) => 0.3 + 0.7 * ramp(t, Wd(i, w), Wd(i, w) + 0.4);
  const on = (i: number, w: string, d = 0.3) => ramp(t, Wd(i, w), Wd(i, w) + d);
  const chip = (i: number) => span(t, S(i) + 0.1, E(i));

  // beat 1: al decir «convierte» la carcasa se levanta y las uñas brillan
  const lift1 = 0.7 * on(1, "convierte", 0.7);
  const cure1 = on(1, "plástico", 0.6);

  return (
    <AbsoluteFill>
      <Bg />

      {/* 1 · gancho: la lámpara grande con la mano dentro; ¿seca? (aire) → ¡FALSO! → al decir «convierte» se levanta y el gel se vuelve plástico */}
      <Scene {...sc(1)}>
        <Svg><Lamp t={t} x={540} y={860} s={0.95} on={1} lift={lift1} cure={cure1}
          puff={span(t, Wd(1, "seca"), Wd(1, "convierte") + 0.2)} /></Svg>
        <Chip text="POR DENTRO" o={span(t, 1.9, E(1))} />
        <Stamp x={540} y={500} text="¡NO SECA!" p={on(1, "equivocados") * (1 - ramp(t, Wd(1, "convierte"), Wd(1, "convierte") + 0.3))} />
        <Label x={540} y={1140} text="luz → plástico" color={K.flow} size={48} box o={at(1, "plástico")} />
      </Scene>

      {/* 2 · entrega: el gel sobre la uña; la luz entra y las moléculas se unen */}
      <Scene {...sc(2)}>
        <Svg>
          <Finger x={560} y={820}>
            <Molecules t={t} x0={-250} y0={-130} w={500} h={180} cols={9} rows={4} cure={ramp(t, Wd(2, "unen"), Wd(2, "plástico") + 0.4)} pi={1} radicals={on(2, "luz")} r={12} seed={3} />
          </Finger>
          <Rays t={t} o={late(2, "luz") * span(t, S(2), E(2))} x={540} y0={500} y1={680} w={230} />
          <path d="M 300 520 Q 540 400 780 520" fill="none" stroke={C.shell2} strokeWidth={26} strokeLinecap="round" />
          {[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={360 + 90 * k} cy={505 - 40 * Math.sin(Math.PI * k / 4)} r={10} fill={late(2, "luz") > 0.6 ? "#E6D9FF" : C.light} stroke={C.ink} strokeWidth={3} />)}
        </Svg>
        <Chip text="LO QUE PASA" o={chip(2)} />
        <Label x={240} y={420} text="sin aire" color={K.cold} size={42} box o={at(2, "aire")} />
        <Label x={840} y={420} text="con luz" color={C.uv} size={42} box o={at(2, "luz")} />
        <Label x={540} y={1120} text="se vuelve plástico" color={K.flow} size={46} box o={at(2, "plástico")} />
      </Scene>

      {/* 3 · idea clave: el esmalte normal se evapora; el semipermanente reacciona */}
      <Scene {...sc(3)}>
        <Svg>
          <NailCard id="n3a" x={300} y={700} w={280} h={330}>
            <rect x={160} y={535} width={280} height={330} fill={C.gel} opacity={0.6 * (1 - 0.3 * ramp(t, Wd(3, "evaporarse"), E(3)))} />
          </NailCard>
          <Vapor t={t} o={late(3, "evaporarse")} x={300} y0={560} y1={430} w={100} n={12} />
          <NailCard id="n3b" x={780} y={700} w={280} h={330}>
            <Molecules t={t} x0={650} y0={545} w={260} h={310} cols={5} rows={6} cure={ramp(t, Wd(3, "reacción"), E(3) - 0.2)} pi={1} radicals={on(3, "reacción")} r={12} seed={9} />
          </NailCard>
          <Rays t={t} o={late(3, "semipermanente") * 0.8} x={780} y0={420} y1={540} w={150} n={5} />
        </Svg>
        <Chip text="LA IDEA CLAVE" o={chip(3)} />
        <Label x={300} y={1060} text="normal: se evapora" color={K.white} size={38} box o={late(3, "normal")} />
        <Label x={760} y={1060} text="semi: reacción" color={K.flow} size={38} box o={late(3, "semipermanente")} />
      </Scene>

      {/* 4 · el bote: moléculas sueltas (acrilatos) y el fotoiniciador */}
      <Scene {...sc(4)}>
        <Svg><Bottle t={t} x={290} y={820} pi={late(4, "chispa")} zoom={late(4, "moléculas")} /></Svg>
        <Chip text="1 · EL GEL" o={chip(4)} />
        <Label x={700} y={1100} text="acrilatos sueltos" color={K.white} size={42} box o={at(4, "acrilatos")} />
        <Label x={700} y={540} text="★ fotoiniciador" color={K.flow} size={42} box o={at(4, "fotoiniciador")} />
      </Scene>

      {/* 5 · la luz: espectro (UV cercano y violeta) y el fotoiniciador que se parte en radicales */}
      <Scene {...sc(5)}>
        <Svg>
          <Spectrum x={140} y={470} w={800} band={late(5, "ultravioleta")} />
          <Splitter t={t} x={540} y={830} split={ramp(t, Wd(5, "parte"), Wd(5, "parte") + 0.6)} hit={late(5, "absorbe")} />
        </Svg>
        <Chip text="2 · LA LUZ" color={C.uv} o={chip(5)} />
        <Label x={760} y={680} text="≈ 365-405 nm" color={K.flow} size={42} box o={at(5, "ultravioleta")} />
        <Label x={540} y={1100} text="radicales" color={K.flow} size={48} box o={at(5, "radicales")} />
      </Scene>

      {/* 6 · la red: cada radical engancha moléculas en cadenas cruzadas */}
      <Scene {...sc(6)}>
        <Svg>
          <rect x={120} y={470} width={840} height={560} rx={40} fill={C.gel} opacity={0.14} stroke={C.gel2} strokeWidth={4} />
          <Molecules t={t} x0={140} y0={490} w={800} h={520} cols={8} rows={5} cure={0.04 + 0.96 * ramp(t, Wd(6, "engancha"), E(6) - 0.3)} pi={1} radicals={1} r={15} seed={17} />
        </Svg>
        <Chip text="3 · LA RED" o={chip(6)} />
        <Label x={540} y={420} text="cadenas" color={K.flow} size={44} box o={at(6, "cadenas", Wd(6, "red") - 0.05)} />
        <Label x={540} y={420} text="red cruzada" color={K.flow} size={44} box o={at(6, "red")} />
        <Label x={540} y={1100} text="moléculas enganchadas" color={K.white} size={40} box o={late(6, "engancha")} />
      </Scene>

      {/* 7 · polimerizar: LED en 30-60 s; tubo, minutos */}
      <Scene {...sc(7)}>
        <Svg>
          <MiniLamp t={t} x={290} y={760} kind="led" on={late(7, "LED")} prog={ramp(t, Wd(7, "LED"), Wd(7, "segundos") + 0.3)} label="LED" />
          <MiniLamp t={t} x={770} y={760} kind="tubo" on={late(7, "tubo")} prog={0.3 * ramp(t, Wd(7, "tubo"), E(7))} label="TUBO" />
        </Svg>
        <Chip text="4 · POLIMERIZAR" o={chip(7)} />
        <Label x={540} y={440} text="líquido → sólido" color={K.flow} size={44} box o={late(7, "polimerizar")} />
        <Label x={290} y={1060} text="30 - 60 s" color={K.flow} size={46} box o={at(7, "treinta")} />
        <Label x={770} y={1060} text="minutos" color={K.white} size={46} box o={at(7, "minutos")} />
      </Scene>

      {/* 8 · por eso: sin luz sigue líquido; curado aguanta 2-3 semanas */}
      <Scene {...sc(8)}>
        <Svg>
          <NailCard id="n8" x={290} y={700} w={260} h={320} dark={1}>
            <Molecules t={t} x0={170} y0={550} w={240} h={300} cols={5} rows={6} cure={0} pi={1} r={11} seed={23} />
          </NailCard>
          <Calendar x={740} y={720} days={Math.round(21 * ramp(t, Wd(8, "aguanta"), Wd(8, "semanas") + 0.5))} o={late(8, "formada")} />
        </Svg>
        <Chip text="POR ESO" o={chip(8)} />
        <Label x={290} y={1060} text="a oscuras: líquido" color={K.cold} size={38} box o={at(8, "oscuras")} />
        <Label x={740} y={1060} text="2 - 3 semanas" color={K.flow} size={44} box o={at(8, "semanas")} />
      </Scene>

      {/* 9 · curiosidad: la capa de arriba queda pegajosa porque el oxígeno atrapa radicales */}
      <Scene {...sc(9)}>
        <Svg>
          <rect x={120} y={640} width={840} height={400} rx={30} fill={C.gel} opacity={0.14} stroke={C.gel2} strokeWidth={4} />
          <rect x={120} y={640} width={840} height={110} rx={30} fill={K.cold} opacity={0.12 * late(9, "pegajosa")} />
          <Molecules t={t} x0={140} y0={660} w={800} h={370} cols={9} rows={4} cure={1} topFree={1} pi={1} radicals={0.4} r={14} seed={31} o2={late(9, "oxígeno")} />
        </Svg>
        <Chip text="CURIOSIDAD" o={chip(9)} />
        <Label x={540} y={470} text="capa pegajosa" color={K.white} size={46} box o={at(9, "pegajosa")} />
        <Label x={540} y={1110} text="el oxígeno frena la reacción" color={K.cold} size={38} box o={at(9, "frena")} />
      </Scene>

      {/* 10 · otra: la misma química en los empastes blancos y en las impresoras 3D de resina */}
      <Scene {...sc(10)}>
        <Svg>
          <Tooth t={t} x={290} y={760} light={late(10, "empastes")} fill={on(10, "blancos", 0.5)} />
          <Printer t={t} x={770} y={760} on={late(10, "impresoras")} prog={ramp(t, Wd(10, "impresoras"), E(10))} />
        </Svg>
        <Chip text="OTRA CURIOSIDAD" o={chip(10)} />
        <Label x={540} y={430} text="la misma química" color={K.flow} size={44} box o={at(10, "misma")} />
        <Label x={290} y={1060} text="empaste blanco" color={K.white} size={38} box o={at(10, "empastes")} />
        <Label x={770} y={1060} text="impresora 3D" color={C.uv} size={38} box o={at(10, "impresoras")} />
      </Scene>

      {/* 11 · truco: no arrancarlo; acetona */}
      <Scene {...sc(11)}>
        <Svg>
          <Wrap t={t} x={340} y={720} soak={on(11, "acetona", 0.6)} />
          <Acetone x={740} y={760} o={late(11, "acetona")} />
        </Svg>
        <Chip text="TRUCO" o={chip(11)} />
        <Stamp x={540} y={560} text="¡NO TIRES!" size={54} p={on(11, "arranques") * (1 - ramp(t, Wd(11, "acetona") - 0.1, Wd(11, "acetona") + 0.2))} />
        <Label x={540} y={450} text="consejo de dermatólogos" color={K.white} size={38} box o={at(11, "dermatólogos")} />
        <Label x={540} y={1120} text="arrancarlo daña la uña" color={K.warn} size={40} box o={at(11, "daña")} />
      </Scene>

      {/* 12 · cierre */}
      <Scene {...sc(12)}>
        <Svg><Lamp t={t} x={540} y={800} s={0.8} on={1} cure={1} /></Svg>
        <Chip text="EN RESUMEN" o={chip(12)} />
        <Label x={260} y={440} text="1 no se seca" color={K.cold} size={40} box o={late(12, "seca")} />
        <Label x={800} y={440} text="2 luz" color={C.uv} size={40} box o={late(12, "luz")} />
        <Label x={540} y={1110} text="3 plástico" color={K.flow} size={48} box o={late(12, "plástico")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
