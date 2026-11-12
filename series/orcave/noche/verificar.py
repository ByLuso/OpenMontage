"""Transcribe un audio/vídeo con faster-whisper y lo compara con el guion (beats.json)."""
import difflib, json, re, sys, unicodedata
from faster_whisper import WhisperModel
norm = lambda s: re.sub(r"[^a-z0-9ñ ]", "", "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn"))
beats = json.load(open(sys.argv[1])); ref = " ".join(b["text"] if isinstance(b, dict) else b for b in (beats["beats"] if isinstance(beats, dict) else beats))
segs, _ = WhisperModel("small", compute_type="int8").transcribe(sys.argv[2], language="es")
segs = list(segs); hyp = " ".join(s.text for s in segs)
a, b = norm(ref).split(), norm(hyp).split()
sm = difflib.SequenceMatcher(None, a, b)
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op != "equal": print("  ", op, " ".join(a[i1:i2]), "->", " ".join(b[j1:j2]))
print(f"similitud {sm.ratio():.3f} · final: {segs[-1].text.strip()!r} ({segs[-1].end:.2f}s)")
