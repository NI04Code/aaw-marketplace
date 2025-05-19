import { InternalServerErrorResponse } from "@src/commons/patterns";
import { getAllOrders } from "../dao/getAllOrders.dao";
import { getPaginationParams } from "@src/utils/getPaginationParams";
import { Request } from "express";
import { User } from "@type/user";
import { redis } from "@src/utils/redis";

export const getAllOrdersService = async (
    user: User,
    req: Request
) => {
    try {
        const SERVER_TENANT_ID = process.env.TENANT_ID;
        if (!SERVER_TENANT_ID) {
            throw new Error("SERVER_TENANT_ID is not defined");
        }

        if (!user.id) {
            return new InternalServerErrorResponse("User ID is not defined").generate();
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

        const { orders, total } = await getAllOrders(SERVER_TENANT_ID, user.id, pageSize, offset);

        const response = {
            orders,
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
        }

    } catch (err: any) {
        return new InternalServerErrorResponse(err).generate();
    }
}