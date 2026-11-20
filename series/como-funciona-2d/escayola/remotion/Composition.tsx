// Episodio 145 · Cómo funciona una escayola (yeso o fibra de vidrio) para curar un hueso roto (ESPECIAL HOSPITAL).
// Cada beat es una <Scene> con su dibujo y 1-3 etiquetas. Cambios atados a palabras con Wd(beat, "palabra").
// Nada de texto en y > 1150 (subtítulos) ni x > 940 entre y 900-1420 (botones de TikTok). Sin consejos médicos: «eso lo decide tu médico».
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { C, Arm, Bone, Bowl, Thermo, TimeBar, Section, Saw, Wobble, Stick, Scratch, Drops } from "./Escayola";

export const COMP_ID = "Escayola";
export const HOOK = "La escayola no cura"; // = meta.portada (≤5 palabras, la última va en amarillo)
export type Props = { timing: Timing; debug?: boolean };

const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>{children}</svg>
);

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const S = (i: number) => scene(i)[0];
  const E = (i: number) => scene(i)[1];
  const chip = (i: number) => span(t, S(i), E(i));
  const dim = (x: number) => 0.3 + 0.7 * x; // atenuado antes de entrar
  const sp = (i: number, w: string, end?: number) => span(t, Wd(i, w), end ?? E(i));
  /** etiqueta que luego es sustituida por otra en el mismo sitio: atenuada antes de entrar y DESAPARECE del todo al salir. */
  const lab = (a: number, b: number) => (t < a ? 0.3 : span(t, a, b, 0.25));
  /** la que entra después en el mismo sitio: invisible hasta que la primera ha salido. */
  const lab2 = (a: number, b: number) => span(t, a + 0.3, b);
  const on = (i: number, w: string, d = 0.4) => ramp(t, Wd(i, w), Wd(i, w) + d);

  // ---- tiempos clave
  const b1open = ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.7);
  const b2cal = ramp(t, Wd(2, "repara"), Wd(2, "solo") + 1.2);
  const b3cal = 0.15 + 0.55 * ramp(t, Wd(3, "crece"), Wd(3, "callo") + 0.8);
  const b3mov = on(3, "mueve", 0.3);
  const b4stock = ramp(t, S(4) + 0.2, Wd(4, "varias"));
  const b4pad = ramp(t, Wd(4, "varias"), Wd(4, "protegen") + 0.3);
  const b5dip = ramp(t, Wd(5, "mojarse") - 0.2, Wd(5, "mojarse") + 0.4);
  const b6time = ramp(t, Wd(6, "Coge"), E(6) - 0.4);
  const b7dip = ramp(t, Wd(7, "agua") - 0.2, Wd(7, "agua") + 0.4);
  const b9sw = ramp(t, Wd(9, "hincha"), Wd(9, "hincha") + 1.0);
  const b10down = ramp(t, Wd(10, "baja"), Wd(10, "baja") + 1.0);
  const b10closed = t >= Wd(10, "baja") + 1.0;
  const b11stick = ramp(t, Wd(11, "rascar"), Wd(11, "rascar") + 0.6);
  const b12cut = ramp(t, Wd(12, "Corta"), E(12) - 0.3);
  const b13 = ramp(t, S(13) + 0.3, S(13) + 1.0);
  const b13cal = on(13, "hueso", 0.6);

  return (
    <AbsoluteFill>
      <Bg />
      {/* 1 · gancho: el brazo escayolado GRANDE desde el fotograma 0; con «equivocados» la escayola se abre y se ve el hueso */}
      <Scene {...sc(1)}>
        <SVG><g transform={`translate(540 770) scale(${1 + 0.012 * Math.sin(t * 2)}) translate(-540 -770)`}>
          <Arm x={530} y={770} s={1.0} t={t} open={b1open} bone={b1open} callus={0.35 * b1open} />
        </g></SVG>
        <Label x={540} y={1110} text="dentro, el hueso trabaja solo" color={K.flow} size={44} box o={span(t, Wd(1, "equivocados") + 0.6, E(1))} />
      </Scene>

      {/* 2 · la promesa: el hueso se repara solo; la escayola solo lo mantiene quieto */}
      <Scene {...sc(2)}>
        <Chip text="No cura: inmoviliza" o={chip(2)} />
        <SVG>
          <rect x={90} y={620} width={900} height={240} rx={60} fill="none" stroke={C.plaster} strokeWidth={10} strokeDasharray="30 18" opacity={dim(on(2, "escayola")) * 0.8} />
          <Bone x={540} y={740} s={1.15} gap={10} callus={b2cal} hi={b2cal > 0.6 ? 1 : 0} t={t} />
        </SVG>
        <Label x={540} y={470} text="se repara solo" color={K.flow} size={52} o={dim(sp(2, "repara"))} />
        <Label x={540} y={1110} text="la escayola: solo quieto" color={K.white} size={46} box o={dim(sp(2, "quieto"))} />
      </Scene>

      {/* 3 · idea clave: en la rotura crece hueso nuevo (el callo); si se mueve, tarda más */}
      <Scene {...sc(3)}>
        <Chip text="La idea clave" o={chip(3)} />
        <SVG>
          <Bone x={540} y={740} s={1.15} gap={12} callus={b3cal} hi={b3mov > 0.5 ? 0 : 1} wob={b3mov * 7 * Math.sin(t * 14)} t={t} />
          {b3mov > 0.01 && [-1, 1].map((d) => <path key={d} d={`M ${760 + d * 0} ${740 + d * 120} q 60 ${-d * 40} 120 0`} fill="none" stroke={K.warn} strokeWidth={8} strokeLinecap="round" opacity={b3mov} />)}
        </SVG>
        <Label x={540} y={470} text="callo óseo" color={K.flow} size={52} o={dim(sp(3, "callo"))} />
        <Label x={540} y={1110} text="hueso nuevo" color={K.flow} size={46} box o={lab(Wd(3, "crece"), Wd(3, "mueve"))} />
        <Label x={540} y={1110} text="si se mueve, tarda más" color={K.warn} size={46} box o={lab2(Wd(3, "mueve"), E(3))} />
      </Scene>

      {/* 4 · primero: media fina y vueltas de algodón */}
      <Scene {...sc(4)}>
        <Chip text="1 · La base blanda" o={chip(4)} />
        <SVG><Arm x={530} y={760} s={0.95} t={t} stock={Math.max(0.03, b4stock)} pad={b4pad} cast={0} hiLayer={t < Wd(4, "varias") ? "stock" : "pad"} /></SVG>
        <Label x={300} y={470} text="media fina" color={C.stock} size={44} o={dim(sp(4, "media"))} />
        <Label x={720} y={470} text="algodón" color={C.pad} size={44} o={dim(sp(4, "algodón"))} />
        <Label x={540} y={1110} text="protege la piel" color={K.flow} size={46} box o={dim(sp(4, "protegen"))} />
      </Scene>

      {/* 5 · segundo: vendas de yeso; el polvo, al mojarse, vuelve a ser roca y suelta calor */}
      <Scene {...sc(5)}>
        <Chip text="2 · Vendas de yeso" o={chip(5)} />
        <SVG><Bowl x={540} y={820} t={t} dip={b5dip} mat="yeso" heat={on(5, "calor")} /></SVG>
        <Label x={540} y={470} text="polvo: sulfato de calcio" color={K.white} size={42} o={dim(sp(5, "polvo"))} />
        <Label x={540} y={1110} text="+ agua → roca" color={K.cold} size={48} box o={lab(Wd(5, "mojarse"), Wd(5, "calor"))} />
        <Label x={540} y={1110} text="¡y suelta calor!" color={K.hot} size={48} box o={lab2(Wd(5, "calor"), E(5))} />
      </Scene>

      {/* 6 · por eso la notas templada; coge forma en minutos, pero tarda días en endurecer del todo */}
      <Scene {...sc(6)}>
        <Chip text="Templada y lenta" o={chip(6)} />
        <SVG>
          <Thermo x={180} y={700} level={0.25 + 0.3 * on(6, "templada", 0.8)} s={0.9} />
          <Arm x={610} y={690} s={0.66} t={t} heat={1 - 0.6 * b6time} />
          <TimeBar x0={140} x1={900} y={930} split={0.14} p={0.02 + 0.98 * b6time} colA={K.flow} colB={C.case3} />
        </SVG>
        <Label x={180} y={470} text="templada" color={K.hot} size={44} o={dim(sp(6, "templada"))} />
        <Label x={250} y={1020} text="minutos: forma" color={K.flow} size={38} o={dim(sp(6, "minutos"))} />
        <Label x={680} y={1020} text="días: dura del todo" color={C.case3} size={38} o={dim(sp(6, "días"))} />
      </Scene>

      {/* 7 · tercero: fibra de vidrio con resina, que también endurece con agua y mucho más rápido */}
      <Scene {...sc(7)}>
        <Chip text="3 · Fibra de vidrio" o={chip(7)} />
        <SVG><Bowl x={540} y={820} t={t} dip={b7dip} mat="fibra" heat={0.5 * on(7, "agua")} /></SVG>
        <Label x={540} y={470} text="fibra + resina" color={K.cold} size={48} o={dim(sp(7, "fibra"))} />
        <Label x={540} y={1110} text="endurece con agua" color={K.cold} size={46} box o={lab(Wd(7, "endurece"), Wd(7, "rápido"))} />
        <Label x={540} y={1110} text="¡mucho más rápido!" color={K.flow} size={48} box o={lab2(Wd(7, "rápido"), E(7))} />
      </Scene>

      {/* 8 · pesa menos y aguanta el agua, pero el algodón de debajo se empapa (salvo forros impermeables especiales) */}
      <Scene {...sc(8)}>
        <Chip text="Fibra: pros y pegas" o={chip(8)} />
        <SVG>
          <Arm x={530} y={740} s={0.95} t={t} mat="fibra" wet={on(8, "empapa", 0.8)} open={0.45 * on(8, "algodón", 0.5)} inner />
          <Drops x0={220} x1={830} y={600} t={t} o={dim(on(8, "agua"))} />
        </SVG>
        <Label x={260} y={470} text="pesa menos" color={K.white} size={40} o={dim(sp(8, "Pesa"))} />
        <Label x={740} y={470} text="aguanta el agua" color={K.cold} size={40} o={dim(sp(8, "aguanta"))} />
        <Label x={540} y={1110} text="el algodón se empapa" color={K.cold} size={44} box o={lab(Wd(8, "algodón"), Wd(8, "salvo"))} />
        <Label x={540} y={1110} text="salvo forros especiales" color={K.flow} size={44} box o={lab2(Wd(8, "salvo"), E(8))} />
      </Scene>

      {/* 9 · cuarto: ¿abierta o cerrada? al principio se hincha y la férula abierta deja sitio */}
      <Scene {...sc(9)}>
        <Chip text="4 · ¿Abierta o cerrada?" o={chip(9)} />
        <SVG>
          <Section x={290} y={760} t={t} swell={b9sw} open={false} s={0.78} />
          <Section x={790} y={760} t={t} swell={b9sw} open s={0.78} ok={on(9, "sitio")} />
        </SVG>
        <Label x={290} y={470} text="cerrada" color={C.case3} size={42} o={dim(sp(9, "cerrada"))} />
        <Label x={790} y={470} text="férula abierta" color={K.flow} size={42} o={dim(sp(9, "abierta"))} />
        <Label x={540} y={1110} text="se hincha" color={K.warn} size={46} box o={lab(Wd(9, "hincha"), Wd(9, "férula"))} />
        <Label x={540} y={1110} text="la abierta deja sitio" color={K.flow} size={46} box o={lab2(Wd(9, "férula"), E(9))} />
      </Scene>

      {/* 10 · la cerrada suele llegar después, cuando baja la hinchazón; eso lo decide tu médico */}
      <Scene {...sc(10)}>
        <Chip text="Después, cerrada" o={chip(10)} />
        <SVG>
          <Section x={540} y={740} t={t} swell={0.85 * (1 - b10down)} open={!b10closed} s={1.1} arrows={false} ok={b10closed ? ramp(t, Wd(10, "baja") + 1, Wd(10, "baja") + 1.4) : 0} />
        </SVG>
        <Label x={540} y={470} text="baja la hinchazón" color={K.cold} size={44} o={dim(sp(10, "baja"))} />
        <Label x={540} y={1110} text="eso lo decide tu médico" color={K.flow} size={46} box o={dim(sp(10, "decide"))} />
      </Scene>

      {/* 11 · curiosidad: la piel tapada semanas pica, pero rascar metiendo algo puede abrir heridas que se infecten */}
      <Scene {...sc(11)}>
        <Chip text="Curiosidad" o={chip(11)} />
        <SVG>
          <Arm x={570} y={740} s={0.9} t={t} itch={dim(on(11, "pica"))} />
          <Stick x={330} y={720} p={b11stick} t={t} cross={on(11, "heridas")} />
          <Scratch x={330} y={790} o={on(11, "heridas")} />
        </SVG>
        <Label x={540} y={470} text="¡pica!" color={K.flow} size={56} o={dim(sp(11, "pica"))} />
        <Label x={540} y={1110} text="semanas tapada" color={K.white} size={44} box o={lab(Wd(11, "semanas"), Wd(11, "rascar"))} />
        <Label x={540} y={1110} text="rascar dentro = heridas" color={K.warn} size={44} box o={lab2(Wd(11, "rascar"), E(11))} />
      </Scene>

      {/* 12 · otra: la sierra que la quita no gira: vibra; corta lo rígido y lo blando vibra con ella */}
      <Scene {...sc(12)}>
        <Chip text="Otra curiosidad" o={chip(12)} />
        <SVG>
          <Arm x={530} y={910} s={0.85} t={t} cut={b12cut} />
          <Saw x={540} y={770} t={t} s={0.8} on={dim(on(12, "vibra"))} />
          <Wobble x={540} y={770} r={130} o={dim(on(12, "vibra"))} />
        </SVG>
        <Label x={800} y={520} text="no gira: vibra" color={K.flow} size={42} box o={dim(sp(12, "gira"))} />
        <Label x={540} y={1110} text="corta lo rígido" color={K.white} size={44} box o={lab(Wd(12, "Corta"), Wd(12, "blando"))} />
        <Label x={540} y={1110} text="lo blando vibra con ella" color={K.flow} size={44} box o={lab2(Wd(12, "blando"), E(12))} />
      </Scene>

      {/* 13 · cierre */}
      <Scene {...sc(13)}>
        <Chip text="En resumen" o={chip(13)} />
        <SVG>
          <Arm x={530} y={760} s={0.95} t={t} open={0.6 * b13} bone={b13} callus={0.3 + 0.7 * b13cal} />
        </SVG>
        <Label x={260} y={470} text="algodón" color={C.pad} size={42} o={dim(sp(13, "algodón"))} />
        <Label x={740} y={470} text="yeso o fibra" color={K.white} size={42} o={dim(sp(13, "yeso"))} />
        <Label x={540} y={1110} text="tu hueso hace el resto" color={K.flow} size={46} box o={dim(sp(13, "hueso"))} />
      </Scene>

      <Stamp x={540} y={400} text="¡FALSO!" p={ramp(t, Wd(1, "equivocados"), Wd(1, "equivocados") + 0.3) * (t < scene(1)[1] ? 1 : 0)} />
      <HookTitle t={t} text={HOOK} />
      <Captions words={timing.words} t={t} />
      <Outro question="Sígueme" sub="y el próximo aparato lo eliges tú" frame={frame} start={Math.round(outroStart * fps)} />
      <Watermark t={t} outro={outroStart} />
      {debug && <SafeZones />}
    </AbsoluteFill>
  );
};
