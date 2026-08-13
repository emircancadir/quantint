import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import PostEditor from '@/components/admin/PostEditor';

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories, tags, series] = await Promise.all([
    prisma.post.findUnique({ where: { id }, include: { tags: true } }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, nameTr: true },
    }),
    prisma.tag.findMany({ orderBy: { nameTr: 'asc' }, select: { id: true, nameTr: true, nameEn: true } }),
    prisma.series.findMany({ orderBy: { nameTr: 'asc' }, select: { id: true, nameTr: true, nameEn: true } }),
  ]);
  if (!post) notFound();

  return (
    <>
      <h1
        style={{
          margin: '0 0 26px',
          fontSize: '30px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        Yazıyı Düzenle
      </h1>
      <PostEditor
        categories={categories}
        tags={tags}
        series={series}
        initial={{
          id: post.id,
          slugTr: post.slugTr,
          slugEn: post.slugEn,
          titleTr: post.titleTr,
          titleEn: post.titleEn,
          excerptTr: post.excerptTr,
          excerptEn: post.excerptEn,
          bodyTr: post.bodyTr,
          bodyEn: post.bodyEn,
          referencesTr: post.referencesTr,
          referencesEn: post.referencesEn,
          readMin: post.readMinTr ?? 10,
          categoryId: post.categoryId,
          status: post.status,
          scheduledAt:
            post.status === 'SCHEDULED' && post.publishedAt
              ? new Date(post.publishedAt.getTime() - post.publishedAt.getTimezoneOffset() * 60_000)
                  .toISOString()
                  .slice(0, 16)
              : '',
          seriesId: post.seriesId ?? '',
          seriesOrder: post.seriesOrder ?? 1,
          tagIds: post.tags.map((tag) => tag.id),
        }}
      />
    </>
  );
}
