// Portada (Still): cúpula grande con sus haces de led y una mano debajo que casi no hace sombra + título del gancho + chip «CÓMO FUNCIONA · 163» + «ESPECIAL HOSPITAL».
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, HookTitle, K, FONT } from "./kit2d/Kit";
import { HOOK } from "./Composition";
import { Dome, Beams, Hand, ledXs } from "./LamparaQuirofano";
export const N = 163; export const HOSPITAL = true;
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <Beams x0={540} y0={438} xs={ledXs(700, 15)} tx={540} ty={1090} t={0.3} obst={[{ x: 590, y: 600, r: 56 }]} />
      <g transform="translate(540 450)"><Dome w={700} n={15} t={0.3} arm={140} /></g>
      <g transform="translate(590 600)"><Hand s={0.95} glove /></g>
    </svg>
    <HookTitle t={0} text={HOOK} />
    <div style={{ position: "absolute", top: 1180, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · {N}</div>
      {HOSPITAL && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: K.white, background: K.warn, padding: "6px 24px", borderRadius: 10 }}>ESPECIAL HOSPITAL</div>}
    </div>
  </AbsoluteFill>
);
