// Capturas de un episodio: empaqueta una vez y renderiza los segundos pedidos.
// Uso (desde remotion-composer): node ../projects/como-funciona/serie/tools/stills.mjs <slug> <CompId> <escala> <debug 0|1> <outDir> t1 t2 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [slug, compId, scale, debug, outDir, ...times] = process.argv.slice(2);
const root = path.resolve("projects", `cf-${slug}`);
const pub = process.env.PUB ? path.resolve(process.env.PUB) : path.resolve("..", "projects", "como-funciona", slug, "remotion", "public");
const timing = JSON.parse(fs.readFileSync(path.join(root, "timing.json"), "utf8"));
const inputProps = { timing, quality: "draft", debug: debug === "1", dpr: 0.7 };
const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: path.join(root, "index.tsx"), publicDir: pub });
console.log(`bundle ${((Date.now() - t0) / 1000).toFixed(1)}s`);
const comp = await selectComposition({ serveUrl, id: compId, inputProps, chromiumOptions: { gl: "swangle" } });
fs.mkdirSync(outDir, { recursive: true });
for (const ts of times) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(parseFloat(ts) * 30));
  const s = Date.now();
  await renderStill({ serveUrl, composition: comp, frame, inputProps, scale: parseFloat(scale), chromiumOptions: { gl: "swangle" },
    output: path.join(outDir, `t${String(frame).padStart(5, "0")}.png`) });
  console.log(`t=${ts}s frame ${frame}: ${((Date.now() - s) / 1000).toFixed(2)}s`);
}
