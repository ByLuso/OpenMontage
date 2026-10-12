// Hígado procedural (vista anterior: lóbulo derecho grande a -X, izquierdo afilado a +X) con vesícula, vena porta,
// arteria hepática, colédoco y cava; seccionable en X (parte donada) con "fantasma" de lo que falta y regeneración.
// Secundario: lobulillo hepático hexagonal (vena central, tríadas portales, cordones de hepatocitos, sinusoides, bilis).
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";
import { Flow } from "./kit3d/Flow";
import { tubeGeo, roundedBox } from "./kit3d/Parts";
import { useModel } from "./Model";

export const PORTAL = [[0.15, -2.6, 0.25], [0.1, -1.9, 0.2], [0.03, -1.3, 0.12], [-0.01, -0.95, 0.09]];
export const GALL = [-0.82, -0.81, 0.71];
export const CUT_X = -0.2;
const X0 = -2.35, X1 = 0.0;   // extensión en X del lóbulo derecho (donado)

export type LiverState = { cut: number; ghost: number; portal: number; regrow: number; glow: number; frame: number };

/** Hígado real (BodyParts3D): segmentos V–VIII (lóbulo derecho, parte donable) y II–IV + caudado (lo que queda),
 *  con vena porta, arterias, vías biliares, venas hepáticas, vesícula y cava. */
