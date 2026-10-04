// Brillo aditivo con sprites (sustituto del bloom que funciona sin GPU y es determinista).
import React, { useMemo } from "react";
import * as THREE from "three";

let tex: THREE.Texture | null = null;
export function glowTexture() {
  if (tex) return tex;
  const s = 128, cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const g = cv.getContext("2d")!;
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.25, "rgba(255,255,255,0.55)");
  gr.addColorStop(0.6, "rgba(255,255,255,0.12)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
  tex = new THREE.CanvasTexture(cv);
  return tex;
}

export const Glow: React.FC<{ position: number[]; color: string; size?: number; opacity?: number; scaleY?: number }> =
  ({ position, color, size = 1, opacity = 1, scaleY = 1 }) => {
    const map = useMemo(() => glowTexture(), []);
    if (opacity <= 0.001) return null;
    return (
      <sprite position={position as [number, number, number]} scale={[size, size * scaleY, 1]}>
        <spriteMaterial map={map} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
    );
  };
