// Portada (Still): billete grande abierto bajo luz UV (fibras y tintas encendidas) con el cabezal magnético + título del gancho + chip «CÓMO FUNCIONA · 147».
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, HookTitle, K, FONT } from "./kit2d/Kit";
import { HOOK } from "./Composition";
import { Note, MagHead, C } from "./Billetes";
export const N = 147; export const HOSPITAL = false;
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <defs>
        <clipPath id="cl"><path d="M 0 0 L 560 0 L 520 400 L 560 560 L 515 700 L 545 1920 L 0 1920 Z" /></clipPath>
        <clipPath id="cr"><path d="M 560 0 L 1080 0 L 1080 1920 L 545 1920 L 515 700 L 560 560 L 520 400 Z" /></clipPath>
      </defs>
      <rect x={470} y={395} width={140} height={330} fill={C.uv} opacity={0.5} style={{ filter: `drop-shadow(0 0 24px ${C.uv})` }} />
      <g transform="translate(-70 0)"><g clipPath="url(#cl)"><Note id="cv0" x={540} y={560} uv={1} mag={1} rot={-3} /></g></g>
      <g transform="translate(70 0)"><g clipPath="url(#cr)"><Note id="cv1" x={540} y={560} uv={1} mag={1} rot={-3} /></g></g>
      <MagHead x={540} y={300} s={0.9} t={0.3} field={1} />
    </svg>
    <HookTitle t={0} text={HOOK} />
    <div style={{ position: "absolute", top: 1180, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · {N}</div>
      {HOSPITAL && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: K.white, background: K.warn, padding: "6px 24px", borderRadius: 10 }}>ESPECIAL HOSPITAL</div>}
    </div>
  </AbsoluteFill>
);
