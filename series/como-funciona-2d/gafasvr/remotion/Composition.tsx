// Episodio 150 · Cómo funcionan las gafas de realidad virtual. 2D, plantilla de la serie.
// Reglas: cada beat es una <Scene> con su dibujo (SVG en GafasVR.tsx) y como mucho 2-3 etiquetas a la vez.
// Los cambios se atan a palabras de la voz con Wd(beat, "palabra"). Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Headset, SplitScreen, MiniScene, Cube, Eye, Brain, HeadSide, HeadTop, InnerEar, Hand, Gyro, Accel, Flow, C } from "./GafasVR";

export const COMP_ID = "GafasVR";
export const HOOK = "Cada ojo ve otra imagen"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);

/** Lente biconvexa vista de canto, centrada en (x, y). */
const Lens: React.FC<{ x: number; y: number; w: number; o?: number; glow?: number }> = ({ x, y, w, o = 1, glow = 0 }) => (
  <path d={`M${x - w / 2},${y} Q${x},${y - 46} ${x + w / 2},${y} Q${x},${y + 46} ${x - w / 2},${y} Z`} fill="rgba(180,225,255,0.35)" stroke={C.case3} strokeWidth={6} opacity={o}
    style={glow > 0.01 ? { filter: `drop-shadow(0 0 ${14 * glow}px ${K.cold})` } : undefined} />
);

