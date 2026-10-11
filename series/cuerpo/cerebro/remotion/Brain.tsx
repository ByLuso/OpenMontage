// Cerebro procedural: hemisferios con circunvoluciones (ruido "plegado"), cisura interhemisférica, cerebelo y tronco;
// chispas en la superficie y red neuronal interior visible en modo translúcido.
// Secundario: neurona (soma, dendritas, axón mielinizado, terminales) + sinapsis con la neurona siguiente.
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Pliegues: franjas serpenteantes (dominio deformado) → surcos estrechos entre circunvoluciones anchas; 1 = cresta, 0 = surco. */
function folds(x: number, y: number, z: number) {
  const w1 = 2.2 * Math.sin(3.3 * y + 1.7 * x) + 1.8 * Math.sin(2.9 * z - 2.1 * y + 1) + 1.4 * Math.sin(4.1 * x + 3.7 * z + 2);
  const p1 = 5.8 * (0.55 * x + 0.3 * y + 0.78 * z) + w1;
  const p2 = 3.6 * (0.2 * x + 0.95 * y - 0.25 * z) + 1.2 * Math.sin(2.3 * z + 0.7) + 0.9 * Math.sin(3.1 * x - 1.3 * z);
  return Math.min(Math.abs(Math.sin(p1)), Math.pow(Math.abs(Math.sin(p2)), 0.6));
}

