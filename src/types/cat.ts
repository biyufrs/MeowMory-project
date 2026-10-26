/**
 * Tipe data untuk satu dokumentasi kucing.
 * Saat ini data disimpan lokal di browser. Nanti tipe ini bisa diselaraskan
 * dengan model Prisma Cat/Photo saat backend dibuat.
 */
export type CatRecord = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  locationLabel: string;
  photoBlob?: Blob;
  photoDataUrl?: string; // Hanya untuk data demo, bukan foto upload pengguna.
  createdAt: string;
  ownerId: string; // Placeholder sampai autentikasi dibuat.
  isDemo?: boolean;
};
