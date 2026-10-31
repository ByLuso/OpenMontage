// Episodio 126 · Cómo sabe un robot aspirador por dónde ha pasado.
// Cada beat es una <Scene> con su dibujo (RobotAspirador.tsx), un <Chip> y 1-3 <Label>. Cambios atados a palabras con Wd(beat, "palabra").
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { C, RobotTop, RobotSide, robotSideEmitter, IRBeam, BottomView, WheelEncoder, encoderPulses, Dock, Battery, Sock, Icon, rectSegs, rayDist, lanes, bounce, partial, toD, Seg } from "./RobotAspirador";

export const COMP_ID = "RobotAspirador";
export const HOOK = "Tu robot dibuja un mapa"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const lin = (t: number, a: number, b: number) => clamp((t - a) / Math.max(0.001, b - a));

// geometría fija
const RANDOM = bounce(100, 490, 500, 870, 40, 7);
const ROWS2 = lanes(590, 970, 495, 46, 9);
const HOUSE: Seg[] = [...rectSegs(130, 480, 950, 1090), [560, 480, 560, 700], [560, 820, 560, 1090], [560, 780, 800, 780]];
const ROOM: Seg[] = [...rectSegs(130, 470, 950, 1080), ...rectSegs(600, 880, 900, 1040)];
const SCAN_O: [number, number] = [400, 722];
const SCAN = Array.from({ length: 144 }, (_, k) => { const a = (k / 144) * Math.PI * 2; const d = rayDist(SCAN_O[0], SCAN_O[1], a, ROOM); return { deg: k * 2.5, x: SCAN_O[0] + Math.cos(a) * d, y: SCAN_O[1] + Math.sin(a) * d }; });
const MOW = lanes(190, 890, 520, 62, 9);
const segLen = (s: Seg) => Math.hypot(s[2] - s[0], s[3] - s[1]);
const HOUSE_LEN = HOUSE.reduce((a, s) => a + segLen(s), 0);

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { B, Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const S = (i: number) => scene(i)[0];
  const E = (i: number) => scene(i)[1];
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, S(i), E(i))} />;

  // ---- beat 1: gancho
  const wOpen = Wd(1, "equivocados");
  const open1 = ramp(t, wOpen, wOpen + 0.6);
  const myth = partial(bounce(80, 420, 1000, 1150, 30, 11), lin(t, 0, wOpen));

  // ---- beat 2: al azar vs con mapa
  const rnd = partial(RANDOM, lin(t, S(2), E(2)));
  const wPero = Wd(2, "pero");
  const rows2 = partial(ROWS2, lin(t, wPero, E(2) - 0.2));

  // ---- beat 3: idea clave
  const draw3 = ramp(t, Wd(3, "dibuja"), Wd(3, "vez"));
  let acc = 0;
  const houseDrawn = HOUSE.map((s) => { const L = segLen(s); const k = clamp((draw3 * HOUSE_LEN - acc) / L); acc += L; return [s[0], s[1], s[0] + (s[2] - s[0]) * k, s[1] + (s[3] - s[1]) * k, k] as const; });
  const here3 = ramp(t, Wd(3, "sitúa"), Wd(3, "sitúa") + 0.4);

  // ---- beat 4: láser que gira
  const sweep = Math.max(0, t - S(4)) * 360 * 0.6;
  const beamA = (sweep % 360) * Math.PI / 180;
  const beamD = rayDist(SCAN_O[0], SCAN_O[1], beamA, ROOM);
  const cam4 = ramp(t, Wd(4, "cámara"), Wd(4, "cámara") + 0.4);

  // ---- beat 5: ruedas que cuentan
  const ang5 = Math.max(0, t - S(5)) * 150;
  const turn5 = ramp(t, Wd(5, "gira"), Wd(5, "gira") + 0.6);
  const adv5 = ramp(t, Wd(5, "avanzado") - 0.5, Wd(5, "gira"));

  // ---- beat 6: sensores de caída
  const wReb = Wd(6, "rebota"), wFrena = Wd(6, "frena");
  const fx6 = 560 + 200 * ramp(t, S(6) + 0.3, wReb);
  const em6 = robotSideEmitter(fx6, 900);
  const over6 = em6.ex > 700;
  const moving6 = t < wReb ? 1 : 0;

  // ---- beat 7: parachoques
  const wChoca = Wd(7, "choca"), wRumbo = Wd(7, "cambia");
  const hit7 = ramp(t, wChoca - 0.05, wChoca + 0.12) * (1 - ramp(t, wChoca + 0.35, wChoca + 0.7));
  let cy7 = 980 - 258 * ramp(t, S(7) + 0.1, wChoca) + 70 * ramp(t, wChoca + 0.3, wChoca + 0.8);
  const head7 = 120 * ramp(t, wRumbo, wRumbo + 0.6);
  const go7 = 170 * ramp(t, wRumbo + 0.6, E(7));
  const cx7 = 540 + go7 * Math.sin(head7 * Math.PI / 180);
  cy7 += -go7 * Math.cos(head7 * Math.PI / 180);

  // ---- beat 8: filas
  const mow = partial(MOW, lin(t, S(8) + 0.2, E(8) - 0.3));
  const wSol = Wd(8, "dejarse");
  const lap8 = ramp(t, wSol, wSol + 0.4);

  // ---- beat 9: cepillos
  const air9 = ramp(t, Wd(9, "ventilador"), Wd(9, "ventilador") + 0.4);
  const dust9 = 0.1 + 0.7 * lin(t, Wd(9, "aspira"), E(9));

  // ---- beat 10: vuelta a la base
  const wEnc = Wd(10, "encaja");
  const path10: [number, number][] = [[260, 560], [260, 760], [540, 760], [540, 963]];
  const p10a = partial(path10.slice(0, 3), lin(t, S(10) + 0.2, wEnc - 0.1));
  const p10b = partial(path10.slice(2), lin(t, wEnc, E(10) - 0.7));
  const onB = t >= wEnc;
  const rob10 = onB ? p10b : p10a;
  const docked = ramp(t, E(10) - 0.7, E(10) - 0.4);
  const beam10 = Math.max(0.2, ramp(t, wEnc - 0.3, wEnc + 0.2));

  // ---- beat 11: alfombra oscura
  const wAbs = Wd(11, "absorbe"), wPre = Wd(11, "precipicio");
  const fx11 = 560 + 70 * ramp(t, S(11) + 0.3, wAbs);
  const em11 = robotSideEmitter(fx11, 930);
  const onRug = em11.ex > 560;

  // ---- beat 12: cables y calcetines
  const wAtr = Wd(12, "atrapa"), wAta = Wd(12, "atasca");
  const cy12 = 1000 - 300 * ramp(t, Wd(12, "antes"), wAtr);
  const pull = ramp(t, wAtr, wAtr + 0.5);
  const stuck = ramp(t, wAta - 0.2, wAta + 0.2);
  const cable = Array.from({ length: 60 }, (_, k) => {
    const x = 100 + k * 14.5; const y = 660 + 38 * Math.sin(x / 70);
    const w = Math.exp(-(((x - 540) / 200) ** 2)) * pull;
    return [x + (540 - x) * w * 0.85, y + (cy12 + 30 - y) * w * 0.9] as [number, number];
  });

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el robot grande; al decir «equivocados» la tapa se abre y dentro hay un mapa */}
      <Scene {...sc(1)}>
        <Svg>
          <path d={toD(myth.pts)} fill="none" stroke={K.warn} strokeWidth={6} strokeDasharray="18 14" opacity={0.45 * (1 - open1)} />
          <RobotTop cx={540} cy={800} r={330} t={t} heading={6 * Math.sin(t * 1.3) * (1 - open1)} open={open1} laser={0} id="hook" />
        </Svg>
        <Chip text="Robot aspirador" o={span(t, 1.8, E(1))} />
      </Scene>

      {/* 2 · baratos al azar / con mapa en filas */}
      <Scene {...sc(2)}>
        {chip(2, "¿Al azar?")}
        <Svg>
          <rect x={80} y={470} width={440} height={420} rx={18} fill="rgba(6,16,31,0.55)" stroke={K.warn} strokeWidth={4} opacity={0.9} />
          <path d={toD(rnd.pts)} fill="none" stroke={K.warn} strokeWidth={5} opacity={0.75} />
          <RobotTop cx={rnd.head[0]} cy={rnd.head[1]} r={34} t={t} heading={rnd.ang * 180 / Math.PI + 90} brush={false} />
          <g opacity={0.3 + 0.7 * ramp(t, wPero, wPero + 0.3)}>
            <rect x={560} y={470} width={440} height={420} rx={18} fill="rgba(6,16,31,0.55)" stroke={K.flow} strokeWidth={4} />
            <path d={toD(rows2.pts)} fill="none" stroke={K.cold} strokeWidth={30} opacity={0.35} strokeLinejoin="round" />
            <path d={toD(rows2.pts)} fill="none" stroke={K.flow} strokeWidth={4} />
            <RobotTop cx={rows2.head[0]} cy={rows2.head[1]} r={34} t={t} heading={rows2.ang * 180 / Math.PI + 90} brush={false} />
          </g>
        </Svg>
        <Label x={300} y={965} text="REBOTA AL AZAR" color={K.warn} o={span(t, S(2) + 0.3, E(2))} />
        <Label x={780} y={965} text="CON MAPA" color={K.flow} o={span(t, Wd(2, "mapa"), E(2))} />
      </Scene>

      {/* 3 · idea clave: dibuja el mapa y se sitúa */}
      <Scene {...sc(3)}>
        {chip(3, "La idea clave")}
        <Svg>
          {HOUSE.map((s, i) => <line key={`g${i}`} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} stroke={C.light} strokeWidth={6} opacity={0.15} />)}
          {houseDrawn.map((s, i) => s[4] > 0 && <line key={i} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} stroke={K.cold} strokeWidth={12} strokeLinecap="round" />)}
          <rect x={170} y={930} width={250} height={120} rx={14} fill={K.cold} opacity={0.3 * ramp(draw3, 0.7, 1)} />
          <circle cx={760} cy={620} r={60} fill={K.cold} opacity={0.3 * ramp(draw3, 0.5, 0.8)} />
          <circle cx={350} cy={700} r={70 + 50 * ((t * 1.3) % 1)} fill="none" stroke={K.flow} strokeWidth={6} opacity={here3 * (1 - ((t * 1.3) % 1))} />
          <RobotTop cx={350 + 20 * Math.sin(t * 0.8)} cy={700} r={62} t={t} heading={20 * Math.sin(t * 0.8)} />
        </Svg>
        <Label x={540} y={430} text="DIBUJA EL MAPA" color={K.cold} o={span(t, Wd(3, "dibuja"), E(3))} />
        <Label x={350} y={590} text="Y SE SITÚA" color={K.flow} box o={span(t, Wd(3, "sitúa"), E(3))} />
        <Label x={755} y={935} text="SLAM" size={52} color={K.white} box o={span(t, Wd(3, "vez"), E(3))} />
      </Scene>

      {/* 4 · primero: láser que gira (o cámara) mide distancias */}
      <Scene {...sc(4)}>
        {chip(4, "1 · Láser o cámara")}
        <Svg>
          {ROOM.map((s, i) => <line key={i} x1={s[0]} y1={s[1]} x2={s[2]} y2={s[3]} stroke={C.light} strokeWidth={5} opacity={0.15} />)}
          <g opacity={cam4}>
            <path d={`M 400,650 L 880,470 L 950,600 Z`} fill={K.cold} opacity={0.18} />
            <circle cx={950} cy={470} r={22 + 6 * Math.sin(t * 8)} fill="none" stroke={K.cold} strokeWidth={6} />
          </g>
          <line x1={SCAN_O[0]} y1={SCAN_O[1]} x2={SCAN_O[0] + Math.cos(beamA) * beamD} y2={SCAN_O[1] + Math.sin(beamA) * beamD} stroke={K.flow} strokeWidth={5} opacity={t > S(4) ? 0.9 : 0} />
          <line x1={SCAN_O[0]} y1={SCAN_O[1]} x2={SCAN_O[0] + Math.cos(beamA) * beamD} y2={SCAN_O[1] + Math.sin(beamA) * beamD} stroke={K.flow} strokeWidth={20} opacity={t > S(4) ? 0.15 : 0} />
          {SCAN.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={6} fill={K.flow} opacity={sweep >= p.deg ? 1 : 0.08} />)}
          <RobotTop cx={400} cy={760} r={110} t={t} />
          <rect x={385} y={642} width={30} height={14} rx={4} fill={K.cold} opacity={cam4} />
        </Svg>
        <Label x={400} y={930} text="LÁSER QUE GIRA" color={K.flow} box o={span(t, Wd(4, "láser"), E(4))} />
        <Label x={720} y={560} text="O UNA CÁMARA" color={K.cold} box o={span(t, Wd(4, "cámara"), E(4))} />
        <Label x={540} y={1125} text="MIDE DISTANCIAS" o={span(t, Wd(4, "distancia"), E(4))} />
      </Scene>

      {/* 5 · segundo: las ruedas cuentan vueltas (odometría) */}
      <Scene {...sc(5)}>
        {chip(5, "2 · Ruedas que cuentan")}
        <Svg>
          <WheelEncoder cx={380} cy={770} ang={ang5} t={t} />
          <g opacity={0.3 + 0.7 * adv5}>
            <path d={`M 800,1000 L 800,${1000 - 120 * adv5} Q 800,${900 - 120 * adv5} ${800 + 60 * turn5},${860 - 120 * adv5}`} fill="none" stroke={K.cold} strokeWidth={6} strokeDasharray="12 10" />
            <RobotTop cx={800 + 50 * turn5} cy={1000 - 120 * adv5 - 110 * turn5} r={58} t={t} heading={45 * turn5} brush={false} />
          </g>
        </Svg>
        <Label x={540} y={440} text="CUENTA CADA VUELTA" color={K.flow} o={span(t, Wd(5, "cuentan"), E(5))} />
        <Label x={800} y={640} text={`${encoderPulses(ang5)}`} size={110} color={K.flow} o={0.35 + 0.65 * ramp(t, Wd(5, "cuentan"), Wd(5, "cuentan") + 0.3)} />
        <Label x={540} y={1120} text="CUÁNTO AVANZA Y CÓMO GIRA" size={38} o={span(t, Wd(5, "avanzado"), E(5))} />
      </Scene>

      {/* 6 · tercero: ojos infrarrojos al suelo (sensores de caída) */}
      <Scene {...sc(6)}>
        {chip(6, "3 · Ojos al suelo")}
        <Svg>
          <g transform="translate(0,-60)">
          <rect x={60} y={900} width={640} height={310} fill={C.dark} />
          <line x1={60} y1={900} x2={700} y2={900} stroke={C.light} strokeWidth={6} />
          <rect x={700} y={1040} width={140} height={170} fill={C.dark} />
          <line x1={700} y1={900} x2={700} y2={1040} stroke={C.light} strokeWidth={6} />
          <line x1={700} y1={1040} x2={840} y2={1040} stroke={C.light} strokeWidth={6} />
          <line x1={840} y1={1040} x2={840} y2={1210} stroke={C.light} strokeWidth={6} />
          <IRBeam ex={em6.ex} ey={em6.ey} floorY={over6 ? 1040 : 900} t={t} mode={over6 ? "cliff" : "ok"} />
          <RobotSide x={fx6} y={900} t={t} w={500} moving={moving6} />
          </g>
        </Svg>
        <Label x={330} y={960} text="OJOS INFRARROJOS" color={K.flow} o={span(t, Wd(6, "infrarrojos"), E(6))} />
        <Label x={540} y={520} text="LA LUZ NO VUELVE" color={K.warn} box o={span(t, wReb + 0.1, E(6))} />
        <Stamp x={560} y={650} text="¡FRENA!" p={ramp(t, wFrena, wFrena + 0.3)} />
      </Scene>

      {/* 7 · parachoques */}
      <Scene {...sc(7)}>
        {chip(7, "3 · Parachoques")}
        <Svg>
          <rect x={160} y={520} width={760} height={30} rx={6} fill={C.light} />
          {Array.from({ length: 19 }, (_, k) => <line key={k} x1={170 + k * 40} y1={520} x2={190 + k * 40} y2={550} stroke={C.dark} strokeWidth={4} />)}
          <g opacity={hit7}>
            {[-60, -30, 0, 30, 60].map((a) => <line key={a} x1={540 + Math.sin(a * Math.PI / 180) * 30} y1={560 + Math.cos(a * Math.PI / 180) * 10} x2={540 + Math.sin(a * Math.PI / 180) * 90} y2={575 + Math.cos(a * Math.PI / 180) * 30} stroke={K.flow} strokeWidth={8} strokeLinecap="round" />)}
          </g>
          <RobotTop cx={cx7} cy={cy7} r={170} t={t} bump={hit7} heading={head7} />
        </Svg>
        <Label x={540} y={440} text="PARACHOQUES" color={K.flow} o={span(t, Wd(7, "parachoques"), E(7))} />
        <Stamp x={800} y={650} text="¡PUM!" color={K.flow} size={48} p={ramp(t, wChoca, wChoca + 0.3)} />
        <Label x={540} y={1120} text="CAMBIA DE RUMBO" o={span(t, wRumbo, E(7))} />
      </Scene>

      {/* 8 · cuarto: filas como un cortacésped */}
      <Scene {...sc(8)}>
        {chip(8, "4 · En filas")}
        <Svg>
          <rect x={130} y={470} width={820} height={610} rx={10} fill="none" stroke={C.light} strokeWidth={6} opacity={0.6} />
          {mow.pts.slice(1).map((p, i) => {
            const q = mow.pts[i];
            const horiz = Math.abs(p[1] - q[1]) < 1;
            return <line key={i} x1={q[0]} y1={q[1]} x2={p[0]} y2={p[1]} stroke={K.cold} strokeWidth={76} strokeLinecap={horiz ? "butt" : "round"} opacity={0.22 + 0.1 * lap8} />;
          })}
          <path d={toD(mow.pts)} fill="none" stroke={K.flow} strokeWidth={4} strokeDasharray="10 10" />
          {lap8 > 0 && MOW.filter((_, k) => k % 2 === 0).slice(0, 8).map((p, k) => {
            const yy = p[1] + 31; const shown = mow.pts.length > 2 * k + 3;
            return shown && <line key={k} x1={190} y1={yy} x2={890} y2={yy} stroke={K.flow} strokeWidth={12} opacity={0.55 * lap8} />;
          })}
          <RobotTop cx={mow.head[0]} cy={mow.head[1]} r={56} t={t} heading={mow.ang * 180 / Math.PI + 90} />
        </Svg>
        <Label x={540} y={425} text="FILAS PARALELAS" color={K.flow} o={span(t, Wd(8, "filas"), wSol - 0.05)} />
        <Label x={540} y={425} text="NI UN TROZO SIN PASAR" size={40} color={K.flow} o={span(t, wSol + 0.3, E(8))} />
        <Label x={540} y={1125} text="COMO UN CORTACÉSPED" o={span(t, Wd(8, "cortacésped"), E(8))} />
      </Scene>

      {/* 9 · cepillos y aspiración (vista desde abajo) */}
      <Scene {...sc(9)}>
        {chip(9, "Cepillos y aspiración")}
        <Svg><BottomView cx={540} cy={760} t={t} air={air9} dust={dust9} /></Svg>
        <Label x={330} y={430} text="CEPILLO LATERAL" color={K.white} o={span(t, Wd(9, "cepillo"), E(9))} />
        <Label x={540} y={700} text="RODILLO" color={K.hot} box o={span(t, Wd(9, "rodillo"), E(9))} />
        <Label x={540} y={1120} text="VENTILADOR Y DEPÓSITO" color={K.cold} o={span(t, Wd(9, "ventilador"), E(9))} />
      </Scene>

      {/* 10 · vuelta a la base */}
      <Scene {...sc(10)}>
        {chip(10, "Vuelta a la base")}
        <Svg>
          <rect x={130} y={470} width={820} height={610} rx={10} fill="none" stroke={C.light} strokeWidth={6} opacity={0.6} />
          <Dock x={540} y={1070} t={t} beam={beam10} />
          <path d={toD(path10.slice(0, 3))} fill="none" stroke={K.cold} strokeWidth={6} strokeDasharray="14 12" opacity={0.7} />
          <RobotTop cx={rob10.head[0]} cy={rob10.head[1]} r={62} t={t} heading={rob10.ang * 180 / Math.PI + 90} />
          <Battery x={800} y={560} level={0.2 + 0.8 * lin(t, E(10) - 0.5, E(10) + 0.3)} o={0.4 + 0.6 * docked} />
        </Svg>
        <Label x={300} y={440} text="POR EL MAPA" color={K.cold} o={span(t, Wd(10, "mapa"), E(10))} />
        <Label x={540} y={660} text="SEÑAL INFRARROJA" color={K.flow} box o={span(t, Wd(10, "señal"), E(10))} />
      </Scene>

      {/* 11 · curiosidad: la alfombra oscura parece un precipicio */}
      <Scene {...sc(11)}>
        {chip(11, "Curiosidad", K.cold)}
        <Svg>
          <g transform="translate(0,-60)">
          <rect x={60} y={930} width={960} height={280} fill={C.dark} />
          <line x1={60} y1={930} x2={1020} y2={930} stroke={C.light} strokeWidth={6} />
          <rect x={560} y={898} width={400} height={32} rx={6} fill="#03060C" stroke="#6B7C99" strokeWidth={4} />
          {Array.from({ length: 6 }, (_, k) => <line key={k} x1={566 + k * 6} y1={906} x2={548 - k * 2} y2={924} stroke="#1A2335" strokeWidth={3} />)}
          <rect x={565} y={940} width={390} height={200} fill="none" stroke={K.warn} strokeWidth={5} strokeDasharray="16 12" opacity={ramp(t, wPre, wPre + 0.4)} />
          <IRBeam ex={em11.ex} ey={em11.ey} floorY={onRug ? 898 : 930} t={t} mode={onRug ? "absorb" : "ok"} />
          <RobotSide x={fx11} y={930} t={t} w={500} moving={t < wAbs ? 1 : 0} />
          </g>
        </Svg>
        <Label x={700} y={975} text="ALFOMBRA MUY OSCURA" size={34} o={span(t, Wd(11, "alfombra"), E(11))} />
        <Label x={540} y={490} text="ABSORBE LA LUZ" color={K.flow} box o={span(t, wAbs, E(11))} />
        <Stamp x={540} y={630} text="¿PRECIPICIO?" p={ramp(t, wPre, wPre + 0.3)} />
      </Scene>

      {/* 12 · truco: recoge cables y calcetines */}
      <Scene {...sc(12)}>
        {chip(12, "Truco", K.cold)}
        <Svg>
          <path d={toD(cable)} fill="none" stroke={K.ink} strokeWidth={18} strokeLinecap="round" />
          <path d={toD(cable)} fill="none" stroke={C.light} strokeWidth={10} strokeLinecap="round" />
          <rect x={890} y={600} width={60} height={40} rx={6} fill={C.light} opacity={1 - pull} />
          <Sock x={250} y={900} rot={-20} />
          <RobotTop cx={540} cy={cy12} r={140} t={t} heading={5 * Math.sin(t * 45) * stuck} />
        </Svg>
        <Label x={790} y={540} text="CABLES" color={K.flow} o={span(t, Wd(12, "cables"), E(12))} />
        <Label x={280} y={1110} text="CALCETINES" color={K.flow} o={span(t, Wd(12, "calcetines"), E(12))} />
        <Stamp x={540} y={450} text="¡ATASCADO!" p={ramp(t, wAta, wAta + 0.3)} />
      </Scene>

      {/* 13 · cierre */}
      <Scene {...sc(13)}>
        {chip(13, "En resumen")}
        <Svg>
          <RobotTop cx={540} cy={720} r={190} t={t} laser={1} laserLen={300} />
          <Icon kind="mide" x={200} y={1010} t={t} on={ramp(t, Wd(13, "mide"), Wd(13, "mide") + 0.3)} />
          <Icon kind="ubica" x={413} y={1010} t={t} on={ramp(t, Wd(13, "ubica"), Wd(13, "ubica") + 0.3)} />
          <Icon kind="planifica" x={627} y={1010} t={t} on={ramp(t, Wd(13, "planifica"), Wd(13, "planifica") + 0.3)} />
          <Icon kind="casa" x={840} y={1010} t={t} on={ramp(t, Wd(13, "vuelve"), Wd(13, "vuelve") + 0.3)} />
        </Svg>
        <Label x={540} y={440} text="NO VA A CIEGAS" color={K.flow} box o={span(t, S(13), Infinity)} />
      </Scene>

      <Stamp x={540} y={560} text="¡FALSO!" p={ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.3) * (t < scene(1)[1] ? 1 : 0)} />
      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
