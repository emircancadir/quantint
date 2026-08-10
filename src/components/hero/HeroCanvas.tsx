'use client';

import { useEffect, useRef } from 'react';

/**
 * Hero figure, ported from `_initCanvas()` in the design export: a drifting
 * point cloud whose near neighbours are linked, over a random-walk price line.
 *
 * Performance behaviour from the original is preserved:
 *  - mobile drops to a 640×418 buffer and 26 points;
 *  - link segments are bucketed by alpha so each bucket costs one stroke()
 *    instead of one per segment;
 *  - the rAF loop stops while the canvas is offscreen (IntersectionObserver) or
 *    the tab is hidden (visibilitychange).
 */
export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const mob = document.documentElement.clientWidth < 640;
    if (mob) {
      // Lower resolution is plenty on a phone.
      cv.width = 640;
      cv.height = 418;
    }

    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const W = cv.width;
    const H = cv.height;
    const N = mob ? 26 : 46;

    const pts = Array.from({ length: N }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: 3 + Math.random() * 4.5,
      blue: i % 5 === 0,
    }));

    // random-walk price line
    const M = 140;
    const walk: number[] = [H * 0.55];
    for (let i = 1; i < M; i++) {
      walk.push(walk[i - 1] + (Math.random() - 0.5) * 18);
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // grid
      ctx.strokeStyle = 'rgba(16,24,32,.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = 0; gx <= W; gx += W / 8) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
      }
      for (let gy = 0; gy <= H; gy += H / 5) {
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
      }
      ctx.stroke();

      // walk line
      walk.push(walk[walk.length - 1] + (Math.random() - 0.5) * 18);
      walk.shift();
      const mn = Math.min(...walk);
      const mx = Math.max(...walk);
      ctx.beginPath();
      walk.forEach((v, i) => {
        const x = (i / (M - 1)) * W;
        const y = 40 + ((v - mn) / (mx - mn + 1e-9)) * (H - 80);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.strokeStyle = 'rgba(49,104,180,.55)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // connections — bucketed by alpha, one stroke per bucket
      const LINK = 130;
      const LINK2 = LINK * LINK;
      const alphas = [0.03, 0.065, 0.1];
      const seg: number[][] = [[], [], []];
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK2) {
            seg[Math.min(2, (3 * (1 - Math.sqrt(d2) / LINK)) | 0)].push(i, j);
          }
        }
      }
      ctx.lineWidth = 1;
      for (let b = 0; b < 3; b++) {
        const sg = seg[b];
        if (!sg.length) continue;
        ctx.strokeStyle = `rgba(16,24,32,${alphas[b]})`;
        ctx.beginPath();
        for (let k = 0; k < sg.length; k += 2) {
          ctx.moveTo(pts[sg[k]].x, pts[sg[k]].y);
          ctx.lineTo(pts[sg[k + 1]].x, pts[sg[k + 1]].y);
        }
        ctx.stroke();
      }

      // points
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.blue ? 'rgba(49,104,180,.9)' : 'rgba(16,24,32,.75)';
        ctx.fill();
      }
    };

    let raf: number | null = null;
    let visible = true;

    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (raf === null && visible && !document.hidden) loop();
    };
    const stop = () => {
      if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };

    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(cv);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    draw(); // one static frame immediately
    start();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={1040}
      height={680}
      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
    />
  );
}
