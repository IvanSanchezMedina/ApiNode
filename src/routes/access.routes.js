import { Router } from "express";
import { login,logout,loginWithSession } from "../controllers/access.controllers.js";

const router = Router();

router.post('/login', login,loginWithSession);
router.post('/logout', logout);

export default router;

