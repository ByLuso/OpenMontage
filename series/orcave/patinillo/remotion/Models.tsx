// Escenas 3D (escala real en metros): edificio en corte con aerotermia en cubierta y patinillo,
// y primer plano del armario del patinillo con las válvulas de cada vivienda.
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";
import { Flow, Rise } from "./kit3d/Flow";
import { roundedBox, tubeGeo } from "./kit3d/Parts";
import { Asset } from "./AssetGLB";

export const RED = "#E31B4F", HOT = "#FF7A1A", COLD = "#35C4F0";
const std = (color: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });
const glowMat = (color: string, k = 0.5) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: k, roughness: 0.4 });

function serpentine(x0: number, x1: number, z0: number, z1: number, y: number, runs: number) {
  const pts: number[][] = [];
  for (let i = 0; i < runs; i++) { const z = z0 + ((z1 - z0) * i) / (runs - 1); pts.push(i % 2 ? [x1, y, z] : [x0, y, z], i % 2 ? [x0, y, z] : [x1, y, z]); }
  return pts;
}
function rounded(pts: number[][], r = 0.15) {
  const out: number[][] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const p = new THREE.Vector3(...pts[i]), a = new THREE.Vector3(...pts[i - 1]), b = new THREE.Vector3(...pts[i + 1]);
    const da = a.clone().sub(p).normalize().multiplyScalar(r), db = b.clone().sub(p).normalize().multiplyScalar(r);
    out.push(p.clone().add(da).toArray(), p.clone().add(da.clone().add(db).multiplyScalar(0.35)).toArray(), p.clone().add(db).toArray());
  }
  out.push(pts[pts.length - 1]);
  return out;
}
const tube = (key: string, pts: number[][], r: number, seg = 200) => tubeGeo(key, rounded(pts, Math.min(0.15, r * 4)), r, seg);

// ================================================================ EDIFICIO
export const FH = 3.0;               // altura de planta
export const RISER = { hot: [-2.75, 0, -1.7], cold: [-2.45, 0, -1.7] };
export const THERMO = (i: number) => [-1.1, i * FH + 1.45, -1.98];
export type FloorState = { heat: number; cold: number; flow: number };
export type BuildingState = { floors: FloorState[]; roofRun: number; riserFlow: number; snow: number; xray: number; thermo: number; frame: number };

// pantalla del termostato: «21°» y modo calor, dibujada en un lienzo
function lcdMat() {
  const c = document.createElement("canvas"); c.width = 256; c.height = 160;
  const g = c.getContext("2d")!;
  g.fillStyle = "#1A0E04"; g.fillRect(0, 0, 256, 160);
  g.fillStyle = "#FFB45E"; g.font = "bold 92px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("21°", 112, 84);
  g.beginPath(); g.moveTo(222, 40); g.quadraticCurveTo(250, 80, 222, 112); g.quadraticCurveTo(194, 80, 222, 40); g.fill();
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
}

