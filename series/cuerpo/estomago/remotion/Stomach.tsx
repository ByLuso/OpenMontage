// Estómago procedural semirrealista: tubo en "J" barrido a lo largo de una curva con perfil de radio
// (fundus, cuerpo, antro, píloro, duodeno) + esófago. Pared con dos superficies (serosa fuera, mucosa con
// pliegues dentro), venas, corte transversal animable y oleadas de contracción. Todo determinista.
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";

// línea central (unidades ~ dm): del domo del fundus al duodeno
const CENTER = [
  [-0.72, 2.32, 0], [-0.84, 1.9, 0.01], [-0.86, 1.55, 0.02], [-0.76, 0.95, 0.05], [-0.5, 0.3, 0.08], [-0.02, -0.12, 0.08],
  [0.55, -0.16, 0.05], [0.98, 0.12, 0.0], [1.22, 0.32, -0.04], [1.46, 0.12, -0.1], [1.55, -0.25, -0.12],
];
const curve = new THREE.CatmullRomCurve3(CENTER.map((p) => new THREE.Vector3(...p)), false, "centripetal");

/** Perfil de radio a lo largo de u (0 domo · 1 duodeno). */
export function radiusAt(u: number) {
  const dome = Math.sin(Math.acos(1 - Math.max(0, Math.min(1, u / 0.16)))); // domo redondeado
  const body = 0.64 - 0.1 * Math.max(0, u - 0.25) / 0.3;
  const antrum = THREE.MathUtils.lerp(0.54, 0.24, THREE.MathUtils.smoothstep(u, 0.5, 0.72));
  const pyl = THREE.MathUtils.lerp(1, 0.42, THREE.MathUtils.smoothstep(u, 0.7, 0.77)) * (u > 0.8 ? THREE.MathUtils.lerp(0.42, 0.62, THREE.MathUtils.smoothstep(u, 0.8, 0.86)) / 0.42 : 1);
  const r = (u < 0.5 ? body : antrum) * pyl;
  return Math.max(0.0, r * (u < 0.16 ? dome : 1));
}

/** Oleada de contracción: estrechamiento gaussiano que viaja del cuerpo al píloro. */
export function waveAt(u: number, phase: number, amp: number) {
  let k = 0;
  for (let n = 0; n < 2; n++) {
    const c = 0.28 + ((phase + n * 0.5) % 1) * 0.5; // centro de la oleada entre u 0,28 y 0,78
    k += Math.exp(-Math.pow((u - c) / 0.05, 2));
  }
  return 1 - amp * k;
}

const SEG_U = 150, SEG_A = 56;

/** Marco de Frenet estable a lo largo de la curva. */
const frames = curve.computeFrenetFrames(SEG_U, false);

