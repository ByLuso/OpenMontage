// Partículas con estela sobre una curva (corriente, fluido, calor, vapor), emisivas y aditivas.
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { glowTexture } from "./Glow";

export const Flow: React.FC<{
  points: number[][]; frame: number; color: string; count?: number; speed?: number; size?: number;
  trail?: number; opacity?: number; closed?: boolean; seed?: string; jitter?: number;
}> = ({ points, frame, color, count = 24, speed = 0.01, size = 0.12, trail = 5, opacity = 1, closed = false, seed = "f", jitter = 0 }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), closed, "centripetal"), [JSON.stringify(points), closed]);
  const map = useMemo(() => glowTexture(), []);
  const geo = useMemo(() => {
    const n = count * trail;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    return g;
  }, [count, trail]);
  if (opacity <= 0.001) return null;
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const col = geo.getAttribute("color") as THREE.BufferAttribute;
  const c = new THREE.Color(color);
  let k = 0;
  for (let i = 0; i < count; i++) {
    const off = random(`${seed}-${i}`);
    for (let j = 0; j < trail; j++) {
      let u = (i / count + off * 0.3 / count + frame * speed - j * 0.006) % 1;
      if (u < 0) u += 1;
      const p = curve.getPointAt(u);
      if (jitter) {
        p.x += (random(`${seed}-jx-${i}`) - 0.5) * jitter;
        p.z += (random(`${seed}-jz-${i}`) - 0.5) * jitter;
      }
      pos.setXYZ(k, p.x, p.y, p.z);
      const fade = Math.pow(1 - j / trail, 1.6) * opacity;
      col.setXYZ(k, c.r * fade, c.g * fade, c.b * fade);
      k++;
    }
  }
  pos.needsUpdate = true; col.needsUpdate = true;
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial map={map} size={size} sizeAttenuation vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
};

/** Vapor / aire: partículas que suben y se abren desde una zona. */
export const Rise: React.FC<{ origin: number[]; spread: number[]; height: number; frame: number; color?: string; count?: number; opacity?: number; seed?: string; size?: number }> =
  ({ origin, spread, height, frame, color = "#FFFFFF", count = 40, opacity = 0.6, seed = "r", size = 0.35 }) => {
    const map = useMemo(() => glowTexture(), []);
    const geo = useMemo(() => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      return g;
    }, [count]);
    if (opacity <= 0.001) return null;
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    const col = geo.getAttribute("color") as THREE.BufferAttribute;
    const c = new THREE.Color(color);
    for (let i = 0; i < count; i++) {
      const life = ((frame / 70 + random(`${seed}-l-${i}`)) % 1);
      const x = origin[0] + (random(`${seed}-x-${i}`) - 0.5) * spread[0] + Math.sin(frame / 20 + i) * 0.08 * life;
      const z = origin[2] + (random(`${seed}-z-${i}`) - 0.5) * spread[2];
      pos.setXYZ(i, x, origin[1] + life * height, z);
      const a = Math.sin(Math.PI * life) * opacity;
      col.setXYZ(i, c.r * a, c.g * a, c.b * a);
    }
    pos.needsUpdate = true; col.needsUpdate = true;
    return (
      <points geometry={geo} frustumCulled={false}>
        <pointsMaterial map={map} size={size} sizeAttenuation vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    );
  };
