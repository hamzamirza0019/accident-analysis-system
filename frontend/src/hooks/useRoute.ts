import { useState } from "react";
import { getRoute } from "../api/routeService";
import { calculateRouteRisk } from "../utils/geo";

// Types
type Coordinates = [number, number];

interface BlackSpot {
  lat: number;
  lng: number;
  accidentCount: number;
}

interface RiskData {
  totalAccidents: number;
  riskLevel: string;
  riskyPoints: BlackSpot[];
}

interface UseRouteReturn {
  routeCoords: Coordinates[];
  riskData: RiskData | null;
  fetchRoute: (start: Coordinates, end: Coordinates) => Promise<void>;
}

export const useRoute = (blackspots: BlackSpot[]): UseRouteReturn => {
  const [routeCoords, setRouteCoords] = useState<Coordinates[]>([]);
  const [riskData, setRiskData] = useState<RiskData | null>(null);

  const fetchRoute = async (
    start: Coordinates,
    end: Coordinates
  ): Promise<void> => {
    const rawCoords: Coordinates[] = await getRoute(start, end);
console.log(rawCoords);

    // Convert from API format [lng, lat] to Leaflet format [lat, lng]
    const formatted: Coordinates[] = rawCoords.map(
      ([lng, lat]): Coordinates => [lat, lng]
    );

    setRouteCoords(formatted);

    const risk = calculateRouteRisk(formatted, blackspots);
    setRiskData(risk as RiskData);
  };

  return { routeCoords, riskData, fetchRoute };
};