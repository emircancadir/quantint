'use client';

import { useEffect, useRef, useState } from 'react';

type Dot = {
  x: number;
  y: number;
  color: '#101820' | '#3168B4';
};

// The exact 64 × 64 geometry used by the navbar logo.
const DOTS: Dot[] = [
  { x: 30, y: 5, color: '#101820' },
  { x: 47.7, y: 12.3, color: '#101820' },
  { x: 55, y: 30, color: '#101820' },
  { x: 30, y: 55, color: '#101820' },
  { x: 12.3, y: 47.7, color: '#101820' },
  { x: 5, y: 30, color: '#101820' },
  { x: 12.3, y: 12.3, color: '#101820' },
  { x: 47.7, y: 47.7, color: '#3168B4' },
  { x: 59.1, y: 59.1, color: '#3168B4' },
];

const DOT_STARTS = [
  [-7, 8],
  [-10, -2],
  [-5, -8],
  [3, -9],
  [9, -4],
  [10, 4],
  [5, 9],
  [-4, 10],
  [-9, 5],
];

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_CONTROLLED = 'cubic-bezier(0.16, 1, 0.3, 1)';

// Upper/left dots lead; the two blue dots land in the middle and at the end.
// Values are intentionally close enough to avoid a "beads on a string" rhythm.
const FLOW_DELAYS = [0, 70, 115, 205, 145, 50, 30, 175, 245];
const CURVE_DIRECTIONS = [-1, 1, -1, 1, -1, 1, -1, 1, -1];

