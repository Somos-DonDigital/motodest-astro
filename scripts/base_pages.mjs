// Prepara dist/ para GitHub Pages, donde la web vive dentro de una subcarpeta (BASE).
// Reescribe las rutas absolutas internas ("/fantic/...", "/galeria/...", "/buscar.json"...)
// para que apunten a BASE, añade noindex a todas las páginas y crea .nojekyll.
// Las rutas de /_astro/ ya las prefija Astro al compilar con --base.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';
const BASE = (process.env.BASE_PATH || '/motodest-astro/').replace(/\/?$/, '/');
const pre = BASE.slice(0, -1); // "/motodest-astro"

// Solo se reescriben rutas cuyo primer tramo existe en la raíz de dist (sin _astro).
const raiz = readdirSync(DIST).filter((n) => n !== '_astro' && !n.startsWith('.'));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const tramos = raiz.map(esc).join('|');
// Delimitador previo: comilla, paréntesis, espacio, coma o "=" ; delimitador posterior: / " ' ` ? # ) espacio , o fin.
const reRuta = new RegExp(`(["'\`(\\s,=])/(${tramos})(?=[/"'\`?#)\\s,]|$)`, 'g');

const NOINDEX = '<meta name="robots" content="noindex, nofollow">';

function procesar(ruta) {
  const ext = extname(ruta);
  if (!['.html', '.json', '.js', '.css', '.xml', '.webmanifest'].includes(ext)) return;
  let t = readFileSync(ruta, 'utf8');
  const antes = t;
  t = t.replace(reRuta, `$1${pre}/$2`);
  if (ext === '.html') {
    // Enlaces a la portada: href="/" y href="/#ancla"
    t = t.replace(/(href=["'])\/(["'#])/g, `$1${BASE}$2`);
    t = t.replace(/<meta name=["']robots["'][^>]*>/gi, '');
    t = t.replace(/<head([^>]*)>/i, `<head$1>${NOINDEX}`);
  }
  if (t !== antes) writeFileSync(ruta, t);
}

function recorrer(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (n !== 'galeria') recorrer(p); }
    else procesar(p);
  }
}
recorrer(DIST);
writeFileSync(join(DIST, '.nojekyll'), '');
writeFileSync(join(DIST, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log('GitHub Pages listo con base', BASE, '— tramos:', raiz.length);
