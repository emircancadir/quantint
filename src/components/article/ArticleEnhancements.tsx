'use client';

import { useEffect, useState } from 'react';

export default function ArticleEnhancements({ copyLabel, copiedLabel }: { copyLabel: string; copiedLabel: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>('.q-article-main');
    if (!article) return;

    const update = () => {
      const start = article.offsetTop;
      const distance = Math.max(article.offsetHeight - window.innerHeight, 1);
      setProgress(Math.max(0, Math.min(100, ((window.scrollY - start) / distance) * 100)));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    const cleanups: Array<() => void> = [];
    for (const pre of article.querySelectorAll('pre')) {
      if (pre.querySelector('.q-copy-code')) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'q-copy-code';
      button.textContent = copyLabel;
      const onClick = async () => {
        const code = pre.querySelector('code')?.textContent ?? '';
        let copied = false;
        try {
          await navigator.clipboard.writeText(code);
          copied = true;
        } catch {
          // Clipboard permissions vary between localhost browser shells. Keep a
          // selection-based fallback so the button still works in development.
          const textarea = document.createElement('textarea');
          textarea.value = code;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.append(textarea);
          textarea.select();
          copied = document.execCommand('copy');
          textarea.remove();
        }
        if (copied) {
          button.textContent = copiedLabel;
          window.setTimeout(() => (button.textContent = copyLabel), 1600);
        } else {
          button.textContent = copyLabel;
        }
      };
      button.addEventListener('click', onClick);
      pre.append(button);
      cleanups.push(() => button.removeEventListener('click', onClick));
    }

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [copiedLabel, copyLabel]);

  return (
    <div className="q-reading-progress" aria-hidden="true">
      <span style={{ width: `${progress}%` }} />
    </div>
  );
}
