import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { produkRouter } from "./produkRouter";
import { memberRouter } from "./memberRouter";
import { metodePembayaranRouter } from "./metodePembayaranRouter";
import { pegawaiRouter } from "./pegawaiRouter";
import { hariKerjaRouter } from "./hariKerjaRouter";
import { barangKeluarRouter } from "./barangKeluarRouter";
import { operasionalRouter } from "./operasionalRouter";
import { barangMasukRouter } from "./barangMasukRouter";
import { lainLainRouter } from "./lainLainRouter";
import { seedRouter } from "./seedRouter";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  seed: seedRouter,
  produk: produkRouter,
  member: memberRouter,
  metodePembayaran: metodePembayaranRouter,
  pegawai: pegawaiRouter,
  hariKerja: hariKerjaRouter,
  barangKeluar: barangKeluarRouter,
  operasional: operasionalRouter,
  barangMasuk: barangMasukRouter,
  lainLain: lainLainRouter,
});

export type AppRouter = typeof appRouter;
