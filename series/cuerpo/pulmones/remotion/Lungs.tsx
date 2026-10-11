// Pulmones procedurales: dos pulmones (derecho 3 lóbulos, izquierdo 2 con escotadura cardiaca), tráquea con anillos,
// árbol bronquial ramificado (visible al volver translúcido el tejido), diafragma en cúpula y flujo de aire.
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";
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

export const LUNG_POS = { L: [0.66, 0.05, 0], R: [-0.7, 0.05, 0] };

export const Lungs: React.FC<{ s: LungsState }> = ({ s }) => {
  const geoL = useMemo(() => lungGeo(1), []);
  const geoR = useMemo(() => lungGeo(-1), []);
  const tissue = useMemo(() => {
    const tex = spongeTexture();
    return new THREE.MeshPhysicalMaterial({
      color: "#E07A90", roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.3, sheen: 1, sheenColor: new THREE.Color("#FFC2D0"),
      emissive: new THREE.Color("#4A0F1E"), emissiveIntensity: 0.55, bumpMap: tex, bumpScale: 0.8, map: tex, transparent: true,
    });
  }, []);
  tissue.opacity = 1 - 0.78 * s.xray;
  tissue.depthWrite = s.xray < 0.3;
  const branches = useMemo(() => {
    const out: Branch[] = [];
    bronchialTree([0, 1.05, 0], [0.55, -1, 0], 0.55, 0.075, 1, "L", 1, out);
    bronchialTree([0, 1.05, 0], [-0.6, -1, 0], 0.5, 0.08, 1, "R", -1, out);
    return out.map((b) => ({ g: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(b.pts.map((q) => new THREE.Vector3(...q))), 8, b.r, 8, false), b }));
  }, []);
  const bronchusMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#F4D6DC", roughness: 0.35, clearcoat: 0.8, emissive: new THREE.Color("#35C4F0"), emissiveIntensity: 0 }), []);
  bronchusMat.emissiveIntensity = 0.15 + 0.6 * s.air;
  const cart = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#F2E4E6", roughness: 0.3, clearcoat: 1 }), []);
  const diaph = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) { const r = (i / 24) * 1.85; pts.push(new THREE.Vector2(r, 0.8 * Math.cos((r / 1.85) * Math.PI / 2))); }
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  const diaphMat = useMemo(() => new THREE.MeshPhysicalMaterial({ map: spongeTexture(), color: "#9C2C40", roughness: 0.45, clearcoat: 0.5, sheen: 1, sheenColor: new THREE.Color("#FF9AB0"), side: THREE.DoubleSide, emissive: new THREE.Color("#3A0612"), emissiveIntensity: 0.5 }), []);
  const tendon = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#E9D4D8", roughness: 0.3, clearcoat: 1, transparent: true, opacity: 0.9 }), []);

  // respiración: inspirar = diafragma baja y se aplana, pulmones se expanden
  const b = s.breath; // 0 espirado · 1 inspirado
  const lungScale: [number, number, number] = [1 + 0.06 * b, 1 + 0.1 * b, 1 + 0.06 * b];
  const diaphY = -1.85 - 0.3 * b, diaphFlat = 1 - 0.45 * b;

  // aire: partículas por la tráquea y ramas (dirección según inspirar/espirar)
  const air: number[][] = [];
  if (s.air > 0.01) {
    for (let i = 0; i < 70; i++) {
      const br = branches[Math.floor(random(`ab${i}`) * branches.length)].b;
      let u = (s.frame / 28 + random(`au${i}`)) % 1;
      if (s.airDir < 0) u = 1 - u;
      const c = new THREE.CatmullRomCurve3(br.pts.map((q) => new THREE.Vector3(...q))).getPointAt(u);
      air.push(c.toArray());
    }
    for (let i = 0; i < 16; i++) {
      let u = (s.frame / 22 + random(`at${i}`)) % 1;
      if (s.airDir < 0) u = 1 - u;
      air.push([(random(`ax${i}`) - 0.5) * 0.08, 2.4 - u * 1.35, (random(`az${i}`) - 0.5) * 0.08]);
    }
  }
  return (
    <group>
      {/* tráquea con anillos de cartílago */}
      <mesh material={bronchusMat} position={[0, 1.75, 0]}><cylinderGeometry args={[0.13, 0.13, 1.4, 24]} /></mesh>
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={i} material={cart} position={[0, 1.15 + i * 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.14, 0.025, 8, 28]} /></mesh>
      ))}
      {branches.map(({ g }, i) => <mesh key={i} geometry={g} material={bronchusMat} />)}
      <group position={LUNG_POS.L as any} scale={lungScale}><mesh geometry={geoL} material={tissue} castShadow receiveShadow /></group>
      <group position={LUNG_POS.R as any} scale={lungScale}><mesh geometry={geoR} material={tissue} castShadow receiveShadow /></group>
      {/* diafragma */}
      <group position={[0, diaphY, 0.05]} scale={[1, diaphFlat, 0.8]}>
        <mesh geometry={diaph} material={diaphMat} receiveShadow />
        <mesh material={tendon} position={[0, 0.805, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.7, 1]}><circleGeometry args={[0.42, 32]} /></mesh>
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
