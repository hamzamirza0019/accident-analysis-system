import { useState } from "react";
import { Link } from "react-router-dom";
import MapView from "../components/Map/MapView";
import api from "../api/api";

type Blackspot = {
  lat: number;
  lng: number;
  accidentCount: number;
  riskScore: number;
};

type RiskData = {
  totalAccidents: number;
  riskLevel: string;
  blackspotsOnRoute: number;
};

function RouteAnalysisPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [endCoords, setEndCoords] = useState<[number, number] | null>(null);
  const [blackspots, setBlackspots] = useState<Blackspot[]>([]);
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  const geocode = async (query: string): Promise<[number, number] | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleAnalyze = async () => {
    if (!start.trim() || !end.trim()) {
      setError("Please enter both start and destination.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalyzed(false);
    setRiskData(null);

    try {
      // Geocode both locations in parallel
      const [s, e] = await Promise.all([geocode(start), geocode(end)]);

      if (!s) { setError(`Could not find location: "${start}"`); setLoading(false); return; }
      if (!e) { setError(`Could not find location: "${end}"`); setLoading(false); return; }

      setStartCoords(s);
      setEndCoords(e);

      // Fetch blackspots
      const res = await api.get("/analysis/blackspots");
      const spots: Blackspot[] = res.data.data;
      setBlackspots(spots);

      // Basic risk summary for the panel
      const totalAccidents = spots.reduce((sum, b) => sum + b.accidentCount, 0);
      const maxRisk = spots.length ? Math.max(...spots.map((b) => b.riskScore)) : 0;
      const riskLevel = maxRisk > 1.5 ? "High" : maxRisk > 0.8 ? "Moderate" : "Low";

      setRiskData({
        totalAccidents,
        riskLevel,
        blackspotsOnRoute: spots.length,
      });

      setAnalyzed(true);
    } catch (err) {
      setError("Failed to fetch data. Make sure your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const riskColor =
    riskData?.riskLevel === "High"
      ? "text-red-500"
      : riskData?.riskLevel === "Moderate"
      ? "text-yellow-500"
      : "text-green-500";

  const riskBg =
    riskData?.riskLevel === "High"
      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      : riskData?.riskLevel === "Moderate"
      ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors duration-300">

      {/* Navbar */}
      <div className="flex gap-4 mb-6">
        <Link
          to="/"
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition"
        >
          🏠 Dashboard
        </Link>
        <span className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium">
          🚗 Route Analysis
        </span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          🚗 Route Risk Analysis
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Enter start and destination to analyze accident risk along the route
        </p>
      </div>

      {/* Input Panel */}
      <div className="bg-white/80 dark:bg-slate-800 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">A</span>
            <input
              value={start}
              onChange={(e) => setStart(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="Start location (e.g. Mumbai)"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 font-bold">B</span>
            <input
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="Destination (e.g. Pune)"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-xl transition-all duration-200 min-w-[130px]"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Analyzing...
              </span>
            ) : "Analyze Route"}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
            ⚠️ {error}
          </p>
        )}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Map */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800 p-4 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 h-[520px]">
          <h2 className="font-semibold text-gray-700 dark:text-white mb-3">📍 Route Map</h2>
          <div className="h-[460px]">
            <MapView
              startLocation={startCoords}
              selectedLocation={endCoords}
              blackspots={blackspots}
            />
          </div>
        </div>

        {/* Risk Panel */}
        <div className="flex flex-col gap-4">

          {/* Risk Summary */}
          {analyzed && riskData ? (
            <>
              <div className={`p-5 rounded-2xl border shadow-md ${riskBg}`}>
                <h2 className="font-semibold text-gray-700 dark:text-white mb-3">🛡️ Risk Summary</h2>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-4xl font-bold ${riskColor}`}>
                    {riskData.riskLevel}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Risk Level</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Total Accidents Nearby</span>
                    <strong className="text-red-500">{riskData.totalAccidents}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Blackspots Detected</span>
                    <strong className="text-blue-500">{riskData.blackspotsOnRoute}</strong>
                  </div>
                </div>
              </div>

              {/* Route Info */}
              <div className="bg-white/80 dark:bg-slate-800 p-5 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-md">
                <h2 className="font-semibold text-gray-700 dark:text-white mb-3">🗺️ Route Info</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">A</span>
                    <span className="text-gray-600 dark:text-gray-300">{start}</span>
                  </div>
                  <div className="border-l-2 border-dashed border-gray-300 dark:border-gray-600 ml-2.5 h-4"></div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">B</span>
                    <span className="text-gray-600 dark:text-gray-300">{end}</span>
                  </div>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="bg-white/80 dark:bg-slate-800 p-5 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-md">
                <h2 className="font-semibold text-gray-700 dark:text-white mb-3">💡 Safety Tips</h2>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {riskData.riskLevel === "High" ? (
                    <>
                      <li>⚠️ Avoid travel during peak hours (8–10 AM, 5–8 PM)</li>
                      <li>🚦 Drive below speed limit in blackspot zones</li>
                      <li>📞 Keep emergency contacts ready</li>
                    </>
                  ) : riskData.riskLevel === "Moderate" ? (
                    <>
                      <li>👁️ Stay alert near highlighted zones</li>
                      <li>💡 Ensure headlights work for night travel</li>
                      <li>🛑 Follow all traffic signals strictly</li>
                    </>
                  ) : (
                    <>
                      <li>✅ Route looks safe for travel</li>
                      <li>🎵 Comfortable for long-distance driving</li>
                      <li>⛽ Plan fuel stops in advance</li>
                    </>
                  )}
                </ul>
              </div>
            </>
          ) : (
            <div className="bg-white/80 dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-md flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <div className="text-5xl mb-4">🗺️</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Enter a start and destination above, then click <strong>Analyze Route</strong> to see risk analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RouteAnalysisPage;
