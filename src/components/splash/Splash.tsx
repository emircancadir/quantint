'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The intro animation, ported from `_splashVals()` in the design export.
 *
 * Nine dots start in the "Q" arrangement, collapse into a ring, widen, rotate a
 * full turn, ease back into the Q, then fly one-by-one onto the navbar logo
 * before the overlay fades out. Every constant here (timings, radii, angle
 * maps, scales) is copied from the original — changing any of them changes the
 * choreography.
 *
 * Two values cross the component boundary:
 *  - the navbar logo's rect, read from the DOM at phase 6 (the flight target);
 *  - the navbar logo's opacity, handed back through a CSS variable so Navbar
 *    can stay a server component.
 */

// [cx, cy, r, color] on the same 64×64 grid as the logo SVG.
const DOTS: Array<[number, number, number, string]> = [
  [30, 5, 4.9, '#101820'],
  [47.7, 12.3, 4.9, '#101820'],
  [55, 30, 4.9, '#101820'],
  [47.7, 47.7, 4.9, '#3168B4'],
  [30, 55, 4.9, '#101820'],
  [12.3, 47.7, 4.9, '#101820'],
  [5, 30, 4.9, '#101820'],
  [12.3, 12.3, 4.9, '#101820'],
  [59.1, 59.1, 4.9, '#3168B4'],
];

// Target angles in degrees (-90 = top; y grows downward).
const ANG8: Record<number, number> = {
  0: -90,
  1: -45,
  2: 0,
  3: 45,
  4: 90,
  5: 135,
  6: 180,
  7: 225,
};
const ANG9: Record<number, number> = {
  0: -90,
  1: -50,
  2: -10,
  3: 30,
  8: 70,
  4: 110,
  5: 150,
  6: 190,
  7: 230,
};

const PHASE_TIMINGS: Array<[number, number]> = [
  [1, 700], //  wordmark wipes out
  [2, 1400], //  dots close into a "0" ring
  [3, 2250], //  outer blue dot slides in, ring widens
  [4, 3050], //  ring opens + 360° spin + recenters
  [5, 4450], //  ring eases gently back into the Q
  // 6 is scheduled separately: it must measure the nav logo first.
  [7, 7350], //  overlay fades
];

const onCircle = (deg: number, r: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
};

export default function Splash() {
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);
  // Measured lazily so the values are never read during SSR.
  const [mobile, setMobile] = useState(false);
  const navRect = useRef<DOMRect | null>(null);
  const originPt = useRef<{ x: number; y: number } | null>(null);
  const originEl = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMobile(document.documentElement.clientWidth < 640);

    // Play once per browser session: client-side navigations never remount the
    // layout, and a mid-session full reload skips straight to the site.
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || sessionStorage.getItem('qi-splash') === '1') {
      setPhase(7);
      setDone(true);
      return;
    }
    sessionStorage.setItem('qi-splash', '1');

    const timers: ReturnType<typeof setTimeout>[] = PHASE_TIMINGS.map(([p, ms]) =>
      setTimeout(() => setPhase(p), ms),
    );

    timers.push(
      setTimeout(() => {
        // Measure the target and the true origin at the same instant so a
        // scrollbar-width difference cannot skew the alignment.
        navRect.current =
          document.getElementById('q-nav-logo')?.getBoundingClientRect() ?? null;
        if (originEl.current) {
          const r = originEl.current.getBoundingClientRect();
          originPt.current = { x: r.left, y: r.top };
        }
        setPhase(6);
      }, 5750),
    );

    timers.push(setTimeout(() => setDone(true), 7950));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Hand the navbar logo's opacity back through a CSS variable.
  useEffect(() => {
    const visible = done || phase >= 6;
    document.documentElement.style.setProperty(
      '--q-navlogo-opacity',
      visible ? '1' : '0',
    );
    return () => {
      document.documentElement.style.setProperty('--q-navlogo-opacity', '1');
    };
  }, [phase, done]);

  if (done) return null;

  const s = mobile ? 1.45 : 2.2;
  const shiftX = mobile ? -104 : -160;
  const rect = navRect.current;
  // window.innerWidth includes the scrollbar and CSS 50% does not — use the
  // measured origin when we have one.
  const origin =
    originPt.current ??
    (typeof document !== 'undefined'
      ? {
          x: document.documentElement.clientWidth / 2,
          y: document.documentElement.clientHeight / 2,
        }
      : { x: 0, y: 0 });

  const R1 = 20 * s;
  const R2 = 26 * s;
  const R3 = 40 * s;

  const dots = DOTS.map((d, i) => {
    const bx = (d[0] - 30) * s;
    const by = (d[1] - 30) * s;
    const size = 2 * d[2] * s;
    let transform = 'none';
    let delay = '0ms';

    if (phase >= 6 && rect) {
      const tx = rect.left + (d[0] / 64) * rect.width - origin.x - bx;
      const ty = rect.top + (d[1] / 64) * rect.height - origin.y - by;
      const k = rect.width / 64 / s;
      transform = `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${k.toFixed(3)})`;
      delay = `${i * 90}ms`;
    } else if (phase >= 5) {
      transform = 'none'; // gentle return from the ring to the Q
      delay = `${i * 60}ms`;
    } else if (phase >= 4) {
      const [cx, cy] = onCircle(ANG9[i], R3);
      transform = `translate(${(cx - bx).toFixed(1)}px,${(cy - by).toFixed(1)}px)`;
    } else if (phase >= 3) {
      const [cx, cy] = onCircle(ANG9[i], R2);
      transform = `translate(${(cx - bx).toFixed(1)}px,${(cy - by).toFixed(1)}px)`;
    } else if (phase >= 2) {
      const [cx, cy] =
        i === 8 ? onCircle(45, R1 + 13 * s) : onCircle(ANG8[i], R1);
      transform = `translate(${(cx - bx).toFixed(1)}px,${(cy - by).toFixed(1)}px)`;
      delay = i === 8 ? '0ms' : `${i * 45}ms`;
    }

    return {
      left: bx - size / 2,
      top: by - size / 2,
      size,
      color: d[3],
      transform,
      delay,
    };
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: '#F6F7F9',
        opacity: phase >= 7 ? 0 : 1,
        transition: 'opacity .5s ease',
        pointerEvents: phase >= 7 ? 'none' : 'auto',
      }}
    >
      <div
        ref={originEl}
        style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            transform:
              phase >= 4
                ? 'translateX(0px) rotate(360deg)'
                : `translateX(${shiftX}px) rotate(0deg)`,
            transition: 'transform 1.15s cubic-bezier(.55,.05,.3,1)',
            willChange: 'transform',
          }}
        >
          {dots.map((d, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: `${d.left}px`,
                top: `${d.top}px`,
                width: `${d.size}px`,
                height: `${d.size}px`,
                borderRadius: '50%',
                background: d.color,
                transform: d.transform,
                transition: 'transform .8s cubic-bezier(.55,0,.25,1)',
                transitionDelay: d.delay,
                willChange: 'transform',
              }}
            />
          ))}
        </div>
      </div>

      <div
        data-q="splashtxt"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(0,-50%)',
          marginLeft: `${shiftX + 34 * s + (mobile ? 16 : 26)}px`,
          fontSize: '60px',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: '#101820',
          opacity: phase >= 1 ? 0 : 1,
          transition: 'opacity .6s ease',
          whiteSpace: 'nowrap',
        }}
      >
        quantint<span style={{ color: '#3168B4' }}>.</span>
      </div>
    </div>
  );
}
