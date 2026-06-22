import { getDb } from "./connection";
import { pegawai } from "@db/schema";
import { eq } from "drizzle-orm";

export async function findAllPegawai() {
  return getDb().select().from(pegawai).orderBy(pegawai.nama);
}

export async function findPegawaiById(id: number) {
  return getDb().query.pegawai.findFirst({
    where: eq(pegawai.id, id),
  });
}

export async function findPegawaiByUsername(username: string) {
  return getDb().query.pegawai.findFirst({
    where: eq(pegawai.username, username),
  });
}

export async function createPegawai(data: {
  nama: string;
  username: string;
  password: string;
  noHp?: string;
}) {
  const [result] = await getDb().insert(pegawai).values(data).$returningId();
  return findPegawaiById(result.id);
}

export async function updatePegawai(
  id: number,
  data: { nama?: string; username?: string; password?: string; noHp?: string; aktif?: boolean }
) {
  await getDb().update(pegawai).set(data).where(eq(pegawai.id, id));
  return findPegawaiById(id);
}

export async function deletePegawai(id: number) {
  await getDb().update(pegawai).set({ aktif: false }).where(eq(pegawai.id, id));
}
