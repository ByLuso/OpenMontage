// Maniquí articulado (1,75 m) hecho con superficies de revolución: mira hacia +Z, raíz en la cadera.
// Cada articulación gira en orden YXZ: x = flexión, y = giro, z = lateral. En los segmentos que cuelgan (brazos,
// piernas) x negativa los lleva hacia delante; en los que suben (raíz, tronco, cuello, cabeza) es x positiva.
import React, { useMemo } from "react";
import * as THREE from "three";

type V3 = [number, number, number];
export type Pose = Partial<Record<Joint, V3>> & { root?: V3; rootRot?: V3 };
type Joint = "spine" | "chest" | "neck" | "head" | "shL" | "elL" | "wrL" | "shR" | "elR" | "wrR" | "hipL" | "knL" | "anL" | "hipR" | "knR" | "anR";

// perfil de revolución: radio r0 arriba → r1 abajo, con extremos redondeados
function limb(len: number, r0: number, r1: number, cap = 0.6) {
  const pts: THREE.Vector2[] = [], n = 28;
  for (let i = 0; i <= n; i++) {
    const t = i / n, y = -t * len;
    const base = r0 + (r1 - r0) * t;
    const ce = Math.min(1, Math.min(t, 1 - t) * len / (base * cap));
    pts.push(new THREE.Vector2(Math.max(0.0005, base * Math.sqrt(1 - (1 - ce) * (1 - ce))), y));
  }
  return new THREE.LatheGeometry(pts, 28);
}
// perfil libre [y, r] de abajo arriba
function lathe(prof: number[][]) {
  return new THREE.LatheGeometry(prof.map(([y, r]) => new THREE.Vector2(Math.max(0.0005, r), y)), 32);
}

const G = {
  pelvis: () => lathe([[-0.1, 0.0], [-0.09, 0.07], [-0.06, 0.13], [0.0, 0.155], [0.06, 0.145], [0.1, 0.12], [0.11, 0.0]]),
  abdomen: () => lathe([[0.0, 0.0], [0.01, 0.12], [0.08, 0.125], [0.16, 0.135], [0.2, 0.0]]),
  chest: () => lathe([[0.0, 0.0], [0.01, 0.135], [0.08, 0.16], [0.17, 0.175], [0.24, 0.17], [0.29, 0.12], [0.31, 0.0]]),
  neck: () => limb(0.11, 0.045, 0.05, 1.5),
  head: () => { const g = new THREE.SphereGeometry(0.1, 32, 24); g.scale(0.82, 1.12, 0.98); g.translate(0, 0.11, 0.012); return g; },
  upperArm: () => limb(0.29, 0.047, 0.037),
  foreArm: () => limb(0.255, 0.037, 0.028),
  hand: () => { const g = new THREE.SphereGeometry(0.05, 20, 14); g.scale(0.55, 1.5, 0.95); g.translate(0, -0.065, 0); return g; },
  thigh: () => limb(0.44, 0.075, 0.05),
  shin: () => limb(0.42, 0.05, 0.035),
  foot: () => { const g = new THREE.SphereGeometry(0.06, 20, 12); g.scale(0.75, 0.55, 2.0); g.translate(0, -0.03, 0.065); return g; },
  joint: () => new THREE.SphereGeometry(1, 20, 14),
};

export type Outfit = { skin: string; top?: string; legs?: string };

