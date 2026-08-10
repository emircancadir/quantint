import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import PostEditor from '@/components/admin/PostEditor';

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, nameTr: true },
    }),
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
          readMin: post.readMinTr ?? 10,
          categoryId: post.categoryId,
          status: post.status,
        }}
      />
    </>
  );
}
