// Portada: tostadora abierta al rojo + personaje celebrando + título de ≤5 palabras y chip de la serie.
import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import * as THREE from "three";
import { Scene3D } from "./kit3d/Scene3D";
import { Guide, POSES } from "./kit3d/Guide";
import { Toaster } from "./Model";
import { FONT, K } from "./kit2d/Kit";

export const Cover: React.FC = () => {
  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.42), []);
  return (
    <AbsoluteFill>
      <Scene3D frame={0} camKeys={[{ f: 0, pos: [0.9, 2.9, 8.2], look: [-0.6, 1.2, 0], fov: 32, breathe: 0 }]}>
        <Toaster s={{ lift: 0, heat: 1, magnet: 1, toast: 0.6, ghostA: 0, micaGlow: 0, knob: 0.6, flow: 1 }} clip={clip} frame={40} />
        <Guide pose={POSES.point} frame={40} position={[-2.55, 0, 0.75]} rotationY={0.85} scale={0.62} />
      </Scene3D>
      <div style={{ position: "absolute", top: 230, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 42, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · 01</div>
      </div>
      <div style={{ position: "absolute", top: 1180, left: 60, width: 900, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 112, lineHeight: 1.02,
        color: K.white, textShadow: "0 6px 0 #06101F, 0 0 30px rgba(0,0,0,0.7)" }}>
        El reloj de tu <span style={{ color: K.hot }}>tostadora</span>
      </div>
    </AbsoluteFill>
  );
};
