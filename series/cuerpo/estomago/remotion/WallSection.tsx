// Sección de la pared del estómago (modelo secundario): luz gástrica arriba y, hacia abajo,
// moco, epitelio con fositas y glándulas (células parietales que bombean ácido), submucosa,
// capa muscular y serosa. Estados: acid, mucus, rain, protein, renew.
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";
import { clamp01 } from "./kit3d/anim";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const WALL = { W: 4.2, D: 2.6, top: 0 };
// fositas gástricas (x, z) sobre la superficie
export const PITS: number[][] = [];
for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) PITS.push([-1.5 + i * 1.0 + (k % 2) * 0.5, -0.8 + k * 0.8]);

export type WallState = { acid: number; mucus: number; rain: number; protein: number; renew: number; hurt: number };

const Layer: React.FC<{ y0: number; y1: number; color: string; opacity?: number; rough?: number; emissive?: string; ei?: number }> =
  ({ y0, y1, color, opacity = 1, rough = 0.5, emissive = "#000000", ei = 0 }) => (
    <mesh position={[0, (y0 + y1) / 2, 0]} receiveShadow castShadow={opacity > 0.9}>
      <boxGeometry args={[WALL.W, y1 - y0, WALL.D]} />
      <meshPhysicalMaterial color={color} roughness={rough} transparent={opacity < 1} opacity={opacity} clearcoat={0.5}
        sheen={0.6} sheenColor="#FFB3C8" emissive={emissive} emissiveIntensity={ei} depthWrite={opacity > 0.6} />
    </mesh>
  );

