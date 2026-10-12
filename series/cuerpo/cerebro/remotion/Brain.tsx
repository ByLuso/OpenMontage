// Cerebro procedural: hemisferios con circunvoluciones (ruido "plegado"), cisura interhemisférica, cerebelo y tronco;
// chispas en la superficie y red neuronal interior visible en modo translúcido.
// Secundario: neurona (soma, dendritas, axón mielinizado, terminales) + sinapsis con la neurona siguiente.
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";
import { useModel } from "./Model";

/** Pliegues: franjas serpenteantes (dominio deformado) → surcos estrechos entre circunvoluciones anchas; 1 = cresta, 0 = surco. */
/** Muestra n vértices (deterministas) de una geometría, desplazados un poco hacia fuera por la normal. */
function sample(geo: THREE.BufferGeometry, n: number, seed: string, push = 0.03) {
  const p = geo.getAttribute("position") as THREE.BufferAttribute, nr = geo.getAttribute("normal") as THREE.BufferAttribute;
  const out: number[][] = [];
  for (let i = 0; i < n; i++) {
    const k = Math.floor(random(`${seed}${i}`) * p.count);
    out.push([p.getX(k) + nr.getX(k) * push, p.getY(k) + nr.getY(k) * push, p.getZ(k) + nr.getZ(k) * push]);
  }
  return out;
}

export type BrainState = { xray: number; sparks: number; frame: number; flash: number };

