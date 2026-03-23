interface Accident {
  lat: number;
  lng: number;
  severity?: string;
  timestamp?: Date;
}

interface Cluster {
  lat: number;
  lng: number;
  count: number;
  totalWeight: number;
}

interface BlackSpot {
  lat: number;
  lng: number;
  accidentCount: number;
  riskScore: number;
}

interface PeakHour {
  hour: number;
  count: number;
}

/**
 * Get the weight for a given severity level.
 * Returns 3 for "high", 2 for "medium", 1 for "low" or undefined.
 */
function getSeverityWeight(severity?: string): number {
  switch (severity) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
    default:
      return 1;
  }
}

/**
 * Get the time-based weight multiplier.
 * Returns 1.5 if the accident is within the last 7 days, otherwise 1.
 */
function getTimeWeightMultiplier(timestamp?: Date): number {
  if (!timestamp) return 1;
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return timestamp >= sevenDaysAgo ? 1.5 : 1;
}

/**
 * Detect blackspots by clustering accidents with severity and time-based weighting.
 */
export const detectBlackSpots = (accidents: Accident[]): BlackSpot[] => {
  const clusters: Cluster[] = [];
  const radius = 0.01; // simple clustering

  accidents.forEach((acc) => {
    let found = false;

    for (let cluster of clusters) {
      const dist = Math.sqrt(
        Math.pow(acc.lat - cluster.lat, 2) +
        Math.pow(acc.lng - cluster.lng, 2)
      );

      if (dist < radius) {
        cluster.count++;
        const severityWeight = getSeverityWeight(acc.severity);
        const timeMultiplier = getTimeWeightMultiplier(acc.timestamp);
        cluster.totalWeight += severityWeight * timeMultiplier;
        found = true;
        break;
      }
    }

    if (!found) {
      const severityWeight = getSeverityWeight(acc.severity);
      const timeMultiplier = getTimeWeightMultiplier(acc.timestamp);
      clusters.push({
        lat: acc.lat,
        lng: acc.lng,
        count: 1,
        totalWeight: severityWeight * timeMultiplier,
      });
    }
  });

  return clusters
    .filter((c) => c.count >= 3)
    .map((c) => ({
      lat: c.lat,
      lng: c.lng,
      accidentCount: c.count,
      riskScore: Number((c.totalWeight / 10).toFixed(2)),
    }));
};

/**
 * Calculate peak accident hours by counting accidents per hour (0-23).
 * Returns sorted array in descending order of count.
 */
export const getPeakAccidentHours = (accidents: Accident[]): PeakHour[] => {
  const hourCounts: Record<number, number> = {};

  accidents.forEach((acc) => {
    if (acc.timestamp) {
      const hour = new Date(acc.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  return Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count);
};