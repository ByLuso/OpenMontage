// Corazón procedural semirrealista: masa ventricular con punta hacia abajo-izquierda del paciente (+x en pantalla),
// aurículas, grandes vasos, coronarias, corte frontal con 4 cavidades, sistema eléctrico (nódulo sinusal → nódulo AV →
// haz de His → ramas) y flujo de sangre. Todo determinista (depende solo del frame / estado).
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";
import { useModel } from "./Model";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const TILT = 0.5; // inclinación de la punta (rad, alrededor de z)

/** Dirección unitaria → punto de la superficie ventricular (antes de la inclinación). */
function ventricleShape(d: THREE.Vector3) {
  const v = d.clone();
  let sx = 0.98, sy = 1.12, sz = 0.82;
  if (v.y < 0) { const k = 1 + 0.52 * v.y; sx *= k; sz *= k; sy *= 1.08; }
  // surco interventricular anterior (ligera hendidura en la cara frontal)
  const groove = Math.exp(-Math.pow(Math.atan2(v.x, v.z) - 0.15, 2) / 0.02) * Math.max(0, v.z) * 0.05;
  const r = 1 - groove;
  return new THREE.Vector3(v.x * sx * r, v.y * sy * r - 0.15, v.z * sz * r);
}
const tiltM = new THREE.Matrix4().makeRotationZ(TILT);
export function ventriclePoint(dir: number[], scale = 1) {
  return ventricleShape(new THREE.Vector3(...dir).normalize()).multiplyScalar(scale).applyMatrix4(tiltM);
}

// textura de miocardio: estrías + moteado (mapa de relieve)
let muscleTex: THREE.Texture | null = null;
function muscleTexture() {
  if (muscleTex) return muscleTex;
  const n = 512, cv = document.createElement("canvas"); cv.width = cv.height = n;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#808080"; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 220; i++) {
    g.strokeStyle = `rgba(${random(`ms${i}`) > 0.5 ? 170 : 70},${random(`ms${i}`) > 0.5 ? 170 : 70},${random(`ms${i}`) > 0.5 ? 170 : 70},0.25)`;
    g.lineWidth = 1 + random(`mw${i}`) * 3;
    g.beginPath(); const x = random(`mx${i}`) * n; g.moveTo(x, 0);
    for (let y = 0; y <= n; y += 24) g.lineTo(x + Math.sin(y / 60 + i) * 18 + y * 0.25, y);
    g.stroke();
  }
  for (let i = 0; i < 900; i++) {
    const v = 90 + Math.floor(random(`mv${i}`) * 90);
    g.fillStyle = `rgba(${v},${v},${v},0.3)`;
    g.beginPath(); g.arc(random(`px${i}`) * n, random(`py${i}`) * n, 1 + random(`pr${i}`) * 3, 0, Math.PI * 2); g.fill();
  }
  muscleTex = new THREE.CanvasTexture(cv);
  muscleTex.wrapS = muscleTex.wrapT = THREE.RepeatWrapping;
  return muscleTex;
}

const tube = (pts: number[][], r: number, seg = 60) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "centripetal"), seg, r, 16, false);

// Sistema eléctrico (coordenadas del mundo, dentro del plano de corte)
// Puntos del modelo real (BodyParts3D, escala 0.02; Y arriba, Z anterior)
export const SA_NODE = [-0.62, 0.85, 0.16];
export const AV_NODE = [-0.15, 0.05, 0.16];
const APEX = [0.5, -0.92, 0.16];
const PATH_ATRIA = [SA_NODE, [-0.58, 0.55, 0.16], [-0.4, 0.25, 0.16], AV_NODE];
const PATH_LEFT = [AV_NODE, [0.1, -0.3, 0.16], [0.3, -0.65, 0.16], APEX, [0.85, -0.35, 0.16]];
const PATH_RIGHT = [[0.1, -0.3, 0.16], [-0.2, -0.6, 0.16], [-0.5, -0.4, 0.16], [-0.62, 0.0, 0.16]];
const PATH_LA = [SA_NODE, [-0.2, 0.8, 0.16], [0.3, 0.72, 0.16]];
const curveOf = (p: number[][]) => new THREE.CatmullRomCurve3(p.map((q) => new THREE.Vector3(...q)), false, "centripetal");
const C_ATRIA = curveOf(PATH_ATRIA), C_LEFT = curveOf(PATH_LEFT), C_RIGHT = curveOf(PATH_RIGHT), C_LA = curveOf(PATH_LA);
const AORTA = [[0.15, 0.4, 0.2], [0.2, 0.9, 0.05], [0.4, 1.5, -0.2], [0.75, 1.65, -0.55], [0.9, 1.2, -0.75]];
const PULM_L = [[0.26, 1.27, -0.33], [0.7, 1.35, -0.6], [1.2, 1.3, -0.8]];
export const VESSELS = { AORTA, PULM_L };
const VENT_C = [0.21, -0.11, 0.22], ATR_C = [-0.42, 0.1, -0.11];

