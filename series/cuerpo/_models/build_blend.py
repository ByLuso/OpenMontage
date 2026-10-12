"""Blender: importa grupos (coordenadas BP3D en mm: X izq., Y post., Z arriba), une, suaviza, centra y exporta GLB (Y arriba, Z anterior).
Uso: blender -b --python build_blend.py -- groups.json out.glb anchors.json"""
import bpy, sys, json, mathutils
a = sys.argv[sys.argv.index("--") + 1:]
G = json.load(open(a[0])); out, anchors_out = a[1], a[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
S = G.get("scale", 0.02)
objs = {}
for g, d in G["groups"].items():
    before = set(bpy.data.objects)
    for f in d["files"]:
        bpy.ops.wm.obj_import(filepath=f, forward_axis="Y", up_axis="Z")
    new = [o for o in bpy.data.objects if o not in before and o.type == "MESH"]
    if not new: continue
    bpy.ops.object.select_all(action="DESELECT")
    for o in new: o.select_set(True)
    bpy.context.view_layer.objects.active = new[0]
    if len(new) > 1: bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active; o.name = g; o.data.name = g
    o.data.materials.clear()
    if d.get("box"):
        import bmesh
        (x0, y0, z0), (x1, y1, z1) = d["box"]
        bm = bmesh.new(); bm.from_mesh(o.data)
        bad = [v for v in bm.verts if not (x0 <= v.co.x <= x1 and y0 <= v.co.y <= y1 and z0 <= v.co.z <= z1)]
        bmesh.ops.delete(bm, geom=bad, context="VERTS"); bm.to_mesh(o.data); bm.free()
    bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.remove_doubles(threshold=0.01); bpy.ops.object.mode_set(mode="OBJECT")
    if d.get("remesh", 0):
        m = o.modifiers.new("r", "REMESH"); m.mode = "VOXEL"; m.voxel_size = d["remesh"]; m.use_smooth_shade = True
        bpy.ops.object.modifier_apply(modifier="r")
    if d.get("subdiv", 0):
        m = o.modifiers.new("s", "SUBSURF"); m.levels = d["subdiv"]; m.render_levels = d["subdiv"]
        bpy.ops.object.modifier_apply(modifier="s")
    if d.get("smooth", 0):
        m = o.modifiers.new("l", "LAPLACIANSMOOTH"); m.iterations = d["smooth"]; m.lambda_factor = 0.5
        bpy.ops.object.modifier_apply(modifier="l")
    if d.get("decimate", 0):
        m = o.modifiers.new("d", "DECIMATE"); m.ratio = d["decimate"]
        bpy.ops.object.modifier_apply(modifier="d")
    for p in o.data.polygons: p.use_smooth = True
    objs[g] = o
# oclusión ambiental horneada en color de vértice (surcos oscuros)
aog = [g for g, d in G["groups"].items() if d.get("ao") and g in objs]
if aog:
    sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = G.get("ao_samples", 48)
    sc.world = bpy.data.worlds.new("w")
    mat = bpy.data.materials.new("bake"); mat.use_nodes = True
    for o in objs.values():
        if not o.data.materials: o.data.materials.append(mat)
    for g in aog:
        o = objs[g]
        ca = o.data.color_attributes.new("ao", "FLOAT_COLOR", "POINT"); o.data.color_attributes.active_color = ca
        bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
        sc.render.bake.target = "VERTEX_COLORS"
        sc.world.light_settings.distance = G.get("ao_dist", 8.0)
        for x in G.get("ao_exclude", []):
            if x in objs and x != g: objs[x].hide_render = True
        bpy.ops.object.bake(type="AO")
        for x in G.get("ao_exclude", []):
            if x in objs: objs[x].hide_render = False
        gm = G.get("ao_gamma", 1.0)
        for d_ in ca.data:
            v = max(0.0, min(1.0, d_.color[0])) ** gm
            d_.color = (v, v, v, 1.0)
        print("AO", g)
# centro: bbox de los grupos indicados
cg = G.get("center_groups", list(objs))
pts = [objs[g].matrix_world @ mathutils.Vector(c) for g in cg if g in objs for c in objs[g].bound_box]
mn = mathutils.Vector([min(p[i] for p in pts) for i in range(3)]); mx = mathutils.Vector([max(p[i] for p in pts) for i in range(3)])
C = (mn + mx) / 2
for o in objs.values():
    o.data.transform(mathutils.Matrix.Translation(-C)); o.data.transform(mathutils.Matrix.Scale(S, 4))
    o.data.update()
def three(v): return [round(v.x, 4), round(v.z, 4), round(-v.y, 4)]
anch = {}
for g, o in objs.items():
    vs = [v.co for v in o.data.vertices]
    lo = mathutils.Vector([min(v[i] for v in vs) for i in range(3)]); hi = mathutils.Vector([max(v[i] for v in vs) for i in range(3)])
    cen = sum(vs, mathutils.Vector()) / len(vs)
    b0, b1 = three(lo), three(hi)
    anch[g] = {"center": three(cen), "min": [min(b0[i], b1[i]) for i in range(3)], "max": [max(b0[i], b1[i]) for i in range(3)], "verts": len(vs)}
json.dump(anch, open(anchors_out, "w"), indent=1)
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_yup=True, export_apply=True, export_normals=True,
                          export_materials="NONE", export_texcoords=False, export_vertex_color="ACTIVE", export_all_vertex_colors=False)
print("OK", {g: anch[g]["verts"] for g in anch})
