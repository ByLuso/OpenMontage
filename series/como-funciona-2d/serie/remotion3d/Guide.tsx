// Personaje guía de la serie: esqueleto estilizado de porcelana blanca con grietas doradas
// (kintsugi), núcleo cian en el pecho y ojos grandes. 100 % procedural y determinista:
// sale idéntico en todos los episodios. Mide ~4,4 unidades de alto (pies en y = 0).
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { boneGeo, tubeGeo } from "./Parts";
import { mats, C } from "./theme3d";
import { Glow } from "./Glow";
import { lerp } from "./anim";

/** Pose: ángulos en radianes [x, y, z] por articulación + expresión. */
export type Pose = {
  root: number[];      // desplazamiento [x, y, z] (saltos, agacharse)
  rootRot: number[];   // giro del cuerpo entero
  spine: number[]; neck: number[]; head: number[];
  shL: number[]; elL: number[]; hnL: number[];
  shR: number[]; elR: number[]; hnR: number[];
  hipL: number[]; knL: number[]; hipR: number[]; knR: number[];
  curlL: number; curlR: number;   // 0 mano abierta · 1 puño
  eyeOpen: number;                // 0,6 entornados · 1 normal · 1,35 asombro
  look: number[];                 // dirección de la mirada [x, y] (-1..1)
  smile: number;                  // -1 duda · 0 neutro · 1 alegría · 2 "¡oh!"
  brow: number;                   // -1 enfado/duda · 0 · 1 sorpresa
};

