import { InternalServerErrorResponse, NotFoundResponse } from "@src/commons/patterns";
import { getAllUserWishlist } from "../dao/getAllUserWishlist.dao";
import { getPaginationParams } from "@src/utils/getPaginationParams";
import { Request } from "express";
import { User } from "@type/user";
import { redis } from "@src/utils/redis";

export const getAllUserWishlistService = async (
    user: User,
    req: Request
) => {
    try {
        const SERVER_TENANT_ID = process.env.TENANT_ID;
        if (!SERVER_TENANT_ID) {
            return new InternalServerErrorResponse('Server tenant ID is missing').generate();
        }

        if (!user.id) {
            return new NotFoundResponse('User ID is missing').generate();
        }

        const { page, pageSize, offset } = getPaginationParams(req);
        
        const cacheKey = `orders:${SERVER_TENANT_ID}:user=${user.id}:page=${page}:size=${pageSize}`;
        const cached = await redis.get(cacheKey);

        if (cached) {
            const parsed = JSON.parse(cached);
            return {
              data: parsed,
              status: 200,
              fromCache: true
            };
        }

        const { wishlists, total } = await getAllUserWishlist(SERVER_TENANT_ID, user.id, pageSize, offset);

        const response = {
            wishlists,
            pagination: {
              total,
              page,
              pageSize,
              totalPages: Math.ceil(total / pageSize),
            },
        };

        await redis.set(cacheKey, JSON.stringify(response), "EX", 600);

        return {
            data: response,
            status: 200,
        };

    } catch (err: any) {
        return new InternalServerErrorResponse(err).generate();
    }
}