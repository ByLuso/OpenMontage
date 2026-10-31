// Generadores de geometría procedural reutilizables.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const cache = new Map<string, THREE.BufferGeometry>();
const memo = (key: string, make: () => THREE.BufferGeometry) => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key)!;
};

export const roundedBox = (w: number, h: number, d: number, r = 0.04, seg = 3) =>
  memo(`rb-${w}-${h}-${d}-${r}`, () => new RoundedBoxGeometry(w, h, d, seg, r));

/** Hueso: revolución con extremos más anchos (eje Y, de 0 a len). */
export const boneGeo = (len: number, r: number) =>
  memo(`bone-${len}-${r}`, () => {
    const pts: THREE.Vector2[] = [];
    const n = 16;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const knob = Math.exp(-Math.pow((t - 0.04) / 0.08, 2)) + Math.exp(-Math.pow((t - 0.96) / 0.08, 2));
      const rad = r * (0.72 + 0.55 * knob);
      pts.push(new THREE.Vector2(rad, t * len));
    }
    pts.unshift(new THREE.Vector2(0.001, -r * 0.35));
    pts.push(new THREE.Vector2(0.001, len + r * 0.35));
    const g = new THREE.LatheGeometry(pts, 20);
    g.computeVertexNormals();
    return g;
  });

/** Tubo por curva. */
export const tubeGeo = (key: string, pts: number[][], radius: number, seg = 200, closed = false) =>
  memo(`tube-${key}-${radius}`, () =>
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), closed, "catmullrom", 0.1), seg, radius, 8, closed));

/** Polilínea en zigzag sobre un plano XY (resistencia de alambre). */
export const zigzag = (x0: number, x1: number, y0: number, y1: number, z: number, peaks: number) => {
  const pts: number[][] = [];
  for (let i = 0; i <= peaks * 2; i++) {
    const x = x0 + (x1 - x0) * (i / (peaks * 2));
    pts.push([x, i % 2 === 0 ? y0 : y1, z]);
  }
  return pts;
};

/** Muelle helicoidal entre dos alturas. */
export const helix = (r: number, y0: number, y1: number, turns: number) => {
  const pts: number[][] = [];
  const n = turns * 24;
  for (let i = 0; i <= n; i++) {
    const a = (i / 24) * Math.PI * 2;
    pts.push([Math.cos(a) * r, y0 + (y1 - y0) * (i / n), Math.sin(a) * r]);
  }
  return pts;
};
