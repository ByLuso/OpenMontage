// DARK MUSCLE · "Cómo crecen los músculos" — animación vectorial minimalista (azul marino, blanco y amarillo).
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Captions, Timing, FONT } from "./kit2d/Kit";

export type Props = { timing: Timing; cover?: boolean };

const BG = "#070C1A", NAVY = "#0E1730", W = "#F2F4F8", Y = "#FFC83D", DIM = "#5D6B8F";
const ease = Easing.bezier(0.45, 0, 0.25, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: ease });
/** Visible entre a y b con fundidos. */
const vis = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => interpolate(t, [a - fi, a, b, b + fo], [0, 1, 1, 0], cl);

/** Trazo que se dibuja (pathLength=1). */
const Draw: React.FC<{ d: string; t: number; t0: number; dur?: number; color?: string; w?: number; fill?: string; dash?: string }> =
  ({ d, t, t0, dur = 0.6, color = W, w = 7, fill = "none", dash }) => {
    const p = ramp(t, t0, t0 + dur);
    return <path d={d} pathLength={1} fill={fill} stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={dash ?? "1 1"} strokeDashoffset={dash ? 0 : 1 - p} opacity={dash ? p : 1} />;
  };

const Label: React.FC<{ text: string; t: number; a: number; b: number; y?: number; color?: string; size?: number }> = ({ text, t, a, b, y = 300, color = Y, size = 64 }) => {
  const o = vis(t, a, b, 0.2, 0.2);
  if (o <= 0) return null;
  const s = interpolate(t - a, [0, 0.15, 0.3], [0.85, 1.06, 1], cl);
  return (
    <div style={{ position: "absolute", top: y, left: 60, width: 960, textAlign: "center", opacity: o, transform: `scale(${s})`,
      fontFamily: FONT, fontWeight: 900, fontSize: size, letterSpacing: 2, color, textShadow: `0 0 30px ${color}55` }}>{text}</div>
  );
};

// ---------------------------------------------------------------- escenas (SVG 1080×1920, banda de dibujo y 380–1150)
/** Brazo de perfil (icono de bíceps) con mancuerna vista de frente en el puño; el antebrazo gira en el codo (curl). */
const Arm: React.FC<{ t: number; t0: number; curl: number; bulge: number; glow?: number }> = ({ t, t0, curl, bulge, glow = 0 }) => {
  const b = 40 + 55 * bulge;                       // altura del bíceps
  const ang = -10 - 95 * curl;                     // grados del antebrazo (0 = horizontal hacia la derecha)
  return (
    <g>
      {glow > 0.01 && <ellipse cx={230} cy={330} rx={160} ry={100} fill={Y} opacity={0.2 * glow} filter="url(#blur)" />}
      {/* hombro y brazo */}
      <Draw t={t} t0={t0} d="M60,250 C40,300 45,380 75,420" w={8} />
      <Draw t={t} t0={t0 + 0.05} d={`M70,300 C130,${300 - b} 280,${300 - b} 345,318`} w={8} />
      <Draw t={t} t0={t0 + 0.1} d="M75,420 C170,432 280,428 350,398" w={8} />
      <Draw t={t} t0={t0 + 0.2} d={`M150,${330 - b * 0.35} C190,${318 - b * 0.55} 240,${318 - b * 0.55} 270,${330 - b * 0.35}`} w={4} color={DIM} />
      <g transform={`rotate(${ang} 345 360)`}>
        {/* antebrazo: más ancho cerca del codo */}
        <Draw t={t} t0={t0 + 0.25} d="M345,318 C420,312 490,318 540,330" w={8} />
        <Draw t={t} t0={t0 + 0.3} d="M350,398 C430,392 490,384 540,376" w={8} />
        {/* puño */}
        <Draw t={t} t0={t0 + 0.4} d="M538,322 C570,306 612,316 614,352 C616,388 576,398 538,384" w={8} />
        <Draw t={t} t0={t0 + 0.45} d="M566,326 L566,382 M590,330 L590,378" w={4} color={DIM} />
        {/* mancuerna vista de frente */}
        <g transform="translate(578 353)">
          <circle r={70} fill={Y} fillOpacity={0.08 * ramp(t, t0 + 0.9, t0 + 1.1)} stroke={Y} strokeWidth={8} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ramp(t, t0 + 0.5, t0 + 1.0)} />
          <circle r={22} fill="none" stroke={Y} strokeWidth={6} opacity={ramp(t, t0 + 0.8, t0 + 1.0)} />
        </g>
      </g>
    </g>
  );
};

