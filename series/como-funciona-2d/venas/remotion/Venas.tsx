// Dibujos SVG planos del episodio «Cómo funciona el visor de venas». Sin marcas. Personas como siluetas neutras.
// Brazo esquemático, sangre esquemática en #E53935 (solo en cortes de la piel), sin agujas ni sangre explícita.
import React from "react";
import { K } from "./kit2d/Kit";

export const C = {
  case1: "#2B4A72", case2: "#3E6AA0", case3: "#9FB3CC", dark: "#0B1A30", sil: "#1C3557", silEdge: "#4A73A8",
  skin: "#8FA6C4", skinEdge: "#B9C9DD", fat: "#5C7699", vein: "#1E3150", nir: K.hot, map: K.flow,
};

/** Trayectorias de las venas del brazo (coordenadas absolutas, brazo en x 180-900, y 900-1080). */
export const VEINS = [
  "M 900 990 C 780 980 700 950 600 960 C 500 970 420 1010 300 1000 C 250 996 215 985 190 975",
  "M 900 1040 C 800 1045 720 1030 640 1000 C 600 985 560 965 520 962",
  "M 760 950 C 720 925 680 915 640 918",
  "M 420 1010 C 380 1035 330 1050 270 1052",
];

/** Brazo esquemático horizontal (antebrazo + mano a la izquierda). veins: 0 = no se ven, 1 = se intuyen; map: dibujo proyectado 0-1; cam: modo «foto infrarroja» (gris, venas oscuras). */
export const Arm: React.FC<{ t: number; veins?: number; map?: number; cam?: number; o?: number }> = ({ t, veins = 0.12, map = 0, cam = 0, o = 1 }) => {
  const skin = cam > 0.5 ? "#C9D3DF" : C.skin;
  return (
    <g opacity={o}>
      {/* antebrazo */}
      <path d="M 200 925 C 400 905 700 900 915 912 Q 940 1000 915 1088 C 700 1095 400 1090 200 1065 Z" fill={skin} stroke={C.skinEdge} strokeWidth={5} />
      {/* mano esquemática */}
      <path d="M 210 925 C 160 915 120 925 95 950 C 70 975 70 1035 95 1055 C 125 1080 170 1075 210 1065 Z" fill={skin} stroke={C.skinEdge} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={30 - (i === 0 ? -10 : 0)} y={940 + i * 30} width={80} height={24} rx={12} fill={skin} stroke={C.skinEdge} strokeWidth={4} />)}
      {/* venas: apenas se intuyen, o líneas oscuras en la foto infrarroja */}
      {VEINS.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={C.vein} strokeWidth={i < 2 ? 18 : 12} strokeLinecap="round" opacity={Math.max(veins, cam * 0.9)} />
      ))}
      {/* mapa proyectado: se dibuja con la palabra y late suave */}
      {map > 0.01 && VEINS.map((d, i) => (
        <path key={"m" + i} d={d} fill="none" stroke={C.map} strokeWidth={i < 2 ? 14 : 10} strokeLinecap="round" pathLength={1}
          strokeDasharray={`${map} 1`} opacity={0.85 + 0.15 * Math.sin(t * 4 + i)} style={{ filter: `drop-shadow(0 0 8px ${C.map})` }} />
      ))}
    </g>
  );
};

