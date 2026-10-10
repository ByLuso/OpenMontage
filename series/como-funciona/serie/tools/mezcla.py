"""Mezcla de audio sin pasar por Remotion (que renderiza cada frame 3D también para el audio).
Voz + bed con ducking (0,06 con voz, 0,13 sin voz, fundido 1 s / 2 s) + efectos en sus instantes.
Uso: python serie/tools/mezcla.py <slug> <sfx.json> <salida.wav>
sfx.json: [[segundos, "nombre", volumen], ...]
"""
import json, subprocess, sys
from pathlib import Path

CF = Path(__file__).resolve().parents[2]
slug, sfx_json, out = sys.argv[1], sys.argv[2], sys.argv[3]
ep = Path(slug) if Path(slug).is_absolute() else CF / slug
pub = ep / "remotion" / "public"
tm = json.loads((ep / "artifacts" / "timing.json").read_text())
dur, vend = tm["duration"], tm["voiceEnd"]
sfx = json.loads(Path(sfx_json).read_text())
import os
duck = float(os.environ.get("MUSIC_DUCK", "0.06"))   # volumen de la música con voz
full = float(os.environ.get("MUSIC_FULL", "0.13"))   # volumen de la música sin voz
# tramos con voz (para el ducking): huecos de más de 0,5 s entre palabras suben la música
words = tm["words"]
spans, cur = [], [words[0]["s"], words[0]["e"]]
for w in words[1:]:
    if w["s"] - cur[1] > 0.5: spans.append(cur); cur = [w["s"], w["e"]]
    else: cur[1] = w["e"]
spans.append(cur)
voiced = "+".join(f"between(t,{a - 0.1:.2f},{b + 0.15:.2f})" for a, b in spans)

inputs = ["-i", str(pub / "voz.wav"), "-i", str(pub / "music.mp3")]
filt = [f"[1:a]atrim=0:{dur},volume='if(gt({voiced},0),{duck},{full})':eval=frame,afade=t=in:d=1,afade=t=out:st={dur - 2}:d=2[m]"]
mix = ["[0:a]", "[m]"]
import wave as _wave
def _len(n):
    with _wave.open(str(pub / "sfx" / f"{n}.wav")) as w:
        return w.getnframes() / w.getframerate()
# un efecto que no cabe entero antes del final sonaría cortado: se descarta
sfx = [c for c in sfx if c[0] + _len(c[1]) <= dur - 0.05]
for k, (at, name, vol) in enumerate(sfx):
    inputs += ["-i", str(pub / "sfx" / f"{name}.wav")]
    ms = int(max(0, at) * 1000)
    filt.append(f"[{k + 2}:a]volume={vol},adelay={ms}|{ms}[s{k}]")
    mix.append(f"[s{k}]")
filt.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0:duration=longest,atrim=0:{dur}[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[a]",
                "-ar", "48000", "-ac", "2", out], check=True)
print(out)