/** Vientre muscular con fibras en tensión. */
const Muscle: React.FC<{ t: number; t0: number; tension: number; frame: number }> = ({ t, t0, tension, frame }) => {
  const fib = Array.from({ length: 7 }).map((_, i) => {
    const y = 300 + (i - 3) * 30, k = 1 - Math.abs(i - 3) / 3.6;
    const j = Math.sin(frame * 0.9 + i * 1.7) * 3 * tension;
    return `M${150 + (1 - k) * 60},${y + j} C${240},${y - 70 * k * (i < 3 ? 1 : i > 3 ? -1 : 0) + j} ${360},${y - 70 * k * (i < 3 ? 1 : i > 3 ? -1 : 0) - j} ${450 - (1 - k) * 60},${y - j}`;
  });
  return (
    <g>
      <Draw t={t} t0={t0} dur={0.8} d="M110,300 C200,150 400,150 490,300 C400,450 200,450 110,300 Z" w={8} />
      <Draw t={t} t0={t0 + 0.3} d="M30,300 L110,300" w={10} />
      <Draw t={t} t0={t0 + 0.3} d="M490,300 L570,300" w={10} />
      {fib.map((d, i) => <Draw key={i} t={t} t0={t0 + 0.35 + i * 0.05} d={d} w={4} color={i % 2 ? W : "#C9D2E6"} />)}
      {tension > 0.01 && [-1, 1].map((s) => (
        <g key={s} opacity={tension} transform={`translate(${s < 0 ? 30 - 20 * tension : 570 + 20 * tension} 300)`}>
          <path d={`M0,0 L${s * 70},0 M${s * 70},0 l${-s * 24},-20 M${s * 70},0 l${-s * 24},20`} stroke={Y} strokeWidth={10} strokeLinecap="round" fill="none" />
        </g>
      ))}
    </g>
  );
};

/** Corte transversal de un haz: las fibras engrosan y reciben bloques de proteína. */
const CrossSection: React.FC<{ t: number; t0: number; grow: number; frame: number }> = ({ t, t0, grow, frame }) => {
  const cells: number[][] = [[0, 0]];
  for (let k = 0; k < 6; k++) cells.push([Math.cos((k * Math.PI) / 3) * 92, Math.sin((k * Math.PI) / 3) * 92]);
  const r = 40 + 8 * grow;
  return (
    <g transform="translate(300 300)">
      <circle r={150 + 10 * grow} fill="none" stroke={W} strokeWidth={6} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ramp(t, t0, t0 + 0.6)} />
      {cells.map(([x, y], i) => (
        <circle key={i} cx={x * (1 + 0.1 * grow)} cy={y * (1 + 0.1 * grow)} r={r} fill={grow > 0.02 ? `${Y}${Math.round(30 * grow).toString(16).padStart(2, "0")}` : "none"}
          stroke={i === 0 ? Y : W} strokeWidth={5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ramp(t, t0 + 0.2 + i * 0.05, t0 + 0.7 + i * 0.05)} />
      ))}
      {grow > 0.01 && grow < 0.99 && Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.3, u = (frame * 0.04 + i * 0.13) % 1;
        const d = 260 - 170 * u;
        return <rect key={i} x={Math.cos(a) * d - 9} y={Math.sin(a) * d - 9} width={18} height={18} rx={4} fill={Y} opacity={Math.sin(Math.PI * u)} />;
      })}
    </g>
  );
};

