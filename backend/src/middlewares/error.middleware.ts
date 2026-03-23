import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export const globalErrorHandler = (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    // if known error
    if(error instanceof ApiError){
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        })
    }

    // Unknown / programming error
  console.error("UNEXPECTED ERROR:", error);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}