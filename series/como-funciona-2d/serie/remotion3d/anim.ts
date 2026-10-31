// Utilidades de animación deterministas (todo depende del frame).
import { Easing, interpolate, random } from "remotion";

export const easeIO = Easing.bezier(0.45, 0, 0.25, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: number[], b: number[], t: number) => a.map((v, i) => lerp(v, b[i], t));

/** 0→1 con easing entre f0 y f1. */
export const ramp = (f: number, f0: number, f1: number, ease = easeIO) =>
  interpolate(f, [f0, f1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

/** Muelle con rebote suave: 0→1 con overshoot. */
export const springy = (f: number, f0: number, dur = 18) => {
  const t = clamp01((f - f0) / dur);
  if (t <= 0) return 0;
  return 1 - Math.exp(-6 * t) * Math.cos(9 * t);
};

/** Ruido 1D suave y con semilla. */
export const noise1 = (seed: string, x: number) => {
  const i = Math.floor(x), fr = x - i;
  const a = random(`${seed}-${i}`), b = random(`${seed}-${i + 1}`);
  const s = fr * fr * (3 - 2 * fr);
  return a + (b - a) * s;
};

/** Interpola una lista de claves {f, v} con easing entre claves. */
export function keyed<T>(f: number, keys: { f: number; v: T }[], mix: (a: T, b: T, t: number) => T): T {
  if (f <= keys[0].f) return keys[0].v;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (f <= b.f) return mix(a.v, b.v, easeIO(clamp01((f - a.f) / Math.max(1, b.f - a.f))));
  }
  return keys[keys.length - 1].v;
}
