// Riñones procedurales (forma de alubia) con aorta, cava, arterias/venas renales, uréteres y vejiga; corte frontal con
// corteza, pirámides medulares y pelvis renal. Secundario: nefrona (glomérulo + cápsula + túbulo + capilar peritubular).
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const tube = (pts: number[][], r: number, seg = 48, closed = false) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), closed, "centripetal"), seg, r, 14, closed);
const curve = (pts: number[][]) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "centripetal");

let tex: THREE.Texture | null = null;
function organTexture() {
  if (tex) return tex;
  const n = 512, cv = document.createElement("canvas"); cv.width = cv.height = n;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#8a8a8a"; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 1800; i++) {
    const v = 70 + Math.floor(random(`kv${i}`) * 120);
    g.fillStyle = `rgba(${v},${v},${v},0.3)`;
    g.beginPath(); g.arc(random(`kx${i}`) * n, random(`ky${i}`) * n, 1 + random(`kr${i}`) * 3, 0, Math.PI * 2); g.fill();
  }
  tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Alubia: esfera escalada con hendidura (hilio) en la cara medial. side = +1 riñón izquierdo (x>0). */
function beanGeo(side: number) {
  const g = mergeVertices(new THREE.IcosahedronGeometry(1, 5).deleteAttribute("normal").deleteAttribute("uv"));
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const medial = -side * v.x;
    let x = v.x * 0.58, y = v.y * 1.0, z = v.z * 0.38;
    if (medial > 0.2) x += side * (medial - 0.2) * 0.42 * Math.exp(-Math.pow(v.y / 0.42, 2)); // hilio
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}

export const K_POS = { L: [1.15, 0.25, 0], R: [-1.15, 0.05, 0] };
export const BLADDER = [0, -2.9, 0.25];
const URETER = (side: number) => [[side * 0.82, 0.05 + (side > 0 ? 0.2 : 0), 0.05], [side * 0.7, -0.8, 0.1], [side * 0.45, -2.1, 0.2], [side * 0.2, -2.7, 0.25]];
const ART = (side: number) => [[side * 0.12, 0.5 + (side > 0 ? 0.15 : 0), 0.05], [side * 0.5, 0.35 + (side > 0 ? 0.15 : 0), 0.05], [side * 0.8, 0.3 + (side > 0 ? 0.15 : 0), 0.0]];
const VEIN = (side: number) => [[side * -0.18 + 0.0, 0.15 + (side > 0 ? 0.15 : 0), 0.08], [side * 0.45, 0.12 + (side > 0 ? 0.15 : 0), 0.1], [side * 0.8, 0.12 + (side > 0 ? 0.15 : 0), 0.06]];
export const RENAL_ART_L = ART(1);

export type KidneyState = { open: number; blood: number; urine: number; sparkle: number; frame: number };

