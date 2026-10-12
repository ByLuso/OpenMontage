// Ojo procedural (eje óptico en X: córnea a -X, retina a +X), seccionable con un plano de corte:
// esclerótica, coroides, retina con vasos, córnea, iris/pupila, cristalino, músculos y nervio óptico.
// Objeto exterior (flecha dorada) y rayos de luz que se cruzan en el cristalino → imagen invertida en la retina.
// Secundario: capa de fotorreceptores (conos y bastones) con fotones, señal y fibras hacia el nervio óptico.
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";
import { Flow } from "./kit3d/Flow";
import { tubeGeo } from "./kit3d/Parts";
import { useModel } from "./Model";

export const R = 1.2;
export const CORNEA = [-1.33, 0.35, 0.05];
export const LENS = [-0.75, 0.0, 0];
export const RETINA_PT = [0.86, 0.5, 0.05];
export const NERVE = [2.2, -0.12, 0];
export const OBJ = { x: -3.1, y0: -0.7, y1: 0.8 };
// imagen invertida sobre la retina (radio interior ~1.12)
export const IMG = { tip: [0.89, -0.33, 0.05], base: [0.92, 0.27, 0.05] };

/** Casquete esférico alrededor de +X (o -X con dir=-1). */
const cap = (r: number, theta: number, dir = 1, seg = 96) => {
  const g = new THREE.SphereGeometry(r, seg, seg / 2, 0, Math.PI * 2, 0, theta);
  g.rotateZ(-dir * Math.PI / 2);
  return g;
};

/** Textura de iris: fibras radiales, collarete y anillo límbico (en UV de un ringGeometry). */
let irisTex: THREE.Texture | null = null;
function irisTexture() {
  if (irisTex) return irisTex;
  const n = 512, cv = document.createElement("canvas"); cv.width = cv.height = n; const g = cv.getContext("2d")!;
  const c = n / 2;
  const grd = g.createRadialGradient(c, c, n * 0.08, c, c, n * 0.5);
  grd.addColorStop(0, "#0E3A2E"); grd.addColorStop(0.3, "#2F7A8C"); grd.addColorStop(0.55, "#3E9AB4"); grd.addColorStop(0.85, "#256E86"); grd.addColorStop(1, "#0B2430");
  g.fillStyle = grd; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 420; i++) {
    const a = random(`ia${i}`) * Math.PI * 2, r0 = n * (0.12 + random(`ir${i}`) * 0.1), r1 = n * (0.32 + random(`is${i}`) * 0.17);
    const v = random(`iv${i}`);
    g.strokeStyle = v > 0.5 ? `rgba(170,225,235,${0.12 + v * 0.18})` : `rgba(5,30,40,${0.2 + v * 0.3})`;
    g.lineWidth = 0.6 + random(`iw${i}`) * 1.6;
    g.beginPath(); g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
    g.quadraticCurveTo(c + Math.cos(a + 0.08) * (r0 + r1) / 2, c + Math.sin(a + 0.08) * (r0 + r1) / 2, c + Math.cos(a) * r1, c + Math.sin(a) * r1); g.stroke();
  }
  g.strokeStyle = "rgba(210,170,90,0.45)"; g.lineWidth = 6; g.beginPath();
  for (let k = 0; k <= 64; k++) { const a = (k / 64) * Math.PI * 2, r = n * (0.2 + 0.012 * Math.sin(a * 9)); k ? g.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r) : g.moveTo(c + Math.cos(a) * r, c + Math.sin(a) * r); }
  g.stroke();
  irisTex = new THREE.CanvasTexture(cv); return irisTex;
}

