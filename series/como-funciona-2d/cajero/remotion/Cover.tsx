// Portada (Still): el cajero grande abierto con el sensor midiendo un billete + título del gancho + chip «CÓMO FUNCIONA · 170».
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, HookTitle, K, FONT } from "./kit2d/Kit";
import { HOOK } from "./Composition";
import { Atm, Cassette, Wheel, Edge, Sensor, ThickBar } from "./Cajero";
export const N = 170; export const HOSPITAL = false;
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <Atm x={540} y={760} s={1.05} t={0} open={1}>
        <Cassette x={0} y={250} w={300} h={160} val="20" level={0.6} />
        <Wheel x={0} y={140} r={42} ang={20} />
        <Edge x={0} y={-90} w={200} th={12} rot={90} />
        <Sensor x={0} y={-90} t={0.3} beam={1} gapY={90} />
        <g transform="translate(0 -300)"><ThickBar x={0} y={0} w={300} val={1} /></g>
      </Atm>
    </svg>
    <HookTitle t={0} text={HOOK} />
    <div style={{ position: "absolute", top: 1180, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · {N}</div>
      {HOSPITAL && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: K.white, background: K.warn, padding: "6px 24px", borderRadius: 10 }}>ESPECIAL HOSPITAL</div>}
    </div>
  </AbsoluteFill>
);
