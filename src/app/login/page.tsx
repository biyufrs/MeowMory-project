
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function loginWithGoogle() {
    setLoading(true);
    setStatus("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus(`Login Google gagal: ${error.message}`);
      setLoading(false);
    }
  }

  async function loginWithMagicLink() {
    if (!email.trim()) {
      setStatus("Masukkan alamat email terlebih dahulu.");
      return;
    }

    setLoading(true);
    setStatus("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setStatus(`Gagal mengirim Magic Link: ${error.message}`);
      return;
    }

    setStatus("Magic Link berhasil dikirim! Periksa kotak masuk email kamu.");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf8f2] px-4 pb-8 pt-8">
      <div className="relative mx-auto w-full max-w-md">
        {/* Judul halaman */}
        <header className="relative z-10 mb-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#25251f]">
            Welcome to MeowMory
          </h1>

          <p className="mt-2 text-sm text-[#77796c]">
            Temukan dan simpan cerita kucingmu 🐾
          </p>
        </header>

        {/* Gambar kucing */}
<div className="relative z-10 flex h-56 items-end justify-center">
  <img
    src="/cat-login.png"
    alt="Kucing oranye mengintip"
    className="h-full w-full object-contain object-bottom translate-y-2"
  />
</div>

        {/* Form login */}
        <section className="relative z-20 mt-4 rounded-[30px] bg-white px-5 pb-8 pt-8 shadow-[0_8px_30px_rgba(55,65,35,0.07)] sm:px-7">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void loginWithMagicLink();
            }}
          >
            <label
              htmlFor="email"
              className="mb-2 block text-lg font-semibold text-[#292a24]"
            >
              Alamat Email
            </label>

            <div className="flex items-center gap-3 rounded-full bg-[#f4f3ee] px-5 py-4 transition focus-within:ring-2 focus-within:ring-[#384b27]/30">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6 shrink-0 text-[#77796c]"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="1.5" />
                <path d="m4 7 8 6 8-6" />
              </svg>

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="contoh@email.com"
                className="min-w-0 flex-1 bg-transparent text-base text-[#292a24] outline-none placeholder:text-[#a3a399]"
              />
            </div>

            {/* Tombol Magic Link */}
            <button
              type="submit"
              disabled={loading}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-[#384b27] px-5 py-5 text-lg font-semibold text-white shadow-sm transition hover:bg-[#2e4020] disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
              {!loading && (
                <span aria-hidden="true" className="text-2xl leading-none">
                  →
                </span>
              )}
            </button>
          </form>

          {/* Pemisah */}
          <div className="my-9 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#e8e6df]" />

            <span className="whitespace-nowrap text-sm font-semibold text-[#7b7d70]">
              ATAU LANJUTKAN DENGAN
            </span>

            <div className="h-px flex-1 bg-[#e8e6df]" />
          </div>

          {/* Tombol Google */}
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-4 rounded-full bg-white px-4 py-5 text-lg font-semibold text-[#292a24] shadow-[0_3px_18px_rgba(0,0,0,0.045)] transition hover:bg-[#faf9f6] disabled:opacity-60"
          >
            <svg
              viewBox="0 0 48 48"
              className="h-7 w-7 shrink-0"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
              />
              <path
                fill="#34A853"
                d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
              />
              <path
                fill="#FBBC05"
                d="M12.6 27.5a12 12 0 0 1 0-7v-5.3H5.8a20 20 0 0 0 0 17.6l6.8-5.3Z"
              />
              <path
                fill="#EA4335"
                d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.8 15.2l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z"
              />
            </svg>

            {loading ? "Memproses..." : "Masuk dengan Google"}
          </button>

          {/* Pesan status */}
          {status && (
            <p
              aria-live="polite"
              className="mt-5 break-words text-center text-sm text-[#55574d]"
            >
              {status}
            </p>
          )}
        </section>

        <p className="mt-5 text-center text-xs text-[#898a7e]">
          Dibuat dengan cinta untuk para pecinta kucing 🐾
        </p>
      </div>
    </main>
  );
}
