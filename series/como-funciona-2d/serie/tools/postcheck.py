"""Comprobaciones del vídeo final: duración 60-80 s, H.264+AAC, sincronía (5 palabras, ±0,15 s). Uso: python postcheck.py <slug>"""
import json, subprocess, sys, re, unicodedata
from pathlib import Path
ep = Path(__file__).resolve().parents[2] / sys.argv[1]; vid = ep / f"{sys.argv[1]}.mp4"
tm = json.loads((ep / "artifacts/timing.json").read_text())
pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(vid)], capture_output=True, text=True).stdout)
codecs = {s["codec_type"]: s["codec_name"] for s in pr["streams"]}; dur = float(pr["format"]["duration"])
ok = True
def check(name, c, d=""):
    global ok; ok &= bool(c); print("✅" if c else "❌", name, d)
check("H.264 + AAC", codecs.get("video") == "h264" and codecs.get("audio") == "aac", str(codecs))
check("Duración 60-80 s", 60 <= dur <= 80, f"({dur:.2f} s)")
n = lambda w: re.sub(r"[^a-z0-9ñ]", "", "".join(c for c in unicodedata.normalize("NFD", w.lower()) if unicodedata.category(c) != "Mn"))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(vid), "-vn", "-ac", "1", "-ar", "16000", "/tmp/claude-0/_pc.wav"], check=True)
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
import numpy as _np, subprocess as _sp
_pcm = _np.frombuffer(_sp.run(["ffmpeg", "-v", "error", "-i", "/tmp/claude-0/_pc.wav", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout, _np.int16).astype(_np.float32) / 32768
segs, _ = m.transcribe(_pcm, language="es", word_timestamps=True)
heard = [(n(w.word), w.start) for s in segs for w in s.words]
W = [w for w in tm["words"] if len(n(w["w"])) >= 4]; offs = []
for i in [len(W) // 10, 3 * len(W) // 10, len(W) // 2, 7 * len(W) // 10, 9 * len(W) // 10]:
    c = [h for h in heard if h[0] == n(W[i]["w"])]
    if c:
        b = min(c, key=lambda h: abs(h[1] - W[i]["s"])); offs.append(round(b[1] - W[i]["s"], 2))
        print(f"   '{W[i]['w']}': subtítulo {W[i]['s']:.2f} · audio {b[1]:.2f}")
check("Sincronía (±0,15 s)", len(offs) >= 4 and all(abs(o) <= 0.15 for o in offs), str(offs))
print(sys.argv[1], "OK" if ok else "CON AVISOS")
