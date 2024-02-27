import { Router } from "express";
import { login,logout,loginWithSession,register } from "../controllers/access.controllers.js";

const router = Router();

router.post('/login', login,loginWithSession);
router.post('/logout', logout);
router.post('/register', register);

export default router;