export type HeartState = {
  beatPhase: number; // 0..1 dentro del ciclo cardiaco
  open: number;      // 0 cerrado · 1 corte frontal abierto
  electric: number;  // visibilidad del sistema eléctrico
  flash: number;     // destello eléctrico global (gancho)
  blood: number;     // partículas de sangre
  nerves: number;    // 0 no hay · 1 nervios visibles
  nerveCut: number;  // 0 intactos · 1 cortados y separados
};

/** Contracción de aurículas (fase 0-0,18) y ventrículos (0,18-0,5). */
export function contraction(ph: number) {
  const a = ph < 0.2 ? Math.sin((ph / 0.2) * Math.PI) : 0;
  const v = ph >= 0.18 && ph < 0.52 ? Math.sin(((ph - 0.18) / 0.34) * Math.PI) : 0;
  return { a, v };
}

export const Heart: React.FC<{ s: HeartState; clip: THREE.Plane; frame: number }> = ({ s, clip, frame }) => {
  const G = useModel("corazon.glb");
  const cl = [clip];
  const m = useMemo(() => {
    const tissue = (color: string, em: string, clip = true) => new THREE.MeshPhysicalMaterial({
      color, roughness: 0.34, clearcoat: 0.8, clearcoatRoughness: 0.2, sheen: 0.9, sheenColor: new THREE.Color("#FF8FA8"),
      sheenRoughness: 0.45, emissive: new THREE.Color(em), emissiveIntensity: 0.5, vertexColors: true, clippingPlanes: clip ? cl : [],
    });
    const plain = (color: string, em: string, e = 0.5, clip = true) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, clearcoat: 0.7, emissive: new THREE.Color(em), emissiveIntensity: e, clippingPlanes: clip ? cl : [] });
    return {
      myo: tissue("#A8283C", "#3A0612"), atrium: tissue("#B83A50", "#3A0612"),
      inner: new THREE.MeshStandardMaterial({ color: "#5A0E1C", roughness: 0.55, side: THREE.BackSide, clippingPlanes: cl, emissive: new THREE.Color("#2A040C"), emissiveIntensity: 0.6 }),
      valve: plain("#F0D2D6", "#3A1A1E", 0.4),
      corA: plain("#E8505F", "#5A0A14", 0.6), corV: plain("#5A4AA0", "#1A0A3A", 0.5),
      aorta: (() => { const x = tissue("#C8384C", "#4A0812", false); return x; })(),
      pulm: (() => { const x = tissue("#5560C8", "#14184A", false); x.vertexColors = true; return x; })(),
      vein: (() => { const x = plain("#4B4FB8", "#10144A", 0.5, false); x.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.25)]; return x; })(),
      pvein: plain("#D8404E", "#4A0812", 0.5, false),
      wire: new THREE.MeshStandardMaterial({ color: "#35C4F0", emissive: new THREE.Color("#35C4F0"), emissiveIntensity: 1.2, transparent: true }),
      nerve: new THREE.MeshStandardMaterial({ color: "#FFD23F", emissive: new THREE.Color("#FFB020"), emissiveIntensity: 1.2, transparent: true }),
    };
  }, [clip]);
  const wires = useMemo(() => [PATH_ATRIA, PATH_LEFT, PATH_RIGHT, PATH_LA].map((p) => tube(p, 0.011, 60)), []);
  const { a, v } = contraction(s.beatPhase);
  const vScale = 1 - 0.06 * v + 0.01 * a;
  const aScale = 1 - 0.09 * a;
  m.wire.opacity = s.electric;
  m.wire.emissiveIntensity = 1 + 2.5 * (a + v) * 0.5;
  [m.myo, m.atrium].forEach((x) => { x.emissiveIntensity = 0.5 + 0.5 * s.flash; x.emissive.set(s.flash > 0.05 ? "#5A1030" : "#3A0612"); });

  const pulses: { p: number[]; k: number }[] = [];
  const along = (c: THREE.CatmullRomCurve3, t0: number, t1: number) => {
    const u = (s.beatPhase - t0) / (t1 - t0);
    if (u >= 0 && u <= 1) for (let j = 0; j < 4; j++) {
      const uu = Math.max(0, u - j * 0.04);
      pulses.push({ p: c.getPointAt(Math.min(1, uu)).toArray(), k: 1 - j * 0.22 });
    }
  };
  if (s.electric > 0.01) { along(C_ATRIA, 0.0, 0.14); along(C_LA, 0.0, 0.12); along(C_LEFT, 0.16, 0.32); along(C_RIGHT, 0.2, 0.32); }

  const blood: { p: number[]; c: string }[] = [];
  if (s.blood > 0.01) {
    const ch = (pts: number[][], n: number, color: string, seed: string, speed: number) => {
      const c = curveOf(pts);
      for (let i = 0; i < n; i++) {
        const u = (frame / speed + random(`${seed}${i}`)) % 1;
        const p = c.getPointAt(u);
        blood.push({ p: [p.x + (random(`${seed}x${i}`) - 0.5) * 0.1, p.y, p.z + (random(`${seed}z${i}`) - 0.5) * 0.1], c: color });
      }
    };
    // venosa: cava superior → aurícula derecha → ventrículo derecho → tronco pulmonar → pulmones
    ch([[-0.54, 1.6, 0.0], [-0.62, 0.9, 0.25], [-0.5, 0.3, 0.75], [-0.2, -0.4, 0.95], [0.15, 0.3, 0.9], [0.28, 0.85, 0.2], [0.27, 1.27, -0.2], [1.2, 1.3, -0.8]], 26, "#5A7BFF", "bb", 70);
    // arterial: venas pulmonares → aurícula izq. → ventrículo izq. → aorta → arco
    ch([[1.1, 0.95, -0.6], [0.4, 0.75, -0.3], [0.55, 0.1, 0.5], [0.5, -0.6, 0.75], [0.35, 0.0, 0.7], [0.18, 0.6, 0.35], [0.2, 1.2, 0.1], [0.45, 1.55, -0.25], [0.85, 1.4, -0.7], [0.9, 0.6, -0.8]], 30, "#FF3A4A", "br", 70);
  }
  const nervePaths = [[[-1.4, 3.0, 0.3], [-1.0, 2.2, 0.3], [-0.75, 1.4, 0.3], SA_NODE], [[0.2, 3.1, 0.4], [-0.2, 2.3, 0.4], [-0.5, 1.5, 0.35], SA_NODE], [[1.4, 2.9, 0.3], [0.9, 2.1, 0.4], [0.3, 1.2, 0.6], [0.0, 0.6, 0.85]]];
  const nerveGeo = useMemo(() => nervePaths.map((p) => {
    const c = curveOf(p);
    const pts = c.getSpacedPoints(30).map((q) => q.toArray());
    return { up: tube(pts.slice(0, 16), 0.022, 20), down: tube(pts.slice(15), 0.022, 20), mid: pts[15] };
  }), []);
  m.nerve.opacity = s.nerves * (1 - 0.85 * s.nerveCut);
  if (!G) return null;
  const around = (c: number[], k: number, children: React.ReactNode) => (
    <group position={c as any} scale={k}><group position={[-c[0], -c[1], -c[2]]}>{children}</group></group>
  );
  return (
    <group>
      {around(VENT_C, vScale, <>
        <mesh geometry={G.vent} material={m.myo} castShadow receiveShadow />
        <mesh geometry={G.vent} material={m.inner} />
        <mesh geometry={G.corA} material={m.corA} />
        <mesh geometry={G.corV} material={m.corV} />
        {s.open > 0.01 && <mesh geometry={G.valves} material={m.valve} />}
      </>)}
      {around(ATR_C, aScale, <>
        <mesh geometry={G.atria} material={m.atrium} castShadow />
        <mesh geometry={G.atria} material={m.inner} />
      </>)}
      <mesh geometry={G.aorta} material={m.aorta} castShadow />
      <mesh geometry={G.pulm} material={m.pulm} castShadow />
      <mesh geometry={G.pveins} material={m.pvein} />
      <mesh geometry={G.svc} material={m.vein} />
      <mesh geometry={G.ivc} material={m.vein} />
      {s.electric > 0.01 && wires.map((g, i) => <mesh key={i} geometry={g} material={m.wire} />)}
      {s.electric > 0.01 && <Glow position={SA_NODE} color="#5FE6FF" size={0.55 + 0.35 * a} opacity={s.electric} />}
      {s.electric > 0.01 && <Glow position={AV_NODE} color="#5FE6FF" size={0.35 + 0.25 * v} opacity={s.electric * 0.8} />}
      {pulses.map((q, i) => <Glow key={`p${i}`} position={q.p} color="#BFF6FF" size={0.32 * q.k} opacity={s.electric * q.k} />)}
      {blood.map((q, i) => <Glow key={`b${i}`} position={q.p} color={q.c} size={0.14} opacity={s.blood * 0.9} />)}
      {s.nerves > 0.01 && nerveGeo.map((n, i) => (
        <group key={`n${i}`}>
          <mesh geometry={n.up} material={m.nerve} position={[0, s.nerveCut * 0.5, 0]} />
          <mesh geometry={n.down} material={m.nerve} position={[0, -s.nerveCut * 0.15, 0]} />
          {s.nerveCut > 0.02 && s.nerveCut < 0.6 && <Glow position={n.mid} color="#FFE07A" size={0.6 * (1 - s.nerveCut)} opacity={1 - s.nerveCut * 1.5} />}
        </group>
      ))}
    </group>
  );
};
