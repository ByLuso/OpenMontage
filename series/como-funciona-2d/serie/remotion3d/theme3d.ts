// Paleta y materiales de la biblia visual v2 (serie "Cómo funciona X").
import * as THREE from "three";

export const C = {
  hot: "#FF7A1A", hotCore: "#FFB45E", warn: "#E53935",
  cold: "#35C4F0", coldCore: "#8FE6FF", flow: "#FFD23F", air: "#FFFFFF",
  bgCenter: "#0F2747", bgEdge: "#070F1E", cut: "#2A3A52",
  steel: "#AEB9C6", alu: "#D8DEE6", copper: "#C77B4A",
  darkPlastic: "#1C2635", lightPlastic: "#E9EEF3", glass: "#BFE9FF",
  porcelain: "#F4F1EC", gold: "#D9A93F",
};

type MatOpts = { clip?: THREE.Plane[]; side?: THREE.Side };

const base = (o: MatOpts) => ({ clippingPlanes: o.clip ?? [], side: o.side ?? THREE.FrontSide });

export const mats = {
  steel: (o: MatOpts = {}) => new THREE.MeshStandardMaterial({ color: C.steel, metalness: 1, roughness: 0.35, ...base(o) }),
  alu: (o: MatOpts = {}) => new THREE.MeshStandardMaterial({ color: C.alu, metalness: 1, roughness: 0.25, ...base(o) }),
  copper: (o: MatOpts = {}) => new THREE.MeshStandardMaterial({ color: C.copper, metalness: 1, roughness: 0.3, ...base(o) }),
  darkPlastic: (o: MatOpts = {}) => new THREE.MeshStandardMaterial({ color: C.darkPlastic, roughness: 0.5, ...base(o) }),
  lightPlastic: (o: MatOpts = {}) => new THREE.MeshStandardMaterial({ color: C.lightPlastic, roughness: 0.45, ...base(o) }),
  glass: (o: MatOpts = {}) => new THREE.MeshPhysicalMaterial({ color: C.glass, transmission: 0.9, ior: 1.45, roughness: 0.05, transparent: true, opacity: 0.35, ...base(o) }),
  // Caras interiores del corte: se pinta la cara trasera con este color para que la sección no se vea hueca.
  cut: (o: MatOpts = {}) => new THREE.MeshStandardMaterial({ color: C.cut, roughness: 0.9, ...base(o), side: THREE.BackSide }),
  porcelain: () => new THREE.MeshPhysicalMaterial({ color: C.porcelain, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.06, sheen: 0.3 }),
  gold: () => new THREE.MeshStandardMaterial({ color: C.gold, metalness: 1, roughness: 0.22, emissive: "#7a5410", emissiveIntensity: 0.6 }),
  emissive: (color: string, intensity = 2) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.4 }),
};
