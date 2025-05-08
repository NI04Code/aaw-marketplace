import express from 'express';
import { validate, verifyJWTProduct } from "@src/middleware";
import * as Validation from './validation';
import * as Handler from './product.handler';

const router = express.Router();

router.get('/v1', Handler.getAllProductsHandler);
router.get('/v2/categories', Handler.getAllCategoryHandler);
router.get('v1/:id', validate(Validation.getProductByIdSchema), Handler.getProductByIdHandler);
router.get('/v2/many', validate(Validation.getManyProductDatasByIdSchema), Handler.getManyProductDatasByIdHandler);
router.get('/v1/category/:category_id', validate(Validation.getProductByCategorySchema), Handler.getProductByCategoryHandler);
router.post('/v1', verifyJWTProduct, validate(Validation.createProductSchema), Handler.createProductHandler);
router.post('v1/category', verifyJWTProduct, validate(Validation.createCategorySchema), Handler.createCategoryHandler);
router.put('v1/:id', verifyJWTProduct, validate(Validation.editProductSchema), Handler.editProductHandler);
router.put('v1/category/:category_id', verifyJWTProduct, validate(Validation.editCategorySchema), Handler.editCategoryHandler);
router.delete('v1/:id', verifyJWTProduct, validate(Validation.deleteProductSchema), Handler.deleteProductHandler);
router.delete('v1/category/:category_id', verifyJWTProduct, validate(Validation.deleteCategorySchema), Handler.deleteCategoryHandler);

export default router;
