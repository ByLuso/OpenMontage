// Portada (Still): la caja del radar grande con la tapa abierta y la antena lanzando ondas + título del gancho + chip «CÓMO FUNCIONA · 154».
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, HookTitle, K, FONT } from "./kit2d/Kit";
import { HOOK } from "./Composition";
import { RadarBox, Arcs } from "./RadarVelocidad";
export const N = 154; export const HOSPITAL = false;
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <RadarBox x={540} y={460} s={1.25} t={0.4} open={0.8} pole={132} antHi={1} />
      <Arcs x={540} y={560} dir={-90} t={0.4} spread={110} len={130} n={3} color={K.cold} />
    </svg>
    <HookTitle t={0} text={HOOK} />
    <div style={{ position: "absolute", top: 1180, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · {N}</div>
      {HOSPITAL && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: K.white, background: K.warn, padding: "6px 24px", borderRadius: 10 }}>ESPECIAL HOSPITAL</div>}
    </div>
  </AbsoluteFill>
);
