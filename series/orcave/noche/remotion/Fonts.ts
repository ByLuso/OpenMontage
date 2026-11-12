// Tipografías locales (public/fonts): Inter para titulares y subtítulos, IBM Plex Mono para la letra pequeña.
import { continueRender, delayRender, staticFile } from "remotion";

export const SANS = "InterOrcave";
export const MONO = "PlexOrcave";
const FILES: [string, string, string][] = [
  [SANS, "600", "inter-latin-600-normal"], [SANS, "800", "inter-latin-800-normal"], [SANS, "900", "inter-latin-900-normal"],
  [MONO, "400", "ibm-plex-mono-latin-400-normal"], [MONO, "500", "ibm-plex-mono-latin-500-normal"],
];
if (typeof document !== "undefined" && !(window as any).__fontsOrcave) {
  (window as any).__fontsOrcave = true;
  const h = delayRender("fuentes", { timeoutInMilliseconds: 120000 });
  Promise.all(FILES.map(([fam, w, f]) => new FontFace(fam, `url(${staticFile(`fonts/${f}.woff2`)}) format("woff2")`, { weight: w }).load().then((ff) => document.fonts.add(ff))))
    .then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
}
