// Genera las versiones AVIF de la galería (rápido, effort bajo) y un manifiesto con medidas.
import sharp from 'sharp';
import { readdirSync, mkdirSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const SRC = 'galeria-fuente', OUT = 'public/galeria', ANCHOS = [400, 900, 1600];
const manifiesto = {};
const tareas = [];
for (const marca of readdirSync(SRC)) for (const modelo of readdirSync(join(SRC, marca))) for (const f of readdirSync(join(SRC, marca, modelo))) tareas.push([marca, modelo, f]);
let hechas = 0;
async function una([marca, modelo, f]) {
  const src = join(SRC, marca, modelo, f), dir = join(OUT, marca, modelo), base = f.replace(/\.\w+$/, '');
  mkdirSync(dir, { recursive: true });
  const meta = await sharp(src).metadata();
  for (const w of ANCHOS) {
    const out = join(dir, `${base}-${w}.avif`);
    if (existsSync(out) && statSync(out).mtimeMs > statSync(src).mtimeMs) continue;
    await sharp(src).resize({ width: Math.min(w, meta.width) }).avif({ quality: w <= 400 ? 50 : 55, effort: 2 }).toFile(out);
  }
  manifiesto[`${marca}/${modelo}/${f}`] = { base: `/galeria/${marca}/${modelo}/${base}`, w: meta.width, h: meta.height };
  if (++hechas % 100 === 0) console.log(hechas, '/', tareas.length);
}
const N = 2; let i = 0;
await Promise.all(Array.from({ length: N }, async () => { while (i < tareas.length) await una(tareas[i++]); }));
writeFileSync('src/data/galeria.json', JSON.stringify(manifiesto));
console.log('listo', tareas.length);
