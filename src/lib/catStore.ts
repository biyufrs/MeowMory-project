/**
 * Penyimpanan sementara memakai IndexedDB melalui idb-keyval.
 * Ini sengaja dipisahkan dari UI agar nanti mudah diganti dengan fetch ke API
 * Next.js yang menggunakan Prisma + Supabase.
 */
import { get, set } from "idb-keyval";
import type { CatRecord } from "@/types/cat";

const STORE_KEY = "meowmory-cats-v1";

/** Membaca catatan pengguna dari browser ini. */
export async function getSavedCats(): Promise<CatRecord[]> {
  if (typeof window === "undefined") return [];
  return (await get<CatRecord[]>(STORE_KEY)) ?? [];
}

/** Menyimpan seluruh daftar catatan ke IndexedDB. */
export async function saveCats(cats: CatRecord[]): Promise<void> {
  if (typeof window === "undefined") return;
  await set(STORE_KEY, cats);
}

/** Membuat ID unik tanpa perlu database. */
export function createCatId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `cat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
