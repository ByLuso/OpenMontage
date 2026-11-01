// Portada (Still): el visor de venas proyectando el mapa sobre el brazo + título del gancho + chip «CÓMO FUNCIONA · 130» + «ESPECIAL HOSPITAL».
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, HookTitle, K, FONT } from "./kit2d/Kit";
import { HOOK } from "./Composition";
import { Arm, Head, Cone } from "./Venas";
export const N = 130; export const HOSPITAL = true;
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <g transform="translate(540 800) scale(1.08) translate(-540 -800)">
        <Cone x={540} y0={690} y1={910} w0={140} w1={760} o={0.8} t={0.4} kind="nir" />
        <Cone x={635} y0={690} y1={910} w0={50} w1={700} o={1} t={0.4} kind="map" />
        <Arm t={0.4} map={1} />
        <Head x={540} y={600} t={0.4} open={1} glow={1} />
      </g>
    </svg>
    <HookTitle t={0} text={HOOK} />
    <div style={{ position: "absolute", top: 1180, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · {N}</div>
      {HOSPITAL && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: K.white, background: K.warn, padding: "6px 24px", borderRadius: 10 }}>ESPECIAL HOSPITAL</div>}
    </div>
  </AbsoluteFill>
);
