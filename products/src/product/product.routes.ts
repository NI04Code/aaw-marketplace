import express from 'express';
import { validate, verifyJWTProduct } from "@src/middleware";
import * as Validation from './validation';
import * as Handler from './product.handler';

const router = express.Router();

router.get('/v2/all', Handler.getAllProductsHandler);
router.get('/v2/categories', Handler.getAllCategoryHandler);
router.get('/:id', validate(Validation.getProductByIdSchema), Handler.getProductByIdHandler);
router.get('/v2/many', validate(Validation.getManyProductDatasByIdSchema), Handler.getManyProductDatasByIdHandler);
router.get('/category/:category_id', validate(Validation.getProductByCategorySchema), Handler.getProductByCategoryHandler);
router.post('', verifyJWTProduct, validate(Validation.createProductSchema), Handler.createProductHandler);
router.post('/category', verifyJWTProduct, validate(Validation.createCategorySchema), Handler.createCategoryHandler);
router.put('/:id', verifyJWTProduct, validate(Validation.editProductSchema), Handler.editProductHandler);
router.put('/category/:category_id', verifyJWTProduct, validate(Validation.editCategorySchema), Handler.editCategoryHandler);
router.delete('/:id', verifyJWTProduct, validate(Validation.deleteProductSchema), Handler.deleteProductHandler);
router.delete('/category/:category_id', verifyJWTProduct, validate(Validation.deleteCategorySchema), Handler.deleteCategoryHandler);

export default router;