/** Flecha (eje +Y): astil + punta. */
const Arrow: React.FC<{ position: number[]; h: number; color: string; flip?: boolean; opacity?: number; emissive?: number; clip?: THREE.Plane[] }> =
  ({ position, h, color, flip = false, opacity = 1, emissive = 0.8, clip = [] }) => {
    const mat = useMemo(() => new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(color), roughness: 0.35, metalness: 0.2, transparent: true }), [color]);
    mat.opacity = opacity; mat.emissiveIntensity = emissive; mat.clippingPlanes = clip;
    if (opacity <= 0.01) return null;
    const head = h * 0.36, shaft = h - head, r = h * 0.07;
    return (
      <group position={position as [number, number, number]} rotation={[0, 0, flip ? Math.PI : 0]}>
        <mesh material={mat} position={[0, -h / 2 + shaft / 2, 0]}><cylinderGeometry args={[r, r, shaft, 24]} /></mesh>
        <mesh material={mat} position={[0, h / 2 - head / 2, 0]}><coneGeometry args={[r * 3, head, 32]} /></mesh>
      </group>
    );
  };

export type EyeState = { open: number; rays: number; cross: number; proj: number; signal: number; parts: number; frame: number };

export const Eye: React.FC<{ s: EyeState; clip: THREE.Plane }> = ({ s, clip }) => {
  const cl = [clip];
  const GM = useModel("ojo.glb");
  const m = useMemo(() => ({
    sclera: new THREE.MeshPhysicalMaterial({ color: "#E6D6D0", roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2, sheen: 0.6, sheenColor: new THREE.Color("#FFC8D0"), emissive: new THREE.Color("#2A0E14"), emissiveIntensity: 0.4, clippingPlanes: cl }),
    choroid: new THREE.MeshStandardMaterial({ color: "#2A0710", roughness: 0.6, side: THREE.BackSide, clippingPlanes: cl }),
    retina: new THREE.MeshPhysicalMaterial({ color: "#D23A5E", roughness: 0.45, side: THREE.BackSide, emissive: new THREE.Color("#5A0A20"), emissiveIntensity: 0.6, clippingPlanes: cl }),
    vessel: new THREE.MeshStandardMaterial({ color: "#8E0F22", roughness: 0.4, emissive: new THREE.Color("#3A0008"), clippingPlanes: cl }),
    cornea: new THREE.MeshPhysicalMaterial({ color: "#CFF4FF", roughness: 0.03, clearcoat: 1, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide, clippingPlanes: cl }),
    iris: new THREE.MeshPhysicalMaterial({ map: irisTexture(), roughness: 0.55, side: THREE.DoubleSide, emissive: new THREE.Color("#0A3346"), emissiveIntensity: 0.35, clippingPlanes: cl }),
    irisBack: new THREE.MeshStandardMaterial({ color: "#1A0A10", roughness: 0.7, side: THREE.DoubleSide, clippingPlanes: cl }),
    lens: new THREE.MeshPhysicalMaterial({ color: "#EAF6FF", roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.6, emissive: new THREE.Color("#6FE8FF"), emissiveIntensity: 0.15, clippingPlanes: cl }),
    muscleV: new THREE.MeshPhysicalMaterial({ color: "#B0283E", roughness: 0.5, sheen: 1, sheenColor: new THREE.Color("#FF8FA8"), emissive: new THREE.Color("#3A0610"), emissiveIntensity: 0.5, vertexColors: true, clippingPlanes: cl }),
    muscle: new THREE.MeshPhysicalMaterial({ color: "#B0283E", roughness: 0.5, sheen: 1, sheenColor: new THREE.Color("#FF8FA8"), emissive: new THREE.Color("#3A0610"), emissiveIntensity: 0.5, clippingPlanes: cl }),
    nerve: new THREE.MeshPhysicalMaterial({ color: "#E9CD92", roughness: 0.45, clearcoat: 0.5, side: THREE.DoubleSide, emissive: new THREE.Color("#3A2A08"), emissiveIntensity: 0.5, clippingPlanes: cl }),
    ray: new THREE.MeshBasicMaterial({ color: "#FFD23F", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
    pupil: new THREE.MeshBasicMaterial({ color: "#020203", side: THREE.DoubleSide, clippingPlanes: cl }),
  }), [clip]);
  m.lens.emissiveIntensity = 0.15 + 0.9 * s.cross;
  m.ray.opacity = 0.75 * s.rays;

  const geo = useMemo(() => {
    // vasos de la retina: ramas desde el disco óptico (≈ +X, algo abajo) por la superficie interior
    const disc = new THREE.Vector3(1, -0.1, 0).normalize();
    const vessels: THREE.BufferGeometry[] = [];
    for (let b = 0; b < 7; b++) {
      const ang = (b / 7) * Math.PI * 2 + 0.3;
      const pts: number[][] = [];
      for (let k = 0; k <= 10; k++) {
        const u = k / 10;
        const th = u * 1.25;                                   // ángulo desde el disco
        const wig = Math.sin(u * 7 + b) * 0.08 * u;
        const dir = new THREE.Vector3(Math.cos(th), Math.sin(th) * Math.cos(ang + wig), Math.sin(th) * Math.sin(ang + wig));
        dir.applyAxisAngle(new THREE.Vector3(0, 0, 1), -0.1);
        pts.push(dir.multiplyScalar(0.985).toArray());
      }
      vessels.push(tubeGeo(`v${b}`, pts, 0.016 - (b % 3) * 0.003, 60));
    }
    // rayos: desde la punta y la base de la flecha, por 3 puntos del cristalino, hasta la imagen invertida
    const tip = [OBJ.x, OBJ.y1, 0.05], base = [OBJ.x, OBJ.y0, 0.05];
    const lensPts = [[-0.75, 0.18, 0.05], [-0.75, 0, 0.05], [-0.75, -0.18, 0.05]];
    const rays: number[][][] = [];
    lensPts.forEach((lp) => rays.push([tip, lp, IMG.tip]));
    lensPts.forEach((lp) => rays.push([base, lp, IMG.base]));
    const seg = (a: number[], b: number[]) => {
      const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
      const g = new THREE.CylinderGeometry(0.018, 0.018, d.length(), 8, 1, true);
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()));
      g.translate(...(A.clone().add(B).multiplyScalar(0.5).toArray() as [number, number, number]));
      return g;
    };
    const rayGeos = rays.flatMap((r) => [seg(r[0], r[1]), seg(r[1], r[2])]);
    return { disc, vessels, rays, rayGeos };
  }, []);
  const f = s.frame;
  return (
    <group>
      {/* globo real (BodyParts3D): eje anterior +Z del modelo → -X de la escena */}
      {GM && (
        <group rotation={[0, -Math.PI / 2, 0]}>
          <mesh geometry={GM.sclera} material={m.sclera} castShadow />
          <mesh geometry={GM.choroid} material={m.choroid} scale={0.975} />
          <mesh geometry={GM.cornea} material={m.cornea} />
          <mesh geometry={GM.iris} material={m.irisBack} />
          <mesh geometry={GM.lens} material={m.lens} />
          <mesh geometry={GM.muscles} material={m.muscleV} castShadow />
        </group>
      )}
      <mesh geometry={useMemo(() => cap(1.0, 2.0, 1), [])} material={m.retina} />
      {geo.vessels.map((g, i) => <mesh key={i} geometry={g} material={m.vessel} />)}
      <Glow position={geo.disc.clone().multiplyScalar(0.97).toArray()} color="#FFE3A0" size={0.35} opacity={0.6 * s.open} />
      {/* córnea, iris, cristalino */}
      <mesh material={m.iris} position={[-0.965, -0.017, -0.053]} rotation={[0, -Math.PI / 2, 0]}><ringGeometry args={[0.19, 0.58, 96, 6]} /></mesh>
      <mesh material={m.pupil} position={[-0.955, -0.017, -0.053]} rotation={[0, -Math.PI / 2, 0]}><circleGeometry args={[0.19, 64]} /></mesh>
      {/* nervio */}

      <mesh material={m.nerve} geometry={useMemo(() => tubeGeo("on", [[1.02, -0.1, 0.02], [1.5, -0.12, 0.05], [2.1, -0.08, 0.1], [2.7, 0.0, 0.15]], 0.2, 60), [])} />
      {/* objeto exterior y luz */}
      <Arrow position={[OBJ.x, (OBJ.y0 + OBJ.y1) / 2, 0]} h={OBJ.y1 - OBJ.y0} color="#FFC83F" opacity={s.parts} emissive={0.6 + 0.5 * s.rays} />
      {s.rays > 0.01 && geo.rayGeos.map((g, i) => <mesh key={`ry${i}`} geometry={g} material={m.ray} />)}
      {geo.rays.map((r, i) => <Flow key={i} points={[r[0], r[1], r[2]]} frame={f} color="#FFE07A" count={5} speed={0.012} size={0.16} trail={4} opacity={s.rays} seed={`r${i}`} />)}
      {s.cross > 0.01 && <Glow position={[-0.75, 0, 0.1]} color="#FFE9A0" size={0.9} opacity={s.cross * 0.8} />}
      {/* imagen invertida en la retina */}
      <Arrow position={[(IMG.tip[0] + IMG.base[0]) / 2 - 0.04, (IMG.tip[1] + IMG.base[1]) / 2, 0.05]} h={IMG.base[1] - IMG.tip[1]} color="#FFD23F" flip opacity={s.proj} emissive={1.4} />
      {s.proj > 0.01 && <Glow position={[0.88, -0.03, 0.1]} color="#FFD23F" size={1.1} opacity={0.45 * s.proj} scaleY={1.4} />}
      {/* señal por el nervio óptico */}
      <Flow points={[[1.0, -0.1, 0.05], [1.4, -0.12, 0.05], [2.0, -0.12, 0.05], [2.5, -0.12, 0.05]]} frame={f} color="#5FE6FF" count={10} speed={0.02} size={0.24} trail={5} opacity={s.signal} seed="nv" />
      {s.signal > 0.01 && <Glow position={[2.45, -0.12, 0.1]} color="#5FE6FF" size={0.8} opacity={s.signal * 0.7} />}
    </group>
  );
};

