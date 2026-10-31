"""artifacts/cues.json ([[beat, "palabra", "efecto", volumen], ...], beat 1-based) -> [[segundos, efecto, volumen]]."""
import json, sys, re, unicodedata
from pathlib import Path
ep = Path(__file__).resolve().parents[2] / sys.argv[1]
tm = json.loads((ep / "artifacts/timing.json").read_text())
n = lambda w: re.sub(r"[^a-z0-9ñ]", "", "".join(c for c in unicodedata.normalize("NFD", w.lower()) if unicodedata.category(c) != "Mn"))
f = ep / "artifacts/cues.json"
cues = json.loads(f.read_text()) if f.exists() else []
out = [[0.05, "whoosh", 0.35]]
for b, w, name, vol in cues:
    x = next((k for k in tm["words"] if k["beat"] == b - 1 and n(k["w"]).startswith(n(w))), None)
    s = x["s"] if x else tm["beats"][b - 1]["s"]
    out.append([round(s, 3), name, vol])
out.append([tm["voiceEnd"] + 0.3, "sting", 0.35])
print(json.dumps(out))
