// Riñones procedurales (forma de alubia) con aorta, cava, arterias/venas renales, uréteres y vejiga; corte frontal con
// corteza, pirámides medulares y pelvis renal. Secundario: nefrona (glomérulo + cápsula + túbulo + capilar peritubular).
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";
import { useModel } from "./Model";

const tube = (pts: number[][], r: number, seg = 48, closed = false) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), closed, "centripetal"), seg, r, 14, closed);
const curve = (pts: number[][]) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "centripetal");

// Datos del modelo real (BodyParts3D, escala 0.019, Y arriba, Z anterior)
export const K_POS = { L: [1.07, 0.14, -0.09], R: [-1.035, -0.15, 0.12] };
const HILUM = { L: [0.74, 0.3, -0.05], R: [-0.72, -0.35, 0.13] };
export const BLADDER = [0.02, -4.09, -0.07];
const UR_L = [[1.0, 0.3, -0.12], [1.13, -0.23, -0.05], [0.88, -0.69, 0.17], [0.53, -1.63, 0.54], [0.54, -2.31, 0.49], [0.63, -2.97, -0.09], [0.4, -3.75, -0.2]];
const UR_R = [[-0.95, -0.2, 0.05], [-1.11, -0.46, 0.1], [-0.9, -0.97, 0.24], [-0.65, -1.84, 0.51], [-0.66, -2.39, 0.45], [-0.74, -3.14, -0.3], [-0.4, -3.85, -0.2]];
const AORTA = [[0.17, 1.88, 0.12], [0.15, 1.29, 0.36], [0.15, 0.85, 0.46], [0.14, 0.31, 0.62]];
const ART_L = [[0.15, 0.31, 0.57], [0.41, 0.26, 0.42], [0.62, 0.3, 0.15], [0.76, 0.32, -0.02]];
const ART_R = [[0.12, 0.25, 0.55], [-0.28, 0.17, 0.42], [-0.55, -0.1, 0.27], [-0.7, -0.33, 0.14]];
const VEIN_L = [[0.74, 0.22, 0.02], [0.45, 0.16, 0.6], [0.12, 0.12, 0.95], [-0.22, 0.1, 0.72]];
const VEIN_R = [[-0.72, -0.42, 0.18], [-0.5, -0.25, 0.5], [-0.27, -0.12, 0.66]];
export const RENAL_ART_L = ART_L;

export type KidneyState = { open: number; blood: number; urine: number; sparkle: number; frame: number };

