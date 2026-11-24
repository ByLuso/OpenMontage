// Portada (Still): parachoques en primer plano con el sensor partido que enseña el disco, ondas de ultrasonido y un murciélago + título del gancho + chip «CÓMO FUNCIONA · 166».
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, HookTitle, K, FONT } from "./kit2d/Kit";
import { HOOK } from "./Composition";
import { BumperBand, SensorFace, SensorInside, Waves, Bat } from "./Sensor";
export const N = 166; export const HOSPITAL = false;
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Bg />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <defs>
        <clipPath id="cTop"><rect x={300} y={580} width={480} height={240} /></clipPath>
        <clipPath id="cBot"><rect x={300} y={820} width={480} height={240} /></clipPath>
      </defs>
      <BumperBand y={820} h={440} />
      <SensorFace x={175} y={820} r={80} />
      <SensorFace x={905} y={820} r={80} />
      <Waves x={540} y={820} dir={0} spread={180} phase={0.35} n={4} r0={190} r1={520} color={K.cold} w={10} />
      <SensorInside x={540} y={820} r={160} t={0} vib={1} />
      <g clipPath="url(#cTop)" transform="translate(0 -128)" opacity={0.85}><SensorFace x={540} y={820} r={173} /></g>
      <g clipPath="url(#cBot)" transform="translate(0 128)" opacity={0.85}><SensorFace x={540} y={820} r={173} /></g>
      <Bat x={540} y={430} s={0.8} flap={0.6} />
    </svg>
    <HookTitle t={0} text={HOOK} />
    <div style={{ position: "absolute", top: 1180, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: K.ink, background: K.flow, padding: "8px 30px", borderRadius: 10 }}>CÓMO FUNCIONA · {N}</div>
      {HOSPITAL && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 38, color: K.white, background: K.warn, padding: "6px 24px", borderRadius: 10 }}>ESPECIAL HOSPITAL</div>}
    </div>
  </AbsoluteFill>
);
