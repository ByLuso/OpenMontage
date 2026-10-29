import bpy, sys, re, mathutils
a = sys.argv[sys.argv.index("--") + 1:]; src, out = a[0], a[1]; excl = a[2] if len(a) > 2 else ""
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
for o in list(bpy.data.objects):
    if excl and re.search(excl, o.name, re.I): bpy.data.objects.remove(o, do_unlink=True)
ms = [o for o in bpy.data.objects if o.type == "MESH"]
pts = [o.matrix_world @ mathutils.Vector(c) for o in ms for c in o.bound_box]
mn = mathutils.Vector([min(p[i] for p in pts) for i in range(3)]); mx = mathutils.Vector([max(p[i] for p in pts) for i in range(3)])
print("OBJS", [o.name for o in ms]); print("SIZE(m) x,y(depth),z(up)", [round(v, 3) for v in (mx - mn)])
# centrar en X/Y y apoyar en el suelo (Z=0 en Blender = Y=0 en glTF)
off = mathutils.Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z))
for o in bpy.data.objects:
    if o.parent is None: o.location -= off
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_image_format="JPEG", export_jpeg_quality=85)
