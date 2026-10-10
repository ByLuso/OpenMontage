// Corazón procedural semirrealista: masa ventricular con punta hacia abajo-izquierda del paciente (+x en pantalla),
// aurículas, grandes vasos, coronarias, corte frontal con 4 cavidades, sistema eléctrico (nódulo sinusal → nódulo AV →
// haz de His → ramas) y flujo de sangre. Todo determinista (depende solo del frame / estado).
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";
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
export const SA_NODE = [-0.66, 1.18, 0.06];
export const AV_NODE = [-0.12, 0.42, 0.06];
const PATH_ATRIA = [SA_NODE, [-0.45, 0.95, 0.06], [-0.25, 0.65, 0.06], AV_NODE];
const PATH_LEFT = [AV_NODE, [0.02, 0.05, 0.07], [0.25, -0.5, 0.06], [0.45, -0.85, 0.05], [0.68, -0.45, 0.04], [0.72, 0.0, 0.03]];
const PATH_RIGHT = [[0.02, 0.05, 0.07], [-0.15, -0.4, 0.07], [-0.45, -0.3, 0.06], [-0.62, 0.05, 0.05]];
const PATH_LA = [SA_NODE, [-0.1, 1.15, 0.05], [0.35, 1.05, 0.04]];
const curveOf = (p: number[][]) => new THREE.CatmullRomCurve3(p.map((q) => new THREE.Vector3(...q)), false, "centripetal");
const C_ATRIA = curveOf(PATH_ATRIA), C_LEFT = curveOf(PATH_LEFT), C_RIGHT = curveOf(PATH_RIGHT), C_LA = curveOf(PATH_LA);

