// Piloto v3 (opción A, todo 3D): "Cómo funciona la tostadora".
// Beats PJ (personaje guía) + beats TECH (corte técnico), en el mismo mundo 3D para que no haya salto de estilo.
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, random } from "remotion";
import * as THREE from "three";
import { Scene3D } from "./kit3d/Scene3D";
import { CameraKey, project, shot } from "./kit3d/CameraRig";
import { Guide, POSES, Pose, mixPose } from "./kit3d/Guide";
import { Glow } from "./kit3d/Glow";
import { Rise } from "./kit3d/Flow";
import { C } from "./kit3d/theme3d";
import { ramp, springy, noise1, keyed, lerp } from "./kit3d/anim";
import { Captions, MainLabel, Timeline, Callout, Gauge, Intro, Outro, Timing, K, FONT } from "./kit2d/Kit";
import { Toaster, TOASTER, ToasterState, Bread } from "./Model";

export type Props = { timing: Timing; quality?: "draft" | "final"; debug?: boolean };

const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");

const GUIDE_POS = [-2.55, 0, 0.75];
const GUIDE_ROT = 0.85;
const GUIDE_SCALE = 0.62;

export const Tostadora3D: React.FC<Props> = ({ timing, quality = "final", debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const B = timing.beats;
  const F = (s: number) => Math.round(s * fps);
  /** Inicio (s) de la palabra que empieza por `w` en el beat i (1-based). */
  const Wd = (i: number, w: string) => {
    const x = timing.words.find((k) => k.beat === i - 1 && norm(k.w).startsWith(norm(w)));
    return x ? x.s : B[i - 1].s;
  };
  const bs = (i: number) => B[i - 1].s;
  const be = (i: number) => B[i - 1].e;
  const outroStart = timing.voiceEnd + 0.3;

  // ---------- estado de la tostadora ----------
  const tDown4 = bs(4) + 0.4, tPop4 = Wd(4, "salta");
  const tDown6 = Wd(6, "bajarla"), tPop13 = Wd(13, "lanza");
  const tDown14 = bs(14) + 0.5, tPop14 = Wd(14, "salto");
  const cycles: [number, number][] = [[-1, be(1) + 0.4], [tDown4, tPop4], [bs(5), be(5) - 0.4], [tDown6, tPop13], [tDown14, tPop14]];
  const cycleAt = (x: number) => cycles.find(([d, p]) => x >= d && x < p);
  const liftAt = (x: number) => {
    for (const [d, p] of cycles) {
      if (x >= d && x < p) return 1 - ramp(x * fps, d * fps, d * fps + 8);
      if (x >= p && x < p + 1.2) return Math.min(1.08, springy(x * fps, p * fps, 22));
    }
    return 1;
  };
  const poweredAt = (x: number) => liftAt(x) < 0.05;
  const heatAt = (x: number) => {
    // calentamiento con inercia: sube en ~1,5 s y baja en ~1 s
    let h = 0;
    for (let k = 0; k <= 60; k++) {
      const xx = x - (60 - k) / 30;
      h += ((poweredAt(xx) ? 1 : 0) - h) * (poweredAt(xx) ? 0.05 : 0.08);
    }
    return h;
  };
  const toastAt = (x: number) => {
    if (x < bs(10)) return x > be(4) && x < bs(5) ? 0.7 : 0.05;
    if (x < tPop13) return interpolate(x, [bs(10), tPop13], [0.05, 0.85], { extrapolateRight: "clamp" });
    return 0.9;
  };
  const s: ToasterState = {
    lift: liftAt(t),
    heat: Math.max(heatAt(t) * (t > bs(2) - 0.3 && t < bs(3) ? 0.15 : 1), interpolate(t, [bs(3) - 0.2, bs(3) + 0.6, be(3), bs(4) + 0.2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })),
    magnet: 0,
    toast: toastAt(t),
    ghostA: interpolate(t, [bs(8) - 0.3, bs(8) + 0.3, be(9), be(9) + 0.5], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    micaGlow: interpolate(t, [bs(9), bs(9) + 0.4, be(9) - 0.3, be(9)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (0.6 + 0.4 * Math.sin(frame / 5)),
    knob: interpolate(t, [Wd(12, "rueda"), Wd(12, "alarga"), Wd(12, "acorta"), Wd(12, "acorta") + 0.8], [0, 1.4, 1.4, -0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) + 0.4,
    flow: 0,
  };
  const cyc = cycleAt(t);
  s.magnet = cyc && poweredAt(t) ? Math.min(1, Math.max(0, (t - Math.max(0, cyc[0])) * 3 + 0.3)) : 0;
  s.flow = Math.min(1, s.heat * 1.4);
  const ghostWin = (a: number, b: number) => interpolate(t, [a - 0.4, a, b, b + 0.4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  s.endGhost = Math.max(ghostWin(bs(6), be(7)), ghostWin(bs(12), be(13) - 2));

  // ---------- corte transversal: se abre en el beat 1 y se cierra en el cierre ----------
  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 2), []);
  const open = ramp(frame, F(1.6), F(4.4)) * (1 - ramp(frame, F(outroStart), F(outroStart + 1.4)));
  clip.constant = lerp(1.0, 0.42, open);

  // ---------- cámara por beat (continuidad: cada beat arranca donde acaba el anterior) ----------
  const cam: CameraKey[] = useMemo(() => {
    const k = (sec: number, target: number[], d: number, az: number, el: number, fov = 30) => shot(F(sec), target, d, az, el, fov);
    return [
      k(0, [-0.7, 1.25, 0.3], 15.5, -12, 9),
      k(be(1), [-0.1, 1.05, 0.1], 11.5, 12, 10),
      k(bs(2) + 0.9, [-2.1, 1.3, 1.15], 8.6, -18, 8),
      k(be(2), [-2.05, 1.3, 1.15], 8.0, 4, 8),
      k(bs(3) + 0.8, [-0.3, 0.85, 0.03], 3.4, -14, 6),
      k(be(3), [-0.15, 0.85, 0.03], 3.1, 14, 6),
      k(bs(4) + 0.8, [-0.7, 1.3, 0.3], 15, 16, 11),
      k(be(4), [-0.6, 1.3, 0.3], 14.5, 8, 11),
      k(bs(5) + 0.8, [-0.15, 1.0, 0.1], 7.0, 0, 34),
      k(be(5), [-0.15, 1.0, 0.1], 6.6, -16, 30),
      k(bs(6) + 0.8, [0.95, 0.8, 0.0], 5.6, 26, 14),
      k(be(6), [0.95, 0.7, 0.0], 5.2, 16, 12),
      k(bs(7) + 0.8, [1.0, 0.3, 0.36], 2.9, 22, 18, 28),
      k(be(7), [1.0, 0.28, 0.36], 2.5, 12, 14, 28),
      k(bs(8) + 0.8, [-0.15, 1.0, 0.0], 5.6, 0, 6),
      k(be(8), [-0.15, 1.0, 0.0], 4.4, 6, 4),
      k(bs(9) + 0.8, [-0.9, 1.0, 0.0], 3.4, -46, 14, 28),
      k(be(9), [-0.9, 1.0, 0.0], 3.2, -30, 10, 28),
      k(bs(10) + 0.8, [-0.15, 1.35, 0.1], 6.4, 22, 28),
      k(be(10), [-0.15, 1.35, 0.1], 6.0, 10, 26),
      k(bs(11) + 0.8, [-0.2, 1.3, 0.34], 4.2, 12, 8, 28),
      k(be(11), [-0.2, 1.3, 0.34], 3.6, -6, 8, 28),
      k(bs(12) + 0.8, [1.1, 0.55, 0.0], 4.2, 34, 16, 28),
      k(be(12), [1.15, 0.55, 0.0], 3.8, 46, 14, 28),
      k(bs(13) + 0.6, [-0.1, 1.45, 0.0], 10.5, 26, 10),
      k(be(13), [-0.1, 1.5, 0.0], 10, 18, 10),
      k(bs(14) + 1.0, [-0.6, 1.2, 0.2], 14.5, 42, 14, 31),
      k(be(14), [-0.6, 1.2, 0.2], 14.5, -36, 14, 31),
      k(bs(15) + 0.8, [-2.3, 1.6, 0.95], 7.4, -6, 6),
      k(be(15), [-2.3, 1.6, 0.95], 6.8, 6, 6),
      k(bs(16) + 0.6, [-1.3, 1.2, 0.45], 11.5, -8, 8),
      k(outroStart, [-1.2, 1.2, 0.45], 11, -2, 8),
      k(outroStart + 2.0, [-0.6, 1.4, 0.2], 18, 4, 16, 31),
    ];
  }, [timing]);

  // ---------- personaje: poses por tiempo ----------
  const P = POSES;
  const poseKeys: { f: number; v: Pose }[] = useMemo(() => [
    { f: 0, v: P.peek },
    { f: F(Wd(1, "brilla") - 0.2), v: P.peek },
    { f: F(Wd(1, "brilla") + 0.15), v: P.surprise },
    { f: F(be(1)), v: P.surprise },
    { f: F(bs(2) + 0.4), v: P.hold },
    { f: F(be(2)), v: P.hold },
    { f: F(bs(3) + 0.5), v: P.idle },
    { f: F(tPop4 - 0.2), v: P.idle },
    { f: F(tPop4 + 0.15), v: P.cheer },
    { f: F(be(4)), v: P.cheer },
    { f: F(bs(5) + 0.4), v: P.point },
    { f: F(be(13)), v: P.point },
    { f: F(tPop14 - 0.2), v: P.idle },
    { f: F(tPop14 + 0.15), v: P.cheer },
    { f: F(be(14)), v: P.cheer },
    { f: F(bs(15) + 0.4), v: P.showTwo },
    { f: F(Wd(15, "negro") - 0.1), v: P.showTwo },
    { f: F(Wd(15, "negro") + 0.3), v: { ...P.showTwo, smile: -1, brow: -0.8, eyeOpen: 0.85, look: [-0.6, -0.2] } },
    { f: F(be(15)), v: { ...P.showTwo, smile: -1, brow: -0.8, eyeOpen: 0.85, look: [-0.6, -0.2] } },
    { f: F(bs(16) + 0.3), v: P.wagNo },
    { f: F(outroStart), v: P.wagNo },
    { f: F(outroStart + 0.6), v: P.wave },
  ], [timing]);
  let pose = keyed(frame, poseKeys, mixPose);
  // movimiento secundario: dedo que se agita en "no", saludo que oscila
  if (t > bs(16) && t < outroStart) pose = { ...pose, elR: [pose.elR[0], pose.elR[1] + Math.sin(frame / 3) * 0.25, pose.elR[2]] };
  if (t > outroStart + 0.6) pose = { ...pose, elR: [pose.elR[0], pose.elR[1], -0.5 + Math.sin(frame / 4) * 0.35] };
  // salto del susto y del "¡pop!"
  const hop = Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (t - Wd(1, "brilla")) / 0.45)))) * 0.25
    + Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (t - tPop4) / 0.45)))) * 0.3
    + Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (t - tPop14) / 0.45)))) * 0.3;
  pose = { ...pose, root: [pose.root[0], pose.root[1] + hop, pose.root[2]] };

  // ---------- fuego y tenedor (beat 2) ----------
  const fireA = interpolate(t, [bs(2) - 0.2, bs(2) + 0.3, be(2) + 0.2, bs(3) + 0.3], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const firePos = [GUIDE_POS[0] + 0.75, 0, GUIDE_POS[2] + 0.95];
  // ---------- tostadas en las manos (beat 15) ----------
  const handsA = interpolate(t, [bs(15) + 0.2, bs(15) + 0.7, be(15), be(15) + 0.4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ---------- rayos infrarrojos (beats 5 y 10-11) ----------
  const rayA = Math.max(
    interpolate(t, [bs(5) + 0.5, bs(5) + 1, be(5) - 0.6, be(5) - 0.2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(t, [bs(10), bs(10) + 0.5, be(11), be(11) + 0.4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const vaporA = interpolate(t, [bs(10) + 1.5, bs(10) + 2.5, be(11), be(11) + 0.5], [0, 0.55, 0.55, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ---------- etiquetas ancladas ----------
  const pr = (p: number[]) => project(cam, frame, p);
  const T = TOASTER;
  const liftY = s.lift * T.liftUp;

  const temp8 = interpolate(t, [Wd(8, "calienta"), Wd(8, "brilla")], [20, 600], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const temp11 = interpolate(t, [bs(11) + 0.3, Wd(11, "ciento")], [100, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bgEdge }}>
      <Scene3D frame={frame} camKeys={cam} quality={quality}>
        <Toaster s={s} clip={clip} frame={frame} />
        <Guide pose={pose} frame={frame} position={GUIDE_POS} rotationY={GUIDE_ROT} scale={GUIDE_SCALE} coreBoost={s.magnet * 0.15} />
        {/* beat 2: fuego con tenedor largo y rebanada */}
        {fireA > 0.01 && (
          <group>
            <mesh position={[firePos[0], 0.12, firePos[2]]} castShadow>
              <cylinderGeometry args={[0.32, 0.22, 0.24, 24]} />
              <meshStandardMaterial color="#1A1F2A" roughness={0.6} metalness={0.4} />
            </mesh>
            {[0, 1, 2, 3, 4].map((i) => {
              const fl = noise1(`fl${i}`, frame / 4);
              return <mesh key={i} position={[firePos[0] + (i - 2) * 0.08, 0.38 + fl * 0.12, firePos[2] + Math.sin(i * 2) * 0.06]} scale={[1, 1.2 + fl * 0.8, 1].map((v) => v * fireA) as any}>
                <coneGeometry args={[0.09, 0.42, 12]} />
                <meshStandardMaterial color={C.hot} emissive={i % 2 ? C.hotCore : C.hot} emissiveIntensity={2.5} transparent opacity={0.9} />
              </mesh>;
            })}
            <Glow position={[firePos[0], 0.55, firePos[2]]} color={C.hot} size={1.6 * (0.9 + 0.1 * noise1("g", frame / 3))} opacity={fireA * 0.9} />
            <pointLight position={[firePos[0], 0.7, firePos[2]]} color={C.hot} intensity={fireA * 4 * (0.85 + 0.15 * noise1("pl", frame / 3))} distance={4} decay={2} />
            {/* tenedor largo: de las manos a la rebanada sobre la llama */}
            <Stick a={[-2.2, 1.43, 1.06]} b={[firePos[0] + 0.02, 1.05, firePos[2] - 0.02]} r={0.014} scale={fireA} />
            <Bread toast={interpolate(t, [bs(2), be(2)], [0.1, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
              position={[firePos[0], 0.86, firePos[2]]} scale={0.3 * fireA} rotation={[0, 0.5, 0]} />
          </group>
        )}
        {/* beat 15: tostada dorada y tostada quemada flotando sobre las manos */}
        {handsA > 0.01 && (
          <group>
            <Bread toast={0.95} position={[-1.99, 1.55 + Math.sin(frame / 14) * 0.03, 0.63]} scale={0.3 * handsA} rotation={[0, GUIDE_ROT, 0.1]} />
            <Glow position={[-1.99, 1.8, 0.7]} color={C.flow} size={0.9} opacity={handsA * 0.35} />
            <Bread toast={2.0} position={[-2.6, 1.55 + Math.sin(frame / 14 + 1) * 0.03, 1.32]} scale={0.3 * handsA} rotation={[0, GUIDE_ROT, -0.1]} />
            <Rise origin={[-2.6, 2.0, 1.32]} spread={[0.2, 0, 0.1]} height={0.6} frame={frame} color="#9AA3B0" count={14} opacity={handsA * 0.5} seed="humo" size={0.25} />
          </group>
        )}
        {/* rayos infrarrojos: de las placas al pan */}
        <Rays frame={frame} a={rayA * Math.max(0.3, s.heat)} />
        {/* vapor de agua saliendo del pan */}
        <Rise origin={[T.breadX, 1.75 + liftY, 0]} spread={[1.4, 0, 0.8]} height={1.4} frame={frame} color="#FFFFFF" count={36} opacity={vaporA * 0.7} seed="vapor" size={0.6} />
      </Scene3D>

      {/* ---------- capa 2D ---------- */}
      <Intro n={1} frame={frame} />
      <MainLabel text="Sin fuego dentro" color={K.hot} t={t} t0={1.0} t1={be(1)} />
      <Callout text="alambre al rojo" anchor={pr([-0.2, 0.95, 0.03])} offset={[220, -170]} color={K.hot} t={t} t0={Wd(1, "alambre")} t1={be(1)} />
      <Timeline marks={["Antes", "1905", "1921", "Hoy"]} active={t < bs(3) ? 0 : t < bs(4) ? 1 : t < bs(5) ? 2 : 3} t={t} t0={bs(2)} t1={be(4) + 0.3} />
      <MainLabel text="Tostar a mano" t={t} t0={bs(2)} t1={be(2)} />
      <MainLabel text="Níquel + cromo" color={K.hot} t={t} t0={bs(3)} t1={be(3)} />
      <MainLabel text="Salta sola" t={t} t0={bs(4)} t1={be(4)} />
      <MainLabel text="La idea clave" t={t} t0={bs(5)} t1={be(5)} />
      <Callout text="calor radiante" anchor={pr([-0.6, 1.2, 0.18])} offset={[-60, -230]} color={K.hot} t={t} t0={Wd(5, "calor")} t1={be(5)} size={38} />
      <Callout text="tiempo" anchor={pr([T.knob[0], T.knob[1], T.knob[2]])} offset={[40, -200]} color={K.flow} t={t} t0={Wd(5, "tiempo")} t1={be(5)} size={38} />
      <Callout text="muelle" anchor={pr([T.sledX, 0.2 + liftY * 0.5, -0.36])} offset={[120, 140]} color={K.white} t={t} t0={Wd(5, "muelle")} t1={be(5)} size={38} />
      <MainLabel text="1 · Palanca" t={t} t0={bs(6)} t1={be(6)} />
      <Callout text="muelle" anchor={pr([T.sledX, 0.12 + liftY * 0.5, -0.36])} offset={[-200, 150]} t={t} t0={Wd(6, "muelle")} t1={be(6)} />
      <Callout text="circuito cerrado" anchor={pr([T.sledX, 0.25, 0.36])} offset={[-120, -260]} color={K.flow} t={t} t0={Wd(6, "circuito")} t1={be(6)} size={38} />
      <MainLabel text="Electroimán" color={K.cold} t={t} t0={bs(7)} t1={be(7)} />
      <Callout text="sujeta la bandeja" anchor={pr([T.magnet[0], 0.2, T.magnet[2]])} offset={[-180, -280]} color={K.cold} t={t} t0={Wd(7, "sujeta")} t1={be(7)} size={38} />
      <MainLabel text="2 · Resistencias" color={K.hot} t={t} t0={bs(8)} t1={be(8)} />
      <Gauge value={temp8} max={700} unit="°C" color={K.hot} x={820} y={1010} label="aprox." t={t} t0={Wd(8, "calienta") - 0.3} t1={be(8)} />
      <MainLabel text="Placas de mica" t={t} t0={bs(9)} t1={be(9)} />
      <Callout text="aguanta el calor" anchor={pr([-0.95, 1.45, 0.0])} offset={[60, -200]} color={K.hot} t={t} t0={Wd(9, "aguanta")} t1={be(9)} size={38} />
      <Callout text="aísla" anchor={pr([-0.95, 0.6, 0.0])} offset={[120, 180]} color={K.cold} t={t} t0={Wd(9, "aisla")} t1={be(9)} size={38} />
      <MainLabel text="3 · El pan" t={t} t0={bs(10)} t1={be(10)} />
      <Callout text="infrarrojos" anchor={pr([-0.6, 1.0, 0.45])} offset={[-80, 260]} color={K.hot} t={t} t0={Wd(10, "radiacion")} t1={be(10)} size={38} />
      <Callout text="vapor de agua" anchor={pr([-0.4, 2.3 + liftY, 0.1])} offset={[160, -120]} color={K.white} t={t} t0={Wd(10, "agua")} t1={be(10)} size={38} />
      <MainLabel text="Reacción de Maillard" t={t} t0={bs(11)} t1={be(11)} />
      <Gauge value={temp11} max={200} unit="°C" color={K.flow} x={820} y={1010} label="Maillard" t={t} t0={bs(11) + 0.2} t1={be(11)} />
      <MainLabel text="4 · Temporizador" t={t} t0={bs(12)} t1={be(12)} />
      <Callout text="cuenta el tiempo" anchor={pr([1.12, 0.62, -0.6])} offset={[-220, 170]} color={K.flow} t={t} t0={Wd(12, "circuito")} t1={be(12)} size={38} />
      <Callout text="rueda del tostado" anchor={pr(T.knob)} offset={[-60, 220]} color={K.white} t={t} t0={Wd(12, "rueda")} t1={be(12)} size={38} />
      <MainLabel text="¡Arriba!" t={t} t0={bs(13)} t1={be(13)} />
      <Callout text="imán apagado" anchor={pr([T.magnet[0], 0.2, T.magnet[2]])} offset={[-150, 200]} color={K.cold} t={t} t0={Wd(13, "corta")} t1={be(13)} size={38} />
      <MainLabel text="Todo junto" t={t} t0={bs(14)} t1={be(14)} />
      <Chain t={t} items={[["palanca", Wd(14, "palanca")], ["corriente", Wd(14, "corriente")], ["calor", Wd(14, "alambre")], ["pan", Wd(14, "pan")], ["tiempo", Wd(14, "tiempo")], ["¡salto!", Wd(14, "salto")]]} t1={be(14)} />
      <MainLabel text="Dorado no es quemado" t={t} t0={bs(15)} t1={be(15)} />
      <Callout text="Maillard" anchor={pr([-1.99, 1.8, 0.63])} offset={[150, -110]} color={K.flow} t={t} t0={bs(15) + 0.6} t1={be(15)} size={38} />
      <Callout text="carbón" anchor={pr([-2.6, 1.8, 1.32])} offset={[-150, 150]} color="#9AA3B0" t={t} t0={Wd(15, "negro")} t1={be(15)} size={38} />
      <MainLabel text="¡Nunca un cuchillo!" color={K.warn} t={t} t0={bs(16)} t1={outroStart} />
      <NoKnife t={t} t0={Wd(16, "cuchillo")} t1={outroStart} />
      <Captions words={timing.words} t={t} />
      <Outro question="¿Tú la pones al tres o al cinco?" next="el termo" frame={frame} start={F(outroStart)} />

      {/* ---------- sonido ---------- */}
      <Audio src={staticFile("voz.wav")} />
      <Audio src={staticFile("music.mp3")} volume={(f) => {
        const x = f / fps;
        const duck = x < timing.voiceEnd ? 0.06 : 0.13;
        return duck * interpolate(x, [0, 1, timing.duration - 2, timing.duration], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      }} />
      <Sfx at={0} name="sting" vol={0.25} />
      <Sfx at={1.6} name="whoosh" vol={0.3} />
      <Sfx at={Wd(1, "brilla")} name="pop" vol={0.3} />
      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16].map((i) => <Sfx key={i} at={bs(i) - 0.15} name="whoosh" vol={0.22} />)}
      <Sfx at={tDown4} name="click" vol={0.35} />
      <Sfx at={tPop4} name="pop" vol={0.35} />
      <Sfx at={bs(5)} name="click" vol={0.0} />
      <Sfx at={tDown6} name="click" vol={0.4} />
      <Sfx at={Wd(7, "electroiman")} name="hum" vol={0.25} />
      <Sfx at={Wd(8, "corriente")} name="hum" vol={0.2} />
      <Sfx at={Wd(10, "agua")} name="hiss" vol={0.25} />
      {[0, 1, 2, 3].map((i) => <Sfx key={i} at={Wd(12, "cuenta") + i * 0.5} name="tick" vol={0.3} />)}
      <Sfx at={tPop13} name="pop" vol={0.4} />
      <Sfx at={tDown14} name="click" vol={0.3} />
      <Sfx at={tPop14} name="pop" vol={0.35} />
      <Sfx at={outroStart} name="ding" vol={0.35} />

      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};

/** Rayos infrarrojos: partículas naranja que viajan de cada placa hacia la cara del pan. */
const Rays: React.FC<{ frame: number; a: number }> = ({ frame, a }) => {
  if (a <= 0.01) return null;
  const T = TOASTER;
  const lanes: { from: number; to: number; x: number; y: number }[] = [];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
    const x = lerp(-0.85, 0.55, i / 4), y = lerp(0.6, 1.4, j / 2);
    lanes.push({ from: T.plateZ[0] - 0.04, to: T.breadZ[0] + 0.1, x, y });
    lanes.push({ from: T.plateZ[1] + 0.04, to: T.breadZ[0] - 0.1, x, y });
    lanes.push({ from: T.plateZ[1] - 0.04, to: T.breadZ[1] + 0.1, x, y });
    lanes.push({ from: T.plateZ[2] + 0.04, to: T.breadZ[1] - 0.1, x, y });
  }
  return (
    <group>
      {lanes.map((l, i) => {
        const u = (frame / 24 + random(`ray${i}`)) % 1;
        const z = lerp(l.from, l.to, u);
        return <Glow key={i} position={[l.x, l.y + Math.sin(u * 12) * 0.02, z]} color={C.hot} size={0.16} opacity={a * Math.sin(Math.PI * u)} />;
      })}
    </group>
  );
};

const Sfx: React.FC<{ at: number; name: string; vol: number }> = ({ at, name, vol }) => {
  const { fps } = useVideoConfig();
  if (vol <= 0) return null;
  return (
    <Sequence from={Math.max(0, Math.round(at * fps))} durationInFrames={Math.round(2.5 * fps)}>
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
    </Sequence>
  );
};

/** Cadena "todo junto": palabras que se encienden en orden. */
const Chain: React.FC<{ t: number; items: [string, number][]; t1: number }> = ({ t, items, t1 }) => {
  const a = interpolate(t, [items[0][1] - 0.4, items[0][1], t1 - 0.2, t1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 390, left: 60, width: 900, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, opacity: a }}>
      {items.map(([w, at], i) => {
        const on = t >= at - 0.05;
        return <div key={i} style={{ fontFamily: FONT, fontWeight: 900, fontSize: 34, padding: "4px 14px", borderRadius: 10,
          color: on ? K.ink : "rgba(255,255,255,0.5)", background: on ? K.flow : "rgba(6,16,31,0.7)",
          transform: `scale(${on ? 1 : 0.92})` }}>{w}{i < items.length - 1 ? " →" : ""}</div>;
      })}
    </div>
  );
};

/** Icono 2D "cuchillo prohibido" (no es un dato: es un aviso). */
const NoKnife: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const a = interpolate(t, [t0 - 0.1, t0 + 0.2, t1 - 0.2, t1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (a <= 0) return null;
  return (
    <svg width={260} height={260} style={{ position: "absolute", left: 640, top: 760, opacity: a, transform: `scale(${0.7 + 0.3 * a})` }} viewBox="0 0 260 260">
      <circle cx={130} cy={130} r={112} fill="rgba(6,16,31,0.85)" stroke={K.warn} strokeWidth={16} />
      <g transform="rotate(-40 130 130)">
        <rect x={120} y={40} width={22} height={110} rx={6} fill="#D8DEE6" />
        <rect x={118} y={148} width={26} height={70} rx={8} fill="#1C2635" stroke="#D8DEE6" strokeWidth={3} />
      </g>
      <line x1={52} y1={208} x2={208} y2={52} stroke={K.warn} strokeWidth={18} strokeLinecap="round" />
    </svg>
  );
};

/** Varilla entre dos puntos (tenedor). */
const Stick: React.FC<{ a: number[]; b: number[]; r: number; scale?: number }> = ({ a, b, r, scale = 1 }) => {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const len = va.distanceTo(vb);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  if (scale <= 0.01) return null;
  return (
    <group position={mid.toArray()} quaternion={q}>
      <mesh scale={[scale, 1, scale]} castShadow>
        <cylinderGeometry args={[r, r, len, 8]} />
        <meshStandardMaterial color={C.steel} metalness={1} roughness={0.3} />
      </mesh>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * 0.03, len / 2 + 0.06, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.14, 6]} />
          <meshStandardMaterial color={C.steel} metalness={1} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

const SafeZones: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 150, background: "rgba(255,0,0,0.25)" }} />
    <div style={{ position: "absolute", left: 0, top: 1440, width: 1080, height: 480, background: "rgba(255,0,0,0.25)" }} />
    <div style={{ position: "absolute", left: 960, top: 0, width: 120, height: 1920, background: "rgba(255,0,0,0.25)" }} />
    <div style={{ position: "absolute", left: 60, top: 380, width: 880, height: 760, border: "3px dashed #0f0" }} />
    <div style={{ position: "absolute", left: 60, top: 1190, width: 900, height: 230, border: "3px dashed #ff0" }} />
  </AbsoluteFill>
);