const Floor: React.FC<{ i: number; s: FloorState; xray: number; thermo: number; frame: number }> = ({ i, s, xray, thermo, frame }) => {
  const y0 = i * FH;
  const m = useMemo(() => ({
    slab: std("#9AA1AA", { roughness: 0.95 }), wall: std("#ECE7DF", { roughness: 0.9 }), land: std("#D9D4CC", { roughness: 0.9 }),
    floor: new THREE.MeshPhysicalMaterial({ color: "#C9A27A", roughness: 0.45, clearcoat: 0.35, transparent: true }),
    loop: glowMat(HOT, 0.5), feed: glowMat(RED, 0.5), thermo: std("#2A2F36", { roughness: 0.35 }), lcd: lcdMat(), rug: std("#C9BBA8", { roughness: 1 }),
  }), []);
  const c = new THREE.Color("#C9A27A").lerp(new THREE.Color("#FF9A5A"), 0.5 * s.heat).lerp(new THREE.Color("#8FC8E8"), 0.55 * s.cold);
  m.floor.color = c; m.floor.opacity = 1 - 0.65 * xray; m.floor.depthWrite = xray < 0.3;
  m.floor.emissive = new THREE.Color(s.cold > s.heat ? "#4AA8D8" : HOT); m.floor.emissiveIntensity = 0.22 * Math.max(s.heat, s.cold);
  m.loop.color.set(s.heat > 0.3 ? HOT : "#9FB4C4"); m.loop.emissive.set(s.heat > 0.3 ? HOT : "#000000"); m.loop.emissiveIntensity = 0.2 + 0.9 * s.heat;
  m.lcd.emissiveIntensity = 0.3 + 1.6 * thermo * (0.6 + 0.4 * Math.sin(frame * 0.3));
  const loopPts = useMemo(() => rounded(serpentine(-1.6, 2.9, -1.75, 1.75, y0 + 0.16, 9), 0.2), [y0]);
  const loopGeo = useMemo(() => tubeGeo(`fl${i}`, loopPts, 0.035, 400), [loopPts]);
  const feedPts = useMemo(() => [[RISER.hot[0], y0 + 0.45, RISER.hot[2]], [-2.0, y0 + 0.45, RISER.hot[2]], [-1.75, y0 + 0.16, -1.75], loopPts[0]], [y0, loopPts]);
  const feedGeo = useMemo(() => tube(`fd${i}`, feedPts, 0.035, 60), [feedPts]);
  return (
    <group>
      <mesh position={[0, y0 + 0.06, 0]} material={m.slab} receiveShadow castShadow><boxGeometry args={[6.4, 0.12, 4.2]} /></mesh>
      <mesh position={[0.6, y0 + 0.17, 0]} material={m.floor} receiveShadow><boxGeometry args={[5.2, 0.1, 4.0]} /></mesh>
      <mesh position={[-2.6, y0 + 0.15, 0]} material={m.land} receiveShadow><boxGeometry args={[1.2, 0.06, 4.0]} /></mesh>
      <mesh geometry={loopGeo} material={m.loop} />
      <mesh geometry={feedGeo} material={m.feed} />
      <Flow points={feedPts.concat(loopPts)} frame={frame} color="#FFB45E" count={40} speed={0.0022} size={0.11} trail={4} opacity={s.flow} seed={`f${i}`} />
      {/* paredes: fondo, derecha y tabique del rellano (con puerta) */}
      <mesh position={[0, y0 + 1.56, -2.05]} material={m.wall} receiveShadow><boxGeometry args={[6.4, 2.88, 0.1]} /></mesh>
      <mesh position={[3.15, y0 + 1.56, 0]} material={m.wall} receiveShadow><boxGeometry args={[0.1, 2.88, 4.2]} /></mesh>
      <mesh position={[-2.0, y0 + 1.56, -1.2]} material={m.wall}><boxGeometry args={[0.1, 2.88, 1.7]} /></mesh>
      <mesh position={[-2.0, y0 + 2.6, 0.45]} material={m.wall}><boxGeometry args={[0.1, 0.8, 1.6]} /></mesh>
      <mesh position={[-2.0, y0 + 1.56, 1.6]} material={m.wall}><boxGeometry args={[0.1, 2.88, 1.0]} /></mesh>
      {/* mobiliario (Poly Haven, CC0) */}
      <mesh position={[1.0, y0 + 0.225, 0.1]} material={m.rug}><boxGeometry args={[2.4, 0.01, 1.7]} /></mesh>
      <Asset file="modern_arm_chair_01.glb" position={[0.2, y0 + 0.22, -0.9]} rotation={[0, 0.5, 0]} />
      <Asset file="modern_arm_chair_01.glb" position={[1.9, y0 + 0.22, -0.9]} rotation={[0, -0.5, 0]} />
      <Asset file="modern_coffee_table_01.glb" position={[1.05, y0 + 0.22, 0.3]} rotation={[0, Math.PI / 2, 0]} />
      <Asset file="potted_plant_01.glb" position={[2.75, y0 + 0.22, -1.65]} />
      {/* termostato */}
      <group position={THERMO(i) as any}>
        <mesh geometry={useMemo(() => roundedBox(0.22, 0.22, 0.035, 0.025), [])} material={m.thermo} />
        <mesh position={[0, 0.012, 0.0195]} material={m.lcd}><planeGeometry args={[0.16, 0.1]} /></mesh>
      </group>
      
      {s.heat > 0.01 && <Rise origin={[0.6, y0 + 0.3, 0]} spread={[4.6, 0, 3.6]} height={2.2} frame={frame} color="#FFB070" count={36} opacity={0.55 * s.heat} seed={`r${i}`} size={0.16} />}
      {s.cold > 0.01 && Array.from({ length: 10 }).map((_, k) => <Glow key={k} position={[-1.2 + random(`c${i}${k}`) * 4, y0 + 0.4 + 0.1 * Math.sin(frame * 0.05 + k), -1.5 + random(`d${i}${k}`) * 3]} color="#BFE9FF" size={0.25} opacity={0.5 * s.cold} />)}
    </group>
  );
};

