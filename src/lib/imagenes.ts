import type { ImageMetadata } from 'astro';

const motos = import.meta.glob<{ default: ImageMetadata }>('/src/assets/motos/**/*.{webp,jpg,jpeg,png}', { eager: true });
import galeriaManifiesto from '../data/galeria.json';
const sitio = import.meta.glob<{ default: ImageMetadata }>('/src/assets/site/**/*.{webp,jpg,jpeg,png}', { eager: true });

export function imgMoto(ruta: string): ImageMetadata {
  const m = motos[`/src/assets/motos/${ruta}`];
  if (!m) throw new Error(`Falta la imagen de moto: ${ruta}`);
  return m.default;
}

export function imgSitio(clave: string): ImageMetadata {
  const k = Object.keys(sitio).find((p) => p.replace(/\.[a-z]+$/, '').endsWith(`/site/${clave}`) || p.replace(/\.[a-z]+$/, '').endsWith(`/site/cat/${clave}`));
  if (!k) throw new Error(`Falta la imagen del sitio: ${clave}`);
  return sitio[k].default;
}

export type FotoGaleria = { base: string; w: number; h: number };
// Las fotos de galería se generan ya en AVIF (scripts/galeria_avif.mjs) en 400, 900 y 1600 px.
export function imgGaleria(ruta: string): FotoGaleria {
  const m = (galeriaManifiesto as Record<string, FotoGaleria>)[ruta];
  if (!m) throw new Error(`Falta la foto de galería: ${ruta}`);
  return m;
}
export const srcsetGaleria = (f: FotoGaleria) => {
  const vistos = new Set<number>();
  return [400, 900, 1600].map((w) => [w, Math.min(w, f.w)] as const).filter(([, r]) => !vistos.has(r) && vistos.add(r)).map(([w, r]) => `${f.base}-${w}.avif ${r}w`).join(', ');
};
