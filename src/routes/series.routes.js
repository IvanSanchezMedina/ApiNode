import { Router } from "express";
import { verifyToken } from "../controllers/access.controllers.js";
import { getSeries, getSerie } from "../controllers/series.controllers.js";

const router = Router()

// router.get( '/series',verifyToken, getSeries)
router.get('/serie/:id',verifyToken,getSerie)

export default router

