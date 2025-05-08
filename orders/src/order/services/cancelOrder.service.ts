import { InternalServerErrorResponse, NotFoundResponse, UnauthorizedResponse } from "@src/commons/patterns";
import { getOrderById } from "../dao/getOrderById.dao";
import { cancelOrder } from "../dao/cancelOrder.dao";
import { User } from "@type/user";
import { logger } from "@src/utils/logger";

export const cancelOrderService = async (
    user: User,
    order_id: string,
) => {
    try {
        const SERVER_TENANT_ID = process.env.TENANT_ID;
        if (!SERVER_TENANT_ID) {
            logger.error("Server tenant ID missing in cancelOrderService");
            return new InternalServerErrorResponse("Server tenant id not found").generate();
        }

        if (!user.id) {
            logger.error("User ID missing in cancelOrderService");
            return new NotFoundResponse("User id not found").generate();
        }

        const order = await getOrderById(SERVER_TENANT_ID, user.id, order_id);

        if (order.user_id !== user.id) {
            logger.warn("Unauthorized cancel attempt", {
                userId: user.id,
                orderId: order_id,
            });
            return new UnauthorizedResponse("User not authorized to cancel this order").generate();
        }

        if (['CANCELLED', 'REFUNDED'].includes(order.order_status)) {
            logger.warn("Cancel attempt on already cancelled/refunded order", {
                userId: user.id,
                orderId: order_id,
                currentStatus: order.order_status,
            });
            return new UnauthorizedResponse("Order already cancelled").generate();
        }

        await cancelOrder(SERVER_TENANT_ID, user.id, order_id);
        order.order_status = 'CANCELLED';
        logger.info("Order cancelled", {
            userId: user.id,
            orderId: order_id,
        });

        return {
            data: order,
            status: 200,
        }
    } catch (err: any) {
        logger.error("Unexpected error in cancelOrderService", {
            message: err.message,
            stack: err.stack,
            userId: user?.id,
            orderId: order_id,
        });
        return new InternalServerErrorResponse(err).generate();
    }
}