// Portada (Still) · ep. 175 detector de monóxido: la celda abierta + título del gancho + chip «CÓMO FUNCIONA · NN».
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, HookTitle, K, FONT } from "./kit2d/Kit";
import { HOOK } from "./Composition";
import { Cell, Face } from "./Sensor";
export const N = 175; export const HOSPITAL = false;
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <Cell x={400} y={850} s={0.8} t={0.9} gas={1} react={1} cur={0.7} />
      <Face x={850} y={440} s={0.35} rot={-14} t={0.4} />
    </svg>
    <HookTitle t={0} text={HOOK} />
    <div style={{ position: "absolute", top: 1180, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · {N}</div>
      {HOSPITAL && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: K.white, background: K.warn, padding: "6px 24px", borderRadius: 10 }}>ESPECIAL HOSPITAL</div>}
    </div>
  </AbsoluteFill>
);
