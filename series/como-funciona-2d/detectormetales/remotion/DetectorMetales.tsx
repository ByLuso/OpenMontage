// Dibujos SVG del episodio «cómo funciona el arco detector de metales». Todos son <g> para meter en un <svg 1080×1920>.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#06101F", go: "#2EE59D", body: "#5B7BA6", steel: "#C9D6E6", copper: "#8A6A3A" };

/** Arco visto de frente. top = borde superior del travesaño; h = alto total. open 0→1 separa las tapas de los laterales y deja ver las bobinas.
 *  coil 0→1 enciende las bobinas; zones = nº de zonas (LED en el borde interior); lit = zona encendida (0 = abajo, -1 = ninguna); alarm 0→1 luz roja. */
export const Arch: React.FC<{ cx: number; top: number; w: number; h: number; t: number; open?: number; coil?: number; zones?: number; lit?: number; alarm?: number; pw?: number }> =
  ({ cx, top, w, h, t, open = 0, coil = 0, zones = 0, lit = -1, alarm = 0, pw = 120 }) => {
    const xl = cx - w / 2, xr = cx + w / 2 - pw;
    const y0 = top + 70, y1 = top + h - 30;
    const pillars = [xl, xr];
    const zy = (k: number) => y1 - 30 - (k + 0.5) * ((y1 - y0 - 80) / Math.max(1, zones));
    return (
      <g>
        {/* pies */}
        {pillars.map((x, i) => <rect key={`f${i}`} x={x - 22} y={top + h - 34} width={pw + 44} height={34} rx={10} fill={C.case1} stroke={C.case3} strokeWidth={4} />)}
        {/* interior de los laterales con las bobinas */}
        {pillars.map((x, i) => (
          <g key={`p${i}`}>
            <rect x={x} y={y0} width={pw} height={y1 - y0} rx={18} fill={C.dark} stroke={C.case3} strokeWidth={5} />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={x + 18 + k * 13} y={y0 + 24 + k * 13} width={pw - 36 - k * 26} height={y1 - y0 - 48 - k * 26} rx={16} fill="none"
                stroke={coil > 0.01 ? K.flow : C.copper} strokeWidth={7} opacity={0.55 + 0.45 * coil}
                style={coil > 0.01 ? { filter: `drop-shadow(0 0 ${6 + 12 * coil}px ${K.flow})` } : {}} />
            ))}
          </g>
        ))}
        {/* tapas que se separan */}
        {pillars.map((x, i) => (
          <g key={`c${i}`} transform={`translate(${(i === 0 ? -1 : 1) * 64 * open} 0)`} opacity={1 - 0.8 * open}>
            <rect x={x} y={y0} width={pw} height={y1 - y0} rx={18} fill={C.case2} stroke={C.case3} strokeWidth={5} />
            <rect x={x + 20} y={y0 + 30} width={pw - 40} height={y1 - y0 - 60} rx={12} fill={C.case1} opacity={0.6} />
          </g>
        ))}
        {/* travesaño con la luz de alarma */}
        <rect x={xl - 10} y={top} width={w + 20} height={96} rx={24} fill={C.case1} stroke={C.case3} strokeWidth={6} />
        <rect x={cx - 120} y={top + 26} width={240} height={44} rx={22} fill={C.dark} />
        <circle cx={cx} cy={top + 48} r={18} fill={alarm > 0.01 ? K.warn : "#3a1c24"}
          style={alarm > 0.01 ? { filter: `drop-shadow(0 0 ${14 + 10 * Math.sin(t * 20)}px ${K.warn})` } : {}} />
        {/* LED de zonas en el borde interior de los dos laterales */}
        {zones > 0 && pillars.map((x, i) => Array.from({ length: zones }).map((_, k) => {
          const on = k === lit;
          const lx = i === 0 ? x + pw - 16 : x + 4;
          return <rect key={`z${i}${k}`} x={lx} y={zy(k) - 24} width={12} height={48} rx={5} fill={on ? K.warn : "#33435c"}
            style={on ? { filter: `drop-shadow(0 0 10px ${K.warn})` } : {}} />;
        }))}
      </g>
    );
  };