export const Building: React.FC<{ s: BuildingState }> = ({ s }) => {
  const top = 3 * FH;
  const m = useMemo(() => ({ roof: std("#8E959E", { roughness: 0.95 }), hot: glowMat(RED, 0.55), cold: glowMat(COLD, 0.55), shaft: new THREE.MeshPhysicalMaterial({ color: "#DCE3EA", roughness: 0.3, transparent: true, opacity: 0.18, depthWrite: false }) }), []);
  const risers = useMemo(() => ({
    hot: tube("rh", [[RISER.hot[0], 0.45, RISER.hot[2]], [RISER.hot[0], top + 0.35, RISER.hot[2]], [-1.3, top + 0.35, RISER.hot[2]], [-1.3, top + 0.35, -1.25]], 0.06, 120),
    cold: tube("rc", [[RISER.cold[0], 0.3, RISER.cold[2]], [RISER.cold[0], top + 0.2, RISER.cold[2]], [0.2, top + 0.2, RISER.cold[2]], [0.2, top + 0.2, -1.25]], 0.06, 120),
  }), []);
  const f = s.frame;
  return (
    <group>
      {[0, 1, 2].map((i) => <Floor key={i} i={i} s={s.floors[i]} xray={s.xray} thermo={i === 1 ? s.thermo : 0} frame={f} />)}
      <mesh position={[0, top + 0.06, 0]} material={m.roof} receiveShadow castShadow><boxGeometry args={[6.4, 0.12, 4.2]} /></mesh>
      {/* patinillo: hueco vertical translúcido junto al rellano */}
      <mesh position={[-2.6, top / 2, -1.7]} material={m.shaft}><boxGeometry args={[0.8, top, 0.5]} /></mesh>
      <mesh geometry={risers.hot} material={m.hot} /><mesh geometry={risers.cold} material={m.cold} />
      <Flow points={[[RISER.hot[0], 0.45, RISER.hot[2]], [RISER.hot[0], top + 0.35, RISER.hot[2]]].reverse()} frame={f} color="#FF6A8A" count={26} speed={0.006} size={0.14} opacity={s.riserFlow} seed="rh" />
      {/* aerotermia en cubierta (Poly Haven, CC0) */}
      <Asset file="exterior_aircon_unit.glb" position={[-1.3, top + 0.12, -1.55]} />
      <Asset file="exterior_aircon_unit.glb" position={[0.2, top + 0.12, -1.55]} />
      {s.roofRun > 0.01 && [-1.3, 0.2].map((x, k) => (
        <React.Fragment key={k}>
          <Flow points={[[x, top + 0.6, 1.4], [x, top + 0.55, 0.4], [x, top + 0.55, -1.3]]} frame={f} color="#DDEBFF" count={12} speed={0.012} size={0.07} trail={4} opacity={0.8 * s.roofRun} seed={`ra${k}`} />
          <Glow position={[x, top + 0.55, -1.25]} color="#9FD8FF" size={0.9} opacity={0.25 * s.roofRun} />
        </React.Fragment>
      ))}
      {s.snow > 0.01 && Array.from({ length: 90 }).map((_, i) => {
        const u = (f * 0.004 + random(`sn${i}`)) % 1;
        return <Glow key={i} position={[-5 + random(`sx${i}`) * 10, top + 3 - u * (top + 3), 2.4 + random(`sz${i}`) * 2]} color="#FFFFFF" size={0.08} opacity={0.8 * s.snow} />;
      })}
    </group>
  );
};