/** Cabezal del visor (lamparita) centrado en (x, y): carcasa, cámara, proyector y anillo de LED. open: tapa del objetivo 0-1. glow: LED encendidos. */
export const Head: React.FC<{ x: number; y: number; s?: number; t: number; open?: number; glow?: number; hi?: "cam" | "proj" | "led" | "none" }> = ({ x, y, s = 1, t, open = 1, glow = 1, hi = "none" }) => {
  const ring = (k: string) => (hi === k ? K.flow : C.case3);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* brazo articulado que sale por arriba */}
      <path d="M 150 -70 L 260 -200 L 420 -200" fill="none" stroke={C.case2} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={260} cy={-200} r={24} fill={C.case3} />
      {/* carcasa */}
      <rect x={-230} y={-90} width={460} height={180} rx={70} fill={C.case1} stroke={C.case2} strokeWidth={8} />
      <rect x={-200} y={60} width={400} height={30} rx={14} fill={C.dark} />
      {/* LED infrarrojos */}
      {Array.from({ length: 8 }).map((_, i) => (
        <circle key={i} cx={-175 + i * 50} cy={75} r={9} fill={K.hot} opacity={0.25 + 0.75 * glow * (0.75 + 0.25 * Math.sin(t * 6 + i))} stroke={hi === "led" ? K.flow : "none"} strokeWidth={4} />
      ))}
      {/* cámara */}
      <circle cx={-95} cy={-10} r={56} fill={C.dark} stroke={ring("cam")} strokeWidth={8} />
      <circle cx={-95} cy={-10} r={28} fill="#14304F" />
      <circle cx={-105} cy={-20} r={9} fill={K.white} opacity={0.7} />
      {/* proyector */}
      <circle cx={95} cy={-10} r={56} fill={C.dark} stroke={ring("proj")} strokeWidth={8} />
      <circle cx={95} cy={-10} r={28} fill={K.flow} opacity={0.35 + 0.5 * glow} />
      {/* tapas que se abren (se separan hacia los lados) */}
      {open < 0.999 && (
        <g opacity={1 - open}>
          <rect x={-230 - open * 160} y={-90} width={230} height={150} rx={60} fill={C.case2} stroke={C.case3} strokeWidth={5} />
          <rect x={0 + open * 160} y={-90} width={230} height={150} rx={60} fill={C.case2} stroke={C.case3} strokeWidth={5} />
        </g>
      )}
    </g>
  );
};

/** Cono de luz del cabezal hacia el brazo. kind: "nir" (naranja, invisible: discontinuo) o "map" (amarillo). */
export const Cone: React.FC<{ x: number; y0: number; y1: number; w0?: number; w1?: number; o: number; t: number; kind?: "nir" | "map"; dashed?: boolean }> =
  ({ x, y0, y1, w0 = 120, w1 = 700, o, t, kind = "nir", dashed = false }) => {
    if (o <= 0.01) return null;
    const col = kind === "nir" ? C.nir : C.map;
    const pts = `${x - w0 / 2},${y0} ${x + w0 / 2},${y0} ${x + w1 / 2},${y1} ${x - w1 / 2},${y1}`;
    return (
      <g opacity={o}>
        <polygon points={pts} fill={col} opacity={dashed ? 0.06 : 0.16} />
        <polygon points={pts} fill="none" stroke={col} strokeWidth={4} strokeDasharray={dashed ? "16 14" : "none"} strokeDashoffset={-t * 40} opacity={0.7} />
        {/* ondas que bajan */}
        {[0, 0.33, 0.66].map((k, i) => {
          const u = (t * 0.7 + k) % 1; const yy = y0 + (y1 - y0) * u; const ww = w0 + (w1 - w0) * u;
          return <line key={i} x1={x - ww / 2 + 10} y1={yy} x2={x + ww / 2 - 10} y2={yy} stroke={col} strokeWidth={5} opacity={0.6 * Math.sin(Math.PI * u)} strokeDasharray={dashed ? "10 12" : "none"} />;
        })}
      </g>
    );
  };

/** Corte de la piel: capa de piel arriba, grasa debajo y una o dos venas (círculos) dentro. */
export const SkinCut: React.FC<{ y0: number; h: number; veins: { x: number; y: number; r: number; o?: number }[]; o?: number }> = ({ y0, h, veins, o = 1 }) => (
  <g opacity={o}>
    <rect x={60} y={y0} width={960} height={h} rx={24} fill={C.fat} />
    <rect x={60} y={y0} width={960} height={70} rx={24} fill={C.skin} />
    <rect x={60} y={y0 + 46} width={960} height={24} fill={C.skin} />
    <line x1={60} y1={y0 + 70} x2={1020} y2={y0 + 70} stroke={C.skinEdge} strokeWidth={4} opacity={0.7} />
    {veins.map((v, i) => (
      <g key={i} opacity={v.o ?? 1}>
        <circle cx={v.x} cy={v.y} r={v.r} fill={K.warn} stroke="#FF8A80" strokeWidth={5} />
        <circle cx={v.x - v.r * 0.3} cy={v.y - v.r * 0.3} r={v.r * 0.25} fill="#FF8A80" opacity={0.5} />
      </g>
    ))}
  </g>
);