/** Icono de cámara. */
const CamIcon: React.FC<{ x: number; y: number; s?: number; o?: number; glow?: number }> = ({ x, y, s = 1, o = 1, glow = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={-70} y={-45} width={140} height={90} rx={18} fill={C.case2} stroke={C.ink} strokeWidth={5} />
    <rect x={-30} y={-62} width={50} height={22} rx={6} fill={C.case1} stroke={C.ink} strokeWidth={4} />
    <circle r={30} fill={C.ink} stroke={C.case3} strokeWidth={5} />
    <circle r={12} fill={K.cold} opacity={0.5 + 0.5 * glow} />
  </g>
);

/** Dibujo a mano (papel con un cubo de líneas) para el estereoscopio. */
const Drawing: React.FC<{ x: number; y: number; dx?: number; o?: number }> = ({ x, y, dx = 0, o = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-80} y={-62} width={160} height={124} rx={8} fill="#F4EEDC" stroke={C.ink} strokeWidth={4} />
    <g transform={`translate(${dx},4)`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinejoin="round">
      <path d="M0,-40 L34,-20 L0,0 L-34,-20 Z M-34,-20 L-34,20 L0,40 L34,20 L34,-20 M0,0 L0,40" />
    </g>
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
  /** Etiqueta desde la palabra w del beat i hasta el final de la escena (o hasta `until`). */
  const L = (i: number, w: string, until?: number) => span(t, Wd(i, w), until ?? E(i));
  /** Atenuado (0,35) hasta la palabra y luego entero: para lo que «entra después». */
  const dimTo = (i: number, w: string) => 0.35 + 0.65 * ramp(t, Wd(i, w), Wd(i, w) + 0.35);
  const R = (i: number, w: string, d = 0.4) => ramp(t, Wd(i, w), Wd(i, w) + d);
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(S(i), i === 1 ? 1.8 : 0), E(i))} />;

  // beat 1: la tapa se levanta en «esperas»
  const op1 = R(1, "esperas", 0.7);
  // beat 5: las dos vistas se juntan
  const join5 = ramp(t, Wd(5, "junta"), Wd(5, "profundidad"));
  const pop5 = R(5, "profundidad", 0.5);
  // beat 7: la cabeza gira
  const rot7 = 12 * Math.sin(t * 2.2) * dimTo(7, "giras");
  // beat 8: la vista sigue a la cabeza
  const yaw8 = 32 * Math.sin(t * 1.5);
  // beat 11: retraso (0,02 s antes de «tarda»; exagerado a 0,4 s después)
  const lagOn = R(11, "tarda", 0.5);
  const lag = 0.02 + 0.38 * lagOn;
  const yawNow = 30 * Math.sin(t * 2);
  const yawLate = 30 * Math.sin((t - lag) * 2);
  const ms = 15 + 35 * lagOn; // puntero de la barra (ms)
  const barX = (v: number) => 140 + (800 * v) / 60;
  // beat 13: resumen
  const resW = ["dos", "lentes", "sensores", "camaras"];
  const curR = resW.reduce((acc, w, k) => (t >= Wd(13, w) ? k : acc), -1);
  const resOn = (k: number) => (curR === k ? K.flow : K.white);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: las gafas GRANDES desde el fotograma 0; en «esperas» se levanta la tapa y aparece la pantalla partida */}
      <Scene {...sc(1)}>
        <SVG>
          <Headset id="h1" x={540} y={800} s={1.1} t={t} open={op1} camGlow={0.4 + 0.3 * Math.sin(t * 4)} d={16} div={R(1, "distinta", 0.3)} />
        </SVG>
        {chip(1, "POR DENTRO")}
        <Label x={395} y={1020} text="OJO IZQUIERDO" size={34} color={K.cold} box o={L(1, "ojo")} />
        <Label x={720} y={1020} text="OJO DERECHO" size={34} color={K.cold} box o={L(1, "ojo")} />
        <Stamp x={540} y={1105} text="¡DISTINTAS!" size={48} color={K.flow} p={R(1, "distinta", 0.35)} rot={-4} />
      </Scene>

      {/* 2 · la promesa: pantalla partida en dos; cada ojo recibe una imagen casi igual, pero desplazada */}
      <Scene {...sc(2)}>
        <SVG>
          <SplitScreen id="s2" x={540} y={720} w={880} h={330} t={t} d={24} div={R(2, "partida", 0.3)} guides={R(2, "desplazada", 0.4)} />
          <g opacity={dimTo(2, "cada")}>
            <Eye x={320} y={1010} r={40} look={[0, -12]} />
            <Eye x={760} y={1010} r={40} look={[0, -12]} />
          </g>
          <Flow d="M320,955 L320,905" t={t} color={K.cold} o={R(2, "recibe")} w={8} />
          <Flow d="M760,955 L760,905" t={t} color={K.cold} o={R(2, "recibe")} w={8} />
        </SVG>
        {chip(2, "EL SECRETO")}
        <Label x={540} y={480} text="PANTALLA PARTIDA EN DOS" size={40} color={K.flow} box o={L(2, "partida")} />
        <Label x={540} y={1105} text="CASI IGUALES…" size={40} color={K.white} box o={span(t, Wd(2, "igual"), Wd(2, "desplazada"), 0.2)} />
        <Label x={540} y={1105} text="…PERO DESPLAZADAS" size={40} color={K.flow} box o={span(t, Wd(2, "desplazada") + 0.05, E(2), 0.25)} />
      </Scene>

      {/* 3 · la idea clave: imágenes, lentes, sensores y cámaras que engañan a tu cerebro */}
      <Scene {...sc(3)}>
        <SVG>
          <Flow d="M330,600 L450,690" t={t} color={K.flow} o={0.5 * R(3, "imagenes")} w={7} />
          <Flow d="M740,600 L630,690" t={t} color={K.flow} o={0.5 * R(3, "lentes")} w={7} />
          <Flow d="M320,900 L450,800" t={t} color={K.flow} o={0.5 * R(3, "sensores")} w={7} />
          <Flow d="M740,900 L630,800" t={t} color={K.flow} o={0.5 * R(3, "camaras")} w={7} />
          <g opacity={dimTo(3, "imagenes")}><SplitScreen id="s3" x={230} y={540} w={270} h={110} t={t} d={8} /></g>
          <g opacity={dimTo(3, "lentes")}>
            <Lens x={760} y={520} w={130} /><Lens x={900} y={520} w={130} />
          </g>
          <Gyro x={230} y={940} r={62} t={t} o={dimTo(3, "sensores")} />
          <CamIcon x={830} y={940} s={0.95} o={dimTo(3, "camaras")} glow={R(3, "camaras")} />
          <Brain x={540} y={745} s={0.72} t={t} glow={R(3, "enganan")} o={dimTo(3, "enganan")} />
        </SVG>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={230} y={650} text="IMÁGENES" size={36} color={K.white} box o={L(3, "imagenes")} />
        <Label x={830} y={650} text="LENTES" size={36} color={K.white} box o={L(3, "lentes")} />
        <Label x={230} y={1060} text="SENSORES" size={36} color={K.white} box o={L(3, "sensores")} />
        <Label x={830} y={1060} text="CÁMARAS" size={36} color={K.white} box o={L(3, "camaras")} />
        <Label x={540} y={570} text="ENGAÑAN" size={38} color={K.flow} box o={L(3, "enganan")} />
      </Scene>

      {/* 4 · primero: tus ojos están separados y cada uno ve el mundo un poco distinto */}
      <Scene {...sc(4)}>
        <SVG>
          <Cube x={540} y={560 + 6 * Math.sin(t * 2)} s={1.15} />
          {[[400, -1], [680, 1]].map(([ex, k]) => (
            <path key={ex} d={`M${ex},${960} L540,640`} fill="none" stroke={K.cold} strokeWidth={6} strokeDasharray="16 14" strokeDashoffset={t * 60} opacity={0.9 * R(4, "ve")} />
          ))}
          <Eye x={400} y={1010} r={44} look={[8, -14]} o={dimTo(4, "ojos")} />
          <Eye x={680} y={1010} r={44} look={[-8, -14]} o={dimTo(4, "ojos")} />
          <g opacity={R(4, "separados")}>
            <path d="M330,1095 L750,1095" stroke={K.flow} strokeWidth={6} />
            <path d="M330,1095 l22,-14 l0,28 Z M750,1095 l-22,-14 l0,28 Z" fill={K.flow} />
          </g>
          <g transform="translate(190,770)" opacity={dimTo(4, "cada")}><MiniScene id="m4l" w={240} h={170} dx={20} t={t} /></g>
          <g transform="translate(890,770)" opacity={dimTo(4, "cada")}><MiniScene id="m4r" w={240} h={170} dx={-20} t={t} /></g>
        </SVG>
        {chip(4, "1 · TUS DOS OJOS", K.cold)}
        <Label x={190} y={650} text="IZQUIERDO" size={34} color={K.cold} box o={L(4, "cada")} />
        <Label x={890} y={650} text="DERECHO" size={34} color={K.cold} box o={L(4, "cada")} />
        <Label x={540} y={1095} text="SEPARADOS" size={36} color={K.flow} box o={L(4, "separados")} />
      </Scene>

      {/* 5 · el cerebro junta las dos vistas y calcula la profundidad: estereoscopía */}
      <Scene {...sc(5)}>
        <SVG>
          <g transform={`translate(${230 + 310 * join5},620)`} opacity={(1 - pop5) * (1 - 0.4 * join5)}><MiniScene id="m5l" w={300} h={220} dx={20} t={t} /></g>
          <g transform={`translate(${850 - 310 * join5},620)`} opacity={(1 - pop5) * (1 - 0.4 * join5)}><MiniScene id="m5r" w={300} h={220} dx={-20} t={t} /></g>
          {pop5 > 0.01 && (
            <g opacity={pop5}>
              <ellipse cx={540} cy={745} rx={120 * pop5} ry={24} fill="rgba(0,0,0,0.35)" />
              <Cube x={540} y={640 - 30 * pop5 + 6 * Math.sin(t * 2)} s={0.8 + 0.8 * pop5} />
              <path d="M760,700 L860,620 M860,620 l-30,4 M860,620 l-6,30" stroke={K.flow} strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.6 + 0.4 * Math.sin(t * 5)} />
              <path d="M320,700 L220,620 M220,620 l30,4 M220,620 l6,30" stroke={K.flow} strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.6 + 0.4 * Math.sin(t * 5)} />
            </g>
          )}
          <Brain x={280} y={1000} s={0.62} t={t} glow={span(t, Wd(5, "junta"), Wd(5, "estereoscopia"))} o={dimTo(5, "cerebro")} />
          <Headset id="h5" x={790} y={1005} s={0.3} t={t} open={1} cams={0} strap={false} d={10} o={dimTo(5, "gafas")} />
        </SVG>
        {chip(5, "1 · ESTEREOSCOPÍA", K.cold)}
        <Label x={540} y={850} text="PROFUNDIDAD" size={44} color={K.flow} box o={L(5, "profundidad")} />
        <Label x={540} y={460} text="ESTEREOSCOPÍA" size={50} color={K.cold} box o={L(5, "estereoscopia")} />
        <Label x={790} y={1115} text="LAS GAFAS, IGUAL" size={32} color={K.white} box o={L(5, "gafas")} />
      </Scene>

      {/* 6 · segundo: las lentes hacen de lupa; la pantalla parece enorme y lejana */}
      <Scene {...sc(6)}>
        <SVG>
          {/* imagen virtual (lo que crees ver) */}
          <g opacity={0.15 + 0.85 * R(6, "enorme", 0.6)} transform={`translate(540,530) scale(${0.55 + 0.45 * R(6, "enorme", 0.6)})`}>
            <MiniScene id="m6v" w={820} h={230} t={t} />
          </g>
          {[-1, 1].map((k) => (
            <g key={k}>
              <path d={`M540,1060 L${540 + k * 175},905 L${540 + k * 150},830`} fill="none" stroke={K.cold} strokeWidth={5} opacity={R(6, "lupa")} />
              <path d={`M${540 + k * 150},830 L${540 + k * 410},645`} fill="none" stroke={K.cold} strokeWidth={4} strokeDasharray="12 12" strokeDashoffset={-t * 50} opacity={0.8 * R(6, "enorme")} />
            </g>
          ))}
          <g opacity={dimTo(6, "pantalla")}><g transform="translate(540,800)"><MiniScene id="m6s" w={300} h={60} t={t} /></g></g>
          <Lens x={540} y={905} w={380} glow={R(6, "lupa")} />
          <Eye x={540} y={1062} r={36} look={[0, -10]} />
        </SVG>
        {chip(6, "2 · LAS LENTES", K.cold)}
        <Label x={850} y={975} text="LUPA" size={42} color={K.cold} box o={L(6, "lupa")} />
        <Label x={210} y={800} text="PANTALLA" size={36} color={K.white} box o={L(6, "pantalla")} />
        <Label x={540} y={700} text="ENORME Y LEJANA" size={44} color={K.flow} box o={L(6, "enorme")} />
      </Scene>

      {/* 7 · tercero: el giroscopio nota el giro; el acelerómetro, dónde está el suelo */}
      <Scene {...sc(7)}>
        <SVG>
          <HeadSide x={620} y={760} s={0.95} rot={rot7} />
          <path d="M520,520 A170,170 0 0 1 760,560" fill="none" stroke={K.hot} strokeWidth={9} strokeLinecap="round" opacity={R(7, "giras")} />
          <path d="M760,560 l-34,-8 l14,30 Z" fill={K.hot} opacity={R(7, "giras")} />
          <Gyro x={230} y={520} r={70} t={t} o={dimTo(7, "giroscopio")} />
          <Accel x={230} y={880} s={0.75} t={t} pull={R(7, "suelo")} o={dimTo(7, "acelerometro")} />
          <path d="M360,1110 L940,1110" stroke={C.case3} strokeWidth={8} strokeLinecap="round" opacity={dimTo(7, "suelo")} />
          <g opacity={R(7, "suelo")}>
            <path d={`M380,820 L380,${1060 + 6 * Math.sin(t * 5)}`} stroke={K.cold} strokeWidth={8} strokeLinecap="round" />
            <path d={`M380,${1090 + 6 * Math.sin(t * 5)} l-20,-34 l40,0 Z`} fill={K.cold} />
          </g>
        </SVG>
        {chip(7, "3 · LOS SENSORES", K.hot)}
        <Label x={230} y={640} text="GIROSCOPIO" size={38} color={K.hot} box o={L(7, "giroscopio")} />
        <Label x={230} y={1030} text="ACELERÓMETRO" size={34} color={K.cold} box o={L(7, "acelerometro")} />
        <Label x={720} y={1080} text="SUELO" size={34} color={K.white} o={L(7, "suelo")} />
      </Scene>

      {/* 8 · el giroscopio se lee mil veces por segundo y la imagen se redibuja según mires */}
      <Scene {...sc(8)}>
        <SVG>
          <g transform="translate(540,620)"><MiniScene id="m8" w={760} h={280} t={t} pan={yaw8 * 7 * dimTo(8, "redibuja")} /></g>
          <rect x={160} y={480} width={760} height={280} rx={24} fill="none" stroke={K.flow} strokeWidth={6} opacity={R(8, "redibuja")} />
          <HeadTop x={540} y={1015} s={0.72} yaw={yaw8} />
          {[0, 1, 2].map((k) => { const p = (t * 3 + k / 3) % 1; return (
            <circle key={k} cx={540} cy={1015} r={60 + 90 * p} fill="none" stroke={K.hot} strokeWidth={5} opacity={(1 - p) * R(8, "mil")} />); })}
        </SVG>
        {chip(8, "3 · MIL VECES POR SEGUNDO", K.hot)}
        <Label x={540} y={440} text={`${Math.round(1000 * ramp(t, Wd(8, "mil"), Wd(8, "segundo") + 0.2)).toLocaleString("es-ES").replace(/\s/g, ".").replace(/^(\d)(\d{3})$/, "$1.$2")} LECTURAS/s`} size={46} color={K.hot} box o={L(8, "mil")} />
        <Label x={540} y={805} text="SE REDIBUJA" size={40} color={K.flow} box o={L(8, "redibuja")} />
      </Scene>

      {/* 9 · cuarto: las cámaras de fuera miran la habitación y siguen tus manos */}
      <Scene {...sc(9)}>
        <SVG>
          {[[150, 470], [930, 500], [120, 820], [900, 790], [210, 1090]].map(([px, py], k) => (
            <g key={k} opacity={0.3 + 0.7 * R(9, "habitacion")}>
              <path d={`M${k % 2 ? 718 : 362},${py < 700 ? 538 : 662} L${px},${py}`} stroke={K.cold} strokeWidth={3} strokeDasharray="8 10" strokeDashoffset={-t * 40} opacity={R(9, "habitacion")} />
              <path d={`M${px - 16},${py} L${px + 16},${py} M${px},${py - 16} L${px},${py + 16}`} stroke={K.flow} strokeWidth={6} strokeLinecap="round" />
            </g>
          ))}
          <Headset id="h9" x={540} y={600} s={0.75} t={t} cams={1} camGlow={R(9, "camaras")} />
          <path d="M362,662 L470,880 M718,662 L610,880" stroke={K.cold} strokeWidth={4} strokeDasharray="10 10" strokeDashoffset={-t * 40} opacity={R(9, "manos")} />
          <Hand x={540 + 30 * Math.sin(t * 1.5)} y={975} s={0.72} t={t} dots={R(9, "manos")} o={dimTo(9, "muchas")} />
        </SVG>
        {chip(9, "4 · LAS CÁMARAS", K.cold)}
        <Label x={540} y={430} text="MIRAN LA HABITACIÓN" size={40} color={K.cold} box o={span(t, Wd(9, "habitacion"), Wd(9, "estas"))} />
        <Label x={540} y={430} text="SABEN DÓNDE ESTÁS" size={40} color={K.flow} box o={span(t, Wd(9, "estas") + 0.05, E(9))} />
        <Label x={810} y={1010} text="TUS MANOS" size={36} color={K.flow} box o={L(9, "manos")} />
      </Scene>

      {/* 10 · por qué marea: los ojos ven movimiento que el oído interno no nota */}
      <Scene {...sc(10)}>
        <SVG>
          <g opacity={dimTo(10, "ojos")}>
            {[0, 1, 2, 3].map((k) => { const xx = 90 + ((t * 260 + k * 95) % 380); return (
              <path key={k} d={`M${xx},${520 + k * 50} l70,0`} stroke={K.hot} strokeWidth={8} strokeLinecap="round" opacity={R(10, "movimiento") * 0.8} />); })}
            <Eye x={270} y={610} r={58} look={[10 * Math.sin(t * 6), 0]} />
          </g>
          <InnerEar x={810} y={600} s={0.95} t={t} mov={0} o={dimTo(10, "oido")} />
          <Flow d="M300,700 L470,880" t={t} color={K.hot} o={R(10, "cerebro")} w={7} />
          <Flow d="M780,720 L610,880" t={t} color={K.cold} o={R(10, "cerebro")} w={7} />
          <Brain x={540} y={950} s={0.7} t={t} wob={R(10, "lia", 0.2)} o={dimTo(10, "cerebro")} />
        </SVG>
        {chip(10, "¿POR QUÉ MAREA?", K.warn)}
        <Label x={270} y={760} text="OJOS: ¡MOVIMIENTO!" size={34} color={K.hot} box o={L(10, "movimiento")} />
        <Label x={810} y={760} text="OÍDO: QUIETO" size={34} color={K.cold} box o={L(10, "nota")} />
        <Stamp x={540} y={1105} text="¡NO CUADRA!" size={50} p={R(10, "lia", 0.35)} />
      </Scene>

      {/* 11 · curiosidad: la imagen debe seguir tu cabeza en menos de unas veinte milésimas */}
      <Scene {...sc(11)}>
        <SVG>
          <HeadTop x={270} y={650} s={0.8} yaw={yawNow} />
          <g transform={`translate(740,640)`}>
            <MiniScene id="m11" w={340} h={240} t={t} pan={yawLate * 6} />
            <rect x={-170} y={-120} width={340} height={240} rx={20} fill={K.warn} opacity={0.25 * lagOn * (0.6 + 0.4 * Math.sin(t * 8))} />
          </g>
          <Flow d="M380,640 L560,640" t={t} color={lagOn > 0.5 ? K.warn : K.cold} w={8} />
          {/* barra de retraso 0-60 ms */}
          <g opacity={dimTo(11, "menos")}>
            <rect x={140} y={930} width={barX(20) - 140} height={34} rx={10} fill={K.cold} />
            <rect x={barX(20)} y={930} width={940 - barX(20)} height={34} rx={10} fill={K.warn} opacity={0.85} />
            <path d={`M${barX(ms)},918 l-18,-30 l36,0 Z`} fill={K.flow} stroke={C.ink} strokeWidth={4} />
          </g>
        </SVG>
        {chip(11, "CURIOSIDAD")}
        <Label x={540} y={460} text="MENOS DE 20 MILÉSIMAS" size={44} color={K.cold} box o={L(11, "menos")} />
        <Label x={barX(20)} y={1010} text="20 ms" size={36} color={K.white} o={dimTo(11, "menos") * R(11, "veinte")} />
        <Label x={740} y={805} text="¡LLEGA TARDE!" size={38} color={K.warn} box o={L(11, "tarda")} />
      </Scene>

      {/* 12 · otra: Wheatstone, 1838, espejos y dibujos */}
      <Scene {...sc(12)}>
        <SVG>
          <g opacity={dimTo(12, "espejos")}>
            <path d="M540,740 L420,860" stroke={C.case3} strokeWidth={14} strokeLinecap="round" />
            <path d="M540,740 L660,860" stroke={C.case3} strokeWidth={14} strokeLinecap="round" />
            <path d="M540,740 L420,860 M540,740 L660,860" stroke={K.white} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
          </g>
          <g opacity={dimTo(12, "dibujos")}>
            <rect x={150} y={720} width={26} height={180} rx={6} fill="#F4EEDC" stroke={C.ink} strokeWidth={4} />
            <rect x={904} y={720} width={26} height={180} rx={6} fill="#F4EEDC" stroke={C.ink} strokeWidth={4} />
            <Drawing x={200} y={600} dx={8} />
            <Drawing x={880} y={600} dx={-8} />
          </g>
          {[-1, 1].map((k) => (
            <path key={k} d={`M${540 + k * 70},1030 L${540 + k * 70},810 L${k < 0 ? 180 : 900},810`} fill="none" stroke={K.cold} strokeWidth={6} strokeDasharray="16 12"
              strokeDashoffset={t * 60} opacity={R(12, "truco")} />
          ))}
          <Eye x={470} y={1060} r={30} look={[0, -8]} />
          <Eye x={610} y={1060} r={30} look={[0, -8]} />
        </SVG>
        {chip(12, "OTRA CURIOSIDAD")}
        <Label x={540} y={470} text="WHEATSTONE" size={46} color={K.white} box o={span(t, Wd(12, "wheatstone"), Wd(12, "1838"))} />
        <Stamp x={540} y={470} text="1838" size={70} color={K.flow} rot={-6} p={R(12, "1838", 0.35)} />
        <Label x={540} y={950} text="ESPEJOS" size={36} color={K.white} box o={L(12, "espejos")} />
        <Label x={540} y={630} text="DIBUJOS" size={36} color={K.flow} box o={L(12, "dibujos")} />
      </Scene>

      {/* 13 · cierre: resumen */}
      <Scene {...sc(13)}>
        <SVG>
          <Headset id="h13" x={540} y={760} s={0.85} t={t} open={1} lenses={curR >= 1 ? 1 : 0.0} camGlow={curR >= 3 ? 1 : 0} div={curR === 0 ? 1 : 0.2} />
          <Gyro x={540} y={1000} r={40} t={t} o={curR === 2 ? 1 : 0.35} />
        </SVG>
        {chip(13, "RESUMEN")}
        <Label x={280} y={1010} text="DOS IMÁGENES" size={36} color={resOn(0)} box o={dimTo(13, "dos")} />
        <Label x={800} y={1010} text="LENTES" size={36} color={resOn(1)} box o={dimTo(13, "lentes")} />
        <Label x={280} y={1095} text="SENSORES" size={36} color={resOn(2)} box o={dimTo(13, "sensores")} />
        <Label x={800} y={1095} text="CÁMARAS" size={36} color={resOn(3)} box o={dimTo(13, "camaras")} />
      </Scene>

      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