/** Curva de síntesis de proteína muscular: sube tras entrenar y vuelve a la base en 1–2 días (sin cifras inventadas). */
const Graph: React.FC<{ t: number; t0: number; p: number }> = ({ t, t0, p }) => {
  const X0 = 70, X1 = 540, YB = 400, f = (u: number) => YB - 220 * Math.exp(-Math.pow((u - 0.4) / 0.22, 2));
  const pts = Array.from({ length: 41 }).map((_, i) => { const u = i / 40; return `${X0 + u * (X1 - X0)},${f(u)}`; });
  const d = "M" + pts.join(" L");
  const u = p, dot = [X0 + u * (X1 - X0), f(u)];
  return (
    <g>
      <Draw t={t} t0={t0} d={`M${X0},120 L${X0},${YB + 40} L${X1 + 20},${YB + 40}`} w={5} color={DIM} />
      <path d={`M${X0},${YB} L${X1},${YB}`} stroke={DIM} strokeWidth={3} strokeDasharray="10 12" opacity={ramp(t, t0, t0 + 0.4)} />
      <path d={d} fill="none" stroke={Y} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
      {p > 0.01 && <circle cx={dot[0]} cy={dot[1]} r={13} fill={Y} />}
      {[["0 h", 0], ["24 h", 0.5], ["48 h", 1]].map(([s, k]) => (
        <text key={s as string} x={X0 + (k as number) * (X1 - X0)} y={YB + 90} fill={W} fontFamily={FONT} fontWeight={800} fontSize={34} textAnchor="middle" opacity={ramp(t, t0 + 0.2, t0 + 0.6)}>{s}</text>
      ))}
    </g>
  );
};

const Plate: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => (
  <g>
    <Draw t={t} t0={t0} d="M300,180 a150,150 0 1,0 0.1,0" />
    <Draw t={t} t0={t0 + 0.15} d="M300,225 a105,105 0 1,0 0.1,0" color={DIM} w={4} />
    <Draw t={t} t0={t0 + 0.3} d="M235,270 C260,215 360,215 372,262 C385,315 330,345 285,335 C245,325 222,300 235,270 Z" color={Y} fill={`${Y}22`} />
    <Draw t={t} t0={t0 + 0.35} d="M80,170 L80,430 M60,170 L60,240 Q80,260 100,240 L100,170" w={6} />
    <Draw t={t} t0={t0 + 0.4} d="M520,170 C560,200 560,280 525,300 L525,430" w={6} />
  </g>
);

const Moon: React.FC<{ t: number; t0: number; frame: number }> = ({ t, t0, frame }) => (
  <g>
    <Draw t={t} t0={t0} d="M330,150 A150,150 0 1,0 470,330 A120,120 0 1,1 330,150 Z" color={Y} fill={`${Y}1A`} />
    {["Z", "z", "z"].map((z, i) => {
      const u = ((frame / 30) * 0.5 + i * 0.33) % 1;
      return <text key={i} x={430 + i * 40 + u * 30} y={230 - i * 50 - u * 40} fill={W} fontFamily={FONT} fontWeight={900} fontSize={60 - i * 12} opacity={ramp(t, t0 + 0.3, t0 + 0.6) * Math.sin(Math.PI * u)}>{z}</text>;
    })}
  </g>
);

/** Escalones de progresión con la barra cargando discos. */
const Steps: React.FC<{ t: number; t0: number; k: number }> = ({ t, t0, k }) => (
  <g>
    {[0, 1, 2, 3].map((i) => {
      const h = 90 + i * 70, x = 70 + i * 120, on = k > i * 0.25;
      return <rect key={i} x={x} y={470 - h * ramp(t, t0 + i * 0.12, t0 + 0.5 + i * 0.12)} width={96} height={h * ramp(t, t0 + i * 0.12, t0 + 0.5 + i * 0.12)} rx={10}
        fill={on ? `${Y}33` : "none"} stroke={on ? Y : W} strokeWidth={5} />;
    })}
    <Draw t={t} t0={t0 + 0.4} d="M60,120 L540,120" w={9} />
    {[0, 1, 2].map((i) => (
      <g key={i} opacity={k > i * 0.33 + 0.05 ? 1 : 0.15}>
        <rect x={110 - i * 26} y={70} width={20} height={100} rx={5} fill={i < Math.ceil(k * 3) ? Y : "none"} stroke={Y} strokeWidth={4} />
        <rect x={470 + i * 26} y={70} width={20} height={100} rx={5} fill={i < Math.ceil(k * 3) ? Y : "none"} stroke={Y} strokeWidth={4} />
      </g>
    ))}
  </g>
);

