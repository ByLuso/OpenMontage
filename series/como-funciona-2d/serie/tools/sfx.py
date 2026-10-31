"""Sintetiza la biblioteca de efectos de la serie (sin derechos de terceros). Uso: python serie/tools/sfx.py"""
import numpy as np, wave
from pathlib import Path

SR = 48000
OUT = Path(__file__).resolve().parents[1] / "sfx"
rng = np.random.default_rng(7)


def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / r)


def save(name, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def tone(f, d, r=0.3, harm=(1,), a=0.003):
    n = int(SR * d); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * h * t) / (i + 1) for i, h in enumerate(harm)) * env(n, a, r)


def noise(d):
    return rng.standard_normal(int(SR * d))


def bandsweep(x, f0, f1):
    # filtro paso banda que barre de f0 a f1 (resonador de 2 polos)
    y = np.zeros_like(x); y1 = y2 = 0.0
    fs = np.geomspace(f0, f1, len(x))
    for i, v in enumerate(x):
        w = 2 * np.pi * fs[i] / SR; r = 0.97
        y0 = v * (1 - r) + 2 * r * np.cos(w) * y1 - r * r * y2
        y[i] = y0; y2, y1 = y1, y0
    return y


OUT.mkdir(exist_ok=True)
n = int(SR * 0.7); t = np.arange(n) / SR
save("whoosh", bandsweep(noise(0.7), 300, 2500) * np.sin(np.pi * t / 0.7) ** 2)
save("click", np.concatenate([noise(0.004) * 0.8, tone(2200, 0.06, 0.012)]))
save("pop", tone(420, 0.25, 0.06, (1, 2)) * np.exp(-np.arange(int(SR * .25)) / SR * 4) + np.pad(noise(0.01) * 0.4, (0, int(SR * .24))))
save("ding", tone(1318.5, 1.6, 0.6, (1, 2.01, 3.02)) + 0.6 * tone(1975.5, 1.6, 0.5, (1, 2.0)))
save("metal", tone(530, 0.9, 0.25, (1, 2.76, 5.4, 8.93)))
save("tick", tone(3000, 0.03, 0.006) + np.pad(noise(0.003) * 0.5, (0, int(SR * 0.027))))
d = 1.6; t = np.arange(int(SR * d)) / SR
save("hum", (np.sin(2 * np.pi * 100 * t) + 0.4 * np.sin(2 * np.pi * 200 * t) + 0.15 * np.sin(2 * np.pi * 300 * t)) * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.4))
save("hiss", bandsweep(noise(1.4), 4000, 6000) * np.sin(np.pi * np.arange(int(SR * 1.4)) / SR / 1.4))
b = np.zeros(int(SR * 1.2))
for k in range(9):
    s = int(rng.uniform(0, 1.0) * SR); f = rng.uniform(500, 1100); x = tone(f, 0.08, 0.03) * np.linspace(1, 0.4, int(SR * 0.08))
    x = x * np.sin(np.linspace(0, np.pi, len(x))); b[s:s + len(x)] += x[: len(b) - s]
save("bubbles", b)
save("rewind", bandsweep(noise(0.6), 3000, 400))
save("stamp", tone(90, 0.3, 0.08, (1, 1.5)) + np.pad(noise(0.02), (0, int(SR * 0.28))))
save("sting", tone(659.3, 0.9, 0.35, (1, 2)) + np.pad(tone(987.8, 0.75, 0.3, (1, 2)), (int(SR * 0.15), 0)))
print(sorted(p.name for p in OUT.glob("*.wav")))