export default function Splash() {
  const [done, setDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLSpanElement>(null);
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const word = wordRef.current;
    const period = periodRef.current;
    if (!overlay || !word || !period) return;
    const splashOverlay = overlay;

    const animations: Animation[] = [];
    const flightAnimations: Animation[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    const animationFrames: number[] = [];
    let finished = false;
    let flowStarted = false;
    const navLogo = document.getElementById('q-nav-logo');
    const navCircles = navLogo
      ? Array.from(navLogo.querySelectorAll<SVGCircleElement>('circle'))
      : [];
    const navWord = navLogo?.nextElementSibling as HTMLElement | null;
    const scrollKeys = new Set([
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'End',
      'Home',
      'PageDown',
      'PageUp',
      ' ',
    ]);
    const preventScroll = (event: Event) => event.preventDefault();
    const preventScrollKey = (event: KeyboardEvent) => {
      if (scrollKeys.has(event.key)) event.preventDefault();
    };

    const setNavLogoVisible = (visible: boolean) => {
      document.documentElement.style.setProperty(
        '--q-navlogo-opacity',
        visible ? '1' : '0',
      );
    };

    const revealNavbar = () => {
      setNavLogoVisible(true);
      navCircles.forEach((circle) => {
        circle.style.visibility = 'visible';
      });
      if (navWord) {
        navWord.style.opacity = '1';
        navWord.style.transform = 'translateY(0)';
      }
    };

    const unlockScroll = () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('keydown', preventScrollKey);
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      revealNavbar();
      window.removeEventListener('resize', handleResize);
      setDone(true);
      // React removes only the already-transparent overlay. Release the scroll
      // lock on the following frame so the DOM handoff and geometry cleanup do
      // not compete in the same paint.
      animationFrames.push(requestAnimationFrame(unlockScroll));
    };

    const later = (callback: () => void, delay: number) => {
      timers.push(setTimeout(callback, delay));
    };

    // Keep the native scrollbar in place so viewport geometry never changes.
    // Input is locked without mutating html/body overflow or width.
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', preventScrollKey);
    setNavLogoVisible(true);
    navCircles.forEach((circle) => {
      circle.style.visibility = 'hidden';
    });
    if (navWord) {
      navWord.style.opacity = '0';
      navWord.style.transform = 'translateY(4px)';
      navWord.style.transition = 'none';
    }

    function handleResize() {
      if (!flowStarted || finished) return;

      // During the short flight the viewport's coordinate system can change
      // abruptly. A clean immediate handoff is safer than landing off-target.
      flightAnimations.forEach((animation) => animation.cancel());
      dotRefs.current.forEach((dot) => {
        if (dot) dot.style.opacity = '0';
      });
      revealNavbar();
      const resizeFade = splashOverlay.animate(
          [{ opacity: getComputedStyle(splashOverlay).opacity }, { opacity: 0 }],
          {
            duration: 180,
            easing: 'ease-out',
            fill: 'forwards',
          },
        );
      animations.push(resizeFade);
      void resizeFade.finished.then(finish).catch(() => undefined);
    }

    window.addEventListener('resize', handleResize, { passive: true });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      revealNavbar();
      const reducedFade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
          delay: 40,
          duration: 140,
          easing: 'ease-out',
          fill: 'forwards',
        });
      animations.push(reducedFade);
      void reducedFade.finished.then(finish).catch(() => undefined);
      later(finish, 200);
    } else {
      // 0.30–1.15s: the compact abstract cluster resolves into the Q.
      dotRefs.current.forEach((dot, index) => {
        if (!dot) return;
        const [x, y] = DOT_STARTS[index];
        animations.push(
          dot.animate(
            [
              {
                opacity: 0,
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(.7)`,
                filter: 'blur(1.4px)',
              },
              {
                opacity: 0.88,
                transform: `translate(-50%, -50%) translate(${x * -0.12}px, ${y * -0.12}px) scale(1.025)`,
                filter: 'blur(0)',
                offset: 0.82,
              },
              {
                opacity: 1,
                transform: 'translate(-50%, -50%) translate(0, 0) scale(1)',
                filter: 'blur(0)',
              },
            ],
            {
              delay: 300 + index * 24,
              duration: 780,
              easing: EASE_OUT,
              fill: 'forwards',
            },
          ),
        );
      });

      // 1.15–1.88s: the wordmark rises as one calm unit; the blue period settles last.
      animations.push(
        word.animate(
          [
            { opacity: 0, transform: 'translateY(15px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { delay: 1150, duration: 700, easing: EASE_OUT, fill: 'forwards' },
        ),
      );
      animations.push(
        period.animate(
          [
            { opacity: 0, transform: 'scale(.7)' },
            { opacity: 1, transform: 'scale(1)' },
          ],
          { delay: 1270, duration: 480, easing: EASE_OUT, fill: 'forwards' },
        ),
      );

      // 2.40s: the wordmark recedes while the dots begin to flow.
      animations.push(
        word.animate(
          [
            { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0)' },
            {
              opacity: 0,
              transform: 'translateY(-4px) scale(.99)',
              filter: 'blur(1.2px)',
            },
          ],
          { delay: 2400, duration: 700, easing: EASE_CONTROLLED, fill: 'forwards' },
        ),
      );

      later(() => {
        void document.fonts.ready.then(() => {
          if (finished) return;
          flowStarted = true;
          if (navCircles.length !== DOTS.length) {
            revealNavbar();
            return;
          }

          dotRefs.current.forEach((dot, index) => {
          const targetCircle = navCircles[index];
          if (!dot || !targetCircle) return;

          const sourceRect = dot.getBoundingClientRect();
          const targetRect = targetCircle.getBoundingClientRect();
          const dx = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
          const dy = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);
          const distance = Math.hypot(dx, dy) || 1;
          const nx = -dy / distance;
          const ny = dx / distance;
          const curve = Math.min(24, Math.max(12, distance * 0.025)) * CURVE_DIRECTIONS[index];
          const scale = targetRect.width / sourceRect.width;
          const delay = FLOW_DELAYS[index];

          const flight = dot.animate(
            [
              {
                opacity: 1,
                transform: 'translate(-50%, -50%) translate3d(0, 0, 0) scale(1)',
              },
              {
                opacity: 1,
                transform: `translate(-50%, -50%) translate3d(${dx * 0.36 + nx * curve}px, ${dy * 0.36 + ny * curve}px, 0) scale(${1 - (1 - scale) * 0.32})`,
                offset: 0.38,
              },
              {
                opacity: 1,
                transform: `translate(-50%, -50%) translate3d(${dx * 0.76 + nx * curve * 0.42}px, ${dy * 0.76 + ny * curve * 0.42}px, 0) scale(${1 - (1 - scale) * 0.73})`,
                offset: 0.74,
              },
              {
                opacity: 1,
                transform: `translate(-50%, -50%) translate3d(${dx}px, ${dy}px, 0) scale(${scale})`,
              },
            ],
            {
              delay,
              duration: 900,
              easing: EASE_OUT,
              fill: 'forwards',
            },
          );

          flight.onfinish = () => {
            if (finished) return;
            // Two paints guarantee there is never a frame with neither copy:
            // first reveal the real SVG circle, then retire its moving twin.
            animationFrames.push(
              requestAnimationFrame(() => {
                targetCircle.style.visibility = 'visible';
                animationFrames.push(
                  requestAnimationFrame(() => {
                    dot.style.opacity = '0';
                  }),
                );
              }),
            );
          };
          flightAnimations.push(flight);
          animations.push(flight);
          });

          if (navWord) {
            navWord.style.transition = '';
            animations.push(
              navWord.animate(
                [
                  { opacity: 0, transform: 'translateY(4px)' },
                  { opacity: 1, transform: 'translateY(0)' },
                ],
                { delay: 740, duration: 360, easing: EASE_OUT, fill: 'forwards' },
              ),
            );
          }
        });
      }, 2450);

      // 3.10s: reveal the page beneath the final portion of the dot flow.
      later(() => {
        const hero = document.querySelector<HTMLElement>('[data-q="hero"]');
        const left = hero?.children.item(0) as HTMLElement | null;
        const right = hero?.children.item(1) as HTMLElement | null;
        const leftItems = left
          ? Array.from(left.children).filter((item): item is HTMLElement => item instanceof HTMLElement)
          : [];

        [...leftItems, ...(right ? [right] : [])].forEach((item, index) => {
          const delay = index < leftItems.length ? index * 75 : 120;
          animations.push(
            item.animate(
              [
                { opacity: 0, transform: 'translateY(14px)' },
                { opacity: 1, transform: 'translateY(0)' },
              ],
              { delay, duration: 620, easing: EASE_OUT, fill: 'both' },
            ),
          );
        });
      }, 3100);

      const overlayFade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
          delay: 3200,
          duration: 720,
          easing: EASE_CONTROLLED,
          fill: 'forwards',
        });
      animations.push(overlayFade);
      void overlayFade.finished.then(finish).catch(() => undefined);

      // Independent fail-safe: the splash can never block the application.
      later(finish, 4200);
    }

    return () => {
      timers.forEach(clearTimeout);
      animationFrames.forEach(cancelAnimationFrame);
      animations.forEach((animation) => animation.cancel());
      window.removeEventListener('resize', handleResize);
      unlockScroll();
      navCircles.forEach((circle) => {
        circle.style.visibility = '';
      });
      if (navWord) {
        navWord.style.opacity = '';
        navWord.style.transform = '';
        navWord.style.transition = '';
      }
      setNavLogoVisible(true);
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        overflow: 'hidden',
        background: '#F6F7F9',
        pointerEvents: 'auto',
        willChange: 'opacity',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(16px, 2vw, 24px)',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          style={{
            position: 'relative',
            flex: '0 0 auto',
            width: 'clamp(72px, 7vw, 96px)',
            aspectRatio: '1',
            willChange: 'transform, opacity',
          }}
        >
          {DOTS.map((dot, index) => (
            <span
              key={`${dot.x}-${dot.y}`}
              ref={(element) => {
                dotRefs.current[index] = element;
              }}
              style={{
                position: 'absolute',
                left: `${(dot.x / 64) * 100}%`,
                top: `${(dot.y / 64) * 100}%`,
                width: `${(9.8 / 64) * 100}%`,
                aspectRatio: '1',
                borderRadius: '50%',
                background: dot.color,
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(.7)',
                transformOrigin: 'center',
                willChange: 'transform, opacity, filter',
              }}
            />
          ))}
        </div>

        <div style={{ overflow: 'hidden', padding: '5px 0' }}>
          <div
            ref={wordRef}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              color: '#101820',
              fontFamily: 'var(--font-plex-sans), IBM Plex Sans, sans-serif',
              fontSize: 'clamp(40px, 5vw, 60px)',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: 1,
              opacity: 0,
              transform: 'translateY(15px)',
              whiteSpace: 'nowrap',
              willChange: 'transform, opacity',
            }}
          >
            quantint
            <span
              ref={periodRef}
              style={{
                display: 'inline-block',
                color: '#3168B4',
                opacity: 0,
                transform: 'scale(.7)',
                transformOrigin: '50% 80%',
              }}
            >
              .
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
