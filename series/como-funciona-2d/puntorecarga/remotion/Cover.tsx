// Portada (Still) · ep. 176 punto de recarga: coche y poste hablando + título del gancho + chip «CÓMO FUNCIONA · NN».
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, HookTitle, K, FONT } from "./kit2d/Kit";
import { HOOK } from "./Composition";
import { Car, Pole, Cable, Pulses, Bubble } from "./Cargador";
export const N = 176; export const HOSPITAL = false;
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <Cable x1={544} y1={871} x2={756} y2={780} />
      <Car x={330} y={880} s={0.85} t={0.6} soc={0.4} />
      <Pole x={830} y={900} s={0.62} t={0.6} on={1} />
      <Pulses xa={740} xb={470} y={700} t={0.6} />
      <Bubble x={330} y={650} w={250} text="¡LISTO!" color={K.flow} />
    </svg>
    <HookTitle t={0} text={HOOK} />
    <div style={{ position: "absolute", top: 1180, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · {N}</div>
      {HOSPITAL && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: K.white, background: K.warn, padding: "6px 24px", borderRadius: 10 }}>ESPECIAL HOSPITAL</div>}
    </div>
  </AbsoluteFill>
);
