import { InternalServerErrorResponse, NotFoundResponse, UnauthenticatedResponse, UnauthorizedResponse } from "@src/commons/patterns";
import { User } from "@type/user";
import { deleteCartItemByProductId } from "../dao/deleteCartItemByProductId.dao";
import { getAllCartItems } from "../dao/getAllCartItems.dao";


export const deleteCartItemService = async (
    user: User,
    product_id: string,
) => {
    try {
        const SERVER_TENANT_ID = process.env.TENANT_ID;
        if (!SERVER_TENANT_ID) {
            return new InternalServerErrorResponse('Tenant ID not found').generate();
        }

        if (!user.id) {
            return new UnauthenticatedResponse('User not found').generate();
        }
       
        const cartItems = await getAllCartItems(SERVER_TENANT_ID, user.id)
        const targetedCartItems = cartItems.find(cartItem => cartItem.product_id === product_id)

        if (!targetedCartItems) {
            return new NotFoundResponse('Product not found on cart').generate()
        }


        const cart = await deleteCartItemByProductId(SERVER_TENANT_ID, user.id, product_id);

        return {
            data: cart,
            status: 200,
        }
    } catch (err: any) {
        return new InternalServerErrorResponse(err).generate();
    }
}