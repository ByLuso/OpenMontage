"""Superficie pulmonar = envoltura suavizada del árbol bronquial + vasos pulmonares de cada pulmón (BP3D no trae la pleura).
Uso: python lungshape.py FMA7309 out_R.obj [dil_mm] [ero_mm]"""
import sys, re, json, numpy as np, collections
from scipy import ndimage
from skimage import measure
BP = "/home/user/OpenMontage/assets_bp3d"; R = f"{BP}/raw/partof_BP3D_4.0_obj_99"
rows = [l.rstrip("\n").split("\t") for l in open(f"{BP}/partof_element.txt")][1:]
cid, out = sys.argv[1], sys.argv[2]; dil = float(sys.argv[3]) if len(sys.argv) > 3 else 14; ero = float(sys.argv[4]) if len(sys.argv) > 4 else 6
files = sorted({f for c, n, f in rows if c == cid} - {"FJ2041", "FJ2044"})
V = []
for f in files:
    for l in open(f"{R}/{f}.obj"):
        if l.startswith("v "): V.append([float(x) for x in l.split()[1:4]])
V = np.array(V); h = 1.5
lo = V.min(0) - dil - 45; hi = V.max(0) + dil + 45
shape = np.ceil((hi - lo) / h).astype(int) + 1
from scipy.spatial import ConvexHull
from skimage.draw import polygon as poly2d
G = np.zeros(shape, bool)
idx = (V - lo) / h
for zi in range(shape[2]):
    sel = idx[np.abs(idx[:, 2] - zi) * h < 16.0][:, :2]
    if len(sel) < 8: continue
    try: hull = ConvexHull(sel)
    except Exception: continue
    P = sel[hull.vertices]; c = P.mean(0); P = c + (P - c) + (P - c) / np.linalg.norm(P - c, axis=1)[:, None] * (dil / h)
    rr, cc = poly2d(P[:, 0], P[:, 1], shape[:2]); G[rr, cc, zi] = True
F = ndimage.gaussian_filter(G.astype(np.float32), (6.0, 6.0, 14.0))
verts, faces, _, _ = measure.marching_cubes(F, 0.5)
verts = verts * h + lo
with open(out, "w") as o:
    for v in verts: o.write(f"v {v[0]:.2f} {v[1]:.2f} {v[2]:.2f}\n")
    for f in faces: o.write(f"f {f[0]+1} {f[2]+1} {f[1]+1}\n")
print(out, len(verts), "verts", V.min(0).round(0), V.max(0).round(0))
