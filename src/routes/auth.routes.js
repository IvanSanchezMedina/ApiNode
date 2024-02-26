import { Router } from "express";
import {login, logout} from '../controllers/auth.controllers.js'; // Sin las llaves

const router = Router();

router.post('/login', login);
router.get('/logout', logout);

export default router;
