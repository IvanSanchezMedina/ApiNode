import { Router } from "express";
import { getHomeSlide } from "../controllers/home.controllers.js";

const router  = Router();

router.get('/configuration_slides', getHomeSlide);

export default router