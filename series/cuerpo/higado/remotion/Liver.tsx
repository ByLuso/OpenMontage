// Hígado procedural (vista anterior: lóbulo derecho grande a -X, izquierdo afilado a +X) con vesícula, vena porta,
// arteria hepática, colédoco y cava; seccionable en X (parte donada) con "fantasma" de lo que falta y regeneración.
// Secundario: lobulillo hepático hexagonal (vena central, tríadas portales, cordones de hepatocitos, sinusoides, bilis).
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";
import { Flow } from "./kit3d/Flow";
import { tubeGeo, roundedBox } from "./kit3d/Parts";

function liverGeo() {
  const g = new THREE.SphereGeometry(1, 128, 96);
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i);
    const x = vx < 0 ? vx * 1.7 : vx * 2.7;                    // lóbulo derecho romo, izquierdo largo y afilado
    const t = Math.min(1, Math.max(0, (x + 0.4) / 3.1));
    const sh = 1 - 0.78 * Math.pow(t, 0.9), sz = 1 - 0.5 * t;
    const b = Math.min(1, Math.max(0, (vy + 0.35) / 0.7)), bl = b * b * (3 - 2 * b);
    let y = vy * ((0.62 - 0.25 * t) + (1.5 - (0.62 - 0.25 * t)) * bl) * sh;
    y += 0.35 * t - 0.15 * Math.max(0, -x - 0.8);
    let z = vz * 1.3 * sz;
    if (vz > 0) z *= 1 - 0.18 * (1 - bl);
    const n = 1 + 0.015 * Math.sin(vx * 9 + vz * 5) * Math.sin(vy * 7 + 1);
    p.setXYZ(i, x * n, y * n, z * n);
  }
  g.computeVertexNormals();
  return g;
}

export const PORTAL = [[0.15, -2.3, 0.3], [0.08, -1.6, 0.25], [-0.02, -1.0, 0.2], [-0.1, -0.55, 0.1]];
export const ARTERY = [[0.5, -2.2, 0.3], [0.42, -1.6, 0.3], [0.28, -1.0, 0.25], [0.15, -0.55, 0.15]];
export const BILE = [[-0.55, -0.85, 0.6], [-0.35, -1.1, 0.5], [-0.2, -1.6, 0.45], [-0.2, -2.2, 0.42]];
export const GALL = [-0.75, -0.62, 0.7];
export const CUT_X = -0.5;

export type LiverState = { cut: number; ghost: number; portal: number; regrow: number; glow: number; frame: number };

