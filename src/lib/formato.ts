import type { CollectionEntry } from 'astro:content';
import { marcaPorSlug, categoriaDe } from '../data/sitio';

export type Moto = CollectionEntry<'motos'>;

export const euros = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: true }).format(n);

export const precioTexto = (m: Moto['data']) =>
  m.precio == null ? 'Consultar precio' : `${m.precioDesde ? 'Desde ' : ''}${euros(m.precio)}`;

export const urlMoto = (m: Moto['data']) => `/${m.marca}/${m.categoria}/${m.slug}/`;
export const urlCategoria = (marca: string, cat: string) => `/${marca}/${cat}/`;

export const nombreCompleto = (m: Moto['data']) => `${marcaPorSlug(m.marca).nombre} ${m.nombre}`;

// Orden y etiquetas de la ficha técnica
export const ETIQUETAS: [string, string][] = [
  ['motor', 'Motor'], ['cilindrada', 'Cilindrada'], ['potencia', 'Potencia máxima'], ['par', 'Par máximo'],
  ['cambio', 'Cambio'], ['traccion', 'Tracción'], ['alimentacion', 'Alimentación'], ['arranque', 'Arranque'],
  ['bateria', 'Batería'], ['autonomia', 'Autonomía'], ['chasis', 'Chasis'], ['suspDel', 'Suspensión delantera'],
  ['suspTras', 'Suspensión trasera'], ['suspension', 'Suspensiones'], ['frenos', 'Frenos'], ['neumaticos', 'Neumáticos'],
  ['alturaAsiento', 'Altura del asiento'], ['peso', 'Peso'], ['deposito', 'Depósito'], ['dimensiones', 'Largo x ancho x alto'],
  ['carga', 'Capacidad de carga'], ['remolque', 'Capacidad de remolque'], ['plazas', 'Plazas'],
  ['homologacion', 'Homologación'], ['equipamiento', 'Equipamiento'],
];

const TIPO: Record<string, string> = {
  'fantic/enduro': 'moto de enduro', 'fantic/caballero': 'moto scrambler', 'fantic/motard': 'supermotard',
  'fantic/motocross': 'moto de motocross', 'fantic/rally': 'moto de rally', 'beta/enduro': 'moto de enduro',
  'beta/motocross': 'moto de motocross', 'beta/trial': 'moto de trial', 'beta/motard': 'supermotard',
  'beta/alp': 'trail ligera', 'beta/minibike': 'minimoto eléctrica', 'cfmoto/motos': 'moto', 'cfmoto/atv': 'quad',
  'cfmoto/buggies': 'buggy', 'mitt/scooters': 'scooter', 'mitt/garage': 'moto custom', 'mitt/sport-touring': 'moto',
  'mitt/adventure': 'moto trail',
};

export function tipoMoto(m: Moto['data']) {
  return TIPO[`${m.marca}/${m.categoria}`] ?? 'moto';
}

/** Descripción corta y única para meta description y entradilla de la ficha. */
export function descripcionMoto(m: Moto['data']) {
  const marca = marcaPorSlug(m.marca).nombre;
  const f = m.ficha;
  const partes: string[] = [];
  if (f.cilindrada) partes.push(f.cilindrada.replace(/ \/ /g, ', '));
  if (f.potencia) partes.push(f.potencia.split(' a ')[0].replace(/^.*\((.*)\)$/, '$1'));
  if (f.peso) partes.push(f.peso.split(' (')[0]);
  const datos = partes.length ? ` (${partes.join(', ')})` : '';
  const precio = m.precio != null ? ` por ${precioTexto(m).toLowerCase()} matriculada` : '';
  return `${marca} ${m.nombre}, ${tipoMoto(m)}${datos}${precio}. Ficha técnica oficial y asesoramiento en Motodest, concesionario oficial ${marca} en Barbate (Cádiz).`;
}

export const tituloCategoria = (marca: string, cat: string) => categoriaDe(marca, cat).h1;

// Distintivo ambiental C de la DGT: motos matriculables Euro 5. Gamas de calle siempre;
// el resto, solo si la ficha lo indica. Nada en tractores (T3) ni eléctricas infantiles.
const GAMAS_CALLE = ['fantic/caballero', 'fantic/stealth', 'mitt/scooters', 'mitt/sport-touring', 'mitt/adventure', 'mitt/garage', 'cfmoto/motos'];
export function tieneEtiquetaC(m: Moto['data']): boolean {
  const norma = `${m.ficha.homologacion ?? ''} ${m.ficha.motor ?? ''}`;
  if (/T3|tractor/i.test(norma) || /el[eé]ctric/i.test(m.ficha.motor ?? '')) return false;
  return /Euro\s?5/i.test(norma) || GAMAS_CALLE.includes(`${m.marca}/${m.categoria}`);
}
