import { prisma } from '@/lib/db';
import TaxonomyManager from '@/components/admin/TaxonomyManager';

export default async function TaxonomyPage() {
  const [tags, series] = await Promise.all([
    prisma.tag.findMany({
      orderBy: { nameTr: 'asc' },
      include: { _count: { select: { posts: true } } },
    }),
    prisma.series.findMany({
      orderBy: { nameTr: 'asc' },
      include: { _count: { select: { posts: true } } },
    }),
  ]);

  return (
    <>
      <h1 style={{ margin: '0 0 8px', fontSize: '30px', fontWeight: 700 }}>
        Etiketler ve Seriler
      </h1>
      <p style={{ margin: '0 0 28px', color: '#5B6673' }}>
        Yazıları keşfedilebilir kılan çift dilli etiketleri ve sıralı öğrenme serilerini yönetin.
      </p>
      <TaxonomyManager
        tags={tags.map((tag) => ({ ...tag, postCount: tag._count.posts }))}
        series={series.map((item) => ({ ...item, postCount: item._count.posts }))}
      />
    </>
  );
}
