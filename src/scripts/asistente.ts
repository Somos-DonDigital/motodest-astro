// Asistente "Dest" de Motodest. Todo ocurre en el navegador: entiende preguntas habituales
// (modelos, precios, carnet, financiación, horario, dirección, servicios) con reglas y el
// catálogo de /asistente.json. Si no entiende algo, ofrece WhatsApp, teléfono o que le llamemos.
import { gsap } from 'gsap';

type Moto = { n: string; m: string; ms: string; c: string; cs: string; u: string; p: number | null; pt: string; cc: number | null; cv: number | null; col: string[]; i: string };
type Datos = {
  motos: Moto[];
  marcas: { s: string; n: string; cats: { s: string; n: string }[] }[];
  empresa: { tel: string; telv: string; wa: string; dir: string; horario: { dias: string; horas: string }[]; mapa: string };
  fin: { tin: number; plazos: number[]; def: number; ok: boolean };
};
type Chip = { t: string; a?: string; url?: string; wa?: boolean };
type Msg = { de: 'bot' | 'yo'; html: string; motos?: Moto[] };

const raiz = document.querySelector<HTMLElement>('[data-asis]');
if (raiz) iniciar(raiz);

function iniciar(raiz: HTMLElement) {
  const $ = <T extends Element>(s: string) => raiz.querySelector<T>(s)!;
  const panel = $<HTMLElement>('[data-panel]');
  const abrirBtn = $<HTMLButtonElement>('[data-abrir]');
  const lista = $<HTMLElement>('[data-mensajes]');
  const chipsEl = $<HTMLElement>('[data-chips]');
  const form = $<HTMLFormElement>('[data-form]');
  const txt = $<HTMLInputElement>('[data-txt]');
  const aviso = $<HTMLElement>('[data-aviso]');
  const motoPagina = raiz.dataset.moto || '';
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CLAVE = 'motodest-asistente';

  let datos: Datos | null = null;
  let estado: { paso?: string; lead?: { nombre?: string; tel?: string; interes?: string }; fin?: { precio?: number; moto?: string } } = {};
  let historial: Msg[] = [];
  let ultimosChips: Chip[] = [];

  const cargar = async () => { if (!datos) datos = await fetch('/asistente.json').then((r) => r.json()); return datos!; };
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9€ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  const euros = (n: number, d = 0) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
  const waUrl = (t: string) => `https://wa.me/${datos?.empresa.wa ?? ''}?text=${encodeURIComponent(t)}`;

  // ---------- Persistencia (solo en esta pestaña) ----------
  const guardar = () => { try { sessionStorage.setItem(CLAVE, JSON.stringify({ historial: historial.slice(-40), estado, chips: ultimosChips })); } catch { /* sin almacenamiento */ } };
  const restaurar = () => { try { const g = JSON.parse(sessionStorage.getItem(CLAVE) || 'null'); if (g) { historial = g.historial; estado = g.estado; ultimosChips = g.chips; } } catch { /* nada */ } };

  // ---------- Pintado ----------
  function tarjetas(motos: Moto[]) {
    const cont = document.createElement('div'); cont.className = 'motos';
    motos.forEach((m) => {
      const a = document.createElement('a'); a.className = 'mc'; a.href = m.u;
      if (m.i) { const im = document.createElement('img'); im.src = m.i; im.alt = ''; im.loading = 'lazy'; a.append(im); }
      const s = document.createElement('span'); s.textContent = `${m.m} · ${m.c}`;
      const n = document.createElement('strong'); n.textContent = m.n;
      const b = document.createElement('b'); b.textContent = m.pt;
      a.append(s, n, b); cont.append(a);
    });
    return cont;
  }
  function pintar(msg: Msg, animar = true) {
    const el = document.createElement('div');
    el.className = `m m--${msg.de}`; el.innerHTML = msg.html;
    lista.append(el);
    let extra: HTMLElement | null = null;
    if (msg.motos?.length) { extra = tarjetas(msg.motos); lista.append(extra); }
    if (animar && !reducir) gsap.from([el, extra].filter(Boolean), { y: 14, opacity: 0, duration: 0.35, ease: 'power2.out', stagger: 0.08 });
    lista.scrollTop = lista.scrollHeight;
  }
  function chips(cs: Chip[]) {
    ultimosChips = cs; chipsEl.innerHTML = '';
    cs.forEach((c) => {
      let el: HTMLElement;
      if (c.url || c.wa) {
        const a = document.createElement('a'); a.href = c.url ?? '#'; a.textContent = c.t;
        if (c.wa) { a.className = 'chip--wa'; a.target = '_blank'; a.rel = 'noopener'; }
        el = a;
      } else {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = c.t;
        b.addEventListener('click', () => entrada(c.t, c.a ?? c.t));
        el = b;
      }
      chipsEl.append(el);
    });
    if (!reducir && cs.length) gsap.from(chipsEl.children, { y: 8, opacity: 0, duration: 0.25, stagger: 0.03 });
    guardar();
  }
  async function bot(html: string, motos?: Moto[]) {
    const ind = document.createElement('div'); ind.className = 'm m--bot m--escribiendo'; ind.innerHTML = '<span></span><span></span><span></span>';
    lista.append(ind); lista.scrollTop = lista.scrollHeight;
    await new Promise((r) => setTimeout(r, reducir ? 0 : Math.min(900, 300 + html.length * 4)));
    ind.remove();
    const msg: Msg = { de: 'bot', html, motos }; historial.push(msg); pintar(msg); guardar();
  }
  function yo(t: string) { const msg: Msg = { de: 'yo', html: esc(t) }; historial.push(msg); pintar(msg); guardar(); }

  // ---------- Menús ----------
  const waChip = (t = 'Hola, escribo desde la web de Motodest.'): Chip => ({ t: 'WhatsApp', url: waUrl(t), wa: true });
  const menu = (): Chip[] => [
    { t: 'Buscar moto', a: 'buscar' }, { t: 'Precios y financiación', a: 'financiacion' }, { t: 'Qué moto con mi carnet', a: 'carnet' },
    { t: 'Pedir una prueba o que me llaméis', a: 'llamadme' }, { t: 'Horario y dirección', a: 'horario' }, waChip(),
  ];
  async function saludo() {
    const d = await cargar();
    const mp = motoPagina && (d.motos.find((m) => `${m.m} ${m.n}` === motoPagina) ?? d.motos.find((m) => motoPagina.endsWith(m.n)));
    if (mp) {
      await bot(`¡Hola! Soy Dest, el asistente de Motodest. ¿Te cuento más de la <b>${esc(motoPagina)}</b>?`);
      chips([{ t: 'Precio y cuota', a: `cuota ${mp.n}` }, { t: 'Colores', a: `colores ${mp.n}` }, { t: 'Quiero probarla', a: 'llamadme' }, { t: 'Ver otras', a: 'buscar' }, waChip(`Hola, me interesa la ${motoPagina}.`)]);
      estado.fin = { precio: mp.p ?? undefined, moto: mp.n };
    } else {
      await bot('¡Hola! Soy Dest, el asistente de Motodest, concesionario oficial Fantic, Beta, CFMOTO y MITT en Barbate. ¿En qué te ayudo?');
      chips(menu());
    }
  }

  // ---------- Búsquedas ----------
  const TIPOS: [RegExp, (m: Moto) => boolean, string][] = [
    [/\b(scooter|scooters|escuter|patinete)\b/, (m) => m.cs === 'scooters', 'scooters'],
    [/\b(quad|quads|atv|cuatriciclo)\b/, (m) => m.cs === 'atv', 'quads'],
    [/\b(buggy|buggies|utv|ssv|side by side|zforce|uforce)\b/, (m) => m.cs === 'buggies', 'buggies y UTV'],
    [/\b(enduro)\b/, (m) => m.cs === 'enduro', 'enduro'],
    [/\b(motocross|cross)\b/, (m) => m.cs === 'motocross', 'motocross'],
    [/\b(trial)\b/, (m) => m.cs === 'trial', 'trial'],
    [/\b(motard|supermotard|supermoto)\b/, (m) => m.cs === 'motard', 'motard'],
    [/\b(rally|raid)\b/, (m) => m.cs === 'rally', 'rally'],
    [/\b(trail|adventure|aventura|viaje|viajar|mt)\b/, (m) => /adventure|alp/.test(m.cs) || /MT|ALP|TT|Desert|Travel/.test(m.n), 'trail y aventura'],
    [/\b(custom|cruiser|chopper|bobber)\b/, (m) => m.cs === 'garage' || /Bobber|808|Joy|Legend/.test(m.n), 'custom'],
    [/\b(naked|deportiva|deportivas|sport|carretera)\b/, (m) => /naked|sport|stealth/.test(m.cs) || /NK|SR|Stealth|GP/.test(m.n), 'naked y deportivas'],
    [/\b(scrambler|clasica|retro|caballero)\b/, (m) => m.cs === 'caballero', 'scrambler Caballero'],
    [/\b(electrica|electrico|electricas)\b/, (m) => /EV|electric|E\b/.test(m.n), 'eléctricas'],
    [/\b(nino|ninos|infantil|minicross|minimoto|pequena)\b/, (m) => /mini|80|50|110/.test(m.cs + ' ' + m.n.toLowerCase()), 'para los más pequeños'],
  ];
  function buscarModelos(q: string, d: Datos) {
    const palabras = q.split(' ').filter((p) => p.length > 1 && !['de', 'la', 'el', 'una', 'un', 'moto', 'motos', 'quiero', 'busco', 'precio', 'cuanto', 'cuesta', 'vale', 'me', 'interesa', 'cuota', 'colores', 'color', 'para', 'con', 'que', 'hay', 'tienes', 'teneis'].includes(p));
    if (!palabras.length) return [];
    const puntuar = (m: Moto) => { const t = norm(`${m.m} ${m.n} ${m.c}`); let s = 0; for (const p of palabras) { if (t.includes(p)) s += p.length > 2 ? 2 : 1; } return s; };
    const r = d.motos.map((m) => [m, puntuar(m)] as const).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]);
    if (!r.length) return [];
    const max = r[0][1];
    return r.filter(([, s]) => s === max).map(([m]) => m).slice(0, 8);
  }
  const conPrecio = (ms: Moto[]) => [...ms].sort((a, b) => (a.p ?? 1e9) - (b.p ?? 1e9));
  // Mezcla marcas (la más barata de cada una, luego la siguiente…) para no enseñar solo una
  const variado = (ms: Moto[], n = 10) => {
    const grupos = new Map<string, Moto[]>();
    conPrecio(ms).forEach((m) => { if (!grupos.has(m.ms)) grupos.set(m.ms, []); grupos.get(m.ms)!.push(m); });
    const out: Moto[] = []; let i = 0;
    while (out.length < n && [...grupos.values()].some((g) => g.length > i)) { grupos.forEach((g) => { if (g[i] && out.length < n) out.push(g[i]); }); i++; }
    return out;
  };

  // ---------- Financiación ----------
  function cuota(precio: number, entrada: number, n: number, tin: number) {
    const c = Math.max(0, precio - entrada), r = tin / 100 / 12;
    return r === 0 ? c / n : (c * r) / (1 - Math.pow(1 + r, -n));
  }
  async function responderCuota(precio: number, moto: string | undefined, entrada = 0) {
    const d = await cargar();
    const filas = [24, 48, 72, d.fin.def].filter((v, i, a) => a.indexOf(v) === i && d.fin.plazos.includes(v)).sort((a, b) => a - b)
      .map((n) => `• ${n} meses: <b>${euros(cuota(precio, entrada, n, d.fin.tin), 2)}/mes</b>`).join('\n');
    await bot(`${moto ? `${esc(moto)}, ` : ''}${euros(precio)}${entrada ? ` con ${euros(entrada)} de entrada` : ' sin entrada'}:\n${filas}\n\n<small>Cálculo orientativo${d.fin.ok ? '' : ' con un TIN provisional'}; sujeto a estudio de la financiera.</small>`);
    estado.fin = { precio, moto };
    chips([{ t: 'Con 1.000 € de entrada', a: `entrada 1000` }, { t: 'Con 2.000 € de entrada', a: `entrada 2000` }, { t: 'Quiero que me llaméis', a: 'llamadme' }, { t: 'Calculadora completa', url: '/#financiacion' }, waChip(`Hola, quiero información de financiación${moto ? ` para la ${moto}` : ''}.`)]);
  }

  // ---------- Recogida de datos (que le llamemos) ----------
  async function pasoLead(t: string) {
    const l = estado.lead ??= {};
    if (estado.paso === 'lead-nombre') {
      l.nombre = t.slice(0, 80); estado.paso = 'lead-tel';
      await bot(`Encantado, ${esc(l.nombre.split(' ')[0])}. ¿A qué teléfono te llamamos?`); chips([]); return;
    }
    if (estado.paso === 'lead-tel') {
      const tel = t.replace(/[^\d+]/g, '');
      if (tel.replace(/\D/g, '').length < 9) { await bot('Ese teléfono no parece correcto. Escríbelo con sus 9 cifras, por favor.'); return; }
      l.tel = tel; estado.paso = 'lead-interes';
      await bot('¿Sobre qué moto o qué necesitas? (puedes escribir «prueba», «financiación», «segunda mano»…)');
      chips(motoPagina ? [{ t: motoPagina }, { t: 'Financiación' }, { t: 'Prueba de una moto' }] : [{ t: 'Prueba de una moto' }, { t: 'Financiación' }, { t: 'Segunda mano' }, { t: 'Alquiler' }]);
      return;
    }
    if (estado.paso === 'lead-interes') {
      l.interes = t.slice(0, 200); estado.paso = 'lead-ok';
      await bot(`Resumen:\n• Nombre: ${esc(l.nombre!)}\n• Teléfono: ${esc(l.tel!)}\n• Interés: ${esc(l.interes)}\n\nPara enviarlo necesito que aceptes la <a href="/politica-de-privacidad/" target="_blank">política de privacidad</a>. Solo usaremos tus datos para llamarte por esta consulta.`);
      chips([{ t: 'Acepto y enviar', a: 'lead-enviar' }, { t: 'Cancelar', a: 'lead-cancelar' }]);
      return;
    }
  }
  async function enviarLead() {
    const l = estado.lead!;
    const fd = new URLSearchParams({ canal: 'asistente', nombre: l.nombre!, telefono: l.tel!, email: '', moto: motoPagina || l.interes || '', mensaje: `Desde el asistente. Interés: ${l.interes}${estado.fin?.precio ? `. Consultó cuota para ${estado.fin.moto ?? ''} (${euros(estado.fin.precio)}).` : ''}`, origen: location.pathname, privacidad: '1', web: '' });
    try {
      const r = await fetch('/api/contacto.php', { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
      const j = await r.json().catch(() => ({ ok: r.ok }));
      if (!j.ok) throw new Error();
      await bot(`¡Hecho, ${esc(l.nombre!.split(' ')[0])}! Te llamamos lo antes posible en horario de tienda. Si es urgente, escríbenos por WhatsApp.`);
      estado = {}; chips([waChip(`Hola, soy ${l.nombre}. Acabo de dejar mis datos en el asistente de la web.`), { t: 'Volver al inicio', a: 'menu' }]);
    } catch {
      await bot(`No he podido enviarlo ahora mismo. Llámanos al <a href="tel:${datos!.empresa.tel.replace(/\s/g, '')}">${datos!.empresa.telv}</a> o escríbenos por WhatsApp.`);
      estado.paso = undefined; chips([waChip(`Hola, soy ${l.nombre} (${l.tel}). Me interesa: ${l.interes}.`), { t: 'Volver al inicio', a: 'menu' }]);
    }
  }

  // ---------- Motor de respuestas ----------
  async function responder(texto: string) {
    const d = await cargar();
    const q = norm(texto);
    if (q === 'lead-cancelar') { estado = {}; await bot('Sin problema, no he guardado nada. ¿Te ayudo con otra cosa?'); chips(menu()); return; }
    if (q === 'lead-enviar') { await enviarLead(); return; }
    if (estado.paso?.startsWith('lead-') && estado.paso !== 'lead-ok') { await pasoLead(texto.trim()); return; }

    if (q === 'menu' || /^(hola|buenas|buenos dias|buenas tardes|hey|ey)\b/.test(q) && q.split(' ').length <= 3) {
      await bot('¿En qué te ayudo?'); chips(menu()); return;
    }
    if (/^(gracias|ok|vale|perfecto|genial)\b/.test(q)) { await bot('¡A ti! Si necesitas algo más, aquí estoy.'); chips(menu()); return; }

    if (/(llam|contact|prueba|probar|cita|reserv|que me llam|vendedor|comercial|asesor)/.test(q) && !/(telefono|numero)/.test(q)) {
      estado.paso = 'lead-nombre'; estado.lead = {};
      await bot('Perfecto, te llamamos nosotros. ¿Cómo te llamas?'); chips([{ t: 'Cancelar', a: 'lead-cancelar' }]); return;
    }
    if (/(horario|hora|abr[ei]s|abiert|cierr|cerrad|sabado|domingo)/.test(q)) {
      const h = d.empresa.horario.map((x) => `• ${x.dias}: ${x.horas}`).join('\n');
      await bot(`Nuestro horario:\n${h}\n\nEstamos en ${esc(d.empresa.dir)}.`);
      chips([{ t: 'Cómo llegar', url: d.empresa.mapa }, { t: 'Pedir una prueba', a: 'llamadme' }, waChip()]); return;
    }
    if (/(donde|direccion|ubicacion|llegar|mapa|tienda|barbate|local)/.test(q)) {
      await bot(`Estamos en <b>${esc(d.empresa.dir)}</b>. <a href="${d.empresa.mapa}" target="_blank" rel="noopener">Abrir en Google Maps</a>.`);
      chips([{ t: 'Horario', a: 'horario' }, { t: 'Pedir una prueba', a: 'llamadme' }, waChip()]); return;
    }
    if (/(telefono|numero|whatsapp|whats|movil|email|correo)/.test(q)) {
      await bot(`Llámanos al <a href="tel:${d.empresa.tel.replace(/\s/g, '')}">${d.empresa.telv}</a> o escríbenos por WhatsApp. Si prefieres, te llamamos nosotros.`);
      chips([waChip(), { t: 'Que me llaméis', a: 'llamadme' }]); return;
    }
    if (/(alquil|alquiler|rent)/.test(q)) { await bot('Tenemos motos de alquiler en Barbate. Dinos fechas y el tipo de moto y te confirmamos disponibilidad.'); chips([{ t: 'Que me llaméis', a: 'llamadme' }, waChip('Hola, quiero información sobre alquiler de motos.')]); return; }
    if (/(segunda mano|ocasion|usad|seminuev)/.test(q)) { await bot('Tenemos motos de segunda mano revisadas. El stock cambia a menudo: pregúntanos qué unidades hay ahora.'); chips([{ t: 'Que me llaméis', a: 'llamadme' }, waChip('Hola, ¿qué motos de segunda mano tenéis ahora?')]); return; }
    if (/(casco|equipacion|guantes|chaqueta|ropa|boutique|accesorio|baul|maleta)/.test(q)) { await bot('En la tienda tenemos cascos, equipación y accesorios de LS2, Airoh, Alpinestars, Shad, SP Connect, Liqui Moly y Komobi. Dime qué buscas y te decimos si lo tenemos.'); chips([waChip('Hola, busco equipación: '), { t: 'Que me llaméis', a: 'llamadme' }]); return; }
    if (/(taller|revision|mantenimiento|reparar|averia|itv|garantia)/.test(q)) { await bot('Para revisiones, garantía o cualquier consulta de taller, escríbenos o llámanos y te damos cita.'); chips([waChip('Hola, quiero pedir cita para una revisión.'), { t: 'Que me llaméis', a: 'llamadme' }]); return; }

    // Entrada para la cuota en curso
    const entradaM = q.match(/entrada (?:de )?(\d[\d ]*)/);
    if (entradaM && estado.fin?.precio) { await responderCuota(estado.fin.precio, estado.fin.moto, Number(entradaM[1].replace(/\s/g, ''))); return; }

    // Carnet
    if (/(carnet|permiso|licencia|\bb\b|\ba1\b|\ba2\b|\bam\b)/.test(q) && !/(colores?)/.test(q)) {
      let filtro: ((m: Moto) => boolean) | null = null; let txt = '';
      if (/\bam\b|ciclomotor|16 anos|15 anos/.test(q)) { filtro = (m) => (m.cc ?? 999) <= 50; txt = 'Con el carnet AM puedes llevar ciclomotores de hasta 50 cc:'; }
      else if (/\ba1\b|\bb\b|coche|turismo/.test(q)) { filtro = (m) => (m.cc ?? 999) <= 125 && (m.cc ?? 0) > 50 && !['atv', 'buggies'].includes(m.cs); txt = /\ba1\b/.test(q) ? 'Con el A1 puedes llevar motos de hasta 125 cc y 15 CV:' : 'Con el carnet B y 3 años de antigüedad puedes llevar motos de hasta 125 cc (en España). Estas son algunas:'; }
      else if (/\ba2\b/.test(q)) { filtro = (m) => (m.cv ?? 999) <= 47.6 && (m.cc ?? 0) > 125 && !['atv', 'buggies'].includes(m.cs); txt = 'Con el A2 puedes llevar motos de hasta 35 kW (47,6 CV). Estas encajan de serie:'; }
      if (!filtro) { await bot('¿Qué carnet tienes?'); chips([{ t: 'Carnet B (coche)', a: 'carnet b' }, { t: 'A1', a: 'carnet a1' }, { t: 'A2', a: 'carnet a2' }, { t: 'A', a: 'buscar' }, { t: 'AM', a: 'carnet am' }]); return; }
      const r = variado(d.motos.filter(filtro));
      await bot(`${txt}`, r);
      await bot('Muchas motos de más potencia también tienen versión limitada para el A2: pregúntanos.');
      chips([{ t: 'Precios y cuota', a: 'financiacion' }, { t: 'Que me llaméis', a: 'llamadme' }, waChip()]); return;
    }

    // Presupuesto: «hasta 5000», «menos de 4.000 €»
    const pres = q.match(/(hasta|menos de|maximo|por debajo de|no mas de)\s*(\d[\d ]*)/);
    if (pres) {
      const tope = Number(pres[2].replace(/\s/g, ''));
      const tipo = TIPOS.find(([re]) => re.test(q));
      const r = conPrecio(d.motos.filter((m) => m.p != null && m.p <= tope && (!tipo || tipo[1](m)))).reverse().slice(0, 10);
      if (r.length) await bot(`Por ${euros(tope)} o menos${tipo ? ` en ${tipo[2]}` : ''} tienes estas:`, r);
      else await bot(`Con ese presupuesto${tipo ? ` en ${tipo[2]}` : ''} no tengo modelos con precio publicado. Llámanos y lo vemos, a veces hay ofertas o unidades de ocasión.`);
      chips([{ t: 'Calcular cuota', a: 'financiacion' }, { t: 'Que me llaméis', a: 'llamadme' }, waChip()]); return;
    }

    // Marca
    const marca = d.marcas.find((m) => q.includes(norm(m.n)));
    const modelos = buscarModelos(q, d);
    const tipo = TIPOS.find(([re]) => re.test(q));

    // Colores de un modelo
    if (/colou?r/.test(q) && modelos.length) {
      const m = modelos[0];
      await bot(`La ${esc(m.m)} ${esc(m.n)} está en: ${m.col.length ? m.col.map(esc).join(', ') : 'consúltanos los colores disponibles'}.`, [m]);
      chips([{ t: 'Precio y cuota', a: `cuota ${m.n}` }, { t: 'Quiero probarla', a: 'llamadme' }, waChip(`Hola, me interesa la ${m.m} ${m.n}.`)]); return;
    }
    // Cuota / financiación
    if (/(financ|cuota|plazo|mensual|al mes|pagar|entrada)/.test(q)) {
      const cifra = q.match(/(\d[\d ]{2,})/);
      if (modelos.length === 1 || (modelos.length && /cuota /.test(q))) {
        const m = modelos[0];
        if (m.p) { await responderCuota(m.p, `${m.m} ${m.n}`); return; }
        await bot(`La ${esc(m.n)} es «Consultar precio»: dinos qué te interesa y te preparamos la cuota.`); chips([{ t: 'Que me llaméis', a: 'llamadme' }, waChip(`Hola, quiero precio y financiación de la ${m.n}.`)]); return;
      }
      if (cifra) { await responderCuota(Number(cifra[1].replace(/\s/g, '')), undefined); return; }
      if (estado.fin?.precio) { await responderCuota(estado.fin.precio, estado.fin.moto); return; }
      await bot('Financiamos tu moto a tu medida, con o sin entrada. Dime el modelo o el precio (por ejemplo «cuota 800NK» o «cuota 6000») y te calculo cuánto sale al mes.');
      chips([{ t: 'Cuota de 5.000 €', a: 'cuota 5000' }, { t: 'Cuota de 8.000 €', a: 'cuota 8000' }, { t: 'Calculadora completa', url: '/#financiacion' }]); return;
    }
    // Por tipo (y marca si la hay), afinando con el resto de palabras si encajan
    if (tipo) {
      const base = d.motos.filter((m) => tipo[1](m) && (!marca || m.ms === marca.s));
      const cifras = q.match(/\b\d{3,4}\b/g)?.filter((c) => c !== '4000');
      const fino = cifras?.length ? base.filter((m) => cifras.some((c) => norm(m.n).includes(c))) : [];
      const r = marca ? conPrecio(fino.length ? fino : base).slice(0, 10) : variado(fino.length ? fino : base);
      if (r.length) { await bot(`Estas son nuestras ${tipo[2]}${marca ? ` de ${marca.n}` : ''}:`, r); chips([{ t: 'Qué moto con mi carnet', a: 'carnet' }, { t: 'Precios y financiación', a: 'financiacion' }, { t: 'Que me llaméis', a: 'llamadme' }]); return; }
    }
    // Buscar por modelo concreto
    if (modelos.length && !(marca && modelos.length > 6)) {
      const uno = modelos.length === 1 ? modelos[0] : null;
      await bot(uno ? `Aquí tienes la ${esc(uno.m)} ${esc(uno.n)}: ${esc(uno.pt)}.` : 'Esto es lo que tengo:', modelos);
      chips(uno ? [{ t: 'Calcular cuota', a: `cuota ${uno.n}` }, { t: 'Colores', a: `colores ${uno.n}` }, { t: 'Quiero probarla', a: 'llamadme' }, waChip(`Hola, me interesa la ${uno.m} ${uno.n}.`)] : [{ t: 'Precios y financiación', a: 'financiacion' }, { t: 'Que me llaméis', a: 'llamadme' }]);
      return;
    }
    if (marca) {
      await bot(`¿Qué tipo de ${esc(marca.n)} buscas?`);
      chips(marca.cats.map((c) => ({ t: c.n, a: `${c.n} ${marca.n}` })).concat([{ t: `Ver toda la gama ${marca.n}`, url: `/${marca.s}/` } as Chip]));
      return;
    }
    if (q === 'buscar' || /(busco|buscar|ver motos|modelos|catalogo|gama|que motos)/.test(q)) {
      await bot('¿De qué marca o de qué tipo?');
      chips([...d.marcas.map((m) => ({ t: m.n, a: m.n })), { t: 'Scooter', a: 'scooter' }, { t: 'Quad', a: 'quad' }, { t: 'Trail', a: 'trail' }, { t: 'Enduro', a: 'enduro' }, { t: 'Custom', a: 'custom' }]);
      return;
    }

    await bot('No te he entendido del todo. Prueba con algo como «quad 4x4», «moto para el carnet B», «cuota 800NK» o «horario». También puedes hablar con una persona por WhatsApp.');
    chips([...menu().slice(0, 4), waChip(`Hola, tengo una consulta: ${texto}`)]);
  }

  async function entrada(etiqueta: string, accion: string) {
    yo(etiqueta);
    chips([]);
    // las acciones internas se traducen a texto entendible por el motor
    const mapa: Record<string, string> = { buscar: 'buscar', financiacion: 'financiacion', carnet: 'carnet', llamadme: 'llamadme', horario: 'horario', menu: 'menu', 'lead-enviar': 'lead-enviar', 'lead-cancelar': 'lead-cancelar' };
    await responder(mapa[accion] ?? accion);
  }

  // ---------- Apertura y cierre ----------
  let abierto = false;
  async function abrir() {
    if (abierto) return; abierto = true;
    aviso.hidden = true; try { sessionStorage.setItem(CLAVE + '-aviso', '1'); } catch { /* */ }
    panel.hidden = false; abrirBtn.setAttribute('aria-expanded', 'true');
    if (!reducir) gsap.fromTo(panel, { y: 30, opacity: 0, scale: 0.96, transformOrigin: '100% 100%' }, { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' });
    if (!lista.children.length) {
      restaurar();
      if (historial.length) { historial.forEach((m) => pintar(m, false)); chips(ultimosChips); }
      else await saludo();
    }
    setTimeout(() => txt.focus({ preventScroll: true }), 50);
  }
  function cerrar() {
    if (!abierto) return; abierto = false; abrirBtn.setAttribute('aria-expanded', 'false');
    const fin = () => { panel.hidden = true; };
    if (reducir) fin(); else gsap.to(panel, { y: 20, opacity: 0, duration: 0.2, onComplete: fin });
    abrirBtn.focus();
  }
  abrirBtn.addEventListener('click', () => (abierto ? cerrar() : abrir()));
  $('[data-cerrar]').addEventListener('click', cerrar);
  $('[data-reiniciar]').addEventListener('click', async () => { historial = []; estado = {}; lista.innerHTML = ''; try { sessionStorage.removeItem(CLAVE); } catch { /* */ } await saludo(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && abierto) cerrar(); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const t = txt.value.trim(); if (!t) return;
    txt.value = ''; yo(t); chips([]); await responder(t);
  });

  // Aviso a los pocos segundos (una vez por sesión)
  let visto = false; try { visto = !!sessionStorage.getItem(CLAVE + '-aviso'); } catch { /* */ }
  if (!visto) {
    setTimeout(() => {
      if (abierto) return;
      aviso.hidden = false;
      if (!reducir) gsap.from(aviso, { y: 12, opacity: 0, duration: 0.4, ease: 'back.out(2)' });
    }, motoPagina ? 6000 : 9000);
  }
  raiz.querySelector('[data-cerrar-aviso]')!.addEventListener('click', () => { aviso.hidden = true; try { sessionStorage.setItem(CLAVE + '-aviso', '1'); } catch { /* */ } });
  raiz.querySelector('[data-aviso-txt]')!.addEventListener('click', abrir);
}
