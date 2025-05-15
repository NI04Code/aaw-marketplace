import dotenv from 'dotenv';
dotenv.config();

import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { writerDb, writerPool, readerDb, readerPool } from './index';

const main = async () => {
    console.log('Running migrations...');
    try {
        await migrate(writerDb, { migrationsFolder: './drizzle' });
        console.log('Migrations completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await writerPool.end();
    }
}

main().catch(console.error);
