# Orcave · válvulas del patinillo (versión nocturna)

Vídeo vertical 9:16 de ~76 s. Estética nocturna inspirada en explicadores 3D de TikTok: edificio en corte de noche,
salones amueblados con lámparas cálidas, maniquí articulado, oclusión ambiental (N8AO) + bloom + viñeta, y rótulos
sobrios (Inter + IBM Plex Mono).

**Restaurar** (desde la raíz del repo):
```bash
mkdir -p projects/orcave/noche && cp -r series/orcave/noche/* projects/orcave/noche/ && cp series/orcave/noche/verificar.py projects/orcave/
P=projects/orcave/noche/remotion/public; mkdir -p $P/fonts $P/sfx; cp series/como-funciona/serie/sfx/*.wav $P/sfx/
# modelos Poly Haven (CC0) → GLB centrados (gltf-transform)
mkdir -p assets_ph && cd assets_ph && python3 ../series/orcave/tools/fetch.py exterior_aircon_unit modern_coffee_table_02 mid_century_lounge_chair \
  modern_wooden_cabinet desk_lamp_arm_01 potted_plant_02 side_table_01 modern_ceiling_lamp_01 metal_toolbox pipe_wrench
npm i --prefix ./gt @gltf-transform/cli@4.1.1; for d in dl/*/; do id=$(basename $d); ./gt/node_modules/.bin/gltf-transform copy $d/$id.gltf /tmp/$id.glb && \
  ./gt/node_modules/.bin/gltf-transform center /tmp/$id.glb ../$P/$id.glb --pivot below; done
# fuentes: @fontsource/inter (600/800/900) e @fontsource/ibm-plex-mono (400/500) → $P/fonts/
# voz: TEMPO=1.0 python3 series/como-funciona/serie/tools/voz.py projects/orcave/noche  (luego duration=76 en timing.json)
# música: python3 series/orcave/tools/musica_lyria.py <salida.wav> 82  → normalizar a $P/music.mp3
# logotipo: python3 series/orcave/tools/limpiar_logo.py <logo.jpg> $P
```
Pasos: `bash montar.sh stage`, `stills t…`, `render [desde hasta sufijo]`, `cover`, `audio`, `final`.
Requiere en remotion-composer: `@react-three/postprocessing@2.16.6 postprocessing@6.36.4 n8ao@1.9.4`.