export const Kidneys: React.FC<{ s: KidneyState; clip: THREE.Plane }> = ({ s, clip }) => {
  const cl = [clip];
  const m = useMemo(() => {
    const t = organTexture();
    const tissue = (c: string, e: string, clip = true) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.25, sheen: 1, sheenColor: new THREE.Color("#FF9AB0"), emissive: new THREE.Color(e), emissiveIntensity: 0.55, bumpMap: t, bumpScale: 0.6, clippingPlanes: clip ? cl : [] });
    return {
      kidney: tissue("#9E3036", "#33080C"),
      cortex: new THREE.MeshStandardMaterial({ color: "#D07A64", roughness: 0.6, side: THREE.BackSide, clippingPlanes: cl, emissive: new THREE.Color("#300808"), emissiveIntensity: 0.5 }),
      medulla: new THREE.MeshStandardMaterial({ color: "#5A1020", roughness: 0.55, side: THREE.DoubleSide, clippingPlanes: cl, emissive: new THREE.Color("#200408"), emissiveIntensity: 0.4 }),
      pelvis: new THREE.MeshPhysicalMaterial({ color: "#F0D9C8", roughness: 0.35, clearcoat: 0.8, side: THREE.DoubleSide, clippingPlanes: cl }),
      art: tissue("#D8384A", "#4A0812", false),
      vein: tissue("#4B4FB8", "#10144A", false),
      ureter: tissue("#E8CDA8", "#2A1A08", false),
      bladder: new THREE.MeshPhysicalMaterial({ color: "#E7B9A8", roughness: 0.3, clearcoat: 1, transparent: true, opacity: 0.85, sheen: 1, sheenColor: new THREE.Color("#FFD6C8") }),
    };
  }, [clip]);
  const geo = useMemo(() => ({ L: beanGeo(1), R: beanGeo(-1) }), []);
  const vessels = useMemo(() => ({
    aorta: tube([[0.12, 2.4, -0.15], [0.12, 0.5, -0.1], [0.1, -1.6, -0.1], [0.4, -2.4, -0.1]], 0.16),
    cava: tube([[-0.22, 2.4, 0.0], [-0.2, 0.2, 0.05], [-0.25, -1.6, 0.0], [-0.5, -2.4, 0.0]], 0.17),
    artL: tube(ART(1), 0.07), artR: tube(ART(-1), 0.07), veinL: tube(VEIN(1), 0.08), veinR: tube(VEIN(-1), 0.08),
    urL: tube(URETER(1), 0.045), urR: tube(URETER(-1), 0.045),
  }), []);
  // pirámides medulares (conos hacia el hilio) dentro de cada riñón
  const pyr = (side: number) => [-0.55, -0.2, 0.15, 0.5].map((y, i) => (
    <mesh key={i} material={m.medulla} position={[side * -0.08, y * 1.1, 0]} rotation={[0, 0, side * (Math.PI / 2) + y * 0.5 * side]} scale={[1, 1, 0.55]}>
      <coneGeometry args={[0.2, 0.42, 20]} />
    </mesh>
  ));
  const flow = (pts: number[][], n: number, color: string, seed: string, speed: number, a: number, size = 0.1) => {
    if (a <= 0.01) return null;
    const c = curve(pts);
    return Array.from({ length: n }).map((_, i) => {
      const u = (s.frame / speed + random(`${seed}${i}`)) % 1;
      return <Glow key={`${seed}${i}`} position={c.getPointAt(u).toArray()} color={color} size={size} opacity={a * 0.9} />;
    });
  };
  const sparkle = s.sparkle > 0.01 ? Array.from({ length: 60 }).map((_, i) => {
    const side = i % 2 ? 1 : -1, P = side > 0 ? K_POS.L : K_POS.R;
    const th = random(`st${i}`) * Math.PI * 2, ph = Math.acos(2 * random(`sp${i}`) - 1);
    const tw = 0.5 + 0.5 * Math.sin(s.frame / 4 + i * 1.7);
    return <Glow key={`s${i}`} position={[P[0] + Math.sin(ph) * Math.cos(th) * 0.6, P[1] + Math.cos(ph) * 1.0, P[2] + Math.sin(ph) * Math.sin(th) * 0.4 + 0.05]} color="#FFD23F" size={0.14} opacity={s.sparkle * tw} />;
  }) : null;
  return (
    <group>
      <mesh geometry={vessels.aorta} material={m.art} castShadow />
      <mesh geometry={vessels.cava} material={m.vein} castShadow />
      <mesh geometry={vessels.artL} material={m.art} /><mesh geometry={vessels.artR} material={m.art} />
      <mesh geometry={vessels.veinL} material={m.vein} /><mesh geometry={vessels.veinR} material={m.vein} />
      <mesh geometry={vessels.urL} material={m.ureter} /><mesh geometry={vessels.urR} material={m.ureter} />
      {([["L", 1], ["R", -1]] as const).map(([k, side]) => (
        <group key={k} position={(k === "L" ? K_POS.L : K_POS.R) as any} rotation={[0, 0, side * -0.18]}>
          <mesh geometry={geo[k]} material={m.kidney} castShadow receiveShadow />
          <mesh geometry={geo[k]} material={m.cortex} />
          {s.open > 0.01 && pyr(side)}
          {s.open > 0.01 && <mesh material={m.pelvis} position={[side * 0.3, 0, 0]} rotation={[0, 0, side * Math.PI / 2]} scale={[1, 1, 0.6]}><coneGeometry args={[0.3, 0.6, 24, 1, true]} /></mesh>}
        </group>
      ))}
      <mesh material={m.bladder} position={BLADDER as any} scale={[0.55, 0.45, 0.45]}><sphereGeometry args={[1, 32, 24]} /></mesh>
      {flow([[0.12, 2.4, -0.1], [0.12, 0.6, -0.05], ...ART(1).slice(1)], 14, "#FF3A4A", "bl", 50, s.blood)}
      {flow([[0.12, 2.4, -0.1], [0.12, 0.6, -0.05], ...ART(-1).slice(1)], 14, "#FF3A4A", "br", 50, s.blood)}
      {flow(URETER(1), 10, "#FFD23F", "ul", 60, s.urine)}
      {flow(URETER(-1), 10, "#FFD23F", "ur", 60, s.urine)}
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
