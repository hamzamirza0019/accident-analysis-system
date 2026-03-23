import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getBlackSpots,
  getHeatmap,
  getPeakHours
} from "../controllers/analysis.controller.js";

const router = Router();

router.get("/blackspots", asyncHandler(getBlackSpots));
router.get("/heatmap", asyncHandler(getHeatmap));
router.get("/peakhours", asyncHandler(getPeakHours));

export default router;