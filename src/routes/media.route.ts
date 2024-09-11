import express from "express";
import controller from "../controllers/media.controller.js";

const router = express.Router();

router.get("/videos/:key", controller.videos);
router.get("/samples/:voiceId", controller.samples);
router.get("/speeches/:speechId", controller.speeches);

export default router;
