"""Genera src/content/motos/*.json a partir de:
- docs/inventario-wordpress.json  (modelos, categorías e imágenes de la web antigua)
- docs/fichas/<marca>.json         (fichas técnicas oficiales)
- PRECIOS (abajo)                  (PVP matriculada de la tarifa de Motodest, noviembre 2026)

Uso: python3 -I scripts/generar_catalogo.py <carpeta_imagenes_wp>
Las imágenes se copian a src/assets/motos/ (Astro las optimiza en el build).
"""
import json, os, re, shutil, sys, unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WP = sys.argv[1] if len(sys.argv) > 1 else os.path.join(RAIZ, '..', 'wp-media')

MARCAS = {'Fantic': 'fantic', 'Beta': 'beta', 'CFMOTO': 'cfmoto', 'MITT': 'mitt'}
CATEGORIAS = {
    ('fantic', 'Rally'): 'rally', ('fantic', 'Enduro'): 'enduro', ('fantic', 'Caballero'): 'caballero',
    ('fantic', 'Motard'): 'motard', ('fantic', 'Motocross'): 'motocross',
    ('beta', 'Enduro'): 'enduro', ('beta', 'MX'): 'motocross', ('beta', 'Trial'): 'trial',
    ('beta', 'Motard'): 'motard', ('beta', 'ALP'): 'alp', ('beta', 'Minibike'): 'minibike',
    ('cfmoto', 'Motos'): 'motos', ('cfmoto', 'ATV'): 'atv', ('cfmoto', 'Buggies'): 'buggies',
    ('mitt', 'Scooters'): 'scooters', ('mitt', 'Garage'): 'garage',
    ('mitt', 'Sport / Touring'): 'sport-touring', ('mitt', 'Adventure'): 'adventure',
}

# Correcciones de nombre (nombre en la web antigua -> nombre real)
RENOMBRAR = {('beta', 'RX 300 2T'): 'RX 350 2T'}
# Modelos que no existen (no están ni en la gama oficial ni en la tarifa)
QUITAR = {('beta', 'Xtrainer 250'), ('cfmoto', 'UFORCE 1000')}
# Imágenes equivocadas que se quitan
QUITAR_IMG = {
    '2026/01/img-xmf-125-verde-motard-fantic-motodest.webp': {('fantic', 'XEF 125 Competition')},
    '2026/02/IMG-MITT-LEGEND-125-MITT-GARAGE-MOTORS-MOTODEST-scaled.webp': {('mitt', '808')},
}

# PVP matriculada (tarifa Motodest nov. 2026). desde=True cuando agrupa versiones.
PRECIOS = {
    'fantic': {'XEF 125 Performance': 5399, 'XEF 125 Competition': 6199, 'XE 50 Performance': 4149,
               'XE 50 Competition': 4649, 'XEF 250 2026': 10949, 'XEF 310 2026': 11299, 'XEF 450 2026': 12149,
               'XE 125 2026': 10249, 'XE 300 2026': 11199, 'Caballero Scrambler 700': 9299,
               'Caballero Deluxe 700': 9299, 'Caballero Travel 700': 9799, 'Caballero Scrambler 500': 7399,
               'Caballero Deluxe 500': 7599, 'Caballero Rally 500': 7899, 'Caballero Deluxe 125': 5999,
               'Caballero Scrambler 125': 5899, 'Caballero Rally 125': 6299, 'XM 50 Competition': 4649,
               'XM 50 Performance': 4149, 'XMF 125 Competition': 6199, 'XMF 125 Performance': 5399,
               'XXF 250 2026': 10649, 'XXF 450 2026': 11549, 'XX 125 2026': 8949, 'XX 250 2026': 9899},
    'beta': {'RR 4T 125 Enduro T X Special Edition': 5699, 'RR 4T 125 R': 6099, 'RR 4T 125 T': 5699,
             'RR X-Pro 2T 125': 9699, 'RR X-Pro 2T 200': 9999, 'RR X-Pro 2T 250/300': 9849,
             'RR X-Pro 4T 350/390/430/480': (11099, True), 'RR Race 2T 125': 10349, 'RR Race 2T 200': 10649,
             'RR Race 2T 250': 10549, 'RR Race 4T 350/390/430/480': 11549, 'Xtrainer 300': 7999,
             'RR 2T 50': 4149, 'RR 2T 50 Sport': 4599, 'RR 50 Race': 5049, 'RX 350 2T': 9849,
             'RX 250 2T': 10199, 'RX 450 4T': 11499, 'EVO 4T 300': 8449, 'EVO Factory 2T 125/250/300': (8649, True),
             'EVO Factory 4T 300': 9549, 'EVO 80 Junior': 4299, 'EVO 80 Senior': 4649,
             'RR 125 4T Motard T X Special Edition': 5699, 'RR Motard 125 T 4T': 5699, 'RR Motard 125 R': 6099,
             'RR Motard 2T 50': 4049, 'RR SPM Motard 2T 50 Sport': 4299, 'RR SPM Motard 2T 50 Track': 4799,
             'ALP 4.0': 7249, 'ALP X': 7249, 'Minitrial Electric 16"': 1759, 'Minitrial Electric 20"': 2099,
             'Minitrial Electric 20" XL': 3459, 'Minicross E 36V': 1899, 'Minicross E 48V': 2349},
    'cfmoto': {'450MT': 6799, '700MT': 7499, '800MT-X': 10499, '800MT Explore': 11499, '125NK': 4199,
               '675SR-R': 8299, '675NK': (6495, True), 'CFORCE 1000 MV': 14299, 'CFORCE 520S': 6899, 'CFORCE 520L': 7599,
               'CFORCE 625': 8199, 'CFORCE 850 Touring': 11799, 'CFORCE 1000 Touring': 13599,
               'CFORCE 1000 Overland': 14599, 'ZFORCE 950 Sport': 17299, 'ZFORCE 1000 Sport-R': 19299,
               'ZFORCE 950 Sport 4': 19799, 'UFORCE U6 EV': 19299, 'UFORCE U10 Pro & Highland': (20299, True),
               'UFORCE U10 Pro XL': 21299, 'UFORCE 600': 13299, 'UFORCE 800XL': 17299},
    'mitt': {'XRS 125': 2599, 'RT 125': 2499, 'T-ROX 125': 3399, 'MAX-T 125': 2999, 'City Vision 125': 2599,
             'ADV 125': 3499, 'ADV Extreme 125': 3999, 'GTS 125': 2599, 'Urban 125': 2399,
             'GT-MAX 125/330': (3499, True), 'Ibiza 125': 2799, 'Legend 125': 3099, '808': 8299,
             '808 Traveler': 12299, '808 Big Foot': 9299, 'NK 125 Brembo': 3499, 'NK 125': 3399,
             'GP1 125': 4099, 'GP2 125': 3799, '775R': 7799, 'GT-K': 11299, 'Desert 125': 3799, 'TT 555': 6999},
}
# Nombres del inventario que en la ficha oficial se llaman distinto
ALIAS_FICHA = {('mitt', 'NK 125 Brembo'): 'NK 125 Brembo'}

