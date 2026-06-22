import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findBarangMasukByHariKerja,
  createBarangMasuk,
  updateBarangMasuk,
  deleteBarangMasuk,
} from "./queries/barangMasuk";

export const barangMasukRouter = createRouter({
  byHariKerja: publicQuery
    .input(z.object({ hariKerjaId: z.number() }))
    .query(({ input }) => findBarangMasukByHariKerja(input.hariKerjaId)),

  create: publicQuery
    .input(
      z.object({
        hariKerjaId: z.number(),
        noUrut: z.number(),
        namaBarang: z.string().min(1),
        jumlah: z.number().optional(),
        harga: z.string().optional(),
        keterangan: z.string().optional(),
      })
    )
    .mutation(({ input }) => createBarangMasuk(input)),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        namaBarang: z.string().optional(),
        jumlah: z.number().optional(),
        harga: z.string().optional(),
        keterangan: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateBarangMasuk(id, data);
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteBarangMasuk(input.id)),
});