export const Liver: React.FC<{ s: LiverState }> = ({ s }) => {
  const G = useModel("higado.glb");
  const keep = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 5), []);     // x >= c visible
  const gone = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), -5), []);   // x <= c (fantasma)
  const c = X0 + s.cut * (X1 - X0);
  keep.constant = -c; gone.constant = c;
  const m = useMemo(() => {
    const tissue = (clip: THREE.Plane[]) => new THREE.MeshPhysicalMaterial({ color: "#9A3230", roughness: 0.3, clearcoat: 0.85, clearcoatRoughness: 0.18, sheen: 0.6, sheenColor: new THREE.Color("#FF9A8A"), emissive: new THREE.Color("#3A0808"), emissiveIntensity: 0.45, vertexColors: true, transparent: true, clippingPlanes: clip });
    return {
      remnant: tissue([]), donated: tissue([keep]),
      inside: new THREE.MeshStandardMaterial({ color: "#5A1416", roughness: 0.7, side: THREE.BackSide, emissive: new THREE.Color("#3A0606"), emissiveIntensity: 0.6, clippingPlanes: [keep] }),
      ghost: new THREE.MeshBasicMaterial({ color: "#5FE6FF", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, clippingPlanes: [gone] }),
      portal: new THREE.MeshPhysicalMaterial({ color: "#7A55D0", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#22104A"), emissiveIntensity: 0.6, clippingPlanes: [keep] }),
      artery: new THREE.MeshPhysicalMaterial({ color: "#E8404E", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#3A0408"), emissiveIntensity: 0.5, clippingPlanes: [keep] }),
      bile: new THREE.MeshPhysicalMaterial({ color: "#A6C83A", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#203008"), emissiveIntensity: 0.5, clippingPlanes: [keep] }),
      hepvein: new THREE.MeshPhysicalMaterial({ color: "#4A66C8", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#0A1440"), emissiveIntensity: 0.5, clippingPlanes: [keep] }),
      gall: new THREE.MeshPhysicalMaterial({ color: "#5E9A3A", roughness: 0.22, clearcoat: 1, sheen: 0.5, sheenColor: new THREE.Color("#C8FF9A"), emissive: new THREE.Color("#0E2A08"), emissiveIntensity: 0.6, vertexColors: true }),
      ivc: new THREE.MeshPhysicalMaterial({ color: "#3F5AB8", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#0A1440"), emissiveIntensity: 0.5, clippingPlanes: [new THREE.Plane(new THREE.Vector3(0, 1, 0), 2.3)] }),
      trunk: new THREE.MeshPhysicalMaterial({ color: "#7A55D0", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#22104A"), emissiveIntensity: 0.6 }),
    };
  }, [keep, gone]);
  const op = 1 - 0.62 * s.portal;
  [m.remnant, m.donated].forEach((x) => { x.opacity = op; x.depthWrite = s.portal < 0.3; x.emissiveIntensity = 0.45 + 0.5 * s.glow; });
  m.ghost.opacity = 0.12 * s.ghost;
  const trunk = useMemo(() => tubeGeo("ptr", PORTAL, 0.13, 60), []);
  const f = s.frame;
  if (!G) return null;
  const sparks: React.ReactNode[] = [];
  if (s.regrow > 0.01 && s.cut > 0.02 && s.cut < 0.995) for (let i = 0; i < 30; i++) {
    const ph = (f + Math.floor(random(`lr${i}`) * 16)) % 16;
    const a = ph < 7 ? Math.sin((ph / 7) * Math.PI) : 0;
    if (a <= 0) continue;
    const k = Math.floor((f + Math.floor(random(`lr${i}`) * 16)) / 16);
    const y = -1.1 + random(`ly${i}-${k}`) * 2.6, z = -1.2 + random(`lz${i}-${k}`) * 2.6;
    sparks.push(<Glow key={i} position={[c + 0.02, y, z]} color={i % 3 ? "#FFD23F" : "#5FE6FF"} size={0.42} opacity={a * s.regrow} />);
  }
  return (
    <group>
      <mesh geometry={G.remnant} material={m.remnant} castShadow />
      {s.cut < 0.999 && <mesh geometry={G.donated} material={m.donated} castShadow />}
      {s.cut > 0.001 && s.cut < 0.999 && <mesh geometry={G.donated} material={m.inside} />}
      {s.ghost > 0.01 && <mesh geometry={G.donated} material={m.ghost} />}
      <mesh geometry={G.portal} material={m.portal} />
      <mesh geometry={G.artery} material={m.artery} />
      <mesh geometry={G.bile} material={m.bile} />
      <mesh geometry={G.hepvein} material={m.hepvein} />
      <mesh geometry={G.gall} material={m.gall} />
      <mesh geometry={G.ivc} material={m.ivc} />
      <mesh geometry={trunk} material={m.trunk} />
      <Flow points={PORTAL.map((q) => [q[0], q[1], q[2] + 0.1])} frame={f} color="#FFD23F" count={14} speed={0.012} size={0.24} trail={5} opacity={s.portal} seed="pf" />
      <Flow points={PORTAL.map((q) => [q[0] + 0.04, q[1], q[2] + 0.14])} frame={f} color="#C8A0FF" count={10} speed={0.014} size={0.2} trail={4} opacity={s.portal} seed="pv" />
      {s.portal > 0.01 && <Glow position={[-0.05, -0.85, 0.3]} color="#FFD23F" size={1.2} opacity={0.45 * s.portal} />}
      {sparks}
    </group>
  );
};

// ---------------------------------------------------------------- lobulillo hepático
export const LR = 2.6;
const corner = (k: number, r = LR) => [Math.cos((k * Math.PI) / 3 + Math.PI / 6) * r, Math.sin((k * Math.PI) / 3 + Math.PI / 6) * r, 0];
export const TRIAD = corner(1);
export const CELL_PT = [Math.cos(Math.PI / 6 + Math.PI / 3 * 4) * 1.3, Math.sin(Math.PI / 6 + Math.PI / 3 * 4) * 1.3, 0.2];
export type LobuleState = { blood: number; sugar: number; protein: number; toxin: number; bile: number; frame: number };

export const Lobule: React.FC<{ s: LobuleState }> = ({ s }) => {
  const cells = useMemo(() => {
    const out: number[][] = [];
    for (let k = 0; k < 12; k++) {
      const ang = (k * Math.PI) / 6 + Math.PI / 6;
      const rmax = k % 2 === 0 ? LR - 0.35 : LR * 0.866 - 0.2;
      for (let r = 0.6; r < rmax; r += 0.27) {
        const j = (random(`cj${k}${r}`) - 0.5) * 0.05;
        out.push([Math.cos(ang + j) * r, Math.sin(ang + j) * r, 0, ang + (random(`cr${k}${r}`) - 0.5) * 0.5, 0.85 + random(`cs${k}${r}`) * 0.3]);
      }
    }
    return out;
  }, []);
  // hepatocito: poliedro redondeado irregular (no cubo)
  const cellGeos = useMemo(() => [0, 1, 2].map((v) => {
    const g = new THREE.IcosahedronGeometry(1, 4); const p = g.getAttribute("position") as THREE.BufferAttribute; const q = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      q.fromBufferAttribute(p, i);
      const n = 1 + 0.08 * Math.sin(q.x * 4 + v * 2) * Math.cos(q.y * 3 + v) + 0.05 * Math.sin(q.z * 5 + v * 3);
      const box = 1 / Math.pow(Math.pow(Math.abs(q.x), 4) + Math.pow(Math.abs(q.y), 4) + Math.pow(Math.abs(q.z), 4), 0.25) * 0.35 + 0.65;
      p.setXYZ(i, q.x * 0.15 * n * box, q.y * 0.13 * n * box, q.z * 0.24 * n * box);
    }
    g.computeVertexNormals(); return g;
  }), []);
  const nucGeo = useMemo(() => new THREE.SphereGeometry(0.05, 16, 12), []);
  const sinus = useMemo(() => Array.from({ length: 12 }).map((_, k) => {
    const a = (k * Math.PI) / 6 + Math.PI / 6 + Math.PI / 12;
    return tubeGeo(`sn${k}`, [[Math.cos(a) * 0.45, Math.sin(a) * 0.45, -0.05], [Math.cos(a + 0.03) * 1.3, Math.sin(a + 0.03) * 1.3, -0.08], [Math.cos(a) * (k % 2 ? 2.15 : 2.35), Math.sin(a) * (k % 2 ? 2.15 : 2.35), -0.05]], 0.055, 30);
  }), []);
  const m = useMemo(() => ({
    cell: new THREE.MeshPhysicalMaterial({ color: "#C86A56", roughness: 0.45, clearcoat: 0.4, sheen: 1, sheenColor: new THREE.Color("#FFB09A"), emissive: new THREE.Color("#4A1008"), emissiveIntensity: 0.5 }),
    central: new THREE.MeshPhysicalMaterial({ color: "#3F5AB8", roughness: 0.3, clearcoat: 0.8, emissive: new THREE.Color("#0A1440"), emissiveIntensity: 0.6 }),
    portal: new THREE.MeshPhysicalMaterial({ color: "#6A4AB8", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#1A0A3A"), emissiveIntensity: 0.5 }),
    artery: new THREE.MeshPhysicalMaterial({ color: "#E0404E", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#3A0408"), emissiveIntensity: 0.5 }),
    bile: new THREE.MeshPhysicalMaterial({ color: "#9FBF3A", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#203008"), emissiveIntensity: 0.5 }),
    nuc: new THREE.MeshPhysicalMaterial({ color: "#5A1A40", roughness: 0.4, emissive: new THREE.Color("#2A0820"), emissiveIntensity: 0.4 }),
    sinus: new THREE.MeshPhysicalMaterial({ color: "#8A1A3A", roughness: 0.35, clearcoat: 0.6, transparent: true, opacity: 0.85, emissive: new THREE.Color("#3A0614"), emissiveIntensity: 0.6 }),
    floor: new THREE.MeshStandardMaterial({ color: "#3A0E10", roughness: 0.8, emissive: new THREE.Color("#1A0406") }),
    edge: new THREE.LineBasicMaterial({ color: "#5FE6FF", transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }),
  }), []);
  m.cell.emissiveIntensity = 0.5 + 0.7 * Math.max(s.sugar, s.protein, s.toxin) * 0.6;
  const edgeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setFromPoints(Array.from({ length: 7 }).map((_, k) => new THREE.Vector3(...corner(k % 6, LR + 0.05).slice(0, 2) as [number, number], 0.3)));
    return g;
  }, []);
  const floorGeo = useMemo(() => {
    const sh = new THREE.Shape();
    for (let k = 0; k < 6; k++) { const c = corner(k, LR + 0.2); k ? sh.lineTo(c[0], c[1]) : sh.moveTo(c[0], c[1]); }
    return new THREE.ShapeGeometry(sh);
  }, []);
  const f = s.frame;
  return (
    <group>
      <mesh geometry={floorGeo} material={m.floor} position={[0, 0, -0.32]} />
      <lineLoop geometry={edgeGeo} material={m.edge} />
      {cells.map((c, i) => (
        <group key={i} position={[c[0], c[1], 0]} rotation={[0, 0, c[3]]} scale={c[4]}>
          <mesh geometry={cellGeos[i % 3]} material={m.cell} />
          <mesh geometry={nucGeo} material={m.nuc} position={[0, 0, 0.17]} />
        </group>
      ))}
      {sinus.map((g, i) => <mesh key={`sn${i}`} geometry={g} material={m.sinus} />)}
      <mesh material={m.central} rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[0.36, 0.5, 12, 40]} /></mesh>
      {Array.from({ length: 6 }).map((_, k) => {
        const c = corner(k);
        return (
          <group key={k} position={c as [number, number, number]}>
            <mesh material={m.portal} position={[0.0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[0.2, 0.45, 10, 28]} /></mesh>
            <mesh material={m.artery} position={[0.24, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[0.09, 0.6, 8, 20]} /></mesh>
            <mesh material={m.bile} position={[-0.22, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[0.09, 0.6, 8, 20]} /></mesh>
          </group>
        );
      })}
      {/* sangre: de las esquinas (porta + arteria) a la vena central, por los sinusoides entre cordones */}
      {Array.from({ length: 6 }).map((_, k) => {
        const a = (k * Math.PI) / 3 + Math.PI / 6 + Math.PI / 12;
        const pts = [corner(k, LR - 0.1), [Math.cos(a) * 1.6, Math.sin(a) * 1.6, 0.25], [Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0.25]];
        return (
          <React.Fragment key={k}>
            <Flow points={pts.map((q) => [q[0], q[1], 0.3])} frame={f} color="#C870FF" count={6} speed={0.012} size={0.2} trail={4} opacity={s.blood} seed={`lb${k}`} />
            <Flow points={pts.map((q) => [q[0], q[1], 0.32])} frame={f} color="#FFD23F" count={4} speed={0.012} size={0.2} trail={3} opacity={s.sugar} seed={`ls${k}`} />
            <Flow points={pts.map((q) => [q[0] * 1.0, q[1] * 1.0, 0.34])} frame={f} color="#7CFF4F" count={3} speed={0.01} size={0.24} trail={3} opacity={s.toxin} seed={`lt${k}`} />
            <Flow points={[[Math.cos(a - 0.26) * 0.7, Math.sin(a - 0.26) * 0.7, 0.3], [Math.cos(a - 0.26) * 1.7, Math.sin(a - 0.26) * 1.7, 0.3], corner(k, LR - 0.25).map((v, j) => (j === 2 ? 0.3 : v))]} frame={f} color="#B8FF3A" count={6} speed={0.01} size={0.2} trail={4} opacity={s.bile} seed={`lbi${k}`} />
          </React.Fragment>
        );
      })}
      {/* azúcar almacenado / proteínas que salen / tóxicos neutralizados */}
      {cells.map((c, i) => {
        if (i % 3) return null;
        const ph = (f * 0.05 + random(`cg${i}`)) % 1;
        return (
          <React.Fragment key={`g${i}`}>
            {s.sugar > 0.01 && <Glow position={[c[0], c[1], 0.3]} color="#FFD23F" size={0.4} opacity={s.sugar * (0.4 + 0.6 * Math.sin(ph * Math.PI))} />}
            {s.protein > 0.01 && <Glow position={[c[0] * (1 - ph * 0.3), c[1] * (1 - ph * 0.3), 0.3 + ph * 0.6]} color="#5FE6FF" size={0.26} opacity={s.protein * (1 - ph)} />}
            {s.toxin > 0.01 && <Glow position={[c[0], c[1], 0.35]} color={ph < 0.5 ? "#7CFF4F" : "#FFFFFF"} size={0.32} opacity={s.toxin * Math.sin(ph * Math.PI)} />}
          </React.Fragment>
        );
      })}
      {s.blood > 0.01 && <Glow position={[0, 0, 0.5]} color="#5F8FFF" size={1.0} opacity={0.4 * s.blood} />}
    </group>
  );
};
