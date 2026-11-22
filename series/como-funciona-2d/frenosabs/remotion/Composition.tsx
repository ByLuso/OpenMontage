// Episodio 159 · Cómo funcionan los frenos ABS del coche: no están para frenar en menos metros, sino para que puedas girar.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming, FONT } from "./kit2d/Kit";
import { Wheel, TopCar, Cone, ECU, Pipe, Signal, Valve, Pedal, Plane, SideCar, Star, ArcArrow, C } from "./Frenos";

export const COMP_ID = "FrenosABS";
export const HOOK = "El ABS te deja girar"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

/** Atenuado al principio (0,3) y pleno desde w. */
const dim = (t: number, w: number) => 0.3 + 0.7 * ramp(t, w, w + 0.3);
const fin = (t: number, w: number, d = 0.3) => ramp(t, w, w + d);
const lin = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / Math.max(0.001, b - a)));

/** Recorrido del coche que esquiva el cono (beat 2): q 0→1. */
const dodge = (q: number) => {
  const y = 1080 - 680 * q;
  const x = 540 - 210 * Math.exp(-(((y - 640) / 150) ** 2));
  return { x, y };
};
const dodgePose = (q: number) => {
  const p0 = dodge(Math.max(0, q - 0.01)), p1 = dodge(Math.min(1, q + 0.01));
  const ang = (Math.atan2(p1.x - p0.x, -(p1.y - p0.y)) * 180) / Math.PI;
  const p2 = dodge(Math.min(1, q + 0.05)), p3 = dodge(Math.min(1, q + 0.07));
  const ang2 = (Math.atan2(p3.x - p2.x, -(p3.y - p2.y)) * 180) / Math.PI;
  return { ...dodge(q), ang, steer: Math.max(-30, Math.min(30, (ang2 - ang) * 1.6)) };
};

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const chip = (i: number, text: string, color?: string) => <Chip text={text} color={color} o={span(t, Math.max(scene(i)[0], i === 1 ? 1.8 : 0), scene(i)[1])} />;
  const A = (i: number) => scene(i)[0];
  const Z = (i: number) => scene(i)[1];
  const spin = t * 120; // giro de las ruedas (grados)

  // ---------- beat 1 ----------
  const b1eq = Wd(1, "equivocan"), b1gir = Wd(1, "girar");
  const b1open = ramp(t, b1eq - 0.1, b1eq + 0.6);
  // ---------- beat 2 ----------
  const b2blo = Wd(2, "bloqueada"), b2vol = Wd(2, "volante"), b2abs = Wd(2, "abs"), b2esq = Wd(2, "esquivar");
  const qA = Math.sin((Math.PI / 2) * lin(t, A(2) + 0.25, b2abs - 0.4)); // frena recto y se para
  const yA = 1080 - 310 * qA;
  const carA = t < b2abs - 0.1;
  const qB = lin(t, b2abs, b2esq + 1.0);
  const pB = dodgePose(qB);
  // ---------- beat 3 ----------
  const b3blo = Wd(3, "bloqueo"), b3sol = Wd(3, "soltando"), b3par = Wd(3, "pare");
  const prog3 = lin(t, A(3) + 0.3, b3par + 0.3);
  // ---------- beat 4 ----------
  const b4cor = Wd(4, "corona"), b4sen = Wd(4, "sensor"), b4cue = Wd(4, "cuenta");
  // ---------- beat 5 ----------
  const b5cen = Wd(5, "centralita"), b5vig = Wd(5, "vigila"), b5gol = Wd(5, "golpe"), b5blo = Wd(5, "bloquearse");
  const lockRot = Math.min(t, b5gol) * 200;
  // ---------- beat 6 ----------
  const b6val = Wd(6, "valvulas"), b6baj = Wd(6, "baja"), b6sol = Wd(6, "solo"), b6gir = Wd(6, "girar");
  const pres6 = 1 - 0.7 * ramp(t, b6baj, b6baj + 0.6);
  const rot6 = t < b6baj + 0.3 ? 0 : (t - b6baj - 0.3) * 160;
  // ---------- beat 7 ----------
  const b7sub = Wd(7, "subirla"), b7quin = Wd(7, "quince"), b7seg = Wd(7, "segundo"), b7pie = Wd(7, "pie");
  const prog7 = lin(t, A(7) + 0.3, b7quin);
  // ---------- beat 8 ----------
  const b8vib = Wd(8, "vibra"), b8tra = Wd(8, "traquetea"), b8nor = Wd(8, "normal"), b8dgt = Wd(8, "dgt"), b8pis = Wd(8, "pisando");
  const jit8 = t > b8vib ? 7 * Math.sin(t * 71) * Math.cos(t * 23) : 0;
  // ---------- beat 9 ----------
  const b9aco = Wd(9, "acorta"), b9moj = Wd(9, "mojado"), b9gra = Wd(9, "grava"), b9ala = Wd(9, "alargarla");
  // ---------- beat 10 ----------
  const b10coc = Wd(10, "coches"), b10avi = Wd(10, "aviones"), b10cin = Wd(10, "cincuenta"), b10uni = Wd(10, "universal");
  // ---------- beat 11 ----------
  const b11a = Wd(11, "2004"), b11coc = Wd(11, "coches"), b11eur = Wd(11, "europa"), b11ser = Wd(11, "serie");
  // ---------- beat 12 ----------
  const b12sen = Wd(12, "sensores"), b12cen = Wd(12, "centralita"), b12val = Wd(12, "valvulas"), b12gir = Wd(12, "girar");

  // curvas del beat 3 (velocidad frente a tiempo)
  const gx = (u: number) => 150 + 780 * u, gy = (v: number) => 1000 - 470 * v;
  const vCar = (u: number) => 1 - 0.85 * u;
  const vAbs = (u: number) => { const f = (u * 7) % 1; return vCar(u) - (0.04 + 0.2 * (f < 0.8 ? f / 0.8 : (1 - f) / 0.2)); };
  const vLock = (u: number) => Math.max(0, 1 - 7 * u);
  const curve = (fn: (u: number) => number, upto: number) =>
    Array.from({ length: 160 }).map((_, i) => { const u = (i / 159) * upto; return `${i ? "L" : "M"} ${gx(u).toFixed(1)} ${gy(fn(u)).toFixed(1)}`; }).join(" ");

  // onda de presión del beat 7 (15 ciclos en «1 segundo» = x 150-930)
  const wave7 = (upto: number) => {
    const n = 15, per = 780 / n, pts: string[] = [];
    for (let k = 0; k < n; k++) {
      const x0 = 150 + k * per;
      pts.push(`${k ? "L" : "M"} ${x0} 900`, `L ${x0 + per * 0.75} 660`, `L ${x0 + per * 0.85} 900`);
    }
    return { d: pts.join(" "), clip: 150 + 780 * upto };
  };
  const w7 = wave7(prog7);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: la rueda grande; al decir «equivocan» la llanta se parte y enseña el freno; al decir «girar», flecha de giro */}
      <Scene {...sc(1)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Wheel id="w1" cx={540} cy={820} R={330} rot={spin * 0.6} open={b1open} sensorHi={fin(t, b1eq + 0.4)} ringHi={fin(t, b1eq + 0.4) * 0.6} press={0.5 * fin(t, b1eq + 0.4)} />
          <ArcArrow x={540} y={820} r={370} a0={150} a1={210} o={fin(t, b1gir)} />
          <ArcArrow x={540} y={820} r={370} a0={30} a1={-30} o={fin(t, b1gir)} />
        </svg>
        {chip(1, "POR DENTRO")}
        <Label x={540} y={1110} text="¡sirve para girar!" size={48} color={K.cold} box o={fin(t, b1gir)} />
      </Scene>

      {/* 2 · rueda bloqueada = el volante no manda; con ABS esquivas el obstáculo */}
      <Scene {...sc(2)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={290} y={380} width={500} height={780} rx={20} fill={C.road} />
          {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={536} y={400 + i * 100} width={8} height={50} fill="#ffffff" opacity={0.15} />)}
          <Cone x={540} y={640} />
          {carA && (
            <g>
              {qA > 0.02 && [-46, 46].map((dx, i) => (
                <path key={i} d={`M ${540 + dx} 1130 V ${yA + 50}`} stroke="#000" strokeWidth={18} opacity={0.55} />
              ))}
              <TopCar x={540} y={yA} s={0.75} steer={-26 * fin(t, b2vol)} wheelCol={t > b2blo ? K.warn : C.tyre} brake={1} o={1 - ramp(t, b2abs - 0.4, b2abs - 0.1)} />
            </g>
          )}
          {!carA && <TopCar x={pB.x} y={pB.y} ang={pB.ang} s={0.75} steer={pB.steer} body={C.case2} wheelCol={K.cold} brake={1} o={ramp(t, b2abs - 0.1, b2abs + 0.2)} />}
        </svg>
        {chip(2, "SIN ABS / CON ABS")}
        <Label x={540} y={1110} text="bloqueada: no obedece al volante" size={38} color={K.warn} box o={span(t, Math.max(A(2), b2blo - 0.2), b2abs - 0.1)} />
        <Label x={540} y={1110} text="con ABS: ¡esquivas!" size={46} color={K.cold} box o={fin(t, b2esq)} />
      </Scene>

      {/* 3 · idea clave: frenar al límite del bloqueo (gráfica velocidad del coche / de la rueda) */}
      <Scene {...sc(3)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={130} y={500} width={820} height={520} rx={18} fill="rgba(6,16,31,0.6)" />
          <rect x={150} y={972} width={780} height={42} fill={K.warn} opacity={0.25} />
          <path d="M 150 520 V 1000 H 930" stroke={C.case3} strokeWidth={5} fill="none" />
          <text x={540} y={1004} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={K.warn} opacity={0.9}>RUEDA PARADA</text>
          <path d={curve(vCar, 1)} stroke={K.white} strokeWidth={5} fill="none" opacity={0.15} />
          <path d={curve(vAbs, 1)} stroke={K.flow} strokeWidth={5} fill="none" opacity={0.15} />
          <path d={curve(vCar, Math.max(0.02, prog3))} stroke={K.white} strokeWidth={8} fill="none" opacity={0.85} />
          <path d={curve(vLock, Math.max(0.02, prog3))} stroke={K.warn} strokeWidth={7} fill="none" strokeDasharray="16 12" opacity={dim(t, b3blo)} />
          <path d={curve(vAbs, Math.max(0.02, prog3))} stroke={K.flow} strokeWidth={8} fill="none" opacity={dim(t, b3sol)} style={{ filter: `drop-shadow(0 0 8px ${K.flow})` }} />
        </svg>
        {chip(3, "LA IDEA CLAVE")}
        <Label x={260} y={455} text="coche" size={38} color={K.white} o={dim(t, A(3) + 0.3)} />
        <Label x={690} y={455} text="rueda con ABS" size={40} color={K.flow} box o={fin(t, b3sol)} />
        <Label x={540} y={1090} text="sin ABS: se bloquea" size={40} color={K.warn} box o={fin(t, b3blo)} />
      </Scene>

      {/* 4 · primero: corona dentada + sensor magnético que cuenta dientes (pulsos) */}
      <Scene {...sc(4)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <g transform={`translate(470 740) rotate(${t * 40})`} opacity={dim(t, b4cor)}>
            <circle r={200} fill={C.iron} stroke={fin(t, b4cor) > 0.5 ? K.flow : C.case3} strokeWidth={6} />
            {Array.from({ length: 24 }).map((_, i) => <rect key={i} x={-13} y={-232} width={26} height={36} fill={C.metal} transform={`rotate(${i * 15})`} />)}
            <circle r={110} fill={C.case1} />
            <circle r={60} fill={C.case2} stroke={C.case3} strokeWidth={4} />
            <circle r={18} fill={C.dark} />
          </g>
          {/* sensor a la derecha, frente a los dientes */}
          <g opacity={dim(t, b4sen)} style={fin(t, b4sen) > 0.05 ? { filter: `drop-shadow(0 0 12px ${K.flow})` } : {}}>
            <rect x={712} y={700} width={110} height={80} rx={14} fill={fin(t, b4sen) > 0.5 ? K.flow : C.case3} />
            <path d="M 822 740 H 900 V 1000" stroke={C.dark} strokeWidth={14} fill="none" />
            {[0, 1, 2].map((k) => <path key={k} d={`M ${700 - k * 14} ${712 - k * 10} Q ${688 - k * 14} 740 ${700 - k * 14} ${768 + k * 10}`} stroke={K.flow} strokeWidth={5} fill="none" opacity={fin(t, b4sen) * (0.9 - 0.25 * k) * (0.6 + 0.4 * Math.sin(t * 8 - k))} />)}
          </g>
          {/* señal: un pulso por diente */}
          <g opacity={dim(t, b4cue)}>
            <clipPath id="sig4"><rect x={150} y={980} width={750} height={90} /></clipPath>
            <g clipPath="url(#sig4)">
              <path d={Array.from({ length: 16 }).map((_, k) => { const x = 900 - k * 60 + ((t * 160) % 60); return `M ${x} 1050 V 1000 H ${x - 30} V 1050 H ${x - 60}`; }).join(" ")}
                stroke={K.flow} strokeWidth={6} fill="none" style={{ filter: `drop-shadow(0 0 6px ${K.flow})` }} />
            </g>
          </g>
        </svg>
        {chip(4, "PRIMERO · LOS SENSORES")}
        <Label x={470} y={455} text="corona dentada" size={42} color={K.white} box o={dim(t, b4cor)} />
        <Label x={760} y={620} text="sensor magnético" size={38} color={K.flow} box o={fin(t, b4sen)} />
        <Label x={540} y={1115} text="cada diente, un pulso" size={38} color={K.flow} o={fin(t, b4cue)} />
      </Scene>

      {/* 5 · segundo: la centralita vigila las cuatro ruedas; una frena de golpe → va a bloquearse */}
      <Scene {...sc(5)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {[[230, 520], [850, 520], [230, 1000], [850, 1000]].map(([wx, wy], i) => {
            const bad = i === 0 && t > b5gol;
            return (
              <g key={i}>
                <Signal d={`M ${wx < 540 ? 400 : 680} ${wy < 760 ? 700 : 820} L ${wx < 540 ? wx + 80 : wx - 80} ${wy}`} t={t} on={fin(t, b5vig)} color={bad ? K.warn : K.flow} />
                <g transform={`translate(${wx} ${wy}) rotate(${i === 0 ? lockRot : spin * 1.6})`}>
                  <circle r={78} fill={C.tyre} stroke={bad ? K.warn : "#2c3a52"} strokeWidth={8} style={bad ? { filter: `drop-shadow(0 0 14px ${K.warn})` } : {}} />
                  <circle r={50} fill={C.case3} />
                  {Array.from({ length: 5 }).map((_, k) => <rect key={k} x={-6} y={-48} width={12} height={34} fill={C.case1} transform={`rotate(${k * 72})`} />)}
                  <circle r={12} fill={C.dark} />
                </g>
              </g>
            );
          })}
          <ECU x={540} y={760} w={280} h={170} t={t} hi={fin(t, b5cen)} />
        </svg>
        {chip(5, "SEGUNDO · LA CENTRALITA")}
        <Label x={540} y={610} text="centralita" size={42} color={K.flow} box o={dim(t, b5cen)} />
        <Label x={540} y={1110} text="¡va a bloquearse!" size={44} color={K.warn} box o={fin(t, b5blo)} />
      </Scene>

      {/* 6 · tercero: abre válvulas, baja la presión de esa rueda y vuelve a girar */}
      <Scene {...sc(6)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={110} y={480} width={180} height={90} rx={14} fill={C.case2} stroke={C.case3} strokeWidth={4} />
          <rect x={125} y={495} width={150} height={60} rx={8} fill={K.hot} opacity={0.75} />
          <Pipe d="M 290 525 H 380 V 640 H 420" t={t} level={1} />
          <Pipe d="M 560 725 V 770 H 463 V 815" t={t} level={pres6} />
          <g>
            <rect x={420} y={555} width={280} height={170} rx={18} fill={C.case1} stroke={fin(t, b6val) > 0.5 ? K.flow : C.case3} strokeWidth={5} />
            <Valve x={500} y={640} open={0} col={K.hot} />
            <Valve x={620} y={640} open={fin(t, b6val, 0.4)} />
          </g>
          <Wheel id="w6" cx={400} cy={900} R={160} rot={rot6} open={1} press={pres6} locked={1 - ramp(t, b6baj + 0.2, b6baj + 0.6)} />
          {/* medidor de presión */}
          <rect x={790} y={560} width={80} height={440} rx={16} fill={C.dark} stroke={C.case3} strokeWidth={4} />
          <rect x={800} y={570 + 420 * (1 - pres6)} width={60} height={420 * pres6} rx={10} fill={K.hot} style={{ filter: `drop-shadow(0 0 10px ${K.hot})` }} />
        </svg>
        {chip(6, "TERCERO · LAS VÁLVULAS")}
        <Label x={560} y={500} text="válvulas" size={42} color={K.flow} box o={dim(t, b6val)} />
        <Label x={830} y={1045} text="presión" size={38} color={K.hot} o={dim(t, b6baj)} />
        <Label x={400} y={1110} text="vuelve a girar" size={40} color={K.cold} box o={fin(t, b6gir)} />
      </Scene>

      {/* 7 · cuarto: vuelve a subirla y repite ~15 veces por segundo */}
      <Scene {...sc(7)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={130} y={620} width={820} height={300} rx={18} fill="rgba(6,16,31,0.6)" />
          <clipPath id="w7"><rect x={140} y={600} width={w7.clip - 140 + 4} height={340} /></clipPath>
          <path d={w7.d} stroke={K.hot} strokeWidth={5} fill="none" opacity={0.18} strokeLinejoin="round" />
          <path d={w7.d} stroke={K.hot} strokeWidth={7} fill="none" clipPath="url(#w7)" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${K.hot})` }} />
          {prog7 < 1 && <circle cx={w7.clip} cy={780} r={12} fill={K.white} />}
          <g opacity={fin(t, b7seg)}>
            <path d="M 150 960 V 990 H 930 V 960" stroke={K.flow} strokeWidth={6} fill="none" />
            <text x={540} y={1035} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={K.flow}>1 segundo</text>
          </g>
        </svg>
        {chip(7, "CUARTO · SUBE Y BAJA")}
        <Label x={300} y={575} text="presión" size={38} color={K.hot} o={dim(t, b7sub)} />
        <Label x={540} y={470} text="más rápido que tu pie" size={40} color={K.white} box o={fin(t, b7pie)} />
        <Label x={540} y={1100} text="≈ 15 veces por segundo" size={44} color={K.flow} box o={fin(t, b7quin)} />
      </Scene>

      {/* 8 · el pedal vibra: es normal; la DGT dice que sigas pisando */}
      <Scene {...sc(8)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Pedal x={620} y={830} press={0.8} jit={jit8} />
          {t > b8vib && [0, 1, 2].map((k) => (
            <path key={k} d={`M ${720 + k * 30} ${780 + k * 40} l 16 -14 l 16 14 l 16 -14 l 16 14`} stroke={K.flow} strokeWidth={6} fill="none"
              opacity={(0.5 + 0.5 * Math.sin(t * 20 + k * 2)) * fin(t, b8tra)} />
          ))}
        </svg>
        {chip(8, "POR ESO VIBRA")}
        <Label x={820} y={680} text="traqueteo" size={42} color={K.flow} o={dim(t, b8tra)} />
        <Label x={540} y={455} text="DGT: sigue pisando fuerte" size={40} color={K.white} box o={fin(t, b8dgt)} />
        <Stamp x={540} y={1085} text="ES NORMAL" color={K.cold} size={56} p={fin(t, b8nor)} rot={-4} />
      </Scene>

      {/* 9 · curiosidad: en mojado suele acortar; en grava o nieve suelta puede alargar */}
      <Scene {...sc(9)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {[[320, 0.82, 0.64, b9moj, 0], [760, 0.6, 0.86, b9gra, 1]].map(([cx, hs, hc, w, k], i) => {
            const g = ramp(t, w as number, (w as number) + 0.7);
            const o = dim(t, w as number);
            return (
              <g key={i} opacity={o}>
                <rect x={(cx as number) - 200} y={990} width={400} height={50} rx={10} fill={k ? "#3b3a36" : "#1b2433"} />
                {k ? Array.from({ length: 22 }).map((_, j) => <circle key={j} cx={(cx as number) - 185 + j * 17.5} cy={1005 + ((j * 7) % 3) * 10} r={j % 3 === 0 ? 7 : 5} fill={j % 4 === 0 ? K.white : "#8a8274"} />)
                  : Array.from({ length: 8 }).map((_, j) => <ellipse key={j} cx={(cx as number) - 170 + j * 48} cy={1012 + (j % 2) * 10} rx={16} ry={5} fill={K.cold} opacity={0.7} />)}
                <rect x={(cx as number) - 120} y={980 - 440 * (hs as number) * (0.3 + 0.7 * g)} width={90} height={440 * (hs as number) * (0.3 + 0.7 * g)} rx={10} fill={C.case3} />
                <rect x={(cx as number) + 30} y={980 - 440 * (hc as number) * (0.3 + 0.7 * g)} width={90} height={440 * (hc as number) * (0.3 + 0.7 * g)} rx={10} fill={K.flow} style={{ filter: `drop-shadow(0 0 8px ${K.flow})` }} />
                <text x={(cx as number) - 75} y={975 - 440 * (hs as number) * (0.3 + 0.7 * g) - 12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.case3}>sin ABS</text>
                <text x={(cx as number) + 75} y={975 - 440 * (hc as number) * (0.3 + 0.7 * g) - 12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={K.flow}>con ABS</text>
              </g>
            );
          })}
          <text x={540} y={1090} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={K.white} opacity={0.75}>metros hasta parar</text>
        </svg>
        {chip(9, "CURIOSIDAD · EL SUELO", K.cold)}
        <Label x={320} y={470} text={t > b9moj + 0.8 ? "mojado: más corta" : "en mojado"} size={36} color={K.cold} box o={dim(t, b9aco)} />
        <Label x={760} y={470} text={t > b9ala ? "grava: más larga" : "grava o nieve"} size={36} color={K.white} box o={dim(t, b9gra)} />
      </Scene>

      {/* 10 · otra: el ABS triunfó antes en los aviones (años cincuenta) */}
      <Scene {...sc(10)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect x={60} y={898} width={960} height={70} fill={C.road} />
          <rect x={60} y={898} width={960} height={10} fill={K.cold} opacity={0.5} />
          {Array.from({ length: 7 }).map((_, i) => <rect key={i} x={((i * 160 - t * 300) % 1120 + 1120) % 1120 - 40} y={928} width={80} height={10} fill={K.white} opacity={0.35} />)}
          <Plane x={540} y={770 + 4 * Math.sin(t * 3)} s={1} t={t} gearHi={fin(t, b10avi)} o={dim(t, b10coc)} />
        </svg>
        {chip(10, "OTRA · LOS AVIONES")}
        <Label x={540} y={460} text={t > b10uni ? "muy extendido en aviones" : "antes, en los aviones"} size={42} color={K.white} box o={fin(t, b10avi)} />
        <Stamp x={540} y={1075} text="AÑOS 50" color={K.flow} size={52} p={fin(t, b10cin)} rot={-4} />
      </Scene>

      {/* 11 · otra: desde 2004, de serie en todos los coches nuevos en Europa */}
      <Scene {...sc(11)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2 + t * 0.15;
            return <Star key={i} x={540 + 290 * Math.cos(a)} y={790 + 290 * Math.sin(a)} r={22} o={0.25 + 0.55 * fin(t, b11eur)} />;
          })}
          <SideCar x={540} y={800} s={1.05} rot={spin} badge={fin(t, b11coc)} />
        </svg>
        {chip(11, "OTRA · DE SERIE")}
        <Label x={540} y={455} text="desde 2004" size={52} color={K.flow} box o={dim(t, b11a)} />
        <Stamp x={540} y={1085} text="DE SERIE" color={K.cold} size={56} p={fin(t, b11ser)} rot={-4} />
      </Scene>

      {/* 12 · resumen */}
      <Scene {...sc(12)}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Wheel id="w12" cx={540} cy={710} R={250} rot={spin} open={1} sensorHi={fin(t, b12sen)} ringHi={fin(t, b12sen)} press={0.7 * fin(t, b12val)} />
          <Signal d="M 315 1020 H 745" t={t} on={fin(t, b12cen)} />
          <Pipe d="M 830 960 V 600 H 660" t={t} level={0.3 + 0.7 * fin(t, b12val)} w={12} />
          <ECU x={230} y={1020} w={170} h={100} t={t} hi={fin(t, b12cen)} o={dim(t, b12cen)} />
          <g opacity={dim(t, b12val)}>
            <rect x={745} y={970} width={170} height={100} rx={14} fill={C.case1} stroke={fin(t, b12val) > 0.5 ? K.flow : C.case3} strokeWidth={5} />
            <Valve x={795} y={1020} r={28} open={fin(t, b12val)} />
            <Valve x={865} y={1020} r={28} open={0} col={K.hot} />
          </g>
          <ArcArrow x={540} y={710} r={300} a0={150} a1={210} o={fin(t, b12gir)} />
          <ArcArrow x={540} y={710} r={300} a0={30} a1={-30} o={fin(t, b12gir)} />
        </svg>
        {chip(12, "RESUMEN")}
        <Label x={540} y={420} text="sensores" size={42} color={K.flow} box o={dim(t, b12sen)} />
        <Label x={230} y={1120} text="centralita" size={40} color={K.flow} box o={dim(t, b12cen)} />
        <Label x={820} y={1120} text="válvulas" size={40} color={K.flow} box o={dim(t, b12val)} />
      </Scene>

      <Stamp x={540} y={470} text="¡NO ES ESO!" p={ramp(t, b1eq, b1eq + 0.3) * (t < scene(1)[1] ? 1 : 0)} />
      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
