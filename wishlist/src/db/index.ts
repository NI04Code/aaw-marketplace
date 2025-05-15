import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const DB_PORT = (process.env.DB_PORT as number | undefined) ?? 5432;
const DB_USER = process.env.DB_USER ?? "postgres"
const DB_PASSWORD = process.env.DB_PASSWORD ?? "postgres"
const DB_NAME = process.env.DB_NAME ?? "aaw-marketplace-wishlist"
const DB_WRITER_HOST = process.env.DB_WRITER_HOST ?? process.env.DB_HOST ?? "localhost";
const DB_READER_HOST = process.env.DB_READER_HOST ?? process.env.DB_HOST ?? "localhost";

export const writerPool = new Pool({
  connectionString: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_WRITER_HOST}:${DB_PORT}/${DB_NAME}`,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const readerPool = new Pool({
  connectionString: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_READER_HOST}:${DB_PORT}/${DB_NAME}`,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const writerDb = drizzle(writerPool);
export const readerDb = drizzle(readerPool);