DESTACADAS = {('fantic', 'Caballero Scrambler 700'), ('fantic', 'XEF 250 2026'), ('beta', 'RR X-Pro 4T 350/390/430/480'),
              ('beta', 'ALP X'), ('cfmoto', '675SR-R'), ('cfmoto', '800MT Explore'),
              ('cfmoto', 'CFORCE 1000 Overland'), ('mitt', '775R')}

RENOMBRAR_INV = {('mitt', 'NK 125 Brembo'): 'NK 125 Brembo', ('mitt', 'Desert 125'): 'Desert 125'}


def slug(t):
    t = unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode()
    t = t.lower().replace('&', 'y').replace('"', '-pulgadas').replace('/', '-')
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', t)).strip('-')


def main():
    inv = json.load(open(os.path.join(RAIZ, 'docs/inventario-wordpress.json')))
    out_dir = os.path.join(RAIZ, 'src/content/motos')
    img_dir = os.path.join(RAIZ, 'src/assets/motos')
    shutil.rmtree(out_dir, ignore_errors=True); os.makedirs(out_dir)
    os.makedirs(img_dir, exist_ok=True)
    avisos, n = [], 0
    for m in inv['marcas']:
        marca = MARCAS[m['marca']]
        fichas = json.load(open(os.path.join(RAIZ, f'docs/fichas/{marca}.json')))
        for orden_cat, c in enumerate(m['categorias']):
            cat = CATEGORIAS[(marca, c['nombre'])]
            for orden, (nombre, _precio_viejo, imgs) in enumerate(c['modelos']):
                if (marca, nombre) in QUITAR:
                    avisos.append(f'QUITADO {marca} {nombre}'); continue
                nombre = RENOMBRAR.get((marca, nombre), nombre)
                ficha = dict(fichas.get(ALIAS_FICHA.get((marca, nombre), nombre)) or {})
                if not ficha:
                    avisos.append(f'SIN FICHA {marca} {nombre}')
                fuente = ficha.pop('url', None); aviso = ficha.pop('_aviso', None); ficha.pop('pvp', None)
                if aviso: avisos.append(f'AVISO {marca} {nombre}: {aviso}')
                p = PRECIOS[marca].get(nombre)
                precio, desde = (p if isinstance(p, tuple) else (p, False))
                if precio is None: avisos.append(f'SIN PRECIO {marca} {nombre}')
                imagenes = []
                for i in imgs:
                    if (marca, nombre) in QUITAR_IMG.get(i, set()): continue
                    if i in QUITAR_IMG and (marca, nombre) not in QUITAR_IMG[i] and False: continue
                    base = os.path.basename(i)
                    ext = os.path.splitext(base)[1].lower().replace('jpeg', 'jpg')
                    destino = f'{marca}/{slug(os.path.splitext(base)[0])}{ext}'
                    os.makedirs(os.path.join(img_dir, marca), exist_ok=True)
                    shutil.copyfile(os.path.join(WP, i), os.path.join(img_dir, destino))
                    imagenes.append(destino)
                if not imagenes: avisos.append(f'SIN FOTO {marca} {nombre}')
                s = slug(nombre)
                data = {'nombre': nombre, 'marca': marca, 'categoria': cat, 'slug': s,
                        'precio': precio, 'precioDesde': desde, 'imagenes': imagenes, 'ficha': ficha,
                        'fuenteFicha': fuente, 'destacada': (marca, nombre) in DESTACADAS,
                        'orden': orden_cat * 100 + orden}
                json.dump(data, open(os.path.join(out_dir, f'{marca}-{cat}-{s}.json'), 'w'), ensure_ascii=False, indent=2)
                n += 1
    print(n, 'modelos generados')
    print('\n'.join(avisos))


if __name__ == '__main__':
    main()
