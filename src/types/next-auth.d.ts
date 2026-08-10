import type { DefaultSession } from 'next-auth';
import type { Role } from '@/generated/prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }

  interface User {
    role?: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid?: string;
    role?: Role;
  }
}

// next-auth v5 types its callbacks against @auth/core — augment there too, or
// `token.uid` falls back to the index signature (unknown) in the callbacks.
declare module '@auth/core/jwt' {
  interface JWT {
    uid?: string;
    role?: Role;
  }
}
