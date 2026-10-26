"use client";

/**
 * Komponen peta Leaflet.
 * File ini harus menjadi Client Component karena Leaflet memakai browser DOM.
 */
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { CatRecord } from "@/types/cat";

type Props = {
  cats: CatRecord[];
  selectedCatId: string | null;
  userLocation: { latitude: number; longitude: number } | null;
  onSelectCat: (cat: CatRecord) => void;
};

/** Icon berbentuk lingkaran dengan emoji paw; tidak bergantung pada file PNG Leaflet. */
function makeCatIcon(selected: boolean) {
  return L.divIcon({
    className: "meowmory-marker-wrapper",
    html: `<div class="meowmory-marker ${selected ? "is-selected" : ""}">🐾</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

/** Memindahkan/zoom peta saat card atau marker dipilih. */
function MapFocus({
  cats,
  selectedCatId,
  userLocation,
}: Pick<Props, "cats" | "selectedCatId" | "userLocation">) {
  const map = useMap();

  useEffect(() => {
    const selected = cats.find((cat) => cat.id === selectedCatId);
    if (selected) {
      map.flyTo([selected.latitude, selected.longitude], 16, { duration: 0.8 });
    } else if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 14);
    }
  }, [cats, selectedCatId, userLocation, map]);

  return null;
}

export default function CatMap(props: Props) {
  const { cats, selectedCatId, userLocation, onSelectCat } = props;

  // Peta berawal di Bandung untuk data demo; jika tidak ada, fallback ke Indonesia.
  const center = useMemo<[number, number]>(() => {
    if (userLocation) return [userLocation.latitude, userLocation.longitude];
    if (cats.length) return [cats[0].latitude, cats[0].longitude];
    return [-6.9175, 107.6191];
  }, [cats, userLocation]);

  return (
    <MapContainer center={center} zoom={14} className="cat-map" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapFocus cats={cats} selectedCatId={selectedCatId} userLocation={userLocation} />

      {cats.map((cat) => (
        <Marker
          key={cat.id}
          position={[cat.latitude, cat.longitude]}
          icon={makeCatIcon(cat.id === selectedCatId)}
          eventHandlers={{ click: () => onSelectCat(cat) }}
        >
          <Popup>
            <div className="min-w-32">
              <strong>{cat.name || "Kucing tanpa nama"}</strong>
              <p className="text-xs">{cat.locationLabel}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {userLocation && (
        <Marker
          position={[userLocation.latitude, userLocation.longitude]}
          icon={L.divIcon({
            className: "user-location-wrapper",
            html: '<div class="user-location-dot"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })}
        >
          <Popup>Lokasi perangkatmu</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
