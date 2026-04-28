"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon paths under bundlers.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type LatLng = { lat: number; lng: number };

type Props = {
  marker: LatLng | null;
  onPick: (loc: { lat: number; lng: number; address?: string }) => void;
};

const HCMC: LatLng = { lat: 10.7626, lng: 106.6602 };

function ClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ target }: { target: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 16, { duration: 0.6 });
    }
  }, [target, map]);
  return null;
}

export default function PickupMap({ marker, onPick }: Props) {
  const [busy, setBusy] = useState(false);

  const handleClick = async (lat: number, lng: number) => {
    onPick({ lat, lng });
    setBusy(true);
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = (await res.json()) as { address?: string };
        if (data.address) {
          onPick({ lat, lng, address: data.address });
        }
      }
    } catch {
      // Ignore — coords still set.
    } finally {
      setBusy(false);
    }
  };

  const center = marker ?? HCMC;

  return (
    <div className="relative h-full min-h-[480px] w-full overflow-hidden rounded-xl">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={marker ? 16 : 12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onClick={handleClick} />
        <Recenter target={marker} />
        {marker && <Marker position={[marker.lat, marker.lng]} />}
      </MapContainer>

      <div className="pointer-events-none absolute left-3 top-3 right-3 flex justify-between gap-2 text-xs">
        <span className="pointer-events-auto bg-slate-900/85 text-gray-200 px-3 py-1.5 rounded-lg backdrop-blur">
          Click the map to set pickup
        </span>
        {busy && (
          <span className="pointer-events-auto bg-slate-900/85 text-gray-300 px-3 py-1.5 rounded-lg backdrop-blur">
            Looking up address...
          </span>
        )}
      </div>
    </div>
  );
}
