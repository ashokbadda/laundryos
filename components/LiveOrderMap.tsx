"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom Leaflet Markers
const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972531.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const destinationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
}

export default function LiveOrderMap({
  driverLat = 18.6725,
  driverLng = 78.0941,
  destLat = 18.6780,
  destLng = 78.0990,
}: {
  driverLat?: number;
  driverLng?: number;
  destLat?: number;
  destLng?: number;
}) {
  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={[driverLat, driverLng]}
        zoom={14}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap lat={driverLat} lng={driverLng} />

        {/* Live Driver Marker */}
        <Marker position={[driverLat, driverLng]} icon={driverIcon}>
          <Popup>🚚 Delivery Partner (Live Position)</Popup>
        </Marker>

        {/* Customer Location Marker */}
        <Marker position={[destLat, destLng]} icon={destinationIcon}>
          <Popup>🏠 Pickup / Delivery Destination</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}