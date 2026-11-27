// Episodio 169 · Cómo corrige la miopía la operación láser de los ojos (ESPECIAL HOSPITAL). Sin marcas ni nombres de técnicas.
// Cada beat es una <Scene> con su dibujo y 1-3 etiquetas. Cambios atados a palabras con Wd(beat, "palabra").
// Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok). Sin consejos médicos.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { C, Eye, eyeGeom, Slab, Chain, EyeFront, Board, Drumstick, TimeBars, Clock, FocusBar } from "./LaserOjos";

export const COMP_ID = "LaserOjos";
export const HOOK = "El láser esculpe tu córnea"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);

// Ojo estándar en corte (beats 2, 3, 9, 13)
const EX = 570, EY = 760, ER = 280;
// Córnea ampliada (beats 5, 6, 7, 10): a la izquierda para que la tapa doblada quepa a la derecha
const SX = 420, SY = 780, SW = 540;

/** Cabezal del láser (arriba del haz). */
const LaserHead: React.FC<{ x: number; y: number; o: number; t: number }> = ({ x, y, o, t }) => (
  <g opacity={o}>
    <rect x={x - 90} y={y - 70} width={180} height={70} rx={14} fill={C.case2} stroke={C.case3} strokeWidth={4} />
    <rect x={x - 34} y={y - 6} width={68} height={18} rx={6} fill={C.case1} stroke={C.case3} strokeWidth={3} />
    <circle cx={x + 60} cy={y - 35} r={9} fill={K.cold} opacity={0.6 + 0.4 * Math.sin(t * 10)} />
  </g>
);

