import { getCollection } from 'astro:content';
import { marcaPorSlug, categoriaDe } from '../data/sitio';
import { urlMoto } from '../lib/formato';

// Índice estático para el buscador de modelos de la cabecera.
export async function GET() {
  const motos = await getCollection('motos');
  const datos = motos
    .sort((a, b) => a.data.orden - b.data.orden)
    .map(({ data: m }) => ({ n: m.nombre, m: marcaPorSlug(m.marca).nombre, c: categoriaDe(m.marca, m.categoria).nombre, u: urlMoto(m) }));
  return new Response(JSON.stringify(datos), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
