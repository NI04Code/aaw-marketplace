import { readerDb } from "@src/db";
import { eq, and } from "drizzle-orm";
import * as schema from '@db/schema/wishlistDetail';

export const getWishlistDetailByWishlistId = async (
    wishlist_id: string,
) => {
    const result = await readerDb
                    .select()
                    .from(schema.wishlistDetail)
                    .where(and(
                        eq(schema.wishlistDetail.wishlist_id, wishlist_id)
                    ))
    return result?.[0];
}