const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
/** Mirada con microsaltos (sacadas) cada ~0,45 s. */
const gaze = (t: number) => {
  const r = 2.2, k = Math.floor(t * r), f = Math.min(1, (t * r - k) * 5);
  const ss = f * f * (3 - 2 * f);
  const p0 = { x: (hash(k) - 0.5) * 120, y: (hash(k + 50) - 0.5) * 60 };
  const p1 = { x: (hash(k + 1) - 0.5) * 120, y: (hash(k + 51) - 0.5) * 60 };
  return { x: p0.x + (p1.x - p0.x) * ss, y: p0.y + (p1.y - p0.y) * ss };
};

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
  /** etiqueta que luego es sustituida por otra en el mismo sitio: atenuada antes de entrar y DESAPARECE del todo al salir. */
  const lab = (a: number, b: number) => (t < a ? 0.3 : span(t, a, b, 0.25));
  /** la que entra después en el mismo sitio: invisible hasta que la primera ha salido. */
  const lab2 = (a: number, b: number) => span(t, a + 0.3, b, 0.25);
  const on = (i: number, w: string, d = 0.4) => ramp(t, Wd(i, w), Wd(i, w) + d);

  // ---- tiempos clave
  const b1in = on(1, "dentro", 0.5);
  const b1open = on(1, "equivocados", 0.6);
  const b3flat = on(3, "aplanando", 1.2);
  const b4curv = on(4, "enfoca", 0.6);
  const b4long = on(4, "largo", 0.7);
  const b5cut = ramp(t, Wd(5, "tapa"), Wd(5, "levanta"));
  const b5lift = on(5, "levanta", 0.9);
  const b6beam = on(6, "ultravioleta", 0.3);
  const b6break = ramp(t, Wd(6, "rompe"), Wd(6, "rompe") + 1.2);
  const b7abl = ramp(t, Wd(7, "arranca"), Wd(7, "aplana") + 0.4);
  const b8lost = on(8, "escapa", 0.25);
  const b9flat = on(9, "plano", 1.0);
  const b10close = ramp(t, Wd(10, "tapa"), Wd(10, "colocar") + 0.6);
  const b11board = ramp(t, Wd(11, "plásticos"), Wd(11, "circuitos") + 0.5);
  const b11cut = ramp(t, Wd(11, "probaron"), Wd(11, "pavo") + 0.6);
  const b12op = ramp(t, Wd(12, "operación"), Wd(12, "minutos") + 0.6);
  const b12las = on(12, "segundos", 0.5);

  // córnea: curvatura extra (miopía por córnea) del beat 4
  const g4 = eyeGeom(EX, 700, 240, 1 + 0.22 * b4long, -0.8 * b4curv * (1 - b4long));
  const gap4 = Math.max(100 * b4curv * (1 - b4long), 95 * b4long);

  // seguimiento del ojo (beat 8)
  const gz = gaze(t);
  const gzLag = gaze(t - 0.06);
  const esc = { x: gz.x + 230 * b8lost, y: gz.y + 30 * b8lost };
  const ret = b8lost > 0.01 ? gaze(Wd(8, "escapa")) : gzLag;

  const ey = eyeGeom(EX, EY, ER);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el ojo GRANDE en corte desde el fotograma 0; con «dentro» se resalta el interior; con «equivocados» el interior se apaga y la córnea se levanta y brilla */}
      <Scene {...sc(1)}>
        <SVG>
          <g transform={`translate(0 ${6 * Math.sin(t * 2)})`}>
            <Eye cx={EX} cy={800} R={300} t={t} gap={110} rays={0.55 + 0.45 * b1open} glowCornea={b1open} dimInside={b1open} flap={b1open * (0.6 + 0.1 * Math.sin(t * 3))} />
          </g>
          <circle cx={EX - 300 * 0.6} cy={800} r={120} fill="none" stroke={K.flow} strokeWidth={6} strokeDasharray="14 12" opacity={b1in * (1 - b1open)} />
        </SVG>
        <Label x={EX - 180} y={560} text="¿por dentro?" color={K.flow} size={44} box o={b1in * (1 - b1open)} />
      </Scene>

      {/* 2 · la promesa: el interior no se toca; solo cambia la córnea, la ventana de delante */}
      <Scene {...sc(2)}>
        <SVG>
          <Eye cx={EX} cy={EY} R={ER} t={t} gap={110} rays={0.6} dimInside={on(2, "interior", 0.5)} glowCornea={on(2, "córnea", 0.5)} />
        </SVG>
        <Chip text="Solo la córnea" o={chip(2)} />
        <Label x={540} y={1110} text="el interior no se toca" color={K.cold} size={42} box o={lab(Wd(2, "interior"), Wd(2, "córnea"))} />
        <Label x={300} y={450} text="córnea" color={K.flow} size={48} box o={dim(sp(2, "córnea"))} />
        <Label x={540} y={1110} text="la ventana de delante" color={K.flow} size={44} box o={lab2(Wd(2, "córnea"), E(2))} />
      </Scene>

      {/* 3 · idea clave: el foco cae delante de la retina; al aplanar la córnea, retrocede hasta ella */}
      <Scene {...sc(3)}>
        <SVG>
          <Eye cx={EX} cy={EY} R={ER} t={t} flat={b3flat} gap={110 * (1 - b3flat)} rays={dim(on(3, "miopía"))} glowCornea={b3flat} />
        </SVG>
        <Chip text="La idea clave" o={chip(3)} />
        <Label x={ey.retinaX - 120} y={460} text="retina" color={K.hot} size={40} o={dim(sp(3, "retina"))} />
        <Label x={540} y={1110} text="foco delante de la retina" color="#FF8A80" size={42} box o={lab(Wd(3, "delante"), Wd(3, "aplanando"))} />
        <Label x={540} y={1110} text="córnea más plana: foco atrás" color={K.flow} size={42} box o={lab2(Wd(3, "aplanando"), E(3))} />
      </Scene>

      {/* 4 · primero: la córnea hace dos tercios del enfoque; si enfoca de más o el ojo es largo → miopía */}
      <Scene {...sc(4)}>
        <SVG>
          <Eye cx={EX} cy={700} R={240} len={1 + 0.22 * b4long} flat={-0.8 * b4curv * (1 - b4long)} gap={gap4} t={t} rays={0.85} glowCornea={on(4, "córnea", 0.5) * (1 - b4long)} />
          <FocusBar x={140} y={1000} w={800} p={on(4, "tercios", 0.8)} />
        </SVG>
        <Chip text="1 · La córnea manda" o={chip(4)} />
        <Label x={140 + 800 / 3} y={958} text="córnea: 2/3" color={K.flow} size={38} o={dim(sp(4, "tercios"))} />
        <Label x={140 + 800 * 5 / 6} y={958} text="cristalino" color={K.cold} size={34} o={dim(sp(4, "tercios"))} />
        <Label x={300} y={412} text="enfoca de más" color="#FF8A80" size={42} box o={lab(Wd(4, "enfoca"), Wd(4, "ojo"))} />
        <Label x={540} y={412} text="ojo demasiado largo" color="#FF8A80" size={42} box o={lab2(Wd(4, "ojo"), E(4))} />
      </Scene>

      {/* 5 · segundo: se corta y se levanta una tapa finísima (bisagra a la derecha) */}
      <Scene {...sc(5)}>
        <SVG>
          <Slab x={SX} y={SY} w={SW} t={t} cutLine={b5cut} flap={b5lift} />
        </SVG>
        <Chip text="2 · La tapa" o={chip(5)} />
        <Label x={600} y={560} text="tapa finísima" color={K.flow} size={42} box o={dim(sp(5, "finísima"))} />
        <Label x={540} y={1110} text="cuchilla o láser de femtosegundo" color={K.flow} size={40} box o={dim(sp(5, "cuchilla"))} />
      </Scene>

      {/* 6 · tercero: el láser excímer, luz ultravioleta que rompe enlaces y talla sin quemar */}
      <Scene {...sc(6)}>
        <SVG>
          <Slab x={SX} y={SY} w={SW} t={t} flap={1} beam={b6beam} />
          <LaserHead x={SX} y={SY - 330} o={dim(on(6, "excímer"))} t={t} />
          <Chain x={540} y={1015} p={b6break} t={t} />
        </SVG>
        <Chip text="3 · El láser excímer" o={chip(6)} />
        <Label x={740} y={420} text="ultravioleta · 193 nm" color={K.cold} size={38} box o={dim(sp(6, "ultravioleta"))} />
        <Label x={540} y={1110} text="rompe enlaces, sin quemar" color={K.flow} size={46} box o={dim(sp(6, "rompe"))} />
      </Scene>

      {/* 7 · capas de micras; más en el centro → la córnea se aplana */}
      <Scene {...sc(7)}>
        <SVG>
          <Slab x={SX} y={SY} w={SW} t={t} flap={1} beam={1} abl={b7abl} />
          <LaserHead x={SX} y={SY - 330} o={1} t={t} />
        </SVG>
        <Chip text="Capa a capa" o={chip(7)} />
        <Label x={540} y={1110} text="milésimas de milímetro" color={K.white} size={44} box o={lab(Wd(7, "milésimas"), Wd(7, "centro"))} />
        <Label x={540} y={1110} text="más en el centro: se aplana" color={K.flow} size={44} box o={lab2(Wd(7, "centro"), E(7))} />
      </Scene>

      {/* 8 · el seguidor: la retícula sigue al ojo; si se escapa, el láser se para */}
      <Scene {...sc(8)}>
        <SVG>
          <EyeFront x={540} y={720} w={640} gx={esc.x} gy={esc.y} tx={ret.x} ty={ret.y} lost={b8lost} t={t} />
        </SVG>
        <Chip text="Sigue tu ojo" o={chip(8)} />
        <Label x={540} y={450} text="hasta miles de veces por segundo" color={K.flow} size={40} box o={dim(sp(8, "miles"))} />
        <Label x={540} y={1110} text="sigue cada movimiento" color={K.white} size={44} box o={lab(Wd(8, "sigue"), Wd(8, "segundo"))} />
        <Label x={540} y={1110} text="si se escapa: PAUSA" color="#FF8A80" size={46} box o={lab2(Wd(8, "segundo"), E(8))} />
      </Scene>

      {/* 9 · cuarto: centro más plano → enfoca menos → la imagen cae en la retina */}
      <Scene {...sc(9)}>
        <SVG>
          <Eye cx={EX} cy={EY} R={ER} t={t} flat={b9flat} gap={110 * (1 - ramp(t, Wd(9, "enfoca"), Wd(9, "retina") + 0.3))} rays={1} glowCornea={b9flat} />
        </SVG>
        <Chip text="4 · El foco" o={chip(9)} />
        <Label x={300} y={450} text="centro más plano" color={K.flow} size={42} box o={dim(sp(9, "plano"))} />
        <Label x={540} y={1110} text="enfoca menos" color={K.white} size={46} box o={lab(Wd(9, "enfoca"), Wd(9, "imagen"))} />
        <Label x={540} y={1110} text="foco en la retina" color={K.flow} size={48} box o={lab2(Wd(9, "imagen"), E(9))} />
      </Scene>

      {/* 10 · la tapa vuelve a su sitio y se adapta a la nueva forma */}
      <Scene {...sc(10)}>
        <SVG>
          <Slab x={SX} y={SY} w={SW} t={t} flap={1 - b10close} abl={1} drape={b10close} />
        </SVG>
        <Chip text="La tapa vuelve" o={chip(10)} />
        <Label x={540} y={1110} text="se pega sola, sin puntos" color={K.flow} size={46} box o={dim(sp(10, "pegada"))} />
      </Scene>

      {/* 11 · curiosidad: el láser grababa plásticos de circuitos; en 1981 lo probaron con sobras de pavo */}
      <Scene {...sc(11)}>
        <SVG>
          <Board x={320} y={700} p={b11board} t={t} />
          <Drumstick x={760} y={760} p={b11cut} t={t} />
        </SVG>
        <Chip text="Curiosidad" o={chip(11)} />
        <Label x={540} y={450} text="laboratorio de informática" color={K.white} size={42} box o={dim(sp(11, "laboratorio"))} />
        <Label x={790} y={580} text="1981" color={K.flow} size={60} o={dim(sp(11, "1981"))} />
        <Label x={540} y={1110} text="plásticos de circuitos" color={K.cold} size={44} box o={lab(Wd(11, "plásticos"), Wd(11, "probaron"))} />
        <Label x={540} y={1110} text="pavo: corte limpio, sin quemar" color={K.flow} size={40} box o={lab2(Wd(11, "probaron"), E(11))} />
      </Scene>

      {/* 12 · otra: la operación dura minutos; el láser excímer, solo segundos */}
      <Scene {...sc(12)}>
        <SVG>
          <TimeBars x={140} y={560} w={800} p1={b12op} p2={b12las} />
          <Clock x={540} y={1000} r={90} t={t} speed={3} color={C.case3} />
        </SVG>
        <Chip text="Otra curiosidad" o={chip(12)} />
        <Label x={540} y={505} text="operación: minutos" color={K.white} size={42} o={dim(sp(12, "minutos"))} />
        <Label x={540} y={705} text="láser: segundos por ojo" color={K.cold} size={42} o={dim(sp(12, "segundos"))} />
      </Scene>

      {/* 13 · cierre */}
      <Scene {...sc(13)}>
        <SVG>
          <Eye cx={EX} cy={EY} R={ER} t={t} flat={1} gap={0} rays={1} glowCornea={0.6 + 0.4 * Math.sin(t * 3)} />
        </SVG>
        <Chip text="En resumen" o={chip(13)} />
        <Label x={300} y={450} text="córnea aplanada" color={K.flow} size={42} box o={dim(sp(13, "córnea"))} />
        <Label x={540} y={1110} text="foco en la retina" color={K.flow} size={48} box o={dim(sp(13, "retina"))} />
      </Scene>

      <Stamp x={540} y={470} text="¡FALSO!" p={ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.3) * (t < scene(1)[1] ? 1 : 0)} />
      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
