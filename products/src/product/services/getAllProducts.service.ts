import { InternalServerErrorResponse } from "@src/commons/patterns"
import { getAllProductsByTenantId } from "../dao/getAllProductsByTenantId.dao";
import { getPaginationParams } from "@src/utils/getPaginationParams";
import { Request } from "express";
import { redis } from "@src/utils/redis";


export const getAllProductsService = async (req: Request) => {
    try {
        const SERVER_TENANT_ID = process.env.TENANT_ID;
        if (!SERVER_TENANT_ID) {
            return new InternalServerErrorResponse('Server Tenant ID not found').generate()
        }

        const { page, pageSize, offset } = getPaginationParams(req);

        const cacheKey = `products:${SERVER_TENANT_ID}:page=${page}:size=${pageSize}`;
        const cached = await redis.get(cacheKey);

        if (cached) {
            const parsed = JSON.parse(cached);
            return {
              data: parsed,
              status: 200,
              fromCache: true
            };
          }

        const { products, total } = await getAllProductsByTenantId(SERVER_TENANT_ID, pageSize, offset);
        
        const response = {
            products,
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
            status: 200
        }

    } catch (err: any) {
        return new InternalServerErrorResponse(err).generate()
    }
}