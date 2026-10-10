// Lienzo 3D del formato "cuerpo humano": fondo negro → azul petróleo, contraluz fuerte, sin suelo,
// bokeh desenfocado detrás (profundidad de campo simulada) y viñeta ligera.
import React, { useMemo } from "react";
import { AbsoluteFill, random } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CameraKey, cameraAt } from "./kit3d/CameraRig";

const Env: React.FC = () => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.35;
    gl.localClippingEnabled = true;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.1;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl, scene]);
  return null;
};

const Cam: React.FC<{ keys: CameraKey[]; frame: number }> = ({ keys, frame }) => {
  const { camera } = useThree();
  const c = cameraAt(keys, frame);
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(c.pos[0], c.pos[1], c.pos[2]);
  cam.fov = c.fov; cam.near = 0.05; cam.far = 80;
  cam.updateProjectionMatrix();
  cam.lookAt(c.look[0], c.look[1], c.look[2]);
  return null;
};

const Bokeh: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ filter: "blur(14px)" }}>
    {Array.from({ length: 22 }).map((_, i) => {
      const x = random(`bx${i}`) * 1080, y0 = random(`by${i}`) * 1920, r = 18 + random(`br${i}`) * 60;
      const y = (y0 - frame * (0.3 + random(`bs${i}`) * 0.8) + 1920 * 4) % 1920;
      const c = i % 3 === 0 ? "rgba(53,196,240,0.18)" : i % 3 === 1 ? "rgba(214,60,110,0.16)" : "rgba(255,200,61,0.12)";
      return <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: c }} />;
    })}
  </AbsoluteFill>
);

export const BodyScene: React.FC<{ frame: number; camKeys: CameraKey[]; dpr?: number; children: React.ReactNode }> = ({ frame, camKeys, dpr = 1, children }) => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 60% at 50% 42%, #0E3A46 0%, #08222B 45%, #02080B 100%)" }}>
    <Bokeh frame={frame} />
    <ThreeCanvas width={1080} height={1920} shadows gl={{ alpha: true, antialias: true }} dpr={dpr}
      camera={{ position: [0, 1, 10], fov: 30 }} style={{ position: "absolute", inset: 0 }}>
      <Env />
      <Cam keys={camKeys} frame={frame} />
      <hemisphereLight args={["#7FD6E6", "#12060A", 0.35]} />
      {/* principal cálida, baja y frontal */}
      <directionalLight position={[-4, 5, 8]} intensity={1.6} color="#FFD9C8" castShadow shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-bias={-0.0005} />
      {/* contraluz: borde cian intenso desde atrás y magenta lateral */}
      <directionalLight position={[3, 4, -8]} intensity={4.2} color="#4FE0FF" />
      <directionalLight position={[-6, -1, -5]} intensity={2.2} color="#FF4F8F" />
      {children}
    </ThreeCanvas>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.6) 100%)" }} />
  </AbsoluteFill>
);
