'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import {
  savePost,
  deletePost,
  previewMarkdown,
  type PostFormState,
} from '@/lib/actions/posts';
import {
  fieldLabel,
  textInput,
  errorText,
} from '@/components/auth/formStyles';

type CategoryOption = { id: string; nameTr: string };

export type PostEditorValues = {
  id?: string;
  slugTr: string;
  slugEn: string;
  titleTr: string;
  titleEn: string;
  excerptTr: string;
  excerptEn: string;
  bodyTr: string;
  bodyEn: string;
  readMin: number;
  categoryId: string;
  status: 'DRAFT' | 'PUBLISHED';
};

const EMPTY: PostEditorValues = {
  slugTr: '',
  slugEn: '',
  titleTr: '',
  titleEn: '',
  excerptTr: '',
  excerptEn: '',
  bodyTr: '',
  bodyEn: '',
  readMin: 10,
  categoryId: '',
  status: 'DRAFT',
};

/** Turkish-aware slugify for auto-suggesting slugs from titles. */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: 'Bu işlem için yetkiniz yok.',
  invalid: 'Bazı alanlar eksik veya hatalı:',
  'slug-taken': 'Bu slug başka bir yazıda kullanılıyor.',
  unknown: 'Kaydedilemedi, tekrar deneyin.',
};

/** Which requirement each field enforces — shown next to the field name when
 *  the server-side schema rejects it, so the author knows exactly what to fix. */
const FIELD_LABELS: Record<string, string> = {
  categoryId: 'Kategori',
  readMin: 'Okuma (dk)',
  status: 'Durum',
  titleTr: 'Başlık (TR)',
  titleEn: 'Title (EN)',
  slugTr: 'Slug (TR)',
  slugEn: 'Slug (EN)',
  excerptTr: 'Özet (TR)',
  excerptEn: 'Excerpt (EN)',
  bodyTr: 'TR gövde',
  bodyEn: 'EN body',
};

const FIELD_HINTS: Record<string, string> = {
  categoryId: 'seçim yapın',
  readMin: '1–120 arası bir sayı',
  titleTr: 'en az 3 karakter',
  titleEn: 'en az 3 karakter',
  slugTr: 'yalnız küçük harf, rakam ve tire (ör. ornek-yazi)',
  slugEn: 'yalnız küçük harf, rakam ve tire',
  excerptTr: 'en az 10 karakter',
  excerptEn: 'en az 10 karakter',
  bodyTr: 'boş bırakılamaz',
  bodyEn: 'boş bırakılamaz',
};

