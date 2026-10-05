"""Hoja de contacto: python serie/tools/sheet.py <dir> <salida> [columnas]. Genera <salida>_0.png, ..."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw
d, out = Path(sys.argv[1]), sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
ims = sorted(d.glob("*.png"))
per = cols * 2
for k in range(0, len(ims), per):
    batch = [Image.open(p) for p in ims[k:k + per]]
    w, h = batch[0].size
    sheet = Image.new("RGB", (w * cols, h * ((len(batch) + cols - 1) // cols)), "black")
    dr = ImageDraw.Draw(sheet)
    for i, (im, p) in enumerate(zip(batch, ims[k:k + per])):
        x, y = (i % cols) * w, (i // cols) * h
        sheet.paste(im, (x, y)); dr.text((x + 6, y + 6), f"{int(p.stem[1:]) / 30:.1f}s", fill="yellow")
    sheet.save(f"{out}_{k // per}.png")
    print(f"{out}_{k // per}.png")
