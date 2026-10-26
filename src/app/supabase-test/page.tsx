
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SupabaseTestPage() {
  const [status, setStatus] = useState("");

  async function testInsert() {
    setStatus("Menyimpan data...");

    const { error } = await supabase.from("cats").insert({
      name: "Kucing Tes Meowmory",
      description: "Data percobaan koneksi Supabase",
    });

    if (error) {
      setStatus(`Gagal menyimpan: ${error.message}`);
      return;
    }

    setStatus("Berhasil! Data tes tersimpan di Supabase.");
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        Tes Simpan Supabase
      </h1>

      <button
        onClick={testInsert}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Tes Simpan Data
      </button>

      <p className="mt-4">{status}</p>
    </main>
  );
}
