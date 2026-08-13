import { prisma } from '@/lib/db';
import PostEditor from '@/components/admin/PostEditor';

export default async function NewPostPage() {
  const [categories, tags, series] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, nameTr: true },
    }),
    prisma.tag.findMany({ orderBy: { nameTr: 'asc' }, select: { id: true, nameTr: true, nameEn: true } }),
    prisma.series.findMany({ orderBy: { nameTr: 'asc' }, select: { id: true, nameTr: true, nameEn: true } }),
  ]);

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
        Yeni Yazı
      </h1>
      <PostEditor categories={categories} tags={tags} series={series} />
    </>
  );
}
