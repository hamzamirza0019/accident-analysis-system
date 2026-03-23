import { useEffect, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import api from "../../api/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type PeakHour = {
  hour: number;
  count: number;
};

function PeakHoursChart() {
  const [data, setData] = useState<PeakHour[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/analysis/peakhours");
        setData(res.data.data);
      } catch (err) {
        console.error("Peak hours error", err);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: data.map((d) => `${d.hour}:00`),
    datasets: [
      {
        label: "Accidents",
        data: data.map((d) => d.count),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  return <Bar data={chartData} />;
}

export default PeakHoursChart;