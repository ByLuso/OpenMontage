// Portada (Still): arco grande con las tapas abiertas, bobinas encendidas y el eco de una llave + título del gancho + chip «CÓMO FUNCIONA · 141».
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, HookTitle, K, FONT } from "./kit2d/Kit";
import { HOOK } from "./Composition";
import { Arch, KeyIcon, Rings, FieldPulse } from "./DetectorMetales";
export const N = 141; export const HOSPITAL = false;
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <Arch cx={540} top={380} w={660} h={770} t={0} open={1} coil={1} />
      <FieldPulse x={330} y0={500} y1={1070} dir={1} t={0.15} />
      <FieldPulse x={750} y0={500} y1={1070} dir={-1} t={0.55} />
      <KeyIcon x={540} y={590} s={1.2} glow={1} />
      <Rings x={540} y={590} t={0.2} r1={150} />
    </svg>
    <HookTitle t={0} text={HOOK} />
    <div style={{ position: "absolute", top: 1180, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · {N}</div>
      {HOSPITAL && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: K.white, background: K.warn, padding: "6px 24px", borderRadius: 10 }}>ESPECIAL HOSPITAL</div>}
    </div>
  </AbsoluteFill>
);
