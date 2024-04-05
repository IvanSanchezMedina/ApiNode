import { Router } from "express";
import { getHomeBlocks, getHomeSlide } from "../controllers/home.controllers.js";

const router  = Router();

router.get('/configuration_slides/:language', getHomeSlide);
router.get('/configuration_blocks/:language',getHomeBlocks)

export default router