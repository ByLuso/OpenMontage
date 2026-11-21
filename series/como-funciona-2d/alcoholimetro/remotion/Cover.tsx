// Portada (Still) · ep. 155 alcoholímetro: el aparato abierto con la pila dando corriente + título del gancho + chip «CÓMO FUNCIONA · NN».
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, HookTitle, K, FONT } from "./kit2d/Kit";
import { HOOK } from "./Composition";
import { Device } from "./Alcoholimetro";
export const N = 155; export const HOSPITAL = false;
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <Device id="cv" x={380} y={790} s={1.05} t={0.4} open={1} shellDx={330} reading="- - -" glow={1} />
    </svg>
    <HookTitle t={0} text={HOOK} />
    <div style={{ position: "absolute", top: 1180, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · {N}</div>
      {HOSPITAL && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: K.white, background: K.warn, padding: "6px 24px", borderRadius: 10 }}>ESPECIAL HOSPITAL</div>}
    </div>
  </AbsoluteFill>
);
