// Portada (Still): consola con el cirujano (silueta) unida al robot sobre la mesa + título del gancho + chip «CÓMO FUNCIONA · 157» + «ESPECIAL HOSPITAL».
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, HookTitle, K, FONT } from "./kit2d/Kit";
import { HOOK } from "./Composition";
import { Console, Theatre, Signal } from "./RobotQuirurgico";
export const N = 157; export const HOSPITAL = true;
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <g transform="translate(330 740) scale(0.85)"><Console t={0.3} hi={1} hands={1} eyes={1} /></g>
      <g transform="translate(530 740) scale(0.72)"><Theatre t={0.3} cable={1} /></g>
      <Signal x0={405} y0={340} x1={540} y1={420} t={0.3} curve={-110} />
    </svg>
    <HookTitle t={0} text={HOOK} />
    <div style={{ position: "absolute", top: 1180, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · {N}</div>
      {HOSPITAL && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: K.white, background: K.warn, padding: "6px 24px", borderRadius: 10 }}>ESPECIAL HOSPITAL</div>}
    </div>
  </AbsoluteFill>
);
