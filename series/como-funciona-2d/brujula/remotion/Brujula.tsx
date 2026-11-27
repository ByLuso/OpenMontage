// Dibujos SVG del episodio «Cómo funciona una brújula (y la del móvil, sin aguja)». Coordenadas absolutas de 1080×1920.
// Colores de código: amarillo = lo importante (punta norte de la aguja, polo magnético), naranja = calor/energía (núcleo de hierro líquido),
// cian = líquido y líneas del campo, blanco = texto y norte geográfico. Rojo NO se usa (solo error). Grises azulados para carcasas.
// Sin marcas: brújula y móvil genéricos.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = { case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", ink: "#06101F", dial: "#12284A", land: "#3E6AA0", sea: "#163457",
  mantle: "#7A4524", paper: "#D9C7A0", paper2: "#B49E72", silk: "#E9E1CC" };

const glow = (c: string, r = 12) => ({ filter: `drop-shadow(0 0 ${r}px ${c})` });
const rad = (d: number) => (d * Math.PI) / 180;

/** Aguja de brújula: rombo con la mitad norte amarilla y la sur gris. heading en grados (0 = arriba, horario). */
export const Needle: React.FC<{ L: number; heading: number; w?: number; hi?: boolean }> = ({ L, heading, w, hi = false }) => {
  const ww = w ?? L * 0.16;
  return (
    <g transform={`rotate(${heading})`}>
      <polygon points={`0,${-L} ${ww},0 ${-ww},0`} fill={K.flow} stroke={C.ink} strokeWidth={Math.max(2, L * 0.02)} style={hi ? glow(K.flow, 14) : undefined} />
      <polygon points={`0,${L} ${ww},0 ${-ww},0`} fill={C.case3} stroke={C.ink} strokeWidth={Math.max(2, L * 0.02)} />
    </g>
  );
};

/** Brújula vista desde arriba. (x, y) centro, r radio. heading = giro de la aguja. lid 0..1 = tapa de cristal levantada.
 *  liquid 0..1 = cápsula llena de líquido (cian). pivot = resalta el eje. */
export const Compass: React.FC<{ x: number; y: number; r: number; heading: number; lid?: number; liquid?: number; pivot?: boolean; hiNeedle?: boolean; o?: number; t?: number }> =
  ({ x, y, r, heading, lid = 0, liquid = 0, pivot = false, hiNeedle = false, o = 1, t = 0 }) => {
    const rd = r * 0.84;
    const letters: [string, number][] = [["N", 0], ["E", 90], ["S", 180], ["O", 270]];
    return (
      <g transform={`translate(${x},${y})`} opacity={o}>
        {/* caja */}
        <circle r={r} fill={C.case1} stroke={C.case3} strokeWidth={r * 0.045} />
        <circle r={r * 0.93} fill="none" stroke={C.case2} strokeWidth={r * 0.05} />
        {/* esfera */}
        <circle r={rd} fill={C.dial} />
        {Array.from({ length: 36 }).map((_, i) => {
          const a = rad(i * 10); const big = i % 9 === 0; const r0 = rd * (big ? 0.8 : 0.88);
          return <line key={i} x1={r0 * Math.sin(a)} y1={-r0 * Math.cos(a)} x2={rd * 0.96 * Math.sin(a)} y2={-rd * 0.96 * Math.cos(a)} stroke={K.white} strokeWidth={big ? r * 0.018 : r * 0.009} opacity={0.75} />;
        })}
        {letters.map(([s, a]) => (
          <text key={s} x={rd * 0.64 * Math.sin(rad(a))} y={-rd * 0.64 * Math.cos(rad(a)) + r * 0.07} fill={s === "N" ? K.flow : K.white} fontFamily="MontserratSerie" fontWeight={900} fontSize={r * 0.2} textAnchor="middle">{s}</text>
        ))}
        {/* líquido */}
        {liquid > 0.01 && (
          <g opacity={liquid}>
            <circle r={rd} fill={K.cold} opacity={0.28} />
            <circle cx={rd * 0.35} cy={-rd * 0.42 + 4 * Math.sin(t * 2)} r={r * 0.045} fill={K.white} opacity={0.5} />
            <circle cx={-rd * 0.5} cy={rd * 0.3 + 3 * Math.sin(t * 2.6)} r={r * 0.03} fill={K.white} opacity={0.4} />
          </g>
        )}
        <Needle L={rd * 0.78} heading={heading} hi={hiNeedle} />
        <circle r={r * 0.06} fill={C.case3} stroke={C.ink} strokeWidth={r * 0.015} style={pivot ? glow(K.flow, 14) : undefined} />
        {pivot && <circle r={r * 0.1} fill="none" stroke={K.flow} strokeWidth={r * 0.02} />}
        {/* tapa de cristal: se levanta y se aparta hacia un lado */}
        <g transform={`translate(${lid * r * 0.85},${-lid * r * 0.4}) scale(${1 - 0.12 * lid})`} opacity={1 - 0.35 * lid}>
          <circle r={r * 0.9} fill={K.white} opacity={0.07} stroke={K.white} strokeOpacity={0.35 + 0.4 * lid} strokeWidth={r * 0.02} />
          <path d={`M${-r * 0.55},${-r * 0.5} A${r * 0.75},${r * 0.75} 0 0 1 ${r * 0.2},${-r * 0.72}`} fill="none" stroke={K.white} strokeWidth={r * 0.05} strokeLinecap="round" opacity={0.35} />
        </g>
      </g>
    );
  };

