// Prisma 7 project config: connection for the CLI (migrate/db pull) and the
// seed command. The runtime client gets its connection separately, via the
// PrismaPg adapter in src/lib/db.ts.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Plain process.env with a placeholder, NOT the strict env() helper:
    // `prisma generate` (postinstall, Docker build) must work with no database
    // configured. Commands that actually connect (migrate/seed) always run
    // with a real DATABASE_URL.
    url:
      process.env.DATABASE_URL ??
      'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  },
});