function hemisphereGeo(side: number) {
  const g = mergeVertices(new THREE.IcosahedronGeometry(1, 96).deleteAttribute("normal").deleteAttribute("uv"));
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  const col = new Float32Array(p.count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let x = v.x * 0.66, y = v.y * 0.8, z = v.z * 1.3;
    if (side * v.x < 0) x *= 0.25;                               // cara medial plana (cisura)
    if (v.y < -0.3) { y = -0.3 * 0.8 + (v.y + 0.3) * 0.45; }     // base más plana
    if (v.z < -0.3 && v.y < 0) y += 0.15 * (v.z + 0.3);            // lóbulo occipital algo caído
    const medial = side * v.x < 0 ? 0.35 : 1;
    const g = folds(v.x, v.y, v.z), f = Math.sqrt(g);
    const k = 1 + 0.15 * (f - 1) * medial;
    p.setXYZ(i, side * 0.05 + x * k, y * k, z * k);
    const sm = Math.min(1, Math.max(0, (g - 0.04) / 0.4)), c = 0.16 + 0.84 * (1 - (1 - sm * sm * (3 - 2 * sm)) * medial);               // surcos oscuros
    col[i * 3] = c; col[i * 3 + 1] = c * 0.92; col[i * 3 + 2] = c * 0.95;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

function cerebellumGeo() {
  const g = mergeVertices(new THREE.IcosahedronGeometry(1, 48).deleteAttribute("normal").deleteAttribute("uv"));
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const strip = 1 + 0.06 * Math.pow(Math.abs(Math.sin(v.y * 22 + v.z * 3)), 0.5);  // láminas finas horizontales
    p.setXYZ(i, v.x * 0.6 * strip, v.y * 0.3 * strip, v.z * 0.42 * strip);
  }
  g.computeVertexNormals();
  return g;
}

export type BrainState = { xray: number; sparks: number; frame: number; flash: number };

export const Brain: React.FC<{ s: BrainState }> = ({ s }) => {
  const geoL = useMemo(() => hemisphereGeo(1), []);
  const geoR = useMemo(() => hemisphereGeo(-1), []);
  const cb = useMemo(() => cerebellumGeo(), []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#E2A1AE", roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3, sheen: 0.4, sheenColor: new THREE.Color("#FFD0DC"),
    emissive: new THREE.Color("#4A1424"), emissiveIntensity: 0.5, transparent: true, vertexColors: true,
  }), []);
  const cbMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#D89AA6", roughness: 0.45, clearcoat: 0.5, sheen: 1, sheenColor: new THREE.Color("#FFD0DC"), emissive: new THREE.Color("#4A1424"), emissiveIntensity: 0.5, transparent: true }), []);
  cbMat.opacity = 1 - 0.8 * s.xray;
  mat.opacity = 1 - 0.8 * s.xray;
  mat.depthWrite = s.xray < 0.3;
  mat.emissive.set("#4A1424");
  mat.emissiveIntensity = 0.25 + s.flash * 0.6;
  const stem = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#D8A0A8", roughness: 0.4, clearcoat: 0.6, transparent: true }), []);
  stem.opacity = mat.opacity;
  // red interior: nodos (neuronas) y conexiones
  const net = useMemo(() => {
    const nodes: number[][] = [];
    for (let i = 0; i < 70; i++) {
      const th = random(`nt${i}`) * Math.PI * 2, ph = Math.acos(2 * random(`np${i}`) - 1), r = 0.3 + random(`nr${i}`) * 0.55;
      nodes.push([Math.sin(ph) * Math.cos(th) * r * 1.1, Math.cos(ph) * r * 0.75 + 0.1, Math.sin(ph) * Math.sin(th) * r * 1.3]);
    }
    const edges: [number, number][] = [];
    nodes.forEach((a, i) => {
      const near = nodes.map((b, j) => [j, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])] as [number, number]).filter(([j]) => j !== i).sort((x, y) => x[1] - y[1]).slice(0, 3);
      near.forEach(([j]) => { if (i < j) edges.push([i, j]); });
    });
    const geo = new THREE.BufferGeometry();
    const pos: number[] = [];
    edges.forEach(([i, j]) => pos.push(...nodes[i], ...nodes[j]));
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return { nodes, edges, geo };
  }, []);
  const lineMat = useMemo(() => new THREE.LineBasicMaterial({ color: "#5FE6FF", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  lineMat.opacity = 0.55 * s.xray;
  const f = s.frame;
  // chispas en la superficie: destellos breves en puntos aleatorios
  const sparks: React.ReactNode[] = [];
  if (s.sparks > 0.01) for (let i = 0; i < 60; i++) {
    const cyc = 18 + Math.floor(random(`sc${i}`) * 22);
    const ph = (f + Math.floor(random(`so${i}`) * cyc)) % cyc;
    const a = ph < 6 ? Math.sin((ph / 6) * Math.PI) : 0;
    if (a <= 0) continue;
    const seed = Math.floor((f + Math.floor(random(`so${i}`) * cyc)) / cyc);
    const th = random(`sx${i}-${seed}`) * Math.PI * 2, phi = Math.acos(2 * random(`sy${i}-${seed}`) - 1);
    const p = [Math.sin(phi) * Math.cos(th) * 0.74, Math.cos(phi) * 0.95 * (Math.cos(phi) < -0.3 ? 0.65 : 1), Math.sin(phi) * Math.sin(th) * 1.42];
    sparks.push(<Glow key={`s${i}`} position={p} color={i % 4 === 0 ? "#FFD23F" : "#8FE6FF"} size={0.55} opacity={Math.min(1, a * 1.3) * s.sparks} />);
    sparks.push(<Glow key={`c${i}`} position={p} color="#FFFFFF" size={0.16} opacity={a * s.sparks} />);
  }
  // pulsos por la red interior
  const pulses: React.ReactNode[] = [];
  if (s.xray > 0.05) net.edges.forEach(([i, j], k) => {
    if (k % 2) return;
    const u = (f / 20 + random(`e${k}`)) % 1;
    const a = net.nodes[i], b = net.nodes[j];
    pulses.push(<Glow key={`p${k}`} position={[a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]} color="#BFF6FF" size={0.12} opacity={s.xray} />);
  });
  return (
    <group rotation={[0, 0, 0]}>
      <mesh geometry={geoL} material={mat} castShadow />
      <mesh geometry={geoR} material={mat} castShadow />
      <mesh geometry={cb} material={cbMat} position={[0, -0.42, -0.9]} rotation={[0.25, 0, 0]} />
      <mesh material={stem} position={[0, -0.72, -0.4]} rotation={[0.35, 0, 0]}><cylinderGeometry args={[0.13, 0.09, 0.7, 20]} /></mesh>
      {s.xray > 0.01 && <lineSegments geometry={net.geo} material={lineMat} />}
      {s.xray > 0.01 && net.nodes.map((n, i) => <Glow key={`n${i}`} position={n} color="#5FE6FF" size={0.1} opacity={s.xray * 0.8} />)}
      {pulses}
      {sparks}
    </group>
  );
};

// ---------------- neurona y sinapsis ----------------
const tube = (pts: number[][], r: number, seg = 40) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "centripetal"), seg, r, 12, false);
export const SOMA_A = [-2.2, 0.6, 0];
export const AXON = [[-1.9, 0.35, 0], [-1.2, 0.1, 0.1], [-0.3, 0.0, 0], [0.6, -0.2, -0.05], [1.4, -0.35, 0], [1.85, -0.43, 0]];
export const SYN = [2.05, -0.45, 0];
export const SOMA_B = [3.5, -1.5, 0];