function buildGeo(inner: boolean) {
  const g = new THREE.BufferGeometry();
  const n = (SEG_U + 1) * (SEG_A + 1);
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(n * 2), 2));
  const uv = g.getAttribute("uv") as THREE.BufferAttribute;
  const idx: number[] = [];
  for (let i = 0; i <= SEG_U; i++) for (let j = 0; j <= SEG_A; j++) {
    uv.setXY(i * (SEG_A + 1) + j, (i / SEG_U) * 6, (j / SEG_A) * 3);
    if (i < SEG_U && j < SEG_A) {
      const a = i * (SEG_A + 1) + j, b = a + SEG_A + 1;
      if (inner) idx.push(a, a + 1, b, b, a + 1, b + 1); else idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  g.setIndex(idx);
  return g;
}

/** Recalcula los vértices de una superficie de la pared (con oleadas y pliegues). */
function updateGeo(g: THREE.BufferGeometry, inner: boolean, phase: number, amp: number, breath: number) {
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  const p = new THREE.Vector3(), nrm = new THREE.Vector3();
  for (let i = 0; i <= SEG_U; i++) {
    const u = i / SEG_U;
    curve.getPointAt(u, p);
    const N = frames.normals[i], B = frames.binormals[i];
    const base = radiusAt(u) * waveAt(u, phase, amp) * breath;
    for (let j = 0; j <= SEG_A; j++) {
      const a = (j / SEG_A) * Math.PI * 2;
      // curvatura mayor algo más abombada (lado -N)
      const bulge = 1 + 0.12 * Math.max(0, -Math.cos(a)) * (u > 0.1 && u < 0.6 ? 1 : 0);
      let r = base * bulge;
      if (inner) {
        // pliegues gástricos (rugae): crestas longitudinales algo onduladas
        r *= 0.86 + 0.045 * Math.pow(Math.abs(Math.sin(a * 9 + Math.sin(u * 18) * 0.5)), 3);
      } else {
        r *= 1 + 0.006 * Math.sin(a * 23 + u * 40) * Math.sin(u * 31);
      }
      nrm.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(B, Math.sin(a));
      pos.setXYZ(i * (SEG_A + 1) + j, p.x + nrm.x * r, p.y + nrm.y * r, p.z + nrm.z * r);
    }
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
}

/** Punto de la superficie exterior (para venas, etiquetas y partículas). */
export function surfacePoint(u: number, a: number, scale = 1.0) {
  const p = curve.getPointAt(u);
  const i = Math.round(u * SEG_U);
  const nrm = frames.normals[i].clone().multiplyScalar(Math.cos(a)).addScaledVector(frames.binormals[i], Math.sin(a));
  const bulge = 1 + 0.12 * Math.max(0, -Math.cos(a)) * (u > 0.1 && u < 0.6 ? 1 : 0);
  return p.addScaledVector(nrm, radiusAt(u) * bulge * scale);
}
export const centerPoint = (u: number) => curve.getPointAt(u);

// textura de tejido: estrías finas + moteado, como mapa de relieve y de color
let tissueTex: THREE.Texture | null = null;
function tissueTexture() {
  if (tissueTex) return tissueTex;
  const n = 512, cv = document.createElement("canvas");
  cv.width = cv.height = n;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#808080"; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 1400; i++) {
    const x = random(`tx${i}`) * n, y = random(`ty${i}`) * n, r = 1 + random(`tr${i}`) * 5;
    const v = 100 + Math.floor(random(`tv${i}`) * 80);
    g.fillStyle = `rgba(${v},${v},${v},0.35)`;
    g.beginPath(); g.ellipse(x, y, r * 2.2, r, 0.3, 0, Math.PI * 2); g.fill();
  }
  for (let i = 0; i < 160; i++) {
    const y = random(`sy${i}`) * n;
    g.strokeStyle = `rgba(60,60,60,${0.15 + random(`sa${i}`) * 0.2})`;
    g.lineWidth = 1 + random(`sw${i}`) * 2;
    g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= n; x += 32) g.lineTo(x, y + Math.sin(x / 40 + i) * 6);
    g.stroke();
  }
  tissueTex = new THREE.CanvasTexture(cv);
  tissueTex.wrapS = tissueTex.wrapT = THREE.RepeatWrapping;
  return tissueTex;
}

function veinPaths() {
  const out: number[][][] = [];
  // arcos de vasos a lo largo de la curvatura mayor y menor con ramas
  for (let v = 0; v < 14; v++) {
    const side = v % 2 === 0 ? Math.PI : 0; // curvatura mayor (π) y menor (0)
    let u = 0.12 + random(`vu${v}`) * 0.6, a = side + (random(`va${v}`) - 0.5) * 0.6;
    const pts: number[][] = [];
    const dir = random(`vd${v}`) > 0.5 ? 1 : -1;
    for (let k = 0; k < 9; k++) {
      pts.push(surfacePoint(Math.min(0.8, u), a, 1.012).toArray());
      a += dir * (0.16 + random(`vs${v}-${k}`) * 0.1);
      u += (random(`vk${v}-${k}`) - 0.5) * 0.025;
    }
    out.push(pts);
  }
  return out;
}

export type StomachState = { phase: number; amp: number; breath: number; acid: number; open: number; chyme: number };

