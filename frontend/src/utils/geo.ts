import * as turf from "@turf/turf";

interface BlackSpot {
  lat: number;
  lng: number;
  accidentCount: number;
}

interface RiskResult {
  totalAccidents: number;
  riskLevel: string;
  riskyPoints: BlackSpot[];
}

export const calculateRouteRisk = (
  routeCoords: [number, number][],
  blackspots: BlackSpot[]
): RiskResult => {
  const line = turf.lineString(routeCoords.map(([lat, lng]) => [lng, lat]));

  let totalAccidents = 0;
  const riskyPoints: BlackSpot[] = [];

  blackspots.forEach((spot) => {
    const point = turf.point([spot.lng, spot.lat]);

    const distance = turf.pointToLineDistance(point, line, {
      units: "kilometers",
    });

    if (distance < 2) { // 2km threshold
      totalAccidents += spot.accidentCount;
      riskyPoints.push(spot);
    }
  });

  let riskLevel = "LOW";
  if (totalAccidents > 50) riskLevel = "HIGH";
  else if (totalAccidents > 20) riskLevel = "MODERATE";

  return {
    totalAccidents,
    riskLevel,
    riskyPoints,
  };
};