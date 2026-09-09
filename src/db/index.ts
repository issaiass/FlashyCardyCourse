import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = neon(databaseUrl);
  // Drizzle 1.0 expects `{ client }` (or a connection string), not the neon function as the first argument
  return drizzle({ client: sql });
}

type Database = ReturnType<typeof createDatabase>;

let dbInstance: Database | null = null;

function getDb(): Database {
  if (!dbInstance) {
    dbInstance = createDatabase();
  }
  return dbInstance;
}

export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
