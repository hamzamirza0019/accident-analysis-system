import axios from "axios";

type Coordinates = [number, number];

const API_KEY = import.meta.env.VITE_ORS_API_KEY;
console.log("ENV FULL:", import.meta.env);
console.log("API KEY:", import.meta.env.VITE_ORS_API_KEY);




export const getRoute = async (
  start: Coordinates,
  end: Coordinates
): Promise<Coordinates[]> => {
  try {
    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        coordinates: [
          [start[1], start[0]], // [lng, lat]
          [end[1], end[0]],
        ],
      },
      {
        headers: {
          Authorization: API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("FULL RESPONSE:", response.data);

if (!response.data.features || !response.data.features.length) {
  console.error("Invalid route response:", response.data);
  throw new Error("Route not found");
}

return response.data.features[0].geometry.coordinates;;
  } catch (error) {
    console.error("Route fetch error:", error);
    throw error;
  }
};