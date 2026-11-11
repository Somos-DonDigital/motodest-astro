import type { ImageMetadata } from 'astro';

const motos = import.meta.glob<{ default: ImageMetadata }>('/src/assets/motos/**/*.{webp,jpg,jpeg,png}', { eager: true });
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
