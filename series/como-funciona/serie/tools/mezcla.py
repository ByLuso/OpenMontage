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

inputs = ["-i", str(pub / "voz.wav"), "-i", str(pub / "music.mp3")]
filt = [f"[1:a]atrim=0:{dur},volume='if(lt(t,{vend}),0.06,0.13)':eval=frame,afade=t=in:d=1,afade=t=out:st={dur - 2}:d=2[m]"]
mix = ["[0:a]", "[m]"]
for k, (at, name, vol) in enumerate(sfx):
    inputs += ["-i", str(pub / "sfx" / f"{name}.wav")]
    ms = int(max(0, at) * 1000)
    filt.append(f"[{k + 2}:a]volume={vol},adelay={ms}|{ms}[s{k}]")
    mix.append(f"[s{k}]")
filt.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0:duration=longest,atrim=0:{dur}[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[a]",
                "-ar", "48000", "-ac", "2", out], check=True)
print(out)
