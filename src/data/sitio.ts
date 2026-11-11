// Datos generales de Motodest. Todo lo que se repite en la web sale de aquí.

export const EMPRESA = {
  nombre: 'Motodest',
  // PENDIENTE: razón social y NIF del titular para las páginas legales.
  razonSocial: null as string | null,
  nif: null as string | null,
  email: 'contacto@motodest.com',
  telefono: '+34 630 55 34 94',
  telefonoVisible: '630 55 34 94',
  whatsapp: '34630553494',
  direccion: {
    calle: 'Av. de la Mar, 114',
    cp: '11160',
    localidad: 'Barbate',
    provincia: 'Cádiz',
    pais: 'ES',
  },
  horario: [
    { dias: 'Lunes a viernes', horas: '10:00–14:00 y 17:00–20:00' },
    { dias: 'Sábado', horas: '10:00–13:00' },
    { dias: 'Domingo', horas: 'Cerrado' },
  ],
  // Formato schema.org
  horarioSchema: [
    { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '14:00' },
    { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '17:00', closes: '20:00' },
    { dayOfWeek: ['Saturday'], opens: '10:00', closes: '13:00' },
  ],
  // PENDIENTE: URLs de las redes sociales (en la web antigua no tenían enlace).
  redes: [] as { nombre: string; url: string }[],
};

// Financiación. PENDIENTE: confirmar con la financiera el TIN, los plazos, la entrada mínima
// y si hay comisión de apertura. Mientras `confirmado` sea false la calculadora lo marca en rojo.
export const FINANCIACION = {
  confirmado: false,
  tin: 9.99, // % anual, provisional
  comisionApertura: 0, // % sobre el importe financiado
  plazos: [12, 24, 36, 48, 60, 72, 84, 96],
  plazoPorDefecto: 48,
  entradaMaxPct: 50,
  importeMinimo: 1500,
};

export type SlugMarca = 'fantic' | 'beta' | 'cfmoto' | 'mitt';

export interface Categoria {
  slug: string;
  nombre: string;
  h1: string;
  intro: string;
  imagen: string; // clave en src/assets/site/cat
  urlAntigua: string;
}

export interface Marca {
  slug: SlugMarca;
  nombre: string;
  h1: string;
  lema: string;
  historiaTitulo: string;
  historia: string[];
  hero: string;
  historiaImg: string;
  logoImg: string;
  urlAntigua: string;
  web: string;
  categorias: Categoria[];
}

