// Cámara dirigida por claves (frame, pos, look, fov) con easing y "respiración".
// La misma función alimenta la cámara 3D y la proyección de etiquetas 2D.
import * as THREE from "three";
import { clamp01, easeIO, lerp, lerp3 } from "./anim";

export type CameraKey = { f: number; pos: number[]; look: number[]; fov?: number; breathe?: number };
export type CamState = { pos: number[]; look: number[]; fov: number };

export function cameraAt(keys: CameraKey[], frame: number): CamState {
  let a = keys[0], b = keys[0], t = 0;
  if (frame >= keys[keys.length - 1].f) { a = b = keys[keys.length - 1]; }
  else if (frame > keys[0].f) {
    for (let i = 0; i < keys.length - 1; i++) {
      if (frame <= keys[i + 1].f) { a = keys[i]; b = keys[i + 1]; t = easeIO(clamp01((frame - a.f) / Math.max(1, b.f - a.f))); break; }
    }
  }
  const pos = lerp3(a.pos, b.pos, t);
  const look = lerp3(a.look, b.look, t);
  const fov = lerp(a.fov ?? 30, b.fov ?? 30, t);
  const br = lerp(a.breathe ?? 1, b.breathe ?? 1, t);
  // respiración: leve deriva lateral y vertical para que ningún plano esté quieto
  pos[0] += Math.sin(frame / 47) * 0.05 * br;
  pos[1] += Math.sin(frame / 61 + 1) * 0.035 * br;
  return { pos, look, fov };
}

const tmpCam = new THREE.PerspectiveCamera(30, 1080 / 1920, 0.05, 80);
/** Proyecta un punto 3D a píxeles del fotograma 1080x1920. */
export function project(keys: CameraKey[], frame: number, p: number[]): { x: number; y: number; behind: boolean } {
  const c = cameraAt(keys, frame);
  tmpCam.fov = c.fov; tmpCam.aspect = 1080 / 1920;
  tmpCam.position.set(c.pos[0], c.pos[1], c.pos[2]);
  tmpCam.updateProjectionMatrix();
  tmpCam.lookAt(c.look[0], c.look[1], c.look[2]);
  tmpCam.updateMatrixWorld();
  const v = new THREE.Vector3(p[0], p[1], p[2]).project(tmpCam);
  return { x: (v.x + 1) / 2 * 1080, y: (1 - v.y) / 2 * 1920, behind: v.z > 1 };
}

/**
 * Plano "orbital": cámara a `dist` del objetivo, con azimut (0 = de frente, + hacia la derecha)
 * y elevación en grados. Baja el punto de mira para que el objetivo caiga en la banda de
 * escena (y 380-1140, centro en y ≈ 760) y no en el centro del fotograma.
 */
export function shot(f: number, target: number[], dist: number, az: number, el: number, fov = 30): CameraKey {
  const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
  const pos = [target[0] + dist * Math.cos(e) * Math.sin(a), target[1] + dist * Math.sin(e), target[2] + dist * Math.cos(e) * Math.cos(a)];
  const visH = 2 * dist * Math.tan((fov * Math.PI) / 360);
  const drop = visH * (200 / 1920); // la banda de escena está 200 px por encima del centro
  return { f, pos, look: [target[0], target[1] - drop, target[2]], fov };
}
