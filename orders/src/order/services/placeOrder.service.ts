import { getAllCartItems } from "@src/cart/dao/getAllCartItems.dao";
import { BadRequestResponse, InternalServerErrorResponse, NotFoundResponse } from "@src/commons/patterns";
import { createOrder } from "../dao/createOrder.dao";
import axios, { AxiosResponse } from "axios";
import { User, Product } from "@type/index";
import { logger } from "@src/utils/logger"; 

export const placeOrderService = async (
    user: User,
    shipping_provider: string,
) => {
    try {
        const SERVER_TENANT_ID = process.env.TENANT_ID;
        if (!SERVER_TENANT_ID) {
            logger.error("Server tenant ID not found", { env: process.env.NODE_ENV });
            return new InternalServerErrorResponse("Server tenant id not found").generate();
        }

        if (!['JNE', 'TIKI', 'SICEPAT', 'GOSEND', 'GRAB_EXPRESS'].includes(shipping_provider)) {
            logger.warn("Invalid shipping provider", { userId: user?.id, shipping_provider });
            return new NotFoundResponse('Shipping provider not found').generate();
        }

        if (!user.id) {
            logger.error("User ID not found", { user });
            return new InternalServerErrorResponse("User id not found").generate();
        }

        // get the cart items
        logger.info("Getting cart items", { userId: user.id });
        const cartItems = await getAllCartItems(SERVER_TENANT_ID, user.id);

        // get the product datas
        const productIds = cartItems.map((item) => item.product_id);
        if (productIds.length === 0) {
            return new BadRequestResponse('Cart is empty').generate();
        }
        const products: AxiosResponse<Product[], any> = await axios.post(`http://product-service:8000/api/product/many`, { productIds });
        if (products.status !== 200) {
            return new InternalServerErrorResponse("Failed to get products").generate();
        }

        logger.info("Creating order", {
            userId: user.id,
            productCount: products.data.length,
            shipping_provider
        });
        
        // create order
        const order = await createOrder(
            SERVER_TENANT_ID,
            user.id,
            cartItems,
            products.data,
            shipping_provider as 'JNE' | 'TIKI' | 'SICEPAT' | 'GOSEND' | 'GRAB_EXPRESS',
        );

        return {
            data: order,
            status: 201,
        }

    } catch (err: any) {
        logger.error("Error placing order", {
            userId: user?.id,
            message: err.message,
            stack: err.stack,
        });
        return new InternalServerErrorResponse(err).generate();
    }
}