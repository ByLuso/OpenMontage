// Pulmones procedurales: dos pulmones (derecho 3 lóbulos, izquierdo 2 con escotadura cardiaca), tráquea con anillos,
// árbol bronquial ramificado (visible al volver translúcido el tejido), diafragma en cúpula y flujo de aire.
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";
import { useModel } from "./Model";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// textura de tejido esponjoso
let spongeTex: THREE.Texture | null = null;
function spongeTexture() {
  if (spongeTex) return spongeTex;
  const n = 512, cv = document.createElement("canvas"); cv.width = cv.height = n;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#909090"; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 2600; i++) {
    const v = 60 + Math.floor(random(`sv${i}`) * 140);
    g.fillStyle = `rgba(${v},${v},${v},0.35)`;
    g.beginPath(); g.arc(random(`sx${i}`) * n, random(`sy${i}`) * n, 1 + random(`sr${i}`) * 4, 0, Math.PI * 2); g.fill();
  }
  // lobulillos (polígonos tenues)
  for (let i = 0; i < 260; i++) {
    g.strokeStyle = "rgba(60,60,60,0.25)"; g.lineWidth = 1;
    const x = random(`lx${i}`) * n, y = random(`ly${i}`) * n, r = 10 + random(`lr${i}`) * 16;
    g.beginPath();
    for (let k = 0; k <= 6; k++) { const a = (k / 6) * Math.PI * 2 + i; g[k ? "lineTo" : "moveTo"](x + Math.cos(a) * r, y + Math.sin(a) * r); }
    g.stroke();
  }
  spongeTex = new THREE.CanvasTexture(cv);
  spongeTex.wrapS = spongeTex.wrapT = THREE.RepeatWrapping;
  return spongeTex;
}

