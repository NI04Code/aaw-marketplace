import express from "express";
import { validate, verifyJWT } from "@src/middleware";
import * as Validation from './validation';
import * as Handler from './wishlist.handler';

const router = express.Router();

router.get('/v1', verifyJWT, Handler.getAllUserWishlistHandler);
router.get('/v1/:id', verifyJWT, validate(Validation.getWishlistByIdSchema), Handler.getWishlistByIdHandler);
router.post('/v1', verifyJWT, validate(Validation.createWishlistSchema), Handler.createWishlistHandler);
router.put('/v1/:id', verifyJWT, validate(Validation.updateWishlistSchema), Handler.updateWishlistHandler);
router.delete('/v1/remove', verifyJWT, validate(Validation.removeProductFromWishlistSchema), Handler.removeProductFromWishlistHandler);
router.delete('/v1/:id', verifyJWT, validate(Validation.deleteWishlistSchema), Handler.deleteWishlistHandler);
router.post('/v1/add', verifyJWT, validate(Validation.addProductToWishlistSchema), Handler.addProductToWishlistHandler);

export default router;