/** y (px) del centro de la zona k de un arco (para colocar el metal a esa altura). */
export const archZoneY = (top: number, h: number, zones: number, k: number) => {
  const y0 = top + 70, y1 = top + h - 30;
  return y1 - 30 - (k + 0.5) * ((y1 - y0 - 80) / Math.max(1, zones));
};

/** Pulsos de campo que salen del borde interior de un lateral hacia el centro (arcos cian). rate = pulsos/s visibles. */
export const FieldPulse: React.FC<{ x: number; y0: number; y1: number; dir: 1 | -1; t: number; o?: number; rate?: number; reach?: number; color?: string }> =
  ({ x, y0, y1, dir, t, o = 1, rate = 1.2, reach = 240, color = K.cold }) => {
    if (o <= 0.01) return null;
    const ym = (y0 + y1) / 2;
    return (
      <g>
        {[0, 1, 2].map((i) => {
          const p = (t * rate + i / 3) % 1;
          const k = 30 + p * reach;
          return <path key={i} d={`M ${x} ${y0} Q ${x + dir * k * 1.6} ${ym} ${x} ${y1}`} fill="none" stroke={color} strokeWidth={6}
            strokeDasharray="16 12" opacity={o * (1 - p) * 0.9} />;
        })}
      </g>
    );
  };

/** Anillos que salen de un punto (el «eco»). */
export const Rings: React.FC<{ x: number; y: number; t: number; o?: number; color?: string; rate?: number; r0?: number; r1?: number }> =
  ({ x, y, t, o = 1, color = K.hot, rate = 1.3, r0 = 30, r1 = 200 }) => {
    if (o <= 0.01) return null;
    return (
      <g>
        {[0, 1, 2].map((i) => {
          const p = (t * rate + i / 3) % 1;
          return <circle key={i} cx={x} cy={y} r={r0 + (r1 - r0) * p} fill="none" stroke={color} strokeWidth={6} opacity={o * (1 - p)} />;
        })}
      </g>
    );
  };

/** Silueta neutra de frente; base = pies. */
export const Person: React.FC<{ x: number; base: number; s?: number; o?: number; color?: string }> = ({ x, base, s = 1, o = 1, color = C.body }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={-470} r={48} fill={color} />
    <rect x={-72} y={-410} width={144} height={240} rx={44} fill={color} />
    <rect x={-108} y={-398} width={32} height={210} rx={16} fill={color} />
    <rect x={76} y={-398} width={32} height={210} rx={16} fill={color} />
    <rect x={-62} y={-200} width={54} height={200} rx={22} fill={color} />
    <rect x={8} y={-200} width={54} height={200} rx={22} fill={color} />
  </g>
);

/** Llave (el metal que llevas encima). */
export const KeyIcon: React.FC<{ x: number; y: number; s?: number; glow?: number; rot?: number }> = ({ x, y, s = 1, glow = 0, rot = -30 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} style={glow > 0.01 ? { filter: `drop-shadow(0 0 ${8 + 14 * glow}px ${K.flow})` } : {}}>
    <circle cx={-34} cy={0} r={26} fill="none" stroke={C.steel} strokeWidth={14} />
    <rect x={-10} y={-7} width={70} height={14} rx={4} fill={C.steel} />
    <rect x={36} y={4} width={10} height={18} fill={C.steel} /><rect x={52} y={4} width={8} height={14} fill={C.steel} />
  </g>
);

/** Bobina grande en primer plano (vueltas de cable). current 0→1: corriente (trazos blancos que corren). */
export const CoilBig: React.FC<{ cx: number; cy: number; w: number; h: number; t: number; glow?: number; current?: number; turns?: number }> =
  ({ cx, cy, w, h, t, glow = 0, current = 0, turns = 4 }) => (
    <g>
      <rect x={cx - w / 2 - 30} y={cy - h / 2 - 30} width={w + 60} height={h + 60} rx={30} fill={C.dark} stroke={C.case3} strokeWidth={5} />
      {Array.from({ length: turns }).map((_, k) => {
        const ww = w - k * 26, hh = h - k * 26;
        return (
          <g key={k}>
            <rect x={cx - ww / 2} y={cy - hh / 2} width={ww} height={hh} rx={26} fill="none" stroke={glow > 0.01 ? K.flow : C.copper} strokeWidth={9}
              opacity={0.6 + 0.4 * glow} style={glow > 0.01 ? { filter: `drop-shadow(0 0 ${6 + 12 * glow}px ${K.flow})` } : {}} />
            {current > 0.01 && <rect x={cx - ww / 2} y={cy - hh / 2} width={ww} height={hh} rx={26} fill="none" stroke={K.white} strokeWidth={9}
              strokeDasharray="20 60" strokeDashoffset={-t * 400} opacity={current} />}
          </g>
        );
      })}
      <path d={`M ${cx + w / 2} ${cy + h / 2 - 30} H ${cx + w / 2 + 70}`} stroke={glow > 0.01 ? K.flow : C.copper} strokeWidth={9} />
    </g>
  );

