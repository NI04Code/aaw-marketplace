import { writerDb } from "@src/db";
import * as schema from '@db/schema/wishlist';
import { NewWishlist } from "@db/schema/wishlist";

export const createWishlist = async (data: NewWishlist) => {
    const result = await writerDb
                    .insert(schema.wishlist)
                    .values(data)
                    .returning()
    return result?.[0];
}