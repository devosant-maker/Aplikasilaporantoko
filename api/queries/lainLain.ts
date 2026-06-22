import { getDb } from "./connection";
import { lainLain } from "@db/schema";
import { eq } from "drizzle-orm";

export async function findLainLainByHariKerja(hariKerjaId: number) {
  return getDb()
    .select()
    .from(lainLain)
    .where(eq(lainLain.hariKerjaId, hariKerjaId))
    .orderBy(lainLain.noUrut);
}

export async function createLainLain(data: {
  hariKerjaId: number;
  noUrut: number;
  keterangan: string;
  saldoMasukCash?: string;
  saldoKeluarCash?: string;
  saldoMasukNonTunai?: string;
  saldoKeluarNonTunai?: string;
  metodePembayaran?: string;
  catatan?: string;
}) {
  await getDb().insert(lainLain).values({
    hariKerjaId: data.hariKerjaId,
    noUrut: data.noUrut,
    keterangan: data.keterangan,
    saldoMasukCash: data.saldoMasukCash || "0",
    saldoKeluarCash: data.saldoKeluarCash || "0",
    saldoMasukNonTunai: data.saldoMasukNonTunai || "0",
    saldoKeluarNonTunai: data.saldoKeluarNonTunai || "0",
    metodePembayaran: data.metodePembayaran || null,
    catatan: data.catatan || null,
  });
}

export async function updateLainLain(
  id: number,
  data: {
    keterangan?: string;
    saldoMasukCash?: string;
    saldoKeluarCash?: string;
    saldoMasukNonTunai?: string;
    saldoKeluarNonTunai?: string;
    metodePembayaran?: string;
    catatan?: string;
  }
) {
  await getDb().update(lainLain).set(data).where(eq(lainLain.id, id));
}

export async function deleteLainLain(id: number) {
  await getDb().delete(lainLain).where(eq(lainLain.id, id));
}