export const MARCAS: Marca[] = [
  {
    slug: 'fantic',
    nombre: 'Fantic',
    h1: 'Concesionario oficial Fantic en Cádiz',
    lema: 'Enduro, motard, motocross, rally y la gama Caballero, en Barbate.',
    historiaTitulo: 'Historia de Fantic',
    historia: [
      'Fantic es una marca italiana fundada en 1968 que se ha hecho un nombre en el enduro, el trial y el motocross gracias a su innovación y su diseño.',
      'Hoy combina motos de competición, como las XEF y XXF, con la gama Caballero de inspiración clásica, y es una marca muy apreciada por los aficionados de todo el mundo.',
    ],
    hero: 'hero-fantic',
    historiaImg: 'historia-fantic',
    logoImg: 'marca-fantic',
    urlAntigua: '/concesionario-oficial-fantic/',
    web: 'https://fantic.com/es-es',
    categorias: [
      { slug: 'enduro', nombre: 'Enduro', h1: 'Motos de enduro Fantic', imagen: 'fantic-enduro', urlAntigua: '/motos-fantic-enduro-motodest/',
        intro: 'Gama completa de enduro Fantic: desde las XE 50 y XEF 125 para empezar hasta las XEF 250, 310 y 450 y las dos tiempos XE 125 y XE 300 de competición.' },
      { slug: 'caballero', nombre: 'Caballero', h1: 'Motos Fantic Caballero', imagen: 'fantic-caballero', urlAntigua: '/motos-fantic-caballero-motodest/',
        intro: 'Scrambler, Deluxe, Rally y Travel: la familia Caballero de Fantic en 125, 500 y 700 cc, con estética clásica y mecánica actual.' },
      { slug: 'motard', nombre: 'Motard', h1: 'Motos motard Fantic', imagen: 'fantic-motard', urlAntigua: '/concesionario-oficial-motard-motodest/',
        intro: 'Supermotard Fantic de 50 y 125 cc en versiones Performance y Competition, ideales para iniciarse con carnet AM o A1.' },
      { slug: 'motocross', nombre: 'Motocross', h1: 'Motos de motocross Fantic', imagen: 'fantic-motocross', urlAntigua: '/motos-fantic-motocross-motodest/',
        intro: 'Motocross Fantic de dos y cuatro tiempos: XX 125, XX 250, XXF 250 y XXF 450, nacidas de la competición.' },
      { slug: 'rally', nombre: 'Rally', h1: 'Motos de rally Fantic', imagen: 'fantic-rally', urlAntigua: '/motos-fantic-rally-motodest/',
        intro: 'Las XEF Rally de Fantic, motos de raid de 450 cc con depósito de 30 litros preparadas para largas etapas.' },
      { slug: 'stealth', nombre: 'Stealth', h1: 'Fantic Stealth: naked deportivas', imagen: 'fantic-stealth', urlAntigua: '',
        intro: 'La nueva Stealth de Fantic: naked deportiva italiana con chasis mixto de acero y aluminio, en 125 cc para el carnet A1 y 500 cc para el A2.' },
    ],
  },
  {
    slug: 'beta',
    nombre: 'Beta',
    h1: 'Concesionario oficial Beta en Cádiz',
    lema: 'Enduro, trial, motocross, motard y minimotos Beta en Barbate.',
    historiaTitulo: 'Historia de Beta',
    historia: [
      'Beta Motor nació en Florencia en 1904 fabricando bicicletas y dio el salto a las motos en 1948. Desde entonces es sinónimo de calidad, fiabilidad y espíritu de competición, sobre todo en trial y enduro.',
      'La tradición artesanal italiana y la innovación constante la han convertido en una referencia mundial para los amantes del off-road.',
    ],
    hero: 'hero-beta',
    historiaImg: 'historia-beta',
    logoImg: 'marca-beta',
    urlAntigua: '/concesionario-oficial-beta/',
    web: 'https://www.betamotor.com/es',
    categorias: [
      { slug: 'enduro', nombre: 'Enduro', h1: 'Motos de enduro Beta', imagen: 'beta-enduro', urlAntigua: '/motos-enduro-betamotor-motodest/',
        intro: 'Enduro Beta para todos los niveles: RR 50 y RR 125 4T, las RR X-Pro y RR Race de dos y cuatro tiempos y la Xtrainer.' },
      { slug: 'motocross', nombre: 'Motocross', h1: 'Motos de motocross Beta RX', imagen: 'beta-motocross', urlAntigua: '/motos-mx-betamotor-motodest/',
        intro: 'La gama RX de motocross de Beta, en versiones de dos tiempos (250 y 350) y cuatro tiempos (250 y 450).' },
      { slug: 'trial', nombre: 'Trial', h1: 'Motos de trial Beta', imagen: 'beta-trial', urlAntigua: '/motos-trial-betamotor-motodest/',
        intro: 'Trial Beta: la nueva gama Sincro, las EVO y EVO Factory para competición y las EVO 80 Junior y Senior para los más jóvenes.' },
      { slug: 'motard', nombre: 'Motard', h1: 'Motos motard Beta', imagen: 'beta-motard', urlAntigua: '/motos-motard-betamotor-motodest/',
        intro: 'Supermotard Beta de 50 y 125 cc para carnet AM y A1, con chasis y frenos de competición.' },
      { slug: 'alp', nombre: 'ALP', h1: 'Beta ALP', imagen: 'beta-alp', urlAntigua: '/motos-alp-betamotor-motodest/',
        intro: 'Beta ALP 4.0 y ALP X: trail ligeras de 350 cc para el campo y el día a día, aptas para el carnet A2.' },
      { slug: 'minibike', nombre: 'Minibike', h1: 'Minimotos eléctricas Beta', imagen: 'beta-minibike', urlAntigua: '/minibike-betamotor-motodest/',
        intro: 'Minitrial y Minicross eléctricas de Beta para que los más pequeños aprendan con seguridad y sin ruido.' },
    ],
  },
  {
    slug: 'cfmoto',
    nombre: 'CFMOTO',
    h1: 'Concesionario oficial CFMOTO en Cádiz',
    lema: 'Motos, ATV y buggies CFMOTO en Barbate.',
    historiaTitulo: 'Historia de CFMOTO',
    historia: [
      'CFMOTO se fundó en 1989 y desde sus inicios ha desarrollado motores y tecnología propios, lo que le ha permitido crecer en mercados de todo el mundo.',
      'Su evolución constante y sus colaboraciones con fabricantes europeos la han convertido en una marca reconocida por su fiabilidad, su diseño y su equipamiento.',
    ],
    hero: 'hero-cfmoto',
    historiaImg: 'historia-cfmoto',
    logoImg: 'marca-cfmoto',
    urlAntigua: '/concesionario-oficial-cf-moto/',
    web: 'https://cfmoto.es',
    categorias: [
      { slug: 'motos', nombre: 'Motos', h1: 'Motos CFMOTO', imagen: 'cfmoto-motos', urlAntigua: '/motos-cfmoto-motodest/',
        intro: 'Trail MT, naked NK, la deportiva 675SR-R, la 450CL-C Bobber y la 250 Dual: la gama de motos CFMOTO con gran equipamiento y precios muy competitivos.' },
      { slug: 'atv', nombre: 'ATV', h1: 'Quads y ATV CFMOTO', imagen: 'cfmoto-atv', urlAntigua: '/atv-cfmoto-motodest/',
        intro: 'Quads CFORCE de 400 a 1000 cc, incluidos los nuevos C4, C5 y C6 Pro, homologados para dos plazas, para trabajo en el campo o para ocio.' },
      { slug: 'buggies', nombre: 'Buggies y UTV', h1: 'Buggies y UTV CFMOTO', imagen: 'cfmoto-buggies', urlAntigua: '/buggies-cfmoto-motodest/',
        intro: 'Buggies deportivos ZFORCE, con los nuevos Z10 turbo de 154 CV, y vehículos utilitarios UFORCE, incluido el eléctrico U6 EV.' },
    ],
  },
  {
    slug: 'mitt',
    nombre: 'MITT',
    h1: 'Concesionario oficial MITT en Cádiz',
    lema: 'Scooters, custom, deportivas y trail MITT en Barbate.',
    historiaTitulo: 'Historia de MITT',
    historia: [
      'MITT es una marca española de motos que nació con el objetivo de ofrecer modelos accesibles, funcionales y pensados para el uso diario.',
      'Su gama combina diseño actual, equipamiento completo y fiabilidad mecánica, con scooters, custom, deportivas y trail de distintas cilindradas y una muy buena relación calidad-precio.',
    ],
    hero: 'hero-mitt',
    historiaImg: 'historia-mitt',
    logoImg: 'marca-mitt',
    urlAntigua: '/concesionario-oficial-mitt/',
    web: 'https://mittmotors.com',
    categorias: [
      { slug: 'scooters', nombre: 'Scooters', h1: 'Scooters MITT', imagen: 'mitt-scooters', urlAntigua: '/scooters-mitt-motodest/',
        intro: 'Scooters MITT de 125 y 330 cc para ciudad y carretera, con ABS o frenada combinada y mucho equipamiento de serie.' },
      { slug: 'garage', nombre: 'Garage', h1: 'MITT Garage: custom y clásicas', imagen: 'mitt-garage', urlAntigua: '/garage-mitt-motodest/',
        intro: 'La línea Garage de MITT: la Ibiza y la Legend de 125 cc y las custom bicilíndricas 808, Traveler y Big Foot.' },
      { slug: 'sport-touring', nombre: 'Sport / Touring', h1: 'Motos deportivas y touring MITT', imagen: 'mitt-sport-touring', urlAntigua: '/sport-touring-mitt-motors-motodest/',
        intro: 'Naked y deportivas MITT de 125 cc, la 775R de 82 CV y la GT-K para viajar.' },
      { slug: 'adventure', nombre: 'Adventure', h1: 'Motos trail MITT', imagen: 'mitt-adventure', urlAntigua: '/motos-adventure-mitt-motors-motodest/',
        intro: 'Trail MITT para carnet A1 y A2: la Desert 125, la MT 125 con maletas y la TT 555 bicilíndrica.' },
      { slug: 'atv', nombre: 'Quads', h1: 'Quads MITT', imagen: 'mitt-atv', urlAntigua: '',
        intro: 'Quads MITT para ocio y trabajo: el 275 4x2, el 330 4x4 con cabestrante y el 460 EPS con dirección asistida.' },
    ],
  },
];

export const marcaPorSlug = (s: string) => MARCAS.find((m) => m.slug === s)!;
export const categoriaDe = (m: string, c: string) => marcaPorSlug(m).categorias.find((x) => x.slug === c)!;