/** Cerebro real (BodyParts3D): hemisferios con sus circunvoluciones, cerebelo, tronco y estructuras internas. */
export const Brain: React.FC<{ s: BrainState }> = ({ s }) => {
  const G = useModel("cerebro.glb");
  const m = useMemo(() => ({
    cortex: new THREE.MeshPhysicalMaterial({ color: "#F0A8AE", roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.7, sheenRoughness: 0.5, sheenColor: new THREE.Color("#FFD6DE"), emissive: new THREE.Color("#3A0E18"), emissiveIntensity: 0.35, transparent: true, vertexColors: true }),
    cereb: new THREE.MeshPhysicalMaterial({ color: "#D9949C", roughness: 0.45, clearcoat: 0.35, sheen: 0.7, sheenColor: new THREE.Color("#FFD0DA"), emissive: new THREE.Color("#3A0E18"), emissiveIntensity: 0.35, transparent: true, vertexColors: true }),
    stem: new THREE.MeshPhysicalMaterial({ color: "#E8C2B8", roughness: 0.45, clearcoat: 0.4, emissive: new THREE.Color("#2A1410"), emissiveIntensity: 0.3, transparent: true, vertexColors: true }),
    inner: new THREE.MeshPhysicalMaterial({ color: "#5FE6FF", roughness: 0.3, emissive: new THREE.Color("#1A6A80"), emissiveIntensity: 0.8, transparent: true, depthWrite: false }),
  }), []);
  const op = 1 - 0.82 * s.xray;
  [m.cortex, m.cereb, m.stem].forEach((x) => { x.opacity = op; x.depthWrite = s.xray < 0.3; });
  m.cortex.emissiveIntensity = 0.35 + s.flash * 0.45;
  m.inner.opacity = 0.35 * s.xray;
  const pts = useMemo(() => G ? { surf: sample(G.cortexL, 40, "sl").concat(sample(G.cortexR, 40, "sr")), nodes: sample(G.inner, 70, "in", 0) } : null, [G]);
  const net = useMemo(() => {
    if (!pts) return null;
    const nodes = pts.nodes, edges: [number, number][] = [];
    nodes.forEach((a, i) => {
      nodes.map((b, j) => [j, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])] as [number, number]).filter(([j]) => j !== i).sort((x, y) => x[1] - y[1]).slice(0, 3)
        .forEach(([j]) => { if (i < j) edges.push([i, j]); });
    });
    const geo = new THREE.BufferGeometry(); const pos: number[] = [];
    edges.forEach(([i, j]) => pos.push(...nodes[i], ...nodes[j]));
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return { nodes, edges, geo };
  }, [pts]);
  const lineMat = useMemo(() => new THREE.LineBasicMaterial({ color: "#5FE6FF", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  lineMat.opacity = 0.6 * s.xray;
  if (!G || !pts || !net) return null;
  const f = s.frame;
  const sparks: React.ReactNode[] = [];
  if (s.sparks > 0.01) pts.surf.forEach((p, i) => {
    const cyc = 18 + Math.floor(random(`sc${i}`) * 22);
    const ph = (f + Math.floor(random(`so${i}`) * cyc)) % cyc;
    const a = ph < 6 ? Math.sin((ph / 6) * Math.PI) : 0;
    if (a <= 0) return;
    sparks.push(<Glow key={`s${i}`} position={p} color={i % 4 === 0 ? "#FFD23F" : "#8FE6FF"} size={0.5} opacity={Math.min(1, a * 1.3) * s.sparks} />);
    sparks.push(<Glow key={`c${i}`} position={p} color="#FFFFFF" size={0.14} opacity={a * s.sparks} />);
  });
  const pulses: React.ReactNode[] = [];
  if (s.xray > 0.05) net.edges.forEach(([i, j], k) => {
    if (k % 2) return;
    const u = (f / 20 + random(`e${k}`)) % 1, a = net.nodes[i], b = net.nodes[j];
    pulses.push(<Glow key={`p${k}`} position={[a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]} color="#BFF6FF" size={0.12} opacity={s.xray} />);
  });
  return (
    <group>
      <mesh geometry={G.cortexL} material={m.cortex} castShadow />
      <mesh geometry={G.cortexR} material={m.cortex} castShadow />
      <mesh geometry={G.cerebellum} material={m.cereb} />
      <mesh geometry={G.stem} material={m.stem} />
      {s.xray > 0.01 && <mesh geometry={G.inner} material={m.inner} />}
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

/** Tubo que se estrecha de r0 a r1 a lo largo de una curva suave. */
function taper(pts: number[][], r0: number, r1: number, seg = 48, radial = 12) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "centripetal");
  const fr = curve.computeFrenetFrames(seg, false);
  const pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const u = i / seg, c = curve.getPointAt(u), r = r0 + (r1 - r0) * Math.pow(u, 0.8);
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2, n = fr.normals[i].clone().multiplyScalar(Math.cos(a)).add(fr.binormals[i].clone().multiplyScalar(Math.sin(a)));
      pos.push(c.x + n.x * r, c.y + n.y * r, c.z + n.z * r);
    }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < radial; j++) {
    const k = i * (radial + 1) + j; idx.push(k, k + radial + 1, k + 1, k + 1, k + radial + 1, k + radial + 2);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

/** Árbol dendrítico: ramas que se bifurcan y adelgazan. */
function dendrites(center: number[], seed: string, n: number, len: number) {
  const out: THREE.BufferGeometry[] = [];
  const grow = (start: number[], dir: number[], L: number, r0: number, depth: number, key: string) => {
    const pts = [start]; let p = [...start], d = [...dir];
    for (let k = 1; k <= 4; k++) {
      d = [d[0] + (random(`${key}x${k}`) - 0.5) * 0.5, d[1] + (random(`${key}y${k}`) - 0.5) * 0.5, d[2] + (random(`${key}z${k}`) - 0.5) * 0.3];
      const m = Math.hypot(d[0], d[1], d[2]); d = d.map((v) => v / m);
      p = [p[0] + d[0] * L / 4, p[1] + d[1] * L / 4, p[2] + d[2] * L / 4]; pts.push(p);
    }
    const r1 = Math.max(0.012, r0 * 0.45);
    out.push(taper(pts, r0, r1, 32, 10));
    if (depth > 0) [0.55, 1.0].forEach((t, bi) => {
      const at = pts[Math.round(t * 4)];
      const nd = [d[0] + (bi ? 0.7 : -0.7) * d[1], d[1] - (bi ? 0.7 : -0.7) * d[0], d[2] + (random(`${key}b${bi}`) - 0.5)];
      grow(at, nd, L * 0.62, r1 * (bi ? 1 : 0.85), depth - 1, `${key}${bi}`);
    });
  };
  for (let i = 0; i < n; i++) {
    const a = random(`${seed}a${i}`) * Math.PI * 2, e = (random(`${seed}e${i}`) - 0.5) * 1.4;
    grow(center, [Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e) * 0.6], len * 0.55, 0.11, 2, `${seed}${i}`);
  }
  return out;
}

/** Soma orgánico (piramidal, con relieve suave). */
function somaGeo(seed: string, r: number) {
  const g = new THREE.IcosahedronGeometry(r, 24);
  const p = g.getAttribute("position") as THREE.BufferAttribute; const v = new THREE.Vector3();
  const k1 = random(`${seed}k`) * 6;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const n = 1 + 0.12 * Math.sin(v.x * 3.1 + k1) * Math.sin(v.y * 2.7 + k1 * 0.5) + 0.06 * Math.sin(v.z * 5 + v.x * 4);
    const apex = v.y > 0 ? 1 + 0.35 * Math.pow(v.y, 3) : 1 - 0.1 * v.y * v.y;
    p.setXYZ(i, v.x * r * n, v.y * r * n * apex, v.z * r * n * 0.85);
  }
  g.computeVertexNormals(); return g;
}

