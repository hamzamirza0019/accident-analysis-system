import { useEffect, useState } from "react";
import api from "../api/api";
import MapView from "../components/Map/MapView";
import PeakHoursChart from "../components/Charts/PeakHoursChart";

function DashboardPage() {
  const [blackspots, setBlackspots] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("darkMode") === "true";
  });

  // 🔍 Search function
  const handleSearch = async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${search}`
      );

      const data = await res.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        setSelectedLocation([lat, lng]);
      }
    } catch (err) {
      console.error("Search error", err);
    }
  };

  // 📊 Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/analysis/blackspots");
        setBlackspots(res.data.data);
      } catch (err) {
        console.error("Stats error", err);
      }
    };

    fetchStats();
  }, []);

  // 🌙 Dark mode
  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDark]);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            🚦 AI Accident Analytics
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-300">
            Real-time insights
          </span>
        </div>

        <button
          onClick={() => setIsDark((prev) => !prev)}
          className="px-4 py-2 rounded-full text-sm border bg-white dark:bg-gray-700 text-gray-700 dark:text-white"
        >
          {isDark ? "☀ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* 🔍 Search */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:text-white"
        />

        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Search
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white/80 dark:bg-slate-800 p-5 rounded-2xl shadow-md hover:scale-[1.02] transition">
          <h2 className="text-sm text-gray-500 dark:text-gray-300">Total Accidents</h2>
          <p className="text-3xl font-bold text-red-500 mt-2">
            {blackspots.reduce((sum, b) => sum + b.accidentCount, 0)}
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-800 p-5 rounded-2xl shadow-md hover:scale-[1.02] transition">
          <h2 className="text-sm text-gray-500 dark:text-gray-300">Blackspots</h2>
          <p className="text-3xl font-bold text-blue-500 mt-2">
            {blackspots.length}
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-800 p-5 rounded-2xl shadow-md hover:scale-[1.02] transition">
          <h2 className="text-sm text-gray-500 dark:text-gray-300">Highest Risk</h2>
          <p className="text-3xl font-bold text-yellow-500 mt-2">
            {blackspots.length
              ? Math.max(...blackspots.map((b) => b.riskScore))
              : 0}
          </p>
        </div>

      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Map */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800 p-4 rounded-2xl shadow-md h-[500px]">
          <h2 className="mb-3 font-semibold text-gray-700 dark:text-white">
            📍 Accident Map
          </h2>
          <div className="h-full">
            <MapView selectedLocation={selectedLocation} />
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white/80 dark:bg-slate-800 p-4 rounded-2xl shadow-md h-[500px]">
          <h2 className="mb-3 font-semibold text-gray-700 dark:text-white">
            📊 Peak Hours Analysis
          </h2>
          <PeakHoursChart />
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;