
"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";

type CameraCaptureProps = {
  onCapture: (file: File) => void;
  onClose: () => void;
};

export default function CameraCapture({
  onCapture,
  onClose,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Browser tidak mendukung akses kamera.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        if (!cancelled) {
          setError(
            "Kamera gagal dibuka. Periksa izin kamera browser dan pastikan kamera tidak sedang digunakan aplikasi lain."
          );
        }
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  function takePhoto() {
    const video = videoRef.current;

    if (!video?.videoWidth || !video.videoHeight) {
      setError("Kamera belum siap. Coba lagi sebentar.");
      return;
    }

    setBusy(true);
    setError("");

    const maxSize = 1600;
    const scale = Math.min(
      1,
      maxSize / Math.max(video.videoWidth, video.videoHeight)
    );

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const context = canvas.getContext("2d");

    if (!context) {
      setBusy(false);
      setError("Foto gagal diproses.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        setBusy(false);

        if (!blob) {
          setError("Foto gagal dibuat. Silakan coba lagi.");
          return;
        }

        const file = new File(
          [blob],
          `meowmory-${Date.now()}.jpg`,
          { type: "image/jpeg" }
        );

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        onCapture(file);
      },
      "image/jpeg",
      0.82
    );
  }

  return (
    <div className="meow-camera-overlay" role="dialog" aria-modal="true">
      <div className="meow-camera-panel">
        <header className="meow-camera-header">
          <strong>Meowmory Camera</strong>
          <button type="button" onClick={onClose} aria-label="Tutup kamera">
            <X size={24} />
          </button>
        </header>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="meow-camera-video"
        />

        {error && <p role="alert" className="meow-camera-error">{error}</p>}

        <button
          type="button"
          className="meow-camera-shutter"
          onClick={takePhoto}
          disabled={busy || !!error}
        >
          <Camera size={22} />
          {busy ? "Memproses foto..." : "Ambil foto"}
        </button>
      </div>

      <style jsx>{`
        .meow-camera-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.94);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 16px;
        }
        .meow-camera-panel {
          width: 100%;
          max-width: 640px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }
        .meow-camera-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .meow-camera-header button {
          background: #292929;
          color: white;
          border: 0;
          border-radius: 50%;
          padding: 10px;
          cursor: pointer;
        }
        .meow-camera-video {
          width: 100%;
          max-height: 70vh;
          object-fit: contain;
          background: #181818;
          border-radius: 16px;
        }
        .meow-camera-error {
          color: #ffb4b4;
          text-align: center;
        }
        .meow-camera-shutter {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          border: 0;
          border-radius: 999px;
          background: white;
          color: #111;
          font-weight: 700;
          cursor: pointer;
        }
        .meow-camera-shutter:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
