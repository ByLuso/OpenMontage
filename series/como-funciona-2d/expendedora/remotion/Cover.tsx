// Portada (Still): la máquina expendedora abierta por la mitad con el mecanismo de monedas y las bobinas encendidas + título del gancho + chip «CÓMO FUNCIONA · 162».
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, HookTitle, K, FONT } from "./kit2d/Kit";
import { HOOK } from "./Composition";
import { Vending, Mech } from "./Expendedora";
export const N = 162; export const HOSPITAL = false;
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <circle cx={540} cy={560} r={300} fill={K.flow} opacity={0.12} />
      <Vending x={540} y={560} t={0.3} open={1} />
      <Mech x={540} y={560} s={0.78} t={0.3} coin={0.55} coils={1} field={1} eddy={0.8} kind="e1" />
    </svg>
    <HookTitle t={0} text={HOOK} />
    <div style={{ position: "absolute", top: 1180, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · {N}</div>
      {HOSPITAL && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: K.white, background: K.warn, padding: "6px 24px", borderRadius: 10 }}>ESPECIAL HOSPITAL</div>}
    </div>
  </AbsoluteFill>
);
