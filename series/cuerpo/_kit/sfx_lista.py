"""Genera artifacts/sfx.json de un vídeo a partir de una lista de señales (tiempo o palabra) y comprueba que nada quede cortado.
Uso: python sfx_lista.py <organo> '<json de señales>'  — cada señal: [tiempo|[bloque,"palabra",desfase], "efecto", volumen]"""
import json, sys, unicodedata, re, wave
org, spec = sys.argv[1], json.loads(sys.argv[2])
tm = json.load(open(f"{org}/artifacts/timing.json"))
norm = lambda w: re.sub(r"[^a-z0-9ñ]", "", "".join(c for c in unicodedata.normalize("NFD", w.lower()) if unicodedata.category(c) != "Mn"))
def at(x):
    if isinstance(x, (int, float)): return float(x)
    b, w, off = x
    for k in tm["words"]:
        if k["beat"] == b - 1 and norm(k["w"]).startswith(norm(w)): return k["s"] + off
    raise SystemExit(f"palabra no encontrada: {x}")
out = []
for t, name, vol in spec:
    tt = at(t)
    with wave.open(f"{org}/remotion/public/sfx/{name}.wav") as w: L = w.getnframes() / w.getframerate()
    if tt + L <= tm["duration"] - 0.05: out.append([round(tt, 3), name, vol])
    else: print("descartado (no cabe):", name, round(tt, 2))
json.dump(out, open(f"{org}/artifacts/sfx.json", "w")); print(org, len(out), "efectos")