export type NeuronState = { signal: number; release: number; nextOn: number; frame: number; showNet: number };

export const Neurons: React.FC<{ s: NeuronState }> = ({ s }) => {
  const m = useMemo(() => ({
    cell: new THREE.MeshPhysicalMaterial({ color: "#E58FB0", roughness: 0.38, clearcoat: 0.6, sheen: 1, sheenColor: new THREE.Color("#FFC2D8"), emissive: new THREE.Color("#4A0F2A"), emissiveIntensity: 0.6 }),
    cellB: new THREE.MeshPhysicalMaterial({ color: "#E58FB0", roughness: 0.3, clearcoat: 1, sheen: 1, sheenColor: new THREE.Color("#FFC2D8"), emissive: new THREE.Color("#4A0F2A"), emissiveIntensity: 0.6 }),
    myelin: new THREE.MeshPhysicalMaterial({ color: "#F4E6D8", roughness: 0.25, clearcoat: 1, sheen: 1, sheenColor: new THREE.Color("#FFFFFF") }),
    nucleus: new THREE.MeshPhysicalMaterial({ color: "#9A3A6A", roughness: 0.4, transparent: true, opacity: 0.55, emissive: new THREE.Color("#3A0A28"), emissiveIntensity: 0.5 }),
    cellT: new THREE.MeshPhysicalMaterial({ color: "#E58FB0", roughness: 0.38, clearcoat: 0.6, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, emissive: new THREE.Color("#4A0F2A"), emissiveIntensity: 0.6 }),
    ves: new THREE.MeshStandardMaterial({ color: "#FFD23F", emissive: new THREE.Color("#C08A00"), emissiveIntensity: 0.8 }),
    bg: new THREE.MeshPhysicalMaterial({ color: "#B06A90", roughness: 0.4, transparent: true, opacity: 0.35, depthWrite: false }),
  }), []);
  m.cellB.emissive.set(s.nextOn > 0.05 ? "#1A86B0" : "#4A0F2A");
  m.cellB.emissiveIntensity = 0.6 + 0.4 * s.nextOn;
  const g = useMemo(() => ({
    dendA: dendrites(SOMA_A, "dA", 7, 1.6),
    dendB: dendrites(SOMA_B, "dB", 6, 1.4),
    somaA: somaGeo("sa", 0.36), somaB: somaGeo("sb", 0.34),
    hillock: taper([[SOMA_A[0] + 0.18, SOMA_A[1] - 0.18, 0], [-2.0, 0.42, 0], AXON[0]], 0.16, 0.05, 16, 16),
    axon: taper(AXON, 0.055, 0.045, 120, 14),
    toB: taper([[2.38, -0.45, 0], [2.7, -0.7, 0], [3.1, -1.1, 0], SOMA_B], 0.05, 0.12, 40, 12),
    // botón presináptico (pera) y espina postsináptica (copa), eje +X
    bouton: (() => { const g = new THREE.LatheGeometry([[0.045, 0], [0.05, 0.05], [0.08, 0.12], [0.14, 0.2], [0.17, 0.28], [0.175, 0.34], [0.16, 0.38], [0.12, 0.405], [0.06, 0.418], [0.001, 0.42]].map(([r, h]) => new THREE.Vector2(r, h)), 48); g.rotateZ(-Math.PI / 2); g.translate(1.6, -0.45, 0); return g; })(),
    spine: (() => { const g = new THREE.LatheGeometry([[0.001, 0], [0.07, 0.004], [0.12, 0.02], [0.14, 0.06], [0.13, 0.12], [0.08, 0.18], [0.05, 0.24], [0.05, 0.32]].map(([r, h]) => new THREE.Vector2(r, h)), 48); g.rotateZ(-Math.PI / 2); g.translate(2.08, -0.45, 0); return g; })(),
    bgCells: Array.from({ length: 5 }).map((_, i) => ({ p: [-4 + i * 2.1, 2.2 - (i % 2) * 4.2, -2.5], soma: somaGeo(`bs${i}`, 0.28), d: dendrites([-4 + i * 2.1, 2.2 - (i % 2) * 4.2, -2.5], `bg${i}`, 5, 1.5) })),
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
    nt.push(<Glow key={`nt${i}`} position={[2.03 + life * 0.08, y0 * 0.6 - 0.18, z0 * 0.6]} color="#FFD23F" size={0.07} opacity={s.release * Math.sin(Math.PI * life)} />);
  }
  return (
    <group>
      {s.showNet > 0.01 && g.bgCells.map((c, i) => (
        <group key={i}>
          <mesh material={m.bg} position={c.p as any} geometry={c.soma} />
          {c.d.map((d, j) => <mesh key={j} geometry={d} material={m.bg} />)}
        </group>
      ))}
      <mesh material={m.cell} position={SOMA_A as any} geometry={g.somaA} />
      <mesh material={m.nucleus} position={[SOMA_A[0] + 0.05, SOMA_A[1] + 0.03, 0.24]}><sphereGeometry args={[0.12, 24, 16]} /></mesh>
      <mesh geometry={g.hillock} material={m.cell} />
      {g.dendA.map((d, i) => <mesh key={i} geometry={d} material={m.cell} />)}
      <mesh geometry={g.axon} material={m.cell} />
      {sheaths.map((sh, i) => <mesh key={i} material={m.myelin} position={sh.p as any} quaternion={sh.q}><capsuleGeometry args={[0.1, 0.27, 10, 24]} /></mesh>)}
      <mesh geometry={g.bouton} material={m.cellT} />
      {/* vesículas con neurotransmisores en el botón terminal */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`v${i}`} material={m.ves} position={[1.84 + (i % 3) * 0.05, -0.45 + (i - 2.5) * 0.045, (i % 2 - 0.5) * 0.08]} scale={1 - 0.7 * s.release}><sphereGeometry args={[0.022, 10, 8]} /></mesh>
      ))}
      {/* neurona siguiente */}
      <mesh geometry={g.toB} material={m.cellB} />
      <mesh geometry={g.spine} material={m.cellB} />
      <mesh material={m.cellB} position={SOMA_B as any} geometry={g.somaB} />
      {g.dendB.map((d, i) => <mesh key={i} geometry={d} material={m.cellB} />)}
      {pulse && <Glow position={pulse} color="#BFF6FF" size={0.55} opacity={1} />}
      {pulse && <Glow position={pulse} color="#5FE6FF" size={1.1} opacity={0.5} />}
      {s.nextOn > 0.01 && <Glow position={SOMA_B} color="#5FE6FF" size={1.4} opacity={s.nextOn * 0.35} />}
      {nt}
    </group>
  );
};
