"""timing.json provisional (sin voz) a 2,85 palabras/s con pausas de 0,35 s entre beats. Uso: python3 serie/tools/fake_timing.py <slug>"""
import json, sys
from pathlib import Path
ep = Path(__file__).resolve().parents[2] / sys.argv[1]
beats = json.loads((ep / "beats.json").read_text())
t = 0.0; words = []; B = []
for bi, b in enumerate(beats):
    s0 = t
    for w in b.split():
        d = 0.12 + 0.036 * len(w)
        words.append({"beat": bi, "w": w, "s": round(t, 3), "e": round(t + d, 3)}); t += d + 0.03
        if w[-1] in ",:;": t += 0.15
    B.append({"s": round(s0, 3), "e": round(t, 3)}); t += 0.45
ve = words[-1]["e"]
tm = {"words": words, "voiceEnd": ve, "duration": round(ve + 2.3, 2), "beats": B}
for d in (ep / "remotion", ep / "artifacts"):
    d.mkdir(parents=True, exist_ok=True); (d / ("timing.json" if d.name == "remotion" else "timing_fake.json")).write_text(json.dumps(tm, ensure_ascii=False))
print(f"duración provisional {tm['duration']} s")
