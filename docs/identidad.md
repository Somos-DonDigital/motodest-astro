# Identidad corporativa de Motodest aplicada a la web

Fuente: manual «Identidad corporativa Motodest» (PDF de 22 páginas).

## Colores

| Color | Uso | Pantone | Hexadecimal |
|---|---|---|---|
| Azul | Fondo principal, cabecera, pie y secciones destacadas | 5255 U/C | `#0B013E` |
| Naranja | «DEST» del logo, botones, acentos y enlaces | 158 U/C | `#F47B29` |

Están definidos como variables en `src/styles/global.css` (`--azul` y `--naranja`).

## Tipografías

- **Títulos:** Death Star. El manual indica que no se use para textos largos.
  - La fuente original traía vacíos los glifos con tilde, la ñ, la diéresis y los signos «¿» y «¡».
  - En `public/fonts/death-star.woff2` hay una versión parcheada que los incluye.
- **Textos:** Cairo, autoalojada con `@fontsource-variable/cairo`.

## Logo

- La versión principal va sobre azul: isotipo y «MOTO» en blanco, «DEST» en naranja.
- La versión en positivo va sobre blanco: azul y naranja.
- Se han extraído del PDF en vectorial:
  - `public/logo-motodest.svg` (versión principal).
  - `public/logo-motodest-positivo.svg` (versión en positivo).
- Hay que respetar la zona de protección. El tamaño mínimo horizontal es de 30,5 mm, unos 115 px; en la web se usa a 140-190 px.
- No está permitido distorsionarlo, cambiar sus colores, ponerle sombras ni colocarlo sobre fondos confusos.

## Recursos gráficos

Las dobles líneas diagonales naranja y blanca de la papelería están en `public/deco-lineas.svg`. Se aplican con la clase `.deco` y en el hero de la home.
