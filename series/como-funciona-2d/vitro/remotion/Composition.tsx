// Episodio 143 · Cómo funciona una vitrocerámica radiante (y en qué se diferencia de la de inducción).
// Cada beat es una <Scene> con su dibujo (Vitro.tsx), un <Chip> y 1-3 <Label>. Cambios atados a palabras con Wd(beat, "palabra").
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg, Scene, Chip, Label, Stamp, HookTitle, Watermark, Captions, Outro, SafeZones, Timing, K, ramp, span, useTiming } from "./kit2d/Kit";
import { Svg, Hob, Spiral, Section, Expand, Micro, Bars, Clock, Scraper, OnOff, PotTop } from "./Vitro";

export const COMP_ID = "Vitro";
export const HOOK = "Casi no se dilata"; // = meta.portada
export type Props = { timing: Timing; debug?: boolean };

export const Episode: React.FC<Props> = ({ timing, debug = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { B, Wd, scene, outroStart } = useTiming(timing);
  const sc = (i: number) => ({ t, a: scene(i)[0], b: scene(i)[1] });
  const S = (i: number) => scene(i)[0];
  const E = (i: number) => scene(i)[1];
  /** Etiqueta que entra en la palabra w del beat i y dura hasta el final de la escena (o hasta `until`). */
  const at = (i: number, w: string, until?: number) => span(t, Wd(i, w), until ?? E(i));
  /** Elemento que entra después: atenuado (0,3) desde el inicio de la escena y pleno al decir w. */
  const late = (i: number, w: string) => 0.3 + 0.7 * ramp(t, Wd(i, w), Wd(i, w) + 0.4);
  const r = (i: number, w: string, d = 0.5) => ramp(t, Wd(i, w), Wd(i, w) + d);
  const chip = (i: number) => span(t, S(i) + 0.1, E(i));

  // beat 1: el cristal se abre como una tapa al decir «equivocados»
  const open1 = r(1, "equivocados", 0.8);
  // beat 7: el termostato enciende y apaga la espiral (ciclo de 1,6 s, encendida el 55 %)
  const per = 1.6, duty = 0.55;
  const ph = (((t - S(7)) % per) + per) % per;
  const on7 = Math.min(ramp(ph, 0, 0.18), 1 - ramp(ph, per * duty, per * duty + 0.25));
  const blink = 0.25 + 0.75 * ramp(t, Wd(7, "enciende"), Wd(7, "enciende") + 0.3);
  // beat 12: apagada antes de acabar; el cristal guarda el calor
  const off12 = r(12, "apágala", 0.8);
  // beat 13: la olla se arrastra (raya), luego azúcar y rasqueta
  const drag = ramp(t, Wd(13, "arrastres"), Wd(13, "rayan") + 0.3);
  const potX = 300 + 330 * drag;
  const scr = ramp(t, Wd(13, "rasqueta") - 0.2, Wd(13, "rasqueta") + 1.0);
  const sugar = r(13, "azúcar", 0.4) * (1 - scr);

  return (
    <AbsoluteFill>
      <Bg />

      {/* 1 · gancho: la placa grande con la zona al rojo; al decir «equivocados» el cristal se levanta y deja ver la espiral */}
      <Scene {...sc(1)}>
        <Svg><Hob t={t} heat={[1, 0.15, 0.7]} open={open1} display={open1 > 0.1 ? "" : "9"} /></Svg>
        <Chip text="POR DENTRO" o={span(t, 1.9, E(1))} />
        <Label x={540} y={1125} text="¿un cristal normal?" size={48} box o={at(1, "cristal")} />
      </Scene>

      {/* 2 · entrega: el vidrio normal crece y se raja; la vitro no cambia */}
      <Scene {...sc(2)}>
        <Svg><Expand t={t} heat={late(2, "calor")} shock={r(2, "bruscos", 0.6)} /></Svg>
        <Chip text="NO ES CRISTAL NORMAL" o={chip(2)} />
        <Label x={260} y={560} text="vidrio normal" size={40} box o={1} />
        <Label x={820} y={560} text="vitrocerámica" color={K.flow} size={40} box o={1} />
        <Label x={260} y={668} text="¡crac!" color={K.warn} size={44} box o={at(2, "bruscos")} />
        <Label x={820} y={668} text="¡aguanta!" color={K.flow} size={44} box o={at(2, "romperse")} />
        <Label x={540} y={1125} text="casi no se dilata" color={K.flow} size={46} box o={at(2, "dilata")} />
      </Scene>

      {/* 3 · idea clave: cristales microscópicos que encogen y compensan al vidrio que crece */}
      <Scene {...sc(3)}>
        <Svg><Micro t={t} heat={late(3, "calor")} grow={r(3, "vidrio", 0.5)} shrink={r(3, "encogen", 0.5)} balance={r(3, "compensan", 0.5)} /></Svg>
        <Chip text="LA IDEA CLAVE" o={chip(3)} />
        <Label x={540} y={440} text="cristales microscópicos" size={44} box o={at(3, "cristales")} />
        <Label x={540} y={1125} text="encogen con el calor" color={K.cold} size={42} box o={at(3, "encogen", Wd(3, "compensan") - 0.05)} />
        <Label x={540} y={1125} text="se compensan: casi 0" color={K.flow} size={42} box o={at(3, "compensan")} />
      </Scene>

      {/* 4 · la resistencia: cinta ondulada en espiral que se pone al rojo */}
      <Scene {...sc(4)}>
        <Svg><Spiral cx={540} cy={780} R={250} heat={0.05 + 0.95 * r(4, "rojo", 0.9)} t={t} /></Svg>
        <Chip text="1 · LA RESISTENCIA" color={K.hot} o={chip(4)} />
        <Label x={540} y={445} text="bajo la placa" size={42} box o={at(4, "bajo", Wd(4, "resistencia") - 0.05)} />
        <Label x={540} y={445} text="resistencia" color={K.hot} size={44} box o={at(4, "resistencia")} />
        <Label x={540} y={1115} text="cinta en espiral" color={K.flow} size={44} box o={at(4, "cinta", Wd(4, "rojo") - 0.05)} />
        <Label x={540} y={1115} text="¡al rojo!" color={K.hot} size={52} box o={at(4, "rojo")} />
      </Scene>

      {/* 5 · el calor sube como luz infrarroja y atraviesa la vitro */}
      <Scene {...sc(5)}>
        <Svg><Section t={t} cy={40} heat={1} ir={late(5, "infrarroja")} boil={0.4 * r(5, "olla", 0.8)} /></Svg>
        <Chip text="2 · RADIACIÓN" color={K.hot} o={chip(5)} />
        <Label x={540} y={430} text="luz infrarroja" color={K.hot} size={46} box o={at(5, "luz")} />
        <Label x={540} y={1125} text="atraviesa la vitro" color={K.flow} size={44} box o={at(5, "atraviesa")} />
      </Scene>

      {/* 6 · el cristal también calienta por contacto: mejor fondo plano */}
      <Scene {...sc(6)}>
        <Svg><Section t={t} cy={40} heat={1} ir={0.35} glassHeat={0.5 * r(6, "calienta", 0.6)} contact={late(6, "contacto")}
          warp={ramp(t, Wd(6, "usa") - 0.2, Wd(6, "usa") + 0.3) * (1 - r(6, "plano", 0.5))} boil={0.5} hl={t < Wd(6, "usa") ? "glass" : null} /></Svg>
        <Chip text="3 · CONTACTO" color={K.hot} o={chip(6)} />
        <Label x={540} y={430} text="calor por contacto" color={K.hot} size={44} box o={at(6, "contacto")} />
        <Label x={540} y={1125} text="fondo plano" color={K.flow} size={48} box o={at(6, "fondo")} />
      </Scene>

      {/* 7 · el termostato enciende y apaga: el rojo parpadea */}
      <Scene {...sc(7)}>
        <Svg>
          <Hob t={t} y0={470} h={470} zones={[{ x: 540, y: 705, r: 200 }]} heat={[0.15 + 0.85 * (1 - blink + blink * on7)]} display="6" dispColor={K.flow} />
          <OnOff t={t} o={late(7, "enciende")} period={per} duty={duty} y={1030} />
        </Svg>
        <Chip text="4 · EL TERMOSTATO" color={K.flow} o={chip(7)} />
        <Label x={540} y={415} text="enciende · apaga" color={K.flow} size={40} box o={at(7, "enciende")} />
        <Label x={540} y={1125} text="¡por eso parpadea!" color={K.hot} size={44} box o={at(7, "parpadea")} />
      </Scene>

      {/* 8 · inducción: no se pone roja; el campo magnético calienta la olla */}
      <Scene {...sc(8)}>
        <Svg><Section t={t} cy={40} induction={1} field={late(8, "campo")} potHeat={r(8, "calienta", 0.6)} boil={0.6 * r(8, "olla", 1)} /></Svg>
        <Chip text="¿Y LA DE INDUCCIÓN?" color={K.cold} o={chip(8)} />
        <Label x={540} y={430} text="no se pone roja" color={K.cold} size={44} box o={at(8, "roja")} />
        <Label x={540} y={1125} text="campo magnético" size={46} box o={at(8, "campo")} />
      </Scene>

      {/* 9 · la placa solo se calienta por la olla; la olla atrae a un imán */}
      <Scene {...sc(9)}>
        <Svg><Section t={t} cy={40} induction={1} field={0.6} potHeat={1} boil={0.7} glassHeat={0.3 * r(9, "calienta", 0.8)} down={late(9, "olla")} magnet={r(9, "imán", 0.6)} /></Svg>
        <Chip text="INDUCCIÓN" color={K.cold} o={chip(9)} />
        <Label x={540} y={430} text="la placa la calienta la olla" size={40} box o={at(9, "calienta")} />
        <Label x={540} y={1125} text="olla que atrae al imán" color={K.flow} size={44} box o={at(9, "imán")} />
      </Scene>

      {/* 10 · gasta menos: entre un 20 y un 40 % según la OCU */}
      <Scene {...sc(10)}>
        <Svg><Bars t={t} p={ramp(t, S(10), S(10) + 0.8)} range={r(10, "veinte", 0.5)} /></Svg>
        <Chip text="GASTA MENOS" color={K.flow} o={chip(10)} />
        <Label x={735} y={515} text="-20 % a -40 %" color={K.flow} size={42} box o={at(10, "veinte")} />
        <Label x={345} y={1110} text="radiante" color={K.hot} size={42} box o={1} />
        <Label x={735} y={1110} text="inducción" color={K.cold} size={42} box o={late(10, "gasta")} />
      </Scene>

      {/* 11 · curiosidad: ya no está roja, pero quema; la H hasta unos 60 °C */}
      <Scene {...sc(11)}>
        <Svg><Hob t={t} heat={[1 - r(11, "aunque", 0.9), 0, 0]} residual={1 - 0.4 * ramp(t, Wd(11, "hache"), E(11))} display={t >= Wd(11, "hache") ? "H" : "0"} dispColor={t >= Wd(11, "hache") ? K.hot : "#5E6E88"} /></Svg>
        <Chip text="CURIOSIDAD" o={chip(11)} />
        <Label x={540} y={445} text="¡sigue quemando!" color={K.warn} size={46} box o={at(11, "quemando")} />
        <Label x={540} y={1125} text="H hasta unos 60 °C" color={K.hot} size={46} box o={at(11, "sesenta")} />
      </Scene>

      {/* 12 · truco: apagarla unos minutos antes; el calor guardado termina el guiso */}
      <Scene {...sc(12)}>
        <Svg>
          <Section t={t} cy={40} heat={1 - off12} ir={0.6 * (1 - off12)} glassHeat={0.25 + 0.45 * off12} contact={off12} boil={0.9} lid={1} />
          <Clock x={860} y={440} t={t} o={late(12, "minutos")} back={r(12, "antes", 0.8)} />
        </Svg>
        <Chip text="TRUCO" o={chip(12)} />
        <Label x={460} y={430} text="apágala antes" color={K.cold} size={44} box o={at(12, "apágala")} />
        <Label x={540} y={1125} text="el calor guardado cocina" color={K.hot} size={42} box o={at(12, "termina")} />
      </Scene>

      {/* 13 · otro truco: no arrastres; azúcar fuera con rasqueta */}
      <Scene {...sc(13)}>
        <Svg>
          <Hob t={t} heat={[0, 0, 0]} />
          <g opacity={r(13, "rayan", 0.3)}>
            {[-40, 0, 40].map((dy, k) => <line key={k} x1={300} y1={760 + dy} x2={potX - 40} y2={760 + dy + 6 * (k - 1)} stroke={K.warn} strokeWidth={5} strokeLinecap="round" />)}
          </g>
          <g opacity={1 - r(13, "azúcar", 0.4)}><PotTop x={potX} y={760} r={150} /></g>
          <g opacity={sugar}>
            {[[480, 740, 46], [540, 790, 34], [430, 800, 28], [600, 735, 22]].map(([x, y, rr], k) => <circle key={k} cx={x} cy={y} r={rr} fill="#C98A3A" opacity={0.9} />)}
          </g>
          <Scraper x={330 + 420 * scr} y={790} o={r(13, "azúcar", 0.4) * (0.4 + 0.6 * r(13, "rasqueta", 0.3)) * (scr < 0.98 ? 1 : 1 - ramp(t, Wd(13, "rasqueta") + 1.0, Wd(13, "rasqueta") + 1.3))} />
        </Svg>
        <Chip text="OTRO TRUCO" o={chip(13)} />
        <Label x={540} y={445} text="levántalas, no arrastres" color={K.warn} size={42} box o={at(13, "arrastres", Wd(13, "azúcar") - 0.05)} />
        <Label x={540} y={445} text="azúcar: rasqueta, ¡ya!" color={K.flow} size={42} box o={at(13, "azúcar")} />
      </Scene>

      {/* 14 · cierre */}
      <Scene {...sc(14)}>
        <Svg><Hob t={t} heat={[1, 0.8, 0.6]} display="9" /></Svg>
        <Chip text="EN RESUMEN" o={chip(14)} />
        <Label x={540} y={445} text="espiral al rojo" color={K.hot} size={46} box o={late(14, "espiral")} />
        <Label x={540} y={1125} text="casi no se dilata" color={K.flow} size={48} box o={late(14, "dilata")} />
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
