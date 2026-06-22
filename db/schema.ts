import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

// ─── Users (for owner/admin OAuth login) ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Pegawai (staff with username/password login) ───
export const pegawai = mysqlTable("pegawai", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // hashed
  noHp: varchar("no_hp", { length: 20 }),
  aktif: boolean("aktif").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Pegawai = typeof pegawai.$inferSelect;
export type InsertPegawai = typeof pegawai.$inferInsert;

// ─── Produk (master product catalog) ───
export const produk = mysqlTable("produk", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  kategori: varchar("kategori", { length: 100 }),
  hargaDefault: int("harga_default"),
  aktif: boolean("aktif").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Produk = typeof produk.$inferSelect;
export type InsertProduk = typeof produk.$inferInsert;

// ─── Member (customers with special discount) ───
export const member = mysqlTable("member", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  noHp: varchar("no_hp", { length: 20 }),
  diskonPersen: int("diskon_persen").default(0),
  diskonRupiah: int("diskon_rupiah").default(0),
  keterangan: text("keterangan"),
  aktif: boolean("aktif").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Member = typeof member.$inferSelect;
export type InsertMember = typeof member.$inferInsert;

// ─── Metode Pembayaran ───
export const metodePembayaran = mysqlTable("metode_pembayaran", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 50 }).notNull().unique(),
  jenis: mysqlEnum("jenis", ["tunai", "non_tunai"]).notNull(),
  aktif: boolean("aktif").default(true).notNull(),
});

export type MetodePembayaran = typeof metodePembayaran.$inferSelect;
export type InsertMetodePembayaran = typeof metodePembayaran.$inferInsert;

// ─── Hari Kerja (daily work record) ───
export const hariKerja = mysqlTable("hari_kerja", {
  id: serial("id").primaryKey(),
  tanggal: varchar("tanggal", { length: 10 }).notNull().unique(),
  sisaModal: decimal("sisa_modal", { precision: 12, scale: 0 })
    .default("0")
    .notNull(),
  totalOperasional: decimal("total_operasional", { precision: 12, scale: 0 })
    .default("0")
    .notNull(),
  totalBarangMasuk: decimal("total_barang_masuk", { precision: 12, scale: 0 })
    .default("0")
    .notNull(),
  totalBarangKeluarNonTunai: decimal("total_barang_keluar_non_tunai", {
    precision: 12,
    scale: 0,
  })
    .default("0")
    .notNull(),
  totalBarangKeluarCash: decimal("total_barang_keluar_cash", {
    precision: 12,
    scale: 0,
  })
    .default("0")
    .notNull(),
  totalBarangKeluar: decimal("total_barang_keluar", { precision: 12, scale: 0 })
    .default("0")
    .notNull(),
  totalLainLainMasuk: decimal("total_lain_lain_masuk", {
    precision: 12,
    scale: 0,
  })
    .default("0")
    .notNull(),
  totalLainLainKeluar: decimal("total_lain_lain_keluar", {
    precision: 12,
    scale: 0,
  })
    .default("0")
    .notNull(),
  setorTunai: decimal("setor_tunai", { precision: 12, scale: 0 })
    .default("0")
    .notNull(),
  omzetCash: decimal("omzet_cash", { precision: 12, scale: 0 })
    .default("0")
    .notNull(),
  omzetTotal: decimal("omzet_total", { precision: 12, scale: 0 })
    .default("0")
    .notNull(),
  saldoAkhirCash: decimal("saldo_akhir_cash", { precision: 12, scale: 0 })
    .default("0")
    .notNull(),
  saldoAkhirTotal: decimal("saldo_akhir_total", { precision: 12, scale: 0 })
    .default("0")
    .notNull(),
  createdBy: varchar("created_by", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type HariKerja = typeof hariKerja.$inferSelect;
export type InsertHariKerja = typeof hariKerja.$inferInsert;

// ─── Barang Keluar (sales transactions) ───
export const barangKeluar = mysqlTable("barang_keluar", {
  id: serial("id").primaryKey(),
  hariKerjaId: bigint("hari_kerja_id", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  noUrut: int("no_urut").notNull(),
  namaBarang: varchar("nama_barang", { length: 255 }).notNull(),
  jumlah: int("jumlah").default(1).notNull(),
  hargaSatuan: decimal("harga_satuan", { precision: 12, scale: 0 }),
  totalNonTunai: decimal("total_non_tunai", { precision: 12, scale: 0 }).default(
    "0"
  ),
  hargaCash: decimal("harga_cash", { precision: 12, scale: 0 }),
  totalCash: decimal("total_cash", { precision: 12, scale: 0 }).default("0"),
  metodePembayaran: varchar("metode_pembayaran", { length: 50 }),
  memberId: bigint("member_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BarangKeluar = typeof barangKeluar.$inferSelect;
export type InsertBarangKeluar = typeof barangKeluar.$inferInsert;

// ─── Operasional (daily expenses) ───
export const operasional = mysqlTable("operasional", {
  id: serial("id").primaryKey(),
  hariKerjaId: bigint("hari_kerja_id", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  noUrut: int("no_urut").notNull(),
  keterangan: varchar("keterangan", { length: 255 }).notNull(),
  nominal: decimal("nominal", { precision: 12, scale: 0 }).notNull(),
  catatan: text("catatan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Operasional = typeof operasional.$inferSelect;
export type InsertOperasional = typeof operasional.$inferInsert;

// ─── Barang Masuk (incoming goods log) ───
export const barangMasuk = mysqlTable("barang_masuk", {
  id: serial("id").primaryKey(),
  hariKerjaId: bigint("hari_kerja_id", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  noUrut: int("no_urut").notNull(),
  namaBarang: varchar("nama_barang", { length: 255 }).notNull(),
  jumlah: int("jumlah").default(0),
  harga: decimal("harga", { precision: 12, scale: 0 }),
  keterangan: text("keterangan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BarangMasuk = typeof barangMasuk.$inferSelect;
export type InsertBarangMasuk = typeof barangMasuk.$inferInsert;

// ─── Lain-Lain (other income/expense) ───
export const lainLain = mysqlTable("lain_lain", {
  id: serial("id").primaryKey(),
  hariKerjaId: bigint("hari_kerja_id", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  noUrut: int("no_urut").notNull(),
  keterangan: varchar("keterangan", { length: 255 }).notNull(),
  saldoMasukCash: decimal("saldo_masuk_cash", { precision: 12, scale: 0 }).default(
    "0"
  ),
  saldoKeluarCash: decimal("saldo_keluar_cash", { precision: 12, scale: 0 }).default(
    "0"
  ),
  saldoMasukNonTunai: decimal("saldo_masuk_non_tunai", {
    precision: 12,
    scale: 0,
  }).default("0"),
  saldoKeluarNonTunai: decimal("saldo_keluar_non_tunai", {
    precision: 12,
    scale: 0,
  }).default("0"),
  metodePembayaran: varchar("metode_pembayaran", { length: 50 }),
  catatan: text("catatan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LainLain = typeof lainLain.$inferSelect;
export type InsertLainLain = typeof lainLain.$inferInsert;
