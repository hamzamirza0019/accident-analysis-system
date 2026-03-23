import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export const validateCreateUser = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { name, email } = req.body;

  if (!name || !email) {
    throw new ApiError({
        statusCode: 400,
        message: "Name and email are required"
    });
  }

 
  if (!email.includes("@")) {
    throw new ApiError({
        statusCode: 400,
        message: "Invalid email format"
    });
  }


  next();
};