const Z3 = [0, 0, 0];
export const POSES: Record<string, Pose> = {
  idle: {
    root: Z3, rootRot: Z3, spine: [0.04, 0, 0], neck: [0.02, 0, 0], head: [-0.04, 0, 0],
    shL: [0.05, 0, 0.18], elL: [-0.25, 0, 0], hnL: Z3, shR: [0.05, 0, -0.18], elR: [-0.25, 0, 0], hnR: Z3,
    hipL: [0, 0, 0.04], knL: [0.04, 0, 0], hipR: [0, 0, -0.04], knR: [0.04, 0, 0],
    curlL: 0.35, curlR: 0.35, eyeOpen: 1, look: [0, 0], smile: 0.4, brow: 0,
  },
  surprise: {
    root: [0, 0.18, 0], rootRot: Z3, spine: [-0.14, 0, 0], neck: [-0.1, 0, 0], head: [-0.12, 0, 0],
    shL: [-0.25, 0, 0.75], elL: [-0.35, 0, 1.75], hnL: [0, 0, 0.2], shR: [-0.25, 0, -0.75], elR: [-0.35, 0, -1.75], hnR: [0, 0, -0.2],
    hipL: [0, 0, 0.12], knL: [0.05, 0, 0], hipR: [0, 0, -0.12], knR: [0.05, 0, 0],
    curlL: 0, curlR: 0, eyeOpen: 1.38, look: [0, 0.1], smile: 2, brow: 1,
  },
  peek: { // inclinado hacia delante mirando algo a su derecha (hacia +x)
    root: [0, -0.12, 0], rootRot: [0, 0.55, 0], spine: [0.38, 0, -0.08], neck: [0.2, 0, 0], head: [0.1, 0.1, 0],
    shL: [-0.3, 0, 0.25], elL: [-0.6, 0, 0], hnL: Z3, shR: [-0.7, 0, -0.35], elR: [-0.8, 0, 0], hnR: Z3,
    hipL: [-0.15, 0, 0.06], knL: [0.3, 0, 0], hipR: [-0.15, 0, -0.06], knR: [0.3, 0, 0],
    curlL: 0.4, curlR: 0.2, eyeOpen: 1.15, look: [0.5, -0.4], smile: 0, brow: 0.6,
  },
  point: { // señala con el brazo derecho hacia +x
    root: Z3, rootRot: [0, 0.25, 0], spine: [0.02, 0, 0], neck: Z3, head: [0, 0.2, 0],
    shL: [0.05, 0, 0.2], elL: [-0.3, 0, 0], hnL: Z3, shR: [-0.1, -0.2, -1.45], elR: [0, -0.15, 0], hnR: Z3,
    hipL: [0, 0, 0.05], knL: [0.04, 0, 0], hipR: [0, 0, -0.05], knR: [0.04, 0, 0],
    curlL: 0.4, curlR: 0.75, eyeOpen: 1.05, look: [0.6, 0], smile: 0.8, brow: 0.2,
  },
  cheer: {
    root: [0, 0.3, 0], rootRot: Z3, spine: [-0.08, 0, 0], neck: [-0.06, 0, 0], head: [-0.15, 0, 0],
    shL: [0, 0, 2.6], elL: [-0.3, 0, 0], hnL: Z3, shR: [0, 0, -2.6], elR: [-0.3, 0, 0], hnR: Z3,
    hipL: [-0.2, 0, 0.1], knL: [0.4, 0, 0], hipR: [0.1, 0, -0.1], knR: [0.15, 0, 0],
    curlL: 0.9, curlR: 0.9, eyeOpen: 0.9, look: [0, 0.2], smile: 1, brow: 0.3,
  },
  think: { // duda: mano al mentón
    root: Z3, rootRot: [0, -0.15, 0], spine: [0.05, 0, 0.04], neck: [0, 0, 0.08], head: [0.05, -0.1, 0.14],
    shL: [0.1, 0, 0.18], elL: [-0.3, 0, 0], hnL: Z3, shR: [-1.1, 0.5, -0.3], elR: [-2.2, 0, 0], hnR: [0.3, 0, 0],
    hipL: [0, 0, 0.05], knL: [0.04, 0, 0], hipR: [0, 0, -0.05], knR: [0.04, 0, 0],
    curlL: 0.4, curlR: 0.6, eyeOpen: 0.85, look: [-0.4, 0.4], smile: -1, brow: -0.8,
  },
  hold: { // sujeta algo delante con las dos manos
    root: Z3, rootRot: Z3, spine: [0.06, 0, 0], neck: [0.1, 0, 0], head: [0.12, 0, 0],
    shL: [-0.9, 0, 0.12], elL: [-0.9, 0, 0], hnL: Z3, shR: [-0.9, 0, -0.12], elR: [-0.9, 0, 0], hnR: Z3,
    hipL: [0, 0, 0.05], knL: [0.04, 0, 0], hipR: [0, 0, -0.05], knR: [0.04, 0, 0],
    curlL: 0.55, curlR: 0.55, eyeOpen: 1.1, look: [0, -0.5], smile: 0.3, brow: 0.2,
  },
  showTwo: { // enseña un objeto en cada mano, brazos abiertos al frente
    root: Z3, rootRot: Z3, spine: [0.02, 0, 0], neck: Z3, head: [0, 0, 0],
    shL: [-1.0, 0, 0.55], elL: [-0.4, 0, 0], hnL: [0, 0, -0.2], shR: [-1.0, 0, -0.55], elR: [-0.4, 0, 0], hnR: [0, 0, 0.2],
    hipL: [0, 0, 0.06], knL: [0.04, 0, 0], hipR: [0, 0, -0.06], knR: [0.04, 0, 0],
    curlL: 0.6, curlR: 0.6, eyeOpen: 1.05, look: [0, 0], smile: 0.7, brow: 0.3,
  },
  wagNo: { // dedo índice levantado: "¡ni se te ocurra!"
    root: Z3, rootRot: [0, 0.1, 0], spine: [0.04, 0, 0], neck: [0.04, 0, 0], head: [0.04, 0, 0],
    shL: [0.05, 0, 0.2], elL: [-0.3, 0, 0], hnL: Z3, shR: [-0.35, 0.3, -0.4], elR: [-2.3, 0, 0], hnR: [0, 0, 0],
    hipL: [0, 0, 0.05], knL: [0.04, 0, 0], hipR: [0, 0, -0.05], knR: [0.04, 0, 0],
    curlL: 0.4, curlR: 0.85, eyeOpen: 0.95, look: [0, 0.1], smile: 0.2, brow: -0.6,
  },
  wave: {
    root: Z3, rootRot: Z3, spine: [0.02, 0, 0], neck: Z3, head: [0, 0, 0.08],
    shL: [0.05, 0, 0.18], elL: [-0.25, 0, 0], hnL: Z3, shR: [0, 0, -2.3], elR: [0, 0, -0.5], hnR: Z3,
    hipL: [0, 0, 0.05], knL: [0.04, 0, 0], hipR: [0, 0, -0.05], knR: [0.04, 0, 0],
    curlL: 0.35, curlR: 0, eyeOpen: 1, look: [0, 0], smile: 1, brow: 0.3,
  },
};