/** Riñones reales con corte frontal (cada uno por su plano medio): corteza, pirámides medulares y pelvis renal. */
export const Kidneys: React.FC<{ s: KidneyState; clip: THREE.Plane }> = ({ s, clip }) => {
  const G = useModel("rinones.glb");
  const planes = useMemo(() => ({ L: new THREE.Plane(new THREE.Vector3(0, 0, -1), 5), R: new THREE.Plane(new THREE.Vector3(0, 0, -1), 5) }), []);
  // corte: de fuera (sin corte) al plano medio de cada riñón
  planes.L.constant = 2 - s.open * (2 + K_POS.L[2]); planes.R.constant = 2 - s.open * (2 + K_POS.R[2]);
  const m = useMemo(() => {
    const mk = (k: "L" | "R") => ({
      kidney: new THREE.MeshPhysicalMaterial({ color: "#A3363A", roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.2, sheen: 0.8, sheenColor: new THREE.Color("#FF9AB0"), emissive: new THREE.Color("#33080C"), emissiveIntensity: 0.5, vertexColors: true, clippingPlanes: [planes[k]] }),
      cortex: new THREE.MeshStandardMaterial({ color: "#D88068", roughness: 0.6, side: THREE.BackSide, clippingPlanes: [planes[k]], emissive: new THREE.Color("#300808"), emissiveIntensity: 0.55 }),
      medulla: new THREE.MeshStandardMaterial({ color: "#6A1424", roughness: 0.55, side: THREE.DoubleSide, clippingPlanes: [planes[k]], emissive: new THREE.Color("#200408"), emissiveIntensity: 0.4 }),
      pelvis: new THREE.MeshPhysicalMaterial({ color: "#F0D9C8", roughness: 0.35, clearcoat: 0.8, side: THREE.DoubleSide, clippingPlanes: [planes[k]] }),
    });
    const vessel = (c: string, e: string) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.32, clearcoat: 0.8, sheen: 0.6, sheenColor: new THREE.Color("#FFC0C8"), emissive: new THREE.Color(e), emissiveIntensity: 0.5 });
    return {
      L: mk("L"), R: mk("R"),
      art: vessel("#D8384A", "#4A0812"), vein: vessel("#4B4FB8", "#10144A"), ureter: vessel("#E8CDA8", "#2A1A08"),
      adrenal: new THREE.MeshPhysicalMaterial({ color: "#E0A040", roughness: 0.45, clearcoat: 0.5, emissive: new THREE.Color("#3A2006"), emissiveIntensity: 0.4, vertexColors: true }),
      bladder: new THREE.MeshPhysicalMaterial({ color: "#E7B9A8", roughness: 0.3, clearcoat: 1, transparent: true, opacity: 0.88, sheen: 1, sheenColor: new THREE.Color("#FFD6C8"), vertexColors: true }),
    };
  }, [planes]);
  const veins = useMemo(() => ({ L: tube(VEIN_L, 0.085), R: tube(VEIN_R, 0.09) }), []);
  const flow = (pts: number[][], n: number, color: string, seed: string, speed: number, a: number, size = 0.1) => {
    if (a <= 0.01) return null;
    const c = curve(pts);
    return Array.from({ length: n }).map((_, i) => {
      const u = (s.frame / speed + random(`${seed}${i}`)) % 1;
      return <Glow key={`${seed}${i}`} position={c.getPointAt(u).toArray()} color={color} size={size} opacity={a * 0.9} />;
    });
  };
  if (!G) return null;
  // interior: pirámides con la base hacia fuera y el vértice hacia el hilio; pelvis en embudo hacia el uréter
  const inner = (k: "L" | "R") => {
    const side = k === "L" ? 1 : -1, c = K_POS[k], h = HILUM[k], mm = m[k];
    const out: React.ReactNode[] = [];
    [-64, -40, -16, 8, 32, 56].forEach((deg, i) => {
      const t = (deg * Math.PI) / 180;
      // sobre una elipse entre el seno renal y la corteza; base hacia fuera, vértice hacia el seno
      const out_ = new THREE.Vector3(side * Math.cos(t) * 0.42, Math.sin(t) * 0.82, 0);
      const pos = [c[0] + side * 0.06 + out_.x * 0.62, c[1] + out_.y * 0.62, c[2]];
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), out_.clone().normalize().negate());
      out.push(<mesh key={`p${k}${i}`} material={mm.medulla} position={pos as any} quaternion={q} scale={[1, 1, 0.7]}><coneGeometry args={[0.13, 0.3, 32]} /></mesh>);
    });
    return out;
  };
  const sparkle = s.sparkle > 0.01 ? Array.from({ length: 60 }).map((_, i) => {
    const side = i % 2 ? 1 : -1, P = side > 0 ? K_POS.L : K_POS.R;
    const th = random(`st${i}`) * Math.PI * 2, ph = Math.acos(2 * random(`sp${i}`) - 1);
    const tw = 0.5 + 0.5 * Math.sin(s.frame / 4 + i * 1.7);
    return <Glow key={`s${i}`} position={[P[0] + Math.sin(ph) * Math.cos(th) * 0.55, P[1] + Math.cos(ph) * 1.0, P[2] + Math.sin(ph) * Math.sin(th) * 0.35 + 0.05]} color="#FFD23F" size={0.14} opacity={s.sparkle * tw} />;
  }) : null;
  return (
    <group>
      <mesh geometry={G.aorta} material={m.art} castShadow />
      <mesh geometry={G.ivc} material={m.vein} castShadow />
      <mesh geometry={G.artL} material={m.art} /><mesh geometry={G.artR} material={m.art} />
      <mesh geometry={veins.L} material={m.vein} /><mesh geometry={veins.R} material={m.vein} />
      <mesh geometry={G.ureterL} material={m.ureter} /><mesh geometry={G.ureterR} material={m.ureter} />
      <mesh geometry={G.adrenalL} material={m.adrenal} /><mesh geometry={G.adrenalR} material={m.adrenal} />
      {(["L", "R"] as const).map((k) => (
        <group key={k}>
          <mesh geometry={G[`kidney${k}`]} material={m[k].kidney} castShadow receiveShadow />
          <mesh geometry={G[`kidney${k}`]} material={m[k].cortex} />
          {s.open > 0.01 && inner(k)}
        </group>
      ))}
      <mesh geometry={G.bladder} material={m.bladder} />
      {flow([...AORTA, ...ART_L.slice(1)], 14, "#FF3A4A", "bl", 50, s.blood)}
      {flow([...AORTA, ...ART_R.slice(1)], 14, "#FF3A4A", "br", 50, s.blood)}
      {flow(UR_L, 12, "#FFD23F", "ul", 70, s.urine)}
      {flow(UR_R, 12, "#FFD23F", "ur", 70, s.urine)}
      {sparkle}
    </group>
  );
};

/** Nefrona (modelo secundario). Glomérulo en el origen; el túbulo baja y vuelve; capilar peritubular paralelo. */
export const TUBULE = [[0.75, 0.2, 0], [1.4, 0.3, 0.2], [1.8, -0.2, -0.1], [1.5, -0.7, 0.2], [1.75, -1.2, 0], [1.7, -2.6, 0], [1.95, -3.0, 0], [2.2, -2.6, 0], [2.2, -1.3, 0], [2.6, -0.8, 0.2], [3.1, -1.1, 0], [3.4, -2.8, 0]];
export const PERITUB = TUBULE.map((p) => [p[0] + 0.28, p[1], p[2] - 0.22]);

export type NephronState = { filter: number; retain: number; reabsorb: number; frame: number };

