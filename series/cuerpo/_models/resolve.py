"""Resuelve grupos de piezas BodyParts3D → lista de ficheros OBJ por grupo.
Uso: python resolve.py spec.json > groups.json
spec: {"groups": {"nombre": {"ids": ["FMA..."], "match": "regex opcional sobre el nombre específico", "exclude": "regex"}}}"""
import json, re, sys, collections
BP = "/home/user/OpenMontage/assets_bp3d"
R = f"{BP}/raw/partof_BP3D_4.0_obj_99"
rows = [l.rstrip("\n").split("\t") for l in open(f"{BP}/partof_element.txt")][1:]
by_c = collections.defaultdict(set); name = {}
for c, n, f in rows: by_c[c].add(f); name[c] = n
spec_c = {}
for c, fs in by_c.items():
    for f in fs:
        if f not in spec_c or len(by_c[c]) < len(by_c[spec_c[f]]): spec_c[f] = c
spec = json.load(open(sys.argv[1]))
used, out = set(), {}
for g, d in spec["groups"].items():
    files = []
    for cid in d.get("ids", []):
        for f in sorted(by_c[cid]):
            nm = name[spec_c[f]]
            if f in used or f in spec.get("skip", []): continue
            if "match" in d and not re.search(d["match"], nm, re.I): continue
            if "exclude" in d and re.search(d["exclude"], nm, re.I): continue
            used.add(f); files.append(f"{R}/{f}.obj")
    for p in d.get("files", []): files.append(p)
    out[g] = {**{k: v for k, v in d.items() if k not in ("ids", "match", "exclude", "files")}, "files": files}
    print(g, len(files), file=sys.stderr)
json.dump({**{k: v for k, v in spec.items() if k != "groups"}, "groups": out}, sys.stdout)
