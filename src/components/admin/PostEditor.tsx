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
type TaxonomyOption = { id: string; nameTr: string; nameEn: string };

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
  referencesTr: string;
  referencesEn: string;
  readMin: number;
  categoryId: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  scheduledAt: string;
  seriesId: string;
  seriesOrder: number;
  tagIds: string[];
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
  referencesTr: '',
  referencesEn: '',
  readMin: 10,
  categoryId: '',
  status: 'DRAFT',
  scheduledAt: '',
  seriesId: '',
  seriesOrder: 1,
  tagIds: [],
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
  scheduledAt: 'planlı yayın için tarih ve saat seçin',
};

export default function PostEditor({
  initial,
  categories,
  tags,
  series,
}: {
  initial?: PostEditorValues;
  categories: CategoryOption[];
  tags: TaxonomyOption[];
  series: TaxonomyOption[];
}) {
  const [values, setValues] = useState<PostEditorValues>(initial ?? EMPTY);
  const [lang, setLang] = useState<'tr' | 'en'>('tr');
  const [previewHtml, setPreviewHtml] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const [state, action, pending] = useActionState<PostFormState, FormData>(
    savePost,
    null,
  );
  // Slug fields follow the title until the user edits them by hand.
  const slugTouched = useRef({ tr: !!initial, en: !!initial });
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialSnapshot = useRef(JSON.stringify(initial ?? EMPTY));
  const draftKey = `quantint:post-draft:${initial?.id ?? 'new'}`;

  const set = <K extends keyof PostEditorValues>(k: K, v: PostEditorValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const body = lang === 'tr' ? values.bodyTr : values.bodyEn;

  // Local auto-draft keeps work safe during localhost refreshes and dev-server
  // restarts without mutating the database on every keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem(draftKey);
      if (!saved) return;
      try {
        const parsed = JSON.parse(saved) as { values: PostEditorValues; savedAt: string };
        if (confirm(`Kaydedilmemiş yerel taslak bulundu (${new Date(parsed.savedAt).toLocaleString('tr-TR')}). Geri yüklensin mi?`)) {
          const base = JSON.parse(initialSnapshot.current) as PostEditorValues;
          setValues({ ...base, ...parsed.values });
          setDraftStatus('Yerel taslak geri yüklendi');
        }
      } catch {
        localStorage.removeItem(draftKey);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [draftKey]);

  useEffect(() => {
    if (JSON.stringify(values) === initialSnapshot.current) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify({ values, savedAt: new Date().toISOString() }));
      setDraftStatus('Yerel taslak kaydedildi');
    }, 700);
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [draftKey, values]);

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
    <form
      action={action}
      onSubmit={() => localStorage.removeItem(draftKey)}
    >
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <input type="hidden" name="bodyTr" value={values.bodyTr} />
      <input type="hidden" name="bodyEn" value={values.bodyEn} />
      <input type="hidden" name="referencesTr" value={values.referencesTr} />
      <input type="hidden" name="referencesEn" value={values.referencesEn} />

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
            onChange={(e) =>
              set('status', e.target.value as PostEditorValues['status'])
            }
            style={{ ...textInput, height: '46px' }}
          >
            <option value="DRAFT">Taslak</option>
            <option value="SCHEDULED">Planlandı</option>
            <option value="PUBLISHED">Yayında</option>
          </select>
        </div>
        {values.status === 'SCHEDULED' && (
          <div style={{ width: '210px' }}>
            <label style={fieldLabel}>Yayın tarihi</label>
            <input
              name="scheduledAt"
              type="datetime-local"
              required
              value={values.scheduledAt}
              onChange={(e) => set('scheduledAt', e.target.value)}
              style={textInput}
            />
          </div>
        )}
      </div>

      <div className="q-editor-taxonomy">
        <div>
          <label style={fieldLabel}>Seri</label>
          <select
            name="seriesId"
            value={values.seriesId}
            onChange={(e) => set('seriesId', e.target.value)}
            style={{ ...textInput, height: '46px' }}
          >
            <option value="">Seri yok</option>
            {series.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nameTr} / {item.nameEn}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={fieldLabel}>Seri sırası</label>
          <input
            name="seriesOrder"
            type="number"
            min={1}
            max={999}
            disabled={!values.seriesId}
            value={values.seriesOrder}
            onChange={(e) => set('seriesOrder', Number(e.target.value))}
            style={textInput}
          />
        </div>
        <fieldset>
          <legend style={fieldLabel}>Etiketler</legend>
          <div className="q-editor-tags">
            {tags.length === 0 && (
              <span>Önce “Etiket &amp; Seriler” sayfasından etiket ekleyin.</span>
            )}
            {tags.map((tag) => (
              <label key={tag.id}>
                <input
                  type="checkbox"
                  name="tagIds"
                  value={tag.id}
                  checked={values.tagIds.includes(tag.id)}
                  onChange={(event) =>
                    set(
                      'tagIds',
                      event.target.checked
                        ? [...values.tagIds, tag.id]
                        : values.tagIds.filter((id) => id !== tag.id),
                    )
                  }
                />
                {tag.nameTr}
              </label>
            ))}
          </div>
        </fieldset>
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

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '26px' }}>
        <div style={half}>
          <label style={fieldLabel}>Kaynakça (TR, Markdown)</label>
          <textarea
            rows={5}
            value={values.referencesTr}
            onChange={(e) => set('referencesTr', e.target.value)}
            placeholder={'- [Kaynak adı](https://...)'}
            style={{ ...textInput, resize: 'vertical', lineHeight: 1.55 }}
          />
        </div>
        <div style={half}>
          <label style={fieldLabel}>References (EN, Markdown)</label>
          <textarea
            rows={5}
            value={values.referencesEn}
            onChange={(e) => set('referencesEn', e.target.value)}
            placeholder={'- [Source title](https://...)'}
            style={{ ...textInput, resize: 'vertical', lineHeight: 1.55 }}
          />
        </div>
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
        <span className="q-draft-status" role="status">{draftStatus}</span>
      </div>
    </form>
  );
}