/** Fotón que entra, se desvía y o bien vuelve (rebota) o bien muere en la vena. Devuelve un punto en el tiempo u ∈ [0,1]. */
export const Photon: React.FC<{ path: [number, number][]; u: number; color?: string; die?: boolean; r?: number }> = ({ path, u, color = C.nir, die = false, r = 11 }) => {
  const n = path.length - 1; r = r * 1.3; const k = Math.min(n - 0.0001, u * n); const i = Math.floor(k); const f = k - i;
  const [ax, ay] = path[i]; const [bx, by] = path[i + 1];
  const o = die ? Math.max(0, 1 - Math.max(0, u - 0.8) * 5) : Math.sin(Math.PI * Math.min(1, u * 1.05));
  return (
    <g opacity={o}>
      <polyline points={path.slice(0, i + 1).map((p) => p.join(",")).join(" ") + ` ${ax + (bx - ax) * f},${ay + (by - ay) * f}`} fill="none" stroke={color} strokeWidth={4} opacity={0.35} />
      <circle cx={ax + (bx - ax) * f} cy={ay + (by - ay) * f} r={r} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
    </g>
  );
};

/** Barra del espectro: visible (arcoíris) 400-700 nm y zona invisible 700-1000 nm. x0-x1 en píxeles. */
export const Spectrum: React.FC<{ x0: number; x1: number; y: number; h?: number; mark: number; t: number; nirO?: number }> = ({ x0, x1, y, h = 90, mark, t, nirO = 1 }) => {
  const X = (nm: number) => x0 + ((nm - 400) / 600) * (x1 - x0);
  return (
    <g>
      <defs>
        <linearGradient id="vis" x1="0" x2="1">
          {["#7B3FF2", "#2F6BFF", "#20C3E8", "#3DDC6B", "#F6E33A", "#FF9A2E", "#FF3B30"].map((c, i) => <stop key={i} offset={i / 6} stopColor={c} />)}
        </linearGradient>
      </defs>
      <rect x={x0} y={y} width={X(700) - x0} height={h} rx={14} fill="url(#vis)" />
      <rect x={X(700)} y={y} width={x1 - X(700)} height={h} rx={14} fill={C.dark} stroke={C.case2} strokeWidth={4} strokeDasharray="12 10" />
      {/* marcador 850 nm */}
      <g opacity={mark}>
        <rect x={X(850) - 8} y={y - 30} width={16} height={h + 60} rx={8} fill={K.hot} style={{ filter: `drop-shadow(0 0 ${10 + 6 * Math.sin(t * 5)}px ${K.hot})` }} />
      </g>
      <g opacity={nirO}>
        {[0, 1, 2].map((i) => { const u = (t * 0.6 + i / 3) % 1; return <path key={i} d={`M ${X(720) + u * (X(980) - X(720))} ${y + h / 2} q 12 -22 24 0 t 24 0`} fill="none" stroke={K.hot} strokeWidth={4} opacity={0.6 * Math.sin(Math.PI * u)} />; })}
      </g>
      {[400, 700, 1000].map((nm) => (
        <text key={nm} x={X(nm)} y={y + h + 50} textAnchor="middle" fontSize={30} fontWeight={800} fill={C.case3} fontFamily="MontserratSerie">{nm}</text>
      ))}
    </g>
  );
};

/** Cámara de fotos esquemática (vista de frente). */
export const Camera: React.FC<{ x: number; y: number; s?: number; flash?: number }> = ({ x, y, s = 1, flash = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-60} y={-110} width={120} height={40} rx={10} fill={C.case2} />
    <rect x={-150} y={-80} width={300} height={190} rx={30} fill={C.case1} stroke={C.case2} strokeWidth={6} />
    <circle cx={0} cy={15} r={70} fill={C.dark} stroke={C.case3} strokeWidth={8} />
    <circle cx={0} cy={15} r={36} fill={K.hot} opacity={0.35} />
    <circle cx={-14} cy={0} r={10} fill={K.white} opacity={0.7} />
    <circle cx={110} cy={-50} r={12} fill={K.hot} opacity={0.5 + 0.5 * flash} />
    {flash > 0.01 && <circle cx={0} cy={15} r={160 * flash} fill="none" stroke={K.white} strokeWidth={6} opacity={1 - flash} />}
  </g>
);