// ================================================================ ARMARIO DEL PATINILLO (primer plano)
export const VALVE_Y = [1.15, 0.6];         // altura de cada derivación (vivienda A arriba, B abajo = la que falla)
export const STUCK = [0.12, 0.6, 0.0];
export type ShaftState = { flowA: number; flowB: number; stuck: number; fixed: number; dust: number; tool: number; turn: number; frame: number };

const ValveSet: React.FC<{ y: number; s: ShaftState; bad: boolean; flow: number }> = ({ y, s, bad, flow }) => {
  const m = useMemo(() => ({
    brass: new THREE.MeshStandardMaterial({ color: "#C9A24A", metalness: 1, roughness: 0.28 }), lever: std(RED, { roughness: 0.45 }),
    head: new THREE.MeshPhysicalMaterial({ color: "#F4F6F8", roughness: 0.35, clearcoat: 0.6 }), pipe: new THREE.MeshStandardMaterial({ color: "#E8ECEF", roughness: 0.35 }),
    meter: new THREE.MeshPhysicalMaterial({ color: "#F4F6F8", roughness: 0.4 }), lcd: glowMat("#5FE6C8", 0.8), led: glowMat("#3BE37A", 1.5),
  }), []);
  const stuckNow = bad && s.stuck > 0.5 && s.fixed < 0.5;
  m.led.color.set(stuckNow && s.stuck > 0.5 ? "#FF3030" : "#3BE37A"); m.led.emissive.set(m.led.color);
  // polvo/apagado tras meses sin uso
  const dull = bad ? s.dust * (1 - s.fixed) : 0;
  m.brass.color.set(new THREE.Color("#C9A24A").lerp(new THREE.Color("#6E5F45"), dull)); m.brass.roughness = 0.28 + 0.5 * dull;
  const leverAng = bad ? (1 - Math.max(s.fixed, 1 - s.stuck)) * 0.0 : 0;
  const pipe = useMemo(() => tube(`vp${y}`, [[-0.36, y, 0], [0.55, y, 0], [0.75, y, -0.22]], 0.022, 60), [y]);
  return (
    <group>
      <mesh geometry={pipe} material={m.pipe} />
      {/* llave de bola con maneta */}
      <group position={[-0.18, y, 0]}>
        <mesh material={m.brass} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.04, 0.11, 24]} /></mesh>
        {[-0.065, 0.065].map((x) => <mesh key={x} material={m.brass} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.035, 0.035, 0.03, 6]} /></mesh>)}
        <mesh material={m.brass} position={[0, 0.05, 0]}><cylinderGeometry args={[0.012, 0.012, 0.04, 12]} /></mesh>
        <mesh material={m.lever} position={[0.045, 0.072, 0]} rotation={[0, leverAng, 0]}><boxGeometry args={[0.11, 0.014, 0.028]} /></mesh>
      </group>
      {/* válvula de zona con cabezal termoeléctrico */}
      <group position={[STUCK[0], y, 0]}>
        <mesh material={m.brass} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.045, 0.045, 0.13, 24]} /></mesh>
        <mesh material={m.brass} position={[0, 0.06, 0]}><cylinderGeometry args={[0.03, 0.03, 0.04, 20]} /></mesh>
        <mesh material={m.head} position={[0, 0.115, 0]}><cylinderGeometry args={[0.042, 0.045, 0.075, 28]} /></mesh>
        <mesh material={m.led} position={[0.0, 0.13, 0.044]}><sphereGeometry args={[0.007, 10, 8]} /></mesh>
      </group>
      {/* contador de energía */}
      <group position={[0.38, y, 0]}>
        <mesh material={m.brass} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.03, 0.03, 0.12, 20]} /></mesh>
        <mesh geometry={useMemo(() => roundedBox(0.1, 0.09, 0.05, 0.012), [])} material={m.meter} position={[0, 0.075, 0.01]} />
        <mesh material={m.lcd} position={[0, 0.08, 0.037]}><planeGeometry args={[0.065, 0.03]} /></mesh>
      </group>
      <Flow points={stuckNow ? [[-0.36, y, 0.0], [0.05, y, 0.0]] : [[-0.36, y, 0.0], [0.55, y, 0.0], [0.75, y, -0.22]]} frame={s.frame} color="#FF6A8A" count={stuckNow ? 4 : 10} speed={0.012} size={0.035} trail={4} opacity={flow} seed={`vf${y}`} />
    </group>
  );
};

