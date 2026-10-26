
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Camera,
  MapPin,
  LocateFixed,
  PawPrint,
  UserRound,
} from "lucide-react";
import type { CatRecord } from "@/types/cat";
import { getSavedCats } from "@/lib/catStore";
import CameraCapture from "@/components/CameraCapture";

const CatMap = dynamic(() => import("@/components/CatMap"), {
  ssr: false,
  loading: () => <div className="map-loading">Menyiapkan peta…</div>,
});

const DEMO_CATS: CatRecord[] = [
  {
    id: "demo-boba",
    name: "Boba",
    latitude: -6.9089,
    longitude: 107.6134,
    locationLabel: "Jalan Riau, Bandung",
    createdAt: new Date().toISOString(),
    ownerId: "demo-user",
    photoDataUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=700",
    isDemo: true,
  },
  {
    id: "demo-mochi",
    name: "Mochi",
    latitude: -6.9147,
    longitude: 107.6232,
    locationLabel: "Taman Cibeunying, Bandung",
    createdAt: new Date().toISOString(),
    ownerId: "demo-user",
    photoDataUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=700",
    isDemo: true,
  },
  {
    id: "demo-oreo",
    name: "Oreo",
    latitude: -6.921,
    longitude: 107.6095,
    locationLabel: "Dipatiukur, Bandung",
    createdAt: new Date().toISOString(),
    ownerId: "demo-user",
    photoDataUrl: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=700",
    isDemo: true,
  },
];

type UserLocation = {
  latitude: number;
  longitude: number;
};

