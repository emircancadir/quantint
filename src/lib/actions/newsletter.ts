'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';

export type NewsletterFormState = {
  error?: 'invalid' | 'unknown';
  ok?: boolean;
} | null;

const schema = z.object({
  email: z.string().email().max(200),
  locale: z.enum(['tr', 'en']).default('tr'),
  website: z.string().max(0).optional().or(z.literal('')), // honeypot
});

/**
 * Newsletter signup — collection only. Emails go straight to ACTIVE (single
 * opt-in) and NO email is sent: the email side of the project is deliberately
 * on hold. Double opt-in + confirmation mail slot in here later.
 */
export async function subscribeNewsletter(
  _prev: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    locale: formData.get('locale') ?? 'tr',
    website: formData.get('website') ?? '',
  });
  if (!parsed.success) return { error: 'invalid' };

  const email = parsed.data.email.toLowerCase().trim();

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      // Re-subscribing after an unsubscribe reactivates; otherwise idempotent.
      update: { status: 'ACTIVE', locale: parsed.data.locale },
      create: { email, locale: parsed.data.locale, status: 'ACTIVE' },
    });
  } catch (e) {
    console.error('subscribeNewsletter failed:', e);
    return { error: 'unknown' };
  }

  return { ok: true };
}
