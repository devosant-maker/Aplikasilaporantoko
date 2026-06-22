import { getDb } from "./connection";
import { hariKerja, barangKeluar, operasional, barangMasuk, lainLain } from "@db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export async function findAllHariKerja(bulan?: string) {
  if (bulan) {
    return getDb()
      .select()
      .from(hariKerja)
      .where(
        and(
          gte(hariKerja.tanggal, `${bulan}-01`),
          lte(hariKerja.tanggal, `${bulan}-31`)
        )
      )
      .orderBy(desc(hariKerja.tanggal));
  }
  return getDb()
    .select()
    .from(hariKerja)
    .orderBy(desc(hariKerja.tanggal));
}

export async function findHariKerjaById(id: number) {
  return getDb().query.hariKerja.findFirst({
    where: eq(hariKerja.id, id),
    with: {
      barangKeluar: true,
      operasional: true,
      barangMasuk: true,
      lainLain: true,
    },
  });
}

export async function findHariKerjaByTanggal(tanggal: string) {
  return getDb().query.hariKerja.findFirst({
    where: eq(hariKerja.tanggal, tanggal),
    with: {
      barangKeluar: true,
      operasional: true,
      barangMasuk: true,
      lainLain: true,
    },
  });
}

export async function findHariKerjaTerakhir() {
  return getDb()
    .select()
    .from(hariKerja)
    .orderBy(desc(hariKerja.tanggal))
    .limit(1);
}

export async function createHariKerja(data: {
  tanggal: string;
  sisaModal: string;
  createdBy?: string;
}) {
  const [result] = await getDb()
    .insert(hariKerja)
    .values({
      tanggal: data.tanggal,
      sisaModal: data.sisaModal,
      createdBy: data.createdBy || "system",
    })
    .$returningId();
  return findHariKerjaById(result.id);
}

export async function updateRekapHariKerja(id: number) {
  const db = getDb();
  
  // Get all related data
  const [hk] = await db.select().from(hariKerja).where(eq(hariKerja.id, id));
  if (!hk) return null;

  const bk = await db
    .select()
    .from(barangKeluar)
    .where(eq(barangKeluar.hariKerjaId, id));
  const op = await db
    .select()
    .from(operasional)
    .where(eq(operasional.hariKerjaId, id));
  const bm = await db
    .select()
    .from(barangMasuk)
    .where(eq(barangMasuk.hariKerjaId, id));
  const ll = await db
    .select()
    .from(lainLain)
    .where(eq(lainLain.hariKerjaId, id));

  // Calculate totals
  const totalBarangKeluarNonTunai = bk.reduce(
    (sum, item) => sum + Number(item.totalNonTunai || 0),
    0
  );
  const totalBarangKeluarCash = bk.reduce(
    (sum, item) => sum + Number(item.totalCash || 0),
    0
  );
  const totalOperasional = op.reduce(
    (sum, item) => sum + Number(item.nominal || 0),
    0
  );
  const totalBarangMasuk = bm.reduce(
    (sum, item) => sum + Number(item.jumlah || 0),
    0
  );
  const totalLainLainMasuk = ll.reduce(
    (sum, item) => sum + Number(item.saldoMasukCash || 0) + Number(item.saldoMasukNonTunai || 0),
    0
  );
  const totalLainLainKeluar = ll.reduce(
    (sum, item) => sum + Number(item.saldoKeluarCash || 0) + Number(item.saldoKeluarNonTunai || 0),
    0
  );
  const totalBarangKeluar = totalBarangKeluarNonTunai + totalBarangKeluarCash;

  const sisaModal = Number(hk.sisaModal || 0);
  const omzetCash = sisaModal + totalLainLainMasuk - totalOperasional - totalLainLainKeluar - totalBarangKeluarCash;
  const omzetTotal = totalBarangKeluar;

  const saldoAkhirCash =
    sisaModal +
    totalLainLainMasuk -
    totalOperasional -
    totalBarangKeluarCash -
    totalLainLainKeluar;
  const saldoAkhirTotal =
    sisaModal +
    totalBarangMasuk +
    totalLainLainMasuk -
    totalOperasional -
    totalBarangKeluar -
    totalLainLainKeluar;

  await db
    .update(hariKerja)
    .set({
      totalOperasional: totalOperasional.toString(),
      totalBarangMasuk: totalBarangMasuk.toString(),
      totalBarangKeluarNonTunai: totalBarangKeluarNonTunai.toString(),
      totalBarangKeluarCash: totalBarangKeluarCash.toString(),
      totalBarangKeluar: totalBarangKeluar.toString(),
      totalLainLainMasuk: totalLainLainMasuk.toString(),
      totalLainLainKeluar: totalLainLainKeluar.toString(),
      omzetCash: omzetCash.toString(),
      omzetTotal: omzetTotal.toString(),
      saldoAkhirCash: saldoAkhirCash.toString(),
      saldoAkhirTotal: saldoAkhirTotal.toString(),
    })
    .where(eq(hariKerja.id, id));

  return findHariKerjaById(id);
}

export async function setSetorTunai(id: number, nominal: string) {
  await getDb()
    .update(hariKerja)
    .set({ setorTunai: nominal })
    .where(eq(hariKerja.id, id));
  return findHariKerjaById(id);
}

export async function updateSisaModal(id: number, sisaModal: string) {
  await getDb()
    .update(hariKerja)
    .set({ sisaModal })
    .where(eq(hariKerja.id, id));
  return findHariKerjaById(id);
}

// Dashboard stats
export async function getDashboardStats(bulan: string) {
  const db = getDb();
  const allHari = await db
    .select()
    .from(hariKerja)
    .where(
      and(
        gte(hariKerja.tanggal, `${bulan}-01`),
        lte(hariKerja.tanggal, `${bulan}-31`)
      )
    );

  const totalOmzet = allHari.reduce((sum, h) => sum + Number(h.omzetTotal || 0), 0);
  const totalCash = allHari.reduce((sum, h) => sum + Number(h.totalBarangKeluarCash || 0), 0);
  const totalNonTunai = allHari.reduce((sum, h) => sum + Number(h.totalBarangKeluarNonTunai || 0), 0);
  const totalOperasionalAll = allHari.reduce((sum, h) => sum + Number(h.totalOperasional || 0), 0);
  const totalSetor = allHari.reduce((sum, h) => sum + Number(h.setorTunai || 0), 0);

  return {
    totalHari: allHari.length,
    totalOmzet,
    totalCash,
    totalNonTunai,
    totalOperasional: totalOperasionalAll,
    totalSetor,
    rataRataOmzet: allHari.length > 0 ? Math.round(totalOmzet / allHari.length) : 0,
  };
}
