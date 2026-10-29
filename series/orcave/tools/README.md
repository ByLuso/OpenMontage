# Modelos Poly Haven (CC0)

Los objetos 3D (sillones, mesa, planta, unidades exteriores de aerotermia, caja de herramientas, llave grifa) son de
[Poly Haven](https://polyhaven.com) con licencia CC0. Se descargan en `assets_ph/` (ignorado en git) desde
`https://api.polyhaven.com/files/<id>` (glTF 1k con sus texturas) y se convierten a GLB con:

    blender -b -P to_glb.py -- <entrada.gltf> <salida.glb>

Ids usados: exterior_aircon_unit, modern_arm_chair_01, modern_coffee_table_01, potted_plant_01, pipe_wrench, metal_toolbox.
Los GLB se copian a `remotion/public/` del proyecto.
