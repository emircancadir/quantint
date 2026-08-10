import 'server-only';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeShiki from '@shikijs/rehype';
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

/**
 * Markdown → HTML, entirely server-side: GFM + $math$ (KaTeX) + fenced code
 * (Shiki). The output ships as static HTML in the SSR payload — no client JS.
 *
 * Order matters: sanitize runs BEFORE KaTeX/Shiki. Author markdown is stripped
 * of anything dangerous first, then the two renderers add their (trusted,
 * generated) markup. Sanitizing afterwards would destroy their inline styles
 * and class-heavy output; sanitizing first keeps exactly the same safety
 * guarantee, since both renderers only transform text/code nodes that already
 * passed the filter.
 *
 * The math-node exceptions below keep remark-math's parsed nodes alive through
 * sanitization so rehype-katex can still find them.
 */
const sanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className', /^language-./]],
    div: [...(defaultSchema.attributes?.div ?? []), ['className', 'math', 'math-display']],
    span: [...(defaultSchema.attributes?.span ?? []), ['className', 'math', 'math-inline']],
  },
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeKatex)
  // Single light theme: post bodies render on the white card, matching the
  // design's light reading surface.
  .use(rehypeShiki, { theme: 'github-light' })
  .use(rehypeStringify);

/** Comment rendering: same pipeline minus code theming complexity — comments
 *  allow basic markdown but no raw HTML (sanitize strips it). */
const commentProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize, {
    ...defaultSchema,
    // No images inside comments.
    tagNames: (defaultSchema.tagNames ?? []).filter((t) => t !== 'img'),
  })
  .use(rehypeStringify);

export async function renderMarkdown(src: string): Promise<string> {
  const file = await processor.process(src);
  return String(file);
}

export async function renderCommentMarkdown(src: string): Promise<string> {
  const file = await commentProcessor.process(src);
  return String(file);
}
