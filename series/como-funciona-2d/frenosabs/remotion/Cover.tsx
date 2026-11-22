// Portada (Still): la rueda grande partida que enseña el freno (disco, corona dentada, sensor y pinza) + flechas de giro + título del gancho + chip «CÓMO FUNCIONA · 159».
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, HookTitle, K, FONT } from "./kit2d/Kit";
import { HOOK } from "./Composition";
import { Wheel, ArcArrow } from "./Frenos";
export const N = 159; export const HOSPITAL = false;
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <Wheel id="wc" cx={540} cy={820} R={330} rot={12} open={1} sensorHi={1} ringHi={0.6} press={0.5} />
      <ArcArrow x={540} y={820} r={370} a0={200} a1={260} o={1} />
      <ArcArrow x={540} y={820} r={370} a0={-20} a1={-80} o={1} />
    </svg>
    <HookTitle t={0} text={HOOK} />
    <div style={{ position: "absolute", top: 1180, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · {N}</div>
      {HOSPITAL && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: K.white, background: K.warn, padding: "6px 24px", borderRadius: 10 }}>ESPECIAL HOSPITAL</div>}
    </div>
  </AbsoluteFill>
);