/** Pieza de metal (disco) en primer plano. */
export const MetalDisc: React.FC<{ cx: number; cy: number; r: number; glow?: number }> = ({ cx, cy, r, glow = 0 }) => (
  <g style={glow > 0.01 ? { filter: `drop-shadow(0 0 ${10 + 20 * glow}px ${K.hot})` } : {}}>
    <circle cx={cx} cy={cy} r={r} fill="#7F93AD" stroke={C.steel} strokeWidth={8} />
    <circle cx={cx - r * 0.3} cy={cy - r * 0.3} r={r * 0.25} fill="#fff" opacity={0.18} />
  </g>
);

/** Corrientes de Foucault: remolinos con flecha que giran. */
export const Eddy: React.FC<{ cx: number; cy: number; r: number; t: number; o?: number; color?: string }> = ({ cx, cy, r, t, o = 1, color = K.flow }) => {
  if (o <= 0.01) return null;
  return (
    <g opacity={o}>
      {[0.85, 0.6, 0.35].map((f, i) => {
        const rr = r * f;
        const a = (t * (150 + i * 40) + i * 70) % 360;
        const arc = (deg: number) => [cx + rr * Math.cos((deg * Math.PI) / 180), cy + rr * Math.sin((deg * Math.PI) / 180)];
        const [x0, y0] = arc(a), [x1, y1] = arc(a + 270);
        const [hx, hy] = arc(a + 290);
        return (
          <g key={i}>
            <path d={`M ${x0} ${y0} A ${rr} ${rr} 0 1 1 ${x1} ${y1}`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
            <circle cx={hx} cy={hy} r={11} fill={color} />
          </g>
        );
      })}
    </g>
  );
};

/** Osciloscopio. mode "pulses": tren de pulsos; mode "decay": un pulso y su apagado (metal 0→1 alarga la cola en naranja). */
export const Scope: React.FC<{ x: number; y: number; w: number; h: number; t: number; o?: number; mode?: "pulses" | "decay"; metal?: number; thr?: number }> =
  ({ x, y, w, h, t, o = 1, mode = "pulses", metal = 0, thr = 0 }) => {
    if (o <= 0.01) return null;
    const x0 = x - w / 2 + 20, x1 = x + w / 2 - 20, yb = y + h / 2 - 22, yt = y - h / 2 + 24;
    let d = "", d2 = "";
    if (mode === "pulses") {
      const per = (x1 - x0) / 4, off = (t * 90) % per;
      d = `M ${x0} ${yb}`;
      for (let k = -1; k < 5; k++) {
        const px = x0 + k * per + off;
        const a = Math.max(x0, Math.min(x1, px)), b = Math.max(x0, Math.min(x1, px + per * 0.18));
        if (b > a) d += ` L ${a} ${yb} L ${a} ${yt} L ${b} ${yt} L ${b} ${yb}`;
      }
      d += ` L ${x1} ${yb}`;
    } else {
      const xd = x0 + (x1 - x0) * 0.22;
      const curve = (tau: number) => {
        let s = `M ${x0} ${yb} L ${x0 + 14} ${yb} L ${x0 + 14} ${yt} L ${xd} ${yt}`;
        for (let i = 0; i <= 40; i++) { const u = i / 40; const px = xd + (x1 - xd) * u; s += ` L ${px} ${yb - (yb - yt) * Math.exp(-u / tau)}`; }
        return s;
      };
      d = curve(0.07);
      if (metal > 0.01) d2 = curve(0.07 + 0.2 * metal);
    }
    const ythr = yb - (yb - yt) * 0.12;
    const xthr = x0 + (x1 - x0) * 0.5;
    return (
      <g opacity={o}>
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={18} fill={C.dark} stroke={C.case2} strokeWidth={5} />
        {[1, 2, 3].map((k) => <line key={k} x1={x0} y1={yt + (yb - yt) * k / 4} x2={x1} y2={yt + (yb - yt) * k / 4} stroke="#1c2b44" strokeWidth={2} />)}
        {thr > 0.01 && <g opacity={thr}>
          <line x1={xthr} y1={yt - 6} x2={xthr} y2={yb + 6} stroke={K.white} strokeWidth={3} strokeDasharray="8 6" />
          <line x1={x0 + (x1 - x0) * 0.22} y1={ythr} x2={x1} y2={ythr} stroke={K.white} strokeWidth={2} strokeDasharray="4 6" opacity={0.6} />
        </g>}
        <path d={d} fill="none" stroke={mode === "pulses" ? K.flow : K.white} strokeWidth={5} strokeLinejoin="round" />
        {d2 && <path d={d2} fill="none" stroke={K.hot} strokeWidth={6} strokeLinejoin="round" opacity={metal} style={{ filter: `drop-shadow(0 0 8px ${K.hot})` }} />}
      </g>
    );
  };

/** Deslizador de sensibilidad: v 0→1. */
export const Slider: React.FC<{ x: number; y: number; w: number; v: number; o?: number }> = ({ x, y, w, v, o = 1 }) => (
  <g opacity={o}>
    <rect x={x - w / 2 - 30} y={y - 60} width={w + 60} height={120} rx={26} fill={C.dark} stroke={C.case2} strokeWidth={5} />
    <rect x={x - w / 2} y={y - 9} width={w} height={18} rx={9} fill="#33435c" />
    <rect x={x - w / 2} y={y - 9} width={w * v} height={18} rx={9} fill={K.flow} />
    {[0, 0.25, 0.5, 0.75, 1].map((k) => <rect key={k} x={x - w / 2 + w * k - 2} y={y + 18} width={4} height={18} fill={C.case3} />)}
    <circle cx={x - w / 2 + w * v} cy={y} r={30} fill={K.white} stroke={K.flow} strokeWidth={8} />
  </g>
);

export const Glasses: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill="none" stroke={C.steel} strokeWidth={9}>
    <circle cx={-48} cy={0} r={38} /><circle cx={48} cy={0} r={38} />
    <path d="M -12 -6 Q 0 -18 12 -6" /><path d="M -86 -6 L -112 -20" /><path d="M 86 -6 L 112 -20" />
  </g>
);
export const RingIcon: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={8} rx={44} ry={40} fill="none" stroke={K.flow} strokeWidth={13} />
    <ellipse cx={0} cy={8} rx={44} ry={40} fill="none" stroke="#fff" strokeWidth={3} opacity={0.4} />
  </g>
);
export const KeyBunch: React.FC<{ x: number; y: number; s?: number; o?: number; glow?: number }> = ({ x, y, s = 1, o = 1, glow = 0 }) => (
  <g opacity={o}>
    <circle cx={x} cy={y - 40 * s} r={34 * s} fill="none" stroke={C.steel} strokeWidth={9 * s} />
    <KeyIcon x={x - 20 * s} y={y + 20 * s} s={1.1 * s} rot={70} glow={glow} />
    <KeyIcon x={x + 18 * s} y={y + 22 * s} s={1.1 * s} rot={110} glow={glow} />
    <KeyIcon x={x} y={y + 30 * s} s={1.0 * s} rot={90} glow={glow} />
  </g>
);