const mixArr = (a: number[], b: number[], t: number) => a.map((v, i) => lerp(v, b[i], t));
export function mixPose(a: Pose, b: Pose, t: number): Pose {
  const o: any = {};
  for (const k of Object.keys(a) as (keyof Pose)[]) {
    const va = a[k] as any, vb = b[k] as any;
    o[k] = Array.isArray(va) ? mixArr(va, vb, t) : lerp(va, vb, t);
  }
  return o;
}

/** Grietas de kintsugi: caminos aleatorios con semilla sobre una esfera. */
function sphereCracks(seed: string, r: number, n: number) {
  const out: number[][][] = [];
  for (let c = 0; c < n; c++) {
    let th = random(`${seed}-th-${c}`) * Math.PI * 2;
    let ph = 0.35 + random(`${seed}-ph-${c}`) * 1.4;
    const pts: number[][] = [];
    const steps = 9 + Math.floor(random(`${seed}-n-${c}`) * 6);
    for (let i = 0; i < steps; i++) {
      pts.push([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)]);
      th += (random(`${seed}-dt-${c}-${i}`) - 0.5) * 0.5;
      ph += 0.07 + (random(`${seed}-dp-${c}-${i}`) - 0.3) * 0.12;
    }
    out.push(pts);
  }
  return out;
}

const R = (v: number[]) => v as [number, number, number];

/** Hueso largo con su articulación: el grupo gira en la base y el hijo cuelga del extremo. */
const Limb: React.FC<{ len: number; r: number; rot: number[]; mat: THREE.Material; children?: React.ReactNode; down?: boolean }> =
  ({ len, r, rot, mat, children, down = true }) => (
    <group rotation={R(rot)}>
      <mesh geometry={boneGeo(len, r)} material={mat} rotation={[down ? Math.PI : 0, 0, 0]} castShadow />
      <mesh position={[0, down ? 0 : 0, 0]} material={mat} castShadow>
        <sphereGeometry args={[r * 1.25, 16, 12]} />
      </mesh>
      <group position={[0, down ? -len : len, 0]}>{children}</group>
    </group>
  );

const Hand: React.FC<{ curl: number; side: 1 | -1; mat: THREE.Material; gold: THREE.Material }> = ({ curl, side, mat }) => {
  const fingers = [-0.066, -0.022, 0.022, 0.066];
  return (
    <group>
      <mesh material={mat} position={[0, -0.08, 0]} scale={[1, 1.1, 0.45]} castShadow>
        <sphereGeometry args={[0.09, 16, 12]} />
      </mesh>
      {fingers.map((x, i) => {
        const L = i === 0 || i === 3 ? 0.085 : 0.105;
        // el índice se queda estirado cuando el puño señala (curl alto pero no del todo)
        const c = i === (side === 1 ? 0 : 3) && curl > 0.7 && curl < 0.9 ? 0.05 : curl;
        return (
          <group key={i} position={[x * side, -0.16, 0]} rotation={[-c * 1.3, 0, 0]}>
            <mesh geometry={boneGeo(L, 0.02)} material={mat} rotation={[Math.PI, 0, 0]} castShadow />
            <group position={[0, -L, 0]} rotation={[-c * 1.4, 0, 0]}>
              <mesh geometry={boneGeo(L * 0.8, 0.018)} material={mat} rotation={[Math.PI, 0, 0]} />
            </group>
          </group>
        );
      })}
      {/* pulgar */}
      <group position={[0.11 * -side, -0.06, 0.03]} rotation={[-0.5 - curl * 0.6, 0, side * 0.7]}>
        <mesh geometry={boneGeo(0.09, 0.022)} material={mat} rotation={[Math.PI, 0, 0]} castShadow />
      </group>
    </group>
  );
};

