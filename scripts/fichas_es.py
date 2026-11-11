"""Normaliza fichas técnicas oficiales en español (etiqueta: valor) a los campos del catálogo."""
import re

MAPA = [
    (r'^(tipo de motor|motor|tipo)$', 'motor'),
    (r'^cilindrada$', 'cilindrada'),
    (r'^(potencia( m[aá]x(ima|\.)?)?( medida)?|pot\. m[aá]x\. medida|potencia m[aá]x)$', 'potencia'),
    (r'^(par( motor)?( m[aá]ximo)?|torque m[aá]ximo|par m[aá]x|par motor m[aá]ximo)$', 'par'),
    (r'^(transmisi[oó]n|marchas|cambio|embrague y cambio|caja de cambios)$', 'cambio'),
    (r'^(tracci[oó]n|drive|conducci[oó]n)$', 'traccion'),
    (r'^(alimentaci[oó]n|sistema de alimentaci[oó]n|sistema de combustible|suministro de combustible)$', 'alimentacion'),
    (r'^arranque$', 'arranque'),
    (r'^bater[ií]a$', 'bateria'),
    (r'^autonom[ií]a$', 'autonomia'),
    (r'^(chasis|bastidor)$', 'chasis'),
    (r'^(suspensi[oó]n delantera|suspensi[oó]n frontal|horquilla)$', 'suspDel'),
    (r'^(suspensi[oó]n trasera|amortiguador trasero)$', 'suspTras'),
    (r'^(suspensi[oó]n|amortiguadores)$', 'suspension'),
    (r'^(frenos?|sistema de frenos)$', 'frenos'),
    (r'^(neum[aá]ticos|ruedas)$', 'neumaticos'),
    (r'^altura (del |de )?asiento$', 'alturaAsiento'),
    (r'^(peso( en vac[ií]o| en orden de marcha| en seco)?|peso en vacio)$', 'peso'),
    (r'^(dep[oó]sito|capacidad (del |de )?(dep[oó]sito( de combustible)?|combustible)|capacidad combustible)$', 'deposito'),
    (r'^(largo x ancho x alt(o|ura)|longitud / ancho / alto|dimensiones)$', 'dimensiones'),
    (r'^(capacidad de carga( [uú]til)?)$', 'carga'),
    (r'^capacidad de remolque$', 'remolque'),
    (r'^plazas$', 'plazas'),
    (r'^homologaci[oó]n$', 'homologacion'),
]

def campo(etq):
    e = etq.strip().lower().rstrip(':').strip()
    for pat, c in MAPA:
        if re.match(pat, e):
            return c
    return None

def limpiar(v):
    v = re.sub(r'\s+', ' ', v).strip().strip('|').strip()
    v = v.replace('CC', 'cc')
    v = re.sub(r'(\d)x(\d{3}) rpm', r'\1.\2 rpm', v)  # erratas tipo 9x250
    return v[:1].upper() + v[1:] if v else v

def normalizar(pares):
    """pares: lista de (etiqueta, valor). Junta frenos/neumáticos delantero+trasero."""
    f, extra = {}, {}
    for etq, val in pares:
        e = etq.strip().lower()
        val = limpiar(val)
        if not val:
            continue
        if re.match(r'^(freno|frenos) (delantero|delanteros)$', e): extra['fd'] = val; continue
        if re.match(r'^(freno|frenos) (trasero|traseros)$', e): extra['ft'] = val; continue
        if re.match(r'^(neum[aá]tico|neum[aá]ticos|rueda) (delantero|delanteros|delantera)$', e): extra['nd'] = val; continue
        if re.match(r'^(neum[aá]tico|neum[aá]ticos|rueda) (trasero|traseros|trasera)$', e): extra['nt'] = val; continue
        if e == 'abs': extra['abs'] = val; continue
        if e in ('longitud',): extra['largo'] = val; continue
        c = campo(etq)
        if c and c not in f:
            f[c] = val
    if 'frenos' not in f and ('fd' in extra or 'ft' in extra):
        f['frenos'] = ' / '.join(x for x in (extra.get('fd'), extra.get('ft')) if x)
    if 'abs' in extra and 'frenos' in f and 'ABS' not in f['frenos']:
        f['frenos'] += f". ABS: {extra['abs']}"
    if 'neumaticos' not in f and ('nd' in extra or 'nt' in extra):
        f['neumaticos'] = ' / '.join(x for x in (extra.get('nd'), extra.get('nt')) if x)
    if 'cambio' in f and re.fullmatch(r'\d+', f['cambio']):
        f['cambio'] = f"{f['cambio']} velocidades"
    if 'deposito' in f:
        f['deposito'] = re.sub(r'^capacidad\s*', '', f['deposito'], flags=re.I)
        f['deposito'] = f['deposito'][:1].upper() + f['deposito'][1:]
    return f
