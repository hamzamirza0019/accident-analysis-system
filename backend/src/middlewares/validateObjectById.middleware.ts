import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

export const validateObjectId = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError({
        statusCode: 400,
        message: "Invalid user id"
    });
  }

  next();
};