// ---------------------------------------------------------------- retina de cerca
export const RX = { cone: [-0.9, -0.9, 0.3], fibers: [2.4, 1.75, 0], gang: [0.6, 1.25, 0] };
export type RetinaState = { photons: number; lit: number; color: number; signal: number; frame: number };

export const Retina: React.FC<{ s: RetinaState }> = ({ s }) => {
  const cells = useMemo(() => {
    const out: { x: number; z: number; cone: boolean; hue: number; h: number }[] = [];
    for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) {
      const x = -3.2 + i * 0.75 + (j % 2) * 0.37 + (random(`cx${i}${j}`) - 0.5) * 0.12, z = -1.2 + j * 0.65;
      const cone = (i + j) % 3 === 1;
      out.push({ x, z, cone, hue: Math.floor(random(`ch${i}${j}`) * 3), h: 0.9 + random(`hh${i}${j}`) * 0.2 });
    }
    return out;
  }, []);
  const mats = useMemo(() => ({
    rpe: new THREE.MeshStandardMaterial({ color: "#24060C", roughness: 0.9, emissive: new THREE.Color("#140208") }),
    rod: new THREE.MeshPhysicalMaterial({ color: "#B04A8A", roughness: 0.4, clearcoat: 0.6, emissive: new THREE.Color("#3A0A30"), emissiveIntensity: 0.6 }),
    body: new THREE.MeshPhysicalMaterial({ color: "#E07A98", roughness: 0.4, clearcoat: 0.6, sheen: 1, sheenColor: new THREE.Color("#FFB0C8"), emissive: new THREE.Color("#4A0A1E"), emissiveIntensity: 0.5 }),
    cones: ["#FF4F6A", "#4FE07A", "#4F8FFF"].map((c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.35, clearcoat: 0.8, emissive: new THREE.Color(c), emissiveIntensity: 0.2 })),
    gang: new THREE.MeshPhysicalMaterial({ color: "#E8B0C4", roughness: 0.4, clearcoat: 0.5, transparent: true, opacity: 0.8, emissive: new THREE.Color("#0A3040"), emissiveIntensity: 0.4 }),
    fiber: new THREE.MeshStandardMaterial({ color: "#E9CD92", roughness: 0.5, emissive: new THREE.Color("#5FE6FF"), emissiveIntensity: 0 }),
  }), []);
  mats.cones.forEach((mm) => { mm.emissiveIntensity = 0.2 + 1.4 * Math.max(s.color, s.lit * 0.5); });
  mats.rod.emissiveIntensity = 0.6 + 0.8 * s.lit;
  mats.gang.emissiveIntensity = 0.4 + 1.5 * s.signal;
  mats.fiber.emissiveIntensity = 1.2 * s.signal;
  const gang = useMemo(() => [-2.4, -1.2, 0, 1.2].map((x, i) => [x + 0.3, 1.25, -0.3 + (i % 2) * 0.5]), []);
  const fiberGeos = useMemo(() => gang.map((g, i) => tubeGeo(`fb${i}`, [g, [g[0] + 0.6, 1.6, g[2] * 0.5], [2.0, 1.75, 0], [3.6, 1.8, 0]], 0.045, 60)), [gang]);
  const f = s.frame;
  return (
    <group>
      <mesh material={mats.rpe} position={[0, -1.85, 0]}><boxGeometry args={[8, 0.3, 3.2]} /></mesh>
      {cells.map((c, i) => (
        <group key={i} position={[c.x, 0, c.z]}>
          {c.cone ? (
            <>
              <mesh material={mats.cones[c.hue]} position={[0, -1.25, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.2, 0.75, 24]} /></mesh>
              <mesh material={mats.body} position={[0, -0.55, 0]}><cylinderGeometry args={[0.2, 0.16, 0.7, 24]} /></mesh>
            </>
          ) : (
            <mesh material={mats.rod} position={[0, -1.0, 0]}><cylinderGeometry args={[0.085, 0.085, 1.4 * c.h, 16]} /></mesh>
          )}
          <mesh material={mats.body} position={[0, -0.05, 0]}><sphereGeometry args={[c.cone ? 0.2 : 0.13, 24, 16]} /></mesh>
          <mesh material={mats.body} position={[0, 0.35, 0]}><cylinderGeometry args={[0.035, 0.035, 0.7, 8]} /></mesh>
          {s.lit > 0.01 && <Glow position={[0, c.cone ? -1.2 : -1.0, 0.1]} color={c.cone ? ["#FF4F6A", "#4FE07A", "#4F8FFF"][c.hue] : "#E0A0FF"} size={0.55} opacity={s.lit * (0.5 + 0.5 * Math.abs(Math.sin(f * 0.15 + i)))} />}
        </group>
      ))}
      {gang.map((g, i) => <mesh key={i} material={mats.gang} position={g as [number, number, number]}><sphereGeometry args={[0.3, 32, 24]} /></mesh>)}
      {fiberGeos.map((g, i) => <mesh key={i} geometry={g} material={mats.fiber} />)}
      {/* fotones que bajan desde arriba */}
      {s.photons > 0.01 && Array.from({ length: 14 }).map((_, i) => {
        const x = -3 + random(`px${i}`) * 6, z = -1 + random(`pz${i}`) * 2;
        const u = ((f * 0.03 + random(`pu${i}`)) % 1);
        return <Glow key={`ph${i}`} position={[x, 3.6 - u * 4.6, z]} color="#FFE07A" size={0.35} opacity={s.photons * (1 - u * 0.4)} scaleY={2.2} />;
      })}
      {/* señal: de receptores a ganglionares y por las fibras */}
      {gang.map((g, i) => <Flow key={`sg${i}`} points={[[g[0] - 0.4, -0.3, g[2]], [g[0] - 0.1, 0.6, g[2]], g, [g[0] + 0.6, 1.6, g[2] * 0.5], [2.0, 1.75, 0], [3.6, 1.8, 0]]} frame={f} color="#5FE6FF" count={6} speed={0.018} size={0.22} trail={5} opacity={s.signal} seed={`sg${i}`} />)}
    </group>
  );
};
