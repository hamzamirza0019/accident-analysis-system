import mongoose, { Schema } from "mongoose";

const accidentSchema = new Schema(
  {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Accident = mongoose.model("Accident", accidentSchema);