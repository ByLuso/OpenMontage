// Carga de modelos anatómicos reales (GLB generados desde BodyParts3D) con delayRender.
// Devuelve un mapa nombreDeGrupo → BufferGeometry (o null mientras carga).
import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type Geos = Record<string, THREE.BufferGeometry>;
const cache: Record<string, Promise<Geos>> = {};

function load(file: string): Promise<Geos> {
  if (!cache[file]) {
    cache[file] = new Promise((resolve, reject) => {
      new GLTFLoader().load(staticFile(file), (g) => {
        const out: Geos = {};
        g.scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            const geo = m.geometry.clone();
            geo.applyMatrix4(m.matrixWorld);
            if (!geo.getAttribute("normal")) geo.computeVertexNormals();
            out[m.name || m.geometry.name] = geo;
          }
        });
        resolve(out);
      }, undefined, reject);
    });
  }
  return cache[file];
}

const ready: Record<string, Geos> = {};

/** Llamar en la composición (fuera del lienzo 3D): retiene el render hasta que el modelo está cargado. */
export function usePreloadModel(file: string): boolean {
  const [ok, setOk] = useState(!!ready[file]);
  const [handle] = useState(() => (ready[file] ? null : delayRender(`modelo ${file}`, { timeoutInMilliseconds: 120000 })));
  useEffect(() => {
    if (ready[file]) return;
    load(file).then((g) => { ready[file] = g; setOk(true); }).catch((e) => { console.error("modelo", file, e); if (handle !== null) continueRender(handle); });
  }, [file, handle]);
  useEffect(() => { if (ok && handle !== null) { const id = requestAnimationFrame(() => continueRender(handle)); return () => cancelAnimationFrame(id); } }, [ok, handle]);
  return ok;
}

/** Dentro del lienzo 3D: geometrías ya cargadas (null si aún no). */
export function useModel(file: string): Geos | null {
  return ready[file] ?? null;
}

/** Textura de ruido para bumpMap (detalle fino de tejido). */
export function tissueNoise(seed = 1, size = 256) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const ctx = c.getContext("2d")!; const img = ctx.createImageData(size, size);
  let s = seed * 9301 + 49297;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const base = new Float32Array(size * size).map(() => rnd());
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let v = 0, n = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { v += base[((y + dy + size) % size) * size + ((x + dx + size) % size)]; n++; }
    const k = Math.floor((v / n) * 255); const i = (y * size + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = k; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
