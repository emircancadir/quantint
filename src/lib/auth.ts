import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { verify } from '@node-rs/argon2';
import { z } from 'zod';
import { prisma } from './db';

/**
 * Auth.js v5, credentials-only (email + Argon2 password against our own User
 * table — the user's requirement: accounts live in the site's database).
 *
 * Session strategy is JWT, not database rows: with the Credentials provider
 * the adapter never creates Session records (an Auth.js limitation), so JWT is
 * the supported path. The role travels in the token and is re-read into every
 * session callback. The Prisma adapter still manages the User table.
 */
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    // Locale-prefixed pages render the actual forms; NextAuth only needs a
    // target for its internal redirects.
    signIn: '/tr/login',
  },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase().trim() },
        });
        if (!user?.passwordHash) return null;

        const ok = await verify(user.passwordHash, parsed.data.password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      // `user` is User | AdapterUser; the union defeats narrowing, so pick the
      // two fields we stash in the token explicitly.
      const u = user as { id?: string; role?: 'USER' | 'ADMIN' } | undefined;
      if (u?.id) token.uid = u.id;
      if (u?.role) token.role = u.role;
      return token;
    },
    session({ session, token }) {
      if (token.uid) session.user.id = token.uid;
      if (token.role) session.user.role = token.role;
      return session;
    },
  },
});

/** Server-side gate for /admin — call in layouts/actions, never trust the UI. */
export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return null;
  return session;
}
