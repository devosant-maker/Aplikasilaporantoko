import { getDb } from "./connection";
import { barangMasuk } from "@db/schema";
import { eq } from "drizzle-orm";

export async function findBarangMasukByHariKerja(hariKerjaId: number) {
  return getDb()
    .select()
    .from(barangMasuk)
    .where(eq(barangMasuk.hariKerjaId, hariKerjaId))
    .orderBy(barangMasuk.noUrut);
}

export async function createBarangMasuk(data: {
  hariKerjaId: number;
  noUrut: number;
  namaBarang: string;
  jumlah?: number;
  harga?: string;
  keterangan?: string;
}) {
  await getDb().insert(barangMasuk).values({
    hariKerjaId: data.hariKerjaId,
    noUrut: data.noUrut,
    namaBarang: data.namaBarang,
    jumlah: data.jumlah || 0,
    harga: data.harga || null,
    keterangan: data.keterangan || null,
  });
}

export async function updateBarangMasuk(
  id: number,
  data: {
    namaBarang?: string;
    jumlah?: number;
    harga?: string;
    keterangan?: string;
  }
) {
  await getDb().update(barangMasuk).set(data).where(eq(barangMasuk.id, id));
}

export async function deleteBarangMasuk(id: number) {
  await getDb().delete(barangMasuk).where(eq(barangMasuk.id, id));
}