/** Pantalla/tableta con un trozo de brazo y venas (marco en x-w/2..x+w/2). */
export const Screen: React.FC<{ x: number; y: number; w: number; h: number; t: number; o?: number; dark?: boolean }> = ({ x, y, w, h, t, o = 1, dark = true }) => (
  <g opacity={o}>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={26} fill={C.case1} stroke={C.case3} strokeWidth={6} />
    <rect x={x - w / 2 + 18} y={y - h / 2 + 18} width={w - 36} height={h - 36} rx={14} fill="#D3DBE6" />
    <clipPath id={`scr${x}${y}`}><rect x={x - w / 2 + 18} y={y - h / 2 + 18} width={w - 36} height={h - 36} rx={14} /></clipPath>
    <g clipPath={`url(#scr${x}${y})`}>
      {[-0.28, 0.02, 0.3].map((k, i) => (
        <path key={i} d={`M ${x - w / 2} ${y + h * k} C ${x - w / 6} ${y + h * k - 40} ${x + w / 6} ${y + h * k + 40} ${x + w / 2} ${y + h * k - 10}`}
          fill="none" stroke={dark ? C.vein : C.map} strokeWidth={i === 1 ? 22 : 14} strokeLinecap="round" opacity={0.9} />
      ))}
      <rect x={x - w / 2} y={y - h / 2 + ((t * 120) % h)} width={w} height={6} fill={K.hot} opacity={0.35} />
    </g>
  </g>
);

/** Silueta neutra (cabeza + torso). Centro de la cabeza en (x, y), escala s. */
export const Person: React.FC<{ x: number; y: number; s?: number; o?: number; cane?: boolean }> = ({ x, y, s = 1, o = 1, cane = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={0} r={78} fill={C.sil} stroke={C.silEdge} strokeWidth={6} />
    <path d="M-60 100 Q 0 80 60 100 L 150 150 Q 190 170 190 230 L 190 640 L -190 640 L -190 230 Q -190 170 -150 150 Z" fill={C.sil} stroke={C.silEdge} strokeWidth={6} />
    {cane && <path d="M 230 300 L 230 640 M 230 300 Q 230 250 190 250" fill="none" stroke={C.case3} strokeWidth={16} strokeLinecap="round" />}
  </g>
);

/** Bebé esquemático (silueta neutra, cabeza grande). */
export const Baby: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={150} rx={120} ry={110} fill={C.sil} stroke={C.silEdge} strokeWidth={6} />
    <circle cx={0} cy={0} r={92} fill={C.sil} stroke={C.silEdge} strokeWidth={6} />
    <ellipse cx={-120} cy={140} rx={30} ry={50} fill={C.sil} stroke={C.silEdge} strokeWidth={6} transform="rotate(30 -120 140)" />
    <ellipse cx={120} cy={140} rx={30} ry={50} fill={C.sil} stroke={C.silEdge} strokeWidth={6} transform="rotate(-30 120 140)" />
  </g>
);

/** Manita a contraluz: luz bajo la mano, la mano brilla y las venas se ven como sombras. glow 0-1. */
export const BackLitHand: React.FC<{ x: number; y: number; s?: number; glow: number; t: number }> = ({ x, y, s = 1, glow, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* luz debajo */}
    <ellipse cx={0} cy={240} rx={190} ry={40} fill={K.flow} opacity={0.25 + 0.6 * glow} style={{ filter: `blur(${10 + 4 * Math.sin(t * 3)}px)` }} />
    <rect x={-90} y={230} width={180} height={50} rx={20} fill={C.case2} stroke={C.case3} strokeWidth={5} />
    <circle cx={0} cy={232} r={26} fill={K.flow} opacity={0.4 + 0.6 * glow} />
    {/* mano (palma + dedos) */}
    <g>
      {[-105, -50, 5, 60].map((dx, i) => <rect key={i} x={dx} y={-200 + (i === 0 || i === 3 ? 40 : 0)} width={48} height={190} rx={24} fill={glow > 0.5 ? "#FFB27A" : C.skin} opacity={0.6 + 0.4 * glow} />)}
      <rect x={95} y={-40} width={46} height={150} rx={23} fill={glow > 0.5 ? "#FFB27A" : C.skin} opacity={0.6 + 0.4 * glow} transform="rotate(35 118 35)" />
      <rect x={-115} y={-40} width={230} height={230} rx={70} fill={glow > 0.5 ? "#FFB27A" : C.skin} opacity={0.6 + 0.4 * glow} style={{ filter: glow > 0.5 ? `drop-shadow(0 0 ${24 * glow}px #FF9A4A)` : "none" }} />
      {/* venas como sombras */}
      {["M -60 190 C -50 120 -80 60 -70 -20", "M 20 190 C 30 120 0 60 10 -30", "M -20 120 C 10 90 50 80 70 30"].map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#5A2A1E" strokeWidth={14} strokeLinecap="round" opacity={0.8 * glow} />
      ))}
    </g>
  </g>
);
