import express from "express";
import { validate } from "@src/middleware/validate";
import * as Validation from "./validation";
import * as Handler from "./user.handler";

const router = express.Router();

router.post("/v1/register", validate(Validation.registerSchema), Handler.registerHandler);
router.post("/v2/login", validate(Validation.loginSchema), Handler.loginHandler);
router.post("/v1/verify-token", validate(Validation.verifyTokenSchema), Handler.verifyTokenHandler);
router.post("/v1/verify-admin-token", validate(Validation.verifyAdminTokenSchema), Handler.verifyAdminTokenHandler);

export default router;

