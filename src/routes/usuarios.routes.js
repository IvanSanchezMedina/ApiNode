import { Router } from "express";
import {getUsuarios,createUsuario,putUsuarios,deleteUsuarios,getUsuario} from "../controllers/usuarios.controllers.js";
const router = Router()

// router.post('/register', userController.register);
router.get('/usuarios',getUsuarios)
router.get('/usuarios/:id',getUsuario)
router.post('/usuarios',createUsuario)
router.patch('/usuarios/:id',putUsuarios)
router.delete('/usuarios/:id',deleteUsuarios)
 
export default router