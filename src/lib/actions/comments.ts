'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { auth, requireAdmin } from '@/lib/auth';

export type CommentFormState = {
  error?: 'auth' | 'invalid' | 'rate-limit' | 'unknown';
  ok?: boolean;
} | null;

const commentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().trim().min(3).max(4000),
  // Honeypot: humans never fill this hidden field.
  website: z.string().max(0).optional().or(z.literal('')),
});

/** Submit a comment. Requires a session; lands as PENDING for moderation. */
export async function submitComment(
  _prev: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const session = await auth();
  if (!session?.user) return { error: 'auth' };

  const parsed = commentSchema.safeParse({
    postId: formData.get('postId'),
    body: formData.get('body'),
    website: formData.get('website') ?? '',
  });
  if (!parsed.success) return { error: 'invalid' };

  // Rate limit: at most 5 comments per user per 10 minutes.
  const recent = await prisma.comment.count({
    where: {
      authorId: session.user.id,
      createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
    },
  });
  if (recent >= 5) return { error: 'rate-limit' };

  const post = await prisma.post.findFirst({
    where: { id: parsed.data.postId, status: 'PUBLISHED' },
    select: { id: true, slugTr: true, slugEn: true },
  });
  if (!post) return { error: 'invalid' };

  try {
    await prisma.comment.create({
      data: {
        body: parsed.data.body,
        postId: post.id,
        authorId: session.user.id,
        status: 'PENDING',
      },
    });
  } catch (e) {
    console.error('submitComment failed:', e);
    return { error: 'unknown' };
  }

  revalidatePath(`/tr/blog/${post.slugTr}`);
  revalidatePath(`/en/blog/${post.slugEn}`);
  return { ok: true };
}

/** Admin moderation: approve / reject / mark spam. */
export async function moderateComment(formData: FormData) {
  const session = await requireAdmin();
  if (!session) return;

  const id = formData.get('id');
  const status = formData.get('status');
  if (
    typeof id !== 'string' ||
    typeof status !== 'string' ||
    !['APPROVED', 'REJECTED', 'SPAM'].includes(status)
  ) {
    return;
  }

  await prisma.comment.update({
    where: { id },
    data: { status: status as 'APPROVED' | 'REJECTED' | 'SPAM' },
  });
  revalidatePath('/admin/comments');
}