export default function MapPage() {
  const router = useRouter();

  const [tab, setTab] = useState<"all" | "mine">("all");
  const [savedCats, setSavedCats] = useState<CatRecord[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>("demo-boba");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLabel, setLocationLabel] = useState("Mencari lokasi…");
  const [locationMessage, setLocationMessage] = useState("");
  const [localPhotoUrls, setLocalPhotoUrls] = useState<Record<string, string>>({});
  const [cameraOpen, setCameraOpen] = useState(false);

  const refreshCats = useCallback(async () => {
    setSavedCats(await getSavedCats());
  }, []);

  useEffect(() => {
    void refreshCats();
  }, [refreshCats]);

  useEffect(() => {
    const urls: Record<string, string> = {};

    savedCats.forEach((cat) => {
      if (cat.photoBlob) urls[cat.id] = URL.createObjectURL(cat.photoBlob);
    });

    setLocalPhotoUrls(urls);
    return () => Object.values(urls).forEach(URL.revokeObjectURL);
  }, [savedCats]);

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationLabel("Lokasi tidak tersedia");
      setLocationMessage("Browser ini tidak mendukung GPS.");
      return;
    }

    setLocationMessage("Meminta izin lokasi…");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setUserLocation({ latitude, longitude });
        setLocationLabel("Lokasi saat ini");
        setLocationMessage("Lokasi perangkat ditemukan.");

        try {
          const params = new URLSearchParams({
            format: "jsonv2",
            lat: String(latitude),
            lon: String(longitude),
          });

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?${params}`
          );

          if (!response.ok) throw new Error("Alamat gagal dimuat");

          const data = await response.json();
          const address = data.address ?? {};

          const area =
            address.neighbourhood ??
            address.suburb ??
            address.village ??
            address.town ??
            address.city_district ??
            address.city ??
            address.county;

          const city =
            address.city ??
            address.town ??
            address.municipality ??
            address.state;

          const label =
            area && city && area !== city
              ? `${area}, ${city}`
              : area ?? city ?? data.display_name;

          if (label) {
            setLocationLabel(label);
            setLocationMessage("Location found");
          }
        } catch {
          setLocationMessage("GPS ditemukan, tetapi nama alamat gagal dimuat.");
        }
      },
      () => {
        setLocationLabel("Aktifkan lokasi");
        setLocationMessage("Lokasi tidak tersedia. Periksa izin GPS browser.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    locateMe();
  }, [locateMe]);

  function handleMainPhotoCapture(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setLocationMessage("Foto gagal diproses. Coba lagi.");
        return;
      }

      try {
        sessionStorage.setItem("meowmory-new-cat-photo", reader.result);
        setCameraOpen(false);
        router.push("/cats/new");
      } catch {
        setLocationMessage("Foto terlalu besar untuk diteruskan. Coba lagi.");
      }
    };

    reader.onerror = () => setLocationMessage("Foto gagal diproses. Coba lagi.");
    reader.readAsDataURL(file);
  }

  const allCats = useMemo(() => [...savedCats, ...DEMO_CATS], [savedCats]);

  const visibleCats =
    tab === "all"
      ? allCats
      : savedCats.filter((cat) => cat.ownerId === "local-user");

  const selectedCat =
    visibleCats.find((cat) => cat.id === selectedCatId) ??
    visibleCats[0] ??
    null;

  function focusCat(cat: CatRecord) {
    setSelectedCatId(cat.id);
  }

  return (
    <main className="app-shell">
      <header className="profile-bar">
        <div className="avatar-paw">
          <PawPrint size={28} fill="currentColor" />
        </div>
        <div className="profile-copy">
          <h1>biyuu <span aria-hidden="true">🐾</span></h1>
        </div>
        <button className="profile-button" aria-label="Profil (demo)" title="Profil belum diaktifkan">
          <UserRound size={27} fill="currentColor" />
        </button>
      </header>

      <section className="map-controls" aria-label="Filter kucing">
        <div className="location-pill">
          <MapPin size={20} fill="currentColor" />
          <span>{locationLabel}</span>
          <span>⌄</span>
        </div>
        <div className="tabs" role="tablist" aria-label="Pilih koleksi">
          <button role="tab" aria-selected={tab === "all"} className={tab === "all" ? "active" : ""} onClick={() => { setTab("all"); setSelectedCatId(null); }}>
            All
          </button>
          <button role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "active" : ""} onClick={() => { setTab("mine"); setSelectedCatId(null); }}>
            My Cat
          </button>
        </div>
      </section>

      <section className="map-area" aria-label="Peta kucing">
        <CatMap cats={visibleCats} selectedCatId={selectedCatId} userLocation={userLocation} onSelectCat={focusCat} />

        <button className="locate-button" onClick={locateMe} aria-label="Temukan lokasi saya" title="Lokasi saya">
          <LocateFixed size={25} />
        </button>

        <button type="button" className="take-photo-button" onClick={() => setCameraOpen(true)}>
          <Camera size={31} fill="currentColor" />
          <span>Take cat photo</span>
        </button>

        {cameraOpen && (
          <CameraCapture
            onCapture={handleMainPhotoCapture}
            onClose={() => setCameraOpen(false)}
          />
        )}

        {locationMessage && <div className="location-message" role="status">{locationMessage}</div>}
      </section>

      <section className="cat-section">
        <div className="section-heading">
          <div>
            <h2>{tab === "all" ? "Cats around you" : "My cats"}</h2>
            <p>{visibleCats.length} {visibleCats.length === 1 ? "cat spot" : "cat spots"}</p>
          </div>
          <span className="paw-decoration">🐾</span>
        </div>

        {visibleCats.length === 0 ? (
          <div className="empty-state">
            <PawPrint size={34} />
            <strong>Belum ada kucing di koleksimu</strong>
            <p>Ambil atau upload foto kucing pertamamu.</p>
            <Link href="/cats/new" className="secondary-action">Tambah kucing</Link>
          </div>
        ) : (
          <div className="cat-card-row">
            {visibleCats.map((cat) => (
              <button
                className={`cat-card ${selectedCat?.id === cat.id ? "selected" : ""}`}
                key={cat.id}
                onClick={() => focusCat(cat)}
                aria-pressed={selectedCat?.id === cat.id}
              >
                <img className="cat-card-photo" src={localPhotoUrls[cat.id] ?? cat.photoDataUrl ?? "/cat-placeholder.svg"} alt={`Foto ${cat.name || "kucing"}`} />
                <div className="cat-card-content">
                  <h3>{cat.name || "Kucing tanpa nama"}</h3>
                  <p><MapPin size={15} /> <span>{cat.locationLabel}</span></p>
                  <div className="cat-card-meta">
                    <span>🐾 {cat.isDemo ? "Community cat" : "My cat"}</span>
                    <time>{cat.isDemo ? "Demo" : "Baru saja"}</time>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
