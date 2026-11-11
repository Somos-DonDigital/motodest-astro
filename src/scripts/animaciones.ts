// Animaciones con GSAP + ScrollTrigger. Discretas, rápidas y sin bloquear la carga:
// si el usuario pide menos movimiento, no se anima nada.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;

function iniciar() {
  if (reducir) return;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('anim');

  // Texto del carrusel: entra desde abajo
  const capa = document.querySelector('.carr__diapo .carr__capa');
  if (capa) gsap.from(capa.children, { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.15 });

  // Barra de ventajas
  gsap.from('.ventajas li', { y: 16, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.07, delay: 0.4 });

  // Títulos de sección y su trazo naranja
  gsap.utils.toArray<HTMLElement>('.tit-seccion, .seccion h2, .form-sec__tit').forEach((t) => {
    gsap.from(t, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: t, start: 'top 88%', once: true } });
  });

  // Grupos que entran escalonados
  const grupos: [string, string][] = [
    ['.franjas', '.franja'],
    ['.servicios', '.servicio'],
    ['.gama__franjas', '.gama__item'],
    ['.rejilla--motos', '.tm'],
    ['.marcas-acc__lista', 'li'],
    ['.claves__lista', 'li'],
    ['.pie__rejilla', ':scope > div'],
  ];
  grupos.forEach(([cont, item]) => {
    document.querySelectorAll<HTMLElement>(cont).forEach((c) => {
      const hijos = c.querySelectorAll(item);
      if (!hijos.length) return;
      gsap.from(hijos, { y: 40, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: c, start: 'top 85%', once: true } });
    });
  });

  // Fichas de categoría: la moto entra deslizándose y la palabra de fondo se desplaza con el scroll
  gsap.utils.toArray<HTMLElement>('.fc').forEach((f, i) => {
    gsap.from(f.querySelector('.fc__img'), { x: i % 2 ? 60 : -60, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: f, start: 'top 85%', once: true } });
    gsap.from(f.querySelector('.fc__cuerpo'), { y: 30, opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.15, scrollTrigger: { trigger: f, start: 'top 80%', once: true } });
  });
  gsap.utils.toArray<HTMLElement>('.fila').forEach((fila) => {
    gsap.fromTo(fila, { '--desp': '6%' }, { '--desp': '-6%', ease: 'none', scrollTrigger: { trigger: fila, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Bloques con imagen grande: ligero parallax
  gsap.utils.toArray<HTMLElement>('.historia__img, .banner__img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -6, scale: 1.08 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement!, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.from('.historia__txt > *', { x: -30, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.historia', start: 'top 75%', once: true } });

  // Calculadora: la cuota "late" al cambiar
  document.querySelectorAll<HTMLElement>('[data-cuota]').forEach((c) => {
    c.closest('[data-calc]')?.addEventListener('input', () => gsap.fromTo(c, { scale: 1.08 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }));
  });

  // Galería de la ficha: fundido al cambiar de color
  document.querySelectorAll('.galeria__mini, button.fc__color, .tm__color').forEach((b) => b.addEventListener('click', () => requestAnimationFrame(() => {
    const cont = b.closest('.galeria, .fc, .tm');
    const act = cont?.querySelector('.galeria__img.activa, .fc__foto.activa, .tm__foto.activa');
    if (act) gsap.fromTo(act, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'transform,opacity' });
  })));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
else iniciar();
