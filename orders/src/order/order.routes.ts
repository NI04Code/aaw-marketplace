import express from 'express';
import { validate, verifyJWT } from "@src/middleware";
import * as Validation from './validation';
import * as Handler from './order.handler';

const router = express.Router();

router.get('/v1', verifyJWT, Handler.getAllOrdersHandler);
router.get('/:orderId/v1', verifyJWT, validate(Validation.getOrderDetailSchema), Handler.getOrderDetailHandler);
router.post('/v1', verifyJWT, validate(Validation.placeOrderSchema), Handler.placeOrderHandler);
router.post('/:orderId/v2/pay', verifyJWT, validate(Validation.payOrderSchema), Handler.payOrderHandler);
router.post('/:orderId/v1/cancel', verifyJWT, validate(Validation.cancelOrderSchema), Handler.cancelOrderHandler);

export default router;