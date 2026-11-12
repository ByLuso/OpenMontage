"""Limpia el logotipo de Orcave (JPEG con fondo blanco) → PNG transparente en alta resolución con los colores de marca.
Uso: python limpiar_logo.py <logo.jpg> <salida_dir>   → logo_orcave_hd.png y logo_orcave_hd_dark.png"""
import sys, numpy as np
from PIL import Image, ImageFilter
im = Image.open(sys.argv[1]).convert("RGB"); out_dir = sys.argv[2]
a = np.asarray(im).astype(float); r, g, b = a[..., 0], a[..., 1], a[..., 2]
RED = np.median(a[(r > 180) & (g < 60) & (b < 120)], axis=0); NAV = np.median(a[(b > 80) & (r < 40) & (g < 90)], axis=0)
W, H = im.size
big = np.asarray(im.resize((W * 3, H * 3), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))).astype(float)
isred = np.linalg.norm(big - RED, axis=2) < np.linalg.norm(big - NAV, axis=2)
ref = np.where(isred[..., None], RED, NAV)
t = ((255 - big) * (255 - ref)).sum(2) / ((255 - ref) ** 2).sum(2)
alpha = np.clip((t - 0.5) * 4 + 0.5, 0, 1)
o = Image.fromarray(np.dstack([ref, alpha * 255]).astype(np.uint8), "RGBA")
o = o.crop(o.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox())
o = o.resize((o.width * 2 // 3, o.height * 2 // 3), Image.LANCZOS)
c = Image.new("RGBA", (o.width + 40, o.height + 40), (0, 0, 0, 0)); c.paste(o, (20, 20)); c.save(f"{out_dir}/logo_orcave_hd.png")
d = np.asarray(c).copy(); d[np.abs(d[..., :3].astype(int) - NAV.astype(int)).sum(2) < 30, :3] = 255
Image.fromarray(d, "RGBA").save(f"{out_dir}/logo_orcave_hd_dark.png"); print("rojo", RED.round(), "azul", NAV.round(), c.size)
