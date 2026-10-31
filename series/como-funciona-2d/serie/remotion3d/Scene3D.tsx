// Lienzo 3D de la serie: fondo con profundidad, luz de tres puntos, entorno procedural,
// suelo con reflejo tenue y sombras suaves. quality "draft" baja sombras para capturas rápidas.
import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { C } from "./theme3d";
import { CameraKey, cameraAt } from "./CameraRig";

const Env: React.FC = () => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;
    scene.fog = new THREE.Fog("#091830", 9, 30);
    gl.localClippingEnabled = true;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl, scene]);
  return null;
};

const Cam: React.FC<{ keys: CameraKey[]; frame: number }> = ({ keys, frame }) => {
  const { camera } = useThree();
  const c = cameraAt(keys, frame);
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(c.pos[0], c.pos[1], c.pos[2]);
  cam.fov = c.fov;
  cam.near = 0.05; cam.far = 80;
  cam.updateProjectionMatrix();
  cam.lookAt(c.look[0], c.look[1], c.look[2]);
  return null;
};

export const Scene3D: React.FC<{
  frame: number; camKeys: CameraKey[]; quality?: "draft" | "final"; children: React.ReactNode;
  floorY?: number; keyLight?: number; dpr?: number; aa?: boolean;
}> = ({ frame, camKeys, quality = "final", children, floorY = 0, keyLight = 1, dpr = 1, aa = true }) => {
  const sm = quality === "final" ? 1024 : 512;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 55% at 50% 45%, ${C.bgCenter} 0%, #0B1B33 55%, ${C.bgEdge} 100%)` }}>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ alpha: true, antialias: aa }} dpr={dpr}
        camera={{ position: [0, 3, 12], fov: 30 }} style={{ position: "absolute", inset: 0 }}>
        <Env />
        <Cam keys={camKeys} frame={frame} />
        <hemisphereLight args={["#9fc4ff", "#0b1424", 0.5]} />
        {/* luz principal cálida arriba-izquierda */}
        <directionalLight position={[-6, 10, 7]} intensity={2.6 * keyLight} color="#FFE2C2" castShadow
          shadow-mapSize={[sm, sm]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={9}
          shadow-camera-bottom={-3} shadow-camera-near={1} shadow-camera-far={40} shadow-bias={-0.0004} shadow-radius={6} />
        {/* luz de borde cian desde atrás */}
        <directionalLight position={[5, 6, -9]} intensity={2.4} color={C.cold} />
        {/* relleno tenue (la hemisférica y el entorno hacen el resto) */}
        {/* suelo con reflejo tenue */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]} receiveShadow>
          <circleGeometry args={[30, 64]} />
          <meshStandardMaterial color="#0B1C36" roughness={0.3} metalness={0.35} envMapIntensity={0.6} />
        </mesh>
        {children}
      </ThreeCanvas>
      {/* viñeta */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 65% at 50% 45%, transparent 55%, rgba(3,8,18,0.65) 100%)" }} />
    </AbsoluteFill>
  );
};