const Clock: React.FC<{ t: number; t0: number; frame: number }> = ({ t, t0, frame }) => {
  const a = frame * 14;
  return (
    <g transform="translate(300 300)">
      <circle r={170} fill="none" stroke={W} strokeWidth={7} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ramp(t, t0, t0 + 0.5)} />
      {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={0} y1={-150} x2={0} y2={-132} stroke={DIM} strokeWidth={5} transform={`rotate(${i * 30})`} opacity={ramp(t, t0 + 0.2, t0 + 0.5)} />)}
      <line x1={0} y1={0} x2={0} y2={-120} stroke={Y} strokeWidth={9} strokeLinecap="round" transform={`rotate(${a})`} />
      <line x1={0} y1={0} x2={0} y2={-80} stroke={W} strokeWidth={9} strokeLinecap="round" transform={`rotate(${a / 12})`} />
      <circle r={12} fill={Y} />
    </g>
  );
};

/** Marco de escena: entra con escala y deriva lenta de cámara. */
const Scene: React.FC<{ t: number; a: number; b: number; children: React.ReactNode; scale?: number; dx?: number }> = ({ t, a, b, children, scale = 1.45, dx = 0 }) => {
  const o = vis(t, a, b, 0.22, 0.22);
  if (o <= 0) return null;
  const s = interpolate(t, [a - 0.22, a + 0.2, b + 0.22], [0.92, 1, 1.05], cl) * scale;
  const drift = interpolate(t, [a, b], [-1, 1], cl) * dx;
  return <g opacity={o} transform={`translate(${540 + drift} 790) scale(${s}) translate(-310 -300)`}>{children}</g>;
};

