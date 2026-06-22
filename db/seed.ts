import { getDb } from "../api/queries/connection";
import { metodePembayaran, produk } from "./schema";

async function seed() {
  const db = getDb();

  // Seed metode pembayaran
  const existingMethods = await db.select().from(metodePembayaran);
  if (existingMethods.length === 0) {
    await db.insert(metodePembayaran).values([
      { nama: "CASH", jenis: "tunai" },
      { nama: "BCA", jenis: "non_tunai" },
      { nama: "BRI", jenis: "non_tunai" },
      { nama: "QRIS", jenis: "non_tunai" },
      { nama: "DSKN", jenis: "tunai" },
      { nama: "MEMBER", jenis: "tunai" },
    ]);
    console.log("✅ Metode pembayaran seeded");
  }

  // Seed produk dari data Excel
  const existingProduk = await db.select().from(produk);
  if (existingProduk.length === 0) {
    const produkList = [
      { nama: "WPS", kategori: "Wallpaper" },
      { nama: "PVC Sheet Rona", kategori: "PVC" },
      { nama: "Border Foam 5cm", kategori: "Border" },
      { nama: "Wallpaper Sticker", kategori: "Wallpaper" },
      { nama: "Wallfoam Kayu", kategori: "Wallfoam" },
      { nama: "Wallfoam Bata Putih", kategori: "Wallfoam" },
      { nama: "Gorden", kategori: "Gorden" },
      { nama: "Wallfoam Molding", kategori: "Wallfoam" },
      { nama: "Klip WallPC", kategori: "Aksesoris" },
      { nama: "KlipAll", kategori: "Aksesoris" },
      { nama: "Wallfoam Bata Putih 3M", kategori: "Wallfoam" },
      { nama: "Border PVC", kategori: "Border" },
      { nama: "Endcup", kategori: "Aksesoris" },
      { nama: "Wallfoam Garis", kategori: "Wallfoam" },
      { nama: "Bunga Sale", kategori: "Dekorasi" },
      { nama: "Wallfoam Abu", kategori: "Wallfoam" },
      { nama: "Tisu Ness", kategori: "Tisu" },
      { nama: "Bracket", kategori: "Aksesoris" },
      { nama: "Wallfoam Karakter", kategori: "Wallfoam" },
      { nama: "Cleantexs", kategori: "Pembersih" },
      { nama: "Sticker Kaca 120", kategori: "Sticker" },
      { nama: "PVC Foam", kategori: "PVC" },
      { nama: "Sprei 120", kategori: "Sprei" },
      { nama: "Sprei 140", kategori: "Sprei" },
      { nama: "Border Foam 14cm", kategori: "Border" },
      { nama: "PVC Foam 60x280", kategori: "PVC" },
      { nama: "Tempat Tisu Transparant Besar", kategori: "Aksesoris" },
      { nama: "Karpet Bentuk", kategori: "Karpet" },
      { nama: "Mawar", kategori: "Bunga" },
      { nama: "Baby Breath", kategori: "Bunga" },
      { nama: "Inner Beanbag", kategori: "Furniture" },
      { nama: "List Strip Hitam 2cm", kategori: "Aksesoris" },
      { nama: "Keset Karet", kategori: "Keset" },
      { nama: "WPS Oscar", kategori: "Wallpaper" },
      { nama: "Pipa 2M", kategori: "Pipa" },
      { nama: "Pipa 4M", kategori: "Pipa" },
      { nama: "Bantal Sofa", kategori: "Furniture" },
      { nama: "Marbel", kategori: "Lantai" },
      { nama: "Border Sticker", kategori: "Border" },
    ];
    await db.insert(produk).values(produkList);
    console.log(`✅ ${produkList.length} produk seeded`);
  }

  console.log("✅ Seeding complete");
}

seed().catch(console.error);
