import { Router } from "express";
import { getCountries, getSeries } from "../controllers/otherData.controllers.js";

const router = Router();

router.get('/countries',getCountries)
router.get('/series',getSeries)

export default router;