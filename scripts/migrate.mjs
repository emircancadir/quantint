import { spawnSync } from 'node:child_process';

const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const name of required) {
  if (!process.env[name]) {
    console.error(`${name} must be set before running migrations.`);
    process.exit(1);
  }
}

const user = encodeURIComponent(process.env.DB_USER);
const password = encodeURIComponent(process.env.DB_PASSWORD);
const host = process.env.DB_HOST;
const port = process.env.DB_PORT ?? '5432';
const database = encodeURIComponent(process.env.DB_NAME);
const env = {
  ...process.env,
  DATABASE_URL: `postgresql://${user}:${password}@${host}:${port}/${database}`,
};

for (const args of [
  ['prisma', 'migrate', 'deploy'],
  ['prisma', 'db', 'seed'],
]) {
  const result = spawnSync('npx', args, { env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

