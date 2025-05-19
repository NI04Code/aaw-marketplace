import { readerDb } from "@src/db";
import { eq, sql } from "drizzle-orm";
import * as schema from '@db/schema/products'

export const getAllProductsByTenantId = async (tenantId: string, limit: number, offset: number) => {
    const result = await readerDb
        .select()
        .from(schema.products)
        .where(eq(schema.products.tenant_id, tenantId))
        .limit(limit)
        .offset(offset)
    
    const [{ count }] = await readerDb
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.products)
    .where(eq(schema.products.tenant_id, tenantId));

    return {
        products: result,
        total: count
    };
}