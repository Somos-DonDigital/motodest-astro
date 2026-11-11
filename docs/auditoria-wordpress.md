# Auditoría de motodest.es (WordPress) — 11/11/2026

## Stack actual
- WordPress con Elementor 3.35.4 y Elementor Pro 3.35.1, tema hijo «DonDigital».
- Plugins: Dynamic.ooo, Dynamic Visibility, JetTabs, Perfmatters, All-in-One WP Migration y Child Theme Configurator.
- Sin plugin de SEO.
- 24 páginas publicadas. 1 entrada de ejemplo («WordPress felizmente alojado en Webempresa»). 282 archivos multimedia.
- Las motos no son un tipo de contenido: cada categoría es una página de Elementor con tarjetas montadas a mano. En total hay 114 modelos.
- La home carga 37 hojas de estilo y pesa 136 KB de HTML.

## Errores de contenido
1. **Fichas técnicas falsas en todos los modelos.** Son dos plantillas copiadas:
   - Las Fantic de enduro, motard y Caballero dicen «2T Euro5+, 49,7 cc, 910 mm, 117 kg».
   - Las Fantic de rally y motocross y todas las Beta dicen «4T DOHC, 450 cc, 955 mm, 140 kg».
2. **El H1 del slider de la home** muestra el texto literal `TOURIN<"G" EPS`. Además, la foto es de una CFMOTO 675NK, no de una CFORCE 625.
3. **Fotos equivocadas o repetidas:**
   - XEF 125 Competition usa como segundo color una foto de la XMF 125 Motard.
   - MITT 808 usa la foto de la Legend 125.
   - RX 250 y RX 300 comparten foto.
   - Xtrainer 250 y 300 comparten foto.
   - Minicross 36V y 48V comparten foto.
4. **Las páginas de Beta, CFMOTO y MITT** dicen «FANTIC ES NUESTRA VIDA…».
5. **La página de Beta ALP** tiene como H1 «Gamma Trial». Además, en varios H1 pone «Gamma» en lugar de «Gama».
6. **Precios dudosos:**
   - «Por determinar €» en seis modelos.
   - 1000MT-X sin precio.
   - «Desde 19,995 €» con coma.
   - 16.996 € y 19.494 € (parecen erratas de 16.995 y 19.495).
   - RX 300 más barata que RX 250.
7. **Otras erratas:**
   - «MIT TT 555» en lugar de «MITT».
   - «BABRBATE» en un nombre de imagen.
   - «que has leído y acepta» en lugar de «acepte».
   - «Permito a Motodest a que me contacte» (sobra la «a»).
   - «¿En que moto…?» sin tilde.
   - Etiquetas de los formularios en inglés («Name», «Message»).

## Enlaces rotos o vacíos
- Los botones «Descubre más» de todos los heros apuntan a `#`.
- En la página de MITT, los cuatro botones «Descubre los modelos» apuntan a `#`.
- Los enlaces a Aviso legal, Política de privacidad y Cookies no llevan a ninguna parte. **Esas páginas no existen.** Es un incumplimiento de la LSSI y del RGPD, y los formularios recogen datos personales.
- Facebook, YouTube e Instagram no tienen enlace.
- La newsletter no tiene formulario: solo texto y un botón.
- El correo del pie es `contacto@motodest.com`, pero el dominio de la web es `.es`.

## Home
- Las secciones Nuestros servicios, Motos de alquiler, Tienda boutique, Segunda mano y Nuestras marcas solo tienen la imagen de fondo y el título. No hay texto ni enlaces.
- La home no tiene ningún modelo de moto (es el cambio que pide el cliente).
- La frase «el mejor tipo de interés de la provincia» es una afirmación comparativa sin respaldo, con riesgo de publicidad engañosa.

## SEO técnico
- No hay meta description en ninguna página.
- No hay Open Graph ni datos estructurados (LocalBusiness / MotorcycleDealer, Product).
- El favicon está vacío: es un PNG transparente de 16 px.
- Hay varios H1 por página, los precios están marcados como H2, la jerarquía de encabezados está desordenada y la página de contacto no tiene H1.
- Los alt de las imágenes son nombres de archivo.
- Los títulos tienen la marca duplicada («| Motodest – MOTODEST») y las URLs son largas y redundantes (`/motos-fantic-enduro-motodest/`).
- No hay una ficha por modelo: no se puede posicionar ningún modelo («Fantic XEF 250 precio Cádiz»).

## Decisiones para la versión en Astro
- **Catálogo como colección de contenido:** un archivo por modelo y una ficha individual con su URL, galería por color, precio y datos técnicos verificados con el fabricante.
- **URLs limpias:** `/fantic/enduro/`, `/fantic/enduro/xef-250/`. Las URLs antiguas se redirigen con 301 en `.htaccess`.
- **Home con modelos destacados**, gestionados con un campo `destacada`.
- **SEO:** title y description únicos, canonical, Open Graph, sitemap, robots.txt, y JSON-LD de MotorcycleDealer y Product/Offer.
- **Imágenes** en AVIF/WebP con tamaños adaptativos y carga diferida.
- **Tipografía:** Death Star autoalojada y Cairo autoalojada.
- **Formularios** con un endpoint PHP en el propio cPanel, protección antispam y consentimiento correcto.
- **Páginas legales** (Aviso legal, Privacidad, Cookies) y un banner de cookies solo si se cargan scripts de terceros.
- **Chatbot:** fase posterior, con un endpoint PHP en el mismo hosting.