export const Liver: React.FC<{ s: LiverState }> = ({ s }) => {
  const geo = useMemo(() => liverGeo(), []);
  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 5), []);
  const clipG = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), -5), []);
  const c = 3 - s.cut * (3 - CUT_X);           // x máximo visible
  clip.constant = c; clipG.constant = -c;
  const m = useMemo(() => ({
    liver: new THREE.MeshPhysicalMaterial({ color: "#8E2E2C", roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.15, sheen: 0.8, sheenColor: new THREE.Color("#FF9A8A"), emissive: new THREE.Color("#3A0808"), emissiveIntensity: 0.5, clippingPlanes: [clip] }),
    inside: new THREE.MeshStandardMaterial({ color: "#6A1A1C", roughness: 0.7, side: THREE.BackSide, emissive: new THREE.Color("#3A0606"), emissiveIntensity: 0.6, clippingPlanes: [clip] }),
    ghost: new THREE.MeshBasicMaterial({ color: "#5FE6FF", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, clippingPlanes: [clipG] }),
    ghostW: new THREE.MeshBasicMaterial({ color: "#5FE6FF", wireframe: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, clippingPlanes: [clipG] }),
    gall: new THREE.MeshPhysicalMaterial({ color: "#4F8F3A", roughness: 0.25, clearcoat: 1, emissive: new THREE.Color("#0E2A08"), emissiveIntensity: 0.6 }),
    portal: new THREE.MeshPhysicalMaterial({ color: "#6A4AB8", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#1A0A3A"), emissiveIntensity: 0.5 }),
    artery: new THREE.MeshPhysicalMaterial({ color: "#E0404E", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#3A0408"), emissiveIntensity: 0.5 }),
    bile: new THREE.MeshPhysicalMaterial({ color: "#9FBF3A", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#203008"), emissiveIntensity: 0.5 }),
    cava: new THREE.MeshPhysicalMaterial({ color: "#3F5AB8", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#0A1440"), emissiveIntensity: 0.5 }),
  }), [clip, clipG]);
  m.liver.emissiveIntensity = 0.5 + 0.6 * s.glow;
  m.ghost.opacity = 0.13 * s.ghost;
  m.ghostW.opacity = 0.05 * s.ghost;
  const tubes = useMemo(() => ({
    portal: tubeGeo("lp", PORTAL, 0.17, 80), artery: tubeGeo("la", ARTERY, 0.08, 80), bile: tubeGeo("lb", BILE, 0.08, 80),
    cava: tubeGeo("lc", [[-0.55, -2.0, -0.85], [-0.6, -1.0, -0.9], [-0.6, 0.6, -0.95], [-0.55, 2.1, -0.85]], 0.24, 80),
  }), []);
  const f = s.frame;
  // chispas de células que se multiplican en el borde que crece
  const sparks: React.ReactNode[] = [];
  if (s.regrow > 0.01) for (let i = 0; i < 26; i++) {
    const ph = (f + Math.floor(random(`lr${i}`) * 16)) % 16;
    const a = ph < 7 ? Math.sin((ph / 7) * Math.PI) : 0;
    if (a <= 0) continue;
    const y = -0.4 + random(`ly${i}-${Math.floor((f + Math.floor(random(`lr${i}`) * 16)) / 16)}`) * 1.3, z = (random(`lz${i}`) - 0.3) * 0.9;
    sparks.push(<Glow key={i} position={[c - 0.05, y, z + 0.2]} color={i % 3 ? "#FFD23F" : "#5FE6FF"} size={0.4} opacity={a * s.regrow} />);
  }
  return (
    <group>
      <mesh geometry={geo} material={m.liver} castShadow />
      <mesh geometry={geo} material={m.inside} />
      {s.ghost > 0.01 && <mesh geometry={geo} material={m.ghost} />}
      <mesh material={m.gall} position={GALL as [number, number, number]} rotation={[0.5, 0, 0.5]} scale={[0.22, 0.4, 0.22]}><sphereGeometry args={[1, 48, 32]} /></mesh>
      <mesh geometry={tubes.portal} material={m.portal} />
      <mesh geometry={tubes.artery} material={m.artery} />
      <mesh geometry={tubes.bile} material={m.bile} />
      <mesh geometry={tubes.cava} material={m.cava} />
      <Flow points={PORTAL.map((q) => [q[0], q[1], q[2] + 0.12])} frame={f} color="#FFD23F" count={14} speed={0.012} size={0.22} trail={5} opacity={s.portal} seed="pf" />
      <Flow points={PORTAL.map((q) => [q[0] + 0.05, q[1], q[2] + 0.16])} frame={f} color="#C8A0FF" count={10} speed={0.014} size={0.18} trail={4} opacity={s.portal} seed="pv" />
      {s.portal > 0.01 && <Glow position={[-0.1, -0.4, 0.4]} color="#FFD23F" size={1.2} opacity={0.4 * s.portal} />}
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
      for (let r = 0.62; r < rmax; r += 0.33) out.push([Math.cos(ang) * r, Math.sin(ang) * r, 0, ang]);
    }
    return out;
  }, []);
  const cellGeo = useMemo(() => roundedBox(0.28, 0.24, 0.5, 0.07, 3), []);
  const m = useMemo(() => ({
    cell: new THREE.MeshPhysicalMaterial({ color: "#C0604E", roughness: 0.4, clearcoat: 0.6, sheen: 1, sheenColor: new THREE.Color("#FFB09A"), emissive: new THREE.Color("#4A1008"), emissiveIntensity: 0.5 }),
    central: new THREE.MeshPhysicalMaterial({ color: "#3F5AB8", roughness: 0.3, clearcoat: 0.8, emissive: new THREE.Color("#0A1440"), emissiveIntensity: 0.6 }),
    portal: new THREE.MeshPhysicalMaterial({ color: "#6A4AB8", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#1A0A3A"), emissiveIntensity: 0.5 }),
    artery: new THREE.MeshPhysicalMaterial({ color: "#E0404E", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#3A0408"), emissiveIntensity: 0.5 }),
    bile: new THREE.MeshPhysicalMaterial({ color: "#9FBF3A", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#203008"), emissiveIntensity: 0.5 }),
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
      {cells.map((c, i) => <mesh key={i} geometry={cellGeo} material={m.cell} position={[c[0], c[1], 0]} rotation={[0, 0, c[3]]} />)}
      <mesh material={m.central} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.36, 0.36, 0.9, 40]} /></mesh>
      {Array.from({ length: 6 }).map((_, k) => {
        const c = corner(k);
        return (
          <group key={k} position={c as [number, number, number]}>
            <mesh material={m.portal} position={[0.0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 0.8, 28]} /></mesh>
            <mesh material={m.artery} position={[0.24, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.09, 0.09, 0.8, 20]} /></mesh>
            <mesh material={m.bile} position={[-0.22, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.09, 0.09, 0.8, 20]} /></mesh>
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
