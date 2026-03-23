import type { Request, Response } from "express";
import { Accident } from "../models/Accident.model.js";

export const addAccident = async (req: Request, res: Response) => {
  const accident = await Accident.create(req.body);

  res.status(201).json({
    success: true,
    data: accident,
  });
};

export const getAccidents = async (req: Request, res: Response) => {
  const accidents = await Accident.find();

  res.status(200).json({
    success: true,
    data: accidents,
  });
};