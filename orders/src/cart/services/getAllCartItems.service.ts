import { InternalServerErrorResponse, NotFoundResponse } from "@src/commons/patterns";
import { getAllCartItems } from "../dao/getAllCartItems.dao";
import { User } from "@type/user";
import { redis } from "@src/utils/redis";
import { getPaginationParams } from "@src/utils/getPaginationParams";
import { Request } from "express";

export const getAllCartItemsService = async (
    user: User,
    req: Request
) => {
    try {
        const SERVER_TENANT_ID = process.env.TENANT_ID;
        if (!SERVER_TENANT_ID) {
            return new InternalServerErrorResponse('Tenant ID not found').generate();
        }

        if (!user.id) {
            return new NotFoundResponse('User not found').generate();
        }

        const cacheKey = `cartItems:${SERVER_TENANT_ID}:user=${user.id}`;
        const cached = await redis.get(cacheKey);

        if (cached) {
            const parsed = JSON.parse(cached);
            return {
              data: parsed,
              status: 200,
              fromCache: true
            };
        }

        const cartItems = await getAllCartItems(SERVER_TENANT_ID, user.id);

        await redis.set(cacheKey, JSON.stringify(cartItems), "EX", 600);

        return {
            data: cartItems,
            status: 200
        }

    } catch (err: any) {
        return new InternalServerErrorResponse(err).generate();
    }
}