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
import type { Root, Element, ElementContent } from 'hast';

export type TocItem = { id: string; text: string; level: 2 | 3 };

function plainText(node: ElementContent | Element): string {
  if (node.type === 'text') return node.value;
  if ('children' in node) return node.children.map((child) => plainText(child)).join('');
  return '';
}

function headingSlug(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

/** Adds stable anchors and stores a per-document table of contents on vfile. */
function rehypeHeadings() {
  return (tree: Root, file: { data: Record<string, unknown> }) => {
    const toc: TocItem[] = [];
    const used = new Map<string, number>();
    const visit = (node: Root | Element) => {
      if (node.type === 'element' && (node.tagName === 'h2' || node.tagName === 'h3')) {
        const text = plainText(node);
        const base = headingSlug(text);
        const count = used.get(base) ?? 0;
        used.set(base, count + 1);
        const id = count ? `${base}-${count + 1}` : base;
        node.properties.id = id;
        node.children.push({
          type: 'element',
          tagName: 'a',
          properties: {
            href: `#${id}`,
            className: ['q-heading-anchor'],
            ariaLabel: `Link to ${text}`,
          },
          children: [{ type: 'text', value: '#' }],
        });
        toc.push({ id, text, level: node.tagName === 'h2' ? 2 : 3 });
      }
      if ('children' in node) {
        for (const child of node.children) {
          if (child.type === 'element') visit(child);
        }
      }
    };
    visit(tree);
    file.data.toc = toc;
  };
}

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
  clobberPrefix: '',
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className', /^language-./]],
    div: [...(defaultSchema.attributes?.div ?? []), ['className', 'math', 'math-display']],
    span: [...(defaultSchema.attributes?.span ?? []), ['className', 'math', 'math-inline']],
    h2: [...(defaultSchema.attributes?.h2 ?? []), 'id'],
    h3: [...(defaultSchema.attributes?.h3 ?? []), 'id'],
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      ['className', 'q-heading-anchor'],
      'ariaLabel',
    ],
  },
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeHeadings)
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

export async function renderMarkdownDocument(
  src: string,
): Promise<{ html: string; toc: TocItem[] }> {
  const file = await processor.process(src);
  return {
    html: String(file),
    toc: (file.data.toc as TocItem[] | undefined) ?? [],
  };
}

export async function renderCommentMarkdown(src: string): Promise<string> {
  const file = await commentProcessor.process(src);
  return String(file);
}
