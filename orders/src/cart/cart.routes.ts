import express from 'express';
import { validate, verifyJWT } from "@src/middleware";
import * as Validation from './validation';
import * as Handler from './cart.handler';

const router = express.Router();

router.get('/v1', verifyJWT, Handler.getAllCartItemsHandler);
router.post('/v1', verifyJWT, validate(Validation.addItemToCartSchema), Handler.addItemToCartHandler);
router.put('/v2', verifyJWT, validate(Validation.editCartItemSchema), Handler.editCartItemHandler);
router.delete('/v2', verifyJWT, validate(Validation.deleteCartItemSchema), Handler.deleteCartItemHandler);

export default router;