export const Bottle: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-20} y={-150} width={40} height={30} rx={6} fill={K.cold} />
    <path d="M -24 -120 L 24 -120 L 50 -70 L 50 120 Q 50 140 30 140 L -30 140 Q -50 140 -50 120 L -50 -70 Z" fill={K.cold} opacity={0.35} stroke={K.cold} strokeWidth={6} />
    <rect x={-50} y={-10} width={100} height={50} fill={K.white} opacity={0.5} />
  </g>
);
export const Cup: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -70 -80 L 70 -80 L 58 80 Q 56 100 36 100 L -36 100 Q -56 100 -58 80 Z" fill="#F2EEE6" stroke={C.case3} strokeWidth={5} />
    <path d="M 66 -40 Q 120 -40 112 10 Q 106 50 60 46" fill="none" stroke="#F2EEE6" strokeWidth={16} />
    <rect x={-60} y={-30} width={120} height={14} fill={K.cold} opacity={0.7} />
  </g>
);

/** Escáner corporal (cabina con dos brazos que barren). */
export const BodyScanner: React.FC<{ x: number; y: number; s?: number; o?: number; t: number }> = ({ x, y, s = 1, o = 1, t }) => {
  const sw = Math.sin(t * 2.4);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect x={-130} y={-150} width={260} height={30} rx={12} fill={C.case1} stroke={C.case3} strokeWidth={4} />
      <rect x={-130} y={150} width={260} height={22} rx={10} fill={C.case1} stroke={C.case3} strokeWidth={4} />
      <rect x={-120 + 30 * sw} y={-120} width={44} height={270} rx={14} fill={C.case2} stroke={C.case3} strokeWidth={4} />
      <rect x={76 - 30 * sw} y={-120} width={44} height={270} rx={14} fill={C.case2} stroke={C.case3} strokeWidth={4} />
      <Person x={0} base={150} s={0.5} color="#7894BA" />
      {[0, 1, 2].map((k) => <path key={k} d={`M ${-60 + 30 * sw} ${-90 + k * 90} q 20 -14 40 0 t 40 0`} fill="none" stroke={K.cold} strokeWidth={5} opacity={0.8} />)}
    </g>
  );
};
/** Máquina de rayos X de equipaje con cinta y maleta que avanza. */
export const XRay: React.FC<{ x: number; y: number; s?: number; o?: number; t: number }> = ({ x, y, s = 1, o = 1, t }) => {
  const bx = -150 + ((t * 70) % 300);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect x={-200} y={60} width={400} height={20} rx={8} fill="#33435c" />
      <g><rect x={bx - 40} y={10} width={80} height={50} rx={8} fill={K.hot} opacity={0.85} /><rect x={bx - 14} y={0} width={28} height={12} rx={4} fill="none" stroke={K.hot} strokeWidth={5} /></g>
      <path d="M -110 80 L -110 -90 Q -110 -120 -80 -120 L 80 -120 Q 110 -120 110 -90 L 110 80 L 70 80 L 70 -40 L -70 -40 L -70 80 Z" fill={C.case2} stroke={C.case3} strokeWidth={5} />
      <rect x={-50} y={-100} width={100} height={40} rx={8} fill={C.dark} />
      <path d="M -40 -80 L -20 -90 L 0 -76 L 20 -92 L 40 -80" fill="none" stroke={K.cold} strokeWidth={4} />
    </g>
  );
};