/** Forma de un pulmón a partir de una esfera: alto, ápice estrecho, base cóncava sobre el diafragma, cara medial plana. */
function lungGeo(side: 1 | -1) {
  const g = mergeVertices(new THREE.IcosahedronGeometry(1, 5).deleteAttribute("normal").deleteAttribute("uv"));
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    uv[i * 2] = Math.atan2(v.x, v.z) / Math.PI + 1; uv[i * 2 + 1] = v.y + 1;
    let x = v.x * 0.86, y = v.y * 1.3, z = v.z * 0.7;
    const top = Math.max(0, v.y);
    x *= 1 - 0.32 * top * top; z *= 1 - 0.28 * top * top;            // ápice redondeado
    if (v.y < -0.55) y = -1.35 * 0.55 - (Math.abs(v.y) - 0.55) * 0.25 + Math.pow(v.x, 2) * 0.25; // base cóncava
    const medial = -side * v.x;                                      // hacia el centro del pecho
    if (medial > 0) x += side * medial * 0.34;                       // aplana la cara medial
    if (side === 1 && medial > 0.1 && v.y < 0.2 && v.z > 0) x += 0.18 * medial * (0.2 - v.y); // escotadura cardiaca (izq.)
    p.setXYZ(i, x, y, z);
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

/** Árbol bronquial: ramificación recursiva determinista. */
type Branch = { pts: number[][]; r: number; depth: number };
function bronchialTree(start: number[], dir: number[], len: number, r: number, depth: number, seed: string, side: number, out: Branch[]) {
  const d = new THREE.Vector3(...dir).normalize();
  const end = new THREE.Vector3(...start).addScaledVector(d, len);
  const mid = new THREE.Vector3(...start).addScaledVector(d, len * 0.5).add(new THREE.Vector3((random(seed + "m") - 0.5) * 0.06, 0, (random(seed + "n") - 0.5) * 0.06));
  out.push({ pts: [start, mid.toArray(), end.toArray()], r, depth });
  if (depth >= 5) return;
  for (let k = 0; k < 2; k++) {
    const spread = 0.55 + random(`${seed}s${k}`) * 0.25;
    const axis = new THREE.Vector3(random(`${seed}ax${k}`) - 0.5, 0, random(`${seed}az${k}`) - 0.5).normalize();
    if (k === 1) axis.negate();
    const nd = d.clone().applyAxisAngle(axis, spread * (k === 0 ? 1 : -1) * 0.8).add(new THREE.Vector3(side * 0.15, -0.25, 0)).normalize();
    bronchialTree(end.toArray(), nd.toArray(), len * 0.72, r * 0.68, depth + 1, `${seed}${k}`, side, out);
  }
}

export type LungsState = { breath: number; xray: number; air: number; airDir: number; frame: number; o2glow: number };

export const LUNG_POS = { L: [0.82, 0.0, 0], R: [-0.75, 0.0, 0] };
const TOP = [-0.13, 1.87, -0.04], CARINA = [0.05, 0.45, -0.2];

/** Pulmones reales (BodyParts3D): superficie pleural, árbol traqueobronquial, arterias pulmonares y diafragma. */
export const Lungs: React.FC<{ s: LungsState }> = ({ s }) => {
  const G = useModel("pulmones.glb");
  const m = useMemo(() => ({
    tissue: new THREE.MeshPhysicalMaterial({ color: "#E58A9C", roughness: 0.5, clearcoat: 0.45, clearcoatRoughness: 0.35, sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color("#FFD0DA"), emissive: new THREE.Color("#4A0F1E"), emissiveIntensity: 0.45, vertexColors: true, transparent: true }),
    bronchi: new THREE.MeshPhysicalMaterial({ color: "#F4DADF", roughness: 0.35, clearcoat: 0.8, emissive: new THREE.Color("#35C4F0"), emissiveIntensity: 0 }),
    artery: new THREE.MeshPhysicalMaterial({ color: "#5A6AE0", roughness: 0.35, clearcoat: 0.7, emissive: new THREE.Color("#141E5A"), emissiveIntensity: 0.6, transparent: true }),
    diaph: new THREE.MeshPhysicalMaterial({ color: "#A02C3C", roughness: 0.55, clearcoat: 0.15, sheen: 1, sheenColor: new THREE.Color("#FF9AB0"), side: THREE.DoubleSide, emissive: new THREE.Color("#3A0612"), emissiveIntensity: 0.5, vertexColors: true,
      clippingPlanes: [new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.8)] }),
  }), []);
  m.tissue.opacity = 1 - 0.8 * s.xray;
  m.tissue.depthWrite = s.xray < 0.3;
  m.bronchi.emissiveIntensity = 0.12 + 0.7 * s.air;
  m.artery.opacity = s.xray;
  // destinos del aire: vértices del árbol bronquial (deterministas)
  const targets = useMemo(() => {
    if (!G) return [];
    const p = G.bronchi.getAttribute("position") as THREE.BufferAttribute; const out: THREE.CatmullRomCurve3[] = [];
    for (let i = 0; i < 70; i++) {
      let k = Math.floor(random(`tb${i}`) * p.count), tries = 0;
      while (p.getY(k) > 0.3 && tries++ < 20) k = Math.floor(random(`tb${i}-${tries}`) * p.count);
      const t = new THREE.Vector3(p.getX(k), p.getY(k), p.getZ(k));
      const mid = new THREE.Vector3(...CARINA).lerp(t, 0.45); mid.x += Math.sign(t.x) * 0.08;
      out.push(new THREE.CatmullRomCurve3([new THREE.Vector3(...TOP), new THREE.Vector3(...CARINA), mid, t]));
    }
    return out;
  }, [G]);
  if (!G) return null;
  // respiración: inspirar = el diafragma baja y se aplana; los pulmones se expanden (sobre todo hacia abajo)
  const b = s.breath;
  const lungScale: [number, number, number] = [1 + 0.05 * b, 1 + 0.09 * b, 1 + 0.05 * b];
  const air: number[][] = [];
  if (s.air > 0.01) targets.forEach((c, i) => {
    let u = (s.frame / 30 + random(`au${i}`)) % 1;
    if (s.airDir < 0) u = 1 - u;
    air.push(c.getPointAt(u).toArray());
  });
  return (
    <group>
      <mesh geometry={G.bronchi} material={m.bronchi} />
      {s.xray > 0.01 && <mesh geometry={G.partery} material={m.artery} />}
      <group position={[0, 0.25, 0]} scale={lungScale}>
        <group position={[0, -0.25, 0]}>
          <mesh geometry={G.lungL} material={m.tissue} castShadow receiveShadow />
          <mesh geometry={G.lungR} material={m.tissue} castShadow receiveShadow />
        </group>
      </group>
      <group position={[0, -0.62 - 0.22 * b, 0]} scale={[1, 1 - 0.3 * b, 1]}>
        <mesh geometry={G.diaphragm} material={m.diaph} receiveShadow />
      </group>
      {air.map((p, i) => <Glow key={i} position={p} color={s.airDir > 0 ? "#8FE6FF" : "#FFD27A"} size={0.11} opacity={s.air * 0.9} />)}
      {s.o2glow > 0.01 && <Glow position={[0, 0.2, 0.4]} color="#5FE6FF" size={4} opacity={s.o2glow * 0.25} />}
    </group>
  );
};

