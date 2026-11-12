// Lienzo 3D nocturno: tono fílmico, entorno tenue, oclusión ambiental (N8AO), bloom y viñeta.
// La luz la ponen las propias escenas (lámparas, fluorescentes, luna); aquí solo el relleno.
import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer, N8AO, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CameraKey, cameraAt } from "./kit3d/CameraRig";

const Env: React.FC<{ env: number; exposure: number }> = ({ env, exposure }) => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl, scene]);
  scene.environmentIntensity = env;
  gl.toneMappingExposure = exposure;
  return null;
};

const Cam: React.FC<{ keys: CameraKey[]; frame: number }> = ({ keys, frame }) => {
  const { camera } = useThree();
  const c = cameraAt(keys, frame);
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(c.pos[0], c.pos[1], c.pos[2]);
  cam.fov = c.fov; cam.near = 0.05; cam.far = 200;
  cam.updateProjectionMatrix();
  cam.lookAt(c.look[0], c.look[1], c.look[2]);
  return null;
};

export const SceneNight: React.FC<{
  frame: number; camKeys: CameraKey[]; children: React.ReactNode; dpr?: number;
  env?: number; exposure?: number; ao?: number; bloom?: number; post?: boolean; bg?: string;
}> = ({ frame, camKeys, children, dpr = 1, env = 0.12, exposure = 1.0, ao = 1, bloom = 1, post = true, bg = "#07090D" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 40%, #151B24 0%, ${bg} 70%)` }}>
    <ThreeCanvas width={1080} height={1920} shadows gl={{ alpha: true, antialias: !post, powerPreference: "high-performance" }} dpr={dpr}
      camera={{ position: [0, 3, 12], fov: 30 }} style={{ position: "absolute", inset: 0 }}>
      <Env env={env} exposure={exposure} />
      <Cam keys={camKeys} frame={frame} />
      {children}
      {post && (
        <EffectComposer multisampling={4} enableNormalPass={false}>
          <N8AO aoRadius={0.9} distanceFalloff={0.6} intensity={3.2 * ao} quality="medium" halfRes color="#05070A" />
          <Bloom intensity={0.9 * bloom} luminanceThreshold={0.62} luminanceSmoothing={0.25} mipmapBlur radius={0.72} />
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
          <Vignette offset={0.28} darkness={0.72} />
        </EffectComposer>
      )}
    </ThreeCanvas>
  </AbsoluteFill>
);
