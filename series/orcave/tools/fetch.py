"""Descarga modelos de Poly Haven (CC0) en glTF 1k con sus texturas: python fetch.py id1 id2 ..."""
import json, os, sys, urllib.request
op = urllib.request.build_opener(); op.addheaders = [("User-Agent", "OpenMontage/1.0")]; urllib.request.install_opener(op)
for mid in sys.argv[1:]:
    d = json.load(urllib.request.urlopen(f"https://api.polyhaven.com/files/{mid}"))
    g = d["gltf"]["1k"]["gltf"]; out = f"dl/{mid}"; os.makedirs(out, exist_ok=True)
    urllib.request.urlretrieve(g["url"], f"{out}/{mid}.gltf")
    for rel, inc in g.get("include", {}).items():
        os.makedirs(os.path.dirname(f"{out}/{rel}"), exist_ok=True); urllib.request.urlretrieve(inc["url"], f"{out}/{rel}")
    print("ok", mid)