/** Modelo secundario: racimo de alvéolos al final de un bronquiolo, con red de capilares e intercambio de gases. */
export const Alveoli: React.FC<{ frame: number; exchange: number }> = ({ frame, exchange }) => {
  const alv = useMemo(() => {
    const out: number[][] = [];
    for (let i = 0; i < 26; i++) {
      const th = random(`at${i}`) * Math.PI * 2, ph = Math.acos(2 * random(`ap${i}`) - 1) * 0.8;
      out.push([Math.sin(ph) * Math.cos(th) * 1.15, -Math.cos(ph) * 1.0 + 0.1, Math.sin(ph) * Math.sin(th) * 1.15, 0.38 + random(`ar${i}`) * 0.14]);
    }
    return out;
  }, []);
  const sac = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#F0A6B8", roughness: 0.25, clearcoat: 1, transparent: true, opacity: 0.78, sheen: 1, sheenColor: new THREE.Color("#FFD6E0"), depthWrite: false, emissive: new THREE.Color("#3A0A1A"), emissiveIntensity: 0.4 }), []);
  const capR = useMemo(() => new THREE.MeshStandardMaterial({ color: "#E8364A", emissive: new THREE.Color("#5A0A14"), emissiveIntensity: 0.6, roughness: 0.35 }), []);
  const capB = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5060D0", emissive: new THREE.Color("#101A5A"), emissiveIntensity: 0.6, roughness: 0.35 }), []);
  const caps = useMemo(() => {
    const out: { g: THREE.TubeGeometry; red: boolean }[] = [];
    for (let i = 0; i < 16; i++) {
      const pts: THREE.Vector3[] = [];
      const th0 = random(`ct${i}`) * Math.PI * 2;
      for (let k = 0; k <= 10; k++) {
        const ph = 0.25 + (k / 10) * 2.2, th = th0 + Math.sin(k * 0.8 + i) * 0.5;
        pts.push(new THREE.Vector3(Math.sin(ph) * Math.cos(th) * 1.42, -Math.cos(ph) * 1.25 + 0.1, Math.sin(ph) * Math.sin(th) * 1.42));
      }
      out.push({ g: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.024, 8, false), red: i % 2 === 0 });
    }
    return out;
  }, []);
  const bronchiole = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 3.2, 0), new THREE.Vector3(0.05, 2.2, 0), new THREE.Vector3(0, 1.2, 0)]), 20, 0.22, 16, false), []);
  const brMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#F4D6DC", roughness: 0.35, clearcoat: 0.8, emissive: new THREE.Color("#35C4F0"), emissiveIntensity: 0.3 }), []);
  // O2 (cian) del alvéolo a la sangre; CO2 (dorado) de la sangre al alvéolo
  const gas: { p: number[]; c: string; a: number }[] = [];
  if (exchange > 0.01) for (let i = 0; i < 40; i++) {
    const a = alv[i % alv.length];
    const life = (frame / 34 + random(`g${i}`)) % 1;
    const dir = new THREE.Vector3(a[0], a[1] - 0.1, a[2]).normalize();
    const r0 = 0.15, r1 = 1.45;
    const o2 = i % 2 === 0;
    const r = o2 ? r0 + (r1 - r0) * life : r1 - (r1 - r0) * life;
    gas.push({ p: [dir.x * r * 1.1, dir.y * r + 0.1, dir.z * r * 1.1], c: o2 ? "#5FE6FF" : "#FFC83D", a: exchange * Math.sin(Math.PI * life) });
  }
  const pulse = 1 + 0.04 * Math.sin(frame / 12);
  return (
    <group>
      <mesh geometry={bronchiole} material={brMat} />
      {caps.map((c, i) => <mesh key={i} geometry={c.g} material={c.red ? capR : capB} />)}
      {alv.map((a, i) => (
        <mesh key={i} material={sac} position={[a[0], a[1], a[2]]} scale={a[3] * pulse}><sphereGeometry args={[1, 24, 18]} /></mesh>
      ))}
      {gas.map((q, i) => <Glow key={i} position={q.p} color={q.c} size={0.22} opacity={q.a} />)}
    </group>
  );
};
