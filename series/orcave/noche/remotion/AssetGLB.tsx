// Modelos con materiales y texturas (Poly Haven, CC0) cargados con GLTFLoader.
// usePreloadAssets() en la composición retiene el render hasta tenerlos; <Asset> los clona dentro del lienzo 3D.
import React, { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const cache: Record<string, Promise<THREE.Group>> = {};
const ready: Record<string, THREE.Group> = {};

function load(file: string) {
  if (!cache[file]) cache[file] = new Promise((res, rej) => new GLTFLoader().load(staticFile(file), (g) => {
    g.scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    res(g.scene);
  }, undefined, rej));
  return cache[file];
}

export function usePreloadAssets(files: string[]): boolean {
  const key = files.join("|");
  const [ok, setOk] = useState(files.every((f) => ready[f]));
  const [h] = useState(() => (files.every((f) => ready[f]) ? null : delayRender(`assets ${key}`, { timeoutInMilliseconds: 180000 })));
  useEffect(() => {
    Promise.all(files.map((f) => load(f).then((s) => { ready[f] = s; }))).then(() => setOk(true)).catch((e) => { console.error(e); if (h !== null) continueRender(h); });
  }, [key]);
  useEffect(() => { if (ok && h !== null) { const id = requestAnimationFrame(() => continueRender(h)); return () => cancelAnimationFrame(id); } }, [ok, h]);
  return ok;
}

export const Asset: React.FC<{ file: string; position?: number[]; rotation?: number[]; scale?: number | number[]; tint?: string; tintK?: number }> =
  ({ file, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, tint, tintK = 0 }) => {
    const obj = useMemo(() => {
      const src = ready[file];
      if (!src) return null;
      const c = src.clone(true);
      // materiales propios por instancia (para poder teñir sin afectar a otras copias)
      c.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.material = (m.material as THREE.Material).clone(); });
      return c;
    }, [file]);
    if (!obj) return null;
    if (tint) obj.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) { const mat = m.material as THREE.MeshStandardMaterial; mat.emissive = new THREE.Color(tint); mat.emissiveIntensity = tintK; }
    });
    const s = typeof scale === "number" ? [scale, scale, scale] : scale;
    return <primitive object={obj} position={position as any} rotation={rotation as any} scale={s as any} />;
  };