export const WallSection: React.FC<{ s: WallState; frame: number }> = ({ s, frame }) => {
  const cell = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#E06A90", roughness: 0.3, clearcoat: 1, sheen: 1, sheenColor: new THREE.Color("#FFC2D4"), emissive: new THREE.Color("#5A0F2A"), emissiveIntensity: 0.5 }), []);
  const oldCell = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#8A6A76", roughness: 0.6, transparent: true }), []);
  const parietal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#F2A23A", emissive: new THREE.Color("#FFB020"), emissiveIntensity: 0.4, roughness: 0.35 }), []);
  parietal.emissiveIntensity = 0.3 + s.acid * 1.4 * (0.7 + 0.3 * Math.sin(frame / 5));
  const fiber = useMemo(() => new THREE.MeshStandardMaterial({ color: "#9C2238", roughness: 0.45, emissive: new THREE.Color("#30060F"), emissiveIntensity: 0.5 }), []);
  const mucusMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#9FE8FF", roughness: 0.05, transparent: true, clearcoat: 1, emissive: new THREE.Color("#2AA8D0"), emissiveIntensity: 0.25, depthWrite: false }), []);
  mucusMat.opacity = 0.42 * s.mucus;
  const proteinMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#C44457", roughness: 0.45, clearcoat: 0.6, sheen: 1, sheenColor: new THREE.Color("#FF9AAA"), transparent: true }), []);
  proteinMat.opacity = Math.min(1, s.protein * 1.5);

  // trozo de filete: icosaedro deformado con vetas (determinista)
  const chunkGeo = useMemo(() => {
    const g = mergeVertices(new THREE.IcosahedronGeometry(0.5, 4).deleteAttribute("normal").deleteAttribute("uv"));
    const p = g.getAttribute("position") as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = 1 + 0.12 * Math.sin(v.x * 9 + v.y * 4) * Math.cos(v.z * 7) + 0.06 * Math.sin(v.y * 23);
      v.multiply(new THREE.Vector3(1.25, 0.6, 0.9)).multiplyScalar(n);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const marble = useMemo(() => {
    const n = 256, cv = document.createElement("canvas"); cv.width = cv.height = n;
    const g = cv.getContext("2d")!; g.fillStyle = "#C44457"; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(255,225,230,${0.25 + random(`m${i}`) * 0.35})`; g.lineWidth = 1 + random(`mw${i}`) * 4;
      g.beginPath(); const y = random(`my${i}`) * n; g.moveTo(0, y); for (let x = 0; x <= n; x += 16) g.lineTo(x, y + Math.sin(x / 30 + i) * 14); g.stroke(); }
    return new THREE.CanvasTexture(cv);
  }, []);
  proteinMat.map = marble;
  // trocitos que se desprenden mientras se deshace
  const crumbs = s.protein > 0.01 && s.protein < 0.99 ? Array.from({ length: 18 }).map((_, i) => {
    const life = (frame / 30 + random(`cr${i}`)) % 1;
    const a = random(`ca${i}`) * Math.PI * 2;
    return [Math.cos(a) * (0.35 + life * 0.6), 1.05 + (random(`cy${i}`) - 0.5) * 0.3 - life * 0.3, Math.sin(a) * (0.3 + life * 0.5), 1 - life];
  }) : [];

  // células superficiales (epitelio): rejilla de cúpulas; en "renew" unas se van y otras nuevas crecen
  const cells = useMemo(() => {
    const out: { x: number; z: number; k: number }[] = [];
    for (let i = 0; i < 18; i++) for (let k = 0; k < 11; k++) {
      const x = -2.0 + i * 0.235 + (k % 2) * 0.117, z = -1.2 + k * 0.235;
      if (PITS.some(([px, pz]) => Math.hypot(px - x, pz - z) < 0.22)) continue;
      out.push({ x, z, k: out.length });
    }
    return out;
  }, []);

  // ácido saliendo de las fositas (subida) y lluvia de ácido que choca con el moco
  const acidUp: { p: number[]; a: number }[] = [];
  if (s.acid > 0.01) PITS.forEach(([px, pz], i) => {
    for (let j = 0; j < 4; j++) {
      const life = (frame / 45 + random(`au${i}-${j}`)) % 1;
      const y = -1.0 + life * 2.6;
      const spread = Math.max(0, y) * 0.35;
      acidUp.push({ p: [px + (random(`ax${i}${j}`) - 0.5) * spread, y, pz + (random(`az${i}${j}`) - 0.5) * spread], a: s.acid * Math.sin(Math.PI * life) });
    }
  });
  const rain: { p: number[]; c: string; a: number; size: number }[] = [];
  if (s.rain > 0.01) for (let i = 0; i < 40; i++) {
    const life = (frame / 38 + random(`r${i}`)) % 1;
    const x = (random(`rx${i}`) - 0.5) * 3.6, z = (random(`rz${i}`) - 0.5) * 2.2;
    const hitY = 0.32;
    const y = 2.4 - life * 2.6;
    if (y > hitY) rain.push({ p: [x, y, z], c: "#FFC83D", a: s.rain, size: 0.2 });
    else { // neutralizado: rebota un poco y se vuelve cian/blanco
      const k = (hitY - y) / 0.5;
      rain.push({ p: [x, hitY + Math.sin(Math.min(1, k) * Math.PI) * 0.12, z], c: "#8FE6FF", a: s.rain * Math.max(0, 1 - k), size: 0.26 });
    }
  }
  // pepsina: pequeños octaedros blancos rondando la proteína
  const pepsin = Array.from({ length: 10 }).map((_, i) => {
    const a = frame / 25 + i * 0.63;
    return [Math.cos(a) * (0.75 + 0.1 * Math.sin(i)), 1.05 + Math.sin(a * 1.7 + i) * 0.35, Math.sin(a) * 0.55];
  });

  return (
    <group>
      {/* capas, de abajo arriba */}
      <Layer y0={-2.45} y1={-2.38} color="#E8C6CF" rough={0.3} />
      <Layer y0={-2.38} y1={-1.65} color="#8E1E35" rough={0.5} emissive="#30060F" ei={0.4} />
      {/* fibras musculares (circular y longitudinal) asomando al frente */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`f${i}`} material={fiber} position={[0, -2.28 + i * 0.1, WALL.D / 2 + 0.01]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.04, WALL.W - 0.1, 4, 10]} />
        </mesh>
      ))}
      <Layer y0={-1.65} y1={-1.15} color="#E7A3B4" rough={0.55} />
      {/* mucosa semitransparente para ver las glándulas */}
      <Layer y0={-1.15} y1={0} color="#C9466B" opacity={0.5} rough={0.35} emissive="#3A0618" ei={0.4} />
      {/* glándulas: tubos con células parietales */}
      {PITS.map(([px, pz], i) => (
        <group key={`g${i}`} position={[px, 0, pz]}>
          <mesh position={[0, -0.55, 0]}>
            <cylinderGeometry args={[0.09, 0.07, 1.1, 14, 1, true]} />
            <meshStandardMaterial color="#5C0E26" side={THREE.DoubleSide} roughness={0.4} />
          </mesh>
          {[0, 1, 2, 3, 4].map((k) => (
            <mesh key={k} material={parietal} position={[Math.cos(k * 2.4) * 0.13, -0.3 - k * 0.17, Math.sin(k * 2.4) * 0.13]}>
              <sphereGeometry args={[0.065, 12, 10]} />
            </mesh>
          ))}
          <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.13, 20]} />
            <meshBasicMaterial color="#2A0512" />
          </mesh>
        </group>
      ))}
      {/* epitelio: células cúpula */}
      {cells.map(({ x, z, k }) => {
        const order = random(`ord${k}`);
        const leaving = clamp01((s.renew * 1.6 - order * 0.9) * 3); // células viejas que se desprenden
        const isOld = order < 0.35;
        const grow = isOld ? clamp01((s.renew * 1.6 - order * 0.9 - 0.25) * 3) : 1;
        const hurt = s.hurt * (random(`h${k}`) > 0.6 ? 1 : 0);
        return (
          <group key={k} position={[x, 0, z]}>
            {isOld && leaving < 1 && (
              <mesh material={oldCell} position={[0, 0.02 + leaving * 0.7, 0]} scale={[1 - leaving * 0.5, (1 - leaving * 0.5) * 0.55, 1 - leaving * 0.5]}>
                <sphereGeometry args={[0.11, 12, 8]} />
              </mesh>
            )}
            {(!isOld || grow > 0) && (
              <mesh material={hurt > 0 ? oldCell : cell} position={[0, 0.01, 0]} scale={[grow, grow * 0.55, grow]}>
                <sphereGeometry args={[0.11, 12, 8]} />
              </mesh>
            )}
            {isOld && grow > 0 && grow < 1 && <Glow position={[0, 0.12, 0]} color="#FF7AB0" size={0.35} opacity={(1 - grow) * 0.9} />}
          </group>
        );
      })}
      {/* moco + bicarbonato: lámina translúcida que crece */}
      {s.mucus > 0.01 && (
        <mesh material={mucusMat} position={[0, 0.16 * s.mucus, 0]} scale={[1, s.mucus, 1]}>
          <boxGeometry args={[WALL.W, 0.32, WALL.D]} />
        </mesh>
      )}
      {/* proteína (trozo de filete) que se deshace */}
      {s.protein > 0.01 && (
        <group position={[0, 1.05, 0]} rotation={[0.2, frame / 90, 0.1]} scale={(0.3 + 0.7 * s.protein) * 0.72}>
          <mesh material={proteinMat} geometry={chunkGeo} castShadow />
        </group>
      )}
      {s.protein > 0.01 && pepsin.map((p, i) => (
        <mesh key={`p${i}`} position={p as any} rotation={[frame / 20 + i, frame / 15, 0]} scale={Math.min(1, s.protein * 3 + 0.2)}>
          <octahedronGeometry args={[0.06]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {crumbs.map((c, i) => <Glow key={`c${i}`} position={[c[0], c[1], c[2]]} color="#FF8FA0" size={0.12} opacity={c[3] * 0.9} />)}
      {acidUp.map((q, i) => <Glow key={`a${i}`} position={q.p} color="#FFC83D" size={0.18} opacity={q.a} />)}
      {rain.map((q, i) => <Glow key={`r${i}`} position={q.p} color={q.c} size={q.size} opacity={q.a} />)}
    </group>
  );
};