/** Cinturón con hebilla (la hebilla brilla con glow). */
export const Belt: React.FC<{ x: number; y: number; s?: number; glow?: number; o?: number }> = ({ x, y, s = 1, glow = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -180 -20 Q 0 40 180 -20 L 180 20 Q 0 80 -180 20 Z" fill="#6B4A2E" stroke="#3d2a19" strokeWidth={4} />
    <g style={glow > 0.01 ? { filter: `drop-shadow(0 0 ${10 + 14 * glow}px ${K.flow})` } : {}}>
      <rect x={-46} y={-14} width={92} height={74} rx={12} fill="none" stroke={glow > 0.5 ? K.flow : C.steel} strokeWidth={14} />
      <rect x={-4} y={-10} width={8} height={66} fill={glow > 0.5 ? K.flow : C.steel} />
    </g>
  </g>
);
/** Sujetador esquemático: copas de tela y el aro metálico (resaltado con glow). */
export const Bra: React.FC<{ x: number; y: number; s?: number; glow?: number; o?: number }> = ({ x, y, s = 1, glow = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -150 -70 L -120 -20" stroke="#E7B6C8" strokeWidth={10} /><path d="M 150 -70 L 120 -20" stroke="#E7B6C8" strokeWidth={10} />
    <path d="M -10 30 Q -30 -60 -110 -40 Q -170 -10 -150 40 Z" fill="#E7B6C8" opacity={0.85} />
    <path d="M 10 30 Q 30 -60 110 -40 Q 170 -10 150 40 Z" fill="#E7B6C8" opacity={0.85} />
    <path d="M -160 40 L 160 40" stroke="#E7B6C8" strokeWidth={14} />
    <g style={glow > 0.01 ? { filter: `drop-shadow(0 0 ${10 + 14 * glow}px ${K.flow})` } : {}}>
      <path d="M -150 44 Q -80 90 -12 34" fill="none" stroke={glow > 0.5 ? K.flow : C.steel} strokeWidth={9} strokeLinecap="round" />
      <path d="M 150 44 Q 80 90 12 34" fill="none" stroke={glow > 0.5 ? K.flow : C.steel} strokeWidth={9} strokeLinecap="round" />
    </g>
  </g>
);

/** Silueta con la cadera en esquema: pelvis y la prótesis (bola + vástago) en amarillo. */
export const HipFigure: React.FC<{ x: number; base: number; s?: number; glow?: number }> = ({ x, base, s = 1, glow = 0 }) => (
  <g>
    <Person x={x} base={base} s={s} />
    <g transform={`translate(${x} ${base}) scale(${s})`}>
      <path d="M -70 -230 Q -60 -280 -20 -270 L 20 -270 Q 60 -280 70 -230 Q 40 -200 0 -205 Q -40 -200 -70 -230 Z" fill={K.white} opacity={0.55} />
      <line x1={-38} y1={-205} x2={-36} y2={-40} stroke={K.white} strokeWidth={12} opacity={0.4} strokeLinecap="round" />
      <g style={glow > 0.01 ? { filter: `drop-shadow(0 0 ${10 + 16 * glow}px ${K.flow})` } : {}}>
        <circle cx={34} cy={-215} r={17} fill={glow > 0.3 ? K.flow : C.steel} />
        <path d="M 34 -215 L 40 -90" stroke={glow > 0.3 ? K.flow : C.steel} strokeWidth={13} strokeLinecap="round" />
      </g>
    </g>
  </g>
);
/** Detector de mano (pala). */
export const Wand: React.FC<{ x: number; y: number; s?: number; o?: number; rot?: number; led?: number }> = ({ x, y, s = 1, o = 1, rot = -20, led = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <rect x={-46} y={-120} width={92} height={150} rx={40} fill={C.case2} stroke={C.case3} strokeWidth={5} />
    <rect x={-28} y={-100} width={56} height={110} rx={26} fill={C.dark} />
    <rect x={-18} y={30} width={36} height={130} rx={14} fill={C.case1} stroke={C.case3} strokeWidth={4} />
    <circle cx={0} cy={60} r={9} fill={led > 0.5 ? K.warn : "#3a1c24"} style={led > 0.5 ? { filter: `drop-shadow(0 0 10px ${K.warn})` } : {}} />
  </g>
);

/** Balanza de inducción de 1881 (esquema): tabla con dos bobinas, cable y auricular. */
export const BellDevice: React.FC<{ x: number; y: number; s?: number; t: number; glow?: number }> = ({ x, y, s = 1, t, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-210} y={40} width={420} height={40} rx={10} fill="#8A5A34" stroke="#5a3a20" strokeWidth={4} />
    {[-90, 90].map((cx) => (
      <g key={cx}>
        <ellipse cx={cx} cy={20} rx={80} ry={30} fill="none" stroke={glow > 0.01 ? K.flow : C.copper} strokeWidth={12}
          style={glow > 0.01 ? { filter: `drop-shadow(0 0 ${6 + 10 * glow}px ${K.flow})` } : {}} />
        <ellipse cx={cx} cy={6} rx={80} ry={30} fill="none" stroke={glow > 0.01 ? K.flow : C.copper} strokeWidth={12} opacity={0.7} />
      </g>
    ))}
    <path d={`M 170 60 C 260 60 240 -120 160 -150`} fill="none" stroke={C.case3} strokeWidth={6} />
    <g transform={`translate(150 -175) rotate(${-15 + 4 * Math.sin(t * 3)})`}>
      <rect x={-22} y={-10} width={44} height={110} rx={16} fill="#2a2a2a" stroke={C.case3} strokeWidth={4} />
      <ellipse cx={0} cy={-10} rx={42} ry={18} fill="#2a2a2a" stroke={C.case3} strokeWidth={4} />
    </g>
  </g>
);
export const Bullet: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -20 30 L -20 -10 Q -20 -40 0 -50 Q 20 -40 20 -10 L 20 30 Z" fill="#B08D57" stroke="#6d5530" strokeWidth={4} />
  </g>
);
