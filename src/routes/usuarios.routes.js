import { Router } from "express";
import {getUsuarios,createUsuario,putUsuarios,deleteUsuarios,getUsuario} from "../controllers/usuarios.controllers.js";
import { verifyToken } from "../controllers/access.controllers.js";
 
const router = Router()

router.get('/usuarios',verifyToken,getUsuarios)
router.get('/usuarios/:id',verifyToken,getUsuario)
router.post('/usuarios',verifyToken,createUsuario)
router.patch('/usuarios/:id',putUsuarios)
router.delete('/usuarios/:id',verifyToken,deleteUsuarios)
 
export default router