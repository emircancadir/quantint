'use server';

import { hash } from '@node-rs/argon2';
import { AuthError } from 'next-auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { signIn, signOut } from '@/lib/auth';
import { consumeRateLimit, getClientAddress } from '@/lib/rate-limit';
import { safeRedirectPath } from '@/lib/redirects';

export type AuthFormState = {
  error?: 'invalid' | 'exists' | 'credentials' | 'rate-limit' | 'unknown';
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
  const requestHeaders = await headers();
  const registrationLimit = await consumeRateLimit({
    namespace: 'register-ip',
    identifier: getClientAddress(requestHeaders),
    limit: 5,
    windowMs: 60 * 60_000,
  });
  if (!registrationLimit.allowed) return { error: 'rate-limit' };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'exists' };

  try {
    await prisma.user.create({
      data: {
        email,
        name: parsed.data.name,
        passwordHash: await hash(parsed.data.password),
        role: 'USER',
      },
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return { error: 'exists' };
    }
    console.error('register failed:', error);
    return { error: 'unknown' };
  }

  // signIn redirects on success (throws NEXT_REDIRECT, which must propagate).
  try {
    await signIn('credentials', {
      email,
      password: parsed.data.password,
      redirectTo: safeRedirectPath(formData.get('redirectTo'), '/'),
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
      redirectTo: safeRedirectPath(formData.get('redirectTo'), '/'),
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
