"""Utilidades para añadir modelos y colores oficiales al catálogo (src/content/motos)."""
import json, os, sys
sys.path.insert(0, '/home/claude/tools')
from PIL import Image
from sinfondo import procesar

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOTOS = os.path.join(RAIZ, 'src/content/motos')
ASSETS = os.path.join(RAIZ, 'src/assets/motos')

def imagen(origen, marca, nombre):
    """Recorta/quita fondo y guarda como WebP de alta calidad. Devuelve la ruta relativa."""
    os.makedirs(os.path.join(ASSETS, marca), exist_ok=True)
    tmp = f'/tmp/_img_{marca}_{nombre}.png'
    procesar(origen, tmp)
    rel = f'{marca}/{nombre}.webp'
    Image.open(tmp).save(os.path.join(ASSETS, rel), 'WEBP', quality=92, alpha_quality=100, method=4)
    return rel

def ruta(marca, categoria, slug):
    return os.path.join(MOTOS, f'{marca}-{categoria}-{slug}.json')

def guardar(d):
    p = ruta(d['marca'], d['categoria'], d['slug'])
    with open(p, 'w') as f:
        json.dump(d, f, ensure_ascii=False, indent=2); f.write('\n')
    return p

def cargar(marca, categoria, slug):
    return json.load(open(ruta(marca, categoria, slug)))
