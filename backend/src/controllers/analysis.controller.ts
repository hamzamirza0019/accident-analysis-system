import type { Request, Response } from "express";
import { Accident } from "../models/Accident.model.js";
import { detectBlackSpots, getPeakAccidentHours } from "../services/analysis.service.js";

export const getBlackSpots = async (req: Request, res: Response) => {
  // Fetch all accidents from the database
  const accidents = await Accident.find();

  // Detect blackspots using the analysis service
  const blackspots = detectBlackSpots(accidents);

  res.status(200).json({
    success: true,
    message: "Blackspots detected successfully",
    data: blackspots,
  });
};

export const getHeatmap = async (req: Request, res: Response) => {
  // Fetch all accidents from the database
  const accidents = await Accident.find();

  // Transform accidents into heatmap data points
  const heatmapData = accidents.map((accident) => ({
    lat: accident.lat,
    lng: accident.lng,
    weight: 1,
  }));

  res.status(200).json({
    success: true,
    message: "Heatmap data fetched successfully",
    data: heatmapData,
  });
};

export const getPeakHours = async (req: Request, res: Response) => {
  // Fetch all accidents from the database
  const accidents = await Accident.find();

  // Calculate peak accident hours
  const peakHours = getPeakAccidentHours(accidents);

  res.status(200).json({
    success: true,
    message: "Peak accident hours calculated successfully",
    data: peakHours,
  });
};