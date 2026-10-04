// Tostadora procedural en corte transversal (1 unidad = 10 cm). Cuerpo centrado en x = 0, z = 0; base en y = 0.
// Estado animable: lift (0 abajo · 1 arriba), heat, magnet, toast, ghostA, micaGlow, knob.
import React, { useMemo } from "react";
import * as THREE from "three";
import { roundedBox, zigzag, tubeGeo, helix } from "./kit3d/Parts";
import { C, mats } from "./kit3d/theme3d";
import { Glow } from "./kit3d/Glow";
import { Flow } from "./kit3d/Flow";
import { lerp } from "./kit3d/anim";
import { random } from "remotion";

export const TOASTER = {
  W: 2.8, H: 1.9, D: 1.7,
  slotX: [-1.15, 0.85], slotA: [0.1, 0.48], slotB: [-0.48, -0.1],
  plateZ: [0.55, 0.0, -0.55], plateX: [-1.1, 0.8], plateY: [0.3, 1.7],
  breadZ: [0.29, -0.29], breadX: -0.15, liftUp: 0.75,
  sledX: 1.08, magnet: [1.08, 0.18, 0.36], knob: [1.42, 0.42, 0.42],
};

export type ToasterState = { lift: number; heat: number; magnet: number; toast: number; ghostA: number; micaGlow: number; knob: number; flow: number; endGhost?: number };

// Silueta de rebanada de pan (con copete arriba), centrada en x, base en y = 0.
function breadShape() {
  const s = new THREE.Shape();
  const w = 0.75, h = 1.05;
  s.moveTo(-w, 0.05);
  s.quadraticCurveTo(-w, 0, -w + 0.05, 0);
  s.lineTo(w - 0.05, 0);
  s.quadraticCurveTo(w, 0, w, 0.05);
  s.lineTo(w, h);
  s.bezierCurveTo(w + 0.12, h + 0.15, w - 0.05, h + 0.36, w * 0.45, h + 0.3);
  s.bezierCurveTo(w * 0.2, h + 0.42, -w * 0.2, h + 0.42, -w * 0.45, h + 0.3);
  s.bezierCurveTo(-w + 0.05, h + 0.36, -w - 0.12, h + 0.15, -w, h);
  s.closePath();
  return s;
}

// Textura de miga: poros con semilla (determinista), se multiplica por el color del tostado.
let crumbTex: THREE.Texture | null = null;
function crumbTexture() {
  if (crumbTex) return crumbTex;
  const n = 256, cv = document.createElement("canvas");
  cv.width = cv.height = n;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 900; i++) {
    const x = random(`cx${i}`) * n, y = random(`cy${i}`) * n, r = 0.6 + random(`cr${i}`) * 2.6;
    g.fillStyle = `rgba(120,95,60,${0.12 + random(`ca${i}`) * 0.25})`;
    g.beginPath(); g.ellipse(x, y, r * 1.3, r, random(`ct${i}`) * 3, 0, Math.PI * 2); g.fill();
  }
  crumbTex = new THREE.CanvasTexture(cv);
  crumbTex.wrapS = crumbTex.wrapT = THREE.RepeatWrapping;
  crumbTex.repeat.set(0.9, 0.9);
  return crumbTex;
}

const crumbColor = (toast: number) => {
  const a = new THREE.Color("#EAD7A6"), b = new THREE.Color("#C98B3E"), c = new THREE.Color("#1B120C");
  return toast <= 1 ? a.lerp(b, toast) : b.lerp(c, Math.min(1, toast - 1));
};

export const Bread: React.FC<{ toast: number; opacity?: number; clip?: THREE.Plane[]; position?: number[]; scale?: number; rotation?: number[] }> =
  ({ toast, opacity = 1, clip, position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }) => {
    const geo = useMemo(() => {
      const g = new THREE.ExtrudeGeometry(breadShape(), { depth: 0.12, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.03, bevelSegments: 3, curveSegments: 24 });
      g.translate(0, 0, -0.06);
      return g;
    }, []);
    const crumb = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.85, map: crumbTexture() }), []);
    const crust = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.7 }), []);
    crumb.color.copy(crumbColor(toast));
    crust.color.copy(crumbColor(Math.min(2, toast + 0.55))).multiplyScalar(0.85);
    for (const m of [crumb, crust]) {
      m.transparent = opacity < 0.999; m.opacity = opacity; m.depthWrite = opacity > 0.6;
      m.clippingPlanes = clip ?? [];
    }
    return <mesh geometry={geo} material={[crumb, crust]} position={position as any} scale={scale} rotation={rotation as any} castShadow={opacity > 0.6} />;
  };

