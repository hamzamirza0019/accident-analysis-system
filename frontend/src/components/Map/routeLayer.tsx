import { Polyline, CircleMarker } from "react-leaflet";

const RouteLayer = ({ routeCoords, riskData }: any) => {
  if (!routeCoords.length) return null;

  return (
    <>
      <Polyline positions={routeCoords} color="blue" weight={5} />

      {riskData?.riskyPoints?.map((point: any, i: number) => (
        <CircleMarker
          key={i}
          center={[point.lat, point.lng]}
          radius={8}
          pathOptions={{ color: "red" }}
        />
      ))}
    </>
  );
};

export default RouteLayer;