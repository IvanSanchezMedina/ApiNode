import { Router } from "express";
import { getCountries } from "../controllers/otherData.controllers.js";

const router = Router();

router.get('/countries',getCountries)

export default router;