// Piezas comunes de la serie "cuerpo humano" (@anatomiaexpres).
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { FONT, K, Timing } from "./kit2d/Kit";

export const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");
export const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) =>
  interpolate(t, [a - fi, a, b, b + fo], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Accesos a la voz: inicio/fin de bloque y de palabra (por prefijo normalizado). */
export function voice(timing: Timing) {
  const B = timing.beats;
  return {
    bs: (i: number) => B[i - 1].s,
    be: (i: number) => B[i - 1].e,
    Wd: (i: number, w: string) => {
      const x = timing.words.find((k) => k.beat === i - 1 && norm(k.w).startsWith(norm(w)));
      if (!x) throw new Error(`Palabra no encontrada en el bloque ${i}: ${w}`);
      return x.s;
    },
  };
}

/** Cifra clave grande con contador. */
export const BigNumber: React.FC<{ t: number; t0: number; t1: number; value: number; suffix?: string; label: string; color?: string; top?: number; decimals?: number }> =
  ({ t, t0, t1, value, suffix = "", label, color = K.flow, top = 300, decimals = 0 }) => {
    const a = win(t, t0, t1, 0.15, 0.3);
    if (a <= 0) return null;
    const k = Math.min(1, Math.max(0, (t - t0) / 0.7));
    const v = (1 - Math.pow(1 - k, 3)) * value;
    const txt = v.toLocaleString("es-ES", { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).replace(/,/g, ".");
    const pop = interpolate(t - t0, [0, 0.12, 0.3], [0.5, 1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div style={{ position: "absolute", top, left: 60, width: 900, display: "flex", flexDirection: "column", alignItems: "center", opacity: a, transform: `scale(${pop})` }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 170, lineHeight: 0.95, color, textShadow: `0 0 40px ${color}AA, 0 8px 0 #06101F` }}>{txt}{suffix}</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 54, color: K.white, textShadow: "0 4px 0 #06101F" }}>{label}</div>
      </div>
    );
  };

/** Portada: título grande arriba (con una parte resaltada) y remate abajo. */
export const CoverTitle: React.FC<{ before: string; hl: string; after: string; bottom: string; hlColor?: string }> = ({ before, hl, after, bottom, hlColor = K.cold }) => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,8,11,0.85) 0%, rgba(2,8,11,0) 32%, rgba(2,8,11,0) 62%, rgba(2,8,11,0.85) 100%)" }} />
    <div style={{ position: "absolute", top: 180, left: 60, width: 900, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 100, lineHeight: 1.0,
      color: K.white, textShadow: "0 6px 0 #06101F, 0 0 30px rgba(0,0,0,0.8)" }}>
      {before} <span style={{ color: hlColor }}>{hl}</span> {after}
    </div>
    <div style={{ position: "absolute", top: 1290, left: 60, width: 900, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 60,
      color: "#FF7AB0", textShadow: "0 4px 0 #06101F" }}>{bottom}</div>
  </>
);

/** Destello al cambiar de mundo (zoom a través del tejido). */
export const CutFlash: React.FC<{ t: number; cuts: number[] }> = ({ t, cuts }) => {
  const f = Math.max(0, ...cuts.map((c) => 1 - Math.abs(t - c) / 0.14));
  if (f <= 0) return null;
  return <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, rgba(255,235,240,${f * 0.9}) 0%, rgba(255,90,140,${f * 0.55}) 45%, rgba(0,0,0,0) 80%)` }} />;
};