function dendrites(center: number[], seed: string, n: number, len: number) {
  const out: number[][][] = [];
  for (let i = 0; i < n; i++) {
    const a = random(`${seed}a${i}`) * Math.PI * 2, e = (random(`${seed}e${i}`) - 0.5) * 1.2;
    const d = [Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e) * 0.6];
    const pts = [center];
    let p = [...center];
    for (let k = 1; k <= 4; k++) {
      p = [p[0] + d[0] * len * 0.25 + (random(`${seed}${i}x${k}`) - 0.5) * 0.15, p[1] + d[1] * len * 0.25 + (random(`${seed}${i}y${k}`) - 0.5) * 0.15, p[2] + d[2] * len * 0.25];
      pts.push(p);
    }
    out.push(pts);
    // rama secundaria
    const mid = pts[2];
    out.push([mid, [mid[0] + d[1] * 0.4, mid[1] - d[0] * 0.4, mid[2] + 0.1], [mid[0] + d[1] * 0.7 + d[0] * 0.2, mid[1] - d[0] * 0.6, mid[2] + 0.15]]);
  }
  return out;
}

export type NeuronState = { signal: number; release: number; nextOn: number; frame: number; showNet: number };

export const Neurons: React.FC<{ s: NeuronState }> = ({ s }) => {
  const m = useMemo(() => ({
    cell: new THREE.MeshPhysicalMaterial({ color: "#E58FB0", roughness: 0.3, clearcoat: 1, sheen: 1, sheenColor: new THREE.Color("#FFC2D8"), emissive: new THREE.Color("#4A0F2A"), emissiveIntensity: 0.6 }),
    cellB: new THREE.MeshPhysicalMaterial({ color: "#E58FB0", roughness: 0.3, clearcoat: 1, sheen: 1, sheenColor: new THREE.Color("#FFC2D8"), emissive: new THREE.Color("#4A0F2A"), emissiveIntensity: 0.6 }),
    myelin: new THREE.MeshPhysicalMaterial({ color: "#F4E6D8", roughness: 0.25, clearcoat: 1, sheen: 1, sheenColor: new THREE.Color("#FFFFFF") }),
    ves: new THREE.MeshStandardMaterial({ color: "#FFD23F", emissive: new THREE.Color("#C08A00"), emissiveIntensity: 0.8 }),
    bg: new THREE.MeshPhysicalMaterial({ color: "#B06A90", roughness: 0.4, transparent: true, opacity: 0.35, depthWrite: false }),
  }), []);
  m.cellB.emissive.set(s.nextOn > 0.05 ? "#35C4F0" : "#4A0F2A");
  m.cellB.emissiveIntensity = 0.6 + 1.6 * s.nextOn;
  const g = useMemo(() => ({
    dendA: dendrites(SOMA_A, "dA", 7, 1.5).map((p) => tube(p, 0.045)),
    dendB: dendrites(SOMA_B, "dB", 6, 1.3).map((p) => tube(p, 0.045)),
    axon: tube(AXON, 0.05, 80),
    toB: tube([[2.25, -0.47, 0], [2.6, -0.7, 0], [3.1, -1.1, 0], SOMA_B], 0.06),
    terms: [[[1.85, -0.43, 0], [2.0, -0.3, 0.1]], [[1.85, -0.43, 0], [2.0, -0.45, 0]], [[1.85, -0.43, 0], [1.98, -0.6, -0.1]]].map((p) => tube(p, 0.035, 8)),
    bgCells: Array.from({ length: 5 }).map((_, i) => ({ p: [-4 + i * 2.1, 2.2 - (i % 2) * 4.2, -2.5], d: dendrites([-4 + i * 2.1, 2.2 - (i % 2) * 4.2, -2.5], `bg${i}`, 5, 1.4).map((q) => tube(q, 0.04)) })),
  }), []);
  const axonCurve = useMemo(() => new THREE.CatmullRomCurve3(AXON.map((p) => new THREE.Vector3(...p))), []);
  // vainas de mielina a lo largo del axón (con nódulos de Ranvier entre ellas)
  const sheaths = useMemo(() => Array.from({ length: 8 }).map((_, i) => {
    const u = 0.08 + i * 0.11;
    const p = axonCurve.getPointAt(u), t = axonCurve.getTangentAt(u);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), t);
    return { p: p.toArray(), q };
  }), []);
  // pulso eléctrico por el axón (saltando de nódulo en nódulo)
  const pulse = s.signal > 0 && s.signal < 1 ? axonCurve.getPointAt(Math.min(1, s.signal)).toArray() : null;
  // neurotransmisores cruzando la hendidura sináptica
  const nt: React.ReactNode[] = [];
  if (s.release > 0.01) for (let i = 0; i < 26; i++) {
    const life = (s.frame / 26 + random(`nt${i}`)) % 1;
    const y0 = -0.45 + (random(`ny${i}`) - 0.5) * 0.3, z0 = (random(`nz${i}`) - 0.5) * 0.3;
    nt.push(<Glow key={`nt${i}`} position={[2.03 + life * 0.2, y0, z0]} color="#FFD23F" size={0.07} opacity={s.release * Math.sin(Math.PI * life)} />);
  }
  return (
    <group>
      {s.showNet > 0.01 && g.bgCells.map((c, i) => (
        <group key={i}>
          <mesh material={m.bg} position={c.p as any}><sphereGeometry args={[0.3, 16, 12]} /></mesh>
          {c.d.map((d, j) => <mesh key={j} geometry={d} material={m.bg} />)}
        </group>
      ))}
      <mesh material={m.cell} position={SOMA_A as any}><icosahedronGeometry args={[0.38, 3]} /></mesh>
      <mesh material={m.cell} position={[SOMA_A[0] + 0.08, SOMA_A[1] + 0.05, 0.3]}><sphereGeometry args={[0.13, 16, 12]} /></mesh>
      {g.dendA.map((d, i) => <mesh key={i} geometry={d} material={m.cell} />)}
      <mesh geometry={g.axon} material={m.cell} />
      {sheaths.map((sh, i) => <mesh key={i} material={m.myelin} position={sh.p as any} quaternion={sh.q}><capsuleGeometry args={[0.11, 0.26, 6, 16]} /></mesh>)}
      {g.terms.map((t, i) => <mesh key={i} geometry={t} material={m.cell} />)}
      {[[2.0, -0.3, 0.1], [2.0, -0.45, 0], [1.98, -0.6, -0.1]].map((p, i) => <mesh key={i} material={m.cell} position={p as any}><sphereGeometry args={[0.07, 16, 12]} /></mesh>)}
      {/* vesículas con neurotransmisores en el botón terminal */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`v${i}`} material={m.ves} position={[1.96 + (i % 2) * 0.03, -0.45 + (i - 2.5) * 0.04, (i % 3 - 1) * 0.03]} scale={1 - 0.7 * s.release}><sphereGeometry args={[0.022, 10, 8]} /></mesh>
      ))}
      {/* neurona siguiente */}
      <mesh geometry={g.toB} material={m.cellB} />
      <mesh material={m.cellB} position={[2.22, -0.47, 0]}><sphereGeometry args={[0.08, 16, 12]} /></mesh>
      <mesh material={m.cellB} position={SOMA_B as any}><icosahedronGeometry args={[0.36, 3]} /></mesh>
      {g.dendB.map((d, i) => <mesh key={i} geometry={d} material={m.cellB} />)}
      {pulse && <Glow position={pulse} color="#BFF6FF" size={0.55} opacity={1} />}
      {pulse && <Glow position={pulse} color="#5FE6FF" size={1.1} opacity={0.5} />}
      {s.nextOn > 0.01 && <Glow position={SOMA_B} color="#5FE6FF" size={1.6} opacity={s.nextOn * 0.7} />}
      {nt}
    </group>
  );
};