// grandes vasos
const AORTA = [[0.08, 0.7, -0.05], [0.02, 1.55, 0.05], [0.18, 2.15, -0.1], [0.62, 2.12, -0.42], [0.82, 1.55, -0.62], [0.82, 0.4, -0.72]];
const PULM = [[0.36, 0.78, 0.32], [0.42, 1.45, 0.3], [0.5, 1.75, 0.1]];
const PULM_L = [[0.5, 1.75, 0.1], [0.95, 1.85, -0.05], [1.45, 1.8, -0.15]];
const PULM_R = [[0.5, 1.75, 0.1], [0.05, 1.9, -0.15], [-0.6, 1.95, -0.3]];
const SVC = [[-0.72, 2.25, -0.12], [-0.7, 1.7, -0.1], [-0.68, 1.2, -0.1]];
const IVC = [[-0.55, -1.15, -0.25], [-0.58, -0.6, -0.22], [-0.6, -0.15, -0.2]];
export const VESSELS = { AORTA, PULM, PULM_L, SVC };

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
  const cl = [clip];
  const m = useMemo(() => {
    const tex = muscleTexture();
    const tissue = (color: string, em: string) => new THREE.MeshPhysicalMaterial({
      color, roughness: 0.38, clearcoat: 0.75, clearcoatRoughness: 0.25, sheen: 1, sheenColor: new THREE.Color("#FF8FA8"),
      sheenRoughness: 0.45, emissive: new THREE.Color(em), emissiveIntensity: 0.55, bumpMap: tex, bumpScale: 0.7, clippingPlanes: cl,
    });
    return {
      myo: tissue("#A8233D", "#3A0612"),
      atrium: tissue("#B9364F", "#3A0612"),
      cut: new THREE.MeshStandardMaterial({ color: "#8A1A2E", roughness: 0.65, side: THREE.BackSide, clippingPlanes: cl, emissive: new THREE.Color("#2A040C"), emissiveIntensity: 0.5 }),
      cavity: new THREE.MeshStandardMaterial({ color: "#3E0712", roughness: 0.5, side: THREE.BackSide, clippingPlanes: cl }),
      aorta: (() => { const x = tissue("#C8364A", "#4A0812"); x.clippingPlanes = []; return x; })(),
      venous: (() => { const x = tissue("#4B4FB8", "#10144A"); x.clippingPlanes = []; return x; })(),
      coronaryA: new THREE.MeshStandardMaterial({ color: "#E8505F", roughness: 0.3, emissive: new THREE.Color("#5A0A14"), emissiveIntensity: 0.6, clippingPlanes: cl }),
      coronaryV: new THREE.MeshStandardMaterial({ color: "#4A3A8A", roughness: 0.35, emissive: new THREE.Color("#1A0A3A"), emissiveIntensity: 0.5, clippingPlanes: cl }),
      valve: new THREE.MeshPhysicalMaterial({ color: "#F0C8D0", roughness: 0.3, clearcoat: 1, clippingPlanes: cl }),
      wire: new THREE.MeshStandardMaterial({ color: "#35C4F0", emissive: new THREE.Color("#35C4F0"), emissiveIntensity: 1.2, transparent: true }),
      shell: new THREE.MeshBasicMaterial({ color: "#5FE6FF", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide }),
      nerve: new THREE.MeshStandardMaterial({ color: "#FFD23F", emissive: new THREE.Color("#FFB020"), emissiveIntensity: 1.2, transparent: true }),
    };
  }, [clip]);

  const ventGeo = useMemo(() => {
    const g = mergeVertices(new THREE.IcosahedronGeometry(1, 6).deleteAttribute("normal").deleteAttribute("uv"));
    const p = g.getAttribute("position") as THREE.BufferAttribute;
    const uv = new Float32Array(p.count * 2);
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      uv[i * 2] = (Math.atan2(v.x, v.z) / Math.PI + 1) * 2; uv[i * 2 + 1] = v.y * 2;
      p.setXYZ(i, ...(ventricleShape(v.normalize()).toArray() as [number, number, number]));
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.computeVertexNormals();
    return g;
  }, []);
  const vessels = useMemo(() => ({
    aorta: tube(AORTA, 0.21), pulm: tube(PULM, 0.18), pulmL: tube(PULM_L, 0.13), pulmR: tube(PULM_R, 0.13),
    svc: tube(SVC, 0.16), ivc: tube(IVC, 0.17),
    branches: [[[0.15, 2.2, -0.12], [0.12, 2.6, -0.1]], [[0.35, 2.24, -0.25], [0.38, 2.62, -0.25]], [[0.55, 2.18, -0.38], [0.62, 2.55, -0.4]]].map((p) => tube(p, 0.07, 12)),
    pveins: [[[0.95, 1.05, -0.75], [0.6, 1.0, -0.6]], [[1.0, 0.75, -0.7], [0.65, 0.8, -0.55]], [[-0.1, 1.05, -0.85], [0.2, 1.0, -0.65]]].map((p) => tube(p, 0.08, 12)),
  }), []);
  const coronaries = useMemo(() => {
    const paths: { pts: number[][]; art: boolean }[] = [];
    const along = (a0: number, a1: number, y0: number, y1: number, n = 10) =>
      Array.from({ length: n }).map((_, k) => {
        const t = k / (n - 1), a = a0 + (a1 - a0) * t, y = y0 + (y1 - y0) * t;
        const c = Math.sqrt(Math.max(0, 1 - y * y));
        return ventriclePoint([Math.sin(a) * c, y, Math.cos(a) * c], 1.015).toArray();
      });
    paths.push({ pts: along(0.18, 0.45, 0.75, -0.9), art: true });   // descendente anterior
    paths.push({ pts: along(-0.9, -1.6, 0.6, 0.1), art: true });    // coronaria derecha
    paths.push({ pts: along(0.6, 1.4, 0.55, -0.4), art: true });     // circunfleja/marginal
    paths.push({ pts: along(0.05, 0.3, 0.7, -0.7), art: false });    // vena cardiaca
    paths.push({ pts: along(-0.4, -0.75, 0.4, -0.6), art: false });
    for (let i = 0; i < 6; i++) { // ramitas
      const a = -0.6 + random(`cb${i}`) * 1.5, y = 0.5 - random(`cy${i}`) * 0.9;
      paths.push({ pts: along(a, a + (random(`cd${i}`) - 0.5) * 0.5, y, y - 0.35, 6), art: i % 2 === 0 });
    }
    return paths.map((p) => ({ g: tube(p.pts, p.art ? 0.022 : 0.016, 30), art: p.art }));
  }, []);
  const wires = useMemo(() => [PATH_ATRIA, PATH_LEFT, PATH_RIGHT, PATH_LA].map((p) => tube(p, 0.009, 60)), []);

  const { a, v } = contraction(s.beatPhase);
  const vScale = 1 - 0.07 * v + 0.012 * a;
  const aScale = 1 - 0.12 * a;
  m.wire.opacity = s.electric;
  m.wire.emissiveIntensity = 1 + 2.5 * (a + v) * 0.5;
  m.shell.opacity = s.flash * 0.35;

  // pulsos eléctricos: recorren cada ruta según la fase del ciclo
  const pulses: { p: number[]; k: number }[] = [];
  const along = (c: THREE.CatmullRomCurve3, t0: number, t1: number) => {
    const u = (s.beatPhase - t0) / (t1 - t0);
    if (u >= 0 && u <= 1) for (let j = 0; j < 4; j++) {
      const uu = Math.max(0, u - j * 0.04);
      pulses.push({ p: c.getPointAt(Math.min(1, uu)).toArray(), k: 1 - j * 0.22 });
    }
  };
  if (s.electric > 0.01) { along(C_ATRIA, 0.0, 0.14); along(C_LA, 0.0, 0.12); along(C_LEFT, 0.16, 0.32); along(C_RIGHT, 0.2, 0.32); }

  // sangre: azul (derecha → pulmones) y roja (pulmones → cuerpo)
  const blood: { p: number[]; c: string }[] = [];
  if (s.blood > 0.01) {
    const ch = (pts: number[][], n: number, color: string, seed: string, speed: number) => {
      const c = curveOf(pts);
      for (let i = 0; i < n; i++) {
        const u = (frame / speed + random(`${seed}${i}`)) % 1;
        const p = c.getPointAt(u);
        blood.push({ p: [p.x + (random(`${seed}x${i}`) - 0.5) * 0.12, p.y, p.z + (random(`${seed}z${i}`) - 0.5) * 0.12], c: color });
      }
    };
    ch([[-0.7, 2.2, -0.12], [-0.66, 1.0, 0.0], [-0.4, 0.3, 0.05], [-0.35, -0.35, 0.05], [-0.05, 0.3, 0.1], [0.36, 0.9, 0.3], [0.45, 1.6, 0.25], [1.3, 1.8, -0.12]], 26, "#5A7BFF", "bb", 70);
    ch([[1.0, 1.0, -0.7], [0.5, 0.95, -0.45], [0.35, 0.4, -0.1], [0.4, -0.5, 0.0], [0.15, 0.1, 0.0], [0.05, 0.9, -0.02], [0.05, 1.6, 0.05], [0.4, 2.2, -0.25], [0.82, 1.4, -0.62], [0.82, 0.4, -0.72]], 30, "#FF3A4A", "br", 70);
  }

  // nervios (vago/simpáticos simplificados): bajan hacia el nódulo sinusal; al cortarse se separan y se apagan
  const nervePaths = [[[-1.4, 3.2, 0.1], [-1.0, 2.4, 0.1], [-0.75, 1.6, 0.08], SA_NODE], [[0.2, 3.3, 0.2], [-0.2, 2.5, 0.15], [-0.5, 1.7, 0.1], SA_NODE], [[1.4, 3.1, 0.0], [0.9, 2.3, 0.05], [0.3, 1.5, 0.08], [0.1, 1.0, 0.1]]];
  const nerveGeo = useMemo(() => nervePaths.map((p) => {
    const c = curveOf(p);
    const pts = c.getSpacedPoints(30).map((q) => q.toArray());
    return { up: tube(pts.slice(0, 16), 0.022, 20), down: tube(pts.slice(15), 0.022, 20), mid: pts[15] };
  }), []);
  m.nerve.opacity = s.nerves * (1 - 0.85 * s.nerveCut);

  return (
    <group>
      <group scale={vScale}>
        <mesh geometry={ventGeo} material={m.myo} rotation={[0, 0, TILT]} castShadow receiveShadow />
        <mesh geometry={ventGeo} material={m.cut} rotation={[0, 0, TILT]} />
        <mesh geometry={ventGeo} material={m.shell} rotation={[0, 0, TILT]} scale={1.06} />
        {/* cavidades ventriculares (se ven al abrir) */}
        <mesh material={m.cavity} position={[-0.38, -0.12, 0.05]} scale={[0.36, 0.62, 0.34]}><sphereGeometry args={[1, 32, 24]} /></mesh>
        <mesh material={m.cavity} position={[0.32, -0.28, -0.02]} scale={[0.3, 0.66, 0.3]} rotation={[0, 0, TILT * 0.8]}><sphereGeometry args={[1, 32, 24]} /></mesh>
        {coronaries.map((c, i) => <mesh key={i} geometry={c.g} material={c.art ? m.coronaryA : m.coronaryV} />)}
      </group>
      {/* aurículas */}
      <group position={[-0.68, 0.92, -0.08]} scale={aScale}>
        <mesh material={m.atrium} scale={[0.55, 0.5, 0.5]} castShadow><sphereGeometry args={[1, 40, 30]} /></mesh>
        <mesh material={m.cut} scale={[0.55, 0.5, 0.5]}><sphereGeometry args={[1, 40, 30]} /></mesh>
        <mesh material={m.cavity} scale={[0.42, 0.38, 0.38]}><sphereGeometry args={[1, 32, 24]} /></mesh>
        <mesh material={m.atrium} position={[0.25, 0.25, 0.32]} scale={[0.3, 0.18, 0.14]} rotation={[0.3, 0, -0.6]}><sphereGeometry args={[1, 24, 16]} /></mesh>
      </group>
      <group position={[0.42, 0.98, -0.48]} scale={aScale}>
        <mesh material={m.atrium} scale={[0.5, 0.42, 0.45]} castShadow><sphereGeometry args={[1, 40, 30]} /></mesh>
        <mesh material={m.cut} scale={[0.5, 0.42, 0.45]}><sphereGeometry args={[1, 40, 30]} /></mesh>
        <mesh material={m.cavity} scale={[0.38, 0.32, 0.34]}><sphereGeometry args={[1, 32, 24]} /></mesh>
        <mesh material={m.atrium} position={[0.15, 0.1, 0.42]} scale={[0.26, 0.15, 0.12]} rotation={[0.2, 0, 0.5]}><sphereGeometry args={[1, 24, 16]} /></mesh>
      </group>
      {/* válvulas auriculoventriculares (anillos visibles en el corte) */}
      <mesh material={m.valve} position={[-0.42, 0.45, 0.0]} rotation={[Math.PI / 2 - 0.3, 0, 0.2]}><torusGeometry args={[0.2, 0.03, 10, 30]} /></mesh>
      <mesh material={m.valve} position={[0.3, 0.52, -0.18]} rotation={[Math.PI / 2 - 0.3, 0, -0.2]}><torusGeometry args={[0.18, 0.03, 10, 30]} /></mesh>
      {/* grandes vasos */}
      <mesh geometry={vessels.aorta} material={m.aorta} castShadow />
      {vessels.branches.map((g, i) => <mesh key={i} geometry={g} material={m.aorta} />)}
      <mesh geometry={vessels.pulm} material={m.venous} castShadow />
      <mesh geometry={vessels.pulmL} material={m.venous} />
      <mesh geometry={vessels.pulmR} material={m.venous} />
      <mesh geometry={vessels.svc} material={m.venous} />
      <mesh geometry={vessels.ivc} material={m.venous} />
      {vessels.pveins.map((g, i) => <mesh key={i} geometry={g} material={m.aorta} />)}
      {/* sistema eléctrico */}
      {s.electric > 0.01 && wires.map((g, i) => <mesh key={i} geometry={g} material={m.wire} />)}
      {s.electric > 0.01 && <Glow position={SA_NODE} color="#5FE6FF" size={0.55 + 0.35 * a} opacity={s.electric} />}
      {s.electric > 0.01 && <Glow position={AV_NODE} color="#5FE6FF" size={0.35 + 0.25 * v} opacity={s.electric * 0.8} />}
      {pulses.map((q, i) => <Glow key={`p${i}`} position={q.p} color="#BFF6FF" size={0.32 * q.k} opacity={s.electric * q.k} />)}
      {blood.map((q, i) => <Glow key={`b${i}`} position={q.p} color={q.c} size={0.14} opacity={s.blood * 0.9} />)}
      {/* nervios */}
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
