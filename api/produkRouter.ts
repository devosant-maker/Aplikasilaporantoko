import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findAllProduk,
  findProdukAktif,
  createProduk,
  updateProduk,
  deleteProduk,
} from "./queries/produk";

export const produkRouter = createRouter({
  list: publicQuery
    .input(z.object({ search: z.string().optional() }).optional())
    .query(({ input }) => findAllProduk(input?.search)),

  aktif: publicQuery.query(() => findProdukAktif()),

  create: publicQuery
    .input(
      z.object({
        nama: z.string().min(1),
        kategori: z.string().optional(),
        hargaDefault: z.number().optional(),
      })
    )
    .mutation(({ input }) => createProduk(input)),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        nama: z.string().min(1).optional(),
        kategori: z.string().optional(),
        hargaDefault: z.number().optional(),
        aktif: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateProduk(id, data);
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteProduk(input.id)),
});
