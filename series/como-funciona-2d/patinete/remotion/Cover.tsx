// Portada (Still): el patinete grande con la tapa del buje fuera y la lupa sobre el motor + título del gancho + chip «CÓMO FUNCIONA · 136».
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, HookTitle, K, FONT } from "./kit2d/Kit";
import { HOOK } from "./Composition";
import { Scooter, MotorCore, C } from "./Patinete";
export const N = 136; export const HOSPITAL = false;
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <Scooter cx={540} cy={860} s={1.05} t={0.3} spin={20} hubOpen={1} motorHi={1} lit={1} />
      <path d="M 248 885 L 330 720" stroke={K.flow} strokeWidth={6} strokeDasharray="14 10" />
      <circle cx={330} cy={560} r={168} fill={C.dark} stroke={K.flow} strokeWidth={8} style={{ filter: `drop-shadow(0 0 16px ${K.flow})` }} />
      <g transform="translate(330 560)"><MotorCore R={150} rot={20} lit={1} magHi={1} /></g>
    </svg>
    <HookTitle t={0} text={HOOK} />
    <div style={{ position: "absolute", top: 1180, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · {N}</div>
      {HOSPITAL && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: K.white, background: K.warn, padding: "6px 24px", borderRadius: 10 }}>ESPECIAL HOSPITAL</div>}
    </div>
  </AbsoluteFill>
);
