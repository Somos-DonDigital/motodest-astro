import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';
import { marcaPorSlug, categoriaDe } from '../data/sitio';
import { urlMoto, precioTexto } from '../lib/formato';
import { imgMoto } from '../lib/imagenes';

// Índice estático para el buscador de la cabecera (con miniatura y precio).
export async function GET() {
  const motos = (await getCollection('motos')).sort((a, b) => a.data.orden - b.data.orden);
  const datos = await Promise.all(motos.map(async ({ data: m }) => ({
    n: m.nombre,
    m: marcaPorSlug(m.marca).nombre,
    c: categoriaDe(m.marca, m.categoria).nombre,
    u: urlMoto(m),
    p: precioTexto(m),
    i: m.imagenes[0] ? (await getImage({ src: imgMoto(m.imagenes[0].src), width: 160, format: 'avif' })).src : '',
  })));
  return new Response(JSON.stringify(datos), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
