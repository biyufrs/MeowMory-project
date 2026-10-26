
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Camera, MapPin, PawPrint, X } from "lucide-react";
import { createCatId, getSavedCats, saveCats } from "@/lib/catStore";
import type { CatRecord } from "@/types/cat";
import CameraCapture from "@/components/CameraCapture";

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function NewCatPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationAddress, setLocationAddress] = useState("");
  const [locationStatus, setLocationStatus] = useState("Mendeteksi lokasi perangkat...");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    const savedPhoto = sessionStorage.getItem("meowmory-new-cat-photo");
    if (!savedPhoto) return;

    async function restorePhoto() {
      try {
        const response = await fetch(savedPhoto!);
        const blob = await response.blob();
        setPhoto(new File([blob], `meowmory-${Date.now()}.jpg`, {
          type: blob.type || "image/jpeg",
        }));
        sessionStorage.removeItem("meowmory-new-cat-photo");
      } catch {
        setError("Foto gagal dimuat. Silakan ambil foto lagi.");
      }
    }

    void restorePhoto();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Browser tidak mendukung GPS.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCoordinates(coords);
        setLocationStatus("GPS ditemukan; mencari alamat...");

        try {
          const params = new URLSearchParams({
            format: "jsonv2",
            lat: String(coords.latitude),
            lon: String(coords.longitude),
            zoom: "18",
            addressdetails: "1",
          });

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
            { headers: { Accept: "application/json" } }
          );

          if (!response.ok) throw new Error("Alamat tidak tersedia");

          const result: { display_name?: string } = await response.json();

          if (result.display_name) {
            setLocationAddress(result.display_name);
            setLocationStatus("Alamat berhasil ditemukan");
          } else {
            setLocationStatus("Alamat tidak ditemukan; koordinat GPS tetap tersimpan.");
          }
        } catch {
          setLocationStatus("Alamat gagal dimuat. Periksa koneksi internet.");
        }
      },
      () => setLocationStatus("GPS gagal. Izinkan akses lokasi lalu muat ulang halaman."),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, []);

  useEffect(() => {
    if (!photo) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  async function handleSave() {
    setError("");

    if (!photo) {
      setError("Ambil foto kucing terlebih dahulu.");
      return;
    }
    if (!name.trim()) {
      setError("Masukkan nama kucing terlebih dahulu.");
      return;
    }
    if (!coordinates) {
      setError("Lokasi GPS belum tersedia. Aktifkan izin lokasi lalu coba lagi.");
      return;
    }

    setSaving(true);

    try {
      const existing = await getSavedCats();
      const cat: CatRecord = {
        id: createCatId(),
        name: name.trim(),
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        locationLabel: locationAddress || `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`,
        photoBlob: photo,
        createdAt: new Date().toISOString(),
        ownerId: "local-user",
      };

      await saveCats([cat, ...existing]);
      router.push("/");
    } catch (err) {
      console.error("Gagal menyimpan kucing:", err);
      setError("Foto gagal disimpan di browser. Coba lagi dengan foto yang lebih kecil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="form-shell">
      <header className="form-profile-bar">
        <div className="avatar-paw small"><PawPrint size={20} fill="currentColor" /></div>
        <div className="profile-copy">
          <h1>biyuu <span aria-hidden="true">🐾</span></h1>
          <p><span className="level-dot" /> Lv 2 · Junior Spotter</p>
        </div>
        <div className="profile-button small"><span>●</span></div>
      </header>

      <Link href="/" className="back-link"><ArrowLeft size={15} /> Back to Map</Link>

      <section className="cat-form">
        <div className="photo-preview">
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="Preview foto kucing" />
              <button className="remove-photo" type="button" onClick={() => setPhoto(null)} aria-label="Hapus foto">
                <X size={18} />
              </button>
            </>
          ) : (
            <div className="photo-empty">
              <Camera size={38} />
              <strong>Take a cat photo</strong>
              <p>Gunakan kamera perangkat · maksimal 12 MB</p>
            </div>
          )}
        </div>

        <div className="photo-actions">
          <button type="button" className="photo-action primary" onClick={() => setCameraOpen(true)}>
            <Camera size={19} />
            {photo ? "Retake photo" : "Take photo"}
          </button>
        </div>

        {cameraOpen && (
          <CameraCapture
            onCapture={(file) => {
              setPhoto(file);
              setError("");
              setCameraOpen(false);
            }}
            onClose={() => setCameraOpen(false)}
          />
        )}

        <label className="field-label" htmlFor="cat-name">
          Cat Name or Nickname <span>Required</span>
        </label>
        <input
          id="cat-name"
          className="text-field"
          type="text"
          maxLength={60}
          placeholder="Contoh: Mochi"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <div className="field-label location-label">Encounter Location <span>Auto GPS</span></div>
        <div className="location-field" aria-live="polite">
          <div className="location-icon"><MapPin size={20} /></div>
          <div className="location-copy">
            <strong>{locationAddress ? "Alamat lokasi" : coordinates ? "Mencari alamat..." : "Lokasi belum tersedia"}</strong>
            <p>{locationAddress || locationStatus}</p>
          </div>
          <span className="locked-label">Read-only</span>
        </div>

        <p className="location-note">
          Alamat dicari otomatis dari GPS. Koordinat tetap disimpan untuk menempatkan pin pada peta.
        </p>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="post-cat-button" type="button" disabled={saving} onClick={handleSave}>
          <PawPrint size={19} fill="currentColor" />
          {saving ? "Saving..." : "Save Cat"}
        </button>
        <button className="cancel-button" type="button" onClick={() => router.push("/")}>Cancel</button>
      </section>
    </main>
  );
}
