"""Voz de un episodio: Gemini TTS (Puck, es-ES) en una petición -> recorte de pausas ->
tempo ~2,85 palabras/s -> -15 LUFS -> marcas por palabra (faster-whisper small + difflib).

Uso: python serie/tools/voz.py <carpeta_episodio>
Escribe <ep>/remotion/public/voz.wav y <ep>/artifacts/timing.json
"""
import difflib, json, re, subprocess, sys, unicodedata, wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT))
MODELS = ["gemini-3.8-flash-tts", "gemini-3.1-flash-tts-preview",
          "gemini-2.5-flash-preview-tts", "gemini-3.8-flash-lite-tts"]
import os
TARGET_WPS = float(os.environ.get("TARGET_WPS", "2.85"))


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9ñ]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def tts(text, out):
    from google.genai import types
    from tools.google_credentials import get_genai_client
    client = get_genai_client()
    cfg = types.GenerateContentConfig(
        response_modalities=["AUDIO"],
        speech_config=types.SpeechConfig(
            language_code="es-ES",
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Puck"))))
    for m in MODELS:
        try:
            r = client.models.generate_content(model=m, contents=text, config=cfg)
            data = r.candidates[0].content.parts[0].inline_data.data
            with wave.open(str(out), "wb") as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(data)
            print("TTS:", m)
            return
        except Exception as e:
            print("sin cupo / error en", m, str(e)[:100])
    raise SystemExit("Ningún modelo de voz disponible")


def ff(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def duration(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                          "-of", "csv=p=0", str(p)]).decode())


def words_ts(p):
    from faster_whisper import WhisperModel
    m = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = m.transcribe(str(p), language="es", word_timestamps=True)
    return [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]


def main(ep):
    ep = Path(ep)
    beats = json.loads((ep / "beats.json").read_text())
    pub = ep / "remotion" / "public"; pub.mkdir(parents=True, exist_ok=True)
    art = ep / "artifacts"; art.mkdir(exist_ok=True)
    raw = art / "voz_raw.wav"
    if not raw.exists():
        tts(" ".join(beats), raw)
    # pausas largas -> 0,4 s
    trimmed = art / "voz_trim.wav"
    ff("-i", str(raw), "-af",
       "silenceremove=stop_periods=-1:stop_duration=0.25:stop_threshold=-40dB:stop_silence=0.25", str(trimmed))
    nwords = sum(len(b.split()) for b in beats)
    tempo = max(0.85, min(1.25, TARGET_WPS / (nwords / duration(trimmed))))
    if os.environ.get("TEMPO"):
        tempo = float(os.environ["TEMPO"])  # p. ej. 1.0 = velocidad natural de la voz
    out = pub / "voz.wav"
    ff("-i", str(trimmed), "-af", f"atempo={tempo:.4f},loudnorm=I=-15:TP=-1.5:LRA=11",
       "-ar", "48000", str(out))
    print(f"tempo x{tempo:.3f}  duración {duration(out):.2f}s  {nwords / duration(out):.2f} pal/s")
    # alinear palabras del guion con la transcripción
    hyp = words_ts(out)
    script = [(bi, w) for bi, b in enumerate(beats) for w in b.split()]
    sm = difflib.SequenceMatcher(a=[norm(w) for _, w in script], b=[norm(w) for w, _, _ in hyp], autojunk=False)
    times = [None] * len(script)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            times[a + k] = (hyp[b + k][1], hyp[b + k][2])
    # interpolar huecos
    known = [i for i, t in enumerate(times) if t]
    for i, t in enumerate(times):
        if t is None:
            prev = max([k for k in known if k < i], default=None)
            nxt = min([k for k in known if k > i], default=None)
            s = times[prev][1] if prev is not None else 0.0
            e = times[nxt][0] if nxt is not None else duration(out)
            lo = prev if prev is not None else -1
            hi = nxt if nxt is not None else len(script)
            frac = (i - lo) / (hi - lo)
            st = s + (e - s) * frac
            times[i] = (st, st + 0.25)
    words = [{"beat": bi, "w": w, "s": round(t[0], 3), "e": round(t[1], 3)}
             for (bi, w), t in zip(script, times)]
    matched = len(known) / len(script)
    voice_end = words[-1]["e"]
    timing = {"words": words, "voiceEnd": voice_end, "duration": round(voice_end + 0.3 + 2.0, 2),
              "beats": [{"s": min(x["s"] for x in words if x["beat"] == i),
                         "e": max(x["e"] for x in words if x["beat"] == i)} for i in range(len(beats))]}
    (art / "timing.json").write_text(json.dumps(timing, ensure_ascii=False, indent=1))
    # Gemini TTS a veces termina con un chasquido (pico de continua): se corta tras la última palabra con fundido.
    cut = voice_end + 0.2
    tmp = art / "voz_cut.wav"
    ff("-i", str(out), "-af", f"atrim=0:{cut:.3f},afade=t=out:st={cut - 0.12:.3f}:d=0.12", str(tmp))
    tmp.replace(out)
    print(f"alineadas {matched:.0%}  duración vídeo {timing['duration']}s")
    for i, b in enumerate(timing["beats"]):
        print(i + 1, round(b["s"], 2), round(b["e"], 2), round(b["e"] - b["s"], 2))


if __name__ == "__main__":
    main(sys.argv[1])
