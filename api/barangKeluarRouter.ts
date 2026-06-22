import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findBarangKeluarByHariKerja,
  createBarangKeluar,
  updateBarangKeluar,
  deleteBarangKeluar,
} from "./queries/barangKeluar";

export const barangKeluarRouter = createRouter({
  byHariKerja: publicQuery
    .input(z.object({ hariKerjaId: z.number() }))
    .query(({ input }) => findBarangKeluarByHariKerja(input.hariKerjaId)),

  create: publicQuery
    .input(
      z.object({
        hariKerjaId: z.number(),
        noUrut: z.number(),
        namaBarang: z.string().min(1),
        jumlah: z.number().default(1),
        hargaSatuan: z.string().optional(),
        totalNonTunai: z.string().optional(),
        hargaCash: z.string().optional(),
        totalCash: z.string().optional(),
        metodePembayaran: z.string().optional(),
        memberId: z.number().optional(),
      })
    )
    .mutation(({ input }) => createBarangKeluar(input)),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        namaBarang: z.string().optional(),
        jumlah: z.number().optional(),
        hargaSatuan: z.string().optional(),
        totalNonTunai: z.string().optional(),
        hargaCash: z.string().optional(),
        totalCash: z.string().optional(),
        metodePembayaran: z.string().optional(),
        memberId: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateBarangKeluar(id, data);
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteBarangKeluar(input.id)),
});
