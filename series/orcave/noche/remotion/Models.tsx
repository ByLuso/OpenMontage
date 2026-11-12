// Escenario nocturno (metros): edificio de 3 plantas en corte con salones amueblados, patinillo con montantes,
// aerotermia en cubierta; y primer plano del rellano con el armario de válvulas y el técnico.
import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { Glow } from "./kit3d/Glow";
import { Flow, Rise } from "./kit3d/Flow";
import { roundedBox, tubeGeo } from "./kit3d/Parts";
import { Asset } from "./AssetGLB";
import { Mannequin, sitPose, kneelPose, mixPose, reachRight } from "./Mannequin";

export const RED = "#E31B4F", HOT = "#FF7A1A", COLD = "#4FB8E8";
const std = (color: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
const emis = (color: string, k = 1) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: k, roughness: 0.4 });
const MANNEQUIN = { skin: "#CFC7BA" };
const TECH = { skin: "#E4DDD2", top: "#C8102E", legs: "#22324F" };

// ---------------------------------------------------------------- texturas dibujadas
function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: number[]) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
const texCache: Record<string, THREE.Texture> = {};
const tex = (k: string, f: () => THREE.Texture) => (texCache[k] ??= f());

const parquet = () => tex("parquet", () => canvasTex(512, 512, (g) => {
  const rows = 8, h = 512 / rows;
  for (let r = 0; r < rows; r++) {
    let x = -random(`po${r}`) * 300;
    while (x < 512) {
      const w = 220 + random(`pw${r}${x}`) * 160, v = random(`pv${r}${x}`);
      g.fillStyle = `hsl(${28 + v * 6}, ${38 + v * 10}%, ${30 + v * 9}%)`; g.fillRect(x, r * h, w, h);
      for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(40,20,8,${0.05 + 0.05 * random(`pg${r}${x}${k}`)})`; g.fillRect(x, r * h + random(`py${r}${x}${k}`) * h, w, 1.5); }
      g.fillStyle = "rgba(20,10,4,0.55)"; g.fillRect(x, r * h, 2, h); x += w;
    }
    g.fillStyle = "rgba(20,10,4,0.6)"; g.fillRect(0, r * h, 512, 2);
  }
}, [3, 2]));

const artTex = () => tex("art", () => canvasTex(512, 384, (g) => {
  g.fillStyle = "#EDE6D8"; g.fillRect(0, 0, 512, 384);
  const c = (x: number, y: number, r: number, col: string) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = col; g.fill(); };
  c(200, 180, 120, "#C9A23A"); c(330, 210, 95, "#2E4466"); c(280, 130, 60, "#1E2C40"); c(150, 260, 50, "#6F8DA6");
  g.globalAlpha = 0.85; c(250, 200, 40, "#E8D9B5"); g.globalAlpha = 1;
}));

const nightTex = () => tex("night", () => canvasTex(512, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#0A1630"); gr.addColorStop(1, "#16243F");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + random(`st${i}`) * 0.6})`; g.fillRect(random(`sx${i}`) * 512, random(`sy${i}`) * 300, 2, 2); }
  for (let i = 0; i < 26; i++) {      // edificios lejanos con ventanas encendidas
    const x = i * 22 - 10, h = 90 + random(`bh${i}`) * 170;
    g.fillStyle = "#080E1C"; g.fillRect(x, 512 - h, 24, h);
    for (let k = 0; k < 18; k++) if (random(`w${i}${k}`) > 0.55) { g.fillStyle = `rgba(255,${190 + random(`wc${i}${k}`) * 50},120,0.8)`; g.fillRect(x + 4 + (k % 2) * 9, 512 - h + 8 + Math.floor(k / 2) * 14, 5, 6); }
  }
}));

const cityTex = () => tex("city", () => canvasTex(1024, 512, (g) => {
  g.clearRect(0, 0, 1024, 512);
  for (let i = 0; i < 46; i++) {
    const x = i * 23, h = 120 + random(`ch${i}`) * 330;
    g.fillStyle = "rgba(12,18,30,1)"; g.fillRect(x, 512 - h, 21, h);
    for (let k = 0; k < 40; k++) if (random(`cw${i}${k}`) > 0.6) { g.fillStyle = `rgba(255,${180 + random(`cc${i}${k}`) * 60},110,${0.35 + 0.5 * random(`ca${i}${k}`)})`; g.fillRect(x + 3 + (k % 3) * 6, 512 - h + 6 + Math.floor(k / 3) * 12, 3, 5); }
  }
}));

export function lcdTex() {
  return tex("lcd", () => canvasTex(256, 160, (g) => {
    g.fillStyle = "#1A0E04"; g.fillRect(0, 0, 256, 160);
    g.fillStyle = "#FFB45E"; g.font = "bold 92px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("21°", 112, 84);
    g.beginPath(); g.moveTo(222, 40); g.quadraticCurveTo(250, 80, 222, 112); g.quadraticCurveTo(194, 80, 222, 40); g.fill();
  }));
}

// ---------------------------------------------------------------- utilidades de geometría
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

// ---------------------------------------------------------------- muebles propios
const Sofa: React.FC<{ position: number[]; rotation?: number }> = ({ position, rotation = 0 }) => {
  const m = useMemo(() => ({
    fab: new THREE.MeshPhysicalMaterial({ color: "#22355A", roughness: 0.85, sheen: 0.8, sheenRoughness: 0.5, sheenColor: new THREE.Color("#6F86B5") }),
    cush: new THREE.MeshPhysicalMaterial({ color: "#C08A2E", roughness: 0.85, sheen: 0.6, sheenColor: new THREE.Color("#F2D08A") }),
    cush2: new THREE.MeshPhysicalMaterial({ color: "#D9CFBE", roughness: 0.9, sheen: 0.5, sheenColor: new THREE.Color("#FFFFFF") }),
    leg: std("#3B2A1C", { roughness: 0.5 }),
  }), []);
  const g = useMemo(() => ({
    base: roundedBox(2.2, 0.22, 0.92, 0.06), seat: roundedBox(0.98, 0.16, 0.7, 0.07), back: roundedBox(0.98, 0.5, 0.2, 0.08),
    arm: roundedBox(0.2, 0.42, 0.92, 0.07), pil: roundedBox(0.42, 0.42, 0.12, 0.08),
  }), []);
  return (
    <group position={position as any} rotation={[0, rotation, 0]}>
      {[-0.95, 0.95].map((x) => [-0.32, 0.32].map((z) => <mesh key={`${x}${z}`} position={[x, 0.05, z]} material={m.leg}><cylinderGeometry args={[0.025, 0.02, 0.1, 10]} /></mesh>))}
      <mesh geometry={g.base} material={m.fab} position={[0, 0.21, 0]} castShadow receiveShadow />
      {[-0.5, 0.5].map((x) => <mesh key={x} geometry={g.seat} material={m.fab} position={[x, 0.39, 0.08]} castShadow receiveShadow />)}
      {[-0.5, 0.5].map((x) => <mesh key={x} geometry={g.back} material={m.fab} position={[x, 0.62, -0.33]} rotation={[-0.12, 0, 0]} castShadow receiveShadow />)}
      {[-1.0, 1.0].map((x) => <mesh key={x} geometry={g.arm} material={m.fab} position={[x, 0.42, 0]} castShadow receiveShadow />)}
      <mesh geometry={g.pil} material={m.cush} position={[-0.72, 0.62, -0.18]} rotation={[-0.25, 0.25, 0.08]} castShadow />
      <mesh geometry={g.pil} material={m.cush2} position={[0.75, 0.62, -0.18]} rotation={[-0.25, -0.3, -0.1]} castShadow />
    </group>
  );
};

const FloorLamp: React.FC<{ position: number[]; on: number }> = ({ position, on }) => {
  const m = useMemo(() => ({ metal: new THREE.MeshStandardMaterial({ color: "#1A1A1A", metalness: 0.8, roughness: 0.35 }), shade: emis("#FFD9A0", 1.6) }), []);
  m.shade.emissiveIntensity = 0.15 + 1.8 * on;
  return (
    <group position={position as any}>
      <mesh material={m.metal} position={[0, 0.015, 0]}><cylinderGeometry args={[0.16, 0.18, 0.03, 24]} /></mesh>
      <mesh material={m.metal} position={[0, 0.75, 0]}><cylinderGeometry args={[0.012, 0.012, 1.5, 10]} /></mesh>
      <mesh material={m.shade} position={[0, 1.55, 0]}><cylinderGeometry args={[0.16, 0.22, 0.3, 28, 1, true]} /></mesh>
      <pointLight position={[0, 1.5, 0]} intensity={2.2 * on} distance={4.5} decay={2} color="#FFC48A" />
    </group>
  );
};

const Art: React.FC<{ position: number[] }> = ({ position }) => {
  const m = useMemo(() => ({ frame: std("#1B1B1B", { roughness: 0.5 }), art: new THREE.MeshStandardMaterial({ map: artTex(), roughness: 0.85 }) }), []);
  return (
    <group position={position as any}>
      <mesh material={m.frame} castShadow><boxGeometry args={[1.14, 0.86, 0.04]} /></mesh>
      <mesh material={m.art} position={[0, 0, 0.021]}><planeGeometry args={[1.06, 0.78]} /></mesh>
    </group>
  );
};

// ---------------------------------------------------------------- planta de viviendas
export const FH = 3.0;
export const W0 = -2.0;            // tabique entre rellano y salón
export const RISER = { hot: [-2.75, 0, -1.75], cold: [-2.45, 0, -1.75] };
export const THERMO = (i: number) => [-1.55, i * FH + 1.5, -1.99];
export const SOFA = [-0.55, 0, -1.5];
export type FloorState = { heat: number; cold: number; flow: number; xray: number; lights: number; person: "sofa-cold" | "chair" | "none"; cold2?: number };
export type BuildingState = { floors: FloorState[]; roofRun: number; riserFlow: number; snow: number; thermo: number; frame: number };

const Floor: React.FC<{ i: number; s: FloorState; thermo: number; frame: number }> = ({ i, s, thermo, frame }) => {
  const y0 = i * FH;
  const m = useMemo(() => ({
    slab: std("#3E4248", { roughness: 0.95 }), wall: std("#56604F", { roughness: 0.92 }), wall2: std("#4D5647", { roughness: 0.92 }), ceil: std("#C9C4BA", { roughness: 0.95 }),
    land: std("#7A7770", { roughness: 0.9 }), landWall: std("#8C877C", { roughness: 0.92 }),
    floor: new THREE.MeshPhysicalMaterial({ map: parquet(), roughness: 0.48, clearcoat: 0.25, clearcoatRoughness: 0.4, transparent: true, emissive: new THREE.Color(HOT) }),
    screed: std("#6E6A64", { roughness: 1 }),
    loop: emis(HOT, 1), feed: emis(RED, 1.2), frame: std("#2A2D31", { roughness: 0.4, metalness: 0.4 }),
    glass: new THREE.MeshStandardMaterial({ map: nightTex(), emissive: new THREE.Color("#FFFFFF"), emissiveMap: nightTex(), emissiveIntensity: 0.55, roughness: 0.15 }),
    rug: std("#B9AE9B", { roughness: 1 }), thermo: std("#2A2F36", { roughness: 0.35 }),
    lcd: new THREE.MeshBasicMaterial({ map: lcdTex(), toneMapped: false }),
  }), []);
  // suelo: madera; con calor emite un brillo cálido, en frío se enfría el tono; en «rayos X» deja ver los tubos
  const cold = s.cold * (1 - s.heat);
  m.floor.color.set(new THREE.Color("#FFFFFF").lerp(new THREE.Color("#9FC2DA"), 0.45 * cold));
  m.floor.emissive.set(HOT); m.floor.emissiveIntensity = 0.16 * s.heat;
  m.floor.opacity = 1 - 0.62 * s.xray; m.floor.depthWrite = s.xray < 0.3;
  m.loop.color.set(s.heat > 0.3 ? HOT : "#8FA9BD"); m.loop.emissive.set(s.heat > 0.3 ? HOT : "#000000"); m.loop.emissiveIntensity = 0.25 + 1.3 * s.heat;
  m.lcd.color.setScalar(0.35 + 0.65 * thermo);
  const loopPts = useMemo(() => rounded(serpentine(-1.75, 2.95, -1.85, 1.8, y0 + 0.17, 10), 0.18), [y0]);
  const loopGeo = useMemo(() => tubeGeo(`fl${i}`, loopPts, 0.032, 500), [loopPts]);
  const feedPts = useMemo(() => [[RISER.hot[0], y0 + 0.45, RISER.hot[2]], [-2.1, y0 + 0.45, RISER.hot[2]], [-1.9, y0 + 0.17, -1.85], loopPts[0]], [y0, loopPts]);
  const feedGeo = useMemo(() => tube(`fd${i}`, feedPts, 0.03, 60), [feedPts]);
  const L = s.lights;
  const pose = s.person === "sofa-cold" ? sitPose(0.45, s.cold2 ?? cold, frame) : null;
  return (
    <group>
      {/* forjado, solera y tarima */}
      <mesh position={[0, y0 + 0.06, 0]} material={m.slab} receiveShadow castShadow><boxGeometry args={[6.4, 0.12, 4.3]} /></mesh>
      <mesh position={[0.6, y0 + 0.14, 0]} material={m.screed}><boxGeometry args={[5.2, 0.04, 4.1]} /></mesh>
      <mesh position={[0.6, y0 + 0.21, 0]} material={m.floor} receiveShadow><boxGeometry args={[5.2, 0.06, 4.1]} /></mesh>
      <mesh geometry={loopGeo} material={m.loop} />
      <mesh geometry={feedGeo} material={m.feed} />
      {s.flow > 0.01 && <Flow points={feedPts.concat(loopPts)} frame={frame} color="#FFB45E" count={46} speed={0.0022} size={0.09} trail={4} opacity={s.flow * (0.35 + 0.65 * s.xray)} seed={`f${i}`} />}
      {/* techo (cara inferior del forjado superior) */}
      <mesh position={[0.6, y0 + FH - 0.005, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.ceil}><planeGeometry args={[5.2, 4.1]} /></mesh>
      {/* pared del fondo con ventana */}
      <group position={[0, y0, -2.1]}>
        <mesh position={[-0.1, 1.56, 0]} material={m.wall} receiveShadow><boxGeometry args={[4.2, 2.88, 0.1]} /></mesh>
        <mesh position={[2.95, 0.6, 0]} material={m.wall} receiveShadow><boxGeometry args={[0.5, 0.96, 0.1]} /></mesh>
        <mesh position={[2.95, 2.67, 0]} material={m.wall} receiveShadow><boxGeometry args={[0.5, 0.66, 0.1]} /></mesh>
        <mesh position={[2.3, 0.6 + 0.0, 0]} material={m.wall}><boxGeometry args={[0.8, 0.96, 0.1]} /></mesh>
        <mesh position={[3.15, 1.56, 0]} material={m.wall}><boxGeometry args={[0.1, 2.88, 0.1]} /></mesh>
        <mesh position={[2.3, 2.67, 0]} material={m.wall}><boxGeometry args={[0.8, 0.66, 0.1]} /></mesh>
        <mesh position={[2.3, 1.71, -0.02]} material={m.glass}><planeGeometry args={[1.5, 1.26]} /></mesh>
        {[[2.3, 1.08, 1.56, 0.05], [2.3, 2.34, 1.56, 0.05]].map(([x, y, w, h], k) => <mesh key={k} position={[x, y, 0.03]} material={m.frame}><boxGeometry args={[w, h, 0.06]} /></mesh>)}
        {[1.55, 2.3, 3.05].map((x) => <mesh key={x} position={[x, 1.71, 0.03]} material={m.frame}><boxGeometry args={[0.05, 1.3, 0.06]} /></mesh>)}
      </group>
      <mesh position={[3.15, y0 + 1.56, 0]} material={m.wall2} receiveShadow><boxGeometry args={[0.1, 2.88, 4.3]} /></mesh>
      {/* tabique del rellano con puerta */}
      <mesh position={[W0, y0 + 1.56, -1.15]} material={m.wall2}><boxGeometry args={[0.1, 2.88, 1.9]} /></mesh>
      <mesh position={[W0, y0 + 2.6, 0.4]} material={m.wall2}><boxGeometry args={[0.1, 0.8, 1.2]} /></mesh>
      <mesh position={[W0, y0 + 1.56, 1.55]} material={m.wall2}><boxGeometry args={[0.1, 2.88, 1.1]} /></mesh>
      {/* rellano */}
      <mesh position={[-2.6, y0 + 0.15, 0]} material={m.land} receiveShadow><boxGeometry args={[1.2, 0.06, 4.1]} /></mesh>
      <pointLight position={[-2.6, y0 + 2.6, 0.2]} intensity={0.9 * L} distance={3.5} color="#DCE6FF" />
      {/* salón */}
      <mesh position={[-0.55, y0 + 0.245, -0.25]} material={m.rug} receiveShadow><boxGeometry args={[2.6, 0.01, 1.8]} /></mesh>
      <Sofa position={[SOFA[0], y0 + 0.24, SOFA[2]]} />
      <Asset file="modern_coffee_table_02.glb" position={[-0.55, y0 + 0.24, -0.35]} scale={0.85} />
      <Asset file="mid_century_lounge_chair.glb" position={[1.75, y0 + 0.24, 0.55]} rotation={[0, -0.9, 0]} />
      <Asset file="modern_wooden_cabinet.glb" position={[2.45 - 0.55, y0 + 0.24, -1.78]} scale={[0.62, 1, 1]} />
      <Asset file="desk_lamp_arm_01.glb" position={[2.55, y0 + 0.92, -1.85]} rotation={[0, -0.6, 0]} scale={0.8} />
      <Asset file="potted_plant_02.glb" position={[2.75, y0 + 0.24, 1.55]} />
      <Asset file="side_table_01.glb" position={[0.85, y0 + 0.24, -1.65]} scale={0.8} />
      <Art position={[-0.55, y0 + 1.85, -2.03]} />
      <FloorLamp position={[2.85, y0 + 0.24, 0.0]} on={L} />
      <Asset file="modern_ceiling_lamp_01.glb" position={[-0.55, y0 + FH - 0.75, -0.35]} scale={0.75} />
      <spotLight position={[-0.55, y0 + FH - 0.75, -0.35]} target-position={[-0.55, y0, -0.35]} angle={1.1} penumbra={0.8} intensity={6 * L} distance={7} decay={2} color="#FFC890"
        castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.0006} shadow-radius={6} />
      <pointLight position={[-0.55, y0 + FH - 0.85, -0.35]} intensity={1.6 * L} distance={5} decay={2} color="#FFC890" />
      <Glow position={[-0.55, y0 + FH - 0.86, -0.35]} color="#FFB060" size={0.5} opacity={0.35 * L} />
      {/* termostato */}
      <group position={THERMO(i) as any}>
        <mesh geometry={useMemo(() => roundedBox(0.2, 0.2, 0.035, 0.025), [])} material={m.thermo} />
        <mesh position={[0, 0.01, 0.019]} material={m.lcd}><planeGeometry args={[0.15, 0.094]} /></mesh>
      </group>
      {/* personas */}
      {pose && <group position={[SOFA[0] - 0.45, y0 + 0.24, SOFA[2] + 0.08]}><Mannequin pose={pose} outfit={MANNEQUIN} /></group>}
      {s.person === "chair" && <group position={[1.75, y0 + 0.24, 0.55]} rotation={[0, -0.9, 0]}><Mannequin pose={sitPose(0.4, 0, frame)} outfit={MANNEQUIN} /></group>}
      {/* calor que sube / frío */}
      {s.heat > 0.01 && <Rise origin={[0.6, y0 + 0.3, 0]} spread={[4.6, 0, 3.6]} height={2.0} frame={frame} color="#FFB070" count={30} opacity={0.35 * s.heat} seed={`r${i}`} size={0.1} />}
      {cold > 0.01 && Array.from({ length: 14 }).map((_, k) => <Glow key={k} position={[-1.6 + random(`c${i}${k}`) * 4.4, y0 + 0.35 + 0.08 * Math.sin(frame * 0.05 + k), -1.7 + random(`d${i}${k}`) * 3.4]} color="#BFE9FF" size={0.22} opacity={0.4 * cold} />)}
    </group>
  );
};

export const Building: React.FC<{ s: BuildingState }> = ({ s }) => {
  const top = 3 * FH;
  const m = useMemo(() => ({
    roof: new THREE.MeshPhysicalMaterial({ color: "#C3CDD8", roughness: 0.9, sheen: 0.6, sheenColor: new THREE.Color("#FFFFFF") }), parapet: std("#5A5E64", { roughness: 0.95 }), hot: emis(RED, 1.4), cold: emis(COLD, 1.1),
    shaft: new THREE.MeshPhysicalMaterial({ color: "#1A2230", roughness: 0.3, transparent: true, opacity: 0.35, depthWrite: false }),
    ground: std("#0E1116", { roughness: 0.75, metalness: 0.1 }), side: std("#3A3E44", { roughness: 0.95 }),
    city: new THREE.MeshBasicMaterial({ map: cityTex(), transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }),
  }), []);
  const risers = useMemo(() => ({
    hot: tube("rh", [[RISER.hot[0], 0.45, RISER.hot[2]], [RISER.hot[0], top + 0.35, RISER.hot[2]], [-1.1, top + 0.35, RISER.hot[2]], [-1.1, top + 0.35, -1.45]], 0.06, 120),
    cold: tube("rc", [[RISER.cold[0], 0.3, RISER.cold[2]], [RISER.cold[0], top + 0.2, RISER.cold[2]], [1.0, top + 0.2, RISER.cold[2]], [1.0, top + 0.2, -1.45]], 0.06, 120),
  }), []);
  const f = s.frame;
  return (
    <group>
      {/* calle y ciudad al fondo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} material={m.ground} receiveShadow><planeGeometry args={[80, 80]} /></mesh>
      <mesh position={[0, 10, -32]} material={m.city}><planeGeometry args={[90, 45]} /></mesh>
      <mesh position={[-14, 8, -26]} material={m.city} rotation={[0, 0.5, 0]}><planeGeometry args={[40, 30]} /></mesh>
      {[0, 1, 2].map((i) => <Floor key={i} i={i} s={s.floors[i]} thermo={i === 1 ? s.thermo : 0} frame={f} />)}
      {/* cubierta con peto */}
      <mesh position={[0, top + 0.06, 0]} material={m.roof} receiveShadow castShadow><boxGeometry args={[6.4, 0.12, 4.3]} /></mesh>
      <mesh position={[0, top + 0.35, -2.12]} material={m.parapet}><boxGeometry args={[6.4, 0.5, 0.08]} /></mesh>
      <mesh position={[3.16, top + 0.35, 0]} material={m.parapet}><boxGeometry args={[0.08, 0.5, 4.3]} /></mesh>
      <mesh position={[-3.16, top + 0.35, 0]} material={m.parapet}><boxGeometry args={[0.08, 0.5, 4.3]} /></mesh>
      {/* patinillo: hueco vertical oscuro con los montantes de ida y retorno */}
      <mesh position={[-2.6, top / 2, -1.75]} material={m.shaft}><boxGeometry args={[0.8, top, 0.5]} /></mesh>
      <mesh geometry={risers.hot} material={m.hot} /><mesh geometry={risers.cold} material={m.cold} />
      <Flow points={[[RISER.hot[0], top + 0.35, RISER.hot[2]], [RISER.hot[0], 0.45, RISER.hot[2]]]} frame={f} color="#FF8FA8" count={30} speed={0.006} size={0.12} opacity={s.riserFlow} seed="rh" />
      {/* aerotermia en cubierta (Poly Haven, CC0) */}
      <Asset file="exterior_aircon_unit.glb" position={[-1.1, top + 0.12, -1.55]} scale={0.85} />
      <Asset file="exterior_aircon_unit.glb" position={[1.0, top + 0.12, -1.55]} scale={0.85} />
      {s.roofRun > 0.01 && [-1.1, 1.0].flatMap((x, k) => [-0.38, 0.38].map((dx, j) => (
        <Flow key={`${k}${j}`} points={[[x + dx, top + 0.5, 2.6], [x + dx, top + 0.48, 0.6], [x + dx, top + 0.45, -1.3]]} frame={f} color="#CFE6FF" count={8} speed={0.01} size={0.035} trail={5} opacity={0.6 * s.roofRun} seed={`ra${k}${j}`} />
      )))}
      {/* nieve */}
      {s.snow > 0.01 && Array.from({ length: 140 }).map((_, i) => {
        const u = (f * 0.0035 + random(`sn${i}`)) % 1;
        return <Glow key={i} position={[-7 + random(`sx${i}`) * 14, top + 4 - u * (top + 4), 2.6 + random(`sz${i}`) * 3]} color="#FFFFFF" size={0.05 + 0.04 * random(`ss${i}`)} opacity={0.75 * s.snow} />;
      })}
      <pointLight position={[0, top + 3.2, 1.2]} intensity={5} distance={12} decay={1.6} color="#B8CCF0" />
      {/* luz de luna fría y relleno exterior */}
      <directionalLight position={[-8, 14, 10]} intensity={0.35} color="#9DB7E8" />
      <hemisphereLight args={["#5C7299", "#0A0C10", 0.35]} />
    </group>
  );
};

// ================================================================ RELLANO: ARMARIO DEL PATINILLO (primer plano)
export const VALVE_Y = [1.15, 0.6];
export const STUCK = [0.12, 0.6, 0.0];
export type ShaftState = { flowA: number; flowB: number; stuck: number; fixed: number; dust: number; tool: number; turn: number; tech: number; reach: number; frame: number };

const ValveSet: React.FC<{ y: number; s: ShaftState; bad: boolean; flow: number }> = ({ y, s, bad, flow }) => {
  const m = useMemo(() => ({
    brass: new THREE.MeshStandardMaterial({ color: "#C9A24A", metalness: 1, roughness: 0.3 }), lever: std(RED, { roughness: 0.45 }),
    head: new THREE.MeshPhysicalMaterial({ color: "#F1F3F5", roughness: 0.35, clearcoat: 0.6 }), pipe: new THREE.MeshStandardMaterial({ color: "#E4E8EB", roughness: 0.35 }),
    meter: new THREE.MeshPhysicalMaterial({ color: "#F1F3F5", roughness: 0.4 }), lcd: emis("#5FE6C8", 1.4), led: emis("#3BE37A", 3),
  }), []);
  const stuckNow = bad && s.stuck > 0.5 && s.fixed < 0.5;
  m.led.color.set(stuckNow ? "#FF3030" : "#3BE37A"); m.led.emissive.set(m.led.color);
  const dull = bad ? s.dust * (1 - s.fixed) : 0;
  m.brass.color.set(new THREE.Color("#C9A24A").lerp(new THREE.Color("#5E5140"), dull)); m.brass.roughness = 0.3 + 0.5 * dull;
  const pipe = useMemo(() => tube(`vp${y}`, [[-0.36, y, 0], [0.55, y, 0], [0.75, y, -0.22]], 0.022, 60), [y]);
  return (
    <group>
      <mesh geometry={pipe} material={m.pipe} castShadow />
      <group position={[-0.18, y, 0]}>
        <mesh material={m.brass} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.11, 24]} /></mesh>
        {[-0.065, 0.065].map((x) => <mesh key={x} material={m.brass} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.035, 0.035, 0.03, 6]} /></mesh>)}
        <mesh material={m.brass} position={[0, 0.05, 0]}><cylinderGeometry args={[0.012, 0.012, 0.04, 12]} /></mesh>
        <mesh material={m.lever} position={[0.045, 0.072, 0]} castShadow><boxGeometry args={[0.11, 0.014, 0.028]} /></mesh>
      </group>
      <group position={[STUCK[0], y, 0]}>
        <mesh material={m.brass} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.045, 0.045, 0.13, 24]} /></mesh>
        <mesh material={m.brass} position={[0, 0.06, 0]}><cylinderGeometry args={[0.03, 0.03, 0.04, 20]} /></mesh>
        <mesh material={m.head} position={[0, 0.115, 0]} castShadow><cylinderGeometry args={[0.042, 0.045, 0.075, 28]} /></mesh>
        <mesh material={m.led} position={[0.0, 0.13, 0.044]}><sphereGeometry args={[0.007, 10, 8]} /></mesh>
      </group>
      <group position={[0.38, y, 0]}>
        <mesh material={m.brass} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.03, 0.03, 0.12, 20]} /></mesh>
        <mesh geometry={useMemo(() => roundedBox(0.1, 0.09, 0.05, 0.012), [])} material={m.meter} position={[0, 0.075, 0.01]} castShadow />
        <mesh material={m.lcd} position={[0, 0.08, 0.037]}><planeGeometry args={[0.065, 0.03]} /></mesh>
      </group>
      <Flow points={stuckNow ? [[-0.36, y, 0.0], [0.05, y, 0.0]] : [[-0.36, y, 0.0], [0.55, y, 0.0], [0.75, y, -0.22]]} frame={s.frame} color="#FF7A95" count={stuckNow ? 4 : 10} speed={0.012} size={0.03} trail={4} opacity={flow} seed={`vf${y}`} />
    </group>
  );
};

