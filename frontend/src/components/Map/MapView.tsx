import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import api from "../../api/api";

// Leaflet marker fix
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

// Highlighted marker icon
const highlightedIcon = new L.Icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [30, 46], // Larger size for highlight
  iconAnchor: [15, 46],
  popupAnchor: [1, -34],
  shadowSize: [46, 46],
});

type Blackspot = {
  lat: number;
  lng: number;
  accidentCount: number;
  riskScore: number;
};

type HeatPoint = [number, number, number];

// 🔥 Heatmap Layer
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

    // Remove existing layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // Add new layer
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

// 📍 Change map view when searching
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 12);
  return null;
}

// 🚀 Main Map Component
function MapView({
  selectedLocation,
}: {
  selectedLocation?: [number, number] | null;
}) {
  const [blackspots, setBlackspots] = useState<Blackspot[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatPoint[]>([]);
  const [riskInfo, setRiskInfo] = useState<{level: string, count: number, suggestion: string, nearest: {distance: number, accidentCount: number}} | null>(null);
  const [nearestSpot, setNearestSpot] = useState<Blackspot | null>(null);

  // Haversine distance function
  function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Fetch blackspots
  useEffect(() => {
    const fetchBlackspots = async () => {
      try {
        const res = await api.get("/analysis/blackspots");
        setBlackspots(res.data.data);
      } catch (err) {
        console.error("Error fetching blackspots", err);
      }
    };

    fetchBlackspots();
  }, []);

  // Fetch heatmap data
  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await api.get("/analysis/heatmap");

        const points = res.data.data.map((item: any) => [
          item.lat,
          item.lng,
          item.weight,
        ]);

        setHeatmapData(points);
      } catch (err) {
        console.error("Heatmap error", err);
      }
    };

    fetchHeatmap();
  }, []);

  // Calculate risk for selected location
  useEffect(() => {
    if (!selectedLocation || !blackspots.length) {
      setRiskInfo(null);
      return;
    }

    const [lat, lng] = selectedLocation;
    let totalAccidents = 0;

    for (const spot of blackspots) {
      const dist = haversineDistance(lat, lng, spot.lat, spot.lng);
      if (dist <= 10) {
        totalAccidents += spot.accidentCount;
      }
    }

    let level = 'Low';
    if (totalAccidents > 20) level = 'High';
    else if (totalAccidents > 5) level = 'Moderate';

    const suggestion = level === 'High' ? "⚠️ High risk zone. Avoid travel during peak hours." : level === 'Moderate' ? "⚠️ Moderate risk. Stay alert and drive carefully." : "✅ Low risk area. Safe for travel.";

    let nearest = { distance: Infinity, accidentCount: 0 };
    let nearestSpotTemp: Blackspot | null = null;
    for (const spot of blackspots) {
      const dist = haversineDistance(lat, lng, spot.lat, spot.lng);
      if (dist < nearest.distance) {
        nearest = { distance: dist, accidentCount: spot.accidentCount };
        nearestSpotTemp = spot;
      }
    }

    setNearestSpot(nearestSpotTemp);
    setRiskInfo({ level, count: totalAccidents, suggestion, nearest });
  }, [selectedLocation, blackspots]);

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      className="h-full w-full rounded-xl"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 🔥 Move map when searched */}
      {selectedLocation && <ChangeView center={selectedLocation} />}

      {/* 🔥 Heatmap */}
      <HeatmapLayer points={heatmapData} />

      {/* 📍 Marker for searched location */}
      {selectedLocation && (
        <Marker position={selectedLocation}>
          <Popup>
            <div style={{ minWidth: '220px', fontFamily: 'Arial, sans-serif' }}>
              {/* Section 1: Location */}
              <div style={{ marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
                <strong>📍 Searched Location</strong>
              </div>

              {riskInfo && (
                <>
                  {/* Section 2: Risk Info */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        backgroundColor: riskInfo.level === 'Low' ? '#28a745' : riskInfo.level === 'Moderate' ? '#ffc107' : '#dc3545',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {riskInfo.level} Risk
                      </span>
                    </div>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}>Nearby Accidents: <strong>{riskInfo.count}</strong></p>
                  </div>

                  {/* Section 3: Safety Suggestion */}
                  <div style={{ marginBottom: '12px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px' }}>Safety Suggestion:</p>
                    <p style={{ margin: 0, fontSize: '14px' }}>{riskInfo.suggestion}</p>
                  </div>

                  {/* Section 4: Nearest Blackspot */}
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px' }}>Nearest Blackspot:</p>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}>Distance: <strong>{riskInfo.nearest.distance.toFixed(2)} km</strong></p>
                    <p style={{ margin: 0, fontSize: '14px' }}>Accidents: <strong>{riskInfo.nearest.accidentCount}</strong></p>
                  </div>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      )}

      {/* 📍 Blackspot markers */}
      {blackspots.map((spot, index) => (
        <Marker
          key={index}
          position={[spot.lat, spot.lng]}
          // Use highlighted icon only for nearest; otherwise leave undefined so Leaflet uses default icon.
          // Passing L.Icon.Default directly can lead to options.icon.createIcon is not a function.
        >
          <Popup>
            <div>
              <p>
                <strong>Accidents:</strong> {spot.accidentCount}
              </p>
              <p>
                <strong>Risk Score:</strong> {spot.riskScore}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;