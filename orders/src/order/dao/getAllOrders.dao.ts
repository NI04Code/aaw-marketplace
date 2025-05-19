import { readerDb } from "@src/db";
import { and, eq, sql } from "drizzle-orm";
import * as schema from "@db/schema/order";

export const getAllOrders = async (
    tenant_id: string,
    user_id: string,
    limit: number, 
    offset: number
) => {
    const result = await readerDb
        .select()
        .from(schema.order)
        .where(and(
            eq(schema.order.tenant_id, tenant_id),
            eq(schema.order.user_id, user_id),
        ))
        .limit(limit)
        .offset(offset)
    
    const [{ count }] = await readerDb
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.order)
    .where(eq(schema.order.tenant_id, tenant_id));
    
    return {
        orders: result,
        total: count
    };
}