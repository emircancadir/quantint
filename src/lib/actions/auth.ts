'use server';

import { hash } from '@node-rs/argon2';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { signIn, signOut } from '@/lib/auth';

export type AuthFormState = {
  error?: 'invalid' | 'exists' | 'credentials' | 'unknown';
} | null;

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Public self-registration: create the account in our own User table and sign
 * straight in. No verification email — the email side of the project is on
 * hold by explicit decision.
 */
export async function register(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: 'invalid' };

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'exists' };

  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash: await hash(parsed.data.password),
      role: 'USER',
    },
  });

  // signIn redirects on success (throws NEXT_REDIRECT, which must propagate).
  try {
    await signIn('credentials', {
      email,
      password: parsed.data.password,
      redirectTo: formData.get('redirectTo')?.toString() || '/',
    });
  } catch (e) {
    if (e instanceof AuthError) return { error: 'unknown' };
    throw e;
  }
  return null;
}

export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: 'invalid' };

  try {
    await signIn('credentials', {
      email: parsed.data.email.toLowerCase().trim(),
      password: parsed.data.password,
      redirectTo: formData.get('redirectTo')?.toString() || '/',
    });
  } catch (e) {
    if (e instanceof AuthError) return { error: 'credentials' };
    throw e;
  }
  return null;
}

export async function logout() {
  await signOut({ redirectTo: '/' });
}
