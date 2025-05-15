import 'dotenv/config';
import { writerPool } from './index';
import { faker } from '@faker-js/faker';

const seedDirect = async () => {
    console.log('Seeding 500 products directly...');
    try {
        const client = await writerPool.connect();

        const values: string[] = [];
        const args: any[] = [];

        const tenant_id = "47dd6b24-0b23-46b0-a662-776158d089ba";
        const category_id = "366ec355-0c7c-4f33-9fca-4870fca5f510";

        for (let i = 0; i < 500; i++) {
            const name = faker.commerce.productName();
            const description = faker.commerce.productDescription();
            const price = faker.number.int({ min: 10, max: 100 });
            const quantity = faker.number.int({ min: 1, max: 200 });
        
            values.push(`(gen_random_uuid(), $${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`);
            args.push(tenant_id, name, description, price, quantity, category_id);
        }

        const query = `
        INSERT INTO products (
            id,
            tenant_id,
            name,
            description,
            price,
            quantity_available,
            category_id
        )
        VALUES ${values.join(',')}
        `;


        await client.query(query, args);
        console.log('✅ 500 products seeded directly.');
        client.release();
    } catch (err) {
        console.error('❌ Direct seed failed:', err);
    } finally {
        await writerPool.end();
    }
};

seedDirect();