export const Hipertrofia: React.FC<Props> = ({ timing, cover = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const B = timing.beats;
  const W_ = (bi: number, w: string) => {
    const n = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
    const x = timing.words.find((k) => k.beat === bi - 1 && n(k.w).startsWith(n(w)));
    if (!x) throw new Error(`palabra ${bi} ${w}`);
    return x.s;
  };
  // subtítulos: "uno coma seis" → "1,6"; sin subtítulos en el cierre (lo cuenta el propio rótulo)
  const words = (() => {
    const out: typeof timing.words = [];
    for (let i = 0; i < timing.words.length; i++) {
      const w = timing.words[i];
      if (w.beat === 5) continue;
      if (w.w === "uno" && timing.words[i + 1]?.w === "coma") { out.push({ ...w, w: "1,6", e: timing.words[i + 2].e }); i += 2; continue; }
      out.push(w);
    }
    return out;
  })();

  const t2 = B[1].s, tSig = W_(2, "el"), tTen = W_(2, "tension"), t3 = B[2].s, tEng = W_(3, "reparar"), t4 = B[3].s, tNum = W_(4, "alrededor"),
    tSleep = W_(4, "y"), t5 = B[4].s, t6 = B[5].s, tDark = W_(6, "dark");
  const curl = 0.5 - 0.5 * Math.cos(t * 4.2);
  const shake = t < 0.25 ? Math.sin(frame * 3) * 10 * (1 - t / 0.25) : 0;

  if (cover) {
    return (
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${NAVY} 0%, ${BG} 70%)` }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <defs><filter id="blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="30" /></filter></defs>
          <g transform="translate(600 1060) scale(1.45) translate(-330 -330)"><Arm t={99} t0={0} curl={0.8} bulge={0.9} glow={1} /></g>
        </svg>
        <div style={{ position: "absolute", top: 200, left: 60, width: 960, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 104, lineHeight: 1.02, color: W }}>
          Tus músculos <span style={{ color: Y }}>NO crecen</span> en el gym
        </div>
        <div style={{ position: "absolute", top: 1480, left: 0, width: 1080, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 56, letterSpacing: 10, color: W }}>
          DARK <span style={{ color: Y }}>MUSCLE</span>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${NAVY} 0%, ${BG} 72%)`, transform: `translateX(${shake}px)` }}>
      {/* rejilla de puntos sutil */}
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.18 }}>
        {Array.from({ length: 12 * 21 }).map((_, i) => <circle key={i} cx={45 + (i % 12) * 90} cy={45 + Math.floor(i / 12) * 90} r={2.2} fill={DIM} />)}
      </svg>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs><filter id="blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="30" /></filter></defs>
        {/* 1 · gancho: curl con la flecha de crecimiento tachada */}
        <Scene t={t} a={0} b={t2 - 0.1} dx={20}>
          <Arm t={t} t0={0} curl={curl} bulge={0.3} />
          <g opacity={ramp(t, W_(1, "no") - 0.05, W_(1, "no") + 0.2)} transform="translate(200 110)">
            <path d="M0,60 L0,-50 M0,-50 l-30,30 M0,-50 l30,30" stroke={W} strokeWidth={10} strokeLinecap="round" fill="none" />
            <path d="M-55,-60 L55,70 M55,-60 L-55,70" stroke={Y} strokeWidth={14} strokeLinecap="round" />
          </g>
        </Scene>
        {/* 2a · crecen después: el reloj corre */}
        <Scene t={t} a={t2} b={tSig - 0.1} scale={1.25}>
          <Clock t={t} t0={t2} frame={frame} />
        </Scene>
        {/* 2b · el entrenamiento da la señal */}
        <Scene t={t} a={tSig} b={tTen - 0.1} dx={-20}>
          <Arm t={t} t0={tSig} curl={curl} bulge={0.4} glow={vis(t, tSig + 0.3, tTen, 0.3, 0.2)} />
          {[0, 1, 2].map((i) => {
            const u = ((t - tSig) * 1.2 + i / 3) % 1;
            return <circle key={i} cx={220} cy={250} r={60 + 160 * u} fill="none" stroke={Y} strokeWidth={6} opacity={(1 - u) * ramp(t, tSig + 0.3, tSig + 0.5)} />;
          })}
        </Scene>
        {/* 2c · tensión en las fibras */}
        <Scene t={t} a={tTen} b={t3 - 0.1} scale={1.3} dx={15}>
          <Muscle t={t} t0={tTen} tension={ramp(t, tTen + 0.3, tTen + 0.8)} frame={frame} />
        </Scene>
        {/* 3a · 1–2 días de síntesis de proteína */}
        <Scene t={t} a={t3} b={tEng - 0.1} scale={1.3}>
          <Graph t={t} t0={t3} p={ramp(t, t3 + 0.3, tEng - 0.3)} />
        </Scene>
        {/* 3b · reparar y engrosar */}
        <Scene t={t} a={tEng} b={t4 - 0.1} scale={1.3} dx={-15}>
          <CrossSection t={t} t0={tEng} grow={ramp(t, tEng + 0.4, t4 - 0.3)} frame={frame} />
        </Scene>
        {/* 4a · material: proteína */}
        <Scene t={t} a={t4} b={tSleep - 0.1} scale={1.3} dx={15}>
          <g opacity={1 - ramp(t, tNum - 0.25, tNum + 0.1)}><Plate t={t} t0={t4 + 0.2} /></g>
        </Scene>
        {/* 4b · descanso */}
        <Scene t={t} a={tSleep} b={t5 - 0.1} scale={1.3}>
          <Moon t={t} t0={tSleep} frame={frame} />
        </Scene>
        {/* 5 · sobrecarga progresiva */}
        <Scene t={t} a={t5} b={t6 - 0.1} scale={1.3} dx={-15}>
          <Steps t={t} t0={t5} k={ramp(t, W_(5, "mas") - 0.1, B[4].e)} />
        </Scene>
      </svg>

      {/* rótulos */}
      <Label text="NO MIENTRAS ENTRENAS" t={t} a={W_(1, "no")} b={t2 - 0.1} />
      <Label text="DESPUÉS" t={t} a={W_(2, "despues")} b={tSig - 0.1} />
      <Label text="LA SEÑAL" t={t} a={W_(2, "senal")} b={tTen - 0.1} />
      <Label text="TENSIÓN MECÁNICA" t={t} a={tTen + 0.1} b={t3 - 0.1} />
      <Label text="1–2 DÍAS" t={t} a={W_(3, "uno")} b={tEng - 0.1} />
      <Label text="síntesis de proteína muscular" t={t} a={t3 + 0.6} b={tEng - 0.1} y={1080} color={W} size={40} />
      <Label text="FIBRAS MÁS GRUESAS" t={t} a={W_(3, "engrosar") - 0.1} b={t4 - 0.1} />
      <Label text="PROTEÍNA" t={t} a={W_(4, "proteina")} b={tNum - 0.1} />
      {(() => {
        const o = vis(t, tNum, tSleep - 0.1, 0.2, 0.2);
        if (o <= 0) return null;
        const v = interpolate(t, [tNum, tNum + 0.8], [0, 1.6], { ...cl, easing: ease });
        return (
          <div style={{ position: "absolute", top: 560, left: 0, width: 1080, textAlign: "center", opacity: o, fontFamily: FONT }}>
            <div style={{ fontWeight: 900, fontSize: 230, color: Y, lineHeight: 1, textShadow: `0 0 50px ${Y}66` }}>{v.toFixed(1).replace(".", ",")} g</div>
            <div style={{ fontWeight: 900, fontSize: 56, color: W, marginTop: 10 }}>por kg de peso al día</div>
          </div>
        );
      })()}
      <Label text="DESCANSO" t={t} a={W_(4, "descanso")} b={t5 - 0.1} />
      <Label text="SOBRECARGA PROGRESIVA" t={t} a={t5 + 0.2} b={W_(5, "mas") - 0.1} size={58} />
      {[["+ PESO", W_(5, "peso")], ["+ REPETICIONES", W_(5, "repeticiones")], ["+ SERIES", W_(5, "series")]].map(([s, a], i) => (
        <Label key={s as string} text={s as string} t={t} a={(a as number) - 0.1} b={t6 - 0.1} y={250 + i * 85} size={60} color={i === 2 ? Y : W} />
      ))}

      {/* cierre de marca */}
      {(() => {
        const o = vis(t, t6 - 0.05, 999, 0.25, 0.2);
        if (o <= 0) return null;
        const line = (txt: string, a: number, y: number, c: string) => (
          <div style={{ position: "absolute", top: y, left: 0, width: 1080, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 84, color: c,
            opacity: ramp(t, a - 0.1, a + 0.15), transform: `translateY(${(1 - ramp(t, a - 0.1, a + 0.2)) * 30}px)` }}>{txt}</div>
        );
        const logo = ramp(t, tDark - 0.15, tDark + 0.25);
        return (
          <AbsoluteFill style={{ opacity: o }}>
            {line("Entrena con cabeza.", W_(6, "entrena"), 520, W)}
            {line("Crece con ciencia.", W_(6, "crece"), 630, Y)}
            <div style={{ position: "absolute", top: 860, left: 0, width: 1080, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 116, letterSpacing: 4, whiteSpace: "nowrap",
              color: W, opacity: logo, transform: `scale(${0.85 + 0.15 * logo})`, textShadow: `0 0 40px ${Y}44` }}>
              DARK <span style={{ color: Y }}>MUSCLE</span>
            </div>
            <div style={{ position: "absolute", top: 1010, left: 540 - 300 * logo, width: 600 * logo, height: 8, background: Y, borderRadius: 4 }} />
          </AbsoluteFill>
        );
      })()}

      <Captions words={words} t={t} />
    </AbsoluteFill>
  );
};
