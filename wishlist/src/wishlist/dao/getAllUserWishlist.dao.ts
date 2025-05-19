import { readerDb } from "@src/db";
import { eq, and, sql } from "drizzle-orm";
import * as schema from '@db/schema/wishlist';

export const getAllUserWishlist = async (
    tenant_id: string,
    user_id: string,
    limit: number,
    offset: number
) => {
    const result = await readerDb
                    .select()
                    .from(schema.wishlist)
                    .where(and(
                        eq(schema.wishlist.tenant_id, tenant_id),
                        eq(schema.wishlist.user_id, user_id)
                    ))
                    .limit(limit)
                    .offset(offset)

    const [{ count }] = await readerDb
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.wishlist)
    .where(eq(schema.wishlist.tenant_id, tenant_id));

    return {
        wishlists: result,
        total: count
    };
}