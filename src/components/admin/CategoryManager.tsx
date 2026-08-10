'use client';

import { useActionState } from 'react';
import {
  saveCategory,
  deleteCategory,
  type CategoryFormState,
} from '@/lib/actions/categories';
import { fieldLabel, textInput, errorText } from '@/components/auth/formStyles';

type Category = {
  id: string;
  key: string;
  code: string;
  nameTr: string;
  nameEn: string;
  order: number;
  postCount: number;
};

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: 'Bu işlem için yetkiniz yok.',
  invalid: 'Alanları kontrol edin.',
  'key-taken': 'Bu anahtar zaten kullanılıyor.',
  'in-use': 'Bu kategoride yazı var — önce yazıları taşıyın.',
  unknown: 'Kaydedilemedi, tekrar deneyin.',
};

function CategoryRow({ cat }: { cat?: Category }) {
  const [state, action, pending] = useActionState<CategoryFormState, FormData>(
    saveCategory,
    null,
  );
  const [delState, delAction, delPending] = useActionState<
    CategoryFormState,
    FormData
  >(deleteCategory, null);

  const mono: React.CSSProperties = {
    ...textInput,
    fontFamily: 'var(--font-plex-mono), monospace',
    fontSize: '13px',
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E4E8EE',
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '10px',
      }}
    >
      {(state?.error || delState?.error) && (
        <p style={{ ...errorText, marginBottom: '12px' }}>
          {ERROR_MESSAGES[state?.error ?? delState?.error ?? 'unknown']}
        </p>
      )}
      <form
        action={action}
        style={{
          display: 'grid',
          gridTemplateColumns: '110px 80px 1fr 1fr 70px auto',
          gap: '12px',
          alignItems: 'end',
        }}
      >
        {cat && <input type="hidden" name="id" value={cat.id} />}
        <div>
          <label style={fieldLabel}>anahtar</label>
          <input name="key" required defaultValue={cat?.key} style={mono} />
        </div>
        <div>
          <label style={fieldLabel}>kod</label>
          <input name="code" required defaultValue={cat?.code} style={mono} />
        </div>
        <div>
          <label style={fieldLabel}>Ad (TR)</label>
          <input name="nameTr" required defaultValue={cat?.nameTr} style={textInput} />
        </div>
        <div>
          <label style={fieldLabel}>Name (EN)</label>
          <input name="nameEn" required defaultValue={cat?.nameEn} style={textInput} />
        </div>
        <div>
          <label style={fieldLabel}>sıra</label>
          <input
            name="order"
            type="number"
            min={0}
            defaultValue={cat?.order ?? 0}
            style={mono}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="submit"
            disabled={pending}
            style={{
              background: cat ? '#EBEEF3' : '#3168B4',
              color: cat ? '#101820' : '#FFFFFF',
              padding: '11px 18px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              fontFamily: 'var(--font-plex-sans), sans-serif',
              opacity: pending ? 0.7 : 1,
            }}
          >
            {cat ? 'Güncelle' : '+ Ekle'}
          </button>
        </div>
      </form>
      {cat && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '10px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-plex-mono), monospace',
              fontSize: '12px',
              color: '#8A94A3',
            }}
          >
            {cat.postCount} yazı
          </span>
          <form action={delAction}>
            <input type="hidden" name="id" value={cat.id} />
            <button
              type="submit"
              disabled={delPending || cat.postCount > 0}
              style={{
                background: 'none',
                border: 'none',
                color: cat.postCount > 0 ? '#C6CCD4' : '#B3261E',
                fontSize: '13px',
                cursor: cat.postCount > 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-plex-sans), sans-serif',
                padding: 0,
              }}
            >
              Sil
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function CategoryManager({ categories }: { categories: Category[] }) {
  return (
    <>
      {categories.map((c) => (
        <CategoryRow key={c.id} cat={c} />
      ))}
      <h2 style={{ margin: '28px 0 12px', fontSize: '19px', fontWeight: 700 }}>
        Yeni kategori
      </h2>
      <CategoryRow />
    </>
  );
}
