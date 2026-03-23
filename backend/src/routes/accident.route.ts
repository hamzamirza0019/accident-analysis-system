import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  addAccident,
  getAccidents,
} from "../controllers/accident.controller.js";

const router = Router();

router
  .route("/")
  .post(asyncHandler(addAccident))
  .get(asyncHandler(getAccidents));

export default router;