# motodest.es — Astro

Web estática de Motodest (concesionario Fantic, Beta, CFMOTO y MITT en Barbate), migrada desde WordPress/Elementor.

## Uso

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # genera dist/
```

## Despliegue en cPanel

1. Ejecuta `npm run build`.
2. Sube **todo el contenido de `dist/`** a `public_html/`. Incluye `.htaccess` (archivo oculto) y `api/contacto.php`.
3. Crea o autoriza el remitente `web@motodest.es` (o cambia `REMITENTE` en `public/api/contacto.php`) y revisa el SPF del dominio para que los correos del formulario no lleguen como spam.
4. En Google Search Console, envía `https://motodest.es/sitemap-index.xml` y revisa las redirecciones 301.

## Cómo está organizado

- `src/content/motos/*.json`: **un archivo por moto** con el precio, las fotos, la ficha técnica y si es destacada.
  - Se generan con `python3 -I scripts/generar_catalogo.py <carpeta_imagenes_wp>` a partir de `docs/inventario-wordpress.json`, `docs/fichas/*.json` y la tabla `PRECIOS` del script.
  - También se pueden editar a mano.
- **Motos de la home:** las que tienen `"destacada": true`.
- `src/data/sitio.ts`: datos de la empresa, marcas, categorías y textos.
- `public/.htaccess`: HTTPS, redirecciones 301 de las URLs de WordPress, caché y cabeceras de seguridad.
- `public/api/contacto.php`: envío del formulario. Lleva antispam con un campo trampa y un límite de tiempo por IP.

## Precios

Se muestra el **PVP matriculada** de la tarifa de Motodest de noviembre de 2026. La tarifa no se sube al repositorio porque contiene márgenes.

## Pendiente de confirmar con el cliente

- Razón social y NIF para el aviso legal y la política de privacidad. En la web aparecen marcados en rojo como `[PENDIENTE]`.
- URLs de Facebook, Instagram y YouTube (`EMPRESA.redes` en `src/data/sitio.ts`).
- Que el 630 55 34 94 tenga WhatsApp.
- Sin precio en la tarifa:
  - XEF Rally Factory y XEF Rally 2025.
  - RR Motard 2T 50 X Special Edition.
  - CFMOTO 1000MT-X y UFORCE 1000 XL.
  - CFMOTO 675NK: se mantiene el «desde 6.495 €» de la web antigua.
- Foto de la MITT 808: la web antigua tenía puesta la de la Legend 125.
- Modelos que ya no están en la web oficial de su marca:
  - CFORCE 520S y 520L, y ZFORCE 1000 Sport-R. Siguen en la tarifa.
  - Beta EVO de 2025 y Minicross E 48V.
- Retirados por no existir en la gama ni en la tarifa: Beta Xtrainer 250 y CFMOTO UFORCE 1000.
- La «RX 300 2T» se ha renombrado a **RX 350 2T**, que es el modelo real de Beta (la tarifa la llama RX 300).
