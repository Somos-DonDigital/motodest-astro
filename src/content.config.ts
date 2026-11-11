import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const motos = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/motos' }),
  schema: z.object({
    nombre: z.string(),
    marca: z.enum(['fantic', 'beta', 'cfmoto', 'mitt']),
    categoria: z.string(),
    slug: z.string(),
    precio: z.number().nullable(),
    precioDesde: z.boolean().default(false),
    imagenes: z.array(z.object({ src: z.string(), color: z.string(), hex: z.string() })),
    ficha: z.record(z.string(), z.string()),
    fuenteFicha: z.string().nullable().optional(),
    destacada: z.boolean().default(false),
    orden: z.number().default(0),
  }),
});

export const collections = { motos };
