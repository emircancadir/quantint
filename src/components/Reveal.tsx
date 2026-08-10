'use client';

import { useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';

/**
 * Scroll reveals, ported from `_scanReveals()` / the IntersectionObserver in
 * the design export.
 *
 * Elements opt in with `data-reveal` (server-rendered, so the content is in the
 * HTML for crawlers — only the animation is client-side). Siblings stagger by
 * 90ms. Once an element has played, the delay and the `!important` transition
 * are stripped so later hover transitions are not held up by them.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const sibs = Array.from(
            el.parentElement?.querySelectorAll(':scope > [data-reveal]') ?? [],
          );
          const i = Math.max(0, sibs.indexOf(el));
          el.style.transitionDelay = `${i * 90}ms`;
          el.classList.add('qi-in');
          io.unobserve(el);
          window.setTimeout(
            () => {
              el.style.transitionDelay = '';
              el.classList.remove('qi-in');
              el.removeAttribute('data-reveal');
            },
            i * 90 + 900,
          );
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );

    const scan = () => {
      document
        .querySelectorAll('[data-reveal]:not(.qi-in):not([data-qi-obs])')
        .forEach((el) => {
          el.setAttribute('data-qi-obs', '1');
          io.observe(el);
        });
    };

    const t = window.setTimeout(scan, 60);

    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
