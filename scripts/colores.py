"""Detecta el color de una moto a partir de su foto (fondo blanco o transparente)."""
import colorsys, re
from PIL import Image

PALABRAS = [
    (r'(roj[ao]|red)\b', 'Rojo'), (r'azul|blue', 'Azul'), (r'verde|green', 'Verde'), (r'gris|grey|gray', 'Gris'),
    (r'negr[ao]|black', 'Negro'), (r'naranja|orange', 'Naranja'), (r'beige', 'Beige'), (r'rosa|pink', 'Rosa'),
    (r'amarill[ao]|yellow', 'Amarillo'), (r'dorad[ao]|gold', 'Dorado'), (r'blanc[ao]|white', 'Blanco'),
    (r'tierra', 'Tierra'), (r'bosque', 'Verde bosque'), (r'maletas', 'Con maletas'),
]

def nombre_por_tono(h, s, v):
    g = h * 360
    if s < 0.28: return 'Negro' if v < 0.3 else ('Gris' if v < 0.8 else 'Blanco')
    if g < 15 or g >= 340: return 'Rojo'
    if g < 40: return 'Naranja' if v > 0.55 else 'Marrón'
    if g < 65: return 'Amarillo' if s > 0.5 else 'Beige'
    if g < 165: return 'Verde'
    if g < 200: return 'Turquesa'
    if g < 255: return 'Azul'
    if g < 300: return 'Morado'
    return 'Rosa'

def _pixeles(ruta):
    im = Image.open(ruta)
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA'); fondo = Image.new('RGBA', im.size, (255, 255, 255, 255)); fondo.alpha_composite(im); im = fondo
    im = im.convert('RGB'); im.thumbnail((260, 260))
    px = [p for p in im.getdata() if min(p) < 228]
    return [(colorsys.rgb_to_hsv(*(c / 255 for c in p)), p) for p in px]

def _media(grupo):
    r, g, b = (sum(c[i] for c in grupo) // len(grupo) for i in range(3))
    return '#%02x%02x%02x' % (r, g, b)

def detectar(ruta, forzado=None):
    hsv = _pixeles(ruta)
    if not hsv: return 'Blanco', '#ffffff'
    vivos = [(h, p) for h, p in hsv if h[1] > 0.32 and h[2] > 0.28]
    if forzado:
        tono = [p for (h, s, v), p in vivos if nombre_por_tono(h, s, v) == forzado]
        if forzado in ('Negro', 'Gris', 'Blanco') or len(tono) < 40:
            neutros = [p for (h, s, v), p in hsv if s < 0.28]
            if forzado == 'Negro': tono = [p for p in neutros if max(p) < 80]
            elif forzado == 'Blanco': tono = [p for p in neutros if min(p) > 170]
            elif forzado == 'Gris': tono = [p for p in neutros if 80 <= max(p) <= 200]
        if forzado in ('Tierra', 'Beige', 'Dorado', 'Marrón'):
            tono = [p for (h, s, v), p in hsv if 0.05 < h[0] < 0.17 and h[1] > 0.18 and h[2] > 0.3] if False else [p for (hh, ss, vv), p in hsv if 0.05 < hh < 0.17 and ss > 0.18 and vv > 0.3]
        if forzado == 'Verde bosque':
            tono = [p for (hh, ss, vv), p in hsv if 0.2 < hh < 0.45 and ss > 0.15 and vv > 0.15]
        return forzado, _media(tono) if len(tono) > 20 else None
    if len(vivos) / len(hsv) > 0.015:
        cubos = {}
        for (h, s, v), p in vivos:
            cubos.setdefault(int(h * 18) % 18, []).append(p)
        grupo = max(cubos.values(), key=len)
    else:
        claros = [p for (h, s, v), p in hsv if v > 0.62]
        grupo = claros if len(claros) / len(hsv) > 0.4 else [p for (h, s, v), p in hsv if v <= 0.62]
    hx = _media(grupo)
    r, g, b = (int(hx[i:i + 2], 16) for i in (1, 3, 5))
    return nombre_por_tono(*colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)), hx

def color_de(ruta, nombre_archivo):
    for patron, n in PALABRAS:
        if re.search(patron, nombre_archivo.lower()):
            if n == 'Con maletas': return n, detectar(ruta)[1]
            nom, hx = detectar(ruta, n)
            return nom, hx or detectar(ruta)[1]
    return detectar(ruta)

# Correcciones revisadas a ojo (fragmento del nombre de archivo -> color)
MANUAL = {
    'img-cfatv1000-naranja': 'Gris', 'img-cfatv1000-azul': 'Gris oscuro',
    'img-uf800xl-t-': 'Tierra', 'img-u10proxl-g-': 'Camuflaje', 'img-u10ph-v-': 'Verde', 'img-u10ph-cmf-': 'Camuflaje',
    'img-u6ev-v-': 'Verde', 'img-u6ev-a-': 'Azul', 'img-zf1000sport-na-': 'Naranja', 'img-zf950s4-n-': 'Negro',
    'img-zf950sport-cfmoto': 'Gris', 'img-zf950sport-n-': 'Negro',
    'img-1000mt-x-cfmoto': 'Azul', 'img-1000mtx-p-': 'Blanco', 'img-1000mtx-vn-': 'Verde',
    'img-moto-125nk-': 'Azul', 'img-125nk-n-': 'Negro', 'img-moto-675nk-': 'Blanco', 'img-675nk-b-': 'Gris',
    'img-moto-675sr-r-': 'Blanco', 'img-675srr-n-': 'Negro', 'img-675srr-g-': 'Gris',
    'img-moto-700mt-': 'Negro', 'img-700mt-a-': 'Blanco', 'img-moto-800mt-explore-': 'Blanco', 'img-800mt-n-': 'Negro',
    'img-moto-800mt-x-': 'Negro', 'img-800mtx-a-': 'Azul', 'img-450mt-cfmoto': 'Negro', 'img-450mt-a-': 'Azul',
    'img-mittdesert-125-motodest': 'Negro', 'img-mitt-tt-555-maletas': 'Gris con maletas',
    'img-mitt-gt-max-125-330-avn': 'Azul', 'img-mitt-gt-max-125-330-froja': 'Rojo oscuro',
    'img-mitt-max-t-mitt-motors': 'Gris', 'img-mitt-t-rox-125-mitt-motors': 'Azul', 'img-mitt-xrs-50-125-mitt-motors': 'Negro',
    'img-mitt-gp1-125-an-': 'Amarillo', 'img-mitt-gp1-125-na-': 'Azul', 'img-mitt-gp1-125-ra-': 'Rojo',
    'img-775r-an-': 'Verde', 'img-cforce625-motodest': 'Azul', 'img-cforce1000mv-motodest': 'Rojo',
}
BASE_HEX = {'Gris oscuro': 'Gris', 'Camuflaje': 'Verde bosque', 'Gris con maletas': 'Gris', 'Rojo oscuro': 'Rojo'}

def color_final(ruta, nombre_archivo):
    for frag, nombre in MANUAL.items():
        if frag in nombre_archivo:
            _, hx = detectar(ruta, BASE_HEX.get(nombre, nombre))
            return nombre, hx or detectar(ruta)[1]
    return color_de(ruta, nombre_archivo)
