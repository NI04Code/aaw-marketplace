import { NewWishlistDetail } from "@db/schema/wishlistDetail";
import { InternalServerErrorResponse } from "@src/commons/patterns";
import { addProductToWishlist } from "../dao/addProductToWishlist.dao";
import { getWishlistById } from "../dao/getWishlistById.dao";
import { User } from "@type/user";
import { logger } from "@src/utils/logger";

export const addProductToWishlistService = async (
    wishlist_id: string,
    product_id: string,
    user: User,
) => {
    try {
        const SERVER_TENANT_ID = process.env.TENANT_ID;
        if (!SERVER_TENANT_ID) {
            return new InternalServerErrorResponse('Server tenant ID is missing').generate();
        }

        if (!user.id) {
            logger.warn("Wishlist not found", { userId: user.id, wishlistId: wishlist_id });
            return new InternalServerErrorResponse('User ID is missing').generate();
        }

        const wishlist = await getWishlistById(SERVER_TENANT_ID, wishlist_id);
        if (!wishlist) {
            return new InternalServerErrorResponse('Wishlist not found').generate();
        }

        if (wishlist.user_id !== user.id) {
            logger.warn("Unauthorized wishlist access attempt", { userId: user.id, wishlistId: wishlist_id });
            return new InternalServerErrorResponse('User is not authorized to add product to this wishlist').generate();
        }

        const wishlistDetailData: NewWishlistDetail = {
            product_id,
            wishlist_id,
        }

        const wishlistDetail = await addProductToWishlist(wishlistDetailData);

        logger.info("Product added to wishlist", {
            userId: user.id,
            wishlistId: wishlist_id,
            productId: product_id,
        });
        
        return {
            data: wishlistDetail,
            status: 201,
        };
    } catch (err: any) {
        logger.error("Failed to add product to wishlist", {
            userId: user?.id,
            wishlistId: wishlist_id,
            productId: product_id,
            error: err.message,
        });
        return new InternalServerErrorResponse(err).generate();
    }
}