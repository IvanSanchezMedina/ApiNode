import { Router } from "express";
import { getUsuario } from "../controllers/index.controllers.js";
const router = Router()

router.get('/ping',getUsuario)

 
export default router