export const Toaster: React.FC<{ s: ToasterState; clip: THREE.Plane; frame: number }> = ({ s, clip, frame }) => {
  const T = TOASTER;
  const cl = [clip];
  const m = useMemo(() => ({
    shell: new THREE.MeshStandardMaterial({ color: "#C9D2DC", metalness: 0.9, roughness: 0.32, clippingPlanes: cl }),
    shellIn: mats.cut({ clip: cl }),
    shellEnd: new THREE.MeshStandardMaterial({ color: "#C9D2DC", metalness: 0.9, roughness: 0.32, clippingPlanes: cl, transparent: true }),
    steel: mats.steel({ clip: cl }),
    dark: mats.darkPlastic({ clip: cl }),
    mica: new THREE.MeshPhysicalMaterial({ color: "#D9C9A8", roughness: 0.25, metalness: 0, transparent: true, opacity: 0.88, sheen: 0.5, clippingPlanes: cl, side: THREE.DoubleSide }),
    wire: new THREE.MeshStandardMaterial({ color: "#5C4F47", metalness: 0.6, roughness: 0.4, clippingPlanes: cl }),
    copper: mats.copper({ clip: cl }),
    pcb: new THREE.MeshStandardMaterial({ color: "#1E6B47", roughness: 0.5, clippingPlanes: cl }),
    chip: new THREE.MeshStandardMaterial({ color: "#11161F", roughness: 0.4, clippingPlanes: cl }),
    magnetGlow: new THREE.MeshStandardMaterial({ color: C.steel, metalness: 0.8, roughness: 0.3, clippingPlanes: cl }),
  }), [clip]);

  // estados
  const hot = new THREE.Color("#5C4F47").lerp(new THREE.Color(C.hot), Math.min(1, s.heat * 1.3));
  m.wire.color.copy(hot);
  m.wire.emissive.set("#FF4A0A");
  m.wire.emissiveIntensity = s.heat * 1.5;
  m.mica.emissive.set("#FFB45E");
  m.mica.emissiveIntensity = s.micaGlow * 0.25 + s.heat * 0.03;
  m.magnetGlow.emissive.set(C.cold);
  m.magnetGlow.emissiveIntensity = s.magnet * 1.6;
  const eg = s.endGhost ?? 0;
  m.shellEnd.opacity = 1 - eg * 0.85;
  m.shellEnd.depthWrite = eg < 0.3;

  const liftY = s.lift * T.liftUp;
  const W2 = T.W / 2, D2 = T.D / 2, th = 0.06;

  // muros: frente, fondo, extremos, base y tiras de la tapa (con las 2 ranuras)
  const walls: [number[], number[]][] = [
    [[0, T.H / 2, D2 - th / 2], [T.W, T.H, th]],
    [[0, T.H / 2, -D2 + th / 2], [T.W, T.H, th]],
    [[-W2 + th / 2, T.H / 2, 0], [th, T.H, T.D]],
    [[W2 - th / 2, T.H / 2, 0], [th, T.H, T.D]],
    [[0, 0.03, 0], [T.W, th, T.D]],
    [[0, T.H - th / 2, (T.slotA[1] + D2) / 2], [T.W, th, D2 - T.slotA[1]]],
    [[0, T.H - th / 2, 0], [T.W, th, T.slotA[0] * 2]],
    [[0, T.H - th / 2, (T.slotB[0] - D2) / 2], [T.W, th, D2 + T.slotB[0]]],
    [[(-W2 + T.slotX[0]) / 2, T.H - th / 2, 0], [T.slotX[0] + W2, th, T.slotA[1] * 2]],
    [[(W2 + T.slotX[1]) / 2, T.H - th / 2, 0], [W2 - T.slotX[1], th, T.slotA[1] * 2]],
  ];

  const wires = useMemo(() => {
    const out: { key: string; pts: number[][] }[] = [];
    const zs = [T.plateZ[0] - 0.025, T.plateZ[1] + 0.025, T.plateZ[1] - 0.025, T.plateZ[2] + 0.025];
    zs.forEach((z, i) => out.push({ key: `w${i}`, pts: zigzag(T.plateX[0] + 0.06, T.plateX[1] - 0.06, T.plateY[0] + 0.08, T.plateY[1] - 0.08, z, 12) }));
    return out;
  }, []);
  const spring = useMemo(() => tubeGeo("spring", helix(0.07, 0, 1, 9), 0.012, 400), []);
  const coil = useMemo(() => tubeGeo("coil", helix(0.1, 0, 0.16, 8), 0.016, 300), []);

  // brillo de las resistencias (sprites aditivos en vez de bloom)
  const glows: number[][] = [];
  for (const z of [T.plateZ[0] - 0.05, 0.05, -0.05, T.plateZ[2] + 0.05])
    for (let i = 0; i < 4; i++) glows.push([lerp(T.plateX[0] + 0.25, T.plateX[1] - 0.25, i / 3), 1.0, z]);

  const flick = 0.92 + 0.08 * Math.sin(frame / 3.1) * Math.sin(frame / 7.3);

  return (
    <group>
      {/* carcasa */}
      {walls.map(([p, sz], i) => (
        <group key={i}>
          <mesh geometry={roundedBox(sz[0], sz[1], sz[2], 0.025)} material={i === 3 ? m.shellEnd : m.shell} position={p as any} castShadow receiveShadow />
          {!(i === 3 && eg > 0.3) && <mesh geometry={roundedBox(sz[0], sz[1], sz[2], 0.025)} material={m.shellIn} position={p as any} />}
        </group>
      ))}
      {/* patas */}
      {[[-1.2, 0.6], [1.2, 0.6], [-1.2, -0.6], [1.2, -0.6]].map(([x, z], i) => (
        <mesh key={i} material={m.dark} position={[x, -0.02, z]}>
          <cylinderGeometry args={[0.09, 0.1, 0.06, 16]} />
        </mesh>
      ))}
      {/* placas de mica + resistencias */}
      {T.plateZ.map((z, i) => (
        <mesh key={i} material={m.mica} position={[(T.plateX[0] + T.plateX[1]) / 2, (T.plateY[0] + T.plateY[1]) / 2, z]}>
          <boxGeometry args={[T.plateX[1] - T.plateX[0], T.plateY[1] - T.plateY[0], 0.02]} />
        </mesh>
      ))}
      {wires.map((w) => <mesh key={w.key} geometry={tubeGeo(w.key, w.pts, 0.016, 260)} material={m.wire} />)}
      {glows.map((p, i) => (
        <Glow key={i} position={p.map((v, k) => (k === 2 && clip.constant < p[2] ? 99 : v))} color={C.hot} size={1.1} scaleY={1.4} opacity={s.heat * 0.28 * flick} />
      ))}
      <pointLight position={[-0.15, 1.0, 0.29]} color={C.hot} intensity={s.heat * 1.4 * flick} distance={2.5} decay={2} />
      <pointLight position={[-0.15, 1.0, -0.29]} color={C.hot} intensity={s.heat * 0.9 * flick} distance={2.5} decay={2} />
      {/* corriente (amarillo) recorriendo la resistencia central */}
      <Flow points={wires[1].pts} frame={frame} color={C.flow} count={16} speed={0.004} size={0.09} trail={6} opacity={s.flow} seed="wire" />
      {/* rejillas guía a ambos lados de cada rebanada */}
      {[0.12, 0.46, -0.12, -0.46].map((z, i) =>
        [-0.9, -0.3, 0.3].map((x, j) => (
          <mesh key={`${i}-${j}`} material={m.steel} position={[x, 1.0, z]}>
            <cylinderGeometry args={[0.012, 0.012, 1.25, 8]} />
          </mesh>
        )))}
      {/* carro: bandejas bajo el pan + trineo lateral */}
      <group position={[0, liftY, 0]}>
        {T.breadZ.map((z, i) => (
          <mesh key={i} material={m.steel} position={[-0.15, 0.28, z]}>
            <boxGeometry args={[1.7, 0.03, 0.16]} />
          </mesh>
        ))}
        <mesh material={m.steel} position={[0.42, 0.28, 0]}>
          <boxGeometry args={[1.3, 0.03, 0.06]} />
        </mesh>
        <mesh material={m.steel} position={[T.sledX, 0.3, 0]}>
          <boxGeometry args={[0.12, 0.3, 0.86]} />
        </mesh>
        {/* armadura del electroimán */}
        <mesh material={m.steel} position={[T.magnet[0], 0.15, T.magnet[2]]}>
          <boxGeometry args={[0.26, 0.03, 0.26]} />
        </mesh>
        {/* palanca */}
        <mesh material={m.steel} position={[1.3, 0.42, -0.1]}>
          <boxGeometry args={[0.4, 0.06, 0.08]} />
        </mesh>
        <mesh geometry={roundedBox(0.3, 0.14, 0.42, 0.05)} material={m.dark} position={[1.58, 0.42, -0.1]} castShadow />
      </group>
      {/* pan */}
      {T.breadZ.map((z, i) => (
        <Bread key={i} toast={s.toast} opacity={i === 0 ? 1 - s.ghostA * 0.8 : 1} clip={i === 0 ? [] : cl}
          position={[T.breadX, 0.32 + liftY, z]} />
      ))}
      {/* guía y muelle (se comprime al bajar) */}
      <mesh material={m.steel} position={[T.sledX, 0.95, -0.36]}>
        <cylinderGeometry args={[0.025, 0.025, 1.8, 10]} />
      </mesh>
      <mesh geometry={spring} material={m.steel} position={[T.sledX, 0.07, -0.36]} scale={[1, 0.08 + liftY * 0.98 + 0.06, 1]} />
      {/* electroimán: núcleo + bobina de cobre */}
      <group position={[T.magnet[0], 0.04, T.magnet[2]]}>
        <mesh material={m.magnetGlow} position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.12, 20]} />
        </mesh>
        <mesh geometry={coil} material={m.copper} position={[0, -0.02, 0]} />
        <Glow position={[0, 0.08, 0]} color={C.cold} size={0.8} opacity={s.magnet * 0.9} />
      </group>
      {/* placa del temporizador (dentro del extremo derecho) */}
      <group position={[1.12, 0.62, -0.62]}>
        <mesh material={m.pcb}><boxGeometry args={[0.42, 0.5, 0.03]} /></mesh>
        <mesh material={m.chip} position={[-0.06, 0.08, 0.03]}><boxGeometry args={[0.16, 0.12, 0.03]} /></mesh>
        <mesh material={m.chip} position={[0.1, -0.12, 0.03]}><boxGeometry args={[0.1, 0.08, 0.03]} /></mesh>
        <mesh material={m.copper} position={[0.12, 0.13, 0.08]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 0.12, 14]} /></mesh>
      </group>
      {/* rueda del tostado en el exterior */}
      <group position={T.knob as any} rotation={[0, 0, -Math.PI / 2]}>
        <mesh material={m.dark} rotation={[0, s.knob, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.14, 0.08, 28]} />
        </mesh>
        <mesh position={[Math.sin(s.knob) * 0.08, -0.045, Math.cos(s.knob) * 0.08]} rotation={[0, s.knob, 0]}>
          <boxGeometry args={[0.025, 0.012, 0.09]} />
          <meshStandardMaterial color={C.flow} emissive={C.flow} emissiveIntensity={1.2} />
        </mesh>
      </group>
      {/* cable */}
      <mesh material={mats.darkPlastic()} geometry={tubeGeo("cord", [[-1.3, 0.12, -0.84], [-1.6, 0.05, -1.2], [-2.6, 0.03, -1.4], [-4.2, 0.03, -1.0]], 0.035, 60)} />
    </group>
  );
};