export const Shaft: React.FC<{ s: ShaftState }> = ({ s }) => {
  const m = useMemo(() => ({
    wall: std("#E6E1D9", { roughness: 0.95 }), cab: new THREE.MeshStandardMaterial({ color: "#C9CED6", metalness: 0.5, roughness: 0.45 }), back: std("#3A4556", { roughness: 0.9 }),
    hot: glowMat(RED, 0.45), cold: glowMat(COLD, 0.45), floor: std("#BDB6AA", { roughness: 0.95 }),
  }), []);
  const f = s.frame;
  const w = s.turn;   // giro de la llave
  return (
    <group>
      <mesh position={[0, 0.9, -0.2]} material={m.wall} receiveShadow><boxGeometry args={[3, 2.4, 0.1]} /></mesh>
      <mesh position={[0, -0.32, 0.6]} material={m.floor} receiveShadow><boxGeometry args={[3, 0.04, 1.8]} /></mesh>
      {/* armario metálico abierto */}
      <mesh position={[0, 0.9, -0.14]} material={m.back}><boxGeometry args={[1.0, 1.3, 0.02]} /></mesh>
      {[-0.51, 0.51].map((x) => <mesh key={x} position={[x, 0.9, -0.02]} material={m.cab}><boxGeometry args={[0.02, 1.3, 0.26]} /></mesh>)}
      {[0.24, 1.56].map((yy) => <mesh key={yy} position={[0, yy, -0.02]} material={m.cab}><boxGeometry args={[1.04, 0.02, 0.26]} /></mesh>)}
      <mesh position={[-0.78, 0.9, 0.32]} rotation={[0, -1.25, 0]} material={m.cab}><boxGeometry args={[0.02, 1.3, 0.62]} /></mesh>
      {/* montantes de ida y retorno */}
      <mesh position={[-0.42, 0.9, -0.06]} material={m.hot}><cylinderGeometry args={[0.035, 0.035, 1.6, 20]} /></mesh>
      <mesh position={[-0.32, 0.9, -0.09]} material={m.cold}><cylinderGeometry args={[0.035, 0.035, 1.6, 20]} /></mesh>
      <Flow points={[[-0.42, 0.1, -0.06], [-0.42, 1.7, -0.06]]} frame={f} color="#FF6A8A" count={12} speed={0.01} size={0.04} opacity={1} seed="mh" />
      <ValveSet y={VALVE_Y[0]} s={s} bad={false} flow={s.flowA} />
      <ValveSet y={VALVE_Y[1]} s={s} bad={true} flow={s.flowB} />
      {s.stuck > 0.01 && s.fixed < 0.98 && <Glow position={[STUCK[0], STUCK[1] + 0.05, 0.08]} color="#FF3030" size={0.35} opacity={0.55 * s.stuck * (1 - s.fixed) * (0.7 + 0.3 * Math.sin(f * 0.35))} />}
      {s.fixed > 0.85 && <Glow position={[STUCK[0], STUCK[1] + 0.05, 0.08]} color="#3BE37A" size={0.35} opacity={Math.min(1, (s.fixed - 0.85) * 6) * 0.7} />}
      {/* técnico: caja de herramientas y llave de tubo (Poly Haven, CC0) */}
      {s.tool > 0.01 && <Asset file="metal_toolbox.glb" position={[0.55, -0.3, 0.55 + (1 - s.tool) * 0.6]} rotation={[0, -0.4, 0]} />}
      {s.tool > 0.01 && (
        <group position={[STUCK[0], STUCK[1], 0.13 + (1 - s.tool) * 0.5]} rotation={[0, 0, -0.5 + 0.9 * w]}>
          <Asset file="pipe_wrench.glb" position={[0, -0.36, 0]} rotation={[0, Math.PI / 2, 0]} />
        </group>
      )}
    </group>
  );
};