export const Shaft: React.FC<{ s: ShaftState }> = ({ s }) => {
  const m = useMemo(() => ({
    wall: std("#8E897F", { roughness: 0.95 }), wallLow: std("#5E5A53", { roughness: 0.9 }), cab: new THREE.MeshStandardMaterial({ color: "#B9BEC6", metalness: 0.6, roughness: 0.4 }),
    back: std("#2B323D", { roughness: 0.9 }), hot: emis(RED, 1.2), cold: emis(COLD, 0.9), floor: std("#6D6A64", { roughness: 0.6 }),
    tube: emis("#F2F6FF", 3.2),
  }), []);
  const f = s.frame;
  const w = s.turn;
  return (
    <group>
      {/* rellano: pared con zócalo, suelo de terrazo y fluorescente */}
      <mesh position={[0, 1.1, -0.2]} material={m.wall} receiveShadow><boxGeometry args={[5, 3.0, 0.1]} /></mesh>
      <mesh position={[0, -0.05, -0.14]} material={m.wallLow} receiveShadow><boxGeometry args={[5, 0.5, 0.03]} /></mesh>
      <mesh position={[0, -0.32, 0.9]} material={m.floor} receiveShadow><boxGeometry args={[5, 0.04, 2.4]} /></mesh>
      <group position={[0, 2.1, 0.35]}>
        <mesh material={m.cab}><boxGeometry args={[0.9, 0.04, 0.12]} /></mesh>
        <mesh material={m.tube} position={[0, -0.035, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.018, 0.018, 0.82, 12]} /></mesh>
      </group>
      <pointLight position={[0, 1.95, 0.4]} intensity={2.2} distance={5} decay={2} color="#EAF0FF" />
      <spotLight position={[0.2, 2.05, 0.9]} target-position={[0, 0.6, 0]} angle={0.9} penumbra={0.9} intensity={6} distance={6} color="#EAF0FF"
        castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-radius={5} />
      <pointLight position={[1.6, 0.9, 1.6]} intensity={0.8} distance={5} color="#FFC890" />
      <hemisphereLight args={["#AFC3E6", "#16110C", 0.25]} />
      {/* armario metálico abierto */}
      <mesh position={[0, 0.9, -0.14]} material={m.back} receiveShadow><boxGeometry args={[1.0, 1.3, 0.02]} /></mesh>
      {[-0.51, 0.51].map((x) => <mesh key={x} position={[x, 0.9, -0.02]} material={m.cab} castShadow><boxGeometry args={[0.02, 1.3, 0.26]} /></mesh>)}
      {[0.24, 1.56].map((yy) => <mesh key={yy} position={[0, yy, -0.02]} material={m.cab} castShadow><boxGeometry args={[1.04, 0.02, 0.26]} /></mesh>)}
      <mesh position={[-0.78, 0.9, 0.32]} rotation={[0, -1.25, 0]} material={m.cab} castShadow><boxGeometry args={[0.02, 1.3, 0.62]} /></mesh>
      <mesh position={[-0.42, 0.9, -0.06]} material={m.hot}><cylinderGeometry args={[0.035, 0.035, 1.6, 20]} /></mesh>
      <mesh position={[-0.32, 0.9, -0.09]} material={m.cold}><cylinderGeometry args={[0.035, 0.035, 1.6, 20]} /></mesh>
      <Flow points={[[-0.42, 0.1, -0.06], [-0.42, 1.7, -0.06]]} frame={f} color="#FF7A95" count={12} speed={0.01} size={0.035} opacity={1} seed="mh" />
      <ValveSet y={VALVE_Y[0]} s={s} bad={false} flow={s.flowA} />
      <ValveSet y={VALVE_Y[1]} s={s} bad={true} flow={s.flowB} />
      {s.stuck > 0.01 && s.fixed < 0.98 && <Glow position={[STUCK[0], STUCK[1] + 0.05, 0.08]} color="#FF3030" size={0.3} opacity={0.45 * s.stuck * (1 - s.fixed) * (0.7 + 0.3 * Math.sin(f * 0.35))} />}
      {s.fixed > 0.85 && <Glow position={[STUCK[0], STUCK[1] + 0.05, 0.08]} color="#3BE37A" size={0.3} opacity={Math.min(1, (s.fixed - 0.85) * 6) * 0.6} />}
      {/* técnico de Orcave con su caja de herramientas y la llave grifa (Poly Haven, CC0) */}
      {s.tool > 0.01 && <Asset file="metal_toolbox.glb" position={[-0.25, -0.3, 0.7 + (1 - s.tool) * 0.6]} rotation={[0, 0.4, 0]} />}
      {s.tech > 0.01 && (() => {
        // la mano derecha agarra el mango de la llave grifa y la acompaña al girar
        const gp = [0.62, -0.3, 0.6 + 0.25 * (1 - s.tech)], gr = -2.3;
        const th = -0.5 + 0.9 * w, grip = [STUCK[0] + 0.28 * Math.sin(th), STUCK[1] - 0.28 * Math.cos(th), 0.15];
        const rest = [gp[0] - 0.05, 0.25, gp[2] - 0.2];
        const tgt = rest.map((v, k) => v + (grip[k] - v) * s.reach);
        return <group position={gp as any} rotation={[0, gr, 0]}><Mannequin pose={reachRight(kneelPose(s.reach), gp, gr, tgt)} outfit={TECH} /></group>;
      })()}
      {s.tool > 0.01 && (
        <group position={[STUCK[0], STUCK[1], 0.13 + (1 - s.tool) * 0.5]} rotation={[0, 0, -0.5 + 0.9 * w]}>
          <Asset file="pipe_wrench.glb" position={[0, -0.36, 0]} rotation={[0, Math.PI / 2, 0]} />
        </group>
      )}
    </group>
  );
};
