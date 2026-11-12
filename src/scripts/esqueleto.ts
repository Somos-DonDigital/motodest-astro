// Esqueleto de carga: mientras una imagen no ha llegado (conexión lenta), su hueco
// muestra un brillo animado en lugar de un espacio vacío. Al cargar, desaparece.
const marcar = (img: HTMLImageElement) => {
  if (img.dataset.sk || img.closest('.cab, .pie, .asis') || img.width < 48) return;
  img.dataset.sk = '1';
  const listo = () => img.classList.add('sk-ok');
  if (img.complete && img.naturalWidth > 0) return listo();
  img.classList.add('sk');
  img.addEventListener('load', listo, { once: true });
  img.addEventListener('error', listo, { once: true });
};
const repasar = (raiz: ParentNode = document) => raiz.querySelectorAll<HTMLImageElement>('img').forEach(marcar);
repasar();
// Imágenes que se añaden después (buscador, asistente, visor)
new MutationObserver((cambios) => cambios.forEach((c) => c.addedNodes.forEach((n) => {
  if (n instanceof HTMLImageElement) marcar(n); else if (n instanceof Element) repasar(n);
}))).observe(document.body, { childList: true, subtree: true });