export default function PostEditor({
  initial,
  categories,
}: {
  initial?: PostEditorValues;
  categories: CategoryOption[];
}) {
  const [values, setValues] = useState<PostEditorValues>(initial ?? EMPTY);
  const [lang, setLang] = useState<'tr' | 'en'>('tr');
  const [previewHtml, setPreviewHtml] = useState('');
  const [state, action, pending] = useActionState<PostFormState, FormData>(
    savePost,
    null,
  );
  // Slug fields follow the title until the user edits them by hand.
  const slugTouched = useRef({ tr: !!initial, en: !!initial });
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = <K extends keyof PostEditorValues>(k: K, v: PostEditorValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const body = lang === 'tr' ? values.bodyTr : values.bodyEn;

  // Debounced server-rendered preview — the exact pipeline the site uses, so
  // preview output === published output.
  useEffect(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      previewMarkdown(body).then(setPreviewHtml).catch(() => {});
    }, 450);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [body]);

  const tab = (active: boolean): React.CSSProperties => ({
    padding: '7px 16px',
    borderRadius: '7px',
    fontSize: '13.5px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'var(--font-plex-mono), monospace',
    background: active ? '#101820' : '#EBEEF3',
    color: active ? '#FFFFFF' : '#5B6673',
  });

  const half: React.CSSProperties = { flex: 1, minWidth: '220px' };

  return (
    <form action={action}>
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <input type="hidden" name="bodyTr" value={values.bodyTr} />
      <input type="hidden" name="bodyEn" value={values.bodyEn} />

      {state?.error && (
        <div style={errorText}>
          {ERROR_MESSAGES[state.error]}
          {state.error === 'invalid' && state.fieldErrors && (
            <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
              {Object.keys(state.fieldErrors).map((field) => (
                <li key={field}>
                  <strong>{FIELD_LABELS[field] ?? field}</strong>
                  {FIELD_HINTS[field] ? ` — ${FIELD_HINTS[field]}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* meta row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div style={half}>
          <label style={fieldLabel}>Kategori</label>
          <select
            name="categoryId"
            required
            value={values.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
            style={{ ...textInput, height: '46px' }}
          >
            <option value="" disabled>
              Seçin…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameTr}
              </option>
            ))}
          </select>
        </div>
        <div style={{ width: '130px' }}>
          <label style={fieldLabel}>Okuma (dk)</label>
          <input
            name="readMin"
            type="number"
            min={1}
            max={120}
            required
            value={values.readMin}
            onChange={(e) => set('readMin', Number(e.target.value))}
            style={textInput}
          />
        </div>
        <div style={{ width: '160px' }}>
          <label style={fieldLabel}>Durum</label>
          <select
            name="status"
            value={values.status}
            onChange={(e) => set('status', e.target.value as 'DRAFT' | 'PUBLISHED')}
            style={{ ...textInput, height: '46px' }}
          >
            <option value="DRAFT">Taslak</option>
            <option value="PUBLISHED">Yayında</option>
          </select>
        </div>
      </div>

      {/* bilingual fields */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div style={half}>
          <label style={fieldLabel}>Başlık (TR)</label>
          <input
            name="titleTr"
            required
            value={values.titleTr}
            onChange={(e) => {
              set('titleTr', e.target.value);
              if (!slugTouched.current.tr) set('slugTr', slugify(e.target.value));
            }}
            style={textInput}
          />
        </div>
        <div style={half}>
          <label style={fieldLabel}>Title (EN)</label>
          <input
            name="titleEn"
            required
            value={values.titleEn}
            onChange={(e) => {
              set('titleEn', e.target.value);
              if (!slugTouched.current.en) set('slugEn', slugify(e.target.value));
            }}
            style={textInput}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div style={half}>
          <label style={fieldLabel}>Slug (TR)</label>
          <input
            name="slugTr"
            required
            value={values.slugTr}
            onChange={(e) => {
              slugTouched.current.tr = true;
              set('slugTr', slugify(e.target.value) || e.target.value);
            }}
            style={{ ...textInput, fontFamily: 'var(--font-plex-mono), monospace', fontSize: '13px' }}
          />
        </div>
        <div style={half}>
          <label style={fieldLabel}>Slug (EN)</label>
          <input
            name="slugEn"
            required
            value={values.slugEn}
            onChange={(e) => {
              slugTouched.current.en = true;
              set('slugEn', slugify(e.target.value) || e.target.value);
            }}
            style={{ ...textInput, fontFamily: 'var(--font-plex-mono), monospace', fontSize: '13px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '22px' }}>
        <div style={half}>
          <label style={fieldLabel}>Özet (TR)</label>
          <textarea
            name="excerptTr"
            required
            rows={2}
            value={values.excerptTr}
            onChange={(e) => set('excerptTr', e.target.value)}
            style={{ ...textInput, resize: 'vertical' }}
          />
        </div>
        <div style={half}>
          <label style={fieldLabel}>Excerpt (EN)</label>
          <textarea
            name="excerptEn"
            required
            rows={2}
            value={values.excerptEn}
            onChange={(e) => set('excerptEn', e.target.value)}
            style={{ ...textInput, resize: 'vertical' }}
          />
        </div>
      </div>

      {/* body editor + live preview */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button type="button" style={tab(lang === 'tr')} onClick={() => setLang('tr')}>
          TR gövde
        </button>
        <button type="button" style={tab(lang === 'en')} onClick={() => setLang('en')}>
          EN body
        </button>
        <span
          style={{
            marginLeft: 'auto',
            alignSelf: 'center',
            fontFamily: 'var(--font-plex-mono), monospace',
            fontSize: '11.5px',
            color: '#8A94A3',
          }}
        >
          markdown + ```kod``` + $matematik$
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '26px',
          minHeight: '440px',
        }}
      >
        <textarea
          value={body}
          onChange={(e) =>
            set(lang === 'tr' ? 'bodyTr' : 'bodyEn', e.target.value)
          }
          spellCheck={false}
          style={{
            ...textInput,
            fontFamily: 'var(--font-plex-mono), monospace',
            fontSize: '13.5px',
            lineHeight: 1.65,
            resize: 'vertical',
            minHeight: '440px',
          }}
        />
        <div
          className="q-article"
          style={{
            border: '1px solid #E4E8EE',
            borderRadius: '9px',
            background: '#FFFFFF',
            padding: '18px 22px',
            overflowY: 'auto',
            maxHeight: '640px',
            fontSize: '15px',
          }}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          type="submit"
          disabled={pending}
          className="q-subscribe-btn"
          style={{
            background: '#3168B4',
            color: '#FFFFFF',
            padding: '12px 28px',
            borderRadius: '9px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            fontFamily: 'var(--font-plex-sans), sans-serif',
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
        {values.id && (
          <button
            type="submit"
            formAction={deletePost}
            onClick={(e) => {
              if (!confirm('Bu yazı kalıcı olarak silinsin mi?')) e.preventDefault();
            }}
            style={{
              background: 'transparent',
              color: '#B3261E',
              border: '1px solid #F2C9C5',
              padding: '12px 22px',
              borderRadius: '9px',
              fontSize: '14.5px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-plex-sans), sans-serif',
            }}
          >
            Sil
          </button>
        )}
      </div>
    </form>
  );
}
