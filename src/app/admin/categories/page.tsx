import { prisma } from '@/lib/db';
import CategoryManager from '@/components/admin/CategoryManager';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { posts: true } } },
  });

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
        Kategoriler
      </h1>
      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          key: c.key,
          code: c.code,
          nameTr: c.nameTr,
          nameEn: c.nameEn,
          order: c.order,
          postCount: c._count.posts,
        }))}
      />
    </>
  );
}
