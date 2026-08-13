'use client';

import { useActionState } from 'react';
import {
  deleteSeries,
  deleteTag,
  saveSeries,
  saveTag,
  type TaxonomyFormState,
} from '@/lib/actions/taxonomy';
import { errorText, fieldLabel, textInput } from '@/components/auth/formStyles';

type TagItem = {
  id: string;
  slug: string;
  nameTr: string;
  nameEn: string;
  postCount: number;
};
type SeriesItem = TagItem & { descriptionTr: string; descriptionEn: string };

const errors: Record<string, string> = {
  forbidden: 'Bu işlem için yetkiniz yok.',
  invalid: 'Alanları kontrol edin.',
  'slug-taken': 'Bu slug zaten kullanılıyor.',
  'in-use': 'Yazılarda kullanılan kayıt silinemez.',
  unknown: 'Kaydedilemedi, tekrar deneyin.',
};

function Row({ item, kind }: { item?: TagItem | SeriesItem; kind: 'tag' | 'series' }) {
  const save = kind === 'tag' ? saveTag : saveSeries;
  const remove = kind === 'tag' ? deleteTag : deleteSeries;
  const [state, action, pending] = useActionState<TaxonomyFormState, FormData>(save, null);
  const [deleteState, deleteAction, deleting] = useActionState<TaxonomyFormState, FormData>(remove, null);
  const isSeries = kind === 'series';
  const series = isSeries ? (item as SeriesItem | undefined) : undefined;

  return (
    <div className="q-taxonomy-row">
      {(state?.error || deleteState?.error) && (
        <p style={{ ...errorText, marginBottom: '12px' }}>
          {errors[state?.error ?? deleteState?.error ?? 'unknown']}
        </p>
      )}
      <form action={action} className="q-taxonomy-form">
        {item && <input type="hidden" name="id" value={item.id} />}
        <label style={fieldLabel}>
          slug
          <input name="slug" required defaultValue={item?.slug} style={textInput} />
        </label>
        <label style={fieldLabel}>
          Ad (TR)
          <input name="nameTr" required defaultValue={item?.nameTr} style={textInput} />
        </label>
        <label style={fieldLabel}>
          Name (EN)
          <input name="nameEn" required defaultValue={item?.nameEn} style={textInput} />
        </label>
        {isSeries && (
          <>
            <label style={fieldLabel}>
              Açıklama (TR)
              <input name="descriptionTr" defaultValue={series?.descriptionTr} style={textInput} />
            </label>
            <label style={fieldLabel}>
              Description (EN)
              <input name="descriptionEn" defaultValue={series?.descriptionEn} style={textInput} />
            </label>
          </>
        )}
        <button type="submit" disabled={pending} className="q-admin-save">
          {item ? 'Güncelle' : '+ Ekle'}
        </button>
      </form>
      {item && (
        <div className="q-taxonomy-meta">
          <span>{item.postCount} yazı</span>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={item.id} />
            <button type="submit" disabled={deleting || item.postCount > 0}>
              Sil
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function TaxonomyManager({ tags, series }: { tags: TagItem[]; series: SeriesItem[] }) {
  return (
    <div className="q-taxonomy-grid">
      <section>
        <h2>Etiketler</h2>
        {tags.map((tag) => <Row key={tag.id} kind="tag" item={tag} />)}
        <Row kind="tag" />
      </section>
      <section>
        <h2>Seriler</h2>
        {series.map((item) => <Row key={item.id} kind="series" item={item} />)}
        <Row kind="series" />
      </section>
    </div>
  );
}