export const Stomach: React.FC<{ s: StomachState; clip: THREE.Plane; frame: number }> = ({ s, clip, frame }) => {
  const cl = [clip];
  const m = useMemo(() => {
    const tex = tissueTexture();
    return {
      serosa: new THREE.MeshPhysicalMaterial({
        color: "#B23652", roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.28, sheen: 1, sheenColor: new THREE.Color("#FF8FB0"),
        sheenRoughness: 0.45, emissive: new THREE.Color("#3A0614"), emissiveIntensity: 0.6, bumpMap: tex, bumpScale: 0.6, clippingPlanes: cl,
      }),
      mucosa: new THREE.MeshPhysicalMaterial({
        color: "#D2557A", roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.15, sheen: 1, sheenColor: new THREE.Color("#FFB3C8"),
        emissive: new THREE.Color("#4A0A22"), emissiveIntensity: 0.7, bumpMap: tex, bumpScale: 0.4, clippingPlanes: cl,
      }),
      // cara de corte de la pared: músculo rojo oscuro (se ve al abrir)
      cutFace: new THREE.MeshStandardMaterial({ color: "#7A1730", roughness: 0.6, side: THREE.BackSide, clippingPlanes: cl }),
      vein: new THREE.MeshStandardMaterial({ color: "#4B1A5E", roughness: 0.35, emissive: new THREE.Color("#2A0A40"), emissiveIntensity: 0.5, clippingPlanes: cl }),
      artery: new THREE.MeshStandardMaterial({ color: "#E0405A", roughness: 0.3, emissive: new THREE.Color("#5A0A18"), emissiveIntensity: 0.6, clippingPlanes: cl }),
      acid: new THREE.MeshPhysicalMaterial({ color: "#E8A21C", emissive: new THREE.Color("#C77A00"), emissiveIntensity: 0.9, transparent: true, opacity: 0.7, roughness: 0.05, clearcoat: 1, clippingPlanes: cl }),
    };
  }, [clip]);
  const outer = useMemo(() => buildGeo(false), []);
  const inner = useMemo(() => buildGeo(true), []);
  const veins = useMemo(() => veinPaths().map((pts, i) => {
    const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(c, 60, i % 3 === 0 ? 0.016 : 0.01, 6, false);
  }), []);
  const eso = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.05, 3.3, -0.1), new THREE.Vector3(-0.05, 2.6, -0.05), new THREE.Vector3(-0.3, 1.95, 0.0), new THREE.Vector3(-0.45, 1.7, 0.02)]), 40, 0.15, 24, false), []);

  updateGeo(outer, false, s.phase, s.amp, s.breath);
  updateGeo(inner, true, s.phase, s.amp, s.breath);

  // ácido dorado en el fondo del cuerpo + partículas de quimo hacia el píloro
  const chyme: number[][] = [];
  for (let i = 0; i < 26; i++) {
    const u = 0.25 + ((frame / 260 + random(`ch${i}`)) % 1) * 0.5;
    const c = centerPoint(u);
    const r = radiusAt(u) * waveAt(u, s.phase, s.amp) * 0.5;
    chyme.push([c.x + (random(`cx${i}`) - 0.5) * r, c.y - r * 0.4 + (random(`cy${i}`) - 0.5) * r * 0.6, c.z + (random(`cz${i}`) - 0.5) * r]);
  }
  const acidC = centerPoint(0.36);
  return (
    <group>
      <mesh geometry={outer} material={m.serosa} castShadow receiveShadow />
      <mesh geometry={outer} material={m.cutFace} />
      <mesh geometry={inner} material={m.mucosa} />
      {veins.map((g, i) => <mesh key={i} geometry={g} material={i % 3 === 0 ? m.artery : m.vein} />)}
      <mesh geometry={eso} material={m.serosa} castShadow />
      {/* charco de ácido (visible al abrir) */}
      <mesh position={[acidC.x + 0.05, acidC.y - 0.28 + Math.sin(frame / 9) * 0.01, acidC.z]} rotation={[0.1, 0, 0.15]} scale={[0.46, 0.09, 0.4]} material={m.acid}>
        <sphereGeometry args={[1, 32, 20]} />
      </mesh>
      <Glow position={[acidC.x, acidC.y - 0.2, acidC.z + 0.25]} color="#FFB020" size={1.1} opacity={s.acid * s.open * 0.45} />
      {s.open > 0.05 && Array.from({ length: 14 }).map((_, i) => {
        const life = (frame / 40 + random(`bub${i}`)) % 1;
        return <Glow key={`b${i}`} position={[acidC.x + (random(`bx${i}`) - 0.5) * 0.7, acidC.y - 0.26 + life * 0.5, acidC.z + (random(`bz${i}`) - 0.5) * 0.5]} color="#FFE07A" size={0.09} opacity={s.open * Math.sin(Math.PI * life)} />;
      })}
      <pointLight position={[acidC.x, acidC.y, acidC.z + 0.2]} color="#FFB020" intensity={s.acid * s.open * 1.6} distance={2.2} decay={2} />
      {s.chyme > 0.01 && chyme.map((p, i) => <Glow key={i} position={p} color={i % 3 ? "#FFC83D" : "#FFE9B0"} size={0.16} opacity={s.chyme * 0.8} />)}
    </group>
  );
};
