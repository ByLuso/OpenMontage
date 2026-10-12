# Modelos anatómicos reales

Mallas de **BodyParts3D** (© The Database Center for Life Science, licencia CC BY-SA 2.1 Japan,
https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html), convertidas a GLB para three.js.

1. Descargar `partof_BP3D_4.0_obj_99.zip` y `partof_element_parts.txt` en `assets_bp3d/` y descomprimir en `raw/`.
2. `python resolve.py <organo>.json > groups.json` — agrupa las piezas por nombre FMA.
3. `blender -b --python build_blend.py -- groups.json <organo>.glb anchors.json` — une, remalla/suaviza,
   hornea oclusión ambiental en color de vértice y exporta (Y arriba, Z anterior).
4. Pulmones: BodyParts3D no trae la pleura; `lungshape.py` genera la superficie a partir del árbol bronquial
   y vascular (cascos convexos por cortes + suavizado).

Atribución obligatoria en las publicaciones: "Modelos 3D: BodyParts3D (DBCLS), CC BY-SA 2.1 JP".
