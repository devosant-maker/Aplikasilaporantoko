import { getDb } from "./connection";
import { barangKeluar } from "@db/schema";
import { eq } from "drizzle-orm";

export async function findBarangKeluarByHariKerja(hariKerjaId: number) {
  return getDb()
    .select()
    .from(barangKeluar)
    .where(eq(barangKeluar.hariKerjaId, hariKerjaId))
    .orderBy(barangKeluar.noUrut);
}

export async function createBarangKeluar(data: {
  hariKerjaId: number;
  noUrut: number;
  namaBarang: string;
  jumlah?: number;
  hargaSatuan?: string;
  totalNonTunai?: string;
  hargaCash?: string;
  totalCash?: string;
  metodePembayaran?: string;
  memberId?: number;
}) {
  await getDb().insert(barangKeluar).values({
    hariKerjaId: data.hariKerjaId,
    noUrut: data.noUrut,
    namaBarang: data.namaBarang,
    jumlah: data.jumlah || 1,
    hargaSatuan: data.hargaSatuan || null,
    totalNonTunai: data.totalNonTunai || "0",
    hargaCash: data.hargaCash || null,
    totalCash: data.totalCash || "0",
    metodePembayaran: data.metodePembayaran || null,
    memberId: data.memberId || null,
  });
}

export async function updateBarangKeluar(
  id: number,
  data: {
    namaBarang?: string;
    jumlah?: number;
    hargaSatuan?: string;
    totalNonTunai?: string;
    hargaCash?: string;
    totalCash?: string;
    metodePembayaran?: string;
    memberId?: number;
  }
) {
  await getDb().update(barangKeluar).set(data).where(eq(barangKeluar.id, id));
}

export async function deleteBarangKeluar(id: number) {
  await getDb().delete(barangKeluar).where(eq(barangKeluar.id, id));
}

export async function getTopProducts(bulan: string, limit = 10) {
  const db = getDb();
  const result = await db.execute(`
    SELECT bk.nama_barang as nama, SUM(bk.jumlah) as total_qty
    FROM barang_keluar bk
    JOIN hari_kerja hk ON bk.hari_kerja_id = hk.id
    WHERE hk.tanggal >= '${bulan}-01' AND hk.tanggal <= '${bulan}-31'
    GROUP BY bk.nama_barang
    ORDER BY total_qty DESC
    LIMIT ${limit}
  `);
  return (result[0] as unknown) as { nama: string; total_qty: number }[];
}