/** Puntos (en radios terrestres, y hacia arriba = norte) de una línea de campo de dipolo r = L·sin²θ, lado derecho. */
const fieldPts = (L: number, n = 40) => {
  const th0 = Math.asin(Math.sqrt(1 / L));
  return Array.from({ length: n + 1 }).map((_, i) => {
    const th = th0 + ((Math.PI - 2 * th0) * i) / n;
    const rr = L * Math.sin(th) ** 2;
    return [rr * Math.sin(th), rr * Math.cos(th)] as const;
  });
};
/** Rumbo (grados, 0 = arriba) hacia el norte a lo largo de la línea L en el ángulo θ (lado derecho), y su posición. */
export const fieldAt = (L: number, thDeg: number) => {
  const th = rad(thDeg);
  const p = (a: number) => { const rr = L * Math.sin(a) ** 2; return [rr * Math.sin(a), rr * Math.cos(a)]; };
  const [x0, y0] = p(th); const [x1, y1] = p(th - 0.01);
  const dx = x1 - x0, dy = y1 - y0; // hacia el norte (θ decreciente)
  return { x: x0, y: y0, heading: (Math.atan2(dx, dy) * 180) / Math.PI };
};

/** Líneas del campo magnético alrededor de una Tierra de radio R en (x, y). flip 0..1 invierte el sentido de las flechas. */
export const FieldLines: React.FC<{ x: number; y: number; R: number; Ls?: number[]; t: number; o?: number; tilt?: number; flip?: number; color?: string }> =
  ({ x, y, R, Ls = [1.35, 1.7, 2.1], t, o = 1, tilt = 0, flip = 0, color = K.cold }) => {
    if (o <= 0.01) return null;
    const dir = 1 - 2 * flip; // 1 = hacia el norte por fuera
    return (
      <g transform={`translate(${x},${y}) rotate(${tilt})`} opacity={o}>
        {Ls.map((L, k) => {
          const pts = fieldPts(L);
          return [-1, 1].map((s) => {
            const d = pts.map(([px, py], i) => `${i ? "L" : "M"}${(s * px * R).toFixed(1)},${(-py * R).toFixed(1)}`).join(" ");
            const ay = 0; const ax = s * L * R; // cruce con el ecuador
            const up = dir;
            return (
              <g key={`${k}${s}`}>
                <path d={d} fill="none" stroke={color} strokeWidth={5} strokeDasharray="18 14" strokeDashoffset={dir * t * 40} opacity={0.8} style={glow(color, 6)} />
                {Math.abs(up) > 0.15 && (
                  <polygon points={`${ax},${ay - 22 * up} ${ax + 15},${ay + 10 * up} ${ax - 15},${ay + 10 * up}`} fill={color} />
                )}
              </g>
            );
          });
        })}
      </g>
    );
  };

