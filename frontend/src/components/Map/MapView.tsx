import RouteLayer from "./routeLayer";
import { useRoute } from "../../hooks/useRoute";
import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import api from "../../api/api";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Green icon for start location
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Red icon for destination
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Blackspot = {
  lat: number;
  lng: number;
  accidentCount: number;
  riskScore: number;
};

type HeatPoint = [number, number, number];

function HeatmapLayer({ points }: { points: HeatPoint[] }) {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!points.length) {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    import("leaflet.heat").then(() => {
      heatLayerRef.current = (L as any).heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
      });
      heatLayerRef.current.addTo(map);
    });
    return () => {
      if (heatLayerRef.current && map.hasLayer(heatLayerRef.current)) {
        map.removeLayer(heatLayerRef.current);
      }
      heatLayerRef.current = null;
    };
  }, [points, map]);

  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center]);
  return null;
}

function MapView({
  selectedLocation,
  startLocation,
  blackspots,
}: {
  selectedLocation?: [number, number] | null;
  startLocation?: [number, number] | null;
  blackspots: Blackspot[];
}) {
  const { routeCoords, riskData, fetchRoute } = useRoute(blackspots);
  const [heatmapData, setHeatmapData] = useState<HeatPoint[]>([]);
  const [riskInfo, setRiskInfo] = useState<{
    level: string;
    count: number;
    suggestion: string;
    nearest: { distance: number; accidentCount: number };
  } | null>(null);

  function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Fetch heatmap
  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await api.get("/analysis/heatmap");
        const points = res.data.data.map((item: any) => [item.lat, item.lng, item.weight]);
        setHeatmapData(points);
      } catch (err) {
        console.error("Heatmap error", err);
      }
    };
    fetchHeatmap();
  }, []);

  // Auto-trigger route when both points + blackspots are available
  useEffect(() => {
    if (startLocation && selectedLocation && blackspots.length) {
      fetchRoute(startLocation, selectedLocation);
    }
  }, [startLocation, selectedLocation, blackspots]);

  // Risk calculation for destination
  useEffect(() => {
    if (!selectedLocation || !blackspots.length) {
      setRiskInfo(null);
      return;
    }
    const [lat, lng] = selectedLocation;
    let totalAccidents = 0;
    for (const spot of blackspots) {
      if (haversineDistance(lat, lng, spot.lat, spot.lng) <= 10) {
        totalAccidents += spot.accidentCount;
      }
    }

    let level = "Low";
    if (totalAccidents > 20) level = "High";
    else if (totalAccidents > 5) level = "Moderate";

    const suggestion =
      level === "High"
        ? "⚠️ High risk zone. Avoid travel during peak hours."
        : level === "Moderate"
        ? "⚠️ Moderate risk. Stay alert and drive carefully."
        : "✅ Low risk area. Safe for travel.";

    let nearest = { distance: Infinity, accidentCount: 0 };
    for (const spot of blackspots) {
      const dist = haversineDistance(lat, lng, spot.lat, spot.lng);
      if (dist < nearest.distance) {
        nearest = { distance: dist, accidentCount: spot.accidentCount };
      }
    }

    setRiskInfo({ level, count: totalAccidents, suggestion, nearest });
  }, [selectedLocation, blackspots]);

  const mapCenter: [number, number] = startLocation || selectedLocation || [20.5937, 78.9629];

  return (
    <MapContainer center={mapCenter} zoom={5} className="h-full w-full rounded-xl">
      <RouteLayer routeCoords={routeCoords} riskData={riskData} />
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {selectedLocation && <ChangeView center={selectedLocation} />}
      <HeatmapLayer points={heatmapData} />

      {/* 🟢 Start marker */}
      {startLocation && (
        <Marker position={startLocation} icon={greenIcon}>
          <Popup>
            <strong>🟢 Start Location</strong>
          </Popup>
        </Marker>
      )}

      {/* 🔴 Destination marker with risk info */}
      {selectedLocation && (
        <Marker position={selectedLocation} icon={redIcon}>
          <Popup>
            <div style={{ minWidth: "220px", fontFamily: "Arial, sans-serif" }}>
              <div style={{ marginBottom: "10px", borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                <strong>🔴 Destination</strong>
              </div>
              {riskInfo ? (
                <>
                  <div style={{ marginBottom: "10px" }}>
                    <span style={{
                      backgroundColor:
                        riskInfo.level === "Low" ? "#28a745"
                        : riskInfo.level === "Moderate" ? "#ffc107"
                        : "#dc3545",
                      color: "white",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}>
                      {riskInfo.level} Risk
                    </span>
                    <p style={{ margin: "8px 0 0", fontSize: "13px" }}>
                      Nearby Accidents: <strong>{riskInfo.count}</strong>
                    </p>
                  </div>
                  <div style={{ borderTop: "1px solid #eee", paddingTop: "8px", marginBottom: "8px" }}>
                    <p style={{ margin: 0, fontSize: "13px" }}>{riskInfo.suggestion}</p>
                  </div>
                  <div style={{ borderTop: "1px solid #eee", paddingTop: "8px" }}>
                    <p style={{ margin: "0 0 4px", fontWeight: "bold", fontSize: "13px" }}>Nearest Blackspot:</p>
                    <p style={{ margin: "2px 0", fontSize: "13px" }}>Distance: <strong>{riskInfo.nearest.distance.toFixed(2)} km</strong></p>
                    <p style={{ margin: 0, fontSize: "13px" }}>Accidents: <strong>{riskInfo.nearest.accidentCount}</strong></p>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: "13px", color: "#666" }}>Calculating risk...</p>
              )}
            </div>
          </Popup>
        </Marker>
      )}

      {/* 📍 Blackspot markers */}
      {blackspots.map((spot, index) => (
        <Marker key={index} position={[spot.lat, spot.lng]}>
          <Popup>
            <div>
              <p><strong>Accidents:</strong> {spot.accidentCount}</p>
              <p><strong>Risk Score:</strong> {spot.riskScore}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;