export const Mannequin: React.FC<{ pose: Pose; outfit?: Outfit; scale?: number }> = ({ pose, outfit = { skin: "#E4DDD2" }, scale = 1 }) => {
  const geo = useMemo(() => Object.fromEntries(Object.entries(G).map(([k, f]) => [k, f()])) as Record<keyof typeof G, THREE.BufferGeometry>, []);
  const mats = useMemo(() => {
    const mk = (c: string, sheen = 0.25) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.62, sheen, sheenRoughness: 0.6, sheenColor: new THREE.Color("#FFFFFF"), clearcoat: 0.08 });
    return { skin: mk(outfit.skin), top: mk(outfit.top ?? outfit.skin, 0.5), legs: mk(outfit.legs ?? outfit.skin, 0.4) };
  }, [outfit.skin, outfit.top, outfit.legs]);
  const r = (j: Joint) => (pose[j] ?? [0, 0, 0]) as V3;
  const E = (j: Joint) => new THREE.Euler(...r(j), "YXZ");
  const M: React.FC<{ g: THREE.BufferGeometry; m: THREE.Material; p?: V3; s?: number }> = ({ g, m, p = [0, 0, 0], s = 1 }) =>
    <mesh geometry={g} material={m} position={p} scale={s} castShadow receiveShadow />;
  const arm = (side: 1 | -1) => {
    const [sh, el, wr] = side === 1 ? (["shL", "elL", "wrL"] as Joint[]) : (["shR", "elR", "wrR"] as Joint[]);
    return (
      <group position={[0.185 * side, 0.245, -0.005]} rotation={E(sh)}>
        <M g={geo.joint} m={mats.top} s={0.052} />
        <M g={geo.upperArm} m={mats.top} />
        <group position={[0, -0.29, 0]} rotation={E(el)}>
          <M g={geo.joint} m={mats.skin} s={0.036} />
          <M g={geo.foreArm} m={mats.skin} />
          <group position={[0, -0.255, 0]} rotation={E(wr)}><M g={geo.hand} m={mats.skin} /></group>
        </group>
      </group>
    );
  };
  const leg = (side: 1 | -1) => {
    const [hp, kn, an] = side === 1 ? (["hipL", "knL", "anL"] as Joint[]) : (["hipR", "knR", "anR"] as Joint[]);
    return (
      <group position={[0.095 * side, -0.04, 0]} rotation={E(hp)}>
        <M g={geo.thigh} m={mats.legs} />
        <group position={[0, -0.44, 0]} rotation={E(kn)}>
          <M g={geo.joint} m={mats.legs} s={0.05} />
          <M g={geo.shin} m={mats.legs} />
          <group position={[0, -0.42, 0]} rotation={E(an)}><M g={geo.foot} m={mats.skin} /></group>
        </group>
      </group>
    );
  };
  return (
    <group position={pose.root ?? [0, 0.93, 0]} rotation={new THREE.Euler(...(pose.rootRot ?? [0, 0, 0]), "YXZ")} scale={scale}>
      <M g={geo.pelvis} m={mats.legs} p={[0, 0, 0]} s={1} />
      {leg(1)}{leg(-1)}
      <group position={[0, 0.08, 0]} rotation={E("spine")}>
        <group scale={[1, 1, 0.68]}><M g={geo.abdomen} m={mats.top} /></group>
        <group position={[0, 0.17, 0]} rotation={E("chest")}>
          <group scale={[1, 1, 0.62]}><M g={geo.chest} m={mats.top} /></group>
          {arm(1)}{arm(-1)}
          <group position={[0, 0.29, 0]} rotation={E("neck")}>
            <M g={geo.neck} m={mats.skin} p={[0, 0.11, 0]} />
            <group position={[0, 0.1, 0]} rotation={E("head")}><M g={geo.head} m={mats.skin} /></group>
          </group>
        </group>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- poses
const mix = (a: Pose, b: Pose, t: number): Pose => {
  const out: any = {};
  new Set([...Object.keys(a), ...Object.keys(b)]).forEach((k) => {
    const va = (a as any)[k] ?? [0, 0, 0], vb = (b as any)[k] ?? [0, 0, 0];
    out[k] = va.map((v: number, i: number) => v + (vb[i] - v) * t);
  });
  return out;
};
export { mix as mixPose };

/** Sentado en un asiento de altura `seat` (m). `cold` 0–1: encogido y abrazándose; `shiver` = temblor. */
export function sitPose(seat: number, cold: number, frame: number): Pose {
  const relaxed: Pose = {
    root: [0, seat + 0.1, 0], rootRot: [-0.22, 0, 0],
    hipL: [-1.75, 0.08, 0.05], knL: [1.55, 0, 0], anL: [-0.15, 0, 0],
    hipR: [-1.7, -0.12, -0.02], knR: [1.35, 0, 0], anR: [-0.25, 0, 0],
    spine: [-0.05, 0, 0], chest: [0.02, 0, 0], neck: [0.05, 0, 0], head: [0.08, 0.15, 0],
    shL: [-0.15, 0, 0.55], elL: [-0.35, 0, 0], wrL: [0, 0, 0],
    shR: [-0.35, 0, -0.22], elR: [-0.9, 0.3, 0], wrR: [0, 0, 0],
  };
  const sh = Math.sin(frame * 1.7) * 0.025 + Math.sin(frame * 2.9) * 0.015;
  const hug: Pose = {
    root: [0, seat + 0.1, 0.06], rootRot: [0.12, 0, 0],
    hipL: [-1.95, 0.1, 0.02], knL: [1.95, 0, 0], anL: [0.1, 0, 0],
    hipR: [-1.95, -0.1, -0.02], knR: [1.95, 0, 0], anR: [0.1, 0, 0],
    spine: [0.22, 0, sh], chest: [0.25, 0, sh * 0.6], neck: [0.2, 0, 0], head: [0.3, -0.1, 0],
    shL: [-0.75, 0, -0.18], elL: [-1.75, -0.95, 0], wrL: [0, 0, 0],
    shR: [-0.7, 0, 0.18], elR: [-1.8, 1.0, 0], wrR: [0, 0, 0],
  };
  return mix(relaxed, hug, cold);
}

/** Técnico arrodillado frente al armario, con el brazo derecho estirado hacia la válvula. */
export function kneelPose(reach: number): Pose {
  return {
    root: [0, 0.6, 0], rootRot: [-0.05, 0, 0],
    hipL: [-1.55, 0.05, 0.08], knL: [1.6, 0, 0], anL: [0.0, 0, 0],
    hipR: [-0.15, -0.05, -0.06], knR: [1.55, 0, 0], anR: [0.9, 0, 0],
    spine: [0.18 * reach + 0.05, 0, 0], chest: [0.12 * reach, 0.1 * reach, 0], neck: [-0.05, 0, 0], head: [-0.1, 0.12 * reach, 0],
    shL: [-0.35, 0, 0.12], elL: [-1.2, -0.3, 0], wrL: [0, 0, 0],
    shR: [-0.2 - 1.15 * reach, 0.0, -0.1 + 0.05 * reach], elR: [-0.35 - 0.35 * reach, 0, 0], wrR: [0, 0, -0.3 * reach],
  };
}

// ---------------------------------------------------------------- cinemática inversa del brazo derecho
const _o = { g: new THREE.Object3D(), r: new THREE.Object3D(), sp: new THREE.Object3D(), ch: new THREE.Object3D() };
_o.g.add(_o.r); _o.r.add(_o.sp); _o.sp.add(_o.ch);
/**
 * Devuelve la pose con el brazo derecho colocado para que la mano llegue a `target` (coordenadas de la escena).
 * `groupPos`/`groupRotY` son la posición y el giro del grupo que contiene al maniquí.
 */
export function reachRight(pose: Pose, groupPos: number[], groupRotY: number, target: number[]): Pose {
  _o.g.position.set(groupPos[0], groupPos[1], groupPos[2]); _o.g.rotation.set(0, groupRotY, 0);
  _o.r.position.set(...(pose.root ?? [0, 0.93, 0])); _o.r.rotation.copy(new THREE.Euler(...(pose.rootRot ?? [0, 0, 0]), "YXZ"));
  _o.sp.position.set(0, 0.08, 0); _o.sp.rotation.copy(new THREE.Euler(...(pose.spine ?? [0, 0, 0]), "YXZ"));
  _o.ch.position.set(0, 0.17, 0); _o.ch.rotation.copy(new THREE.Euler(...(pose.chest ?? [0, 0, 0]), "YXZ"));
  _o.g.updateMatrixWorld(true);
  const p = _o.ch.worldToLocal(new THREE.Vector3(...target)).sub(new THREE.Vector3(-0.185, 0.245, -0.005));
  const L1 = 0.29, L2 = 0.255 + 0.07;
  const d = Math.min(L1 + L2 - 0.005, Math.max(0.12, p.length()));
  const inner = Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2))));
  const e = -(Math.PI - inner);                                   // flexión del codo hacia delante
  const hy = -L1 - L2 * Math.cos(e), hz = -L2 * Math.sin(e);      // mano en el plano del brazo
  const phi = Math.atan2(hz, hy);
  const b = Math.acos(Math.min(1, Math.max(-1, p.y / d))) - phi;
  const zp = hy * Math.sin(b) + hz * Math.cos(b);
  const a = zp >= 0 ? Math.atan2(p.x, p.z) : Math.atan2(-p.x, -p.z);
  return { ...pose, shR: [b, a, 0], elR: [e, 0, 0], wrR: [0, 0, 0] };
}