/** La Tierra. cut 0..1 = corte (capas: corteza, manto, núcleo externo de hierro líquido, núcleo interno). magnet 0..1 = imán de barra dentro. */
export const Earth: React.FC<{ x: number; y: number; R: number; t: number; cut?: number; magnet?: number; tilt?: number; swirl?: number; hiCore?: boolean }> =
  ({ x, y, R, t, cut = 0, magnet = 0, tilt = 0, swirl = 1, hiCore = false }) => {
    const lands = [
      `M${-0.55 * R},${-0.55 * R} q${0.25 * R},${-0.2 * R} ${0.45 * R},${-0.05 * R} q${0.1 * R},${0.25 * R} ${-0.15 * R},${0.4 * R} q${-0.2 * R},${0.1 * R} ${-0.3 * R},${-0.35 * R} z`,
      `M${0.1 * R},${-0.35 * R} q${0.35 * R},${-0.15 * R} ${0.6 * R},${0.05 * R} q${0.05 * R},${0.3 * R} ${-0.2 * R},${0.35 * R} q${-0.1 * R},${0.35 * R} ${-0.3 * R},${0.25 * R} q${-0.2 * R},${-0.3 * R} ${-0.1 * R},${-0.65 * R} z`,
      `M${-0.35 * R},${0.25 * R} q${0.2 * R},${0} ${0.25 * R},${0.25 * R} q${-0.05 * R},${0.25 * R} ${-0.2 * R},${0.2 * R} q${-0.15 * R},${-0.2 * R} ${-0.05 * R},${-0.45 * R} z`,
    ];
    return (
      <g transform={`translate(${x},${y})`}>
        {/* superficie */}
        <g opacity={1 - cut}>
          <circle r={R} fill={C.sea} stroke={C.case3} strokeWidth={6} />
          {lands.map((d, i) => <path key={i} d={d} fill={C.land} />)}
          <ellipse cx={0} cy={-R * 0.93} rx={R * 0.32} ry={R * 0.08} fill={K.white} opacity={0.75} />
          <ellipse cx={0} cy={R * 0.93} rx={R * 0.3} ry={R * 0.08} fill={K.white} opacity={0.75} />
        </g>
        {/* corte */}
        {cut > 0.01 && (
          <g opacity={cut}>
            <circle r={R} fill={C.case2} stroke={C.case3} strokeWidth={6} />
            <circle r={R * 0.94} fill={C.mantle} />
            <circle r={R * 0.55} fill={K.hot} style={hiCore ? glow(K.hot, 24) : glow(K.hot, 10)} />
            {[0.33, 0.42, 0.5].map((rr, i) => (
              <circle key={i} r={R * rr} fill="none" stroke={K.flow} strokeWidth={6} strokeDasharray={`${R * 0.25} ${R * 0.18}`} strokeLinecap="round"
                transform={`rotate(${(i % 2 ? -1 : 1) * t * (40 + 15 * i) * swirl})`} opacity={0.75} />
            ))}
            <circle r={R * 0.2} fill={K.flow} />
          </g>
        )}
        {/* imán de barra (esquemático, sin letras de polo) */}
        {magnet > 0.01 && (
          <g transform={`rotate(${tilt})`} opacity={magnet}>
            <rect x={-R * 0.11} y={-R * 0.62} width={R * 0.22} height={R * 0.62} rx={8} fill={C.case3} stroke={C.ink} strokeWidth={5} />
            <rect x={-R * 0.11} y={0} width={R * 0.22} height={R * 0.62} rx={8} fill={C.case2} stroke={C.ink} strokeWidth={5} />
          </g>
        )}
      </g>
    );
  };

// ---------- Mapa del Ártico (proyección polar) ----------
export type LL = [number, number]; // [lat, lon]
export const polar = (cx: number, cy: number, s: number) => ([lat, lon]: LL) => {
  const rho = (90 - lat) * s;
  return { x: cx + rho * Math.sin(rad(lon)), y: cy + rho * Math.cos(rad(lon)) };
};
const LANDS: LL[][] = [
  // Canadá (norte y archipiélago)
  [[60, -140], [69, -140], [70, -128], [74, -124], [77, -118], [79, -104], [82, -90], [83, -70], [80, -72], [76, -78], [72, -80], [68, -82], [64, -88], [60, -95]],
  // Alaska
  [[60, -142], [69, -142], [71, -156], [70, -163], [66, -168], [60, -166]],
  // Groenlandia
  [[83, -30], [82, -18], [76, -18], [70, -22], [62, -42], [70, -54], [76, -68], [80, -66]],
  // Siberia y norte de Rusia
  [[60, 30], [69, 33], [70, 60], [73, 80], [76, 100], [77.5, 105], [76, 115], [73, 130], [72, 150], [70, 170], [66, 180], [60, 180]],
  // Escandinavia
  [[60, 5], [63, 8], [69, 16], [71, 26], [69, 33], [60, 30]],
];
/** Recorrido aproximado del polo norte magnético (esquemático): de Canadá hacia Siberia. */
export const POLE_PATH: LL[] = [[70.5, -96], [72, -97], [74, -100], [76.5, -101], [78, -103], [81, -110], [83.5, -120], [85, -133], [86.3, -152], [86.5, -170], [86.4, 165], [86, 150], [85.8, 139]];

