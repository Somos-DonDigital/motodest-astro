import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';
import { MARCAS, EMPRESA, FINANCIACION } from '../data/sitio';
import { urlMoto, precioTexto } from '../lib/formato';
import { imgMoto } from '../lib/imagenes';

// Datos para el asistente de la web: catálogo resumido, empresa y financiación.
const num = (s?: string) => { const m = s?.replace(/\./g, '').match(/(\d+(?:,\d+)?)/); return m ? Number(m[1].replace(',', '.')) : null; };

export async function GET() {
  const motos = (await getCollection('motos')).sort((a, b) => a.data.orden - b.data.orden);
  const lista = await Promise.all(motos.map(async ({ data: m }) => {
    const marca = MARCAS.find((x) => x.slug === m.marca)!;
    const cat = marca.categorias.find((c) => c.slug === m.categoria)!;
    const cv = m.ficha.potencia ? (m.ficha.potencia.match(/(\d+(?:,\d+)?)\s*CV/i)?.[1] ?? null) : null;
    const kw = m.ficha.potencia ? (m.ficha.potencia.match(/(\d+(?:,\d+)?)\s*kW/i)?.[1] ?? null) : null;
    return {
      n: m.nombre, m: marca.nombre, ms: m.marca, c: cat.nombre, cs: m.categoria, u: urlMoto(m),
      p: m.precio, pt: precioTexto(m),
      cc: num(m.ficha.cilindrada), cv: cv ? Number(cv.replace(',', '.')) : kw ? Math.round(Number(kw.replace(',', '.')) * 1.36) : null,
      col: m.imagenes.map((i) => i.color),
      i: m.imagenes[0] ? (await getImage({ src: imgMoto(m.imagenes[0].src), width: 240, format: 'avif' })).src : '',
    };
  }));
  const datos = {
    motos: lista,
    marcas: MARCAS.map((m) => ({ s: m.slug, n: m.nombre, cats: m.categorias.map((c) => ({ s: c.slug, n: c.nombre })) })),
    empresa: { tel: EMPRESA.telefono, telv: EMPRESA.telefonoVisible, wa: EMPRESA.whatsapp, dir: `${EMPRESA.direccion.calle}, ${EMPRESA.direccion.cp} ${EMPRESA.direccion.localidad} (${EMPRESA.direccion.provincia})`, horario: EMPRESA.horario, mapa: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Motodest ${EMPRESA.direccion.calle} ${EMPRESA.direccion.localidad}`)}` },
    fin: { tin: FINANCIACION.tin, tae: FINANCIACION.tae, com: FINANCIACION.comisionApertura, plazos: FINANCIACION.plazos, def: FINANCIACION.plazoPorDefecto, ok: FINANCIACION.confirmado },
  };
  return new Response(JSON.stringify(datos), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
