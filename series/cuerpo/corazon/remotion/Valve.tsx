// Válvula de tres valvas (tipo aórtica) dentro de un vaso abierto: se abre cuando la sangre empuja hacia arriba
// y se cierra de golpe para que no vuelva hacia atrás ("puerta de un solo sentido").
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";

const R = 1.0;

/** Valva: sector de 120° que en cerrado forma una "cúpula" y al abrir gira sobre su borde exterior. */
function leafletGeo() {
  const g = new THREE.BufferGeometry();
  const NR = 14, NA = 24, pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NR; i++) for (let j = 0; j <= NA; j++) {
    const r = (i / NR) * R * 0.98, a = (-Math.PI / 3) + (j / NA) * (2 * Math.PI / 3);
    // coordenadas locales: x hacia el centro desde la bisagra (en x = 0 está la bisagra)
    const sag = -0.32 * Math.sin((Math.PI * (r / R))) * (1 - Math.abs((j / NA) * 2 - 1) * 0.3);
    pos.push(R - r * Math.cos(a) - (R - R * Math.cos(a)) * 0, sag, r * Math.sin(a) * 0.9);
    if (i < NR && j < NA) { const k = i * (NA + 1) + j; idx.push(k, k + NA + 1, k + 1, k + 1, k + NA + 1, k + NA + 2); }
  }
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export const Valve: React.FC<{ open: number; flow: number; frame: number; clip: THREE.Plane }> = ({ open, flow, frame, clip }) => {
  const geo = useMemo(() => leafletGeo(), []);
  const mats = useMemo(() => ({
    leaf: new THREE.MeshPhysicalMaterial({ color: "#EFB2C2", roughness: 0.3, clearcoat: 1, sheen: 1, sheenColor: new THREE.Color("#FFD6E0"), side: THREE.DoubleSide, transparent: true, opacity: 0.92, emissive: new THREE.Color("#4A1020"), emissiveIntensity: 0.4 }),
    wall: new THREE.MeshPhysicalMaterial({ color: "#B52D45", roughness: 0.4, clearcoat: 0.6, sheen: 1, sheenColor: new THREE.Color("#FF9AB0"), side: THREE.DoubleSide, clippingPlanes: [clip], emissive: new THREE.Color("#3A0612"), emissiveIntensity: 0.5 }),
    ring: new THREE.MeshStandardMaterial({ color: "#E8A0B0", roughness: 0.35 }),
  }), [clip]);
  // giro de apertura: 0 cerrado (horizontal) → ~78° abierto (pegado a la pared)
  const ang = open * 1.35;
  const blood: { p: number[]; a: number }[] = [];
  for (let i = 0; i < 46; i++) {
    const rr = Math.sqrt(random(`vr${i}`)) * 0.75, th = random(`vt${i}`) * Math.PI * 2;
    const life = (frame / 22 + random(`vl${i}`)) % 1;
    // con la válvula abierta suben; cerrada, se acumulan por debajo (rebotan) o por encima (no bajan)
    const y = flow > 0.5 ? -1.8 + life * 3.8 : (random(`side${i}`) > 0.5 ? 0.35 + life * 1.6 : -1.6 + Math.sin(life * Math.PI) * 0.9);
    blood.push({ p: [Math.cos(th) * rr, y, Math.sin(th) * rr], a: Math.sin(Math.PI * life) });
  }
  return (
    <group>
      {/* pared del vaso (abierta por delante) */}
      <mesh material={mats.wall} position={[0, 0.3, 0]}><cylinderGeometry args={[R * 1.06, R * 1.06, 4.2, 48, 1, true]} /></mesh>
      <mesh material={mats.ring} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[R * 1.02, 0.07, 12, 60]} /></mesh>
      {[0, 1, 2].map((k) => (
        <group key={k} rotation={[0, (k * 2 * Math.PI) / 3, 0]}>
          {/* la bisagra está en el borde (x = -R); la valva apunta al centro y gira hacia arriba */}
          <group position={[-R, 0, 0]} rotation={[0, 0, ang]}>
            <mesh geometry={geo} material={mats.leaf} position={[0, 0, 0]} castShadow />
          </group>
        </group>
      ))}
      {blood.map((b, i) => <Glow key={i} position={b.p} color="#FF3A4A" size={0.2} opacity={b.a * 0.9} />)}
      <Glow position={[0, 0.1, 0]} color="#FF7AB0" size={1.6} opacity={(1 - open) * 0.25} />
    </group>
  );
};
