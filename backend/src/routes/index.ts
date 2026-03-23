
import { Router } from "express";
import { asyncHandler} from "../utils/asyncHandler.js"
import type { Request, Response } from "express";

import accidentRoutes from "./accident.route.js";
import analysisRoutes from "./analysis.route.js";

const router = Router();

router.get("/health", asyncHandler(async (req: Request, res: Response) => {
    res.json({status: "ok"});
})
);

router.get(
  "/crash-test",
  asyncHandler(async () => {
    throw new Error("Async error caught!");
  })
);

// router.use("/v1/users", userRoutes);
router.use("/v1/accidents", accidentRoutes);
router.use("/v1/analysis", analysisRoutes);

export default router;