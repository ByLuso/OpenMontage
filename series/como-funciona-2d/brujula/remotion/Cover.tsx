// Portada (Still) · ep. 174 brújula: la brújula grande con la aguja apuntando lejos del Polo + título del gancho + chip «CÓMO FUNCIONA · NN».
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, HookTitle, K, FONT } from "./kit2d/Kit";
import { HOOK } from "./Composition";
import { Compass, Star, MagPole } from "./Brujula";
export const N = 174; export const HOSPITAL = false;
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <Star x={290} y={450} r={30} />
      <MagPole x={800} y={450} t={0.3} />
      <line x1={540} y1={860} x2={800} y2={450} stroke={K.flow} strokeWidth={5} strokeDasharray="14 12" opacity={0.7} />
      <Compass x={540} y={860} r={280} heading={34} lid={0.6} hiNeedle />
    </svg>
    <HookTitle t={0} text={HOOK} />
    <div style={{ position: "absolute", top: 1180, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · {N}</div>
      {HOSPITAL && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: K.white, background: K.warn, padding: "6px 24px", borderRadius: 10 }}>ESPECIAL HOSPITAL</div>}
    </div>
  </AbsoluteFill>
);
