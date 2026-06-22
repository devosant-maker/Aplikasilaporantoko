import { getDb } from "./connection";
import { pegawai } from "@db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt"; // ✅ TAMBAHKAN IMPORT INI

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

// ✅ FIX: Hash password saat membuat pegawai baru
export async function createPegawai(data: {
  nama: string;
  username: string;
  password: string;
  noHp?: string;
}) {
  // Acak password pakai bcrypt (10 adalah tingkat kerumitan/salt rounds)
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const [result] = await getDb()
    .insert(pegawai)
    .values({
      ...data,
      password: hashedPassword, // Simpan yang sudah di-hash, bukan plain text!
    })
    .$returningId();
    
  return findPegawaiById(result.id);
}

// ✅ FIX: Hash password juga kalau admin mau update/ganti password pegawai
export async function updatePegawai(
  id: number,
  data: { nama?: string; username?: string; password?: string; noHp?: string; aktif?: boolean }
) {
  // Cek apakah ada password yang mau diupdate
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  await getDb().update(pegawai).set(data).where(eq(pegawai.id, id));
  return findPegawaiById(id);
}

export async function deletePegawai(id: number) {
  await getDb().update(pegawai).set({ aktif: false }).where(eq(pegawai.id, id));
}