/** Punto a lo largo del recorrido (p 0..1) en píxeles. */
export const pathPoint = (proj: (ll: LL) => { x: number; y: number }, p: number) => {
  const pts = POLE_PATH.map(proj);
  const seg = pts.slice(1).map((q, i) => Math.hypot(q.x - pts[i].x, q.y - pts[i].y));
  const tot = seg.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, p)) * tot;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) { const k = Math.min(1, d / seg[i]); return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k }; }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};

/** Mapa del Ártico visto desde arriba. maxColat = grados desde el polo que caben en el radio. */
export const Arctic: React.FC<{ cx: number; cy: number; R: number; maxColat: number; id: string; children?: React.ReactNode; o?: number }> = ({ cx, cy, R, maxColat, id, children, o = 1 }) => {
  const proj = polar(cx, cy, R / maxColat);
  return (
    <g opacity={o}>
      <defs><clipPath id={id}><circle cx={cx} cy={cy} r={R} /></clipPath></defs>
      <circle cx={cx} cy={cy} r={R + 10} fill={C.case1} />
      <circle cx={cx} cy={cy} r={R} fill={C.sea} />
      <g clipPath={`url(#${id})`}>
        {LANDS.map((poly, i) => <path key={i} d={poly.map((ll, k) => { const p = proj(ll); return `${k ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(" ") + " Z"} fill={C.land} opacity={0.9} />)}
        {[5, 10, 15, 20, 25, 30].filter((c) => c < maxColat).map((c) => <circle key={c} cx={cx} cy={cy} r={(R / maxColat) * c} fill="none" stroke={K.white} strokeOpacity={0.12} strokeWidth={3} strokeDasharray="8 10" />)}
        {children}
      </g>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.case3} strokeWidth={6} />
    </g>
  );
};

/** Estrella blanca del Polo Norte geográfico. */
export const Star: React.FC<{ x: number; y: number; r?: number; o?: number }> = ({ x, y, r = 26, o = 1 }) => (
  <polygon opacity={o} fill={K.white} stroke={C.ink} strokeWidth={4}
    points={Array.from({ length: 10 }).map((_, i) => { const a = rad(i * 36); const rr = i % 2 ? r * 0.45 : r; return `${x + rr * Math.sin(a)},${y - rr * Math.cos(a)}`; }).join(" ")} />
);

/** Polo magnético: punto amarillo que late. */
export const MagPole: React.FC<{ x: number; y: number; t: number; o?: number; r?: number }> = ({ x, y, t, o = 1, r = 18 }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r * (1.8 + 0.5 * Math.sin(t * 4))} fill={K.flow} opacity={0.22} />
    <circle cx={x} cy={y} r={r} fill={K.flow} stroke={C.ink} strokeWidth={4} style={glow(K.flow, 12)} />
  </g>
);

// ---------- Península Ibérica (muy esquemática) ----------
const IBERIA: [number, number][] = [[-9.3, 43.0], [-8, 43.7], [-5, 43.5], [-1.8, 43.4], [0, 42.7], [3.2, 42.4], [3.2, 41.9], [1, 41.1], [0.2, 40.1], [-0.3, 39.4], [0.2, 38.8], [-0.8, 37.6],
  [-2, 36.7], [-4.4, 36.7], [-5.6, 36.0], [-6.3, 36.8], [-7.4, 37.2], [-8.9, 37.0], [-8.8, 38.7], [-9.5, 38.8], [-8.8, 40.5], [-8.9, 42.0]];
export const ibProj = (cx: number, cy: number, s: number) => (lon: number, lat: number) => ({ x: cx + (lon + 3) * s, y: cy - (lat - 40) * s * 1.3 });
export const Iberia: React.FC<{ cx: number; cy: number; s: number; o?: number }> = ({ cx, cy, s, o = 1 }) => {
  const p = ibProj(cx, cy, s);
  return <path opacity={o} d={IBERIA.map(([lo, la], i) => { const q = p(lo, la); return `${i ? "L" : "M"}${q.x.toFixed(1)},${q.y.toFixed(1)}`; }).join(" ") + " Z"} fill={C.case1} stroke={C.case3} strokeWidth={6} strokeLinejoin="round" />;
};

/** Brujulita de mapa: norte geográfico (blanco discontinuo) y aguja (amarilla) desviada `dec` grados. */
export const MiniDecl: React.FC<{ x: number; y: number; dec: number; o?: number }> = ({ x, y, dec, o = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <circle r={44} fill={C.dial} stroke={C.case3} strokeWidth={5} />
    <line x1={0} y1={36} x2={0} y2={-40} stroke={K.white} strokeWidth={4} strokeDasharray="6 6" />
    <Needle L={34} heading={dec} w={8} />
    <circle r={5} fill={C.case3} />
  </g>
);

// ---------- Móvil ----------
/** Móvil genérico de frente. (x, y) centro; s escala (1 = 340×680). rot = giro en grados. hiMag = resalta sus imanes (altavoz, vibrador). */
export const Phone: React.FC<{ x: number; y: number; s?: number; rot?: number; hiChip?: boolean; hiMag?: boolean; children?: React.ReactNode }> = ({ x, y, s = 1, rot = 0, hiChip = false, hiMag = false, children }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-170} y={-340} width={340} height={680} rx={46} fill={C.case1} stroke={C.case3} strokeWidth={8} />
    <rect x={-150} y={-310} width={300} height={620} rx={30} fill={C.ink} />
    <rect x={-40} y={-326} width={80} height={10} rx={5} fill={C.case3} opacity={0.7} />
    {children}
    {/* chip magnetómetro */}
    <g transform="translate(0,190)" style={hiChip ? glow(K.flow, 16) : undefined}>
      <rect x={-44} y={-44} width={88} height={88} rx={10} fill={C.case2} stroke={hiChip ? K.flow : C.case3} strokeWidth={6} />
      {[-30, -10, 10, 30].map((k) => <g key={k}><line x1={k} y1={-44} x2={k} y2={-58} stroke={C.case3} strokeWidth={5} /><line x1={k} y1={44} x2={k} y2={58} stroke={C.case3} strokeWidth={5} /></g>)}
      <rect x={-20} y={-20} width={40} height={40} rx={4} fill={C.ink} />
    </g>
    {/* imanes propios: altavoz arriba y vibrador abajo */}
    <g style={hiMag ? glow(K.hot, 14) : undefined}>
      <rect x={-60} y={-292} width={120} height={34} rx={12} fill={hiMag ? K.hot : C.case2} opacity={hiMag ? 1 : 0.8} />
      <circle cx={100} cy={270} r={24} fill={hiMag ? K.hot : C.case2} opacity={hiMag ? 1 : 0.8} />
    </g>
  </g>
);

/** Flecha recta con punta. */
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color?: string; o?: number; w?: number }> = ({ x1, y1, x2, y2, color = K.flow, o = 1, w = 10 }) => {
  if (o <= 0.01) return null;
  const a = Math.atan2(y2 - y1, x2 - x1), h = w * 2.6;
  const p = (da: number) => `${x2 - h * Math.cos(a + da)},${y2 - h * Math.sin(a + da)}`;
  return (
    <g opacity={o}>
      <line x1={x1} y1={y1} x2={x2 - h * 0.6 * Math.cos(a)} y2={y2 - h * 0.6 * Math.sin(a)} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${p(0.45)} ${p(-0.45)}`} fill={color} />
    </g>
  );
};

/** Libro chino antiguo abierto (columnas de texto esquemáticas). */
export const OldBook: React.FC<{ x: number; y: number; w: number; h: number; o?: number }> = ({ x, y, w, h, o = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-w / 2 - 14} y={-h / 2 + 14} width={w + 28} height={h} rx={10} fill={C.paper2} />
    {[-1, 1].map((s) => (
      <g key={s}>
        <path d={`M0,${-h / 2} Q${(s * w) / 4},${-h / 2 - 22} ${(s * w) / 2},${-h / 2 + 4} L${(s * w) / 2},${h / 2 - 4} Q${(s * w) / 4},${h / 2 - 26} 0,${h / 2} Z`} fill={C.paper} stroke={C.paper2} strokeWidth={4} />
        {Array.from({ length: 6 }).map((_, i) => {
          const cx = s * (40 + i * ((w / 2 - 80) / 5));
          return Array.from({ length: 7 }).map((__, j) => (
            <rect key={`${i}-${j}`} x={cx - 9} y={-h / 2 + 34 + j * ((h - 90) / 7)} width={18} height={14 + ((i * 7 + j) % 3) * 4} rx={3} fill="#5A4A30" opacity={0.75} />
          ));
        })}
      </g>
    ))}
    <line x1={0} y1={-h / 2} x2={0} y2={h / 2} stroke={C.paper2} strokeWidth={6} />
  </g>
);