export const Nephron: React.FC<{ s: NephronState }> = ({ s }) => {
  const m = useMemo(() => ({
    cap: new THREE.MeshPhysicalMaterial({ color: "#D8344A", roughness: 0.3, clearcoat: 0.8, emissive: new THREE.Color("#4A0812"), emissiveIntensity: 0.6 }),
    capsule: new THREE.MeshPhysicalMaterial({ color: "#F2C8B8", roughness: 0.25, clearcoat: 1, transparent: true, opacity: 0.38, side: THREE.DoubleSide, depthWrite: false }),
    tubule: new THREE.MeshPhysicalMaterial({ color: "#F0D8A8", roughness: 0.3, clearcoat: 0.9, transparent: true, opacity: 0.6, depthWrite: false, emissive: new THREE.Color("#3A2A08"), emissiveIntensity: 0.4 }),
  }), []);
  // ovillo de capilares: varias espiras enmarañadas (deterministas)
  const tuft = useMemo(() => Array.from({ length: 9 }).map((_, k) => {
    const pts: number[][] = [];
    for (let i = 0; i <= 26; i++) {
      const a = (i / 26) * Math.PI * 2 * 2 + k, r = 0.32 + 0.12 * Math.sin(i * 0.9 + k);
      pts.push([Math.cos(a) * r, Math.sin(a * 0.7 + k) * 0.35, Math.sin(a) * r * Math.cos(k)]);
    }
    return tube(pts, 0.045, 80);
  }), []);
  const aff = useMemo(() => tube([[-1.6, 0.9, 0], [-0.8, 0.5, 0], [-0.25, 0.15, 0]], 0.09), []);
  const eff = useMemo(() => tube([[-0.2, -0.2, 0.1], [-0.6, -0.8, 0.2], [0.2, -1.4, 0.3], [1.0, -0.9, -0.2], ...PERITUB.slice(2)], 0.07, 120), []);
  const tub = useMemo(() => tube(TUBULE, 0.13, 160), []);
  const cTub = useMemo(() => curve(TUBULE), []);
  const cPer = useMemo(() => curve(PERITUB), []);
  const P: React.ReactNode[] = [];
  const f = s.frame;
  // filtrado: agua/sales/desechos (cian, blanco, dorado) atraviesan del ovillo a la cápsula
  if (s.filter > 0.01) for (let i = 0; i < 36; i++) {
    const life = (f / 30 + random(`f${i}`)) % 1;
    const th = random(`fth${i}`) * Math.PI * 2, ph = random(`fph${i}`) * Math.PI;
    const r = 0.3 + life * 0.42;
    const col = i % 3 === 0 ? "#FFC83D" : i % 3 === 1 ? "#8FE6FF" : "#FFFFFF";
    P.push(<Glow key={`f${i}`} position={[Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r * 0.8, Math.sin(ph) * Math.sin(th) * r]} color={col} size={0.1} opacity={s.filter * Math.sin(Math.PI * life)} />);
  }
  // retenidas: glóbulos rojos y proteínas rebotan en el filtro y siguen por la sangre
  if (s.retain > 0.01) for (let i = 0; i < 12; i++) {
    const life = (f / 40 + random(`r${i}`)) % 1;
    const a = random(`ra${i}`) * Math.PI * 2;
    const r = 0.36 + Math.sin(life * Math.PI) * 0.12;
    P.push(
      <mesh key={`r${i}`} position={[Math.cos(a + life * 3) * r, Math.sin(a * 2) * 0.25, Math.sin(a + life * 3) * r]} rotation={[a, life * 6, 0]} scale={[1, 0.4, 1]}>
        <sphereGeometry args={[i % 3 === 0 ? 0.07 : 0.1, 14, 10]} />
        <meshStandardMaterial color={i % 3 === 0 ? "#9B6BFF" : "#E8263A"} emissive={i % 3 === 0 ? "#3A1A8A" : "#5A0610"} emissiveIntensity={0.6} transparent opacity={s.retain} />
      </mesh>);
  }
  // túbulo: lo útil (cian) vuelve al capilar; los desechos (dorado) siguen hacia la orina
  if (s.reabsorb > 0.01) for (let i = 0; i < 30; i++) {
    const u = (f / 90 + random(`t${i}`)) % 1;
    const p = cTub.getPointAt(u);
    if (i % 2 === 0) {
      const q = cPer.getPointAt(u);
      const k = (f / 20 + random(`tk${i}`)) % 1;
      P.push(<Glow key={`t${i}`} position={p.clone().lerp(q, k).toArray()} color="#8FE6FF" size={0.12} opacity={s.reabsorb * Math.sin(Math.PI * k)} />);
    } else {
      P.push(<Glow key={`t${i}`} position={p.toArray()} color="#FFC83D" size={0.12} opacity={s.reabsorb} />);
    }
  }
  return (
    <group>
      <mesh geometry={aff} material={m.cap} />
      {tuft.map((g, i) => <mesh key={i} geometry={g} material={m.cap} />)}
      <mesh material={m.capsule} rotation={[0, 0, -Math.PI / 2 - 0.3]}><sphereGeometry args={[0.78, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.82]} /></mesh>
      <mesh geometry={tub} material={m.tubule} />
      <mesh geometry={eff} material={m.cap} />
      {P}
    </group>
  );
};