export const Guide: React.FC<{
  pose: Pose; position?: number[]; rotationY?: number; scale?: number; frame: number; coreBoost?: number;
}> = ({ pose, position = [0, 0, 0], rotationY = 0, scale = 1, frame, coreBoost = 0 }) => {
  const porcelain = useMemo(() => mats.porcelain(), []);
  const gold = useMemo(() => mats.gold(), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0A0F1A", roughness: 0.35 }), []);
  const iris = useMemo(() => mats.emissive(C.coldCore, 2.4), []);
  const core = useMemo(() => mats.emissive(C.cold, 3), []);
  const skullCracks = useMemo(() => sphereCracks("skull", 0.483, 5), []);
  const p = pose;
  // respiración y parpadeo deterministas
  const breath = Math.sin(frame / 22) * 0.012;
  const blinkPhase = (frame + 50) % 97;
  const blink = blinkPhase < 4 ? 0.15 : 1;
  const eyeY = p.eyeOpen * blink;
  const pulse = 1 + Math.sin(frame / 9) * 0.08 + coreBoost;

  const ribs = [0, 1, 2, 3, 4];
  return (
    <group position={R(position)} rotation={[0, rotationY, 0]} scale={scale}>
      <group position={[p.root[0], 2.0 + p.root[1], p.root[2]]} rotation={R(p.rootRot)}>
        {/* pelvis */}
        <mesh material={porcelain} scale={[1.35, 0.55, 0.8]} castShadow>
          <torusGeometry args={[0.2, 0.075, 12, 24]} />
        </mesh>
        <mesh material={gold} position={[0.13, 0.08, 0.13]} geometry={tubeGeo("pelvis-crack", [[0.0, 0.0, 0], [0.05, 0.04, 0.02], [0.09, 0.03, 0.01], [0.13, 0.07, 0]], 0.009, 20)} />
        {/* piernas */}
        {([1, -1] as const).map((s) => (
          <group key={s} position={[0.2 * s, -0.05, 0]}>
            <Limb len={0.95} r={0.065} rot={s === 1 ? p.hipL : p.hipR} mat={porcelain}>
              <Limb len={0.92} r={0.055} rot={s === 1 ? p.knL : p.knR} mat={porcelain}>
                <mesh material={porcelain} position={[0, -0.04, 0.1]} scale={[0.8, 0.45, 1.6]} castShadow>
                  <sphereGeometry args={[0.1, 16, 12]} />
                </mesh>
              </Limb>
            </Limb>
          </group>
        ))}
        {/* columna y tórax */}
        <group rotation={R(p.spine)}>
          {Array.from({ length: 7 }).map((_, i) => (
            <mesh key={i} material={porcelain} position={[0, 0.12 + i * 0.115, -0.05]} castShadow>
              <cylinderGeometry args={[0.05, 0.055, 0.08, 14]} />
            </mesh>
          ))}
          <group position={[0, 0.9 + breath, 0]}>
            {/* costillas */}
            {ribs.map((i) => {
              const rr = 0.27 - Math.abs(i - 1.5) * 0.025;
              return (
                <group key={i} position={[0, -0.12 - i * 0.12, -0.02]} rotation={[Math.PI / 2 + 0.25, 0, 0]}>
                  <mesh material={porcelain} rotation={[0, 0, -Math.PI / 2 - 1.25]} scale={[1, 0.8, 1]} castShadow>
                    <torusGeometry args={[rr, 0.032, 10, 32, 2.5]} />
                  </mesh>
                  <mesh material={porcelain} rotation={[0, 0, -Math.PI / 2 + 1.25 - 2.5 + Math.PI]} scale={[1, 0.8, 1]} castShadow>
                    <torusGeometry args={[rr, 0.032, 10, 32, 2.5]} />
                  </mesh>
                  {i % 2 === 0 && (
                    <mesh material={gold} rotation={[0, 0, -Math.PI / 2 - 1.25 + 0.3 * i]} scale={[1, 0.8, 1]}>
                      <torusGeometry args={[rr + 0.001, 0.009, 6, 16, 0.5]} />
                    </mesh>
                  )}
                </group>
              );
            })}
            {/* esternón */}
            <mesh material={porcelain} position={[0, -0.3, 0.2]} rotation={[0.15, 0, 0]} castShadow>
              <capsuleGeometry args={[0.035, 0.38, 6, 12]} />
            </mesh>
            {/* núcleo cian */}
            <mesh material={core} position={[0, -0.32, 0.0]} scale={pulse}>
              <sphereGeometry args={[0.13, 24, 18]} />
            </mesh>
            <Glow position={[0, -0.32, 0.05]} color={C.cold} size={0.9 * pulse} opacity={0.85} />
            <pointLight position={[0, -0.32, 0.05]} color={C.cold} intensity={1.2 * pulse} distance={1.6} decay={2} />
            {/* clavículas */}
            {([1, -1] as const).map((s) => (
              <mesh key={s} material={porcelain} position={[0.2 * s, 0.03, 0.08]} rotation={[0, 0, (Math.PI / 2 - 0.15) * s]} castShadow>
                <capsuleGeometry args={[0.03, 0.34, 6, 12]} />
              </mesh>
            ))}
            <mesh material={gold} geometry={tubeGeo("clav-crack", [[0.12, 0.06, 0.11], [0.18, 0.04, 0.115], [0.24, 0.055, 0.11]], 0.008, 16)} />
            {/* brazos */}
            {([1, -1] as const).map((s) => {
              const left = s === 1;
              return (
                <group key={s} position={[0.4 * s, 0.0, 0.0]}>
                  <Limb len={0.74} r={0.05} rot={left ? p.shL : p.shR} mat={porcelain}>
                    <Limb len={0.68} r={0.042} rot={left ? p.elL : p.elR} mat={porcelain}>
                      <group rotation={R(left ? p.hnL : p.hnR)}>
                        <Hand curl={left ? p.curlL : p.curlR} side={s} mat={porcelain} gold={gold} />
                      </group>
                    </Limb>
                  </Limb>
                </group>
              );
            })}
            {/* cuello y cabeza */}
            <group position={[0, 0.08, 0]} rotation={R(p.neck)}>
              {[0, 1, 2].map((i) => (
                <mesh key={i} material={porcelain} position={[0, 0.07 + i * 0.1, -0.02]} castShadow>
                  <cylinderGeometry args={[0.045, 0.05, 0.07, 12]} />
                </mesh>
              ))}
              <group position={[0, 0.72, 0]} rotation={R(p.head)}>
                {/* cráneo */}
                <mesh material={porcelain} scale={[1, 1.0, 0.94]} castShadow>
                  <sphereGeometry args={[0.48, 48, 36]} />
                </mesh>
                {skullCracks.map((pts, i) => (
                  <mesh key={i} material={gold} scale={[1, 1, 0.94]} geometry={tubeGeo(`skull-${i}`, pts, 0.0075, 60)} />
                ))}
                {/* pómulos y mandíbula */}
                <mesh material={porcelain} position={[0, -0.33, 0.12]} scale={[0.95, 0.5, 0.85]} castShadow>
                  <sphereGeometry args={[0.3, 32, 20]} />
                </mesh>
                {/* sonrisa tallada: arco cuya curvatura depende de smile */}
                <Mouth smile={p.smile} mat={dark} />
                {/* cejas de porcelana */}
                {([1, -1] as const).map((s) => (
                  <mesh key={s} material={porcelain} position={[0.17 * s, 0.16 + p.brow * 0.025, 0.42]}
                    rotation={[0.2, 0, Math.PI / 2 - s * p.brow * 0.3]} castShadow>
                    <capsuleGeometry args={[0.028, 0.13, 6, 10]} />
                  </mesh>
                ))}
                {/* ojos: cuenca oscura + iris cian + brillo */}
                {([1, -1] as const).map((s) => (
                  <group key={s} position={[0.165 * s, 0.0, 0.4]} rotation={[0, 0.3 * s, 0]} scale={[1, eyeY, 1]}>
                    <mesh material={dark} scale={[1, 1.15, 0.55]}>
                      <sphereGeometry args={[0.135, 24, 18]} />
                    </mesh>
                    <mesh material={iris} position={[p.look[0] * 0.035, p.look[1] * 0.035, 0.055]}>
                      <sphereGeometry args={[0.07, 20, 16]} />
                    </mesh>
                    <mesh position={[p.look[0] * 0.035 + 0.025, p.look[1] * 0.035 + 0.03, 0.11]}>
                      <sphereGeometry args={[0.018, 10, 8]} />
                      <meshBasicMaterial color="#FFFFFF" />
                    </mesh>
                    <Glow position={[p.look[0] * 0.035, p.look[1] * 0.035, 0.13]} color={C.cold} size={0.32} opacity={0.6} />
                  </group>
                ))}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

const Mouth: React.FC<{ smile: number; mat: THREE.Material }> = ({ smile, mat }) => {
  if (smile > 1.5) {
    // "¡oh!": anillo pequeño
    return (
      <mesh material={mat} position={[0, -0.27, 0.37]}>
        <torusGeometry args={[0.045, 0.014, 8, 20]} />
      </mesh>
    );
  }
  const curve = smile * 0.06;
  const pts = [-0.12, -0.06, 0, 0.06, 0.12].map((x) => [x, -0.27 - curve * (1 - Math.pow(x / 0.12, 2)), 0.385 - Math.abs(x) * 0.25]);
  const key = `mouth-${Math.round(smile * 20)}`;
  return <mesh material={mat} geometry={tubeGeo(key, pts, 0.011, 24)} />;
};
